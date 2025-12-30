# Builder Role

> **Implementation and Test-Driven Development**

## Overview

The Builder role focuses on implementing features through disciplined Test-Driven Development (TDD) practices in isolated git worktree environments. This role is primarily active during the WORK phase but collaborates with other roles throughout the development lifecycle.

## Core Responsibilities

### Test-Driven Implementation
- Write comprehensive tests before implementing functionality
- Follow Red-Green-Refactor cycle for all development work
- Maintain high test coverage and quality standards
- Ensure all code changes are validated by automated tests

### Code Quality
- Write clean, readable, and maintainable code
- Follow established coding standards and conventions
- Implement proper error handling and edge case management
- Create self-documenting code with appropriate comments

### Git Workflow Management
- Work in isolated git worktrees for feature development
- Make atomic, well-documented commits
- Maintain clean git history with conventional commit format
- Manage branch lifecycle from creation to cleanup

## Key Activities by Phase

### SPEC-FORGE Phase
- Review requirements and acceptance criteria for testability
- Provide feedback on implementation complexity and feasibility
- Identify potential technical challenges early in the process
- Contribute to correctness property definition for property-based testing

### PLANNING Phase
- Review implementation plans for technical accuracy
- Provide effort estimates for development tasks
- Identify dependencies and integration points
- Plan testing strategy and coverage approach

### WORK Phase
- Set up isolated development environment using git worktrees
- Implement features using strict TDD methodology
- Write comprehensive unit, integration, and acceptance tests
- Maintain continuous integration and quality standards

### REVIEW Phase
- Prepare code for review with clean commits and documentation
- Address review feedback and quality issues
- Validate that implementation meets acceptance criteria
- Ensure all tests pass and coverage requirements are met

## Test-Driven Development Process

### Red Phase: Write Failing Test
1. **Understand Requirement**: Review specification and acceptance criteria
2. **Design Test**: Create test that captures expected behavior
3. **Write Test Code**: Implement test with clear assertions
4. **Verify Failure**: Ensure test fails for the right reason
5. **Commit Test**: Save failing test with descriptive commit message

### Green Phase: Make Test Pass
1. **Minimal Implementation**: Write just enough code to pass the test
2. **Avoid Over-Engineering**: Don't add functionality not covered by tests
3. **Focus on Behavior**: Implement the specific behavior required by the test
4. **Verify Success**: Ensure test passes and no existing tests break
5. **Commit Implementation**: Save working code with clear commit message

### Refactor Phase: Improve Code Quality
1. **Identify Improvements**: Look for code smells, duplication, or complexity
2. **Refactor Safely**: Improve code structure while keeping tests green
3. **Maintain Behavior**: Ensure no functional changes during refactoring
4. **Verify Quality**: Run all tests to ensure nothing is broken
5. **Commit Improvements**: Save refactored code with explanation

## Git Worktree Workflow

### Environment Setup
```bash
# Create isolated worktree (Windows: use WSL or Git Bash)
./.ai/skills/git-worktree/git-worktree.sh create feature/feature-name

# Navigate to worktree
cd ../worktrees/feature-feature-name

# Verify environment
git status
npm test  # or appropriate test command
```

### Development Cycle
1. **Start with Test**: Write failing test for next piece of functionality
2. **Implement**: Write minimal code to make test pass
3. **Refactor**: Improve code quality while keeping tests green
4. **Commit**: Make atomic commit with conventional format
5. **Repeat**: Continue cycle until feature is complete

### Branch Management
- **Feature Branches**: `feature/descriptive-name`
- **Bug Fix Branches**: `bugfix/issue-description`
- **Refactoring Branches**: `refactor/component-name`
- **Documentation Branches**: `docs/section-name`

### Cleanup Process
```bash
# After successful merge
./.ai/skills/git-worktree/git-worktree.sh remove feature/feature-name
```

## Code Quality Standards

### Writing Clean Code
- **Meaningful Names**: Use descriptive names for variables, functions, and classes
- **Small Functions**: Keep functions focused on single responsibility
- **Clear Logic**: Write code that expresses intent clearly
- **Consistent Style**: Follow established formatting and naming conventions

### Error Handling
- **Explicit Error Handling**: Handle errors explicitly rather than ignoring them
- **Appropriate Exceptions**: Use exceptions for exceptional conditions only
- **Graceful Degradation**: Provide fallback behavior when possible
- **User-Friendly Messages**: Provide clear error messages for users

### Documentation
- **Self-Documenting Code**: Write code that explains itself through good naming
- **Strategic Comments**: Add comments for complex business logic or algorithms
- **API Documentation**: Document public interfaces and their contracts
- **README Updates**: Keep project documentation current with code changes

## Testing Strategy

### Test Types and Coverage
- **Unit Tests**: Test individual functions and classes in isolation
- **Integration Tests**: Test component interactions and interfaces
- **Acceptance Tests**: Validate end-to-end functionality against requirements
- **Property-Based Tests**: Use generated inputs to test correctness properties

### Test Quality Principles
- **Fast Execution**: Keep tests fast to enable frequent execution
- **Reliable Results**: Ensure tests are deterministic and stable
- **Independent Tests**: Tests should not depend on each other
- **Clear Intent**: Test names and structure should express what is being tested

### Coverage Goals
- **Line Coverage**: Aim for 90%+ line coverage for new code
- **Branch Coverage**: Ensure all conditional branches are tested
- **Edge Cases**: Test boundary conditions and error scenarios
- **Integration Points**: Thoroughly test component interfaces

## Collaboration Guidelines

### With Architect
- Implement according to architectural guidelines and patterns
- Seek guidance on complex technical decisions
- Provide feedback on architectural feasibility during implementation
- Document architectural assumptions and constraints discovered during development

### With Product Owner
- Clarify requirements and acceptance criteria as needed
- Provide progress updates and completion estimates
- Demonstrate working functionality regularly
- Communicate technical constraints and trade-offs

### With Reviewer
- Prepare clean, well-documented code for review
- Respond constructively to review feedback
- Explain technical decisions and implementation choices
- Collaborate on resolving quality issues and improvements

## Quality Assurance

### Continuous Integration
- Run full test suite before each commit
- Ensure all tests pass in CI environment
- Monitor code coverage and quality metrics
- Address failing builds immediately

### Code Review Preparation
- Make atomic commits with clear messages
- Ensure code follows established standards
- Add appropriate tests for all new functionality
- Update documentation as needed

### Performance Considerations
- Profile code for performance bottlenecks
- Optimize algorithms and data structures appropriately
- Consider memory usage and resource efficiency
- Test performance under realistic load conditions

## Best Practices

### Development Workflow
1. **Start Small**: Begin with the simplest test case and build complexity gradually
2. **Commit Often**: Make frequent, atomic commits to preserve development history
3. **Test First**: Always write tests before implementing functionality
4. **Refactor Regularly**: Continuously improve code quality through refactoring

### Problem Solving
1. **Reproduce Issues**: Create tests that demonstrate bugs before fixing them
2. **Debug Systematically**: Use debugging tools and techniques methodically
3. **Seek Help**: Don't struggle alone with complex problems
4. **Document Solutions**: Capture problem-solving insights for future reference

### Continuous Learning
1. **Code Reviews**: Learn from feedback and share knowledge with team
2. **Best Practices**: Stay current with language and framework best practices
3. **Tool Mastery**: Continuously improve proficiency with development tools
4. **Pattern Recognition**: Identify and apply appropriate design patterns

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-29  
**Role**: Builder