#!/usr/bin/env node

/**
 * Cross-Reference Validation Script
 * 
 * Validates that all links and file references in documentation are accurate
 * and up-to-date. Addresses Medium Priority Recommendation #3 from documentation audit.
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}[XREF]${colors.reset} ${message}`);
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

class CrossReferenceValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.checkedFiles = new Set();
        this.validatedReferences = new Map();
        
        // Patterns for different types of references
        this.patterns = {
            // Markdown links: [text](path) or [text](path#anchor)
            markdownLinks: /\[([^\]]+)\]\(([^)]+)\)/g,
            
            // File references: `path/to/file.ext`
            fileReferences: /`([^`]+\.[a-zA-Z0-9]+)`/g,
            
            // Directory references: `.ai/path/to/dir/`
            directoryReferences: /`(\.ai\/[^`]+\/)`/g,
            
            // Script references: npm run script-name
            scriptReferences: /npm run ([a-zA-Z0-9:-]+)/g,
            
            // Relative path references: ./path or ../path
            relativePathReferences: /`(\.\.?\/[^`]+)`/g,
            
            // See references: "see [file](path)"
            seeReferences: /see\s+\[([^\]]+)\]\(([^)]+)\)/gi,
            
            // For complete reference: "For complete X, see [file](path)"
            completeReferences: /for\s+complete\s+[^,]+,\s+see\s+\[([^\]]+)\]\(([^)]+)\)/gi
        };
    }

    /**
     * Validate all cross-references in the project
     */
    async validateAllReferences() {
        log('Starting comprehensive cross-reference validation...');
        
        // Get all documentation files
        const docFiles = this.getDocumentationFiles();
        
        log(`Found ${docFiles.length} documentation files to validate`);
        
        // Validate each file
        for (const filePath of docFiles) {
            await this.validateFile(filePath);
        }
        
        // Validate package.json scripts
        this.validatePackageScripts();
        
        // Generate report
        return this.generateReport();
    }

    /**
     * Get all documentation files to validate
     */
    getDocumentationFiles() {
        const files = [];
        
        // Root documentation files
        const rootDocs = ['README.md', 'USAGE.md', 'INSTALL.md', 'AGENTS.md'];
        for (const file of rootDocs) {
            if (fs.existsSync(file)) {
                files.push(file);
            }
        }
        
        // .ai directory documentation
        if (fs.existsSync('.ai')) {
            files.push(...this.findMarkdownFiles('.ai'));
        }
        
        return files;
    }

    /**
     * Recursively find all markdown files in a directory
     */
    findMarkdownFiles(dir) {
        const files = [];
        
        try {
            const items = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(dir, item.name);
                
                if (item.isDirectory()) {
                    files.push(...this.findMarkdownFiles(fullPath));
                } else if (item.isFile() && item.name.endsWith('.md')) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            this.warnings.push(`Could not read directory ${dir}: ${error.message}`);
        }
        
        return files;
    }

    /**
     * Validate all references in a single file
     */
    async validateFile(filePath) {
        if (this.checkedFiles.has(filePath)) {
            return; // Already validated
        }
        
        this.checkedFiles.add(filePath);
        
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const fileDir = path.dirname(filePath);
            
            log(`Validating ${filePath}...`, 'dim');
            
            // Validate different types of references
            this.validateMarkdownLinks(content, filePath, fileDir);
            this.validateFileReferences(content, filePath, fileDir);
            this.validateDirectoryReferences(content, filePath, fileDir);
            this.validateScriptReferences(content, filePath);
            this.validateRelativePathReferences(content, filePath, fileDir);
            
        } catch (error) {
            this.errors.push(`Could not read file ${filePath}: ${error.message}`);
        }
    }

    /**
     * Validate markdown links [text](path)
     */
    validateMarkdownLinks(content, filePath, fileDir) {
        let match;
        
        while ((match = this.patterns.markdownLinks.exec(content)) !== null) {
            const linkText = match[1];
            const linkPath = match[2];
            
            // Skip external URLs
            if (linkPath.startsWith('http://') || linkPath.startsWith('https://')) {
                continue;
            }
            
            // Skip anchors only
            if (linkPath.startsWith('#')) {
                continue;
            }
            
            // Handle path with anchor
            const [pathPart, anchor] = linkPath.split('#');
            
            // Resolve relative path
            const resolvedPath = this.resolvePath(pathPart, fileDir);
            
            if (!this.fileExists(resolvedPath)) {
                this.errors.push(`${filePath}: Broken link "${linkText}" → ${linkPath} (resolved: ${resolvedPath})`);
            } else {
                // Validate anchor if present
                if (anchor) {
                    this.validateAnchor(resolvedPath, anchor, filePath, linkText);
                }
            }
        }
    }

    /**
     * Validate file references in backticks
     */
    validateFileReferences(content, filePath, fileDir) {
        let match;
        
        while ((match = this.patterns.fileReferences.exec(content)) !== null) {
            const refPath = match[1];
            
            // Skip if it looks like a command or code snippet
            if (refPath.includes(' ') || refPath.includes('$') || refPath.includes('npm')) {
                continue;
            }
            
            const resolvedPath = this.resolvePath(refPath, fileDir);
            
            if (!this.fileExists(resolvedPath)) {
                this.errors.push(`${filePath}: Missing file reference "${refPath}" (resolved: ${resolvedPath})`);
            }
        }
    }

    /**
     * Validate directory references
     */
    validateDirectoryReferences(content, filePath, fileDir) {
        let match;
        
        while ((match = this.patterns.directoryReferences.exec(content)) !== null) {
            const refPath = match[1];
            const resolvedPath = this.resolvePath(refPath, fileDir);
            
            if (!this.directoryExists(resolvedPath)) {
                this.errors.push(`${filePath}: Missing directory reference "${refPath}" (resolved: ${resolvedPath})`);
            }
        }
    }

    /**
     * Validate npm script references
     */
    validateScriptReferences(content, filePath) {
        let match;
        
        while ((match = this.patterns.scriptReferences.exec(content)) !== null) {
            const scriptName = match[1];
            
            if (!this.scriptExists(scriptName)) {
                this.errors.push(`${filePath}: Missing npm script "${scriptName}"`);
            }
        }
    }

    /**
     * Validate relative path references
     */
    validateRelativePathReferences(content, filePath, fileDir) {
        let match;
        
        while ((match = this.patterns.relativePathReferences.exec(content)) !== null) {
            const refPath = match[1];
            
            // Skip if it looks like a command
            if (refPath.includes(' ') || refPath.includes('$')) {
                continue;
            }
            
            const resolvedPath = this.resolvePath(refPath, fileDir);
            
            if (!this.fileExists(resolvedPath) && !this.directoryExists(resolvedPath)) {
                this.errors.push(`${filePath}: Missing path reference "${refPath}" (resolved: ${resolvedPath})`);
            }
        }
    }

    /**
     * Validate anchor links within files
     */
    validateAnchor(filePath, anchor, sourceFile, linkText) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Convert anchor to expected header format
            const expectedHeader = anchor.toLowerCase()
                .replace(/-/g, ' ')
                .replace(/[^a-z0-9\s]/g, '');
            
            // Look for matching headers
            const headerPattern = /^#+\s+(.+)$/gm;
            let match;
            let found = false;
            
            while ((match = headerPattern.exec(content)) !== null) {
                const headerText = match[1].toLowerCase()
                    .replace(/[^a-z0-9\s]/g, '')
                    .trim();
                
                if (headerText.includes(expectedHeader) || expectedHeader.includes(headerText)) {
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                this.warnings.push(`${sourceFile}: Anchor "${anchor}" not found in "${linkText}" → ${filePath}`);
            }
            
        } catch (error) {
            this.warnings.push(`Could not validate anchor "${anchor}" in ${filePath}: ${error.message}`);
        }
    }

    /**
     * Validate package.json scripts
     */
    validatePackageScripts() {
        try {
            const packagePath = 'package.json';
            if (!fs.existsSync(packagePath)) {
                this.warnings.push('package.json not found, skipping script validation');
                return;
            }
            
            const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            const scripts = packageContent.scripts || {};
            
            // Validate script files exist
            for (const [scriptName, scriptCommand] of Object.entries(scripts)) {
                this.validateScriptCommand(scriptCommand, scriptName);
            }
            
        } catch (error) {
            this.errors.push(`Error validating package.json scripts: ${error.message}`);
        }
    }

    /**
     * Validate a script command references valid files
     */
    validateScriptCommand(command, scriptName) {
        // Extract file references from script commands
        const nodeFilePattern = /node\s+([^\s]+\.js)/g;
        let match;
        
        while ((match = nodeFilePattern.exec(command)) !== null) {
            const scriptFile = match[1];
            
            if (!this.fileExists(scriptFile)) {
                this.errors.push(`package.json script "${scriptName}": Missing file "${scriptFile}"`);
            }
        }
    }

    /**
     * Resolve a path relative to a base directory
     */
    resolvePath(refPath, baseDir) {
        if (path.isAbsolute(refPath)) {
            return refPath;
        }
        
        // Handle relative paths
        return path.resolve(baseDir, refPath);
    }

    /**
     * Check if a file exists
     */
    fileExists(filePath) {
        try {
            return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
        } catch {
            return false;
        }
    }

    /**
     * Check if a directory exists
     */
    directoryExists(dirPath) {
        try {
            return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
        } catch {
            return false;
        }
    }

    /**
     * Check if an npm script exists
     */
    scriptExists(scriptName) {
        try {
            const packagePath = 'package.json';
            if (!fs.existsSync(packagePath)) {
                return false;
            }
            
            const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            const scripts = packageContent.scripts || {};
            
            return scripts.hasOwnProperty(scriptName);
        } catch {
            return false;
        }
    }

    /**
     * Generate comprehensive validation report
     */
    generateReport() {
        const isValid = this.errors.length === 0;
        
        console.log('\n' + '='.repeat(80));
        console.log('🔗 CROSS-REFERENCE VALIDATION REPORT');
        console.log('='.repeat(80));
        
        if (isValid) {
            console.log(`${colors.green}✅ All cross-references are valid!${colors.reset}`);
            console.log(`📄 Validated ${this.checkedFiles.size} documentation files`);
            console.log(`🔗 All links and file references are accurate`);
        } else {
            console.log(`${colors.red}❌ Cross-reference validation failed!${colors.reset}`);
            console.log(`🚨 ${this.errors.length} error(s) found`);
        }
        
        if (this.warnings.length > 0) {
            console.log(`⚠️  ${this.warnings.length} warning(s) found`);
        }
        
        console.log('');
        
        // Show validation summary
        console.log('📊 VALIDATION SUMMARY:');
        console.log(`   Files checked: ${this.checkedFiles.size}`);
        console.log(`   Errors: ${this.errors.length}`);
        console.log(`   Warnings: ${this.warnings.length}`);
        console.log('');
        
        if (this.errors.length > 0) {
            console.log('🔴 ERRORS:');
            this.errors.forEach((err, index) => {
                console.log(`  ${index + 1}. ${err}`);
            });
            console.log('');
        }
        
        if (this.warnings.length > 0) {
            console.log('🟡 WARNINGS:');
            this.warnings.forEach((warn, index) => {
                console.log(`  ${index + 1}. ${warn}`);
            });
            console.log('');
        }
        
        // Show file coverage
        console.log('📁 FILES VALIDATED:');
        const sortedFiles = Array.from(this.checkedFiles).sort();
        sortedFiles.forEach(file => {
            console.log(`   ✓ ${file}`);
        });
        console.log('');
        
        if (isValid) {
            console.log('🎉 All documentation cross-references are accurate and up-to-date!');
        } else {
            console.log('🔧 Please fix the broken references above.');
        }
        
        return {
            isValid,
            errors: this.errors,
            warnings: this.warnings,
            filesChecked: this.checkedFiles.size,
            summary: {
                totalErrors: this.errors.length,
                totalWarnings: this.warnings.length,
                filesValidated: this.checkedFiles.size
            }
        };
    }

    /**
     * Generate fix suggestions for common issues
     */
    generateFixSuggestions() {
        const suggestions = [];
        
        for (const error of this.errors) {
            if (error.includes('Broken link')) {
                suggestions.push({
                    error,
                    suggestion: 'Check if the target file exists or update the link path'
                });
            } else if (error.includes('Missing file reference')) {
                suggestions.push({
                    error,
                    suggestion: 'Verify the file path is correct or create the missing file'
                });
            } else if (error.includes('Missing npm script')) {
                suggestions.push({
                    error,
                    suggestion: 'Add the script to package.json or update the documentation'
                });
            }
        }
        
        if (suggestions.length > 0) {
            console.log('💡 FIX SUGGESTIONS:');
            suggestions.forEach((suggestion, index) => {
                console.log(`\n${index + 1}. ${suggestion.error}`);
                console.log(`   💡 ${suggestion.suggestion}`);
            });
        }
    }
}

/**
 * Main validation function
 */
async function validateCrossReferences() {
    const validator = new CrossReferenceValidator();
    const result = await validator.validateAllReferences();
    
    // Generate fix suggestions if there are errors
    if (result.errors.length > 0) {
        validator.generateFixSuggestions();
    }
    
    return result;
}

// Export for testing
module.exports = {
    CrossReferenceValidator,
    validateCrossReferences
};

// Run validation if called directly
if (require.main === module) {
    validateCrossReferences()
        .then(result => {
            process.exit(result.isValid ? 0 : 1);
        })
        .catch(error => {
            console.error(`${colors.red}Cross-reference validation failed: ${error.message}${colors.reset}`);
            process.exit(1);
        });
}