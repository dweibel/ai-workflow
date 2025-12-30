# Requirements Template

This template provides a structured format for creating EARS-compliant requirements documents.

## Document Header

```markdown
# Requirements: [Feature Name]

**Document Type**: Requirements Specification  
**Version**: 1.0.0  
**Date**: YYYY-MM-DD  
**Status**: Draft | Review | Approved  
**Stakeholders**: [List key stakeholders]  
**Related Documents**: 
- Design: `.ai/docs/architecture/[feature-name].md`
- Tasks: `.ai/docs/tasks/[feature-name].md`
- Plan: `.ai/docs/implementation/YYYY-MM-DD-[feature-name].md`

## Executive Summary

[2-3 sentence overview of what this feature accomplishes and why it's needed]

## Glossary

Define all domain-specific terms used in requirements:

| Term | Definition |
|:-----|:-----------|
| [Term 1] | [Clear, unambiguous definition] |
| [Term 2] | [Clear, unambiguous definition] |

## User Stories

### Primary User Story
**As a** [role/persona]  
**I want** [capability/feature]  
**So that** [business value/benefit]

**Acceptance Criteria**:
- [ ] [Specific, testable criterion 1]
- [ ] [Specific, testable criterion 2]
- [ ] [Specific, testable criterion 3]

### Supporting User Stories
[Additional user stories that support the primary story]

## EARS Requirements

Use the EARS (Easy Approach to Requirements Syntax) format for all functional requirements:

### Functional Requirements

#### FR-001: [Requirement Title]
**EARS Pattern**: Ubiquitous  
**Requirement**: The system shall [action/behavior]

**Rationale**: [Why this requirement exists]  
**Acceptance Criteria**:
- [ ] [Testable criterion]
- [ ] [Testable criterion]

#### FR-002: [Requirement Title]
**EARS Pattern**: Event-driven  
**Requirement**: When [trigger event], the system shall [response]

**Rationale**: [Why this requirement exists]  
**Acceptance Criteria**:
- [ ] [Testable criterion]

#### FR-003: [Requirement Title]
**EARS Pattern**: State-driven  
**Requirement**: While [system state], the system shall [behavior]

**Rationale**: [Why this requirement exists]  
**Acceptance Criteria**:
- [ ] [Testable criterion]

#### FR-004: [Requirement Title]
**EARS Pattern**: Optional  
**Requirement**: Where [feature is included], the system shall [behavior]

**Rationale**: [Why this requirement exists]  
**Acceptance Criteria**:
- [ ] [Testable criterion]

#### FR-005: [Requirement Title]
**EARS Pattern**: Complex  
**Requirement**: If [condition], then the system shall [behavior], else [alternative behavior]

**Rationale**: [Why this requirement exists]  
**Acceptance Criteria**:
- [ ] [Testable criterion for condition]
- [ ] [Testable criterion for primary behavior]
- [ ] [Testable criterion for alternative behavior]

### Non-Functional Requirements

#### NFR-001: Performance
The system shall [performance requirement with measurable criteria]

**Acceptance Criteria**:
- [ ] Response time < [X] milliseconds for [scenario]
- [ ] Throughput > [Y] requests per second
- [ ] Memory usage < [Z] MB under normal load

#### NFR-002: Security
The system shall [security requirement]

**Acceptance Criteria**:
- [ ] [Specific security measure]
- [ ] [Authentication requirement]
- [ ] [Authorization requirement]

#### NFR-003: Usability
The system shall [usability requirement]

**Acceptance Criteria**:
- [ ] [Specific usability measure]

#### NFR-004: Reliability
The system shall [reliability requirement]

**Acceptance Criteria**:
- [ ] Uptime > [X]%
- [ ] Mean time to recovery < [Y] minutes

## Constraints

### Technical Constraints
- [Constraint 1]: [Description and impact]
- [Constraint 2]: [Description and impact]

### Business Constraints
- [Constraint 1]: [Description and impact]
- [Constraint 2]: [Description and impact]

### Regulatory Constraints
- [Constraint 1]: [Description and impact]
- [Constraint 2]: [Description and impact]

## Assumptions

- [Assumption 1]: [Description and validation needed]
- [Assumption 2]: [Description and validation needed]

## Dependencies

### Internal Dependencies
- [Dependency 1]: [Description and impact if not available]
- [Dependency 2]: [Description and impact if not available]

### External Dependencies
- [Dependency 1]: [Description and impact if not available]
- [Dependency 2]: [Description and impact if not available]

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation Strategy |
|:-----|:-----------|:-------|:-------------------|
| [Risk 1] | High/Medium/Low | High/Medium/Low | [Strategy] |
| [Risk 2] | High/Medium/Low | High/Medium/Low | [Strategy] |

## Validation Criteria

### Requirements Validation Checklist
- [ ] All requirements follow EARS patterns
- [ ] All requirements are testable
- [ ] All requirements are unambiguous
- [ ] All requirements are necessary
- [ ] All requirements are feasible
- [ ] All requirements are verifiable
- [ ] Glossary terms are used consistently
- [ ] User stories map to functional requirements
- [ ] Non-functional requirements have measurable criteria

### Stakeholder Sign-off
- [ ] Product Owner: [Name] - Date: [YYYY-MM-DD]
- [ ] Technical Lead: [Name] - Date: [YYYY-MM-DD]
- [ ] QA Lead: [Name] - Date: [YYYY-MM-DD]

## Traceability Matrix

| Requirement ID | User Story | Design Element | Test Case |
|:---------------|:-----------|:---------------|:----------|
| FR-001 | US-001 | [Design ref] | [Test ref] |
| FR-002 | US-001 | [Design ref] | [Test ref] |

## Appendices

### Appendix A: Reference Documents
- [Document 1]: [Description and relevance]
- [Document 2]: [Description and relevance]

### Appendix B: Mockups and Wireframes
[Include or reference visual aids that support requirements understanding]

---

**Document Control**:
- **Created**: [Date] by [Author]
- **Last Modified**: [Date] by [Author]
- **Next Review**: [Date]
- **Approval Status**: [Status]
```

## Usage Instructions

1. **Copy this template** to `.ai/docs/specifications/[feature-name].md`
2. **Replace all bracketed placeholders** with actual content
3. **Follow EARS patterns** for all functional requirements:
   - **Ubiquitous**: "The system shall..."
   - **Event-driven**: "When [event], the system shall..."
   - **State-driven**: "While [state], the system shall..."
   - **Optional**: "Where [feature], the system shall..."
   - **Complex**: "If [condition], then..., else..."
4. **Make requirements testable** - each should have clear acceptance criteria
5. **Use the glossary** to define domain terms consistently
6. **Validate completeness** using the validation checklist
7. **Get stakeholder approval** before proceeding to design phase

## EARS Pattern Examples

### Good EARS Requirements
✅ "When a user submits a login form, the system shall validate credentials within 2 seconds"  
✅ "The system shall encrypt all PII data using AES-256 encryption"  
✅ "While a user session is active, the system shall refresh the authentication token every 15 minutes"

### Poor Requirements (Non-EARS)
❌ "The system should be fast" (not measurable)  
❌ "Users need to login" (not a system requirement)  
❌ "The interface must be user-friendly" (subjective)

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-19  
**Based On**: AGENTS.md v1.0.0