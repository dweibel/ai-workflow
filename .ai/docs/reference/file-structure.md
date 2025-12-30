# File Structure Reference

> **Authoritative reference for all file paths and directory structure**

## Core Directory Structure

```
.ai/
├── SKILL.md                     # Main skill definition
├── docs/                        # Documentation
│   ├── reference/               # Reference documentation
│   │   ├── activation-triggers.md
│   │   ├── file-structure.md
│   │   ├── version-info.md
│   │   └── installation-guide.md
│   ├── guides/                  # User guides
│   │   ├── getting-started.md
│   │   ├── workflow-examples.md
│   │   └── troubleshooting.md
│   ├── architecture/            # Design documents
│   ├── decisions/               # ADRs
│   ├── implementation/          # Implementation docs
│   ├── plans/                   # Implementation plans
│   ├── requirements/            # Requirements docs
│   ├── reviews/                 # Review reports
│   ├── specifications/          # EARS specifications
│   └── tasks/                   # Task lists
├── memory/                      # Compound engineering memory
│   ├── lessons.md               # Lessons learned
│   └── decisions.md             # Architectural decisions
├── skills/                      # Individual skills
│   ├── README.md                # Skills catalog
│   ├── compound-engineering/    # Master orchestrator
│   │   └── SKILL.md
│   ├── ears-specification/      # EARS requirements
│   │   ├── SKILL.md
│   │   └── templates/
│   │       ├── requirements-template.md
│   │       ├── ears-validation.md
│   │       └── incose-validation.md
│   ├── git-workflow/            # Git worktree & TDD
│   │   ├── SKILL.md
│   │   └── scripts/
│   │       └── git-worktree.sh
│   ├── testing-framework/       # Multi-perspective review
│   │   ├── SKILL.md
│   │   └── scripts/
│   │       └── run-validation-suite.js
│   └── project-reset/           # Project state management
│       └── SKILL.md
├── templates/                   # Shared templates
│   ├── requirements-template.md
│   ├── ears-validation.md
│   └── incose-validation.md
├── workflows/                   # Phase workflows
│   ├── ears-workflow.md
│   ├── planning.md
│   ├── execution.md
│   └── review.md
├── roles/                       # Role definitions
│   ├── architect.md
│   ├── builder.md
│   └── auditor.md
├── protocols/                   # Process protocols
│   ├── git-worktree.md
│   └── testing.md
└── tests/                       # Validation tests
    ├── package-completeness-validation.test.js
    ├── multi-environment-validation.test.js
    └── final-package-validation.test.js
```

## Required Files for Core Functionality

### Essential Files (Must Exist)
- `.ai/SKILL.md` - Main skill definition
- `.ai/memory/lessons.md` - Compound learning memory
- `.ai/memory/decisions.md` - Architectural decisions
- `.ai/skills/README.md` - Skills catalog

### Skill Definitions (Must Exist)
- `.ai/skills/compound-engineering/SKILL.md`
- `.ai/skills/ears-specification/SKILL.md`
- `.ai/skills/git-workflow/SKILL.md`
- `.ai/skills/testing-framework/SKILL.md`

### Templates (Must Exist)
- `.ai/skills/ears-specification/templates/requirements-template.md`
- `.ai/skills/ears-specification/templates/ears-validation.md`
- `.ai/skills/ears-specification/templates/incose-validation.md`

### Scripts (Platform-Specific)
- `.ai/skills/git-workflow/scripts/git-worktree.sh` (Bash)
- `.ai/skills/testing-framework/scripts/run-validation-suite.js` (Node.js)

## Optional Files (Created as Needed)

### Documentation
- `.ai/docs/plans/YYYY-MM-DD-feature-name.md`
- `.ai/docs/requirements/feature-requirements.md`
- `.ai/docs/design/feature-design.md`
- `.ai/docs/tasks/feature-tasks.md`
- `.ai/docs/reviews/feature-review.md`

### Workflows (Loaded on Demand)
- `.ai/workflows/ears-workflow.md`
- `.ai/workflows/planning.md`
- `.ai/workflows/execution.md`
- `.ai/workflows/review.md`

### Roles (Loaded on Demand)
- `.ai/roles/architect.md`
- `.ai/roles/builder.md`
- `.ai/roles/auditor.md`

### Protocols (Loaded on Demand)
- `.ai/protocols/git-worktree.md`
- `.ai/protocols/testing.md`

## Path Resolution Rules

1. **Relative Paths**: All paths are relative to project root
2. **Cross-References**: Use relative paths from `.ai/` directory
3. **Script Execution**: Scripts run from their containing directory
4. **Template Loading**: Templates loaded from skill-specific directories first, then shared templates

## Platform Considerations

### Windows
- Use forward slashes in documentation
- Scripts require WSL or Git Bash
- Path length limitations apply

### Unix/Linux/macOS
- Native path support
- Direct script execution
- No path length restrictions

## Validation

Use `.ai/tests/package-completeness-validation.test.js` to verify all required files exist and are properly structured.