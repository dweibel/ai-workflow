/**
 * Jest Test Setup for Property-Based Testing
 * Configures fast-check and shared test utilities
 */

const fc = require('fast-check');

// Configure fast-check for consistent property-based testing
fc.configureGlobal({
  numRuns: 100, // Minimum 100 iterations as specified in design
  verbose: process.env.NODE_ENV === 'test' ? 1 : 0,
  seed: process.env.FC_SEED ? parseInt(process.env.FC_SEED) : undefined
});

// Global test utilities
global.fc = fc;

// Custom matchers for property-based testing
expect.extend({
  /**
   * Matcher to verify error information structure
   * @param {Object} received - Error object to test
   * @param {string} expectedCode - Expected error code
   */
  toBeValidErrorInfo(received, expectedCode) {
    const pass = received &&
      typeof received.code === 'string' &&
      typeof received.message === 'string' &&
      typeof received.context === 'object' &&
      Array.isArray(received.suggestions) &&
      (expectedCode ? received.code === expectedCode : true);

    if (pass) {
      return {
        message: () => `Expected error info not to be valid${expectedCode ? ` with code ${expectedCode}` : ''}`,
        pass: true
      };
    } else {
      return {
        message: () => `Expected error info to be valid${expectedCode ? ` with code ${expectedCode}` : ''}. Received: ${JSON.stringify(received)}`,
        pass: false
      };
    }
  },

  /**
   * Matcher to check if value is one of the allowed values
   * @param {*} received - Value to test
   * @param {Array} allowedValues - Array of allowed values
   */
  toBeOneOf(received, allowedValues) {
    const pass = allowedValues.includes(received);
    
    if (pass) {
      return {
        message: () => `Expected ${received} not to be one of ${allowedValues.join(', ')}`,
        pass: true
      };
    } else {
      return {
        message: () => `Expected ${received} to be one of ${allowedValues.join(', ')}`,
        pass: false
      };
    }
  },

  /**
   * Matcher to verify configuration structure
   * @param {Object} received - Configuration object to test
   */
  toBeValidConfiguration(received) {
    const pass = received &&
      typeof received === 'object' &&
      received.worktree &&
      received.reset &&
      received.display &&
      typeof received.worktree.baseDirectory === 'string' &&
      Array.isArray(received.worktree.branchPrefix) &&
      typeof received.worktree.autoCleanup === 'boolean' &&
      typeof received.worktree.maxWorktrees === 'number' &&
      typeof received.reset.archiveDirectory === 'string' &&
      typeof received.reset.compressionLevel === 'number' &&
      typeof received.reset.retentionDays === 'number' &&
      typeof received.reset.confirmDestructive === 'boolean' &&
      typeof received.display.colorOutput === 'boolean' &&
      typeof received.display.progressIndicators === 'boolean' &&
      typeof received.display.verboseLogging === 'boolean';

    if (pass) {
      return {
        message: () => 'Expected configuration not to be valid',
        pass: true
      };
    } else {
      return {
        message: () => `Expected configuration to be valid. Received: ${JSON.stringify(received)}`,
        pass: false
      };
    }
  }
});

// Test data generators for property-based testing
global.testGenerators = {
  /**
   * Generate valid branch names
   */
  branchName: () => fc.string({ minLength: 1, maxLength: 50 })
    .filter(name => /^[a-zA-Z0-9/_-]+$/.test(name))
    .map(name => name.replace(/^[/_-]+|[/_-]+$/g, '')),

  /**
   * Generate valid file paths
   */
  filePath: () => fc.array(
    fc.string({ minLength: 1, maxLength: 20 })
      .filter(segment => !/[<>:"|?*\x00-\x1f]/.test(segment))
      .filter(segment => segment !== '.' && segment !== '..')
  ).map(segments => segments.join('/')),

  /**
   * Generate valid configuration objects
   */
  configuration: () => fc.record({
    worktree: fc.record({
      baseDirectory: fc.string({ minLength: 1, maxLength: 100 }),
      branchPrefix: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1 }),
      autoCleanup: fc.boolean(),
      maxWorktrees: fc.integer({ min: 1, max: 100 })
    }),
    reset: fc.record({
      archiveDirectory: fc.string({ minLength: 1, maxLength: 100 }),
      compressionLevel: fc.integer({ min: 0, max: 9 }),
      retentionDays: fc.integer({ min: 0, max: 365 }),
      confirmDestructive: fc.boolean()
    }),
    display: fc.record({
      colorOutput: fc.boolean(),
      progressIndicators: fc.boolean(),
      verboseLogging: fc.boolean()
    })
  }),

  /**
   * Generate git command arguments
   */
  gitCommand: () => fc.record({
    command: fc.constantFrom('branch', 'checkout', 'worktree', 'status', 'log'),
    args: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 10 })
  })
};

// Console output capture utilities for testing
global.captureConsole = () => {
  const originalLog = console.log;
  const originalError = console.error;
  const logs = [];
  const errors = [];

  console.log = (...args) => logs.push(args.join(' '));
  console.error = (...args) => errors.push(args.join(' '));

  return {
    logs,
    errors,
    restore: () => {
      console.log = originalLog;
      console.error = originalError;
    }
  };
};