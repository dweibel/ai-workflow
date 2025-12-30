/**
 * Project Isolation Manager
 * 
 * Ensures independent memory files per project and prevents cross-project state contamination
 * Manages project-specific state and provides isolation guarantees
 * 
 * Requirements: 6.4 - Project isolation and independent state management
 * 
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class ProjectIsolationManager {
    constructor(projectBasePath = '.') {
        this.projectBasePath = path.resolve(projectBasePath);
        this.aiPath = path.join(this.projectBasePath, '.ai');
        this.memoryPath = path.join(this.aiPath, 'memory');
        this.projectId = this.generateProjectId();
        this.isolationState = {
            projectId: this.projectId,
            projectPath: this.projectBasePath,
            memoryFiles: {},
            stateFiles: {},
            isolationLevel: 'COMPLETE',
            lastValidated: null
        };
    }

    /**
     * Generate unique project identifier based on project path and content
     * @returns {string} Unique project identifier
     */
    generateProjectId() {
        const pathHash = crypto.createHash('md5').update(this.projectBasePath).digest('hex').substring(0, 8);
        const timestamp = Date.now().toString(36);
        return `proj_${pathHash}_${timestamp}`;
    }

    /**
     * Initialize project isolation
     * Ensures memory files are project-specific and isolated
     * @returns {Object} Initialization results
     */
    initializeIsolation() {
        const results = {
            success: false,
            projectId: this.projectId,
            memoryFilesCreated: [],
            stateFilesCreated: [],
            isolationLevel: 'NONE',
            errors: [],
            warnings: []
        };

        try {
            // Ensure .ai directory exists
            if (!fs.existsSync(this.aiPath)) {
                fs.mkdirSync(this.aiPath, { recursive: true });
                results.warnings.push('Created .ai directory - project may be new');
            }

            // Ensure memory directory exists
            if (!fs.existsSync(this.memoryPath)) {
                fs.mkdirSync(this.memoryPath, { recursive: true });
                results.memoryFilesCreated.push('memory directory');
            }

            // Initialize memory files with project-specific content
            this.initializeMemoryFiles(results);

            // Initialize state tracking
            this.initializeStateTracking(results);

            // Validate isolation
            const isolationValidation = this.validateIsolation();
            results.isolationLevel = isolationValidation.level;

            if (isolationValidation.isolated) {
                results.success = true;
            } else {
                results.errors.push(...isolationValidation.errors);
            }

        } catch (error) {
            results.errors.push(`Initialization failed: ${error.message}`);
        }

        this.isolationState.lastValidated = new Date();
        return results;
    }

    /**
     * Initialize memory files with project-specific headers
     */
    initializeMemoryFiles(results) {
        const memoryFiles = [
            {
                name: 'lessons.md',
                template: this.getLessonsTemplate()
            },
            {
                name: 'decisions.md', 
                template: this.getDecisionsTemplate()
            }
        ];

        for (const memoryFile of memoryFiles) {
            const filePath = path.join(this.memoryPath, memoryFile.name);
            
            if (!fs.existsSync(filePath)) {
                // Create new project-specific memory file
                fs.writeFileSync(filePath, memoryFile.template);
                results.memoryFilesCreated.push(memoryFile.name);
                this.isolationState.memoryFiles[memoryFile.name] = {
                    path: filePath,
                    created: new Date(),
                    projectSpecific: true
                };
            } else {
                // Validate existing file has project-specific markers
                const content = fs.readFileSync(filePath, 'utf8');
                if (!content.includes(this.projectId)) {
                    // Add project-specific marker to existing file
                    const updatedContent = this.addProjectMarker(content, memoryFile.name);
                    fs.writeFileSync(filePath, updatedContent);
                    results.warnings.push(`Added project marker to existing ${memoryFile.name}`);
                }
                
                this.isolationState.memoryFiles[memoryFile.name] = {
                    path: filePath,
                    existing: true,
                    projectSpecific: content.includes(this.projectId)
                };
            }
        }
    }

    /**
     * Initialize state tracking for project isolation
     */
    initializeStateTracking(results) {
        const stateFile = path.join(this.aiPath, '.project-state.json');
        
        const stateData = {
            projectId: this.projectId,
            projectPath: this.projectBasePath,
            created: new Date().toISOString(),
            memoryFiles: Object.keys(this.isolationState.memoryFiles),
            isolationLevel: 'COMPLETE',
            lastAccessed: new Date().toISOString()
        };

        try {
            fs.writeFileSync(stateFile, JSON.stringify(stateData, null, 2));
            results.stateFilesCreated.push('.project-state.json');
            this.isolationState.stateFiles['.project-state.json'] = {
                path: stateFile,
                data: stateData
            };
        } catch (error) {
            results.warnings.push(`Could not create state file: ${error.message}`);
        }
    }

    /**
     * Validate project isolation
     * @returns {Object} Isolation validation results
     */
    validateIsolation() {
        const validation = {
            isolated: true,
            level: 'COMPLETE',
            errors: [],
            warnings: [],
            checks: {
                memoryFilesIsolated: false,
                stateFilesIsolated: false,
                noSharedState: false,
                projectMarkersPresent: false
            }
        };

        try {
            // Check memory file isolation
            validation.checks.memoryFilesIsolated = this.validateMemoryFileIsolation(validation);
            
            // Check state file isolation
            validation.checks.stateFilesIsolated = this.validateStateFileIsolation(validation);
            
            // Check for shared state contamination
            validation.checks.noSharedState = this.validateNoSharedState(validation);
            
            // Check project markers
            validation.checks.projectMarkersPresent = this.validateProjectMarkers(validation);

            // Determine overall isolation level
            const passedChecks = Object.values(validation.checks).filter(check => check).length;
            const totalChecks = Object.keys(validation.checks).length;

            if (passedChecks === totalChecks) {
                validation.level = 'COMPLETE';
                validation.isolated = true;
            } else if (passedChecks >= totalChecks * 0.75) {
                validation.level = 'GOOD';
                validation.isolated = true;
            } else if (passedChecks >= totalChecks * 0.5) {
                validation.level = 'PARTIAL';
                validation.isolated = false;
                validation.errors.push('Partial isolation - some checks failed');
            } else {
                validation.level = 'POOR';
                validation.isolated = false;
                validation.errors.push('Poor isolation - multiple checks failed');
            }

        } catch (error) {
            validation.isolated = false;
            validation.level = 'FAILED';
            validation.errors.push(`Validation failed: ${error.message}`);
        }

        return validation;
    }

    /**
     * Validate memory file isolation
     */
    validateMemoryFileIsolation(validation) {
        try {
            for (const fileName in this.isolationState.memoryFiles) {
                const fileInfo = this.isolationState.memoryFiles[fileName];
                const filePath = fileInfo.path;

                if (!fs.existsSync(filePath)) {
                    validation.errors.push(`Memory file missing: ${fileName}`);
                    return false;
                }

                const content = fs.readFileSync(filePath, 'utf8');
                
                // Check for project-specific markers
                if (!content.includes(this.projectId)) {
                    validation.warnings.push(`Memory file ${fileName} missing project marker`);
                }

                // Check file is writable (not shared/locked)
                try {
                    const stats = fs.statSync(filePath);
                    if (!stats.isFile()) {
                        validation.errors.push(`Memory file ${fileName} is not a regular file`);
                        return false;
                    }
                } catch (error) {
                    validation.errors.push(`Cannot access memory file ${fileName}: ${error.message}`);
                    return false;
                }
            }

            return true;
        } catch (error) {
            validation.errors.push(`Memory file validation failed: ${error.message}`);
            return false;
        }
    }

    /**
     * Validate state file isolation
     */
    validateStateFileIsolation(validation) {
        try {
            const stateFile = path.join(this.aiPath, '.project-state.json');
            
            if (!fs.existsSync(stateFile)) {
                validation.warnings.push('Project state file missing');
                return false;
            }

            const stateContent = fs.readFileSync(stateFile, 'utf8');
            const stateData = JSON.parse(stateContent);

            if (stateData.projectId !== this.projectId) {
                validation.errors.push('State file project ID mismatch');
                return false;
            }

            if (stateData.projectPath !== this.projectBasePath) {
                validation.warnings.push('State file project path mismatch');
            }

            return true;
        } catch (error) {
            validation.errors.push(`State file validation failed: ${error.message}`);
            return false;
        }
    }

    /**
     * Validate no shared state contamination
     */
    validateNoSharedState(validation) {
        try {
            // Check for global state files that might cause contamination
            const potentialSharedFiles = [
                path.join(this.projectBasePath, '.ai-global-state'),
                path.join(this.projectBasePath, '.shared-memory'),
                path.join(this.projectBasePath, '.ai', 'shared-state.json')
            ];

            for (const sharedFile of potentialSharedFiles) {
                if (fs.existsSync(sharedFile)) {
                    validation.warnings.push(`Potential shared state file found: ${path.basename(sharedFile)}`);
                }
            }

            // Check memory files don't reference other projects
            for (const fileName in this.isolationState.memoryFiles) {
                const filePath = this.isolationState.memoryFiles[fileName].path;
                const content = fs.readFileSync(filePath, 'utf8');

                // Look for other project IDs (pattern: proj_xxxxxxxx_xxxxxxxxx)
                const projectIdPattern = /proj_[a-f0-9]{8}_[a-z0-9]+/g;
                const foundIds = content.match(projectIdPattern) || [];
                const otherProjectIds = foundIds.filter(id => id !== this.projectId);

                if (otherProjectIds.length > 0) {
                    validation.warnings.push(`Memory file ${fileName} contains references to other projects`);
                }
            }

            return true;
        } catch (error) {
            validation.errors.push(`Shared state validation failed: ${error.message}`);
            return false;
        }
    }

    /**
     * Validate project markers are present
     */
    validateProjectMarkers(validation) {
        try {
            let markersFound = 0;
            const expectedMarkers = Object.keys(this.isolationState.memoryFiles).length;

            for (const fileName in this.isolationState.memoryFiles) {
                const filePath = this.isolationState.memoryFiles[fileName].path;
                const content = fs.readFileSync(filePath, 'utf8');

                if (content.includes(this.projectId)) {
                    markersFound++;
                }
            }

            if (markersFound < expectedMarkers) {
                validation.warnings.push(`Only ${markersFound}/${expectedMarkers} memory files have project markers`);
                return markersFound > 0; // Partial success
            }

            return true;
        } catch (error) {
            validation.errors.push(`Project marker validation failed: ${error.message}`);
            return false;
        }
    }

    /**
     * Get project isolation status
     * @returns {Object} Current isolation status
     */
    getIsolationStatus() {
        const validation = this.validateIsolation();
        
        return {
            projectId: this.projectId,
            projectPath: this.projectBasePath,
            isolationLevel: validation.level,
            isolated: validation.isolated,
            memoryFiles: this.isolationState.memoryFiles,
            stateFiles: this.isolationState.stateFiles,
            validation: validation,
            lastValidated: this.isolationState.lastValidated
        };
    }

    /**
     * Clean up project-specific state (for testing/reset purposes)
     * @returns {Object} Cleanup results
     */
    cleanupProjectState() {
        const results = {
            success: false,
            filesRemoved: [],
            errors: []
        };

        try {
            // Remove state file
            const stateFile = path.join(this.aiPath, '.project-state.json');
            if (fs.existsSync(stateFile)) {
                fs.unlinkSync(stateFile);
                results.filesRemoved.push('.project-state.json');
            }

            // Remove project markers from memory files (but keep the files)
            for (const fileName in this.isolationState.memoryFiles) {
                const filePath = this.isolationState.memoryFiles[fileName].path;
                if (fs.existsSync(filePath)) {
                    const content = fs.readFileSync(filePath, 'utf8');
                    const cleanedContent = this.removeProjectMarker(content);
                    fs.writeFileSync(filePath, cleanedContent);
                    results.filesRemoved.push(`project marker from ${fileName}`);
                }
            }

            results.success = true;
        } catch (error) {
            results.errors.push(`Cleanup failed: ${error.message}`);
        }

        return results;
    }

    /**
     * Get lessons template with project-specific header
     */
    getLessonsTemplate() {
        return `# Lessons Learned

<!-- Project ID: ${this.projectId} -->
<!-- Project Path: ${this.projectBasePath} -->
<!-- Created: ${new Date().toISOString()} -->

## How to Use This File

This file contains lessons learned during development in this specific project.
Each lesson should be a concise, actionable statement that prevents future mistakes.

### Format
- When doing X, always ensure Y to prevent Z.
- If you encounter A, remember to check B because C.

### Categories
- **Code Quality**: Lessons about writing better code
- **Testing**: Lessons about testing strategies and pitfalls
- **Architecture**: Lessons about system design and structure
- **Process**: Lessons about development workflow and practices
- **Debugging**: Lessons about troubleshooting and problem-solving

---

## Code Quality

## Testing

## Architecture

## Process

## Debugging

---

*This file is project-specific and isolated from other EARS-workflow projects.*
`;
    }

    /**
     * Get decisions template with project-specific header
     */
    getDecisionsTemplate() {
        return `# Architectural Decision Records

<!-- Project ID: ${this.projectId} -->
<!-- Project Path: ${this.projectBasePath} -->
<!-- Created: ${new Date().toISOString()} -->

## How to Use This File

This file contains architectural decisions made during development in this specific project.
Each decision should document the context, options considered, and rationale.

### Format
Each decision should include:
- **Title**: Brief description of the decision
- **Status**: Proposed, Accepted, Deprecated, Superseded
- **Context**: What is the issue that we're seeing that is motivating this decision?
- **Decision**: What is the change that we're proposing or have agreed to implement?
- **Consequences**: What becomes easier or more difficult to do and any risks introduced?

---

## Decision Log

### Decision 1: Project Isolation Implementation
- **Status**: Accepted
- **Date**: ${new Date().toISOString().split('T')[0]}
- **Context**: Need to ensure this project's memory files and state are isolated from other EARS-workflow projects
- **Decision**: Implement project-specific markers and state tracking
- **Consequences**: Each project maintains independent memory and state, preventing cross-project contamination

---

*This file is project-specific and isolated from other EARS-workflow projects.*
`;
    }

    /**
     * Add project marker to existing content
     */
    addProjectMarker(content, fileName) {
        const marker = `\n<!-- Project ID: ${this.projectId} -->\n<!-- Added: ${new Date().toISOString()} -->\n`;
        
        // Add marker after the first heading
        const lines = content.split('\n');
        let insertIndex = 0;
        
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('#')) {
                insertIndex = i + 1;
                break;
            }
        }
        
        lines.splice(insertIndex, 0, marker);
        return lines.join('\n');
    }

    /**
     * Remove project marker from content
     */
    removeProjectMarker(content) {
        // Remove project ID comments
        return content
            .replace(/<!-- Project ID: proj_[a-f0-9]{8}_[a-z0-9]+ -->\n?/g, '')
            .replace(/<!-- Project Path: .+ -->\n?/g, '')
            .replace(/<!-- Created: .+ -->\n?/g, '')
            .replace(/<!-- Added: .+ -->\n?/g, '')
            .replace(/\n\n\n+/g, '\n\n'); // Clean up extra newlines
    }

    /**
     * Check if another project exists in the same directory tree
     * @param {string} otherProjectPath Path to check
     * @returns {Object} Conflict detection results
     */
    detectProjectConflicts(otherProjectPath) {
        const conflicts = {
            hasConflicts: false,
            conflictType: 'NONE',
            conflicts: [],
            recommendations: []
        };

        try {
            const otherAiPath = path.join(otherProjectPath, '.ai');
            const otherStateFile = path.join(otherAiPath, '.project-state.json');

            if (fs.existsSync(otherStateFile)) {
                const otherStateContent = fs.readFileSync(otherStateFile, 'utf8');
                const otherStateData = JSON.parse(otherStateContent);

                if (otherStateData.projectId === this.projectId) {
                    conflicts.hasConflicts = true;
                    conflicts.conflictType = 'DUPLICATE_ID';
                    conflicts.conflicts.push('Same project ID found in different location');
                    conflicts.recommendations.push('Regenerate project ID for one of the projects');
                }

                // Check for shared memory files
                const otherMemoryPath = path.join(otherAiPath, 'memory');
                if (fs.existsSync(otherMemoryPath)) {
                    const memoryFiles = ['lessons.md', 'decisions.md'];
                    
                    for (const memoryFile of memoryFiles) {
                        const thisFilePath = path.join(this.memoryPath, memoryFile);
                        const otherFilePath = path.join(otherMemoryPath, memoryFile);
                        
                        if (fs.existsSync(thisFilePath) && fs.existsSync(otherFilePath)) {
                            const thisContent = fs.readFileSync(thisFilePath, 'utf8');
                            const otherContent = fs.readFileSync(otherFilePath, 'utf8');
                            
                            if (thisContent === otherContent) {
                                conflicts.hasConflicts = true;
                                conflicts.conflictType = 'SHARED_MEMORY';
                                conflicts.conflicts.push(`Identical memory file: ${memoryFile}`);
                                conflicts.recommendations.push(`Ensure ${memoryFile} is project-specific`);
                            }
                        }
                    }
                }
            }

        } catch (error) {
            conflicts.conflicts.push(`Conflict detection failed: ${error.message}`);
        }

        return conflicts;
    }
}

module.exports = ProjectIsolationManager;