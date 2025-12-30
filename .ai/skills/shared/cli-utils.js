/**
 * Shared CLI Utilities Module
 * Provides common CLI functionality for JavaScript skill implementations
 */

const ErrorHandler = require('./error-handler');

class CLIUtils {
  /**
   * Parse command line arguments into structured format
   * @param {string[]} argv - Command line arguments
   * @returns {Object} Parsed arguments
   */
  static parseArguments(argv) {
    const args = argv.slice(2); // Remove node and script path
    const parsed = {
      command: null,
      subcommand: null,
      options: {},
      flags: new Set(),
      positional: []
    };

    let i = 0;
    while (i < args.length) {
      const arg = args[i];

      if (arg.startsWith('--')) {
        // Long option
        const [key, value] = arg.substring(2).split('=');
        if (value !== undefined) {
          parsed.options[key] = value;
        } else if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
          parsed.options[key] = args[i + 1];
          i++;
        } else {
          parsed.flags.add(key);
        }
      } else if (arg.startsWith('-') && arg.length > 1) {
        // Short option(s)
        const flags = arg.substring(1);
        for (const flag of flags) {
          parsed.flags.add(flag);
        }
      } else {
        // Positional argument
        if (!parsed.command) {
          parsed.command = arg;
        } else if (!parsed.subcommand) {
          parsed.subcommand = arg;
        } else {
          parsed.positional.push(arg);
        }
      }
      i++;
    }

    return parsed;
  }

  /**
   * Format output in table format
   * @param {Array<Object>} data - Data to format
   * @param {string[]} columns - Column names
   * @param {Object} options - Formatting options
   * @returns {string} Formatted table
   */
  static formatTable(data, columns, options = {}) {
    const { 
      padding = 2, 
      maxWidth = process.stdout.columns || 80,
      colors = true 
    } = options;

    if (!data || data.length === 0) {
      return 'No data to display';
    }

    // Calculate column widths
    const widths = {};
    columns.forEach(col => {
      widths[col] = Math.max(
        col.length,
        ...data.map(row => String(row[col] || '').length)
      );
    });

    // Create header
    const header = columns.map(col => 
      col.padEnd(widths[col])
    ).join(' '.repeat(padding));

    const separator = columns.map(col => 
      '-'.repeat(widths[col])
    ).join(' '.repeat(padding));

    // Create rows
    const rows = data.map(row => 
      columns.map(col => 
        String(row[col] || '').padEnd(widths[col])
      ).join(' '.repeat(padding))
    );

    return [header, separator, ...rows].join('\n');
  }

  /**
   * Display help information
   * @param {Object} helpConfig - Help configuration
   * @param {string} helpConfig.name - Command name
   * @param {string} helpConfig.description - Command description
   * @param {Array} helpConfig.commands - Available commands
   * @param {Array} helpConfig.options - Available options
   * @param {Array} helpConfig.examples - Usage examples
   * @returns {string} Formatted help text
   */
  static displayHelp(helpConfig) {
    const { name, description, commands = [], options = [], examples = [] } = helpConfig;
    
    let help = `\n${name}\n`;
    help += '='.repeat(name.length) + '\n\n';
    
    if (description) {
      help += `${description}\n\n`;
    }

    if (commands.length > 0) {
      help += 'COMMANDS:\n';
      commands.forEach(cmd => {
        help += `  ${cmd.name.padEnd(15)} ${cmd.description}\n`;
      });
      help += '\n';
    }

    if (options.length > 0) {
      help += 'OPTIONS:\n';
      options.forEach(opt => {
        const optStr = opt.short ? `-${opt.short}, --${opt.long}` : `--${opt.long}`;
        help += `  ${optStr.padEnd(20)} ${opt.description}\n`;
      });
      help += '\n';
    }

    if (examples.length > 0) {
      help += 'EXAMPLES:\n';
      examples.forEach(example => {
        help += `  ${example.command}\n`;
        if (example.description) {
          help += `    ${example.description}\n`;
        }
        help += '\n';
      });
    }

    return help;
  }

  /**
   * Prompt user for input with validation
   * @param {string} message - Prompt message
   * @param {Object} options - Prompt options
   * @param {string[]} options.choices - Valid choices
   * @param {boolean} options.required - Input is required
   * @param {string} options.defaultValue - Default value
   * @returns {Promise<string>} User input
   */
  static async promptUser(message, options = {}) {
    const { choices = [], required = false, defaultValue = null } = options;
    
    return new Promise((resolve, reject) => {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      let promptText = message;
      if (choices.length > 0) {
        promptText += ` (${choices.join('/')})`;
      }
      if (defaultValue) {
        promptText += ` [${defaultValue}]`;
      }
      promptText += ': ';

      rl.question(promptText, (answer) => {
        rl.close();
        
        const input = answer.trim() || defaultValue;
        
        if (required && !input) {
          reject(ErrorHandler.handleUserInputError(
            new Error('Input required'),
            answer,
            'non-empty string'
          ));
          return;
        }
        
        if (choices.length > 0 && input && !choices.includes(input)) {
          reject(ErrorHandler.handleUserInputError(
            new Error('Invalid choice'),
            input,
            choices.join(' | ')
          ));
          return;
        }
        
        resolve(input);
      });
    });
  }

  /**
   * Add colors to text for terminal output
   * @param {string} text - Text to colorize
   * @param {string} color - Color name
   * @returns {string} Colorized text
   */
  static colorize(text, color) {
    const colors = {
      reset: '\x1b[0m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m',
      gray: '\x1b[90m'
    };

    if (!colors[color] || !process.stdout.isTTY) {
      return text;
    }

    return `${colors[color]}${text}${colors.reset}`;
  }

  /**
   * Display progress indicator
   * @param {number} current - Current progress
   * @param {number} total - Total items
   * @param {string} message - Progress message
   * @returns {string} Progress bar string
   */
  static formatProgress(current, total, message = '') {
    const percentage = Math.round((current / total) * 100);
    const barLength = 30;
    const filledLength = Math.round((barLength * current) / total);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    
    return `${message} [${bar}] ${percentage}% (${current}/${total})`;
  }

  /**
   * Validate command arguments against schema
   * @param {Object} args - Parsed arguments
   * @param {Object} schema - Validation schema
   * @returns {boolean} True if valid
   */
  static validateArguments(args, schema) {
    const errors = [];

    // Validate required commands
    if (schema.requiredCommand && !args.command) {
      errors.push('Command is required');
    }

    // Validate command is in allowed list
    if (schema.allowedCommands && args.command && !schema.allowedCommands.includes(args.command)) {
      errors.push(`Invalid command: ${args.command}. Allowed: ${schema.allowedCommands.join(', ')}`);
    }

    // Validate required options
    if (schema.requiredOptions) {
      schema.requiredOptions.forEach(option => {
        if (!args.options[option]) {
          errors.push(`Required option missing: --${option}`);
        }
      });
    }

    // Validate positional arguments
    if (schema.minPositional && args.positional.length < schema.minPositional) {
      errors.push(`At least ${schema.minPositional} arguments required`);
    }

    if (schema.maxPositional && args.positional.length > schema.maxPositional) {
      errors.push(`At most ${schema.maxPositional} arguments allowed`);
    }

    if (errors.length > 0) {
      throw ErrorHandler.createError(
        'INVALID_ARGUMENTS',
        'Command line arguments validation failed',
        { operation: 'validate_arguments', parameters: { args, schema } },
        errors
      );
    }

    return true;
  }
}

module.exports = CLIUtils;