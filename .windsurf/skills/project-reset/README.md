# Project Reset Skill

> **Attribution**: Based on the [Compound Engineering Plugin](https://github.com/EveryInc/compound-engineering-plugin) by EveryInc

This skill provides template-based project reset functionality, allowing you to clean project-specific content while preserving generic engineering wisdom and reusable tooling.

## Overview

The Project Reset skill implements a strategic approach to project cleanup that maintains the EARS workflow benefits while preparing for new development. It uses template files to reset memory and documentation to clean states.

## Capabilities

| Level | Memory Reset | Docs Cleared | Description | Archive Created |
|-------|--------------|--------------|-------------|-----------------|
| **docs** | ❌ | ✅ | Clear documentation only, keep all memory | ✅ |
| **memory** | ✅ | ❌ | Reset memory files only, keep documentation | ✅ |
| **project** | ✅ | ✅ | Reset memory to templates, clear project-specific docs | ✅ |

## Platform Support

- **All Platforms**: Bash script (`project-reset.sh`)
- **Windows**: Use WSL (Windows Subsystem for Linux) for bash execution
- **Unix/Linux/macOS**: Native bash execution

Consistent bash implementation across all platforms.

## Usage

### All Platforms (Bash)

```bash
# Project reset (recommended for new projects) - with automatic archiving
./.ai/skills/project-reset/project-reset.sh project

# Documentation reset (keep all memory, clear docs only)
./.ai/skills/project-reset/project-reset.sh docs

# Memory reset (reset memory files only, keep docs)
./.ai/skills/project-reset/project-reset.sh memory

# Skip confirmation (use with caution)
./.ai/skills/project-reset/project-reset.sh project --confirm

# Skip archiving (not recommended)
./.ai/skills/project-reset/project-reset.sh project --no-archive

# Limit archives to keep only 5 most recent
./.ai/skills/project-reset/project-reset.sh project --archive-limit 5
```

### Archive Management

```bash
# List all available archives
./.ai/skills/project-reset/project-reset.sh list-archives

# Get detailed information about a specific archive
./.ai/skills/project-reset/project-reset.sh archive-info 2025-12-18-143022-project

# Restore from a specific archive
./.ai/skills/project-reset/project-reset.sh restore 2025-12-18-143022-project

# Clear old archives before reset
./.ai/skills/project-reset/project-reset.sh project --clear-archive
```



### Windows Users (PowerShell to WSL)

If you're in PowerShell, drop into WSL to execute the bash script:

```powershell
# Enter WSL from PowerShell
wsl

# Then run the bash script
./.ai/skills/project-reset/project-reset.sh medium
```

## Reset Levels Explained

### docs Reset
**Use Case**: Starting new development while keeping all accumulated wisdom

**What's Reset:**
- ✅ Clear `.ai/docs/plans/` (except README.md)
- ✅ Clear `.ai/docs/tasks/` (except README.md)
- ✅ Clear `.ai/docs/reviews/` (except README.md)
- ✅ Clear `.ai/docs/requirements/` (except README.md and templates)
- ✅ Clear `.ai/docs/design/` (except README.md)

**What's Preserved:**
- ✅ All memory files (lessons.md, decisions.md)
- ✅ All protocols, workflows, roles
- ✅ All scripts and automation
- ✅ Template files and README files

**Archive Created:** ✅ Automatic backup before clearing documentation

### memory Reset
**Use Case**: Reset accumulated wisdom while keeping project documentation

**What's Reset:**
- ✅ Reset `.ai/memory/lessons.md` to template
- ✅ Reset `.ai/memory/decisions.md` to template

**What's Preserved:**
- ✅ All project documentation
- ✅ Generic engineering protocols
- ✅ Workflow definitions
- ✅ Role definitions
- ✅ Automation scripts
- ✅ Template files

**Archive Created:** ✅ Automatic backup before resetting memory

### project Reset (Recommended)
**Use Case**: Starting a completely new project while preserving generic patterns

**What's Reset:**
- ✅ Reset `.ai/memory/lessons.md` to template
- ✅ Reset `.ai/memory/decisions.md` to template
- ✅ Clear all project documentation (as in docs reset)

**What's Preserved:**
- ✅ Generic engineering protocols
- ✅ Workflow definitions
- ✅ Role definitions
- ✅ Automation scripts
- ✅ Template files

**Archive Created:** ✅ Comprehensive backup before reset



## Archive System

### Automatic Archiving

Every reset operation automatically creates a timestamped archive before making changes:

**Archive Structure:**
```
.ai/archive/
├── README.md                           # Archive system documentation
├── 2025-12-18-143022-project/         # Timestamped archive
│   ├── archive-info.json              # Metadata about the archive
│   ├── memory/                        # Archived memory files
│   │   ├── lessons.md
│   │   └── decisions.md
│   └── docs/                          # Archived documentation
│       ├── plans/
│       ├── tasks/
│       ├── reviews/
│       ├── requirements/
│       └── design/
└── 2025-12-19-091545-docs/           # Another archive
    └── ...
```

**Archive Naming:** `YYYY-MM-DD-HHMMSS-{reset-type}/`
- **Date/Time**: When the archive was created (UTC)
- **Reset Type**: The type of reset that created the archive

### Archive Metadata

Each archive includes comprehensive metadata in `archive-info.json`:

```json
{
  "timestamp": "2025-12-18T14:30:22Z",
  "resetType": "project",
  "gitCommit": "abc123def456",
  "user": "system",
  "filesArchived": {
    "memory": 2,
    "docs": 15,
    "total": 17
  },
  "restorationCommand": "./project-reset.sh restore 2025-12-18-143022-project"
}
```

### Archive Management

**Automatic Cleanup:**
- Archives are automatically managed to prevent disk space issues
- Use `--archive-limit N` to keep only N most recent archives
- Use `--clear-archive` to remove all old archives before reset

**Manual Management:**
```bash
# List all archives with details
./project-reset.sh list-archives

# Get detailed information about specific archive
./project-reset.sh archive-info 2025-12-18-143022-project

# Restore from archive (creates backup of current state first)
./project-reset.sh restore 2025-12-18-143022-project
```

### Safety Features

- **Pre-Restore Backup**: Current state is backed up before restoration
- **Integrity Validation**: Archives include metadata for validation
- **Confirmation Prompts**: All destructive operations require confirmation
- **Selective Operations**: Choose what to archive and restore

## Template System

### Template Files Required

The skill requires these template files to exist:

```
.ai/templates/
├── lessons.template.md      # Template for lessons.md
├── decisions.template.md    # Template for decisions.md
└── README.md               # Template documentation
```

### Template Placeholders

Templates support date placeholders:
- `[DATE]` - Replaced with current date (YYYY-MM-DD format)

**Example template usage:**
```markdown
# Lessons Learned

Last reviewed: [DATE]

## How to Use This File
...
```

## Safety Features

### Confirmation System

**Standard Confirmation:**
```
⚠️  This action cannot be undone!
Are you sure you want to proceed? (type 'RESET' to confirm):
```

**Skip Confirmation:**
Use `-Confirm` (PowerShell) or `--confirm` (Bash) to bypass prompts.

### Validation Checks

**Pre-execution Validation:**
- ✅ Verify running from repository root (`.ai` directory exists)
- ✅ Confirm template files exist
- ✅ Check file permissions

**Error Handling:**
- Graceful failure if templates missing
- Clear error messages for common issues
- Rollback capability for partial failures

## Integration Points

### EARS Workflow Integration

**Phase I (PLAN) Integration:**
- Use before starting new project planning
- Ensures clean slate for requirements gathering
- Removes previous project context

**Memory System Integration:**
- Resets memory files to template versions
- Preserves generic engineering wisdom in templates
- Maintains compound learning through template evolution

### Git Integration

**Recommended Git Workflow:**
```bash
# 1. Commit current state
git add .
git commit -m "checkpoint: before project reset"

# 2. Create backup branch
git branch backup/pre-reset

# 3. Perform reset
./.ai/skills/project-reset/project-reset.sh medium

# 4. Commit clean state
git add .
git commit -m "reset: prepare for new project development"
```

## Output Examples

### Project Reset Output (with Archiving)
```
ℹ️  Project Reset Tool - Level: project
ℹ️  This will reset your project to a clean state for new development
⚠️  Reset memory to templates, clear project-specific docs

ℹ️  The following actions will be performed:
⚠️    • Reset .ai/memory/lessons.md from template
⚠️    • Reset .ai/memory/decisions.md from template
⚠️    • Clear .ai/docs/plans/ (except README.md)
⚠️    • Clear .ai/docs/tasks/ (except README.md)
⚠️    • Clear .ai/docs/reviews/ (except README.md)
⚠️    • Clear .ai/docs/requirements/ (except README.md and templates)
⚠️    • Clear .ai/docs/design/ (except README.md)

ℹ️  The following will be PRESERVED:
✅  • .ai/protocols/ (generic engineering protocols)
✅  • .ai/workflows/ (generic workflows)
✅  • .ai/roles/ (generic role definitions)
✅  • .ai/skills/ (reusable automation tools)
✅  • All README.md files (templates and documentation)
✅  • Template files (*.template.md)

⚠️  This action cannot be undone!
Are you sure you want to proceed? (type 'RESET' to confirm): RESET

ℹ️  Creating archive: 2025-12-18-143022-project
✅ Archive created: .ai/archive/2025-12-18-143022-project (17 files)
ℹ️  Starting reset process...
ℹ️  Resetting memory files to templates...
✅ Reset .ai/memory/lessons.md
✅ Reset .ai/memory/decisions.md
ℹ️  Clearing project documentation...
✅ Cleared .ai/docs/plans
✅ Cleared .ai/docs/tasks
✅ Cleared .ai/docs/reviews
✅ Cleared .ai/docs/requirements
✅ Cleared .ai/docs/design
✅ Project reset completed successfully!
ℹ️  Previous state archived as: 2025-12-18-143022-project
ℹ️  To restore: ./project-reset.sh restore 2025-12-18-143022-project
ℹ️  Your project is now ready for fresh development while preserving all generic engineering wisdom.

ℹ️  Next steps:
✅  1. Review .ai/memory/lessons.md and .ai/memory/decisions.md
✅  2. Start your new project development
✅  3. Document new patterns and lessons as you build
✅  4. Use .ai/workflows/planning.md to plan your first feature
✅  5. Use './project-reset.sh list-archives' to manage archives
```

### Archive Management Output
```bash
# List archives
$ ./project-reset.sh list-archives
ℹ️  Available Archives:
Archive Name              Type       Files    Date         Git Commit
------------------------  --------   ------   ----------   ----------
2025-12-18-143022-project project    17       2025-12-18   abc123de
2025-12-18-091545-docs    docs       8        2025-12-18   def456gh
2025-12-17-165432-memory  memory     2        2025-12-17   hij789kl

# Archive information
$ ./project-reset.sh archive-info 2025-12-18-143022-project
ℹ️  Archive Information: 2025-12-18-143022-project

  Timestamp:    2025-12-18T14:30:22Z
  Reset Type:   project
  Git Commit:   abc123def456
  Created By:   developer
  Files:
    Memory:     2 files
    Docs:       15 files
    Total:      17 files

ℹ️  Archive Contents:
  docs/plans/2025-12-16-user-auth.md
  docs/tasks/implement-login.md
  memory/lessons.md
  memory/decisions.md

ℹ️  Restoration Command:
  ./project-reset.sh restore 2025-12-18-143022-project

# Restore from archive
$ ./project-reset.sh restore 2025-12-18-143022-project
ℹ️  Restoring from archive: 2025-12-18-143022-project
⚠️  This will overwrite current memory and documentation files!
Are you sure you want to restore? (type 'RESTORE' to confirm): RESTORE
ℹ️  Creating archive: 2025-12-18-144530-pre-restore
✅ Archive created: .ai/archive/2025-12-18-144530-pre-restore (5 files)
ℹ️  Current state backed up to: 2025-12-18-144530-pre-restore
ℹ️  Restoring memory files...
✅ Memory files restored
ℹ️  Restoring documentation...
✅ Restored plans
✅ Restored tasks
✅ Archive restoration completed!
ℹ️  Previous state backed up as: 2025-12-18-144530-pre-restore
```

## Best Practices

### When to Use Each Level

**docs Reset:**
- Switching to new feature set in same project
- Cleaning up documentation after major milestone
- Preparing for new development phase
- Keeping accumulated wisdom while starting fresh documentation

**memory Reset:**
- Resetting accumulated patterns and lessons
- Starting with fresh memory while keeping project context
- Cleaning up outdated lessons and decisions

**project Reset (Recommended):**
- Starting completely new project
- Switching technology stacks
- Beginning fresh after major pivot
- Most common reset for new development



### Pre-Reset Checklist

1. **Review Current State:**
   ```bash
   # Check what will be archived and reset
   ls .ai/docs/plans/
   ls .ai/docs/tasks/
   cat .ai/memory/lessons.md
   ```

2. **Verify Templates:**
   ```bash
   # Ensure templates exist and are current
   ls .ai/templates/
   cat .ai/templates/lessons.template.md
   ```

3. **Check Archive Space:**
   ```bash
   # Review existing archives and disk usage
   ./project-reset.sh list-archives
   du -sh .ai/archive/
   ```

4. **Optional Git Backup (archives provide this automatically):**
   ```bash
   git add .
   git commit -m "checkpoint: before reset"
   git branch backup/$(date +%Y-%m-%d)
   ```

### Archive Management Best Practices

1. **Regular Cleanup:**
   ```bash
   # Keep only 5 most recent archives
   ./project-reset.sh project --archive-limit 5
   ```

2. **Monitor Disk Usage:**
   ```bash
   # Check archive directory size
   du -sh .ai/archive/
   
   # Clear old archives if needed
   ./project-reset.sh project --clear-archive
   ```

3. **Test Restoration:**
   ```bash
   # Periodically test archive restoration in a separate branch
   git checkout -b test-restore
   ./project-reset.sh restore 2025-12-18-143022-project
   # Verify restoration worked
   git checkout main
   git branch -D test-restore
   ```

### Post-Reset Workflow

1. **Review Reset Results:**
   ```bash
   # Check memory files
   cat .ai/memory/lessons.md
   cat .ai/memory/decisions.md
   ```

2. **Plan New Development:**
   ```bash
   # Start with planning workflow
   cat .ai/workflows/planning.md
   ```

3. **Document New Patterns:**
   - Add project-specific lessons as you learn
   - Document architectural decisions as you make them
   - Update templates based on new insights

## Troubleshooting

### Common Issues

**"Template files not found":**
```bash
# Check template directory
ls .ai/templates/

# Ensure required templates exist
ls .ai/templates/lessons.template.md
ls .ai/templates/decisions.template.md
```

**"Not in a git repository":**
```bash
# Verify you're in repository root
ls .git
ls .ai

# Navigate to correct directory
cd /path/to/your/repository
```

**Permission errors:**
```bash
# Make script executable (all platforms)
chmod +x ./.ai/skills/project-reset/project-reset.sh
```

**Windows PowerShell users:**
```powershell
# Drop into WSL for bash execution
wsl
```

### Recovery Procedures

**Accidental Full Reset:**
```bash
# Restore from backup branch
git checkout backup/pre-reset -- .ai/memory/
git commit -m "restore: recover memory files from backup"
```

**Partial Reset Failure:**
```bash
# Check git status
git status

# Restore specific files if needed
git checkout HEAD -- .ai/memory/lessons.md
```

## Advanced Usage

### Automated Reset in CI/CD

**Example GitHub Actions:**
```yaml
name: Prepare Demo Environment
on:
  workflow_dispatch:
    inputs:
      reset_level:
        description: 'Reset level'
        required: true
        default: 'medium'
        type: choice
        options:
        - light
        - medium
        - full

jobs:
  reset:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Reset project
      run: |
        ./.ai/skills/project-reset/project-reset.sh ${{ github.event.inputs.reset_level }} --confirm
        
    - name: Commit reset
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add .
        git commit -m "reset: automated ${{ github.event.inputs.reset_level }} reset"
        git push
```

### Custom Template Development

**Creating Project-Specific Templates:**
```bash
# Create custom template directory
mkdir .ai/templates/custom/

# Copy and customize templates
cp .ai/templates/lessons.template.md .ai/templates/custom/
cp .ai/templates/decisions.template.md .ai/templates/custom/

# Modify templates for specific project needs
# ... edit templates ...

# Use custom templates (requires script modification)
```

## Related Skills

- **[git-worktree](../git-worktree/)**: Create isolated development environments after reset
- **documentation** (planned): Auto-generate fresh documentation
- **test-runner** (planned): Validate clean state after reset

---

**Version:** 2.0.0  
**Last Updated:** 2025-12-18  
**Platforms:** All (Bash via WSL on Windows)  
**Dependencies:** Template files in `.ai/templates/`, WSL on Windows  
**New Features:** Automatic archiving, descriptive reset options, archive management, restoration capabilities