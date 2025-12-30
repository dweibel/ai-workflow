#!/usr/bin/env node

/**
 * Version Validation Script
 * 
 * Validates that all version information is consistent across the package
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}[VERSION]${colors.reset} ${message}`);
}

function success(message) {
    console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function error(message) {
    console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function warning(message) {
    console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

/**
 * Extract version from package.json
 */
function getPackageVersion() {
    try {
        const packagePath = path.join(process.cwd(), 'package.json');
        const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        return packageContent.version;
    } catch (error) {
        throw new Error(`Cannot read package.json: ${error.message}`);
    }
}

/**
 * Extract version from YAML frontmatter
 */
function extractVersionFromYAML(content, filePath) {
    const normalizedContent = content.replace(/\r\n/g, '\n');
    
    if (!normalizedContent.startsWith('---')) {
        throw new Error(`${filePath}: Missing YAML frontmatter`);
    }

    const frontmatterEnd = normalizedContent.indexOf('\n---\n', 3);
    if (frontmatterEnd === -1) {
        throw new Error(`${filePath}: Invalid YAML frontmatter format`);
    }

    const frontmatter = normalizedContent.substring(3, frontmatterEnd);
    const versionMatch = frontmatter.match(/version:\s*([^\r\n]+)/);
    
    if (!versionMatch) {
        throw new Error(`${filePath}: No version field found in YAML frontmatter`);
    }
    
    return versionMatch[1].trim();
}

/**
 * Validate semantic versioning format
 */
function isValidSemVer(version) {
    return /^\d+\.\d+\.\d+$/.test(version);
}

/**
 * Validate all skill file versions
 */
function validateSkillVersions(expectedVersion) {
    const skillFiles = [
        '.ai/SKILL.md',
        '.ai/skills/compound-engineering/SKILL.md',
        '.ai/skills/ears-specification/SKILL.md',
        '.ai/skills/git-worktree/SKILL.md',
        '.ai/skills/testing-framework/SKILL.md'
    ];

    const errors = [];
    const warnings = [];

    for (const skillFile of skillFiles) {
        try {
            if (!fs.existsSync(skillFile)) {
                errors.push(`Missing skill file: ${skillFile}`);
                continue;
            }

            const content = fs.readFileSync(skillFile, 'utf8');
            const version = extractVersionFromYAML(content, skillFile);

            if (!isValidSemVer(version)) {
                errors.push(`${skillFile}: Invalid version format '${version}', expected semantic versioning (x.y.z)`);
                continue;
            }

            if (version !== expectedVersion) {
                errors.push(`${skillFile}: Version mismatch - expected '${expectedVersion}', found '${version}'`);
            } else {
                success(`${skillFile}: Version ${version} ✓`);
            }

        } catch (error) {
            errors.push(`${skillFile}: ${error.message}`);
        }
    }

    return { errors, warnings };
}

/**
 * Validate version reference document
 */
function validateVersionReference(expectedVersion) {
    const versionRefPath = '.ai/docs/reference/version-info.md';
    const errors = [];
    
    try {
        if (!fs.existsSync(versionRefPath)) {
            errors.push(`Missing version reference document: ${versionRefPath}`);
            return { errors };
        }

        const content = fs.readFileSync(versionRefPath, 'utf8');
        
        // Check for package version
        const packageVersionMatch = content.match(/\*\*Package Version\*\*:\s*`([^`]+)`/);
        if (!packageVersionMatch) {
            errors.push(`${versionRefPath}: Missing package version declaration`);
        } else if (packageVersionMatch[1] !== expectedVersion) {
            errors.push(`${versionRefPath}: Package version mismatch - expected '${expectedVersion}', found '${packageVersionMatch[1]}'`);
        } else {
            success(`${versionRefPath}: Package version ${packageVersionMatch[1]} ✓`);
        }

        // Check for skill version
        const skillVersionMatch = content.match(/\*\*Version\*\*:\s*`([^`]+)`/);
        if (!skillVersionMatch) {
            errors.push(`${versionRefPath}: Missing skill version declaration`);
        } else if (skillVersionMatch[1] !== expectedVersion) {
            errors.push(`${versionRefPath}: Skill version mismatch - expected '${expectedVersion}', found '${skillVersionMatch[1]}'`);
        } else {
            success(`${versionRefPath}: Skill version ${skillVersionMatch[1]} ✓`);
        }

        // Check release date format
        const releaseDateMatch = content.match(/\*\*Release Date\*\*:\s*`([^`]+)`/);
        if (!releaseDateMatch) {
            errors.push(`${versionRefPath}: Missing release date`);
        } else {
            const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateFormat.test(releaseDateMatch[1])) {
                errors.push(`${versionRefPath}: Invalid release date format '${releaseDateMatch[1]}', expected YYYY-MM-DD`);
            } else {
                success(`${versionRefPath}: Release date ${releaseDateMatch[1]} ✓`);
            }
        }

    } catch (error) {
        errors.push(`${versionRefPath}: Error reading file - ${error.message}`);
    }

    return { errors };
}

/**
 * Main validation function
 */
function validateVersions() {
    log('Starting version validation...');
    
    let allErrors = [];
    let allWarnings = [];

    try {
        // Get expected version from package.json
        const expectedVersion = getPackageVersion();
        log(`Expected version: ${expectedVersion}`);

        // Validate semantic versioning format
        if (!isValidSemVer(expectedVersion)) {
            error(`Invalid package.json version format: ${expectedVersion}`);
            return false;
        }
        success(`Package.json version format valid: ${expectedVersion}`);

        // Validate skill versions
        const skillValidation = validateSkillVersions(expectedVersion);
        allErrors = allErrors.concat(skillValidation.errors);
        allWarnings = allWarnings.concat(skillValidation.warnings);

        // Validate version reference document
        const refValidation = validateVersionReference(expectedVersion);
        allErrors = allErrors.concat(refValidation.errors);

        // Generate report
        console.log('\n' + '='.repeat(60));
        console.log('VERSION VALIDATION REPORT');
        console.log('='.repeat(60));

        if (allErrors.length === 0) {
            console.log(`${colors.green}✅ All version information is consistent!${colors.reset}`);
            console.log(`📦 Package version: ${expectedVersion}`);
            console.log(`🎯 All skills synchronized to version ${expectedVersion}`);
            console.log(`📋 Version reference document up to date`);
        } else {
            console.log(`${colors.red}❌ Version validation failed!${colors.reset}`);
            console.log(`🚨 ${allErrors.length} error(s) found`);
        }

        if (allWarnings.length > 0) {
            console.log(`⚠️  ${allWarnings.length} warning(s) found`);
        }

        console.log('');

        if (allErrors.length > 0) {
            console.log('🔴 ERRORS:');
            allErrors.forEach((err, index) => {
                console.log(`  ${index + 1}. ${err}`);
            });
            console.log('');
        }

        if (allWarnings.length > 0) {
            console.log('🟡 WARNINGS:');
            allWarnings.forEach((warn, index) => {
                console.log(`  ${index + 1}. ${warn}`);
            });
            console.log('');
        }

        if (allErrors.length === 0) {
            console.log('🎉 Version validation completed successfully!');
            return true;
        } else {
            console.log('🔧 Please fix the version inconsistencies above.');
            return false;
        }

    } catch (error) {
        error(`Version validation failed: ${error.message}`);
        return false;
    }
}

// Export for testing
module.exports = {
    validateVersions,
    getPackageVersion,
    extractVersionFromYAML,
    isValidSemVer,
    validateSkillVersions,
    validateVersionReference
};

// Run validation if called directly
if (require.main === module) {
    const success = validateVersions();
    process.exit(success ? 0 : 1);
}