---
name: planning
description: Create comprehensive implementation plans and architectural decisions based on formal specifications. Use this skill when transitioning from SPEC-FORGE to implementation, conducting research, or developing detailed technical plans with git worktree strategies.
version: 1.0.0
author: EARS-Workflow System
phase: planning
---

# PLANNING: Implementation Planning and Architecture

## Overview

The PLANNING skill transforms formal specifications into actionable implementation strategies. This skill conducts deep research, analyzes existing patterns, creates detailed implementation plans, and establishes architectural decisions that serve as contracts for the WORK phase.

## Activation

This skill activates when users mention:
- "planning", "PLAN", or "implementation plan"
- "research", "analyze", or "investigate"
- "architecture", "design decisions", or "technical approach"
- "scaffold", "plan implementation", or "create plan"

## Phase Position

PLANNING is the second phase in the EARS-workflow methodology:
- **Previous**: SPEC-FORGE (requirements, design, tasks completed)
- **Current**: PLAN (research, architecture, implementation strategy)
- **Next**: WORK (TDD implementation in git worktrees)

## Objective

Understand the problem deeply before writing any code through systematic research and planning.

## Key Activities

### 1. Research Existing Patterns
- Analyze current codebase for similar implementations
- Study git history for context ("Chesterton's Fence" principle)
- Identify reusable patterns and architectural decisions
- Document findings and their implications

### 2. Architectural Analysis
- Review system architecture and integration points
- Identify dependencies and constraints
- Evaluate technical feasibility of requirements
- Plan component interactions and data flows

### 3. Implementation Strategy
- Define development approach and methodology
- Plan git worktree strategy for isolated development
- Establish testing approach and validation criteria
- Create risk mitigation strategies

### 4. Documentation Creation
- Create detailed implementation plan in `.ai/docs/plans/YYYY-MM-DD-feature-name.md`
- Document architectural decisions in `.ai/docs/decisions/`
- Update memory files with new patterns and lessons
- Establish traceability to requirements and design

## Planning Document Structure

Create comprehensive plan at `.ai/docs/plans/YYYY-MM-DD-feature-name.md`:

### Executive Summary
- Brief overview of what will be implemented
- Key technical challenges and solutions
- Resource requirements and timeline estimates

### Requirements Analysis
- Reference to completed SPEC-FORGE artifacts
- Analysis of functional and non-functional requirements
- Identification of critical path items and dependencies

### Technical Research
- Analysis of existing codebase patterns
- Review of similar implementations
- Technology stack evaluation
- Third-party dependency assessment

### Architecture Decisions
- High-level system design approach
- Component breakdown and responsibilities
- Data flow and integration patterns
- Security and performance considerations

### Implementation Strategy
- Development methodology (TDD, incremental, etc.)
- Git worktree strategy and branch management
- Testing approach and validation criteria
- Deployment and rollback strategies

### Risk Assessment
- Technical risks and mitigation strategies
- Dependency risks and contingency plans
- Timeline risks and buffer strategies
- Quality risks and validation approaches

### Resource Planning
- Development effort estimates
- Required skills and expertise
- Tool and infrastructure requirements
- Review and approval checkpoints

## Research Methodology

### Codebase Analysis
1. **Pattern Discovery**: Search for similar implementations
2. **Git History Review**: Understand evolution and rationale
3. **Dependency Mapping**: Identify integration points
4. **Performance Analysis**: Review existing performance characteristics

### External Research
1. **Best Practices**: Industry standards and recommendations
2. **Technology Evaluation**: Framework and library options
3. **Security Considerations**: Threat modeling and mitigation
4. **Compliance Requirements**: Regulatory and policy constraints

### Stakeholder Input
1. **Technical Review**: Architecture and feasibility validation
2. **Business Review**: Priority and scope confirmation
3. **User Experience Review**: Usability and workflow validation
4. **Operations Review**: Deployment and maintenance considerations

## Architectural Decision Records (ADRs)

Document significant decisions in `.ai/docs/decisions/`:

### ADR Template
```markdown
# ADR-XXX: [Decision Title]

**Status**: Proposed | Accepted | Deprecated | Superseded
**Date**: YYYY-MM-DD
**Deciders**: [List of decision makers]

## Context
[Describe the situation and problem]

## Decision
[State the decision made]

## Rationale
[Explain why this decision was made]

## Consequences
[Describe positive and negative outcomes]

## Alternatives Considered
[List other options and why they were rejected]
```

## Git Worktree Strategy

Plan the development environment approach:

### Worktree Planning
- **Branch Naming**: `feature/[feature-name]`, `bugfix/[issue-id]`, `refactor/[component]`
- **Directory Structure**: `../worktrees/[branch-name]`
- **Integration Strategy**: Regular merges vs. rebase approach
- **Cleanup Process**: Automated vs. manual worktree management

### Development Workflow
- **Setup Process**: Worktree creation and environment configuration
- **Development Cycle**: Code → Test → Commit → Push cycle
- **Integration Points**: When and how to sync with main branch
- **Completion Process**: Testing, review, merge, and cleanup

## Memory Integration

### Lessons Learned
- Consult `.ai/memory/lessons.md` for past mistakes and solutions
- Document new patterns discovered during research
- Update lessons with planning insights and decisions

### Decision History
- Review `.ai/memory/decisions.md` for existing architectural patterns
- Document new architectural decisions and rationale
- Maintain consistency with established patterns

## Context Loading

Reference supporting files in `references/` directory:
- Planning workflow templates
- Architect role definitions
- Research methodologies
- Decision-making frameworks

## Integration Points

- Loads completed SPEC-FORGE artifacts (requirements, design, tasks)
- References `references/planning-workflow.md` for detailed procedures
- Uses `references/architect-role.md` for perspective and responsibilities
- Updates `.ai/memory/` files with new insights and decisions

## Approval Gate

The PLANNING phase requires explicit approval before proceeding to WORK:

**Approval Question**: "The implementation plan is complete. Does the approach look good? If so, we can proceed to the WORK phase."

**Approval Criteria**:
- Technical approach is sound and feasible
- Risks are identified and mitigated
- Resource requirements are realistic
- Integration with existing systems is planned
- Testing and validation approach is comprehensive

## Output Artifacts

Upon completion, PLANNING produces:
- `plans/YYYY-MM-DD-feature-name.md` - Comprehensive implementation plan
- `decisions/ADR-XXX-[decision].md` - Architectural decision records
- Updated memory files with new patterns and lessons
- Clear development strategy for WORK phase

## Error Handling

Common planning issues and solutions:
- **Insufficient Research**: Extend research phase, consult additional sources
- **Technical Infeasibility**: Revise requirements or explore alternative approaches
- **Resource Constraints**: Adjust scope or timeline, identify additional resources
- **Integration Complexity**: Simplify approach, phase implementation, or seek expertise
- **Unclear Requirements**: Return to SPEC-FORGE for clarification and refinement

## Transition to WORK

Upon approval, the PLANNING skill provides:
- Clear implementation roadmap
- Established development environment strategy
- Risk mitigation plans
- Success criteria and validation approach
- Foundation for confident implementation in WORK phase

The PLANNING skill ensures that implementation begins with a solid foundation, reducing risk and increasing the likelihood of successful delivery.