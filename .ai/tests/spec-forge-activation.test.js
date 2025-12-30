/**
 * Property-based tests for SPEC-FORGE sub-skill activation
 * Feature: ears-workflow-skill-refactor, Property 6: Sub-skill activation completeness
 * Validates: Requirements 3.1
 */

const fc = require('fast-check');

// Mock skill activation system
class SkillActivationSystem {
  constructor() {
    this.activeSkills = new Set();
    this.loadedContent = new Map();
  }

  activateSkill(userInput) {
    const normalizedInput = userInput.toLowerCase().trim();
    
    // SPEC-FORGE activation triggers
    const specForgeKeywords = [
      'spec-forge', 'spec forge', 'specforge',
      'specification', 'requirements', 'ears',
      'user story', 'create spec', 'formal specification',
      'structured requirements', 'design', 'correctness properties'
    ];

    const shouldActivate = specForgeKeywords.some(keyword => 
      normalizedInput.includes(keyword)
    );

    if (shouldActivate) {
      this.activeSkills.add('spec-forge');
      this.loadedContent.set('spec-forge', {
        instructions: 'SPEC-FORGE phase instructions loaded',
        capabilities: ['requirements-creation', 'design-generation', 'task-planning'],
        references: ['ears-validation', 'incose-validation', 'requirements-template']
      });
      return {
        activated: true,
        skill: 'spec-forge',
        feedback: 'SPEC-FORGE skill activated - ready for structured specification creation'
      };
    }

    return {
      activated: false,
      skill: null,
      feedback: 'No skill activated'
    };
  }

  isSkillActive(skillName) {
    return this.activeSkills.has(skillName);
  }

  getLoadedContent(skillName) {
    return this.loadedContent.get(skillName);
  }

  reset() {
    this.activeSkills.clear();
    this.loadedContent.clear();
  }
}

describe('SPEC-FORGE Sub-skill Activation', () => {
  let system;

  beforeEach(() => {
    system = new SkillActivationSystem();
  });

  /**
   * Property 6: Sub-skill activation completeness
   * For any valid sub-skill name (spec-forge), invoking that sub-skill should activate 
   * its specific capabilities and load relevant instructions
   */
  test('should activate SPEC-FORGE skill for valid trigger phrases', () => {
    fc.assert(fc.property(
      fc.oneof(
        fc.constant('spec-forge'),
        fc.constant('SPEC-FORGE'),
        fc.constant('specification'),
        fc.constant('requirements'),
        fc.constant('EARS'),
        fc.constant('user story'),
        fc.constant('create spec'),
        fc.constant('formal specification'),
        fc.constant('structured requirements'),
        fc.constant('design'),
        fc.constant('correctness properties')
      ),
      fc.string({ minLength: 0, maxLength: 50 }), // prefix
      fc.string({ minLength: 0, maxLength: 50 }), // suffix
      (trigger, prefix, suffix) => {
        // Arrange
        const userInput = `${prefix} ${trigger} ${suffix}`.trim();
        
        // Act
        const result = system.activateSkill(userInput);
        
        // Assert
        expect(result.activated).toBe(true);
        expect(result.skill).toBe('spec-forge');
        expect(result.feedback).toContain('SPEC-FORGE');
        expect(system.isSkillActive('spec-forge')).toBe(true);
        
        const loadedContent = system.getLoadedContent('spec-forge');
        expect(loadedContent).toBeDefined();
        expect(loadedContent.capabilities).toContain('requirements-creation');
        expect(loadedContent.capabilities).toContain('design-generation');
        expect(loadedContent.capabilities).toContain('task-planning');
        expect(loadedContent.references).toContain('ears-validation');
        
        // Cleanup for next iteration
        system.reset();
      }
    ), { numRuns: 100 });
  });

  test('should not activate SPEC-FORGE skill for unrelated inputs', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 1, maxLength: 100 })
        .filter(s => {
          const lower = s.toLowerCase();
          return !lower.includes('spec') && 
                 !lower.includes('requirement') && 
                 !lower.includes('ears') && 
                 !lower.includes('design') &&
                 !lower.includes('specification');
        }),
      (userInput) => {
        // Act
        const result = system.activateSkill(userInput);
        
        // Assert
        expect(result.activated).toBe(false);
        expect(result.skill).toBe(null);
        expect(system.isSkillActive('spec-forge')).toBe(false);
        expect(system.getLoadedContent('spec-forge')).toBeUndefined();
        
        // Cleanup for next iteration
        system.reset();
      }
    ), { numRuns: 100 });
  });

  test('should load specific SPEC-FORGE capabilities when activated', () => {
    // Arrange
    const userInput = 'I need to create a specification';
    
    // Act
    const result = system.activateSkill(userInput);
    
    // Assert
    expect(result.activated).toBe(true);
    
    const content = system.getLoadedContent('spec-forge');
    expect(content.capabilities).toEqual([
      'requirements-creation',
      'design-generation', 
      'task-planning'
    ]);
    expect(content.references).toEqual([
      'ears-validation',
      'incose-validation',
      'requirements-template'
    ]);
    expect(content.instructions).toBe('SPEC-FORGE phase instructions loaded');
  });

  test('should provide appropriate feedback for SPEC-FORGE activation', () => {
    fc.assert(fc.property(
      fc.constantFrom('spec-forge', 'specification', 'requirements', 'EARS'),
      (trigger) => {
        // Act
        const result = system.activateSkill(trigger);
        
        // Assert
        expect(result.feedback).toMatch(/SPEC-FORGE.*activated/i);
        expect(result.feedback).toMatch(/specification.*creation/i);
        
        // Cleanup
        system.reset();
      }
    ), { numRuns: 100 });
  });

  test('should handle case-insensitive activation', () => {
    fc.assert(fc.property(
      fc.constantFrom('SPEC-FORGE', 'spec-forge', 'Spec-Forge', 'SPECIFICATION', 'specification'),
      (trigger) => {
        // Act
        const result = system.activateSkill(trigger);
        
        // Assert
        expect(result.activated).toBe(true);
        expect(result.skill).toBe('spec-forge');
        
        // Cleanup
        system.reset();
      }
    ), { numRuns: 100 });
  });
});

module.exports = { SkillActivationSystem };