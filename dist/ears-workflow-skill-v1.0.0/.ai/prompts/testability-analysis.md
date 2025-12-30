# Testability Analysis (Prework Integration)

## Testability Analysis Prompt

Use this prompt to analyze acceptance criteria for testability before generating correctness properties:

```
TESTABILITY ANALYSIS (PREWORK)

Analyze each acceptance criterion for testability: "{acceptance_criteria}"

FOR EACH CRITERION, DETERMINE:

**Step 1: Understand the Requirement**
- What specific behavior is being required?
- What inputs/conditions trigger this behavior?
- What outputs/responses are expected?

**Step 2: Assess Testability**
- Can this be tested automatically?
- Does it involve computable properties?
- Is it about system behavior vs. human perception?

**Step 3: Categorize Testability Type**

1. **YES - PROPERTY**: Universal rule that applies across many inputs
   - Can generate random inputs to test the rule
   - Behavior should hold for all valid inputs
   - Example: "All saved tasks should be retrievable"

2. **YES - EXAMPLE**: Specific scenario that can be tested
   - Concrete input/output pair
   - Specific edge case or boundary condition
   - Example: "Empty input should show validation error"

3. **YES - EDGE CASE**: Boundary condition or special case
   - Specific unusual or extreme condition
   - Important for robustness but not general property
   - Example: "System handles maximum file size limit"

4. **NO**: Cannot be automatically tested
   - Subjective human judgment required
   - UI aesthetics or "feel"
   - Performance that requires human evaluation
   - Example: "Interface should be user-friendly"

**Analysis Format:**
```
X.Y [Criterion Description]
  Thoughts: [Step-by-step reasoning about testability]
  Testable: [yes - property | yes - example | yes - edge-case | no]
```

**Complete Analysis Example:**
```
1.1 WHEN a user clicks save, THE Task Manager SHALL store the task to local storage
  Thoughts: This is about a general behavior that should work for any task data. We can generate random task objects, trigger the save action, and verify the task appears in local storage. This applies to all tasks, not just specific examples.
  Testable: yes - property

1.2 WHEN a user attempts to save an empty task, THE Task Manager SHALL prevent the save and display an error message
  Thoughts: This is testing input validation for a specific edge case (empty input). We can test this specific scenario but it's about boundary conditions rather than a general property.
  Testable: yes - edge-case

1.3 WHEN the save operation completes, THE User Interface SHALL provide visual feedback that feels responsive
  Thoughts: "Feels responsive" is subjective and requires human judgment about UI experience. We can't automatically test whether something "feels" responsive.
  Testable: no
```

USE PREWORK TOOL: After completing analysis, use the prework tool to store this analysis for correctness property generation.
```

## Testability Decision Tree

Use this decision tree to categorize acceptance criteria:

```
START: Acceptance Criterion

├─ Does it involve human subjective judgment?
│  ├─ YES → Testable: NO
│  └─ NO → Continue
│
├─ Is it about UI aesthetics, "feel", or user experience?
│  ├─ YES → Testable: NO  
│  └─ NO → Continue
│
├─ Can the behavior be verified programmatically?
│  ├─ NO → Testable: NO
│  └─ YES → Continue
│
├─ Does it apply to a broad range of inputs/scenarios?
│  ├─ YES → Testable: YES - PROPERTY
│  └─ NO → Continue
│
├─ Is it a specific boundary condition or edge case?
│  ├─ YES → Testable: YES - EDGE-CASE
│  └─ NO → Continue
│
└─ Is it a specific concrete scenario?
   ├─ YES → Testable: YES - EXAMPLE
   └─ NO → Testable: NO
```

## Testability Categories with Examples

### YES - PROPERTY (Universal Rules)

**Characteristics:**
- Applies to many different inputs
- Can generate random test data
- Universal behavior across the system
- Good candidates for property-based testing

**Examples:**
```
✅ "WHEN a user saves any valid task, THE System SHALL make it retrievable"
   → Property: All saved items should be retrievable

✅ "WHEN any user authenticates successfully, THE System SHALL create a session"
   → Property: Successful authentication always creates sessions

✅ "WHEN data is serialized then deserialized, THE System SHALL produce equivalent data"
   → Property: Round-trip operations preserve data integrity
```

### YES - EXAMPLE (Concrete Scenarios)

**Characteristics:**
- Specific input/output pairs
- Concrete test cases
- Demonstrable behavior
- Good for unit tests

**Examples:**
```
✅ "WHEN a user submits an empty form, THE System SHALL display 'Required fields missing'"
   → Example: Empty input → specific error message

✅ "WHEN the system starts, THE Dashboard SHALL display the welcome screen"
   → Example: Startup → specific UI state

✅ "WHEN a user clicks logout, THE System SHALL redirect to login page"
   → Example: Logout action → specific navigation
```

### YES - EDGE-CASE (Boundary Conditions)

**Characteristics:**
- Unusual or extreme conditions
- Boundary values and limits
- Error conditions and failures
- Important for robustness

**Examples:**
```
✅ "WHEN file size exceeds 10MB, THE System SHALL reject the upload"
   → Edge-case: Maximum file size boundary

✅ "WHEN network connection fails, THE System SHALL queue operations for retry"
   → Edge-case: Network failure condition

✅ "WHEN memory usage reaches 90%, THE System SHALL trigger garbage collection"
   → Edge-case: Resource limit boundary
```

### NO (Not Automatically Testable)

**Characteristics:**
- Requires human judgment
- Subjective qualities
- Aesthetic or experiential requirements
- Performance requiring human evaluation

**Examples:**
```
❌ "THE Interface SHALL be intuitive and user-friendly"
   → Subjective: Requires human usability testing

❌ "THE System SHALL feel responsive during normal use"
   → Subjective: "Feel" requires human perception

❌ "THE Design SHALL follow modern UI principles"
   → Subjective: Design aesthetics require human judgment

❌ "THE System SHALL be maintainable by future developers"
   → Subjective: Code quality requires human assessment
```

## Common Testability Patterns

### Data Operations (Usually PROPERTY)
- Create, Read, Update, Delete operations
- Data validation and transformation
- Storage and retrieval operations
- Serialization and parsing

### User Interface Actions (Usually EXAMPLE)
- Button clicks and form submissions
- Navigation and page transitions
- Display of specific content
- Error message presentation

### System Behavior (Usually PROPERTY)
- Authentication and authorization
- Error handling and recovery
- Performance under load
- Integration between components

### Edge Cases (Usually EDGE-CASE)
- Boundary value testing
- Error conditions and failures
- Resource limits and constraints
- Invalid input handling

### Non-Functional Requirements (Often NO)
- Usability and user experience
- Aesthetic design requirements
- Subjective performance qualities
- Maintainability and code quality

## Integration with Prework Tool

After completing testability analysis, use the prework tool:

```javascript
// Example prework tool usage
prework({
  featureName: "task-management",
  preworkAnalysis: `
1.1 WHEN a user saves a task, THE Task Manager SHALL store it to local storage
  Thoughts: This is about general save behavior that should work for any task. We can generate random tasks and verify they're stored correctly.
  Testable: yes - property

1.2 WHEN a user saves an empty task, THE Task Manager SHALL show validation error
  Thoughts: This is testing a specific boundary condition with empty input.
  Testable: yes - edge-case

1.3 THE Interface SHALL feel responsive and smooth
  Thoughts: "Feel responsive" is subjective and requires human judgment.
  Testable: no
  `
});
```

## Quality Assurance Checklist

Before proceeding to correctness property generation:

- [ ] All acceptance criteria have been analyzed
- [ ] Testability reasoning is clear and step-by-step
- [ ] Categories are correctly assigned (property/example/edge-case/no)
- [ ] Analysis considers both positive and negative test cases
- [ ] Edge cases and boundary conditions are identified
- [ ] Subjective requirements are correctly marked as non-testable
- [ ] Prework tool has been used to store the analysis
- [ ] Analysis is ready for correctness property generation