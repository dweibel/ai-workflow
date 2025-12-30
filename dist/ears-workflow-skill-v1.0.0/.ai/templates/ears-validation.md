# EARS Validation Template

This template provides validation criteria for ensuring requirements follow the EARS (Easy Approach to Requirements Syntax) methodology.

## EARS Pattern Validation

### Pattern 1: Ubiquitous Requirements
**Format**: "The system shall [action]"

**Validation Checklist**:
- [ ] Starts with "The system shall"
- [ ] Contains a clear action verb
- [ ] Specifies what the system does, not what users do
- [ ] Is measurable and testable
- [ ] Contains no ambiguous words (should, might, could)

**Examples**:
✅ "The system shall encrypt all user passwords using bcrypt"  
✅ "The system shall log all authentication attempts"  
❌ "The system should be secure" (uses "should", not measurable)  
❌ "Users shall enter their password" (about users, not system)

### Pattern 2: Event-Driven Requirements
**Format**: "When [trigger event], the system shall [response]"

**Validation Checklist**:
- [ ] Starts with "When"
- [ ] Clearly identifies the trigger event
- [ ] Specifies the system's response
- [ ] Response is immediate and deterministic
- [ ] Event is observable and testable

**Examples**:
✅ "When a user clicks the submit button, the system shall validate the form data"  
✅ "When the database connection fails, the system shall retry 3 times"  
❌ "When users are happy, the system shall..." (event not observable)  
❌ "When something happens, the system shall..." (vague event)

### Pattern 3: State-Driven Requirements
**Format**: "While [system state], the system shall [behavior]"

**Validation Checklist**:
- [ ] Starts with "While"
- [ ] Clearly defines the system state
- [ ] Specifies continuous behavior during that state
- [ ] State is verifiable and measurable
- [ ] Behavior is appropriate for the duration of the state

**Examples**:
✅ "While a user session is active, the system shall refresh tokens every 15 minutes"  
✅ "While the system is in maintenance mode, the system shall display a maintenance message"  
❌ "While users are working, the system shall..." (user state, not system state)  
❌ "While the system is running, the system shall work properly" (too vague)

### Pattern 4: Optional Requirements
**Format**: "Where [feature is included], the system shall [behavior]"

**Validation Checklist**:
- [ ] Starts with "Where"
- [ ] Clearly identifies the optional feature or configuration
- [ ] Specifies behavior only when feature is present
- [ ] Feature inclusion is deterministic
- [ ] Behavior is specific to the optional feature

**Examples**:
✅ "Where two-factor authentication is enabled, the system shall require SMS verification"  
✅ "Where the premium feature is activated, the system shall allow unlimited uploads"  
❌ "Where users want it, the system shall..." (not deterministic)  
❌ "Where possible, the system shall..." (too vague)

### Pattern 5: Complex Requirements
**Format**: "If [condition], then the system shall [behavior], else [alternative behavior]"

**Validation Checklist**:
- [ ] Starts with "If"
- [ ] Clearly defines the condition
- [ ] Specifies primary behavior after "then"
- [ ] Specifies alternative behavior after "else"
- [ ] Condition is testable and unambiguous
- [ ] Both behaviors are complete and testable

**Examples**:
✅ "If the user has admin privileges, then the system shall display the admin panel, else the system shall display the user dashboard"  
✅ "If the file size exceeds 10MB, then the system shall compress the file, else the system shall store it directly"  
❌ "If it makes sense, then the system shall..." (condition not testable)  
❌ "If the user is authenticated, then the system shall work" (behavior too vague)

## Quality Validation Checklist

### Completeness
- [ ] All functional behavior is covered by requirements
- [ ] All error conditions are addressed
- [ ] All user interactions have corresponding system responses
- [ ] All data flows are specified
- [ ] All integration points are defined

### Consistency
- [ ] No contradictory requirements exist
- [ ] Terminology is used consistently (check against glossary)
- [ ] EARS patterns are applied consistently
- [ ] Numbering/referencing scheme is consistent
- [ ] Format and structure are consistent

### Correctness
- [ ] Requirements reflect actual business needs
- [ ] Technical feasibility has been considered
- [ ] Requirements align with system architecture
- [ ] Dependencies are correctly identified
- [ ] Constraints are accurately captured

### Clarity
- [ ] Each requirement has a single, clear meaning
- [ ] No ambiguous terms are used
- [ ] Complex requirements are broken down appropriately
- [ ] Examples are provided where helpful
- [ ] Glossary defines all domain terms

### Testability
- [ ] Each requirement can be verified through testing
- [ ] Acceptance criteria are specific and measurable
- [ ] Test conditions are deterministic
- [ ] Success/failure criteria are clear
- [ ] Performance requirements include specific metrics

## Common Anti-Patterns to Avoid

### Weak Language
❌ "The system should..." → ✅ "The system shall..."  
❌ "The system might..." → ✅ "The system shall..."  
❌ "The system could..." → ✅ "The system shall..."  
❌ "The system will try to..." → ✅ "The system shall..."

### Vague Requirements
❌ "The system shall be fast" → ✅ "The system shall respond within 2 seconds"  
❌ "The system shall be user-friendly" → ✅ "The system shall require no more than 3 clicks to complete checkout"  
❌ "The system shall handle errors gracefully" → ✅ "When a database error occurs, the system shall display a user-friendly error message and log the technical details"

### Implementation Details
❌ "The system shall use MySQL database" → ✅ "The system shall persist user data"  
❌ "The system shall implement OAuth2" → ✅ "The system shall authenticate users via third-party providers"  
❌ "The system shall use React components" → ✅ "The system shall display interactive user interface elements"

### User-Focused Requirements
❌ "Users shall enter their email" → ✅ "The system shall accept email input from users"  
❌ "Administrators must configure settings" → ✅ "The system shall provide configuration options for administrators"  
❌ "Customers will receive notifications" → ✅ "The system shall send notifications to customers"

## Validation Process

### Step 1: Pattern Validation
1. Check each requirement against appropriate EARS pattern
2. Verify format compliance
3. Ensure proper use of trigger words (when, while, where, if)
4. Validate that system behavior is specified, not user behavior

### Step 2: Quality Validation
1. Run through quality checklist (completeness, consistency, correctness, clarity, testability)
2. Check for anti-patterns
3. Verify glossary usage
4. Ensure traceability to user stories

### Step 3: Stakeholder Review
1. Technical review for feasibility
2. Business review for completeness
3. QA review for testability
4. User experience review for usability implications

### Step 4: Approval Gate
Requirements must pass all validation criteria before proceeding to design phase.

## Validation Report Template

```markdown
# EARS Validation Report

**Document**: [Requirements document name]  
**Validator**: [Name]  
**Date**: [YYYY-MM-DD]

## Pattern Compliance
- Ubiquitous: [X] requirements - [Y] compliant
- Event-driven: [X] requirements - [Y] compliant  
- State-driven: [X] requirements - [Y] compliant
- Optional: [X] requirements - [Y] compliant
- Complex: [X] requirements - [Y] compliant

## Quality Assessment
- [ ] Completeness: Pass/Fail
- [ ] Consistency: Pass/Fail
- [ ] Correctness: Pass/Fail
- [ ] Clarity: Pass/Fail
- [ ] Testability: Pass/Fail

## Issues Found
| Requirement ID | Issue Type | Description | Recommendation |
|:---------------|:-----------|:------------|:---------------|
| FR-001 | Pattern | Uses "should" instead of "shall" | Replace with "shall" |
| FR-005 | Clarity | Ambiguous term "quickly" | Specify time requirement |

## Approval Status
- [ ] **APPROVED**: All validation criteria met
- [ ] **CONDITIONAL**: Minor issues must be addressed
- [ ] **REJECTED**: Major issues require rework

**Next Steps**: [Actions required before design phase]
```

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-19  
**Based On**: AGENTS.md v1.0.0