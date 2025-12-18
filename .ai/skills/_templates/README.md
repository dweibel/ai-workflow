# Skill Development Templates

This directory contains templates for developing new skills in the Compound Engineering system.

## Overview

The template system provides a standardized structure for creating new skills that follow the Compound Engineering principles and integrate seamlessly with the existing workflow.

## Using the Templates

### Quick Start

1. **Copy the template:**
   ```bash
   cp -r .ai/skills/_templates/skill-template .ai/skills/my-new-skill
   ```

2. **Customize the files:**
   - Update `README.md` with skill description and capabilities
   - Implement functionality in `skill.ps1` and `skill.sh`
   - Add usage examples to `examples.md`

3. **Update master catalog:**
   - Add your skill to `.ai/skills/README.md`
   - Update the capabilities matrix
   - Document integration points

### Template Structure

```
skill-template/
├── README.md           # Comprehensive skill documentation template
├── skill.sh            # Bash implementation template (all platforms)
└── examples.md         # Usage examples and patterns template
```

## Skill Development Guidelines

### Required Components

Every skill must include:

**Cross-Platform Support:**
- Bash implementation for all platforms
- WSL support for Windows users
- Consistent interface and behavior

**Documentation:**
- Comprehensive README with capabilities and usage
- Examples document with common patterns
- Integration points with other skills

**Quality Features:**
- Input validation and error handling
- Colored output for better UX
- Confirmation prompts for destructive actions
- Help text and usage information

### Naming Conventions

**Skill Names:**
- Use kebab-case: `git-worktree`, `project-reset`, `test-runner`
- Be descriptive and specific
- Avoid generic names like `utility` or `helper`

**File Names:**
- Bash: `skill-name.sh`
- Documentation: `README.md`, `examples.md`

**Directory Structure:**
```
.ai/skills/skill-name/
├── README.md
├── skill-name.sh
└── examples.md
```

### Interface Patterns

**Bash Pattern:**
```bash
#!/bin/bash
# Usage: ./skill-name.sh <action> [parameter1] [parameter2] [--confirm]

ACTION="$1"
PARAMETER1="$2"
PARAMETER2="$3"
CONFIRM=false

# Parse flags
while [[ $# -gt 0 ]]; do
    case $1 in
        --confirm) CONFIRM=true; shift ;;
        *) shift ;;
    esac
done
```

### Output Standards

**Color Functions:**
```bash
# Bash (all platforms)
print_success() { echo -e "\033[32m✅ $1\033[0m"; }
print_error() { echo -e "\033[31m❌ $1\033[0m"; }
print_info() { echo -e "\033[36mℹ️  $1\033[0m"; }
print_warning() { echo -e "\033[33m⚠️  $1\033[0m"; }
```

**Consistent Icons:**
- ✅ Success/completion
- ❌ Error/failure
- ℹ️ Information/status
- ⚠️ Warning/caution
- 🔧 Configuration/setup
- 📁 Directory/folder
- 🌿 Git branch
- 📝 Commit/file

## Skill Categories

### Development Workflow Skills
**Purpose:** Support the development process
**Examples:** git-worktree, test-runner, code-quality
**Integration:** Phase II (WORK) workflows

### Project Management Skills
**Purpose:** Manage project lifecycle and documentation
**Examples:** project-reset, documentation, planning
**Integration:** Phase I (PLAN) and Phase III (REVIEW) workflows

### Operations Skills
**Purpose:** Deployment, monitoring, and maintenance
**Examples:** deployment, database, monitoring
**Integration:** Production workflows and CI/CD

### Integration Skills
**Purpose:** Connect with external systems and APIs
**Examples:** api-client, notification, reporting
**Integration:** Cross-cutting concerns

## Testing Guidelines

### Manual Testing Checklist

**Cross-Platform Testing:**
- [ ] Test on Windows with WSL
- [ ] Test on Unix/Linux with Bash
- [ ] Test on macOS with Bash
- [ ] Verify consistent behavior across platforms

**Error Handling:**
- [ ] Test with invalid parameters
- [ ] Test with missing dependencies
- [ ] Test with permission issues
- [ ] Verify graceful error messages

**Integration Testing:**
- [ ] Test with other skills
- [ ] Test in different git states
- [ ] Test with various project structures
- [ ] Verify workflow integration

### Automated Testing

**Example test structure:**
```bash
#!/bin/bash
# test-skill-name.sh

echo "Testing skill-name functionality..."

# Setup test environment
setup_test() {
    # Create test conditions
}

# Test basic functionality
test_basic() {
    # Test core features
}

# Test error conditions
test_errors() {
    # Test error handling
}

# Cleanup
cleanup_test() {
    # Clean up test artifacts
}

# Run tests
setup_test
test_basic
test_errors
cleanup_test

echo "All tests completed"
```

## Integration Requirements

### Compound Engineering Integration

**Memory System:**
- Document lessons learned in skill usage
- Record architectural decisions for skill patterns
- Update templates based on experience

**Workflow Integration:**
- Specify which phase(s) the skill supports
- Document integration points with existing workflows
- Provide clear usage guidance in workflow context

**AGENTS.md Updates:**
- Add skill to Section 3 (Skills & Automation)
- Update capabilities matrix
- Document any new patterns or conventions

### Documentation Requirements

**README.md Must Include:**
- Overview and purpose
- Capabilities table
- Platform support information
- Usage examples for both platforms
- Parameter documentation
- Integration points
- Error handling information
- Troubleshooting guide

**examples.md Must Include:**
- Basic workflow examples
- Advanced usage patterns
- Integration with other skills
- Common scenarios and solutions
- Error recovery examples

## Quality Standards

### Code Quality

**Bash Standards:**
- Use `set -e` for error handling
- Validate all inputs
- Use meaningful variable names
- Include usage information
- Follow POSIX compatibility where possible

### Documentation Quality

**Clarity:**
- Write for developers of all skill levels
- Use clear, concise language
- Provide context for decisions
- Include relevant examples

**Completeness:**
- Cover all features and parameters
- Document error conditions
- Explain integration points
- Provide troubleshooting guidance

**Consistency:**
- Follow established patterns
- Use consistent terminology
- Match existing documentation style
- Maintain cross-references

## Maintenance Guidelines

### Version Management

**Semantic Versioning:**
- Major: Breaking changes to interface
- Minor: New features, backward compatible
- Patch: Bug fixes, no interface changes

**Change Documentation:**
- Update README.md with new features
- Add examples for new functionality
- Document breaking changes clearly
- Update integration points as needed

### Deprecation Process

**When deprecating features:**
1. Mark as deprecated in documentation
2. Provide migration path
3. Set removal timeline
4. Update dependent skills
5. Remove after grace period

## Future Enhancements

### Planned Template Improvements

**Advanced Templates:**
- Database integration template
- API client template
- Testing framework template
- CI/CD integration template

**Tooling:**
- Skill generator script
- Validation tools
- Testing framework
- Documentation generator

### Template Evolution

The template system evolves based on:
- Experience with new skill development
- Feedback from skill usage
- Changes in Compound Engineering patterns
- New platform requirements

---

**Version:** 1.0.0  
**Last Updated:** 2025-12-18  
**Template Count:** 1 (skill-template)  
**Supported Platforms:** All (Bash via WSL on Windows)