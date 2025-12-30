/**
 * EARS-Workflow Skill Activation Error Handler
 * 
 * Provides comprehensive error handling for skill activation failures
 * with specific troubleshooting guidance and recovery mechanisms.
 * 
 * @version 1.0.0
 * @author EARS-Workflow System
 */

const fs = require('fs');
const path = require('path');

class ActivationErrorHandler {
    constructor() {
        this.errorTypes = {
            MISSING_FILES: 'missing-files',
            INVALID_YAML: 'invalid-yaml',
            DEPENDENCY_MISSING: 'dependency-missing',
            CONTEXT_OVERFLOW: 'context-overflow',
            PERMISSION_DENIED: 'permission-denied',
            CORRUPTED_MEMORY: 'corrupted-memory',
            CIRCULAR_DEPENDENCY: 'circular-dependency',
            VERSION_MISMATCH: 'version-mismatch'
        };

        this.requiredFiles = [
            '.ai/SKILL.md',
            '.ai/skills/spec-forge/SKILL.md',
            '.ai/skills/planning/SKILL.md',
            '.ai/skills/work/SKILL.md',
            '.ai/skills/review/SKILL.md',
            '.ai/skills/git-worktree/SKILL.md',
            '.ai/skills/project-reset/SKILL.md'
        ];

        this.requiredDirectories = [
            '.ai',
            '.ai/skills',
            '.ai/memory',
            '.ai/workflows',
            '.ai/templates',
            '.ai/prompts'
        ];
    }

    /**
     * Validate skill package installation and detect common issues
     * @param {string} basePath - Base path to check (defaults to current directory)
     * @returns {Object} Validation result with errors and warnings
     */
    validateInstallation(basePath = '.') {
        const errors = [];
        const warnings = [];
        const missing = [];

        try {
            // Check required directories
            for (const dir of this.requiredDirectories) {
                const dirPath = path.join(basePath, dir);
                if (!this.directoryExists(dirPath)) {
                    errors.push({
                        type: this.errorTypes.MISSING_FILES,
                        message: `Required directory missing: ${dir}`,
                        path: dirPath,
                        severity: 'critical'
                    });
                    missing.push(dir);
                }
            }

            // Check required files
            for (const file of this.requiredFiles) {
                const filePath = path.join(basePath, file);
                if (!this.fileExists(filePath)) {
                    errors.push({
                        type: this.errorTypes.MISSING_FILES,
                        message: `Required file missing: ${file}`,
                        path: filePath,
                        severity: 'critical'
                    });
                    missing.push(file);
                } else {
                    // Validate YAML frontmatter if it's a SKILL.md file
                    if (file.endsWith('SKILL.md')) {
                        const yamlValidation = this.validateYAMLFrontmatter(filePath);
                        if (!yamlValidation.valid) {
                            errors.push({
                                type: this.errorTypes.INVALID_YAML,
                                message: `Invalid YAML in ${file}: ${yamlValidation.error}`,
                                path: filePath,
                                severity: 'high',
                                yamlError: yamlValidation.error
                            });
                        }
                    }
                }
            }

            // Check memory files
            const memoryFiles = ['.ai/memory/lessons.md', '.ai/memory/decisions.md'];
            for (const memoryFile of memoryFiles) {
                const memoryPath = path.join(basePath, memoryFile);
                if (!this.fileExists(memoryPath)) {
                    warnings.push({
                        type: 'missing-memory',
                        message: `Memory file missing: ${memoryFile} (will be created automatically)`,
                        path: memoryPath,
                        severity: 'low'
                    });
                } else {
                    // Check if memory file is corrupted
                    const memoryValidation = this.validateMemoryFile(memoryPath);
                    if (!memoryValidation.valid) {
                        errors.push({
                            type: this.errorTypes.CORRUPTED_MEMORY,
                            message: `Corrupted memory file: ${memoryFile}`,
                            path: memoryPath,
                            severity: 'medium',
                            details: memoryValidation.error
                        });
                    }
                }
            }

            // Check for circular dependencies in sub-skills
            const circularDeps = this.detectCircularDependencies(basePath);
            if (circularDeps.length > 0) {
                errors.push({
                    type: this.errorTypes.CIRCULAR_DEPENDENCY,
                    message: 'Circular dependencies detected in sub-skills',
                    severity: 'high',
                    dependencies: circularDeps
                });
            }

            return {
                valid: errors.length === 0,
                errors,
                warnings,
                missing,
                summary: this.generateValidationSummary(errors, warnings)
            };

        } catch (error) {
            return {
                valid: false,
                errors: [{
                    type: 'validation-error',
                    message: `Installation validation failed: ${error.message}`,
                    severity: 'critical',
                    details: error.stack
                }],
                warnings: [],
                missing: [],
                summary: 'Validation process failed due to system error'
            };
        }
    }

    /**
     * Handle activation failure and provide appropriate error response
     * @param {string} errorType - Type of error that occurred
     * @param {Object} context - Additional context about the error
     * @returns {Object} Error response with troubleshooting guidance
     */
    handleActivationFailure(errorType, context = {}) {
        const errorResponse = {
            success: false,
            errorType,
            message: this.generateErrorMessage(errorType, context),
            troubleshooting: this.getTroubleshootingSteps(errorType, context),
            recovery: this.getRecoveryOptions(errorType, context),
            timestamp: new Date().toISOString()
        };

        // Add specific context based on error type
        switch (errorType) {
            case this.errorTypes.MISSING_FILES:
                errorResponse.missingFiles = context.missing || [];
                errorResponse.installationCheck = this.validateInstallation();
                break;
            
            case this.errorTypes.INVALID_YAML:
                errorResponse.file = context.file;
                errorResponse.yamlError = context.yamlError;
                errorResponse.lineNumber = context.lineNumber;
                break;
            
            case this.errorTypes.DEPENDENCY_MISSING:
                errorResponse.missingDependencies = context.missingDeps || [];
                errorResponse.availableSkills = context.availableSkills || [];
                break;
            
            case this.errorTypes.CONTEXT_OVERFLOW:
                errorResponse.tokenCount = context.tokenCount;
                errorResponse.limit = context.limit;
                errorResponse.suggestions = this.getContextOptimizationSuggestions();
                break;
        }

        return errorResponse;
    }

    /**
     * Generate user-friendly error message
     * @param {string} errorType - Type of error
     * @param {Object} context - Error context
     * @returns {string} Formatted error message
     */
    generateErrorMessage(errorType, context = {}) {
        const errorMessages = {
            [this.errorTypes.MISSING_FILES]: this.generateMissingFilesMessage(context),
            [this.errorTypes.INVALID_YAML]: this.generateInvalidYAMLMessage(context),
            [this.errorTypes.DEPENDENCY_MISSING]: this.generateDependencyMessage(context),
            [this.errorTypes.CONTEXT_OVERFLOW]: this.generateContextOverflowMessage(context),
            [this.errorTypes.PERMISSION_DENIED]: this.generatePermissionMessage(context),
            [this.errorTypes.CORRUPTED_MEMORY]: this.generateCorruptedMemoryMessage(context),
            [this.errorTypes.CIRCULAR_DEPENDENCY]: this.generateCircularDependencyMessage(context),
            [this.errorTypes.VERSION_MISMATCH]: this.generateVersionMismatchMessage(context)
        };

        return errorMessages[errorType] || `❌ **Activation Failed**: ${errorType}\n\nPlease check the skill installation and try again.`;
    }

    /**
     * Generate missing files error message
     */
    generateMissingFilesMessage(context) {
        const missingFiles = context.missing || ['Unknown files'];
        return `❌ **Activation Failed: Missing Files**\n\n` +
               `The EARS-workflow skill package appears incomplete. Missing files:\n\n` +
               `${missingFiles.map(file => `- \`${file}\``).join('\n')}\n\n` +
               `**Required for activation:**\n` +
               `- \`.ai/SKILL.md\` - Main skill definition\n` +
               `- \`.ai/skills/*/SKILL.md\` - Sub-skill definitions\n` +
               `- \`.ai/memory/\` - Memory files directory\n\n` +
               `**Troubleshooting**: Verify complete package installation or reinstall the skill package.`;
    }

    /**
     * Generate invalid YAML error message
     */
    generateInvalidYAMLMessage(context) {
        return `❌ **Activation Failed: Invalid Metadata**\n\n` +
               `SKILL.md file contains invalid YAML frontmatter:\n\n` +
               `**File**: \`${context.file || 'Unknown'}\`\n` +
               `**Error**: ${context.yamlError || 'YAML parsing failed'}\n` +
               `${context.lineNumber ? `**Line**: ${context.lineNumber}\n` : ''}\n` +
               `**Common issues:**\n` +
               `- Incorrect indentation (use spaces, not tabs)\n` +
               `- Missing required fields: name, description, version\n` +
               `- Unescaped special characters in values\n` +
               `- Missing closing quotes or brackets\n\n` +
               `**Fix**: Check YAML syntax and ensure all required fields are present.`;
    }

    /**
     * Generate dependency missing error message
     */
    generateDependencyMessage(context) {
        const missingDeps = context.missingDeps || ['Unknown dependencies'];
        return `❌ **Activation Failed: Missing Dependencies**\n\n` +
               `Required sub-skills or dependencies are not available:\n\n` +
               `${missingDeps.map(dep => `- ${dep}`).join('\n')}\n\n` +
               `**Available skills**: ${(context.availableSkills || []).join(', ') || 'None detected'}\n\n` +
               `**Troubleshooting**: Ensure all sub-skill directories contain valid SKILL.md files.`;
    }

    /**
     * Generate context overflow error message
     */
    generateContextOverflowMessage(context) {
        return `⚠️ **Activation Warning: Context Limit**\n\n` +
               `The skill activation would exceed context window limits:\n\n` +
               `**Current tokens**: ${context.tokenCount || 'Unknown'}\n` +
               `**Limit**: ${context.limit || 'Unknown'}\n\n` +
               `**Using progressive disclosure:**\n` +
               `- Loading minimal metadata only\n` +
               `- Detailed instructions will load on-demand\n` +
               `- Use specific sub-skill activation for focused capabilities\n\n` +
               `**Recommendation**: Activate specific sub-skills rather than the full workflow.`;
    }

    /**
     * Generate permission denied error message
     */
    generatePermissionMessage(context) {
        return `❌ **Activation Failed: Permission Denied**\n\n` +
               `Cannot access required files or directories:\n\n` +
               `**Path**: \`${context.path || 'Unknown'}\`\n` +
               `**Operation**: ${context.operation || 'File access'}\n\n` +
               `**Troubleshooting:**\n` +
               `- Check file/directory permissions\n` +
               `- Ensure you have read access to the .ai directory\n` +
               `- Run with appropriate user permissions\n` +
               `- Check if files are locked by another process`;
    }

    /**
     * Generate corrupted memory error message
     */
    generateCorruptedMemoryMessage(context) {
        return `❌ **Activation Failed: Corrupted Memory Files**\n\n` +
               `Memory files contain invalid data:\n\n` +
               `**File**: \`${context.file || 'Unknown'}\`\n` +
               `**Issue**: ${context.details || 'File corruption detected'}\n\n` +
               `**Recovery options:**\n` +
               `- Restore from backup if available\n` +
               `- Reset memory files to templates\n` +
               `- Use project-reset skill to restore clean state\n\n` +
               `**Warning**: Resetting will lose accumulated lessons and decisions.`;
    }

    /**
     * Generate circular dependency error message
     */
    generateCircularDependencyMessage(context) {
        const deps = context.dependencies || [];
        return `❌ **Activation Failed: Circular Dependencies**\n\n` +
               `Circular dependencies detected in sub-skills:\n\n` +
               `${deps.map(dep => `- ${dep.join(' → ')}`).join('\n')}\n\n` +
               `**Fix**: Remove circular references in sub-skill dependencies.`;
    }

    /**
     * Generate version mismatch error message
     */
    generateVersionMismatchMessage(context) {
        return `❌ **Activation Failed: Version Mismatch**\n\n` +
               `Incompatible skill versions detected:\n\n` +
               `**Expected**: ${context.expectedVersion || 'Unknown'}\n` +
               `**Found**: ${context.foundVersion || 'Unknown'}\n` +
               `**Skill**: ${context.skill || 'Unknown'}\n\n` +
               `**Fix**: Update all skills to compatible versions.`;
    }

    /**
     * Get troubleshooting steps for specific error type
     */
    getTroubleshootingSteps(errorType, context) {
        const troubleshootingSteps = {
            [this.errorTypes.MISSING_FILES]: [
                'Verify the .ai directory exists in your project root',
                'Check that all required SKILL.md files are present',
                'Ensure the skill package was completely copied/installed',
                'Run installation validation to identify specific missing files'
            ],
            [this.errorTypes.INVALID_YAML]: [
                'Open the problematic SKILL.md file in a text editor',
                'Check YAML frontmatter syntax (indentation, quotes, brackets)',
                'Validate required fields: name, description, version',
                'Use a YAML validator to identify syntax errors'
            ],
            [this.errorTypes.DEPENDENCY_MISSING]: [
                'Check that all sub-skill directories exist',
                'Verify each sub-skill has a valid SKILL.md file',
                'Review dependency declarations in skill metadata',
                'Ensure no typos in skill names or references'
            ],
            [this.errorTypes.CONTEXT_OVERFLOW]: [
                'Use specific sub-skill activation instead of full workflow',
                'Clear unnecessary context from previous sessions',
                'Consider breaking large tasks into smaller phases',
                'Use progressive disclosure by activating skills incrementally'
            ]
        };

        return troubleshootingSteps[errorType] || [
            'Check the skill installation documentation',
            'Verify all required files are present and accessible',
            'Try restarting your IDE or development environment',
            'Contact support if the issue persists'
        ];
    }

    /**
     * Get recovery options for specific error type
     */
    getRecoveryOptions(errorType, context) {
        const recoveryOptions = {
            [this.errorTypes.MISSING_FILES]: [
                'Reinstall the complete skill package',
                'Copy missing files from a working installation',
                'Use the installation script if available',
                'Download the latest version from the repository'
            ],
            [this.errorTypes.INVALID_YAML]: [
                'Fix YAML syntax errors manually',
                'Restore from a backup version',
                'Use a template to recreate the file',
                'Copy from a working skill installation'
            ],
            [this.errorTypes.CORRUPTED_MEMORY]: [
                'Restore memory files from backup',
                'Reset to template versions (loses history)',
                'Use project-reset skill with memory option',
                'Manually recreate memory files'
            ]
        };

        return recoveryOptions[errorType] || [
            'Try restarting the activation process',
            'Check system requirements and dependencies',
            'Consult the troubleshooting documentation',
            'Seek help from the community or support'
        ];
    }

    /**
     * Get context optimization suggestions
     */
    getContextOptimizationSuggestions() {
        return [
            'Activate only the specific sub-skill you need',
            'Use "spec-forge" for requirements and design work',
            'Use "work" for implementation tasks',
            'Use "review" for code auditing',
            'Avoid activating the full workflow unless necessary'
        ];
    }

    /**
     * Utility methods for file system checks
     */
    fileExists(filePath) {
        try {
            return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
        } catch {
            return false;
        }
    }

    directoryExists(dirPath) {
        try {
            return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
        } catch {
            return false;
        }
    }

    /**
     * Validate YAML frontmatter in SKILL.md files
     */
    validateYAMLFrontmatter(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
            
            if (!yamlMatch) {
                return { valid: false, error: 'No YAML frontmatter found' };
            }

            // Basic YAML validation (in a real implementation, use a YAML parser)
            const yamlContent = yamlMatch[1];
            const requiredFields = ['name', 'description', 'version'];
            
            for (const field of requiredFields) {
                if (!yamlContent.includes(`${field}:`)) {
                    return { valid: false, error: `Missing required field: ${field}` };
                }
            }

            return { valid: true };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    /**
     * Validate memory file format
     */
    validateMemoryFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Basic validation - check if it's readable markdown
            if (content.trim().length === 0) {
                return { valid: false, error: 'Empty file' };
            }

            // Check for basic markdown structure
            if (!content.includes('#') && content.length > 100) {
                return { valid: false, error: 'Invalid markdown structure' };
            }

            return { valid: true };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    /**
     * Detect circular dependencies in sub-skills
     */
    detectCircularDependencies(basePath) {
        // Simplified implementation - in practice, would parse actual dependencies
        const circularDeps = [];
        
        // This would analyze SKILL.md files for dependency declarations
        // and detect circular references using graph algorithms
        
        return circularDeps;
    }

    /**
     * Generate validation summary
     */
    generateValidationSummary(errors, warnings) {
        const criticalErrors = errors.filter(e => e.severity === 'critical').length;
        const highErrors = errors.filter(e => e.severity === 'high').length;
        const mediumErrors = errors.filter(e => e.severity === 'medium').length;
        
        if (criticalErrors > 0) {
            return `❌ Installation invalid: ${criticalErrors} critical error(s) found`;
        } else if (highErrors > 0) {
            return `⚠️ Installation issues: ${highErrors} high-priority error(s) found`;
        } else if (mediumErrors > 0) {
            return `⚠️ Installation warnings: ${mediumErrors} medium-priority issue(s) found`;
        } else if (warnings.length > 0) {
            return `✅ Installation valid with ${warnings.length} warning(s)`;
        } else {
            return `✅ Installation valid - all checks passed`;
        }
    }
}

// Export for use in skill system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ActivationErrorHandler;
}

// Global instance for immediate use
if (typeof window !== 'undefined') {
    window.ActivationErrorHandler = ActivationErrorHandler;
}