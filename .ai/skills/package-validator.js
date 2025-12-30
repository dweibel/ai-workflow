/**
 * Package Installation Validator
 * 
 * Validates complete EARS-workflow skill package installation
 * Ensures all required files are present and properly configured
 * Includes dependency verification and structure validation
 * 
 * Requirements: 6.2 - Package completeness validation
 * 
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

// Simple YAML parser for basic frontmatter (fallback if js-yaml not available)
const parseYaml = (yamlContent) => {
    try {
        // Try to use js-yaml if available
        const yaml = require('js-yaml');
        return yaml.load(yamlContent);
    } catch (requireError) {
        // Fallback to simple parsing
        const result = {};
        const lines = yamlContent.split('\n');
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const colonIndex = trimmed.indexOf(':');
                if (colonIndex > 0) {
                    const key = trimmed.substring(0, colonIndex).trim();
                    let value = trimmed.substring(colonIndex + 1).trim();
                    
                    // Remove quotes if present
                    if ((value.startsWith('"') && value.endsWith('"')) || 
                        (value.startsWith("'") && value.endsWith("'"))) {
                        value = value.slice(1, -1);
                    }
                    
                    result[key] = value;
                }
            }
        }
        
        return result;
    }
};

class PackageValidator {
    constructor(basePath = '.ai') {
        this.basePath = basePath;
        this.requiredFiles = [
            'SKILL.md',
            'skills/spec-forge/SKILL.md',
            'skills/planning/SKILL.md', 
            'skills/work/SKILL.md',
            'skills/review/SKILL.md',
            'skills/git-worktree/SKILL.md',
            'skills/project-reset/SKILL.md',
            'memory/lessons.md',
            'memory/decisions.md'
        ];
        
        this.requiredDirectories = [
            'skills',
            'skills/spec-forge',
            'skills/planning',
            'skills/work', 
            'skills/review',
            'skills/git-worktree',
            'skills/project-reset',
            'memory',
            'workflows',
            'templates',
            'prompts',
            'protocols',
            'roles',
            'docs'
        ];
        
        this.validationResults = {
            overallValid: false,
            errors: [],
            warnings: [],
            fileValidation: {},
            directoryValidation: {},
            skillValidation: {},
            dependencyValidation: {},
            summary: {}
        };
    }

    /**
     * Validate complete package installation
     * @returns {Object} Comprehensive validation results
     */
    validateComplete() {
        this.resetValidation();
        
        try {
            // Validate directory structure
            this.validateDirectoryStructure();
            
            // Validate required files
            this.validateRequiredFiles();
            
            // Validate SKILL.md files
            this.validateSkillFiles();
            
            // Validate dependencies
            this.validateDependencies();
            
            // Validate memory files
            this.validateMemoryFiles();
            
            // Generate summary
            this.generateSummary();
            
        } catch (error) {
            this.validationResults.errors.push(`Validation failed: ${error.message}`);
        }
        
        return this.validationResults;
    }

    /**
     * Validate directory structure exists
     */
    validateDirectoryStructure() {
        for (const dir of this.requiredDirectories) {
            const dirPath = path.join(this.basePath, dir);
            const exists = fs.existsSync(dirPath);
            
            this.validationResults.directoryValidation[dir] = {
                exists: exists,
                path: dirPath,
                isDirectory: exists ? fs.statSync(dirPath).isDirectory() : false
            };
            
            if (!exists) {
                this.validationResults.errors.push(`Required directory missing: ${dirPath}`);
            } else if (!fs.statSync(dirPath).isDirectory()) {
                this.validationResults.errors.push(`Path exists but is not a directory: ${dirPath}`);
            }
        }
    }

    /**
     * Validate required files exist and are readable
     */
    validateRequiredFiles() {
        for (const file of this.requiredFiles) {
            const filePath = path.join(this.basePath, file);
            const exists = fs.existsSync(filePath);
            
            this.validationResults.fileValidation[file] = {
                exists: exists,
                path: filePath,
                readable: false,
                size: 0,
                content: null
            };
            
            if (!exists) {
                this.validationResults.errors.push(`Required file missing: ${filePath}`);
            } else {
                try {
                    const stats = fs.statSync(filePath);
                    const content = fs.readFileSync(filePath, 'utf8');
                    
                    this.validationResults.fileValidation[file].readable = true;
                    this.validationResults.fileValidation[file].size = stats.size;
                    this.validationResults.fileValidation[file].content = content;
                    
                    if (stats.size === 0) {
                        this.validationResults.warnings.push(`File is empty: ${filePath}`);
                    }
                } catch (error) {
                    this.validationResults.errors.push(`Cannot read file ${filePath}: ${error.message}`);
                }
            }
        }
    }

    /**
     * Validate SKILL.md files have proper YAML frontmatter and structure
     */
    validateSkillFiles() {
        const skillFiles = this.requiredFiles.filter(file => file.endsWith('SKILL.md'));
        
        for (const skillFile of skillFiles) {
            const fileData = this.validationResults.fileValidation[skillFile];
            
            if (!fileData || !fileData.readable) {
                continue; // Already reported as error
            }
            
            const skillName = skillFile === 'SKILL.md' ? 'main' : path.dirname(skillFile).split('/').pop();
            
            this.validationResults.skillValidation[skillName] = {
                file: skillFile,
                hasYamlFrontmatter: false,
                yamlValid: false,
                requiredFields: {},
                metadata: null,
                errors: [],
                warnings: []
            };
            
            try {
                const content = fileData.content;
                
                // Check for YAML frontmatter
                if (!content.startsWith('---\n')) {
                    this.validationResults.skillValidation[skillName].errors.push('Missing YAML frontmatter');
                    continue;
                }
                
                this.validationResults.skillValidation[skillName].hasYamlFrontmatter = true;
                
                // Extract and parse YAML
                const yamlEndIndex = content.indexOf('\n---\n', 4);
                if (yamlEndIndex === -1) {
                    this.validationResults.skillValidation[skillName].errors.push('YAML frontmatter not properly closed');
                    continue;
                }
                
                const yamlContent = content.substring(4, yamlEndIndex);
                const metadata = parseYaml(yamlContent);
                
                this.validationResults.skillValidation[skillName].yamlValid = true;
                this.validationResults.skillValidation[skillName].metadata = metadata;
                
                // Validate required fields
                const requiredFields = ['name', 'description', 'version'];
                for (const field of requiredFields) {
                    const hasField = metadata && metadata[field];
                    this.validationResults.skillValidation[skillName].requiredFields[field] = hasField;
                    
                    if (!hasField) {
                        this.validationResults.skillValidation[skillName].errors.push(`Missing required field: ${field}`);
                    }
                }
                
                // Validate field formats
                if (metadata) {
                    if (metadata.name && typeof metadata.name !== 'string') {
                        this.validationResults.skillValidation[skillName].warnings.push('Name should be a string');
                    }
                    
                    if (metadata.version && !this.isValidVersion(metadata.version)) {
                        this.validationResults.skillValidation[skillName].warnings.push('Version should follow semantic versioning (e.g., 1.0.0)');
                    }
                    
                    if (metadata.description && metadata.description.length < 10) {
                        this.validationResults.skillValidation[skillName].warnings.push('Description should be more descriptive (at least 10 characters)');
                    }
                }
                
            } catch (error) {
                this.validationResults.skillValidation[skillName].errors.push(`YAML parsing error: ${error.message}`);
            }
        }
    }

    /**
     * Validate package dependencies and external requirements
     */
    validateDependencies() {
        this.validationResults.dependencyValidation = {
            nodeModules: false,
            packageJson: false,
            gitRepository: false,
            requiredScripts: {},
            externalDependencies: {}
        };
        
        // Check for package.json
        const packageJsonPath = 'package.json';
        if (fs.existsSync(packageJsonPath)) {
            this.validationResults.dependencyValidation.packageJson = true;
            
            try {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                
                // Check for required scripts
                const requiredScripts = ['test'];
                for (const script of requiredScripts) {
                    this.validationResults.dependencyValidation.requiredScripts[script] = 
                        packageJson.scripts && packageJson.scripts[script];
                }
                
                // Check for testing dependencies
                const testingDeps = ['jest', 'fast-check'];
                for (const dep of testingDeps) {
                    this.validationResults.dependencyValidation.externalDependencies[dep] = 
                        (packageJson.devDependencies && packageJson.devDependencies[dep]) ||
                        (packageJson.dependencies && packageJson.dependencies[dep]);
                }
                
            } catch (error) {
                this.validationResults.warnings.push(`Cannot parse package.json: ${error.message}`);
            }
        } else {
            this.validationResults.warnings.push('No package.json found - testing framework may not be available');
        }
        
        // Check for node_modules (if package.json exists)
        if (this.validationResults.dependencyValidation.packageJson) {
            this.validationResults.dependencyValidation.nodeModules = fs.existsSync('node_modules');
            
            if (!this.validationResults.dependencyValidation.nodeModules) {
                this.validationResults.warnings.push('node_modules not found - run npm install to install dependencies');
            }
        }
        
        // Check for git repository
        this.validationResults.dependencyValidation.gitRepository = fs.existsSync('.git');
        
        if (!this.validationResults.dependencyValidation.gitRepository) {
            this.validationResults.warnings.push('Not a git repository - version control recommended for skill packages');
        }
    }

    /**
     * Validate memory files have proper structure
     */
    validateMemoryFiles() {
        const memoryFiles = ['memory/lessons.md', 'memory/decisions.md'];
        
        for (const memoryFile of memoryFiles) {
            const fileData = this.validationResults.fileValidation[memoryFile];
            
            if (!fileData || !fileData.readable) {
                continue; // Already reported as error
            }
            
            const content = fileData.content;
            const fileName = path.basename(memoryFile, '.md');
            
            // Basic structure validation
            if (!content.includes(`# ${fileName.charAt(0).toUpperCase() + fileName.slice(1)}`)) {
                this.validationResults.warnings.push(`Memory file ${memoryFile} missing expected title`);
            }
            
            if (!content.includes('## How to Use This File')) {
                this.validationResults.warnings.push(`Memory file ${memoryFile} missing usage instructions`);
            }
            
            // Check for reasonable content length
            if (content.length < 100) {
                this.validationResults.warnings.push(`Memory file ${memoryFile} seems too short - may be missing content`);
            }
        }
    }

    /**
     * Generate validation summary
     */
    generateSummary() {
        const summary = {
            totalFiles: this.requiredFiles.length,
            validFiles: 0,
            totalDirectories: this.requiredDirectories.length,
            validDirectories: 0,
            totalSkills: 0,
            validSkills: 0,
            errorCount: this.validationResults.errors.length,
            warningCount: this.validationResults.warnings.length
        };
        
        // Count valid files
        for (const file of this.requiredFiles) {
            const fileData = this.validationResults.fileValidation[file];
            if (fileData && fileData.exists && fileData.readable) {
                summary.validFiles++;
            }
        }
        
        // Count valid directories
        for (const dir of this.requiredDirectories) {
            const dirData = this.validationResults.directoryValidation[dir];
            if (dirData && dirData.exists && dirData.isDirectory) {
                summary.validDirectories++;
            }
        }
        
        // Count valid skills
        for (const skillName in this.validationResults.skillValidation) {
            summary.totalSkills++;
            const skillData = this.validationResults.skillValidation[skillName];
            if (skillData.hasYamlFrontmatter && skillData.yamlValid && skillData.errors.length === 0) {
                summary.validSkills++;
            }
        }
        
        // Determine overall validity
        this.validationResults.overallValid = 
            summary.errorCount === 0 && 
            summary.validFiles === summary.totalFiles &&
            summary.validDirectories === summary.totalDirectories &&
            summary.validSkills === summary.totalSkills;
        
        this.validationResults.summary = summary;
    }

    /**
     * Quick validation check for basic installation
     * @returns {Object} Basic validation results
     */
    validateBasicInstallation() {
        const basicResults = {
            installed: false,
            mainSkillExists: false,
            memoryFilesExist: false,
            skillsDirectoryExists: false,
            errors: []
        };
        
        try {
            // Check main SKILL.md
            const mainSkillPath = path.join(this.basePath, 'SKILL.md');
            basicResults.mainSkillExists = fs.existsSync(mainSkillPath);
            
            if (!basicResults.mainSkillExists) {
                basicResults.errors.push('Main SKILL.md file not found');
            }
            
            // Check memory files
            const lessonsPath = path.join(this.basePath, 'memory/lessons.md');
            const decisionsPath = path.join(this.basePath, 'memory/decisions.md');
            basicResults.memoryFilesExist = fs.existsSync(lessonsPath) && fs.existsSync(decisionsPath);
            
            if (!basicResults.memoryFilesExist) {
                basicResults.errors.push('Memory files (lessons.md or decisions.md) not found');
            }
            
            // Check skills directory
            const skillsPath = path.join(this.basePath, 'skills');
            basicResults.skillsDirectoryExists = fs.existsSync(skillsPath) && fs.statSync(skillsPath).isDirectory();
            
            if (!basicResults.skillsDirectoryExists) {
                basicResults.errors.push('Skills directory not found');
            }
            
            // Overall installation check
            basicResults.installed = 
                basicResults.mainSkillExists && 
                basicResults.memoryFilesExist && 
                basicResults.skillsDirectoryExists &&
                basicResults.errors.length === 0;
                
        } catch (error) {
            basicResults.errors.push(`Validation error: ${error.message}`);
        }
        
        return basicResults;
    }

    /**
     * Get installation status with recommendations
     * @returns {Object} Installation status and recommendations
     */
    getInstallationStatus() {
        const basicValidation = this.validateBasicInstallation();
        const completeValidation = this.validateComplete();
        
        return {
            basicInstallation: basicValidation,
            completeValidation: completeValidation,
            recommendations: this.generateRecommendations(basicValidation, completeValidation),
            installationLevel: this.determineInstallationLevel(basicValidation, completeValidation)
        };
    }

    /**
     * Generate recommendations based on validation results
     */
    generateRecommendations(basicValidation, completeValidation) {
        const recommendations = [];
        
        if (!basicValidation.installed) {
            recommendations.push({
                priority: 'HIGH',
                category: 'Installation',
                message: 'Basic EARS-workflow skill package installation is incomplete',
                actions: basicValidation.errors
            });
        }
        
        if (completeValidation.summary.errorCount > 0) {
            recommendations.push({
                priority: 'HIGH',
                category: 'Errors',
                message: `${completeValidation.summary.errorCount} critical errors found`,
                actions: completeValidation.errors.slice(0, 5) // Top 5 errors
            });
        }
        
        if (completeValidation.summary.warningCount > 0) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'Warnings',
                message: `${completeValidation.summary.warningCount} warnings found`,
                actions: completeValidation.warnings.slice(0, 3) // Top 3 warnings
            });
        }
        
        if (!completeValidation.dependencyValidation.nodeModules) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'Dependencies',
                message: 'Testing dependencies not installed',
                actions: ['Run: npm install', 'Ensure package.json exists']
            });
        }
        
        return recommendations;
    }

    /**
     * Determine installation completeness level
     */
    determineInstallationLevel(basicValidation, completeValidation) {
        if (!basicValidation.installed) {
            return 'NONE';
        }
        
        if (completeValidation.summary.errorCount > 0) {
            return 'PARTIAL';
        }
        
        if (completeValidation.summary.warningCount > 5) {
            return 'BASIC';
        }
        
        if (completeValidation.overallValid) {
            return 'COMPLETE';
        }
        
        return 'FUNCTIONAL';
    }

    /**
     * Reset validation results
     */
    resetValidation() {
        this.validationResults = {
            overallValid: false,
            errors: [],
            warnings: [],
            fileValidation: {},
            directoryValidation: {},
            skillValidation: {},
            dependencyValidation: {},
            summary: {}
        };
    }

    /**
     * Validate semantic version format
     */
    isValidVersion(version) {
        const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
        return semverRegex.test(version);
    }
}

module.exports = PackageValidator;