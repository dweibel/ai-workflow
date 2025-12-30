# Troubleshooting Guide

> **Comprehensive troubleshooting for EARS-workflow skill package**

## Quick Diagnostics

### Run Validation Suite
```bash
# Check package completeness
node .ai/tests/package-completeness-validation.test.js

# Validate version consistency
node scripts/validate-versions.js

# Run full validation
node .ai/tests/final-package-validation.test.js
```

### Check Installation
```bash
# Verify required files exist
ls -la .ai/SKILL.md
ls -la .ai/skills/*/SKILL.md
ls -la .ai/memory/*.md

# Check file permissions (Unix/Linux/macOS)
find .ai -name "*.sh" -exec ls -la {} \;
```

## Common Issues

### 1. Skill Not Discovered

**Symptoms:**
- IDE doesn't recognize EARS-workflow skill
- No response to activation triggers
- Skill not listed in IDE skill discovery

**Diagnosis:**
```bash
# Check main skill file
cat .ai/SKILL.md | head -10

# Verify YAML frontmatter
node -e "
const fs = require('fs');
const content = fs.readFileSync('.ai/SKILL.md', 'utf8');
console.log('YAML frontmatter valid:', content.startsWith('---'));
"
```

**Solutions:**
1. **Check file permissions:**
   ```bash
   chmod 644 .ai/SKILL.md
   chmod -R 644 .ai/skills/*/SKILL.md
   ```

2. **Verify YAML frontmatter:**
   - Must start with `---`
   - Must include `name:`, `description:`, `version:`
   - Must end with `---`

3. **Restart IDE:**
   - VS Code: Restart completely
   - Cursor: Reload window
   - JetBrains: Invalidate caches and restart

4. **Check IDE version:**
   - VS Code: Requires 1.85+ with GitHub Copilot
   - Cursor: Requires 0.40+
   - JetBrains: Requires 2023.3+ with AI Assistant

### 2. Activation Fails

**Symptoms:**
- Skill discovered but doesn't activate
- Wrong skill activates
- No response to trigger phrases

**Diagnosis:**
```bash
# Check activation triggers reference
cat .ai/docs/reference/activation-triggers.md

# Verify skill metadata
node scripts/validate-versions.js
```

**Solutions:**
1. **Use exact trigger phrases:**
   ```
   ✅ "use EARS workflow"
   ✅ "use ears specification"
   ❌ "use ears-workflow"
   ❌ "activate EARS"
   ```

2. **Check context window:**
   - Ensure sufficient context space available
   - Try in new conversation/session

3. **Verify all required files:**
   ```bash
   node .ai/tests/package-completeness-validation.test.js
   ```

4. **Check IDE Agent Skills support:**
   - Enable Agent Skills in IDE settings
   - Update IDE to latest version

### 3. Scripts Don't Execute

**Symptoms:**
- Git worktree commands fail
- Permission denied errors
- Script not found errors

**Diagnosis:**
```bash
# Check script existence
ls -la .ai/skills/git-workflow/scripts/git-worktree.sh

# Check permissions
stat .ai/skills/git-workflow/scripts/git-worktree.sh

# Test script syntax
bash -n .ai/skills/git-workflow/scripts/git-worktree.sh
```

**Solutions:**

#### Windows Users:
1. **Install WSL (Recommended):**
   ```powershell
   wsl --install
   # Then use: wsl bash .ai/skills/git-workflow/scripts/git-worktree.sh
   ```

2. **Use Git Bash:**
   ```bash
   "C:\Program Files\Git\bin\bash.exe" .ai/skills/git-workflow/scripts/git-worktree.sh
   ```

3. **Check line endings:**
   ```bash
   git config --global core.autocrlf true
   ```

#### Unix/Linux/macOS Users:
1. **Set executable permissions:**
   ```bash
   chmod +x .ai/skills/git-workflow/scripts/git-worktree.sh
   chmod +x .ai/skills/testing-framework/scripts/run-validation-suite.js
   ```

2. **Check Git version:**
   ```bash
   git --version  # Need 2.20+ for worktree support
   ```

3. **Verify bash availability:**
   ```bash
   which bash
   bash --version
   ```

### 4. Memory Files Not Loading

**Symptoms:**
- Compound engineering memory not accessible
- No lessons learned from past sessions
- Missing architectural context

**Diagnosis:**
```bash
# Check memory files exist
ls -la .ai/memory/

# Check file content
wc -l .ai/memory/lessons.md .ai/memory/decisions.md

# Check file permissions
stat .ai/memory/lessons.md
```

**Solutions:**
1. **Initialize missing files:**
   ```bash
   touch .ai/memory/lessons.md .ai/memory/decisions.md
   chmod 644 .ai/memory/*.md
   ```

2. **Verify file format:**
   - Must be valid Markdown
   - Should contain headers (`#`)
   - Should have reasonable content length

3. **Check file encoding:**
   ```bash
   file .ai/memory/lessons.md
   # Should show: UTF-8 Unicode text
   ```

### 5. Version Inconsistencies

**Symptoms:**
- Different version numbers in different files
- Validation failures
- Inconsistent behavior

**Diagnosis:**
```bash
# Run version validation
node scripts/validate-versions.js

# Check package.json version
node -e "console.log(require('./package.json').version)"

# Check skill versions
grep -r "version:" .ai/skills/*/SKILL.md
```

**Solutions:**
1. **Synchronize versions:**
   ```bash
   # Update all skill versions to match package.json
   PACKAGE_VERSION=$(node -e "console.log(require('./package.json').version)")
   
   # Update each skill file (manual process)
   # Edit .ai/SKILL.md, .ai/skills/*/SKILL.md
   ```

2. **Update version reference:**
   ```bash
   # Edit .ai/docs/reference/version-info.md
   # Ensure all version references match package.json
   ```

3. **Validate consistency:**
   ```bash
   node scripts/validate-versions.js
   ```

### 6. Cross-Platform Issues

**Symptoms:**
- Works on one platform but not another
- Path-related errors
- Line ending issues

**Diagnosis:**
```bash
# Check line endings
file .ai/SKILL.md

# Check path separators in scripts
grep -n "/" .ai/skills/*/scripts/*

# Check platform-specific code
grep -r "win32\|darwin\|linux" .ai/
```

**Solutions:**

#### Line Endings:
```bash
# Convert to Unix line endings
dos2unix .ai/SKILL.md
dos2unix .ai/skills/*/SKILL.md

# Or configure Git
git config --global core.autocrlf input
```

#### Path Issues:
```bash
# Use forward slashes in all documentation
# Use path.join() in JavaScript code
# Use POSIX paths in bash scripts
```

#### Platform Detection:
```javascript
// In Node.js scripts
const isWindows = process.platform === 'win32';
const isMacOS = process.platform === 'darwin';
const isLinux = process.platform === 'linux';
```

## Advanced Diagnostics

### Debug Mode
```bash
# Enable verbose output
export DEBUG=ears-workflow:*

# Run with debug information
node .ai/tests/package-completeness-validation.test.js --verbose
```

### IDE-Specific Debugging

#### VS Code
1. Open Developer Tools: `Help > Toggle Developer Tools`
2. Check Console for errors
3. Look for Agent Skills related messages
4. Check Output panel for Copilot logs

#### Cursor
1. Open Developer Tools: `View > Toggle Developer Tools`
2. Check Console for Agent-Decided rules errors
3. Verify Agent-Decided rules configuration
4. Check for skill loading messages

#### JetBrains
1. Check IDE logs: `Help > Show Log in Explorer`
2. Look for AI Assistant plugin errors
3. Verify MCP server connections
4. Check custom skills configuration

### Network and Connectivity
```bash
# Test internet connectivity (for IDE updates)
ping github.com

# Check proxy settings
echo $HTTP_PROXY $HTTPS_PROXY

# Test Git connectivity
git ls-remote https://github.com/git/git.git HEAD
```

## Getting Help

### Self-Service Resources
1. **Documentation**: Check [File Structure Reference](.ai/docs/reference/file-structure.md)
2. **Memory Files**: Review `.ai/memory/lessons.md` for past solutions
3. **Validation**: Run comprehensive validation suite
4. **Examples**: Check usage examples in [USAGE.md](../../USAGE.md)

### Community Support
1. **Issues**: Create detailed issue reports with:
   - Platform information (`uname -a`, `node --version`, `git --version`)
   - IDE version and configuration
   - Complete error messages
   - Steps to reproduce
   - Validation output

2. **Discussions**: Join community discussions with:
   - Clear problem description
   - What you've already tried
   - Relevant configuration details

### Professional Support
For enterprise users requiring guaranteed response times:
1. **Commercial Support**: Contact for enterprise support options
2. **Custom Integration**: Professional services for team-specific adaptations
3. **Training**: Team training and onboarding services

## Prevention

### Regular Maintenance
```bash
# Weekly validation
npm run validate

# Monthly version check
npm run validate:versions

# Quarterly cleanup
# Review and consolidate memory files
# Update documentation for new patterns
# Archive obsolete lessons
```

### Best Practices
1. **Always validate** after making changes
2. **Keep versions synchronized** across all files
3. **Test on target platforms** before deployment
4. **Document team-specific adaptations** in memory files
5. **Regular backup** of memory and configuration files

---

*This troubleshooting guide is maintained based on real user issues and solutions. If you encounter a problem not covered here, please contribute the solution back to help other users.*