/**
 * Verbose Logger Module
 * Provides detailed execution traces for debugging purposes
 */

class VerboseLogger {
  constructor(options = {}) {
    this.enabled = options.enabled || false;
    this.logLevel = options.logLevel || 'info';
    this.includeTimestamps = options.includeTimestamps !== false;
    this.includeStackTrace = options.includeStackTrace || false;
    this.maxParameterLength = options.maxParameterLength || 200;
    this.logs = [];
    this.context = {};
  }

  /**
   * Set logging context
   * @param {Object} context - Context information
   */
  setContext(context) {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear logging context
   */
  clearContext() {
    this.context = {};
  }

  /**
   * Log command execution with parameters and results
   * @param {string} command - Command being executed
   * @param {Array} args - Command arguments
   * @param {Object} options - Execution options
   * @param {*} result - Command result
   * @param {number} duration - Execution duration in milliseconds
   */
  logCommandExecution(command, args, options, result, duration) {
    if (!this.enabled) return;

    const logEntry = {
      type: 'command_execution',
      timestamp: new Date().toISOString(),
      command,
      args: this._sanitizeParameters(args),
      options: this._sanitizeParameters(options),
      result: this._sanitizeParameters(result),
      duration,
      context: { ...this.context },
      level: 'info'
    };

    this._addLogEntry(logEntry);
  }

  /**
   * Log function call with parameters and return value
   * @param {string} functionName - Function name
   * @param {Array} parameters - Function parameters
   * @param {*} returnValue - Function return value
   * @param {number} duration - Execution duration in milliseconds
   */
  logFunctionCall(functionName, parameters, returnValue, duration) {
    if (!this.enabled) return;

    const logEntry = {
      type: 'function_call',
      timestamp: new Date().toISOString(),
      functionName,
      parameters: this._sanitizeParameters(parameters),
      returnValue: this._sanitizeParameters(returnValue),
      duration,
      context: { ...this.context },
      level: 'debug'
    };

    this._addLogEntry(logEntry);
  }

  /**
   * Log operation progress with intermediate results
   * @param {string} operation - Operation name
   * @param {string} step - Current step
   * @param {Object} intermediateResults - Intermediate results
   * @param {Object} metadata - Additional metadata
   */
  logOperationProgress(operation, step, intermediateResults, metadata = {}) {
    if (!this.enabled) return;

    const logEntry = {
      type: 'operation_progress',
      timestamp: new Date().toISOString(),
      operation,
      step,
      intermediateResults: this._sanitizeParameters(intermediateResults),
      metadata: this._sanitizeParameters(metadata),
      context: { ...this.context },
      level: 'info'
    };

    this._addLogEntry(logEntry);
  }

  /**
   * Log error with detailed context
   * @param {Error} error - Error object
   * @param {string} operation - Operation that failed
   * @param {Object} parameters - Parameters when error occurred
   * @param {Object} environment - Environment information
   */
  logError(error, operation, parameters, environment) {
    if (!this.enabled) return;

    const logEntry = {
      type: 'error',
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        name: error.name,
        code: error.code,
        stack: this.includeStackTrace ? error.stack : undefined
      },
      operation,
      parameters: this._sanitizeParameters(parameters),
      environment: this._sanitizeParameters(environment),
      context: { ...this.context },
      level: 'error'
    };

    this._addLogEntry(logEntry);
  }

  /**
   * Log state change with before and after values
   * @param {string} component - Component name
   * @param {string} property - Property that changed
   * @param {*} beforeValue - Value before change
   * @param {*} afterValue - Value after change
   * @param {string} reason - Reason for change
   */
  logStateChange(component, property, beforeValue, afterValue, reason) {
    if (!this.enabled) return;

    const logEntry = {
      type: 'state_change',
      timestamp: new Date().toISOString(),
      component,
      property,
      beforeValue: this._sanitizeParameters(beforeValue),
      afterValue: this._sanitizeParameters(afterValue),
      reason,
      context: { ...this.context },
      level: 'debug'
    };

    this._addLogEntry(logEntry);
  }

  /**
   * Log performance metrics
   * @param {string} operation - Operation name
   * @param {Object} metrics - Performance metrics
   */
  logPerformanceMetrics(operation, metrics) {
    if (!this.enabled) return;

    const logEntry = {
      type: 'performance_metrics',
      timestamp: new Date().toISOString(),
      operation,
      metrics: {
        duration: metrics.duration,
        memoryUsage: metrics.memoryUsage,
        cpuUsage: metrics.cpuUsage,
        ...this._sanitizeParameters(metrics)
      },
      context: { ...this.context },
      level: 'info'
    };

    this._addLogEntry(logEntry);
  }

  /**
   * Get all logs
   * @param {Object} filters - Optional filters
   * @returns {Array} Array of log entries
   */
  getLogs(filters = {}) {
    let filteredLogs = [...this.logs];

    if (filters.type) {
      filteredLogs = filteredLogs.filter(log => log.type === filters.type);
    }

    if (filters.level) {
      filteredLogs = filteredLogs.filter(log => log.level === filters.level);
    }

    if (filters.operation) {
      filteredLogs = filteredLogs.filter(log => 
        log.operation === filters.operation || 
        log.functionName === filters.operation ||
        log.command === filters.operation
      );
    }

    if (filters.since) {
      const sinceDate = new Date(filters.since);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= sinceDate);
    }

    return filteredLogs;
  }

  /**
   * Format logs for display
   * @param {Array} logs - Logs to format
   * @param {Object} options - Formatting options
   * @returns {string} Formatted log output
   */
  formatLogs(logs = null, options = {}) {
    const logsToFormat = logs || this.logs;
    const includeContext = options.includeContext !== false;
    const includeParameters = options.includeParameters !== false;

    return logsToFormat.map(log => {
      let formatted = '';
      
      if (this.includeTimestamps) {
        formatted += `[${log.timestamp}] `;
      }
      
      formatted += `${log.level.toUpperCase()}: `;
      
      switch (log.type) {
        case 'command_execution':
          formatted += `COMMAND ${log.command}`;
          if (includeParameters && log.args.length > 0) {
            formatted += ` ${JSON.stringify(log.args)}`;
          }
          formatted += ` (${log.duration}ms)`;
          if (includeParameters && log.result !== undefined) {
            formatted += ` -> ${JSON.stringify(log.result)}`;
          }
          break;
          
        case 'function_call':
          formatted += `FUNCTION ${log.functionName}`;
          if (includeParameters && log.parameters.length > 0) {
            formatted += `(${JSON.stringify(log.parameters)})`;
          }
          formatted += ` (${log.duration}ms)`;
          if (includeParameters && log.returnValue !== undefined) {
            formatted += ` -> ${JSON.stringify(log.returnValue)}`;
          }
          break;
          
        case 'operation_progress':
          formatted += `PROGRESS ${log.operation}: ${log.step}`;
          if (includeParameters && Object.keys(log.intermediateResults).length > 0) {
            formatted += ` ${JSON.stringify(log.intermediateResults)}`;
          }
          break;
          
        case 'error':
          formatted += `ERROR in ${log.operation}: ${log.error.message}`;
          if (log.error.code) {
            formatted += ` (${log.error.code})`;
          }
          break;
          
        case 'state_change':
          formatted += `STATE ${log.component}.${log.property}: ${JSON.stringify(log.beforeValue)} -> ${JSON.stringify(log.afterValue)}`;
          if (log.reason) {
            formatted += ` (${log.reason})`;
          }
          break;
          
        case 'performance_metrics':
          formatted += `PERF ${log.operation}: ${log.metrics.duration}ms`;
          if (log.metrics.memoryUsage) {
            formatted += `, mem: ${log.metrics.memoryUsage}MB`;
          }
          break;
          
        default:
          formatted += `${log.type.toUpperCase()}: ${JSON.stringify(log)}`;
      }
      
      if (includeContext && Object.keys(log.context).length > 0) {
        formatted += ` [${JSON.stringify(log.context)}]`;
      }
      
      return formatted;
    }).join('\n');
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Enable verbose logging
   */
  enable() {
    this.enabled = true;
  }

  /**
   * Disable verbose logging
   */
  disable() {
    this.enabled = false;
  }

  /**
   * Add log entry to internal storage
   * @private
   */
  _addLogEntry(logEntry) {
    this.logs.push(logEntry);
    
    // Emit to console if needed (for real-time debugging)
    if (process.env.VERBOSE_LOGGING === 'console') {
      console.log(this.formatLogs([logEntry]));
    }
  }

  /**
   * Sanitize parameters for logging (prevent circular references, limit size)
   * @private
   */
  _sanitizeParameters(params) {
    if (params === null || params === undefined) {
      return params;
    }

    try {
      const stringified = JSON.stringify(params, (key, value) => {
        // Handle circular references
        if (typeof value === 'object' && value !== null) {
          if (this._seen && this._seen.has(value)) {
            return '[Circular]';
          }
          if (!this._seen) this._seen = new WeakSet();
          this._seen.add(value);
        }
        return value;
      });

      // Clear the seen set for next use
      this._seen = null;

      // Limit parameter length
      if (stringified.length > this.maxParameterLength) {
        return stringified.substring(0, this.maxParameterLength) + '...[truncated]';
      }

      return JSON.parse(stringified);
    } catch (error) {
      return '[Unserializable]';
    }
  }
}

module.exports = VerboseLogger;