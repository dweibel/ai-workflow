# Workflow: Phase II - Execution & TDD

## Objective
Implement the feature defined in `/docs/plans/FEATURE_NAME.md` using strict Test-Driven Development in an isolated Git Worktree environment.

## Prerequisites
Before starting, ensure you have:
1. An **approved** plan document from `/docs/plans/YYYY-MM-DD-feature-name.md` (Phase I)
2. Loaded `.ai/roles/builder.md` to adopt the correct persona
3. Loaded `.ai/protocols/git-worktree.md` for environment setup
4. Loaded `.ai/protocols/testing.md` for TDD protocol
5. Loaded `.ai/memory/lessons.md` to avoid past mistakes

**Documentation Context**: This workflow generates artifacts in:
- `/docs/plans/` - The approved implementation plan
- `/docs/tasks/` - Optional task tracking (if needed)
- Code changes in the feature branch worktree

## Step 0: Environment Setup

### 0.1 Create Git Worktree
**ALWAYS use helper scripts** - they implement best practices and prevent common errors.

```bash
# Windows PowerShell (PREFERRED METHOD)
.\scripts\git-worktree.ps1 -Action create -BranchName "feature/feature-description"

# Unix/Linux/macOS (PREFERRED METHOD)  
./scripts/git-worktree.sh create feature/feature-description

# Navigate to the worktree (script will show the path)
cd ../worktrees/feature-feature-description

# Verify you're in the correct environment (CRITICAL SAFETY CHECK)
.\scripts\git-worktree.ps1 -Action status  # Windows
./scripts/git-worktree.sh status          # Unix/Linux/macOS
```

**Manual Method (ONLY if scripts unavailable)**:
```bash
# Generate descriptive branch name
BRANCH_NAME="feature/feature-description"

# Create worktree in ../worktrees/ directory
git worktree add ../worktrees/$BRANCH_NAME -b $BRANCH_NAME

# Switch to the worktree
cd ../worktrees/$BRANCH_NAME

# Verify location
pwd  # Should show ../worktrees/feature-feature-description
```

### 0.2 Environment Initialization
```bash
# Install dependencies (if needed)
npm install
# or
pip install -r requirements.txt
# or
go mod download

# Verify tests run
npm test  # or equivalent
```

**Checkpoint**: All existing tests should pass before you start.

## Step 1: The TDD Loop

For **each** task in the plan's "Task Breakdown" section, follow this loop:

### Phase: RED (Write Failing Test)

#### 1.1 Contextualize
- Read the current TODO item from the plan
- Identify the specific behavior to test
- Determine where the test file should live

#### 1.2 Write the Test
**Rule**: Do NOT write implementation code yet.

```typescript
// Example: test/auth.test.ts
describe('User Authentication', () => {
  it('should reject login with invalid credentials', async () => {
    const result = await login('user@example.com', 'wrong_password');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid credentials');
  });
});
```

#### 1.3 Run the Test (Expect Failure)
```bash
npm test -- auth.test.ts
```

**Expected Output**: Test FAILS (function doesn't exist yet)

**Verify**: The test is failing for the RIGHT reason (missing implementation, not syntax error)

**Checkpoint**: Do not proceed until you have a legitimately failing test.

---

### Phase: GREEN (Make It Pass)

#### 2.1 Implement Minimally
Write the **simplest** code that makes the test pass.

**Rule**: No premature optimization. No "while I'm here" additions.

```typescript
// src/auth.ts
export async function login(email: string, password: string) {
  // Minimal implementation to pass the test
  if (password === 'wrong_password') {
    return { success: false, error: 'Invalid credentials' };
  }
  // ... actual implementation
}
```

#### 2.2 Run the Test (Expect Success)
```bash
npm test -- auth.test.ts
```

**Expected Output**: Test PASSES

**Checkpoint**: The specific test you just wrote is green.

---

### Phase: REFACTOR (Clean Up)

#### 3.1 Improve Code Quality
Now that the test passes, improve the code:
- Remove duplication
- Improve naming
- Extract functions if needed
- Ensure it follows style guides (check `.ai/memory/decisions.md`)

#### 3.2 Run Full Test Suite
```bash
npm test
```

**Expected Output**: ALL tests pass (no regressions)

**Critical**: If any test fails, you've introduced a regression. Fix it before proceeding.

#### 3.3 Verify Style & Linting
```bash
npm run lint
npm run format
```

**Checkpoint**: All tests green, no lint errors, code is clean.

---

### Step 2: Atomic Commit

After each successful Red-Green-Refactor cycle:

```bash
git add .
git commit -m "feat: implement [specific capability]"
```

**Commit Message Guidelines** (Conventional Commits):
- `feat:` New feature capability
- `fix:` Bug fix
- `refactor:` Code restructuring without behavior change
- `test:` Adding or updating tests
- `docs:` Documentation updates
- `style:` Code style changes (formatting, etc.)

**Example Good Commits**:
- ✅ `feat: add user login validation`
- ✅ `test: add edge case for empty password`
- ✅ `refactor: extract password hashing to utility`

**Example Bad Commits**:
- ❌ `wip` (too vague)
- ❌ `fix stuff` (not descriptive)
- ❌ `feat: implement entire auth system` (not atomic)

**Checkpoint**: Each commit represents one complete TDD cycle.

---

## Step 3: Error Handling Protocol

### When Tests Fail During Implementation

#### Attempt 1: Initial Fix
1. **Read stderr carefully** - Don't skim
2. **Identify the root cause** - Not just the symptom
3. **Make ONE targeted change**
4. **Run the test again**

#### Attempt 2: Deeper Analysis
If the test still fails:
1. **Add diagnostic logging**
2. **Verify assumptions** (check actual values vs. expected)
3. **Make another targeted change**
4. **Run the test again**

#### Attempt 3: Request Human Assistance
If the test still fails after 2 attempts:

**STOP and ask the user for guidance.**

```markdown
## Test Failure: Need Assistance

**Test**: `test/auth.test.ts:42 - should reject invalid login`

**Failure Output**:
```
[Paste exact stderr]
```

**What I've Tried**:
1. [Attempt 1 description]
2. [Attempt 2 description]

**Current Hypothesis**:
[Your best guess at the root cause]

**Request**:
- Should I investigate [specific area]?
- Is there a known issue with [component]?
```

**Rule**: Never thrash beyond 2 failed attempts. Escalate.

---

## Step 4: Progress Tracking

### 4.1 Update Plan Document
As you complete tasks, update the plan:

```markdown
## Task Breakdown
- [x] **Task 1**: Write test for user login validation ✅ Commit: abc123
- [x] **Task 2**: Implement login validation ✅ Commit: def456
- [ ] **Task 3**: Add password hashing
- [ ] **Task 4**: Integrate with session management
```

### 4.2 Report Progress to User
Periodically (every 2-3 tasks or 30 minutes):

```markdown
## Progress Update

**Completed**:
- ✅ Task 1: Login validation (commit: abc123)
- ✅ Task 2: Password hashing (commit: def456)

**In Progress**:
- 🔄 Task 3: Session management

**Next Up**:
- Task 4: Error handling
- Task 5: Documentation

**Status**: 2 of 5 tasks complete. All tests passing.
```

---

## Step 5: Continuous Verification

Before marking the ENTIRE feature complete:

### 5.1 Full Test Suite
```bash
npm test
```
**Expected**: ALL tests pass (not just new ones)

### 5.2 Linting & Formatting
```bash
npm run lint
npm run format
# or
pylint src/
black src/
```
**Expected**: No errors, code is formatted

### 5.3 Build & Compile
```bash
npm run build
# or
go build
# or
python -m py_compile src/**/*.py
```
**Expected**: No compilation errors

### 5.4 Manual Smoke Test (if applicable)
```bash
npm run dev
# Test the feature manually in browser/CLI
```

### 5.5 Documentation Update
- [ ] Update README.md if public API changed
- [ ] Update inline code comments for complex logic
- [ ] Update API documentation (Swagger, JSDoc, etc.)

**Checkpoint**: Feature is complete, tested, and documented.

---

## Step 6: Final Commit & Push

### 6.1 Final Commit
```bash
git add .
git commit -m "docs: update README with new feature usage"
```

### 6.2 Push to Remote
```bash
git push origin $BRANCH_NAME
```

### 6.3 Return to Root & Cleanup
```bash
cd ../..  # Back to repo root
git worktree remove .trees/$BRANCH_NAME
```

**Note**: The worktree can stay active if moving to Phase III (Review)

---

## Step 7: Retrospective & Knowledge Codification

**Critical**: This step ensures compound interest on engineering effort (AGENTS.md section 5).

### 7.1 Review the Session
Reflect on the implementation session:
- What mistakes were made and corrected?
- What patterns or solutions emerged?
- What assumptions proved incorrect?
- Were there any "gotchas" or unexpected issues?

### 7.2 Extract Lessons Learned
If any corrections or learnings occurred, codify them:

**Update `.ai/memory/lessons.md`**:
```markdown
## [Category]

- When doing [action], always ensure [safeguard] to prevent [failure mode].
  - **Context**: [Specific scenario from this session]
  - **Example**: [Code snippet or command]
```

**Update `.ai/memory/decisions.md`** (if new architectural patterns emerged):
```markdown
## [Decision Title]

**Status**: Active  
**Date**: YYYY-MM-DD  
**Decision**: [What pattern was established]  
**Rationale**: [Why this approach]  
**Examples**: [Reference files from this feature]
```

### 7.3 Document in Plan (Optional)
You may add a "Lessons Learned" section to the plan document:
```markdown
## Lessons Learned
- [Key insight 1]
- [Key insight 2]
```

**Checkpoint**: Memory files updated. Future sessions will benefit from this knowledge.

---

## Step 8: Transition to Phase III (Review)

Announce completion and prepare for review:

```markdown
## Implementation Complete: [Feature Name]

**Branch**: `feat/feature-description`
**Commits**: X atomic commits
**Tests**: All passing (X new tests added)

**Summary of Changes**:
- [File 1]: [What changed]
- [File 2]: [What changed]

**Ready for Review Phase**:
Loading `.ai/workflows/review.md` and `.ai/roles/auditor.md`...
```

---

## Success Criteria

Phase II is complete when:
1. ✅ All tasks from the plan are implemented
2. ✅ All new tests are written and passing
3. ✅ Full test suite passes (no regressions)
4. ✅ Code is linted and formatted
5. ✅ Changes are committed atomically with descriptive messages
6. ✅ Branch is pushed to remote
7. ✅ Documentation is updated

---

## Common Anti-Patterns to Avoid

❌ **Writing Code Before Tests**: "I'll add tests later"  
✅ **Proper Approach**: Always Red-Green-Refactor

❌ **Large Commits**: "Implement entire feature" in one commit  
✅ **Proper Approach**: Atomic commits after each TDD cycle

❌ **Ignoring Test Failures**: "It's probably fine"  
✅ **Proper Approach**: Never commit broken tests

❌ **Skipping Refactor Phase**: "It works, ship it"  
✅ **Proper Approach**: Clean code is part of the TDD cycle

❌ **Working on Main Branch**: "Just a quick fix"  
✅ **Proper Approach**: Always use worktrees for isolation

❌ **Premature Optimization**: "Let me make this super efficient"  
✅ **Proper Approach**: Make it work, make it right, then make it fast

---

## Emergency Procedures

### If You Accidentally Work on Main
```bash
# Stash your changes
git stash

# Create proper worktree
git worktree add .trees/feat-fix -b feat/fix

# Move to worktree
cd .trees/feat-fix

# Apply stashed changes
git stash pop

# Continue work in worktree
```

### If Tests Are Suddenly Failing
1. Run `git status` to see what changed
2. Run `git diff` to see specific changes
3. Verify you're in the correct directory (`pwd`)
4. Check if dependencies need reinstalling
5. Ask user for help if stuck

### If You Need to Switch Tasks Mid-Implementation
```bash
# Commit your current work (even if incomplete)
git add .
git commit -m "wip: partial implementation of [task]"

# Push to preserve work
git push origin $BRANCH_NAME

# The worktree can stay for later, or be cleaned up
cd ../..
# Note: Don't remove the worktree, just switch context
```

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-16  
**Based On**: AGENTS.md v1.0.0
