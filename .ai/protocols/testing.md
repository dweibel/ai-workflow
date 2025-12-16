# Protocol: Test-Driven Development (TDD)

## Overview

This protocol enforces strict Test-Driven Development practices to ensure code quality, prevent regressions, and create living documentation.

## Core Principle

**The Red-Green-Refactor Loop is non-negotiable.**

You MUST NOT write implementation code before writing a failing test.

---

## The Sacred Loop

### 🔴 RED: Write a Failing Test

#### Step 1: Identify the Behavior
Read the current task from the plan and identify the **specific** behavior to test.

**Example**: "User login should fail with invalid credentials"

#### Step 2: Choose Test Type

- **Unit Test**: Testing a single function/method in isolation
- **Integration Test**: Testing multiple components working together
- **E2E Test**: Testing the entire user flow

#### Step 3: Write the Test

**Rules**:
- Test ONE behavior per test case
- Use descriptive test names that explain the behavior
- Arrange-Act-Assert pattern
- No implementation code yet!

**Example** (JavaScript/TypeScript):
```typescript
describe('User Authentication', () => {
  it('should return error when password is incorrect', async () => {
    // Arrange
    const email = 'user@example.com';
    const wrongPassword = 'incorrect123';
    
    // Act
    const result = await authenticate(email, wrongPassword);
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid credentials');
  });
});
```

**Example** (Python):
```python
def test_authentication_fails_with_wrong_password():
    # Arrange
    email = "user@example.com"
    wrong_password = "incorrect123"
    
    # Act
    result = authenticate(email, wrong_password)
    
    # Assert
    assert result.success is False
    assert result.error == "Invalid credentials"
```

#### Step 4: Run the Test (Expect Failure)

```bash
# JavaScript/TypeScript
npm test -- auth.test.ts

# Python
pytest tests/test_auth.py::test_authentication_fails_with_wrong_password

# Go
go test -run TestAuthenticationFailsWithWrongPassword

# Rust
cargo test authentication_fails_with_wrong_password
```

**Expected Output**:
```
❌ FAIL: should return error when password is incorrect
   ReferenceError: authenticate is not defined
```

**Critical**: The test must fail for the RIGHT reason:
- ✅ Function doesn't exist yet
- ✅ Function exists but returns wrong value
- ❌ Syntax error in test code (fix the test first)
- ❌ Test setup failure (fix the setup first)

**Checkpoint**: You have a legitimately failing test. Do NOT proceed to Green phase until this is true.

---

### 🟢 GREEN: Make It Pass (Minimally)

#### Step 1: Implement the Minimum

Write the **simplest** code that makes the test pass.

**Key Principles**:
- Don't over-engineer
- Don't handle edge cases not covered by the test
- Don't optimize prematurely
- Don't write "while I'm here" code

**Example**:
```typescript
export async function authenticate(email: string, password: string) {
  // Minimal implementation - just make the test pass
  return {
    success: false,
    error: 'Invalid credentials'
  };
}
```

**Yes, this is "fake it till you make it"**. That's intentional. More tests will force you to write real logic.

#### Step 2: Run the Test (Expect Success)

```bash
npm test -- auth.test.ts
```

**Expected Output**:
```
✅ PASS: should return error when password is incorrect
```

**Checkpoint**: The specific test you wrote is now passing.

---

### 🔵 REFACTOR: Clean It Up

Now that the test passes, improve the code without changing behavior.

#### Step 1: Identify Improvements

Look for:
- Duplicated code
- Unclear variable names
- Long functions that should be split
- Hard-coded values that should be constants
- Code that doesn't follow style guide

#### Step 2: Refactor

**Example**:
```typescript
const INVALID_CREDENTIALS_ERROR = 'Invalid credentials';

export async function authenticate(email: string, password: string) {
  // Refactored: extracted constant, added type safety
  const isValid = await validateCredentials(email, password);
  
  if (!isValid) {
    return {
      success: false,
      error: INVALID_CREDENTIALS_ERROR
    };
  }
  
  return {
    success: true,
    user: await getUserByEmail(email)
  };
}
```

#### Step 3: Run ALL Tests

**Critical**: After refactoring, run the FULL test suite to catch regressions.

```bash
npm test  # Run ALL tests, not just the one you wrote
```

**Expected Output**:
```
✅ PASS: 47 tests passed (0 failed)
```

**If any test fails**: You broke something. Undo your refactoring and try again.

**Checkpoint**: All tests pass, code is cleaner, behavior unchanged.

---

## Test Naming Conventions

### Good Test Names

Test names should read like specifications:

✅ `should return error when password is incorrect`  
✅ `should create user with valid email`  
✅ `should throw exception when database is unavailable`  
✅ `should cache results for 5 minutes`

### Bad Test Names

❌ `testAuth()` - Too vague  
❌ `test1()` - Meaningless  
❌ `it works` - Not specific  
❌ `userTest()` - What about users?

---

## Test Structure: Arrange-Act-Assert (AAA)

Every test should follow this pattern:

```typescript
it('should do something specific', () => {
  // Arrange: Set up test data and dependencies
  const input = 'test data';
  const expectedOutput = 'expected result';
  const mockDependency = jest.fn();
  
  // Act: Execute the behavior being tested
  const result = functionUnderTest(input, mockDependency);
  
  // Assert: Verify the outcome
  expect(result).toBe(expectedOutput);
  expect(mockDependency).toHaveBeenCalledTimes(1);
});
```

**Variation**: Given-When-Then (BDD style)

```typescript
it('should do something specific', () => {
  // Given: Initial state
  const user = createUser({ role: 'admin' });
  
  // When: Action occurs
  const canDelete = user.hasPermission('delete');
  
  // Then: Expected outcome
  expect(canDelete).toBe(true);
});
```

---

## Test Coverage Guidelines

### What to Test

✅ **Happy Path**: Normal, expected usage  
✅ **Edge Cases**: Boundary conditions (empty strings, max values, etc.)  
✅ **Error Cases**: Invalid inputs, missing data  
✅ **Business Logic**: Complex calculations, state transitions  
✅ **Integration Points**: API calls, database queries  

### What NOT to Test

❌ **Framework Code**: Don't test React itself, test YOUR components  
❌ **Third-Party Libraries**: Trust that lodash works  
❌ **Trivial Code**: Getters/setters with no logic  
❌ **Generated Code**: Database migrations, generated types  

---

## Test Types & When to Use Them

### Unit Tests

**Purpose**: Test individual functions/methods in isolation

**Characteristics**:
- Fast (milliseconds)
- No external dependencies
- Use mocks/stubs for dependencies

**Example**:
```typescript
describe('calculateTotal', () => {
  it('should sum prices and apply tax', () => {
    const items = [
      { price: 10 },
      { price: 20 }
    ];
    const taxRate = 0.1;
    
    const total = calculateTotal(items, taxRate);
    
    expect(total).toBe(33); // (10 + 20) * 1.1
  });
});
```

**When to Use**: 90% of your tests should be unit tests

---

### Integration Tests

**Purpose**: Test multiple components working together

**Characteristics**:
- Slower (seconds)
- May use test database or API
- Test real interactions

**Example**:
```typescript
describe('User Registration Flow', () => {
  it('should create user and send welcome email', async () => {
    const userData = { email: 'new@example.com', password: 'secure123' };
    
    const user = await registerUser(userData);
    
    expect(user.id).toBeDefined();
    expect(await getEmailQueue()).toContainEqual({
      to: 'new@example.com',
      subject: 'Welcome!'
    });
  });
});
```

**When to Use**: Test critical user flows and complex integrations

---

### End-to-End (E2E) Tests

**Purpose**: Test entire user journey through the UI

**Characteristics**:
- Very slow (seconds to minutes)
- Uses real browser (Playwright, Cypress, Selenium)
- Brittle, expensive to maintain

**Example** (Playwright):
```typescript
test('user can login and view dashboard', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.fill('[name="email"]', 'user@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await expect(page.locator('h1')).toContainText('Dashboard');
});
```

**When to Use**: Only for critical user paths (login, checkout, etc.)

---

## Mocking & Test Doubles

### When to Mock

Mock external dependencies to:
- Isolate the unit under test
- Avoid slow operations (API calls, database queries)
- Test error conditions (network failures, etc.)

### Types of Test Doubles

#### Stub
Returns predefined data:
```typescript
const getUserStub = jest.fn().mockReturnValue({
  id: 1,
  name: 'Test User'
});
```

#### Mock
Records calls and verifies behavior:
```typescript
const emailMock = jest.fn();
await sendWelcomeEmail(user, emailMock);
expect(emailMock).toHaveBeenCalledWith('user@example.com', 'Welcome!');
```

#### Spy
Wraps real implementation to observe calls:
```typescript
const logSpy = jest.spyOn(console, 'log');
processData();
expect(logSpy).toHaveBeenCalledWith('Processing complete');
```

---

## Test Data Management

### Use Factories for Complex Objects

```typescript
function createUser(overrides = {}) {
  return {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    ...overrides
  };
}

// Usage
const admin = createUser({ role: 'admin' });
const john = createUser({ name: 'John', email: 'john@example.com' });
```

### Use Builders for Fluent API

```typescript
class UserBuilder {
  private user = { role: 'user' };
  
  withRole(role: string) {
    this.user.role = role;
    return this;
  }
  
  withEmail(email: string) {
    this.user.email = email;
    return this;
  }
  
  build() {
    return this.user;
  }
}

// Usage
const admin = new UserBuilder().withRole('admin').withEmail('admin@example.com').build();
```

---

## Common Testing Anti-Patterns

### ❌ Testing Implementation Details

**Bad**:
```typescript
it('should call helper function', () => {
  const spy = jest.spyOn(service, 'helperFunction');
  service.mainFunction();
  expect(spy).toHaveBeenCalled(); // Testing HOW, not WHAT
});
```

**Good**:
```typescript
it('should return formatted result', () => {
  const result = service.mainFunction();
  expect(result).toBe('Expected Output'); // Testing WHAT, not HOW
});
```

### ❌ One Giant Test

**Bad**:
```typescript
it('should handle entire user lifecycle', () => {
  // Tests registration, login, profile update, deletion
  // 200 lines of test code
});
```

**Good**:
```typescript
describe('User Lifecycle', () => {
  it('should register user');
  it('should login user');
  it('should update profile');
  it('should delete user');
});
```

### ❌ Flaky Tests

**Bad**:
```typescript
it('should complete within 100ms', async () => {
  const start = Date.now();
  await asyncOperation();
  expect(Date.now() - start).toBeLessThan(100); // Flaky: depends on system load
});
```

**Good**:
```typescript
it('should complete the operation', async () => {
  const result = await asyncOperation();
  expect(result).toBeDefined(); // Deterministic
});
```

### ❌ Tests That Depend on Each Other

**Bad**:
```typescript
describe('User Service', () => {
  let userId;
  
  it('should create user', () => {
    userId = createUser(); // Modifies shared state
  });
  
  it('should fetch user', () => {
    const user = getUser(userId); // Depends on previous test
  });
});
```

**Good**:
```typescript
describe('User Service', () => {
  it('should create user', () => {
    const userId = createUser();
    expect(userId).toBeDefined();
  });
  
  it('should fetch user', () => {
    const userId = createUser(); // Each test is independent
    const user = getUser(userId);
    expect(user).toBeDefined();
  });
});
```

---

## Test Organization

### File Structure

Match test files to source files:

```
src/
├── auth/
│   ├── authenticate.ts
│   └── authenticate.test.ts  # Co-located tests
├── users/
│   ├── user-service.ts
│   └── user-service.test.ts
```

Or use separate test directory:

```
src/
├── auth/
│   └── authenticate.ts
tests/
├── auth/
│   └── authenticate.test.ts
```

### Test Suite Organization

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data');
    it('should throw error with invalid email');
    it('should hash password before storing');
  });
  
  describe('deleteUser', () => {
    it('should delete user and related data');
    it('should throw error if user not found');
  });
});
```

---

## Running Tests

### Run All Tests
```bash
npm test
pytest
go test ./...
cargo test
```

### Run Specific Test File
```bash
npm test -- auth.test.ts
pytest tests/test_auth.py
go test ./auth
cargo test --test auth
```

### Run Specific Test Case
```bash
npm test -- -t "should return error"
pytest tests/test_auth.py::test_authentication_fails
go test -run TestAuthenticationFails
cargo test authentication_fails
```

### Watch Mode (Re-run on Change)
```bash
npm test -- --watch
pytest --watch
# Go and Rust: Use external tools like entr or cargo-watch
```

### Coverage Report
```bash
npm test -- --coverage
pytest --cov=src
go test -cover ./...
cargo tarpaulin
```

---

## Debugging Failing Tests

### Step 1: Read the Error Message

```
❌ FAIL: should return error when password is incorrect
   Expected: { success: false, error: 'Invalid credentials' }
   Received: { success: true, user: { ... } }
```

**Questions**:
- What was expected?
- What was actually received?
- Why is there a mismatch?

### Step 2: Add Diagnostic Logging

```typescript
it('should return error when password is incorrect', async () => {
  const result = await authenticate('user@example.com', 'wrong');
  
  console.log('Result:', result); // Temporary debugging
  
  expect(result.success).toBe(false);
});
```

### Step 3: Check Assumptions

```typescript
it('should return error when password is incorrect', async () => {
  const email = 'user@example.com';
  const password = 'wrong';
  
  // Verify test data is correct
  expect(email).toBeTruthy();
  expect(password).toBeTruthy();
  
  const result = await authenticate(email, password);
  
  expect(result.success).toBe(false);
});
```

### Step 4: Isolate the Problem

If test fails:
1. Does the function exist?
2. Are the parameters correct?
3. Are mocks set up correctly?
4. Is the assertion correct?

### Step 5: Use Debugger

```typescript
it('should return error when password is incorrect', async () => {
  debugger; // Set breakpoint here
  const result = await authenticate('user@example.com', 'wrong');
  expect(result.success).toBe(false);
});
```

Run with debugger:
```bash
node --inspect-brk node_modules/.bin/jest --runInBand auth.test.ts
```

---

## Integration with AGENTS.md Workflow

### Phase I: PLAN
- Define verification plan: What tests will prove the feature works?
- List test scenarios in the plan document

### Phase II: WORK
- **ALWAYS** follow Red-Green-Refactor
- Write test first, then implementation
- Commit after each successful cycle

### Phase III: REVIEW
- Verify test coverage is adequate
- Check that tests are meaningful (not just for coverage)
- Ensure tests follow best practices

---

## Checklist for Every Test

- [ ] Test name clearly describes the behavior
- [ ] Test follows Arrange-Act-Assert pattern
- [ ] Test is independent (doesn't rely on other tests)
- [ ] Test is deterministic (same input = same output)
- [ ] Test uses appropriate mocks/stubs
- [ ] Test verifies ONE specific behavior
- [ ] Test will fail if the behavior breaks

---

**Remember**: Tests are not a burden. They are your safety net, your documentation, and your design feedback. Embrace the Red-Green-Refactor loop.

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-16  
**Based On**: AGENTS.md v1.0.0
