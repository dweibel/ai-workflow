/**
 * Property-based tests for skill dormancy preservation
 * Feature: ears-workflow-skill-refactor, Property 3: Skill dormancy preservation
 * Validates: Requirements 2.3
 */

const fc = require('fast-check');
const SkillActivationRouter = require('../skills/activation-router.js');

describe('Skill Dormancy Preservation', () => {
  let router;

  beforeEach(() => {
    router = new SkillActivationRouter();
  });

  afterEach(() => {
    router.reset();
  });

  /**
   * Property 3: Skill dormancy preservation
   * For any user input that does not explicitly invoke EARS-workflow or sub-skills, 
   * the system should remain inactive and not load instructions into context
   */
  test('should remain dormant for general programming discussions', () => {
    fc.assert(fc.property(
      fc.oneof(
        // General programming terms that should NOT activate skills
        fc.constantFrom(
          'javascript function',
          'python class',
          'database query',
          'api endpoint',
          'unit test',
          'bug fix',
          'performance optimization',
          'refactor method',
          'add feature',
          'update documentation',
          'deploy application',
          'configure server',
          'install package',
          'run tests',
          'commit changes',
          'merge branch',
          'create component',
          'handle error',
          'validate input',
          'process data'
        ),
        // Random programming-related sentences
        fc.tuple(
          fc.constantFrom('create', 'update', 'delete', 'modify', 'add', 'remove', 'fix', 'optimize'),
          fc.constantFrom('function', 'class', 'method', 'variable', 'component', 'module', 'service'),
          fc.constantFrom('for', 'in', 'with', 'using', 'by'),
          fc.constantFrom('javascript', 'python', 'react', 'node', 'express', 'database', 'api')
        ).map(([action, target, prep, tech]) => `${action} ${target} ${prep} ${tech}`)
      ),
      (userInput) => {
        // Act
        const result = router.analyzeInput(userInput);
        
        // Assert - should remain dormant
        expect(result.type).toBe('none');
        expect(result.skill).toBe(null);
        expect(result.confidence).toBe(0);
        expect(result.message).toBe(null);
        expect(result.context.analyzed).toBe(true);
        
        // Verify no skills are activated
        expect(router.currentPhase).toBe(null);
        expect(router.activeSubSkills).toEqual([]);
      }
    ), { numRuns: 100 });
  });

  test('should remain dormant for IDE and tool-related commands', () => {
    fc.assert(fc.property(
      fc.constantFrom(
        'open file',
        'save document',
        'close tab',
        'run debugger',
        'set breakpoint',
        'view console',
        'toggle sidebar',
        'search files',
        'find and replace',
        'format code',
        'show terminal',
        'install extension',
        'update settings',
        'create folder',
        'rename file',
        'copy path',
        'show git log',
        'stage changes',
        'push to remote',
        'pull latest',
        'switch branch',
        'create tag',
        'view diff',
        'resolve conflict'
      ),
      (userInput) => {
        // Act
        const result = router.analyzeInput(userInput);
        
        // Assert - should remain dormant
        expect(result.type).toBe('none');
        expect(result.skill).toBe(null);
        expect(result.confidence).toBe(0);
        expect(result.message).toBe(null);
        
        // Verify state remains clean
        expect(router.currentPhase).toBe(null);
        expect(router.completedPhases).toEqual([]);
        expect(router.activeSubSkills).toEqual([]);
      }
    ), { numRuns: 100 });
  });

  test('should remain dormant for partial trigger matches', () => {
    fc.assert(fc.property(
      fc.oneof(
        // Partial matches that should NOT activate
        fc.constantFrom(
          'ear infection',
          'workflow diagram',
          'spec sheet',
          'plan meeting',
          'work schedule',
          'review document',
          'reset password',
          'forge ahead',
          'planning committee',
          'work environment',
          'review process',
          'project manager',
          'git status',
          'tree structure'
        ),
        // Words that contain trigger substrings but are different
        fc.constantFrom(
          'specification document', // contains 'spec' but not 'spec-forge'
          'workplace', // contains 'work' but not in trigger context
          'reviewer', // contains 'review' but not as trigger
          'planner', // contains 'plan' but not as trigger
          'earshot', // contains 'ear' but not 'ears'
          'workflow management' // contains 'workflow' but not 'ears-workflow'
        )
      ),
      (userInput) => {
        // Act
        const result = router.analyzeInput(userInput);
        
        // Assert - should remain dormant for partial matches
        expect(result.type).toBe('none');
        expect(result.skill).toBe(null);
        expect(result.confidence).toBe(0);
        expect(result.message).toBe(null);
      }
    ), { numRuns: 100 });
  });

  test('should remain dormant for random text without triggers', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 1, maxLength: 100 })
        .filter(s => {
          const lower = s.toLowerCase();
          // Ensure the string doesn't contain any activation triggers
          const allTriggers = [
            ...router.mainWorkflowTriggers,
            ...Object.values(router.subSkillTriggers).flat()
          ];
          return !allTriggers.some(trigger => lower.includes(trigger.toLowerCase()));
        }),
      (randomText) => {
        // Act
        const result = router.analyzeInput(randomText);
        
        // Assert - should remain completely dormant
        expect(result.type).toBe('none');
        expect(result.skill).toBe(null);
        expect(result.confidence).toBe(0);
        expect(result.message).toBe(null);
        expect(result.context.analyzed).toBe(true);
        expect(result.context.triggers).toBeDefined();
        
        // Verify no state changes
        expect(router.currentPhase).toBe(null);
        expect(router.completedPhases).toEqual([]);
        expect(router.activeSubSkills).toEqual([]);
      }
    ), { numRuns: 100 });
  });

  test('should provide trigger information when dormant for debugging', () => {
    fc.assert(fc.property(
      fc.constantFrom(
        'hello world',
        'how are you',
        'what is the weather',
        'random question',
        'unrelated topic'
      ),
      (userInput) => {
        // Act
        const result = router.analyzeInput(userInput);
        
        // Assert - dormant but provides debugging info
        expect(result.type).toBe('none');
        expect(result.context.analyzed).toBe(true);
        expect(result.context.triggers).toBeDefined();
        expect(result.context.triggers.mainWorkflow).toBeDefined();
        expect(result.context.triggers.subSkills).toBeDefined();
        
        // Verify trigger information is complete
        expect(Array.isArray(result.context.triggers.mainWorkflow)).toBe(true);
        expect(typeof result.context.triggers.subSkills).toBe('object');
        expect(result.context.triggers.mainWorkflow.length).toBeGreaterThan(0);
        expect(Object.keys(result.context.triggers.subSkills).length).toBeGreaterThan(0);
      }
    ), { numRuns: 100 });
  });

  test('should not consume context tokens when dormant', () => {
    // This test simulates the progressive disclosure requirement
    // In a real implementation, this would check actual token usage
    
    fc.assert(fc.property(
      fc.string({ minLength: 1, maxLength: 50 })
        .filter(s => !s.toLowerCase().includes('ears') && 
                     !s.toLowerCase().includes('spec') &&
                     !s.toLowerCase().includes('plan') &&
                     !s.toLowerCase().includes('work') &&
                     !s.toLowerCase().includes('review')),
      (userInput) => {
        // Act
        const result = router.analyzeInput(userInput);
        
        // Assert - dormant state should not load any instructions
        expect(result.type).toBe('none');
        expect(result.message).toBe(null); // No activation message = no context loading
        
        // Verify minimal context footprint
        expect(result.context.analyzed).toBe(true);
        expect(Object.keys(result.context).length).toBeLessThanOrEqual(2); // Only 'analyzed' and 'triggers'
      }
    ), { numRuns: 100 });
  });

  test('should handle mixed content with non-trigger keywords', () => {
    fc.assert(fc.property(
      fc.tuple(
        fc.constantFrom('javascript', 'python', 'react', 'node', 'database', 'api'),
        fc.constantFrom('function', 'class', 'method', 'component', 'service', 'module'),
        fc.constantFrom('create', 'update', 'delete', 'modify', 'optimize', 'debug')
      ),
      ([tech, entity, action]) => {
        const userInput = `${action} a new ${entity} in ${tech}`;
        
        // Act
        const result = router.analyzeInput(userInput);
        
        // Assert - should remain dormant even with programming terms
        expect(result.type).toBe('none');
        expect(result.skill).toBe(null);
        expect(result.confidence).toBe(0);
      }
    ), { numRuns: 100 });
  });

  test('should distinguish between similar but non-trigger phrases', () => {
    const nonTriggerPhrases = [
      'workflow management system',
      'specification document review',
      'planning meeting agenda',
      'work from home policy',
      'code review checklist',
      'project reset timeline',
      'git workflow tutorial',
      'ears of corn',
      'forge metal',
      'plan vacation',
      'work schedule',
      'review notes'
    ];

    nonTriggerPhrases.forEach(phrase => {
      const result = router.analyzeInput(phrase);
      
      expect(result.type).toBe('none');
      expect(result.skill).toBe(null);
      expect(result.confidence).toBe(0);
      expect(result.message).toBe(null);
    });
  });

  test('should maintain dormancy across multiple non-trigger inputs', () => {
    const nonTriggerInputs = [
      'hello there',
      'how to write javascript',
      'database connection error',
      'api response format',
      'unit testing best practices'
    ];

    nonTriggerInputs.forEach(input => {
      const result = router.analyzeInput(input);
      
      // Each input should result in dormancy
      expect(result.type).toBe('none');
      expect(result.skill).toBe(null);
      
      // State should remain clean after each input
      expect(router.currentPhase).toBe(null);
      expect(router.activeSubSkills).toEqual([]);
    });
  });

  test('should handle empty and whitespace-only inputs gracefully', () => {
    fc.assert(fc.property(
      fc.oneof(
        fc.constant(''),
        fc.constant('   '),
        fc.constant('\t'),
        fc.constant('\n'),
        fc.constant('  \t  \n  ')
      ),
      (emptyInput) => {
        // Act
        const result = router.analyzeInput(emptyInput);
        
        // Assert - should remain dormant for empty inputs
        expect(result.type).toBe('none');
        expect(result.skill).toBe(null);
        expect(result.confidence).toBe(0);
        expect(result.message).toBe(null);
      }
    ), { numRuns: 100 });
  });
});

describe('Dormancy State Verification', () => {
  let router;

  beforeEach(() => {
    router = new SkillActivationRouter();
  });

  test('should maintain clean state when dormant', () => {
    // Test multiple non-trigger inputs
    const inputs = [
      'create a function',
      'debug the application', 
      'optimize performance',
      'handle user input',
      'process the data'
    ];

    inputs.forEach(input => {
      router.analyzeInput(input);
      
      // Verify state remains clean
      expect(router.currentPhase).toBe(null);
      expect(router.completedPhases).toEqual([]);
      expect(router.activeSubSkills).toEqual([]);
    });
  });

  test('should not interfere with subsequent activations after dormancy', () => {
    // First, ensure dormancy with non-trigger input
    const dormantResult = router.analyzeInput('create a javascript function');
    expect(dormantResult.type).toBe('none');
    
    // Then, activate with valid trigger
    const activeResult = router.analyzeInput('use ears workflow');
    expect(activeResult.type).toBe('main-workflow');
    expect(activeResult.skill).toBe('ears-workflow');
    expect(activeResult.confidence).toBeGreaterThan(0);
  });

  test('should provide consistent dormancy behavior across input variations', () => {
    const basePhrase = 'create a new component';
    const variations = [
      basePhrase,
      basePhrase.toUpperCase(),
      `  ${basePhrase}  `,
      `${basePhrase}!`,
      `Please ${basePhrase}.`,
      `I need to ${basePhrase} for the project.`
    ];

    variations.forEach(variation => {
      const result = router.analyzeInput(variation);
      expect(result.type).toBe('none');
      expect(result.skill).toBe(null);
      expect(result.confidence).toBe(0);
    });
  });
});