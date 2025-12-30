/**
 * EARS-Workflow Phase Context Manager
 * 
 * Manages context loading and unloading during phase transitions.
 * Optimizes token usage by loading only relevant phase-specific content.
 * Integrates with the main context manager for efficient resource usage.
 * 
 * @version 1.0.0
 * @author EARS-Workflow System
 */

const path = require('path');

class PhaseContextManager {
    constructor(contextManager = null) {
        // Reference to main context manager
        this.contextManager = contextManager;
        
        // Phase-specific file mappings
        this.phaseFiles = {
            'spec-forge': [
                '.ai/workflows/ears-workflow.md',
                '.ai/templates/requirements-template.md',
                '.ai/templates/ears-validation.md',
                '.ai/templates/incose-validation.md',
                '.ai/prompts/testability-analysis.md',
                '.ai/prompts/correctness-properties.md'
            ],
            'planning': [
                '.ai/workflows/planning.md',
                '.ai/roles/architect.md',
                '.ai/docs/plans/README.md',
                '.ai/memory/decisions.md'
            ],
            'work': [
                '.ai/workflows/execution.md',
                '.ai/protocols/git-worktree.md',
                '.ai/roles/builder.md',
                '.ai/protocols/testing.md',
                '.ai/skills/git-worktree/README.md'
            ],
            'review': [
                '.ai/workflows/review.md',
                '.ai/roles/auditor.md',
                '.ai/docs/reviews/README.md'
            ]
        };

        // Always-loaded files (core memory)
        this.coreFiles = [
            '.ai/memory/lessons.md',
            '.ai/memory/decisions.md'
        ];

        // Current phase state
        this.currentPhase = null;
        this.loadedPhaseFiles = new Set();
        this.phaseTransitionHistory = [];

        // Context optimization settings
        this.maxPhaseFiles = 6;
        this.maxTransitionHistory = 10;
    }

    /**
     * Transition to a new phase with optimized context loading
     * @param {string} newPhase - Target phase to transition to
     * @param {Object} options - Transition options
     * @returns {Promise<Object>} Transition result
     */
    async transitionToPhase(newPhase, options = {}) {
        try {
            const {
                unloadPrevious = true,
                preloadSupporting = false,
                maintainCore = true
            } = options;

            // Validate phase
            if (!this.phaseFiles[newPhase]) {
                throw new Error(`Unknown phase: ${newPhase}`);
            }

            const transitionStart = Date.now();
            let tokensFreed = 0;
            let tokensLoaded = 0;

            // Step 1: Unload previous phase context (if requested)
            if (unloadPrevious && this.currentPhase && this.currentPhase !== newPhase) {
                const unloadResult = await this.unloadPhaseContext(this.currentPhase, maintainCore);
                tokensFreed = unloadResult.tokensFreed;
            }

            // Step 2: Load new phase context
            const loadResult = await this.loadPhaseContext(newPhase, preloadSupporting);
            tokensLoaded = loadResult.tokensLoaded;

            // Step 3: Update phase state
            const previousPhase = this.currentPhase;
            this.currentPhase = newPhase;

            // Step 4: Record transition
            this.recordPhaseTransition(previousPhase, newPhase, {
                tokensFreed,
                tokensLoaded,
                duration: Date.now() - transitionStart
            });

            return {
                success: true,
                previousPhase: previousPhase,
                newPhase: newPhase,
                tokensFreed: tokensFreed,
                tokensLoaded: tokensLoaded,
                netTokenChange: tokensLoaded - tokensFreed,
                filesLoaded: loadResult.filesLoaded,
                filesUnloaded: unloadPrevious ? this.phaseFiles[previousPhase]?.length || 0 : 0,
                transitionTime: Date.now() - transitionStart
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                currentPhase: this.currentPhase,
                targetPhase: newPhase
            };
        }
    }

    /**
     * Load context files for a specific phase
     * @param {string} phase - Phase to load context for
     * @param {boolean} preloadSupporting - Whether to preload supporting files
     * @returns {Promise<Object>} Loading result
     */
    async loadPhaseContext(phase, preloadSupporting = false) {
        try {
            const phaseFiles = this.phaseFiles[phase] || [];
            let tokensLoaded = 0;
            let filesLoaded = 0;
            const loadedFiles = [];

            // Load core phase files
            for (const filePath of phaseFiles) {
                if (this.contextManager) {
                    const result = await this.contextManager.loadSupportingFile(filePath, phase);
                    if (result.success && !result.alreadyLoaded) {
                        tokensLoaded += result.tokensUsed;
                        filesLoaded++;
                        loadedFiles.push(filePath);
                        this.loadedPhaseFiles.add(filePath);
                    }
                }
            }

            // Load supporting files if requested and context allows
            if (preloadSupporting && this.contextManager) {
                const supportingFiles = await this.getSupportingFiles(phase);
                const contextStatus = this.contextManager.getContextStatus();
                
                // Only load supporting files if we have context space
                if (contextStatus.utilizationPercent < 70) {
                    for (const filePath of supportingFiles.slice(0, 3)) { // Limit to 3 supporting files
                        const result = await this.contextManager.loadSupportingFile(filePath, `${phase}-supporting`);
                        if (result.success && !result.alreadyLoaded) {
                            tokensLoaded += result.tokensUsed;
                            filesLoaded++;
                            loadedFiles.push(filePath);
                        }
                    }
                }
            }

            return {
                success: true,
                phase: phase,
                tokensLoaded: tokensLoaded,
                filesLoaded: filesLoaded,
                loadedFiles: loadedFiles
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                phase: phase,
                tokensLoaded: 0,
                filesLoaded: 0
            };
        }
    }

    /**
     * Unload context files for a specific phase
     * @param {string} phase - Phase to unload context for
     * @param {boolean} maintainCore - Whether to maintain core files
     * @returns {Promise<Object>} Unloading result
     */
    async unloadPhaseContext(phase, maintainCore = true) {
        try {
            const phaseFiles = this.phaseFiles[phase] || [];
            let tokensFreed = 0;
            let filesUnloaded = 0;
            const unloadedFiles = [];

            // Determine files to unload
            const filesToUnload = phaseFiles.filter(filePath => {
                // Keep core files if maintainCore is true
                if (maintainCore && this.coreFiles.includes(filePath)) {
                    return false;
                }
                return this.loadedPhaseFiles.has(filePath);
            });

            // Unload files through context manager
            if (this.contextManager && filesToUnload.length > 0) {
                const result = this.contextManager.unloadSupportingFiles(filesToUnload);
                if (result.success) {
                    tokensFreed = result.tokensFreed;
                    filesUnloaded = result.filesUnloaded;
                    unloadedFiles.push(...filesToUnload);
                    
                    // Update loaded files tracking
                    filesToUnload.forEach(filePath => {
                        this.loadedPhaseFiles.delete(filePath);
                    });
                }
            }

            return {
                success: true,
                phase: phase,
                tokensFreed: tokensFreed,
                filesUnloaded: filesUnloaded,
                unloadedFiles: unloadedFiles
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                phase: phase,
                tokensFreed: 0,
                filesUnloaded: 0
            };
        }
    }

    /**
     * Get supporting files for a phase (files that might be useful but not essential)
     * @param {string} phase - Phase to get supporting files for
     * @returns {Promise<Array>} Array of supporting file paths
     */
    async getSupportingFiles(phase) {
        const supportingFiles = {
            'spec-forge': [
                '.ai/docs/requirements/README.md',
                '.ai/prompts/round-trip-detection.md',
                '.ai/templates/lessons.template.md'
            ],
            'planning': [
                '.ai/docs/design/README.md',
                '.ai/templates/decisions.template.md',
                '.ai/protocols/migrations.md'
            ],
            'work': [
                '.ai/skills/git-worktree/examples.md',
                '.ai/skills/git-worktree/git-worktree.sh',
                '.ai/docs/tasks/README.md'
            ],
            'review': [
                '.ai/docs/reviews/README.md',
                '.ai/protocols/testing.md'
            ]
        };

        return supportingFiles[phase] || [];
    }

    /**
     * Record a phase transition for analysis and optimization
     * @param {string} fromPhase - Previous phase
     * @param {string} toPhase - New phase
     * @param {Object} metrics - Transition metrics
     */
    recordPhaseTransition(fromPhase, toPhase, metrics) {
        const transition = {
            from: fromPhase,
            to: toPhase,
            timestamp: new Date(),
            metrics: metrics
        };

        this.phaseTransitionHistory.push(transition);

        // Maintain history size limit
        if (this.phaseTransitionHistory.length > this.maxTransitionHistory) {
            this.phaseTransitionHistory.shift();
        }
    }

    /**
     * Get current phase context status
     * @returns {Object} Phase context status
     */
    getPhaseContextStatus() {
        const contextStatus = this.contextManager ? this.contextManager.getContextStatus() : null;
        
        return {
            currentPhase: this.currentPhase,
            loadedPhaseFiles: Array.from(this.loadedPhaseFiles),
            phaseFileCount: this.loadedPhaseFiles.size,
            availablePhases: Object.keys(this.phaseFiles),
            transitionHistory: this.phaseTransitionHistory.slice(-5), // Last 5 transitions
            contextManager: contextStatus ? {
                totalTokens: contextStatus.tokenUsage.total,
                utilizationPercent: contextStatus.utilizationPercent,
                activeSkills: contextStatus.activeSkills
            } : null
        };
    }

    /**
     * Optimize phase context by unloading unused files
     * @returns {Promise<Object>} Optimization result
     */
    async optimizePhaseContext() {
        try {
            if (!this.contextManager) {
                return { success: false, error: 'Context manager not available' };
            }

            const contextStatus = this.contextManager.getContextStatus();
            let tokensFreed = 0;
            let filesUnloaded = 0;

            // If context usage is high, unload non-essential files
            if (contextStatus.utilizationPercent > 75) {
                // Find files that are not part of current phase
                const currentPhaseFiles = new Set(this.phaseFiles[this.currentPhase] || []);
                const coreFilesSet = new Set(this.coreFiles);
                
                const filesToUnload = Array.from(this.loadedPhaseFiles).filter(filePath => {
                    return !currentPhaseFiles.has(filePath) && !coreFilesSet.has(filePath);
                });

                if (filesToUnload.length > 0) {
                    const result = this.contextManager.unloadSupportingFiles(filesToUnload);
                    if (result.success) {
                        tokensFreed = result.tokensFreed;
                        filesUnloaded = result.filesUnloaded;
                        
                        // Update tracking
                        filesToUnload.forEach(filePath => {
                            this.loadedPhaseFiles.delete(filePath);
                        });
                    }
                }
            }

            return {
                success: true,
                tokensFreed: tokensFreed,
                filesUnloaded: filesUnloaded,
                newUtilization: this.contextManager.getContextStatus().utilizationPercent
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Preload files for anticipated phase transition
     * @param {string} nextPhase - Phase to preload for
     * @returns {Promise<Object>} Preloading result
     */
    async preloadPhaseContext(nextPhase) {
        try {
            if (!this.contextManager) {
                return { success: false, error: 'Context manager not available' };
            }

            const contextStatus = this.contextManager.getContextStatus();
            
            // Only preload if we have sufficient context space
            if (contextStatus.utilizationPercent > 60) {
                return {
                    success: false,
                    error: 'Insufficient context space for preloading',
                    utilizationPercent: contextStatus.utilizationPercent
                };
            }

            // Load essential files for next phase
            const nextPhaseFiles = this.phaseFiles[nextPhase] || [];
            const essentialFiles = nextPhaseFiles.slice(0, 3); // Limit to 3 most important files
            
            let tokensLoaded = 0;
            let filesLoaded = 0;

            for (const filePath of essentialFiles) {
                const result = await this.contextManager.loadSupportingFile(filePath, `${nextPhase}-preload`);
                if (result.success && !result.alreadyLoaded) {
                    tokensLoaded += result.tokensUsed;
                    filesLoaded++;
                }
            }

            return {
                success: true,
                nextPhase: nextPhase,
                tokensLoaded: tokensLoaded,
                filesLoaded: filesLoaded,
                preloadedFiles: essentialFiles
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                nextPhase: nextPhase
            };
        }
    }

    /**
     * Get phase transition recommendations based on current context
     * @returns {Object} Transition recommendations
     */
    getTransitionRecommendations() {
        const contextStatus = this.contextManager ? this.contextManager.getContextStatus() : null;
        const recommendations = [];

        if (contextStatus) {
            if (contextStatus.utilizationPercent > 80) {
                recommendations.push({
                    type: 'warning',
                    message: 'High context usage. Consider optimizing before phase transition.',
                    action: 'optimize-context'
                });
            }

            if (contextStatus.activeSkills.length > 2) {
                recommendations.push({
                    type: 'suggestion',
                    message: 'Multiple active skills. Deactivate unused skills before transition.',
                    action: 'deactivate-unused-skills'
                });
            }

            if (this.loadedPhaseFiles.size > this.maxPhaseFiles) {
                recommendations.push({
                    type: 'suggestion',
                    message: 'Many phase files loaded. Consider unloading non-essential files.',
                    action: 'unload-non-essential'
                });
            }
        }

        return {
            currentPhase: this.currentPhase,
            contextUtilization: contextStatus ? contextStatus.utilizationPercent : 0,
            recommendations: recommendations,
            canTransition: recommendations.filter(r => r.type === 'warning').length === 0
        };
    }

    /**
     * Reset phase context manager state
     */
    reset() {
        this.currentPhase = null;
        this.loadedPhaseFiles.clear();
        this.phaseTransitionHistory = [];
    }

    /**
     * Set context manager reference
     * @param {ContextManager} contextManager - Context manager instance
     */
    setContextManager(contextManager) {
        this.contextManager = contextManager;
    }
}

// Export for use in skill system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhaseContextManager;
}

// Global instance for immediate use
if (typeof window !== 'undefined') {
    window.PhaseContextManager = PhaseContextManager;
}