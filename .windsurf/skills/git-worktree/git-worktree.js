#!/usr/bin/env node
/**
 * Git Worktree CLI Interface
 * Cross-platform JavaScript implementation of git worktree management
 * Implements Requirements 2.2, 2.5, 8.1, 8.2, 8.5
 */

const WorktreeManager = require('./lib/worktree-manager');
const CLIInterface = require('./lib/cli-interface');
const CLIUtils = require('../shared/cli-utils');
const ErrorHandler = require('../shared/error-handler');
const path = require('path');
const fs = require('fs').promises;

/**
 * CLI Interface class for Git Worktree operations
 * Provides behavioral equivalence with bash scripts while adding modern CLI features
 */
class GitWorktreeCLI {
  constructor() {
    this.worktreeManager = new WorktreeManager();
    this.cliInterface = new CLIInterface();
    this.commands = {
      create: this.createCommand.bind(this),
      list: this.listCommand.bind(this),
      remove: this.removeCommand.bind(this),
      cleanup: this.cleanupCommand.bind(this),
      status: this.statusCommand.bind(this)
    };
  }

  /**
   * Main entry point for CLI execution
   * @param {string[]} argv - Command line arguments
   */
  async run(argv = process.argv) {
    try {
      // Parse arguments with configuration support
      const parsedArgs = await this.cliInterface.parseArgumentsWithConfig(argv);
      const { config } = parsedArgs;
      
      // Apply configuration to worktree manager
      this.worktreeManager.updateConfiguration(config);
      
      // Handle help requests
      if (parsedArgs.flags.has('help') || parsedArgs.flags.has('h') || parsedArgs.command === 'help') {
        this.displayHelp(parsedArgs.subcommand, config);
        return;
      }

      // Handle version requests
      if (parsedArgs.flags.has('version') || parsedArgs.flags.has('v')) {
        this.displayVersion();
        return;
      }

      // Handle completion generation
      if (parsedArgs.flags.has('completion')) {
        const shell = parsedArgs.options.shell || 'bash';
        const commands = Object.keys(this.commands);
        const completion = this.cliInterface.generateCompletion(shell, commands);
        console.log(completion);
        return;
      }

      // Handle interactive mode
      if (parsedArgs.flags.has('interactive') || parsedArgs.flags.has('i')) {
        await this.runInteractiveMode(config);
        return;
      }

      // Execute command
      if (!parsedArgs.command) {
        // No command provided - show interactive menu
        await this.runInteractiveMode(config);
        return;
      }

      const command = this.commands[parsedArgs.command];
      if (!command) {
        throw ErrorHandler.createError(
          'INVALID_COMMAND',
          `Unknown command: ${parsedArgs.command}`,
          { operation: 'parse_command', parameters: { command: parsedArgs.command } },
          [`Available commands: ${Object.keys(this.commands).join(', ')}`, 'Use --help for more information']
        );
      }

      await command(parsedArgs);
    } catch (error) {
      this.handleError(error);
      process.exit(1);
    }
  }

  /**
   * Run interactive mode with enhanced menu system
   * @param {Object} config - Current configuration
   */
  async runInteractiveMode(config) {
    console.log(CLIUtils.colorize('\n🌿 Git Worktree Manager', 'cyan'));
    console.log(CLIUtils.colorize('Interactive Mode', 'gray'));
    
    while (true) {
      try {
        const choice = await this.cliInterface.displayMenu(
          'What would you like to do?',
          [
            { text: 'Create new worktree', value: 'create', icon: '➕', description: 'Create a new worktree for a branch' },
            { text: 'List worktrees', value: 'list', icon: '📋', description: 'Show all existing worktrees' },
            { text: 'Remove worktree', value: 'remove', icon: '🗑️', description: 'Remove a worktree and optionally delete branch' },
            { text: 'Cleanup stale worktrees', value: 'cleanup', icon: '🧹', description: 'Clean up stale worktree references' },
            { text: 'Show status', value: 'status', icon: '📊', description: 'Display detailed worktree status' },
            { text: 'Configuration', value: 'config', icon: '⚙️', description: 'View or modify configuration' },
            { text: 'Exit', value: 'exit', icon: '🚪', description: 'Exit interactive mode' }
          ],
          {
            numbered: true,
            colors: config.display.colorOutput,
            icons: true,
            allowCancel: false
          }
        );

        if (choice === 'exit') {
          console.log(CLIUtils.colorize('Goodbye! 👋', 'green'));
          break;
        }

        if (choice === 'config') {
          await this.showConfigurationMenu(config);
          continue;
        }

        // Execute the selected command
        const command = this.commands[choice];
        if (command) {
          // Create mock args for the command
          const mockArgs = {
            command: choice,
            positional: [],
            options: {},
            flags: new Set(),
            config
          };

          // For commands that need additional input, prompt for it
          if (choice === 'create') {
            const branchName = await CLIUtils.promptUser('Enter branch name: ', { required: true });
            mockArgs.positional = [branchName];
            
            const baseBranch = await CLIUtils.promptUser('Enter base branch (optional): ');
            if (baseBranch) {
              mockArgs.options.base = baseBranch;
            }
          } else if (choice === 'remove') {
            const worktrees = await this.worktreeManager.listWorktrees();
            if (worktrees.length === 0) {
              console.log(CLIUtils.colorize('No worktrees to remove.', 'yellow'));
              continue;
            }

            const branchChoice = await this.cliInterface.displayMenu(
              'Select worktree to remove:',
              worktrees.map(w => ({ text: w.branch, value: w.branch, description: w.path })),
              { colors: config.display.colorOutput }
            );
            mockArgs.positional = [branchChoice];
          }

          await command(mockArgs);
        }

        console.log(); // Add spacing between operations
      } catch (error) {
        console.error(CLIUtils.colorize(`Error: ${error.message}`, 'red'));
        console.log(); // Add spacing after errors
      }
    }
  }

  /**
   * Show configuration management menu
   * @param {Object} config - Current configuration
   */
  async showConfigurationMenu(config) {
    const choice = await this.cliInterface.displayMenu(
      'Configuration Options:',
      [
        { text: 'View current configuration', value: 'view', description: 'Display current settings' },
        { text: 'Modify settings', value: 'modify', description: 'Change configuration values' },
        { text: 'Reset to defaults', value: 'reset', description: 'Restore default configuration' },
        { text: 'Back to main menu', value: 'back', description: 'Return to main menu' }
      ],
      { colors: config.display.colorOutput, icons: false }
    );

    switch (choice) {
      case 'view':
        console.log('\nCurrent Configuration:');
        console.log(JSON.stringify(config, null, 2));
        break;
      
      case 'modify':
        await this.modifyConfiguration(config);
        break;
      
      case 'reset':
        const confirm = await this.cliInterface.displayConfirmation(
          'Are you sure you want to reset configuration to defaults?',
          { colors: config.display.colorOutput }
        );
        if (confirm) {
          const defaultConfig = this.cliInterface.configManager.getDefaultConfiguration();
          await this.cliInterface.configManager.saveConfiguration(defaultConfig);
          console.log(CLIUtils.colorize('Configuration reset to defaults.', 'green'));
        }
        break;
    }
  }

  /**
   * Interactive configuration modification
   * @param {Object} config - Current configuration
   */
  async modifyConfiguration(config) {
    const responses = await this.cliInterface.displayWizard(
      'Configuration Wizard',
      [
        {
          key: 'baseDirectory',
          title: 'Worktree Base Directory',
          description: 'Directory where worktrees will be created',
          type: 'input',
          message: 'Enter base directory path',
          defaultValue: config.worktree.baseDirectory
        },
        {
          key: 'maxWorktrees',
          title: 'Maximum Worktrees',
          description: 'Maximum number of concurrent worktrees',
          type: 'input',
          message: 'Enter maximum number of worktrees',
          defaultValue: config.worktree.maxWorktrees.toString()
        },
        {
          key: 'colorOutput',
          title: 'Color Output',
          description: 'Enable colored terminal output',
          type: 'confirm',
          message: 'Enable colored output?',
          defaultValue: config.display.colorOutput
        },
        {
          key: 'verboseLogging',
          title: 'Verbose Logging',
          description: 'Enable detailed logging output',
          type: 'confirm',
          message: 'Enable verbose logging?',
          defaultValue: config.display.verboseLogging
        }
      ],
      { colors: config.display.colorOutput }
    );

    // Update configuration with responses
    const updatedConfig = { ...config };
    updatedConfig.worktree.baseDirectory = responses.baseDirectory;
    updatedConfig.worktree.maxWorktrees = parseInt(responses.maxWorktrees);
    updatedConfig.display.colorOutput = responses.colorOutput;
    updatedConfig.display.verboseLogging = responses.verboseLogging;

    // Save updated configuration
    await this.cliInterface.configManager.saveConfiguration(updatedConfig);
    console.log(CLIUtils.colorize('Configuration updated successfully!', 'green'));
  }

  /**
   * Create worktree command
   * Implements Requirements 2.1, 2.3 - CLI interface equivalence
   */
  async createCommand(args) {
    const branchName = args.positional[0];
    const baseBranch = args.positional[1] || args.options.base || 'main';
    const worktreePath = args.options.path;

    if (!branchName) {
      this.printError('Branch name is required for create action');
      this.printInfo('Usage: git-worktree.js create <branch-name> [base-branch]');
      this.printInfo('Example: git-worktree.js create feature/user-auth');
      process.exit(1);
    }

    this.printInfo(`Creating worktree for branch '${branchName}' based on '${baseBranch}'`);
    
    if (worktreePath) {
      this.printInfo(`Worktree path: ${worktreePath}`);
    }

    try {
      const worktree = await this.worktreeManager.createWorktree(branchName, baseBranch, worktreePath);
      
      this.printSuccess('Worktree created successfully');
      this.printInfo(`To switch to the worktree: cd '${worktree.path}'`);
      this.printInfo(`To remove the worktree later: git-worktree.js remove '${branchName}'`);
      
      // Display worktree information
      console.log();
      this.displayWorktreeInfo(worktree);
      
    } catch (error) {
      if (error.message.includes('already exists')) {
        this.printWarning(`Branch '${branchName}' already exists`);
        
        if (args.flags.has('force') || args.flags.has('f')) {
          this.printInfo('Force flag detected, creating worktree for existing branch...');
          const worktree = await this.worktreeManager.createWorktree(branchName, baseBranch, worktreePath);
          this.printSuccess('Worktree created successfully');
          this.displayWorktreeInfo(worktree);
        } else {
          const answer = await CLIUtils.promptUser(
            'Do you want to create a worktree for the existing branch?',
            { choices: ['y', 'N'], defaultValue: 'N' }
          );
          
          if (answer.toLowerCase() === 'y') {
            const worktree = await this.worktreeManager.createWorktree(branchName, baseBranch, worktreePath);
            this.printSuccess('Worktree created successfully');
            this.displayWorktreeInfo(worktree);
          } else {
            this.printInfo('Operation cancelled');
          }
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * List worktrees command
   * Implements Requirements 2.2, 2.5 - Output format equivalence
   */
  async listCommand(args) {
    this.printInfo('Current worktrees:');
    
    const worktrees = await this.worktreeManager.listWorktrees();
    
    if (worktrees.length === 0) {
      this.printWarning('No worktrees found');
      return;
    }

    // Display in format similar to bash script
    worktrees.forEach(worktree => {
      console.log(`  ${CLIUtils.colorize('📁 ' + worktree.path, 'yellow')}`);
      console.log(`     ${CLIUtils.colorize('🌿 ' + worktree.branch, 'green')}`);
      console.log(`     ${CLIUtils.colorize('📝 ' + worktree.commit, 'gray')}`);
      
      if (args.flags.has('verbose') || args.flags.has('v')) {
        console.log(`     ${CLIUtils.colorize('📅 Created: ' + worktree.created.toLocaleString(), 'cyan')}`);
        console.log(`     ${CLIUtils.colorize('👁  Status: ' + worktree.status, 'white')}`);
      }
      
      console.log();
    });

    // Summary
    this.printInfo(`Total worktrees: ${worktrees.length}`);
  }

  /**
   * Remove worktree command
   * Implements Requirements 2.3, 2.4 - CLI interface equivalence
   */
  async removeCommand(args) {
    const branchName = args.positional[0];
    
    if (!branchName) {
      this.printError('Branch name is required for remove action');
      this.printInfo('Usage: git-worktree.js remove <branch-name>');
      process.exit(1);
    }

    this.printInfo(`Removing worktree for branch '${branchName}'`);

    try {
      const result = await this.worktreeManager.removeWorktree(branchName, false);
      
      if (result.worktreeRemoved) {
        this.printSuccess('Worktree removed successfully');
        
        // Ask about branch deletion unless --no-delete-branch flag is set
        if (!args.flags.has('no-delete-branch')) {
          const deleteBranch = args.flags.has('delete-branch') || args.flags.has('d');
          
          if (deleteBranch || (!args.flags.has('quiet') && !args.flags.has('q'))) {
            const shouldDelete = deleteBranch || await CLIUtils.promptUser(
              `Do you want to delete the branch '${branchName}' as well?`,
              { choices: ['y', 'N'], defaultValue: 'N' }
            );
            
            if (shouldDelete === 'y' || shouldDelete === true) {
              try {
                await this.worktreeManager.removeWorktree(branchName, true);
                this.printSuccess(`Branch '${branchName}' deleted successfully`);
              } catch (error) {
                this.printWarning(`Failed to delete branch '${branchName}': ${error.message}`);
              }
            }
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cleanup stale worktrees command
   * Implements Requirements 2.4 - CLI interface equivalence
   */
  async cleanupCommand(args) {
    this.printInfo('Cleaning up stale worktrees...');
    
    try {
      const result = await this.worktreeManager.cleanupStaleWorktrees();
      
      if (result.cleaned.length > 0) {
        this.printSuccess('Worktree cleanup completed');
        result.cleaned.forEach(item => {
          this.printInfo(`Cleaned: ${item}`);
        });
      } else {
        this.printInfo('No stale worktrees found');
      }
      
      if (result.errors.length > 0) {
        this.printWarning('Some cleanup operations encountered issues:');
        result.errors.forEach(error => {
          this.printWarning(`  ${error}`);
        });
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Show worktree status command
   * Implements Requirements 2.5 - CLI interface equivalence
   */
  async statusCommand(args) {
    try {
      const status = await this.worktreeManager.getWorktreeStatus();
      
      // Use CLI interface for formatted output
      const formattedStatus = this.cliInterface.formatOutput(status, 'status-report');
      console.log(formattedStatus);
      
      console.log();
      
      // List all worktrees
      await this.listCommand(args);
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * Display comprehensive help information
   * Implements Requirements 8.5 - Comprehensive help system
   */
  displayHelp(command = null) {
    if (command) {
      this.displayCommandHelp(command);
      return;
    }

    const helpConfig = {
      name: 'Git Worktree Management (JavaScript)',
      description: 'Cross-platform git worktree management with enhanced functionality',
      commands: [
        {
          name: 'create',
          description: 'Create a new worktree for a branch'
        },
        {
          name: 'list',
          description: 'List all existing worktrees'
        },
        {
          name: 'remove',
          description: 'Remove a worktree and optionally delete the branch'
        },
        {
          name: 'cleanup',
          description: 'Clean up stale worktree references'
        },
        {
          name: 'status',
          description: 'Show detailed worktree status information'
        },
        {
          name: 'help',
          description: 'Show help information for commands'
        }
      ],
      options: [
        {
          long: 'help',
          short: 'h',
          description: 'Show help information'
        },
        {
          long: 'version',
          short: 'v',
          description: 'Show version information'
        },
        {
          long: 'verbose',
          short: 'v',
          description: 'Enable verbose output'
        },
        {
          long: 'quiet',
          short: 'q',
          description: 'Suppress non-essential output'
        },
        {
          long: 'completion',
          description: 'Generate shell completion script'
        }
      ],
      examples: [
        {
          command: 'node git-worktree.js create feature/user-auth',
          description: 'Create worktree for new feature branch'
        },
        {
          command: 'node git-worktree.js create feature/user-auth main --path /custom/path',
          description: 'Create worktree with custom path'
        },
        {
          command: 'node git-worktree.js list --verbose',
          description: 'List all worktrees with detailed information'
        },
        {
          command: 'node git-worktree.js remove feature/user-auth --delete-branch',
          description: 'Remove worktree and delete the branch'
        },
        {
          command: 'node git-worktree.js status',
          description: 'Show current worktree status and overview'
        }
      ]
    };

    console.log(CLIUtils.displayHelp(helpConfig));
    
    // Additional troubleshooting section
    console.log(CLIUtils.colorize('TROUBLESHOOTING:', 'yellow'));
    console.log('  • Ensure you are in a git repository');
    console.log('  • Check that git is installed and accessible');
    console.log('  • Verify branch names use only letters, numbers, hyphens, underscores, and forward slashes');
    console.log('  • Use --verbose flag for detailed operation information');
    console.log('  • Check file permissions if operations fail');
    console.log();
    console.log(CLIUtils.colorize('For more help on specific commands:', 'cyan'));
    console.log('  node git-worktree.js help <command>');
    console.log();
  }

  /**
   * Display help for specific command
   */
  displayCommandHelp(command) {
    const commandHelp = {
      create: {
        usage: 'git-worktree.js create <branch-name> [base-branch]',
        description: 'Create a new worktree for the specified branch',
        options: [
          '--path <path>     Custom worktree directory path',
          '--base <branch>  Base branch to create from (default: main)',
          '--force, -f      Create worktree for existing branch without prompting'
        ],
        examples: [
          'git-worktree.js create feature/user-auth',
          'git-worktree.js create bugfix/login-issue main',
          'git-worktree.js create feature/new-ui --path /custom/path'
        ]
      },
      list: {
        usage: 'git-worktree.js list',
        description: 'List all existing worktrees with their status',
        options: [
          '--verbose, -v    Show detailed worktree information'
        ],
        examples: [
          'git-worktree.js list',
          'git-worktree.js list --verbose'
        ]
      },
      remove: {
        usage: 'git-worktree.js remove <branch-name>',
        description: 'Remove a worktree and optionally delete the branch',
        options: [
          '--delete-branch, -d      Delete the branch without prompting',
          '--no-delete-branch       Keep the branch (skip deletion prompt)',
          '--quiet, -q              Suppress prompts and non-essential output'
        ],
        examples: [
          'git-worktree.js remove feature/user-auth',
          'git-worktree.js remove feature/old-feature --delete-branch'
        ]
      },
      cleanup: {
        usage: 'git-worktree.js cleanup',
        description: 'Clean up stale worktree references',
        options: [],
        examples: [
          'git-worktree.js cleanup'
        ]
      },
      status: {
        usage: 'git-worktree.js status',
        description: 'Show detailed worktree status and repository information',
        options: [
          '--verbose, -v    Show additional status details'
        ],
        examples: [
          'git-worktree.js status'
        ]
      }
    };

    const help = commandHelp[command];
    if (!help) {
      this.printError(`No help available for command: ${command}`);
      return;
    }

    console.log(`\n${CLIUtils.colorize(command.toUpperCase(), 'cyan')}`);
    console.log('='.repeat(command.length));
    console.log(`\n${help.description}\n`);
    console.log(`${CLIUtils.colorize('USAGE:', 'yellow')}`);
    console.log(`  ${help.usage}\n`);
    
    if (help.options.length > 0) {
      console.log(`${CLIUtils.colorize('OPTIONS:', 'yellow')}`);
      help.options.forEach(option => {
        console.log(`  ${option}`);
      });
      console.log();
    }
    
    console.log(`${CLIUtils.colorize('EXAMPLES:', 'yellow')}`);
    help.examples.forEach(example => {
      console.log(`  ${example}`);
    });
    console.log();
  }

  /**
   * Display version information
   */
  displayVersion() {
    console.log('Git Worktree Manager (JavaScript) v1.0.0');
    console.log('Cross-platform git worktree management');
    console.log('Part of the EARS-workflow skill package');
  }

  /**
   * Display worktree information in formatted output
   */
  displayWorktreeInfo(worktree) {
    const formatted = this.cliInterface.formatOutput(worktree, 'worktree-info');
    console.log(formatted);
  }

  /**
   * Print colored success message
   */
  printSuccess(message) {
    console.log(CLIUtils.colorize(`✓ ${message}`, 'green'));
  }

  /**
   * Print colored error message
   */
  printError(message) {
    console.error(CLIUtils.colorize(`✗ ${message}`, 'red'));
  }

  /**
   * Print colored info message
   */
  printInfo(message) {
    console.log(CLIUtils.colorize(`ℹ ${message}`, 'cyan'));
  }

  /**
   * Print colored warning message
   */
  printWarning(message) {
    console.log(CLIUtils.colorize(`⚠ ${message}`, 'yellow'));
  }

  /**
   * Handle errors with structured error information
   * Implements Requirements 7.1, 7.2 - Structured error handling
   */
  handleError(error) {
    if (error.errorInfo) {
      this.printError(error.errorInfo.message);
      
      if (error.errorInfo.suggestions && error.errorInfo.suggestions.length > 0) {
        console.log(CLIUtils.colorize('\nSuggestions:', 'yellow'));
        error.errorInfo.suggestions.forEach(suggestion => {
          console.log(`  • ${suggestion}`);
        });
      }
      
      if (error.errorInfo.context) {
        console.log(CLIUtils.colorize('\nContext:', 'gray'));
        console.log(`  Operation: ${error.errorInfo.context.operation}`);
        if (error.errorInfo.context.parameters) {
          console.log(`  Parameters: ${JSON.stringify(error.errorInfo.context.parameters, null, 2)}`);
        }
      }
    } else {
      this.printError(`Unexpected error: ${error.message}`);
    }
    
    console.log(CLIUtils.colorize('\nFor more help:', 'cyan'));
    console.log('  node git-worktree.js --help');
    console.log('  node git-worktree.js help <command>');
  }
}

// Main execution when run directly
if (require.main === module) {
  const cli = new GitWorktreeCLI();
  cli.run().catch(error => {
    console.error('Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = GitWorktreeCLI;