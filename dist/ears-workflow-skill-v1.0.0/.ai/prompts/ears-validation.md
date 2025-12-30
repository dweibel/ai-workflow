# EARS Pattern Validation

## EARS Pattern Validation Prompt

Use this prompt to validate acceptance criteria against EARS patterns:

```
EARS PATTERN VALIDATION

Review this acceptance criterion: "{criterion_text}"

VALIDATE AGAINST EARS PATTERNS:

1. **Ubiquitous Pattern**: THE <system> SHALL <response>
   - Example: "THE Task Manager SHALL save tasks to local storage"
   - Structure: Simple, always-true requirement
   - Check: Does it start with "THE" and contain "SHALL"?

2. **Event-driven Pattern**: WHEN <trigger>, THE <system> SHALL <response>
   - Example: "WHEN a user clicks save, THE Task Manager SHALL store the task"
   - Structure: Triggered by specific event
   - Check: Does it start with "WHEN" and contain "THE...SHALL"?

3. **State-driven Pattern**: WHILE <condition>, THE <system> SHALL <response>
   - Example: "WHILE the system is offline, THE Task Manager SHALL queue changes"
   - Structure: Behavior during a continuous state
   - Check: Does it start with "WHILE" and contain "THE...SHALL"?

4. **Unwanted Event Pattern**: IF <condition>, THEN THE <system> SHALL <response>
   - Example: "IF invalid data is entered, THEN THE Task Manager SHALL display an error"
   - Structure: Response to undesired conditions
   - Check: Does it start with "IF" and contain "THEN THE...SHALL"?

5. **Optional Feature Pattern**: WHERE <option>, THE <system> SHALL <response>
   - Example: "WHERE premium features are enabled, THE Task Manager SHALL sync to cloud"
   - Structure: Conditional functionality
   - Check: Does it start with "WHERE" and contain "THE...SHALL"?

6. **Complex Pattern**: [WHERE] [WHILE] [WHEN/IF] THE <system> SHALL <response>
   - Example: "WHERE sync is enabled, WHILE online, WHEN data changes, THE Task Manager SHALL upload updates"
   - Structure: Multiple conditions in specific order
   - Check: Does it follow WHERE → WHILE → WHEN/IF → THE → SHALL order?

VALIDATION RESULT:
- Pattern Match: {pattern_name} / NON-COMPLIANT
- Compliance: PASS / FAIL
- Issues Found: {list_of_issues}

CORRECTIONS (if non-compliant):
- Suggested Fix: "{corrected_criterion}"
- Explanation: {why_this_fix_works}

COMMON MISTAKES TO AVOID:
- Missing "THE" before system name
- Missing "SHALL" (using "will", "should", "must" instead)
- Wrong clause order in complex patterns
- Vague system names (use specific, defined terms)
- Passive voice instead of active voice
- Multiple thoughts in one criterion
```

## EARS Pattern Examples

### ✅ CORRECT Examples

**Ubiquitous:**
- THE Authentication System SHALL encrypt all passwords using bcrypt
- THE User Interface SHALL display loading indicators during data fetches

**Event-driven:**
- WHEN a user submits a form, THE Validation System SHALL check all required fields
- WHEN network connection is lost, THE Application SHALL display offline mode

**State-driven:**
- WHILE a file is uploading, THE Progress Bar SHALL show completion percentage
- WHILE in maintenance mode, THE System SHALL reject all user requests

**Unwanted Event:**
- IF authentication fails three times, THEN THE Security System SHALL lock the account
- IF memory usage exceeds 90%, THEN THE Application SHALL trigger garbage collection

**Optional Feature:**
- WHERE dark mode is enabled, THE Interface SHALL use dark color scheme
- WHERE premium subscription is active, THE System SHALL enable advanced features

**Complex:**
- WHERE notifications are enabled, WHILE the app is active, WHEN new messages arrive, THE System SHALL display popup alerts

### ❌ INCORRECT Examples (with fixes)

**Wrong:**
- "The system will save data automatically"
**Fix:**
- "THE Data Manager SHALL save user data automatically every 5 minutes"

**Wrong:**
- "When users click save, data should be stored"
**Fix:**
- "WHEN a user clicks save, THE Data Manager SHALL store the current document"

**Wrong:**
- "If errors occur, show error message"
**Fix:**
- "IF validation errors occur, THEN THE User Interface SHALL display specific error messages"

**Wrong:**
- "While loading, users can't interact"
**Fix:**
- "WHILE data is loading, THE User Interface SHALL disable all interactive elements"

## Validation Checklist

Use this checklist when validating EARS patterns:

- [ ] Starts with correct trigger word (THE, WHEN, WHILE, IF, WHERE)
- [ ] Contains "THE <system_name> SHALL" structure
- [ ] Uses active voice (system does action)
- [ ] System name is specific and defined in glossary
- [ ] Response is measurable and testable
- [ ] Single thought per criterion
- [ ] No escape clauses ("where possible", "if needed")
- [ ] No vague terms ("quickly", "efficiently", "user-friendly")
- [ ] Complex patterns follow correct order: WHERE → WHILE → WHEN/IF → THE → SHALL