# [Skill Name] Skill

> **Attribution**: Based on the [Compound Engineering Plugin](https://github.com/EveryInc/compound-engineering-plugin) by EveryInc

[Brief description of what this skill does and why it's useful in the EARS workflow]

## Overview

[Detailed explanation of the skill's purpose, the problems it solves, and how it fits into the broader EARS workflow system]

## Capabilities

| Action | Description | Safety Features |
|--------|-------------|-----------------|
| **action1** | [Description of first action] | [Safety features like validation, confirmations] |
| **action2** | [Description of second action] | [Safety features] |
| **action3** | [Description of third action] | [Safety features] |

## Platform Support

- **All Platforms**: Bash script (`skill-name.sh`)
- **Windows**: Use WSL (Windows Subsystem for Linux) for bash execution
- **Unix/Linux/macOS**: Native bash execution

Consistent bash implementation across all platforms.

## Usage

### All Platforms (Bash)

```bash
# Basic usage
./.ai/skills/skill-name/skill-name.sh action1 value

# With confirmation skip
./.ai/skills/skill-name/skill-name.sh action2 value --confirm

# Help
./.ai/skills/skill-name/skill-name.sh help
```

### Windows Users (PowerShell to WSL)

If you're in PowerShell, drop into WSL to execute the bash script:

```powershell
# Enter WSL from PowerShell
wsl

# Then run the bash script
./.ai/skills/skill-name/skill-name.sh action1 value
```

## Parameters

| Position | Required | Default | Description |
|----------|----------|---------|-------------|
| 1 | Yes | - | Action: action1, action2, action3, help |
| 2 | Varies | - | [Description of parameter] |
| --confirm | No | false | Skip confirmation prompts |

## Integration Points

### EARS Workflow Integration

**Phase Integration:**
- **Phase I (PLAN)**: [How this skill supports planning]
- **Phase II (WORK)**: [How this skill supports implementation]
- **Phase III (REVIEW)**: [How this skill supports review]

**Safety Features:**
- [List safety features and how they prevent common mistakes]
- [Integration with git workflows]
- [Validation and error handling]

### Memory Integration

The skill learns from usage patterns documented in:
- `.ai/memory/lessons.md` - [What lessons this skill helps capture]
- `.ai/memory/decisions.md` - [What decisions this skill helps implement]

## Error Handling

### Common Scenarios

**[Error Scenario 1]:**
- [Description of when this occurs]
- [How the skill handles it]
- [User guidance provided]

**[Error Scenario 2]:**
- [Description of when this occurs]
- [How the skill handles it]
- [User guidance provided]

### Recovery Procedures

**[Recovery Scenario 1]:**
```bash
# [Description of recovery steps]
./.ai/skills/skill-name/skill-name.sh recovery-action
```

**[Recovery Scenario 2]:**
```bash
# [Description of recovery steps]
./.ai/skills/skill-name/skill-name.sh cleanup
```

## Output Examples

### [Action 1] Output
```
ℹ️  [Description of what's happening]
✅ [Success message]
ℹ️  [Next steps or guidance]
```

### [Action 2] Output
```
⚠️  [Warning about what will happen]
ℹ️  [Information about the process]
✅ [Completion message]
```

## Best Practices

### [Usage Context 1]

1. **[Best Practice 1]**: [Description and rationale]
   ```bash
   ./.ai/skills/skill-name/skill-name.sh recommended-pattern
   ```

2. **[Best Practice 2]**: [Description and rationale]
   ```bash
   ./.ai/skills/skill-name/skill-name.sh another-pattern
   ```

### [Usage Context 2]

**[Scenario Description]:**
- [Step-by-step guidance]
- [Commands to run]
- [Expected outcomes]

## Troubleshooting

### Permission Issues

**All Platforms:**
```bash
# Make script executable
chmod +x ./.ai/skills/skill-name/skill-name.sh
```

**Windows (PowerShell Users):**
```powershell
# Drop into WSL for bash execution
wsl

# Then run the script in WSL
./.ai/skills/skill-name/skill-name.sh action1 value
```

### Common Errors

**"[Error Message 1]":**
- [Cause of the error]
- [Solution steps]

**"[Error Message 2]":**
- [Cause of the error]
- [Solution steps]

## Advanced Usage

### [Advanced Feature 1]

```bash
# [Description of advanced usage]
./.ai/skills/skill-name/skill-name.sh advanced-action --option value
```

### [Advanced Feature 2]

```bash
# [Description of another advanced usage]
./.ai/skills/skill-name/skill-name.sh complex-action param1 param2
```

## Related Skills

- **[skill-1](../skill-1/)**: [How they work together]
- **[skill-2](../skill-2/)**: [Integration points]
- **[planned-skill]** (planned): [Future integration]

---

**Version:** 1.0.0  
**Last Updated:** [DATE]  
**Platforms:** All (Bash via WSL on Windows)  
**Dependencies:** [List any dependencies], WSL on Windows