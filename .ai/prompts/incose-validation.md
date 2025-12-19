# INCOSE Quality Validation

## INCOSE Quality Validation Prompt

Use this prompt to validate requirements against INCOSE quality rules:

```
INCOSE QUALITY VALIDATION

Review this requirement: "{requirement_text}"

VALIDATE AGAINST INCOSE QUALITY RULES:

1. **Active Voice (Who does what)**
   - ✅ Good: "THE System SHALL encrypt data"
   - ❌ Bad: "Data shall be encrypted"
   - Check: Is it clear WHO performs the action?

2. **No Vague Terms**
   - ❌ Avoid: "quickly", "efficiently", "user-friendly", "adequate", "reasonable"
   - ✅ Use: Specific, measurable terms
   - Check: Are all terms concrete and measurable?

3. **No Escape Clauses**
   - ❌ Avoid: "where possible", "if needed", "as appropriate", "when feasible"
   - ✅ Use: Definitive statements
   - Check: Does the requirement commit to specific behavior?

4. **No Negative Statements**
   - ❌ Avoid: "SHALL not", "will not", "must not"
   - ✅ Use: Positive statements about what the system SHALL do
   - Check: Is the requirement stated positively?

5. **One Thought Per Requirement**
   - ❌ Bad: "THE System SHALL validate input AND display errors AND log failures"
   - ✅ Good: Split into separate requirements
   - Check: Does the requirement contain only one testable behavior?

6. **Explicit and Measurable Conditions**
   - ✅ Good: "within 2 seconds", "with 99.9% accuracy", "using AES-256 encryption"
   - ❌ Bad: "fast", "accurate", "secure"
   - Check: Are all conditions quantifiable?

7. **Consistent Terminology**
   - Use terms exactly as defined in glossary
   - Don't use synonyms or variations
   - Check: Are all terms consistent with glossary definitions?

8. **No Pronouns**
   - ❌ Avoid: "it", "them", "they", "this", "that"
   - ✅ Use: Specific nouns from glossary
   - Check: Are all references explicit and clear?

9. **No Absolutes**
   - ❌ Avoid: "never", "always", "all", "every", "100%"
   - ✅ Use: Realistic, achievable targets
   - Check: Are expectations realistic and testable?

10. **Solution-Free (Focus on WHAT, not HOW)**
    - ✅ Good: "THE System SHALL authenticate users"
    - ❌ Bad: "THE System SHALL use OAuth2 to authenticate users"
    - Check: Does it specify behavior without implementation details?

VALIDATION RESULTS:
- Overall Quality: PASS / FAIL
- Issues Found: {list_violations}
- Severity: CRITICAL / HIGH / MEDIUM / LOW

IMPROVEMENTS NEEDED:
{specific_suggestions_for_each_violation}

CORRECTED VERSION:
"{improved_requirement_text}"
```

## INCOSE Quality Examples

### ✅ HIGH QUALITY Requirements

**Good Active Voice:**
- "WHEN a user enters credentials, THE Authentication System SHALL verify them against the user database within 3 seconds"

**Good Measurable Conditions:**
- "THE Backup System SHALL complete full system backup within 4 hours during off-peak periods"

**Good Specific Terms:**
- "THE Encryption Module SHALL use AES-256 algorithm to encrypt all personally identifiable information"

**Good Single Thought:**
- "THE User Interface SHALL display validation errors immediately upon form submission"

### ❌ POOR QUALITY Requirements (with fixes)

**Passive Voice:**
- ❌ "User credentials should be validated quickly"
- ✅ "WHEN a user submits credentials, THE Authentication System SHALL validate them within 2 seconds"

**Vague Terms:**
- ❌ "THE System SHALL provide good performance"
- ✅ "THE System SHALL respond to user requests within 500 milliseconds under normal load"

**Escape Clauses:**
- ❌ "THE System SHALL backup data when possible"
- ✅ "THE Backup System SHALL create incremental backups every 6 hours during business days"

**Negative Statements:**
- ❌ "THE System SHALL not allow unauthorized access"
- ✅ "THE Security System SHALL require valid authentication for all protected resources"

**Multiple Thoughts:**
- ❌ "THE System SHALL validate input, log errors, and notify administrators"
- ✅ Split into:
  - "THE Validation System SHALL check all input against defined schemas"
  - "THE Logging System SHALL record all validation failures with timestamps"
  - "THE Notification System SHALL alert administrators of critical validation errors"

**Pronouns:**
- ❌ "WHEN it fails, THE System SHALL restart it automatically"
- ✅ "WHEN the Database Connection fails, THE Connection Manager SHALL restart the Database Connection automatically"

**Absolutes:**
- ❌ "THE System SHALL never lose data"
- ✅ "THE Data Storage System SHALL maintain 99.99% data integrity with automated recovery procedures"

**Implementation Details:**
- ❌ "THE System SHALL use Redis to cache frequently accessed data"
- ✅ "THE Caching System SHALL store frequently accessed data for retrieval within 10 milliseconds"

## Quality Assessment Scoring

Use this scoring system to assess requirement quality:

**CRITICAL Issues (Must Fix):**
- Passive voice
- Multiple thoughts in one requirement
- Escape clauses
- Undefined terms

**HIGH Priority Issues (Should Fix):**
- Vague or unmeasurable terms
- Negative statements
- Pronouns instead of specific nouns
- Unrealistic absolutes

**MEDIUM Priority Issues (Consider Fixing):**
- Minor terminology inconsistencies
- Slightly ambiguous phrasing
- Missing quantitative measures where helpful

**LOW Priority Issues (Optional):**
- Style preferences
- Minor wording improvements
- Enhanced clarity suggestions

## Validation Checklist

- [ ] Active voice with clear actor
- [ ] All terms are concrete and measurable
- [ ] No escape clauses or hedging language
- [ ] Positive statement (what system SHALL do)
- [ ] Single, testable behavior
- [ ] Quantified conditions where applicable
- [ ] Consistent with glossary terms
- [ ] No pronouns - all references explicit
- [ ] Realistic and achievable expectations
- [ ] Focuses on behavior, not implementation
- [ ] Grammatically correct and clear
- [ ] Follows EARS pattern structure