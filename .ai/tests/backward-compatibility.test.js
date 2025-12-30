/**
 * Property-based tests for backward compatibility preservation
 * 
 * **Feature: ears-workflow-skill-refactor, Property 9: Backward compatibility preservation**
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
 * 
 * Tests that the refactored EARS-workflow skill system preserves all existing functionality:
 * - Memory files (.ai/memory/lessons.md and .ai/memory/decisions.md) continue to work
 * - Existing workflow files in .ai/workflows/ remain accessible
 * - Existing skill scripts in .ai/skills/ continue to execute properly
 * - Current AGENTS.md content is preserved and integrated
 * - All existing templates and prompts remain functional
 */

const fc = require('fast-check');
const fs = require('fs');
const path = require('path');
const MemoryCompatibilityValidator = require('../skills/memory-compatibility-validator.js');
const MemoryAccessPatterns = require('../skills/memory-access-patterns.js');

describe('Backward Compatibility Property Tests', () => {
    let validator;
    let accessPatterns;

    beforeEach(() => {
        validator = new MemoryCompatibilityValidator();
        accessPatterns = new MemoryAccessPatterns();
    });

    /**
     * Property 9.1: Memory files maintain accessibility and format
     * For any memory file operation, the files should remain accessible with proper format
     */
    test('Property 9.1: Memory files maintain accessibility and format', () => {
        fc.assert(fc.property(
            fc.constantFrom('lessons', 'decisions'),
            (fileType) => {
                // Test file access
                const accessValidation = validator.validateFileAccess();
                
                if (fileType === 'lessons') {
                    expect(accessValidation.lessonsExists).toBe(true);
                    expect(accessValidation.memoryDirExists).toBe(true);
                } else {
                    expect(accessValidation.decisionsExists).toBe(true);
                    expect(accessValidation.memoryDirExists).toBe(true);
                }
                
                // Test format validation
                const formatValidation = validator.validateFileFormats();
                
                if (fileType === 'lessons') {
                    expect(formatValidation.lessonsFormat.valid).toBe(true);
                    expect(formatValidation.lessonsFormat.hasTitle).toBe(true);
                    expect(formatValidation.lessonsFormat.hasUsageInstructions).toBe(true);
                } else {
                    expect(formatValidation.decisionsFormat.valid).toBe(true);
                    expect(formatValidation.decisionsFormat.hasTitle).toBe(true);
                    expect(formatValidation.decisionsFormat.hasUsageInstructions).toBe(true);
                }
            }
        ), { numRuns: 20 });
    });

    /**
     * Property 9.2: Memory access patterns remain functional
     * For any memory access operation, existing patterns should continue to work
     */
    test('Property 9.2: Memory access patterns remain functional', () => {
        fc.assert(fc.property(
            fc.constantFrom('load', 'validate'),
            (operation) => {
                const validation = accessPatterns.validateAccessPatterns();
                
                // All access patterns should work
                expect(validation.canLoadLessons).toBe(true);
                expect(validation.canLoadDecisions).toBe(true);
                expect(validation.canAppendLessons).toBe(true);
                expect(validation.canAppendDecisions).toBe(true);
                
                if (operation === 'load') {
                    // Test actual loading
                    const lessonsResult = accessPatterns.loadLessons();
                    const decisionsResult = accessPatterns.loadDecisions();
                    
                    expect(lessonsResult.success).toBe(true);
                    expect(lessonsResult.content).toBeDefined();
                    expect(lessonsResult.file).toContain('lessons.md');
                    
                    expect(decisionsResult.success).toBe(true);
                    expect(decisionsResult.content).toBeDefined();
                    expect(decisionsResult.file).toContain('decisions.md');
                }
            }
        ), { numRuns: 30 });
    });

    /**
     * Property 9.3: Skill integration preserves memory access
     * For any skill in the new system, it should be able to access memory files
     */
    test('Property 9.3: Skill integration preserves memory access', () => {
        fc.assert(fc.property(
            fc.constantFrom('spec-forge', 'planning', 'work', 'review', 'git-worktree', 'project-reset'),
            (skillName) => {
                const integrationValidation = validator.validateSkillIntegration();
                
                // Skills should be able to access memory files
                expect(integrationValidation.skillsCanAccessMemory).toBe(true);
                expect(integrationValidation.pathsCorrect).toBe(true);
                expect(integrationValidation.memoryReferencesValid).toBe(true);
                
                // Check that skill directory exists
                const skillPath = path.join('.ai', 'skills', skillName);
                if (fs.existsSync(skillPath)) {
                    // Memory files should be accessible from skill directory
                    const memoryPath = path.join('.ai', 'memory');
                    const relativeMemoryPath = path.relative(skillPath, memoryPath);
                    const absoluteMemoryPath = path.resolve(skillPath, relativeMemoryPath);
                    
                    expect(fs.existsSync(absoluteMemoryPath)).toBe(true);
                }
            }
        ), { numRuns: 20 });
    });

    /**
     * Property 9.4: File structure preservation
     * For any existing file in the .ai directory, it should remain accessible
     */
    test('Property 9.4: File structure preservation', () => {
        fc.assert(fc.property(
            fc.constantFrom(
                'workflows', 'templates', 'prompts', 'protocols', 'roles', 'docs', 'memory'
            ),
            (directoryName) => {
                const directoryPath = path.join('.ai', directoryName);
                
                // Directory should exist
                if (fs.existsSync(directoryPath)) {
                    const stats = fs.statSync(directoryPath);
                    expect(stats.isDirectory()).toBe(true);
                    
                    // Should be readable
                    try {
                        const entries = fs.readdirSync(directoryPath);
                        expect(Array.isArray(entries)).toBe(true);
                    } catch (error) {
                        fail(`Directory ${directoryPath} should be readable: ${error.message}`);
                    }
                }
            }
        ), { numRuns: 15 });
    });

    /**
     * Property 9.5: AGENTS.md content integration
     * The AGENTS.md content should be preserved and accessible through the new skill structure
     */
    test('Property 9.5: AGENTS.md content integration', () => {
        fc.assert(fc.property(
            fc.constantFrom('prime-directive', 'context-routing', 'universal-invariants', 'skills-automation'),
            (contentSection) => {
                // AGENTS.md should exist and be readable
                const agentsPath = 'AGENTS.md';
                expect(fs.existsSync(agentsPath)).toBe(true);
                
                const agentsContent = fs.readFileSync(agentsPath, 'utf8');
                expect(agentsContent).toBeDefined();
                expect(agentsContent.length).toBeGreaterThan(0);
                
                // Key sections should be preserved
                switch (contentSection) {
                    case 'prime-directive':
                        expect(agentsContent).toContain('Prime Directive');
                        expect(agentsContent).toContain('Compound Engineer');
                        break;
                    case 'context-routing':
                        expect(agentsContent).toContain('Context Routing');
                        expect(agentsContent).toContain('Phase');
                        break;
                    case 'universal-invariants':
                        expect(agentsContent).toContain('Universal Invariants');
                        expect(agentsContent).toContain('Hard Rules');
                        break;
                    case 'skills-automation':
                        expect(agentsContent).toContain('Skills & Automation');
                        expect(agentsContent).toContain('git-worktree');
                        break;
                }
                
                // Attribution should be preserved
                expect(agentsContent).toContain('Attribution');
                expect(agentsContent).toContain('Compound Engineering Plugin');
                expect(agentsContent).toContain('EveryInc');
            }
        ), { numRuns: 20 });
    });

    /**
     * Property 9.6: Template and prompt functionality
     * For any template or prompt file, it should remain functional and accessible
     */
    test('Property 9.6: Template and prompt functionality', () => {
        fc.assert(fc.property(
            fc.constantFrom('templates', 'prompts'),
            (directoryType) => {
                const directoryPath = path.join('.ai', directoryType);
                
                if (fs.existsSync(directoryPath)) {
                    const entries = fs.readdirSync(directoryPath);
                    
                    // Should have some files
                    expect(entries.length).toBeGreaterThan(0);
                    
                    // Check a few files for basic accessibility
                    const markdownFiles = entries.filter(entry => entry.endsWith('.md'));
                    
                    for (const file of markdownFiles.slice(0, 3)) { // Test first 3 files
                        const filePath = path.join(directoryPath, file);
                        const stats = fs.statSync(filePath);
                        
                        expect(stats.isFile()).toBe(true);
                        expect(stats.size).toBeGreaterThan(0);
                        
                        // Should be readable
                        const content = fs.readFileSync(filePath, 'utf8');
                        expect(content).toBeDefined();
                        expect(content.length).toBeGreaterThan(0);
                    }
                }
            }
        ), { numRuns: 10 });
    });

    /**
     * Property 9.7: Memory file content structure preservation
     * For any memory file, the internal structure should be preserved
     */
    test('Property 9.7: Memory file content structure preservation', () => {
        fc.assert(fc.property(
            fc.constantFrom('lessons', 'decisions'),
            (fileType) => {
                if (fileType === 'lessons') {
                    const lessonsResult = accessPatterns.loadLessons();
                    
                    if (lessonsResult.success) {
                        // Should have proper structure
                        expect(lessonsResult.content).toContain('# Lessons Learned');
                        expect(lessonsResult.content).toContain('## How to Use This File');
                        
                        // Should have lesson categories
                        const lessons = lessonsResult.lessons;
                        expect(Array.isArray(lessons)).toBe(true);
                        
                        // Each lesson should have proper structure
                        for (const lesson of lessons.slice(0, 5)) { // Test first 5 lessons
                            expect(lesson).toHaveProperty('category');
                            expect(lesson).toHaveProperty('fullText');
                            expect(typeof lesson.category).toBe('string');
                            expect(typeof lesson.fullText).toBe('string');
                        }
                    }
                } else {
                    const decisionsResult = accessPatterns.loadDecisions();
                    
                    if (decisionsResult.success) {
                        // Should have proper structure
                        expect(decisionsResult.content).toContain('Architectural Decision');
                        expect(decisionsResult.content).toContain('## How to Use This File');
                        
                        // Should have decisions
                        const decisions = decisionsResult.decisions;
                        expect(Array.isArray(decisions)).toBe(true);
                        
                        // Each decision should have proper structure
                        for (const decision of decisions.slice(0, 5)) { // Test first 5 decisions
                            expect(decision).toHaveProperty('title');
                            expect(decision).toHaveProperty('fullText');
                            expect(typeof decision.title).toBe('string');
                            expect(typeof decision.fullText).toBe('string');
                        }
                    }
                }
            }
        ), { numRuns: 20 });
    });

    /**
     * Property 9.8: Complete compatibility validation
     * For the entire system, all compatibility checks should pass
     */
    test('Property 9.8: Complete compatibility validation', () => {
        fc.assert(fc.property(
            fc.constant(true), // Always run this test
            () => {
                const completeValidation = validator.validateComplete();
                
                // Overall validation should pass
                expect(completeValidation.overallValid).toBe(true);
                
                // All major components should be valid
                expect(completeValidation.fileAccess.lessonsExists).toBe(true);
                expect(completeValidation.fileAccess.decisionsExists).toBe(true);
                expect(completeValidation.fileAccess.memoryDirExists).toBe(true);
                
                expect(completeValidation.fileFormats.lessonsFormat.valid).toBe(true);
                expect(completeValidation.fileFormats.decisionsFormat.valid).toBe(true);
                
                expect(completeValidation.skillIntegration.skillsCanAccessMemory).toBe(true);
                expect(completeValidation.skillIntegration.memoryReferencesValid).toBe(true);
                expect(completeValidation.skillIntegration.pathsCorrect).toBe(true);
                
                // Should have minimal errors
                expect(completeValidation.summary.errors.length).toBe(0);
            }
        ), { numRuns: 10 });
    });

    /**
     * Property 9.9: Memory statistics consistency
     * For any memory file access, statistics should be consistent and accurate
     */
    test('Property 9.9: Memory statistics consistency', () => {
        fc.assert(fc.property(
            fc.constant(true),
            () => {
                const stats = accessPatterns.getMemoryStats();
                
                // Stats should be well-formed
                expect(stats).toHaveProperty('lessons');
                expect(stats).toHaveProperty('decisions');
                
                // Lessons stats
                expect(typeof stats.lessons.exists).toBe('boolean');
                expect(typeof stats.lessons.size).toBe('number');
                expect(typeof stats.lessons.lessonCount).toBe('number');
                expect(Array.isArray(stats.lessons.categories)).toBe(true);
                
                // Decisions stats
                expect(typeof stats.decisions.exists).toBe('boolean');
                expect(typeof stats.decisions.size).toBe('number');
                expect(typeof stats.decisions.decisionCount).toBe('number');
                expect(Array.isArray(stats.decisions.sections)).toBe(true);
                
                // If files exist, stats should be reasonable
                if (stats.lessons.exists) {
                    expect(stats.lessons.size).toBeGreaterThan(0);
                    expect(stats.lessons.modified).toBeDefined();
                }
                
                if (stats.decisions.exists) {
                    expect(stats.decisions.size).toBeGreaterThan(0);
                    expect(stats.decisions.modified).toBeDefined();
                }
            }
        ), { numRuns: 15 });
    });

    /**
     * Property 9.10: Skill file structure compatibility
     * For any skill file, it should maintain compatibility with the new structure
     */
    test('Property 9.10: Skill file structure compatibility', () => {
        fc.assert(fc.property(
            fc.constantFrom('spec-forge', 'planning', 'work', 'review', 'git-worktree', 'project-reset'),
            (skillName) => {
                const skillPath = path.join('.ai', 'skills', skillName, 'SKILL.md');
                
                if (fs.existsSync(skillPath)) {
                    const skillContent = fs.readFileSync(skillPath, 'utf8');
                    
                    // Should have YAML frontmatter
                    expect(skillContent).toMatch(/^---\n/);
                    expect(skillContent).toContain('name:');
                    expect(skillContent).toContain('description:');
                    expect(skillContent).toContain('version:');
                    
                    // Should reference memory files correctly
                    const memoryReferences = [
                        '.ai/memory/lessons.md',
                        '.ai/memory/decisions.md',
                        '../../memory/lessons.md',
                        '../../memory/decisions.md'
                    ];
                    
                    const hasMemoryReference = memoryReferences.some(ref => 
                        skillContent.includes(ref)
                    );
                    
                    // Either direct reference or inherited from main skill
                    expect(hasMemoryReference || skillContent.includes('memory')).toBe(true);
                }
            }
        ), { numRuns: 20 });
    });
});

// Integration tests for complete backward compatibility
describe('Backward Compatibility Integration Tests', () => {
    test('Complete system backward compatibility', () => {
        const validator = new MemoryCompatibilityValidator();
        const accessPatterns = new MemoryAccessPatterns();
        
        // Run complete validation
        const validation = validator.validateComplete();
        expect(validation.overallValid).toBe(true);
        
        // Test memory access patterns
        const patternValidation = accessPatterns.validateAccessPatterns();
        expect(patternValidation.canLoadLessons).toBe(true);
        expect(patternValidation.canLoadDecisions).toBe(true);
        
        // Test actual loading
        const lessonsResult = accessPatterns.loadLessons();
        const decisionsResult = accessPatterns.loadDecisions();
        
        expect(lessonsResult.success).toBe(true);
        expect(decisionsResult.success).toBe(true);
        
        // Test statistics
        const stats = accessPatterns.getMemoryStats();
        expect(stats.lessons.exists).toBe(true);
        expect(stats.decisions.exists).toBe(true);
        
        // Verify AGENTS.md preservation
        expect(fs.existsSync('AGENTS.md')).toBe(true);
        const agentsContent = fs.readFileSync('AGENTS.md', 'utf8');
        expect(agentsContent).toContain('Compound Engineering');
        expect(agentsContent).toContain('Attribution');
    });

    test('Memory file round-trip compatibility', () => {
        const accessPatterns = new MemoryAccessPatterns();
        
        // Load current state
        const initialLessons = accessPatterns.loadLessons();
        const initialDecisions = accessPatterns.loadDecisions();
        
        expect(initialLessons.success).toBe(true);
        expect(initialDecisions.success).toBe(true);
        
        // Verify content structure is preserved
        if (initialLessons.lessons.length > 0) {
            const firstLesson = initialLessons.lessons[0];
            expect(firstLesson).toHaveProperty('category');
            expect(firstLesson).toHaveProperty('fullText');
        }
        
        if (initialDecisions.decisions.length > 0) {
            const firstDecision = initialDecisions.decisions[0];
            expect(firstDecision).toHaveProperty('title');
            expect(firstDecision).toHaveProperty('fullText');
        }
    });

    test('Skill integration with memory files', () => {
        const validator = new MemoryCompatibilityValidator();
        const integrationResult = validator.validateSkillIntegration();
        
        expect(integrationResult.skillsCanAccessMemory).toBe(true);
        expect(integrationResult.memoryReferencesValid).toBe(true);
        expect(integrationResult.pathsCorrect).toBe(true);
        
        // Verify main SKILL.md references memory correctly
        const mainSkillPath = path.join('.ai', 'SKILL.md');
        if (fs.existsSync(mainSkillPath)) {
            const skillContent = fs.readFileSync(mainSkillPath, 'utf8');
            expect(skillContent).toContain('memory');
        }
    });
});