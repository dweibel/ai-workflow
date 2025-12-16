# Implementation Plans

This directory contains detailed implementation plans created during the PLAN phase. Each plan serves as a contract for the WORK phase, defining what will be built and how.

## Purpose

Implementation plans ensure that:
- Requirements are fully understood before coding begins
- Technical approach is vetted and approved
- Potential risks and dependencies are identified
- Success criteria are clearly defined

## File Naming Convention

`YYYY-MM-DD-feature-name.md`

Examples:
- `2025-12-16-user-authentication.md`
- `2025-12-20-payment-processing.md`
- `2026-01-05-api-rate-limiting.md`

## Plan Template

```markdown
# Feature Name

**Date:** YYYY-MM-DD
**Author:** [Agent/User]
**Status:** Draft | Approved | In Progress | Completed

## Overview
Brief description of what will be built.

## Requirements
- Functional requirements
- Non-functional requirements (performance, security, etc.)

## Technical Approach
Detailed description of the implementation strategy.

## Architecture Changes
Any changes to system architecture or design patterns.

## Dependencies
- External libraries/services
- Other features or components

## Testing Strategy
How the feature will be tested.

## Risks & Mitigation
Potential issues and how to address them.

## Tasks Breakdown
1. [ ] Task 1
2. [ ] Task 2
3. [ ] Task 3

## Success Criteria
How we'll know the feature is complete and working correctly.
```

## Usage Guidelines

1. **Create before implementing:** Never start coding without an approved plan for non-trivial features
2. **Get approval:** Plans should be reviewed and approved before moving to WORK phase
3. **Reference in commits:** Link to the plan document in commit messages
4. **Update status:** Keep the status field current as work progresses
5. **Archive completed plans:** Once implemented, update status to "Completed" and move to `archive/` subdirectory if needed

## Related Directories

- `/.ai/docs/requirements/` - Detailed requirements referenced by plans
- `/.ai/docs/design/` - Design documents that inform planning
- `/.ai/docs/tasks/` - Task breakdowns extracted from plans
