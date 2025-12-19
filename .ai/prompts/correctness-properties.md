# Correctness Property Generation

## Correctness Property Generation Prompt

Use this prompt to convert testable acceptance criteria into formal correctness properties:

```
CORRECTNESS PROPERTY GENERATION

Based on prework analysis: {prework_analysis}
Convert testable criteria to formal correctness properties.

PROPERTY GENERATION RULES:

1. **Universal Quantification**: Every property MUST start with "For any"
2. **Clear Subject**: Specify what the property applies to
3. **Testable Behavior**: State what should hold true
4. **Requirement Traceability**: Reference originating requirement

PROPERTY TEMPLATE:
```
### Property N: [Descriptive Name]
*For any* [subject], [condition/behavior that should hold true]
**Validates: Requirements X.Y**
```

CONVERSION GUIDELINES:

**From PROPERTY Criteria:**
- Original: "WHEN a user saves data, THE System SHALL store it persistently"
- Property: "*For any* valid user data, when saved, the system should make it retrievable"

**From EXAMPLE Criteria:**
- Original: "WHEN user clicks logout, THE System SHALL redirect to login page"
- Property: "*For any* authenticated user session, logout action should result in login page navigation"

**From EDGE-CASE Criteria:**
- Original: "WHEN file exceeds maximum size, THE System SHALL reject upload"
- Property: "*For any* file exceeding the size limit, the upload operation should be rejected with appropriate error"

**Skip NON-TESTABLE Criteria:**
- Do not generate properties for criteria marked as "no" in testability analysis

PROPERTY CATEGORIES:

1. **Data Integrity Properties**
   - Round-trip operations preserve data
   - Storage and retrieval consistency
   - Validation maintains data quality

2. **Behavioral Properties**
   - System responses to inputs
   - State transitions and consistency
   - Error handling and recovery

3. **Interface Properties**
   - UI state consistency
   - User interaction responses
   - Display and navigation behavior

4. **Security Properties**
   - Authentication and authorization
   - Access control enforcement
   - Data protection measures

EXAMPLE CONVERSIONS:

Input Criteria:
```
1.1 WHEN a user saves a task, THE Task Manager SHALL store it to local storage
  Testable: yes - property

1.2 WHEN invalid input is provided, THE Validator SHALL show error message  
  Testable: yes - edge-case

1.3 THE Interface SHALL be user-friendly
  Testable: no
```

Generated Properties:
```
### Property 1: Task Persistence
*For any* valid task data, when saved through the Task Manager, it should be retrievable from local storage
**Validates: Requirements 1.1**

### Property 2: Input Validation Error Handling
*For any* invalid input provided to the Validator, an appropriate error message should be displayed to the user
**Validates: Requirements 1.2**

[No property generated for 1.3 - marked as non-testable]
```
```

## Property Generation Examples

### Data Operations

**Acceptance Criterion:**
```
WHEN a user creates a new document, THE Document Manager SHALL assign a unique identifier and save it to the database
Testable: yes - property
```

**Generated Property:**
```
### Property 1: Document Creation and Uniqueness
*For any* new document created through the Document Manager, it should receive a unique identifier and be persistently stored in the database
**Validates: Requirements 2.1**
```

### Authentication & Security

**Acceptance Criterion:**
```
WHEN a user provides valid credentials, THE Authentication System SHALL create a secure session token
Testable: yes - property
```

**Generated Property:**
```
### Property 2: Authentication Session Creation
*For any* valid user credentials provided to the Authentication System, a secure session token should be created and associated with the user
**Validates: Requirements 3.2**
```

### Error Handling

**Acceptance Criterion:**
```
IF network connection fails during data sync, THEN THE Sync Manager SHALL queue operations for retry
Testable: yes - edge-case
```

**Generated Property:**
```
### Property 3: Network Failure Recovery
*For any* data sync operation that encounters network failure, the Sync Manager should queue the operation for automatic retry
**Validates: Requirements 4.3**
```

### User Interface

**Acceptance Criterion:**
```
WHEN a user submits a form with missing required fields, THE Form Validator SHALL highlight the missing fields
Testable: yes - example
```

**Generated Property:**
```
### Property 4: Form Validation Feedback
*For any* form submission with missing required fields, the Form Validator should provide clear visual indication of which fields need completion
**Validates: Requirements 5.1**
```

## Property Quality Guidelines

### ✅ HIGH QUALITY Properties

**Clear Universal Quantification:**
```
✅ "*For any* user authentication attempt, the system should log the attempt with timestamp and outcome"
```

**Specific and Testable:**
```
✅ "*For any* file upload operation, the system should validate file type and size before processing"
```

**Proper Traceability:**
```
✅ "**Validates: Requirements 2.3, 2.4**"
```

### ❌ POOR QUALITY Properties (with fixes)

**Missing Universal Quantification:**
```
❌ "The system should save user data"
✅ "*For any* user data modification, the system should persist changes within 5 seconds"
```

**Too Vague:**
```
❌ "*For any* user action, the system should respond appropriately"
✅ "*For any* user interface interaction, the system should provide feedback within 200 milliseconds"
```

**No Requirement Traceability:**
```
❌ Missing validation reference
✅ "**Validates: Requirements 1.2**"
```

**Not Testable:**
```
❌ "*For any* user interface, it should be intuitive and easy to use"
✅ "*For any* form submission error, the interface should display specific error messages with correction guidance"
```

## Property Types and Patterns

### Invariant Properties
Properties that should always hold true:
```
*For any* data structure in the system, internal consistency should be maintained after any operation
*For any* user session, authentication state should remain valid until explicit logout or timeout
```

### Round-Trip Properties
Properties about operations and their inverses:
```
*For any* serializable data object, serializing then deserializing should produce an equivalent object
*For any* encrypted data, decryption should recover the original plaintext exactly
```

### Metamorphic Properties
Properties about relationships between operations:
```
*For any* search query, adding additional filters should return a subset of the original results
*For any* sorted list, the length should remain unchanged after sorting
```

### Error Handling Properties
Properties about system behavior under failure conditions:
```
*For any* invalid input provided to the system, appropriate error messages should be returned without system failure
*For any* network timeout during operations, the system should gracefully degrade functionality
```

## Integration with Testing Frameworks

### Property-Based Test Generation
Each property should be implementable as a property-based test:

```javascript
// Property: Task Persistence
test('task persistence property', () => {
  fc.assert(fc.property(
    taskGenerator, // Generates random valid tasks
    (task) => {
      taskManager.save(task);
      const retrieved = taskManager.get(task.id);
      expect(retrieved).toEqual(task);
    }
  ), { numRuns: 100 });
});
```

### Test Annotation Format
Each property-based test MUST include this annotation:
```
**Feature: {feature_name}, Property {number}: {property_description}**
**Validates: Requirements X.Y**
```

## Property Validation Checklist

Before finalizing correctness properties:

- [ ] All testable criteria from prework analysis have corresponding properties
- [ ] Each property starts with "*For any*" universal quantification
- [ ] Properties are specific and measurable
- [ ] All properties reference their originating requirements
- [ ] Non-testable criteria are excluded (no properties generated)
- [ ] Properties are implementable as automated tests
- [ ] Property descriptions are clear and unambiguous
- [ ] Traceability links are accurate and complete