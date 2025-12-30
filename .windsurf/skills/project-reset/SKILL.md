---
name: project-reset
description: Reset project state to clean templates while preserving engineering wisdom and creating archives. Use this skill when starting new projects, cleaning up after completion, or resetting development state with safety backups.
version: 1.0.0
author: EARS-Workflow System
phase: utility
---

# PROJECT-RESET: Template-Based Project State Management

## Overview

The PROJECT-RESET skill provides template-based project reset functionality, allowing you to clean project-specific content while preserving generic engineering wisdom and reusable tooling. This utility skill implements strategic cleanup with automatic archiving to maintain development history.

## Activation

This skill activates when users mention:
- "project reset", "reset project", "clean project"
- "start fresh", "new project", "clean slate"
- "reset memory", "clear documentation", "template reset"
- "archive project", "backup and reset", "clean state"

## Phase Position

PROJECT-RESET is a utility skill that supports project lifecycle management:
- **Project Completion**: Reset after successful project delivery
- **Project Transition**: Clean state when switching to new project
- **Development Cleanup**: Remove project-specific artifacts while preserving patterns
- **Template Maintenance**: Reset to clean templates for new development

## Objective

Provide safe, template-based project reset functionality with automatic archiving to enable clean project transitions while preserving valuable engineering knowledge and patterns.

## Core Capabilities

### Reset Operations

#### Documentation Reset (`docs`)
- Clear project-specific documentation only
- Preserve all memory files and engineering wisdom
- Maintain tooling and workflow configurations
- Create archive of cleared documentation

#### Memory Reset (`memory`)
- Reset memory files to clean templates
- Preserve project-specific documentation
- Maintain lessons learned in template form
- Create archive of project-specific memory

#### Project Reset (`project`)
- Reset memory files to templates
- Clear project-specific documentation
- Comprehensive cleanup for new project start
- Create complete project archive

### Safety Features

#### Automatic Archiving
- **Archive Creation**: Automatic backup before any reset operation
- **Timestamped Archives**: Archives named with date and time
- **Archive Management**: Configurable archive retention limits
- **Archive Listing**: View and manage existing archives

#### Confirmation Safeguards
- **Interactive Confirmation**: Require explicit user confirmation
- **Operation Preview**: Show what will be reset before execution
- **Skip Options**: Allow confirmation bypass for automation
- **Rollback Information**: Provide archive restoration guidance

## Platform Support

### Cross-Platform Bash Implementation
- **All Platforms**: Unified bash script (`project-reset.sh`)
- **Windows**: Use WSL (Windows Subsystem for Linux) or Git Bash
- **Unix/Linux/macOS**: Native bash execution
- **Consistent behavior** across all platforms

### Script Location
All operations use the centralized script:
```bash
./.ai/skills/project-reset/project-reset.sh [level] [options]
```

## Usage Examples

### Basic Reset Operations
```bash
# Project reset (recommended for new projects)
./.ai/skills/project-reset/project-reset.sh project

# Documentation reset only (keep all memory)
./.ai/skills/project-reset/project-reset.sh docs

# Memory reset only (keep documentation)
./.ai/skills/project-reset/project-reset.sh memory
```

### Advanced Options
```bash
# Skip confirmation prompt (use with caution)
./.ai/skills/project-reset/project-reset.sh project --confirm

# Skip archiving (not recommended)
./.ai/skills/project-reset/project-reset.sh project --no-archive

# Limit archives to keep only 5 most recent
./.ai/skills/project-reset/project-reset.sh project --archive-limit 5

# List existing archives
./.ai/skills/project-reset/project-reset.sh list-archives

# Restore from specific archive
./.ai/skills/project-reset/project-reset.sh restore archive-name
```

### Project Lifecycle Integration
```bash
# After project completion - full reset for new project
./.ai/skills/project-reset/project-reset.sh project

# Between development phases - documentation cleanup
./.ai/skills/project-reset/project-reset.sh docs

# Memory refresh - reset lessons to templates
./.ai/skills/project-reset/project-reset.sh memory
```

## Reset Levels

### Level Comparison

| Level | Memory Reset | Docs Cleared | Description | Archive Created |
|-------|--------------|--------------|-------------|-----------------|
| **docs** | ❌ | ✅ | Clear documentation only, keep all memory | ✅ |
| **memory** | ✅ | ❌ | Reset memory files only, keep documentation | ✅ |
| **project** | ✅ | ✅ | Reset memory to templates, clear project-specific docs | ✅ |

### Detailed Reset Scope

#### Documentation Reset (`docs`)
**Clears**:
- `.ai/docs/plans/` - Implementation plans
- `.ai/docs/requirements/` - Project requirements
- `.ai/docs/design/` - Design documents
- `.ai/docs/tasks/` - Task lists and backlogs
- `.ai/docs/reviews/` - Review reports

**Preserves**:
- `.ai/memory/lessons.md` - All lessons learned
- `.ai/memory/decisions.md` - Architectural decisions
- All tooling and workflow configurations

#### Memory Reset (`memory`)
**Resets**:
- `.ai/memory/lessons.md` - Reset to template with generic lessons
- `.ai/memory/decisions.md` - Reset to template with base patterns

**Preserves**:
- All project documentation
- All tooling and configurations
- Workflow and protocol files

#### Project Reset (`project`)
**Resets**:
- Memory files to clean templates
- Project-specific documentation
- Task lists and implementation artifacts

**Preserves**:
- Core workflow and protocol files
- Tooling and skill configurations
- Template files and base patterns

## Archive Management

### Archive Creation
- **Automatic Archiving**: Every reset operation creates timestamped archive
- **Archive Location**: `.ai/archives/YYYY-MM-DD-HHMMSS/`
- **Complete Backup**: Archives contain all reset content for restoration
- **Metadata Tracking**: Archive manifests track what was reset

### Archive Operations
```bash
# List all archives with details
./.ai/skills/project-reset/project-reset.sh list-archives

# Restore from specific archive
./.ai/skills/project-reset/project-reset.sh restore 2025-12-19-143022

# Clean old archives (keep last 10)
./.ai/skills/project-reset/project-reset.sh clean-archives --keep 10
```

## Template System

### Template Files
The reset system uses template files to restore clean states:
- `.ai/templates/memory/lessons-template.md` - Base lessons template
- `.ai/templates/memory/decisions-template.md` - Base decisions template
- `.ai/templates/docs/` - Documentation templates

### Template Maintenance
- **Template Evolution**: Templates improve over time with generic patterns
- **Wisdom Preservation**: Generic engineering wisdom moves to templates
- **Project Isolation**: Project-specific content is separated from templates

## Safety and Confirmation

### Interactive Confirmation
```bash
# Example confirmation prompt
Project Reset: This will reset memory files and clear project documentation.
Archive will be created at: .ai/archives/2025-12-19-143022/

Files to be reset:
- .ai/memory/lessons.md (15 project-specific lessons)
- .ai/memory/decisions.md (8 project decisions)
- .ai/docs/ (12 project documents)

Continue? [y/N]:
```

### Safety Features
- **Preview Mode**: Show what will be reset before execution
- **Archive Verification**: Confirm archive creation before reset
- **Rollback Guidance**: Provide restoration instructions
- **Confirmation Requirements**: Require explicit user consent

## Integration Points

### EARS Workflow Integration
- **Project Completion**: Clean reset after successful delivery
- **Project Transition**: Prepare for new development cycle
- **Memory Management**: Maintain optimal memory file size
- **Template Evolution**: Improve templates with learned patterns

### Development Lifecycle
- **Phase Transitions**: Clean state between major development phases
- **Team Handoffs**: Prepare clean environment for new team members
- **Maintenance Cycles**: Regular cleanup to maintain system hygiene
- **Knowledge Management**: Preserve valuable patterns in templates

## Best Practices

### When to Reset

#### Project Reset
- **After Project Completion**: Full reset when project is delivered
- **Major Pivot**: When changing project direction significantly
- **New Team Member**: Provide clean starting environment
- **Template Updates**: When base templates have been improved

#### Documentation Reset
- **Phase Transitions**: Between major development phases
- **Documentation Refresh**: When docs become outdated or cluttered
- **Focus Shift**: When changing development focus areas

#### Memory Reset
- **Memory Bloat**: When memory files become too large
- **Pattern Consolidation**: When lessons can be generalized to templates
- **Knowledge Refresh**: Periodic reset to maintain focus

### Archive Management
- **Regular Cleanup**: Remove old archives to save disk space
- **Archive Limits**: Set reasonable limits (5-10 archives)
- **Archive Documentation**: Document significant archives for future reference
- **Restoration Testing**: Periodically test archive restoration procedures

## Troubleshooting

### Common Issues and Solutions

#### Reset Fails
```bash
# Check permissions
ls -la .ai/memory/

# Verify templates exist
ls -la .ai/templates/memory/

# Check disk space
df -h
```

#### Archive Issues
```bash
# List archives to verify creation
./.ai/skills/project-reset/project-reset.sh list-archives

# Check archive integrity
ls -la .ai/archives/YYYY-MM-DD-HHMMSS/
```

#### Template Problems
```bash
# Verify template files exist
find .ai/templates/ -name "*.md"

# Check template content
cat .ai/templates/memory/lessons-template.md
```

## Memory Integration

### Lessons Learned
- Document reset patterns and best practices in templates
- Record effective project transition strategies
- Update with troubleshooting solutions and common issues

### Decision History
- Maintain reset policies and procedures in templates
- Document team conventions for project lifecycle management
- Record template evolution and improvement patterns

## Context Loading

Reference supporting files in current directory:
- `README.md` - Comprehensive usage documentation and capabilities
- `examples.md` - Detailed usage examples and lifecycle scenarios
- `project-reset.sh` - Main script with all reset functionality
- `references/` - Additional documentation (if needed)

## Anti-Patterns to Avoid

- ❌ **Reset Without Archive**: Never reset without creating backup archive
- ❌ **Frequent Resets**: Avoid resetting too often, losing valuable project context
- ❌ **Template Neglect**: Keep templates updated with generic patterns
- ❌ **Archive Hoarding**: Don't keep unlimited archives, manage storage
- ❌ **Confirmation Bypass**: Use --confirm flag sparingly and with caution
- ❌ **Manual Reset**: Use the script rather than manual file deletion

The PROJECT-RESET skill ensures safe, strategic project state management while preserving valuable engineering knowledge and enabling clean transitions between development cycles.