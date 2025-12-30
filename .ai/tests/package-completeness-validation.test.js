/**
 * Package Completeness Validation Test
 * 
 * **Feature: ears-workflow-skill-refactor, Property 10: Package portability**
 * **Validates: Requirements 6.1, 6.2**
 * 
 * This test validates that the EARS-workflow skill package is complete and portable
 * across different project environments without external dependencies.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PackageValidator {
    constructor(packagePath = '.ai') {
        this.packagePath = packagePath;
        this.errors = [];
        this.warnings = [];
    }

    /**
     * Validate that all required files exist for complete functionality
     */
    validateRequiredFiles() {
        const requiredFiles = [
            // Main skill definition
            'SKILL.md',
            
            // Individual skill definitions
            'skills/compound-engineering/SKILL.md',
            'skills/ears-specification/SKILL.md', 
            'skills/git-worktree/SKILL.md',
            'skills/testing-framework/SKILL.md',
            
            // Core memory and configuration
            'memory/lessons.md',
            'memory/decisions.md',
            
            // Essential templates
            'skills/ears-specification/templates/requirements-template.md',
            'skills/ears-specification/templates/ears-validation.md',
            'skills/ears-specification/templates/incose-validation.md',
            
            // Git worktree scripts
            'skills/git-worktree/git-worktree.sh',
            
            // Testing framework scripts
            'skills/testing-framework/scripts/run-validation-suite.js'
        ];

        for (const file of requiredFiles) {
            const filePath = path.join(this.packagePath, file);
            if (!fs.existsSync(filePath)) {
                this.errors.push(`Missing required file: ${file}`);
            }
        }
    }

    /**
     * Validate YAML frontmatter in all SKILL.md files
     */
    validateSkillMetadata() {
        const skillFiles = [
            'SKILL.md',
            'skills/compound-engineering/SKILL.md',
            'skills/ears-specification/SKILL.md',
            'skills/git-worktree/SKILL.md', 
            'skills/testing-framework/SKILL.md'
        ];

        for (const skillFile of skillFiles) {
            const filePath = path.join(this.packagePath, skillFile);
            if (fs.existsSync(filePath)) {
                try {
                    const content = fs.readFileSync(filePath, 'utf8');
                    
                    // Normalize line endings for cross-platform compatibility
                    const normalizedContent = content.replace(/\r\n/g, '\n');
                    
                    // Check for YAML frontmatter
                    if (!normalizedContent.startsWith('---')) {
                        this.errors.push(`${skillFile}: Missing YAML frontmatter`);
                        continue;
                    }

                    const frontmatterEnd = normalizedContent.indexOf('\n---\n', 3);
                    if (frontmatterEnd === -1) {
                        this.errors.push(`${skillFile}: Invalid YAML frontmatter format`);
                        continue;
                    }

                    const frontmatter = normalizedContent.substring(3, frontmatterEnd);
                    
                    // Check required fields
                    const requiredFields = ['name:', 'description:', 'version:'];
                    for (const field of requiredFields) {
                        if (!frontmatter.includes(field)) {
                            this.errors.push(`${skillFile}: Missing required field ${field.replace(':', '')}`);
                        }
                    }

                    // Validate version format (semantic versioning)
                    const versionMatch = frontmatter.match(/version:\s*([^\n]+)/);
                    if (versionMatch) {
                        const version = versionMatch[1].trim();
                        if (!/^\d+\.\d+\.\d+$/.test(version)) {
                            this.errors.push(`${skillFile}: Invalid version format '${version}', expected semantic versioning (x.y.z)`);
                        }
                    }

                } catch (error) {
                    this.errors.push(`${skillFile}: Error reading file - ${error.message}`);
                }
            }
        }
    }

    /**
     * Validate that JavaScript scripts have no external dependencies
     */
    validateNoDependencies() {
        const scriptFiles = [
            { file: 'skills/git-worktree/git-worktree.sh', type: 'bash' },
            { file: 'skills/testing-framework/scripts/run-validation-suite.js', type: 'node' }
        ];

        for (const script of scriptFiles) {
            const filePath = path.join(this.packagePath, script.file);
            if (fs.existsSync(filePath)) {
                try {
                    const content = fs.readFileSync(filePath, 'utf8');
                    
                    if (script.type === 'node') {
                        // Check for external require statements (excluding Node.js built-ins)
                        const requireMatches = content.match(/require\(['"`]([^'"`]+)['"`]\)/g);
                        if (requireMatches) {
                            for (const match of requireMatches) {
                                const module = match.match(/require\(['"`]([^'"`]+)['"`]\)/)[1];
                                
                                // Allow Node.js built-in modules
                                const builtinModules = [
                                    'fs', 'path', 'os', 'child_process', 'util', 'crypto',
                                    'events', 'stream', 'readline', 'process', 'zlib',
                                    'stream/promises'
                                ];
                                
                                // Allow relative imports
                                if (!module.startsWith('./') && !module.startsWith('../') && !builtinModules.includes(module)) {
                                    this.errors.push(`${script.file}: External dependency detected: ${module}`);
                                }
                            }
                        }

                        // Check for import statements
                        const importMatches = content.match(/import\s+.*\s+from\s+['"`]([^'"`]+)['"`]/g);
                        if (importMatches) {
                            for (const match of importMatches) {
                                const module = match.match(/from\s+['"`]([^'"`]+)['"`]/)[1];
                                if (!module.startsWith('./') && !module.startsWith('../')) {
                                    this.errors.push(`${script.file}: External ES6 import detected: ${module}`);
                                }
                            }
                        }
                    }
                    // For bash scripts, we don't check dependencies as they use system commands

                } catch (error) {
                    this.errors.push(`${script.file}: Error reading file - ${error.message}`);
                }
            }
        }
    }

    /**
     * Validate that scripts can execute without errors
     */
    validateScriptExecution() {
        const executableScripts = [
            { file: 'skills/git-worktree/git-worktree.sh', type: 'bash' },
            { file: 'skills/testing-framework/scripts/run-validation-suite.js', type: 'node' }
        ];

        for (const script of executableScripts) {
            const filePath = path.join(this.packagePath, script.file);
            if (fs.existsSync(filePath)) {
                try {
                    const fullPath = path.resolve(filePath);
                    
                    if (script.type === 'node') {
                        // Use node -c to check JavaScript syntax
                        execSync(`node -c "${fullPath}"`, { stdio: 'pipe' });
                    } else if (script.type === 'bash') {
                        // For bash scripts, just check if they're readable and have shebang
                        const content = fs.readFileSync(filePath, 'utf8');
                        if (!content.startsWith('#!/bin/bash') && !content.startsWith('#!/usr/bin/env bash')) {
                            this.warnings.push(`${script.file}: Missing bash shebang, may not execute properly`);
                        }
                        // On Windows, skip bash syntax validation
                        if (process.platform !== 'win32') {
                            try {
                                execSync(`bash -n "${fullPath}"`, { stdio: 'pipe' });
                            } catch (bashError) {
                                this.errors.push(`${script.file}: Bash syntax error - ${bashError.message}`);
                            }
                        }
                    }
                    
                } catch (error) {
                    this.errors.push(`${script.file}: Script validation error - ${error.message}`);
                }
            }
        }
    }

    /**
     * Validate directory structure integrity
     */
    validateDirectoryStructure() {
        const requiredDirectories = [
            'skills',
            'skills/compound-engineering',
            'skills/ears-specification',
            'skills/ears-specification/templates',
            'skills/git-worktree',
            'skills/testing-framework',
            'skills/testing-framework/scripts',
            'memory',
            'docs',
            'docs/reference'
        ];

        for (const dir of requiredDirectories) {
            const dirPath = path.join(this.packagePath, dir);
            if (!fs.existsSync(dirPath)) {
                this.errors.push(`Missing required directory: ${dir}`);
            } else if (!fs.statSync(dirPath).isDirectory()) {
                this.errors.push(`Expected directory but found file: ${dir}`);
            }
        }
    }

    /**
     * Validate memory files have proper structure
     */
    validateMemoryFiles() {
        const memoryFiles = ['memory/lessons.md', 'memory/decisions.md'];
        
        for (const memoryFile of memoryFiles) {
            const filePath = path.join(this.packagePath, memoryFile);
            if (fs.existsSync(filePath)) {
                try {
                    const content = fs.readFileSync(filePath, 'utf8');
                    
                    // Check for basic markdown structure
                    if (!content.includes('#')) {
                        this.warnings.push(`${memoryFile}: No markdown headers found, may be empty or malformed`);
                    }
                    
                    // Check for reasonable content length
                    if (content.trim().length < 50) {
                        this.warnings.push(`${memoryFile}: File appears to be very short or empty`);
                    }
                    
                } catch (error) {
                    this.errors.push(`${memoryFile}: Error reading file - ${error.message}`);
                }
            }
        }
    }

    /**
     * Run all validation checks
     */
    validate() {
        console.log('🔍 Validating EARS-workflow skill package completeness...\n');

        this.validateRequiredFiles();
        this.validateSkillMetadata();
        this.validateNoDependencies();
        this.validateScriptExecution();
        this.validateDirectoryStructure();
        this.validateMemoryFiles();

        return this.generateReport();
    }

    /**
     * Generate validation report
     */
    generateReport() {
        const isValid = this.errors.length === 0;
        
        console.log('📋 PACKAGE VALIDATION REPORT');
        console.log('=' .repeat(50));
        
        if (isValid) {
            console.log('✅ Package validation PASSED');
            console.log(`📦 All required files and functionality present`);
            console.log(`🔒 No external dependencies detected`);
            console.log(`📁 Directory structure is complete`);
        } else {
            console.log('❌ Package validation FAILED');
            console.log(`🚨 ${this.errors.length} error(s) found`);
        }

        if (this.warnings.length > 0) {
            console.log(`⚠️  ${this.warnings.length} warning(s) found`);
        }

        console.log('');

        if (this.errors.length > 0) {
            console.log('🔴 ERRORS:');
            this.errors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
            console.log('');
        }

        if (this.warnings.length > 0) {
            console.log('🟡 WARNINGS:');
            this.warnings.forEach((warning, index) => {
                console.log(`  ${index + 1}. ${warning}`);
            });
            console.log('');
        }

        if (isValid) {
            console.log('🎉 Package is ready for distribution!');
        } else {
            console.log('🔧 Please fix the errors above before distributing the package.');
        }

        return {
            isValid,
            errors: this.errors,
            warnings: this.warnings,
            summary: {
                totalErrors: this.errors.length,
                totalWarnings: this.warnings.length,
                packageComplete: isValid
            }
        };
    }
}

/**
 * Property-based test for package completeness validation
 */
function testPackageCompleteness() {
    const validator = new PackageValidator();
    const result = validator.validate();
    
    // The package should be complete and valid
    if (!result.isValid) {
        throw new Error(`Package validation failed with ${result.errors.length} errors: ${result.errors.join(', ')}`);
    }
    
    return result;
}

// Export for testing
module.exports = {
    PackageValidator,
    testPackageCompleteness
};

// Run validation if called directly
if (require.main === module) {
    try {
        const result = testPackageCompleteness();
        process.exit(0);
    } catch (error) {
        console.error('❌ Package validation failed:', error.message);
        process.exit(1);
    }
}