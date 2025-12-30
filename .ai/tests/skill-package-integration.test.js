/**
 * Skill Package Integration Tests
 * 
 * Tests for Requirements 1.1, 2.1, 4.1:
 * - End-to-end workflow execution
 * - Skill activation and phase transitions
 * - Backward compatibility with existing projects
 * 
 * @version 1.0.0
 */

const fc = require('fast-check');
const fs = require('fs');
const path = require('path');

// Mock workflow execution environment
class WorkflowExecutor {
    constructor(basePath = '.ai') {
        this.basePath = basePath;
        this.currentPhase = null;
        this.completedPhases = [];
        this.activeSkills = [];
        this.contextLoaded = [];
        this.executionLog = [];
    }

    /**
     * Simulate skill activation based on user input
     * @param {string} userInput - User's request/command
     * @returns {Object} Activation result
     */
    activateSkill(userInput) {
        const activation = {
            success: false,
            skillActivated: null,
            phaseEntered: null,
            contextLoaded: [],
            errors: [],
            warnings: []
        };

        try {
            // Parse user intent
            const intent = this.parseUserIntent(userInput);
            
            if (intent.type === 'main-workflow') {
                activation.skillActivated = 'ears-workflow';
                activation.phaseEntered = 'spec-forge'; // Always starts with SPEC-FORGE
                this.currentPhase = 'spec-forge';
                this.activeSkills = ['ears-workflow'];
                
                // Load appropriate context
                activation.contextLoaded = this.loadPhaseContext('spec-forge');
                this.contextLoaded = activation.contextLoaded;
                
            } else if (intent.type === 'sub-skill') {
                activation.skillActivated = intent.skill;
                this.activeSkills.push(intent.skill);
                
                // Load sub-skill context
                activation.contextLoaded = this.loadSubSkillContext(intent.skill);
                this.contextLoaded.push(...activation.contextLoaded);
                
            } else if (intent.type === 'phase-transition') {
                const transitionResult = this.transitionPhase(intent.targetPhase);
                if (transitionResult.success) {
                    activation.phaseEntered = intent.targetPhase;
                    activation.contextLoaded = transitionResult.contextLoaded;
                } else {
                    activation.errors.push(...transitionResult.errors);
                }
            } else {
                activation.warnings.push('No skill activation detected in user input');
            }

            activation.success = activation.errors.length === 0;
            
            // Log the activation
            this.executionLog.push({
                timestamp: Date.now(),
                userInput,
                activation: { ...activation }
            });

        } catch (error) {
            activation.errors.push(`Skill activation failed: ${error.message}`);
        }

        return activation;
    }

    /**
     * Parse user input to determine intent
     * @param {string} input - User input
     * @returns {Object} Parsed intent
     */
    parseUserIntent(input) {
        const lowerInput = input.toLowerCase();

        // Main workflow activation
        if (lowerInput.includes('ears-workflow') || lowerInput.includes('use ears workflow')) {
            return { type: 'main-workflow' };
        }

        // Sub-skill activation
        const subSkills = ['spec-forge', 'planning', 'work', 'review', 'git-worktree', 'project-reset'];
        for (const skill of subSkills) {
            if (lowerInput.includes(skill) || lowerInput.includes(`use ${skill}`)) {
                return { type: 'sub-skill', skill };
            }
        }

        // Phase transition
        const phases = ['spec-forge', 'plan', 'work', 'review'];
        for (const phase of phases) {
            if (lowerInput.includes(`move to ${phase}`) || lowerInput.includes(`start ${phase}`)) {
                return { type: 'phase-transition', targetPhase: phase };
            }
        }

        return { type: 'unknown' };
    }

    /**
     * Load context for a specific phase
     * @param {string} phase - Phase name
     * @returns {Array} List of loaded context files
     */
    loadPhaseContext(phase) {
        const contextFiles = [];
        
        try {
            // Always load memory files
            const memoryFiles = [
                path.join(this.basePath, 'memory', 'lessons.md'),
                path.join(this.basePath, 'memory', 'decisions.md')
            ];

            for (const memoryFile of memoryFiles) {
                if (fs.existsSync(memoryFile)) {
                    contextFiles.push(memoryFile);
                }
            }

            // Load phase-specific files
            switch (phase) {
                case 'spec-forge':
                    const specForgeFiles = [
                        path.join(this.basePath, 'workflows', 'ears-workflow.md'),
                        path.join(this.basePath, 'templates', 'requirements-template.md'),
                        path.join(this.basePath, 'templates', 'ears-validation.md'),
                        path.join(this.basePath, 'templates', 'incose-validation.md')
                    ];
                    contextFiles.push(...specForgeFiles.filter(f => fs.existsSync(f)));
                    break;

                case 'plan':
                    const planFiles = [
                        path.join(this.basePath, 'workflows', 'planning.md'),
                        path.join(this.basePath, 'roles', 'architect.md')
                    ];
                    contextFiles.push(...planFiles.filter(f => fs.existsSync(f)));
                    break;

                case 'work':
                    const workFiles = [
                        path.join(this.basePath, 'workflows', 'execution.md'),
                        path.join(this.basePath, 'protocols', 'git-worktree.md'),
                        path.join(this.basePath, 'roles', 'builder.md')
                    ];
                    contextFiles.push(...workFiles.filter(f => fs.existsSync(f)));
                    break;

                case 'review':
                    const reviewFiles = [
                        path.join(this.basePath, 'workflows', 'review.md'),
                        path.join(this.basePath, 'roles', 'auditor.md')
                    ];
                    contextFiles.push(...reviewFiles.filter(f => fs.existsSync(f)));
                    break;
            }

        } catch (error) {
            // Context loading errors are non-fatal
            console.warn(`Context loading warning: ${error.message}`);
        }

        return contextFiles;
    }

    /**
     * Load context for a sub-skill
     * @param {string} skillName - Sub-skill name
     * @returns {Array} List of loaded context files
     */
    loadSubSkillContext(skillName) {
        const contextFiles = [];
        
        try {
            const skillPath = path.join(this.basePath, 'skills', skillName);
            
            // Load skill definition
            const skillFile = path.join(skillPath, 'SKILL.md');
            if (fs.existsSync(skillFile)) {
                contextFiles.push(skillFile);
            }

            // Load references
            const referencesPath = path.join(skillPath, 'references');
            if (fs.existsSync(referencesPath)) {
                const referenceFiles = fs.readdirSync(referencesPath)
                    .filter(f => f.endsWith('.md'))
                    .map(f => path.join(referencesPath, f));
                contextFiles.push(...referenceFiles);
            }

        } catch (error) {
            console.warn(`Sub-skill context loading warning: ${error.message}`);
        }

        return contextFiles;
    }

    /**
     * Transition between workflow phases
     * @param {string} targetPhase - Target phase
     * @returns {Object} Transition result
     */
    transitionPhase(targetPhase) {
        const result = {
            success: false,
            contextLoaded: [],
            errors: [],
            warnings: []
        };

        try {
            // Validate phase sequence
            const phaseSequence = ['spec-forge', 'plan', 'work', 'review'];
            const currentIndex = phaseSequence.indexOf(this.currentPhase);
            const targetIndex = phaseSequence.indexOf(targetPhase);

            if (targetIndex === -1) {
                result.errors.push(`Invalid target phase: ${targetPhase}`);
                return result;
            }

            // Check if skipping phases
            if (targetIndex > currentIndex + 1) {
                result.errors.push(`Cannot skip phases. Current: ${this.currentPhase}, Target: ${targetPhase}`);
                return result;
            }

            // Allow moving to next phase or staying in current phase
            if (targetIndex <= currentIndex + 1) {
                // Unload previous phase context
                this.contextLoaded = [];
                
                // Load new phase context
                result.contextLoaded = this.loadPhaseContext(targetPhase);
                this.contextLoaded = result.contextLoaded;
                
                // Update phase state
                if (!this.completedPhases.includes(this.currentPhase) && this.currentPhase) {
                    this.completedPhases.push(this.currentPhase);
                }
                this.currentPhase = targetPhase;
                
                result.success = true;
            } else {
                result.errors.push(`Invalid phase transition from ${this.currentPhase} to ${targetPhase}`);
            }

        } catch (error) {
            result.errors.push(`Phase transition failed: ${error.message}`);
        }

        return result;
    }

    /**
     * Execute a complete workflow from SPEC-FORGE to REVIEW
     * @returns {Object} Execution result
     */
    executeCompleteWorkflow() {
        const execution = {
            success: false,
            phasesCompleted: [],
            totalTime: 0,
            errors: [],
            warnings: []
        };

        const startTime = Date.now();

        try {
            // Phase 1: SPEC-FORGE
            const specForgeResult = this.activateSkill('use EARS workflow');
            if (!specForgeResult.success) {
                execution.errors.push('Failed to activate SPEC-FORGE phase');
                return execution;
            }
            execution.phasesCompleted.push('spec-forge');

            // Phase 2: PLAN
            const planResult = this.transitionPhase('plan');
            if (!planResult.success) {
                execution.errors.push('Failed to transition to PLAN phase');
                return execution;
            }
            execution.phasesCompleted.push('plan');

            // Phase 3: WORK
            const workResult = this.transitionPhase('work');
            if (!workResult.success) {
                execution.errors.push('Failed to transition to WORK phase');
                return execution;
            }
            execution.phasesCompleted.push('work');

            // Phase 4: REVIEW
            const reviewResult = this.transitionPhase('review');
            if (!reviewResult.success) {
                execution.errors.push('Failed to transition to REVIEW phase');
                return execution;
            }
            execution.phasesCompleted.push('review');

            execution.success = true;

        } catch (error) {
            execution.errors.push(`Workflow execution failed: ${error.message}`);
        }

        execution.totalTime = Date.now() - startTime;
        return execution;
    }

    /**
     * Test backward compatibility with existing projects
     * @returns {Object} Compatibility test result
     */
    testBackwardCompatibility() {
        const compatibility = {
            compatible: true,
            memoryFilesAccessible: false,
            workflowFilesAccessible: false,
            skillScriptsAccessible: false,
            templatesAccessible: false,
            errors: [],
            warnings: []
        };

        try {
            // Test memory files accessibility
            const memoryFiles = [
                path.join(this.basePath, 'memory', 'lessons.md'),
                path.join(this.basePath, 'memory', 'decisions.md')
            ];

            let memoryFilesFound = 0;
            for (const memoryFile of memoryFiles) {
                if (fs.existsSync(memoryFile)) {
                    memoryFilesFound++;
                    // Try to read the file
                    const content = fs.readFileSync(memoryFile, 'utf8');
                    if (content.length === 0) {
                        compatibility.warnings.push(`Memory file is empty: ${memoryFile}`);
                    }
                }
            }
            compatibility.memoryFilesAccessible = memoryFilesFound >= 2;

            // Test workflow files accessibility
            const workflowFiles = [
                path.join(this.basePath, 'workflows', 'ears-workflow.md'),
                path.join(this.basePath, 'workflows', 'planning.md'),
                path.join(this.basePath, 'workflows', 'execution.md'),
                path.join(this.basePath, 'workflows', 'review.md')
            ];

            let workflowFilesFound = 0;
            for (const workflowFile of workflowFiles) {
                if (fs.existsSync(workflowFile)) {
                    workflowFilesFound++;
                }
            }
            compatibility.workflowFilesAccessible = workflowFilesFound >= 3;

            // Test skill scripts accessibility
            const skillDirs = [
                path.join(this.basePath, 'skills', 'git-worktree'),
                path.join(this.basePath, 'skills', 'project-reset')
            ];

            let skillDirsFound = 0;
            for (const skillDir of skillDirs) {
                if (fs.existsSync(skillDir)) {
                    skillDirsFound++;
                    
                    // Check for script files
                    const scriptFiles = fs.readdirSync(skillDir)
                        .filter(f => f.endsWith('.sh') || f.endsWith('.js'));
                    
                    if (scriptFiles.length === 0) {
                        compatibility.warnings.push(`No script files found in ${skillDir}`);
                    }
                }
            }
            compatibility.skillScriptsAccessible = skillDirsFound >= 1;

            // Test templates accessibility
            const templateFiles = [
                path.join(this.basePath, 'templates', 'requirements-template.md'),
                path.join(this.basePath, 'templates', 'ears-validation.md'),
                path.join(this.basePath, 'templates', 'incose-validation.md')
            ];

            let templateFilesFound = 0;
            for (const templateFile of templateFiles) {
                if (fs.existsSync(templateFile)) {
                    templateFilesFound++;
                }
            }
            compatibility.templatesAccessible = templateFilesFound >= 2;

            // Overall compatibility assessment
            if (!compatibility.memoryFilesAccessible) {
                compatibility.compatible = false;
                compatibility.errors.push('Memory files not accessible - backward compatibility broken');
            }

            if (!compatibility.workflowFilesAccessible) {
                compatibility.compatible = false;
                compatibility.errors.push('Workflow files not accessible - backward compatibility broken');
            }

            if (!compatibility.templatesAccessible) {
                compatibility.warnings.push('Some template files not accessible - may affect functionality');
            }

        } catch (error) {
            compatibility.compatible = false;
            compatibility.errors.push(`Backward compatibility test failed: ${error.message}`);
        }

        return compatibility;
    }

    /**
     * Get current execution state
     * @returns {Object} Current state
     */
    getState() {
        return {
            currentPhase: this.currentPhase,
            completedPhases: [...this.completedPhases],
            activeSkills: [...this.activeSkills],
            contextLoaded: [...this.contextLoaded],
            executionLog: [...this.executionLog]
        };
    }

    /**
     * Reset executor state
     */
    reset() {
        this.currentPhase = null;
        this.completedPhases = [];
        this.activeSkills = [];
        this.contextLoaded = [];
        this.executionLog = [];
    }
}

// Test generators
const userInputGen = fc.oneof(
    fc.constant('use EARS workflow'),
    fc.constant('EARS-workflow'),
    fc.constant('use spec-forge'),
    fc.constant('use planning'),
    fc.constant('use work'),
    fc.constant('use review'),
    fc.constant('use git-worktree'),
    fc.constant('use project-reset'),
    fc.constant('move to plan'),
    fc.constant('start work phase'),
    fc.constant('begin review')
);

const phaseSequenceGen = fc.array(
    fc.constantFrom('spec-forge', 'plan', 'work', 'review'),
    { minLength: 1, maxLength: 4 }
);

describe('Skill Package Integration Tests', () => {
    let executor;

    beforeEach(() => {
        executor = new WorkflowExecutor();
    });

    afterEach(() => {
        executor.reset();
    });

    /**
     * Test for Requirement 1.1: Agent Skills package recognition
     * WHEN a user copies the .ai/ directory into their project root, 
     * THEN the system SHALL be recognized as a valid Agent Skills package
     */
    test('Requirement 1.1: Agent Skills package recognition', () => {
        fc.assert(fc.property(
            userInputGen,
            (userInput) => {
                const activation = executor.activateSkill(userInput);

                // Should be able to activate skills from the package
                if (userInput.includes('EARS') || userInput.includes('workflow')) {
                    expect(activation.success).toBe(true);
                    expect(activation.skillActivated).toBe('ears-workflow');
                    expect(activation.phaseEntered).toBe('spec-forge');
                }

                // Should load appropriate context
                if (activation.success) {
                    expect(activation.contextLoaded.length).toBeGreaterThan(0);
                    
                    // Should include memory files
                    const memoryFiles = activation.contextLoaded.filter(f => 
                        f.includes('memory')
                    );
                    expect(memoryFiles.length).toBeGreaterThan(0);
                }
            }
        ), { numRuns: 30 });
    });

    /**
     * Test for Requirement 2.1: Skill activation
     * WHEN a user mentions "EARS-workflow" or "use EARS workflow", 
     * THEN the system SHALL activate the main skill
     */
    test('Requirement 2.1: Main skill activation', () => {
        fc.assert(fc.property(
            fc.constantFrom('EARS-workflow', 'use EARS workflow', 'ears-workflow'),
            (activationPhrase) => {
                const activation = executor.activateSkill(activationPhrase);

                // Should successfully activate main skill
                expect(activation.success).toBe(true);
                expect(activation.skillActivated).toBe('ears-workflow');
                expect(activation.phaseEntered).toBe('spec-forge');

                // Should load phase-based instructions
                expect(activation.contextLoaded.length).toBeGreaterThan(0);
                
                // Should include SPEC-FORGE phase files
                const specForgeFiles = activation.contextLoaded.filter(f =>
                    f.includes('ears-workflow') || 
                    f.includes('requirements-template') ||
                    f.includes('ears-validation')
                );
                expect(specForgeFiles.length).toBeGreaterThan(0);

                // Should provide clear feedback
                expect(activation.phaseEntered).toBeDefined();
                expect(activation.skillActivated).toBeDefined();
            }
        ), { numRuns: 20 });
    });

    /**
     * Test for Requirement 4.1: Phase sequence enforcement
     * WHEN the EARS-workflow is initiated, THEN the system SHALL always start with SPEC-FORGE
     */
    test('Requirement 4.1: Phase sequence enforcement', () => {
        fc.assert(fc.property(
            fc.constantFrom('use EARS workflow', 'EARS-workflow', 'start ears workflow'),
            (activationPhrase) => {
                const activation = executor.activateSkill(activationPhrase);

                // Should always start with SPEC-FORGE phase
                expect(activation.success).toBe(true);
                expect(activation.phaseEntered).toBe('spec-forge');
                expect(executor.currentPhase).toBe('spec-forge');

                // Should not allow skipping to later phases initially
                const skipAttempt = executor.transitionPhase('review');
                expect(skipAttempt.success).toBe(false);
                expect(skipAttempt.errors.length).toBeGreaterThan(0);
                expect(skipAttempt.errors[0]).toContain('Cannot skip phases');
            }
        ), { numRuns: 15 });
    });

    /**
     * Test complete workflow execution
     * End-to-end test of the entire SPEC-FORGE → PLAN → WORK → REVIEW sequence
     */
    test('Complete workflow execution', () => {
        const execution = executor.executeCompleteWorkflow();

        // Should complete all phases successfully
        expect(execution.success).toBe(true);
        expect(execution.phasesCompleted).toEqual(['spec-forge', 'plan', 'work', 'review']);
        expect(execution.errors.length).toBe(0);

        // Should have reasonable execution time
        expect(execution.totalTime).toBeLessThan(5000); // Under 5 seconds

        // Final state should be correct
        const state = executor.getState();
        expect(state.currentPhase).toBe('review');
        expect(state.completedPhases).toContain('spec-forge');
        expect(state.completedPhases).toContain('plan');
        expect(state.completedPhases).toContain('work');
    });

    /**
     * Test sub-skill activation
     * Each sub-skill should activate independently with appropriate context
     */
    test('Sub-skill activation', () => {
        fc.assert(fc.property(
            fc.constantFrom('spec-forge', 'planning', 'work', 'review', 'git-worktree', 'project-reset'),
            (subSkill) => {
                const activation = executor.activateSkill(`use ${subSkill}`);

                // Should activate the sub-skill
                expect(activation.success).toBe(true);
                expect(activation.skillActivated).toBe(subSkill);

                // Should load sub-skill context
                expect(activation.contextLoaded.length).toBeGreaterThan(0);

                // Should include sub-skill specific files
                const subSkillFiles = activation.contextLoaded.filter(f =>
                    f.includes(subSkill)
                );
                expect(subSkillFiles.length).toBeGreaterThan(0);

                // Should update active skills
                const state = executor.getState();
                expect(state.activeSkills).toContain(subSkill);
            }
        ), { numRuns: 30 });
    });

    /**
     * Test phase transitions
     * Phase transitions should follow the correct sequence and load appropriate context
     */
    test('Phase transitions', () => {
        fc.assert(fc.property(
            phaseSequenceGen,
            (phaseSequence) => {
                // Start with SPEC-FORGE
                const initialActivation = executor.activateSkill('use EARS workflow');
                expect(initialActivation.success).toBe(true);

                let lastSuccessfulPhase = 'spec-forge';

                // Try to transition through the sequence
                for (const targetPhase of phaseSequence) {
                    const transition = executor.transitionPhase(targetPhase);
                    
                    // Should succeed if not skipping phases
                    const phaseOrder = ['spec-forge', 'plan', 'work', 'review'];
                    const currentIndex = phaseOrder.indexOf(lastSuccessfulPhase);
                    const targetIndex = phaseOrder.indexOf(targetPhase);

                    if (targetIndex <= currentIndex + 1 && targetIndex >= 0) {
                        expect(transition.success).toBe(true);
                        expect(transition.contextLoaded.length).toBeGreaterThan(0);
                        lastSuccessfulPhase = targetPhase;
                    } else if (targetIndex > currentIndex + 1) {
                        expect(transition.success).toBe(false);
                        expect(transition.errors.length).toBeGreaterThan(0);
                    }
                }
            }
        ), { numRuns: 25 });
    });

    /**
     * Test backward compatibility
     * Existing project files should remain accessible and functional
     */
    test('Backward compatibility with existing projects', () => {
        const compatibility = executor.testBackwardCompatibility();

        // Core backward compatibility requirements
        expect(compatibility.memoryFilesAccessible).toBe(true);
        expect(compatibility.workflowFilesAccessible).toBe(true);

        // Should not have critical compatibility errors
        const criticalErrors = compatibility.errors.filter(error =>
            error.includes('backward compatibility broken')
        );
        expect(criticalErrors.length).toBe(0);

        // Overall compatibility should be maintained
        expect(compatibility.compatible).toBe(true);
    });

    /**
     * Test skill dormancy
     * Skills should remain dormant when not explicitly invoked
     */
    test('Skill dormancy preservation', () => {
        fc.assert(fc.property(
            fc.string({ minLength: 5, maxLength: 50 }).filter(s => 
                !s.toLowerCase().includes('ears') && 
                !s.toLowerCase().includes('workflow') &&
                !s.toLowerCase().includes('spec-forge') &&
                !s.toLowerCase().includes('planning') &&
                !s.toLowerCase().includes('work') &&
                !s.toLowerCase().includes('review')
            ),
            (randomInput) => {
                const activation = executor.activateSkill(randomInput);

                // Should not activate skills for unrelated input
                expect(activation.skillActivated).toBeNull();
                expect(activation.phaseEntered).toBeNull();
                expect(activation.contextLoaded.length).toBe(0);

                // Should provide appropriate warning
                expect(activation.warnings.length).toBeGreaterThan(0);
                expect(activation.warnings[0]).toContain('No skill activation detected');
            }
        ), { numRuns: 20 });
    });

    /**
     * Test context management
     * Context should be loaded and unloaded appropriately during phase transitions
     */
    test('Context management during phase transitions', () => {
        // Start workflow
        const initialActivation = executor.activateSkill('use EARS workflow');
        expect(initialActivation.success).toBe(true);
        
        const initialContextCount = executor.getState().contextLoaded.length;
        expect(initialContextCount).toBeGreaterThan(0);

        // Transition to next phase
        const transition = executor.transitionPhase('plan');
        expect(transition.success).toBe(true);

        const newContextCount = executor.getState().contextLoaded.length;
        
        // Context should be refreshed (may be different count)
        expect(newContextCount).toBeGreaterThan(0);
        
        // Should include planning-specific context
        const planningContext = executor.getState().contextLoaded.filter(f =>
            f.includes('planning') || f.includes('architect')
        );
        expect(planningContext.length).toBeGreaterThan(0);
    });

    /**
     * Test error handling
     * System should handle errors gracefully and provide helpful messages
     */
    test('Error handling and recovery', () => {
        // Test invalid phase transition
        const invalidTransition = executor.transitionPhase('invalid-phase');
        expect(invalidTransition.success).toBe(false);
        expect(invalidTransition.errors.length).toBeGreaterThan(0);
        expect(invalidTransition.errors[0]).toContain('Invalid target phase');

        // Test phase skipping
        executor.activateSkill('use EARS workflow'); // Start at spec-forge
        const skipAttempt = executor.transitionPhase('review'); // Skip to review
        expect(skipAttempt.success).toBe(false);
        expect(skipAttempt.errors.length).toBeGreaterThan(0);
        expect(skipAttempt.errors[0]).toContain('Cannot skip phases');

        // System should remain in valid state after errors
        const state = executor.getState();
        expect(state.currentPhase).toBe('spec-forge'); // Should not have changed
    });

    /**
     * Test execution logging
     * System should maintain a log of all activations and transitions
     */
    test('Execution logging', () => {
        // Perform several operations
        executor.activateSkill('use EARS workflow');
        executor.activateSkill('use git-worktree');
        executor.transitionPhase('plan');

        const state = executor.getState();
        
        // Should have logged all operations
        expect(state.executionLog.length).toBe(3);
        
        // Each log entry should have required fields
        for (const logEntry of state.executionLog) {
            expect(logEntry.timestamp).toBeDefined();
            expect(logEntry.userInput).toBeDefined();
            expect(logEntry.activation).toBeDefined();
            expect(typeof logEntry.timestamp).toBe('number');
            expect(typeof logEntry.userInput).toBe('string');
        }

        // Log should be in chronological order
        for (let i = 1; i < state.executionLog.length; i++) {
            expect(state.executionLog[i].timestamp).toBeGreaterThanOrEqual(
                state.executionLog[i - 1].timestamp
            );
        }
    });
});

// Integration test scenarios
describe('Integration Test Scenarios', () => {
    let executor;

    beforeEach(() => {
        executor = new WorkflowExecutor();
    });

    afterEach(() => {
        executor.reset();
    });

    test('Scenario: New feature development workflow', () => {
        // Step 1: Start new feature with EARS workflow
        const start = executor.activateSkill('use EARS workflow for new feature');
        expect(start.success).toBe(true);
        expect(start.phaseEntered).toBe('spec-forge');

        // Step 2: Complete requirements and move to planning
        const planTransition = executor.transitionPhase('plan');
        expect(planTransition.success).toBe(true);

        // Step 3: Move to implementation
        const workTransition = executor.transitionPhase('work');
        expect(workTransition.success).toBe(true);

        // Step 4: Use git-worktree for isolated development
        const gitWorktree = executor.activateSkill('use git-worktree');
        expect(gitWorktree.success).toBe(true);
        expect(gitWorktree.skillActivated).toBe('git-worktree');

        // Step 5: Complete work and move to review
        const reviewTransition = executor.transitionPhase('review');
        expect(reviewTransition.success).toBe(true);

        // Final state should be complete
        const finalState = executor.getState();
        expect(finalState.currentPhase).toBe('review');
        expect(finalState.completedPhases).toContain('spec-forge');
        expect(finalState.completedPhases).toContain('plan');
        expect(finalState.completedPhases).toContain('work');
        expect(finalState.activeSkills).toContain('ears-workflow');
        expect(finalState.activeSkills).toContain('git-worktree');
    });

    test('Scenario: Quick sub-skill usage', () => {
        // Use individual sub-skills without full workflow
        const specForge = executor.activateSkill('use spec-forge');
        expect(specForge.success).toBe(true);
        expect(specForge.skillActivated).toBe('spec-forge');

        const planning = executor.activateSkill('use planning');
        expect(planning.success).toBe(true);
        expect(planning.skillActivated).toBe('planning');

        const gitWorktree = executor.activateSkill('use git-worktree');
        expect(gitWorktree.success).toBe(true);
        expect(gitWorktree.skillActivated).toBe('git-worktree');

        // All should be active
        const state = executor.getState();
        expect(state.activeSkills).toContain('spec-forge');
        expect(state.activeSkills).toContain('planning');
        expect(state.activeSkills).toContain('git-worktree');
    });

    test('Scenario: Error recovery and continuation', () => {
        // Start workflow
        const start = executor.activateSkill('use EARS workflow');
        expect(start.success).toBe(true);

        // Attempt invalid operation
        const invalidOp = executor.transitionPhase('invalid-phase');
        expect(invalidOp.success).toBe(false);

        // System should still be functional
        const validTransition = executor.transitionPhase('plan');
        expect(validTransition.success).toBe(true);

        // Should be able to continue normally
        const workTransition = executor.transitionPhase('work');
        expect(workTransition.success).toBe(true);

        const finalState = executor.getState();
        expect(finalState.currentPhase).toBe('work');
    });

    test('Scenario: Mixed workflow and sub-skill usage', () => {
        // Start main workflow
        const mainWorkflow = executor.activateSkill('EARS-workflow');
        expect(mainWorkflow.success).toBe(true);

        // Use utility sub-skills alongside main workflow
        const projectReset = executor.activateSkill('use project-reset');
        expect(projectReset.success).toBe(true);

        // Continue with main workflow
        const planTransition = executor.transitionPhase('plan');
        expect(planTransition.success).toBe(true);

        // Use more sub-skills
        const gitWorktree = executor.activateSkill('use git-worktree');
        expect(gitWorktree.success).toBe(true);

        // Final state should have both main workflow and sub-skills active
        const state = executor.getState();
        expect(state.currentPhase).toBe('plan');
        expect(state.activeSkills).toContain('ears-workflow');
        expect(state.activeSkills).toContain('project-reset');
        expect(state.activeSkills).toContain('git-worktree');
    });

    test('Scenario: Backward compatibility verification', () => {
        // Test that existing project structure works
        const compatibility = executor.testBackwardCompatibility();
        expect(compatibility.compatible).toBe(true);

        // Should be able to activate skills with existing structure
        const activation = executor.activateSkill('use EARS workflow');
        expect(activation.success).toBe(true);

        // Should load existing memory files
        const memoryContext = activation.contextLoaded.filter(f =>
            f.includes('lessons.md') || f.includes('decisions.md')
        );
        expect(memoryContext.length).toBeGreaterThan(0);

        // Should access existing workflow files
        const workflowContext = activation.contextLoaded.filter(f =>
            f.includes('workflows')
        );
        expect(workflowContext.length).toBeGreaterThan(0);
    });
});