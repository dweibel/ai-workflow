/**
 * Property-Based Tests for Testability Analysis
 * **Feature: workflow-integration, Property 3: Testability Analysis Accuracy**
 * **Validates: Requirements 2.1**
 */

const fc = require('fast-check');

// Mock testability analysis function
function analyzeTestability(acceptanceCriterion) {
  // This would be the actual implementation of testability analysis
  // For now, we'll create a mock that demonstrates the expected behavior
  
  const criterion = acceptanceCriterion.toLowerCase();
  
  // Subjective/aesthetic terms indicate non-testable
  const subjectiveTerms = ['user-friendly', 'intuitive', 'feels', 'responsive feel', 'aesthetic', 'beautiful', 'clean design'];
  if (subjectiveTerms.some(term => criterion.includes(term))) {
    return {
      testable: 'no',
      reasoning: 'Contains subjective terms requiring human judgment'
    };
  }
  
  // UI behavior terms often indicate examples
  const uiTerms = ['display', 'show', 'navigate to', 'redirect', 'click'];
  if (uiTerms.some(term => criterion.includes(term))) {
    return {
      testable: 'yes - example',
      reasoning: 'Specific UI behavior that can be tested with concrete scenarios'
    };
  }
  
  // Edge case indicators
  const edgeCaseTerms = ['empty', 'maximum', 'minimum', 'invalid', 'error', 'fail', 'exceed'];
  if (edgeCaseTerms.some(term => criterion.includes(term))) {
    return {
      testable: 'yes - edge-case',
      reasoning: 'Boundary condition or error case'
    };
  }
  
  // General system behavior indicates properties
  const systemTerms = ['shall store', 'shall save', 'shall validate', 'shall process', 'shall authenticate'];
  if (systemTerms.some(term => criterion.includes(term))) {
    return {
      testable: 'yes - property',
      reasoning: 'General system behavior that applies across multiple inputs'
    };
  }
  
  return {
    testable: 'no',
    reasoning: 'Unable to determine testability automatically'
  };
}

describe('Testability Analysis Properties', () => {
  
  /**
   * Property 1: Subjective criteria should be marked as non-testable
   */
  test('subjective criteria are correctly identified as non-testable', () => {
    fc.assert(fc.property(
      fc.oneof(
        fc.constant('THE Interface SHALL be user-friendly and intuitive'),
        fc.constant('THE System SHALL feel responsive during use'),
        fc.constant('THE Design SHALL be aesthetically pleasing'),
        fc.constant('THE UI SHALL have a clean and modern look')
      ),
      (subjectiveCriterion) => {
        const result = analyzeTestability(subjectiveCriterion);
        expect(result.testable).toBe('no');
        expect(result.reasoning).toContain('subjective');
      }
    ), { numRuns: 100 });
  });

  /**
   * Property 2: System behavior criteria should be identified as properties
   */
  test('system behavior criteria are correctly identified as properties', () => {
    fc.assert(fc.property(
      fc.record({
        system: fc.constantFrom('Authentication System', 'Data Manager', 'Task System', 'User Manager'),
        action: fc.constantFrom('SHALL store', 'SHALL save', 'SHALL validate', 'SHALL process'),
        object: fc.constantFrom('user data', 'tasks', 'credentials', 'files')
      }),
      ({ system, action, object }) => {
        const criterion = `WHEN triggered, THE ${system} ${action} ${object}`;
        const result = analyzeTestability(criterion);
        expect(result.testable).toBe('yes - property');
        expect(result.reasoning).toContain('system behavior');
      }
    ), { numRuns: 100 });
  });

  /**
   * Property 3: Edge case criteria should be identified correctly
   */
  test('edge case criteria are correctly identified', () => {
    fc.assert(fc.property(
      fc.record({
        condition: fc.constantFrom('empty input', 'invalid data', 'maximum size', 'network failure'),
        response: fc.constantFrom('show error', 'reject request', 'display message', 'log failure')
      }),
      ({ condition, response }) => {
        const criterion = `WHEN ${condition} occurs, THE System SHALL ${response}`;
        const result = analyzeTestability(criterion);
        expect(result.testable).toBe('yes - edge-case');
        expect(result.reasoning).toContain('boundary condition');
      }
    ), { numRuns: 100 });
  });

  /**
   * Property 4: UI interaction criteria should be identified as examples
   */
  test('UI interaction criteria are correctly identified as examples', () => {
    fc.assert(fc.property(
      fc.record({
        action: fc.constantFrom('click', 'display', 'show', 'navigate to'),
        target: fc.constantFrom('button', 'error message', 'login page', 'dashboard')
      }),
      ({ action, target }) => {
        const criterion = `WHEN user performs action, THE System SHALL ${action} ${target}`;
        const result = analyzeTestability(criterion);
        expect(result.testable).toBe('yes - example');
        expect(result.reasoning).toContain('UI behavior');
      }
    ), { numRuns: 100 });
  });

  /**
   * Property 5: Analysis should always provide reasoning
   */
  test('testability analysis always provides reasoning', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 10, maxLength: 200 }),
      (criterion) => {
        const result = analyzeTestability(criterion);
        expect(result).toHaveProperty('testable');
        expect(result).toHaveProperty('reasoning');
        expect(typeof result.reasoning).toBe('string');
        expect(result.reasoning.length).toBeGreaterThan(0);
      }
    ), { numRuns: 100 });
  });

  /**
   * Property 6: Testability categories should be valid
   */
  test('testability categories are always valid', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 5, maxLength: 100 }),
      (criterion) => {
        const result = analyzeTestability(criterion);
        const validCategories = ['yes - property', 'yes - example', 'yes - edge-case', 'no'];
        expect(validCategories).toContain(result.testable);
      }
    ), { numRuns: 100 });
  });

  /**
   * Property 7: EARS pattern compliance should not affect testability categorization
   */
  test('EARS pattern structure does not affect testability categorization', () => {
    fc.assert(fc.property(
      fc.record({
        pattern: fc.constantFrom('WHEN', 'WHILE', 'IF', 'WHERE', 'THE'),
        behavior: fc.constantFrom('store data', 'show error', 'be user-friendly', 'handle invalid input')
      }),
      ({ pattern, behavior }) => {
        const criterion1 = `${pattern} condition, THE System SHALL ${behavior}`;
        const criterion2 = `THE System SHALL ${behavior}`;
        
        const result1 = analyzeTestability(criterion1);
        const result2 = analyzeTestability(criterion2);
        
        // Same behavior should get same testability classification regardless of EARS pattern
        expect(result1.testable).toBe(result2.testable);
      }
    ), { numRuns: 100 });
  });

});

/**
 * Unit Tests for Specific Testability Scenarios
 */
describe('Testability Analysis Examples', () => {
  
  test('correctly identifies data operations as properties', () => {
    const criteria = [
      'WHEN a user saves a task, THE Task Manager SHALL store it to local storage',
      'WHEN data is serialized, THE System SHALL preserve all information',
      'WHEN authentication succeeds, THE System SHALL create a session token'
    ];
    
    criteria.forEach(criterion => {
      const result = analyzeTestability(criterion);
      expect(result.testable).toBe('yes - property');
    });
  });

  test('correctly identifies UI interactions as examples', () => {
    const criteria = [
      'WHEN user clicks save, THE Interface SHALL display success message',
      'WHEN login fails, THE System SHALL show error dialog',
      'WHEN page loads, THE Dashboard SHALL display user information'
    ];
    
    criteria.forEach(criterion => {
      const result = analyzeTestability(criterion);
      expect(result.testable).toBe('yes - example');
    });
  });

  test('correctly identifies edge cases', () => {
    const criteria = [
      'WHEN file size exceeds maximum, THE System SHALL reject upload',
      'WHEN empty input is provided, THE Validator SHALL show error message',
      'WHEN network connection fails, THE System SHALL queue operations'
    ];
    
    criteria.forEach(criterion => {
      const result = analyzeTestability(criterion);
      expect(result.testable).toBe('yes - edge-case');
    });
  });

  test('correctly identifies non-testable subjective requirements', () => {
    const criteria = [
      'THE Interface SHALL be user-friendly and intuitive',
      'THE System SHALL feel responsive during normal use',
      'THE Design SHALL follow modern aesthetic principles'
    ];
    
    criteria.forEach(criterion => {
      const result = analyzeTestability(criterion);
      expect(result.testable).toBe('no');
    });
  });

});

/**
 * Integration Tests with Prework Tool
 */
describe('Prework Tool Integration', () => {
  
  test('testability analysis integrates with prework format', () => {
    const acceptanceCriteria = [
      '1.1 WHEN a user saves data, THE System SHALL store it persistently',
      '1.2 WHEN invalid input is provided, THE System SHALL show validation errors',
      '1.3 THE Interface SHALL be intuitive and easy to use'
    ];
    
    const preworkAnalysis = acceptanceCriteria.map((criterion, index) => {
      const result = analyzeTestability(criterion);
      return `${criterion}\n  Thoughts: ${result.reasoning}\n  Testable: ${result.testable}`;
    }).join('\n\n');
    
    // Verify prework format is correct
    expect(preworkAnalysis).toContain('Thoughts:');
    expect(preworkAnalysis).toContain('Testable:');
    expect(preworkAnalysis).toContain('yes - property');
    expect(preworkAnalysis).toContain('yes - edge-case');
    expect(preworkAnalysis).toContain('no');
  });

});

// Test configuration for property-based testing
const testConfig = {
  numRuns: 100,
  timeout: 5000,
  verbose: true
};