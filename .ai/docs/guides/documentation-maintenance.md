# Documentation Maintenance Guide

> **Comprehensive guide for maintaining accurate and consistent documentation**

This guide provides best practices and tools for maintaining the EARS-workflow documentation system, ensuring all cross-references remain accurate and up-to-date.

## Cross-Reference Validation System

The EARS-workflow package includes automated cross-reference validation to ensure all links and file references in documentation are accurate.

### Validation Coverage

The system validates:
- **Markdown Links**: `[text](path)` and `[text](path#anchor)`
- **File References**: `` `path/to/file.ext` ``
- **Directory References**: `` `.ai/path/to/dir/` ``
- **Script References**: `npm run script-name`
- **Relative Paths**: `` `./path` `` and `` `../path` ``
- **Anchor Links**: `#section-name` within documents

### Running Validation

#### Manual Validation
```bash
# Validate all cross-references
npm run validate:cross-references

# Run cross-reference tests
npm run test:cross-references

# Comprehensive validation (includes cross-references)
npm run validate:all
```

#### Automated Validation
Cross-reference validation is automatically included in:
- **Pre-pack validation**: `npm run prepack`
- **Final package validation**: `npm run validate`
- **CI/CD pipelines**: Integrated with existing validation workflow

### Validation Output

#### Success Example
```
🔗 CROSS-REFERENCE VALIDATION REPORT
================================================================================
✅ All cross-references are valid!
📄 Validated 25 documentation files
🔗 All links and file references are accurate

📊 VALIDATION SUMMARY:
   Files checked: 25
   Errors: 0
   Warnings: 0

🎉 All documentation cross-references are accurate and up-to-date!
```

#### Error Example
```
🔗 CROSS-REFERENCE VALIDATION REPORT
================================================================================
❌ Cross-reference validation failed!
🚨 3 error(s) found

🔴 ERRORS:
  1. README.md: Broken link "Installation Guide" → missing-guide.md (resolved: /project/missing-guide.md)
  2. USAGE.md: Missing file reference "scripts/missing-script.js" (resolved: /project/scripts/missing-script.js)
  3. .ai/skills/README.md: Missing npm script "non-existent-script"

💡 FIX SUGGESTIONS:
1. README.md: Broken link "Installation Guide" → missing-guide.md
   💡 Check if the target file exists or update the link path

2. USAGE.md: Missing file reference "scripts/missing-script.js"
   💡 Verify the file path is correct or create the missing file

3. .ai/skills/README.md: Missing npm script "non-existent-script"
   💡 Add the script to package.json or update the documentation
```

## Documentation Best Practices

### Link Management

#### Use Relative Paths
```markdown
✅ Good: [Installation Guide](INSTALL.md)
✅ Good: [File Structure](.ai/docs/reference/file-structure.md)
❌ Avoid: [Guide](/absolute/path/to/file.md)
```

#### Consistent Reference Format
```markdown
✅ Good: See `package.json` for dependencies
✅ Good: Check `.ai/skills/README.md` for skills catalog
❌ Avoid: See package.json (without backticks)
```

#### Anchor Link Format
```markdown
✅ Good: [Installation Section](#installation)
✅ Good: [Advanced Usage](USAGE.md#advanced-usage)
❌ Avoid: [Section](#Installation) (case mismatch)
```

### File Reference Standards

#### Script References
```markdown
✅ Good: Run `npm run test` to execute tests
✅ Good: Use `npm run validate:all` for comprehensive validation
❌ Avoid: Run npm run non-existent-script
```

#### Directory References
```markdown
✅ Good: Files are located in `.ai/skills/` directory
✅ Good: Check `.ai/memory/` for compound learning files
❌ Avoid: Files are in .ai/missing-directory/
```

#### Code File References
```markdown
✅ Good: See `scripts/validate-versions.js` for implementation
✅ Good: Check `.ai/skills/compound-engineering/SKILL.md`
❌ Avoid: See scripts/missing-file.js
```

## Maintenance Workflows

### Regular Maintenance Tasks

#### Weekly Checks
```bash
# Validate all cross-references
npm run validate:cross-references

# Check for broken links
npm run test:cross-references

# Verify package completeness
npm run validate
```

#### Before Releases
```bash
# Comprehensive validation
npm run validate:all

# Version consistency check
npm run validate:versions

# Skills validation
npm run validate:skills
```

#### After File Restructuring
```bash
# Update all affected references
npm run validate:cross-references

# Fix any broken links identified
# Re-run validation to confirm fixes
npm run validate:cross-references
```

### Common Maintenance Scenarios

#### Moving Files
When moving files, update all references:

1. **Identify affected files**:
   ```bash
   # Search for references to the moved file
   grep -r "old-filename.md" .
   ```

2. **Update references**:
   ```bash
   # Update all markdown links
   sed -i 's/old-path\/old-filename.md/new-path\/new-filename.md/g' *.md
   ```

3. **Validate changes**:
   ```bash
   npm run validate:cross-references
   ```

#### Adding New Files
When adding new documentation files:

1. **Create the file** with proper frontmatter and structure
2. **Add cross-references** from relevant existing files
3. **Validate integration**:
   ```bash
   npm run validate:cross-references
   ```

#### Updating Scripts
When modifying package.json scripts:

1. **Update script definitions** in package.json
2. **Update documentation references** to scripts
3. **Validate script references**:
   ```bash
   npm run validate:cross-references
   ```

### Automated Fixes

#### Link Update Script
```bash
#!/bin/bash
# update-links.sh - Update links after file moves

OLD_PATH="$1"
NEW_PATH="$2"

if [ -z "$OLD_PATH" ] || [ -z "$NEW_PATH" ]; then
    echo "Usage: $0 <old-path> <new-path>"
    exit 1
fi

# Update markdown links
find . -name "*.md" -exec sed -i "s|$OLD_PATH|$NEW_PATH|g" {} +

# Validate changes
npm run validate:cross-references
```

#### Reference Cleanup
```bash
#!/bin/bash
# cleanup-references.sh - Remove references to deleted files

DELETED_FILE="$1"

if [ -z "$DELETED_FILE" ]; then
    echo "Usage: $0 <deleted-file-path>"
    exit 1
fi

# Find and report references to deleted file
echo "References to deleted file $DELETED_FILE:"
grep -r "$DELETED_FILE" . --include="*.md"

echo "Please manually update or remove these references"
```

## Integration with Development Workflow

### Git Hooks

#### Pre-commit Hook
```bash
#!/bin/sh
# .git/hooks/pre-commit

# Validate cross-references before commit
npm run validate:cross-references

if [ $? -ne 0 ]; then
    echo "Cross-reference validation failed. Please fix broken links before committing."
    exit 1
fi
```

#### Pre-push Hook
```bash
#!/bin/sh
# .git/hooks/pre-push

# Comprehensive validation before push
npm run validate:all

if [ $? -ne 0 ]; then
    echo "Package validation failed. Please fix issues before pushing."
    exit 1
fi
```

### CI/CD Integration

#### GitHub Actions Example
```yaml
name: Documentation Validation
on: [push, pull_request]

jobs:
  validate-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm run validate:cross-references
      - run: npm run validate:all
```

## Troubleshooting

### Common Issues

#### False Positives
**Problem**: Validation reports errors for valid references
**Solutions**:
- Check file permissions and readability
- Verify path case sensitivity (especially on Linux/macOS)
- Ensure files exist and are not empty
- Check for hidden characters in file names

#### Anchor Link Issues
**Problem**: Valid anchors reported as missing
**Solutions**:
- Verify anchor format matches header text
- Check for special characters in headers
- Ensure consistent case handling
- Use simple anchor names without special characters

#### Script Reference Issues
**Problem**: Valid npm scripts reported as missing
**Solutions**:
- Verify package.json is valid JSON
- Check script name spelling and case
- Ensure package.json is readable
- Validate script definitions exist

### Debugging Tools

#### Verbose Validation
```bash
# Run with detailed output
DEBUG=1 npm run validate:cross-references
```

#### Manual Link Checking
```bash
# Check specific file references
node -e "
const validator = require('./scripts/validate-cross-references');
const result = new validator.CrossReferenceValidator();
result.validateFile('README.md').then(() => {
  console.log('Errors:', result.errors);
  console.log('Warnings:', result.warnings);
});
"
```

#### Reference Analysis
```bash
# Analyze all references in a file
grep -o '\[.*\](.*\.md)' README.md | sort | uniq
```

## Best Practices Summary

### Documentation Creation
1. **Always use relative paths** for internal references
2. **Validate references** before committing changes
3. **Use consistent formatting** for file and script references
4. **Include anchor links** for long documents
5. **Test all links** after major restructuring

### Maintenance Schedule
1. **Weekly**: Run cross-reference validation
2. **Before releases**: Comprehensive validation suite
3. **After restructuring**: Update and validate all affected references
4. **Monthly**: Review and clean up outdated references

### Quality Assurance
1. **Automated validation** in CI/CD pipelines
2. **Pre-commit hooks** for immediate feedback
3. **Regular audits** of documentation structure
4. **Team training** on documentation standards

---

This maintenance guide ensures the EARS-workflow documentation remains accurate, consistent, and reliable through systematic validation and maintenance practices.