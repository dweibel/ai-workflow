# Protocol: Safe Database Migrations

## Overview

Database migrations are high-risk operations that can cause data loss, downtime, or corruption if executed incorrectly. This protocol ensures migrations are safe, reversible, and production-ready.

## Core Principles

1. **Idempotency**: Migrations should be safe to run multiple times
2. **Reversibility**: Every migration should have a rollback procedure
3. **Zero-Downtime**: Migrations should not require downtime
4. **Data Safety**: Never delete data without explicit backup

---

## Pre-Migration Checklist

Before creating any migration, verify:

- [ ] You understand the current schema
- [ ] You have a backup strategy
- [ ] You've tested on a copy of production data
- [ ] You've estimated the migration runtime
- [ ] You've identified potential lock contention

---

## Creating Migrations

### Step 1: Generate Migration File

```bash
# Rails
rails generate migration AddStatusToOrders

# Django
python manage.py makemigrations

# Node.js (Prisma)
npx prisma migrate dev --name add_status_to_orders

# Node.js (TypeORM)
npm run typeorm migration:generate -- -n AddStatusToOrders

# Go (golang-migrate)
migrate create -ext sql -dir db/migrations -seq add_status_to_orders
```

### Step 2: Write the Migration

#### Structure

Every migration should have:
1. **Up**: Forward migration (apply changes)
2. **Down**: Reverse migration (undo changes)
3. **Safety checks**: Idempotency guards

---

## Safe Migration Patterns

### ✅ Adding a Column

**Safe**:
```sql
-- Up
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS status VARCHAR(50);

-- Down
ALTER TABLE orders 
DROP COLUMN IF EXISTS status;
```

**Unsafe**:
```sql
-- ❌ No IF NOT EXISTS check
ALTER TABLE orders ADD COLUMN status VARCHAR(50);
-- This fails if run twice!
```

---

### ✅ Adding a Column with Default

**Safe** (Multi-step for large tables):
```sql
-- Migration 1: Add column, nullable, no default
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS status VARCHAR(50);

-- Migration 2: Backfill in batches (separate script)
UPDATE orders SET status = 'pending' WHERE status IS NULL;

-- Migration 3: Add NOT NULL constraint
ALTER TABLE orders 
ALTER COLUMN status SET NOT NULL;
```

**Unsafe**:
```sql
-- ❌ Adding NOT NULL with default on large table
ALTER TABLE orders 
ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'pending';
-- This locks the entire table and rewrites it!
```

**Why Unsafe**: On large tables (millions of rows), adding a column with a default and NOT NULL constraint causes:
- Full table rewrite
- Exclusive locks (blocks reads/writes)
- Long downtime

---

### ✅ Renaming a Column

**Safe** (Multi-step):
```sql
-- Step 1: Add new column
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_address VARCHAR(255);

-- Step 2: Backfill data
UPDATE users SET email_address = email WHERE email_address IS NULL;

-- Step 3: Deploy code that reads from BOTH columns (fallback logic)

-- Step 4: Drop old column (separate migration, after deploy)
ALTER TABLE users DROP COLUMN IF EXISTS email;
```

**Unsafe**:
```sql
-- ❌ Direct rename
ALTER TABLE users RENAME COLUMN email TO email_address;
-- This breaks running code that references "email"!
```

---

### ✅ Dropping a Column

**Safe** (Multi-phase):
```sql
-- Phase 1: Deploy code that STOPS writing to the column

-- Phase 2: Mark column as deprecated (wait 1-2 weeks)
COMMENT ON COLUMN users.legacy_field IS 'DEPRECATED: Remove after 2025-01-01';

-- Phase 3: Drop the column (after ensuring it's unused)
ALTER TABLE users DROP COLUMN IF EXISTS legacy_field;
```

**Unsafe**:
```sql
-- ❌ Immediate drop
ALTER TABLE users DROP COLUMN legacy_field;
-- Data is permanently lost if you made a mistake!
```

---

### ✅ Adding an Index

**Safe**:
```sql
-- PostgreSQL
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_id 
ON orders(user_id);

-- MySQL (no CONCURRENTLY, use pt-online-schema-change for large tables)
CREATE INDEX idx_orders_user_id ON orders(user_id);
```

**Unsafe**:
```sql
-- ❌ Without CONCURRENTLY (PostgreSQL)
CREATE INDEX idx_orders_user_id ON orders(user_id);
-- This locks the table for reads and writes!
```

**Key Point**: `CONCURRENTLY` builds the index without blocking table access (PostgreSQL only)

---

### ✅ Dropping an Index

**Safe**:
```sql
DROP INDEX CONCURRENTLY IF EXISTS idx_orders_legacy;
```

**Unsafe**:
```sql
-- ❌ Without CONCURRENTLY
DROP INDEX idx_orders_legacy;
-- This briefly locks the table
```

---

### ✅ Adding a Foreign Key

**Safe** (Multi-step):
```sql
-- Step 1: Add column without constraint
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id INTEGER;

-- Step 2: Backfill data (ensure referential integrity)
UPDATE orders SET user_id = (SELECT id FROM users WHERE users.email = orders.customer_email);

-- Step 3: Add constraint with NOT VALID (PostgreSQL)
ALTER TABLE orders 
ADD CONSTRAINT fk_orders_user 
FOREIGN KEY (user_id) REFERENCES users(id) NOT VALID;

-- Step 4: Validate constraint (can be done later, doesn't block writes)
ALTER TABLE orders VALIDATE CONSTRAINT fk_orders_user;
```

**Unsafe**:
```sql
-- ❌ Immediate foreign key on existing table
ALTER TABLE orders 
ADD CONSTRAINT fk_orders_user 
FOREIGN KEY (user_id) REFERENCES users(id);
-- This locks both tables and validates ALL existing rows!
```

---

### ✅ Changing Column Type

**Safe** (Multi-step):
```sql
-- Step 1: Add new column with new type
ALTER TABLE users ADD COLUMN phone_new BIGINT;

-- Step 2: Backfill data with type conversion
UPDATE users SET phone_new = CAST(phone AS BIGINT) WHERE phone_new IS NULL;

-- Step 3: Swap columns (if necessary) and drop old
ALTER TABLE users DROP COLUMN phone;
ALTER TABLE users RENAME COLUMN phone_new TO phone;
```

**Unsafe**:
```sql
-- ❌ Direct type change
ALTER TABLE users ALTER COLUMN phone TYPE BIGINT USING phone::BIGINT;
-- This rewrites the entire table!
```

---

### ✅ Adding a NOT NULL Constraint

**Safe** (Multi-step):
```sql
-- Step 1: Backfill NULL values
UPDATE users SET email = 'unknown@example.com' WHERE email IS NULL;

-- Step 2: Add constraint with NOT VALID (PostgreSQL)
ALTER TABLE users ALTER COLUMN email SET NOT NULL;

-- Alternative for PostgreSQL: Use CHECK constraint first
ALTER TABLE users ADD CONSTRAINT check_email_not_null CHECK (email IS NOT NULL) NOT VALID;
ALTER TABLE users VALIDATE CONSTRAINT check_email_not_null;
-- Then convert to NOT NULL later
```

**Unsafe**:
```sql
-- ❌ Immediate NOT NULL on existing data
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
-- Fails if any NULL values exist!
```

---

## Data Migrations

### Backfilling Data Safely

**Safe** (Batched):
```sql
-- Process in batches to avoid long-running transactions
DO $$
DECLARE
  batch_size INT := 1000;
  processed INT := 0;
BEGIN
  LOOP
    UPDATE orders
    SET status = 'pending'
    WHERE status IS NULL
    AND id IN (
      SELECT id FROM orders
      WHERE status IS NULL
      LIMIT batch_size
    );
    
    GET DIAGNOSTICS processed = ROW_COUNT;
    EXIT WHEN processed = 0;
    
    -- Add delay to avoid overwhelming database
    PERFORM pg_sleep(0.1);
  END LOOP;
END $$;
```

**Unsafe**:
```sql
-- ❌ Update all rows in one transaction
UPDATE orders SET status = 'pending' WHERE status IS NULL;
-- On large tables, this locks for minutes/hours!
```

---

## Migration Testing Strategy

### Step 1: Test on Local Development Database

```bash
# Apply migration
npm run migrate:up
# or
rails db:migrate

# Verify changes
psql -d myapp_dev -c "\d+ orders"

# Test rollback
npm run migrate:down
# or
rails db:rollback

# Re-apply
npm run migrate:up
```

### Step 2: Test on Production-Like Dataset

```bash
# Create anonymized copy of production data
pg_dump production_db | psql staging_db

# Run migration on staging
npm run migrate:up

# Measure performance
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 123;
```

### Step 3: Estimate Runtime

```sql
-- Check table size
SELECT 
  pg_size_pretty(pg_total_relation_size('orders')) AS total_size,
  COUNT(*) AS row_count
FROM orders;

-- Estimate migration time (rough heuristic: 1 second per 10K rows for backfill)
-- If 1M rows, expect ~100 seconds
```

### Step 4: Identify Lock Contention

```sql
-- PostgreSQL: Check for locks during migration test
SELECT 
  pg_class.relname,
  pg_locks.mode,
  pg_locks.granted
FROM pg_locks
JOIN pg_class ON pg_locks.relation = pg_class.oid
WHERE pg_class.relname = 'orders';
```

---

## Running Migrations in Production

### Pre-Flight Checklist

- [ ] Migration tested on staging with production-scale data
- [ ] Rollback procedure documented and tested
- [ ] Database backup taken (and verified restorable)
- [ ] Estimated runtime is acceptable (< 1 minute ideal)
- [ ] Monitoring/alerting configured
- [ ] Team notified of deployment window

### Deployment Steps

#### Option 1: Automated Migration (Low-Risk)

```bash
# Deploy application
git pull
npm install
npm run migrate:up
pm2 restart app
```

**Use When**:
- Migration is fast (< 10 seconds)
- Migration is backward-compatible
- Low traffic period

#### Option 2: Manual Migration (High-Risk)

```bash
# Step 1: Announce maintenance window
# Step 2: Put application in maintenance mode
# Step 3: Take backup
pg_dump production_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Step 4: Run migration
npm run migrate:up

# Step 5: Verify
psql production_db -c "SELECT * FROM orders LIMIT 1;"

# Step 6: Deploy application
git pull && npm install && pm2 restart app

# Step 7: Monitor for errors
pm2 logs --lines 100
```

**Use When**:
- Migration is slow (> 1 minute)
- Migration is not backward-compatible
- High-risk schema change

#### Option 3: Blue-Green Deployment (Zero-Downtime)

```bash
# Step 1: Migration must be backward-compatible
# Step 2: Deploy migration (application still running old code)
npm run migrate:up

# Step 3: Deploy new application code to "green" environment
# Step 4: Switch traffic to green environment
# Step 5: Decommission "blue" environment
```

---

## Rollback Procedures

### When to Rollback

- Migration fails mid-execution
- Migration causes unexpected performance degradation
- Data corruption detected
- Critical bug in deployed application

### How to Rollback

#### Option 1: Run Down Migration

```bash
npm run migrate:down
# or
rails db:rollback
```

**Use When**:
- Migration completed successfully
- No data corruption
- Down migration was tested

#### Option 2: Restore from Backup

```bash
# Stop application
pm2 stop app

# Restore database
psql production_db < backup_20251216_100000.sql

# Restart application (old version)
git checkout previous_commit
pm2 restart app
```

**Use When**:
- Migration failed mid-execution
- Data corruption occurred
- Down migration is too complex/risky

---

## Common Migration Pitfalls

### ❌ Renaming Tables/Columns Without Backward Compatibility

**Problem**: Breaks running application code

**Solution**: Use multi-phase deployment:
1. Add new column, keep old column
2. Deploy code that writes to both, reads from new
3. Backfill old → new
4. Deploy code that only uses new column
5. Drop old column

---

### ❌ Adding NOT NULL to Existing Column

**Problem**: Fails if NULL values exist

**Solution**:
1. Backfill NULLs first
2. Add constraint
3. Or use CHECK constraint with NOT VALID first

---

### ❌ Large Data Migrations in Single Transaction

**Problem**: Locks table for extended period

**Solution**: Batch updates, commit frequently

---

### ❌ Forgetting to Test Rollback

**Problem**: Rollback fails when you need it

**Solution**: Always test down migration before deploying

---

### ❌ No Monitoring During Migration

**Problem**: Don't notice problems until users complain

**Solution**: Watch error logs, database metrics, and application performance during and after migration

---

## Framework-Specific Guides

### Rails

```ruby
# migration file: db/migrate/20251216100000_add_status_to_orders.rb
class AddStatusToOrders < ActiveRecord::Migration[7.0]
  def change
    add_column :orders, :status, :string, if_not_exists: true
  end
end
```

### Django

```python
# migrations/0002_add_status_to_orders.py
from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('orders', '0001_initial'),
    ]
    
    operations = [
        migrations.AddField(
            model_name='order',
            name='status',
            field=models.CharField(max_length=50, null=True),
        ),
    ]
```

### Node.js (Prisma)

```prisma
// schema.prisma
model Order {
  id     Int     @id @default(autoincrement())
  status String?
}
```

```bash
npx prisma migrate dev --name add_status_to_orders
```

---

## Emergency Procedures

### If Migration Hangs

```sql
-- PostgreSQL: Find blocking queries
SELECT pid, query, state 
FROM pg_stat_activity 
WHERE state = 'active';

-- Kill blocking query
SELECT pg_terminate_backend(PID);
```

### If Migration Causes Performance Degradation

```sql
-- Identify slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Check for missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE tablename = 'orders';
```

---

## Integration with AGENTS.md Workflow

### Phase I: PLAN
- Document schema changes in the plan
- Identify migration risks
- Plan multi-phase deployment if needed

### Phase II: WORK
- Write migration files with idempotency checks
- Test up and down migrations locally
- Add migration to version control

### Phase III: REVIEW
- **Data Integrity Guardian** reviews migrations
- Verify idempotency, reversibility, safety
- Check for lock contention risks

---

## Checklist for Every Migration

- [ ] Migration is idempotent (safe to run twice)
- [ ] Down migration is defined and tested
- [ ] Tested on production-scale dataset
- [ ] Estimated runtime is acceptable
- [ ] Backup strategy is in place
- [ ] Monitoring is configured
- [ ] Backward compatibility considered
- [ ] Lock contention identified and mitigated

---

**Remember**: Measure twice, cut once. Database migrations are irreversible operations. Always prioritize data safety over speed.

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-16  
**Based On**: AGENTS.md v1.0.0
