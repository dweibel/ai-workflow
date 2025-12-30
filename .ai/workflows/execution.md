# Execution Workflow

> **Phase 3: Test-Driven Implementation in Isolated Environments**

## Overview

The WORK phase implements features using strict Test-Driven Development (TDD) in isolated git worktree environments. This phase transforms implementation plans into working code through disciplined development practices that ensure quality and maintainability.

## Phase Position

WORK is the third phase in the EARS-workflow methodology:
- **Previous**: PLANNING (implementation plan, architecture, research completed)
- **Current**: WORK (TDD implementation in git worktrees)
- **Next**: REVIEW (multi-perspective audit and quality assurance)

## Key Activities

### 1. Environment Setup
- Create isolated git worktree for feature development
- Set up development environment and dependencies
- Verify test framework and tooling configuration
- Establish continuous integration pipeline

### 2. Test-Driven Development
- Follow Red-Green-Refactor cycle for each task
- Write failing tests before implementation (Red)
- Implement minimal code to pass tests (Green)
- Refactor for quality while maintaining tests (Refactor)

### 3. Atomic Development
- Make small, focused commits after each TDD cycle
- Use conventional commit format for clear history
- Maintain clean, linear development history
- Document significant decisions in commit messages

### 4. Continuous Validation
- Run full test suite before each commit
- Monitor code coverage and quality metrics
- Validate against acceptance criteria regularly
- Address failing tests immediately

## Git Worktree Management

### Creating Worktrees
```bash
# Windows: Use WSL or Git Bash
./.ai/skills/git-worktree/git-worktree.sh create feature/feature-name
cd ../worktrees/feature-feature-name
```

### Branch Naming Conventions
- **Features**: `feature/descriptive-name`
- **Bug Fixes**: `bugfix/issue-description`
- **Refactoring**: `refactor/component-name`
- **Documentation**: `docs/section-name`

### Worktree Cleanup
```bash
# After successful merge
./.ai/skills/git-worktree/git-worktree.sh remove feature/feature-name
```

## Test-Driven Development Process

### Red Phase (Write Failing Test)
1. **Understand the requirement**: Review specification and acceptance criteria
2. **Write the test**: Create a test that captures the expected behavior
3. **Verify failure**: Ensure the test fails for the right reason
4. **Commit the test**: Save the failing test with descriptive commit message

### Green Phase (Make Test Pass)
1. **Minimal implementation**: Write just enough code to make the test pass
2. **Avoid over-engineering**: Don't add features not covered by tests
3. **Verify success**: Ensure the test passes and no other tests break
4. **Commit the implementation**: Save working code with clear commit message

### Refactor Phase (Improve Code Quality)
1. **Identify improvements**: Look for code smells, duplication, or complexity
2. **Refactor safely**: Improve code while keeping all tests passing
3. **Maintain behavior**: Ensure no functional changes during refactoring
4. **Commit improvements**: Save refactored code with explanation

## Universal Invariants

All implementation work must follow these rules:

### Code Safety
- Never modify code without a defined test covering the change
- Never make destructive changes without user confirmation
- Never commit code without running the full test suite first

### Git Hygiene
- Always work in dedicated git worktrees for feature development
- Never work directly on the main branch for feature implementation
- Always use atomic, descriptive commits following conventional format
- Always clean up worktrees after feature completion

### Test Coverage
- Always write tests before implementation (Red-Green-Refactor)
- Never skip tests because "it's a simple change"
- Always maintain or improve test coverage with each change
- Always run full test suite before considering work complete

## Quality Standards

### Code Quality
- Follow established coding standards and style guides
- Write self-documenting code with clear variable and function names
- Add comments for complex business logic or algorithms
- Maintain consistent formatting and structure

### Test Quality
- Write tests that clearly express intent and expected behavior
- Use descriptive test names that explain what is being tested
- Organize tests logically with appropriate setup and teardown
- Maintain fast, reliable, and independent tests

### Commit Quality
- Use conventional commit format: `type(scope): description`
- Write clear, concise commit messages that explain the change
- Make atomic commits that represent single logical changes
- Include relevant issue numbers or references in commit messages

## Transition Criteria

### From PLANNING
- Implementation plan is approved and comprehensive
- Architectural decisions are documented and understood
- Git worktree strategy is defined and ready
- Development environment is set up and validated

### To REVIEW
- All planned features are implemented and tested
- Test suite passes completely with adequate coverage
- Code follows established quality standards
- Feature branch is ready for merge consideration

## Best Practices

### Development Workflow
1. **Start with tests**: Always begin each task by writing a failing test
2. **Small iterations**: Keep TDD cycles short (minutes, not hours)
3. **Frequent commits**: Commit after each successful TDD cycle
4. **Continuous integration**: Push changes regularly to validate in CI environment

### Problem Solving
1. **Debug systematically**: Use tests to isolate and reproduce issues
2. **Seek help early**: Don't struggle alone with complex problems
3. **Document solutions**: Capture problem-solving insights in memory files
4. **Learn from failures**: Extract lessons from bugs and failed approaches

### Collaboration
1. **Clear communication**: Keep team informed of progress and blockers
2. **Code reviews**: Prepare code for review with clean commits and documentation
3. **Knowledge sharing**: Document complex implementations for future reference
4. **Pair programming**: Collaborate on challenging or critical implementations

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-29  
**Phase**: WORK