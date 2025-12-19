# Lessons Learned

This file contains the accumulated wisdom from past engineering sessions. Every agent session should load this file at the start to avoid repeating past mistakes.

## How to Use This File

- **Load at start**: Always read this file before starting any task
- **Update after completion**: Add new lessons when you solve a problem or make a mistake
- **Format**: `- When doing X, always ensure Y to prevent Z.`
- **Be specific**: Reference files, error messages, or specific scenarios

---

## Git & Version Control

- When creating a git worktree, always verify your location with `pwd` before making changes to prevent modifying the main branch accidentally.
- When committing changes, always use conventional commit format (`feat:`, `fix:`, `refactor:`, etc.) for clear git history.
- When working on multiple features, always use separate worktrees to avoid context switching issues and merge conflicts.

---

## Testing

- When writing tests, always follow the Red-Green-Refactor loop to ensure tests actually validate the behavior.
- When tests fail, always read the stderr output carefully rather than skimming it to identify the root cause, not just symptoms.
- When refactoring, always run the full test suite to catch regressions that might be missed by running only specific tests.

---

## Code Quality

- When implementing a feature, always check `.ai/memory/decisions.md` for established patterns to ensure consistency.
- When encountering "legacy" code, always check git history (`git log -p <file>`) to understand why it exists before proposing rewrites.
- When adding dependencies, always check if existing dependencies can accomplish the same goal to prevent dependency bloat.

---

## Database & Migrations

- When adding columns with NOT NULL constraints, always backfill NULL values first to prevent migration failures.
- When creating indexes on large tables, always use `CONCURRENTLY` (PostgreSQL) to avoid table locks.
- When renaming columns, always use multi-phase deployment (add new, backfill, drop old) to maintain backward compatibility.

---

## Security

- When handling user input, always sanitize and validate to prevent SQL injection, XSS, and other injection attacks.
- When storing secrets, always use environment variables and never commit them to git to prevent credential leaks.
- When implementing authentication, always enforce authorization checks at both the API and database level to prevent bypasses.

---

## Performance

- When querying databases, always use eager loading or batch fetching to avoid N+1 query problems.
- When processing large datasets, always use batching and pagination to prevent memory exhaustion.
- When implementing caching, always consider cache invalidation strategy to prevent serving stale data.

---

## Debugging

- When stuck on a bug after 2 failed attempts, always ask the user for guidance rather than continuing to thrash.
- When debugging, always add diagnostic logging to understand actual vs. expected values before attempting fixes.
- When assumptions are wrong, always codify the correct understanding as a lesson to prevent future errors.

---

## Workflow

- When starting a task, always load the appropriate workflow and role files from `.ai/` to ensure proper context.
- When completing a task, always perform a retrospective to extract lessons and update this file.
- When planning a feature, always create a comprehensive plan document in `.ai/docs/plans/` before writing any code.

---

## Template for New Lessons

Use this format when adding new lessons:

```markdown
## [Category]

- When doing [action], always ensure [safeguard] to prevent [failure mode].
  - **Context**: [Optional: specific scenario or file reference]
  - **Example**: [Optional: code snippet or command]
```

---

## Maintenance Notes

This file should be periodically reviewed and consolidated to prevent it from becoming too large and consuming excessive context window space. When consolidating:

1. Merge duplicate or overlapping lessons
2. Remove lessons that are now enforced by linting rules
3. Summarize multiple specific lessons into higher-level principles
4. Archive historical lessons that are no longer relevant

Last reviewed: 2025-12-19

---

**Remember**: These lessons represent compound interest on engineering effort. Each lesson prevents future mistakes and makes the codebase easier to work with over time.

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-19  
**Based On**: AGENTS.md v1.0.0
