# Requirements Document Template

## Requirements Document Template

Use this template to create EARS-compliant requirements documents:

```markdown
# Requirements Document

## Introduction

[Provide a 2-3 paragraph summary of the feature or system being specified. Include:]
- What problem this feature solves
- Who will benefit from this feature
- How it fits into the larger system context
- Any relevant background or constraints

## Glossary

[Define ALL technical terms used in the requirements. Each term must be defined exactly once and used consistently throughout.]

- **[Term 1]**: [Clear, unambiguous definition]
- **[Term 2]**: [Clear, unambiguous definition]
- **[System Name]**: [The specific system or component being specified]
- **[Technical Concept]**: [Any domain-specific terminology]

## Requirements

### Requirement 1

**User Story:** As a [specific role], I want [specific capability], so that [specific benefit].

#### Acceptance Criteria

1. [EARS Pattern] [Specific, testable criterion]
2. [EARS Pattern] [Specific, testable criterion]
3. [EARS Pattern] [Specific, testable criterion]
4. [EARS Pattern] [Specific, testable criterion]
5. [EARS Pattern] [Specific, testable criterion]

### Requirement 2

**User Story:** As a [specific role], I want [specific capability], so that [specific benefit].

#### Acceptance Criteria

1. [EARS Pattern] [Specific, testable criterion]
2. [EARS Pattern] [Specific, testable criterion]
3. [EARS Pattern] [Specific, testable criterion]

[Continue for all requirements...]
```

## Template Usage Guidelines

### Introduction Section
- **Purpose**: Provide context and scope for the requirements
- **Length**: 2-3 paragraphs maximum
- **Content**: Problem statement, stakeholders, system context
- **Validation**: Should answer "Why does this feature exist?"

### Glossary Section
- **Purpose**: Define all technical terms used in requirements
- **Format**: Alphabetical list with bold terms and clear definitions
- **Completeness**: Every technical term in requirements must be defined
- **Consistency**: Use exact glossary terms throughout the document

### Requirements Section
- **Structure**: User story followed by 2-5 acceptance criteria
- **User Stories**: Follow "As a [role], I want [capability], so that [benefit]" format
- **Acceptance Criteria**: Must follow EARS patterns exactly
- **Numbering**: Use hierarchical numbering (Requirement 1, 1.1, 1.2, etc.)

## Validation Checkpoints

Insert these validation checkpoints throughout the template:

### After Introduction
```
VALIDATION CHECKPOINT 1:
- [ ] Problem clearly stated
- [ ] Stakeholders identified
- [ ] System context provided
- [ ] Scope and boundaries defined
```

### After Glossary
```
VALIDATION CHECKPOINT 2:
- [ ] All technical terms defined
- [ ] Definitions are clear and unambiguous
- [ ] No circular definitions
- [ ] Consistent terminology established
```

### After Each Requirement
```
VALIDATION CHECKPOINT 3:
- [ ] User story follows proper format
- [ ] All acceptance criteria use EARS patterns
- [ ] All terms are defined in glossary
- [ ] Criteria are testable and measurable
- [ ] INCOSE quality rules satisfied
```

### Final Validation
```
VALIDATION CHECKPOINT 4:
- [ ] All EARS patterns validated
- [ ] All INCOSE quality rules satisfied
- [ ] Glossary completeness verified
- [ ] Round-trip requirements included (if applicable)
- [ ] Document ready for design phase
```

## EARS Pattern Quick Reference

Use these patterns in acceptance criteria:

1. **Ubiquitous**: THE [System] SHALL [response]
2. **Event-driven**: WHEN [trigger], THE [System] SHALL [response]
3. **State-driven**: WHILE [condition], THE [System] SHALL [response]
4. **Unwanted event**: IF [condition], THEN THE [System] SHALL [response]
5. **Optional feature**: WHERE [option], THE [System] SHALL [response]
6. **Complex**: [WHERE] [WHILE] [WHEN/IF] THE [System] SHALL [response]

## Common Requirements Patterns

### Authentication & Security
```
**User Story:** As a system administrator, I want secure user authentication, so that only authorized users can access the system.

#### Acceptance Criteria
1. WHEN a user submits login credentials, THE Authentication System SHALL verify them against the user database
2. IF authentication fails, THEN THE Security System SHALL log the failed attempt with timestamp and IP address
3. WHEN authentication succeeds, THE Session Manager SHALL create a secure session token
4. WHILE a user session is active, THE Authorization System SHALL validate permissions for each request
5. WHERE two-factor authentication is enabled, THE Authentication System SHALL require secondary verification
```

### Data Management
```
**User Story:** As a user, I want my data to be automatically saved, so that I don't lose work due to unexpected interruptions.

#### Acceptance Criteria
1. WHEN a user modifies data, THE Auto-Save System SHALL save changes within 30 seconds
2. WHILE the system is saving data, THE User Interface SHALL display a saving indicator
3. IF a save operation fails, THEN THE Error Handler SHALL retry up to 3 times before alerting the user
4. THE Backup System SHALL create incremental backups every 15 minutes during active sessions
5. WHERE offline mode is active, THE Local Storage System SHALL queue changes for synchronization
```

### User Interface
```
**User Story:** As a user, I want clear feedback on my actions, so that I understand what the system is doing.

#### Acceptance Criteria
1. WHEN a user initiates an action, THE User Interface SHALL provide immediate visual feedback
2. WHILE long-running operations execute, THE Progress Indicator SHALL show completion percentage
3. IF an error occurs, THEN THE Error Display SHALL show specific, actionable error messages
4. THE Notification System SHALL display success confirmations for completed actions
5. WHERE accessibility features are enabled, THE Interface SHALL provide screen reader compatible feedback
```

## Round-Trip Testing Detection

If requirements mention any of these concepts, automatically include round-trip testing requirements:

**Parser/Serialization Keywords:**
- "parse", "parsing", "parser"
- "serialize", "serialization", "deserialize"
- "encode", "decode", "encoding"
- "format", "formatting", "convert"
- "JSON", "XML", "CSV", "YAML"
- "import", "export", "transform"

**Auto-Generated Round-Trip Requirement:**
```
**User Story:** As a developer, I want parsing and serialization to be reliable, so that data integrity is maintained throughout the system.

#### Acceptance Criteria
1. WHEN data is serialized and then deserialized, THE [Parser/Serializer] SHALL produce equivalent data structures
2. THE [Parser] SHALL correctly handle all valid input formats as defined by the specification
3. IF invalid input is provided, THEN THE [Parser] SHALL provide clear error messages indicating the specific issue
4. THE [Serializer] SHALL generate output that conforms to the target format specification
5. WHEN round-trip operations are performed, THE System SHALL maintain data fidelity with no information loss
```