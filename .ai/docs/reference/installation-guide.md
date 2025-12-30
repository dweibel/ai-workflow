# Installation Guide Reference

> **Comprehensive installation instructions for all platforms and IDEs**

## Quick Installation

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

# Or keep as submodule (advanced)
git submodule add https://github.com/your-org/ears-workflow-skill.git .ai
git submodule update --init --recursive
```

### Method 3: Package Manager (Future)
```bash
# Coming soon
npm install -g ears-workflow-skill
ears-workflow install
```

## System Requirements

### Essential Requirements
- **Git**: Version 2.20+ (for worktree support)
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)

### Optional Requirements
- **Node.js**: Version 16+ (for testing and validation)
- **IDE**: VS Code, Cursor, JetBrains IDEs, or Agent Skills-compatible environment

## Platform-Specific Setup

### Windows
```powershell
# Prerequisites
# 1. Install Git for Windows (includes Git Bash)
# 2. Install WSL (recommended) or ensure Git Bash is available

# Installation
Copy-Item -Recurse "C:\path\to\ears-workflow-skill\.ai" "C:\path\to\your\project\"

# Verify
Test-Path "C:\path\to\your\project\.ai\SKILL.md"

# For bash scripts, use WSL or Git Bash:
wsl bash .ai/skills/git-workflow/scripts/git-worktree.sh --help
# OR
"C:\Program Files\Git\bin\bash.exe" .ai/skills/git-workflow/scripts/git-worktree.sh --help
```

### macOS
```bash
# Prerequisites (using Homebrew)
brew install git node

# Installation
cp -r /path/to/ears-workflow-skill/.ai/ /path/to/your/project/

# Set executable permissions
chmod +x /path/to/your/project/.ai/skills/*/scripts/*.sh

# Verify
ls -la /path/to/your/project/.ai/SKILL.md
```

### Linux
```bash
# Prerequisites (Ubuntu/Debian)
sudo apt update
sudo apt install git nodejs npm

# Prerequisites (CentOS/RHEL)
sudo yum install git nodejs npm

# Installation
cp -r /path/to/ears-workflow-skill/.ai/ /path/to/your/project/

# Set executable permissions
chmod +x /path/to/your/project/.ai/skills/*/scripts/*.sh

# Verify
ls -la /path/to/your/project/.ai/SKILL.md
```

## IDE-Specific Configuration

### VS Code + GitHub Copilot

#### Prerequisites
- VS Code 1.85+
- GitHub Copilot extension
- Agent Skills support enabled

#### Setup
1. Copy `.ai/` directory to project root
2. Restart VS Code
3. Verify in Command Palette (`Ctrl+Shift+P`): "Agent Skills"
4. Test: Type "use EARS workflow" in any file

#### Configuration
```json
// .vscode/settings.json (optional)
{
  "github.copilot.enable": {
    "*": true
  },
  "github.copilot.advanced": {
    "agentSkills.enabled": true
  }
}
```

### Cursor IDE

#### Prerequisites
- Cursor IDE 0.40+
- Agent-Decided rules feature enabled

#### Setup
1. Copy `.ai/` directory to project root
2. Open Cursor Settings (`Ctrl+,`)
3. Navigate to "Agent-Decided Rules"
4. Add rule: "Use EARS-workflow skill for structured development"
5. Test: "use structured development"

#### Configuration
```json
// .cursor/settings.json (optional)
{
  "agentDecidedRules": [
    "Use EARS-workflow skill for structured development",
    "Apply compound engineering principles"
  ]
}
```

### JetBrains IDEs

#### Prerequisites
- JetBrains IDE 2023.3+
- AI Assistant plugin
- CLI tools: `openskills` or MCP server

#### Method 1: CLI Tools
```bash
# Install CLI tools
npm install -g openskills

# Transpile for JetBrains
openskills transpile .ai/SKILL.md --target jetbrains

# Configure in IDE Settings → AI Assistant → Custom Skills
```

#### Method 2: MCP Server (Advanced)
```bash
# Install MCP server
npm install -g @ears-workflow/mcp-server

# Configure in IDE Settings → AI Assistant → MCP Servers
# Server URL: http://localhost:3000
```

### CLI Tools

#### Universal Skills Loader
```bash
# Install universal loader
npm install -g openskills rulesync

# Load skills
openskills load .ai/SKILL.md

# Sync across IDEs
rulesync --source .ai/ --targets vscode,cursor,jetbrains
```

## Verification Steps

### 1. File Structure Check
```bash
# Required files checklist
test -f .ai/SKILL.md && echo "✓ Main skill found"
test -f .ai/memory/lessons.md && echo "✓ Memory system found"
test -f .ai/skills/README.md && echo "✓ Skills catalog found"
test -d .ai/skills/compound-engineering && echo "✓ Core skills found"
```

### 2. Activation Test
1. Open any file in your project
2. Ask your AI assistant: "use EARS workflow"
3. Expected response: Skill should activate and provide phase selection
4. Verify context loading: Assistant should reference EARS methodology

### 3. Script Execution Test
```bash
# Test git worktree script (Unix/Linux/macOS)
.ai/skills/git-workflow/scripts/git-worktree.sh --help

# Test on Windows (WSL)
wsl bash .ai/skills/git-workflow/scripts/git-worktree.sh --help

# Test validation suite
node .ai/skills/testing-framework/scripts/run-validation-suite.js --dry-run
```

### 4. Automated Validation
```bash
# Run comprehensive validation
node .ai/tests/package-completeness-validation.test.js

# Run multi-environment validation
node .ai/tests/multi-environment-validation.test.js

# Run final validation
node .ai/tests/final-package-validation.test.js
```

## Troubleshooting

### Common Issues

#### Skill Not Discovered
**Symptoms**: IDE doesn't recognize EARS-workflow skill
**Solutions**:
- Check file permissions: `ls -la .ai/SKILL.md`
- Verify YAML frontmatter: `head -20 .ai/SKILL.md`
- Restart IDE for skill discovery
- Check IDE-specific skill configuration

#### Activation Fails
**Symptoms**: Skill doesn't activate when triggered
**Solutions**:
- Use exact trigger phrases: "use EARS workflow"
- Check IDE Agent Skills support version
- Verify all required files present: `node .ai/tests/package-completeness-validation.test.js`
- Clear IDE cache and restart

#### Scripts Don't Execute
**Symptoms**: Git worktree or other scripts fail
**Solutions**:
- **Windows**: Use WSL or Git Bash: `wsl bash script.sh`
- **Unix**: Check permissions: `chmod +x script.sh`
- **All**: Verify Git version: `git --version` (need 2.20+)

#### Memory Files Not Loading
**Symptoms**: Compound engineering memory not accessible
**Solutions**:
- Check file existence: `ls -la .ai/memory/`
- Verify file permissions: `chmod 644 .ai/memory/*.md`
- Initialize if missing: `touch .ai/memory/lessons.md .ai/memory/decisions.md`

### Platform-Specific Issues

#### Windows-Specific
- **Line Endings**: Ensure Git autocrlf is configured: `git config --global core.autocrlf true`
- **Path Length**: Use shorter project paths if encountering path length limits
- **Permissions**: Run as Administrator if file permission issues occur

#### macOS-Specific
- **Gatekeeper**: Allow terminal access for scripts: System Preferences → Security & Privacy
- **Homebrew**: Use Homebrew for consistent package management

#### Linux-Specific
- **Permissions**: Ensure user has write access to project directory
- **Dependencies**: Install build-essential if Node.js compilation needed

## Advanced Configuration

### Custom Installation Locations
```bash
# Install to custom location
INSTALL_DIR="/custom/path" node scripts/install.js

# Symlink approach
ln -s /shared/ears-workflow/.ai /project/.ai
```

### Team Setup
```bash
# Shared team configuration
git submodule add https://company.com/ears-workflow-config.git .ai-config
cp .ai-config/team-settings/* .ai/

# Version pinning
git submodule update --init --recursive
cd .ai && git checkout v1.0.0
```

### CI/CD Integration
```yaml
# .github/workflows/ears-workflow.yml
name: EARS Workflow Validation
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: node .ai/tests/final-package-validation.test.js
```

## Getting Help

### Documentation Resources
- **Quick Reference**: `.ai/docs/reference/`
- **User Guides**: `.ai/docs/guides/`
- **Troubleshooting**: `.ai/docs/guides/troubleshooting.md`

### Support Channels
- **Issues**: Create issues in project repository
- **Discussions**: Join community discussions
- **Documentation**: Check memory files for past solutions: `.ai/memory/lessons.md`

### Validation Tools
- **Package Validation**: `node .ai/tests/package-completeness-validation.test.js`
- **Environment Check**: `node .ai/tests/multi-environment-validation.test.js`
- **Skills Validation**: `node scripts/skills/validate-skills.js`