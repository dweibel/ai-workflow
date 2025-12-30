# Migration Guide: From AGENTS.md to EARS-Workflow Skills

## Overview

The EARS-workflow skill system preserves all existing AGENTS.md functionality while providing enhanced capabilities through the Agent Skills standard. This guide helps existing users understand the changes and migration path.

## What's Preserved

### ✅ Complete Functionality
- All AGENTS.md content remains accessible and functional
- Memory files (.ai/memory/lessons.md and .ai/memory/decisions.md) work unchanged
- All existing workflows, templates, and prompts are preserved
- Git worktree scripts and project reset capabilities remain intact
- Attribution to original Compound Engineering Plugin is maintained

### ✅ Core Principles
- **Prime Directive**: Compound Engineering principles remain central
- **Context Routing**: Enhanced with semantic skill activation
- **Universal Invariants**: All hard rules are preserved and enforced
- **Skills & Automation**: Expanded with new sub-skill capabilities
- **Workflow Phases**: SPEC-FORGE → PLAN → WORK → REVIEW sequence maintained
- **Codification Rule**: Memory file updates and retrospectives continue

## What's Enhanced

### 🚀 New Capabilities
- **Explicit Skill Activation**: Use "EARS-workflow" or specific sub-skills
- **Progressive Disclosure**: Load only relevant context to optimize token usage
- **IDE Integration**: Compatible with VS Code Copilot, Cursor, and other Agent Skills tools
- **Modular Architecture**: Access specific capabilities without loading entire system
- **Version Management**: Proper versioning and package management

### 🚀 Improved Organization
- **Structured Sub-Skills**: spec-forge, planning, work, review, git-worktree, project-reset
- **Clear Activation Patterns**: Semantic routing based on user intent
- **Better Documentation**: Each skill has focused documentation and examples
- **Enhanced Testing**: Property-based testing for correctness validation

## Migration Steps

### For Existing Projects

1. **No Action Required**: Your existing .ai/ directory continues to work
2. **Optional Enhancement**: Add explicit skill activation for better control
3. **Gradual Adoption**: Start using sub-skills for focused capabilities

### For New Projects

1. **Install Skill Package**: Copy complete .ai/ directory structure
2. **Activate Skills**: Use "EARS-workflow" or specific sub-skill names
3. **Follow Guided Workflow**: System provides clear phase progression

## Usage Comparison

### Before (AGENTS.md System)
```
User: "I need to implement user authentication"
Agent: [Loads entire AGENTS.md context, determines phase manually]
```

### After (EARS-Workflow Skills)
```
User: "use EARS workflow for user authentication"
Agent: [Activates EARS-workflow, starts with SPEC-FORGE phase]

User: "use spec-forge"
Agent: [Loads only SPEC-FORGE instructions and templates]

User: "use work"
Agent: [Transitions to WORK phase with TDD and git worktree setup]
```

## Activation Patterns

### Main Workflow
- "EARS-workflow" or "use EARS workflow"
- "structured development" or "formal specification"
- "compound engineering" or "start ears"

### Sub-Skills
- **SPEC-FORGE**: "spec-forge", "requirements", "specification"
- **PLANNING**: "planning", "research", "architecture"
- **WORK**: "implement", "code", "tdd", "git worktree"
- **REVIEW**: "review", "audit", "code review"
- **GIT-WORKTREE**: "git worktree", "branch management"
- **PROJECT-RESET**: "project reset", "clean project"

## Backward Compatibility

### Memory Files
- `.ai/memory/lessons.md` - Unchanged format and access patterns
- `.ai/memory/decisions.md` - Unchanged format and access patterns
- All existing lessons and decisions are preserved
- Append operations continue to work as before

### File Structure
- All existing directories and files are preserved
- New skill structure is additive, not replacing
- Existing scripts and templates remain functional
- No breaking changes to established patterns

### Integration Points
- AGENTS.md remains the authoritative reference
- New skills reference and extend AGENTS.md principles
- Memory integration works seamlessly across old and new systems
- Attribution and licensing information is preserved

## Troubleshooting

### Common Issues

**Issue**: Skill not activating
**Solution**: Use explicit activation phrases like "use EARS workflow"

**Issue**: Memory files not accessible
**Solution**: Verify .ai/memory/ directory structure is intact

**Issue**: Git worktree scripts not working
**Solution**: Ensure .ai/skills/git-worktree/ directory is present

**Issue**: Missing templates or prompts
**Solution**: Check that .ai/templates/ and .ai/prompts/ directories are complete

### Validation Commands

Run these to verify your installation:

```bash
# Check memory file compatibility
node .ai/skills/memory-compatibility-validator.js

# Test memory access patterns
node .ai/skills/memory-access-patterns.js

# Validate AGENTS.md integration
node .ai/skills/agents-md-integration.js

# Run complete backward compatibility test
node .ai/tests/simple-backward-compatibility-test.js
```

## Support

### Documentation
- **AGENTS.md**: Complete reference for all principles and workflows
- **Individual SKILL.md files**: Focused documentation for each capability
- **Memory files**: Accumulated lessons and architectural decisions

### Community
- Original Compound Engineering Plugin: https://github.com/EveryInc/compound-engineering-plugin
- Issues and discussions: Use project repository

## Conclusion

The EARS-workflow skill system enhances the original AGENTS.md system while preserving all existing functionality. Existing users can continue working as before, while new capabilities provide improved organization, better IDE integration, and more efficient context management.

The migration is designed to be seamless - your existing projects continue to work unchanged, while new projects benefit from enhanced capabilities and better tooling integration.

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-26  
**Based On**: AGENTS.md v1.0.0 and EARS-Workflow Skills v1.0.0