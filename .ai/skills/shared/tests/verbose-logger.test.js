/**
 * Property-Based Tests for Verbose Logger
 * **Feature: bash-to-javascript-conversion, Property 15: Verbose logging detail**
 * **Validates: Requirements 7.5**
 */

const VerboseLogger = require('../verbose-logger');

describe('VerboseLogger Property-Based Tests', () => {
  /**
   * Property 15: Verbose logging detail
   * For any operation with verbose logging enabled, the system should provide detailed 
   * execution traces that include command execution, parameter values, and intermediate results
   */
  test('Property 15: Command execution logging includes all required details', () => {
    fc.assert(fc.property(
      fc.record({
        command: fc.string({ minLength: 1, maxLength: 50 }),
        args: fc.array(fc.string({ maxLength: 30 }), { maxLength: 5 }),
        options: fc.record({
          cwd: fc.string({ maxLength: 50 }),
          timeout: fc.integer({ min: 100, max: 5000 })
        }),
        result: fc.oneof(
          fc.string({ maxLength: 100 }),
          fc.integer(),
          fc.record({ status: fc.string(), output: fc.string() })
        ),
        duration: fc.integer({ min: 1, max: 10000 })
      }),
      (testData) => {
        const logger = new VerboseLogger({ enabled: true, includeTimestamps: true });
        
        logger.logCommandExecution(
          testData.command,
          testData.args,
          testData.options,
          testData.result,
          testData.duration
        );
        
        const logs = logger.getLogs();
        expect(logs.length).toBe(1);
        
        const logEntry = logs[0];
        
        // Verify log entry structure
        expect(logEntry.type).toBe('command_execution');
        expect(logEntry.command).toBe(testData.command);
        expect(logEntry.args).toEqual(testData.args);
        expect(logEntry.options).toEqual(testData.options);
        expect(logEntry.result).toEqual(testData.result);
        expect(logEntry.duration).toBe(testData.duration);
        expect(logEntry.level).toBe('info');
        
        // Verify timestamp is present and valid
        expect(typeof logEntry.timestamp).toBe('string');
        expect(new Date(logEntry.timestamp)).toBeInstanceOf(Date);
        expect(isNaN(new Date(logEntry.timestamp).getTime())).toBe(false);
        
        // Verify context is preserved
        expect(logEntry.context).toBeDefined();
        expect(typeof logEntry.context).toBe('object');
        
        // Verify formatted output contains all details
        const formatted = logger.formatLogs([logEntry]);
        expect(formatted).toContain(testData.command);
        expect(formatted).toContain(testData.duration.toString());
        expect(formatted).toContain('COMMAND');
        expect(formatted).toContain('INFO:');
      }
    ));
  });

  test('Property 15: Function call logging includes parameters and return values', () => {
    fc.assert(fc.property(
      fc.record({
        functionName: fc.string({ minLength: 1, maxLength: 50 }),
        parameters: fc.array(
          fc.oneof(
            fc.string({ maxLength: 30 }),
            fc.integer(),
            fc.boolean(),
            fc.record({ key: fc.string(), value: fc.integer() })
          ),
          { maxLength: 5 }
        ),
        returnValue: fc.oneof(
          fc.string({ maxLength: 50 }),
          fc.integer(),
          fc.boolean(),
          fc.record({ success: fc.boolean(), data: fc.string() })
        ),
        duration: fc.integer({ min: 1, max: 1000 })
      }),
      (testData) => {
        const logger = new VerboseLogger({ enabled: true });
        
        logger.logFunctionCall(
          testData.functionName,
          testData.parameters,
          testData.returnValue,
          testData.duration
        );
        
        const logs = logger.getLogs();
        expect(logs.length).toBe(1);
        
        const logEntry = logs[0];
        
        // Verify log entry structure
        expect(logEntry.type).toBe('function_call');
        expect(logEntry.functionName).toBe(testData.functionName);
        expect(logEntry.parameters).toEqual(testData.parameters);
        expect(logEntry.returnValue).toEqual(testData.returnValue);
        expect(logEntry.duration).toBe(testData.duration);
        expect(logEntry.level).toBe('debug');
        
        // Verify formatted output contains function details
        const formatted = logger.formatLogs([logEntry]);
        expect(formatted).toContain(testData.functionName);
        expect(formatted).toContain('FUNCTION');
        expect(formatted).toContain('DEBUG:');
      }
    ));
  });

  test('Property 15: Operation progress logging tracks intermediate results', () => {
    fc.assert(fc.property(
      fc.record({
        operation: fc.string({ minLength: 1, maxLength: 30 }),
        step: fc.string({ minLength: 1, maxLength: 30 }),
        intermediateResults: fc.record({
          processed: fc.integer({ min: 0, max: 1000 }),
          remaining: fc.integer({ min: 0, max: 1000 }),
          errors: fc.array(fc.string({ maxLength: 20 }), { maxLength: 3 })
        }),
        metadata: fc.record({
          startTime: fc.date(),
          userId: fc.string({ maxLength: 20 })
        })
      }),
      (testData) => {
        const logger = new VerboseLogger({ enabled: true });
        
        logger.logOperationProgress(
          testData.operation,
          testData.step,
          testData.intermediateResults,
          testData.metadata
        );
        
        const logs = logger.getLogs();
        expect(logs.length).toBe(1);
        
        const logEntry = logs[0];
        
        // Verify log entry structure
        expect(logEntry.type).toBe('operation_progress');
        expect(logEntry.operation).toBe(testData.operation);
        expect(logEntry.step).toBe(testData.step);
        expect(logEntry.intermediateResults).toEqual(testData.intermediateResults);
        expect(logEntry.metadata).toEqual(testData.metadata);
        expect(logEntry.level).toBe('info');
        
        // Verify formatted output contains progress details
        const formatted = logger.formatLogs([logEntry]);
        expect(formatted).toContain(testData.operation);
        expect(formatted).toContain(testData.step);
        expect(formatted).toContain('PROGRESS');
      }
    ));
  });

  test('Property 15: Error logging includes detailed context and environment', () => {
    fc.assert(fc.property(
      fc.record({
        errorMessage: fc.string({ minLength: 1, maxLength: 100 }),
        errorCode: fc.oneof(fc.string({ maxLength: 20 }), fc.integer()),
        operation: fc.string({ minLength: 1, maxLength: 30 }),
        parameters: fc.record({
          input: fc.string({ maxLength: 50 }),
          options: fc.record({ verbose: fc.boolean() })
        }),
        environment: fc.record({
          platform: fc.constantFrom('win32', 'darwin', 'linux'),
          nodeVersion: fc.string({ minLength: 1, maxLength: 10 }),
          cwd: fc.string({ maxLength: 50 })
        })
      }),
      (testData) => {
        const logger = new VerboseLogger({ enabled: true, includeStackTrace: true });
        
        const error = new Error(testData.errorMessage);
        error.code = testData.errorCode;
        
        logger.logError(error, testData.operation, testData.parameters, testData.environment);
        
        const logs = logger.getLogs();
        expect(logs.length).toBe(1);
        
        const logEntry = logs[0];
        
        // Verify log entry structure
        expect(logEntry.type).toBe('error');
        expect(logEntry.error.message).toBe(testData.errorMessage);
        expect(logEntry.error.code).toBe(testData.errorCode);
        expect(logEntry.operation).toBe(testData.operation);
        expect(logEntry.parameters).toEqual(testData.parameters);
        expect(logEntry.environment).toEqual(testData.environment);
        expect(logEntry.level).toBe('error');
        
        // Verify stack trace is included when enabled
        expect(logEntry.error.stack).toBeDefined();
        
        // Verify formatted output contains error details
        const formatted = logger.formatLogs([logEntry]);
        expect(formatted).toContain(testData.errorMessage);
        expect(formatted).toContain(testData.operation);
        expect(formatted).toContain('ERROR');
      }
    ));
  });

  test('Property 15: State change logging tracks before and after values', () => {
    fc.assert(fc.property(
      fc.record({
        component: fc.string({ minLength: 1, maxLength: 30 }),
        property: fc.string({ minLength: 1, maxLength: 30 }),
        beforeValue: fc.oneof(
          fc.string({ maxLength: 30 }),
          fc.integer(),
          fc.boolean(),
          fc.record({ status: fc.string() })
        ),
        afterValue: fc.oneof(
          fc.string({ maxLength: 30 }),
          fc.integer(),
          fc.boolean(),
          fc.record({ status: fc.string() })
        ),
        reason: fc.string({ minLength: 1, maxLength: 50 })
      }),
      (testData) => {
        const logger = new VerboseLogger({ enabled: true });
        
        logger.logStateChange(
          testData.component,
          testData.property,
          testData.beforeValue,
          testData.afterValue,
          testData.reason
        );
        
        const logs = logger.getLogs();
        expect(logs.length).toBe(1);
        
        const logEntry = logs[0];
        
        // Verify log entry structure
        expect(logEntry.type).toBe('state_change');
        expect(logEntry.component).toBe(testData.component);
        expect(logEntry.property).toBe(testData.property);
        expect(logEntry.beforeValue).toEqual(testData.beforeValue);
        expect(logEntry.afterValue).toEqual(testData.afterValue);
        expect(logEntry.reason).toBe(testData.reason);
        expect(logEntry.level).toBe('debug');
        
        // Verify formatted output shows state transition
        const formatted = logger.formatLogs([logEntry]);
        expect(formatted).toContain(testData.component);
        expect(formatted).toContain(testData.property);
        expect(formatted).toContain('STATE');
        expect(formatted).toContain('->');
      }
    ));
  });

  test('Property 15: Context is preserved across all log entries', () => {
    fc.assert(fc.property(
      fc.record({
        context: fc.record({
          sessionId: fc.string({ minLength: 1, maxLength: 20 }),
          userId: fc.string({ minLength: 1, maxLength: 20 }),
          operation: fc.string({ minLength: 1, maxLength: 30 })
        }),
        operations: fc.array(
          fc.record({
            type: fc.constantFrom('command', 'function', 'progress'),
            name: fc.string({ minLength: 1, maxLength: 20 })
          }),
          { minLength: 2, maxLength: 5 }
        )
      }),
      (testData) => {
        const logger = new VerboseLogger({ enabled: true });
        
        // Set context
        logger.setContext(testData.context);
        
        // Log multiple operations
        testData.operations.forEach((op, index) => {
          switch (op.type) {
            case 'command':
              logger.logCommandExecution(op.name, [], {}, 'success', 100);
              break;
            case 'function':
              logger.logFunctionCall(op.name, [], 'result', 50);
              break;
            case 'progress':
              logger.logOperationProgress(op.name, 'step1', { progress: index }, {});
              break;
          }
        });
        
        const logs = logger.getLogs();
        expect(logs.length).toBe(testData.operations.length);
        
        // Verify all logs have the same context
        logs.forEach(logEntry => {
          expect(logEntry.context).toEqual(testData.context);
        });
        
        // Clear context and verify it affects new logs
        logger.clearContext();
        logger.logCommandExecution('test', [], {}, 'success', 100);
        
        const allLogs = logger.getLogs();
        const lastLog = allLogs[allLogs.length - 1];
        expect(Object.keys(lastLog.context)).toHaveLength(0);
      }
    ));
  });

  test('Property 15: Log filtering works correctly', () => {
    fc.assert(fc.property(
      fc.record({
        operations: fc.array(
          fc.record({
            type: fc.constantFrom('command_execution', 'function_call', 'error'),
            level: fc.constantFrom('info', 'debug', 'error'),
            name: fc.string({ minLength: 1, maxLength: 20 })
          }),
          { minLength: 3, maxLength: 10 }
        ),
        filterType: fc.constantFrom('command_execution', 'function_call', 'error'),
        filterLevel: fc.constantFrom('info', 'debug', 'error')
      }),
      (testData) => {
        const logger = new VerboseLogger({ enabled: true });
        
        // Log operations with different types and levels
        testData.operations.forEach(op => {
          const logEntry = {
            type: op.type,
            level: op.level,
            timestamp: new Date().toISOString(),
            context: {}
          };
          
          // Add type-specific properties
          if (op.type === 'command_execution') {
            logEntry.command = op.name;
            logEntry.args = [];
            logEntry.result = 'success';
            logEntry.duration = 100;
          } else if (op.type === 'function_call') {
            logEntry.functionName = op.name;
            logEntry.parameters = [];
            logEntry.returnValue = 'result';
            logEntry.duration = 50;
          } else if (op.type === 'error') {
            logEntry.error = { message: 'test error' };
            logEntry.operation = op.name;
          }
          
          logger.logs.push(logEntry);
        });
        
        // Test type filtering
        const typeFiltered = logger.getLogs({ type: testData.filterType });
        const expectedTypeCount = testData.operations.filter(op => op.type === testData.filterType).length;
        expect(typeFiltered.length).toBe(expectedTypeCount);
        typeFiltered.forEach(log => {
          expect(log.type).toBe(testData.filterType);
        });
        
        // Test level filtering
        const levelFiltered = logger.getLogs({ level: testData.filterLevel });
        const expectedLevelCount = testData.operations.filter(op => op.level === testData.filterLevel).length;
        expect(levelFiltered.length).toBe(expectedLevelCount);
        levelFiltered.forEach(log => {
          expect(log.level).toBe(testData.filterLevel);
        });
        
        // Test combined filtering
        const combinedFiltered = logger.getLogs({ 
          type: testData.filterType, 
          level: testData.filterLevel 
        });
        const expectedCombinedCount = testData.operations.filter(op => 
          op.type === testData.filterType && op.level === testData.filterLevel
        ).length;
        expect(combinedFiltered.length).toBe(expectedCombinedCount);
      }
    ));
  });

  test('Property 15: Disabled logger does not record logs', () => {
    fc.assert(fc.property(
      fc.record({
        command: fc.string({ minLength: 1, maxLength: 30 }),
        functionName: fc.string({ minLength: 1, maxLength: 30 })
      }),
      (testData) => {
        const logger = new VerboseLogger({ enabled: false });
        
        // Attempt to log various operations
        logger.logCommandExecution(testData.command, [], {}, 'success', 100);
        logger.logFunctionCall(testData.functionName, [], 'result', 50);
        logger.logError(new Error('test'), 'operation', {}, {});
        
        // Should have no logs
        const logs = logger.getLogs();
        expect(logs.length).toBe(0);
        
        // Enable and verify logging works
        logger.enable();
        logger.logCommandExecution(testData.command, [], {}, 'success', 100);
        
        const logsAfterEnable = logger.getLogs();
        expect(logsAfterEnable.length).toBe(1);
        
        // Disable again and verify no new logs
        logger.disable();
        logger.logFunctionCall(testData.functionName, [], 'result', 50);
        
        const finalLogs = logger.getLogs();
        expect(finalLogs.length).toBe(1); // Still just the one from when enabled
      }
    ));
  });
});