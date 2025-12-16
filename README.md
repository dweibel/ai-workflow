# Compound Engineering Workspace

> **👋 Start Here!** New to this repository? Read [AGENTS.md](AGENTS.md) first to understand the core philosophy and operational rules, then return here for practical guidance, examples, and troubleshooting.

This repository implements the **Compound Engineering** methodology using an AGENTS.md-driven workflow for autonomous AI-assisted software development.

## Attribution

This project is based on and inspired by the **Compound Engineering Plugin** by EveryInc:

- **Original Repository**: [EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin)
- **Core Methodology**: The fundamental Compound Engineering philosophy and workflow patterns
- **Adaptation**: This implementation adapts the original plugin concepts into a standalone AGENTS.md-driven system with git worktree automation

### What We've Adapted

- **Core Philosophy**: The compound engineering principle of making each solved problem reduce friction for future problems
- **Three-Phase Workflow**: Plan → Work → Review methodology with specialized AI personas
- **Knowledge Codification**: The practice of extracting lessons and patterns from each engineering session
- **Git Worktree Integration**: Isolated development environments for safe parallel work

### What We've Added

- **Standalone Implementation**: No plugin dependencies, works with any AI assistant
- **Cross-Platform Scripts**: PowerShell and Bash automation for git worktree management
- **Comprehensive Documentation**: Detailed workflows, protocols, and troubleshooting guides
- **Memory System**: Persistent lesson and decision tracking across sessions

We are grateful to EveryInc for pioneering the Compound Engineering methodology and making it available to the community.

> **📄 For complete attribution details, see [ATTRIBUTION.md](ATTRIBUTION.md)**

## What is Compound Engineering?

Compound Engineering transforms software development from a *cumulative* process (where complexity taxes every new feature) into an *exponential* process (where each solved problem makes future problems easier). Every engineering session must satisfy two criteria:

1. **Functional Success**: The code works and passes tests
2. **Systemic Improvement**: Documentation, patterns, or lessons are codified for future use

## Quick Start

### For AI Assistants

If you're an AI agent (Claude, GPT-4, etc.), follow this startup sequence:

#### 1. Load Core Memory First

```markdown
Always load these files at the start of EVERY session:
1. AGENTS.md - Your operational constitution
2. .ai/memory/lessons.md - Past learnings to avoid repeating mistakes
3. .ai/memory/decisions.md - Established architectural patterns
```

#### 2. Identify the Phase

Based on the user's request, determine which phase you're in:

| User Says | Phase | Also Load These Files |
|:----------|:------|:----------------------|
| "Plan this feature" | PLAN | `.ai/workflows/planning.md` + `.ai/roles/architect.md` |
| "Implement this" | WORK | `.ai/workflows/execution.md` + `.ai/protocols/git-worktree.md` + `.ai/roles/builder.md` |
| "Review the code" | REVIEW | `.ai/workflows/review.md` + `.ai/roles/auditor.md` |

#### 3. Execute the Workflow

Follow the loaded workflow file step-by-step. Do not skip steps.

#### 4. Codify Learnings

At the end of the session:
- Extract lessons from any mistakes or corrections
- Update `.ai/memory/lessons.md`
- Document new patterns in `.ai/memory/decisions.md`

---

### For Human Developers

#### Option 1: Using an AI Assistant

Simply describe what you want to accomplish, and let the AI follow the AGENTS.md workflow:

```
You: "Plan a user authentication system"
AI: [Automatically loads planning.md and follows the research protocol]

You: "Implement the plan"
AI: [Creates worktree, follows TDD, commits atomically]

You: "Review the implementation"
AI: [Adopts 4 review personas, generates findings report]
```

#### Option 2: Manual Workflow

If you're working without an AI assistant, you can still follow the compound engineering principles:

**Planning Phase:**
1. Create a plan document:
   ```bash
   mkdir -p .ai/docs/plans
   touch .ai/docs/plans/$(date +%Y-%m-%d)-feature-name.md
   ```
2. Follow the planning template in `.ai/workflows/planning.md`:
   - Research existing patterns
   - Check git history for context
   - Document approach and tasks
   - Get stakeholder approval

**Implementation Phase:**
1. Create a worktree:
   ```bash
   git worktree add .trees/your-feature -b feat/your-feature
   cd .trees/your-feature
   ```
2. Follow TDD (Red-Green-Refactor):
   - Write failing test
   - Implement minimal code
   - Refactor
   - Commit atomically
   - Repeat
3. Push when done:
   ```bash
   git push -u origin feat/your-feature
   ```

**Review Phase:**
1. Self-review using the 4 personas from `.ai/workflows/review.md`:
   - **Security Sentinel** (vulnerabilities, secrets)
   - **Performance Oracle** (complexity, queries)
   - **Framework Purist** (style, conventions)
   - **Data Integrity Guardian** (migrations, constraints)
2. Address critical findings before merging

**Cleanup:**
1. Return to repo root:
   ```bash
   cd ../..
   ```
2. Clean up worktree:
   ```bash
   git worktree remove .trees/your-feature
   ```

---

## Directory Structure

```
.
├── AGENTS.md                 # Root constitution (start here)
├── .ai/                      # AI configuration & context
│   ├── roles/                # Specialized personas
│   │   ├── architect.md      # Planning & research
│   │   ├── builder.md        # TDD implementation
│   │   └── auditor.md        # Multi-perspective review
│   ├── workflows/            # Phase-specific procedures
│   │   ├── planning.md       # Phase I: Strategic planning
│   │   ├── execution.md      # Phase II: TDD implementation
│   │   └── review.md         # Phase III: Code review
│   ├── protocols/            # Operational standards
│   │   ├── git-worktree.md   # Safe environment isolation
│   │   ├── testing.md        # TDD enforcement
│   │   └── migrations.md     # Database safety rules
│   └── memory/               # Long-term knowledge
│       ├── lessons.md        # Accumulated wisdom
│       └── decisions.md      # Architectural patterns
├── docs/ → .ai/docs/         # Project documentation (moved to .ai/docs/)
│   ├── workflows/            # Workflow automation guides
│   │   ├── git-worktree-manual.md      # Direct git commands
│   │   ├── script-templates.md         # Automation templates
│   │   └── universal-commands.md       # Cross-platform patterns
│   ├── plans/                # Feature implementation plans
│   ├── requirements/         # Requirements and specifications
│   ├── design/               # Design documents and architecture
│   ├── tasks/                # Task lists and backlogs
│   ├── reviews/              # Review reports and audit findings
│   └── decisions/            # Architectural Decision Records
```

---

## The Three Phases

### Phase I: PLAN

**Objective**: Understand the problem deeply before writing code.

**Trigger Words**: "Analyze", "Scaffold", "Spec", "Plan", "Research"

**Activities**:
- Research existing patterns in the codebase
- Analyze git history (Chesterton's Fence)
- Create comprehensive plan in `/.ai/docs/plans/YYYY-MM-DD-feature-name.md`
- Get explicit user approval

**Output**: A detailed plan document serving as a contract for implementation.

**Example**:
```
User: "Plan a user authentication system"
AI: [Loads planning.md + architect.md, researches codebase, creates plan]
```

---

### Phase II: WORK

**Objective**: Implement the feature using strict TDD in an isolated environment.

**Trigger Words**: "Implement", "Fix", "Refactor", "Build", "Code"

**Activities**:
- Create Git worktree for isolation
- Follow Red-Green-Refactor loop for each task
- Make atomic commits after each cycle
- Run tests continuously

**Output**: A feature branch with passing tests, ready for review.

**Example**:
```
User: "Implement the authentication plan"
AI: [Creates worktree, follows TDD, commits atomically]
```

**Manual Worktree Creation**:
```bash
git worktree add .trees/user-authentication -b feat/user-authentication
cd .trees/user-authentication
# Work begins here
```

---

### Phase III: REVIEW

**Objective**: Multi-perspective audit to ensure quality and security.

**Trigger Words**: "Review", "Audit", "Check", "Assess"

**Activities**:
- Adopt 4 personas sequentially:
  1. **Security Sentinel** - OWASP vulnerabilities, authentication, secrets management
  2. **Performance Oracle** - Algorithmic complexity, N+1 queries, resource usage
  3. **Framework Purist** - Idiomatic code, style conventions, best practices
  4. **Data Integrity Guardian** - Database migrations, foreign keys, constraints
- Generate comprehensive findings report
- Triage issues into actionable TODOs (CRITICAL/HIGH/MEDIUM/LOW)

**Output**: A reviewed PR with categorized findings (CRITICAL/HIGH/MEDIUM/LOW).

**Example**:
```
User: "Review the authentication implementation"
AI: [Loads review.md + auditor.md, adopts 4 personas, reports findings]
```

---

## Core Principles (Universal Invariants)

These rules apply to ALL phases:

### 🔐 Code Safety
- **Never** modify code without a defined Plan, Issue, or explicit user request
- **Never** make destructive changes without user confirmation
- **Never** commit or push code without running tests first

### 🌿 Git Hygiene
- **Always** create a dedicated Git Worktree for implementation tasks
- **Never** work directly on the main branch for feature development
- **Always** use atomic, descriptive commits (conventional commit format)

### 🧠 Knowledge Management
- **Always** consult `.ai/memory/lessons.md` to avoid repeating past mistakes
- **Always** consult `.ai/memory/decisions.md` to follow established patterns
- **Always** update memory files when new patterns or lessons emerge

### 🔬 Evidence-Based Engineering
- **Always** verify assumptions by reading actual files
- **Never** guess at API signatures, file locations, or system behavior
- **Always** use grep, find, or file reading tools to gather evidence

### 🧪 Test-Driven Development
- **Always** write tests before implementation (Red-Green-Refactor)
- **Never** skip tests because "it's a simple change"
- **Always** run the full test suite before marking a task complete

---

## The Codification Rule (Compound Interest)

At the conclusion of any task, perform a **Retrospective**:

1. Review the chat history for corrections, failed tests, or user feedback
2. Extract the underlying principle from any mistakes
3. Append lessons to `.ai/memory/lessons.md` in the format:
   - `- When doing X, always ensure Y to prevent Z.`
4. Document new patterns in `.ai/memory/decisions.md` if a new approach was established

This ensures every agent session "wakes up" smarter than the previous one.

---

## Git Worktree Commands

### Create a Worktree
```bash
git worktree add .trees/my-feature -b feat/my-feature
cd .trees/my-feature
```

### List Active Worktrees
```bash
git worktree list
```

### Clean Up a Worktree
```bash
cd ../..  # Return to repo root
git worktree remove .trees/my-feature
```

**Documentation:**
- `.ai/docs/workflows/git-worktree-manual.md` - Direct git commands and troubleshooting
- `.ai/docs/workflows/script-templates.md` - Templates for creating custom automation
- `.ai/docs/workflows/universal-commands.md` - Cross-platform patterns and tool-agnostic approaches

---

## Anti-Patterns to Avoid

❌ **The Rewrite Trap**: Never suggest rewriting code you don't understand. Read git history first.  
❌ **Hallucinated APIs**: Never guess at function signatures. Always verify against actual code.  
❌ **Premature Optimization**: Write simple, working code first. Optimize only when measurements justify it.  
❌ **Test Skipping**: Never skip tests because "it's obvious" or "it's simple".  
❌ **Siloed Knowledge**: Never keep important discoveries in chat history. Always codify them.  
❌ **Context Clutter**: Never load irrelevant documentation. Use JIT context loading based on current phase.

---

## Quick Examples

### Example 1: Planning a New Feature

**User (to AI):**
> "I need to add password reset functionality. Can you plan this feature?"

**AI Response:**
> Loading planning workflow...
>
> **Research Phase:**
> - Found existing auth patterns in `src/auth/`
> - Checked git history: authentication was refactored in commit abc123 to use JWT
> - Available dependencies: bcrypt, nodemailer
>
> **Creating Plan:**
> Generated `/.ai/docs/plans/2025-12-16-password-reset.md` with:
> - User story
> - Technical approach
> - Task breakdown (8 tasks)
> - Verification plan
> - Security considerations
>
> **Ready for Review**
> Please review the plan and approve before I proceed to implementation.

---

### Example 2: Implementing a Feature

**User (to AI):**
> "Implement the password reset plan we created"

**AI Response:**
> Loading execution workflow...
>
> **Setting Up Worktree:**
> - Created worktree: `.trees/password-reset`
> - Branch: `feat/password-reset`
> - Dependencies installed
>
> **Task 1/8: Create password reset token model**
> - 🔴 Written test: `user.test.ts:42 - should generate unique reset token`
> - Test fails (expected) ✓
> - 🟢 Implemented `generateResetToken()` method
> - Test passes ✓
> - 🔵 Refactored for clarity
> - All tests pass ✓
> - Committed: `feat: add password reset token generation`
>
> **Task 2/8: Create reset email service**
> [... continues through all tasks]
>
> **Implementation Complete**
> - 8/8 tasks completed
> - 12 commits made
> - All tests passing
> - Branch pushed to origin
>
> Ready for review phase.

---

### Example 3: Reviewing Code

**User (to AI):**
> "Review the password reset implementation"

**AI Response:**
> Loading review workflow...
>
> **🔒 Security Sentinel:**
> - ✅ Reset tokens use crypto.randomBytes (secure)
> - ⚠️ HIGH: Reset tokens don't expire (add 1-hour expiration)
> - ⚠️ MEDIUM: No rate limiting on reset endpoint
>
> **⚡ Performance Oracle:**
> - ✅ Database queries are efficient
> - ✅ Email sending is async
>
> **🎨 Framework Purist:**
> - ✅ Follows project conventions
> - 💡 LOW: Consider extracting email template to separate file
>
> **🗄️ Data Integrity Guardian:**
> - ⚠️ CRITICAL: Missing index on `reset_token` column
> - ✅ Migration is idempotent
>
> **Summary:**
> - 1 CRITICAL, 1 HIGH, 1 MEDIUM, 1 LOW
> - Recommendation: FIX CRITICAL + HIGH before merge
>
> Which findings should I address?

---

## Common Workflows

### Workflow 1: Bug Fix

```
1. User: "Fix the login validation bug"
2. AI: Plans the fix (researches root cause, proposes solution)
3. User: "Looks good, implement it"
4. AI: Creates worktree, writes failing test that reproduces bug, fixes it, commits
5. User: "Review the fix"
6. AI: Reviews for regressions, unintended side effects
7. Cleanup worktree, merge PR
```

### Workflow 2: Refactoring

```
1. User: "Refactor the auth service to be more testable"
2. AI: Plans the refactoring (analyzes current structure, proposes improvements)
3. User: "Approved"
4. AI: Creates worktree, ensures existing tests still pass, refactors incrementally, commits atomically
5. User: "Review"
6. AI: Checks for breaking changes, performance regressions, style consistency
7. Cleanup and merge
```

### Workflow 3: New Feature with Multiple Iterations

```
1. User: "Plan an analytics dashboard"
2. AI: Creates comprehensive plan
3. User: "Can you add real-time updates to the plan?"
4. AI: Updates plan with WebSocket approach
5. User: "Approved, implement phase 1 only"
6. AI: Implements first phase (basic dashboard)
7. User: "Review phase 1"
8. AI: Reviews, finds performance issues, fixes them
9. Merge phase 1
10. User: "Now implement phase 2"
11. [Repeat for subsequent phases]
```

---

## Communication Guidelines

### For AI Assistants

When working with users, follow these communication principles:

#### Progress Updates
- Provide terse, fact-based updates
- Use markdown formatting with proper headings
- Cite files with backticks (e.g., `src/utils.ts`)
- Use code blocks with language tags for snippets

#### Asking for Clarification
- Only ask when genuinely uncertain about intent or requirements
- Provide context for why the clarification is needed
- Suggest likely interpretations to help the user respond quickly

#### Reporting Completion
- Summarize what was accomplished
- Link to any artifacts created (plans, commits, branches)
- Highlight any lessons learned or systemic improvements made

---

## Error Handling & Recovery

### When Tests Fail
1. Read the stderr output carefully
2. Analyze the root cause (not just symptoms)
3. Attempt a fix
4. If the fix fails twice, stop and ask the user for guidance

### When Assumptions are Wrong
1. Acknowledge the incorrect assumption explicitly
2. Gather correct evidence from the codebase
3. Update your mental model
4. Consider if this lesson should be codified in `.ai/memory/lessons.md`

### When Context is Insufficient
1. Identify what specific information is missing
2. Use search tools to find the information
3. If unavailable, ask the user with specific questions

---

## Troubleshooting

### "The AI isn't following the workflow"

**Solution:** Explicitly mention the phase:
```
❌ "Write some code for authentication"
✅ "Plan an authentication feature" (AI loads planning workflow)
✅ "Implement the authentication plan" (AI loads execution workflow)
```

### "The AI is modifying code without tests"

**Solution:** Remind it of the TDD protocol:
```
"Please follow the Red-Green-Refactor loop from .ai/protocols/testing.md"
```

### "The AI isn't updating memory files"

**Solution:** At the end of the session, explicitly request:
```
"Please perform a retrospective and update .ai/memory/lessons.md with any learnings from this session"
```

### "I want to customize the workflow"

**Solution:** Edit the workflow files directly:
- `.ai/workflows/planning.md` - Change the planning steps
- `.ai/workflows/execution.md` - Modify the TDD process
- `.ai/workflows/review.md` - Adjust the review personas

Changes take effect immediately for the next session.

---

## Best Practices

### For Planning
- ✅ Always research existing patterns before proposing new ones
- ✅ Check git history to understand why code exists
- ✅ Create detailed, actionable plans
- ✅ Get explicit approval before implementing

### For Implementation
- ✅ Always use worktrees for isolation
- ✅ Follow TDD strictly (no code before tests)
- ✅ Commit atomically after each Red-Green-Refactor cycle
- ✅ Run full test suite before marking complete

### For Review
- ✅ Adopt all 4 personas (Security, Performance, Style, Data)
- ✅ Categorize findings by severity
- ✅ Provide specific fixes, not vague suggestions
- ✅ Prioritize critical issues

### For Codification
- ✅ Extract lessons from every mistake
- ✅ Document new patterns as they emerge
- ✅ Update memory files after every session
- ✅ Periodically review and consolidate lessons

---

## Advanced Topics

### Parallel Development

Run multiple AI sessions in parallel worktrees:

```bash
# Terminal 1
git worktree add .trees/feature-a -b feat/feature-a
cd .trees/feature-a
# AI works on Feature A

# Terminal 2
git worktree add .trees/feature-b -b feat/feature-b
cd .trees/feature-b
# AI works on Feature B

# Terminal 3
git worktree add .trees/critical-bug -b fix/critical-bug
cd .trees/critical-bug
# AI fixes urgent bug
```

Each session is completely isolated.

### Custom Personas

Create custom review personas in `.ai/roles/`:

```bash
touch .ai/roles/accessibility-auditor.md
# Define persona for WCAG compliance
```

Then reference it in `.ai/workflows/review.md`.

### Project-Specific Protocols

Add domain-specific protocols:

```bash
touch .ai/protocols/api-design.md
touch .ai/protocols/deployment.md
touch .ai/protocols/monitoring.md
```

Reference them in workflow files where appropriate.

---

## Customization

This AGENTS.md framework is designed to be adapted to your project's needs:

### Adapt Role Definitions
Edit `.ai/roles/*.md` to match your team's expertise and focus areas.

### Customize Workflows
Modify `.ai/workflows/*.md` to match your development process.

### Add New Protocols
Create additional protocol files in `.ai/protocols/` for domain-specific practices (e.g., `api-design.md`, `security.md`).

### Update Memory Files
Keep `.ai/memory/lessons.md` and `.ai/memory/decisions.md` current with your project's evolution.

---

## Philosophy: From Linear to Exponential

Traditional software development is **cumulative**: complexity increases linearly with each feature, creating a "complexity tax."

Compound Engineering is **exponential**: each solved problem makes future problems easier to solve, creating a "knowledge dividend."

By following this constitution, you transform the repository from a collection of code into a **self-improving system** that gets easier to work with over time.

---

## Resources

- **AGENTS.md** - Root constitution (operational mode definition)
- **.ai/docs/workflows/** - Automation guides and command references
  - `git-worktree-manual.md` - Direct git commands
  - `script-templates.md` - Automation templates for different environments
  - `universal-commands.md` - Cross-platform patterns
- **.ai/** - Complete AI context and configuration
  - `.ai/workflows/` - Phase-specific procedures (planning, execution, review)
  - `.ai/roles/` - Specialized personas (architect, builder, auditor)
  - `.ai/protocols/` - Operational standards (git-worktree, testing, migrations)
  - `.ai/memory/` - Long-term knowledge (lessons, decisions)

---

## Version & Attribution

- **Version**: 1.0.0
- **Last Updated**: 2025-12-16
- **Original Work**: [Compound Engineering Plugin](https://github.com/EveryInc/compound-engineering-plugin) by EveryInc
- **License**: MIT (same as original)
- **This Implementation**: Standalone AGENTS.md system with cross-platform automation
- **Methodology**: AGENTS.md + Context Engineering + Git Worktrees + TDD

---

## Contributing

When making changes to the AGENTS.md system:

1. Test changes on a feature branch
2. Update relevant documentation
3. Add lessons learned to `.ai/memory/lessons.md`
4. Document architectural decisions in `.ai/memory/decisions.md`
5. Update this README if core workflow changes

---

**Remember**: The goal is not just to write code, but to build a system that makes future coding easier. Every task should leave the codebase more maintainable than you found it.
