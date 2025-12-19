# Workflow: Phase I - Strategic Planning

## Objective
Generate a comprehensive `.ai/docs/plans/YYYY-MM-DD-feature-name.md` implementation guide. **DO NOT** write code yet.

## Prerequisites
Before starting, ensure you have:
1. Loaded `.ai/memory/lessons.md` to inherit past learnings
2. Loaded `.ai/memory/decisions.md` to understand architectural patterns
3. Loaded `.ai/roles/architect.md` to adopt the correct persona

## Step 1: Archaeological Research

Activate the **Repo Research Analyst** persona.

### 1.1 Pattern Discovery
**Goal**: Identify reusable patterns in the existing codebase

**Actions**:
```bash
# Search for similar features
grep -r "similar_functionality" src/
find . -name "*related_feature*"
```

**Questions to Answer**:
- How do we currently handle [similar feature]?
- What internal libraries or utilities exist?
- What patterns are established in this domain?

**Output**: List of files and patterns that can be reused

### 1.2 Historical Context (Chesterton's Fence)
**Goal**: Understand *why* related code exists in its current form

**Actions**:
```bash
# Analyze git history for related files
git log -p --follow src/related_file.ts
git log --grep="keyword" --oneline
```

**Questions to Answer**:
- Why was this code written this way?
- What problem was it solving?
- What constraints existed when it was created?
- Are those constraints still relevant?

**Output**: Summary of historical context and rationale

### 1.3 Dependency Audit
**Goal**: Verify available libraries and their versions

**Actions**:
```bash
# Check package managers
cat package.json | grep "dependencies"
cat requirements.txt
cat go.mod
```

**Constraint**: Do NOT introduce new dependencies if existing ones suffice

**Questions to Answer**:
- What libraries are already available?
- What versions are we using?
- Do we need external documentation? (Request permission to browse if needed)

**Output**: List of available dependencies and their capabilities

### 1.4 Security & Compliance Scan
**Goal**: Identify any regulatory or security requirements

**Questions to Answer**:
- Does this feature handle PII or sensitive data?
- Are there compliance requirements (GDPR, HIPAA, etc.)?
- Are there existing security patterns we must follow?

**Output**: List of security constraints and requirements

## Step 2: Specification Drafting

Create a new file: `.ai/docs/plans/YYYY-MM-DD-feature-name.md`

### Documentation Structure
Plans are stored in `.ai/docs/plans/` with the full hierarchy:
- `.ai/docs/plans/` - Implementation plans (dated: YYYY-MM-DD-feature-name.md)
- `.ai/docs/requirements/` - Requirements and specifications (no date prefix)
- `.ai/docs/design/` - Design documents and architecture (no date prefix)
- `.ai/docs/tasks/` - Task lists and backlogs
- `.ai/docs/reviews/` - Review reports (dated: YYYY-MM-DD-feature-name-review.md)
- `.ai/docs/decisions/` - Architectural Decision Records (ADRs)

**File Naming Conventions**:
- Plans and Reviews: Include date prefix for chronological tracking
- Requirements and Design: No date prefix, version-controlled via git
- See each directory's README.md for templates and conventions

**Note**: You may create supporting documents across these directories as needed.

### Required Sections

```markdown
# Feature: [Descriptive Name]

## User Story
**As a** [role]  
**I want** [capability]  
**So that** [benefit]

## Context
- **Why**: What problem does this solve?
- **Who**: Who requested this feature?
- **When**: What's the deadline/priority?
- **Where**: What part of the system does this affect?

## Technical Approach
### Architecture
[High-level design diagram or description]

### Components to Create/Modify
- `src/new_component.ts` - [Purpose]
- `src/existing_component.ts` - [Modifications needed]

### Data Flow
[Describe how data moves through the system]

## Existing Patterns to Reuse
- **Pattern 1**: [Description]
  - Reference: `src/example.ts:42-89`
  - How we'll use it: [Explanation]

## Task Breakdown
Break the feature into atomic, testable units:

- [ ] **Task 1**: Write test for [specific behavior]
- [ ] **Task 2**: Implement [specific component]
- [ ] **Task 3**: Integrate with [existing system]
- [ ] **Task 4**: Add error handling
- [ ] **Task 5**: Update documentation

## Verification Plan
### Tests to Write
- Unit tests: [List specific test files]
- Integration tests: [List scenarios]
- E2E tests: [List user flows]

### Edge Cases
- [ ] What if [edge case 1]?
- [ ] What if [edge case 2]?

### Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Risks & Mitigation
| Risk | Likelihood | Impact | Mitigation |
|:-----|:-----------|:-------|:-----------|
| [Risk 1] | High | Critical | [Strategy] |
| [Risk 2] | Low | Medium | [Strategy] |

## Performance Considerations
- Expected load: [Metrics]
- Database impact: [Query complexity]
- API response time: [Target]

## Security Considerations
- Authentication required: [Yes/No]
- Authorization rules: [Description]
- Data validation: [Rules]
- Encryption needed: [Yes/No]

## Code Examples
[Pseudo-code or snippets showing usage of internal APIs]

## Open Questions
- [ ] Question 1?
- [ ] Question 2?

## References
- Related issues: #123
- Related PRs: #456
- Documentation: [Links]
```

## Step 3: Validation & Approval

### 3.1 Self-Review Checklist
Before presenting to the user, verify:
- [ ] All existing patterns have been identified
- [ ] Git history has been consulted for related code
- [ ] Dependencies have been verified
- [ ] Task breakdown is atomic and testable
- [ ] Verification plan is comprehensive
- [ ] Risks have been identified
- [ ] Code examples are accurate (not hallucinated)

### 3.2 Present to User
Format your presentation as:

```markdown
# Planning Complete: [Feature Name]

## Summary
[2-3 sentence overview]

## Key Findings from Research
- Existing pattern: [Pattern] can be reused
- Historical context: [Insight from git history]
- Dependencies: [Available libraries]

## Proposed Approach
[High-level summary referencing the plan file]

## Estimated Effort
- Tasks: X
- Estimated time: Y (if applicable)

## Risks
[Top 2-3 risks]

## Next Steps
Awaiting your approval to proceed to implementation phase.

📄 **Full Plan**: `.ai/docs/plans/YYYY-MM-DD-feature-name.md`
```

### 3.3 Wait for Approval
**Do NOT proceed to Phase II (Implementation) without explicit user approval.**

## Step 4: Plan Refinement (If Needed)

If the user requests changes:
1. Acknowledge the feedback
2. Update the plan document
3. Re-present for approval
4. Iterate until approved

## Success Criteria

This phase is complete when:
1. ✅ A comprehensive plan document exists in `.ai/docs/plans/`
2. ✅ All research steps have been completed
3. ✅ Existing patterns have been identified and documented
4. ✅ The user has explicitly approved the plan
5. ✅ You have NOT written any implementation code yet

## Common Anti-Patterns to Avoid

❌ **Skipping Research**: "I'll just start coding and figure it out"  
✅ **Proper Approach**: Always research existing patterns first

❌ **Vague Tasks**: "Implement the feature"  
✅ **Proper Approach**: Break into atomic, testable units

❌ **Ignoring History**: "This code is weird, let's rewrite it"  
✅ **Proper Approach**: Read git history to understand why before changing

❌ **Planning in a Vacuum**: Not consulting `.ai/memory/lessons.md`  
✅ **Proper Approach**: Always load memory files first to avoid past mistakes

❌ **Premature Implementation**: Writing code during planning  
✅ **Proper Approach**: Planning and implementation are separate phases

## Transition to Phase II

Once approved, hand off to the **Builder** role:

```markdown
Plan approved. Transitioning to Phase II: WORK

Loading context:
- .ai/workflows/execution.md
- .ai/protocols/git-worktree.md
- .ai/protocols/testing.md
- .ai/roles/builder.md

Activating Builder persona for TDD implementation...
```

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-19  
**Based On**: AGENTS.md v1.0.0
