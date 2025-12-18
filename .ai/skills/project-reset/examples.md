# Project Reset Skill Examples

This document provides practical examples and common usage patterns for the Project Reset skill.

## Basic Workflows

### Starting a New Project

**Scenario**: Finished one project, starting completely new development

```bash
# 1. Backup current state
git add .
git commit -m "final: complete previous project"
git branch archive/previous-project

# 2. Perform medium reset (recommended)
./.ai/skills/project-reset/project-reset.sh medium

# 3. Commit clean state
git add .
git commit -m "reset: prepare for new project"

# 4. Begin new development
./.ai/skills/git-worktree/git-worktree.sh create feature/new-project-foundation
```

### Cleaning Up After Milestone

**Scenario**: Major release completed, want to clean docs but keep lessons

```bash
# Light reset - keep all memory, clear project docs
./.ai/skills/project-reset/project-reset.sh light

# Review what was cleared
ls .ai/docs/plans/     # Should only show README.md
ls .ai/docs/tasks/     # Should only show README.md

# Memory preserved
cat .ai/memory/lessons.md    # All lessons still there
cat .ai/memory/decisions.md  # All decisions still there
```

### Technology Stack Migration

**Scenario**: Moving from React to Vue.js, need fresh architectural decisions

```bash
# 1. Archive current decisions
cp .ai/memory/decisions.md .ai/memory/decisions-react-archive.md
git add .ai/memory/decisions-react-archive.md
git commit -m "archive: React-specific architectural decisions"

# 2. Full reset for clean slate
./.ai/skills/project-reset/project-reset.sh full

# 3. Start documenting Vue.js patterns
# ... begin new development with fresh decisions.md ...
```

## Advanced Patterns

### Selective Reset with Custom Mode

**Scenario**: Want to keep some lessons but reset decisions

```bash
# Use custom mode for selective reset
./.ai/skills/project-reset/project-reset.sh custom

# Interactive prompts:
# "Reset memory files to templates? (y/n)": y
# "Clear project documentation? (y/n)": n

# Result: Memory reset, docs preserved
```

### Automated Demo Preparation

**Scenario**: Preparing clean environment for demo or training

```bash
#!/bin/bash
# prepare-demo.sh

echo "Preparing demo environment..."

# 1. Create demo branch
git checkout -b demo/clean-environment

# 2. Full reset for clean slate
./.ai/skills/project-reset/project-reset.sh full --confirm

# 3. Add demo-specific content
echo "# Demo Project" > README.md
echo "This is a clean environment for demonstration." >> README.md

# 4. Commit demo state
git add .
git commit -m "demo: prepare clean environment"

echo "Demo environment ready!"
echo "Switch back with: git checkout main"
```

### Gradual Migration Strategy

**Scenario**: Large project needs gradual cleanup over time

```bash
# Week 1: Clear old documentation
./.ai/skills/project-reset/project-reset.sh light

# Week 2: After reviewing lessons, reset memory
./.ai/skills/project-reset/project-reset.sh custom
# Choose: Reset memory? y, Clear docs? n

# Week 3: Full cleanup if needed
./.ai/skills/project-reset/project-reset.sh full
```

## Integration Examples

### With Git Worktree Workflow

**Scenario**: Reset and immediately start new feature development

```bash
# 1. Reset to clean state
./.ai/skills/project-reset/project-reset.sh medium

# 2. Create worktree for new development
./.ai/skills/git-worktree/git-worktree.sh create feature/fresh-start

# 3. Navigate to clean environment
cd ../worktrees/feature-fresh-start

# 4. Begin development with clean context
echo "Starting fresh development..."
```

### With Compound Engineering Phases

**Scenario**: Following full Compound Engineering workflow after reset

```bash
# Phase I: PLAN (after reset)
./.ai/skills/project-reset/project-reset.sh medium

# Load planning context
cat .ai/workflows/planning.md
cat .ai/roles/architect.md

# Create plan document
echo "# New Project Plan" > .ai/docs/plans/$(date +%Y-%m-%d)-new-project.md

# Phase II: WORK (with worktree)
./.ai/skills/git-worktree/git-worktree.sh create feature/implement-plan
cd ../worktrees/feature-implement-plan

# Phase III: REVIEW (after implementation)
# ... development complete, return to main ...
cd ../../ai-workflow
cat .ai/workflows/review.md
```

## Template Customization Examples

### Creating Project-Specific Templates

**Scenario**: Want custom lesson categories for specific project type

```bash
# 1. Create custom template
cp .ai/templates/lessons.template.md .ai/templates/lessons-web-app.template.md

# 2. Customize for web application development
cat >> .ai/templates/lessons-web-app.template.md << 'EOF'

## Frontend Development
- When building React components, always ensure proper prop validation to prevent runtime errors.

## Backend API Design  
- When designing REST endpoints, always follow RESTful conventions for consistency.

## Database Design
- When creating database schemas, always add proper indexes for query performance.
EOF

# 3. Use custom template (requires manual copy for now)
# Future enhancement: support custom template selection
```

### Environment-Specific Resets

**Scenario**: Different reset levels for different environments

```bash
# Development environment - keep more context
dev-reset() {
    ./.ai/skills/project-reset/project-reset.sh light
    echo "Development reset complete - lessons preserved"
}

# Staging environment - medium reset
staging-reset() {
    ./.ai/skills/project-reset/project-reset.sh medium
    echo "Staging reset complete - ready for testing"
}

# Production demo - full reset
demo-reset() {
    ./.ai/skills/project-reset/project-reset.sh full --confirm
    echo "Demo environment ready - completely clean"
}
```

## Error Recovery Examples

### Recovering from Accidental Full Reset

**Scenario**: Accidentally ran full reset, need to recover important lessons

```bash
# 1. Check if backup branch exists
git branch | grep backup

# 2. Restore from backup
git checkout backup/2025-12-18 -- .ai/memory/lessons.md
git checkout backup/2025-12-18 -- .ai/memory/decisions.md

# 3. Commit recovery
git add .ai/memory/
git commit -m "recover: restore memory files from backup"

# 4. Review recovered content
cat .ai/memory/lessons.md
```

### Handling Template Corruption

**Scenario**: Template files are corrupted or missing

```bash
# 1. Check template status
ls -la .ai/templates/

# 2. Restore from git history
git log --oneline -- .ai/templates/lessons.template.md
git checkout HEAD~5 -- .ai/templates/lessons.template.md

# 3. Verify template content
cat .ai/templates/lessons.template.md

# 4. Retry reset
./.ai/skills/project-reset/project-reset.sh medium
```

### Partial Reset Failure Recovery

**Scenario**: Reset process interrupted, left in inconsistent state

```bash
# 1. Check current state
git status
ls .ai/docs/plans/
cat .ai/memory/lessons.md

# 2. Complete the reset manually if needed
rm .ai/docs/plans/*.md 2>/dev/null || true
rm .ai/docs/tasks/*.md 2>/dev/null || true

# 3. Restore memory files if corrupted
if [ ! -s .ai/memory/lessons.md ]; then
    cp .ai/templates/lessons.template.md .ai/memory/lessons.md
    sed -i "s/\[DATE\]/$(date +%Y-%m-%d)/g" .ai/memory/lessons.md
fi

# 4. Commit corrected state
git add .
git commit -m "fix: complete interrupted reset process"
```

## Automation Examples

### Scheduled Cleanup

**Scenario**: Automated weekly cleanup of documentation

```bash
#!/bin/bash
# weekly-cleanup.sh

# Run every Friday to clean up documentation
if [ "$(date +%u)" -eq 5 ]; then
    echo "Weekly cleanup: clearing project documentation"
    ./.ai/skills/project-reset/project-reset.sh light --confirm
    
    git add .
    git commit -m "chore: weekly documentation cleanup"
    
    echo "Weekly cleanup complete"
fi
```

### CI/CD Integration

**Example GitHub Actions for branch-specific resets:**

```yaml
name: Environment Reset
on:
  push:
    branches: [ 'reset/*' ]

jobs:
  reset:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Determine reset level
      id: reset_level
      run: |
        BRANCH_NAME=${GITHUB_REF#refs/heads/}
        if [[ $BRANCH_NAME == "reset/light" ]]; then
          echo "level=light" >> $GITHUB_OUTPUT
        elif [[ $BRANCH_NAME == "reset/medium" ]]; then
          echo "level=medium" >> $GITHUB_OUTPUT
        elif [[ $BRANCH_NAME == "reset/full" ]]; then
          echo "level=full" >> $GITHUB_OUTPUT
        else
          echo "level=medium" >> $GITHUB_OUTPUT
        fi
    
    - name: Perform reset
      run: |
        ./.ai/skills/project-reset/project-reset.sh ${{ steps.reset_level.outputs.level }} --confirm
        
    - name: Commit reset
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add .
        git commit -m "reset: automated ${{ steps.reset_level.outputs.level }} reset"
        git push
```

### Docker Environment Reset

**Scenario**: Reset within Docker container for consistent environments

```dockerfile
# Dockerfile.reset
FROM node:18-alpine

WORKDIR /app
COPY . .

# Install dependencies
RUN npm install

# Make reset script executable
RUN chmod +x ./.ai/skills/project-reset/project-reset.sh

# Default command performs medium reset
CMD ["./.ai/skills/project-reset/project-reset.sh", "medium", "--confirm"]
```

```bash
# Use Docker for consistent reset environment
docker build -f Dockerfile.reset -t project-reset .
docker run --rm -v $(pwd):/app project-reset
```

## Testing Examples

### Validating Reset Behavior

**Scenario**: Testing that reset works correctly

```bash
#!/bin/bash
# test-reset.sh

echo "Testing project reset functionality..."

# 1. Create test content
mkdir -p .ai/docs/plans
echo "# Test Plan" > .ai/docs/plans/test-plan.md
echo "# Test Lesson" >> .ai/memory/lessons.md

# 2. Test light reset
./.ai/skills/project-reset/project-reset.sh light --confirm

# 3. Verify results
if [ ! -f .ai/docs/plans/test-plan.md ]; then
    echo "✅ Light reset: Documentation cleared"
else
    echo "❌ Light reset: Documentation not cleared"
fi

if grep -q "Test Lesson" .ai/memory/lessons.md; then
    echo "✅ Light reset: Memory preserved"
else
    echo "❌ Light reset: Memory not preserved"
fi

echo "Reset testing complete"
```

### Performance Testing

**Scenario**: Testing reset performance on large projects

```bash
#!/bin/bash
# performance-test.sh

# Create large number of test files
for i in {1..100}; do
    echo "# Plan $i" > .ai/docs/plans/plan-$i.md
    echo "# Task $i" > .ai/docs/tasks/task-$i.md
done

# Time the reset operation
echo "Testing reset performance with 200 files..."
time ./.ai/skills/project-reset/project-reset.sh light --confirm

# Verify all files cleared
remaining=$(find .ai/docs -name "*.md" ! -name "README.md" | wc -l)
echo "Files remaining after reset: $remaining"
```

## Best Practices Examples

### Pre-Reset Checklist Script

```bash
#!/bin/bash
# pre-reset-checklist.sh

echo "Pre-Reset Checklist"
echo "==================="

# 1. Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Uncommitted changes detected"
    echo "   Run: git add . && git commit -m 'checkpoint: before reset'"
    exit 1
else
    echo "✅ No uncommitted changes"
fi

# 2. Check for important files
important_files=(.ai/docs/plans/*.md .ai/docs/tasks/*.md)
if ls ${important_files[@]} 1> /dev/null 2>&1; then
    echo "⚠️  Important documentation files found:"
    ls ${important_files[@]} 2>/dev/null | head -5
    echo "   Consider backing up important content"
else
    echo "✅ No critical documentation to preserve"
fi

# 3. Verify templates exist
if [ -f .ai/templates/lessons.template.md ] && [ -f .ai/templates/decisions.template.md ]; then
    echo "✅ Template files present"
else
    echo "❌ Template files missing - reset will fail"
    exit 1
fi

# 4. Create automatic backup
backup_branch="backup/$(date +%Y-%m-%d-%H%M%S)"
git branch "$backup_branch"
echo "✅ Backup branch created: $backup_branch"

echo ""
echo "Pre-reset checklist complete!"
echo "Safe to proceed with reset."
```

### Post-Reset Validation

```bash
#!/bin/bash
# post-reset-validation.sh

echo "Post-Reset Validation"
echo "===================="

# 1. Verify memory files reset correctly
if grep -q "\[DATE\]" .ai/memory/lessons.md; then
    echo "❌ Template placeholders not replaced in lessons.md"
else
    echo "✅ lessons.md properly reset"
fi

if grep -q "\[DATE\]" .ai/memory/decisions.md; then
    echo "❌ Template placeholders not replaced in decisions.md"
else
    echo "✅ decisions.md properly reset"
fi

# 2. Verify documentation cleared
doc_files=$(find .ai/docs -name "*.md" ! -name "README.md" ! -name "*.template.md" | wc -l)
if [ "$doc_files" -eq 0 ]; then
    echo "✅ Documentation properly cleared"
else
    echo "⚠️  $doc_files documentation files remain"
fi

# 3. Verify preserved files intact
preserved_dirs=(".ai/protocols" ".ai/workflows" ".ai/roles" ".ai/skills")
for dir in "${preserved_dirs[@]}"; do
    if [ -d "$dir" ] && [ "$(ls -A $dir)" ]; then
        echo "✅ $dir preserved"
    else
        echo "❌ $dir missing or empty"
    fi
done

echo ""
echo "Post-reset validation complete!"
```

---

**Last Updated:** 2025-12-18  
**Examples Count:** 20+ scenarios covered  
**Integration Points:** Git, CI/CD, Docker, Testing