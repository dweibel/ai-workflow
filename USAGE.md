# EARS-Workflow Usage Guide

> **Comprehensive guide to using the ears-workflow skill system**

This guide provides detailed examples, workflow patterns, and integration instructions for the EARS-Workflow skill package. For quick start information, see [README.md](README.md).

## Quick Reference

### Basic Activation
```
"use EARS workflow"           # Full structured development workflow
"use compound engineering"    # Master orchestration and routing
"use ears specification"      # Create formal specifications
"use git workflow"            # TDD implementation in isolated environment
"use testing framework"       # Multi-perspective code audit
"use project reset"           # Reset project state with archiving
```

*For complete activation reference, see [Activation Triggers](.ai/docs/reference/activation-triggers.md)*

### Workflow Phases
1. **SPEC-FORGE** → Create formal specifications with EARS requirements
2. **PLANNING** → Develop implementation plans and architectural decisions  
3. **WORK** → Execute using TDD in isolated git worktrees
4. **REVIEW** → Conduct multi-perspective audits for quality assurance

*For complete workflow documentation, see [File Structure Reference](.ai/docs/reference/file-structure.md)*

## Enhanced Semantic Analysis

The ears-workflow system includes a sophisticated semantic analysis engine that provides intelligent skill activation with confidence scoring, context awareness, and learning capabilities.

### Multi-Dimensional Confidence Scoring

#### **Tier 1: Exact Matches (95-100% confidence)**
```
"use ears-workflow" → compound-engineering (98% confidence)
"spec-forge" → ears-specification (98% confidence)
"git-workflow" → git-workflow (100% confidence)
```

#### **Tier 2: Primary Intent (85-94% confidence)**
```
"create requirements" → ears-specification (92% confidence)
"implement feature" → git-workflow (90% confidence)
"security audit" → testing-framework (94% confidence)
```

#### **Tier 3: Semantic Intent (70-84% confidence)**
```
"user story" → ears-specification (82% confidence)
"test coverage" → testing-framework (78% confidence)
"build feature" → git-workflow (82% confidence)
```

#### **Tier 4: Contextual Inference (50-69% confidence)**
```
"authentication not working" → git-workflow (65% confidence + error context)
"requirements unclear" → ears-specification (68% confidence + clarification mode)
"is this secure" → testing-framework (70% confidence + security context)
```

### Context-Aware Adjustments

#### **Sequential Workflow Progression**
```
Previous: "Created requirements document"
Current: "Let's start building this"
→ git-workflow (92% confidence) + "Sequential workflow progression" boost

Previous: "Finished implementation" 
Current: "Is this code secure?"
→ testing-framework (94% confidence) + security persona activation
```

#### **Error-Driven Context**
```
"Tests are failing" → testing-framework (85% confidence + debugging context)
"Git conflicts everywhere" → git-workflow (90% confidence + conflict resolution)
"Security vulnerability found" → testing-framework (98% confidence + high priority)
```

#### **Urgency Detection**
```
"Critical security issue in production"
→ testing-framework (98% confidence + high priority + security persona)
→ Context: Skip normal workflow, immediate security audit
```

### Interactive Testing

Test the semantic analysis engine interactively:

```bash
# Start interactive demo
npm run test:semantic

# Example session:
🤖 Enter your request: create requirements for user authentication
🔍 Analyzing: "create requirements for user authentication"

📊 Analysis Results:
🎯 Top Recommendations:
1. ears-specification
   Confidence: 92%
   Type: primary
   Trigger: "create requirements"
   Reasoning: Primary intent match for "create requirements"
```

### Advanced Usage Patterns

#### **Multi-Intent Detection**
```
Input: "Create requirements and set up development environment"
→ Primary: ears-specification (90%)
→ Secondary: git-workflow (85%)
→ Suggested sequence: SPEC-FORGE → WORK
```

#### **Context Manipulation**
```bash
# Set workflow context
set-context phase WORK
set-context activity "created requirements"
set-context progress specForge=completed

# Test with context
🤖 Enter your request: let's start coding
→ git-workflow (94% confidence + "Sequential workflow progression" boost)
```

#### **Learning from Corrections**
```
Original: "implement feature" → git-workflow (85%)
User chooses: ears-specification (user wants requirements first)
→ System learns: For "implement" patterns, boost requirements-first workflow
```

### Programmatic Usage

```javascript
const SemanticAnalysisEngine = require('.ai/skills/compound-engineering/semantic-analysis-engine');

const engine = new SemanticAnalysisEngine();

// Basic analysis
const result = engine.analyzeInput("create requirements for user authentication");
console.log(result.recommendations[0]);
// { skill: 'ears-specification', confidence: 92, type: 'primary', ... }

// With context
const contextResult = engine.analyzeInput("let's start coding", {
    recentActivities: ['created requirements'],
    currentPhase: 'SPEC-FORGE'
});
// Confidence boosted due to sequential workflow progression

// Learning from corrections
engine.learnFromCorrection(
    originalRecommendation,
    'ears-specification', // User's choice
    { input: 'implement feature' }
);
```

### Testing and Validation

```bash
# Run semantic analysis test suite
npm run test:semantic-suite

# Test specific scenarios
node -e "
const engine = require('./.ai/skills/compound-engineering/semantic-analysis-engine');
const result = new engine().analyzeInput('critical security vulnerability');
console.log('Priority:', result.recommendations[0].priority);
console.log('Confidence:', result.recommendations[0].confidence);
"
```

## Complete Workflow Examples

### Example 1: New Feature Development

**Scenario**: Implementing a user authentication system from scratch

```
1. Specification Creation
User: "use EARS workflow to create a user authentication system"
→ SPEC-FORGE activates
→ Creates requirements.md with EARS patterns
→ Generates design.md with correctness properties
→ Produces tasks.md with implementation plan

2. Implementation Planning
→ PLANNING phase activates automatically
→ Researches existing authentication patterns
→ Creates comprehensive implementation plan
→ Documents architectural decisions

3. TDD Implementation
→ WORK phase activates
→ Creates git worktree: feature/user-authentication
→ Implements using Red-Green-Refactor cycle
→ Makes atomic commits with conventional format

4. Quality Review
→ REVIEW phase activates
→ Multi-persona audit (Security, Performance, Style, Data)
→ Generates findings report with severity classification
→ Provides merge recommendation
```

### Example 2: Bug Fix with Isolated Environment

**Scenario**: Fixing a critical login validation bug

```
User: "use git-worktree to create an environment for fixing the login bug"

Agent Response:
1. Creates worktree: `bugfix/login-validation`
2. Navigates to isolated environment
3. User implements fix using TDD
4. Reviews changes before merge
5. Cleans up worktree after completion
```

### Example 3: Project Transition

**Scenario**: Completing one project and starting another

```
User: "use project-reset to clean up after project completion"

Agent Response:
1. Creates timestamped archive of current project state
2. Resets memory files to clean templates (preserving generic wisdom)
3. Clears project-specific documentation
4. Provides clean environment for new project
5. Maintains all tooling and workflow configurations
```

## IDE Integration Examples

### VS Code with GitHub Copilot

**Setup**:
1. Install EARS-workflow skill package in project root
2. Restart VS Code to discover skills
3. Verify in Command Palette (`Ctrl+Shift+P`)

**Usage**:
```
// In any file, type comment:
// use EARS workflow for user authentication

// Or use chat interface:
"Let's use structured development for this feature"

// Direct sub-skill activation:
// use spec-forge to create requirements
```

### Cursor IDE

**Setup**:
1. Install skill package in project
2. Configure Agent-Decided rules (optional)
3. Test activation with natural language

**Usage**:
```
"Let's use structured development for this feature"
→ Activates EARS-workflow with phase progression

"Create formal requirements for user authentication"
→ Activates SPEC-FORGE directly

"Set up isolated development environment"
→ Activates git-worktree utility
```

### JetBrains IDEs

**Setup via CLI Tools**:
```bash
# Install CLI tools
npm install -g openskills rulesync

# Transpile for JetBrains
openskills transpile .ai/SKILL.md --target jetbrains

# Configure in IDE Settings → AI Assistant → Custom Skills
```

## Best Practices

### Workflow Discipline
- Always start with SPEC-FORGE for new features
- Complete each phase before proceeding to the next
- Use approval gates to ensure quality at each step
- Don't skip phases even for "simple" changes

### Development Environment
- Create worktree for every feature, bugfix, or refactor
- Work exclusively in worktree directory during development
- Use descriptive branch names with appropriate prefixes
- Clean up worktrees promptly after completion

### Code Quality
- Conduct multi-perspective reviews for all changes
- Address CRITICAL and HIGH severity findings before merge
- Use specific, actionable feedback with file paths and line numbers
- Document review findings and resolutions

## Troubleshooting

### Common Issues

#### Skill Not Activating
**Problem**: IDE doesn't recognize EARS-workflow triggers
**Solutions**:
- Verify `.ai/SKILL.md` exists with valid YAML frontmatter
- Restart IDE to refresh skill discovery
- Check IDE-specific skill configuration
- Try exact trigger phrases: "use EARS workflow"

#### Worktree Creation Fails
**Problem**: Git worktree commands fail
**Solutions**:
- Ensure Git 2.20+ is installed
- Check that base branch is up to date
- Verify directory permissions for `../worktrees/`
- On Windows, use WSL or Git Bash for bash scripts

#### Memory Files Not Loading
**Problem**: Compound engineering memory not accessible
**Solutions**:
- Verify `.ai/memory/lessons.md` and `decisions.md` exist
- Check file permissions and readability
- Initialize empty memory files if missing
- Validate file format (proper markdown structure)

## Advanced Usage Patterns

### Micro-Services Development
```
1. Use SPEC-FORGE for each service specification
2. Create separate worktrees for each service
3. Use REVIEW for cross-service integration analysis
4. Apply PROJECT-RESET between service implementations
```

### Legacy Code Refactoring
```
1. Use PLANNING to analyze existing code patterns
2. Create SPEC-FORGE specifications for desired end state
3. Use WORK with TDD to refactor incrementally
4. Apply REVIEW for regression analysis
```

### Team Collaboration
```
1. Share SPEC-FORGE artifacts for team alignment
2. Use PLANNING for architectural decision documentation
3. Individual WORK phases in separate worktrees
4. Collaborative REVIEW with multiple perspectives
```

## Getting Help

### Documentation Resources
- **[Installation Guide](INSTALL.md)**: Quick start and setup
- **[Complete Reference](.ai/docs/reference/)**: Authoritative documentation
- **[Skills Catalog](.ai/skills/README.md)**: Individual skill references
- **[File Structure](.ai/docs/reference/file-structure.md)**: Complete path information

### Troubleshooting Resources
- **Memory Files**: Check `.ai/memory/lessons.md` for past solutions
- **Decision History**: Review `.ai/memory/decisions.md` for context
- **Troubleshooting Guide**: [Complete troubleshooting guide](.ai/docs/guides/troubleshooting.md)
- **Validation Tools**: Run `node .ai/tests/package-completeness-validation.test.js`

---

For detailed sub-skill documentation, see the individual SKILL.md files in `.ai/skills/*/SKILL.md`.