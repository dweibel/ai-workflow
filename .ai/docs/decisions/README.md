# Architectural Decision Records (ADRs)

This directory contains Architectural Decision Records documenting significant technical decisions and their rationale.

## Purpose

ADRs provide:
- Historical context for technical decisions
- Rationale behind architectural choices
- Evaluation of alternatives
- Long-term guidance for maintaining consistency

## File Naming Convention

`ADR-NNN-decision-title.md`

Examples:
- `ADR-001-use-postgresql.md`
- `ADR-002-adopt-rest-over-graphql.md`
- `ADR-003-microservices-architecture.md`

Numbering is sequential and never reused, even if an ADR is superseded.

## ADR Template

```markdown
# ADR-NNN: [Decision Title]

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-XXX

## Context
What is the issue we're addressing? What factors are in play?

## Decision
What is the change we're proposing or have agreed to?

## Rationale
Why did we choose this approach? What makes it better than alternatives?

## Consequences

### Positive
- Benefit 1
- Benefit 2

### Negative
- Drawback 1
- Drawback 2

### Neutral
- Other implications

## Alternatives Considered

### Alternative 1
- Description
- Pros
- Cons
- Why not chosen

### Alternative 2
- Description
- Pros
- Cons
- Why not chosen

## Implementation Notes
How this decision will be implemented or enforced.

## Related Decisions
- Links to related ADRs
- References to design documents
- Links to issues or PRs

## References
- External resources
- Documentation
- Research papers or articles
```

## ADR Lifecycle

1. **Proposed** - Decision is under consideration
2. **Accepted** - Decision has been approved and is in effect
3. **Deprecated** - Decision is no longer recommended but still in use
4. **Superseded** - Decision has been replaced by a newer ADR

## Usage Guidelines

1. **Document significant decisions:** Not every decision needs an ADR, only those with long-term impact
2. **Write when deciding:** Capture the decision while context is fresh
3. **Never delete ADRs:** Update status instead; history is valuable
4. **Link liberally:** Reference ADRs in code comments, design docs, and plans
5. **Review regularly:** Periodically assess if accepted ADRs are still valid

## What Deserves an ADR?

**Good candidates:**
- Choice of major frameworks or languages
- Architectural patterns (microservices, monolith, event-driven)
- Database or data storage decisions
- Authentication/authorization approach
- Deployment strategy
- API design philosophy

**Not necessary:**
- Routine implementation details
- Obvious best practices
- Temporary workarounds

## Related Directories

- `/.ai/docs/design/` - Design documents implement ADR decisions
- `/.ai/docs/plans/` - Plans should reference relevant ADRs
- `.ai/memory/decisions.md` - High-level architectural patterns (ADRs are more specific)
