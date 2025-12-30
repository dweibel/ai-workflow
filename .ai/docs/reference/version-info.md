# Version Information Reference

> **Single source of truth for all version information**

## Current Version

**Package Version**: `1.0.0`
**Release Date**: `2025-12-29`
**Stability**: `Stable`

## Version Components

### Package Version (package.json)
- **Version**: `1.0.0`
- **Name**: `ears-workflow-skill`
- **Description**: `EARS-workflow skill package for structured development methodology`

### Main Skill Version (.ai/SKILL.md)
- **Skill Name**: `ears-workflow`
- **Version**: `1.0.0`
- **Author**: `Compound Engineering System`

### Individual Skill Versions
All individual skills use version `1.0.0` for consistency:
- `compound-engineering`: `1.0.0`
- `ears-specification`: `1.0.0`
- `git-workflow`: `1.0.0`
- `testing-framework`: `1.0.0`

## Version History

### v1.0.0 (2025-12-29)
- Initial stable release
- Complete EARS-workflow implementation
- Cross-platform compatibility
- Agent Skills Standard compliance
- Backward compatibility with AGENTS.md

## Versioning Strategy

### Semantic Versioning (SemVer)
- **MAJOR.MINOR.PATCH** format
- **MAJOR**: Breaking changes to skill interface
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, backward compatible

### Version Synchronization
- All skill versions stay synchronized
- Package version drives individual skill versions
- Release notes document all changes

### Update Process
1. Update `package.json` version
2. Update `.ai/SKILL.md` version
3. Update all individual skill versions
4. Update this reference document
5. Tag release in version control

## Compatibility Matrix

### Agent Skills Standard
- **Standard Version**: `1.0`
- **Compliance Level**: `Full`

### IDE Compatibility
- **VS Code**: `1.85+` (with GitHub Copilot)
- **Cursor**: `0.40+`
- **JetBrains**: `2023.3+` (with AI Assistant)

### Platform Compatibility
- **Node.js**: `16.0+`
- **Git**: `2.20+`
- **Windows**: `10+` (with WSL or Git Bash)
- **macOS**: `10.15+`
- **Linux**: `Ubuntu 18.04+`, `CentOS 7+`

## Attribution Versions

### Original Work
- **Compound Engineering Plugin**: `v1.0.0` by EveryInc
- **License**: MIT License
- **Repository**: https://github.com/EveryInc/compound-engineering-plugin

### This Implementation
- **EARS-Workflow Skill**: `v1.0.0`
- **License**: MIT License
- **Standard**: Agent Skills v1.0
- **Enhancements**: Progressive disclosure, multi-IDE support, cross-platform compatibility

## Release Notes Template

```markdown
## [Version] - YYYY-MM-DD

### Added
- New features and capabilities

### Changed
- Modifications to existing features

### Deprecated
- Features marked for removal

### Removed
- Removed features

### Fixed
- Bug fixes and corrections

### Security
- Security improvements
```

## Version Validation

Use the following command to verify version consistency:
```bash
node scripts/validate-versions.js
```

This validates:
- Package.json version matches skill versions
- All SKILL.md files have consistent versions
- Version format follows semantic versioning
- Release date is current