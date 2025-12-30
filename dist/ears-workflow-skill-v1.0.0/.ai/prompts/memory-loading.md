# Memory Loading System

## Memory Loading Prompt

Use this prompt to load and apply EARS workflow memory at workflow start:

```
EARS WORKFLOW MEMORY LOADING

ALWAYS LOAD AT WORKFLOW START:

1. **Load Lessons Learned** (.ai/memory/lessons.md)
   - Past engineering patterns and solutions
   - Common mistakes and how to avoid them
   - Proven approaches and best practices
   - Technical insights from previous sessions

2. **Load Architectural Decisions** (.ai/memory/decisions.md)
   - Established patterns and conventions
   - Technology choices and rationales
   - Design principles and guidelines
   - Coding standards and practices

MEMORY APPLICATION INSTRUCTIONS:

**Apply Lessons to Current Task:**
- Review relevant lessons before making decisions
- Avoid repeating documented mistakes
- Use proven patterns where applicable
- Consider past insights when solving problems

**Apply Decisions to Current Task:**
- Follow established architectural patterns
- Use consistent naming conventions
- Maintain coding standards
- Respect existing technology choices

**Maintain EARS Workflow Principles:**
- Every task should improve the system
- Document new patterns discovered
- Update memory files with learnings
- Preserve knowledge for future sessions

MEMORY INTEGRATION CHECKLIST:
- [ ] Lessons.md loaded and reviewed
- [ ] Decisions.md loaded and reviewed  
- [ ] Relevant patterns identified for current task
- [ ] Potential improvements to memory files noted
- [ ] Ready to apply EARS workflow approach

CONTEXT LOADED. Proceed with task while maintaining EARS workflow principles.
```

## Memory Loading Examples

### Loading Lessons for Requirements Phase

```
MEMORY LOADING FOR REQUIREMENTS PHASE

Lessons Loaded from .ai/memory/lessons.md:
- "When writing requirements, always check .ai/memory/decisions.md for established patterns"
- "When creating user stories, always validate against EARS patterns to prevent rework"
- "When defining technical terms, always create comprehensive glossary to avoid ambiguity"

Applying to Current Requirements Task:
- Use established requirement patterns from decisions.md
- Validate all acceptance criteria against EARS patterns
- Create thorough glossary for all technical terms
- Follow proven requirement structure from past successes

Ready to proceed with requirements creation using EARS workflow approach.
```

### Loading Decisions for Design Phase

```
MEMORY LOADING FOR DESIGN PHASE

Decisions Loaded from .ai/memory/decisions.md:
- "Directory Structure: Follow domain-driven directory structure"
- "Error Handling: Use consistent error response format across all APIs"
- "Testing: Co-locate tests with source files using .test.ts suffix"

Applying to Current Design Task:
- Structure design document following established patterns
- Include error handling section with consistent format
- Plan testing strategy using co-located test approach
- Reference existing architectural decisions where relevant

Ready to proceed with design creation using established patterns.
```

### Loading Memory for Task Generation

```
MEMORY LOADING FOR TASK GENERATION

Combined Memory Application:
- Lessons: "When planning features, always create comprehensive plan before writing code"
- Decisions: "Task Organization: Use numbered checkbox format with decimal notation"
- Lessons: "When implementing features, always follow Red-Green-Refactor loop"

Applying to Current Task Generation:
- Create detailed, atomic task breakdown
- Use established numbering format from decisions
- Include testing tasks following TDD approach
- Reference specific requirements in each task

Ready to generate implementation tasks using EARS workflow principles.
```

## Memory-Driven Decision Making

### Pattern Recognition
```
PATTERN RECOGNITION FROM MEMORY

When encountering similar problems:
1. Search lessons.md for related patterns
2. Check decisions.md for established approaches
3. Apply proven solutions before inventing new ones
4. Document any variations or improvements

Example:
Current Problem: "How to structure validation logic?"
Memory Search: Found lesson "When implementing validation, always use centralized validation pattern"
Decision: Apply centralized validation approach from decisions.md
```

### Avoiding Past Mistakes
```
MISTAKE AVOIDANCE FROM MEMORY

When making technical choices:
1. Review lessons.md for documented pitfalls
2. Check if current approach has failed before
3. Use alternative approaches from memory
4. Document new failure modes discovered

Example:
Current Choice: "Should we use inline validation?"
Memory Check: Found lesson "When using inline validation, always ensure consistency to prevent scattered logic"
Decision: Use centralized validation to avoid documented consistency issues
```

### Consistency Maintenance
```
CONSISTENCY MAINTENANCE FROM MEMORY

When establishing new patterns:
1. Check decisions.md for existing conventions
2. Extend existing patterns rather than creating new ones
3. Update decisions.md if new patterns are needed
4. Ensure consistency across all project components

Example:
Current Need: "How to name new API endpoints?"
Memory Check: Found decision "API Design: Follow RESTful conventions"
Decision: Use established REST naming patterns from decisions.md
```

## Memory Update Triggers

### When to Update Lessons.md
- New problem-solving patterns discovered
- Mistakes made and corrected during workflow
- Successful approaches that should be repeated
- Technical insights that could help future work

### When to Update Decisions.md
- New architectural patterns established
- Technology choices made with rationale
- Coding standards or conventions adopted
- Design principles that should be followed consistently

## Memory Loading Validation

### Lessons Loading Checklist
- [ ] File exists and is readable
- [ ] Lessons are categorized by domain (Git, Testing, Code Quality, etc.)
- [ ] Each lesson follows format: "When doing X, always ensure Y to prevent Z"
- [ ] Lessons are specific and actionable
- [ ] Recent lessons are prioritized for current context

### Decisions Loading Checklist
- [ ] File exists and is readable
- [ ] Decisions follow ADR format with status, date, context, decision, rationale
- [ ] Active decisions are identified and prioritized
- [ ] Deprecated decisions are noted and avoided
- [ ] Examples and patterns are current and accurate

### Application Validation
- [ ] Relevant lessons identified for current task
- [ ] Applicable decisions noted for current context
- [ ] Potential memory updates identified
- [ ] EARS workflow principles understood
- [ ] Ready to proceed with memory-informed approach

## Integration with Workflow

### Requirements Phase Memory Application
```
REQUIREMENTS + MEMORY INTEGRATION

Memory-Informed Requirements Creation:
1. Load lessons about requirement quality and EARS patterns
2. Apply decisions about glossary structure and terminology
3. Use proven user story formats from past successes
4. Avoid documented requirement pitfalls
5. Plan for memory updates based on new patterns discovered
```

### Design Phase Memory Application
```
DESIGN + MEMORY INTEGRATION

Memory-Informed Design Creation:
1. Load architectural decisions and established patterns
2. Apply lessons about design document structure
3. Use proven correctness property patterns
4. Follow established testing strategy approaches
5. Document new architectural decisions made
```

### Tasks Phase Memory Application
```
TASKS + MEMORY INTEGRATION

Memory-Informed Task Generation:
1. Load lessons about task breakdown and sequencing
2. Apply decisions about task formatting and structure
3. Use proven implementation approaches
4. Follow established testing integration patterns
5. Update lessons with new task patterns discovered
```

## Memory Maintenance

### Periodic Review
- Review memory files monthly for relevance
- Consolidate similar lessons into higher-level principles
- Update examples to reflect current codebase
- Archive outdated decisions and mark as deprecated

### Quality Control
- Ensure lessons are specific and actionable
- Verify decisions include proper rationale
- Check that examples are accurate and current
- Maintain consistent formatting and structure

### Growth Management
- Prevent memory files from becoming too large
- Consolidate redundant or overlapping entries
- Prioritize high-impact lessons and decisions
- Archive historical entries that are no longer relevant