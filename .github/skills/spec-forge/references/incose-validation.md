# INCOSE Validation Template

This template provides validation criteria based on INCOSE (International Council on Systems Engineering) best practices for requirements quality.

## INCOSE Requirements Quality Characteristics

### 1. Necessary
**Definition**: The requirement is essential to meet stakeholder needs.

**Validation Questions**:
- [ ] Does this requirement address a real stakeholder need?
- [ ] Would the system be incomplete without this requirement?
- [ ] Can this requirement be traced to a user story or business objective?
- [ ] Is this requirement duplicated elsewhere?

**Red Flags**:
❌ "Nice to have" features without clear business justification  
❌ Requirements that duplicate existing functionality  
❌ Gold-plating or feature creep  
❌ Requirements that cannot be traced to stakeholder needs

### 2. Unambiguous
**Definition**: The requirement has only one possible interpretation.

**Validation Questions**:
- [ ] Can this requirement be interpreted in multiple ways?
- [ ] Are all terms clearly defined in the glossary?
- [ ] Would different stakeholders understand this the same way?
- [ ] Are there any subjective or qualitative terms?

**Red Flags**:
❌ Subjective terms: "user-friendly", "fast", "reliable"  
❌ Undefined acronyms or technical terms  
❌ Pronouns without clear antecedents  
❌ Multiple interpretations possible

**Examples**:
❌ "The system shall provide good performance"  
✅ "The system shall respond to user queries within 2 seconds under normal load"

### 3. Complete
**Definition**: The requirement fully describes the necessary behavior.

**Validation Questions**:
- [ ] Does this requirement specify all necessary conditions?
- [ ] Are error conditions and edge cases covered?
- [ ] Are all inputs, outputs, and processing steps defined?
- [ ] Are preconditions and postconditions specified?

**Red Flags**:
❌ Missing error handling specifications  
❌ Incomplete input/output definitions  
❌ Undefined system states or conditions  
❌ Missing performance criteria

### 4. Consistent
**Definition**: The requirement does not conflict with other requirements.

**Validation Questions**:
- [ ] Does this requirement contradict any other requirements?
- [ ] Are terminology and concepts used consistently?
- [ ] Do related requirements use compatible assumptions?
- [ ] Are there any logical inconsistencies?

**Red Flags**:
❌ Contradictory performance requirements  
❌ Inconsistent terminology usage  
❌ Conflicting business rules  
❌ Incompatible technical constraints

### 5. Feasible
**Definition**: The requirement can be implemented within known constraints.

**Validation Questions**:
- [ ] Is this requirement technically achievable?
- [ ] Are there sufficient resources (time, budget, skills)?
- [ ] Are the performance requirements realistic?
- [ ] Do we have access to necessary technologies/APIs?

**Red Flags**:
❌ Requirements that exceed physical limitations  
❌ Unrealistic performance expectations  
❌ Dependencies on unavailable technologies  
❌ Requirements that violate regulatory constraints

### 6. Modifiable
**Definition**: The requirement can be changed without excessive impact.

**Validation Questions**:
- [ ] Is this requirement written at the appropriate level of detail?
- [ ] Would changes to this requirement cascade to many others?
- [ ] Is the requirement structure flexible for future changes?
- [ ] Are implementation details avoided?

**Red Flags**:
❌ Over-specification of implementation details  
❌ Tightly coupled requirements  
❌ Hard-coded values that should be configurable  
❌ Requirements that assume specific technologies

### 7. Ranked
**Definition**: The requirement has a clear priority relative to others.

**Validation Questions**:
- [ ] Is the priority of this requirement clearly defined?
- [ ] Are trade-offs with other requirements understood?
- [ ] Is the business value clearly articulated?
- [ ] Are dependencies between requirements identified?

**Priority Levels**:
- **Critical**: System cannot function without this
- **High**: Important for user satisfaction
- **Medium**: Valuable but not essential
- **Low**: Nice to have if resources permit

### 8. Testable/Verifiable
**Definition**: The requirement can be verified through testing or analysis.

**Validation Questions**:
- [ ] Can compliance with this requirement be objectively verified?
- [ ] Are the acceptance criteria measurable?
- [ ] Is the test approach clear and feasible?
- [ ] Are success/failure criteria unambiguous?

**Red Flags**:
❌ Subjective acceptance criteria  
❌ Requirements that cannot be measured  
❌ Vague success conditions  
❌ Requirements that require subjective judgment

### 9. Traceable
**Definition**: The requirement can be traced to its source and forward to implementation.

**Validation Questions**:
- [ ] Can this requirement be traced to a business need or user story?
- [ ] Is the rationale for this requirement documented?
- [ ] Can this requirement be traced forward to design and test cases?
- [ ] Are change impacts traceable?

**Traceability Links**:
- **Backward**: Business need → User story → Requirement
- **Forward**: Requirement → Design element → Test case → Code

## INCOSE Validation Checklist

### Requirements Document Level
- [ ] **Scope**: Document clearly defines what is and isn't included
- [ ] **Assumptions**: All assumptions are explicitly stated and validated
- [ ] **Constraints**: Technical, business, and regulatory constraints are identified
- [ ] **Dependencies**: Internal and external dependencies are documented
- [ ] **Glossary**: All domain terms are clearly defined
- [ ] **Traceability**: Requirements are traceable to sources and forward to design

### Individual Requirement Level
For each requirement, verify:
- [ ] **Necessary**: Addresses a real stakeholder need
- [ ] **Unambiguous**: Has only one possible interpretation
- [ ] **Complete**: Fully describes the necessary behavior
- [ ] **Consistent**: Does not conflict with other requirements
- [ ] **Feasible**: Can be implemented within constraints
- [ ] **Modifiable**: Can be changed without excessive impact
- [ ] **Ranked**: Has clear priority and business value
- [ ] **Testable**: Can be verified objectively

### Quality Metrics
Track these metrics for requirements quality assessment:

| Metric | Target | Actual | Status |
|:-------|:-------|:-------|:-------|
| Requirements with clear priority | 100% | [%] | Pass/Fail |
| Requirements traced to business needs | 100% | [%] | Pass/Fail |
| Requirements with acceptance criteria | 100% | [%] | Pass/Fail |
| Ambiguous requirements | 0% | [%] | Pass/Fail |
| Conflicting requirements | 0% | [%] | Pass/Fail |
| Untestable requirements | 0% | [%] | Pass/Fail |

## Common Quality Issues

### Issue: Ambiguous Language
**Problem**: "The system shall provide adequate security"  
**Solution**: "The system shall encrypt all PII using AES-256 and require multi-factor authentication for admin access"

### Issue: Missing Error Conditions
**Problem**: "When user submits form, system shall save data"  
**Solution**: "When user submits valid form, system shall save data. When form validation fails, system shall display specific error messages."

### Issue: Implementation Bias
**Problem**: "The system shall use REST APIs to retrieve data"  
**Solution**: "The system shall retrieve user data from external sources within 3 seconds"

### Issue: Untestable Requirements
**Problem**: "The system shall be intuitive to use"  
**Solution**: "New users shall complete the registration process within 5 minutes without assistance"

### Issue: Inconsistent Terminology
**Problem**: Using "user", "customer", and "client" interchangeably  
**Solution**: Define terms in glossary and use consistently throughout

## Validation Process

### Phase 1: Individual Review
1. **Self-Assessment**: Author reviews each requirement against INCOSE criteria
2. **Peer Review**: Colleague reviews for clarity and completeness
3. **Technical Review**: Technical lead reviews for feasibility

### Phase 2: Cross-Functional Review
1. **Business Analyst**: Validates business need and completeness
2. **Architect**: Reviews technical feasibility and consistency
3. **QA Lead**: Reviews testability and acceptance criteria
4. **Product Owner**: Validates priority and business value

### Phase 3: Formal Inspection
1. **Preparation**: Reviewers study requirements document
2. **Inspection Meeting**: Systematic review of each requirement
3. **Issue Logging**: Document all issues found
4. **Rework**: Address issues and re-inspect if necessary

### Phase 4: Approval Gate
Requirements must pass INCOSE validation before proceeding to design phase.

## Validation Report Template

```markdown
# INCOSE Requirements Validation Report

**Document**: [Requirements document name]  
**Validator**: [Name and role]  
**Date**: [YYYY-MM-DD]  
**Review Type**: Individual | Cross-functional | Formal Inspection

## Quality Assessment Summary

| Characteristic | Requirements Count | Issues Found | Pass Rate |
|:---------------|:-------------------|:-------------|:----------|
| Necessary | [total] | [issues] | [%] |
| Unambiguous | [total] | [issues] | [%] |
| Complete | [total] | [issues] | [%] |
| Consistent | [total] | [issues] | [%] |
| Feasible | [total] | [issues] | [%] |
| Modifiable | [total] | [issues] | [%] |
| Ranked | [total] | [issues] | [%] |
| Testable | [total] | [issues] | [%] |

## Issues Identified

| Req ID | Issue Type | Severity | Description | Recommendation |
|:-------|:-----------|:---------|:------------|:---------------|
| FR-001 | Ambiguous | High | Uses subjective term "fast" | Specify response time requirement |
| FR-003 | Incomplete | Medium | Missing error handling | Add error condition specifications |
| NFR-002 | Untestable | High | "User-friendly" not measurable | Define specific usability metrics |

## Recommendations

### Critical Issues (Must Fix)
- [Issue 1]: [Specific action required]
- [Issue 2]: [Specific action required]

### Major Issues (Should Fix)
- [Issue 3]: [Specific action required]
- [Issue 4]: [Specific action required]

### Minor Issues (Consider Fixing)
- [Issue 5]: [Specific action required]

## Overall Assessment

- **Total Requirements**: [number]
- **Requirements Passing All Criteria**: [number] ([%])
- **Requirements with Critical Issues**: [number]
- **Requirements with Major Issues**: [number]

## Approval Decision

- [ ] **APPROVED**: Requirements meet INCOSE quality standards
- [ ] **CONDITIONAL APPROVAL**: Minor issues must be addressed
- [ ] **REJECTED**: Major quality issues require significant rework

**Rationale**: [Explanation of decision]

**Next Steps**: [Required actions before design phase]

---

**Reviewer Signature**: [Name, Role, Date]
```

## Integration with EARS

This INCOSE validation should be used in conjunction with EARS pattern validation:

1. **First**: Validate EARS pattern compliance (format and structure)
2. **Second**: Apply INCOSE quality characteristics (content and quality)
3. **Third**: Conduct stakeholder review and approval

Both validation approaches are complementary and ensure both structural correctness (EARS) and content quality (INCOSE).

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-19  
**Based On**: AGENTS.md v1.0.0