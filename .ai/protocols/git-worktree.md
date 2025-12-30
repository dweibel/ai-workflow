# Git Worktree Protocol

> **Isolated Development Environment Management**

## Overview

The Git Worktree Protocol defines standardized procedures for creating, managing, and cleaning up isolated development environments using git worktrees. This protocol ensures safe, efficient development practices while maintaining repository hygiene.

## Protocol Objectives

### Isolation Benefits
- **Parallel Development**: Work on multiple features simultaneously without conflicts
- **Clean Environment**: Each feature gets a fresh, isolated development environment
- **Safe Experimentation**: Test changes without affecting main development branch
- **Easy Context Switching**: Switch between features without stashing or committing incomplete work

### Repository Hygiene
- **Organized Structure**: Maintain consistent worktree organization and naming
- **Automated Cleanup**: Prevent accumulation of stale worktrees and branches
- **Branch Management**: Enforce consistent branch naming and lifecycle management
- **History Preservation**: Maintain clean git history through proper workflow

## Worktree Lifecycle

### 1. Creation Phase
```bash
# Windows: Use WSL or Git Bash
./.ai/skills/git-worktree/git-worktree.sh create [branch-type]/[descriptive-name]

# Examples:
./.ai/skills/git-worktree/git-worktree.sh create feature/user-authentication
./.ai/skills/git-worktree/git-worktree.sh create bugfix/login-validation
./.ai/skills/git-worktree/git-worktree.sh create refactor/database-layer
```

**Creation Process**:
1. Validate branch name follows naming conventions
2. Create new branch from current main/master branch
3. Create worktree in `../worktrees/[branch-name]` directory
4. Set up development environment in new worktree
5. Verify worktree is ready for development

### 2. Development Phase
```bash
# Navigate to worktree
cd ../worktrees/[branch-name]

# Verify environment
git status
git branch -v

# Begin development with TDD
# ... implement features using Red-Green-Refactor cycle ...
```

**Development Guidelines**:
- Always work within the worktree directory
- Follow TDD practices for all development
- Make atomic commits with conventional format
- Push changes regularly to backup work

### 3. Integration Phase
```bash
# Prepare for merge (from main repository)
cd /path/to/main/repository

# Update main branch
git checkout main
git pull origin main

# Merge feature branch
git merge --no-ff [branch-name]

# Push integrated changes
git push origin main
```

**Integration Requirements**:
- All tests must pass before merge
- Code review must be completed and approved
- Merge conflicts must be resolved properly
- Integration tests must validate combined functionality

### 4. Cleanup Phase
```bash
# Remove worktree and branch
./.ai/skills/git-worktree/git-worktree.sh remove [branch-name]

# Verify cleanup
./.ai/skills/git-worktree/git-worktree.sh list
```

**Cleanup Process**:
1. Verify branch has been merged to main
2. Remove worktree directory and files
3. Delete feature branch (local and remote)
4. Clean up any temporary files or configurations
5. Update worktree registry

## Branch Naming Conventions

### Standard Prefixes
- **feature/**: New functionality or enhancements
- **bugfix/**: Bug fixes and issue resolution
- **refactor/**: Code restructuring without functional changes
- **docs/**: Documentation updates and improvements
- **test/**: Test additions or improvements
- **chore/**: Maintenance tasks and tooling updates

### Naming Guidelines
- Use lowercase with hyphens for separation
- Be descriptive but concise (max 50 characters)
- Include issue number when applicable
- Avoid special characters except hyphens

### Examples
```bash
# Good branch names
feature/user-authentication
bugfix/login-timeout-issue
refactor/payment-processing
docs/api-documentation
test/integration-coverage

# Poor branch names
feature/stuff
fix
my-branch
feature/this-is-a-very-long-branch-name-that-exceeds-reasonable-limits
```

## Directory Structure

### Worktree Organization
```
project-root/
├── .git/                    # Main repository git directory
├── src/                     # Main repository source code
├── package.json             # Main repository configuration
└── ../worktrees/            # Worktree directory (parallel to main)
    ├── feature-user-auth/   # Feature worktree
    ├── bugfix-login-fix/    # Bugfix worktree
    └── refactor-db-layer/   # Refactor worktree
```

### Worktree Contents
Each worktree contains:
- Complete source code checkout
- Independent git working directory
- Separate branch tracking
- Isolated development environment

## Safety Protocols

### Pre-Creation Checks
- Verify main branch is up to date
- Ensure no uncommitted changes in main repository
- Validate branch name follows conventions
- Check available disk space for new worktree

### Development Safeguards
- Regular commits to prevent work loss
- Periodic push to remote for backup
- Automated test execution before commits
- Branch status monitoring and reporting

### Cleanup Safeguards
- Verify branch is merged before deletion
- Confirm no uncommitted changes in worktree
- Backup important files before removal
- Validate cleanup completion

## Cross-Platform Compatibility

### Windows Requirements
- **WSL (Windows Subsystem for Linux)** or **Git Bash** required
- Install WSL: `wsl --install` (requires system restart)
- Or install Git for Windows with Git Bash
- All git worktree commands must be run in WSL or Git Bash environment

### macOS/Linux
- Native bash and git support
- No additional requirements beyond standard git installation

### Path Handling
- Use forward slashes in all documentation
- Handle Windows path conversion automatically in scripts
- Ensure cross-platform compatibility in all automation

## Troubleshooting

### Common Issues

#### Worktree Creation Fails
**Symptoms**: Error creating worktree or branch
**Solutions**:
- Verify git repository is in clean state
- Check branch name doesn't already exist
- Ensure sufficient disk space
- Validate git version supports worktrees (2.20+)

#### Cannot Switch to Worktree
**Symptoms**: Directory not found or git errors
**Solutions**:
- Verify worktree was created successfully
- Check directory path and permissions
- Ensure worktree is registered with git
- Use `git worktree list` to verify status

#### Cleanup Fails
**Symptoms**: Cannot remove worktree or branch
**Solutions**:
- Check for uncommitted changes in worktree
- Verify branch has been merged to main
- Force removal if worktree is corrupted
- Manually clean up files if necessary

### Recovery Procedures

#### Corrupted Worktree
```bash
# Force remove corrupted worktree
git worktree remove --force [worktree-path]

# Clean up references
git worktree prune

# Recreate if needed
./.ai/skills/git-worktree/git-worktree.sh create [branch-name]
```

#### Lost Worktree Reference
```bash
# List all worktrees
git worktree list

# Remove stale references
git worktree prune

# Re-add existing worktree
git worktree add [path] [branch]
```

## Best Practices

### Development Workflow
1. **One Feature Per Worktree**: Keep worktrees focused on single features or fixes
2. **Regular Commits**: Commit frequently to preserve development history
3. **Descriptive Messages**: Use clear, conventional commit messages
4. **Test Before Merge**: Ensure all tests pass before integration

### Repository Management
1. **Clean Main Branch**: Keep main branch stable and deployable
2. **Short-Lived Branches**: Merge feature branches quickly to avoid conflicts
3. **Regular Updates**: Keep feature branches updated with main branch changes
4. **Automated Cleanup**: Use scripts to maintain repository hygiene

### Team Coordination
1. **Naming Consistency**: Follow established branch naming conventions
2. **Communication**: Coordinate on shared components and dependencies
3. **Code Reviews**: Review all changes before merging to main
4. **Documentation**: Update documentation with significant changes

## Integration with EARS-Workflow

### Phase Integration
- **SPEC-FORGE**: Worktrees not typically used (planning in main repository)
- **PLANNING**: May create experimental worktree for architecture exploration
- **WORK**: Primary worktree usage for feature implementation
- **REVIEW**: Code review conducted on worktree branch before merge

### Workflow Automation
- Automated worktree creation during WORK phase activation
- Integration with TDD workflow and testing automation
- Automatic cleanup after successful merge and review
- Memory system integration for lessons learned and best practices

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-29  
**Protocol**: Git Worktree Management