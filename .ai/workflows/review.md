# Workflow: Phase III - Deep Review

## Objective
Conduct a comprehensive multi-perspective audit of code changes to ensure quality, security, performance, and maintainability before merge.

## Prerequisites
Before starting, ensure you have:
1. A completed feature branch from Phase II
2. Loaded `.ai/roles/auditor.md` to adopt the correct persona
3. Identified the scope: specific branch, PR, or commit range

## Step 0: Scope Definition

### 0.1 Identify What to Review
```bash
# Review specific branch
git diff main...feat/feature-name

# Review specific commits
git diff abc123..def456

# Review changed files
git diff --name-only main...feat/feature-name
```

### 0.2 Load Context Files
```bash
# Read the files that changed
git diff main...feat/feature-name --name-only | xargs -I {} cat {}
```

**Checkpoint**: You understand what changed and why (reference the plan document)

---

## Step 1: Sequential Persona Reviews

You will adopt **four specialized personas** in sequence. Each persona generates an independent findings report.

**Critical Rule**: Do NOT mix findings from different personas. Each persona's output is a separate section.

---

### Persona 1: The Security Sentinel

**Focus**: OWASP Top 10, Authentication/Authorization, Data Protection

#### Checklist
Scan ALL changed files for:

- [ ] **Input Validation**: Are all user inputs sanitized?
  - SQL injection risks
  - XSS vulnerabilities
  - Command injection risks
  
- [ ] **Secrets Management**: Are there hardcoded credentials?
  - API keys
  - Database passwords
  - JWT secrets
  - Encryption keys

- [ ] **Authentication**: Is authentication properly enforced?
  - Missing auth checks
  - Weak password policies
  - Session management issues

- [ ] **Authorization**: Are permissions correctly enforced?
  - Privilege escalation risks
  - Missing role checks
  - Insecure direct object references

- [ ] **Data Protection**: Is sensitive data protected?
  - PII encryption at rest
  - HTTPS enforcement
  - Secure cookie flags
  - CORS policy appropriateness

- [ ] **Dependencies**: Are new dependencies secure?
  - Known vulnerabilities (check CVE databases)
  - Untrusted sources

#### Output Format
```markdown
## 🔒 Security Findings

### CRITICAL
- **[CRITICAL]**: SQL Injection risk in user query
  - **File**: `src/database.ts:42`
  - **Issue**: Direct string concatenation in SQL query
  - **Risk**: Attacker can execute arbitrary SQL
  - **Exploit Example**: `' OR '1'='1`
  - **Fix**: Use parameterized queries
  ```typescript
  // Bad
  const query = `SELECT * FROM users WHERE id = ${userId}`;
  
  // Good
  const query = 'SELECT * FROM users WHERE id = $1';
  const result = await db.query(query, [userId]);
  ```

### HIGH
- **[HIGH]**: Hardcoded API key
  - **File**: `src/config.ts:15`
  - **Issue**: API key committed to repository
  - **Risk**: Key exposed in git history
  - **Fix**: Move to environment variables
  - **Action Required**: Rotate the exposed key immediately

### MEDIUM
[If any]

### LOW
[If any]

### ✅ PASSED
- Input validation on email field
- HTTPS enforced on authentication endpoints
- Session tokens use secure, httpOnly cookies
```

**Checkpoint**: Security scan complete with specific, actionable findings.

---

### Persona 2: The Performance Oracle

**Focus**: Algorithmic Complexity, Database Efficiency, Resource Management

#### Checklist
Scan ALL changed files for:

- [ ] **Algorithmic Complexity**: Are there inefficient loops?
  - Nested loops over large datasets (O(n²))
  - Repeated computation that could be cached
  - Unnecessary iterations

- [ ] **Database Queries**: Are queries optimized?
  - N+1 query problems
  - Missing eager loading
  - Unindexed columns in WHERE clauses
  - Large SELECT * when only few columns needed

- [ ] **Memory Management**: Are resources properly managed?
  - Memory leaks (event listeners not cleaned up)
  - Large objects not garbage collected
  - File handles not closed

- [ ] **Caching**: Could expensive operations be cached?
  - Repeated API calls
  - Redundant computations
  - Database queries that don't change often

- [ ] **API Design**: Are responses efficient?
  - Pagination for large datasets
  - Proper HTTP caching headers
  - Response payload size

#### Output Format
```markdown
## ⚡ Performance Findings

### CRITICAL
- **[CRITICAL]**: O(n²) nested loop over large dataset
  - **File**: `src/processor.ts:78`
  - **Issue**: Nested loop iterating 10,000 × 10,000 items
  - **Impact**: 100M operations, ~30 second execution time
  - **Fix**: Use hash map for O(n) lookup
  ```typescript
  // Bad: O(n²)
  for (const item of items) {
    for (const other of otherItems) {
      if (item.id === other.id) { /* ... */ }
    }
  }
  
  // Good: O(n)
  const otherMap = new Map(otherItems.map(o => [o.id, o]));
  for (const item of items) {
    const other = otherMap.get(item.id);
    if (other) { /* ... */ }
  }
  ```

### HIGH
- **[HIGH]**: N+1 query problem
  - **File**: `src/api/users.ts:32`
  - **Issue**: Fetching posts individually for each user
  - **Impact**: 100 users = 101 database queries
  - **Fix**: Use eager loading or batch fetch
  ```typescript
  // Bad: N+1 queries
  const users = await User.findAll();
  for (const user of users) {
    user.posts = await Post.findAll({ where: { userId: user.id } });
  }
  
  // Good: 2 queries
  const users = await User.findAll({ include: [Post] });
  ```

### MEDIUM
- **[MEDIUM]**: Missing database index
  - **File**: `migrations/003_add_orders.sql`
  - **Issue**: Frequent queries on `user_id` column without index
  - **Impact**: Full table scan on large tables
  - **Fix**: Add index
  ```sql
  CREATE INDEX idx_orders_user_id ON orders(user_id);
  ```

### ✅ PASSED
- API responses are paginated (limit: 50)
- Expensive computations are memoized
- Database uses connection pooling
```

**Checkpoint**: Performance analysis complete with measurable impact.

---

### Persona 3: The Framework Purist

**Focus**: Idiomatic Code, Framework Conventions, Simplicity, Style Consistency

**Context Awareness**: Adapt to the project's specific stack and style guide.

#### Checklist
Scan ALL changed files for:

- [ ] **Framework Conventions**: Does code follow framework idioms?
  - React: Hooks usage, component patterns
  - Rails: Convention over configuration
  - Express: Middleware patterns
  - Django: MVT architecture

- [ ] **Code Simplicity**: Is the code as simple as possible?
  - Unnecessary abstractions
  - Over-engineered solutions
  - "Clever" code that's hard to understand

- [ ] **Style Consistency**: Does it match existing code?
  - Naming conventions
  - File structure
  - Comment style
  - Patterns from `.ai/memory/decisions.md`

- [ ] **Component Size**: Are modules appropriately sized?
  - Functions > 50 lines
  - Components > 200 lines
  - Files > 500 lines

- [ ] **Readability**: Can a junior developer understand it?
  - Unclear variable names
  - Missing comments for complex logic
  - Dense, hard-to-parse code

#### Output Format
```markdown
## 🎨 Style & Architecture Findings

### ARCHITECTURE
- **[ARCHITECTURE]**: Unnecessary Service Object pattern
  - **File**: `src/services/UserEmailService.ts`
  - **Issue**: Service class with single method
  - **Suggestion**: Use a simple utility function
  - **Rationale**: Project convention is "thin controllers, fat models"
  ```typescript
  // Current (over-engineered)
  class UserEmailService {
    async sendWelcomeEmail(user: User) { /* ... */ }
  }
  
  // Suggested (simpler)
  async function sendWelcomeEmail(user: User) { /* ... */ }
  ```

### STYLE
- **[STYLE]**: Inconsistent naming convention
  - **File**: `src/utils/data-processor.ts`
  - **Issue**: Using snake_case in TypeScript project
  - **Standard**: Project uses camelCase
  - **Fix**: Rename `process_data` to `processData`

- **[STYLE]**: Missing JSDoc for public API
  - **File**: `src/api/auth.ts:42`
  - **Issue**: Exported function lacks documentation
  - **Fix**: Add JSDoc comment
  ```typescript
  /**
   * Authenticates a user with email and password.
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise resolving to authentication result
   * @throws {AuthError} If credentials are invalid
   */
  export async function authenticate(email: string, password: string) { /* ... */ }
  ```

### SIMPLICITY
- **[SIMPLICITY]**: Complex abstraction for simple task
  - **File**: `src/utils/StringManipulator.ts`
  - **Issue**: 150-line class to capitalize strings
  - **Suggestion**: Use built-in `toUpperCase()` or lodash
  - **Rationale**: Don't reinvent the wheel

### ✅ PASSED
- Component sizes are reasonable (avg 80 lines)
- Naming follows project conventions
- Follows React Hooks best practices
```

**Checkpoint**: Code style and architecture reviewed against project standards.

---

### Persona 4: The Data Integrity Guardian

**Focus**: Schema Consistency, Migration Safety, Data Validation, Foreign Keys

#### Checklist
Scan for database-related changes:

- [ ] **Migration Safety**: Are migrations production-safe?
  - Idempotent operations (can run twice safely)
  - No table locking on large tables
  - Rollback procedures defined
  - Backward compatible changes

- [ ] **Foreign Key Constraints**: Are relationships enforced?
  - Missing foreign keys
  - Cascade delete appropriateness
  - Orphan record risks

- [ ] **Data Validation**: Is data validated before storage?
  - Schema-level constraints (NOT NULL, CHECK)
  - Application-level validation
  - Type safety

- [ ] **Schema Consistency**: Are column types appropriate?
  - TEXT vs VARCHAR choices
  - INT vs BIGINT for IDs
  - TIMESTAMP timezone handling
  - JSON column usage

- [ ] **Indexing Strategy**: Are indexes defined for queries?
  - Foreign keys indexed
  - Frequently queried columns indexed
  - Unique constraints where appropriate

#### Output Format
```markdown
## 🗄️ Data Integrity Findings

### CRITICAL
- **[CRITICAL]**: Missing foreign key constraint
  - **File**: `migrations/004_create_orders.sql`
  - **Issue**: `user_id` column has no foreign key to `users` table
  - **Risk**: Orphaned orders if user is deleted
  - **Fix**: Add foreign key constraint
  ```sql
  ALTER TABLE orders 
  ADD CONSTRAINT fk_orders_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  ```

### HIGH
- **[HIGH]**: Non-idempotent migration
  - **File**: `migrations/005_add_status_column.sql`
  - **Issue**: `ALTER TABLE` without existence check
  - **Risk**: Migration fails on re-run
  - **Fix**: Add idempotency check
  ```sql
  -- Bad
  ALTER TABLE orders ADD COLUMN status VARCHAR(50);
  
  -- Good
  ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS status VARCHAR(50);
  ```

### MEDIUM
- **[MEDIUM]**: Missing database index
  - **File**: `migrations/004_create_orders.sql`
  - **Issue**: `created_at` column frequently queried but not indexed
  - **Impact**: Slow queries on ORDER BY created_at
  - **Fix**: Add index
  ```sql
  CREATE INDEX idx_orders_created_at ON orders(created_at);
  ```

### LOW
- **[LOW]**: Missing NOT NULL constraint
  - **File**: `migrations/004_create_orders.sql`
  - **Issue**: `total_amount` column allows NULL
  - **Suggestion**: Add NOT NULL if amount is always required

### ✅ PASSED
- All foreign keys properly defined
- Migrations include rollback procedures
- Timestamp columns use UTC timezone
```

**Checkpoint**: Data integrity analysis complete.

---

## Step 2: Synthesis & Triage

After all four personas have reported, compile a **unified review document**:

### 2.1 Findings Summary

Create a review report at `/docs/reviews/YYYY-MM-DD-feature-name-review.md`.

**Documentation Structure**: Review artifacts are stored in:
- `/docs/reviews/` - Review reports and audit findings (dated)
- `/docs/decisions/` - May be updated if patterns need codification
- `.ai/memory/lessons.md` - Updated with review insights

**Review Document** format:

```markdown
# 🔍 Code Review: [Feature Name]

**Branch**: `feat/feature-name`  
**Reviewer**: Auditor (Multi-Persona)  
**Date**: YYYY-MM-DD

## Executive Summary
[2-3 sentence overview of changes and overall assessment]

## Findings Overview

| Severity | Security | Performance | Style | Data | Total |
|:---------|:---------|:------------|:------|:-----|:------|
| CRITICAL | X        | Y           | 0     | Z    | **N** |
| HIGH     | A        | B           | 0     | C    | **M** |
| MEDIUM   | D        | E           | F     | G    | **P** |
| LOW      | H        | I           | J     | K    | **Q** |

**Total Findings**: N+M+P+Q

---

[Include all four persona reports here]

---

## Actionable Checklist

### 🚨 CRITICAL - Must Fix Before Merge
- [ ] [Issue 1 from Security]
- [ ] [Issue 2 from Performance]
- [ ] [Issue 3 from Data Integrity]

### ⚠️ HIGH - Should Fix Before Merge
- [ ] [Issue 4]
- [ ] [Issue 5]

### 📝 MEDIUM - Consider Fixing
- [ ] [Issue 6]
- [ ] [Issue 7]

### 💡 LOW - Nice to Have
- [ ] [Issue 8]

---

## Recommendation

[Choose one]:

✅ **APPROVE** - Minor or no issues, safe to merge  
⚠️ **APPROVE WITH CHANGES** - Requires fixes before merge  
❌ **REQUEST CHANGES** - Blocking issues must be resolved

**Rationale**: [Explanation]
```

### 2.2 User Interaction

Present the review to the user and ask:

```markdown
## Review Complete

I've identified **X findings** across 4 review perspectives.

**Critical Issues**: Y (must fix)  
**High Priority**: Z (should fix)  
**Medium/Low**: A (optional)

**Question**: Which findings would you like me to address in the current branch?

Options:
1. Fix all CRITICAL issues now
2. Fix CRITICAL + HIGH issues now
3. Create GitHub issues for MEDIUM/LOW items
4. Specify individual findings to fix (e.g., "Fix items 1, 3, 5")
5. I'll fix them manually, proceed to merge

Please specify your preference.
```

---

## Step 3: Fix Implementation (If Requested)

If the user asks you to fix issues:

### 3.1 Transition to Builder Mode

Load `.ai/roles/builder.md` and `.ai/workflows/execution.md`

### 3.2 Create Fix Tasks

Convert findings into TODO items:
- [ ] Fix: SQL injection in database.ts:42
- [ ] Fix: Add missing index on orders.user_id
- [ ] Refactor: Simplify UserEmailService to function

### 3.3 Execute Fixes Using TDD

For each fix:
1. Write a test that would have caught the issue
2. Implement the fix
3. Verify the fix with the test
4. Commit atomically: `fix: prevent SQL injection in user query`

---

## Step 4: Final Approval

After all requested fixes are complete:

### 4.1 Re-Review (if major changes)
If significant changes were made, run a quick re-review:
- Focus only on the changed areas
- Verify fixes are correct
- Ensure no new issues were introduced

### 4.2 Generate Final Summary

```markdown
## ✅ Review Complete & Approved

**All critical issues addressed**:
- [x] Fixed SQL injection risk
- [x] Added database indexes
- [x] Simplified service architecture

**Commits**:
- `abc123`: fix: prevent SQL injection in user query
- `def456`: perf: add index on orders.user_id
- `ghi789`: refactor: simplify UserEmailService

**Status**: Ready for merge

**Recommendation**: ✅ APPROVE
```

---

## Success Criteria

Phase III is complete when:
1. ✅ All four persona reviews are complete
2. ✅ Findings are categorized by severity
3. ✅ User has been consulted on which fixes to implement
4. ✅ Requested fixes have been implemented and tested
5. ✅ A final approval recommendation is provided

---

## Common Anti-Patterns to Avoid

❌ **Generic Review**: "Looks good to me" without specific analysis  
✅ **Proper Approach**: Multi-persona, evidence-based review

❌ **Mixing Concerns**: Combining security and style issues in one section  
✅ **Proper Approach**: Separate persona reports

❌ **Vague Findings**: "This code could be better"  
✅ **Proper Approach**: Specific file, line, issue, fix

❌ **Ignoring Severity**: All issues treated equally  
✅ **Proper Approach**: Clear CRITICAL/HIGH/MEDIUM/LOW categorization

❌ **Review Without Context**: Not reading the plan or git history  
✅ **Proper Approach**: Understand WHY changes were made

❌ **Nitpicking Style**: Focusing on semicolons when there are security issues  
✅ **Proper Approach**: Prioritize critical issues first

---

## Post-Review: Update Memory

After the review, if any patterns or lessons emerged:

### Update `.ai/memory/lessons.md`
```markdown
- When reviewing database migrations, always check for idempotency and foreign key constraints
- SQL injection risks are commonly found in dynamic query construction
- N+1 queries often appear in ORM code with lazy loading
```

### Update `.ai/memory/decisions.md`
```markdown
- **Decision**: All API endpoints must use parameterized queries
  - **Rationale**: Prevent SQL injection
  - **Date**: 2025-12-16
  - **Examples**: See `src/database.ts` for pattern
```

This ensures future reviews benefit from lessons learned.

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-16  
**Based On**: AGENTS.md v1.0.0
