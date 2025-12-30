# Architectural Decisions

> **Memory system for documenting architectural patterns and decision rationale**

This file contains architectural decisions made during the development of the EARS-workflow skill package. Each decision includes context, options considered, decision made, and rationale.

## ADR-001: Agent Skills Standard Adoption

**Date**: 2025-12-29  
**Status**: Accepted  
**Context**: Need to ensure compatibility across multiple IDEs (VS Code, Cursor, JetBrains)  

**Decision**: Adopt Agent Skills Standard with YAML frontmatter in SKILL.md files  

**Rationale**:
- Provides standardized discovery mechanism across IDEs
- Enables progressive disclosure for efficient context management
- Maintains backward compatibility with existing AGENTS.md systems
- Supports semantic activation routing with confidence scoring

**Consequences**:
- All skills must include valid YAML frontmatter
- File structure must follow Agent Skills conventions
- Activation logic must support semantic analysis

## ADR-002: Progressive Disclosure Architecture

**Date**: 2025-12-29  
**Status**: Accepted  
**Context**: Need to manage context window efficiently while providing comprehensive capabilities  

**Decision**: Implement three-tier progressive disclosure system  

**Rationale**:
- Tier 1 (Discovery): Minimal metadata for all skills (~50 tokens each)
- Tier 2 (Activation): Full instructions for active skills (~500-1000 tokens)
- Tier 3 (Execution): Supporting files loaded incrementally as needed
- Prevents context window bloat while maintaining full functionality

**Consequences**:
- Skills must be designed for incremental loading
- Context management becomes more complex
- Better scalability for large skill ecosystems

## ADR-003: Cross-Platform Script Strategy

**Date**: 2025-12-29  
**Status**: Accepted  
**Context**: Need to support Windows, macOS, and Linux with consistent functionality  

**Decision**: Use bash scripts with documented Windows compatibility via WSL/Git Bash  

**Rationale**:
- Bash provides consistent scripting environment across platforms
- Windows users commonly have WSL or Git Bash available
- Avoids maintaining separate script implementations
- Leverages existing git worktree bash ecosystem

**Consequences**:
- Windows users must install WSL or Git Bash
- Documentation must clearly explain platform requirements
- Scripts must handle cross-platform path differences

## ADR-004: Skill Terminology Standardization

**Date**: 2025-12-29  
**Status**: Accepted  
**Context**: Inconsistent use of "skills" vs "sub-skills" causing user confusion  

**Decision**: Use "skills" for all individual capabilities, reserve "sub-skills" only for internal implementation details  

**Rationale**:
- Aligns with Agent Skills Standard terminology
- Reduces cognitive load for users
- Simplifies documentation maintenance
- Matches actual file structure (individual SKILL.md files)

**Consequences**:
- All documentation must use consistent terminology
- Legacy references to "sub-skills" must be updated
- User-facing interfaces should use "skills" exclusively

## ADR-005: Version Synchronization Strategy

**Date**: 2025-12-29  
**Status**: Accepted  
**Context**: Multiple version references across package causing inconsistencies  

**Decision**: Synchronize all skill versions with package.json version, maintain single source of truth  

**Rationale**:
- Prevents version drift between components
- Simplifies release management
- Enables automated version validation
- Provides clear versioning strategy for users

**Consequences**:
- All SKILL.md files must maintain synchronized versions
- Release process must update all version references
- Validation scripts must check version consistency

## ADR-006: Documentation Consolidation Pattern

**Date**: 2025-12-29  
**Status**: Accepted  
**Context**: Duplicated information across multiple documentation files creating maintenance burden  

**Decision**: Create authoritative reference documents with cross-references from other docs  

**Rationale**:
- Single source of truth for each topic
- Reduces maintenance overhead
- Prevents information drift
- Enables comprehensive reference while maintaining focused guides

**Consequences**:
- Reference documents must be comprehensive and accurate
- Other documents must use cross-references instead of duplication
- Documentation structure becomes more hierarchical

## ADR-007: Activation Trigger Centralization

**Date**: 2025-12-29  
**Status**: Accepted  
**Context**: Inconsistent activation triggers across different documentation sources  

**Decision**: Maintain single authoritative activation triggers reference with semantic analysis  

**Rationale**:
- Prevents conflicting activation instructions
- Enables sophisticated semantic routing
- Supports confidence scoring for better user experience
- Allows for trigger evolution without breaking existing patterns

**Consequences**:
- All activation logic must reference central trigger definitions
- Semantic analysis must be robust and well-tested
- Trigger updates must be coordinated across all documentation

## ADR-008: Memory File Structure

**Date**: 2025-12-29  
**Status**: Accepted  
**Context**: Need systematic approach to compound learning and knowledge retention  

**Decision**: Separate lessons.md (tactical) from decisions.md (strategic) with periodic consolidation  

**Rationale**:
- Lessons capture immediate learning from corrections and failures
- Decisions capture strategic architectural choices with rationale
- Separation prevents mixing tactical and strategic concerns
- Periodic consolidation prevents unbounded growth

**Consequences**:
- Clear distinction between lesson types must be maintained
- Regular maintenance required to prevent bloat
- Retrospective analysis must categorize learnings appropriately

## ADR-009: Semantic Analysis Engine Enhancement

**Date**: 2025-12-29  
**Status**: Accepted  
**Context**: Need sophisticated skill activation with confidence scoring, context awareness, and learning capabilities  

**Decision**: Implement multi-dimensional semantic analysis engine with four-tier confidence scoring and context-aware adjustments  

**Rationale**:
- **Tier 1-4 Confidence Scoring**: Provides nuanced activation decisions from exact matches (95-100%) to contextual inference (50-69%)
- **Context-Aware Adjustments**: Sequential workflow progression, error-driven activation, and urgency detection improve user experience
- **Learning Loop**: User correction tracking and pattern adaptation enables continuous improvement
- **Precedence Rules**: Clear hierarchy (explicit commands > errors > workflow > intent > default) prevents activation conflicts
- **Multi-Intent Handling**: Complex requests with multiple skills are properly sequenced and prioritized

**Consequences**:
- Enhanced user experience with more accurate skill activation
- Reduced cognitive load through intelligent workflow progression
- Improved system learning through correction tracking and pattern recognition
- More sophisticated context management and session state tracking
- Comprehensive test coverage ensures reliability and consistency

**Implementation**:
- **SemanticAnalysisEngine**: Core analysis with confidence scoring and context awareness
- **Interactive Demo Tool**: CLI testing interface for validation and demonstration
- **Comprehensive Test Suite**: Property-based testing with edge case coverage
- **Integration**: Enhanced compound-engineering skill with programmatic API

## ADR-010: Cross-Reference Validation Implementation

**Date**: 2025-12-29  
**Status**: Accepted  
**Context**: Need automated validation of all documentation links and file references to ensure accuracy and prevent broken references  

**Decision**: Implement comprehensive cross-reference validation system with automated detection and fix suggestions  

**Rationale**:
- **Comprehensive Coverage**: Validates markdown links, file references, directory references, script references, and relative paths
- **Automated Detection**: Identifies broken links, missing files, and invalid npm script references
- **Fix Suggestions**: Provides actionable guidance for resolving each type of reference error
- **Integration**: Seamlessly integrates with existing validation workflow and CI/CD pipelines
- **Categorization**: Distinguishes between critical errors and template/example references

**Consequences**:
- Improved documentation accuracy and reliability
- Reduced maintenance overhead through automated detection
- Better user experience with accurate cross-references
- Enhanced development workflow with pre-commit validation
- Systematic approach to documentation quality assurance

**Implementation**:
- **CrossReferenceValidator**: Core validation engine with pattern matching and path resolution
- **Comprehensive Test Suite**: Property-based testing with edge case coverage
- **Integration Scripts**: npm scripts and CI/CD integration for automated validation
- **Documentation Guide**: Maintenance guide with best practices and troubleshooting

## ADR-011: Documentation Consistency Implementation

**Date**: 2025-12-29  
**Status**: Accepted  
**Context**: Need to address documentation accuracy, consistency, and duplication issues identified in comprehensive audit  

**Decision**: Implement systematic documentation consistency improvements with standardized naming, consolidated platform instructions, and complete file structure  

**Rationale**:
- **Naming Standardization**: Use "EARS-Workflow" for titles/headers and "ears-workflow" for technical references to eliminate user confusion
- **Platform Consolidation**: Create single authoritative sections for Windows-specific requirements (WSL/Git Bash) to reduce maintenance overhead
- **Complete File Structure**: Create all referenced workflow, role, and protocol files to eliminate broken references
- **Attribution Cleanup**: Remove inconsistent attribution while maintaining clear licensing to eliminate confusion
- **Template Clarity**: Clearly distinguish between example/template references and actual file references

**Consequences**:
- Improved user experience through consistent terminology and clear platform requirements
- Reduced maintenance overhead through consolidated documentation structure
- Enhanced system completeness with all referenced files properly implemented
- Better navigation and discoverability through complete file structure
- Clearer licensing and attribution information

**Implementation**:
- **Naming Convention**: Standardized "EARS-Workflow" vs "ears-workflow" usage across all files
- **Platform Requirements**: Consolidated Windows requirements with WSL/Git Bash instructions
- **Missing Files**: Created `.ai/workflows/`, `.ai/roles/`, and `.ai/protocols/` directories with complete implementations
- **Attribution**: Removed inconsistent author fields while maintaining MIT license and original attribution
- **Cross-References**: Fixed broken links and clearly marked template references

---

*This file documents strategic architectural decisions that shape the system design. Each decision includes full context and rationale to support future evolution and maintenance.*