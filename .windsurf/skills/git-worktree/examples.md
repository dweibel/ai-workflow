# Git Worktree Skill Examples

This document provides practical examples and common usage patterns for the Git Worktree skill.

## Basic Workflows

### Feature Development Workflow

**Scenario**: Developing a new user authentication feature

```bash
# 1. Check current status
./.ai/skills/git-worktree/git-worktree.sh status

# 2. Create isolated environment
./.ai/skills/git-worktree/git-worktree.sh create feature/user-authentication

# 3. Navigate to worktree
cd ../worktrees/feature-user-authentication

# 4. Develop the feature
# ... make changes, commit, test ...

# 5. When complete, return to main repo
cd ../../ai-workflow

# 6. Clean up worktree
./.ai/skills/git-worktree/git-worktree.sh remove feature/user-authentication
```

### Hotfix Workflow

**Scenario**: Critical bug needs immediate fix on production

```bash
# Create hotfix from main branch
./.ai/skills/git-worktree/git-worktree.sh create hotfix/critical-login-bug main

# Navigate and fix
cd ../worktrees/hotfix-critical-login-bug

# Make minimal changes, test thoroughly
# ... fix, commit, test ...

# Return and clean up
cd ../../ai-workflow
./.ai/skills/git-worktree/git-worktree.sh remove hotfix/critical-login-bug
```

### Parallel Development

**Scenario**: Working on multiple features simultaneously

```bash
# Create multiple worktrees
./.ai/skills/git-worktree/git-worktree.sh create feature/user-dashboard
./.ai/skills/git-worktree/git-worktree.sh create feature/payment-integration
./.ai/skills/git-worktree/git-worktree.sh create bugfix/email-validation

# Check all active worktrees
./.ai/skills/git-worktree/git-worktree.sh list

# Switch between them as needed
cd ../worktrees/feature-user-dashboard
# ... work on dashboard ...

cd ../feature-payment-integration
# ... work on payments ...

cd ../bugfix-email-validation
# ... fix email bug ...
```

## Advanced Patterns

### Custom Base Branches

**Scenario**: Feature branch from develop, hotfix from main

```bash
# Feature from develop branch
./.ai/skills/git-worktree/git-worktree.sh create feature/new-ui develop

# Hotfix from main branch
./.ai/skills/git-worktree/git-worktree.sh create hotfix/security-patch main

# Experimental branch from feature branch
./.ai/skills/git-worktree/git-worktree.sh create experiment/ui-redesign feature/new-ui
```

### Custom Worktree Locations

**Scenario**: Organizing worktrees by project area

```bash
# Frontend features in specific directory
./.ai/skills/git-worktree/git-worktree.sh create feature/frontend-redesign main /projects/frontend/redesign

# Backend features in another directory
./.ai/skills/git-worktree/git-worktree.sh create feature/api-v2 main /projects/backend/api-v2

# Documentation in docs directory
./.ai/skills/git-worktree/git-worktree.sh create docs/user-guide main /projects/docs/user-guide
```

## Integration with EARS Workflow

### Phase II (WORK) Integration

**Following AGENTS.md workflow:**

```bash
# 1. Load core memory (done by agent)
# 2. Understand the request (planning phase complete)
# 3. Load appropriate context (execution workflow)

# 4. Create worktree for implementation
./.ai/skills/git-worktree/git-worktree.sh create feature/implement-user-stories

# 5. Navigate to isolated environment
cd ../worktrees/feature-implement-user-stories

# 6. Follow TDD workflow
# Red: Write failing test
# Green: Make test pass
# Refactor: Improve code

# 7. Make atomic commits
git add .
git commit -m "feat: add user authentication endpoint"

# 8. Continue development cycle
# ... more TDD cycles ...

# 9. When feature complete, return to main
cd ../../ai-workflow

# 10. Clean up worktree
./.ai/skills/git-worktree/git-worktree.sh remove feature/implement-user-stories
```

### Project Reset Integration

**Scenario**: Starting fresh development after project reset

```bash
# 1. Reset project to clean state
./.ai/skills/project-reset/project-reset.sh medium

# 2. Create worktree for new development
./.ai/skills/git-worktree/git-worktree.sh create feature/fresh-start

# 3. Begin development in clean environment
cd ../worktrees/feature-fresh-start
```

## Common Scenarios

### Reviewing Someone Else's Branch

**Scenario**: Need to review a colleague's work without affecting your current work

```bash
# Create worktree for existing remote branch
git fetch origin
./.ai/skills/git-worktree/git-worktree.sh create review/colleague-feature

# In the worktree, checkout the remote branch
cd ../worktrees/review-colleague-feature
git checkout -b review/colleague-feature origin/feature/colleague-work

# Review, test, provide feedback
# ... review code, run tests ...

# Clean up when done
cd ../../ai-workflow
./.ai/skills/git-worktree/git-worktree.sh remove review/colleague-feature
```

### Emergency Context Switching

**Scenario**: Working on feature when urgent bug report comes in

```bash
# Currently in feature worktree
pwd  # /path/to/worktrees/feature-user-dashboard

# Quickly create hotfix environment
cd ../../ai-workflow
./.ai/skills/git-worktree/git-worktree.sh create hotfix/urgent-bug

# Switch to hotfix
cd ../worktrees/hotfix-urgent-bug

# Fix the bug
# ... make fix, test, commit ...

# Return to feature work
cd ../feature-user-dashboard

# Continue where you left off
```

### Long-Running Feature Branches

**Scenario**: Feature takes weeks to develop, need to keep up with main

```bash
# Create feature worktree
./.ai/skills/git-worktree/git-worktree.sh create feature/complex-feature

cd ../worktrees/feature-complex-feature

# Periodically sync with main
git fetch origin
git rebase origin/main

# Continue development
# ... ongoing work ...

# When ready to merge
git push origin feature/complex-feature

# Clean up
cd ../../ai-workflow
./.ai/skills/git-worktree/git-worktree.sh remove feature/complex-feature
```

## Troubleshooting Examples

### Recovering from Mistakes

**Scenario**: Accidentally deleted worktree directory

```bash
# List worktrees to see the problem
./.ai/skills/git-worktree/git-worktree.sh list
# Shows: worktree /path/to/missing/directory (missing)

# Clean up the reference
./.ai/skills/git-worktree/git-worktree.sh cleanup

# Recreate if needed
./.ai/skills/git-worktree/git-worktree.sh create feature/recreated-branch
```

**Scenario**: Worktree exists but branch was deleted

```bash
# Remove the orphaned worktree
git worktree remove /path/to/orphaned/worktree --force

# Clean up references
./.ai/skills/git-worktree/git-worktree.sh cleanup
```

### Handling Conflicts

**Scenario**: Branch name conflicts with existing branch

```bash
# Attempt to create fails
./.ai/skills/git-worktree/git-worktree.sh create feature/existing-name
# Prompts: "Branch 'feature/existing-name' already exists"
# Choose: y (create worktree for existing branch) or n (cancel)

# Alternative: Use different name
./.ai/skills/git-worktree/git-worktree.sh create feature/existing-name-v2
```

## Performance Tips

### Efficient Worktree Management

**Keep worktrees organized:**
```bash
# Regular cleanup of stale references
./.ai/skills/git-worktree/git-worktree.sh cleanup

# List active worktrees periodically
./.ai/skills/git-worktree/git-worktree.sh list

# Remove completed worktrees promptly
./.ai/skills/git-worktree/git-worktree.sh remove feature/completed-feature
```

**Minimize disk usage:**
```bash
# Remove worktree and branch together
./.ai/skills/git-worktree/git-worktree.sh remove feature/old-feature
# When prompted, choose 'y' to delete the branch too
```

## Integration with IDEs

### VS Code Integration

**Scenario**: Opening worktrees in VS Code

```bash
# Create worktree
./.ai/skills/git-worktree/git-worktree.sh create feature/vscode-work

# Open in VS Code
cd ../worktrees/feature-vscode-work
code .

# VS Code will recognize it as part of the same repository
# Git integration works seamlessly
```

### JetBrains IDEs

**Scenario**: IntelliJ/WebStorm with worktrees

```bash
# Create worktree
./.ai/skills/git-worktree/git-worktree.sh create feature/jetbrains-work

# Open project in IDE
cd ../worktrees/feature-jetbrains-work
# File -> Open -> Select this directory

# IDE will detect Git repository and provide full Git integration
```

## Automation Examples

### Scripted Workflows

**Create a custom workflow script:**

```bash
#!/bin/bash
# custom-feature-workflow.sh

FEATURE_NAME="$1"
if [ -z "$FEATURE_NAME" ]; then
    echo "Usage: $0 <feature-name>"
    exit 1
fi

# Create worktree
./.ai/skills/git-worktree/git-worktree.sh create "feature/$FEATURE_NAME"

# Navigate to worktree
cd "../worktrees/feature-$FEATURE_NAME"

# Create initial commit
echo "# $FEATURE_NAME" > README.md
git add README.md
git commit -m "feat: initialize $FEATURE_NAME feature"

# Open in editor
code .

echo "Feature environment ready for $FEATURE_NAME"
```

### CI/CD Integration

**Example GitHub Actions workflow:**

```yaml
name: Test Feature Branches
on:
  push:
    branches: [ 'feature/*' ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    # Test in isolated environment similar to worktree
    - name: Run tests
      run: |
        # Tests run in isolated checkout
        npm test
        
    - name: Build
      run: |
        npm run build
```

---

**Last Updated:** 2025-12-18  
**Examples Count:** 15+ scenarios covered  
**Integration Points:** EARS Workflow, IDEs, CI/CD