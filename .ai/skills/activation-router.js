/**
 * EARS-Workflow Skill Activation Router
 * 
 * Implements semantic routing for skill activation based on user input.
 * Supports main workflow activation and sub-skill detection.
 * Includes comprehensive error handling and validation.
 * 
 * @version 1.0.0
 * @author EARS-Workflow System
 */

// Import error handler if available
let ActivationErrorHandler;
try {
    ActivationErrorHandler = require('./activation-error-handler.js');
} catch (e) {
    // Fallback if error handler is not available
    ActivationErrorHandler = null;
}

// Import phase transition system
let PhaseTransitionSystem;
try {
    PhaseTransitionSystem = require('./phase-transition-system.js');
} catch (e) {
    // Fallback if phase transition system is not available
    PhaseTransitionSystem = null;
}

// Import context management systems
let ContextManager;
let PhaseContextManager;
try {
    ContextManager = require('./context-manager.js');
    PhaseContextManager = require('./phase-context-manager.js');
} catch (e) {
    // Fallback if context managers are not available
    ContextManager = null;
    PhaseContextManager = null;
}

class SkillActivationRouter {
    constructor() {
        // Initialize error handler
        this.errorHandler = ActivationErrorHandler ? new ActivationErrorHandler() : null;
        
        // Initialize context management systems
        this.contextManager = ContextManager ? new ContextManager() : null;
        this.phaseContextManager = PhaseContextManager ? new PhaseContextManager(this.contextManager) : null;
        
        // Initialize phase transition system with context managers
        this.phaseTransitionSystem = PhaseTransitionSystem ? 
            new PhaseTransitionSystem(this.contextManager, this.phaseContextManager) : null;
        
        // Set up context manager integration
        if (this.phaseTransitionSystem && (this.contextManager || this.phaseContextManager)) {
            this.phaseTransitionSystem.setContextManagers(this.contextManager, this.phaseContextManager);
        }
        
        // Initialize context management if available
        if (this.contextManager) {
            this.initializeContextManagement();
        }
        
        // Main workflow activation triggers
        this.mainWorkflowTriggers = [
            'ears-workflow',
            'use ears workflow',
            'ears workflow',
            'structured development',
            'formal specification',
            'compound engineering',
            'start ears',
            'use structured development'
        ];

        // Sub-skill activation patterns
        this.subSkillTriggers = {
            'spec-forge': [
                'spec-forge',
                'spec forge',
                'specification',
                'requirements',
                'ears',
                'user story',
                'create spec',
                'formal specification',
                'structured requirements',
                'design',
                'correctness properties',
                'property-based testing'
            ],
            'planning': [
                'planning',
                'plan',
                'implementation plan',
                'research',
                'analyze',
                'investigate',
                'architecture',
                'design decisions',
                'technical approach',
                'scaffold',
                'plan implementation',
                'create plan'
            ],
            'work': [
                'implement',
                'fix',
                'refactor',
                'build',
                'code',
                'tdd',
                'test-driven',
                'write tests',
                'git worktree',
                'feature branch',
                'development',
                'red-green-refactor',
                'failing test',
                'make it pass'
            ],
            'review': [
                'review',
                'audit',
                'check',
                'assess',
                'code review',
                'pull request',
                'pr review',
                'security audit',
                'performance review',
                'quality check',
                'multi-perspective',
                'comprehensive review',
                'deep review'
            ],
            'git-worktree': [
                'git worktree',
                'git-worktree',
                'worktree',
                'create worktree',
                'manage worktree',
                'worktree cleanup',
                'branch management',
                'isolated development'
            ],
            'project-reset': [
                'project reset',
                'project-reset',
                'reset project',
                'clean project',
                'template restoration',
                'memory reset',
                'project cleanup'
            ]
        };

        // Phase sequence enforcement (deprecated - now handled by PhaseTransitionSystem)
        this.phaseSequence = ['spec-forge', 'planning', 'work', 'review'];
        
        // Current state tracking (deprecated - now handled by PhaseTransitionSystem)
        this.currentPhase = null;
        this.completedPhases = [];
        this.activeSubSkills = [];
    }

    /**
     * Initialize context management system
     */
    async initializeContextManagement() {
        if (this.contextManager) {
            try {
                const result = await this.contextManager.initialize();
                if (result.success) {
                    console.log(`Context management initialized: ${result.skillsLoaded} skills loaded, ${result.discoveryTokens} tokens used`);
                }
            } catch (error) {
                console.warn('Context management initialization failed:', error.message);
            }
        }
    }

    /**
     * Analyze user input and determine skill activation
     * @param {string} userInput - The user's message
     * @returns {Object} Activation result with skill, confidence, and context
     */
    analyzeInput(userInput) {
        try {
            // Validate installation before processing
            if (this.errorHandler) {
                const validation = this.errorHandler.validateInstallation();
                if (!validation.valid) {
                    return this.handleValidationFailure(validation);
                }
            }

            const input = userInput.toLowerCase().trim();
            
            // Check for main workflow activation
            const mainWorkflowMatch = this.detectMainWorkflow(input);
            if (mainWorkflowMatch.detected) {
                // Activate main workflow with context management
                const activationResult = await this.activateMainWorkflow(mainWorkflowMatch);
                
                return {
                    type: 'main-workflow',
                    skill: 'ears-workflow',
                    confidence: mainWorkflowMatch.confidence,
                    phase: this.determineInitialPhase(input),
                    message: this.generateActivationMessage('main-workflow', mainWorkflowMatch.trigger),
                    context: {
                        trigger: mainWorkflowMatch.trigger,
                        suggestedPhase: this.determineInitialPhase(input),
                        contextManagement: activationResult
                    }
                };
            }

            // Check for sub-skill activation
            const subSkillMatch = this.detectSubSkill(input);
            if (subSkillMatch.detected) {
                const validationResult = this.validatePhaseSequence(subSkillMatch.skill);
                
                // Activate sub-skill with context management
                const activationResult = await this.activateSubSkill(subSkillMatch.skill, validationResult.valid);
                
                return {
                    type: 'sub-skill',
                    skill: subSkillMatch.skill,
                    confidence: subSkillMatch.confidence,
                    phase: subSkillMatch.skill,
                    valid: validationResult.valid,
                    message: validationResult.valid 
                        ? this.generateActivationMessage('sub-skill', subSkillMatch.skill)
                        : validationResult.message,
                    context: {
                        trigger: subSkillMatch.trigger,
                        phaseValidation: validationResult,
                        contextManagement: activationResult
                    }
                };
            }

            // No activation detected
            return {
                type: 'none',
                skill: null,
                confidence: 0,
                message: null,
                context: {
                    analyzed: true,
                    triggers: this.getAllTriggers()
                }
            };

        } catch (error) {
            return this.handleAnalysisError(error, userInput);
        }
    }

    /**
     * Activate main workflow with context management
     * @param {Object} workflowMatch - Main workflow match result
     * @returns {Promise<Object>} Activation result
     */
    async activateMainWorkflow(workflowMatch) {
        try {
            let contextResult = null;
            
            if (this.contextManager) {
                // Activate the main ears-workflow skill
                contextResult = await this.contextManager.activateSkill('ears-workflow');
                
                // Initialize phase context management
                if (this.phaseContextManager && contextResult.success) {
                    const initialPhase = 'spec-forge'; // Always start with spec-forge
                    const phaseResult = await this.phaseContextManager.transitionToPhase(initialPhase, {
                        unloadPrevious: false, // No previous phase to unload
                        preloadSupporting: true,
                        maintainCore: true
                    });
                    
                    contextResult.phaseTransition = phaseResult;
                }
            }
            
            return contextResult || { success: true, message: 'Context management not available' };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Activate sub-skill with context management
     * @param {string} skillName - Name of the sub-skill to activate
     * @param {boolean} isValid - Whether the activation is valid (phase sequence)
     * @returns {Promise<Object>} Activation result
     */
    async activateSubSkill(skillName, isValid) {
        try {
            if (!isValid) {
                return { success: false, error: 'Phase sequence validation failed' };
            }
            
            let contextResult = null;
            
            if (this.contextManager) {
                // Activate the specific sub-skill
                contextResult = await this.contextManager.activateSkill(skillName);
                
                // Handle phase transition if this is a workflow phase skill
                if (this.phaseContextManager && this.isWorkflowPhase(skillName) && contextResult.success) {
                    // Use the enhanced phase transition system
                    if (this.phaseTransitionSystem) {
                        const phaseResult = await this.phaseTransitionSystem.transitionToPhase(skillName, '', {
                            optimizeContext: true,
                            preloadSupporting: false,
                            maintainCore: true
                        });
                        contextResult.phaseTransition = phaseResult;
                    } else {
                        // Fallback to direct phase context management
                        const phaseResult = await this.phaseContextManager.transitionToPhase(skillName, {
                            unloadPrevious: true,
                            preloadSupporting: false,
                            maintainCore: true
                        });
                        contextResult.phaseTransition = phaseResult;
                    }
                }
            }
            
            return contextResult || { success: true, message: 'Context management not available' };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Check if a skill is a workflow phase skill
     * @param {string} skillName - Name of the skill
     * @returns {boolean} Whether the skill is a workflow phase
     */
    isWorkflowPhase(skillName) {
        return ['spec-forge', 'planning', 'work', 'review'].includes(skillName);
    }

    /**
     * Get progressive disclosure status
     * @returns {Object} Current progressive disclosure status
     */
    getProgressiveDisclosureStatus() {
        const status = {
            contextManagerAvailable: !!this.contextManager,
            phaseContextManagerAvailable: !!this.phaseContextManager,
            contextStatus: null,
            phaseStatus: null,
            recommendations: []
        };

        if (this.contextManager) {
            status.contextStatus = this.contextManager.getContextStatus();
            const recommendations = this.contextManager.getOptimizationRecommendations();
            status.recommendations.push(...recommendations.recommendations);
        }

        if (this.phaseContextManager) {
            status.phaseStatus = this.phaseContextManager.getPhaseContextStatus();
            const transitionRecs = this.phaseContextManager.getTransitionRecommendations();
            status.recommendations.push(...transitionRecs.recommendations);
        }

        return status;
    }

    /**
     * Optimize context usage
     * @returns {Promise<Object>} Optimization result
     */
    async optimizeContext() {
        try {
            const results = {
                contextOptimization: null,
                phaseOptimization: null,
                totalTokensFreed: 0,
                totalFilesUnloaded: 0
            };

            if (this.contextManager) {
                // Get optimization recommendations and apply them
                const recommendations = this.contextManager.getOptimizationRecommendations();
                
                if (recommendations.canOptimize) {
                    // Deactivate unused skills if recommended
                    const contextStatus = this.contextManager.getContextStatus();
                    if (contextStatus.activeSkills.length > 2) {
                        // Keep only the most recently activated skills
                        const skillsToDeactivate = contextStatus.activeSkills.slice(0, -2);
                        for (const skillName of skillsToDeactivate) {
                            const result = this.contextManager.deactivateSkill(skillName);
                            if (result.success) {
                                results.totalTokensFreed += result.tokensFreed;
                            }
                        }
                    }
                }
            }

            if (this.phaseContextManager) {
                const phaseResult = await this.phaseContextManager.optimizePhaseContext();
                results.phaseOptimization = phaseResult;
                
                if (phaseResult.success) {
                    results.totalTokensFreed += phaseResult.tokensFreed;
                    results.totalFilesUnloaded += phaseResult.filesUnloaded;
                }
            }

            return {
                success: true,
                ...results,
                optimizationApplied: results.totalTokensFreed > 0 || results.totalFilesUnloaded > 0
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Detect main workflow activation triggers
     * @param {string} input - Normalized user input
     * @returns {Object} Detection result with confidence
     */
    detectMainWorkflow(input) {
        for (const trigger of this.mainWorkflowTriggers) {
            if (input.includes(trigger)) {
                return {
                    detected: true,
                    trigger: trigger,
                    confidence: this.calculateConfidence(input, trigger)
                };
            }
        }
        return { detected: false, confidence: 0 };
    }

    /**
     * Detect sub-skill activation triggers
     * @param {string} input - Normalized user input
     * @returns {Object} Detection result with skill and confidence
     */
    detectSubSkill(input) {
        let bestMatch = { detected: false, skill: null, confidence: 0, trigger: null };

        for (const [skillName, triggers] of Object.entries(this.subSkillTriggers)) {
            for (const trigger of triggers) {
                if (input.includes(trigger)) {
                    const confidence = this.calculateConfidence(input, trigger);
                    if (confidence > bestMatch.confidence) {
                        bestMatch = {
                            detected: true,
                            skill: skillName,
                            confidence: confidence,
                            trigger: trigger
                        };
                    }
                }
            }
        }

        return bestMatch;
    }

    /**
     * Calculate confidence score for trigger match
     * @param {string} input - User input
     * @param {string} trigger - Matched trigger
     * @returns {number} Confidence score (0-1)
     */
    calculateConfidence(input, trigger) {
        const words = input.split(/\s+/);
        const triggerWords = trigger.split(/\s+/);
        
        // Base confidence from trigger length vs input length
        let confidence = Math.min(triggerWords.length / words.length, 1.0);
        
        // Boost for exact phrase matches
        if (input.includes(trigger)) {
            confidence += 0.3;
        }
        
        // Boost for word boundary matches
        const wordBoundaryRegex = new RegExp(`\\b${trigger.replace(/[-\s]/g, '[-\\s]')}\\b`);
        if (wordBoundaryRegex.test(input)) {
            confidence += 0.2;
        }
        
        // Boost for beginning of input
        if (input.startsWith(trigger)) {
            confidence += 0.1;
        }
        
        return Math.min(confidence, 1.0);
    }

    /**
     * Determine initial phase for main workflow activation
     * @param {string} input - User input
     * @returns {string} Suggested initial phase
     */
    determineInitialPhase(input) {
        // Check for phase-specific hints in the input
        if (input.includes('requirement') || input.includes('spec') || input.includes('ears')) {
            return 'spec-forge';
        }
        if (input.includes('plan') || input.includes('research') || input.includes('architecture')) {
            return 'planning';
        }
        if (input.includes('implement') || input.includes('code') || input.includes('tdd')) {
            return 'work';
        }
        if (input.includes('review') || input.includes('audit') || input.includes('check')) {
            return 'review';
        }
        
        // Default to spec-forge (first phase)
        return 'spec-forge';
    }

    /**
     * Validate phase sequence for sub-skill activation
     * @param {string} requestedSkill - The skill user wants to activate
     * @returns {Object} Validation result with guidance
     */
    validatePhaseSequence(requestedSkill) {
        // Use the phase transition system if available
        if (this.phaseTransitionSystem) {
            const validation = this.phaseTransitionSystem.validatePhaseTransition(requestedSkill);
            return {
                valid: validation.valid,
                message: validation.message,
                missingPhases: validation.missingPhases || [],
                suggestedNext: validation.suggestedNext || null,
                type: validation.type || 'unknown'
            };
        }

        // Fallback to legacy validation logic
        // Utility skills can be activated anytime
        if (!this.phaseSequence.includes(requestedSkill)) {
            return { valid: true, message: null };
        }

        const requestedIndex = this.phaseSequence.indexOf(requestedSkill);
        const currentIndex = this.currentPhase ? this.phaseSequence.indexOf(this.currentPhase) : -1;

        // First phase activation is always valid
        if (requestedIndex === 0) {
            return { valid: true, message: null };
        }

        // Check if previous phases are completed
        const requiredPhases = this.phaseSequence.slice(0, requestedIndex);
        const missingPhases = requiredPhases.filter(phase => !this.completedPhases.includes(phase));

        if (missingPhases.length > 0) {
            return {
                valid: false,
                message: this.generatePhaseSequenceGuidance(requestedSkill, missingPhases),
                missingPhases: missingPhases,
                suggestedNext: missingPhases[0]
            };
        }

        return { valid: true, message: null };
    }

    /**
     * Generate activation feedback message
     * @param {string} type - Activation type ('main-workflow' or 'sub-skill')
     * @param {string} skillOrTrigger - Skill name or trigger phrase
     * @returns {string} Activation message
     */
    generateActivationMessage(type, skillOrTrigger) {
        if (type === 'main-workflow') {
            return `🚀 **EARS-Workflow Activated**\n\n` +
                   `Structured development methodology is now active. Starting with **SPEC-FORGE** phase.\n\n` +
                   `**Phase Sequence**: SPEC-FORGE → PLAN → WORK → REVIEW\n\n` +
                   `Ready to transform your idea into a formal specification with EARS-compliant requirements and correctness properties.`;
        }

        if (type === 'sub-skill') {
            const skillDescriptions = {
                'spec-forge': 'EARS requirements creation, design generation, and correctness properties',
                'planning': 'Implementation planning, research, and architectural decisions',
                'work': 'TDD implementation in isolated git worktree environments',
                'review': 'Multi-perspective code audit and quality assurance',
                'git-worktree': 'Git worktree creation, management, and cleanup utilities',
                'project-reset': 'Project state reset and template restoration'
            };

            return `🎯 **${skillOrTrigger.toUpperCase()} Sub-Skill Activated**\n\n` +
                   `${skillDescriptions[skillOrTrigger] || 'Specialized capability activated'}\n\n` +
                   `Loading focused instructions for ${skillOrTrigger} operations...`;
        }

        return 'Skill activation detected.';
    }

    /**
     * Generate phase sequence guidance message
     * @param {string} requestedSkill - The skill user tried to activate
     * @param {Array} missingPhases - Phases that need to be completed first
     * @returns {string} Guidance message
     */
    generatePhaseSequenceGuidance(requestedSkill, missingPhases) {
        const phaseNames = {
            'spec-forge': 'SPEC-FORGE',
            'planning': 'PLANNING',
            'work': 'WORK',
            'review': 'REVIEW'
        };

        return `⚠️ **Phase Sequence Guidance**\n\n` +
               `You requested **${phaseNames[requestedSkill]}** phase, but the EARS-workflow requires completing phases in sequence.\n\n` +
               `**Missing phases**: ${missingPhases.map(p => phaseNames[p]).join(' → ')}\n\n` +
               `**Recommended next step**: Start with **${phaseNames[missingPhases[0]]}** phase.\n\n` +
               `This ensures proper workflow discipline and builds the foundation needed for successful ${phaseNames[requestedSkill]} execution.`;
    }

    /**
     * Update current phase state
     * @param {string} phase - Current active phase
     * @param {boolean} completed - Whether the phase is completed
     */
    updatePhaseState(phase, completed = false) {
        // Use phase transition system if available
        if (this.phaseTransitionSystem) {
            if (completed) {
                this.phaseTransitionSystem.completePhase(phase);
            } else {
                this.phaseTransitionSystem.transitionToPhase(phase);
            }
            return;
        }

        // Fallback to legacy state management
        this.currentPhase = phase;
        
        if (completed && !this.completedPhases.includes(phase)) {
            this.completedPhases.push(phase);
        }
        
        // Update active sub-skills
        if (!this.activeSubSkills.includes(phase)) {
            this.activeSubSkills.push(phase);
        }
    }

    /**
     * Get all available triggers for help/debugging
     * @returns {Object} All triggers organized by category
     */
    getAllTriggers() {
        return {
            mainWorkflow: this.mainWorkflowTriggers,
            subSkills: this.subSkillTriggers
        };
    }

    /**
     * Generate error message for activation failures
     * @param {string} error - Error type
     * @param {Object} context - Additional context
     * @returns {string} Error message with troubleshooting
     */
    generateErrorMessage(error, context = {}) {
        const errorMessages = {
            'missing-files': `❌ **Activation Failed: Missing Files**\n\n` +
                           `The EARS-workflow skill package appears incomplete. Please ensure:\n\n` +
                           `- \`.ai/SKILL.md\` exists with valid YAML frontmatter\n` +
                           `- \`.ai/skills/\` directory contains all sub-skill folders\n` +
                           `- Each sub-skill has a valid \`SKILL.md\` file\n\n` +
                           `**Troubleshooting**: Check the installation documentation or verify package completeness.`,
            
            'invalid-yaml': `❌ **Activation Failed: Invalid Metadata**\n\n` +
                          `SKILL.md files contain invalid YAML frontmatter. Please check:\n\n` +
                          `- YAML syntax is correct (proper indentation, no tabs)\n` +
                          `- Required fields are present: name, description, version\n` +
                          `- No special characters in field values\n\n` +
                          `**File**: ${context.file || 'Unknown'}\n` +
                          `**Error**: ${context.yamlError || 'YAML parsing failed'}`,
            
            'dependency-missing': `❌ **Activation Failed: Missing Dependencies**\n\n` +
                                `Required dependencies are not available:\n\n` +
                                `${context.missingDeps ? context.missingDeps.map(dep => `- ${dep}`).join('\n') : '- Unknown dependencies'}\n\n` +
                                `**Troubleshooting**: Ensure all required files and sub-skills are properly installed.`,
            
            'context-overflow': `⚠️ **Activation Warning: Context Limit**\n\n` +
                              `The skill activation would exceed context window limits. Using progressive disclosure:\n\n` +
                              `- Loading minimal metadata only\n` +
                              `- Detailed instructions will load on-demand\n` +
                              `- Use specific sub-skill activation for focused capabilities\n\n` +
                              `**Recommendation**: Activate specific sub-skills rather than the full workflow.`
        };

        return errorMessages[error] || `❌ **Activation Failed**: ${error}\n\nPlease check the skill installation and try again.`;
    }

    /**
     * Reset activation state (for testing or cleanup)
     */
    reset() {
        // Reset phase transition system if available
        if (this.phaseTransitionSystem) {
            this.phaseTransitionSystem.reset();
        }

        // Reset legacy state
        this.currentPhase = null;
        this.completedPhases = [];
        this.activeSubSkills = [];
    }

    /**
     * Handle validation failure during activation
     * @param {Object} validation - Validation result from error handler
     * @returns {Object} Error response
     */
    handleValidationFailure(validation) {
        const criticalErrors = validation.errors.filter(e => e.severity === 'critical');
        const errorType = criticalErrors.length > 0 ? criticalErrors[0].type : 'validation-error';
        
        return {
            type: 'error',
            skill: null,
            confidence: 0,
            error: errorType,
            message: validation.summary,
            details: {
                errors: validation.errors,
                warnings: validation.warnings,
                missing: validation.missing
            },
            troubleshooting: this.errorHandler ? 
                this.errorHandler.getTroubleshootingSteps(errorType, { missing: validation.missing }) : 
                ['Check skill installation', 'Verify all required files are present'],
            recovery: this.errorHandler ?
                this.errorHandler.getRecoveryOptions(errorType, { missing: validation.missing }) :
                ['Reinstall the skill package', 'Check documentation']
        };
    }

    /**
     * Handle analysis error during input processing
     * @param {Error} error - The error that occurred
     * @param {string} userInput - The input being analyzed
     * @returns {Object} Error response
     */
    handleAnalysisError(error, userInput) {
        return {
            type: 'error',
            skill: null,
            confidence: 0,
            error: 'analysis-error',
            message: `❌ **Activation Error**: Failed to analyze input\n\n` +
                    `**Error**: ${error.message}\n\n` +
                    `**Input**: "${userInput.substring(0, 50)}${userInput.length > 50 ? '...' : ''}"\n\n` +
                    `**Troubleshooting**: This may indicate a system issue. Try restarting or check the error logs.`,
            details: {
                errorMessage: error.message,
                errorStack: error.stack,
                input: userInput
            },
            troubleshooting: [
                'Try rephrasing your request',
                'Restart your IDE or development environment',
                'Check system logs for additional details',
                'Verify skill installation is complete'
            ],
            recovery: [
                'Retry with a simpler activation phrase',
                'Use explicit skill names (e.g., "use spec-forge")',
                'Check for system resource issues',
                'Contact support if the issue persists'
            ]
        };
    }

    /**
     * Validate skill installation and return detailed status
     * @returns {Object} Installation validation result
     */
    validateInstallation() {
        if (!this.errorHandler) {
            return {
                valid: true,
                message: 'Error handler not available - skipping validation'
            };
        }

        return this.errorHandler.validateInstallation();
    }

    /**
     * Get error handler instance for external use
     * @returns {ActivationErrorHandler|null} Error handler instance
     */
    getErrorHandler() {
        return this.errorHandler;
    }

    /**
     * Get phase transition system instance for external use
     * @returns {PhaseTransitionSystem|null} Phase transition system instance
     */
    getPhaseTransitionSystem() {
        return this.phaseTransitionSystem;
    }

    /**
     * Get current workflow status from phase transition system
     * @returns {Object} Current workflow status
     */
    getWorkflowStatus() {
        if (this.phaseTransitionSystem) {
            return this.phaseTransitionSystem.getWorkflowStatus();
        }

        // Fallback to legacy status
        return {
            workflowStarted: this.currentPhase !== null,
            currentPhase: this.currentPhase,
            completedPhases: this.completedPhases,
            activeSubSkills: this.activeSubSkills,
            progress: `${this.completedPhases.length}/${this.phaseSequence.length}`,
            isComplete: this.completedPhases.length === this.phaseSequence.length,
            nextPhase: this.getNextPhase(),
            progressIndicator: null
        };
    }

    /**
     * Get next phase in sequence (legacy method)
     * @returns {string|null} Next phase or null
     */
    getNextPhase() {
        if (this.phaseTransitionSystem) {
            return this.phaseTransitionSystem.getNextPhase();
        }

        if (!this.currentPhase) {
            return this.phaseSequence[0];
        }

        const currentIndex = this.phaseSequence.indexOf(this.currentPhase);
        return currentIndex >= 0 && currentIndex < this.phaseSequence.length - 1 
            ? this.phaseSequence[currentIndex + 1] 
            : null;
    }
}

// Export for use in skill system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkillActivationRouter;
}

// Global instance for immediate use
if (typeof window !== 'undefined') {
    window.SkillActivationRouter = SkillActivationRouter;
}