# Skills Directory

> **Attribution**: This skills system implements concepts from the [Compound Engineering Plugin](https://github.com/EveryInc/compound-engineering-plugin) by EveryInc, adapted to follow the Claude Code skills pattern.

The skills directory contains modular, reusable automation components that reduce manual overhead and prevent common mistakes in the Compound Engineering workflow.

## Skills Philosophy

Each skill follows the Compound Engineering principle:

1. **Automate Repetitive Tasks**: Eliminate manual setup overhead
2. **Prevent Common Errors**: Built-in validation and safety checks  
3. **Provide Clear Feedback**: Colored output and progress indicators
4. **Enable Composition**: Skills work together as building blocks

## Available Skills

### Core Development Skills

| Skill | Description | Platforms | Actions |
|-------|-------------|-----------|---------|
| **[git-worktree](./git-worktree/)** | Git worktree management for isolated development | Windows, Unix/Linux/macOS | create, list, remove, cleanup, status |
| **[project-reset](./project-reset/)** | Project reset to clean state using templates | Windows, Unix/Linux/macOS | light, medium, full, custom |

## Quick Start

### Using a Skill

Each skill provides cross-platform implementations:

**All Platforms (Bash):**
```bash
# Git worktree management
./.ai/skills/git-worktree/git-worktree.sh create feature/new-feature

# Project reset
./.ai/skills/project-reset/project-reset.sh medium
```

**Windows Users:**
If you're in PowerShell, drop into WSL to execute bash scripts:
```powershell
# Enter WSL from PowerShell
wsl

# Then run the bash scripts
./.ai/skills/git-worktree/git-worktree.sh create feature/new-feature
```

### Skill Structure

Each skill follows a consistent structure:

```
skill-name/
├── README.md           # Comprehensive skill documentation
├── skill-name.sh       # Bash implementation (all platforms)
└── examples.md         # Usage examples and patterns
```

## Skill Capabilities Matrix

| Capability | git-worktree | project-reset | Future Skills |
|------------|--------------|---------------|---------------|
| **Isolation** | ✅ Worktree isolation | ✅ Template-based reset | |
| **Validation** | ✅ Branch name validation | ✅ Confirmation prompts | |
| **Cross-platform** | ✅ Bash + WSL | ✅ Bash + WSL | |
| **Colored Output** | ✅ Status indicators | ✅ Status indicators | |
| **Error Handling** | ✅ Graceful failures | ✅ Rollback safety | |
| **Interactive Mode** | ✅ Confirmation prompts | ✅ Custom level selection | |

## Integration with Compound Engineering

### Workflow Integration

Skills are integrated into the Compound Engineering phases:

- **Phase I (PLAN)**: Use project-reset to start fresh
- **Phase II (WORK)**: Use git-worktree for isolated development
- **Phase III (REVIEW)**: Skills support review workflows

### AGENTS.md Integration

Skills are referenced in `AGENTS.md` Section 3 (Skills & Automation) and enforced through workflow protocols.

### Memory Integration

Skills learn from past sessions through:
- `.ai/memory/lessons.md` - Accumulated wisdom from skill usage
- `.ai/memory/decisions.md` - Architectural patterns for skill development

## Developing New Skills

### Using the Template

1. Copy the skill template:
   ```bash
   cp -r .ai/skills/_templates/skill-template .ai/skills/my-new-skill
   ```

2. Customize the template files:
   - Update `README.md` with skill description and capabilities
   - Implement functionality in `skill.ps1` and `skill.sh`
   - Add usage examples to `examples.md`

3. Update this master README with the new skill

### Skill Development Guidelines

**Required Components:**
- Bash implementation (cross-platform via WSL on Windows)
- Comprehensive README with capabilities and usage
- Input validation and error handling
- Colored output for better UX
- Examples and common patterns

**Best Practices:**
- Follow existing naming conventions
- Use consistent parameter patterns
- Provide helpful error messages
- Include confirmation prompts for destructive actions
- Document integration points with other skills

**Testing:**
- Test on both Windows and Unix/Linux platforms
- Verify error handling and edge cases
- Ensure consistent behavior across platforms
- Document any platform-specific limitations

## Future Skills Roadmap

### Planned Skills

- **test-runner**: Automated test execution with intelligent filtering
- **documentation**: Auto-generation of API docs and README updates  
- **deployment**: Standardized deployment workflows with rollback capabilities
- **code-quality**: Automated linting, formatting, and security scanning
- **database**: Migration management and schema validation
- **api-client**: HTTP client with authentication and retry logic

### Skill Categories

**Development Workflow:**
- git-worktree ✅
- test-runner (planned)
- code-quality (planned)

**Project Management:**
- project-reset ✅
- documentation (planned)

**Operations:**
- deployment (planned)
- database (planned)

**Integration:**
- api-client (planned)

## Troubleshooting

### Common Issues

**Permission Errors:**
- Ensure scripts have execute permissions: `chmod +x .ai/skills/*/skill-name.sh`
- On Windows, use WSL for consistent bash execution

**Path Issues:**
- Always run skills from the repository root
- Use relative paths as shown in examples

**Platform Notes:**
- Windows users: Use WSL for consistent bash execution
- All platforms use forward slashes (`/`) for paths in bash scripts
- Line endings: Git handles this automatically

### Getting Help

1. Check the skill's individual README: `.ai/skills/skill-name/README.md`
2. Review examples: `.ai/skills/skill-name/examples.md`
3. Check `.ai/memory/lessons.md` for known issues and solutions

## Contributing

When adding new skills or improving existing ones:

1. Follow the established patterns and conventions
2. Update this master README with new capabilities
3. Add lessons learned to `.ai/memory/lessons.md`
4. Document architectural decisions in `.ai/memory/decisions.md`

---

## Attribution & License

**Original Concepts:** [Compound Engineering Plugin](https://github.com/EveryInc/compound-engineering-plugin) by EveryInc  
**Skills Pattern:** Inspired by Claude Code skills architecture  
**License:** MIT License (see LICENSE file)  

**Version:** 1.0.0  
**Last Updated:** 2025-12-18  
**Skills Count:** 2 active, 6 planned