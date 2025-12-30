# SPEC-FORGE: Structured Specification Workflow

This workflow implements the SPEC-FORGE phase from AGENTS.md, providing structured specification creation with EARS patterns and property-based testing integration.

## Overview

SPEC-FORGE creates formal specifications through three sequential sub-phases:
1. **REQUIREMENTS**: EARS-compliant requirements with glossary
2. **DESIGN**: Architecture with correctness properties  
3. **TASKS**: Implementation plan with property-based testing

Each sub-phase has approval gates and validation criteria.

## Phase I-A: SPEC-FORGE Entry Point

### Activation Triggers
User mentions any of:
- "requirements", "spec", "specification"
- "EARS patterns", "structured requirements"
- "formal specification", "property-based testing"
- "design with correctness properties"

### Context Loading
```bash
# Always load EARS workflow core
.ai/memory/lessons.md
.ai/memory/decisions.md

# Load SPEC-FORGE specific context
.ai/workflows/ears-workflow.md
.ai/templates/requirements-template.md
.ai/templates/ears-validation.md
.ai/templates/incose-validation.md
.ai/roles/architect.md
```

## Sub-Phase 1: REQUIREMENTS

### Objective
Create EARS-compliant requirements document with comprehensive validation.

### Activities
1. **Initialize Requirements Document**
   - Use `.ai/templates/requirements-template.md`
   - Create `.ai/docs/requirements/[feature-name].md`
   - Establish glossary and user stories

2. **Apply EARS Patterns**
   - **Ubiquitous**: "The system shall [action]"
   - **Event-driven**: "When [event], the system shall [response]"
   - **State-driven**: "While [state], the system shall [behavior]"
   - **Optional**: "Where [feature], the system shall [behavior]"
   - **Complex**: "If [condition], then [behavior], else [alternative]"

3. **Validate Requirements**
   - Apply `.ai/templates/ears-validation.md` checklist
   - Apply `.ai/templates/incose-validation.md` quality criteria
   - Generate validation report

### Approval Gate: REQUIREMENTS → DESIGN
**Criteria**:
- [ ] All requirements follow EARS patterns
- [ ] INCOSE quality characteristics satisfied
- [ ] Glossary complete and consistent
- [ ] User stories map to functional requirements
- [ ] Validation report shows compliance

**User Approval Required**: "Do the requirements look good? If so, we can move on to the design."

### Deliverables
- `.ai/docs/requirements/[feature-name].md`
- EARS validation report
- INCOSE quality assessment

## Sub-Phase 2: DESIGN

### Objective
Create architecture design with correctness properties for property-based testing.

### Activities
1. **Architecture Design**
   - Define system components and interfaces
   - Specify data models and relationships
   - Document integration points
   - Create `.ai/docs/design/[feature-name].md`

2. **Testability Analysis**
   - Use `.ai/prompts/testability-analysis.md` for systematic analysis
   - Identify testable properties for each requirement
   - Generate correctness properties for property-based testing

3. **Property Generation**
   - **Invariants**: Properties that must always hold
   - **Preconditions**: Required input conditions
   - **Postconditions**: Guaranteed output conditions
   - **State Transitions**: Valid state change rules

4. **Testing Strategy**
   - Specify property-based testing framework (QuickCheck, Hypothesis, etc.)
   - Define test data generators
   - Map properties to requirements for traceability

### Approval Gate: DESIGN → TASKS
**Criteria**:
- [ ] Architecture components clearly defined
- [ ] Correctness properties generated for all requirements
- [ ] Testing strategy specified
- [ ] Property-based testing framework selected
- [ ] Traceability maintained to requirements

**User Approval Required**: "Does the design look good? If so, we can move on to the implementation plan."

### Deliverables
- `.ai/docs/design/[feature-name].md`
- Correctness properties specification
- Testing strategy document

## Sub-Phase 3: TASKS

### Objective
Create implementation task list with integrated property-based testing.

### Activities
1. **Task Breakdown**
   - Decompose design into atomic, testable tasks
   - Sequence tasks for optimal development flow
   - Create `.ai/docs/tasks/[feature-name].md`

2. **Property-Based Test Integration**
   - Map each task to relevant correctness properties
   - Specify property-based tests alongside unit tests
   - Define test data generators for each property

3. **Implementation Sequencing**
   - Order tasks to enable continuous testing
   - Identify dependencies between tasks
   - Plan incremental property validation

4. **Traceability Matrix**
   - Link tasks to design elements
   - Link design elements to requirements
   - Ensure complete coverage

### Approval Gate: TASKS → EXECUTION
**Criteria**:
- [ ] All tasks are atomic and testable
- [ ] Property-based tests specified for each task
- [ ] Task dependencies identified
- [ ] Traceability matrix complete
- [ ] Implementation sequence optimized

**User Approval Required**: "Ready to begin task execution"

### Deliverables
- `.ai/docs/tasks/[feature-name].md`
- Property-based test specifications
- Traceability matrix

## Phase Transition Management

### Workflow State Tracking
```markdown
# SPEC-FORGE Status: [Feature Name]

**Current Phase**: Requirements | Design | Tasks  
**Phase Status**: In Progress | Complete | Approved  
**Next Phase**: Design | Tasks | Execution  

## Phase Completion Checklist
### Requirements Phase
- [ ] EARS patterns applied
- [ ] INCOSE validation passed
- [ ] User approval received

### Design Phase  
- [ ] Architecture defined
- [ ] Correctness properties generated
- [ ] Testing strategy specified
- [ ] User approval received

### Tasks Phase
- [ ] Tasks decomposed and sequenced
- [ ] Property-based tests specified
- [ ] Traceability maintained
- [ ] User approval received

**Ready for Execution**: Yes | No
```

### Backward Navigation
If user requests changes to previous phases:
1. **Preserve existing work** where possible
2. **Update dependent documents** automatically
3. **Maintain traceability** across changes
4. **Re-validate** affected phases

### Integration with Standard Workflow
SPEC-FORGE integrates with the standard EARS workflow:
- **Phase I**: PLAN (includes SPEC-FORGE if requested)
- **Phase II**: WORK (execution with property-based testing)
- **Phase III**: REVIEW (includes property validation)

## Property-Based Testing Integration

### Correctness Properties Examples

#### Invariant Properties
```python
# Example: User authentication
@given(email=emails(), password=text())
def test_authentication_invariant(email, password):
    """Authentication result must be deterministic"""
    result1 = authenticate(email, password)
    result2 = authenticate(email, password)
    assert result1.success == result2.success
```

#### Precondition Properties
```python
# Example: Data validation
@given(user_data=user_data_strategy())
def test_validation_preconditions(user_data):
    """Valid input must pass validation"""
    assume(is_valid_user_data(user_data))
    result = validate_user(user_data)
    assert result.is_valid == True
```

#### Postcondition Properties
```python
# Example: Data persistence
@given(user=users())
def test_persistence_postconditions(user):
    """Saved user must be retrievable"""
    user_id = save_user(user)
    retrieved_user = get_user(user_id)
    assert retrieved_user.email == user.email
```

### Framework Selection Guide

| Language | Framework | Strengths |
|:---------|:----------|:----------|
| Python | Hypothesis | Excellent data generation, Django integration |
| JavaScript | fast-check | TypeScript support, good performance |
| Java | jqwik | JUnit integration, advanced generators |
| Haskell | QuickCheck | Original framework, mature ecosystem |
| Scala | ScalaCheck | Functional programming focus |
| C# | FsCheck | F# integration, .NET ecosystem |

## Validation Templates Integration

### EARS Validation Process
1. **Pattern Compliance**: Check format against EARS templates
2. **Quality Assessment**: Apply INCOSE characteristics
3. **Stakeholder Review**: Technical and business validation
4. **Approval Gate**: Formal sign-off before next phase

### Quality Metrics Tracking
```markdown
# SPEC-FORGE Quality Metrics

## Requirements Quality
- EARS Pattern Compliance: [%]
- INCOSE Characteristics: [%]
- Testable Requirements: [%]

## Design Quality  
- Correctness Properties Coverage: [%]
- Architecture Component Coverage: [%]
- Testing Strategy Completeness: [%]

## Task Quality
- Atomic Task Breakdown: [%]
- Property-Based Test Coverage: [%]
- Traceability Completeness: [%]
```

## Success Criteria

SPEC-FORGE is complete when:
1. ✅ Requirements document passes EARS and INCOSE validation
2. ✅ Design includes correctness properties for property-based testing
3. ✅ Tasks integrate property-based tests with implementation
4. ✅ Complete traceability from requirements to tasks
5. ✅ User approval received for all three phases
6. ✅ Ready for Phase II (WORK) execution

## Integration with Memory System

### Lessons Learned Capture
```markdown
# SPEC-FORGE Lessons

- When creating EARS requirements, always validate against both pattern compliance and INCOSE quality characteristics
- Property-based testing properties should be generated during design phase, not retrofitted later
- Traceability matrix maintenance is critical for change impact analysis
- User approval gates prevent rework and ensure stakeholder alignment
```

### Decision Documentation
```markdown
# SPEC-FORGE Architectural Decisions

## Decision: Property-Based Testing Integration
**Status**: Active  
**Date**: 2025-12-19  
**Decision**: Integrate property-based testing specification into design phase  
**Rationale**: Early property definition improves test quality and requirement validation  
**Examples**: See `.ai/docs/design/` for correctness property patterns
```

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-19  
**Based On**: AGENTS.md v1.0.0