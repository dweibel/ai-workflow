/**
 * Property-Based Tests for Error Handler
 * **Feature: bash-to-javascript-conversion, Property 7: Structured error handling**
 * **Validates: Requirements 1.5, 3.3, 7.1, 7.2**
 */

const ErrorHandler = require('../error-handler');

describe('ErrorHandler Property-Based Tests', () => {
  /**
   * Property 7: Structured error handling
   * For any error condition, the system should generate error objects that contain 
   * all required fields (code, message, context, suggestions) and follow the defined error information model
   */
  test('Property 7: All error handlers produce valid ErrorInformation structure', () => {
    fc.assert(fc.property(
      fc.record({
        command: fc.string({ minLength: 1, maxLength: 50 }),
        operation: fc.string({ minLength: 1, maxLength: 30 }),
        path: fc.string({ minLength: 1, maxLength: 100 }),
        input: fc.string({ maxLength: 100 }),
        expected: fc.string({ minLength: 1, maxLength: 50 })
      }),
      (testData) => {
        // Test git error handling
        const gitError = new Error('Git command failed');
        gitError.code = 128;
        const gitErrorInfo = ErrorHandler.handleGitError(gitError, testData.command, {
          operation: testData.operation,
          parameters: { branch: 'test' }
        });

        expect(gitErrorInfo).toBeValidErrorInfo('GIT_COMMAND_FAILED');
        expect(gitErrorInfo.command).toBe(testData.command);
        expect(gitErrorInfo.exitCode).toBe(128);
        expect(gitErrorInfo.context.operation).toBe(testData.operation);
        expect(Array.isArray(gitErrorInfo.suggestions)).toBe(true);
        expect(gitErrorInfo.suggestions.length).toBeGreaterThan(0);

        // Test file system error handling
        const fsError = new Error('File operation failed');
        fsError.code = 'ENOENT';
        const fsErrorInfo = ErrorHandler.handleFileSystemError(fsError, testData.operation, testData.path);

        expect(fsErrorInfo).toBeValidErrorInfo('FILESYSTEM_ERROR');
        expect(fsErrorInfo.context.operation).toBe(testData.operation);
        expect(fsErrorInfo.context.parameters.path).toBe(testData.path);
        expect(Array.isArray(fsErrorInfo.suggestions)).toBe(true);
        expect(fsErrorInfo.suggestions.length).toBeGreaterThan(0);

        // Test user input error handling
        const inputError = new Error('Invalid input');
        const inputErrorInfo = ErrorHandler.handleUserInputError(inputError, testData.input, testData.expected);

        expect(inputErrorInfo).toBeValidErrorInfo('INVALID_INPUT');
        expect(inputErrorInfo.context.parameters.input).toBe(testData.input);
        expect(inputErrorInfo.context.parameters.expected).toBe(testData.expected);
        expect(Array.isArray(inputErrorInfo.suggestions)).toBe(true);
        expect(inputErrorInfo.suggestions.length).toBeGreaterThan(0);

        // Test generic error creation
        const genericErrorInfo = ErrorHandler.createError(
          'TEST_ERROR',
          'Test error message',
          { operation: testData.operation, parameters: { test: true } },
          ['Test suggestion']
        );

        expect(genericErrorInfo).toBeValidErrorInfo('TEST_ERROR');
        expect(genericErrorInfo.message).toBe('Test error message');
        expect(genericErrorInfo.context.operation).toBe(testData.operation);
        expect(genericErrorInfo.suggestions).toContain('Test suggestion');
      }
    ));
  });

  test('Property 7: Error formatting produces consistent output structure', () => {
    fc.assert(fc.property(
      fc.record({
        code: fc.string({ minLength: 1, maxLength: 20 }),
        message: fc.string({ minLength: 1, maxLength: 100 }),
        command: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
        exitCode: fc.option(fc.integer({ min: 0, max: 255 })),
        suggestions: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 5 })
      }),
      (errorData) => {
        const errorInfo = {
          code: errorData.code,
          message: errorData.message,
          command: errorData.command,
          exitCode: errorData.exitCode,
          context: {
            operation: 'test_operation',
            parameters: {},
            environment: {}
          },
          suggestions: errorData.suggestions,
          documentation: 'https://example.com/docs'
        };

        const formatted = ErrorHandler.formatErrorMessage(errorInfo);

        // Verify formatted message structure
        expect(typeof formatted).toBe('string');
        expect(formatted).toContain('❌ Error:');
        expect(formatted).toContain(errorData.message);
        
        if (errorData.command) {
          expect(formatted).toContain('Command:');
          expect(formatted).toContain(errorData.command);
        }
        
        if (errorData.exitCode !== null && errorData.exitCode !== undefined) {
          expect(formatted).toContain('Exit Code:');
          expect(formatted).toContain(errorData.exitCode.toString());
        }
        
        if (errorData.suggestions.length > 0) {
          expect(formatted).toContain('💡 Suggestions:');
          errorData.suggestions.forEach(suggestion => {
            expect(formatted).toContain(suggestion);
          });
        }
        
        expect(formatted).toContain('📚 Documentation:');
        expect(formatted).toContain('https://example.com/docs');
      }
    ));
  });

  test('Property 7: Error context includes required environment information', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 1, maxLength: 50 }),
      (operation) => {
        const error = new Error('Test error');
        const errorInfo = ErrorHandler.createError('TEST_ERROR', 'Test message', { operation });

        // Verify required environment information is present
        expect(errorInfo.context.environment).toBeDefined();
        expect(typeof errorInfo.context.environment.cwd).toBe('string');
        expect(typeof errorInfo.context.environment.platform).toBe('string');
        expect(typeof errorInfo.context.environment.nodeVersion).toBe('string');
        
        // Verify operation is preserved
        expect(errorInfo.context.operation).toBe(operation);
      }
    ));
  });
});