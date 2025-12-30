/**
 * Property-based tests for skill activation routing system
 * Feature: ears-workflow-skill-refactor, Property 2: Skill activation routing
 * Validates: Requirements 2.1, 2.2
 */

const fc = require('fast-check');
const SkillActivationRouter = require('../skills/activation-router.js');

describe('Skill Activation Routing', () => {
  let router;

  beforeEach(() => {
    router = new SkillActivationRouter();
  });

  afterEach(() => {
    router.reset();
  });

  /**
   * Property 2: Skill activation routing
   * For any user input containing "EARS-workflow" or "use EARS workflow", 
   * the system should activate the main skill and load appropriate phase-based instructions
   */
  test('should activate main workflow for EARS-workflow triggers', () => {
    fc.assert(fc.property(
      fc.oneof(
        fc.constant('ears-workflow'),
        fc.constant('EARS-workflow'),
        fc.constant('use ears workflow'),
        fc.constant('use EARS workflow'),
        fc.constant('structured development'),
        fc.constant('formal specification'),
        fc.constant('compound engineering'),
        fc.constant('start ears'),
        fc.constant('use structured development')
      ),
      fc.string({ minLength: 0, maxLength: 50 }), // prefix
      fc.string({ minLength: 0, maxLength: 50 }), // suffix
      (trigger, prefix, suffix) => {
        // Arrange
        const userInput = `${prefix} ${trigger} ${suffix}`.trim();
        
        // Act
        const result = router.analyzeInput(userInput);
        
        // Assert
        expect(result.type).toBe('main-workflow');
        expect(result.skill).toBe('ears-workflow');
        expect(result.confidence).toBeGreaterThan(0);
        expect(result.phase).toBe('spec-forge'); // Default initial phase
        expect(result.message).toContain('EARS-Workflow Activated');
        expect(result.message).toContain('SPEC-FORGE');
        expect(result.context.trigger).toBe(trigger.toLowerCase());
        expect(result.context.suggestedPhase).toBe('spec-forge');
      }
    ), { numRuns: 100 });
  });

  test('should detect sub-skill activation with correct routing', () => {
    fc.assert(fc.property(
      fc.oneof(
        // SPEC-FORGE triggers
        fc.record({
          skill: fc.constant('spec-forge'),
          trigger: fc.constantFrom('spec-forge', 'specification', 'requirements', 'ears', 'user story')
        }),
        // PLANNING triggers
        fc.record({
          skill: fc.constant('planning'),
          trigger: fc.constantFrom('planning', 'plan', 'research', 'architecture', 'design decisions')
        }),
        // WORK triggers
        fc.record({
          skill: fc.constant('work'),
          trigger: fc.constantFrom('implement', 'fix', 'code', 'tdd', 'git worktree')
        }),
        // REVIEW triggers
        fc.record({
          skill: fc.constant('review'),
          trigger: fc.constantFrom('review', 'audit', 'code review', 'security audit')
        }),
        // GIT-WORKTREE triggers
        fc.record({
          skill: fc.constant('git-worktree'),
          trigger: fc.constantFrom('git worktree', 'worktree', 'branch management')
        }),
        // PROJECT-RESET triggers
        fc.record({
          skill: fc.constant('project-reset'),
          trigger: fc.constantFrom('project reset', 'clean project', 'template restoration')
        })
      ),
      fc.string({ minLength: 0, maxLength: 30 }), // prefix
      fc.string({ minLength: 0, maxLength: 30 }), // suffix
      ({ skill, trigger }, prefix, suffix) => {
        // Arrange
        const userInput = `${prefix} ${trigger} ${suffix}`.trim();
        
        // Act
        const result = router.analyzeInput(userInput);
        
        // Assert
        expect(result.type).toBe('sub-skill');
        expect(result.skill).toBe(skill);
        expect(result.confidence).toBeGreaterThan(0);
        expect(result.phase).toBe(skill);
        expect(result.message).toContain(`${skill.toUpperCase()}`);
        expect(result.context.trigger).toBe(trigger);
      }
    ), { numRuns: 100 });
  });

  test('should calculate confidence scores correctly', () => {
    fc.assert(fc.property(
      fc.constantFrom('ears-workflow', 'use ears workflow', 'structured development'),
      fc.string({ minLength: 0, maxLength: 20 }),
      (trigger, extraText) => {
        // Test exact match vs. match with extra text
        const exactInput = trigger;
        const extendedInput = `${extraText} ${trigger} ${extraText}`.trim();
        
        const exactResult = router.analyzeInput(exactInput);
        const extendedResult = router.analyzeInput(extendedInput);
        
        // Exact matches should have higher confidence
        if (exactResult.type === 'main-workflow' && extendedResult.type === 'main-workflow') {
          expect(exactResult.confidence).toBeGreaterThanOrEqual(extendedResult.confidence);
        }
        
        // Both should be valid activations
        expect(exactResult.confidence).toBeGreaterThan(0);
        if (extendedResult.type !== 'none') {
          expect(extendedResult.confidence).toBeGreaterThan(0);
        }
      }
    ), { numRuns: 100 });
  });

  test('should not activate for unrelated inputs', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 1, maxLength: 100 })
        .filter(s => {
          const lower = s.toLowerCase();
          // Filter out strings that contain any activation triggers
          const allTriggers = [
            ...router.mainWorkflowTriggers,
            ...Object.values(router.subSkillTriggers).flat()
          ];
          return !allTriggers.some(trigger => lower.includes(trigger));
        }),
      (userInput) => {
        // Act
        const result = router.analyzeInput(userInput);
        
        // Assert
        expect(result.type).toBe('none');
        expect(result.skill).toBe(null);
        expect(result.confidence).toBe(0);
        expect(result.message).toBe(null);
        expect(result.context.analyzed).toBe(true);
        expect(result.context.triggers).toBeDefined();
      }
    ), { numRuns: 100 });
  });

  test('should provide appropriate activation messages', () => {
    fc.assert(fc.property(
      fc.constantFrom('ears-workflow', 'spec-forge', 'planning', 'work', 'review'),
      (trigger) => {
        // Act
        const result = router.analyzeInput(trigger);
        
        // Assert
        expect(result.message).toBeDefined();
        expect(result.message).not.toBe('');
        
        if (result.type === 'main-workflow') {
          expect(result.message).toContain('EARS-Workflow Activated');
          expect(result.message).toContain('SPEC-FORGE → PLAN → WORK → REVIEW');
        } else if (result.type === 'sub-skill') {
          expect(result.message).toContain(`${trigger.toUpperCase()}`);
          expect(result.message).toContain('Sub-Skill Activated');
        }
      }
    ), { numRuns: 100 });
  });

  test('should handle case-insensitive activation', () => {
    fc.assert(fc.property(
      fc.constantFrom('EARS-WORKFLOW', 'ears-workflow', 'Ears-Workflow', 'USE EARS WORKFLOW'),
      (trigger) => {
        // Act
        const result = router.analyzeInput(trigger);
        
        // Assert
        expect(result.type).toBe('main-workflow');
        expect(result.skill).toBe('ears-workflow');
        expect(result.confidence).toBeGreaterThan(0);
      }
    ), { numRuns: 100 });
  });

  test('should determine appropriate initial phase from context', () => {
    const testCases = [
      { input: 'use ears workflow for requirements', expectedPhase: 'spec-forge' },
      { input: 'ears-workflow planning phase', expectedPhase: 'planning' },
      { input: 'structured development implementation', expectedPhase: 'work' },
      { input: 'ears workflow code review', expectedPhase: 'review' },
      { input: 'use ears workflow', expectedPhase: 'spec-forge' } // default
    ];

    testCases.forEach(({ input, expectedPhase }) => {
      const result = router.analyzeInput(input);
      expect(result.type).toBe('main-workflow');
      expect(result.phase).toBe(expectedPhase);
      expect(result.context.suggestedPhase).toBe(expectedPhase);
    });
  });

  test('should provide context information for all activation types', () => {
    fc.assert(fc.property(
      fc.oneof(
        fc.constant('ears-workflow'),
        fc.constant('spec-forge'),
        fc.constant('planning'),
        fc.constant('random unrelated text')
      ),
      (input) => {
        // Act
        const result = router.analyzeInput(input);
        
        // Assert
        expect(result.context).toBeDefined();
        expect(typeof result.context).toBe('object');
        
        if (result.type === 'main-workflow') {
          expect(result.context.trigger).toBeDefined();
          expect(result.context.suggestedPhase).toBeDefined();
        } else if (result.type === 'sub-skill') {
          expect(result.context.trigger).toBeDefined();
          expect(result.context.phaseValidation).toBeDefined();
        } else if (result.type === 'none') {
          expect(result.context.analyzed).toBe(true);
          expect(result.context.triggers).toBeDefined();
        }
      }
    ), { numRuns: 100 });
  });

  test('should maintain consistent skill names across activations', () => {
    const expectedSkillNames = [
      'ears-workflow', 'spec-forge', 'planning', 'work', 
      'review', 'git-worktree', 'project-reset'
    ];

    fc.assert(fc.property(
      fc.string({ minLength: 1, maxLength: 50 }),
      (input) => {
        const result = router.analyzeInput(input);
        
        if (result.skill !== null) {
          expect(expectedSkillNames).toContain(result.skill);
        }
      }
    ), { numRuns: 100 });
  });

  test('should handle whitespace and formatting variations', () => {
    fc.assert(fc.property(
      fc.constantFrom('ears-workflow', 'spec-forge', 'planning'),
      fc.integer({ min: 0, max: 5 }), // leading spaces
      fc.integer({ min: 0, max: 5 }), // trailing spaces
      fc.constantFrom('\t', ' ', ''), // separator
      (trigger, leadingSpaces, trailingSpaces, separator) => {
        // Arrange
        const input = ' '.repeat(leadingSpaces) + trigger + separator + ' '.repeat(trailingSpaces);
        
        // Act
        const result = router.analyzeInput(input);
        
        // Assert - should still activate despite formatting
        expect(result.type).not.toBe('none');
        expect(result.confidence).toBeGreaterThan(0);
      }
    ), { numRuns: 100 });
  });
});

describe('Skill Activation Router State Management', () => {
  let router;

  beforeEach(() => {
    router = new SkillActivationRouter();
  });

  test('should track phase state correctly', () => {
    // Test phase state updates
    router.updatePhaseState('spec-forge', false);
    expect(router.currentPhase).toBe('spec-forge');
    expect(router.completedPhases).toEqual([]);
    expect(router.activeSubSkills).toContain('spec-forge');

    router.updatePhaseState('spec-forge', true);
    expect(router.completedPhases).toContain('spec-forge');

    router.updatePhaseState('planning', false);
    expect(router.currentPhase).toBe('planning');
    expect(router.activeSubSkills).toContain('planning');
  });

  test('should reset state correctly', () => {
    // Setup some state
    router.updatePhaseState('spec-forge', true);
    router.updatePhaseState('planning', false);
    
    // Reset
    router.reset();
    
    // Verify reset
    expect(router.currentPhase).toBe(null);
    expect(router.completedPhases).toEqual([]);
    expect(router.activeSubSkills).toEqual([]);
  });

  test('should provide all triggers for debugging', () => {
    const triggers = router.getAllTriggers();
    
    expect(triggers).toHaveProperty('mainWorkflow');
    expect(triggers).toHaveProperty('subSkills');
    expect(Array.isArray(triggers.mainWorkflow)).toBe(true);
    expect(typeof triggers.subSkills).toBe('object');
    
    // Verify main workflow triggers
    expect(triggers.mainWorkflow).toContain('ears-workflow');
    expect(triggers.mainWorkflow).toContain('use ears workflow');
    
    // Verify sub-skill triggers
    expect(triggers.subSkills).toHaveProperty('spec-forge');
    expect(triggers.subSkills).toHaveProperty('planning');
    expect(triggers.subSkills).toHaveProperty('work');
    expect(triggers.subSkills).toHaveProperty('review');
  });
});