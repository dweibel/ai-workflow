# Changelog

All notable changes to the EARS-Workflow skill package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-29

### Added
- **Complete EARS-Workflow skill package** with Agent Skills Standard compliance
- **Main SKILL.md** with semantic routing and progressive disclosure
- **Six specialized sub-skills**:
  - `spec-forge`: EARS requirements creation and correctness properties
  - `planning`: Implementation planning and architectural decisions
  - `work`: TDD implementation with git worktree management
  - `review`: Multi-perspective code audits
  - `git-worktree`: Isolated development environment management
  - `project-reset`: Template-based project state management
- **Intelligent activation system** with semantic trigger detection
- **Progressive disclosure architecture** for efficient context management
- **Cross-platform compatibility** (Windows/WSL, macOS, Linux)
- **IDE integration support** for VS Code, Cursor, JetBrains IDEs
- **Comprehensive documentation**:
  - Installation guide with IDE-specific setup
  - Usage guide with workflow examples
  - Troubleshooting documentation
  - API reference for all sub-skills
- **Property-based testing integration** with fast-check library
- **Compound engineering memory system** with lessons and decisions
- **Git worktree automation** with safety checks and cleanup
- **Template-based project reset** with automatic archiving
- **Backward compatibility** with existing AGENTS.md systems
- **Complete test suite** with 90%+ coverage requirements

### Features
- **Phase sequence enforcement**: SPEC-FORGE → PLAN → WORK → REVIEW
- **Atomic commit workflow** with conventional commit format
- **Multi-persona code review** (Security, Performance, Style, Data Integrity)
- **EARS-compliant requirements** with INCOSE quality validation
- **Correctness properties generation** for property-based testing
- **Memory file management** with automatic consolidation
- **Cross-IDE skill transpilation** via CLI tools
- **MCP server compatibility** for advanced IDE integration
- **Automated worktree cleanup** and branch management
- **Project isolation** with independent memory per project

### Technical Details
- **Agent Skills Standard v1.0** compliance
- **YAML frontmatter** with semantic descriptions for routing
- **JavaScript/Node.js** automation scripts with cross-platform support
- **Bash scripts** for git operations (WSL/Git Bash on Windows)
- **Jest + fast-check** testing framework integration
- **Progressive context loading** to optimize token usage
- **Semantic activation routing** with confidence scoring
- **Error handling** with specific troubleshooting guidance

### Documentation
- Complete installation guide for all supported IDEs
- Comprehensive usage guide with workflow examples
- API reference for all sub-skills and utilities
- Troubleshooting guide with common issues and solutions
- Migration guide from AGENTS.md to skill package
- Examples and best practices for team adoption

### Attribution
- Based on [Compound Engineering Plugin](https://github.com/EveryInc/compound-engineering-plugin) by EveryInc
- Adapted for Agent Skills Standard compliance
- Extended with progressive disclosure and multi-IDE support
- MIT License maintained from original work

## [Unreleased]

### Planned Features
- **MCP server implementation** for native JetBrains integration
- **CLI package manager integration** with gitgud-skills
- **Team collaboration features** with shared memory synchronization
- **Advanced property generators** for domain-specific testing
- **IDE extension packages** for enhanced integration
- **Automated skill updates** with version management
- **Custom workflow templates** for different project types
- **Integration with CI/CD pipelines** for automated quality gates

### Known Issues
- Windows bash script execution requires WSL or Git Bash
- Large memory files may impact context window performance
- Some IDEs require manual skill discovery refresh
- Property-based test generators need domain-specific tuning

### Migration Notes
- Existing AGENTS.md systems are fully backward compatible
- Memory files are preserved during skill package installation
- Git worktree scripts maintain existing functionality
- All existing templates and workflows continue to work unchanged

---

## Version History

- **v1.0.0** (2025-12-29): Initial release with complete Agent Skills compliance
- **v0.9.x** (Development): Pre-release versions during refactoring
- **Legacy** (Pre-2025): Original AGENTS.md system by EveryInc

## Support

For issues, questions, or contributions:
- Check the troubleshooting guide: `.ai/docs/guides/installation.md`
- Review usage examples: `.ai/docs/guides/usage.md`
- Consult memory files: `.ai/memory/lessons.md` and `.ai/memory/decisions.md`
- Create issues in the project repository
- Join community discussions for team adoption guidance