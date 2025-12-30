# EARS-Workflow Skill Package

> **Structured Development Methodology for AI-Assisted Coding**

A comprehensive Agent Skills-compliant package that transforms ideas into production-ready features through disciplined EARS-compliant requirements, property-based testing, and compound engineering principles.

## 🚀 Quick Start

```bash
# Install in your project
cp -r /path/to/ears-workflow-skill/.ai/ /path/to/your/project/

# Activate in your IDE
"use ears-workflow"
```

## ✨ Features

- **🔄 Four-Phase Workflow**: SPEC-FORGE → PLAN → WORK → REVIEW with intelligent sub-phase routing
- **📋 EARS-Compliant Requirements**: Structured specifications with correctness properties
- **🧪 Property-Based Testing**: Automated test generation with fast-check integration
- **🌳 Git Worktree Management**: Isolated development environments with safety checks
- **🔍 Multi-Perspective Reviews**: Security, Performance, Style, and Data Integrity audits
- **🧠 Compound Engineering**: Self-improving system with memory and lessons learned
- **🎯 Progressive Disclosure**: Efficient context management with semantic routing
- **⚡ Structured TDD Sub-Phases**: Create Tests → Implement Code → Refactor with user-guided options
- **🔧 Cross-Platform Support**: Windows (WSL/Git Bash), macOS, and Linux
- **🎨 Multi-IDE Integration**: VS Code, Windsurf, Cursor, JetBrains, and CLI tools

## 📦 What's Included

### Core Workflow Skills
- **`compound-engineering`**: Master orchestration and routing with universal invariants
- **`ears-specification`**: Create formal specifications with EARS patterns and correctness properties
- **`git-worktree`**: Execute TDD implementation in isolated git worktree environments
- **`testing-framework`**: Conduct multi-perspective audits with severity classification

### Utility Skills
- **`project-reset`**: Template-based project state management with archiving

### Supporting Infrastructure
- **Memory System**: Compound engineering with lessons learned and architectural decisions
- **Template Library**: EARS validation, INCOSE quality rules, and workflow templates
- **Testing Framework**: Property-based testing integration with Jest and fast-check
- **Documentation**: Comprehensive guides for installation, usage, and troubleshooting

## 🎯 Use Cases

### New Feature Development
```
"use ears-workflow to create a user authentication system"
→ SPEC-FORGE: Creates formal specification with correctness properties
→ PLAN: Generates implementation plan with TDD approach
→ WORK: Executes in isolated worktree with structured sub-phases
→ REVIEW: Conducts multi-perspective quality review
```

### Targeted Sub-Phase Development
```
"use create tests for authentication module"
→ WORK Sub-Phase A: Sets up test environment and comprehensive test suite

"use implement code for login validation"  
→ WORK Sub-Phase B: Makes tests pass with lessons learned capture

"use refactor authentication for better security"
→ WORK Sub-Phase C: Presents 5 refactoring options with pattern documentation
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
- **IDE**: VS Code, Windsurf, Cursor, JetBrains, or Agent Skills-compatible environment

### Platform-Specific Requirements

#### Windows
- **WSL (Windows Subsystem for Linux)** or **Git Bash** required for bash script execution
- Install via: `wsl --install` or download Git for Windows with Git Bash
- All bash scripts must be run within WSL or Git Bash environment

#### macOS/Linux
- Native bash support - no additional requirements

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

#### Windsurf IDE
1. Copy `.ai/` directory to project root
2. Skills automatically discovered in `.windsurf/skills/`
3. Test: `"use structured development"`

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

- **[Installation Guide](INSTALL.md)**: Quick setup for all IDEs
- **[Usage Guide](USAGE.md)**: Workflow examples and best practices
- **[Complete Reference](.ai/docs/reference/)**: Authoritative documentation
  - [Activation Triggers](.ai/docs/reference/activation-triggers.md)
  - [File Structure](.ai/docs/reference/file-structure.md)
  - [Version Information](.ai/docs/reference/version-info.md)
  - [Installation Guide](.ai/docs/reference/installation-guide.md)
- **[Skills Catalog](.ai/skills/README.md)**: All skills and utilities

## 🔄 Workflow Overview

### Enhanced 4-Phase Structure with Sub-Phase Intelligence

The EARS-Workflow system provides both high-level phase progression and granular sub-phase control:

### 1. SPEC-FORGE Phase
Create formal specifications with EARS-compliant requirements:
```
"use spec-forge to create user authentication system"
→ requirements.md with EARS patterns and glossary
→ design.md with correctness properties for property-based testing
→ tasks.md with implementation plan and testing strategy
```

### 2. PLAN Phase
Develop comprehensive implementation strategy:
```
"use planning to research authentication patterns"
→ Analyzes existing codebase and git history
→ Creates detailed implementation plan
→ Documents architectural decisions
→ Updates compound engineering memory
```

### 3. WORK Phase (Enhanced with Sub-Phase Routing)
Execute using Test-Driven Development with three structured sub-phases:

**Sub-Phase A: Create Tests** (Intelligent Activation: "create tests", "write tests", "tdd setup")
```
"use create tests for user authentication"
→ Creates isolated git worktree: feature/user-authentication
→ Writes comprehensive test suite (unit, property-based, integration)
→ Ensures all tests fail initially (Red phase of TDD)
```

**Sub-Phase B: Implement Code** (Intelligent Activation: "make tests pass", "implement code", "green phase")
```
"use implement code for authentication"
→ Follows Green phase of TDD: make tests pass with minimal code
→ Makes atomic commits after each completed unit
→ Captures implementation lessons and technical decisions
```

**Sub-Phase C: Refactor** (Intelligent Activation: "refactor", "improve code", "design patterns")
```
"use refactor authentication for better security"
→ Presents 5 refactoring options to user:
  1. Performance Optimization
  2. Code Structure improvements  
  3. Design Pattern application
  4. Security Hardening
  5. Keep As-Is
→ Applies selected refactoring while maintaining test coverage
→ Documents refactoring insights and architectural patterns
```

### 4. REVIEW Phase
Conduct multi-perspective quality audit:
```
"use review to audit authentication implementation"
→ Security Sentinel: OWASP vulnerabilities, secrets management
→ Performance Oracle: Algorithmic complexity, database efficiency
→ Framework Purist: Code style, conventions, simplicity
→ Data Integrity Guardian: Schema consistency, migration safety
→ Codifies review findings and quality patterns for future use
```

### Flexible Activation Patterns

**Full Workflow:**
- `"use ears-workflow"` - Complete 4-phase progression
- `"use structured development"` - Guided workflow with approval gates

**Phase-Specific:**
- `"use spec-forge"` - Requirements and design creation
- `"use planning"` - Implementation planning and research
- `"use work"` - Complete TDD implementation (all sub-phases)
- `"use review"` - Multi-perspective quality audit

**Sub-Phase Specific:**
- `"use create tests"` - WORK Sub-Phase A only
- `"use implement code"` - WORK Sub-Phase B only  
- `"use refactor"` - WORK Sub-Phase C only

**Context-Aware:**
- System detects current phase and suggests next logical step
- Learns from user patterns and preferences
- Provides intelligent defaults based on project context

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
# Create feature worktree (Windows: use WSL or Git Bash)
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
Intelligent trigger detection with multi-dimensional confidence scoring and sub-phase routing:

**Main Phase Activation:**
```
"Let's create formal requirements" → SPEC-FORGE (92% confidence)
"Plan the authentication system" → PLAN (90% confidence)  
"Implement user login" → WORK (88% confidence)
"Review this code for security" → REVIEW (98% confidence + security persona)
```

**Sub-Phase Activation:**
```
"Create tests for user validation" → WORK Sub-Phase A (95% confidence)
"Make the login tests pass" → WORK Sub-Phase B (93% confidence)
"Refactor for better performance" → WORK Sub-Phase C (96% confidence)
"Tests failing after implementation" → WORK Sub-Phase B (95% confidence + error context)
```

**Advanced Features:**
- **Context-Aware Progression**: "Created requirements" + "Let's build" → WORK Sub-Phase A (boosted confidence)
- **Error-Driven Activation**: "Security vulnerability" → REVIEW (high priority + security persona)
- **Multi-Intent Handling**: "Create requirements and implement" → Sequence: SPEC-FORGE → PLAN → WORK
- **Sub-Phase Intelligence**: "Refactor authentication" → WORK Sub-Phase C with refactoring options
- **Learning Loop**: Adapts from user corrections and preferences over time

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

- **Installation Issues**: See [Installation Guide](INSTALL.md)
- **Usage Questions**: Check [Usage Guide](USAGE.md)
- **Troubleshooting**: Review [Memory Files](.ai/memory/) for past solutions
- **Bug Reports**: Create issues in the project repository
- **Community**: Join discussions for team adoption guidance

---

**Transform your development process with structured methodology, compound engineering principles, and AI-assisted workflow automation.**