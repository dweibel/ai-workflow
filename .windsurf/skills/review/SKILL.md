---
name: review
description: Conduct comprehensive multi-perspective code audits to ensure quality, security, performance, and maintainability. Use this skill when reviewing code changes, pull requests, or conducting quality assurance before merge.
version: 1.0.0
author: EARS-Workflow System
phase: review
---

# REVIEW: Multi-Perspective Code Audit

## Overview

The REVIEW skill conducts comprehensive multi-perspective audits of code changes to ensure quality, security, performance, and maintainability before merge. This skill adopts four specialized personas sequentially to provide thorough analysis from different angles.

## Activation

This skill activates when users mention:
- "review", "audit", "check", "assess"
- "code review", "pull request", "PR review"
- "security audit", "performance review", "quality check"
- "multi-perspective", "comprehensive review", "deep review"

## Phase Position

REVIEW is the fourth and final phase in the EARS-workflow methodology:
- **Previous**: WORK (TDD implementation, feature branch completed)
- **Current**: REVIEW (multi-perspective audit and quality assurance)
- **Next**: MERGE (approved changes integrated to main branch)

## Objective

Conduct a comprehensive multi-perspective audit of code changes to ensure quality, security, performance, and maintainability before merge.

## Prerequisites

Before starting review:
1. **Completed feature branch** from WORK phase with all tests passing
2. **Auditor persona** loaded from `references/auditor-role.md`
3. **Review workflow** loaded from `references/review-workflow.md`
4. **Scope identification** - specific branch, PR, or commit range to review
5. **Context understanding** - reference to approved plan and implementation goals

## Key Activities

### 1. Scope Definition
- Identify what changes to review (branch, commits, files)
- Load context from approved plan and implementation history
- Understand the purpose and goals of the changes
- Determine review boundaries and focus areas

### 2. Multi-Persona Sequential Review
Adopt four specialized personas in sequence, each generating independent findings:

#### Persona 1: Security Sentinel
**Focus**: OWASP Top 10, Authentication/Authorization, Data Protection
- Input validation and sanitization
- Secrets management and credential exposure
- Authentication and authorization enforcement
- SQL injection and XSS vulnerabilities
- Data encryption and secure transmission
- Dependency security and known vulnerabilities

#### Persona 2: Performance Oracle
**Focus**: Algorithmic Complexity, Database Efficiency, Resource Management
- Algorithmic complexity and nested loops
- Database query optimization and N+1 problems
- Memory management and resource cleanup
- Caching strategies and redundant operations
- API efficiency and response optimization
- Indexing and query performance

#### Persona 3: Framework Purist
**Focus**: Idiomatic Code, Framework Conventions, Simplicity
- Framework-specific best practices and conventions
- Code simplicity and unnecessary abstractions
- Style consistency and naming conventions
- Component sizing and module organization
- Readability and maintainability
- Adherence to established project patterns

#### Persona 4: Data Integrity Guardian
**Focus**: Schema Consistency, Migration Safety, Data Validation
- Database migration safety and idempotency
- Foreign key constraints and referential integrity
- Data validation at schema and application levels
- Schema consistency and appropriate data types
- Indexing strategy for data access patterns
- Rollback procedures and backward compatibility

### 3. Findings Synthesis and Triage
- Compile unified review document with all persona findings
- Categorize findings by severity (CRITICAL/HIGH/MEDIUM/LOW)
- Generate actionable checklist for required fixes
- Provide clear recommendation (APPROVE/APPROVE WITH CHANGES/REQUEST CHANGES)

### 4. Fix Implementation (If Requested)
- Convert findings into actionable TODO items
- Implement fixes using TDD methodology
- Verify fixes address identified issues
- Ensure no new issues are introduced

## Review Protocol

### Sequential Persona Analysis
Each persona generates independent findings report:

```markdown
## 🔒 Security Findings
### CRITICAL
- **[CRITICAL]**: SQL Injection risk in user query
  - **File**: `src/database.ts:42`
  - **Issue**: Direct string concatenation in SQL query
  - **Risk**: Attacker can execute arbitrary SQL
  - **Fix**: Use parameterized queries

### HIGH/MEDIUM/LOW
[Additional findings by severity]

### ✅ PASSED
[Security measures that are correctly implemented]
```

### Findings Documentation
Create comprehensive review report at `.ai/docs/reviews/YYYY-MM-DD-feature-name-review.md`:

```markdown
# 🔍 Code Review: [Feature Name]

**Branch**: `feat/feature-name`
**Reviewer**: Auditor (Multi-Persona)
**Date**: YYYY-MM-DD

## Executive Summary
[Overview of changes and assessment]

## Findings Overview
| Severity | Security | Performance | Style | Data | Total |
|:---------|:---------|:------------|:------|:-----|:------|
| CRITICAL | X        | Y           | 0     | Z    | **N** |
| HIGH     | A        | B           | 0     | C    | **M** |

## Actionable Checklist
### 🚨 CRITICAL - Must Fix Before Merge
- [ ] [Critical Issue 1]
- [ ] [Critical Issue 2]

### ⚠️ HIGH - Should Fix Before Merge
- [ ] [High Priority Issue]

## Recommendation
✅ **APPROVE** / ⚠️ **APPROVE WITH CHANGES** / ❌ **REQUEST CHANGES**
```

## Severity Classification

### CRITICAL
- Security vulnerabilities with immediate exploit potential
- Performance issues causing system failure or severe degradation
- Data integrity violations risking data loss or corruption
- **Action Required**: Must fix before merge

### HIGH
- Security issues with moderate exploit potential
- Performance bottlenecks significantly impacting user experience
- Architecture violations breaking established patterns
- **Action Required**: Should fix before merge

### MEDIUM
- Style inconsistencies affecting maintainability
- Minor performance optimizations
- Code complexity issues
- **Action Required**: Consider fixing, may defer to future iteration

### LOW
- Style suggestions and minor improvements
- Documentation enhancements
- Nice-to-have optimizations
- **Action Required**: Optional, good for future cleanup

## Quality Assurance

### Review Completeness Checklist
- [ ] All four personas have completed analysis
- [ ] Findings are categorized by severity
- [ ] Specific files and line numbers are cited
- [ ] Concrete fixes are suggested for each issue
- [ ] Overall recommendation is provided

### Evidence-Based Analysis
- Cite specific file paths and line numbers
- Provide code examples showing issues and fixes
- Reference established project patterns and conventions
- Include measurable impact assessments where applicable

## Memory Integration

### Lessons Learned
- Document review patterns and common issues in `../../memory/lessons.md`
- Update with insights about code quality and security patterns
- Record effective review techniques and persona insights

### Decision History
- Update `../../memory/decisions.md` with new architectural patterns discovered
- Document coding standards and style decisions made during review
- Maintain consistency with established project conventions

## Context Loading

Reference supporting files in `references/` directory:
- Review workflow procedures and persona protocols
- Auditor role definitions and competencies
- Multi-perspective analysis methodologies
- Triage and severity classification guidelines

## Integration Points

- Loads completed WORK artifacts (feature branch, test coverage, implementation)
- References `references/review-workflow.md` for detailed audit procedures
- Uses `references/auditor-role.md` for persona definitions and analysis methods
- Updates `../../memory/` files with review insights and quality patterns
- Generates review artifacts in `../../docs/reviews/` for documentation

## Approval Gate

The REVIEW phase provides final quality assurance before merge:

**Completion Criteria**:
- All four persona reviews are complete
- Findings are categorized and documented
- User consultation on required fixes
- Critical and high-priority issues addressed
- Final approval recommendation provided

## Output Artifacts

Upon completion, REVIEW produces:
- Comprehensive multi-persona review document
- Categorized findings with severity classification
- Actionable checklist for required fixes
- Clear merge recommendation with rationale
- Updated memory files with review insights

## Error Handling

Common review challenges and solutions:
- **Scope Ambiguity**: Clearly define review boundaries and focus areas
- **Persona Overlap**: Maintain distinct perspective for each persona analysis
- **Severity Inconsistency**: Apply consistent criteria for issue classification
- **Generic Findings**: Provide specific, actionable feedback with concrete examples
- **Context Missing**: Reference approved plan and implementation goals

## Transition to MERGE

Upon completion, the REVIEW skill provides:
- Quality-assured code ready for production
- Documented review findings and resolutions
- Clear approval status and merge recommendation
- Updated project knowledge and patterns
- Foundation for future review improvements

## Anti-Patterns to Avoid

- ❌ **Generic Review**: "Looks good to me" without specific analysis
- ❌ **Mixing Concerns**: Combining different persona findings in one section
- ❌ **Vague Findings**: "This code could be better" without specifics
- ❌ **Ignoring Severity**: Treating all issues equally
- ❌ **Review Without Context**: Not understanding the purpose of changes
- ❌ **Nitpicking Style**: Focusing on minor issues while missing critical problems

The REVIEW skill ensures that code changes meet high standards for security, performance, maintainability, and data integrity through systematic multi-perspective analysis before integration to the main branch.