# Lessons Extraction System

## Lessons Extraction Prompt

Use this prompt to identify and extract lessons learned during workflow execution:

```
LESSONS EXTRACTION

Review the workflow execution history: {workflow_history}

IDENTIFY LESSONS IN THESE CATEGORIES:

1. **Workflow & Process**
   - What workflow patterns worked well?
   - What process improvements were discovered?
   - What approval gates or validation steps were valuable?

2. **Technical Patterns**
   - What technical approaches were successful?
   - What implementation patterns should be reused?
   - What architectural decisions proved beneficial?

3. **Mistakes & Corrections**
   - What errors were made and how were they fixed?
   - What assumptions were wrong and what was learned?
   - What pitfalls should be avoided in the future?

4. **Tool Usage**
   - What tools or techniques were particularly effective?
   - What validation methods caught important issues?
   - What automation opportunities were identified?

5. **Quality & Testing**
   - What testing approaches were valuable?
   - What validation techniques prevented errors?
   - What quality checks should be standard?

LESSON FORMAT:
"When doing X, always ensure Y to prevent Z."

EXAMPLES:
- "When creating requirements, always validate EARS patterns before proceeding to prevent rework during design phase."
- "When generating correctness properties, always use prework tool to analyze testability to ensure comprehensive property coverage."
- "When implementing property-based tests, always configure minimum 100 iterations to catch edge cases reliably."

EXTRACTION RULES:
1. Focus on actionable, specific lessons
2. Include context about when the lesson applies
3. Explain the benefit or problem prevented
4. Use clear, concise language
5. Avoid vague or obvious statements

LESSONS IDENTIFIED:
{extracted_lessons}

UPDATE .ai/memory/lessons.md:
Append new lessons to appropriate category sections.
```

## Lesson Categories

### Workflow Lessons
Patterns about process, phases, and workflow execution:

```markdown
## Workflow

- When starting a Spec-Forge specification, always load validation templates to ensure EARS compliance from the start.
- When transitioning between specification phases, always require explicit user approval to prevent premature progression.
- When completing any specification phase, always perform retrospective to extract systemic improvements.
```

### Requirements Lessons
Patterns about requirements creation and validation:

```markdown
## Requirements

- When writing acceptance criteria, always validate against EARS patterns immediately to catch non-compliance early.
- When creating glossaries, always define terms before using them in requirements to maintain clarity.
- When requirements mention parsing or serialization, always include round-trip testing requirements to ensure data integrity.
```

### Design Lessons
Patterns about design and correctness properties:

```markdown
## Design

- When analyzing testability, always use prework tool before generating correctness properties to ensure systematic analysis.
- When generating correctness properties, always start with "For any" to maintain universal quantification.
- When selecting testing frameworks, always specify the framework in design document to guide implementation.
```

### Testing Lessons
Patterns about testing approaches and validation:

```markdown
## Testing

- When implementing property-based tests, always configure minimum 100 iterations to achieve reliable coverage.
- When writing property tests, always annotate with feature name and property number for traceability.
- When generating test data, always create smart generators that constrain to valid input spaces to avoid false failures.
```

### Implementation Lessons
Patterns about code implementation and execution:

```markdown
## Implementation

- When executing tasks, always read all specification documents before starting to understand full context.
- When implementing functionality, always write code before tests to validate real behavior rather than mocked behavior.
- When tasks have sub-tasks, always complete sub-tasks before parent tasks to maintain proper dependencies.
```

## Lesson Quality Guidelines

### ✅ HIGH QUALITY Lessons

**Specific and Actionable:**
```
✅ "When creating EARS-compliant requirements, always validate the clause order in complex patterns (WHERE → WHILE → WHEN/IF → THE → SHALL) to prevent pattern violations."
```

**Includes Context:**
```
✅ "When analyzing acceptance criteria for testability, always categorize subjective requirements (user-friendly, intuitive) as non-testable to avoid generating invalid properties."
```

**Explains Benefit:**
```
✅ "When using prework tool for testability analysis, always complete analysis before writing correctness properties to ensure systematic coverage of all testable criteria."
```

### ❌ POOR QUALITY Lessons (with fixes)

**Too Vague:**
```
❌ "When writing requirements, always be careful."
✅ "When writing requirements, always validate against INCOSE quality rules (active voice, measurable conditions, no escape clauses) to ensure testability."
```

**No Context:**
```
❌ "Always use properties."
✅ "When acceptance criteria describe universal system behaviors, always generate correctness properties for property-based testing rather than simple unit tests."
```

**Missing Benefit:**
```
❌ "When creating tasks, always number them."
✅ "When creating implementation tasks, always use decimal notation (1.1, 1.2) to maintain clear hierarchy and enable sub-task tracking."
```

## Extraction Process

### Step 1: Review Workflow History
```
WORKFLOW HISTORY REVIEW

Examine the complete workflow execution:
- What phases were completed?
- What challenges were encountered?
- What solutions were discovered?
- What patterns emerged?
- What mistakes were made and corrected?
```

### Step 2: Identify Patterns
```
PATTERN IDENTIFICATION

Look for recurring themes:
- Successful approaches used multiple times
- Common mistakes or pitfalls
- Effective validation techniques
- Useful tool combinations
- Quality improvement methods
```

### Step 3: Formulate Lessons
```
LESSON FORMULATION

Convert patterns into actionable lessons:
- Start with "When doing X..."
- Specify the action: "always ensure Y..."
- Explain the benefit: "to prevent Z"
- Make it specific and measurable
- Include relevant context
```

### Step 4: Categorize and Store
```
LESSON CATEGORIZATION

Place lessons in appropriate categories:
- Workflow & Process
- Requirements & Specifications
- Design & Architecture
- Testing & Validation
- Implementation & Execution
- Tools & Automation
```

## Integration with Memory System

### Updating lessons.md
```markdown
## [Category]

[Existing lessons...]

- When [new pattern discovered], always [action to take] to prevent [problem avoided].
  - **Context**: [When this applies]
  - **Example**: [Concrete example if helpful]
```

### Avoiding Duplication
Before adding new lessons:
1. Check if similar lesson already exists
2. If exists, consider enhancing existing lesson
3. If new perspective, add as separate lesson
4. If contradictory, discuss with user before updating

### Maintaining Quality
Periodically review lessons for:
- Relevance to current practices
- Clarity and actionability
- Proper categorization
- Consolidation opportunities

## Lesson Extraction Examples

### From Requirements Phase
```
WORKFLOW EXECUTION:
- Created requirements with EARS patterns
- Initially missed glossary definitions
- Had to revise requirements to add missing terms
- Validation caught the issue before design phase

LESSON EXTRACTED:
"When creating requirements documents, always complete the glossary section before writing acceptance criteria to ensure all technical terms are defined when first used."

CATEGORY: Requirements
BENEFIT: Prevents revision cycles and maintains document clarity
```

### From Design Phase
```
WORKFLOW EXECUTION:
- Started writing correctness properties directly
- Realized some criteria were not testable
- Had to backtrack and analyze testability first
- Prework tool would have prevented this

LESSON EXTRACTED:
"When generating correctness properties, always use the prework tool to analyze testability before writing properties to avoid generating properties for non-testable criteria."

CATEGORY: Design
BENEFIT: Ensures systematic analysis and prevents wasted effort
```

### From Testing Phase
```
WORKFLOW EXECUTION:
- Implemented property-based tests with default iterations
- Tests passed but missed edge cases
- Increased iterations to 100, found issues
- Higher iteration count caught problems

LESSON EXTRACTED:
"When implementing property-based tests, always configure minimum 100 iterations to achieve reliable edge case coverage and catch subtle bugs."

CATEGORY: Testing
BENEFIT: Improves test reliability and bug detection
```

## Retrospective Integration

### After Each Phase
```
PHASE RETROSPECTIVE

Questions to ask:
- What went well in this phase?
- What could be improved?
- What patterns should be reused?
- What mistakes should be avoided?
- What tools or techniques were valuable?

Extract lessons and update memory.
```

### After Complete Workflow
```
WORKFLOW RETROSPECTIVE

Questions to ask:
- How did the phases work together?
- Were approval gates effective?
- Was traceability maintained?
- Did compound engineering principles apply?
- What systemic improvements were made?

Extract high-level lessons and update memory.
```

## Validation Checklist

Before updating lessons.md:

- [ ] Lessons are specific and actionable
- [ ] Context is clear (when to apply)
- [ ] Benefit is explained (why it matters)
- [ ] Format follows "When X, always Y to prevent Z"
- [ ] Appropriate category identified
- [ ] No duplication with existing lessons
- [ ] Examples provided where helpful
- [ ] Language is clear and concise