---
name: spec-forge
description: Create formal specifications using EARS-compliant requirements, design documents with correctness properties, and implementation task lists. Use this skill when starting a new feature, creating requirements, or generating structured specifications with property-based testing integration.
version: 1.0.0
author: EARS-Workflow System
phase: spec-forge
---

# SPEC-FORGE: Structured Specification Creation

## Overview

The SPEC-FORGE skill transforms rough feature ideas into comprehensive, formal specifications through a disciplined three-phase approach: Requirements → Design → Tasks. This skill implements EARS (Easy Approach to Requirements Syntax) patterns, generates correctness properties for property-based testing, and creates actionable implementation plans.

## Activation

This skill activates when users mention:
- "spec-forge", "SPEC-FORGE", or "specification"
- "requirements", "EARS", or "user story"
- "design", "correctness properties", or "property-based testing"
- "create spec", "formal specification", or "structured requirements"

## Phase Sequence

SPEC-FORGE is always the first phase in the EARS-workflow methodology:

1. **Requirements Creation** - EARS-compliant requirements with glossary and user stories
2. **Design Generation** - Architecture, correctness properties, and testing strategy
3. **Task Planning** - Implementation tasks with property-based test integration

## Requirements Phase

### Objective
Generate EARS-compliant requirements using structured patterns and INCOSE quality rules.

### Key Activities
- Create requirements using exactly one of six EARS patterns:
  - Ubiquitous: THE <system> SHALL <response>
  - Event-driven: WHEN <trigger>, THE <system> SHALL <response>
  - State-driven: WHILE <condition>, THE <system> SHALL <response>
  - Unwanted event: IF <condition>, THEN THE <system> SHALL <response>
  - Optional feature: WHERE <option>, THE <system> SHALL <response>
  - Complex: [WHERE] [WHILE] [WHEN/IF] THE <system> SHALL <response>

### Document Structure
Create `.kiro/specs/{feature_name}/requirements.md` with:
- Introduction summarizing the feature
- Glossary defining all system names and technical terms
- Numbered requirements with user stories and 2-5 acceptance criteria each
- All acceptance criteria must be EARS-compliant and INCOSE quality-validated

### Quality Rules (INCOSE)
- Active voice (who does what)
- No vague terms ("quickly", "adequate")
- No escape clauses ("where possible")
- No negative statements ("SHALL not...")
- One thought per requirement
- Explicit and measurable conditions
- Consistent, defined terminology
- No pronouns ("it", "them")
- No absolutes ("never", "always", "100%")
- Solution-free (focus on what, not how)

### Common Correctness Patterns
Always consider these high-value correctness properties:
1. **Invariants** - Properties preserved after transformation
2. **Round Trip Properties** - Operations with inverses (serialize/deserialize)
3. **Idempotence** - Operations where f(x) = f(f(x))
4. **Metamorphic Properties** - Relationships between components
5. **Model Based Testing** - Optimized vs standard implementations
6. **Confluence** - Order independence
7. **Error Conditions** - Bad input handling

**Critical**: For ANY parser or serializer, ALWAYS include round-trip properties and pretty printer requirements.

## Design Phase

### Objective
Create comprehensive design with correctness properties derived from testability analysis.

### Pre-Design Analysis
Before writing correctness properties, perform testability analysis:
- For each acceptance criterion, determine if it's testable as property, example, edge case, or not testable
- Use format: "X.Y Criteria Name\n  Thoughts: step-by-step analysis\n  Testable: yes - property/example/edge-case, or no"

### Design Document Structure
Create `.kiro/specs/{feature_name}/design.md` with:
- Overview and architecture
- Components and interfaces
- Data models
- **Correctness Properties** (derived from testability analysis)
- Error handling
- Testing strategy (unit tests + property-based tests)

### Correctness Properties Format
Each property must:
- Start with "Property N: [Name]"
- Include "*For any* [universal quantification]"
- Reference validating requirements: "**Validates: Requirements X.Y**"
- Be suitable for property-based testing implementation

### Testing Strategy Requirements
- Specify property-based testing library (e.g., fast-check for JavaScript)
- Configure minimum 100 iterations per property test
- Tag each test with format: "**Feature: {feature_name}, Property {number}: {property_text}**"
- Each correctness property implemented by single property-based test

## Tasks Phase

### Objective
Convert design into actionable implementation plan with incremental progress.

### Task Document Structure
Create `.kiro/specs/{feature_name}/tasks.md` with:
- Numbered checkbox list (max 2 levels: 1.1, 1.2, 2.1)
- Each task involves writing, modifying, or testing code
- Property-based test tasks for each correctness property
- Checkpoint tasks: "Ensure all tests pass, ask the user if questions arise"

### Task Requirements
- Build incrementally on previous tasks
- Reference specific requirements (granular sub-requirements)
- Include property-based test sub-tasks near implementation
- Mark optional tasks with "*" (tests, documentation)
- End with complete integration

### Property-Based Test Integration
- Each correctness property gets its own sub-task
- Annotate with property number and validating requirements
- Place test tasks close to implementation for early error detection
- Format: "**Property N: [Name]**\n**Validates: Requirements X.Y**"

## Approval Gates

The SPEC-FORGE phase maintains strict approval gates:

1. **Requirements Approval**: Ask "Do the requirements look good? If so, we can move on to the design."
2. **Design Approval**: Ask "Does the design look good? If so, we can move on to the implementation plan."
3. **Tasks Approval**: Ask about optional task preferences, then get final approval

Never proceed to next phase without explicit user approval.

## Context Loading

Reference supporting files in `references/` directory:
- EARS validation templates
- INCOSE quality guidelines
- Requirements templates
- Testability analysis prompts
- Correctness property examples

## Integration Points

- Loads `.ai/memory/lessons.md` and `.ai/memory/decisions.md` for context
- Uses `.ai/templates/requirements-template.md` for structure
- References `.ai/templates/ears-validation.md` for compliance
- Applies `.ai/templates/incose-validation.md` for quality
- Utilizes `.ai/prompts/testability-analysis.md` for properties

## Output Artifacts

Upon completion, SPEC-FORGE produces:
- `requirements.md` - EARS-compliant requirements with user stories
- `design.md` - Architecture with correctness properties
- `tasks.md` - Implementation plan with property-based testing

These artifacts serve as the foundation for the subsequent PLAN → WORK → REVIEW phases.

## Error Handling

Common issues and solutions:
- **EARS pattern violations**: Correct to proper pattern format
- **INCOSE quality failures**: Rewrite for clarity and measurability
- **Missing glossary terms**: Define all technical terminology
- **Untestable properties**: Focus on computable, verifiable characteristics
- **Incomplete testability analysis**: Analyze each acceptance criterion systematically

The SPEC-FORGE skill ensures that every feature begins with a solid specification foundation, enabling confident implementation and comprehensive testing.