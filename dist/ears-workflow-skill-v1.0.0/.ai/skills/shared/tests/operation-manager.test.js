/**
 * Property-Based Tests for Operation Manager
 * **Feature: bash-to-javascript-conversion, Property 14: Operation cancellation cleanup**
 * **Validates: Requirements 7.4**
 */

const operationManager = require('../operation-manager');

describe('OperationManager Property-Based Tests', () => {
  beforeEach(() => {
    // Clean up any existing operations
    operationManager.cleanupCompletedOperations(0);
  });

  /**
   * Property 14: Operation cancellation cleanup
   * For any cancelled operation, the system should clean up partial state and 
   * provide clear status messages about what was and wasn't completed
   */
  test('Property 14: Cancelled operations perform cleanup and provide status messages', () => {
    fc.assert(fc.property(
      fc.record({
        operationName: fc.string({ minLength: 1, maxLength: 50 }),
        cleanupTasks: fc.array(
          fc.record({
            description: fc.string({ minLength: 1, maxLength: 30 }),
            shouldFail: fc.boolean()
          }),
          { minLength: 1, maxLength: 5 }
        ),
        partialStateTasks: fc.array(
          fc.string({ minLength: 1, maxLength: 20 }),
          { minLength: 1, maxLength: 5 }
        ),
        delayBeforeCancel: fc.integer({ min: 10, max: 100 })
      }),
      async (testData) => {
        let cleanupExecuted = false;
        const cleanupResults = [];

        // Create operation that sets up partial state and cleanup tasks
        const operation = operationManager.startOperation(
          testData.operationName,
          async (cancellationToken) => {
            // Set up planned tasks
            testData.partialStateTasks.forEach((task, index) => {
              cancellationToken.setPartialState(`planned_${index}`, task);
            });

            // Add cleanup tasks
            testData.cleanupTasks.forEach((cleanupTask) => {
              cancellationToken.addCleanupTask(
                async () => {
                  cleanupExecuted = true;
                  cleanupResults.push(cleanupTask.description);
                  if (cleanupTask.shouldFail) {
                    throw new Error(`Cleanup failed: ${cleanupTask.description}`);
                  }
                },
                cleanupTask.description
              );
            });

            // Complete some tasks
            const completedCount = Math.floor(testData.partialStateTasks.length / 2);
            for (let i = 0; i < completedCount; i++) {
              cancellationToken.setPartialState(`completed_${testData.partialStateTasks[i]}`, true);
              cancellationToken.updateStatus(`Completed task: ${testData.partialStateTasks[i]}`);
            }

            // Simulate long-running operation
            await new Promise(resolve => setTimeout(resolve, testData.delayBeforeCancel * 2));
            
            return 'operation completed';
          }
        );

        // Wait a bit then cancel
        await new Promise(resolve => setTimeout(resolve, testData.delayBeforeCancel));
        const cancellationResult = await operation.cancel();

        // Verify cancellation result structure
        expect(cancellationResult).toBeDefined();
        expect(cancellationResult.operationId).toBe(operation.id);
        expect(cancellationResult.operationName).toBe(testData.operationName);
        expect(cancellationResult.cancelled).toBe(true);
        expect(cancellationResult.cleanupPerformed).toBe(true);
        
        // Verify cleanup was executed
        expect(cleanupExecuted).toBe(true);
        expect(Array.isArray(cancellationResult.cleanupResults)).toBe(true);
        expect(cancellationResult.cleanupResults.length).toBe(testData.cleanupTasks.length);

        // Verify cleanup results structure
        cancellationResult.cleanupResults.forEach((result, index) => {
          expect(result).toHaveProperty('description');
          expect(result).toHaveProperty('success');
          expect(result).toHaveProperty('error');
          expect(result.description).toBe(testData.cleanupTasks[index].description);
          expect(typeof result.success).toBe('boolean');
          
          if (testData.cleanupTasks[index].shouldFail) {
            expect(result.success).toBe(false);
            expect(result.error).toBeTruthy();
          } else {
            expect(result.success).toBe(true);
            expect(result.error).toBeNull();
          }
        });

        // Verify status message is informative
        expect(typeof cancellationResult.statusMessage).toBe('string');
        expect(cancellationResult.statusMessage.length).toBeGreaterThan(0);
        expect(cancellationResult.statusMessage).toContain(testData.operationName);
        expect(cancellationResult.statusMessage).toContain('cancelled');

        // Verify partial state is preserved
        expect(cancellationResult.partialState).toBeDefined();
        expect(typeof cancellationResult.partialState).toBe('object');

        // Verify completed and incomplete task tracking
        expect(Array.isArray(cancellationResult.completedTasks)).toBe(true);
        expect(Array.isArray(cancellationResult.incompleteTasks)).toBe(true);

        // Check that cleanup success reflects actual results
        const expectedCleanupSuccess = testData.cleanupTasks.every(task => !task.shouldFail);
        expect(cancellationResult.cleanupSuccess).toBe(expectedCleanupSuccess);
      }
    ));
  });

  test('Property 14: Operations that complete before cancellation handle gracefully', () => {
    fc.assert(fc.property(
      fc.record({
        operationName: fc.string({ minLength: 1, maxLength: 50 }),
        quickCompletion: fc.boolean()
      }),
      async (testData) => {
        const operation = operationManager.startOperation(
          testData.operationName,
          async (cancellationToken) => {
            if (testData.quickCompletion) {
              // Complete immediately
              return 'quick completion';
            } else {
              // Take some time but still complete before cancellation
              await new Promise(resolve => setTimeout(resolve, 50));
              return 'normal completion';
            }
          }
        );

        // Wait for operation to potentially complete
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
          const cancellationResult = await operation.cancel();
          
          // If operation was already completed, should indicate this
          if (cancellationResult.alreadyCompleted) {
            expect(cancellationResult.cleanupPerformed).toBe(false);
            expect(cancellationResult.statusMessage).toContain('already');
          } else {
            // Operation was successfully cancelled
            expect(cancellationResult.cancelled).toBe(true);
            expect(typeof cancellationResult.statusMessage).toBe('string');
          }
        } catch (error) {
          // Operation might have completed successfully
          const status = operation.getStatus();
          expect(status.status).toBeOneOf(['completed', 'cancelled']);
        }
      }
    ));
  });

  test('Property 14: Status messages contain required information', () => {
    fc.assert(fc.property(
      fc.record({
        operationName: fc.string({ minLength: 1, maxLength: 50 }),
        statusUpdates: fc.array(
          fc.string({ minLength: 1, maxLength: 30 }),
          { minLength: 1, maxLength: 3 }
        )
      }),
      async (testData) => {
        const operation = operationManager.startOperation(
          testData.operationName,
          async (cancellationToken) => {
            // Add status updates
            testData.statusUpdates.forEach(update => {
              cancellationToken.updateStatus(update);
            });

            // Simulate work
            await new Promise(resolve => setTimeout(resolve, 50));
            return 'completed';
          }
        );

        // Cancel after a short delay
        await new Promise(resolve => setTimeout(resolve, 25));
        const cancellationResult = await operation.cancel();

        // Verify status message structure
        expect(typeof cancellationResult.statusMessage).toBe('string');
        expect(cancellationResult.statusMessage).toContain(testData.operationName);
        expect(cancellationResult.statusMessage).toContain('cancelled');

        // Get operation status to verify status updates were recorded
        const status = operation.getStatus();
        expect(Array.isArray(status.statusMessages)).toBe(true);
        
        // Status updates should be preserved even after cancellation
        const recordedMessages = status.statusMessages.map(msg => msg.message);
        testData.statusUpdates.forEach(update => {
          expect(recordedMessages).toContain(update);
        });
      }
    ));
  });

  test('Property 14: Cleanup tasks execute in reverse order (LIFO)', () => {
    fc.assert(fc.property(
      fc.array(
        fc.string({ minLength: 1, maxLength: 20 }),
        { minLength: 2, maxLength: 5 }
      ),
      async (cleanupDescriptions) => {
        const executionOrder = [];

        const operation = operationManager.startOperation(
          'test-cleanup-order',
          async (cancellationToken) => {
            // Add cleanup tasks in order
            cleanupDescriptions.forEach((description, index) => {
              cancellationToken.addCleanupTask(
                async () => {
                  executionOrder.push(index);
                },
                description
              );
            });

            // Simulate work
            await new Promise(resolve => setTimeout(resolve, 50));
            return 'completed';
          }
        );

        // Cancel operation
        await new Promise(resolve => setTimeout(resolve, 25));
        const cancellationResult = await operation.cancel();

        // Verify cleanup was performed
        expect(cancellationResult.cleanupPerformed).toBe(true);
        expect(executionOrder.length).toBe(cleanupDescriptions.length);

        // Verify LIFO order (last added, first executed)
        const expectedOrder = cleanupDescriptions.map((_, index) => index).reverse();
        expect(executionOrder).toEqual(expectedOrder);
      }
    ));
  });

  test('Property 14: Partial state tracking works correctly', () => {
    fc.assert(fc.property(
      fc.record({
        plannedTasks: fc.array(
          fc.string({ minLength: 1, maxLength: 20 }),
          { minLength: 2, maxLength: 5 }
        ),
        completionRatio: fc.float({ min: 0, max: 1 })
      }),
      async (testData) => {
        const operation = operationManager.startOperation(
          'test-partial-state',
          async (cancellationToken) => {
            // Set up planned tasks
            testData.plannedTasks.forEach((task, index) => {
              cancellationToken.setPartialState(`planned_${index}`, task);
            });

            // Complete some tasks based on completion ratio
            const completedCount = Math.floor(testData.plannedTasks.length * testData.completionRatio);
            for (let i = 0; i < completedCount; i++) {
              cancellationToken.setPartialState(`completed_${testData.plannedTasks[i]}`, true);
            }

            // Simulate work
            await new Promise(resolve => setTimeout(resolve, 50));
            return 'completed';
          }
        );

        // Cancel operation
        await new Promise(resolve => setTimeout(resolve, 25));
        const cancellationResult = await operation.cancel();

        // Verify partial state is preserved
        expect(cancellationResult.partialState).toBeDefined();
        expect(typeof cancellationResult.partialState).toBe('object');

        // Verify completed and incomplete task tracking
        expect(Array.isArray(cancellationResult.completedTasks)).toBe(true);
        expect(Array.isArray(cancellationResult.incompleteTasks)).toBe(true);

        // The sum of completed and incomplete should not exceed planned tasks
        const totalTracked = cancellationResult.completedTasks.length + cancellationResult.incompleteTasks.length;
        expect(totalTracked).toBeLessThanOrEqual(testData.plannedTasks.length);
      }
    ));
  });
});