/**
 * Enhanced Error Handling and User Experience Module
 * Integrates structured error handling, input validation, operation cancellation, and verbose logging
 */

const ErrorHandler = require('./error-handler');
const InputValidator = require('./input-validator');
const operationManager = require('./operation-manager');
const VerboseLogger = require('./verbose-logger');

class EnhancedErrorHandling {
  constructor(options = {}) {
    this.logger = new VerboseLogger({
      enabled: options.verboseLogging || false,
      includeTimestamps: true,
      includeStackTrace: options.includeStackTrace || false,
      maxParameterLength: options.maxParameterLength || 200
    });
    
    this.validationEnabled = options.validationEnabled !== false;
    this.cancellationEnabled = options.cancellationEnabled !== false;
    
    // Set up global context
    this.logger.setContext({
      module: 'enhanced-error-handling',
      version: '1.0.0',
      platform: process.platform,
      nodeVersion: process.version
    });
  }

  /**
   * Execute operation with comprehensive error handling
   * @param {string} operationName - Name of the operation
   * @param {Function} operationFn - Function to execute
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} Operation result with enhanced error handling
   */
  async executeOperation(operationName, operationFn, options = {}) {
    const startTime = Date.now();
    
    try {
      this.logger.logOperationProgress(operationName, 'starting', {}, {
        options: this.logger._sanitizeParameters(options)
      });

      // Validate inputs if validation is enabled
      if (this.validationEnabled && options.validation) {
        const validationResult = this._validateInputs(options.validation);
        if (!validationResult.isValid) {
          const validationError = InputValidator.createValidationError(
            validationResult,
            operationName,
            options.validation.input
          );
          
          this.logger.logError(validationError, operationName, options.validation, {});
          
          return {
            success: false,
            error: validationError,
            validationFeedback: InputValidator.formatValidationFeedback(validationResult),
            duration: Date.now() - startTime
          };
        }
      }

      let result;
      
      if (this.cancellationEnabled && options.cancellable) {
        // Execute with cancellation support
        const operation = operationManager.startOperation(
          operationName,
          operationFn,
          options
        );
        
        result = await operation.promise;
        
        this.logger.logOperationProgress(operationName, 'completed', { result }, {});
      } else {
        // Execute directly
        result = await operationFn();
        this.logger.logOperationProgress(operationName, 'completed', { result }, {});
      }

      const duration = Date.now() - startTime;
      this.logger.logPerformanceMetrics(operationName, {
        duration,
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024
      });

      return {
        success: true,
        result,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Handle different types of errors
      let structuredError;
      
      if (error.code === 'VALIDATION_ERROR') {
        structuredError = error;
      } else if (error.message && error.message.includes('git')) {
        structuredError = ErrorHandler.handleGitError(error, 'unknown', {
          operation: operationName,
          parameters: options
        });
      } else if (error.code && ['ENOENT', 'EACCES', 'EEXIST'].includes(error.code)) {
        structuredError = ErrorHandler.handleFileSystemError(error, operationName, error.path || 'unknown');
      } else {
        structuredError = ErrorHandler.createError(
          'OPERATION_ERROR',
          `Operation failed: ${error.message}`,
          {
            operation: operationName,
            parameters: options,
            originalError: {
              name: error.name,
              message: error.message,
              code: error.code,
              stack: error.stack
            }
          },
          [
            'Check the operation parameters',
            'Verify system requirements',
            'Enable verbose logging for more details'
          ]
        );
      }

      this.logger.logError(error, operationName, options, {
        duration,
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024
      });

      return {
        success: false,
        error: structuredError,
        errorMessage: ErrorHandler.formatErrorMessage(structuredError),
        duration
      };
    }
  }

  /**
   * Validate command arguments with immediate feedback
   * @param {string[]} args - Command arguments
   * @param {Object} schema - Validation schema
   * @returns {Object} Validation result with feedback
   */
  validateCommandArgs(args, schema) {
    this.logger.logFunctionCall('validateCommandArgs', [args, schema], null, 0);
    
    const result = InputValidator.validateCommandArgs(args, schema);
    
    this.logger.logFunctionCall('validateCommandArgs', [args, schema], result, 0);
    
    if (!result.isValid) {
      const feedback = InputValidator.formatValidationFeedback(result);
      console.error(feedback);
    }
    
    return result;
  }

  /**
   * Validate branch name with immediate feedback
   * @param {string} branchName - Branch name to validate
   * @returns {Object} Validation result with feedback
   */
  validateBranchName(branchName) {
    this.logger.logFunctionCall('validateBranchName', [branchName], null, 0);
    
    const result = InputValidator.validateBranchName(branchName);
    
    this.logger.logFunctionCall('validateBranchName', [branchName], result, 0);
    
    if (!result.isValid) {
      const feedback = InputValidator.formatValidationFeedback(result);
      console.error(feedback);
    }
    
    return result;
  }

  /**
   * Validate file path with immediate feedback
   * @param {string} filePath - File path to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation result with feedback
   */
  validateFilePath(filePath, options = {}) {
    this.logger.logFunctionCall('validateFilePath', [filePath, options], null, 0);
    
    const result = InputValidator.validateFilePath(filePath, options);
    
    this.logger.logFunctionCall('validateFilePath', [filePath, options], result, 0);
    
    if (!result.isValid) {
      const feedback = InputValidator.formatValidationFeedback(result);
      console.error(feedback);
    }
    
    return result;
  }

  /**
   * Cancel operation with cleanup
   * @param {number} operationId - Operation ID to cancel
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelOperation(operationId) {
    this.logger.logFunctionCall('cancelOperation', [operationId], null, 0);
    
    try {
      const result = await operationManager.cancelOperation(operationId);
      
      this.logger.logFunctionCall('cancelOperation', [operationId], result, 0);
      
      // Display cancellation status to user
      console.log('\n🚫 Operation Cancelled');
      console.log(result.statusMessage);
      
      if (result.cleanupResults && result.cleanupResults.length > 0) {
        console.log('\n🧹 Cleanup Results:');
        result.cleanupResults.forEach(cleanup => {
          const status = cleanup.success ? '✅' : '❌';
          console.log(`   ${status} ${cleanup.description}`);
          if (!cleanup.success && cleanup.error) {
            console.log(`      Error: ${cleanup.error}`);
          }
        });
      }
      
      return result;
    } catch (error) {
      const structuredError = ErrorHandler.createError(
        'CANCELLATION_ERROR',
        `Failed to cancel operation: ${error.message}`,
        { operation: 'cancel_operation', parameters: { operationId } },
        ['Verify the operation ID is correct', 'Check if the operation is still running']
      );
      
      this.logger.logError(error, 'cancelOperation', { operationId }, {});
      
      console.error(ErrorHandler.formatErrorMessage(structuredError));
      throw structuredError;
    }
  }

  /**
   * Get operation status with detailed information
   * @param {number} operationId - Operation ID
   * @returns {Object} Operation status
   */
  getOperationStatus(operationId) {
    const status = operationManager.getOperationStatus(operationId);
    
    this.logger.logFunctionCall('getOperationStatus', [operationId], status, 0);
    
    return status;
  }

  /**
   * Enable verbose logging
   */
  enableVerboseLogging() {
    this.logger.enable();
    this.logger.logStateChange('enhanced-error-handling', 'verboseLogging', false, true, 'user request');
  }

  /**
   * Disable verbose logging
   */
  disableVerboseLogging() {
    this.logger.logStateChange('enhanced-error-handling', 'verboseLogging', true, false, 'user request');
    this.logger.disable();
  }

  /**
   * Get execution traces for debugging
   * @param {Object} filters - Log filters
   * @returns {string} Formatted execution traces
   */
  getExecutionTraces(filters = {}) {
    const logs = this.logger.getLogs(filters);
    return this.logger.formatLogs(logs, {
      includeContext: true,
      includeParameters: true
    });
  }

  /**
   * Clear all logs and reset state
   */
  clearLogs() {
    this.logger.clearLogs();
    operationManager.cleanupCompletedOperations(0);
  }

  /**
   * Validate inputs based on validation configuration
   * @private
   */
  _validateInputs(validation) {
    if (validation.type === 'branchName') {
      return InputValidator.validateBranchName(validation.input);
    } else if (validation.type === 'filePath') {
      return InputValidator.validateFilePath(validation.input, validation.options);
    } else if (validation.type === 'commandArgs') {
      return InputValidator.validateCommandArgs(validation.input, validation.schema);
    } else {
      return { isValid: true, errors: [], suggestions: [], examples: [] };
    }
  }
}

module.exports = EnhancedErrorHandling;