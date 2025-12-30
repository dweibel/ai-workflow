# EARS-Workflow Skill Package Installation

> **For complete installation instructions, see [Installation Guide Reference](.ai/docs/reference/installation-guide.md)**

## Platform Requirements

### Windows
- **WSL (Windows Subsystem for Linux)** or **Git Bash** required for bash script execution
- Install WSL: `wsl --install` (requires restart)
- Or install Git for Windows with Git Bash: https://git-scm.com/download/win
- All bash scripts must be run within WSL or Git Bash environment

### macOS/Linux
- Native bash support - no additional requirements

## Quick Install

### Method 1: Direct Copy (Recommended)
```bash
# Copy the entire .ai/ directory to your project root
cp -r /path/to/ears-workflow-skill/.ai/ /path/to/your/project/

# Verify installation
ls -la /path/to/your/project/.ai/SKILL.md
```

### Method 2: Git Submodule
```bash
# Add as submodule in your project root
git submodule add https://github.com/your-org/ears-workflow-skill.git .ai-source
cp -r .ai-source/.ai/ .ai/
rm -rf .ai-source/
```

## System Requirements

- **Git**: Version 2.20+ (for worktree support)
- **Node.js**: Version 16+ (optional, for testing)
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)

## IDE Setup

### VS Code + GitHub Copilot
1. Copy `.ai/` directory to project root
2. Restart VS Code for skill discovery
3. Test: `"use EARS workflow"`

### Windsurf IDE
1. Copy `.ai/` directory to project root
2. Skills automatically discovered in `.windsurf/skills/`
3. Test: `"use structured development"`

### Cursor IDE
1. Copy `.ai/` directory to project root
2. Configure Agent-Decided rules (optional)
3. Test: `"use structured development"`

### JetBrains IDEs
```bash
npm install -g openskills
openskills transpile .ai/SKILL.md --target jetbrains
# Configure in IDE Settings → AI Assistant → Custom Skills
```

## Verification

After installation, verify these files exist:
```
your-project/
├── .ai/
│   ├── SKILL.md                 # Main skill definition
│   ├── skills/                  # Individual skills
│   ├── memory/                  # Compound engineering memory
│   ├── docs/                    # Documentation
│   └── tests/                   # Validation tests
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

**Need detailed help?**
- See complete guide: [Installation Guide Reference](.ai/docs/reference/installation-guide.md)
- Check troubleshooting: [Troubleshooting Guide](.ai/docs/guides/troubleshooting.md)
- Run validation: `node .ai/tests/package-completeness-validation.test.js`

## Next Steps
- Read the usage guide: [USAGE.md](USAGE.md)
- Try the workflow examples: `.ai/docs/guides/workflow-examples.md`
- Start with: "use EARS workflow to create a simple feature"