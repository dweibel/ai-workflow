# Git Worktree Protocol

> **Attribution**: This protocol implements concepts from the [Compound Engineering Plugin](https://github.com/EveryInc/compound-engineering-plugin) by EveryInc.

## Overview

Git worktrees enable parallel development by creating multiple working directories from a single repository. This protocol ensures safe, isolated development environments for feature work while maintaining a clean main branch.

## Core Principles

1. **Isolation**: Each feature gets its own working directory
2. **Safety**: Main branch remains untouched during development
3. **Efficiency**: Share git history while maintaining separate working states
4. **Cleanliness**: Automatic cleanup prevents repository bloat

## Workflow Integration

### Phase I: PLAN
- Worktrees are **not** created during planning phase
- Planning happens in the main repository
- Plans are committed to main branch before implementation

### Phase II: WORK
- **Always** create a dedicated worktree for implementation
- Use the provided helper scripts for consistent setup
- Work exclusively in the worktree directory
- Commit frequently with atomic changes

### Phase III: REVIEW
- Review can happen in either main repo or worktree
- Merge back to main only after review approval
- Clean up worktree after successful merge

## Primary Method: Helper Scripts

**ALWAYS use the provided helper scripts** - they implement best practices, validation, and error handling automatically.

### Cross-Platform (Bash) - Primary Commands
**Note**: On Windows, use WSL (Windows Subsystem for Linux) or Git Bash to run these commands.
```bash
# Create a new worktree (MOST COMMON)
./.ai/skills/git-worktree/git-worktree.sh create feature/user-auth

# Check current working environment (BEFORE CODING)
./.ai/skills/git-worktree/git-worktree.sh status

# List all active worktrees
./.ai/skills/git-worktree/git-worktree.sh list

# Remove a worktree after feature completion
./.ai/skills/git-worktree/git-worktree.sh remove feature/user-auth

# Cleanup stale worktrees (MAINTENANCE)
./.ai/skills/git-worktree/git-worktree.sh cleanup
```

**Script Benefits**:
- ✅ Automatic branch name validation (feature/, bugfix/, etc.)
- ✅ Consistent directory structure in `../worktrees/`
- ✅ Colored output for better UX
- ✅ Safety checks and error handling
- ✅ Cleanup confirmation prompts

## Directory Structure

```
project-root/
├── .git/                    # Main git directory
├── src/                     # Main working directory
├── .ai/scripts/             # Helper scripts
└── ../worktrees/           # Worktrees directory (outside main repo)
    ├── feature-user-auth/   # Feature worktree
    ├── bugfix-login-issue/  # Bugfix worktree
    └── refactor-api/        # Refactor worktree
```

## Branch Naming Conventions

Use descriptive, hierarchical branch names:

- `feature/user-authentication`
- `bugfix/login-validation`
- `refactor/api-endpoints`
- `docs/installation-guide`
- `test/integration-suite`

## Manual Commands (Use Only When Scripts Unavailable)

**WARNING**: Manual commands bypass validation and safety checks. Use helper scripts instead.

### Manual Worktree Operations
```bash
# Create worktree with new branch
git worktree add -b feature/new-feature ../worktrees/feature-new-feature main

# Create worktree for existing branch
git worktree add ../worktrees/existing-feature existing-feature

# List all worktrees
git worktree list

# Remove worktree
git worktree remove ../worktrees/feature-name

# Prune stale worktree references
git worktree prune
```

**Script Equivalents (PREFERRED)**:
```bash
# All platforms (use WSL or Git Bash on Windows)
./.ai/skills/git-worktree/git-worktree.sh create feature/new-feature
./.ai/skills/git-worktree/git-worktree.sh list
./.ai/skills/git-worktree/git-worktree.sh remove feature/new-feature
./.ai/skills/git-worktree/git-worktree.sh cleanup
```

### Navigation
```bash
# Switch to worktree
cd ../worktrees/feature-name

# Return to main repository
cd - # or navigate back to main repo path
```

## Safety Checks

### Before Creating Worktree
- [ ] Ensure you're in the repository root
- [ ] Verify the base branch exists and is up to date
- [ ] Check that the branch name doesn't already exist (unless intentional)

### During Development
- [ ] Work only in the worktree directory
- [ ] Commit changes regularly with descriptive messages
- [ ] Keep the worktree focused on a single feature/fix

### After Development
- [ ] Run full test suite in worktree
- [ ] Create pull request from feature branch
- [ ] Remove worktree after successful merge
- [ ] Delete feature branch if no longer needed

## Troubleshooting

### Worktree Creation Fails
```bash
# Check if branch already exists
git branch --list branch-name

# Check if worktree path already exists
ls ../worktrees/

# Ensure base branch is up to date
git fetch origin
git checkout main
git pull origin main
```

### Stale Worktree References
```bash
# Clean up stale references
git worktree prune -v

# Force remove if directory was manually deleted
git worktree remove --force path/to/worktree
```

### Permission Issues
```bash
# On Unix systems, ensure scripts are executable
chmod +x .ai/scripts/git-worktree.sh

# On Windows, ensure PowerShell execution policy allows scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Best Practices

### Naming
- Use lowercase with hyphens for branch names
- Include type prefix (feature/, bugfix/, etc.)
- Keep names descriptive but concise

### Lifecycle Management
- Create worktree only when ready to implement
- Remove worktree promptly after merge
- Use cleanup command regularly to maintain hygiene

### Integration with IDE
- Configure your IDE to recognize worktree directories
- Set up consistent tooling across all worktrees
- Use relative paths in configuration when possible

## Anti-Patterns

❌ **Don't** create worktrees for planning or documentation work
❌ **Don't** leave stale worktrees around after feature completion
❌ **Don't** work directly on main branch for feature development
❌ **Don't** create deeply nested worktree directory structures
❌ **Don't** share worktree directories between different features

## Integration with EARS Workflow

This protocol supports the EARS workflow philosophy by:

1. **Reducing Friction**: Automated scripts eliminate manual setup overhead
2. **Preventing Errors**: Isolation prevents accidental changes to main branch
3. **Enabling Parallelism**: Multiple features can be developed simultaneously
4. **Maintaining Quality**: Each worktree can have its own test environment

## Version History

- **v1.0.0** (2025-12-19): Initial protocol with Bash scripts (cross-platform via WSL/Git Bash)