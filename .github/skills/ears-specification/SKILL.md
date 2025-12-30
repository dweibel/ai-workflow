---
name: ears-specification
description: Create formal specifications using EARS-compliant requirements, property-based testing integration, and structured specification methodology. Use this skill when creating requirements, user stories, specifications, or when starting the SPEC-FORGE phase of development.
version: 1.0.0
author: Compound Engineering System
---

# EARS Specification Skill

## Overview

The EARS Specification skill provides structured specification creation using the EARS (Easy Approach to Requirements Syntax) methodology. It creates formal, testable requirements with integrated property-based testing and maintains approval gates between specification phases.

## EARS Methodology

EARS provides a structured approach to writing requirements using specific templates:

- **Ubiquitous**: The system shall [requirement]
- **Event-driven**: When [trigger], the system shall [requirement]
- **Unwanted behavior**: If [condition], then the system shall [requirement]
- **State-driven**: While [state], the system shall [requirement]
- **Optional**: Where [feature is included], the system shall [requirement]

## Specification Phases

The skill follows a three-phase approach with approval gates:

### Phase 1: Requirements Creation
- Create EARS-compliant requirements with glossary
- Develop user stories and acceptance criteria
- Generate requirements document in `.ai/docs/specifications/`
- **Approval Gate**: User must approve requirements before proceeding

### Phase 2: Design Generation
- Analyze testability of requirements
- Generate correctness properties for property-based testing
- Create design document with architecture and testing strategy
- **Approval Gate**: User must approve design before proceeding

### Phase 3: Task Planning
- Create numbered implementation tasks
- Integrate property-based test specifications
- Generate task list in `.ai/docs/tasks/`
- **Output**: Complete specification trilogy ready for implementation

## Templates and Validation

The skill uses structured templates and validation:

### Requirements Template
Location: `.ai/templates/requirements-template.md`
- EARS pattern compliance
- Glossary definitions
- User story format
- Acceptance criteria structure

### Validation Templates
- **EARS Validation**: `.ai/templates/ears-validation.md`
- **INCOSE Validation**: `.ai/templates/incose-validation.md`

### Correctness Properties
Uses `.ai/prompts/testability-analysis.md` to generate:
- Property-based test specifications
- Invariant definitions
- Test data generation strategies

## Workflow Integration

### Context Loading
When activated, loads:
- `.ai/workflows/ears-workflow.md` for phase detection and transitions
- `.ai/templates/requirements-template.md` for structured creation
- Validation templates for quality assurance
- `.ai/prompts/testability-analysis.md` for correctness properties

### Memory Integration
- Consults `.ai/memory/lessons.md` for specification best practices
- Updates memory with new specification patterns learned
- References `.ai/memory/decisions.md` for architectural context

## Usage Examples

### Creating New Requirements
```
User: "I need to create requirements for user authentication"
Skill: Activates Phase 1, loads requirements template, guides EARS creation
```

### Generating Design from Requirements
```
User: "Generate design for the approved authentication requirements"
Skill: Activates Phase 2, analyzes testability, creates correctness properties
```

### Creating Implementation Tasks
```
User: "Create tasks for the approved authentication design"
Skill: Activates Phase 3, generates numbered tasks with test integration
```

## Quality Assurance

The skill enforces quality through:

### EARS Compliance
- Validates requirements against EARS patterns
- Ensures proper trigger/condition/response structure
- Checks for ambiguous language and undefined terms

### Testability Analysis
- Identifies testable properties in requirements
- Generates property-based test specifications
- Ensures requirements can be verified objectively

### Approval Gates
- Requires explicit user approval between phases
- Prevents premature progression to implementation
- Maintains specification integrity

## Output Artifacts

The skill generates:

1. **Requirements Document**: `.ai/docs/specifications/[feature]-requirements.md`
   - EARS-compliant requirements
   - Glossary of terms
   - User stories and acceptance criteria

2. **Design Document**: `.ai/docs/architecture/[feature]-design.md`
   - System architecture
   - Correctness properties
   - Testing strategy

3. **Task List**: `.ai/docs/tasks/[feature]-tasks.md`
   - Numbered implementation tasks
   - Property-based test integration
   - Dependencies and priorities

## Integration with Other Skills

### Handoff to Implementation
- Provides complete specification trilogy to `git-worktree` skill
- Ensures requirements traceability through implementation
- Maintains specification-implementation alignment

### Review Integration
- Specifications are validated by `testing-framework` skill
- Requirements compliance checked during review phase
- Property-based tests executed for verification

## Error Handling

### Invalid EARS Patterns
- Provides specific guidance on EARS template usage
- Suggests corrections for common pattern violations
- References examples from successful specifications

### Missing Approval Gates
- Prevents phase progression without explicit approval
- Provides clear feedback on approval requirements
- Maintains specification discipline

### Testability Issues
- Identifies untestable requirements
- Suggests refactoring for better testability
- Provides property-based testing alternatives

## Best Practices

### Requirements Writing
- Use active voice and specific language
- Define all domain terms in glossary
- Ensure each requirement is independently testable
- Avoid implementation details in requirements

### Design Generation
- Focus on correctness properties over implementation
- Generate comprehensive test strategies
- Consider edge cases and error conditions
- Maintain traceability to requirements

### Task Planning
- Create atomic, testable tasks
- Integrate property-based test creation
- Establish clear dependencies
- Provide effort estimates where possible

## Memory Learning

The skill contributes to compound learning by:
- Codifying successful specification patterns
- Learning from specification-implementation mismatches
- Improving EARS template usage over time
- Building domain-specific glossaries and patterns