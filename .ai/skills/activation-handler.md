# EARS-Workflow Activation Handler

## Overview

This document provides the activation detection and routing logic for the EARS-workflow skill system. It implements semantic routing based on user input to determine when and how to activate the main workflow or specific sub-skills.

## Activation Detection

### Main Workflow Triggers

The EARS-workflow activates when users mention any of these phrases:

- `ears-workflow` or `use ears workflow`
- `structured development` or `formal specification`
- `compound engineering` or `start ears`
- `use structured development`

### Sub-Skill Triggers

Individual sub-skills can be activated directly:

#### SPEC-FORGE
- `spec-forge`, `specification`, `requirements`
- `ears`, `user story`, `create spec`
- `formal specification`, `structured requirements`
- `design`, `correctness properties`, `property-based testing`

#### PLANNING
- `planning`, `plan`, `implementation plan`
- `research`, `analyze`, `investigate`
- `architecture`, `design decisions`, `technical approach`
- `scaffold`, `plan implementation`, `create plan`

#### WORK
- `implement`, `fix`, `refactor`, `build`, `code`
- `tdd`, `test-driven`, `write tests`
- `git worktree`, `feature branch`, `development`
- `red-green-refactor`, `failing test`, `make it pass`

#### REVIEW
- `review`, `audit`, `check`, `assess`
- `code review`, `pull request`, `pr review`
- `security audit`, `performance review`, `quality check`
- `multi-perspective`, `comprehensive review`, `deep review`

#### GIT-WORKTREE (Utility)
- `git worktree`, `git-worktree`, `worktree`
- `create worktree`, `manage worktree`, `worktree cleanup`
- `branch management`, `isolated development`

#### PROJECT-RESET (Utility)
- `project reset`, `project-reset`, `reset project`
- `clean project`, `template restoration`, `memory reset`
- `project cleanup`

## Activation Logic

### Semantic Analysis Process

1. **Input Normalization**: Convert user input to lowercase and trim whitespace
2. **Main Workflow Detection**: Check for main workflow triggers first
3. **Sub-Skill Detection**: If no main workflow match, check sub-skill triggers
4. **Confidence Scoring**: Calculate match confidence based on:
   - Trigger length vs input length
   - Exact phrase matches (+0.3 confidence)
   - Word boundary matches (+0.2 confidence)
   - Beginning of input matches (+0.1 confidence)
5. **Best Match Selection**: Choose highest confidence match above threshold

### Phase Sequence Enforcement

The system enforces proper workflow sequence:

**Required Sequence**: SPEC-FORGE → PLANNING → WORK → REVIEW

**Validation Rules**:
- SPEC-FORGE can always be activated (entry point)
- PLANNING requires SPEC-FORGE completion
- WORK requires SPEC-FORGE and PLANNING completion
- REVIEW requires all previous phases completion
- Utility skills (git-worktree, project-reset) can activate anytime

**Sequence Violation Handling**:
- Detect missing prerequisite phases
- Generate guidance message explaining proper sequence
- Suggest next appropriate phase
- Provide educational context about workflow discipline

## Activation Responses

### Main Workflow Activation

```markdown
🚀 **EARS-Workflow Activated**

Structured development methodology is now active. Starting with **SPEC-FORGE** phase.

**Phase Sequence**: SPEC-FORGE → PLAN → WORK → REVIEW

Ready to transform your idea into a formal specification with EARS-compliant requirements and correctness properties.
```

### Sub-Skill Activation

```markdown
🎯 **[SKILL-NAME] Sub-Skill Activated**

[Skill-specific description of capabilities]

Loading focused instructions for [skill-name] operations...
```

### Phase Sequence Guidance

```markdown
⚠️ **Phase Sequence Guidance**

You requested **[REQUESTED-PHASE]** phase, but the EARS-workflow requires completing phases in sequence.

**Missing phases**: [MISSING-PHASES]

**Recommended next step**: Start with **[NEXT-PHASE]** phase.

This ensures proper workflow discipline and builds the foundation needed for successful [REQUESTED-PHASE] execution.
```

## Error Handling

### Common Activation Failures

#### Missing Files
```markdown
❌ **Activation Failed: Missing Files**

The EARS-workflow skill package appears incomplete. Please ensure:

- `.ai/SKILL.md` exists with valid YAML frontmatter
- `.ai/skills/` directory contains all sub-skill folders
- Each sub-skill has a valid `SKILL.md` file

**Troubleshooting**: Check the installation documentation or verify package completeness.
```

#### Invalid YAML Metadata
```markdown
❌ **Activation Failed: Invalid Metadata**

SKILL.md files contain invalid YAML frontmatter. Please check:

- YAML syntax is correct (proper indentation, no tabs)
- Required fields are present: name, description, version
- No special characters in field values

**File**: [specific-file]
**Error**: [yaml-error-details]
```

#### Missing Dependencies
```markdown
❌ **Activation Failed: Missing Dependencies**

Required dependencies are not available:

- [dependency-1]
- [dependency-2]

**Troubleshooting**: Ensure all required files and sub-skills are properly installed.
```

#### Context Window Overflow
```markdown
⚠️ **Activation Warning: Context Limit**

The skill activation would exceed context window limits. Using progressive disclosure:

- Loading minimal metadata only
- Detailed instructions will load on-demand
- Use specific sub-skill activation for focused capabilities

**Recommendation**: Activate specific sub-skills rather than the full workflow.
```

## Progressive Disclosure Implementation

### Context Management Strategy

1. **Tier 1 - Discovery**: Minimal metadata for skill detection (loaded always)
2. **Tier 2 - Activation**: Phase-specific instructions (loaded on activation)
3. **Tier 3 - Execution**: Supporting files and detailed procedures (loaded as needed)

### Token Efficiency

- **Inactive Skills**: Only YAML frontmatter loaded (~50 tokens per skill)
- **Active Skills**: Full instructions loaded (~500-1000 tokens per skill)
- **Supporting Files**: Loaded incrementally based on specific needs

### Context Transitions

When transitioning between phases:
1. **Unload Previous Phase**: Remove detailed instructions from context
2. **Load New Phase**: Add new phase instructions and supporting files
3. **Maintain State**: Keep activation state and completed phase tracking
4. **Preserve Memory**: Always keep memory files accessible

## Integration Points

### Main SKILL.md Integration

The main `.ai/SKILL.md` file should reference this activation handler:

```yaml
---
name: ears-workflow
description: Structured development methodology with EARS-compliant requirements, property-based testing, and compound engineering principles. Use this skill when starting a new feature, creating specifications, or following structured development practices.
version: 1.0.0
author: Compound Engineering System
---
```

### Sub-Skill Integration

Each sub-skill SKILL.md should include activation triggers in their frontmatter:

```yaml
---
name: spec-forge
description: Create formal specifications using EARS-compliant requirements...
phase: spec-forge
triggers: ["spec-forge", "specification", "requirements", "ears"]
---
```

### IDE Integration

For different IDE environments:

- **VS Code Copilot**: Uses YAML frontmatter for skill discovery
- **Cursor**: Integrates with Agent-Decided rules system
- **JetBrains**: Via CLI tools (openskills, rulesync) or MCP servers
- **CLI Tools**: Compatible with skill transpilation and injection

## Testing Integration

The activation system includes comprehensive testing:

- **Unit Tests**: Individual trigger detection and confidence scoring
- **Integration Tests**: End-to-end activation flow with phase transitions
- **Property-Based Tests**: Semantic routing across diverse input patterns
- **Error Handling Tests**: Failure scenarios and recovery mechanisms

## Usage Examples

### Example 1: Main Workflow Activation
**User Input**: "Let's use the EARS workflow to build a new authentication system"
**Detection**: Main workflow trigger "ears workflow" detected
**Response**: Activate main workflow, start with SPEC-FORGE phase
**Context**: Load SPEC-FORGE instructions and supporting templates

### Example 2: Direct Sub-Skill Activation
**User Input**: "I need to review this pull request thoroughly"
**Detection**: Sub-skill trigger "review" detected
**Response**: Activate REVIEW sub-skill directly
**Context**: Load multi-perspective audit instructions

### Example 3: Phase Sequence Violation
**User Input**: "Let's implement the feature using TDD"
**Detection**: WORK phase trigger "implement" and "tdd" detected
**Validation**: Check if SPEC-FORGE and PLANNING phases completed
**Response**: Phase sequence guidance if prerequisites missing

### Example 4: Utility Skill Activation
**User Input**: "Create a new git worktree for this feature"
**Detection**: Utility skill trigger "git worktree" detected
**Response**: Activate git-worktree utility (no phase validation needed)
**Context**: Load git worktree scripts and documentation

This activation handler ensures that the EARS-workflow skill system provides intelligent, context-aware activation while maintaining proper workflow discipline and progressive disclosure for optimal user experience.