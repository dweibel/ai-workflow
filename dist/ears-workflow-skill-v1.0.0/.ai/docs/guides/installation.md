# EARS-Workflow Installation Guide

## Overview

The EARS-workflow skill package provides a structured development methodology that can be installed into any project and used with various AI coding assistants. This guide covers installation for different IDEs and troubleshooting common issues.

## System Requirements

- **Git**: Version 2.20 or higher
- **Node.js**: Version 16 or higher (for testing and validation)
- **Operating System**: Windows (with WSL/Git Bash), macOS, or Linux
- **IDE**: VS Code, Cursor, JetBrains IDEs, or any Agent Skills-compatible environment

## Quick Installation

### Method 1: Direct Copy (Recommended)

1. **Download or clone** the EARS-workflow skill package
2. **Copy the entire `.ai/` directory** to your project root:
   ```bash
   cp -r /path/to/ears-workflow/.ai/ /path/to/your/project/
   ```
3. **Verify installation** by checking that `.ai/SKILL.md` exists in your project root
4. **Test activation** by asking your AI assistant: "use EARS workflow"

### Method 2: Git Submodule (For Version Control)

1. **Add as submodule** in your project root:
   ```bash
   git submodule add https://github.com/your-org/ears-workflow.git .ai
   ```
2. **Initialize submodule**:
   ```bash
   git submodule update --init --recursive
   ```
3. **Verify installation** and test activation as above

## IDE-Specific Setup

### VS Code with GitHub Copilot

**Prerequisites:**
- VS Code with GitHub Copilot extension installed
- Agent Skills support enabled (available in recent Copilot versions)

**Setup Steps:**
1. **Install the skill package** using Method 1 or 2 above
2. **Restart VS Code** to allow Copilot to discover the new skill
3. **Verify discovery** by opening the Command Palette (`Ctrl+Shift+P`) and looking for EARS-workflow in skill suggestions
4. **Test activation** in any file by typing: `// use EARS workflow`

**Configuration Options:**
- **Skill Directory**: VS Code Copilot automatically discovers skills in `.ai/` directories
- **Auto-activation**: Configure in VS Code settings under `github.copilot.skills.autoActivate`
- **Context Window**: Adjust `github.copilot.skills.contextSize` if needed (default: 8000 tokens)

### Cursor IDE

**Prerequisites:**
- Cursor IDE installed
- Agent-Decided rules feature enabled

**Setup Steps:**
1. **Install the skill package** in your project root
2. **Configure Agent-Decided rules**:
   - Open Cursor Settings (`Ctrl+,`)
   - Navigate to "Agent-Decided Rules"
   - Add rule: "Use EARS-workflow skill for structured development"
3. **Add skill activation rule**:
   ```
   When user mentions "EARS workflow", "structured development", or "formal specification", 
   activate the EARS-workflow skill from .ai/SKILL.md
   ```
4. **Test activation** by asking: "Let's use structured development for this feature"

**Integration Features:**
- **Automatic Phase Detection**: Cursor can detect which workflow phase is appropriate
- **Context Switching**: Seamless transitions between SPEC-FORGE, PLAN, WORK, and REVIEW phases
- **Memory Integration**: Access to compound engineering memory files

### JetBrains IDEs (IntelliJ, PyCharm, WebStorm, etc.)

**Prerequisites:**
- JetBrains IDE with AI Assistant plugin
- CLI tools: `openskills` or `rulesync` (install via npm)

**Setup Steps:**
1. **Install CLI tools**:
   ```bash
   npm install -g openskills rulesync
   ```
2. **Install the skill package** in your project root
3. **Transpile for JetBrains**:
   ```bash
   openskills transpile .ai/SKILL.md --target jetbrains
   ```
4. **Configure AI Assistant**:
   - Open IDE Settings (`Ctrl+Alt+S`)
   - Navigate to "AI Assistant" → "Custom Skills"
   - Import the transpiled skill configuration
5. **Test activation** through AI Assistant chat

**Alternative: MCP Server Integration**
For advanced integration, the skill package can be used with Model Context Protocol servers:
1. **Install MCP server** for EARS-workflow (if available)
2. **Configure in IDE** through MCP settings
3. **Access via AI Assistant** with full context awareness

### Claude Code / Other IDEs

**Prerequisites:**
- IDE with Agent Skills support or custom rule configuration
- Ability to load external skill definitions

**Setup Steps:**
1. **Install the skill package** in your project root
2. **Configure skill loading**:
   - Add `.ai/` directory to skill search paths
   - Enable external skill loading in IDE settings
3. **Import skill definition**:
   - Point IDE to `.ai/SKILL.md` as skill definition
   - Configure activation triggers for EARS-workflow
4. **Test activation** using IDE-specific commands

## Verification Steps

After installation, verify that everything is working correctly:

### 1. File Structure Check
Ensure these key files exist in your project:
```
your-project/
├── .ai/
│   ├── SKILL.md                 # Main skill definition
│   ├── skills/                  # Sub-skills directory
│   │   ├── spec-forge/SKILL.md
│   │   ├── planning/SKILL.md
│   │   ├── work/SKILL.md
│   │   ├── review/SKILL.md
│   │   ├── git-worktree/SKILL.md
│   │   └── project-reset/SKILL.md
│   ├── memory/                  # Compound engineering memory
│   ├── workflows/               # Phase workflows
│   ├── templates/               # EARS templates
│   └── docs/                    # Documentation
```

### 2. Skill Discovery Test
Test that your IDE can discover the skill:
- **VS Code**: Check Command Palette for EARS-workflow
- **Cursor**: Verify in Agent-Decided rules list
- **JetBrains**: Check AI Assistant custom skills
- **Other**: Use IDE-specific skill discovery method

### 3. Activation Test
Test basic activation:
1. **Open any file** in your project
2. **Ask your AI assistant**: "use EARS workflow"
3. **Expected response**: Skill should activate and provide phase selection
4. **Verify context loading**: Assistant should reference EARS methodology

### 4. Sub-skill Test
Test sub-skill activation:
1. **Try specific sub-skill**: "use spec-forge"
2. **Expected response**: SPEC-FORGE phase should activate
3. **Verify capabilities**: Should offer requirements creation, EARS patterns

### 5. Memory Integration Test
Test compound engineering memory:
1. **Ask**: "What lessons have been learned in this project?"
2. **Expected response**: Should reference `.ai/memory/lessons.md`
3. **Verify access**: Memory files should be accessible and readable

## Troubleshooting

### Common Issues and Solutions

#### Issue: Skill Not Discovered
**Symptoms:** IDE doesn't recognize EARS-workflow skill
**Solutions:**
1. **Check file permissions**: Ensure `.ai/` directory is readable
2. **Verify YAML frontmatter**: Validate `.ai/SKILL.md` has correct metadata
3. **Restart IDE**: Some IDEs require restart for skill discovery
4. **Check IDE version**: Ensure Agent Skills support is available
5. **Validate file structure**: Ensure all required files are present

#### Issue: Activation Fails
**Symptoms:** Skill doesn't activate when triggered
**Solutions:**
1. **Check trigger phrases**: Use exact phrases like "use EARS workflow"
2. **Verify context window**: Ensure sufficient context space available
3. **Check dependencies**: Ensure all sub-skill files are present
4. **Review error messages**: Look for specific activation error details
5. **Test with simple trigger**: Try "ears-workflow" as minimal trigger

#### Issue: Sub-skills Not Working
**Symptoms:** Main skill works but sub-skills don't activate
**Solutions:**
1. **Verify sub-skill files**: Check that all `skills/*/SKILL.md` files exist
2. **Check YAML metadata**: Validate frontmatter in sub-skill files
3. **Test individual activation**: Try "use spec-forge" directly
4. **Review file paths**: Ensure references/ directories are properly structured
5. **Check progressive disclosure**: Verify context loading is working

#### Issue: Memory Files Not Accessible
**Symptoms:** Compound engineering memory not loading
**Solutions:**
1. **Check file existence**: Verify `.ai/memory/lessons.md` and `decisions.md` exist
2. **Validate file format**: Ensure memory files are properly formatted
3. **Check permissions**: Ensure memory files are readable
4. **Initialize if missing**: Create empty memory files if they don't exist
5. **Test direct access**: Try asking about specific memory content

#### Issue: Git Worktree Scripts Fail
**Symptoms:** Git worktree management doesn't work
**Solutions:**
1. **Check platform**: On Windows, use WSL or Git Bash for bash scripts
2. **Verify Git version**: Ensure Git 2.20+ for worktree support
3. **Check script permissions**: Ensure scripts are executable
4. **Test manually**: Try running scripts directly from command line
5. **Review error output**: Check specific error messages from git commands

#### Issue: Cross-Platform Compatibility
**Symptoms:** Skill works on one platform but not another
**Solutions:**
1. **Check line endings**: Ensure consistent line endings (LF vs CRLF)
2. **Verify path separators**: Check for platform-specific path issues
3. **Test script compatibility**: Ensure bash scripts work on target platform
4. **Check file permissions**: Verify executable permissions on scripts
5. **Use platform tools**: On Windows, prefer WSL or Git Bash

### Advanced Troubleshooting

#### Debugging Skill Activation
1. **Enable verbose logging** in your IDE (if available)
2. **Check IDE console** for skill loading messages
3. **Validate YAML parsing** using online YAML validators
4. **Test minimal skill** with basic SKILL.md to isolate issues
5. **Review IDE documentation** for Agent Skills troubleshooting

#### Performance Issues
1. **Monitor context window usage** - skill uses progressive disclosure
2. **Check memory file sizes** - large memory files may impact performance
3. **Optimize skill loading** - ensure only necessary files are loaded
4. **Review IDE settings** - adjust context size limits if needed
5. **Consider skill splitting** - break large skills into smaller components

#### Integration Problems
1. **Check IDE compatibility** - verify Agent Skills support level
2. **Test with minimal configuration** - start with basic setup
3. **Review integration documentation** - check IDE-specific requirements
4. **Test CLI tools** - verify openskills/rulesync work correctly
5. **Consider alternative integration** - try MCP servers if available

## Getting Help

If you continue to experience issues:

1. **Check Documentation**: Review `.ai/docs/guides/usage.md` for usage examples
2. **Review Examples**: Look at `.ai/skills/*/examples.md` for working examples
3. **Check Issues**: Look for similar issues in the project repository
4. **Community Support**: Ask in project discussions or forums
5. **Create Issue**: Report bugs with detailed reproduction steps

## Next Steps

After successful installation:
1. **Read the Usage Guide**: See `.ai/docs/guides/usage.md`
2. **Try a Simple Workflow**: Start with "use EARS workflow" and follow the guided process
3. **Explore Sub-skills**: Test individual capabilities like "use spec-forge"
4. **Review Examples**: Check existing projects using EARS-workflow
5. **Customize for Your Team**: Adapt templates and workflows as needed

The EARS-workflow skill is designed to improve your development process through structured methodology and compound engineering principles. Start with simple features and gradually adopt more advanced capabilities as you become familiar with the system.