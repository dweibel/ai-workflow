# Review Workflow

> **Phase 4: Multi-Perspective Quality Assurance**

## Overview

The REVIEW phase conducts comprehensive multi-perspective audits to ensure quality, security, performance, and maintainability before code integration. This phase adopts four distinct personas to examine code from different angles, ensuring thorough quality assurance.

## Phase Position

REVIEW is the fourth and final phase in the EARS-workflow methodology:
- **Previous**: WORK (TDD implementation, feature branch completed)
- **Current**: REVIEW (multi-perspective audit and quality assurance)
- **Next**: Integration and deployment (outside workflow scope)

## Review Personas

### 1. Security Sentinel
**Focus**: Security vulnerabilities and attack vectors

**Responsibilities**:
- OWASP Top 10 vulnerability assessment
- Authentication and authorization review
- Input validation and sanitization checks
- Secrets management and credential security
- Data privacy and protection compliance

**Key Questions**:
- Are all inputs properly validated and sanitized?
- Is authentication implemented correctly and securely?
- Are secrets and credentials properly managed?
- Does the code expose sensitive information?
- Are there potential injection vulnerabilities?

### 2. Performance Oracle
**Focus**: Algorithmic complexity and resource efficiency

**Responsibilities**:
- Algorithmic complexity analysis (Big O notation)
- Database query optimization and N+1 problem detection
- Memory usage and potential leak identification
- Network request efficiency and caching strategies
- Scalability bottleneck identification

**Key Questions**:
- What is the time and space complexity of key algorithms?
- Are there potential N+1 query problems?
- Is memory usage efficient and bounded?
- Are network requests optimized and cached appropriately?
- Will this code scale under increased load?

### 3. Framework Purist
**Focus**: Code style, conventions, and best practices

**Responsibilities**:
- Coding standards and style guide compliance
- Framework-specific best practices adherence
- Code organization and structure review
- Naming conventions and readability assessment
- Design pattern usage and appropriateness

**Key Questions**:
- Does the code follow established style guidelines?
- Are framework conventions properly followed?
- Is the code well-organized and readable?
- Are design patterns used appropriately?
- Is the code maintainable and extensible?

### 4. Data Integrity Guardian
**Focus**: Data consistency and database integrity

**Responsibilities**:
- Database schema design and migration safety
- Foreign key relationships and referential integrity
- Data validation and constraint enforcement
- Transaction boundary and ACID property review
- Backup and recovery consideration

**Key Questions**:
- Are database migrations safe and reversible?
- Is referential integrity properly maintained?
- Are data constraints appropriately enforced?
- Are transactions properly bounded and consistent?
- Is data loss prevention adequately addressed?

## Review Process

### 1. Preparation Phase
- Gather all relevant code changes and documentation
- Review implementation plan and acceptance criteria
- Set up review environment with necessary tools
- Identify specific areas requiring focused attention

### 2. Multi-Perspective Analysis
- Conduct each persona review independently
- Document findings with severity classification
- Identify cross-cutting concerns and interactions
- Gather evidence and examples for each finding

### 3. Findings Synthesis
- Consolidate findings from all personas
- Classify issues by severity (CRITICAL/HIGH/MEDIUM/LOW)
- Prioritize fixes based on risk and impact
- Create actionable remediation plan

### 4. Quality Gate Decision
- Determine if code meets quality standards for integration
- Identify blocking issues that must be resolved
- Document approval conditions and requirements
- Communicate findings and recommendations
- **Codify Review Findings**: Extract systemic lessons from review findings and add them to `.ai/memory/lessons.md` to prevent similar issues in future implementations
- **Document Quality Patterns**: Record successful quality assurance patterns and review techniques in `.ai/memory/decisions.md`

## Severity Classification

### CRITICAL (Must Fix Before Merge)
- Security vulnerabilities with immediate exploit potential
- Data corruption or loss risks
- Performance issues causing system instability
- Breaking changes without proper migration path

### HIGH (Should Fix Before Merge)
- Security issues with potential for future exploitation
- Significant performance degradation
- Major violations of coding standards
- Data integrity risks under edge conditions

### MEDIUM (Fix in Next Sprint)
- Minor security improvements
- Performance optimizations for better user experience
- Code quality improvements for maintainability
- Documentation gaps or inconsistencies

### LOW (Technical Debt)
- Style guide violations
- Minor refactoring opportunities
- Non-critical documentation improvements
- Nice-to-have optimizations

## Review Deliverables

### Findings Report
**Location**: `.ai/docs/reviews/YYYY-MM-DD-review-scope.md`

**Contents**:
- Executive summary with overall assessment
- Detailed findings organized by persona and severity
- Specific recommendations with actionable steps
- Quality gate decision and approval conditions

### Updated Memory Files
- **Codify Review Findings**: Extract systemic lessons from review findings and add them to `.ai/memory/lessons.md` to prevent similar issues in future implementations
- **Document Quality Patterns**: Record successful quality assurance patterns and review techniques in `.ai/memory/decisions.md`
- Update patterns and best practices based on findings

## Universal Invariants

All review activities must follow these rules:

### Objective Assessment
- Focus on code quality, not personal preferences
- Use established standards and best practices as criteria
- Provide specific examples and evidence for findings
- Separate critical issues from style preferences

### Constructive Feedback
- Explain the reasoning behind each recommendation
- Suggest specific improvements rather than just identifying problems
- Acknowledge good practices and quality implementations
- Maintain professional and respectful tone

### Comprehensive Coverage
- Review all changed code, not just new additions
- Consider impact on existing functionality and integrations
- Evaluate both functional and non-functional requirements
- Test edge cases and error conditions

## Transition Criteria

### From WORK
- Feature implementation is complete and tested
- All planned functionality is working as specified
- Test suite passes with adequate coverage
- Code is ready for quality assessment

### To Integration
- All CRITICAL and HIGH severity issues are resolved
- Code meets established quality standards
- Documentation is complete and accurate
- Approval is granted by review process

## Best Practices

### Review Methodology
1. **Systematic approach**: Follow the four-persona structure consistently
2. **Evidence-based**: Support findings with specific examples and references
3. **Risk-focused**: Prioritize issues based on potential impact and likelihood
4. **Actionable feedback**: Provide clear guidance for addressing issues

### Collaboration
1. **Respectful communication**: Focus on code quality, not personal criticism
2. **Learning opportunity**: Use reviews to share knowledge and best practices
3. **Iterative improvement**: Expect multiple review cycles for complex changes
4. **Team alignment**: Ensure consistent standards across all team members

### Continuous Improvement
1. **Pattern recognition**: Identify recurring issues for process improvement
2. **Tool enhancement**: Automate detection of common problems
3. **Standard evolution**: Update standards based on lessons learned
4. **Knowledge sharing**: Document insights for future reference

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-29  
**Phase**: REVIEW