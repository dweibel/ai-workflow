# User Stories

This directory contains individual user story files organized by feature or epic.

## Purpose

User stories capture requirements from the user's perspective, defining who needs what functionality and why.

## File Naming Convention

- `feature-name-story-brief-description.md` - Individual user story
- `epic-name-epic.md` - Collection of related user stories (epic)

**Examples:**
- `authentication-user-login.md`
- `authentication-password-reset.md`
- `dashboard-view-analytics.md`
- `user-management-epic.md`

## User Story Template

```markdown
# User Story: [Brief Title]

**Epic:** [Epic Name] (optional)
**Priority:** Critical | High | Medium | Low
**Story Points:** [1-13] (optional)
**Status:** Draft | Ready | In Progress | Done

## Story

As a [user role],
I want to [action/feature],
so that [benefit/value].

## Acceptance Criteria

- [ ] Given [context], when [action], then [expected result]
- [ ] Given [context], when [action], then [expected result]
- [ ] Given [context], when [action], then [expected result]

## Technical Notes

- Implementation considerations
- Technical constraints
- Dependencies on other stories/features

## UI/UX Requirements

- Wireframes or mockups (if applicable)
- Interaction patterns
- Accessibility requirements

## Test Scenarios

1. **Scenario 1:** [Description]
   - **Given:** [Initial state]
   - **When:** [Action]
   - **Then:** [Expected outcome]

2. **Scenario 2:** [Description]
   - **Given:** [Initial state]
   - **When:** [Action]
   - **Then:** [Expected outcome]

## Related Stories

- [Related User Story 1]
- [Related User Story 2]

## Notes

Additional context, questions, or decisions.
```

## Epic Template

```markdown
# Epic: [Epic Name]

**Status:** Draft | Active | Complete
**Priority:** Critical | High | Medium | Low
**Target Release:** [Version/Date]

## Overview

High-level description of the epic and its business value.

## Goals

- Primary goal 1
- Primary goal 2
- Primary goal 3

## User Stories

- [ ] [Story 1 - Brief description] → `story-file-1.md`
- [ ] [Story 2 - Brief description] → `story-file-2.md`
- [ ] [Story 3 - Brief description] → `story-file-3.md`

## Success Metrics

- Metric 1: [How to measure]
- Metric 2: [How to measure]

## Out of Scope

What this epic explicitly does NOT include.

## Dependencies

- External dependencies
- Technical prerequisites
- Other epics
```

## Usage Guidelines

### Creating a New User Story

1. **Start with the user's perspective:** Focus on who, what, and why
2. **Be specific:** Make stories small enough to implement in one iteration
3. **Include acceptance criteria:** Define clear, testable conditions for "done"
4. **Link to related artifacts:** Reference requirements, designs, and plans

### Organizing Stories

- **By feature:** Group related stories in the same feature area
- **By epic:** Use epic files to track larger initiatives
- **By priority:** Tag stories with priority levels
- **By sprint:** Reference stories in implementation plans

### INVEST Principle

Good user stories are:
- **I**ndependent - Can be developed separately
- **N**egotiable - Details can be refined
- **V**aluable - Delivers value to users
- **E**stimable - Can be sized/estimated
- **S**mall - Fits in one iteration
- **T**estable - Has clear acceptance criteria

## Workflow Integration

1. **Requirements Phase:** Create user stories to capture needs
2. **Planning Phase:** Reference stories in implementation plans (`/.ai/docs/plans/`)
3. **Design Phase:** Create designs that fulfill stories (`/.ai/docs/design/`)
4. **Implementation Phase:** Build features based on acceptance criteria
5. **Review Phase:** Verify acceptance criteria are met (`/.ai/docs/reviews/`)

## Related Directories

- `/.ai/docs/requirements/` - Parent directory with broader requirements
- `/.ai/docs/plans/` - Implementation plans based on user stories
- `/.ai/docs/design/` - Design documents for user story implementations
