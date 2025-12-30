# Planning Workflow

> **Phase 2: Comprehensive Implementation Planning**

## Overview

The PLANNING phase transforms formal specifications into detailed implementation plans. This phase bridges the gap between requirements (SPEC-FORGE) and implementation (WORK) by conducting research, making architectural decisions, and creating comprehensive implementation strategies.

## Phase Position

PLANNING is the second phase in the EARS-workflow methodology:
- **Previous**: SPEC-FORGE (requirements, design, tasks completed)
- **Current**: PLANNING (research, architecture, implementation strategy)
- **Next**: WORK (TDD implementation in git worktrees)

## Key Activities

### 1. Codebase Research
- Analyze existing patterns and architecture
- Review git history for context ("Chesterton's Fence")
- Identify reusable components and patterns
- Document current system constraints

### 2. Architecture Planning
- Design system integration points
- Plan data models and API interfaces
- Consider scalability and performance implications
- Document architectural decisions (ADRs)

### 3. Implementation Strategy
- Break down tasks into manageable units
- Plan git worktree strategy and branch structure
- Identify testing approach and coverage requirements
- Create implementation timeline and milestones

### 4. Risk Assessment
- Identify potential technical challenges
- Plan mitigation strategies for known risks
- Document assumptions and dependencies
- Create contingency plans for critical paths

## Deliverables

### Implementation Plan Document
**Location**: `.ai/docs/plans/YYYY-MM-DD-feature-name.md`

**Contents**:
- Executive summary and objectives
- Technical approach and architecture
- Task breakdown with time estimates
- Risk assessment and mitigation strategies
- Testing strategy and acceptance criteria

### Architectural Decision Records
**Location**: `.ai/docs/decisions/ADR-NNN-decision-title.md`

**Contents**:
- Context and problem statement
- Decision made and rationale
- Consequences and trade-offs
- Implementation guidance

## Universal Invariants

All planning activities must follow these rules:

### Evidence-Based Planning
- Always verify assumptions about the codebase by reading actual files
- Never guess at API signatures, file locations, or system behavior
- Always use grep, find, or file reading tools to gather evidence

### Memory Integration
- Always consult `.ai/memory/lessons.md` before proposing solutions
- Always consult `.ai/memory/decisions.md` to understand existing patterns
- Always update memory files when new patterns are discovered

### Documentation Standards
- Always create plans in `.ai/docs/plans/` directory
- Always follow naming convention: `YYYY-MM-DD-feature-name.md`
- Always cross-reference related specifications and designs

## Transition Criteria

### From SPEC-FORGE
- Requirements document exists and is approved
- Design document with correctness properties is complete
- Task list with acceptance criteria is defined

### To WORK
- Implementation plan is comprehensive and approved
- Architectural decisions are documented
- Git worktree strategy is defined
- Testing approach is planned

## Best Practices

### Research Methodology
1. **Start with existing code**: Understand current patterns before proposing new ones
2. **Follow the history**: Use git log and blame to understand why code exists
3. **Validate assumptions**: Test your understanding with actual code examples
4. **Document discoveries**: Capture insights in memory files for future reference

### Planning Depth
1. **Right-size the plan**: Match planning depth to feature complexity
2. **Focus on decisions**: Document choices that affect multiple components
3. **Plan for testing**: Include test strategy in all implementation plans
4. **Consider maintenance**: Plan for long-term maintainability and evolution

### Collaboration
1. **Clear communication**: Write plans for future developers (including yourself)
2. **Reviewable decisions**: Make architectural choices explicit and reviewable
3. **Iterative refinement**: Expect plans to evolve as implementation progresses
4. **Knowledge sharing**: Use planning as an opportunity to share domain knowledge

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-29  
**Phase**: PLANNING