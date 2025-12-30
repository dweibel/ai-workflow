# Work Skill References

This directory contains supporting documentation for the WORK skill.

## Files

### `execution-workflow.md`
Detailed workflow procedures for the WORK phase, including:
- Test-Driven Development (TDD) loop procedures
- Environment setup and git worktree management
- Atomic commit strategies and progress tracking
- Error handling and quality assurance protocols

**Source**: Originally from `.ai/workflows/execution.md`

### `git-worktree-protocol.md`
Git worktree protocol and best practices, including:
- Worktree creation and management procedures
- Branch naming conventions and directory structure
- Safety checks and troubleshooting guidance
- Integration with EARS workflow methodology

**Source**: Originally from `.ai/protocols/git-worktree.md`

### `builder-role.md`
Role definition and competencies for the Builder persona, including:
- TDD implementation methodology and practices
- Environment isolation and atomic commit strategies
- Error handling protocols and quality verification
- Communication style and success criteria

**Source**: Originally from `.ai/roles/builder.md`

## Usage

These files are referenced by the WORK skill to provide detailed context and procedures when the skill is activated. They support the progressive disclosure pattern by loading only when the work skill is active.

## Integration

The WORK skill references these files in its Integration Points section:
- `references/execution-workflow.md` for detailed TDD procedures
- `references/builder-role.md` for implementation persona and practices
- `references/git-worktree-protocol.md` for environment isolation