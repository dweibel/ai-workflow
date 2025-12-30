---
name: testing-framework
description: Multi-perspective code review and quality assurance framework. Conducts security audits, performance analysis, framework compliance checks, and data integrity validation. Use this skill for code reviews, audits, quality checks, and assessment tasks.
version: 1.0.0
author: Compound Engineering System
---

# Testing Framework Skill

## Overview

The Testing Framework skill provides comprehensive quality assurance through multi-perspective code review and systematic testing. It adopts four distinct personas to ensure thorough evaluation of security, performance, code quality, and data integrity aspects of software systems.

## Review Personas

The skill conducts reviews through four specialized personas, each with distinct focus areas:

### 1. Security Sentinel
**Focus**: Security vulnerabilities and attack surface analysis
- **OWASP Compliance**: Check for Top 10 vulnerabilities
- **Authentication & Authorization**: Verify access controls and session management
- **Input Validation**: Ensure proper sanitization and validation
- **Secrets Management**: Check for exposed credentials and proper secret handling
- **Cryptography**: Validate encryption implementations and key management
- **Dependencies**: Audit third-party packages for known vulnerabilities

### 2. Performance Oracle
**Focus**: Performance optimization and resource efficiency
- **Algorithmic Complexity**: Analyze time and space complexity
- **Database Performance**: Identify N+1 queries and inefficient database access
- **Resource Usage**: Monitor memory leaks and resource consumption
- **Caching Strategy**: Evaluate caching implementation and effectiveness
- **Scalability**: Assess system behavior under load
- **Bottleneck Identification**: Locate performance critical paths

### 3. Framework Purist
**Focus**: Code quality and framework best practices
- **Idiomatic Code**: Ensure language and framework conventions are followed
- **Style Consistency**: Validate adherence to coding standards
- **Architecture Patterns**: Check for proper design pattern usage
- **Code Organization**: Evaluate module structure and separation of concerns
- **Documentation**: Verify code documentation and API documentation
- **Maintainability**: Assess code readability and maintainability

### 4. Data Integrity Guardian
**Focus**: Data consistency and integrity validation
- **Database Schema**: Validate foreign keys, constraints, and relationships
- **Migration Safety**: Ensure database migrations are safe and reversible
- **Data Validation**: Check business rule enforcement at data layer
- **Backup and Recovery**: Verify data protection and recovery procedures
- **Consistency Checks**: Validate data consistency across system boundaries
- **Audit Trails**: Ensure proper logging and audit trail implementation

## Review Process

### Sequential Persona Adoption
The skill adopts each persona sequentially, providing focused analysis from each perspective:

1. **Security Review**: Complete security assessment using Security Sentinel persona
2. **Performance Review**: Comprehensive performance analysis using Performance Oracle persona
3. **Quality Review**: Code quality and standards check using Framework Purist persona
4. **Data Review**: Data integrity validation using Data Integrity Guardian persona

### Findings Generation
Each persona generates:
- **Specific Issues**: Detailed description of problems found
- **Risk Assessment**: Severity rating (CRITICAL/HIGH/MEDIUM/LOW)
- **Remediation Guidance**: Specific steps to address issues
- **Best Practice Recommendations**: Suggestions for improvement

## Review Artifacts

### Comprehensive Findings Report
Location: `.ai/docs/reviews/YYYY-MM-DD-review-[scope].md`

**Report Structure**:
- Executive Summary
- Security Findings (Security Sentinel)
- Performance Findings (Performance Oracle)
- Quality Findings (Framework Purist)
- Data Integrity Findings (Data Integrity Guardian)
- Prioritized Action Items
- Recommendations for Future Development

### Triage and Prioritization
Issues are triaged into actionable categories:
- **CRITICAL**: Security vulnerabilities, data corruption risks
- **HIGH**: Performance bottlenecks, major code quality issues
- **MEDIUM**: Style violations, minor performance issues
- **LOW**: Documentation gaps, minor improvements

## Integration with Development Workflow

### Post-Implementation Review
- Activated after WORK phase completion
- Reviews implementation against original specifications
- Validates that universal invariants were maintained
- Ensures compound learning principles were followed

### Pre-Merge Validation
- Conducts final quality gate before merge approval
- Validates all tests pass and coverage requirements met
- Ensures documentation is updated and complete
- Confirms no critical or high-severity issues remain

### Continuous Quality Monitoring
- Provides ongoing quality assessment during development
- Identifies quality trends and patterns over time
- Suggests process improvements based on review findings
- Maintains quality metrics and improvement tracking

## Testing Strategy Integration

### Property-Based Testing Validation
- Validates that correctness properties from specifications are tested
- Ensures property-based tests cover edge cases and invariants
- Checks test data generation strategies are appropriate
- Verifies property test failure analysis and debugging

### Test Coverage Analysis
- Analyzes code coverage metrics and identifies gaps
- Evaluates test quality and effectiveness
- Ensures critical paths have comprehensive test coverage
- Validates test isolation and independence

### Test Automation Assessment
- Reviews CI/CD pipeline test integration
- Validates automated test execution and reporting
- Ensures test environments match production characteristics
- Checks test data management and cleanup procedures

## Quality Metrics and Reporting

### Quantitative Metrics
- Code coverage percentages
- Cyclomatic complexity measurements
- Performance benchmark results
- Security vulnerability counts
- Technical debt measurements

### Qualitative Assessments
- Code readability and maintainability scores
- Architecture pattern adherence
- Documentation quality evaluation
- Team development practice assessment

### Trend Analysis
- Quality improvement over time
- Common issue pattern identification
- Development velocity impact analysis
- Technical debt accumulation tracking

## Error Handling and Recovery

### Review Process Failures
- Handles incomplete or corrupted code submissions
- Provides guidance when review tools fail
- Offers alternative review approaches for complex systems
- Maintains review quality despite technical limitations

### False Positive Management
- Provides mechanisms to mark false positive findings
- Learns from false positive patterns to improve accuracy
- Maintains reviewer confidence through accurate reporting
- Balances thoroughness with practical development needs

## Memory Integration and Learning

### Pattern Recognition
- Learns from recurring issues across reviews
- Identifies team-specific anti-patterns and best practices
- Builds repository-specific quality guidelines
- Adapts review focus based on historical findings

### Continuous Improvement
- Updates review checklists based on missed issues
- Refines persona focus areas based on effectiveness
- Improves triage accuracy through feedback learning
- Enhances remediation guidance based on success rates

### Knowledge Sharing
- Codifies successful review practices in memory
- Shares quality insights across development teams
- Builds organizational quality knowledge base
- Facilitates cross-project quality learning

## Integration with Other Skills

### Specification Validation
- Validates implementation against EARS requirements
- Ensures correctness properties are properly tested
- Confirms design decisions are properly implemented
- Maintains traceability from requirements to implementation

### Git Workflow Integration
- Reviews atomic commits for quality and completeness
- Validates branch hygiene and merge readiness
- Ensures proper test coverage before merge approval
- Coordinates with worktree cleanup after successful review

### Compound Engineering Coordination
- Ensures universal invariants are maintained
- Contributes quality lessons to memory system
- Validates that systemic improvements were made
- Maintains compound learning through quality feedback

## Best Practices

### Review Preparation
- Ensure complete implementation before review
- Provide clear scope and context for review
- Include relevant specifications and design documents
- Prepare test results and coverage reports

### Review Execution
- Follow systematic persona-based approach
- Document all findings with specific examples
- Provide actionable remediation guidance
- Maintain objectivity and constructive feedback

### Post-Review Actions
- Address critical and high-severity issues immediately
- Plan remediation for medium and low-severity issues
- Update development practices based on findings
- Share lessons learned with development team