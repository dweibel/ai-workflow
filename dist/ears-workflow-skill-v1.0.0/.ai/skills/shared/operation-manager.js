/**
 * Operation Manager Module
 * Handles operation cancellation with cleanup and status messages
 */

const ErrorHandler = require('./error-handler');
const { EventEmitter } = require('events');

class OperationManager extends EventEmitter {
  constructor() {
    super();
    this.operations = new Map();
    this.nextOperationId = 1;
  }

  /**
   * Start a new operation
   * @param {string} name - Operation name
   * @param {Function} operationFn - Function to execute
   * @param {Object} options - Operation options
   * @returns {Object} Operation control object
   */
  startOperation(name, operationFn, options = {}) {
    const operationId = this.nextOperationId++;
    const operation = {
      id: operationId,
      name,
      status: 'running',
      startTime: new Date(),
      cancelled: false,
      cleanupTasks: [],
      statusMessages: [],
      partialState: {},
      options
    };

    this.operations.set(operationId, operation);

    // Create cancellation token
    const cancellationToken = {
      isCancelled: () => operation.cancelled,
      throwIfCancelled: () => {
        if (operation.cancelled) {
          throw new Error('Operation was cancelled');
        }
      },
      addCleanupTask: (cleanupFn, description) => {
        operation.cleanupTasks.push({ fn: cleanupFn, description });
      },
      updateStatus: (message) => {
        operation.statusMessages.push({
          timestamp: new Date(),
          message
        });
        this.emit('statusUpdate', operationId, message);
      },
      setPartialState: (key, value) => {
        operation.partialState[key] = value;
      },
      getPartialState: (key) => {
        return operation.partialState[key];
      }
    };

    // Execute operation asynchronously
    const promise = this._executeOperation(operation, operationFn, cancellationToken);

    return {
      id: operationId,
      promise,
      cancel: () => this.cancelOperation(operationId),
      getStatus: () => this.getOperationStatus(operationId)
    };
  }

  /**
   * Cancel an operation
   * @param {number} operationId - Operation ID to cancel
   * @returns {Object} Cancellation result with cleanup status
   */
  async cancelOperation(operationId) {
    const operation = this.operations.get(operationId);
    if (!operation) {
      throw ErrorHandler.createError(
        'OPERATION_NOT_FOUND',
        `Operation ${operationId} not found`,
        { operation: 'cancel_operation', parameters: { operationId } },
        ['Check that the operation ID is correct', 'Ensure the operation has not already completed']
      );
    }

    if (operation.status === 'completed' || operation.status === 'failed') {
      return {
        operationId,
        alreadyCompleted: true,
        cleanupPerformed: false,
        statusMessage: `Operation ${operationId} (${operation.name}) was already ${operation.status}`
      };
    }

    // Mark as cancelled
    operation.cancelled = true;
    operation.status = 'cancelling';
    operation.cancelTime = new Date();

    const cleanupResults = [];
    let cleanupSuccess = true;

    // Execute cleanup tasks in reverse order (LIFO)
    for (let i = operation.cleanupTasks.length - 1; i >= 0; i--) {
      const cleanupTask = operation.cleanupTasks[i];
      try {
        await cleanupTask.fn();
        cleanupResults.push({
          description: cleanupTask.description,
          success: true,
          error: null
        });
      } catch (error) {
        cleanupSuccess = false;
        cleanupResults.push({
          description: cleanupTask.description,
          success: false,
          error: error.message
        });
      }
    }

    operation.status = 'cancelled';
    operation.cleanupResults = cleanupResults;

    const result = {
      operationId,
      operationName: operation.name,
      cancelled: true,
      cleanupPerformed: true,
      cleanupSuccess,
      cleanupResults,
      partialState: operation.partialState,
      statusMessage: this._generateCancellationStatusMessage(operation),
      completedTasks: this._getCompletedTasks(operation),
      incompleteTasks: this._getIncompleteTasks(operation)
    };

    this.emit('operationCancelled', result);
    return result;
  }

  /**
   * Get operation status
   * @param {number} operationId - Operation ID
   * @returns {Object} Operation status information
   */
  getOperationStatus(operationId) {
    const operation = this.operations.get(operationId);
    if (!operation) {
      return null;
    }

    return {
      id: operation.id,
      name: operation.name,
      status: operation.status,
      startTime: operation.startTime,
      cancelTime: operation.cancelTime,
      statusMessages: operation.statusMessages,
      partialState: operation.partialState,
      cleanupTasks: operation.cleanupTasks.map(task => task.description)
    };
  }

  /**
   * Execute operation with cancellation support
   * @private
   */
  async _executeOperation(operation, operationFn, cancellationToken) {
    try {
      const result = await operationFn(cancellationToken);
      if (!operation.cancelled) {
        operation.status = 'completed';
        operation.result = result;
      }
      return result;
    } catch (error) {
      if (operation.cancelled) {
        // Operation was cancelled, cleanup should have been performed
        operation.status = 'cancelled';
      } else {
        operation.status = 'failed';
        operation.error = error;
      }
      throw error;
    }
  }

  /**
   * Generate cancellation status message
   * @private
   */
  _generateCancellationStatusMessage(operation) {
    const duration = operation.cancelTime - operation.startTime;
    const durationSeconds = Math.round(duration / 1000);
    
    let message = `Operation "${operation.name}" was cancelled after ${durationSeconds} seconds.\n`;
    
    if (operation.cleanupResults.length > 0) {
      const successfulCleanups = operation.cleanupResults.filter(r => r.success).length;
      const totalCleanups = operation.cleanupResults.length;
      
      message += `Cleanup: ${successfulCleanups}/${totalCleanups} tasks completed successfully.\n`;
      
      if (successfulCleanups < totalCleanups) {
        message += 'Some cleanup tasks failed - manual intervention may be required.\n';
      }
    }

    const completedTasks = this._getCompletedTasks(operation);
    const incompleteTasks = this._getIncompleteTasks(operation);
    
    if (completedTasks.length > 0) {
      message += `Completed: ${completedTasks.join(', ')}\n`;
    }
    
    if (incompleteTasks.length > 0) {
      message += `Not completed: ${incompleteTasks.join(', ')}\n`;
    }

    return message.trim();
  }

  /**
   * Get completed tasks from partial state
   * @private
   */
  _getCompletedTasks(operation) {
    const completed = [];
    for (const [key, value] of Object.entries(operation.partialState)) {
      if (key.startsWith('completed_') && value === true) {
        completed.push(key.replace('completed_', ''));
      }
    }
    return completed;
  }

  /**
   * Get incomplete tasks from partial state
   * @private
   */
  _getIncompleteTasks(operation) {
    const incomplete = [];
    for (const [key, value] of Object.entries(operation.partialState)) {
      if (key.startsWith('planned_') && !operation.partialState[`completed_${value}`]) {
        incomplete.push(value);
      }
    }
    return incomplete;
  }

  /**
   * Clean up completed operations
   * @param {number} maxAge - Maximum age in milliseconds
   */
  cleanupCompletedOperations(maxAge = 3600000) { // 1 hour default
    const now = new Date();
    const toDelete = [];

    for (const [id, operation] of this.operations) {
      if (operation.status === 'completed' || operation.status === 'cancelled' || operation.status === 'failed') {
        const age = now - operation.startTime;
        if (age > maxAge) {
          toDelete.push(id);
        }
      }
    }

    toDelete.forEach(id => this.operations.delete(id));
    return toDelete.length;
  }
}

// Singleton instance
const operationManager = new OperationManager();

module.exports = operationManager;