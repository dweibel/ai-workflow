---
name: git-worktree
description: Manage Git worktrees for isolated development environments with automated branch management and safety checks. Use this skill when creating feature branches, managing parallel development, or setting up isolated coding environments.
version: 1.0.0
author: EARS-Workflow System
phase: utility
---

# GIT-WORKTREE: Isolated Development Environment Management

## Overview

The GIT-WORKTREE skill provides comprehensive Git worktree management for isolated development environments. This utility skill enables parallel development without the complexity of multiple clones or constant branch switching, with automated safety checks and cross-platform compatibility.

## Activation

This skill activates when users mention:
- "git worktree", "worktree", "create worktree"
- "feature branch", "isolated environment", "parallel development"
- "branch management", "development environment", "workspace isolation"
- "create branch", "switch branch", "isolated coding"

## Phase Position

GIT-WORKTREE is a utility skill that supports all phases of the EARS-workflow methodology:
- **SPEC-FORGE**: Not typically used (planning happens in main repo)
- **PLANNING**: May create worktree for experimental planning work
- **WORK**: Primary usage for isolated TDD implementation
- **REVIEW**: May use worktree for fix implementation during review

## Objective

Provide safe, automated Git worktree management with proper branch naming, directory structure, and cleanup procedures to enable isolated development environments.

## Core Capabilities

### Worktree Management Operations

#### Create Worktree
- Set up isolated development environments with proper branch management
- Validate branch naming conventions (feature/, bugfix/, refactor/, etc.)
- Detect and prevent path conflicts
- Automatic directory structure in `../worktrees/`

#### List Worktrees
- Display all active worktrees with branch and commit information
- Colored output for better readability
- Show working directory paths and branch status
- Identify current working environment

#### Remove Worktree
- Clean up worktrees with confirmation prompts
- Optional branch deletion with safety checks
- Prevent accidental removal of active worktrees
- Cleanup of associated git references

#### Status Check
- Show current working environment and worktree context
- Detect if currently in a worktree or main repository
- Display branch information and commit status
- Provide location awareness for development workflow

#### Cleanup Operations
- Prune stale worktree references automatically
- Remove orphaned git references
- Maintain repository hygiene
- Prevent worktree reference bloat

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

## Usage Examples

### Basic Operations
```bash
# Create a new feature worktree
./.ai/skills/git-worktree/git-worktree.sh create feature/user-authentication

# Create worktree from specific base branch
./.ai/skills/git-worktree/git-worktree.sh create hotfix/critical-bug main

# List all active worktrees
./.ai/skills/git-worktree/git-worktree.sh list

# Check current working environment
./.ai/skills/git-worktree/git-worktree.sh status

# Remove completed worktree
./.ai/skills/git-worktree/git-worktree.sh remove feature/user-authentication

# Cleanup stale references
./.ai/skills/git-worktree/git-worktree.sh cleanup
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

## Directory Structure

### Worktree Organization
```
project-root/
├── .git/                    # Main git directory
├── src/                     # Main working directory
├── .ai/skills/git-worktree/ # Worktree management scripts
└── ../worktrees/           # Worktrees directory (outside main repo)
    ├── feature-user-auth/   # Feature worktree
    ├── bugfix-login-issue/  # Bugfix worktree
    └── refactor-api/        # Refactor worktree
```

### Branch Naming Conventions
- `feature/user-authentication` - New feature development
- `bugfix/login-validation` - Bug fixes
- `refactor/api-endpoints` - Code refactoring
- `docs/installation-guide` - Documentation updates
- `test/integration-suite` - Test improvements

## Safety Features

### Validation and Checks
- **Branch name validation** with type prefixes (feature/, bugfix/, etc.)
- **Path conflict detection** to prevent directory collisions
- **Confirmation prompts** for destructive operations
- **Active worktree protection** prevents accidental removal
- **Stale reference cleanup** maintains repository health

### Error Handling
- **Clear error messages** with specific remediation steps
- **Graceful failure handling** with rollback procedures
- **Dependency validation** ensures git and bash availability
- **Permission checks** for directory creation and removal

## Integration Points

### EARS Workflow Integration
- **Phase II (WORK)**: Primary usage for isolated TDD implementation
- **Phase III (REVIEW)**: Fix implementation in isolated environment
- **Memory Integration**: Lessons learned about worktree management
- **Documentation**: Worktree usage patterns and best practices

### Tool Integration
- **Git Integration**: Native git worktree commands with safety wrappers
- **IDE Support**: Compatible with most IDEs that recognize git worktrees
- **Script Integration**: Can be called from other automation scripts
- **CI/CD Compatibility**: Works with automated build and test systems

## Best Practices

### Lifecycle Management
- **Create worktree** only when ready to implement
- **Work exclusively** in worktree directory during development
- **Remove worktree** promptly after feature completion
- **Regular cleanup** to maintain repository hygiene

### Naming and Organization
- **Use descriptive names** with appropriate type prefixes
- **Keep names concise** but meaningful
- **Follow team conventions** for branch naming
- **Avoid deep nesting** in worktree directory structure

### Development Workflow
- **Verify environment** with status command before coding
- **Commit frequently** with atomic changes
- **Push regularly** to preserve work
- **Test thoroughly** before worktree removal

## Troubleshooting

### Common Issues and Solutions

#### Worktree Creation Fails
```bash
# Check if branch already exists
git branch --list branch-name

# Verify base branch is up to date
git fetch origin && git checkout main && git pull origin main

# Check directory permissions
ls -la ../worktrees/
```

#### Stale Worktree References
```bash
# Clean up stale references
./.ai/skills/git-worktree/git-worktree.sh cleanup

# Force remove if directory was manually deleted
git worktree remove --force path/to/worktree
```

#### Permission Issues
```bash
# On Unix systems, ensure script is executable
chmod +x .ai/skills/git-worktree/git-worktree.sh

# On Windows, use WSL or Git Bash
# Ensure PowerShell execution policy allows scripts if needed
```

## Memory Integration

### Lessons Learned
- Document worktree management patterns in `../../memory/lessons.md`
- Record effective branch naming conventions
- Update with troubleshooting solutions and common pitfalls

### Decision History
- Maintain worktree usage policies in `../../memory/decisions.md`
- Document team conventions for branch management
- Record integration patterns with development workflow

## Context Loading

Reference supporting files in current directory:
- `README.md` - Comprehensive usage documentation
- `examples.md` - Detailed usage examples and scenarios
- `git-worktree.sh` - Main script with all functionality
- `references/` - Additional documentation (if needed)

## Anti-Patterns to Avoid

- ❌ **Manual Worktree Creation**: Use helper scripts for consistency
- ❌ **Stale Worktree Accumulation**: Clean up promptly after completion
- ❌ **Main Branch Development**: Always use worktrees for feature work
- ❌ **Deep Directory Nesting**: Keep worktree structure flat
- ❌ **Inconsistent Naming**: Follow established branch naming conventions
- ❌ **Shared Worktrees**: Each developer should have their own worktrees

The GIT-WORKTREE skill ensures safe, efficient management of isolated development environments while maintaining repository hygiene and supporting the EARS-workflow methodology's emphasis on clean, isolated development practices.