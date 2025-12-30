/**
 * Property-Based Tests for Input Validator
 * **Feature: bash-to-javascript-conversion, Property 13: Input validation feedback**
 * **Validates: Requirements 7.3**
 */

const InputValidator = require('../input-validator');

describe('InputValidator Property-Based Tests', () => {
  /**
   * Property 13: Input validation feedback
   * For any invalid user input, the system should provide immediate validation feedback 
   * with specific examples of correct usage
   */
  test('Property 13: Branch name validation provides immediate feedback with examples', () => {
    fc.assert(fc.property(
      fc.oneof(
        fc.constant(''), // Empty string
        fc.constant(null), // Null value
        fc.constant(undefined), // Undefined value
        fc.string().filter(s => /[<>:"|?*\x00-\x1f]/.test(s)), // Invalid characters
        fc.string().filter(s => /^[/_-]|[/_-]$/.test(s) && s.length > 1), // Leading/trailing separators
        fc.string({ minLength: 101 }), // Too long
        fc.integer() // Wrong type
      ),
      (invalidInput) => {
        const result = InputValidator.validateBranchName(invalidInput);
        
        // Should be marked as invalid
        expect(result.isValid).toBe(false);
        
        // Should have error messages
        expect(Array.isArray(result.errors)).toBe(true);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors.every(error => typeof error === 'string')).toBe(true);
        
        // Should have suggestions
        expect(Array.isArray(result.suggestions)).toBe(true);
        expect(result.suggestions.length).toBeGreaterThan(0);
        expect(result.suggestions.every(suggestion => typeof suggestion === 'string')).toBe(true);
        
        // Should have examples
        expect(Array.isArray(result.examples)).toBe(true);
        expect(result.examples.length).toBeGreaterThan(0);
        expect(result.examples.every(example => typeof example === 'string')).toBe(true);
        
        // Formatted feedback should be informative
        const feedback = InputValidator.formatValidationFeedback(result);
        expect(typeof feedback).toBe('string');
        expect(feedback).toContain('❌ Validation failed:');
        expect(feedback).toContain('💡 Suggestions:');
        expect(feedback).toContain('📝 Examples:');
        
        // Should be able to create structured error
        const error = InputValidator.createValidationError(result, 'branch_validation', invalidInput);
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.message).toContain('Input validation failed');
        expect(Array.isArray(error.suggestions)).toBe(true);
        expect(error.suggestions.length).toBeGreaterThan(0);
      }
    ));
  });

  test('Property 13: File path validation provides immediate feedback with examples', () => {
    fc.assert(fc.property(
      fc.oneof(
        fc.constant(''), // Empty string
        fc.constant(null), // Null value
        fc.string().filter(s => /[<>:"|?*\x00-\x1f]/.test(s)), // Invalid characters
        fc.constant('CON'), // Reserved name
        fc.constant('PRN.txt'), // Reserved name with extension
        fc.string({ minLength: 261 }).filter(() => process.platform === 'win32'), // Too long on Windows
        fc.integer() // Wrong type
      ),
      (invalidInput) => {
        // Skip the long path test on non-Windows platforms
        if (typeof invalidInput === 'string' && invalidInput.length > 260 && process.platform !== 'win32') {
          return;
        }
        
        const result = InputValidator.validateFilePath(invalidInput);
        
        // Should be marked as invalid
        expect(result.isValid).toBe(false);
        
        // Should have error messages
        expect(Array.isArray(result.errors)).toBe(true);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors.every(error => typeof error === 'string')).toBe(true);
        
        // Should have suggestions
        expect(Array.isArray(result.suggestions)).toBe(true);
        expect(result.suggestions.length).toBeGreaterThan(0);
        expect(result.suggestions.every(suggestion => typeof suggestion === 'string')).toBe(true);
        
        // Should have examples
        expect(Array.isArray(result.examples)).toBe(true);
        expect(result.examples.length).toBeGreaterThan(0);
        expect(result.examples.every(example => typeof example === 'string')).toBe(true);
        
        // Formatted feedback should be informative
        const feedback = InputValidator.formatValidationFeedback(result);
        expect(typeof feedback).toBe('string');
        expect(feedback).toContain('❌ Validation failed:');
        expect(feedback).toContain('💡 Suggestions:');
        expect(feedback).toContain('📝 Examples:');
      }
    ));
  });

  test('Property 13: Command argument validation provides immediate feedback with examples', () => {
    fc.assert(fc.property(
      fc.record({
        args: fc.oneof(
          fc.constant(null), // Not an array
          fc.constant('string'), // Wrong type
          fc.array(fc.string(), { maxLength: 0 }), // Too few args
          fc.array(fc.string(), { minLength: 10 }) // Too many args
        ),
        schema: fc.record({
          minArgs: fc.integer({ min: 1, max: 3 }),
          maxArgs: fc.integer({ min: 1, max: 5 }),
          examples: fc.array(fc.array(fc.string(), { maxLength: 3 }), { maxLength: 3 })
        })
      }),
      (testData) => {
        // Ensure schema is consistent
        if (testData.schema.minArgs > testData.schema.maxArgs) {
          testData.schema.maxArgs = testData.schema.minArgs;
        }
        
        const result = InputValidator.validateCommandArgs(testData.args, testData.schema);
        
        // Should be marked as invalid for these test cases
        expect(result.isValid).toBe(false);
        
        // Should have error messages
        expect(Array.isArray(result.errors)).toBe(true);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors.every(error => typeof error === 'string')).toBe(true);
        
        // Should have suggestions
        expect(Array.isArray(result.suggestions)).toBe(true);
        expect(result.suggestions.length).toBeGreaterThan(0);
        expect(result.suggestions.every(suggestion => typeof suggestion === 'string')).toBe(true);
        
        // Should have examples if provided in schema
        expect(Array.isArray(result.examples)).toBe(true);
        if (testData.schema.examples && testData.schema.examples.length > 0) {
          expect(result.examples.length).toBeGreaterThan(0);
        }
        
        // Formatted feedback should be informative
        const feedback = InputValidator.formatValidationFeedback(result);
        expect(typeof feedback).toBe('string');
        expect(feedback).toContain('❌ Validation failed:');
        expect(feedback).toContain('💡 Suggestions:');
      }
    ));
  });

  test('Property 13: Valid inputs pass validation without errors', () => {
    fc.assert(fc.property(
      fc.record({
        branchName: fc.string({ minLength: 1, maxLength: 50 })
          .filter(name => /^[a-zA-Z0-9/_-]+$/.test(name))
          .filter(name => !/^[/_-]|[/_-]$/.test(name)),
        filePath: fc.string({ minLength: 1, maxLength: 100 })
          .filter(path => !/[<>:"|?*\x00-\x1f]/.test(path))
          .filter(path => !['CON', 'PRN', 'AUX', 'NUL'].includes(path.toUpperCase())),
        args: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 3 })
      }),
      (validInputs) => {
        // Test branch name validation
        const branchResult = InputValidator.validateBranchName(validInputs.branchName);
        expect(branchResult.isValid).toBe(true);
        expect(branchResult.errors.length).toBe(0);
        
        // Test file path validation
        const pathResult = InputValidator.validateFilePath(validInputs.filePath);
        expect(pathResult.isValid).toBe(true);
        expect(pathResult.errors.length).toBe(0);
        
        // Test command args validation
        const argsResult = InputValidator.validateCommandArgs(validInputs.args, {
          minArgs: 1,
          maxArgs: 5
        });
        expect(argsResult.isValid).toBe(true);
        expect(argsResult.errors.length).toBe(0);
        
        // Valid inputs should have positive feedback
        const branchFeedback = InputValidator.formatValidationFeedback(branchResult);
        expect(branchFeedback).toContain('✅ Input is valid');
        
        const pathFeedback = InputValidator.formatValidationFeedback(pathResult);
        expect(pathFeedback).toContain('✅ Input is valid');
        
        const argsFeedback = InputValidator.formatValidationFeedback(argsResult);
        expect(argsFeedback).toContain('✅ Input is valid');
      }
    ));
  });

  test('Property 13: Validation errors contain contextual information', () => {
    fc.assert(fc.property(
      fc.record({
        input: fc.string(),
        operation: fc.string({ minLength: 1, maxLength: 30 })
      }),
      (testData) => {
        // Create a validation result with errors
        const validationResult = {
          isValid: false,
          errors: ['Test error 1', 'Test error 2'],
          suggestions: ['Test suggestion 1', 'Test suggestion 2'],
          examples: ['example1', 'example2']
        };
        
        const error = InputValidator.createValidationError(
          validationResult, 
          testData.operation, 
          testData.input
        );
        
        // Should be a proper error information structure
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.message).toContain('Input validation failed');
        expect(error.context.operation).toBe(testData.operation);
        expect(error.context.parameters.input).toBe(testData.input);
        expect(error.context.parameters.errors).toEqual(validationResult.errors);
        
        // Should include suggestions and examples
        expect(Array.isArray(error.suggestions)).toBe(true);
        expect(error.suggestions.length).toBeGreaterThan(0);
        expect(error.suggestions.some(s => s.includes('Test suggestion'))).toBe(true);
        expect(error.suggestions.some(s => s.includes('Examples:'))).toBe(true);
      }
    ));
  });
});