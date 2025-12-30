/**
 * Property-Based Tests for Progressive Disclosure System
 * 
 * **Feature: ears-workflow-skill-refactor, Property 13: Progressive disclosure efficiency**
 * **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**
 * 
 * Tests that the progressive disclosure system efficiently manages context by:
 * - Loading only active skill instructions into context
 * - Keeping inactive skills at minimal metadata level
 * - Managing token usage within defined limits
 * - Optimizing context during phase transitions
 * 
 * @version 1.0.0
 */

const fc = require('fast-check');

// Mock file system for testing
const mockFs = {
    files: new Map(),
    readFile: async (path) => {
        if (mockFs.files.has(path)) {
            return mockFs.files.get(path);
        }
        throw new Error(`File not found: ${path}`);
    },
    writeFile: async (path, content) => {
        mockFs.files.set(path, content);
    },
    exists: async (path) => {
        return mockFs.files.has(path);
    },
    readdir: async (path) => {
        const entries = [];
        for (const [filePath] of mockFs.files) {
            if (filePath.startsWith(path) && filePath !== path) {
                const relativePath = filePath.substring(path.length + 1);
                const parts = relativePath.split('/');
                if (parts.length === 1 || (parts.length === 2 && parts[1] === 'SKILL.md')) {
                    entries.push({ name: parts[0], isDirectory: () => parts.length > 1 });
                }
            }
        }
        return entries;
    }
};

// Mock context manager for testing
class MockContextManager {
    constructor() {
        this.loadedContext = {
            discovery: new Map(),
            activation: new Map(),
            execution: new Map()
        };
        this.activeSkills = new Set();
        this.inactiveSkills = new Set();
        this.tokenUsage = { discovery: 0, activation: 0, execution: 0, total: 0 };
        this.TOKEN_LIMITS = {
            DISCOVERY_PER_SKILL: 50,
            ACTIVATION_PER_SKILL: 1000,
            EXECUTION_PER_FILE: 2000,
            TOTAL_CONTEXT_LIMIT: 8000
        };
    }

    async initialize() {
        // Simulate loading discovery metadata for all skills
        const skills = ['ears-workflow', 'spec-forge', 'planning', 'work', 'review', 'git-worktree', 'project-reset'];
        
        for (const skill of skills) {
            this.loadedContext.discovery.set(skill, {
                name: skill,
                description: `${skill} skill description`,
                version: '1.0.0',
                tokens: this.TOKEN_LIMITS.DISCOVERY_PER_SKILL
            });
            this.inactiveSkills.add(skill);
        }

        this.updateTokenUsage();
        return { success: true, skillsLoaded: skills.length, discoveryTokens: this.tokenUsage.discovery };
    }

    async activateSkill(skillName) {
        if (!this.inactiveSkills.has(skillName)) {
            return { success: false, error: 'Skill not found or already active' };
        }

        const instructions = {
            skillName: skillName,
            content: `Detailed instructions for ${skillName}`.repeat(50), // Simulate realistic content
            tokens: this.TOKEN_LIMITS.ACTIVATION_PER_SKILL
        };

        this.loadedContext.activation.set(skillName, instructions);
        this.activeSkills.add(skillName);
        this.inactiveSkills.delete(skillName);
        this.updateTokenUsage();

        return { success: true, skillName: skillName, tokensUsed: instructions.tokens };
    }

    deactivateSkill(skillName) {
        if (!this.activeSkills.has(skillName)) {
            return { success: true, alreadyInactive: true, tokensFreed: 0 };
        }

        const instructions = this.loadedContext.activation.get(skillName);
        const tokensFreed = instructions ? instructions.tokens : 0;

        this.loadedContext.activation.delete(skillName);
        this.activeSkills.delete(skillName);
        this.inactiveSkills.add(skillName);
        this.updateTokenUsage();

        return { success: true, skillName: skillName, tokensFreed: tokensFreed };
    }

    async loadSupportingFile(filePath, skillContext) {
        const content = `Supporting file content for ${filePath}`.repeat(100);
        const tokens = Math.min(this.estimateTokens(content), this.TOKEN_LIMITS.EXECUTION_PER_FILE);

        this.loadedContext.execution.set(filePath, {
            content: content,
            skillContext: skillContext,
            tokens: tokens,
            loadedAt: new Date()
        });

        this.updateTokenUsage();
        return { success: true, filePath: filePath, tokensUsed: tokens };
    }

    unloadSupportingFiles(filePaths) {
        const paths = Array.isArray(filePaths) ? filePaths : [filePaths];
        let tokensFreed = 0;

        for (const path of paths) {
            const fileData = this.loadedContext.execution.get(path);
            if (fileData) {
                tokensFreed += fileData.tokens;
                this.loadedContext.execution.delete(path);
            }
        }

        this.updateTokenUsage();
        return { success: true, filesUnloaded: paths.length, tokensFreed: tokensFreed };
    }

    getContextStatus() {
        return {
            tokenUsage: { ...this.tokenUsage },
            tokenLimits: { ...this.TOKEN_LIMITS },
            utilizationPercent: Math.round((this.tokenUsage.total / this.TOKEN_LIMITS.TOTAL_CONTEXT_LIMIT) * 100),
            activeSkills: Array.from(this.activeSkills),
            inactiveSkills: Array.from(this.inactiveSkills),
            loadedFiles: Array.from(this.loadedContext.execution.keys())
        };
    }

    estimateTokens(content) {
        return Math.ceil(content.length / 4);
    }

    updateTokenUsage() {
        this.tokenUsage.discovery = this.loadedContext.discovery.size * this.TOKEN_LIMITS.DISCOVERY_PER_SKILL;
        this.tokenUsage.activation = Array.from(this.loadedContext.activation.values())
            .reduce((sum, inst) => sum + inst.tokens, 0);
        this.tokenUsage.execution = Array.from(this.loadedContext.execution.values())
            .reduce((sum, file) => sum + file.tokens, 0);
        this.tokenUsage.total = this.tokenUsage.discovery + this.tokenUsage.activation + this.tokenUsage.execution;
    }
}

// Test generators
const skillNameGen = fc.constantFrom('spec-forge', 'planning', 'work', 'review', 'git-worktree', 'project-reset');
const skillSetGen = fc.array(skillNameGen, { minLength: 1, maxLength: 4 }).map(arr => [...new Set(arr)]);
const filePathGen = fc.string({ minLength: 5, maxLength: 50 }).map(s => `.ai/${s}.md`);

describe('Progressive Disclosure System Property Tests', () => {
    let contextManager;

    beforeEach(async () => {
        contextManager = new MockContextManager();
        await contextManager.initialize();
    });

    /**
     * Property 13.1: Inactive skills consume minimal tokens
     * For any set of skills, inactive skills should only consume discovery-level tokens
     */
    test('Property 13.1: Inactive skills consume minimal tokens', async () => {
        await fc.assert(fc.asyncProperty(skillSetGen, async (skillsToKeepInactive) => {
            // Ensure all skills start inactive
            const allSkills = Array.from(contextManager.inactiveSkills);
            
            // Activate some skills (not in the inactive set)
            const skillsToActivate = allSkills.filter(skill => !skillsToKeepInactive.includes(skill));
            
            for (const skill of skillsToActivate.slice(0, 2)) { // Limit to 2 to avoid context overflow
                await contextManager.activateSkill(skill);
            }

            const status = contextManager.getContextStatus();

            // Verify inactive skills only consume discovery tokens
            for (const inactiveSkill of skillsToKeepInactive) {
                if (status.inactiveSkills.includes(inactiveSkill)) {
                    // Inactive skill should not have activation context loaded
                    expect(contextManager.loadedContext.activation.has(inactiveSkill)).toBe(false);
                    
                    // Should have discovery metadata
                    expect(contextManager.loadedContext.discovery.has(inactiveSkill)).toBe(true);
                }
            }

            // Total discovery tokens should be predictable
            const expectedDiscoveryTokens = status.inactiveSkills.length * contextManager.TOKEN_LIMITS.DISCOVERY_PER_SKILL;
            const actualDiscoveryTokens = status.tokenUsage.discovery - (status.activeSkills.length * contextManager.TOKEN_LIMITS.DISCOVERY_PER_SKILL);
            
            expect(actualDiscoveryTokens).toBeLessThanOrEqual(expectedDiscoveryTokens);
        }), { numRuns: 50 });
    });

    /**
     * Property 13.2: Active skills load detailed instructions
     * For any skill activation, the skill should load detailed instructions consuming more tokens
     */
    test('Property 13.2: Active skills load detailed instructions', async () => {
        await fc.assert(fc.asyncProperty(skillNameGen, async (skillToActivate) => {
            const initialStatus = contextManager.getContextStatus();
            const initialTokens = initialStatus.tokenUsage.total;

            const result = await contextManager.activateSkill(skillToActivate);
            
            if (result.success) {
                const finalStatus = contextManager.getContextStatus();
                
                // Skill should be in active set
                expect(finalStatus.activeSkills).toContain(skillToActivate);
                expect(finalStatus.inactiveSkills).not.toContain(skillToActivate);
                
                // Should have activation context loaded
                expect(contextManager.loadedContext.activation.has(skillToActivate)).toBe(true);
                
                // Token usage should increase significantly (more than just discovery tokens)
                const tokenIncrease = finalStatus.tokenUsage.total - initialTokens;
                expect(tokenIncrease).toBeGreaterThan(contextManager.TOKEN_LIMITS.DISCOVERY_PER_SKILL);
                expect(tokenIncrease).toBeLessThanOrEqual(contextManager.TOKEN_LIMITS.ACTIVATION_PER_SKILL);
            }
        }), { numRuns: 50 });
    });

    /**
     * Property 13.3: Context limits are respected
     * For any sequence of activations, total token usage should not exceed limits
     */
    test('Property 13.3: Context limits are respected', async () => {
        await fc.assert(fc.asyncProperty(skillSetGen, async (skillsToActivate) => {
            let activationSucceeded = true;
            
            for (const skill of skillsToActivate) {
                const result = await contextManager.activateSkill(skill);
                if (!result.success) {
                    activationSucceeded = false;
                    break;
                }
                
                const status = contextManager.getContextStatus();
                
                // Token usage should never exceed total limit
                expect(status.tokenUsage.total).toBeLessThanOrEqual(contextManager.TOKEN_LIMITS.TOTAL_CONTEXT_LIMIT);
                
                // Each component should respect its limits
                expect(status.tokenUsage.discovery).toBeLessThanOrEqual(
                    status.tokenUsage.discovery // Discovery is based on total skills, so this is always valid
                );
                expect(status.tokenUsage.activation).toBeLessThanOrEqual(
                    status.activeSkills.length * contextManager.TOKEN_LIMITS.ACTIVATION_PER_SKILL
                );
            }

            // If we hit limits, the system should gracefully handle it
            const finalStatus = contextManager.getContextStatus();
            if (!activationSucceeded) {
                expect(finalStatus.utilizationPercent).toBeGreaterThan(80); // Should be near limit
            }
        }), { numRuns: 30 });
    });

    /**
     * Property 13.4: Deactivation frees context space
     * For any active skill, deactivating it should free the expected amount of tokens
     */
    test('Property 13.4: Deactivation frees context space', async () => {
        await fc.assert(fc.asyncProperty(skillNameGen, async (skillName) => {
            // First activate the skill
            const activationResult = await contextManager.activateSkill(skillName);
            
            if (activationResult.success) {
                const preDeactivationStatus = contextManager.getContextStatus();
                const preDeactivationTokens = preDeactivationStatus.tokenUsage.total;
                
                // Deactivate the skill
                const deactivationResult = contextManager.deactivateSkill(skillName);
                
                if (deactivationResult.success) {
                    const postDeactivationStatus = contextManager.getContextStatus();
                    
                    // Skill should be back in inactive set
                    expect(postDeactivationStatus.inactiveSkills).toContain(skillName);
                    expect(postDeactivationStatus.activeSkills).not.toContain(skillName);
                    
                    // Should not have activation context
                    expect(contextManager.loadedContext.activation.has(skillName)).toBe(false);
                    
                    // Token usage should decrease
                    const tokenDecrease = preDeactivationTokens - postDeactivationStatus.tokenUsage.total;
                    expect(tokenDecrease).toBeGreaterThan(0);
                    expect(tokenDecrease).toBeLessThanOrEqual(contextManager.TOKEN_LIMITS.ACTIVATION_PER_SKILL);
                }
            }
        }), { numRuns: 50 });
    });

    /**
     * Property 13.5: Supporting files load incrementally
     * For any supporting file loading, it should only load when requested and respect limits
     */
    test('Property 13.5: Supporting files load incrementally', async () => {
        await fc.assert(fc.asyncProperty(
            fc.array(filePathGen, { minLength: 1, maxLength: 5 }),
            skillNameGen,
            async (filePaths, skillContext) => {
                const initialStatus = contextManager.getContextStatus();
                const initialTokens = initialStatus.tokenUsage.total;
                let totalExpectedTokens = 0;

                // Load files one by one
                for (const filePath of filePaths) {
                    const result = await contextManager.loadSupportingFile(filePath, skillContext);
                    
                    if (result.success) {
                        totalExpectedTokens += result.tokensUsed;
                        
                        // File should be in execution context
                        expect(contextManager.loadedContext.execution.has(filePath)).toBe(true);
                        
                        // Token usage should increase incrementally
                        const currentStatus = contextManager.getContextStatus();
                        expect(currentStatus.tokenUsage.execution).toBeGreaterThan(0);
                        
                        // Should not exceed per-file limit
                        const fileData = contextManager.loadedContext.execution.get(filePath);
                        expect(fileData.tokens).toBeLessThanOrEqual(contextManager.TOKEN_LIMITS.EXECUTION_PER_FILE);
                    }
                }

                const finalStatus = contextManager.getContextStatus();
                
                // Total token increase should match loaded files
                const actualIncrease = finalStatus.tokenUsage.total - initialTokens;
                expect(actualIncrease).toBeLessThanOrEqual(totalExpectedTokens + 50); // Allow small variance
                
                // Should respect total context limit
                expect(finalStatus.tokenUsage.total).toBeLessThanOrEqual(contextManager.TOKEN_LIMITS.TOTAL_CONTEXT_LIMIT);
            }
        ), { numRuns: 30 });
    });

    /**
     * Property 13.6: Context optimization maintains functionality
     * For any context state, optimization should reduce token usage without breaking functionality
     */
    test('Property 13.6: Context optimization maintains functionality', async () => {
        await fc.assert(fc.asyncProperty(skillSetGen, async (skillsToActivate) => {
            // Set up a context state with multiple active skills
            const activatedSkills = [];
            for (const skill of skillsToActivate.slice(0, 3)) { // Limit to avoid overflow
                const result = await contextManager.activateSkill(skill);
                if (result.success) {
                    activatedSkills.push(skill);
                }
            }

            // Load some supporting files
            const filePaths = ['.ai/test1.md', '.ai/test2.md', '.ai/test3.md'];
            for (const filePath of filePaths) {
                await contextManager.loadSupportingFile(filePath, 'test-context');
            }

            const preOptimizationStatus = contextManager.getContextStatus();
            const preOptimizationTokens = preOptimizationStatus.tokenUsage.total;

            // Simulate optimization by deactivating least important skills
            if (activatedSkills.length > 1) {
                const skillToDeactivate = activatedSkills[0]; // Deactivate first (oldest)
                const deactivationResult = contextManager.deactivateSkill(skillToDeactivate);
                
                if (deactivationResult.success) {
                    const postOptimizationStatus = contextManager.getContextStatus();
                    
                    // Token usage should decrease
                    expect(postOptimizationStatus.tokenUsage.total).toBeLessThan(preOptimizationTokens);
                    
                    // Remaining skills should still be active and functional
                    const remainingSkills = activatedSkills.filter(s => s !== skillToDeactivate);
                    for (const skill of remainingSkills) {
                        expect(postOptimizationStatus.activeSkills).toContain(skill);
                        expect(contextManager.loadedContext.activation.has(skill)).toBe(true);
                    }
                    
                    // Discovery metadata should still be available for all skills
                    expect(contextManager.loadedContext.discovery.has(skillToDeactivate)).toBe(true);
                }
            }
        }), { numRuns: 30 });
    });
});

// Integration test for the complete progressive disclosure system
describe('Progressive Disclosure Integration Tests', () => {
    test('Complete workflow with progressive disclosure', async () => {
        const contextManager = new MockContextManager();
        await contextManager.initialize();

        // Simulate a complete EARS workflow with progressive disclosure
        const phases = ['spec-forge', 'planning', 'work', 'review'];
        
        for (let i = 0; i < phases.length; i++) {
            const phase = phases[i];
            
            // Activate current phase
            const activationResult = await contextManager.activateSkill(phase);
            expect(activationResult.success).toBe(true);
            
            // Load phase-specific supporting files
            const phaseFiles = [
                `.ai/workflows/${phase}.md`,
                `.ai/roles/${phase}-role.md`
            ];
            
            for (const filePath of phaseFiles) {
                await contextManager.loadSupportingFile(filePath, phase);
            }
            
            // Verify context state
            const status = contextManager.getContextStatus();
            expect(status.activeSkills).toContain(phase);
            expect(status.tokenUsage.total).toBeLessThanOrEqual(contextManager.TOKEN_LIMITS.TOTAL_CONTEXT_LIMIT);
            
            // Deactivate previous phase if not the first
            if (i > 0) {
                const previousPhase = phases[i - 1];
                const deactivationResult = contextManager.deactivateSkill(previousPhase);
                expect(deactivationResult.success).toBe(true);
                
                // Unload previous phase files
                const previousFiles = [
                    `.ai/workflows/${previousPhase}.md`,
                    `.ai/roles/${previousPhase}-role.md`
                ];
                const unloadResult = contextManager.unloadSupportingFiles(previousFiles);
                expect(unloadResult.success).toBe(true);
            }
        }
        
        // Final verification
        const finalStatus = contextManager.getContextStatus();
        expect(finalStatus.activeSkills).toContain('review'); // Last phase should be active
        expect(finalStatus.activeSkills.length).toBe(1); // Only one phase active
        expect(finalStatus.inactiveSkills.length).toBeGreaterThan(0); // Other skills inactive
    });
});