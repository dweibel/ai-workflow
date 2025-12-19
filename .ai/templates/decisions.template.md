# Architectural Decision Records (ADRs)

This file documents architectural patterns, technology choices, and conventions established for this project. All code should follow these decisions unless explicitly overridden.

## How to Use This File

- **Load during planning**: Consult this before designing new features
- **Load during review**: Verify code follows established patterns
- **Update when patterns emerge**: Document new architectural approaches
- **Format**: Clear decision, rationale, examples, and date

---

## Format Template

```markdown
## [Decision Title]

**Status**: Active | Deprecated | Superseded  
**Date**: YYYY-MM-DD  
**Context**: [Why was this decision needed?]  
**Decision**: [What did we decide?]  
**Rationale**: [Why did we choose this approach?]  
**Consequences**: [Trade-offs and implications]  
**Examples**: [Code references or patterns]  
**Alternatives Considered**: [What else did we evaluate?]
```

---

## Code Organization

### Directory Structure

**Status**: Template  
**Date**: [DATE]  
**Decision**: Follow domain-driven directory structure

**Pattern**:
```
src/
├── auth/           # Authentication domain
│   ├── models/
│   ├── controllers/
│   ├── services/
│   └── tests/
├── users/          # Users domain
│   └── ...
├── shared/         # Shared utilities
│   ├── types/
│   └── utils/
```

**Rationale**: Group by domain/feature rather than technical layer for better cohesion and easier navigation.

---

## Naming Conventions

### File Naming

**Status**: Template  
**Date**: [DATE]  
**Decision**: 
- Use kebab-case for documentation files: `user-authentication.md`
- Use date prefixes for chronological documents: `2025-12-16-feature-name.md`
- Use descriptive names that indicate purpose and scope
- Follow established directory hierarchy in `.ai/docs/`

**Examples**:
- ✅ `.ai/docs/plans/2025-12-16-user-authentication.md`
- ✅ `.ai/docs/requirements/user-authentication.md`
- ✅ `.ai/protocols/testing.md`
- ❌ `plan1.md`
- ❌ `stuff.md`

---

### Variable and Function Naming

**Status**: Template  
**Date**: [DATE]  
**Decision**:
- Use camelCase for JavaScript/TypeScript variables and functions
- Use PascalCase for classes and interfaces
- Use SCREAMING_SNAKE_CASE for constants
- Use descriptive names that reveal intent

**Examples**:
```typescript
// ✅ Good
const userAuthToken = generateToken();
class UserRepository { }
const MAX_RETRY_ATTEMPTS = 3;

// ❌ Bad
const t = gen();
class ur { }
const max = 3;
```

---

## Error Handling

### Error Response Format

**Status**: Template  
**Date**: [DATE]  
**Decision**: Use consistent error response format across all APIs

**Pattern**:
```typescript
interface ErrorResponse {
  error: {
    code: string;        // Machine-readable error code
    message: string;     // Human-readable message
    details?: any;       // Optional additional context
  }
}
```

**Example**:
```typescript
res.status(400).json({
  error: {
    code: 'INVALID_EMAIL',
    message: 'Email address is not valid',
    details: { email: 'not-an-email' }
  }
});
```

**Rationale**: Consistent error format makes client-side error handling predictable and improves debugging.

---

### Exception Handling

**Status**: Template  
**Date**: [DATE]  
**Decision**: Use custom error classes for domain-specific errors

**Pattern**:
```typescript
class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Usage
throw new ValidationError('Email is required', 'email');
```

**Rationale**: Custom errors provide more context and enable better error handling logic.

---

## Database Patterns

### Query Organization

**Status**: Template  
**Date**: [DATE]  
**Decision**: All database queries should be encapsulated in repository/DAO pattern

**Pattern**:
```typescript
// repositories/user-repository.ts
class UserRepository {
  async findById(id: number): Promise<User | null> {
    return db.query('SELECT * FROM users WHERE id = $1', [id]);
  }
}

// ❌ Don't do this in controllers
app.get('/users/:id', async (req, res) => {
  const user = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
  // Bad: query logic mixed with controller logic
});
```

**Rationale**: Separation of concerns, easier testing, centralized query logic.

---

### Migration Strategy

**Status**: Template  
**Date**: [DATE]  
**Decision**: All schema changes must go through migration files, never direct SQL

**Pattern**: See `.ai/protocols/migrations.md` for detailed guidelines

**Key Rules**:
- All migrations must be idempotent
- All migrations must have rollback procedures
- Test migrations on staging before production
- Never modify existing migration files after they've been deployed

---

## Testing Conventions

### Test Organization

**Status**: Template  
**Date**: [DATE]  
**Decision**: Co-locate tests with source files using `.test.ts` suffix

**Pattern**:
```
src/
├── auth/
│   ├── authenticate.ts
│   └── authenticate.test.ts
```

**Rationale**: Tests are easier to find and maintain when co-located with the code they test.

---

### Test Coverage Requirements

**Status**: Template  
**Date**: [DATE]  
**Decision**: Maintain minimum 80% code coverage for all business logic

**What to Test**:
- ✅ All business logic functions
- ✅ All API endpoints
- ✅ All database queries
- ✅ Error handling paths
- ❌ Framework boilerplate
- ❌ Third-party library code

**Enforcement**: CI pipeline fails if coverage drops below 80%

---

## API Design

### REST Conventions

**Status**: Template  
**Date**: [DATE]  
**Decision**: Follow RESTful conventions for API design

**Pattern**:
```
GET    /api/users          # List users
GET    /api/users/:id      # Get single user
POST   /api/users          # Create user
PUT    /api/users/:id      # Update user (full replace)
PATCH  /api/users/:id      # Update user (partial)
DELETE /api/users/:id      # Delete user
```

**Guidelines**:
- Use plural nouns for resources
- Use HTTP verbs correctly
- Return appropriate status codes (200, 201, 400, 404, 500)
- Version APIs if breaking changes are possible (`/api/v1/users`)

---

### Response Format

**Status**: Template  
**Date**: [DATE]  
**Decision**: Wrap collection responses in a data envelope

**Pattern**:
```typescript
// Single resource
res.json({ id: 1, name: 'John' });

// Collection
res.json({
  data: [{ id: 1 }, { id: 2 }],
  meta: {
    total: 2,
    page: 1,
    pageSize: 20
  }
});
```

**Rationale**: Envelopes allow for metadata (pagination, totals) without polluting the data structure.

---

## Security Patterns

### Authentication

**Status**: Template  
**Date**: [DATE]  
**Decision**: Use JWT tokens for authentication with HTTP-only cookies

**Pattern**:
```typescript
// Set cookie
res.cookie('authToken', jwt.sign({ userId: user.id }), {
  httpOnly: true,
  secure: true,      // HTTPS only
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000  // 24 hours
});
```

**Rationale**: HTTP-only cookies prevent XSS attacks, secure flag enforces HTTPS, sameSite prevents CSRF.

---

### Input Validation

**Status**: Template  
**Date**: [DATE]  
**Decision**: Validate all user input at the API boundary using a validation library

**Pattern**:
```typescript
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().min(18)
});

app.post('/users', (req, res) => {
  const result = CreateUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  // ... proceed with validated data
});
```

**Rationale**: Centralized validation prevents inconsistent validation logic and improves security.

---

## Performance Patterns

### Caching Strategy

**Status**: Template  
**Date**: [DATE]  
**Decision**: [Document your caching strategy]

**Example**:
- Use Redis for session storage
- Cache expensive API responses for 5 minutes
- Use ETags for HTTP caching
- Invalidate cache on write operations

---

### Database Optimization

**Status**: Template  
**Date**: [DATE]  
**Decision**: Always use indexes on foreign keys and frequently queried columns

**Pattern**:
```sql
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

**Rationale**: Proper indexing prevents full table scans and dramatically improves query performance.

---

## Code Style

### Linting & Formatting

**Status**: Template  
**Date**: [DATE]  
**Decision**: Use ESLint + Prettier for consistent code style

**Configuration**: See `.eslintrc.js` and `.prettierrc`

**Enforcement**: Pre-commit hooks run linter and formatter, CI fails on lint errors

---

### Code Comments

**Status**: Template  
**Date**: [DATE]  
**Decision**: Write comments that explain "why", not "what"

**Examples**:
```typescript
// ❌ Bad: Comments the obvious
// Increment counter
counter++;

// ✅ Good: Explains the reasoning
// Increment counter to track failed login attempts for rate limiting
counter++;

// ✅ Good: Explains complex logic
// We use exponential backoff here because linear backoff
// was causing thundering herd problems during outages
const delay = Math.pow(2, attempt) * 1000;
```

---

## Deployment

### Environment Variables

**Status**: Template  
**Date**: [DATE]  
**Decision**: All configuration must come from environment variables, never hard-coded

**Pattern**:
```typescript
const config = {
  port: process.env.PORT || 3000,
  dbUrl: process.env.DATABASE_URL,
  apiKey: process.env.API_KEY,
};

// ❌ Never do this
const API_KEY = 'abc123secretkey';
```

**Enforcement**: Use `.env` files for local development, CI/CD secrets for production

---

## How to Add New Decisions

When a new architectural pattern emerges:

1. Document it in this file using the template format
2. Include examples from the actual codebase
3. Explain the rationale (especially if it contradicts common practices)
4. Reference it in code reviews when enforcing the pattern
5. Update it if the decision is later superseded

---

## Maintenance

This file should be reviewed quarterly to:
- Mark outdated decisions as Deprecated
- Update patterns based on lessons learned
- Add new decisions as the project evolves
- Ensure examples are still accurate

Last reviewed: [DATE]

---

**Remember**: These decisions create consistency and reduce cognitive load. When in doubt, follow these patterns. If you need to deviate, document why.

---

**Version**: 1.0.0  
**Last Updated**: [DATE]  
**Based On**: AGENTS.md v1.0.0