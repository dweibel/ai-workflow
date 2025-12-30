/**
 * Shared Error Handler Module
 * Provides structured error handling for JavaScript skill implementations
 */

/**
 * Error information structure following the design specification
 * @typedef {Object} ErrorInformation
 * @property {string} code - Error code for programmatic handling
 * @property {string} message - Human-readable error message
 * @property {string} [command] - Command that caused the error
 * @property {number} [exitCode] - Process exit code if applicable
 * @property {Object} context - Context information
 * @property {string} context.operation - Operation being performed
 * @property {Object} context.parameters - Parameters passed to operation
 * @property {Object} context.environment - Relevant environment information
 * @property {string[]} suggestions - Suggested remediation steps
 * @property {string} [documentation] - Link to relevant documentation
 */

class ErrorHandler {
  /**
   * Handle git command errors with structured information
   * @param {Error} error - The original error
   * @param {string} command - Git command that failed
   * @param {Object} context - Additional context
   * @returns {ErrorInformation} Structured error information
   */
  static handleGitError(error, command, context = {}) {
    const errorInfo = {
      code: 'GIT_COMMAND_FAILED',
      message: `Git command failed: ${command}`,
      command,
      exitCode: error.code || error.status,
      context: {
        operation: context.operation || 'git_operation',
        parameters: context.parameters || {},
        environment: {
          cwd: process.cwd(),
          platform: process.platform,
          nodeVersion: process.version
        }
      },
      suggestions: [],
      documentation: 'https://git-scm.com/docs'
    };

    // Add specific suggestions based on common git errors
    if (error.message.includes('not a git repository')) {
      errorInfo.suggestions.push('Ensure you are in a git repository directory');
      errorInfo.suggestions.push('Run "git init" to initialize a new repository');
    } else if (error.message.includes('branch already exists')) {
      errorInfo.suggestions.push('Use a different branch name');
      errorInfo.suggestions.push('Delete the existing branch if no longer needed');
    } else if (error.message.includes('permission denied')) {
      errorInfo.suggestions.push('Check file permissions');
      errorInfo.suggestions.push('Ensure you have write access to the repository');
    } else {
      errorInfo.suggestions.push('Check git command syntax');
      errorInfo.suggestions.push('Verify repository state');
    }

    return errorInfo;
  }

  /**
   * Handle file system operation errors
   * @param {Error} error - The original error
   * @param {string} operation - File operation that failed
   * @param {string} path - File path involved
   * @returns {ErrorInformation} Structured error information
   */
  static handleFileSystemError(error, operation, path) {
    const errorInfo = {
      code: 'FILESYSTEM_ERROR',
      message: `File system operation failed: ${operation} on ${path}`,
      context: {
        operation,
        parameters: { path },
        environment: {
          cwd: process.cwd(),
          platform: process.platform
        }
      },
      suggestions: [],
      documentation: 'https://nodejs.org/api/fs.html'
    };

    // Add specific suggestions based on error type
    if (error.code === 'ENOENT') {
      errorInfo.suggestions.push('Verify the file or directory exists');
      errorInfo.suggestions.push('Check the path spelling');
    } else if (error.code === 'EACCES') {
      errorInfo.suggestions.push('Check file permissions');
      errorInfo.suggestions.push('Run with appropriate privileges if needed');
    } else if (error.code === 'EEXIST') {
      errorInfo.suggestions.push('File or directory already exists');
      errorInfo.suggestions.push('Use a different name or remove existing file');
    } else {
      errorInfo.suggestions.push('Check file system permissions');
      errorInfo.suggestions.push('Verify disk space availability');
    }

    return errorInfo;
  }

  /**
   * Handle user input validation errors
   * @param {Error} error - The original error
   * @param {string} input - Invalid input provided
   * @param {string} expected - Expected input format
   * @returns {ErrorInformation} Structured error information
   */
  static handleUserInputError(error, input, expected) {
    return {
      code: 'INVALID_INPUT',
      message: `Invalid input provided: ${input}`,
      context: {
        operation: 'input_validation',
        parameters: { input, expected },
        environment: {
          platform: process.platform
        }
      },
      suggestions: [
        `Expected format: ${expected}`,
        'Check command syntax and try again',
        'Use --help for usage examples'
      ],
      documentation: 'See help documentation for correct usage'
    };
  }

  /**
   * Format error message for display to user
   * @param {ErrorInformation} errorInfo - Structured error information
   * @param {string[]} additionalSuggestions - Additional suggestions
   * @returns {string} Formatted error message
   */
  static formatErrorMessage(errorInfo, additionalSuggestions = []) {
    let message = `\n❌ Error: ${errorInfo.message}\n`;
    
    if (errorInfo.command) {
      message += `   Command: ${errorInfo.command}\n`;
    }
    
    if (errorInfo.exitCode) {
      message += `   Exit Code: ${errorInfo.exitCode}\n`;
    }

    const allSuggestions = [...errorInfo.suggestions, ...additionalSuggestions];
    if (allSuggestions.length > 0) {
      message += '\n💡 Suggestions:\n';
      allSuggestions.forEach(suggestion => {
        message += `   • ${suggestion}\n`;
      });
    }

    if (errorInfo.documentation) {
      message += `\n📚 Documentation: ${errorInfo.documentation}\n`;
    }

    return message;
  }

  /**
   * Create a generic error with structured information
   * @param {string} code - Error code
   * @param {string} message - Error message
   * @param {Object} context - Error context
   * @param {string[]} suggestions - Remediation suggestions
   * @returns {ErrorInformation} Structured error information
   */
  static createError(code, message, context = {}, suggestions = []) {
    return {
      code,
      message,
      context: {
        operation: context.operation || 'unknown',
        parameters: context.parameters || {},
        environment: {
          cwd: process.cwd(),
          platform: process.platform,
          nodeVersion: process.version,
          ...context.environment
        }
      },
      suggestions,
      documentation: context.documentation
    };
  }
}

module.exports = ErrorHandler;