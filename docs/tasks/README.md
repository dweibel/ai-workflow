# Task Lists & Backlogs

This directory contains task breakdowns, sprint backlogs, work tracking, and project management documents.

## Purpose

Task documents help:
- Break down large features into manageable units
- Track progress on implementation work
- Organize sprints and iterations
- Identify blockers and dependencies

## File Naming Convention

- `backlog.md` - Overall project backlog
- `sprint-N.md` - Sprint-specific task lists (e.g., `sprint-1.md`)
- `YYYY-MM-DD-tasks.md` - Daily or weekly task lists
- `feature-name-tasks.md` - Tasks for a specific feature

## Task List Template

```markdown
# Sprint N / Feature Name Tasks

**Date:** YYYY-MM-DD
**Status:** Not Started | In Progress | Completed

## Goals
What we aim to accomplish in this sprint/iteration.

## Tasks

### High Priority
- [ ] Task 1 - Description (Estimated: 2h, Assigned: Agent/User)
- [ ] Task 2 - Description (Estimated: 4h, Assigned: Agent/User)

### Medium Priority
- [ ] Task 3 - Description (Estimated: 3h, Assigned: Agent/User)

### Low Priority
- [ ] Task 4 - Description (Estimated: 1h, Assigned: Agent/User)

## Completed
- [x] Task 5 - Description (Completed: YYYY-MM-DD)

## Blocked
- [ ] Task 6 - Description (Blocked by: dependency description)

## Notes
Additional context, decisions, or observations.

## Retrospective
What went well, what could be improved (filled at completion).
```

## Backlog Template

```markdown
# Project Backlog

**Last Updated:** YYYY-MM-DD

## Now (Current Sprint)
Tasks actively being worked on.

## Next (Upcoming Sprint)
Tasks planned for the next iteration.

## Later (Future Work)
Tasks to be prioritized and scheduled.

## Icebox (Ideas)
Ideas and suggestions that may be considered in the future.

## Done (Archive)
Completed tasks (move to archive/ periodically).
```

## Usage Guidelines

1. **Break down work:** Extract tasks from implementation plans
2. **Update frequently:** Keep task status current as work progresses
3. **Estimate realistically:** Include time estimates to aid planning
4. **Track blockers:** Document and resolve dependencies
5. **Review regularly:** Conduct retrospectives to improve process

## Related Directories

- `/docs/plans/` - Source of task breakdowns
- `/docs/requirements/` - Requirements that generate tasks
- `/docs/reviews/` - Reviews may generate additional tasks
