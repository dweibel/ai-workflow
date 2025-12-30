# EARS-Workflow Usage Guide

## Overview

The EARS-workflow skill provides a comprehensive structured development methodology through multiple specialized sub-skills. This guide covers all activation methods, workflow examples, and integration patterns for different IDEs and development scenarios.

## Quick Start

### Basic Activation
```
"use EARS workflow"
"start structured development"
"begin EARS methodology"
```

The skill will guide you through the four-phase workflow:
1. **SPEC-FORGE** - Create formal specifications
2. **PLANNING** - Develop implementation plans
3. **WORK** - Execute with TDD in isolated environments
4. **REVIEW** - Conduct multi-perspective audits

### Direct Sub-skill Activation
```
"use spec-forge"     # Jump directly to specification creation
"use planning"       # Start implementation planning
"use work"           # Begin TDD implementation
"use review"         # Conduct code review
"use git-worktree"   # Manage development environments
"use project-reset"  # Reset project state
```

## Sub-Skills Reference

### 1. SPEC-FORGE: Structured Specification Creation

**Purpose**: Transform ideas into formal specifications with EARS-compliant requirements and correctness properties.

**Activation Triggers**:
- `spec-forge`, `SPEC-FORGE`, `specification`
- `requirements`, `EARS`, `user story`
- `design`, `correctness properties`, `property-based testing`
- `create spec`, `formal specification`, `structured requirements`

**Capabilities**:
- **Requirements Creation**: EARS-compliant requirements with glossary and user stories
- **Design Generation**: Architecture with correctness properties for property-based testing
- **Task Planning**: Implementation tasks with integrated testing strategy

**Workflow Example**:
```
User: "use spec-forge to create a user authentication system"

Agent Response:
1. Creates `.kiro/specs/user-authentication/requirements.md` with EARS patterns
2. Generates design document with correctness properties
3. Produces implementation task list with property-based testing
4. Maintains approval gates between each phase
```

**Key Features**:
- **EARS Patterns**: Six structured requirement patterns (ubiquitous, event-driven, etc.)
- **INCOSE Quality**: Active voice, measurable conditions, no vague terms
- **Correctness Properties**: Universal properties for property-based testing
- **Approval Gates**: User review required between requirements → design → tasks

**Output Artifacts**:
- `requirements.md` - EARS-compliant requirements with user stories
- `design.md` - Architecture with correctness properties
- `tasks.md` - Implementation plan with property-based testing integration

### 2. PLANNING: Implementation Planning and Architecture

**Purpose**: Create comprehensive implementation plans and architectural decisions based on formal specifications.

**Activation Triggers**:
- `planning`, `PLAN`, `implementation plan`
- `research`, `analyze`, `investigate`
- `architecture`, `design decisions`, `technical approach`
- `scaffold`, `plan implementation`, `create plan`

**Capabilities**:
- **Research**: Analyze existing patterns and codebase history
- **Architecture**: Define system design and component interactions
- **Strategy**: Plan development approach and risk mitigation
- **Documentation**: Create detailed implementation plans and ADRs

**Workflow Example**:
```
User: "use planning to research and plan the authentication system implementation"

Agent Response:
1. Analyzes existing codebase for authentication patterns
2. Reviews git history for context and previous decisions
3. Creates comprehensive plan at `.ai/docs/plans/2025-12-26-user-authentication.md`
4. Documents architectural decisions in `.ai/docs/decisions/`
5. Updates memory files with research findings
```

**Key Features**:
- **Codebase Analysis**: Pattern discovery and git history review
- **Risk Assessment**: Technical risks and mitigation strategies
- **ADR Creation**: Architectural Decision Records for significant choices
- **Memory Integration**: Updates lessons learned and decision history

**Output Artifacts**:
- `plans/YYYY-MM-DD-feature-name.md` - Comprehensive implementation plan
- `decisions/ADR-XXX-[decision].md` - Architectural decision records
- Updated memory files with research insights

### 3. WORK: Test-Driven Implementation

**Purpose**: Implement features using strict TDD in isolated Git worktree environments.

**Activation Triggers**:
- `implement`, `fix`, `refactor`, `build`, `code`
- `TDD`, `test-driven`, `write tests`
- `git worktree`, `feature branch`, `development`
- `red-green-refactor`, `failing test`, `make it pass`

**Capabilities**:
- **TDD Implementation**: Red-Green-Refactor cycle for all code changes
- **Git Worktree Management**: Isolated development environments
- **Atomic Commits**: Conventional commit format with descriptive messages
- **Continuous Testing**: Full test suite validation throughout development

**Workflow Example**:
```
User: "use work to implement the user authentication system"

Agent Response:
1. Creates git worktree: `../worktrees/feature-user-authentication`
2. Navigates to worktree directory
3. Follows TDD cycle for each task:
   - Red: Write failing test
   - Green: Make test pass with minimal code
   - Refactor: Clean up and improve code
4. Makes atomic commits after each cycle
5. Runs full test suite before completion
```

**Key Features**:
- **Isolated Environment**: Git worktrees prevent main branch contamination
- **TDD Discipline**: Strict Red-Green-Refactor cycle enforcement
- **Atomic Commits**: Each commit represents one complete TDD cycle
- **Cross-Platform**: Works on Windows (WSL/Git Bash), macOS, and Linux

**Output Artifacts**:
- Feature branch with atomic commits
- Comprehensive test coverage for new functionality
- Clean, refactored code following established patterns
- Updated memory files with implementation lessons

### 4. REVIEW: Multi-Perspective Code Audit

**Purpose**: Conduct comprehensive multi-perspective audits to ensure quality, security, performance, and maintainability.

**Activation Triggers**:
- `review`, `audit`, `check`, `assess`
- `code review`, `pull request`, `PR review`
- `security audit`, `performance review`, `quality check`
- `multi-perspective`, `comprehensive review`, `deep review`

**Capabilities**:
- **Multi-Persona Analysis**: Four specialized review perspectives
- **Severity Classification**: CRITICAL/HIGH/MEDIUM/LOW issue categorization
- **Actionable Findings**: Specific fixes with file paths and line numbers
- **Quality Assurance**: Comprehensive checklist before merge approval

**Workflow Example**:
```
User: "use review to audit the authentication implementation"

Agent Response:
1. Adopts Security Sentinel persona - checks for OWASP vulnerabilities
2. Adopts Performance Oracle persona - analyzes algorithmic complexity
3. Adopts Framework Purist persona - validates code style and conventions
4. Adopts Data Integrity Guardian persona - reviews schema and migrations
5. Synthesizes findings into comprehensive report with severity classification
6. Provides merge recommendation (APPROVE/APPROVE WITH CHANGES/REQUEST CHANGES)
```

**Review Personas**:
- **Security Sentinel**: OWASP Top 10, authentication, secrets management
- **Performance Oracle**: Algorithmic complexity, database efficiency, resource management
- **Framework Purist**: Idiomatic code, style conventions, simplicity
- **Data Integrity Guardian**: Schema consistency, migration safety, data validation

**Output Artifacts**:
- Comprehensive multi-persona review document
- Categorized findings with severity classification
- Actionable checklist for required fixes
- Clear merge recommendation with rationale

### 5. GIT-WORKTREE: Isolated Development Environment Management

**Purpose**: Manage Git worktrees for isolated development with automated safety checks.

**Activation Triggers**:
- `git worktree`, `worktree`, `create worktree`
- `feature branch`, `isolated environment`, `parallel development`
- `branch management`, `development environment`, `workspace isolation`

**Capabilities**:
- **Worktree Creation**: Automated setup with proper branch naming
- **Environment Management**: List, status, and cleanup operations
- **Safety Checks**: Validation, confirmation prompts, conflict prevention
- **Cross-Platform**: Unified bash script for all platforms

**Usage Examples**:
```bash
# Create feature worktree
./.ai/skills/git-worktree/git-worktree.sh create feature/user-authentication

# List all worktrees
./.ai/skills/git-worktree/git-worktree.sh list

# Check current environment
./.ai/skills/git-worktree/git-worktree.sh status

# Remove completed worktree
./.ai/skills/git-worktree/git-worktree.sh remove feature/user-authentication

# Cleanup stale references
./.ai/skills/git-worktree/git-worktree.sh cleanup
```

**Directory Structure**:
```
project-root/
├── .git/                    # Main git directory
├── src/                     # Main working directory
└── ../worktrees/           # Worktrees directory
    ├── feature-user-auth/   # Feature worktree
    ├── bugfix-login-issue/  # Bugfix worktree
    └── refactor-api/        # Refactor worktree
```

### 6. PROJECT-RESET: Template-Based Project State Management

**Purpose**: Reset project state to clean templates while preserving engineering wisdom.

**Activation Triggers**:
- `project reset`, `reset project`, `clean project`
- `start fresh`, `new project`, `clean slate`
- `reset memory`, `clear documentation`, `template reset`

**Capabilities**:
- **Selective Reset**: Documentation only, memory only, or full project reset
- **Automatic Archiving**: Timestamped backups before any reset operation
- **Template System**: Clean templates with preserved engineering wisdom
- **Safety Features**: Confirmation prompts and rollback procedures

**Reset Levels**:
```bash
# Documentation reset only (keep all memory)
./.ai/skills/project-reset/project-reset.sh docs

# Memory reset only (keep documentation)
./.ai/skills/project-reset/project-reset.sh memory

# Full project reset (recommended for new projects)
./.ai/skills/project-reset/project-reset.sh project
```

**Archive Management**:
```bash
# List existing archives
./.ai/skills/project-reset/project-reset.sh list-archives

# Restore from specific archive
./.ai/skills/project-reset/project-reset.sh restore 2025-12-26-143022

# Clean old archives (keep last 5)
./.ai/skills/project-reset/project-reset.sh clean-archives --keep 5
```

## Complete Workflow Examples

### Example 1: New Feature Development

**Scenario**: Implementing a user authentication system from scratch

```
1. Specification Creation
User: "use EARS workflow to create a user authentication system"
→ SPEC-FORGE activates
→ Creates requirements.md with EARS patterns
→ Generates design.md with correctness properties
→ Produces tasks.md with implementation plan

2. Implementation Planning
→ PLANNING phase activates automatically
→ Researches existing authentication patterns
→ Creates comprehensive implementation plan
→ Documents architectural decisions

3. TDD Implementation
→ WORK phase activates
→ Creates git worktree: feature/user-authentication
→ Implements using Red-Green-Refactor cycle
→ Makes atomic commits with conventional format

4. Quality Review
→ REVIEW phase activates
→ Multi-persona audit (Security, Performance, Style, Data)
→ Generates findings report with severity classification
→ Provides merge recommendation
```

### Example 2: Bug Fix with Isolated Environment

**Scenario**: Fixing a critical login validation bug

```
User: "use git-worktree to create an environment for fixing the login bug"

Agent Response:
1. Creates worktree: `bugfix/login-validation`
2. Navigates to isolated environment
3. User implements fix using TDD
4. Reviews changes before merge
5. Cleans up worktree after completion
```

### Example 3: Project Transition

**Scenario**: Completing one project and starting another

```
User: "use project-reset to clean up after project completion"

Agent Response:
1. Creates timestamped archive of current project state
2. Resets memory files to clean templates (preserving generic wisdom)
3. Clears project-specific documentation
4. Provides clean environment for new project
5. Maintains all tooling and workflow configurations
```

## IDE Integration Examples

### VS Code with GitHub Copilot

**Setup**:
1. Install EARS-workflow skill package in project root
2. Restart VS Code to discover skills
3. Verify in Command Palette (`Ctrl+Shift+P`)

**Usage**:
```
// In any file, type comment:
// use EARS workflow for user authentication

// Or use chat interface:
"Let's use structured development for this feature"

// Direct sub-skill activation:
// use spec-forge to create requirements
```

**Features**:
- **Auto-discovery**: Copilot finds skills in `.ai/` directory
- **Context awareness**: Loads relevant phase instructions
- **Progressive disclosure**: Only active skills consume context tokens

### Cursor IDE

**Setup**:
1. Install skill package in project
2. Configure Agent-Decided rules:
   - "Use EARS-workflow for structured development"
   - "Activate spec-forge for requirements creation"
   - "Use git-worktree for isolated development"

**Usage**:
```
"Let's use structured development for this feature"
→ Activates EARS-workflow with phase progression

"Create formal requirements for user authentication"
→ Activates SPEC-FORGE directly

"Set up isolated development environment"
→ Activates git-worktree utility
```

**Features**:
- **Semantic routing**: Intelligent skill activation based on context
- **Phase awareness**: Automatic progression through workflow phases
- **Memory integration**: Access to compound engineering memory

### JetBrains IDEs (IntelliJ, PyCharm, WebStorm)

**Setup via CLI Tools**:
```bash
# Install CLI tools
npm install -g openskills rulesync

# Transpile for JetBrains
openskills transpile .ai/SKILL.md --target jetbrains

# Configure in IDE Settings → AI Assistant → Custom Skills
```

**Setup via MCP Server** (if available):
```bash
# Install MCP server for EARS-workflow
npm install -g ears-workflow-mcp-server

# Configure in IDE MCP settings
# Point to EARS-workflow MCP server
```

**Usage**:
```
// Through AI Assistant chat:
"Use EARS workflow for this feature"

// Through custom skill commands:
Ctrl+Shift+A → "EARS: Create Specification"
Ctrl+Shift+A → "EARS: Start TDD Implementation"
```

### CLI Integration

**Direct Script Usage**:
```bash
# Git worktree management
./.ai/skills/git-worktree/git-worktree.sh create feature/new-feature

# Project reset operations
./.ai/skills/project-reset/project-reset.sh project

# Skill transpilation for other IDEs
openskills transpile .ai/SKILL.md --target vscode
rulesync sync .ai/ --target cursor
```

## Best Practices

### Workflow Discipline

**Phase Sequence**:
- Always start with SPEC-FORGE for new features
- Complete each phase before proceeding to the next
- Use approval gates to ensure quality at each step
- Don't skip phases even for "simple" changes

**Memory Management**:
- Consult memory files before starting any work
- Update lessons learned after completing tasks
- Document architectural decisions for future reference
- Regularly review and consolidate memory files

### Development Environment

**Git Worktree Usage**:
- Create worktree for every feature, bugfix, or refactor
- Work exclusively in worktree directory during development
- Use descriptive branch names with appropriate prefixes
- Clean up worktrees promptly after completion

**Testing Discipline**:
- Write tests before implementation (Red-Green-Refactor)
- Run full test suite before considering work complete
- Use property-based testing for universal properties
- Maintain high test coverage for all new functionality

### Code Quality

**Review Process**:
- Conduct multi-perspective reviews for all changes
- Address CRITICAL and HIGH severity findings before merge
- Use specific, actionable feedback with file paths and line numbers
- Document review findings and resolutions

**Commit Hygiene**:
- Make atomic commits representing single logical changes
- Use conventional commit format (feat:, fix:, refactor:, etc.)
- Write descriptive commit messages explaining the "why"
- Push changes regularly to preserve work

## Troubleshooting

### Common Issues

#### Skill Not Activating
**Problem**: IDE doesn't recognize EARS-workflow triggers
**Solutions**:
- Verify `.ai/SKILL.md` exists with valid YAML frontmatter
- Restart IDE to refresh skill discovery
- Check IDE-specific skill configuration
- Try exact trigger phrases: "use EARS workflow"

#### Worktree Creation Fails
**Problem**: Git worktree commands fail
**Solutions**:
- Ensure Git 2.20+ is installed
- Check that base branch is up to date
- Verify directory permissions for `../worktrees/`
- On Windows, use WSL or Git Bash for bash scripts

#### Memory Files Not Loading
**Problem**: Compound engineering memory not accessible
**Solutions**:
- Verify `.ai/memory/lessons.md` and `decisions.md` exist
- Check file permissions and readability
- Initialize empty memory files if missing
- Validate file format (proper markdown structure)

#### Phase Sequence Issues
**Problem**: Skill allows phase skipping or wrong sequence
**Solutions**:
- Explicitly start with "use EARS workflow" for full sequence
- Complete approval gates before proceeding to next phase
- Use direct sub-skill activation only when appropriate
- Consult phase documentation for proper sequence

### Advanced Troubleshooting

#### Context Window Issues
**Problem**: Skill loading too much context, hitting token limits
**Solutions**:
- Use progressive disclosure - activate only needed sub-skills
- Review memory file sizes and consolidate if needed
- Use direct sub-skill activation instead of full workflow
- Configure IDE context window limits appropriately

#### Cross-Platform Compatibility
**Problem**: Scripts fail on different operating systems
**Solutions**:
- On Windows, use WSL or Git Bash for bash scripts
- Ensure consistent line endings (LF vs CRLF)
- Check file permissions and executable flags
- Use platform-appropriate path separators

#### Integration Problems
**Problem**: Skill doesn't work with specific IDE or tool
**Solutions**:
- Check IDE version and Agent Skills support level
- Try CLI tools (openskills, rulesync) for transpilation
- Consider MCP server integration for advanced IDEs
- Review IDE-specific documentation and requirements

## Advanced Usage Patterns

### Custom Workflow Adaptations

**Micro-Services Development**:
```
1. Use SPEC-FORGE for each service specification
2. Create separate worktrees for each service
3. Use REVIEW for cross-service integration analysis
4. Apply PROJECT-RESET between service implementations
```

**Legacy Code Refactoring**:
```
1. Use PLANNING to analyze existing code patterns
2. Create SPEC-FORGE specifications for desired end state
3. Use WORK with TDD to refactor incrementally
4. Apply REVIEW for regression analysis
```

**Team Collaboration**:
```
1. Share SPEC-FORGE artifacts for team alignment
2. Use PLANNING for architectural decision documentation
3. Individual WORK phases in separate worktrees
4. Collaborative REVIEW with multiple perspectives
```

### Automation Integration

**CI/CD Pipeline Integration**:
```bash
# Automated testing of specifications
npm run test:property-based

# Automated worktree cleanup
./.ai/skills/git-worktree/git-worktree.sh cleanup

# Automated project reset for clean builds
./.ai/skills/project-reset/project-reset.sh project --confirm
```

**Git Hooks Integration**:
```bash
# Pre-commit hook: Run tests and linting
#!/bin/bash
npm test && npm run lint

# Post-merge hook: Clean up completed worktrees
./.ai/skills/git-worktree/git-worktree.sh cleanup
```

## Getting Help

### Documentation Resources
- **Installation Guide**: `.ai/docs/guides/installation.md`
- **Sub-skill Documentation**: `.ai/skills/*/SKILL.md`
- **Script Documentation**: `.ai/skills/*/README.md`
- **Examples**: `.ai/skills/*/examples.md`

### Community Support
- **Project Repository**: Check issues and discussions
- **Team Documentation**: Internal team guidelines and adaptations
- **IDE Communities**: IDE-specific Agent Skills forums and support

### Troubleshooting Resources
- **Memory Files**: Check `.ai/memory/lessons.md` for past solutions
- **Decision History**: Review `.ai/memory/decisions.md` for context
- **Archive Restoration**: Use project-reset archives for rollback
- **Script Debugging**: Enable verbose output in skill scripts

The EARS-workflow skill system is designed to improve your development process through structured methodology, compound engineering principles, and progressive skill activation. Start with simple workflows and gradually adopt more advanced capabilities as you become familiar with the system.