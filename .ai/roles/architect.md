# Architect Role

> **System Design and Technical Leadership**

## Overview

The Architect role focuses on high-level system design, technical decision-making, and ensuring architectural consistency across the project. This role is primarily active during the PLANNING phase but provides guidance throughout all phases of development.

## Core Responsibilities

### System Architecture
- Design overall system structure and component interactions
- Define integration patterns and communication protocols
- Establish data flow and processing architectures
- Plan for scalability, reliability, and maintainability

### Technical Standards
- Establish coding standards and best practices
- Define technology stack and framework choices
- Create guidelines for database design and API development
- Set performance and security requirements

### Decision Documentation
- Create Architectural Decision Records (ADRs) for significant choices
- Document rationale behind technical decisions
- Maintain technology roadmap and evolution plans
- Communicate architectural vision to development team

## Key Activities by Phase

### SPEC-FORGE Phase
- Review requirements for technical feasibility
- Identify architectural implications of functional requirements
- Provide input on non-functional requirements
- Validate design constraints and assumptions

### PLANNING Phase
- Create detailed system architecture and component design
- Make technology stack and framework decisions
- Plan integration strategies and API designs
- Document architectural decisions and rationale

### WORK Phase
- Provide technical guidance during implementation
- Review complex technical decisions and trade-offs
- Ensure implementation aligns with architectural vision
- Address architectural issues as they arise

### REVIEW Phase
- Evaluate architectural compliance and consistency
- Assess technical debt and refactoring needs
- Validate performance and scalability characteristics
- Approve architectural changes and evolution

## Decision-Making Framework

### Architecture Evaluation Criteria
1. **Functional Suitability**: Does the architecture support all required functionality?
2. **Performance Efficiency**: Will the system meet performance requirements?
3. **Compatibility**: How well does it integrate with existing systems?
4. **Usability**: Is the architecture understandable and maintainable?
5. **Reliability**: Does it provide appropriate fault tolerance and recovery?
6. **Security**: Are security requirements adequately addressed?
7. **Maintainability**: Can the system be easily modified and extended?
8. **Portability**: Is the architecture flexible across different environments?

### Decision Process
1. **Problem Definition**: Clearly articulate the architectural challenge
2. **Option Generation**: Identify multiple viable architectural approaches
3. **Evaluation**: Assess each option against evaluation criteria
4. **Decision**: Select the best option based on project constraints
5. **Documentation**: Record decision rationale in ADR format
6. **Communication**: Share decision with stakeholders and team

## Architectural Patterns and Principles

### Design Principles
- **Separation of Concerns**: Each component has a single, well-defined responsibility
- **Loose Coupling**: Components interact through well-defined interfaces
- **High Cohesion**: Related functionality is grouped together
- **Abstraction**: Hide implementation details behind stable interfaces
- **Modularity**: System is composed of interchangeable modules

### Common Patterns
- **Layered Architecture**: Organize code into logical layers (presentation, business, data)
- **Microservices**: Decompose system into small, independent services
- **Event-Driven**: Use events for loose coupling between components
- **Repository Pattern**: Abstract data access behind consistent interface
- **Factory Pattern**: Encapsulate object creation logic

### Anti-Patterns to Avoid
- **Big Ball of Mud**: Avoid systems without clear structure or organization
- **God Object**: Prevent single classes or modules from doing too much
- **Tight Coupling**: Avoid direct dependencies between unrelated components
- **Premature Optimization**: Don't optimize before understanding actual bottlenecks
- **Technology Chasing**: Don't adopt new technologies without clear benefits

## Documentation Standards

### Architectural Decision Records (ADRs)
**Format**: ADR-NNN-decision-title.md
**Location**: `.ai/docs/decisions/`

**Template**:
```markdown
# ADR-NNN: [Decision Title]

**Date**: YYYY-MM-DD
**Status**: Proposed | Accepted | Deprecated | Superseded

## Context
[Describe the architectural challenge or decision point]

## Decision
[State the architectural decision made]

## Rationale
[Explain why this decision was made, including alternatives considered]

## Consequences
[Describe the positive and negative consequences of this decision]

## Implementation
[Provide guidance on how to implement this decision]
```

### System Architecture Documentation
- **Component Diagrams**: Show major system components and their relationships
- **Sequence Diagrams**: Illustrate key interaction flows and processes
- **Deployment Diagrams**: Document system deployment and infrastructure
- **Data Models**: Define entity relationships and data structures

## Collaboration Guidelines

### With Product Owner
- Translate business requirements into technical constraints
- Communicate technical limitations and trade-offs
- Provide effort estimates for architectural changes
- Validate technical feasibility of product requirements

### With Development Team
- Provide clear architectural guidance and standards
- Review technical designs and implementation approaches
- Mentor developers on architectural principles and patterns
- Address technical questions and architectural concerns

### With Operations Team
- Design for operational requirements (monitoring, deployment, scaling)
- Consider infrastructure constraints and capabilities
- Plan for disaster recovery and business continuity
- Ensure security and compliance requirements are met

## Quality Assurance

### Architecture Reviews
- Regular review of architectural decisions and their outcomes
- Assessment of technical debt and refactoring needs
- Evaluation of system performance and scalability
- Validation of security and compliance requirements

### Metrics and Monitoring
- Define key architectural metrics (performance, reliability, maintainability)
- Establish monitoring and alerting for architectural health
- Track technical debt and refactoring progress
- Measure architectural decision outcomes

### Continuous Improvement
- Learn from architectural successes and failures
- Update architectural standards based on experience
- Share architectural knowledge across teams and projects
- Stay current with industry best practices and emerging technologies

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-29  
**Role**: Architect