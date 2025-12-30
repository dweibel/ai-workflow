/**
 * Input Validation Module
 * Provides immediate validation feedback with usage examples
 */

const ErrorHandler = require('./error-handler');

class InputValidator {
  /**
   * Validate branch name input
   * @param {string} branchName - Branch name to validate
   * @returns {Object} Validation result with feedback
   */
  static validateBranchName(branchName) {
    const result = {
      isValid: true,
      errors: [],
      suggestions: [],
      examples: []
    };

    if (!branchName || typeof branchName !== 'string') {
      result.isValid = false;
      result.errors.push('Branch name is required');
      result.suggestions.push('Provide a valid branch name');
      result.examples.push('feature/user-authentication', 'bugfix/login-error', 'refactor/api-cleanup');
      return result;
    }

    // Check for invalid characters
    if (!/^[a-zA-Z0-9/_-]+$/.test(branchName)) {
      result.isValid = false;
      result.errors.push('Branch name contains invalid characters');
      result.suggestions.push('Use only letters, numbers, hyphens, underscores, and forward slashes');
      result.examples.push('feature/new-feature', 'bugfix/fix-123', 'refactor/cleanup');
    }

    // Check for leading/trailing separators
    if (/^[/_-]|[/_-]$/.test(branchName)) {
      result.isValid = false;
      result.errors.push('Branch name cannot start or end with separators');
      result.suggestions.push('Remove leading or trailing hyphens, underscores, or slashes');
      result.examples.push('feature/new-feature', 'bugfix/fix-issue');
    }

    // Check length
    if (branchName.length > 100) {
      result.isValid = false;
      result.errors.push('Branch name is too long (maximum 100 characters)');
      result.suggestions.push('Use a shorter, more concise branch name');
      result.examples.push('feature/short-name', 'fix/issue-123');
    }

    // Check for recommended prefixes
    const recommendedPrefixes = ['feature/', 'bugfix/', 'hotfix/', 'refactor/', 'docs/', 'test/'];
    const hasRecommendedPrefix = recommendedPrefixes.some(prefix => branchName.startsWith(prefix));
    
    if (!hasRecommendedPrefix && result.isValid) {
      result.suggestions.push('Consider using a standard prefix for better organization');
      result.examples.push(...recommendedPrefixes.map(prefix => `${prefix}your-branch-name`));
    }

    return result;
  }

  /**
   * Validate file path input
   * @param {string} filePath - File path to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation result with feedback
   */
  static validateFilePath(filePath, options = {}) {
    const result = {
      isValid: true,
      errors: [],
      suggestions: [],
      examples: []
    };

    if (!filePath || typeof filePath !== 'string') {
      result.isValid = false;
      result.errors.push('File path is required');
      result.suggestions.push('Provide a valid file path');
      result.examples.push('./src/components/Button.js', '../docs/README.md', '/home/user/project');
      return result;
    }

    // Check for invalid characters (Windows and Unix)
    const invalidChars = /[<>:"|?*\x00-\x1f]/;
    if (invalidChars.test(filePath)) {
      result.isValid = false;
      result.errors.push('File path contains invalid characters');
      result.suggestions.push('Remove characters like <, >, :, ", |, ?, *, and control characters');
      result.examples.push('./src/file.js', '../docs/readme.md', '/path/to/file');
    }

    // Check for reserved names (Windows)
    const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
    const pathParts = filePath.split(/[/\\]/);
    const hasReservedName = pathParts.some(part => {
      const baseName = part.split('.')[0].toUpperCase();
      return reservedNames.includes(baseName);
    });

    if (hasReservedName) {
      result.isValid = false;
      result.errors.push('File path contains reserved system names');
      result.suggestions.push('Avoid using reserved names like CON, PRN, AUX, NUL, COM1-9, LPT1-9');
      result.examples.push('./src/console.js', '../docs/printer.md', '/path/to/auxiliary.txt');
    }

    // Check length
    if (filePath.length > 260 && process.platform === 'win32') {
      result.isValid = false;
      result.errors.push('File path is too long for Windows (maximum 260 characters)');
      result.suggestions.push('Use a shorter path or enable long path support');
      result.examples.push('./short/path.js', '../docs/file.md');
    }

    return result;
  }

  /**
   * Validate command arguments
   * @param {string[]} args - Command arguments to validate
   * @param {Object} schema - Expected argument schema
   * @returns {Object} Validation result with feedback
   */
  static validateCommandArgs(args, schema) {
    const result = {
      isValid: true,
      errors: [],
      suggestions: [],
      examples: []
    };

    if (!Array.isArray(args)) {
      result.isValid = false;
      result.errors.push('Arguments must be an array');
      result.suggestions.push('Provide arguments as an array of strings');
      result.examples.push(['create', 'feature/new-branch'], ['list'], ['remove', 'old-branch']);
      return result;
    }

    // Check minimum arguments
    if (schema.minArgs && args.length < schema.minArgs) {
      result.isValid = false;
      result.errors.push(`Insufficient arguments (minimum ${schema.minArgs} required)`);
      result.suggestions.push(`Provide at least ${schema.minArgs} arguments`);
      if (schema.examples) {
        result.examples.push(...schema.examples);
      }
    }

    // Check maximum arguments
    if (schema.maxArgs && args.length > schema.maxArgs) {
      result.isValid = false;
      result.errors.push(`Too many arguments (maximum ${schema.maxArgs} allowed)`);
      result.suggestions.push(`Provide at most ${schema.maxArgs} arguments`);
      if (schema.examples) {
        result.examples.push(...schema.examples);
      }
    }

    // Validate specific argument positions
    if (schema.positions) {
      schema.positions.forEach((position, index) => {
        if (args[index] !== undefined) {
          const argResult = this.validateArgument(args[index], position);
          if (!argResult.isValid) {
            result.isValid = false;
            result.errors.push(`Argument ${index + 1}: ${argResult.errors.join(', ')}`);
            result.suggestions.push(...argResult.suggestions);
            result.examples.push(...argResult.examples);
          }
        }
      });
    }

    return result;
  }

  /**
   * Validate individual argument
   * @param {string} arg - Argument to validate
   * @param {Object} schema - Argument schema
   * @returns {Object} Validation result
   */
  static validateArgument(arg, schema) {
    const result = {
      isValid: true,
      errors: [],
      suggestions: [],
      examples: []
    };

    // Check type
    if (schema.type === 'string' && typeof arg !== 'string') {
      result.isValid = false;
      result.errors.push('Must be a string');
      result.suggestions.push('Provide a text value');
    }

    // Check allowed values
    if (schema.allowedValues && !schema.allowedValues.includes(arg)) {
      result.isValid = false;
      result.errors.push(`Must be one of: ${schema.allowedValues.join(', ')}`);
      result.suggestions.push(`Use one of the allowed values: ${schema.allowedValues.join(', ')}`);
      result.examples.push(...schema.allowedValues);
    }

    // Check pattern
    if (schema.pattern && !schema.pattern.test(arg)) {
      result.isValid = false;
      result.errors.push('Does not match required pattern');
      result.suggestions.push(schema.patternDescription || 'Check the format requirements');
      if (schema.examples) {
        result.examples.push(...schema.examples);
      }
    }

    return result;
  }

  /**
   * Create structured error from validation result
   * @param {Object} validationResult - Result from validation
   * @param {string} operation - Operation being performed
   * @param {*} input - Original input that failed validation
   * @returns {ErrorInformation} Structured error information
   */
  static createValidationError(validationResult, operation, input) {
    const suggestions = [
      ...validationResult.suggestions,
      ...(validationResult.examples.length > 0 ? [`Examples: ${validationResult.examples.join(', ')}`] : [])
    ];

    return ErrorHandler.createError(
      'VALIDATION_ERROR',
      `Input validation failed: ${validationResult.errors.join('; ')}`,
      {
        operation,
        parameters: { input, errors: validationResult.errors }
      },
      suggestions
    );
  }

  /**
   * Format validation feedback for immediate display
   * @param {Object} validationResult - Result from validation
   * @returns {string} Formatted feedback message
   */
  static formatValidationFeedback(validationResult) {
    if (validationResult.isValid) {
      return '✅ Input is valid';
    }

    let feedback = '❌ Validation failed:\n';
    
    validationResult.errors.forEach(error => {
      feedback += `   • ${error}\n`;
    });

    if (validationResult.suggestions.length > 0) {
      feedback += '\n💡 Suggestions:\n';
      validationResult.suggestions.forEach(suggestion => {
        feedback += `   • ${suggestion}\n`;
      });
    }

    if (validationResult.examples.length > 0) {
      feedback += '\n📝 Examples:\n';
      validationResult.examples.forEach(example => {
        feedback += `   • ${example}\n`;
      });
    }

    return feedback;
  }
}

module.exports = InputValidator;