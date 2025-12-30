# Git Worktree Management Skill

> **Attribution**: Based on the [Compound Engineering Plugin](https://github.com/EveryInc/compound-engineering-plugin) by EveryInc

This skill provides comprehensive Git worktree management for the EARS workflow, enabling isolated development environments with proper branch management.

## Overview

Git worktrees allow you to have multiple working directories from a single repository, enabling parallel development without the complexity of multiple clones or constant branch switching.

## Capabilities

| Action | Description | Safety Features |
|--------|-------------|-----------------|
| **create** | Set up isolated development environments | Branch name validation, path conflict detection |
| **list** | Display all active worktrees with details | Colored output, branch and commit info |
| **remove** | Clean up worktrees and branches | Confirmation prompts, optional branch deletion |
| **cleanup** | Prune stale worktree references | Automatic cleanup of orphaned references |
| **status** | Show current working environment | Location awareness, worktree detection |

## Platform Support

- **All Platforms**: Bash script (`git-worktree.sh`)
- **Windows**: Use WSL (Windows Subsystem for Linux) for bash execution
- **Unix/Linux/macOS**: Native bash execution

Consistent bash implementation across all platforms.

## Usage

### All Platforms (Bash)

```bash
# Create a new worktree
./.ai/skills/git-worktree/git-worktree.sh create feature/user-auth

# Create with custom base branch
./.ai/skills/git-worktree/git-worktree.sh create hotfix/critical-bug main

# List all worktrees
./.ai/skills/git-worktree/git-worktree.sh list

# Check current status
./.ai/skills/git-worktree/git-worktree.sh status

# Remove a worktree
./.ai/skills/git-worktree/git-worktree.sh remove feature/user-auth

# Cleanup stale references
./.ai/skills/git-worktree/git-worktree.sh cleanup
```

### Windows Users (PowerShell to WSL)

If you're in PowerShell, drop into WSL to execute the bash script:

```powershell
# Enter WSL from PowerShell
wsl

# Then run the bash script
./.ai/skills/git-worktree/git-worktree.sh create feature/user-auth
```

## Parameters

| Position | Required | Default | Description |
|----------|----------|---------|-------------|
| 1 | Yes | - | Action: create, list, remove, cleanup, status |
| 2 | For create/remove | - | Branch name |
| 3 | No | "main" | Base branch (for create) |
| 4 | No | `../worktrees/{branch-name}` | Custom worktree path (for create) |

## Directory Structure

Worktrees are created in a parallel directory structure:

```
project-root/
├── .git/
├── src/
└── ...

../worktrees/
├── feature-user-auth/      # Worktree for feature/user-auth
├── hotfix-critical-bug/    # Worktree for hotfix/critical-bug
└── ...
```

## Branch Naming Conventions

The skill validates branch names and supports common conventions:

**Supported Patterns:**
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Critical fixes
- `refactor/description` - Code refactoring
- `docs/description` - Documentation updates
- `test/description` - Test improvements

**Validation Rules:**
- Only letters, numbers, hyphens, underscores, and forward slashes
- No spaces or special characters
- Must not be empty

## Integration Points

### EARS Workflow Integration

**Phase II (WORK) Integration:**
- Required for all feature development per AGENTS.md Section 2.2
- Enforced by `.ai/workflows/execution.md`
- Referenced in `.ai/protocols/git-worktree.md`

**Safety Features:**
- Prevents accidental changes to main branch
- Enables parallel development of multiple features
- Provides consistent directory structure
- Includes validation and safety checks

### Memory Integration

The skill learns from usage patterns documented in:
- `.ai/memory/lessons.md` - Common pitfalls and solutions
- `.ai/memory/decisions.md` - Architectural patterns for worktree usage

## Error Handling

### Common Scenarios

**Branch Already Exists:**
- Prompts user for confirmation
- Offers to create worktree for existing branch
- Graceful cancellation option

**Path Conflicts:**
- Detects existing directories
- Provides clear error messages
- Suggests alternative paths

**Git Repository Issues:**
- Validates git repository presence
- Checks for uncommitted changes
- Handles network connectivity issues

### Recovery Procedures

**Stale Worktrees:**
```bash
# Automatic cleanup
./.ai/skills/git-worktree/git-worktree.sh cleanup

# Manual cleanup if needed
git worktree prune -v
```

**Orphaned Branches:**
```bash
# List all branches
git branch -a

# Remove orphaned branches
git branch -D branch-name
```

## Output Examples

### List Output
```
ℹ Current worktrees:
  📁 /path/to/project
     🌿 refs/heads/main
     📝 abc12345

  📁 /path/to/worktrees/feature-user-auth
     🌿 refs/heads/feature/user-auth
     📝 def67890
```

### Status Output
```
ℹ Worktree Status Report
=====================
Current Location: /path/to/worktrees/feature-user-auth
Repository Root:  /path/to/project
Current Branch:   feature/user-auth
Worktree:         Yes (in /path/to/worktrees/feature-user-auth)
```

## Best Practices

### Development Workflow

1. **Start with Status**: Always check current environment
   ```bash
   ./.ai/skills/git-worktree/git-worktree.sh status
   ```

2. **Create Isolated Environment**: Use descriptive branch names
   ```bash
   ./.ai/skills/git-worktree/git-worktree.sh create feature/user-authentication
   ```

3. **Navigate to Worktree**: Change to the worktree directory
   ```bash
   cd ../worktrees/feature-user-authentication
   ```

4. **Clean Up After Completion**: Remove worktree and optionally the branch
   ```bash
   ./.ai/skills/git-worktree/git-worktree.sh remove feature/user-authentication
   ```

### Naming Conventions

**Good Branch Names:**
- `feature/user-authentication`
- `bugfix/login-validation`
- `refactor/database-layer`
- `docs/api-documentation`

**Avoid:**
- `temp` or `test` (not descriptive)
- `feature-1` (not meaningful)
- `my-changes` (not specific)

## Troubleshooting

### Permission Issues

**All Platforms:**
```bash
# Make script executable
chmod +x ./.ai/skills/git-worktree/git-worktree.sh
```

**Windows (PowerShell Users):**
```powershell
# Drop into WSL for bash execution
wsl

# Then run the script in WSL
./.ai/skills/git-worktree/git-worktree.sh create feature/branch-name
```

### Common Errors

**"Not in a git repository":**
- Ensure you're running from the repository root
- Check that `.git` directory exists

**"Branch name is required":**
- Provide branch name for create/remove actions
- Use descriptive, valid branch names

**"Worktree already exists":**
- Choose a different branch name
- Remove existing worktree first

## Advanced Usage

### Custom Worktree Paths

```bash
# Create worktree in custom location
./.ai/skills/git-worktree/git-worktree.sh create feature/special /custom/path/feature-special
```

### Multiple Base Branches

```bash
# Create feature branch from develop
./.ai/skills/git-worktree/git-worktree.sh create feature/new-ui develop

# Create hotfix from main
./.ai/skills/git-worktree/git-worktree.sh create hotfix/critical-bug main
```

## Related Skills

- **[project-reset](../project-reset/)**: Clean project state for new development
- **test-runner** (planned): Run tests in isolated environments
- **deployment** (planned): Deploy from specific worktrees

---

**Version:** 1.0.0  
**Last Updated:** 2025-12-18  
**Platforms:** All (Bash via WSL on Windows)  
**Dependencies:** Git 2.5+, WSL on Windows