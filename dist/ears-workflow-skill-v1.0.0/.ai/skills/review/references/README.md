# Review Skill References

This directory contains supporting documentation for the REVIEW skill.

## Files

### `review-workflow.md`
Detailed workflow procedures for the REVIEW phase, including:
- Multi-persona sequential review protocol
- Findings synthesis and triage procedures
- Fix implementation and approval processes
- Review completeness and quality assurance

**Source**: Originally from `.ai/workflows/review.md`

### `auditor-role.md`
Role definition and competencies for the Auditor persona, including:
- Multi-perspective review protocol with four specialized personas
- Security, performance, style, and data integrity analysis
- Synthesis and triage methodologies
- Evidence-based analysis techniques

**Source**: Originally from `.ai/roles/auditor.md`

## Usage

These files are referenced by the REVIEW skill to provide detailed context and procedures when the skill is activated. They support the progressive disclosure pattern by loading only when the review skill is active.

## Integration

The REVIEW skill references these files in its Integration Points section:
- `references/review-workflow.md` for detailed audit procedures
- `references/auditor-role.md` for persona definitions and analysis methods