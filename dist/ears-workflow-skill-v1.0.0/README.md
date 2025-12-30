# EARS-Workflow Skill Package

> **Structured Development Methodology for AI-Assisted Coding**

A comprehensive Agent Skills-compliant package that transforms ideas into production-ready features through disciplined EARS-compliant requirements, property-based testing, and compound engineering principles.

## 🚀 Quick Start

```bash
# Install in your project
cp -r /path/to/ears-workflow-skill/.ai/ /path/to/your/project/

# Activate in your IDE
"use EARS workflow"
```

## ✨ Features

- **🔄 Four-Phase Workflow**: SPEC-FORGE → PLAN → WORK → REVIEW
- **📋 EARS-Compliant Requirements**: Structured specifications with correctness properties
- **🧪 Property-Based Testing**: Automated test generation with fast-check integration
- **🌳 Git Worktree Management**: Isolated development environments with safety checks
- **🔍 Multi-Perspective Reviews**: Security, Performance, Style, and Data Integrity audits
- **🧠 Compound Engineering**: Self-improving system with memory and lessons learned
- **🎯 Progressive Disclosure**: Efficient context management with semantic routing
- **🔧 Cross-Platform Support**: Windows (WSL/Git Bash), macOS, and Linux
- **🎨 Multi-IDE Integration**: VS Code, Cursor, JetBrains, and CLI tools

## 📦 What's Included

### Core Workflow Skills
- **`spec-forge`**: Create formal specifications with EARS patterns and correctness properties
- **`planning`**: Develop comprehensive implementation plans and architectural decisions
- **`work`**: Execute TDD implementation in isolated git worktree environments
- **`review`**: Conduct multi-perspective audits with severity classification

### Utility Skills
- **`git-worktree`**: Automated worktree creation, management, and cleanup
- **`project-reset`**: Template-based project state management with archiving

### Supporting Infrastructure
- **Memory System**: Compound engineering with lessons learned and architectural decisions
- **Template Library**: EARS validation, INCOSE quality rules, and workflow templates
- **Testing Framework**: Property-based testing integration with Jest and fast-check
- **Documentation**: Comprehensive guides for installation, usage, and troubleshooting

## 🎯 Use Cases

### New Feature Development
```
"use EARS workflow to create a user authentication system"
→ Creates formal specification with correctness properties
→ Generates implementation plan with TDD approach
→ Executes in isolated worktree with atomic commits
→ Conducts multi-perspective quality review
```

### Bug Fixes with Isolation
```
"use git-worktree to create environment for login bug fix"
→ Creates isolated bugfix/login-validation worktree
→ Implements fix using TDD methodology
→ Reviews changes before merge
→ Cleans up environment after completion
```

### Project Transitions
```
"use project-reset to prepare for new project"
→ Archives current project state with timestamp
→ Resets to clean templates preserving engineering wisdom
→ Provides fresh environment for new development
```

## 🛠 Installation

### System Requirements
- **Git**: Version 2.20+ (for worktree support)
- **Node.js**: Version 16+ (optional, for testing)
- **IDE**: VS Code, Cursor, JetBrains, or Agent Skills-compatible environment

### Quick Install
```bash
# Method 1: Direct Copy (Recommended)
cp -r /path/to/ears-workflow-skill/.ai/ /path/to/your/project/

# Method 2: Git Submodule
git submodule add https://github.com/your-org/ears-workflow-skill.git .ai
git submodule update --init --recursive

# Verify Installation
ls -la .ai/SKILL.md
```

### IDE-Specific Setup

#### VS Code + GitHub Copilot
1. Copy `.ai/` directory to project root
2. Restart VS Code for skill discovery
3. Test: `"use EARS workflow"`

#### Cursor IDE
1. Copy `.ai/` directory to project root
2. Configure Agent-Decided rules (optional)
3. Test: `"use structured development"`

#### JetBrains IDEs
```bash
npm install -g openskills
openskills transpile .ai/SKILL.md --target jetbrains
# Configure in IDE Settings → AI Assistant → Custom Skills
```

## 📚 Documentation

- **[Installation Guide](.ai/docs/guides/installation.md)**: Complete setup for all IDEs
- **[Usage Guide](.ai/docs/guides/usage.md)**: Workflow examples and best practices
- **[API Reference](.ai/skills/README.md)**: All sub-skills and utilities
- **[Migration Guide](.ai/docs/migration-guide.md)**: Upgrading from AGENTS.md

## 🔄 Workflow Overview

### 1. SPEC-FORGE Phase
Create formal specifications with EARS-compliant requirements:
```
"use spec-forge to create user authentication system"
→ requirements.md with EARS patterns and glossary
→ design.md with correctness properties for property-based testing
→ tasks.md with implementation plan and testing strategy
```

### 2. PLANNING Phase
Develop comprehensive implementation strategy:
```
"use planning to research authentication patterns"
→ Analyzes existing codebase and git history
→ Creates detailed implementation plan
→ Documents architectural decisions
→ Updates compound engineering memory
```

### 3. WORK Phase
Execute using Test-Driven Development:
```
"use work to implement authentication system"
→ Creates isolated git worktree: feature/user-authentication
→ Follows Red-Green-Refactor cycle for each task
→ Makes atomic commits with conventional format
→ Runs continuous test validation
```

### 4. REVIEW Phase
Conduct multi-perspective quality audit:
```
"use review to audit authentication implementation"
→ Security Sentinel: OWASP vulnerabilities, secrets management
→ Performance Oracle: Algorithmic complexity, database efficiency
→ Framework Purist: Code style, conventions, simplicity
→ Data Integrity Guardian: Schema consistency, migration safety
→ Synthesizes findings with severity classification
```

## 🧪 Property-Based Testing Integration

The skill automatically generates correctness properties from EARS requirements:

```javascript
// Generated from: "WHEN user provides valid credentials THEN system SHALL authenticate successfully"
Property: Authentication success consistency
For any valid user credentials, authentication should succeed and return user session
**Validates: Requirements 2.1**

// Generated from: "WHEN user provides invalid credentials THEN system SHALL reject with error"
Property: Authentication failure consistency  
For any invalid credentials, authentication should fail with appropriate error message
**Validates: Requirements 2.2**
```

## 🌳 Git Worktree Management

Automated isolated development environments:

```bash
# Create feature worktree
./.ai/skills/git-worktree/git-worktree.sh create feature/user-authentication

# Work in isolation
cd ../worktrees/feature-user-authentication
# ... implement with TDD ...

# Clean up after merge
./.ai/skills/git-worktree/git-worktree.sh remove feature/user-authentication
```

## 🧠 Compound Engineering Memory

Self-improving system that learns from every interaction:

- **`.ai/memory/lessons.md`**: Codified lessons from past mistakes and corrections
- **`.ai/memory/decisions.md`**: Architectural patterns and decision rationale
- **Automatic retrospectives**: Extract principles from chat history corrections
- **Memory consolidation**: Prevent context window bloat with periodic cleanup

## 🔧 Advanced Features

### Semantic Activation Routing
Intelligent trigger detection with confidence scoring:
```
"Let's create formal requirements" → spec-forge (95% confidence)
"Set up development environment" → git-worktree (90% confidence)
"Review this code for security" → review (98% confidence)
```

### Progressive Disclosure
Efficient context management:
- **Tier 1**: Skill metadata for discovery (~50 tokens each)
- **Tier 2**: Active skill instructions (~500-1000 tokens)
- **Tier 3**: Supporting files loaded incrementally as needed

### Cross-Platform Compatibility
- **Windows**: WSL or Git Bash for bash script execution
- **macOS/Linux**: Native bash script support
- **All Platforms**: Node.js automation with cross-platform paths

## 🤝 Contributing

This project maintains backward compatibility with existing AGENTS.md systems while extending capabilities through the Agent Skills Standard.

### Development Setup
```bash
git clone https://github.com/your-org/ears-workflow-skill.git
cd ears-workflow-skill
npm install
npm test
```

### Testing
```bash
# Run all tests
npm test

# Run property-based tests
npm run test:property

# Run with coverage
npm run test:coverage
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Attribution

Based on the [Compound Engineering Plugin](https://github.com/EveryInc/compound-engineering-plugin) by EveryInc, adapted for Agent Skills Standard compliance with progressive disclosure and multi-IDE support.

## 🆘 Support

- **Installation Issues**: See [Installation Guide](.ai/docs/guides/installation.md)
- **Usage Questions**: Check [Usage Guide](.ai/docs/guides/usage.md)
- **Troubleshooting**: Review [Memory Files](.ai/memory/) for past solutions
- **Bug Reports**: Create issues in the project repository
- **Community**: Join discussions for team adoption guidance

---

**Transform your development process with structured methodology, compound engineering principles, and AI-assisted workflow automation.**