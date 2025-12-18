# [Skill Name] Examples

This document provides practical examples and common usage patterns for the [Skill Name] skill.

## Basic Workflows

### [Common Scenario 1]

**Scenario**: [Description of when and why you'd use this]

```bash
# 1. [Step description]
./.ai/skills/skill-name/skill-name.sh action1 "parameter-value"

# 2. [Step description]
./.ai/skills/skill-name/skill-name.sh action2

# 3. [Step description]
# ... additional steps ...
```

### [Common Scenario 2]

**Scenario**: [Description of another common use case]

```bash
# [Step-by-step workflow]
./.ai/skills/skill-name/skill-name.sh action3 --confirm

# [Expected outcome]
# ... results ...
```

## Advanced Patterns

### [Advanced Scenario 1]

**Scenario**: [Description of more complex usage]

```bash
# [Advanced workflow steps]
./.ai/skills/skill-name/skill-name.sh action1 "complex-parameter"

# [Integration with other tools]
./.ai/skills/other-skill/other-skill.sh related-action

# [Completion steps]
./.ai/skills/skill-name/skill-name.sh action2
```

### [Advanced Scenario 2]

**Scenario**: [Another advanced use case]

```bash
# [Multi-step advanced process]
# ... commands and explanations ...
```

## Integration with Compound Engineering

### Phase I (PLAN) Integration

**Following AGENTS.md workflow:**

```bash
# 1. Load core memory (done by agent)
# 2. Understand the request (planning phase complete)
# 3. Load appropriate context (planning workflow)

# 4. Use skill in planning context
./.ai/skills/skill-name/skill-name.sh planning-action

# 5. Document results
echo "# Planning Results" > .ai/docs/plans/$(date +%Y-%m-%d)-skill-usage.md
```

### Phase II (WORK) Integration

**Integration with git-worktree workflow:**

```bash
# 1. Create worktree for implementation
./.ai/skills/git-worktree/git-worktree.sh create feature/skill-integration

# 2. Navigate to worktree
cd ../worktrees/feature-skill-integration

# 3. Use skill in implementation context
./.ai/skills/skill-name/skill-name.sh implementation-action

# 4. Continue development cycle
# ... TDD workflow ...
```

### Phase III (REVIEW) Integration

**Integration with review workflow:**

```bash
# 1. Use skill for review preparation
./.ai/skills/skill-name/skill-name.sh review-action

# 2. Generate review artifacts
# ... review process ...

# 3. Document findings
echo "# Review Results" > .ai/docs/reviews/$(date +%Y-%m-%d)-skill-review.md
```

## Common Scenarios

### [Scenario Category 1]

#### [Specific Scenario A]

**Scenario**: [Detailed description]

```bash
# [Step-by-step solution]
./.ai/skills/skill-name/skill-name.sh specific-action "parameter"

# [Expected results]
# ... output description ...
```

#### [Specific Scenario B]

**Scenario**: [Another specific case]

```bash
# [Solution steps]
# ... commands ...
```

### [Scenario Category 2]

#### [Emergency Scenario]

**Scenario**: [Description of urgent/emergency usage]

```bash
# [Quick resolution steps]
./.ai/skills/skill-name/skill-name.sh emergency-action --confirm

# [Verification steps]
# ... validation commands ...
```

## Integration with Other Skills

### With Git Worktree Skill

**Scenario**: [How these skills work together]

```bash
# 1. Create isolated environment
./.ai/skills/git-worktree/git-worktree.sh create feature/skill-integration

# 2. Use this skill in the worktree
cd ../worktrees/feature-skill-integration
./.ai/skills/skill-name/skill-name.sh worktree-action

# 3. Complete and clean up
cd ../../ai-workflow
./.ai/skills/git-worktree/git-worktree.sh remove feature/skill-integration
```

### With Project Reset Skill

**Scenario**: [Integration with project reset]

```bash
# 1. Reset project to clean state
./.ai/skills/project-reset/project-reset.sh medium

# 2. Use skill in clean environment
./.ai/skills/skill-name/skill-name.sh fresh-start-action

# 3. Begin new development
# ... continue workflow ...
```

## Troubleshooting Examples

### Recovering from Common Errors

#### [Error Scenario 1]

**Problem**: [Description of the error]

**Solution**:
```bash
# 1. [Diagnostic step]
./.ai/skills/skill-name/skill-name.sh diagnostic-action

# 2. [Recovery step]
./.ai/skills/skill-name/skill-name.sh recovery-action

# 3. [Verification]
./.ai/skills/skill-name/skill-name.sh verify-action
```

#### [Error Scenario 2]

**Problem**: [Another common error]

**Solution**:
```bash
# [Recovery steps]
# ... commands ...
```

### Handling Edge Cases

#### [Edge Case 1]

**Scenario**: [Description of unusual situation]

```bash
# [Special handling steps]
./.ai/skills/skill-name/skill-name.sh edge-case-action "special-parameter"

# [Additional considerations]
# ... notes about edge case handling ...
```

## Performance and Optimization

### Efficient Usage Patterns

**Batch Operations:**
```bash
# [Description of batch processing]
for item in item1 item2 item3; do
    ./.ai/skills/skill-name/skill-name.sh batch-action "$item"
done
```

**Parallel Processing:**
```bash
# [Description of parallel usage]
./.ai/skills/skill-name/skill-name.sh parallel-action1 &
./.ai/skills/skill-name/skill-name.sh parallel-action2 &
wait
```

### Resource Management

**Memory Considerations:**
```bash
# [Tips for memory-efficient usage]
./.ai/skills/skill-name/skill-name.sh memory-efficient-action
```

**Disk Space Management:**
```bash
# [Tips for disk space management]
./.ai/skills/skill-name/skill-name.sh cleanup-action
```

## Automation Examples

### Scripted Workflows

**Custom Workflow Script:**
```bash
#!/bin/bash
# custom-skill-workflow.sh

PARAMETER="$1"
if [ -z "$PARAMETER" ]; then
    echo "Usage: $0 <parameter>"
    exit 1
fi

# [Automated workflow using the skill]
./.ai/skills/skill-name/skill-name.sh automated-action "$PARAMETER"

# [Additional automation steps]
# ... more commands ...

echo "Automated workflow completed for $PARAMETER"
```

### CI/CD Integration

**Example GitHub Actions:**
```yaml
name: Skill Integration
on:
  push:
    branches: [ 'feature/*' ]

jobs:
  skill-action:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Run skill action
      run: |
        ./.ai/skills/skill-name/skill-name.sh ci-action --confirm
        
    - name: Verify results
      run: |
        ./.ai/skills/skill-name/skill-name.sh verify-action
```

## Best Practices Examples

### Development Workflow Integration

**Pre-Development Setup:**
```bash
# 1. Check current environment
./.ai/skills/skill-name/skill-name.sh status

# 2. Prepare for development
./.ai/skills/skill-name/skill-name.sh prepare-action

# 3. Verify setup
./.ai/skills/skill-name/skill-name.sh verify-action
```

**Post-Development Cleanup:**
```bash
# 1. Complete development tasks
./.ai/skills/skill-name/skill-name.sh finalize-action

# 2. Clean up resources
./.ai/skills/skill-name/skill-name.sh cleanup-action

# 3. Document results
./.ai/skills/skill-name/skill-name.sh document-action
```

### Error Prevention

**Validation Workflow:**
```bash
# 1. Pre-flight checks
./.ai/skills/skill-name/skill-name.sh validate-action

# 2. Execute with validation
./.ai/skills/skill-name/skill-name.sh safe-action

# 3. Post-execution verification
./.ai/skills/skill-name/skill-name.sh verify-action
```

## Real-World Use Cases

### [Use Case 1: Specific Industry/Domain]

**Context**: [Real-world scenario description]

**Implementation**:
```bash
# [Step-by-step real-world usage]
./.ai/skills/skill-name/skill-name.sh domain-specific-action

# [Business logic integration]
# ... additional steps ...
```

### [Use Case 2: Another Domain]

**Context**: [Another real-world scenario]

**Implementation**:
```bash
# [Implementation steps]
# ... commands and explanations ...
```

## Tips and Tricks

### Power User Features

**[Advanced Feature 1]:**
```bash
# [Description of advanced usage]
./.ai/skills/skill-name/skill-name.sh advanced-feature --option value
```

**[Advanced Feature 2]:**
```bash
# [Another power user tip]
./.ai/skills/skill-name/skill-name.sh power-feature
```

### Shortcuts and Aliases

**Useful Aliases:**
```bash
# Add to your shell profile
alias skill-quick='./.ai/skills/skill-name/skill-name.sh quick-action'
alias skill-status='./.ai/skills/skill-name/skill-name.sh status'
```

**Custom Functions:**
```bash
# Custom shell function
skill_workflow() {
    local param="$1"
    ./.ai/skills/skill-name/skill-name.sh workflow-action "$param"
    echo "Workflow completed for: $param"
}
```

---

**Last Updated:** [DATE]  
**Examples Count:** [Number]+ scenarios covered  
**Integration Points:** Compound Engineering, Git Worktree, Project Reset, CI/CD