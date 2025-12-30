---
name: git-worktree
description: Git worktree management and TDD implementation workflow. Provides isolated development environments with proper branch management, atomic commits, and test-driven development practices. Use this skill for implementation, fixes, refactoring, and any code development work.
version: 1.0.0
author: Compound Engineering System
phase: work
---

# Git Worktree Skill

## Overview

The Git Worktree skill manages isolated development environments using git worktrees and enforces test-driven development practices. It provides safe, atomic development workflows that prevent main branch contamination and ensure code quality through continuous testing.

## Activation

This skill activates when users mention:
- "git worktree", "worktree", "create worktree", "git workflow"
- "feature branch", "isolated environment", "parallel development"
- "branch management", "development environment", "workspace isolation"
- "create branch", "switch branch", "isolated coding"
- "implement", "fix", "refactor", "build", "code"

## Phase Position

GIT-WORKTREE is primarily a WORK phase skill that supports the complete development lifecycle:
- **SPEC-FORGE**: Not typically used (planning happens in main repo)
- **PLANNING**: May create worktree for experimental planning work
- **WORK**: Primary usage for isolated TDD implementation
- **REVIEW**: May use worktree for fix implementation during review

## Core Capabilities

### Worktree Management
- **Create**: Set up isolated development environments with proper branch management
- **List**: Display all active worktrees with branch and commit information
- **Remove**: Clean up worktrees and optionally delete associated branches
- **Cleanup**: Prune stale worktree references automatically
- **Status**: Show current working environment and worktree context

### Development Workflow
- **TDD Enforcement**: Red-Green-Refactor cycle management
- **Atomic Commits**: Conventional commit format with proper scoping
- **Branch Hygiene**: Proper branch naming and lifecycle management
- **Test Integration**: Continuous test execution and validation

## Worktree Architecture

### Directory Structure
Worktrees are created in `../worktrees/` relative to the main repository:
```
project/
├── main-repo/           # Main repository
└── worktrees/
    ├── feature-auth/    # Feature worktree
    ├── bugfix-login/    # Bugfix worktree
    └── refactor-api/    # Refactor worktree
```

### Branch Naming Conventions
- **Features**: `feature/descriptive-name`
- **Bugfixes**: `bugfix/issue-description`
- **Refactoring**: `refactor/component-name`
- **Experiments**: `experiment/hypothesis-name`
- **Documentation**: `docs/section-name`
- **Tests**: `test/test-type`

## Test-Driven Development

### Red-Green-Refactor Cycle
1. **Red**: Write a failing test that defines desired behavior
2. **Green**: Write minimal code to make the test pass
3. **Refactor**: Improve code quality while maintaining test passage

### Test Execution Strategy
- Run tests after each code change
- Maintain fast test feedback loops
- Use test categories (unit, integration, e2e) appropriately
- Never commit without passing tests

## Platform Support

### Cross-Platform Bash Implementation
- **All Platforms**: Unified bash script (`git-worktree.sh`)
- **Windows**: Use WSL (Windows Subsystem for Linux) or Git Bash
- **Unix/Linux/macOS**: Native bash execution
- **Consistent behavior** across all platforms

### Script Location
All operations use the centralized script:
```bash
./.ai/skills/git-worktree/git-worktree.sh [command] [options]
```

## Usage Workflows

### Starting New Development
```bash
# Create isolated worktree
./.ai/skills/git-worktree/git-worktree.sh create feature/user-auth

# Navigate to worktree
cd ../worktrees/feature-user-auth

# Begin TDD cycle
# 1. Write failing test
# 2. Implement minimal solution
# 3. Refactor and improve
# 4. Commit atomically
```

### Managing Multiple Features
```bash
# List active worktrees
./.ai/skills/git-worktree/git-worktree.sh list

# Switch between worktrees
cd ../worktrees/feature-auth    # Work on authentication
cd ../worktrees/bugfix-login    # Fix login issue
cd ../worktrees/refactor-api    # Refactor API layer
```

### Completing Development
```bash
# Run full test suite
npm test

# Commit final changes
git commit -m "feat(auth): implement user authentication with JWT"

# Return to main repo
cd ../../main-repo

# Clean up worktree
./.ai/skills/git-worktree/git-worktree.sh remove feature/user-auth
```

### Integration with WORK Phase
```bash
# Phase II: WORK - Create isolated environment
./.ai/skills/git-worktree/git-worktree.sh create feature/new-feature

# Navigate to worktree (script shows path)
cd ../worktrees/feature-new-feature

# Verify environment before coding
./.ai/skills/git-worktree/git-worktree.sh status

# After completion, return to main and cleanup
cd ../../main-repo
./.ai/skills/git-worktree/git-worktree.sh remove feature/new-feature
```

## Integration Points

### With Compound Engineering
- Enforces universal invariants (git hygiene, testing, documentation)
- Integrates with memory system for learning from past development patterns
- Coordinates with other skills for complete workflow coverage

### With Specification Skills
- Implements features defined in EARS specifications
- Maintains traceability from requirements to implementation
- Validates implementation against correctness properties

### With Review Skills
- Provides clean, atomic commits for review
- Maintains test coverage for review validation
- Ensures code quality standards are met

### EARS Workflow Integration
- **Phase II (WORK)**: Primary usage for isolated TDD implementation
- **Phase III (REVIEW)**: Fix implementation in isolated environment
- **Memory Integration**: Lessons learned about worktree management
- **Documentation**: Worktree usage patterns and best practices

## Safety Features

### Validation and Checks
- **Branch name validation** with type prefixes (feature/, bugfix/, etc.)
- **Path conflict detection** to prevent directory collisions
- **Confirmation prompts** for destructive operations
- **Active worktree protection** prevents accidental removal
- **Stale reference cleanup** maintains repository health

### Pre-Creation Checks
- Validate branch naming conventions
- Check for existing branches or worktrees
- Verify repository state and cleanliness
- Confirm sufficient disk space

### During Development
- Prevent commits without tests
- Validate commit message format
- Check for merge conflicts
- Monitor test coverage

### Post-Development
- Verify all tests pass
- Check for uncommitted changes
- Validate branch is ready for merge
- Clean up temporary files

## Error Handling

### Common Issues and Solutions

**Permission Errors**:
- Ensure scripts have execute permissions
- Use WSL on Windows for consistent bash execution
- Check file system permissions

**Branch Conflicts**:
- Provide clear conflict resolution guidance
- Suggest alternative branch names
- Offer cleanup options for stale branches

**Worktree Issues**:
- Detect and resolve stale worktree references
- Handle disk space and path length limitations
- Provide recovery options for corrupted worktrees

### Recovery Procedures
- Automatic cleanup of failed worktree creation
- Manual recovery steps for complex issues
- Backup and restore procedures for critical situations

## Memory Integration

### Learning from Development
- Track common development patterns and anti-patterns
- Learn from test failures and debugging sessions
- Codify successful worktree management strategies
- Build repository-specific development wisdom

### Pattern Recognition
- Identify frequently used branch naming patterns
- Learn optimal worktree organization strategies
- Recognize and prevent common git workflow mistakes
- Adapt to team-specific development practices

### Lessons Learned
- Document worktree management patterns in `../../memory/lessons.md`
- Record effective branch naming conventions
- Update with troubleshooting solutions and common pitfalls

### Decision History
- Maintain worktree usage policies in `../../memory/decisions.md`
- Document team conventions for branch management
- Record integration patterns with development workflow

## Best Practices

### Worktree Management
- Create worktrees for all non-trivial changes
- Use descriptive branch names that reflect the work
- Keep worktrees focused on single features or fixes
- Clean up worktrees promptly after merge

### Development Discipline
- Always start with a failing test
- Make atomic commits with clear messages
- Run tests before every commit
- Refactor continuously to maintain code quality

### Collaboration
- Coordinate worktree usage with team members
- Use consistent branch naming across the team
- Share worktree management scripts and practices
- Document team-specific workflow adaptations

### Lifecycle Management
- **Create worktree** only when ready to implement
- **Work exclusively** in worktree directory during development
- **Remove worktree** promptly after feature completion
- **Regular cleanup** to maintain repository hygiene

## Platform Considerations

### Windows Users
- Use WSL (Windows Subsystem for Linux) for bash script execution
- Alternative: Use Git Bash for script compatibility
- Ensure proper line ending handling (Git autocrlf)
- Consider path length limitations on Windows

### Unix/Linux/macOS
- Native bash script execution
- Standard POSIX compliance
- Optimal performance and compatibility
- Full feature set availability

### Cross-Platform Scripts
- All scripts use bash for consistency
- Forward slash paths for compatibility
- POSIX-compliant command usage
- Graceful degradation for platform-specific features

## Context Loading

Reference supporting files in current directory:
- `README.md` - Comprehensive usage documentation
- `examples.md` - Detailed usage examples and scenarios
- `git-worktree.sh` - Main script with all functionality
- `lib/` - JavaScript implementation and utilities
- `tests/` - Comprehensive test suite
- `references/` - Additional documentation

## Anti-Patterns to Avoid

- ❌ **Manual Worktree Creation**: Use helper scripts for consistency
- ❌ **Stale Worktree Accumulation**: Clean up promptly after completion
- ❌ **Main Branch Development**: Always use worktrees for feature work
- ❌ **Deep Directory Nesting**: Keep worktree structure flat
- ❌ **Inconsistent Naming**: Follow established branch naming conventions
- ❌ **Shared Worktrees**: Each developer should have their own worktrees
- ❌ **Skipping Tests**: Never commit without running the test suite
- ❌ **Large Commits**: Make atomic commits with single responsibility

The Git Worktree skill ensures safe, efficient management of isolated development environments while enforcing test-driven development practices and maintaining repository hygiene in support of the compound engineering methodology.