# EARS-Workflow Skill Package Installation

## Quick Install

### Method 1: Direct Copy (Recommended)
```bash
# Copy the entire .ai/ directory to your project root
cp -r /path/to/ears-workflow-skill/.ai/ /path/to/your/project/

# Verify installation
ls -la /path/to/your/project/.ai/SKILL.md

# Test activation
# In your IDE: "use EARS workflow"
```

### Method 2: Git Submodule
```bash
# Add as submodule in your project root
git submodule add https://github.com/your-org/ears-workflow-skill.git .ai

# Initialize submodule
git submodule update --init --recursive

# Test activation
# In your IDE: "use EARS workflow"
```

## System Requirements

- **Git**: Version 2.20 or higher (for worktree support)
- **Node.js**: Version 16+ (optional, for testing and validation)
- **IDE**: VS Code, Cursor, JetBrains, or any Agent Skills-compatible environment

## IDE-Specific Setup

### VS Code + GitHub Copilot
1. Copy `.ai/` directory to project root
2. Restart VS Code
3. Test: "use EARS workflow"

### Cursor IDE
1. Copy `.ai/` directory to project root
2. Configure Agent-Decided rules (optional)
3. Test: "use structured development"

### JetBrains IDEs
1. Install CLI tools: `npm install -g openskills`
2. Copy `.ai/` directory to project root
3. Transpile: `openskills transpile .ai/SKILL.md --target jetbrains`
4. Configure in IDE Settings → AI Assistant → Custom Skills

## Verification

After installation, verify these files exist:
```
your-project/
├── .ai/
│   ├── SKILL.md                 # Main skill definition
│   ├── skills/                  # Sub-skills
│   ├── memory/                  # Compound engineering memory
│   ├── workflows/               # Phase workflows
│   └── docs/                    # Documentation
```

## Quick Test
1. Open any file in your project
2. Ask your AI assistant: "use EARS workflow"
3. Expected: Skill activates and offers phase selection

## Troubleshooting

**Skill not discovered?**
- Check file permissions on `.ai/` directory
- Restart your IDE
- Verify YAML frontmatter in `.ai/SKILL.md`

**Activation fails?**
- Use exact phrase: "use EARS workflow"
- Check IDE Agent Skills support
- Verify all required files are present

**Need help?**
- See full documentation: `.ai/docs/guides/installation.md`
- Check usage examples: `.ai/docs/guides/usage.md`

## Next Steps
- Read the full installation guide: `.ai/docs/guides/installation.md`
- Try the usage examples: `.ai/docs/guides/usage.md`
- Start with: "use EARS workflow to create a simple feature"