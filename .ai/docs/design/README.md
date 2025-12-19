# Design Documents

This directory contains system designs, architecture diagrams, API specifications, and technical design documents.

## Purpose

Design documents provide:
- System architecture and component interactions
- API contracts and interfaces
- Data models and database schemas
- Technical specifications for implementation
- Design patterns and coding standards

## File Naming Convention

- `system-architecture.md` - Overall system design
- `component-name-design.md` - Specific component design
- `api-specification.md` - API endpoints and contracts
- `data-model.md` - Database schema and relationships
- `integration-design.md` - Integration with external systems

## Design Document Template

```markdown
# Component/System Design

**Date:** YYYY-MM-DD
**Author:** [Agent/User]
**Status:** Draft | Approved | Implemented

## Overview
High-level description of the design.

## Goals & Non-Goals
**Goals:**
- What this design aims to achieve

**Non-Goals:**
- What this design explicitly does not address

## Architecture

### Components
Description of major components and their responsibilities.

### Data Flow
How data moves through the system.

### Interfaces
APIs, contracts, and integration points.

## Data Model
Database schema, entities, and relationships.

```sql
-- Example schema
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL
);
```

## API Specification

### Endpoints
- `GET /api/resource` - Description
- `POST /api/resource` - Description

### Request/Response Examples
```json
{
  "field": "value"
}
```

## Technology Choices
- Languages/frameworks
- Libraries/dependencies
- Infrastructure/services

## Security Considerations
- Authentication/authorization
- Data protection
- Input validation

## Performance Considerations
- Scalability approach
- Caching strategy
- Optimization opportunities

## Error Handling
How errors are detected, reported, and recovered from.

## Testing Approach
How this design will be tested.

## Alternatives Considered
Other approaches that were evaluated and why they were not chosen.

## Open Questions
Unresolved design decisions.
```

## Usage Guidelines

1. **Design before implementing:** Create design documents during the PLAN phase
2. **Iterate on feedback:** Designs should be reviewed and refined
3. **Keep synchronized:** Update designs when implementation reveals necessary changes
4. **Use diagrams:** Include visual representations (ASCII art, Mermaid, or image files)
5. **Document tradeoffs:** Explain why certain design choices were made

## Related Directories

- `.ai/docs/requirements/` - Requirements that drive design decisions
- `.ai/docs/plans/` - Plans that reference and implement designs
- `.ai/docs/decisions/` - ADRs documenting major design choices
