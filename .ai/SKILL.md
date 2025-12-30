---
name: ears-workflow
description: Structured development methodology with EARS-compliant requirements, property-based testing, and compound engineering principles. Use this skill when starting a new feature, creating specifications, or following structured development practices. Supports SPEC-FORGE → PLAN → WORK → REVIEW workflow phases.
version: 1.0.0
---

# EARS-Workflow: Structured Development Methodology

## Overview

The ears-workflow skill provides a comprehensive structured development methodology that transforms ideas into production-ready features through a disciplined four-phase approach. This skill integrates EARS-compliant requirements engineering, property-based testing, and compound engineering principles to create a self-improving development system.

## Workflow Phases

The EARS-workflow enforces a strict phase sequence that ensures quality and completeness:

1. **SPEC-FORGE** - Create formal specifications with EARS requirements and correctness properties
2. **PLAN** - Develop comprehensive implementation plans and architectural decisions  
3. **WORK** - Execute implementation using TDD in isolated git worktrees
4. **REVIEW** - Conduct multi-perspective audits for security, performance, and quality

## Prime Directive

You are a **Compound Engineer**. Every task must satisfy two criteria:

1. **Functional Success**: The code works, satisfies requirements, and passes all tests
2. **Systemic Improvement**: You update documentation, add reusable patterns, or codify lessons that prevent future errors

This creates a compounding effect where each unit of engineering effort reduces the friction of all subsequent units.

## Activation

This skill uses intelligent semantic routing to detect activation intent. For complete trigger reference, see [Activation Triggers Reference](.ai/docs/reference/activation-triggers.md).

### Primary Triggers
- `ears-workflow`, `use ears workflow`, `structured development`
- `formal specification`, `compound engineering`, `start ears`

### Workflow Integration
The skill automatically routes to appropriate specialized skills based on user intent:
- **Requirements/Specifications** → `ears-specification` skill
- **Implementation/Development** → `git-workflow` skill  
- **Review/Audit** → `testing-framework` skill
- **Orchestration/Routing** → `compound-engineering` skill

## Skills Available

The EARS-workflow includes specialized skills for focused capabilities:

### Workflow Phase Skills
- **compound-engineering**: Master orchestration and routing
- **ears-specification**: EARS requirements creation, design generation, correctness properties
- **git-workflow**: TDD implementation, git worktree management, execution protocols
- **testing-framework**: Multi-perspective audits, security reviews, performance analysis

### Utility Skills
- **project-reset**: Project state reset, template restoration, memory management

## Context Loading Strategy

The skill uses progressive disclosure to manage context efficiently:

- **Tier 1**: Skill metadata for discovery (minimal tokens)
- **Tier 2**: Phase-specific instructions loaded on activation
- **Tier 3**: Supporting files and scripts loaded as needed

### Activation Router Integration

The system includes an intelligent activation router (`.ai/skills/activation-router.js`) that:
- **Semantic Analysis**: Analyzes user input for trigger phrases with confidence scoring
- **Phase Validation**: Enforces SPEC-FORGE → PLANNING → WORK → REVIEW sequence
- **Context Management**: Loads only relevant instructions to optimize token usage
- **Error Handling**: Provides specific troubleshooting for activation failures

### Progressive Loading

1. **Skill Discovery**: YAML frontmatter loaded for all skills (~50 tokens each)
2. **Activation**: Detailed instructions loaded for active skills (~500-1000 tokens)
3. **Execution**: Supporting files loaded incrementally as needed
4. **Transition**: Previous phase context unloaded, new phase context loaded

## Memory Integration

The skill maintains compound learning through:
- `.ai/memory/lessons.md` - Codified lessons from past mistakes
- `.ai/memory/decisions.md` - Architectural patterns and decisions
- Automatic retrospectives that extract principles from corrections

## AGENTS.md Integration

This skill system preserves and extends all AGENTS.md functionality:
- **Complete Backward Compatibility**: All existing AGENTS.md content remains accessible
- **Enhanced Capabilities**: New skill activation and progressive disclosure features
- **Preserved Attribution**: Original Compound Engineering Plugin attribution maintained
- **Migration Path**: Seamless transition for existing users (see `.ai/docs/migration-guide.md`)
- **Memory Continuity**: All existing memory files and patterns continue to work unchanged

## Universal Invariants

These rules apply across ALL phases:

### Code Safety
- Never modify code without explicit user request
- Never make destructive changes without confirmation
- Never commit without running tests first

### Git Hygiene  
- Always use dedicated git worktrees for implementation
- Never work directly on main branch for features
- Always use atomic, descriptive commits
- Always clean up worktrees after completion

### Knowledge Management
- Always consult memory files before proposing solutions
- Always update memory when new patterns are learned
- Always verify assumptions by reading actual files

### Test-Driven Development
- Always write tests before implementation (Red-Green-Refactor)
- Never skip tests for "simple" changes
- Always run full test suite before completion

## Error Handling

When activation fails or issues arise:
1. Check that required files exist in `.ai/` directory structure
2. Verify YAML frontmatter is valid in all SKILL.md files
3. Ensure memory files are accessible and properly formatted
4. Validate that sub-skill dependencies are met

For troubleshooting, consult the installation documentation or check the skill package completeness.

## Integration

This skill integrates with:
- **VS Code Copilot**: Native Agent Skills support
- **Cursor**: Agent-Decided rules integration
- **JetBrains IDEs**: Via CLI tools (openskills, rulesync) or MCP servers
- **CLI Tools**: Compatible with skill transpilation and injection tools

## Getting Started

1. Ensure the complete `.ai/` directory structure is installed
2. Invoke the skill: "use EARS workflow" or "start SPEC-FORGE"
3. Follow the guided phase progression
4. Use sub-skills for focused capabilities as needed

The skill will guide you through the structured development process, ensuring both functional success and systemic improvement with each iteration.