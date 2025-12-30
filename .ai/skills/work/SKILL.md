---
name: work
description: Implement features using strict Test-Driven Development in isolated Git worktree environments. Use this skill when transitioning from PLANNING to implementation, building features, fixing bugs, or refactoring code with TDD practices.
version: 1.0.0
author: EARS-Workflow System
phase: work
---

# WORK: Test-Driven Implementation

## Overview

The WORK skill implements features using strict Test-Driven Development (TDD) in isolated Git worktree environments. This skill ensures clean, tested, working code through the Red-Green-Refactor cycle while maintaining isolation from the main branch.

## Activation

This skill activates when users mention:
- "implement", "fix", "refactor", "build", "code"
- "TDD", "test-driven", "write tests"
- "git worktree", "feature branch", "development"
- "red-green-refactor", "failing test", "make it pass"

## Phase Position

WORK is the third phase in the EARS-workflow methodology:
- **Previous**: PLANNING (implementation plan, architecture, research completed)
- **Current**: WORK (TDD implementation in git worktrees)
- **Next**: REVIEW (multi-perspective audit and quality assurance)

## Objective

Implement the feature defined in the approved plan using strict Test-Driven Development in an isolated Git Worktree environment.

## Prerequisites

Before starting implementation:
1. **Approved plan document** from `.ai/docs/plans/YYYY-MM-DD-feature-name.md` (PLANNING phase)
2. **Builder persona** loaded from `references/builder-role.md`
3. **Git worktree protocol** loaded from `references/git-worktree-protocol.md`
4. **Execution workflow** loaded from `references/execution-workflow.md`
5. **Memory files** consulted to avoid past mistakes

## Key Activities

### 1. Environment Setup
- Create isolated Git worktree using helper scripts
- Navigate to worktree directory before implementation
- Verify environment setup and dependencies
- Ensure all existing tests pass before starting

### 2. Test-Driven Development Loop
Follow the **Red-Green-Refactor** cycle for each task:

#### Red Phase (Write Failing Test)
- Read current task from approved plan
- Write test that asserts desired behavior
- Run test to confirm it fails for the right reason
- **Do NOT write implementation code yet**

#### Green Phase (Make It Pass)
- Write minimal code to make test pass
- Avoid premature optimization
- Prioritize readability over cleverness
- Run test to confirm it passes

#### Refactor Phase (Clean Up)
- Improve code quality and readability
- Remove duplication and improve naming
- Ensure compliance with style guides
- Run full test suite to prevent regressions

### 3. Atomic Commits
After each successful Red-Green-Refactor cycle:
- Stage changes with descriptive commit messages
- Follow conventional commit format (feat:, fix:, refactor:, test:)
- Ensure each commit represents one complete TDD cycle
- Push changes regularly to preserve work

### 4. Continuous Verification
- Run full test suite before task completion
- Verify linting and formatting compliance
- Ensure build/compilation succeeds
- Update documentation as needed

## Git Worktree Management

### Creation and Setup
```bash
# Use helper scripts (cross-platform via WSL/Git Bash on Windows)
./.ai/skills/git-worktree/git-worktree.sh create feature/feature-name

# Navigate to worktree
cd ../worktrees/feature-feature-name

# Verify environment
./.ai/skills/git-worktree/git-worktree.sh status
```

### Branch Naming Conventions
- `feature/user-authentication`
- `bugfix/login-validation`
- `refactor/api-endpoints`
- `docs/installation-guide`
- `test/integration-suite`

### Safety Checks
- **Always verify working directory** before coding
- **Work exclusively in worktree** - never on main branch
- **Use helper scripts** for consistent setup and cleanup
- **Clean up worktrees** after feature completion

## TDD Protocol

### Test Writing Guidelines
- Write tests before implementation code
- Test one specific behavior per test case
- Use descriptive test names that explain intent
- Ensure tests fail for the right reason before implementing

### Implementation Guidelines
- Write minimal code to pass tests
- Avoid premature optimization during Green phase
- Refactor only after tests are passing
- Maintain focus on single responsibility

### Error Handling Protocol
When tests fail during implementation:
1. **Read stderr carefully** - understand the actual error
2. **Analyze root cause** - not just symptoms
3. **Make targeted fix** - one change at a time
4. **Run test again** - verify fix works
5. **If fails twice** - stop and request assistance

## Commit Strategy

### Conventional Commit Format
- `feat:` New feature capability
- `fix:` Bug fix
- `refactor:` Code restructuring without behavior change
- `test:` Adding or updating tests
- `docs:` Documentation updates
- `style:` Code style changes (formatting, etc.)

### Good Commit Examples
- ✅ `feat: add user login validation`
- ✅ `test: add edge case for empty password`
- ✅ `refactor: extract password hashing to utility`

### Bad Commit Examples
- ❌ `wip` (too vague)
- ❌ `fix stuff` (not descriptive)
- ❌ `feat: implement entire auth system` (not atomic)

## Progress Tracking

### Task Completion
Update the plan document as tasks are completed:
```markdown
## Task Breakdown
- [x] **Task 1**: Write test for user login validation ✅ Commit: abc123
- [x] **Task 2**: Implement login validation ✅ Commit: def456
- [ ] **Task 3**: Add password hashing
- [ ] **Task 4**: Integrate with session management
```

### Progress Reporting
Provide periodic updates (every 2-3 tasks or 30 minutes):
```markdown
## Progress Update

**Completed**:
- ✅ Task 1: Login validation (commit: abc123)
- ✅ Task 2: Password hashing (commit: def456)

**In Progress**:
- 🔄 Task 3: Session management

**Status**: 2 of 5 tasks complete. All tests passing.
```

## Quality Assurance

### Before Task Completion
- [ ] All new tests pass
- [ ] Full test suite passes (no regressions)
- [ ] Code follows style guidelines
- [ ] No debug code or TODO comments left behind
- [ ] Changes are committed atomically

### Before Feature Completion
- [ ] All tasks from plan are implemented
- [ ] Full test suite passes
- [ ] Code is linted and formatted
- [ ] Build/compilation succeeds
- [ ] Documentation is updated
- [ ] Branch is pushed to remote

## Memory Integration

### Lessons Learned
- Consult `../../memory/lessons.md` before starting to avoid past mistakes
- Document new patterns discovered during implementation
- Update lessons with TDD insights and debugging solutions

### Decision History
- Review `../../memory/decisions.md` for established coding patterns
- Follow existing architectural decisions and style guidelines
- Document new technical decisions made during implementation

## Context Loading

Reference supporting files in `references/` directory:
- Execution workflow procedures
- Builder role definitions and competencies
- Git worktree protocol and best practices
- Testing strategies and TDD guidelines

## Integration Points

- Loads approved PLANNING artifacts (implementation plan, architecture decisions)
- References `references/execution-workflow.md` for detailed TDD procedures
- Uses `references/builder-role.md` for implementation persona and practices
- Follows `references/git-worktree-protocol.md` for environment isolation
- Updates `../../memory/` files with new patterns and lessons learned

## Approval Gate

The WORK phase requires verification before proceeding to REVIEW:

**Completion Criteria**:
- All tasks from the plan are implemented
- All tests are passing (including new tests)
- Code follows established style guidelines
- Changes are committed atomically with descriptive messages
- Branch is pushed and ready for review

## Output Artifacts

Upon completion, WORK produces:
- Feature branch with atomic commits
- Comprehensive test coverage for new functionality
- Updated documentation reflecting changes
- Clean, refactored code following established patterns
- Updated memory files with lessons learned

## Error Handling

Common implementation issues and solutions:
- **Test Failures**: Follow error handling protocol, escalate after 2 attempts
- **Environment Issues**: Verify worktree setup, check dependencies
- **Merge Conflicts**: Rebase feature branch against latest main
- **Performance Issues**: Focus on correctness first, optimize in refactor phase
- **Style Violations**: Run linting tools, follow established patterns

## Transition to REVIEW

Upon completion, the WORK skill provides:
- Working feature on isolated branch
- Comprehensive test coverage
- Clean, documented code
- Atomic commit history
- Foundation for quality review in REVIEW phase

## Anti-Patterns to Avoid

- ❌ **Writing Code Before Tests**: Always follow Red-Green-Refactor
- ❌ **Large Commits**: Keep commits atomic and focused
- ❌ **Ignoring Test Failures**: Never commit broken tests
- ❌ **Skipping Refactor Phase**: Clean code is part of TDD cycle
- ❌ **Working on Main Branch**: Always use worktrees for isolation
- ❌ **Premature Optimization**: Make it work, make it right, then make it fast

The WORK skill ensures that implementation follows disciplined TDD practices while maintaining code quality and project standards through isolated development environments.