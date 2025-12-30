# Activation Triggers Reference

> **Authoritative reference for EARS-workflow skill activation with advanced semantic analysis**

## Semantic Analysis Engine

### Confidence Scoring Algorithm

The system uses multi-dimensional semantic analysis with weighted confidence scoring:

#### **Tier 1: Exact Matches (95-100% confidence)**
- Direct skill names: `ears-workflow`, `compound-engineering`, `spec-forge`
- Explicit activation: `use [skill-name]`, `activate [skill-name]`
- Command patterns: `run [skill-name]`, `execute [skill-name]`

#### **Tier 2: Primary Intent (85-94% confidence)**
- Workflow triggers: `structured development`, `formal methodology`
- Phase indicators: `create requirements`, `implement feature`, `review code`
- Action verbs with domain context: `specify authentication`, `build login system`

#### **Tier 3: Semantic Intent (70-84% confidence)**
- Domain vocabulary: `user story`, `acceptance criteria`, `test coverage`
- Contextual phrases: `need to document`, `should validate`, `time to implement`
- Problem statements: `authentication not working`, `requirements unclear`

#### **Tier 4: Contextual Inference (50-69% confidence)**
- Workflow progression: Previous phase completion triggers next phase suggestion
- Error context: Compilation errors → review phase, missing tests → work phase
- Time-based patterns: Morning → planning, afternoon → implementation

### Context-Aware Activation Patterns

#### **Sequential Workflow Context**
```
Previous: "Created requirements document"
Current: "Let's start building this"
→ git-workflow (92% confidence) + auto-suggest worktree creation

Previous: "Finished implementation" 
Current: "Is this code secure?"
→ testing-framework (94% confidence) + security persona activation

Previous: "Review completed"
Current: "Ready for next feature"
→ ears-specification (88% confidence) + requirements template loading
```

#### **Error-Driven Context**
```
"Tests are failing" → testing-framework (85% confidence)
"Git conflicts everywhere" → git-workflow (90% confidence) 
"Requirements don't make sense" → ears-specification (87% confidence)
"Code is messy" → testing-framework (82% confidence) + style persona
```

#### **Temporal Context Patterns**
```
Session start + no recent activity → compound-engineering (75% confidence)
After long implementation session → testing-framework (80% confidence)
Beginning of sprint → ears-specification (85% confidence)
End of sprint → testing-framework (90% confidence) + comprehensive review
```

## Enhanced Trigger Taxonomy

### **SPEC-FORGE Phase Triggers**

#### **High Confidence (90-95%)**
- `spec-forge`, `ears-specification`, `create specification`
- `requirements engineering`, `formal requirements`
- `user story creation`, `acceptance criteria`

#### **Medium Confidence (75-89%)**
- `need requirements`, `define behavior`, `specify system`
- `what should it do`, `how should it work`, `user needs`
- `business rules`, `functional requirements`, `non-functional requirements`

#### **Contextual Triggers (60-74%)**
- `unclear requirements` + previous planning phase
- `stakeholder feedback` + existing requirements
- `scope creep` + project context

### **PLANNING Phase Triggers**

#### **High Confidence (90-95%)**
- `planning`, `implementation planning`, `architecture design`
- `research approach`, `design decisions`, `technical strategy`

#### **Medium Confidence (75-89%)**
- `how to implement`, `what's the approach`, `need strategy`
- `analyze codebase`, `understand existing`, `investigate patterns`
- `design system`, `plan architecture`, `choose technology`

#### **Contextual Triggers (60-74%)**
- `complex feature` + no existing plan
- `legacy code` + modification request
- `new technology` + integration needs

### **WORK Phase Triggers**

#### **High Confidence (90-95%)**
- `implement`, `git-workflow`, `start coding`, `tdd`
- `build feature`, `write code`, `create implementation`

#### **Medium Confidence (75-89%)**
- `let's code`, `time to build`, `start development`
- `fix bug`, `add feature`, `modify behavior`
- `isolated environment`, `worktree`, `branch management`

#### **Contextual Triggers (60-74%)**
- `approved requirements` + no implementation
- `design complete` + ready to code
- `failing tests` + need implementation

### **REVIEW Phase Triggers**

#### **High Confidence (90-95%)**
- `review`, `audit`, `testing-framework`, `quality check`
- `security review`, `performance audit`, `code review`

#### **Medium Confidence (75-89%)**
- `is this secure`, `check performance`, `validate quality`
- `ready for production`, `deployment ready`, `merge ready`
- `test coverage`, `code quality`, `best practices`

#### **Contextual Triggers (60-74%)**
- `implementation complete` + no review
- `before deployment` + code changes
- `security concerns` + existing code

## Advanced Semantic Patterns

### **Multi-Intent Detection**
```
"Create requirements and set up development environment"
→ Primary: ears-specification (90%)
→ Secondary: git-workflow (85%)
→ Suggested sequence: SPEC-FORGE → WORK
```

### **Negation Handling**
```
"Don't want to write requirements from scratch"
→ ears-specification (75%) + template suggestion
→ Alternative: compound-engineering (70%) + existing requirements analysis
```

### **Conditional Activation**
```
"If the requirements are approved, start implementation"
→ Conditional: git-workflow (pending approval)
→ Current: ears-specification (80%) + approval gate focus
```

### **Urgency Detection**
```
"Critical security issue in production code"
→ testing-framework (98%) + security persona + high priority
→ Context: Skip normal workflow, immediate security audit
```

## Precedence Rules

### **Skill Precedence Hierarchy**
1. **Explicit Commands** (100% precedence): Direct skill invocation
2. **Error Context** (95% precedence): System errors override normal flow
3. **Workflow Sequence** (85% precedence): Natural phase progression
4. **User Intent** (75% precedence): Semantic analysis of user goals
5. **Default Routing** (50% precedence): Fallback to compound-engineering

### **Context Override Rules**
```
High Priority Contexts (Override normal precedence):
- Security vulnerabilities → testing-framework (security persona)
- Build failures → git-workflow (debugging mode)
- Deployment blockers → testing-framework (comprehensive review)
- Stakeholder escalations → ears-specification (requirements clarification)

Medium Priority Contexts (Influence confidence scoring):
- Time constraints → Suggest faster workflows
- Team collaboration → Emphasize documentation and review
- Legacy systems → Add extra planning and review phases
- New team members → Provide more guidance and templates
```

### **Conflict Resolution**
```
Multiple High-Confidence Matches:
1. Check workflow sequence (prefer next logical phase)
2. Analyze user intent depth (more specific wins)
3. Consider session context (recent activity patterns)
4. Default to compound-engineering for orchestration

Ambiguous Intent:
1. Present top 2-3 options with confidence scores
2. Explain reasoning for each suggestion
3. Allow user to clarify or choose
4. Learn from user selection for future improvements
```

## Context Memory Integration

### **Session Context Tracking**
```javascript
SessionContext: {
  currentPhase: "SPEC-FORGE" | "PLANNING" | "WORK" | "REVIEW",
  recentActivities: ["created requirements", "approved design"],
  activeFiles: [".ai/docs/requirements/auth-requirements.md"],
  workflowProgress: {
    specForge: "completed",
    planning: "in-progress", 
    work: "pending",
    review: "pending"
  },
  userPreferences: {
    preferredWorkflow: "tdd-first",
    reviewDepth: "comprehensive",
    documentationLevel: "detailed"
  }
}
```

### **Learning from Corrections**
```
User Correction Pattern Learning:
- Track when user overrides system suggestions
- Identify patterns in correction behavior
- Adjust confidence scoring based on correction history
- Update semantic models with successful patterns

Example Learning:
User frequently corrects "implement" → "review first"
→ Increase review-phase confidence when implementation is suggested
→ Add "implementation-complete" context check before work-phase activation
```

## Advanced Usage Examples

### **Context-Aware Progression**
```
Session Flow Example:
1. "Need to build user authentication"
   → ears-specification (88%) + "Starting with requirements?"
   
2. "Requirements approved, let's code"
   → git-workflow (94%) + "Creating worktree for feature/user-auth?"
   
3. "Implementation done, ready for review"
   → testing-framework (96%) + "Running comprehensive review with all personas?"
   
4. "Review passed, what's next?"
   → compound-engineering (85%) + "Ready for next feature or deployment?"
```

### **Error-Driven Activation**
```
Error Context Examples:
1. "TypeError: Cannot read property 'user' of undefined"
   → git-workflow (85%) + debugging mode + "Need to fix this bug?"
   
2. "Security scan found 3 vulnerabilities"
   → testing-framework (98%) + security persona + "Running security audit?"
   
3. "Requirements don't match implementation"
   → ears-specification (90%) + "Need to update requirements or implementation?"
```

### **Multi-Dimensional Analysis**
```
Complex Request: "The login system requirements are unclear and the current implementation has security issues"

Analysis:
- Domain: authentication (login system)
- Problems: unclear requirements + security issues  
- Implied actions: clarify requirements + security review

Activation:
→ Primary: ears-specification (85%) - requirements clarification
→ Secondary: testing-framework (90%) - security review
→ Suggested sequence: Clarify requirements first, then security audit
→ Confidence boost: Both issues are blocking, high priority
```

## Integration with Compound Engineering

### **Memory-Enhanced Activation**
```
Lessons Integration:
- Check .ai/memory/lessons.md for similar past situations
- Apply learned patterns to confidence scoring
- Suggest preventive measures based on past mistakes
- Reference successful resolution patterns

Decision Integration:
- Consult .ai/memory/decisions.md for architectural context
- Align skill activation with established patterns
- Maintain consistency with past architectural decisions
- Suggest updates to decisions when patterns evolve
```

### **Continuous Learning Loop**
```
Learning Cycle:
1. Activation Decision → Record context and reasoning
2. User Feedback → Track corrections and preferences  
3. Outcome Analysis → Measure success of activation choice
4. Pattern Update → Refine semantic models and confidence scoring
5. Memory Integration → Update lessons and decisions for future sessions
```

This enhanced semantic analysis system provides sophisticated, context-aware skill activation that learns and improves over time while maintaining the compound engineering principles of systematic improvement and knowledge accumulation.