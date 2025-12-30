/**
 * Memory Files Compatibility Validator
 * 
 * Ensures that existing memory files (.ai/memory/lessons.md and .ai/memory/decisions.md)
 * continue to work with the new EARS-workflow skill structure.
 * 
 * This validator checks:
 * - Memory file accessibility and format
 * - Content structure and required sections
 * - Integration with new skill system
 * - Backward compatibility with existing patterns
 */

const fs = require('fs');
const path = require('path');

class MemoryCompatibilityValidator {
    constructor(aiDirectory = '.ai') {
        this.aiDirectory = aiDirectory;
        this.memoryDirectory = path.join(aiDirectory, 'memory');
        this.lessonsFile = path.join(this.memoryDirectory, 'lessons.md');
        this.decisionsFile = path.join(this.memoryDirectory, 'decisions.md');
    }

    /**
     * Validate that memory files exist and are accessible
     */
    validateFileAccess() {
        const results = {
            lessonsExists: false,
            decisionsExists: false,
            memoryDirExists: false,
            errors: []
        };

        try {
            // Check if memory directory exists
            if (fs.existsSync(this.memoryDirectory)) {
                results.memoryDirExists = true;
            } else {
                results.errors.push('Memory directory does not exist: ' + this.memoryDirectory);
            }

            // Check if lessons.md exists and is readable
            if (fs.existsSync(this.lessonsFile)) {
                const stats = fs.statSync(this.lessonsFile);
                if (stats.isFile()) {
                    results.lessonsExists = true;
                } else {
                    results.errors.push('lessons.md exists but is not a file');
                }
            } else {
                results.errors.push('lessons.md does not exist: ' + this.lessonsFile);
            }

            // Check if decisions.md exists and is readable
            if (fs.existsSync(this.decisionsFile)) {
                const stats = fs.statSync(this.decisionsFile);
                if (stats.isFile()) {
                    results.decisionsExists = true;
                } else {
                    results.errors.push('decisions.md exists but is not a file');
                }
            } else {
                results.errors.push('decisions.md does not exist: ' + this.decisionsFile);
            }

        } catch (error) {
            results.errors.push('File access error: ' + error.message);
        }

        return results;
    }

    /**
     * Validate memory file formats and required sections
     */
    validateFileFormats() {
        const results = {
            lessonsFormat: { valid: false, sections: [], errors: [] },
            decisionsFormat: { valid: false, sections: [], errors: [] }
        };

        try {
            // Validate lessons.md format
            if (fs.existsSync(this.lessonsFile)) {
                const lessonsContent = fs.readFileSync(this.lessonsFile, 'utf8');
                results.lessonsFormat = this.validateLessonsFormat(lessonsContent);
            }

            // Validate decisions.md format
            if (fs.existsSync(this.decisionsFile)) {
                const decisionsContent = fs.readFileSync(this.decisionsFile, 'utf8');
                results.decisionsFormat = this.validateDecisionsFormat(decisionsContent);
            }

        } catch (error) {
            results.lessonsFormat.errors.push('Error reading lessons file: ' + error.message);
            results.decisionsFormat.errors.push('Error reading decisions file: ' + error.message);
        }

        return results;
    }

    /**
     * Validate lessons.md format and structure
     */
    validateLessonsFormat(content) {
        const result = {
            valid: false,
            sections: [],
            errors: [],
            hasTitle: false,
            hasUsageInstructions: false,
            hasLessonCategories: false,
            hasMaintenanceNotes: false
        };

        try {
            // Check for required title
            if (content.includes('# Lessons Learned')) {
                result.hasTitle = true;
            } else {
                result.errors.push('Missing main title "# Lessons Learned"');
            }

            // Check for usage instructions
            if (content.includes('## How to Use This File')) {
                result.hasUsageInstructions = true;
            } else {
                result.errors.push('Missing usage instructions section');
            }

            // Check for lesson categories (should have multiple ## sections)
            const sectionMatches = content.match(/^## [^#]/gm);
            if (sectionMatches && sectionMatches.length >= 3) {
                result.hasLessonCategories = true;
                result.sections = sectionMatches.map(match => match.replace('## ', ''));
            } else {
                result.errors.push('Insufficient lesson categories (need at least 3 sections)');
            }

            // Check for maintenance notes
            if (content.includes('Maintenance') || content.includes('maintenance')) {
                result.hasMaintenanceNotes = true;
            } else {
                result.errors.push('Missing maintenance notes section');
            }

            // Check for proper lesson format (bullet points with "When doing X, always ensure Y to prevent Z")
            const lessonPattern = /- When .+, always .+ to prevent .+\./g;
            const lessonMatches = content.match(lessonPattern);
            if (lessonMatches && lessonMatches.length > 0) {
                result.hasProperLessonFormat = true;
            } else {
                result.errors.push('No lessons found in proper format "When doing X, always ensure Y to prevent Z"');
            }

            result.valid = result.hasTitle && result.hasUsageInstructions && 
                          result.hasLessonCategories && result.hasMaintenanceNotes;

        } catch (error) {
            result.errors.push('Error parsing lessons content: ' + error.message);
        }

        return result;
    }

    /**
     * Validate decisions.md format and structure
     */
    validateDecisionsFormat(content) {
        const result = {
            valid: false,
            sections: [],
            errors: [],
            hasTitle: false,
            hasUsageInstructions: false,
            hasDecisionCategories: false,
            hasTemplate: false
        };

        try {
            // Check for required title
            if (content.includes('# Architectural Decision Records') || content.includes('# ADRs')) {
                result.hasTitle = true;
            } else {
                result.errors.push('Missing main title for ADRs');
            }

            // Check for usage instructions
            if (content.includes('## How to Use This File')) {
                result.hasUsageInstructions = true;
            } else {
                result.errors.push('Missing usage instructions section');
            }

            // Check for decision categories
            const sectionMatches = content.match(/^## [^#]/gm);
            if (sectionMatches && sectionMatches.length >= 2) {
                result.hasDecisionCategories = true;
                result.sections = sectionMatches.map(match => match.replace('## ', ''));
            } else {
                result.errors.push('Insufficient decision categories');
            }

            // Check for template section
            if (content.includes('Template') || content.includes('template')) {
                result.hasTemplate = true;
            } else {
                result.errors.push('Missing decision template section');
            }

            // Check for proper decision format
            const statusPattern = /\*\*Status\*\*:/g;
            const datePattern = /\*\*Date\*\*:/g;
            const decisionPattern = /\*\*Decision\*\*:/g;
            
            if (content.match(statusPattern) && content.match(datePattern) && content.match(decisionPattern)) {
                result.hasProperDecisionFormat = true;
            } else {
                result.errors.push('Missing proper decision format with Status, Date, and Decision fields');
            }

            result.valid = result.hasTitle && result.hasUsageInstructions && 
                          result.hasDecisionCategories && result.hasTemplate;

        } catch (error) {
            result.errors.push('Error parsing decisions content: ' + error.message);
        }

        return result;
    }

    /**
     * Validate integration with new skill system
     */
    validateSkillIntegration() {
        const results = {
            skillsCanAccessMemory: false,
            memoryReferencesValid: false,
            pathsCorrect: false,
            errors: []
        };

        try {
            // Check if skills can access memory files (relative path validation)
            const skillDirs = [
                path.join(this.aiDirectory, 'skills', 'spec-forge'),
                path.join(this.aiDirectory, 'skills', 'planning'),
                path.join(this.aiDirectory, 'skills', 'work'),
                path.join(this.aiDirectory, 'skills', 'review')
            ];

            let validSkillAccess = 0;
            for (const skillDir of skillDirs) {
                if (fs.existsSync(skillDir)) {
                    // Check if memory files are accessible from skill directory
                    const relativeMemoryPath = path.relative(skillDir, this.memoryDirectory);
                    const absoluteMemoryPath = path.resolve(skillDir, relativeMemoryPath);
                    
                    if (fs.existsSync(absoluteMemoryPath)) {
                        validSkillAccess++;
                    }
                }
            }

            if (validSkillAccess === skillDirs.length) {
                results.skillsCanAccessMemory = true;
                results.pathsCorrect = true;
            } else {
                results.errors.push(`Only ${validSkillAccess} of ${skillDirs.length} skills can access memory files`);
            }

            // Check if skill files reference memory correctly
            const mainSkillFile = path.join(this.aiDirectory, 'SKILL.md');
            if (fs.existsSync(mainSkillFile)) {
                const skillContent = fs.readFileSync(mainSkillFile, 'utf8');
                if (skillContent.includes('.ai/memory/lessons.md') && 
                    skillContent.includes('.ai/memory/decisions.md')) {
                    results.memoryReferencesValid = true;
                } else {
                    results.errors.push('Main SKILL.md does not properly reference memory files');
                }
            } else {
                results.errors.push('Main SKILL.md file not found');
            }

        } catch (error) {
            results.errors.push('Skill integration validation error: ' + error.message);
        }

        return results;
    }

    /**
     * Run complete compatibility validation
     */
    validateComplete() {
        const results = {
            fileAccess: this.validateFileAccess(),
            fileFormats: this.validateFileFormats(),
            skillIntegration: this.validateSkillIntegration(),
            overallValid: false,
            summary: {
                errors: [],
                warnings: [],
                passed: []
            }
        };

        // Compile overall results
        const allErrors = [
            ...results.fileAccess.errors,
            ...results.fileFormats.lessonsFormat.errors,
            ...results.fileFormats.decisionsFormat.errors,
            ...results.skillIntegration.errors
        ];

        results.summary.errors = allErrors;

        // Determine overall validity
        const criticalChecks = [
            results.fileAccess.lessonsExists,
            results.fileAccess.decisionsExists,
            results.fileFormats.lessonsFormat.valid,
            results.fileFormats.decisionsFormat.valid,
            results.skillIntegration.skillsCanAccessMemory
        ];

        results.overallValid = criticalChecks.every(check => check === true);

        // Generate summary
        if (results.overallValid) {
            results.summary.passed.push('All memory file compatibility checks passed');
        } else {
            results.summary.errors.push('Memory file compatibility validation failed');
        }

        return results;
    }

    /**
     * Generate compatibility report
     */
    generateReport() {
        const validation = this.validateComplete();
        
        let report = '# Memory Files Compatibility Report\n\n';
        report += `**Generated**: ${new Date().toISOString()}\n`;
        report += `**Overall Status**: ${validation.overallValid ? '✅ PASSED' : '❌ FAILED'}\n\n`;

        // File Access Results
        report += '## File Access Validation\n\n';
        report += `- Memory Directory: ${validation.fileAccess.memoryDirExists ? '✅' : '❌'}\n`;
        report += `- lessons.md: ${validation.fileAccess.lessonsExists ? '✅' : '❌'}\n`;
        report += `- decisions.md: ${validation.fileAccess.decisionsExists ? '✅' : '❌'}\n\n`;

        // Format Validation Results
        report += '## Format Validation\n\n';
        report += `### lessons.md Format: ${validation.fileFormats.lessonsFormat.valid ? '✅' : '❌'}\n`;
        if (validation.fileFormats.lessonsFormat.sections.length > 0) {
            report += 'Sections found:\n';
            validation.fileFormats.lessonsFormat.sections.forEach(section => {
                report += `- ${section}\n`;
            });
        }
        report += '\n';

        report += `### decisions.md Format: ${validation.fileFormats.decisionsFormat.valid ? '✅' : '❌'}\n`;
        if (validation.fileFormats.decisionsFormat.sections.length > 0) {
            report += 'Sections found:\n';
            validation.fileFormats.decisionsFormat.sections.forEach(section => {
                report += `- ${section}\n`;
            });
        }
        report += '\n';

        // Skill Integration Results
        report += '## Skill Integration\n\n';
        report += `- Skills can access memory: ${validation.skillIntegration.skillsCanAccessMemory ? '✅' : '❌'}\n`;
        report += `- Memory references valid: ${validation.skillIntegration.memoryReferencesValid ? '✅' : '❌'}\n`;
        report += `- File paths correct: ${validation.skillIntegration.pathsCorrect ? '✅' : '❌'}\n\n`;

        // Errors and Issues
        if (validation.summary.errors.length > 0) {
            report += '## Issues Found\n\n';
            validation.summary.errors.forEach(error => {
                report += `- ❌ ${error}\n`;
            });
            report += '\n';
        }

        // Recommendations
        report += '## Recommendations\n\n';
        if (validation.overallValid) {
            report += '✅ Memory files are fully compatible with the new EARS-workflow skill structure.\n';
            report += 'No action required.\n';
        } else {
            report += '⚠️ Memory files require attention to ensure compatibility:\n\n';
            if (!validation.fileAccess.lessonsExists || !validation.fileAccess.decisionsExists) {
                report += '1. Ensure memory files exist and are accessible\n';
            }
            if (!validation.fileFormats.lessonsFormat.valid || !validation.fileFormats.decisionsFormat.valid) {
                report += '2. Validate and fix memory file formats\n';
            }
            if (!validation.skillIntegration.skillsCanAccessMemory) {
                report += '3. Fix skill integration and file path references\n';
            }
        }

        return report;
    }
}

module.exports = MemoryCompatibilityValidator;

// CLI usage
if (require.main === module) {
    const validator = new MemoryCompatibilityValidator();
    const report = validator.generateReport();
    console.log(report);
}