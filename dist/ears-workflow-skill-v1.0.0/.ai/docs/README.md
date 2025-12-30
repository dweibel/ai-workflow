# Documentation Directory

This directory contains all project documentation organized in a structured hierarchy. Each subdirectory serves a specific purpose in the software development lifecycle.

## Directory Structure

### `.ai/docs/plans/`
Implementation plans for features and major changes. Plans should follow the naming convention `YYYY-MM-DD-feature-name.md` and serve as contracts for the WORK phase.

**When to use:** During the PLAN phase, before starting any implementation work.

### `.ai/docs/requirements/`
Requirements specifications, user stories, feature specifications, and acceptance criteria.

**When to use:** When gathering requirements, defining features, or documenting user needs.

### `.ai/docs/design/`
Design documents, architecture diagrams, system designs, and technical specifications.

**When to use:** When designing system architecture, APIs, data models, or major technical decisions.

### `.ai/docs/tasks/`
Task lists, sprint backlogs, progress tracking, and work breakdown structures.

**When to use:** For project management, tracking work items, and organizing development efforts.

### `.ai/docs/reviews/`
Code review reports, audit findings, security assessments, and quality checks.

**When to use:** During the REVIEW phase after completing implementation work.

### `.ai/docs/decisions/`
Architectural Decision Records (ADRs) documenting significant technical decisions and their rationale.

**When to use:** When making important architectural or technical choices that affect the project long-term.

## Document Naming Conventions

- **Plans:** `YYYY-MM-DD-feature-name.md` (e.g., `2025-12-16-user-authentication.md`)
- **Requirements:** `feature-name-requirements.md` or `feature-name-spec.md`
- **Design:** `component-name-design.md` or `system-architecture.md`
- **Tasks:** `sprint-N.md`, `backlog.md`, or `YYYY-MM-DD-tasks.md`
- **Reviews:** `YYYY-MM-DD-review-scope.md` (e.g., `2025-12-16-review-auth-module.md`)
- **Decisions:** `ADR-NNN-decision-title.md` (e.g., `ADR-001-use-postgresql.md`)

## Usage Guidelines

1. **Always create documents before implementing:** Plans and design documents should exist before code is written.
2. **Keep documents up to date:** Update documentation when requirements or designs change.
3. **Link related documents:** Cross-reference plans, designs, and decisions for traceability.
4. **Use templates:** Follow established templates for consistency (see each subdirectory's README).
5. **Archive old documents:** Move outdated documents to an `archive/` subdirectory rather than deleting them.

## Integration with EARS Workflow

This documentation structure supports the three workflow phases:

- **PLAN Phase** → Create documents in `.ai/docs/plans/`, `.ai/docs/requirements/`, `.ai/docs/design/`
- **WORK Phase** → Reference plans and designs; create task tracking in `.ai/docs/tasks/`
- **REVIEW Phase** → Generate reports in `.ai/docs/reviews/`; document decisions in `.ai/docs/decisions/`

See `AGENTS.md` section 2.6 for detailed rules on documentation management.
