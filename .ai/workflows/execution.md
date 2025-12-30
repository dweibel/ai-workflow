# WORK Phase: Test-Driven Implementation in Isolated Environments

> **Phase 3: Structured TDD Implementation with Three Sub-Phases**

## Overview

The WORK phase implements features using strict Test-Driven Development (TDD) in isolated git worktree environments. This phase is structured into three sequential sub-phases that ensure systematic development with continuous learning and quality improvement.

## Phase Position

WORK is the third phase in the EARS-workflow methodology:
- **Previous**: PLAN (implementation plan, architecture, research completed)
- **Current**: WORK (structured TDD implementation in git worktrees)
- **Next**: REVIEW (multi-perspective audit and quality assurance)

## Three Sub-Phases Structure

### Sub-Phase III-A: Create Tests
**Objective**: Set up isolated environment and write comprehensive test suite

**Key Activities**:
- Create isolated git worktree for feature development
- Navigate to worktree directory before beginning implementation
- Write comprehensive test suite based on specifications:
  - Unit tests for specific examples and edge cases
  - Property-based tests for universal properties
  - Integration tests for component interactions
- Ensure all tests fail initially (Red phase of TDD)
- Use `git-worktree.sh status` to verify current working environment

**Environment Setup**:
```bash
# Windows: Use WSL or Git Bash
./.ai/skills/git-worktree/git-worktree.sh create feature/feature-name
cd ../worktrees/feature-feature-name
```

**Test Categories**:
- **Unit Tests**: Test individual functions and methods
- **Property-Based Tests**: Test universal properties across input ranges
- **Integration Tests**: Test component interactions and interfaces
- **Edge Case Tests**: Test boundary conditions and error scenarios

### Sub-Phase III-B: Implement Code
**Objective**: Make tests pass with minimal, focused implementation

**Key Activities**:
- Follow the Green phase of TDD: make tests pass with minimal code
- Implement functionality guided by failing tests
- Make atomic commits after each completed unit
- Run tests continuously to catch regressions
- Focus on making tests pass, not on code elegance
- **Capture Implementation Lessons**: Document any unexpected challenges, API discoveries, or implementation patterns in `.ai/memory/lessons.md`
- **Record Technical Decisions**: Update `.ai/memory/decisions.md` with any architectural choices or design patterns applied during implementation

**Development Principles**:
- **Minimal Implementation**: Write just enough code to make tests pass
- **Test-Driven**: Let failing tests guide implementation decisions
- **Atomic Commits**: Commit after each successful test-fix cycle
- **Continuous Validation**: Run full test suite before each commit

**Lessons Learned Integration**:
- Document unexpected API behaviors or limitations
- Record implementation patterns that work well
- Capture technical decisions made during development
- Note any deviations from original plan and rationale

### Sub-Phase III-C: Refactor
**Objective**: Improve code quality through user-guided refactoring options

**Key Activities**:
- Present user with 3-5 refactoring options:
  1. **Performance Optimization**: Improve algorithmic efficiency or resource usage
  2. **Code Structure**: Extract methods, improve naming, enhance readability
  3. **Design Pattern**: Apply appropriate design patterns for maintainability
  4. **Security Hardening**: Address potential security vulnerabilities
  5. **Keep As-Is**: Maintain current implementation if satisfactory
- User selects preferred option or chooses to keep current implementation
- Apply selected refactoring while ensuring all tests continue to pass
- Make final atomic commit with refactoring changes
- **Document Refactoring Insights**: Record lessons about code quality, performance trade-offs, or design pattern effectiveness in `.ai/memory/lessons.md`
- **Update Architectural Patterns**: If new design patterns were applied, document them in `.ai/memory/decisions.md` for future reference

**Refactoring Options Framework**:
1. **Performance Optimization**
   - Algorithmic improvements (O(n²) → O(n log n))
   - Database query optimization
   - Caching strategy implementation
   - Memory usage optimization

2. **Code Structure**
   - Extract methods for better readability
   - Improve variable and function naming
   - Organize code into logical modules
   - Reduce code duplication

3. **Design Pattern Application**
   - Apply appropriate design patterns (Strategy, Factory, Observer)
   - Implement SOLID principles
   - Improve separation of concerns
   - Enhance code extensibility

4. **Security Hardening**
   - Input validation improvements
   - Authentication/authorization enhancements
   - Secure data handling
   - Vulnerability mitigation

5. **Keep As-Is**
   - Current implementation meets requirements
   - Risk of introducing bugs outweighs benefits
   - Time constraints favor stability
   - Code is already well-structured

**Pattern Documentation**:
- Record successful refactoring patterns for future use
- Document trade-offs between different approaches
- Capture insights about code quality improvements
- Note any architectural patterns that emerge

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

### From PLAN
- Implementation plan is approved and comprehensive
- Architectural decisions are documented and understood
- Git worktree strategy is defined and ready
- Development environment is set up and validated

### Sub-Phase Transitions
**III-A → III-B**: All tests written and failing (Red phase complete)
**III-B → III-C**: All tests passing, implementation complete (Green phase complete)
**III-C → REVIEW**: Refactoring complete, lessons documented (Refactor phase complete)

### To REVIEW
- All three sub-phases completed successfully
- Test suite passes completely with adequate coverage
- Code follows established quality standards
- Implementation lessons and architectural patterns documented
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