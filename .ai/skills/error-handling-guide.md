# EARS-Workflow Error Handling Guide

## Overview

This guide provides comprehensive information about error handling in the EARS-workflow skill activation system. It covers common failure scenarios, troubleshooting steps, and recovery procedures.

## Error Types and Handling

### 1. Missing Files Error (`missing-files`)

**Cause**: Required skill files or directories are not present in the installation.

**Detection**: 
- `.ai/SKILL.md` file missing
- Sub-skill `SKILL.md` files missing
- Required directories not found

**Error Message**:
```
❌ **Activation Failed: Missing Files**

The EARS-workflow skill package appears incomplete. Missing files:

- `.ai/SKILL.md`
- `.ai/skills/spec-forge/SKILL.md`
- `.ai/memory/`

**Required for activation:**
- `.ai/SKILL.md` - Main skill definition
- `.ai/skills/*/SKILL.md` - Sub-skill definitions
- `.ai/memory/` - Memory files directory

**Troubleshooting**: Verify complete package installation or reinstall the skill package.
```

**Troubleshooting Steps**:
1. Verify the `.ai` directory exists in your project root
2. Check that all required `SKILL.md` files are present
3. Ensure the skill package was completely copied/installed
4. Run installation validation to identify specific missing files

**Recovery Options**:
1. Reinstall the complete skill package
2. Copy missing files from a working installation
3. Use the installation script if available
4. Download the latest version from the repository

### 2. Invalid YAML Error (`invalid-yaml`)

**Cause**: SKILL.md files contain malformed YAML frontmatter.

**Detection**:
- YAML syntax errors (indentation, quotes, brackets)
- Missing required fields (name, description, version)
- Invalid character encoding

**Error Message**:
```
❌ **Activation Failed: Invalid Metadata**

SKILL.md file contains invalid YAML frontmatter:

**File**: `.ai/skills/spec-forge/SKILL.md`
**Error**: Missing required field: description
**Line**: 3

**Common issues:**
- Incorrect indentation (use spaces, not tabs)
- Missing required fields: name, description, version
- Unescaped special characters in values
- Missing closing quotes or brackets

**Fix**: Check YAML syntax and ensure all required fields are present.
```

**Troubleshooting Steps**:
1. Open the problematic SKILL.md file in a text editor
2. Check YAML frontmatter syntax (indentation, quotes, brackets)
3. Validate required fields: name, description, version
4. Use a YAML validator to identify syntax errors

**Recovery Options**:
1. Fix YAML syntax errors manually
2. Restore from a backup version
3. Use a template to recreate the file
4. Copy from a working skill installation

### 3. Dependency Missing Error (`dependency-missing`)

**Cause**: Required sub-skills or dependencies are not available.

**Detection**:
- Sub-skill directories missing
- Invalid sub-skill references
- Circular dependency issues

**Error Message**:
```
❌ **Activation Failed: Missing Dependencies**

Required sub-skills or dependencies are not available:

- spec-forge
- planning

**Available skills**: work, review

**Troubleshooting**: Ensure all sub-skill directories contain valid SKILL.md files.
```

**Troubleshooting Steps**:
1. Check that all sub-skill directories exist
2. Verify each sub-skill has a valid SKILL.md file
3. Review dependency declarations in skill metadata
4. Ensure no typos in skill names or references

**Recovery Options**:
1. Install missing sub-skills
2. Fix dependency declarations
3. Remove invalid references
4. Reinstall the complete skill package

### 4. Context Overflow Warning (`context-overflow`)

**Cause**: Skill activation would exceed context window limits.

**Detection**:
- Token count exceeds available context window
- Multiple skills activated simultaneously
- Large instruction sets loaded

**Error Message**:
```
⚠️ **Activation Warning: Context Limit**

The skill activation would exceed context window limits:

**Current tokens**: 8,500
**Limit**: 8,192

**Using progressive disclosure:**
- Loading minimal metadata only
- Detailed instructions will load on-demand
- Use specific sub-skill activation for focused capabilities

**Recommendation**: Activate specific sub-skills rather than the full workflow.
```

**Troubleshooting Steps**:
1. Use specific sub-skill activation instead of full workflow
2. Clear unnecessary context from previous sessions
3. Consider breaking large tasks into smaller phases
4. Use progressive disclosure by activating skills incrementally

**Recovery Options**:
1. Activate only the specific sub-skill you need
2. Use "spec-forge" for requirements and design work
3. Use "work" for implementation tasks
4. Use "review" for code auditing

### 5. Permission Denied Error (`permission-denied`)

**Cause**: Insufficient permissions to access skill files or directories.

**Detection**:
- File system access denied
- Directory read permissions missing
- Files locked by another process

**Error Message**:
```
❌ **Activation Failed: Permission Denied**

Cannot access required files or directories:

**Path**: `.ai/skills/spec-forge/SKILL.md`
**Operation**: File access

**Troubleshooting:**
- Check file/directory permissions
- Ensure you have read access to the .ai directory
- Run with appropriate user permissions
- Check if files are locked by another process
```

**Troubleshooting Steps**:
1. Check file/directory permissions
2. Ensure you have read access to the `.ai` directory
3. Run with appropriate user permissions
4. Check if files are locked by another process

**Recovery Options**:
1. Fix file permissions
2. Run as administrator/sudo if necessary
3. Close applications that might be locking files
4. Restart your development environment

### 6. Corrupted Memory Error (`corrupted-memory`)

**Cause**: Memory files contain invalid or corrupted data.

**Detection**:
- Memory files are empty or contain invalid data
- Markdown structure is corrupted
- File encoding issues

**Error Message**:
```
❌ **Activation Failed: Corrupted Memory Files**

Memory files contain invalid data:

**File**: `.ai/memory/lessons.md`
**Issue**: Invalid markdown structure

**Recovery options:**
- Restore from backup if available
- Reset memory files to templates
- Use project-reset skill to restore clean state

**Warning**: Resetting will lose accumulated lessons and decisions.
```

**Troubleshooting Steps**:
1. Check memory file contents for corruption
2. Verify file encoding (should be UTF-8)
3. Look for backup versions
4. Consider using project-reset skill

**Recovery Options**:
1. Restore memory files from backup
2. Reset to template versions (loses history)
3. Use project-reset skill with memory option
4. Manually recreate memory files

### 7. Circular Dependency Error (`circular-dependency`)

**Cause**: Sub-skills have circular dependency references.

**Detection**:
- Skill A depends on Skill B, which depends on Skill A
- Complex dependency chains with cycles

**Error Message**:
```
❌ **Activation Failed: Circular Dependencies**

Circular dependencies detected in sub-skills:

- spec-forge → planning → spec-forge
- work → review → work

**Fix**: Remove circular references in sub-skill dependencies.
```

**Troubleshooting Steps**:
1. Review sub-skill dependency declarations
2. Map out dependency relationships
3. Identify circular references
4. Restructure dependencies to be acyclic

**Recovery Options**:
1. Remove circular dependency declarations
2. Restructure skill relationships
3. Use composition instead of inheritance
4. Consult architecture documentation

### 8. Version Mismatch Error (`version-mismatch`)

**Cause**: Incompatible skill versions detected.

**Detection**:
- Main skill version incompatible with sub-skills
- API version mismatches
- Breaking changes between versions

**Error Message**:
```
❌ **Activation Failed: Version Mismatch**

Incompatible skill versions detected:

**Expected**: 1.0.0
**Found**: 0.9.5
**Skill**: spec-forge

**Fix**: Update all skills to compatible versions.
```

**Troubleshooting Steps**:
1. Check version compatibility matrix
2. Identify which skills need updates
3. Review breaking changes documentation
4. Plan migration strategy if needed

**Recovery Options**:
1. Update all skills to latest compatible versions
2. Downgrade main skill to match sub-skill versions
3. Use version-specific compatibility mode
4. Migrate to new API if breaking changes exist

## Error Prevention

### Installation Validation

Always validate installation before first use:

```javascript
const router = new SkillActivationRouter();
const validation = router.validateInstallation();

if (!validation.valid) {
    console.error('Installation issues detected:', validation.errors);
    // Handle errors before proceeding
}
```

### Proactive Monitoring

Monitor for common issues:

1. **File System Changes**: Watch for missing or modified files
2. **Permission Changes**: Monitor access permissions
3. **Memory File Growth**: Check memory file sizes and corruption
4. **Version Updates**: Track skill version compatibility

### Best Practices

1. **Complete Installation**: Always install the complete skill package
2. **Regular Validation**: Periodically validate installation integrity
3. **Backup Memory Files**: Keep backups of lessons and decisions
4. **Version Tracking**: Maintain version compatibility records
5. **Error Logging**: Log activation errors for debugging

## Recovery Procedures

### Quick Recovery Checklist

1. **Validate Installation**: Run installation validation
2. **Check File Permissions**: Ensure proper access rights
3. **Verify YAML Syntax**: Validate all SKILL.md files
4. **Clear Context**: Reset any accumulated context
5. **Restart Environment**: Restart IDE or development environment

### Complete Recovery Process

1. **Backup Current State**: Save any working configurations
2. **Run Full Validation**: Identify all issues comprehensively
3. **Fix Critical Issues**: Address missing files and permissions first
4. **Validate YAML**: Fix all metadata syntax errors
5. **Test Activation**: Verify skills activate correctly
6. **Restore Memory**: Restore or recreate memory files if needed

### Emergency Recovery

If all else fails:

1. **Complete Reinstall**: Remove and reinstall the entire skill package
2. **Reset to Defaults**: Use project-reset skill to restore clean state
3. **Manual Recreation**: Manually recreate critical files from templates
4. **Seek Support**: Contact community or support channels

## Integration with IDEs

### VS Code Copilot

Error handling integrates with VS Code's error reporting:
- Errors appear in the Problems panel
- Hover tooltips show troubleshooting steps
- Quick fixes suggest recovery options

### Cursor

Error messages integrate with Cursor's Agent-Decided rules:
- Errors trigger rule evaluation
- Automatic recovery attempts when possible
- Context preservation during error recovery

### JetBrains IDEs

Via MCP server integration:
- Errors reported through MCP protocol
- IDE-specific error handling and recovery
- Integration with IDE's error reporting system

## Testing Error Handling

### Unit Tests

Test individual error scenarios:
- Missing file detection
- YAML validation
- Permission checking
- Memory file validation

### Integration Tests

Test complete error handling flow:
- End-to-end error detection
- Recovery procedure execution
- User experience during errors
- Cross-IDE compatibility

### Property-Based Tests

Test error handling across input variations:
- Random file system states
- Various permission configurations
- Different YAML corruption patterns
- Multiple concurrent error conditions

This comprehensive error handling system ensures that users receive clear, actionable guidance when activation issues occur, enabling quick resolution and minimal disruption to their development workflow.