# Skills Directory

> **Attribution**: This skills system implements concepts from the [Compound Engineering Plugin](https://github.com/EveryInc/compound-engineering-plugin) by EveryInc, adapted to follow the Agent Skills standard for cross-platform compatibility.

The skills directory contains modular, reusable automation components that follow the Agent Skills standard, enabling compatibility with VS Code, Cursor, JetBrains IDEs, and other AI-assisted development environments.

## Skills Philosophy

Each skill follows the Agent Skills standard and compound engineering principles:

1. **Progressive Disclosure**: Skills are discovered via metadata, loaded on-demand
2. **Cross-Platform Compatibility**: Works with VS Code, Cursor, JetBrains, and CLI tools
3. **Compound Learning**: Each skill contributes to system-wide knowledge accumulation
4. **Modular Design**: Skills can be used independently or in orchestrated workflows

## Available Skills

### Core Orchestration Skills

| Skill | Description | Activation Triggers | Phase |
|-------|-------------|-------------------|-------|
| **[compound-engineering](./compound-engineering/)** | Master orchestration skill that routes to specialized skills and enforces universal invariants | "compound engineering", "orchestrate", "route workflow" | All |

### Workflow Phase Skills

| Skill | Description | Activation Triggers | Phase |
|-------|-------------|-------------------|-------|
| **[ears-specification](./ears-specification/)** | EARS-compliant requirements and specification creation with property-based testing | "requirements", "specification", "EARS", "user story" | SPEC-FORGE |
| **[git-workflow](./git-workflow/)** | Git worktree management and TDD implementation workflow | "implement", "fix", "code", "git worktree", "TDD" | WORK |
| **[testing-framework](./testing-framework/)** | Multi-perspective code review and quality assurance | "review", "audit", "test", "quality check" | REVIEW |

### Utility Skills

| Skill | Description | Activation Triggers | Phase |
|-------|-------------|-------------------|-------|
| **[git-worktree](./git-worktree/)** | Git worktree management for isolated development environments | "git worktree", "isolated environment", "branch management" | Utility |
| **[project-reset](./project-reset/)** | Project reset to clean state using templates | "reset project", "clean state", "template restore" | Utility |

## Agent Skills Standard Compliance

All skills in this directory follow the Agent Skills standard:

### SKILL.md Format
```yaml
---
name: skill-name
description: Clear description with "Use this skill when..." pattern for semantic routing
version: 1.0.0
author: Compound Engineering System
---

# Skill Title

## Overview
[Skill description and capabilities]

## Usage
[How to use the skill]

## Integration
[How it integrates with other skills]
```

### Directory Structure
```
skill-name/
├── SKILL.md           # Agent Skills standard definition
├── scripts/           # Executable automation (optional)
├── templates/         # Static resources (optional)
└── references/        # Deep documentation (optional)
```

## Cross-Platform Compatibility

Skills are automatically synchronized to multiple locations for IDE compatibility:

- **`.ai/skills/`** - Primary location (this directory)
- **`.github/skills/`** - VS Code/GitHub Copilot compatibility

Use `scripts/skills/sync-skills.js` to synchronize skills across platforms.

## Progressive Disclosure

The skills system implements progressive disclosure for efficient context management:

1. **Tier 1 (Discovery)**: YAML frontmatter loaded for all skills (~50 tokens each)
2. **Tier 2 (Activation)**: Full SKILL.md content loaded when skill is triggered
3. **Tier 3 (Execution)**: Scripts and templates loaded as needed

This allows the system to be aware of thousands of capabilities while only loading relevant context.

## Skill Orchestration

### Compound Engineering Orchestrator
The `compound-engineering` skill acts as the master orchestrator:
- Routes user requests to appropriate specialized skills
- Enforces universal invariants across all skills
- Manages cross-skill coordination and learning
- Maintains compound learning through memory integration

### Workflow Integration
Skills integrate into the four-phase workflow:
- **SPEC-FORGE**: `ears-specification` skill
- **PLAN**: `compound-engineering` orchestration
- **WORK**: `git-workflow` skill
- **REVIEW**: `testing-framework` skill

## Usage Examples

### Semantic Activation
Skills activate based on semantic analysis of user input:

```
User: "I need to create requirements for user authentication"
→ Activates: ears-specification skill
→ Loads: EARS templates and validation tools
```

```
User: "Implement the login feature using TDD"
→ Activates: git-workflow skill
→ Creates: Isolated worktree for development
```

```
User: "Review the authentication code for security issues"
→ Activates: testing-framework skill
→ Runs: Multi-perspective security audit
```

### Direct Skill Usage
Skills can also be invoked directly:

```bash
# Validate all skills
node scripts/skills/validate-skills.js

# Sync skills to cross-platform locations
node scripts/skills/sync-skills.js

# Run security validation
node .ai/skills/testing-framework/scripts/run-validation-suite.js --persona security
```

## Memory Integration

All skills contribute to compound learning through:

### Shared Memory
- **`.ai/memory/lessons.md`** - Cross-skill lessons learned
- **`.ai/memory/decisions.md`** - Architectural decisions affecting all skills

### Learning Patterns
- Skills learn from user corrections and feedback
- Successful patterns are codified and shared
- Anti-patterns are identified and prevented
- Domain-specific knowledge accumulates over time

## Skill Development

### Creating New Skills

1. **Use the template**:
   ```bash
   cp -r .ai/skills/_templates/skill-template .ai/skills/my-new-skill
   ```

2. **Update SKILL.md** with proper YAML frontmatter and content

3. **Add scripts/templates** as needed

4. **Validate the skill**:
   ```bash
   node scripts/skills/validate-skills.js --skill my-new-skill
   ```

5. **Sync to cross-platform locations**:
   ```bash
   node scripts/skills/sync-skills.js
   ```

### Best Practices

**SKILL.md Requirements**:
- Use semantic description with "Use this skill when..." pattern
- Follow kebab-case naming convention
- Include clear usage examples
- Document integration points

**Script Development**:
- Make scripts cross-platform (bash for consistency)
- Include proper error handling and validation
- Provide colored output for better UX
- Document all parameters and options

**Template Design**:
- Create reusable, parameterized templates
- Include validation and examples
- Follow established patterns and conventions

## Validation and Quality

### Automated Validation
```bash
# Validate all skills
node scripts/skills/validate-skills.js

# Validate specific skill
node scripts/skills/validate-skills.js --skill compound-engineering

# Generate validation report
node scripts/skills/validate-skills.js --format markdown --output validation-report.md
```

### Quality Metrics
- YAML frontmatter compliance
- Required field presence
- Description quality for semantic routing
- Cross-reference validation
- Script executability

## Integration with IDEs

### VS Code/GitHub Copilot
- Skills automatically discovered in `.github/skills/`
- Native Agent Skills support in VS Code Insiders
- Progressive disclosure for context management

### Cursor
- Skills work as "Agent-Decided Rules"
- Semantic activation based on user intent
- Integration with Composer for multi-file operations

### JetBrains IDEs
- Use CLI tools for skill transpilation
- MCP server integration for progressive disclosure
- Terminal-based agent workflows

### CLI Tools
- `openskills` - Universal skills loader
- `rulesync` - Cross-IDE synchronization
- Custom validation and management scripts

## Troubleshooting

### Common Issues

**Skill Not Activating**:
- Check description includes "Use this skill when..." pattern
- Verify YAML frontmatter is valid
- Ensure skill is synchronized to appropriate IDE location

**Validation Errors**:
- Run `validate-skills.js` to identify issues
- Check required fields are present
- Verify naming conventions

**Cross-Platform Issues**:
- Use `sync-skills.js` to update all locations
- Check file permissions on scripts
- Verify bash compatibility for scripts

### Getting Help

1. **Validate skills**: `node scripts/skills/validate-skills.js`
2. **Check synchronization**: `node scripts/skills/sync-skills.js --dry-run`
3. **Review memory files**: `.ai/memory/lessons.md` for known issues
4. **Consult individual skill documentation**: Each skill's SKILL.md file

## Future Roadmap

### Planned Skills
- **planning**: Research and implementation planning
- **documentation**: Auto-generation of API docs and README updates
- **deployment**: Standardized deployment workflows with rollback
- **code-quality**: Automated linting, formatting, and security scanning
- **database**: Migration management and schema validation

### Enhanced Features
- **Skill Marketplace**: Central registry for skill sharing
- **Dependency Management**: Skill dependencies and version management
- **Performance Monitoring**: Skill usage analytics and optimization
- **AI-Assisted Skill Creation**: Generate skills from natural language descriptions

## Contributing

When adding new skills or improving existing ones:

1. **Follow the Agent Skills standard** for maximum compatibility
2. **Update this master README** with new capabilities
3. **Add lessons learned** to `.ai/memory/lessons.md`
4. **Document architectural decisions** in `.ai/memory/decisions.md`
5. **Validate and sync** skills before committing

---

## Attribution & License

**Original Concepts**: [Compound Engineering Plugin](https://github.com/EveryInc/compound-engineering-plugin) by EveryInc  
**Agent Skills Standard**: Based on Anthropic's Agent Skills specification  
**License**: MIT License (see LICENSE file)  

**Version**: 1.0.0  
**Last Updated**: 2025-12-29  
**Skills Count**: 5 active, 5 planned  
**Standard Compliance**: Agent Skills v1.0