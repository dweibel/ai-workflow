# Review Reports

This directory contains code review findings, audit reports, security assessments, and quality checks generated during the REVIEW phase.

## Purpose

Review documents provide:
- Multi-perspective code audits
- Security vulnerability assessments
- Performance analysis
- Code quality findings
- Actionable improvement recommendations

## File Naming Convention

`YYYY-MM-DD-review-scope.md`

Examples:
- `2025-12-16-review-auth-module.md`
- `2025-12-20-review-api-endpoints.md`
- `2026-01-05-security-audit.md`

## Review Report Template

```markdown
# Code Review: [Scope/Feature Name]

**Date:** YYYY-MM-DD
**Reviewer:** [Agent/User]
**Branch/PR:** [branch-name or PR number]
**Status:** In Progress | Completed

## Overview
Brief description of what was reviewed.

## Review Methodology
- [ ] Security Sentinel - OWASP vulnerabilities, authentication, secrets
- [ ] Performance Oracle - Algorithmic complexity, resource usage
- [ ] Framework Purist - Idiomatic code, conventions, best practices
- [ ] Data Integrity Guardian - Database migrations, constraints, integrity

## Findings

### CRITICAL
Issues that must be fixed before merge.

- **[CRITICAL-001]** Title
  - **Location:** `file.py:123`
  - **Issue:** Description of the problem
  - **Impact:** Why this is critical
  - **Recommendation:** How to fix it

### HIGH
Important issues that should be addressed soon.

- **[HIGH-001]** Title
  - **Location:** `file.py:456`
  - **Issue:** Description
  - **Recommendation:** Fix suggestion

### MEDIUM
Issues to address when convenient.

- **[MEDIUM-001]** Title
  - **Location:** `file.py:789`
  - **Issue:** Description
  - **Recommendation:** Improvement suggestion

### LOW
Nice-to-have improvements.

- **[LOW-001]** Title
  - **Location:** `file.py:012`
  - **Issue:** Description
  - **Recommendation:** Optional enhancement

## Positive Observations
What was done well in this code.

## Summary

**Total Findings:** X CRITICAL, Y HIGH, Z MEDIUM, W LOW

**Approval Status:** 
- [ ] Approved (no critical issues)
- [ ] Approved with conditions (address critical issues)
- [ ] Changes required (critical issues must be fixed)

## Follow-up Actions
- [ ] Action 1
- [ ] Action 2

## References
- Related plan: `.ai/docs/plans/YYYY-MM-DD-feature-name.md`
- Related design: `.ai/docs/design/component-design.md`
```

## Usage Guidelines

1. **Use all four personas:** Each perspective catches different issues
2. **Be specific:** Include file paths, line numbers, and code snippets
3. **Triage properly:** Correctly classify severity (CRITICAL/HIGH/MEDIUM/LOW)
4. **Provide solutions:** Don't just identify problems, suggest fixes
5. **Track resolution:** Update the report as findings are addressed
6. **Learn from reviews:** Extract patterns and add to `.ai/memory/lessons.md`

## Related Directories

- `.ai/docs/plans/` - Plans that were implemented and are now being reviewed
- `.ai/docs/design/` - Designs to verify against
- `.ai/docs/decisions/` - Review may inform new architectural decisions
