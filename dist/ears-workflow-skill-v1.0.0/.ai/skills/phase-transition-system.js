/**
 * EARS-Workflow Phase Transition System
 * 
 * Implements SPEC-FORGE → PLAN → WORK → REVIEW sequence enforcement
 * Validates phase transitions and provides guidance for proper workflow sequence
 * Integrates with context management for optimized token usage during transitions
 * 
 * @version 1.0.0
 * @author EARS-Workflow System
 */

class PhaseTransitionSystem {
    constructor(contextManager = null, phaseContextManager = null) {
        // Define the required phase sequence
        this.phaseSequence = ['spec-forge', 'planning', 'work', 'review'];
        
        // Phase display names for user-friendly messages
        this.phaseDisplayNames = {
            'spec-forge': 'SPEC-FORGE',
            'planning': 'PLANNING', 
            'work': 'WORK',
            'review': 'REVIEW'
        };
        
        // Phase descriptions for guidance messages
        this.phaseDescriptions = {
            'spec-forge': 'Create EARS-compliant requirements, design with correctness properties, and task planning',
            'planning': 'Implementation planning, research, and architectural decisions',
            'work': 'TDD implementation in isolated git worktree environments',
            'review': 'Multi-perspective code audit and quality assurance'
        };
        
        // Current workflow state
        this.currentPhase = null;
        this.completedPhases = new Set();
        this.activeSubSkills = new Set();
        this.workflowStarted = false;
        
        // Context management integration
        this.contextManager = contextManager;
        this.phaseContextManager = phaseContextManager;
        
        // Phase transition history for optimization
        this.transitionHistory = [];
        this.maxHistorySize = 20;
    }

    /**
     * Validate if a phase transition is allowed
     * @param {string} requestedPhase - The phase user wants to activate
     * @returns {Object} Validation result with guidance
     */
    validatePhaseTransition(requestedPhase) {
        // Utility skills can be activated anytime (not part of main sequence)
        if (!this.phaseSequence.includes(requestedPhase)) {
            return {
                valid: true,
                phase: requestedPhase,
                message: null,
                type: 'utility'
            };
        }

        const requestedIndex = this.phaseSequence.indexOf(requestedPhase);
        
        // First phase (spec-forge) can always be activated
        if (requestedIndex === 0) {
            return {
                valid: true,
                phase: requestedPhase,
                message: this.generatePhaseActivationMessage(requestedPhase),
                type: 'sequence-start'
            };
        }

        // Check if all prerequisite phases are completed
        const requiredPhases = this.phaseSequence.slice(0, requestedIndex);
        const missingPhases = requiredPhases.filter(phase => !this.completedPhases.has(phase));

        if (missingPhases.length > 0) {
            return {
                valid: false,
                phase: null,
                message: this.generatePhaseSequenceGuidance(requestedPhase, missingPhases),
                type: 'sequence-violation',
                missingPhases: missingPhases,
                suggestedNext: missingPhases[0],
                requestedPhase: requestedPhase
            };
        }

        // Valid transition - all prerequisites completed
        return {
            valid: true,
            phase: requestedPhase,
            message: this.generatePhaseActivationMessage(requestedPhase),
            type: 'sequence-continuation'
        };
    }

    /**
     * Attempt to transition to a specific phase with context management
     * @param {string} requestedPhase - The phase to transition to
     * @param {string} userInput - Original user input for context
     * @param {Object} options - Transition options
     * @returns {Promise<Object>} Transition result with context management info
     */
    async transitionToPhase(requestedPhase, userInput = '', options = {}) {
        const {
            optimizeContext = true,
            preloadSupporting = false,
            maintainCore = true,
            aggressiveUnload = false
        } = options;

        const validation = this.validatePhaseTransition(requestedPhase);
        
        if (!validation.valid) {
            return {
                success: false,
                phase: null,
                currentPhase: this.currentPhase,
                error: validation.message,
                guidance: this.generateTransitionGuidance(validation),
                missingPhases: validation.missingPhases,
                suggestedNext: validation.suggestedNext,
                contextManagement: null
            };
        }

        const transitionStart = Date.now();
        let contextResult = null;
        let skillActivationResult = null;

        // Step 1: Activate the skill in the context manager first
        if (this.contextManager && this.phaseSequence.includes(requestedPhase)) {
            try {
                skillActivationResult = await this.contextManager.activateSkill(requestedPhase);
                if (!skillActivationResult.success && !skillActivationResult.alreadyActive) {
                    console.warn(`Failed to activate skill ${requestedPhase}:`, skillActivationResult.error);
                }
            } catch (error) {
                console.warn('Skill activation failed during phase transition:', error.message);
                skillActivationResult = { success: false, error: error.message };
            }
        }

        // Step 2: Perform intelligent context management if available
        if (this.phaseContextManager && this.phaseSequence.includes(requestedPhase)) {
            try {
                // Get context recommendations first
                const recommendations = this.getTransitionContextRecommendations(this.currentPhase, requestedPhase);
                
                // Determine context management strategy based on recommendations
                const contextOptions = {
                    unloadPrevious: optimizeContext && this.currentPhase !== null && this.currentPhase !== requestedPhase,
                    preloadSupporting: preloadSupporting,
                    maintainCore: maintainCore
                };

                // Apply recommendations
                if (recommendations.recommendations.some(r => r.type === 'critical')) {
                    contextOptions.aggressiveUnload = true;
                    contextOptions.preloadSupporting = false;
                } else if (recommendations.currentUtilization > 75 || aggressiveUnload) {
                    contextOptions.unloadPrevious = true;
                    contextOptions.preloadSupporting = false;
                }

                // Use the new intelligent context management
                contextResult = await this.manageTransitionContext(this.currentPhase, requestedPhase, {
                    aggressiveUnload: contextOptions.aggressiveUnload || aggressiveUnload,
                    preloadSupporting: contextOptions.preloadSupporting,
                    maintainCore: contextOptions.maintainCore,
                    targetUtilization: 60
                });
                
                // If context management failed, try with more conservative approach
                if (!contextResult.success && contextResult.error && contextResult.error.includes('context')) {
                    console.log('Retrying phase transition with conservative context management...');
                    contextResult = await this.manageTransitionContext(this.currentPhase, requestedPhase, {
                        aggressiveUnload: true,
                        preloadSupporting: false,
                        maintainCore: true,
                        targetUtilization: 50
                    });
                }
            } catch (error) {
                console.warn('Intelligent context management failed during phase transition:', error.message);
                contextResult = { success: false, error: error.message };
            }
        }

        // Step 3: Perform the logical transition
        const previousPhase = this.currentPhase;
        this.currentPhase = requestedPhase;
        this.activeSubSkills.add(requestedPhase);
        this.workflowStarted = true;

        // Step 4: Record transition for analysis
        this.recordTransition(previousPhase, requestedPhase, {
            userInput: userInput,
            contextResult: contextResult,
            skillActivationResult: skillActivationResult,
            duration: Date.now() - transitionStart,
            validationType: validation.type,
            optimizationApplied: optimizeContext
        });

        // Step 5: Determine next phase in sequence
        const currentIndex = this.phaseSequence.indexOf(requestedPhase);
        const nextPhase = currentIndex >= 0 && currentIndex < this.phaseSequence.length - 1 
            ? this.phaseSequence[currentIndex + 1] 
            : null;

        // Step 6: Get final context status for reporting
        let finalContextStatus = null;
        if (this.contextManager) {
            finalContextStatus = this.contextManager.getContextStatus();
        }

        return {
            success: true,
            phase: requestedPhase,
            previousPhase: previousPhase,
            nextPhase: nextPhase,
            currentPhase: requestedPhase,
            feedback: validation.message,
            type: validation.type,
            sequencePosition: `${currentIndex + 1}/${this.phaseSequence.length}`,
            completedPhases: Array.from(this.completedPhases),
            userInput: userInput,
            contextManagement: contextResult,
            skillActivation: skillActivationResult,
            finalContextStatus: finalContextStatus,
            transitionTime: Date.now() - transitionStart,
            optimizationApplied: optimizeContext
        };
    }

    /**
     * Legacy synchronous transition method for backward compatibility
     * @param {string} requestedPhase - The phase to transition to
     * @param {string} userInput - Original user input for context
     * @returns {Object} Transition result
     */
    transitionToPhaseSync(requestedPhase, userInput = '') {
        const validation = this.validatePhaseTransition(requestedPhase);
        
        if (!validation.valid) {
            return {
                success: false,
                phase: null,
                currentPhase: this.currentPhase,
                error: validation.message,
                guidance: this.generateTransitionGuidance(validation),
                missingPhases: validation.missingPhases,
                suggestedNext: validation.suggestedNext
            };
        }

        // Perform the transition
        const previousPhase = this.currentPhase;
        this.currentPhase = requestedPhase;
        this.activeSubSkills.add(requestedPhase);
        this.workflowStarted = true;

        // Determine next phase in sequence
        const currentIndex = this.phaseSequence.indexOf(requestedPhase);
        const nextPhase = currentIndex >= 0 && currentIndex < this.phaseSequence.length - 1 
            ? this.phaseSequence[currentIndex + 1] 
            : null;

        return {
            success: true,
            phase: requestedPhase,
            previousPhase: previousPhase,
            nextPhase: nextPhase,
            currentPhase: requestedPhase,
            feedback: validation.message,
            type: validation.type,
            sequencePosition: `${currentIndex + 1}/${this.phaseSequence.length}`,
            completedPhases: Array.from(this.completedPhases),
            userInput: userInput
        };
    }

    /**
     * Mark a phase as completed with context optimization
     * @param {string} phase - The phase to mark as completed
     * @param {Object} options - Completion options
     * @returns {Promise<Object>} Completion result with context management
     */
    async completePhase(phase, options = {}) {
        const { 
            optimizeContext = true,
            preloadNext = false,
            aggressiveOptimization = false
        } = options;

        if (!this.phaseSequence.includes(phase)) {
            return {
                success: false,
                error: `Invalid phase: ${phase}. Must be one of: ${this.phaseSequence.join(', ')}`
            };
        }

        this.completedPhases.add(phase);
        
        // Determine what's next
        const currentIndex = this.phaseSequence.indexOf(phase);
        const nextPhase = currentIndex < this.phaseSequence.length - 1 
            ? this.phaseSequence[currentIndex + 1] 
            : null;

        const isWorkflowComplete = this.completedPhases.size === this.phaseSequence.length;

        let contextOptimization = null;
        let nextPhasePreload = null;

        // Perform context optimization if requested
        if (optimizeContext && this.phaseContextManager) {
            try {
                // Step 1: Optimize current context by unloading non-essential files
                contextOptimization = await this.phaseContextManager.optimizePhaseContext();
                
                // Step 2: If aggressive optimization is enabled, unload completed phase context
                if (aggressiveOptimization && this.currentPhase === phase) {
                    const unloadResult = await this.phaseContextManager.unloadPhaseContext(phase, true);
                    if (contextOptimization.success) {
                        contextOptimization.phaseUnload = unloadResult;
                        contextOptimization.tokensFreed += unloadResult.tokensFreed || 0;
                    }
                }

                // Step 3: Preload next phase context if requested and available
                if (preloadNext && nextPhase && !isWorkflowComplete) {
                    nextPhasePreload = await this.phaseContextManager.preloadPhaseContext(nextPhase);
                    if (contextOptimization.success) {
                        contextOptimization.nextPhasePreload = nextPhasePreload;
                    }
                }

                // Step 4: Deactivate completed phase skill if context manager is available
                if (this.contextManager && this.contextManager.activeSkills.has(phase)) {
                    const deactivationResult = this.contextManager.deactivateSkill(phase);
                    if (contextOptimization.success) {
                        contextOptimization.skillDeactivation = deactivationResult;
                        if (deactivationResult.success) {
                            contextOptimization.tokensFreed += deactivationResult.tokensFreed || 0;
                        }
                    }
                }

            } catch (error) {
                console.warn('Context optimization failed during phase completion:', error.message);
                contextOptimization = { success: false, error: error.message };
            }
        }

        // Record phase completion in transition history
        this.recordTransition(phase, nextPhase || 'complete', {
            type: 'phase-completion',
            isWorkflowComplete: isWorkflowComplete,
            contextOptimization: contextOptimization,
            nextPhasePreload: nextPhasePreload
        });

        return {
            success: true,
            completedPhase: phase,
            nextPhase: nextPhase,
            isWorkflowComplete: isWorkflowComplete,
            completedPhases: Array.from(this.completedPhases),
            progress: `${this.completedPhases.size}/${this.phaseSequence.length}`,
            message: this.generateCompletionMessage(phase, nextPhase, isWorkflowComplete),
            contextOptimization: contextOptimization,
            nextPhasePreload: nextPhasePreload,
            optimizationApplied: optimizeContext
        };
    }

    /**
     * Legacy synchronous completion method for backward compatibility
     * @param {string} phase - The phase to mark as completed
     * @returns {Object} Completion result
     */
    completePhaseSync(phase) {
        if (!this.phaseSequence.includes(phase)) {
            return {
                success: false,
                error: `Invalid phase: ${phase}. Must be one of: ${this.phaseSequence.join(', ')}`
            };
        }

        this.completedPhases.add(phase);
        
        // Determine what's next
        const currentIndex = this.phaseSequence.indexOf(phase);
        const nextPhase = currentIndex < this.phaseSequence.length - 1 
            ? this.phaseSequence[currentIndex + 1] 
            : null;

        const isWorkflowComplete = this.completedPhases.size === this.phaseSequence.length;

        return {
            success: true,
            completedPhase: phase,
            nextPhase: nextPhase,
            isWorkflowComplete: isWorkflowComplete,
            completedPhases: Array.from(this.completedPhases),
            progress: `${this.completedPhases.size}/${this.phaseSequence.length}`,
            message: this.generateCompletionMessage(phase, nextPhase, isWorkflowComplete)
        };
    }

    /**
     * Record a phase transition for analysis and optimization
     * @param {string} fromPhase - Previous phase
     * @param {string} toPhase - New phase
     * @param {Object} metadata - Transition metadata
     */
    recordTransition(fromPhase, toPhase, metadata = {}) {
        const transition = {
            from: fromPhase,
            to: toPhase,
            timestamp: new Date(),
            metadata: metadata
        };

        this.transitionHistory.push(transition);

        // Maintain history size limit
        if (this.transitionHistory.length > this.maxHistorySize) {
            this.transitionHistory.shift();
        }
    }

    /**
     * Get context management status for current phase
     * @returns {Object} Context management status
     */
    getContextManagementStatus() {
        const status = {
            phaseContextManagerAvailable: !!this.phaseContextManager,
            contextManagerAvailable: !!this.contextManager,
            currentPhase: this.currentPhase,
            contextStatus: null,
            phaseContextStatus: null,
            recommendations: []
        };

        if (this.contextManager) {
            status.contextStatus = this.contextManager.getContextStatus();
        }

        if (this.phaseContextManager) {
            status.phaseContextStatus = this.phaseContextManager.getPhaseContextStatus();
            
            // Get transition recommendations
            const transitionRecs = this.phaseContextManager.getTransitionRecommendations();
            status.recommendations.push(...transitionRecs.recommendations);
        }

        return status;
    }

    /**
     * Optimize context for current phase
     * @returns {Promise<Object>} Optimization result
     */
    async optimizeCurrentPhaseContext() {
        if (!this.phaseContextManager) {
            return {
                success: false,
                error: 'Phase context manager not available'
            };
        }

        try {
            const result = await this.phaseContextManager.optimizePhaseContext();
            
            // Record optimization in transition history
            this.recordTransition(this.currentPhase, this.currentPhase, {
                type: 'context-optimization',
                result: result
            });

            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Intelligently manage context during phase transitions
     * @param {string} fromPhase - Previous phase
     * @param {string} toPhase - Target phase
     * @param {Object} options - Management options
     * @returns {Promise<Object>} Context management result
     */
    async manageTransitionContext(fromPhase, toPhase, options = {}) {
        const {
            aggressiveUnload = false,
            preloadSupporting = false,
            maintainCore = true,
            targetUtilization = 60
        } = options;

        if (!this.contextManager || !this.phaseContextManager) {
            return {
                success: false,
                error: 'Context managers not available'
            };
        }

        const managementStart = Date.now();
        const results = {
            initialStatus: this.contextManager.getContextStatus(),
            actions: [],
            finalStatus: null,
            tokensFreed: 0,
            tokensLoaded: 0,
            success: true
        };

        try {
            // Step 1: Assess current context situation
            const initialUtilization = results.initialStatus.utilizationPercent;
            
            // Step 2: Unload previous phase context if needed
            if (fromPhase && fromPhase !== toPhase) {
                // Deactivate previous phase skill
                if (this.contextManager.activeSkills.has(fromPhase)) {
                    const deactivationResult = this.contextManager.deactivateSkill(fromPhase);
                    if (deactivationResult.success) {
                        results.tokensFreed += deactivationResult.tokensFreed;
                        results.actions.push({
                            type: 'skill-deactivation',
                            phase: fromPhase,
                            tokensFreed: deactivationResult.tokensFreed
                        });
                    }
                }

                // Unload phase-specific files
                const unloadResult = await this.phaseContextManager.unloadPhaseContext(fromPhase, maintainCore);
                if (unloadResult.success) {
                    results.tokensFreed += unloadResult.tokensFreed;
                    results.actions.push({
                        type: 'phase-context-unload',
                        phase: fromPhase,
                        tokensFreed: unloadResult.tokensFreed,
                        filesUnloaded: unloadResult.filesUnloaded
                    });
                }
            }

            // Step 3: Optimize context if utilization is high or aggressive unload is requested
            const currentStatus = this.contextManager.getContextStatus();
            if (currentStatus.utilizationPercent > targetUtilization || aggressiveUnload) {
                const optimizationResult = await this.phaseContextManager.optimizePhaseContext();
                if (optimizationResult.success) {
                    results.tokensFreed += optimizationResult.tokensFreed;
                    results.actions.push({
                        type: 'context-optimization',
                        tokensFreed: optimizationResult.tokensFreed,
                        filesUnloaded: optimizationResult.filesUnloaded
                    });
                }
            }

            // Step 4: Activate new phase skill
            if (toPhase && this.phaseSequence.includes(toPhase)) {
                const activationResult = await this.contextManager.activateSkill(toPhase);
                if (activationResult.success && !activationResult.alreadyActive) {
                    results.tokensLoaded += activationResult.tokensUsed;
                    results.actions.push({
                        type: 'skill-activation',
                        phase: toPhase,
                        tokensLoaded: activationResult.tokensUsed
                    });
                }
            }

            // Step 5: Load new phase context
            if (toPhase) {
                const loadResult = await this.phaseContextManager.loadPhaseContext(toPhase, preloadSupporting);
                if (loadResult.success) {
                    results.tokensLoaded += loadResult.tokensLoaded;
                    results.actions.push({
                        type: 'phase-context-load',
                        phase: toPhase,
                        tokensLoaded: loadResult.tokensLoaded,
                        filesLoaded: loadResult.filesLoaded
                    });
                }
                
                // Update phase context manager's current phase
                this.phaseContextManager.currentPhase = toPhase;
            }

            // Step 6: Final status assessment
            results.finalStatus = this.contextManager.getContextStatus();
            results.netTokenChange = results.tokensLoaded - results.tokensFreed;
            results.utilizationChange = results.finalStatus.utilizationPercent - results.initialStatus.utilizationPercent;
            results.managementTime = Date.now() - managementStart;

            return results;

        } catch (error) {
            results.success = false;
            results.error = error.message;
            results.finalStatus = this.contextManager.getContextStatus();
            return results;
        }
    }

    /**
     * Get context management recommendations for phase transitions
     * @param {string} fromPhase - Current phase
     * @param {string} toPhase - Target phase
     * @returns {Object} Recommendations for optimal transition
     */
    getTransitionContextRecommendations(fromPhase, toPhase) {
        const recommendations = [];
        
        if (!this.contextManager) {
            return {
                recommendations: [{
                    type: 'error',
                    message: 'Context manager not available',
                    action: 'initialize-context-manager'
                }]
            };
        }

        const contextStatus = this.contextManager.getContextStatus();
        const utilization = contextStatus.utilizationPercent;

        // High utilization recommendations
        if (utilization > 80) {
            recommendations.push({
                type: 'critical',
                message: 'Context utilization is very high (>80%)',
                action: 'aggressive-unload',
                details: 'Recommend aggressive context unloading before transition'
            });
        } else if (utilization > 60) {
            recommendations.push({
                type: 'warning',
                message: 'Context utilization is high (>60%)',
                action: 'optimize-before-transition',
                details: 'Recommend context optimization before loading new phase'
            });
        }

        // Active skills recommendations
        if (contextStatus.activeSkills.length > 2) {
            recommendations.push({
                type: 'suggestion',
                message: 'Multiple skills are active',
                action: 'deactivate-unused-skills',
                details: `${contextStatus.activeSkills.length} skills active: ${contextStatus.activeSkills.join(', ')}`
            });
        }

        // Phase-specific recommendations
        if (fromPhase && toPhase && fromPhase !== toPhase) {
            recommendations.push({
                type: 'info',
                message: 'Phase transition detected',
                action: 'unload-previous-phase',
                details: `Transitioning from ${fromPhase} to ${toPhase}`
            });

            // Recommend preloading for certain transitions
            const heavyPhases = ['work', 'review'];
            if (heavyPhases.includes(toPhase)) {
                recommendations.push({
                    type: 'suggestion',
                    message: `${toPhase} phase typically requires more context`,
                    action: 'ensure-context-space',
                    details: 'Consider aggressive optimization before loading this phase'
                });
            }
        }

        // Supporting files recommendations
        if (contextStatus.loadedFiles && contextStatus.loadedFiles.length > 5) {
            recommendations.push({
                type: 'suggestion',
                message: 'Many supporting files are loaded',
                action: 'unload-unused-files',
                details: `${contextStatus.loadedFiles.length} files loaded`
            });
        }

        return {
            currentUtilization: utilization,
            activeSkills: contextStatus.activeSkills,
            loadedFiles: contextStatus.loadedFiles ? contextStatus.loadedFiles.length : 0,
            recommendations: recommendations,
            canTransitionSafely: utilization < 70 && recommendations.filter(r => r.type === 'critical').length === 0
        };
    }

    /**
     * Preload context for next phase
     * @returns {Promise<Object>} Preload result
     */
    async preloadNextPhaseContext() {
        const nextPhase = this.getNextPhase();
        
        if (!nextPhase) {
            return {
                success: false,
                error: 'No next phase available'
            };
        }

        if (!this.phaseContextManager) {
            return {
                success: false,
                error: 'Phase context manager not available'
            };
        }

        try {
            const result = await this.phaseContextManager.preloadPhaseContext(nextPhase);
            
            // Record preload in transition history
            this.recordTransition(this.currentPhase, nextPhase, {
                type: 'context-preload',
                result: result
            });

            return result;
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Set context managers for integration
     * @param {Object} contextManager - Main context manager
     * @param {Object} phaseContextManager - Phase context manager
     */
    setContextManagers(contextManager, phaseContextManager) {
        this.contextManager = contextManager;
        this.phaseContextManager = phaseContextManager;
        
        // Update phase context manager's reference
        if (this.phaseContextManager && this.contextManager) {
            this.phaseContextManager.setContextManager(this.contextManager);
        }
    }

    /**
     * Get transition history for analysis
     * @param {number} limit - Maximum number of transitions to return
     * @returns {Array} Recent transitions
     */
    getTransitionHistory(limit = 10) {
        return this.transitionHistory.slice(-limit);
    }

    /**
     * Analyze transition patterns for optimization recommendations
     * @returns {Object} Analysis results with recommendations
     */
    analyzeTransitionPatterns() {
        if (this.transitionHistory.length < 3) {
            return {
                hasEnoughData: false,
                recommendations: []
            };
        }

        const recommendations = [];
        const recentTransitions = this.transitionHistory.slice(-10);

        // Analyze context management effectiveness
        const contextTransitions = recentTransitions.filter(t => t.metadata.contextResult);
        const failedContextTransitions = contextTransitions.filter(t => !t.metadata.contextResult.success);

        if (failedContextTransitions.length > contextTransitions.length * 0.3) {
            recommendations.push({
                type: 'warning',
                message: 'High context management failure rate during transitions',
                action: 'review-context-limits',
                details: `${failedContextTransitions.length}/${contextTransitions.length} transitions had context issues`
            });
        }

        // Analyze transition timing
        const timedTransitions = recentTransitions.filter(t => t.metadata.duration);
        if (timedTransitions.length > 0) {
            const avgDuration = timedTransitions.reduce((sum, t) => sum + t.metadata.duration, 0) / timedTransitions.length;
            
            if (avgDuration > 5000) { // More than 5 seconds
                recommendations.push({
                    type: 'suggestion',
                    message: 'Phase transitions are taking longer than expected',
                    action: 'optimize-context-loading',
                    details: `Average transition time: ${Math.round(avgDuration)}ms`
                });
            }
        }

        // Analyze phase sequence adherence
        const sequenceViolations = recentTransitions.filter(t => 
            t.metadata.validationType === 'sequence-violation'
        );

        if (sequenceViolations.length > 0) {
            recommendations.push({
                type: 'info',
                message: 'Phase sequence violations detected',
                action: 'review-workflow-guidance',
                details: `${sequenceViolations.length} attempts to skip phases`
            });
        }

        return {
            hasEnoughData: true,
            totalTransitions: this.transitionHistory.length,
            recentTransitions: recentTransitions.length,
            averageTransitionTime: timedTransitions.length > 0 ? 
                Math.round(timedTransitions.reduce((sum, t) => sum + t.metadata.duration, 0) / timedTransitions.length) : 
                null,
            contextSuccessRate: contextTransitions.length > 0 ? 
                Math.round(((contextTransitions.length - failedContextTransitions.length) / contextTransitions.length) * 100) : 
                null,
            recommendations: recommendations
        };
    }

    /**
     * Generate phase activation message
     * @param {string} phase - The phase being activated
     * @returns {string} Activation message
     */
    generatePhaseActivationMessage(phase) {
        const displayName = this.phaseDisplayNames[phase];
        const description = this.phaseDescriptions[phase];
        const currentIndex = this.phaseSequence.indexOf(phase);
        const progress = `${currentIndex + 1}/${this.phaseSequence.length}`;

        return `🎯 **${displayName} Phase Activated** (${progress})\n\n` +
               `${description}\n\n` +
               `**Workflow Progress**: ${this.generateProgressIndicator(phase)}\n\n` +
               `Ready to begin ${displayName} phase activities.`;
    }

    /**
     * Generate phase sequence guidance message
     * @param {string} requestedPhase - The phase user tried to activate
     * @param {Array} missingPhases - Phases that need to be completed first
     * @returns {string} Guidance message
     */
    generatePhaseSequenceGuidance(requestedPhase, missingPhases) {
        const requestedDisplayName = this.phaseDisplayNames[requestedPhase];
        const missingDisplayNames = missingPhases.map(p => this.phaseDisplayNames[p]);
        const nextPhase = missingPhases[0];
        const nextDisplayName = this.phaseDisplayNames[nextPhase];

        return `⚠️ **Phase Sequence Guidance**\n\n` +
               `You requested **${requestedDisplayName}** phase, but the EARS-workflow requires completing phases in sequence.\n\n` +
               `**Required Sequence**: ${this.phaseSequence.map(p => this.phaseDisplayNames[p]).join(' → ')}\n\n` +
               `**Missing Prerequisites**: ${missingDisplayNames.join(' → ')}\n\n` +
               `**Recommended Next Step**: Start with **${nextDisplayName}** phase\n\n` +
               `${this.phaseDescriptions[nextPhase]}\n\n` +
               `This ensures proper workflow discipline and builds the foundation needed for successful ${requestedDisplayName} execution.`;
    }

    /**
     * Generate transition guidance for failed transitions
     * @param {Object} validation - Validation result
     * @returns {string} Transition guidance
     */
    generateTransitionGuidance(validation) {
        if (validation.type !== 'sequence-violation') {
            return 'Please follow the proper phase sequence.';
        }

        const nextPhase = validation.suggestedNext;
        const nextDisplayName = this.phaseDisplayNames[nextPhase];
        
        return `To proceed with the EARS-workflow:\n\n` +
               `1. **Start with ${nextDisplayName}**: ${this.phaseDescriptions[nextPhase]}\n` +
               `2. **Complete all requirements** before moving to the next phase\n` +
               `3. **Follow the sequence** to ensure proper foundation building\n\n` +
               `Use: "activate ${nextPhase}" or "${nextPhase}" to begin the correct phase.`;
    }

    /**
     * Generate completion message for a phase
     * @param {string} completedPhase - The phase that was completed
     * @param {string} nextPhase - The next phase in sequence (if any)
     * @param {boolean} isWorkflowComplete - Whether the entire workflow is complete
     * @returns {string} Completion message
     */
    generateCompletionMessage(completedPhase, nextPhase, isWorkflowComplete) {
        const completedDisplayName = this.phaseDisplayNames[completedPhase];
        
        if (isWorkflowComplete) {
            return `🎉 **Workflow Complete!**\n\n` +
                   `**${completedDisplayName}** phase completed successfully.\n\n` +
                   `All EARS-workflow phases have been completed:\n` +
                   `${this.phaseSequence.map(p => `✅ ${this.phaseDisplayNames[p]}`).join('\n')}\n\n` +
                   `Your structured development process is complete with formal specifications, ` +
                   `implementation planning, TDD development, and comprehensive review.`;
        }

        if (nextPhase) {
            const nextDisplayName = this.phaseDisplayNames[nextPhase];
            return `✅ **${completedDisplayName} Phase Complete**\n\n` +
                   `Ready to proceed to **${nextDisplayName}** phase.\n\n` +
                   `**Progress**: ${this.generateProgressIndicator(nextPhase)}\n\n` +
                   `**Next**: ${this.phaseDescriptions[nextPhase]}\n\n` +
                   `Use: "activate ${nextPhase}" or "${nextPhase}" to continue the workflow.`;
        }

        return `✅ **${completedDisplayName} Phase Complete**\n\nPhase completed successfully.`;
    }

    /**
     * Generate visual progress indicator
     * @param {string} currentPhase - Current or target phase
     * @returns {string} Progress indicator
     */
    generateProgressIndicator(currentPhase) {
        const currentIndex = this.phaseSequence.indexOf(currentPhase);
        
        return this.phaseSequence.map((phase, index) => {
            const displayName = this.phaseDisplayNames[phase];
            if (index < currentIndex) {
                return `✅ ${displayName}`;
            } else if (index === currentIndex) {
                return `🎯 ${displayName}`;
            } else {
                return `⏳ ${displayName}`;
            }
        }).join(' → ');
    }

    /**
     * Get current workflow status with context management info
     * @returns {Object} Current status information
     */
    getWorkflowStatus() {
        const baseStatus = {
            workflowStarted: this.workflowStarted,
            currentPhase: this.currentPhase,
            completedPhases: Array.from(this.completedPhases),
            activeSubSkills: Array.from(this.activeSubSkills),
            progress: `${this.completedPhases.size}/${this.phaseSequence.length}`,
            isComplete: this.completedPhases.size === this.phaseSequence.length,
            nextPhase: this.getNextPhase(),
            progressIndicator: this.currentPhase ? this.generateProgressIndicator(this.currentPhase) : null
        };

        // Add context management status if available
        if (this.contextManager || this.phaseContextManager) {
            baseStatus.contextManagement = this.getContextManagementStatus();
        }

        // Add transition analysis if we have enough data
        const transitionAnalysis = this.analyzeTransitionPatterns();
        if (transitionAnalysis.hasEnoughData) {
            baseStatus.transitionAnalysis = transitionAnalysis;
        }

        return baseStatus;
    }

    /**
     * Get the next phase in the sequence
     * @returns {string|null} Next phase or null if workflow is complete
     */
    getNextPhase() {
        if (!this.currentPhase) {
            return this.phaseSequence[0]; // Start with first phase
        }

        const currentIndex = this.phaseSequence.indexOf(this.currentPhase);
        return currentIndex >= 0 && currentIndex < this.phaseSequence.length - 1 
            ? this.phaseSequence[currentIndex + 1] 
            : null;
    }

    /**
     * Check if a specific phase can be activated
     * @param {string} phase - Phase to check
     * @returns {boolean} Whether the phase can be activated
     */
    canActivatePhase(phase) {
        const validation = this.validatePhaseTransition(phase);
        return validation.valid;
    }

    /**
     * Get phases that are missing for a requested phase
     * @param {string} requestedPhase - The phase user wants to activate
     * @returns {Array} Array of missing prerequisite phases
     */
    getMissingPrerequisites(requestedPhase) {
        if (!this.phaseSequence.includes(requestedPhase)) {
            return []; // Utility skills have no prerequisites
        }

        const requestedIndex = this.phaseSequence.indexOf(requestedPhase);
        const requiredPhases = this.phaseSequence.slice(0, requestedIndex);
        return requiredPhases.filter(phase => !this.completedPhases.has(phase));
    }

    /**
     * Reset the workflow state (for testing or new workflow)
     */
    reset() {
        this.currentPhase = null;
        this.completedPhases.clear();
        this.activeSubSkills.clear();
        this.workflowStarted = false;
        this.transitionHistory = [];
        
        // Reset context managers if available
        if (this.phaseContextManager) {
            this.phaseContextManager.reset();
        }
    }

    /**
     * Import state from another system (for integration)
     * @param {Object} state - State to import
     */
    importState(state) {
        if (state.currentPhase) {
            this.currentPhase = state.currentPhase;
        }
        if (state.completedPhases) {
            this.completedPhases = new Set(state.completedPhases);
        }
        if (state.activeSubSkills) {
            this.activeSubSkills = new Set(state.activeSubSkills);
        }
        if (state.workflowStarted !== undefined) {
            this.workflowStarted = state.workflowStarted;
        }
    }

    /**
     * Export current state (for persistence or integration)
     * @returns {Object} Current state
     */
    exportState() {
        const baseState = {
            currentPhase: this.currentPhase,
            completedPhases: Array.from(this.completedPhases),
            activeSubSkills: Array.from(this.activeSubSkills),
            workflowStarted: this.workflowStarted,
            progress: `${this.completedPhases.size}/${this.phaseSequence.length}`,
            isComplete: this.completedPhases.size === this.phaseSequence.length,
            transitionHistory: this.transitionHistory.slice(-5) // Last 5 transitions
        };

        // Add context management state if available
        if (this.phaseContextManager) {
            baseState.phaseContextStatus = this.phaseContextManager.getPhaseContextStatus();
        }

        if (this.contextManager) {
            baseState.contextStatus = this.contextManager.getContextStatus();
        }

        return baseState;
    }
}

// Export for use in skill system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhaseTransitionSystem;
}

// Global instance for immediate use
if (typeof window !== 'undefined') {
    window.PhaseTransitionSystem = PhaseTransitionSystem;
}