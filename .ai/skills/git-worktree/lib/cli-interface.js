/**
 * CLI Interface Module for Git Worktree Management
 * Provides command parsing, help system, and rich output formatting
 * Implements Requirements 8.1, 8.2, 8.5
 */

const CLIUtils = require('../../shared/cli-utils');
const ConfigManager = require('../../shared/config-manager');

/**
 * CLI Interface class for enhanced command-line interaction
 * Provides auto-completion, rich formatting, and comprehensive help
 */
class CLIInterface {
  constructor() {
    this.supportedShells = ['bash', 'zsh', 'fish'];
    this.configManager = new ConfigManager();
  }

  /**
   * Parse command line arguments with enhanced validation and configuration merging
   * Implements Requirements 8.4 - Multi-source configuration support
   * @param {string[]} argv - Command line arguments
   * @param {string} configPath - Optional path to configuration file
   * @returns {Promise<Object>} Parsed and merged arguments with configuration
   */
  async parseArgumentsWithConfig(argv, configPath = '.ai/config/skills.json') {
    // Parse CLI arguments
    const args = CLIUtils.parseArguments(argv);
    
    // Load configuration from file
    const config = await this.configManager.loadConfiguration(configPath);
    
    // Merge CLI arguments with configuration
    const mergedConfig = this.mergeCliWithConfig(args, config);
    
    // Add command-specific validation
    this.validateCommandArguments(args);
    
    return {
      ...args,
      config: mergedConfig,
      effectiveConfig: mergedConfig
    };
  }

  /**
   * Merge CLI arguments with configuration file settings
   * CLI arguments take precedence over configuration file settings
   * @private
   */
  mergeCliWithConfig(args, config) {
    const mergedConfig = { ...config };
    
    // Map CLI options to configuration structure
    if (args.options['base-dir']) {
      mergedConfig.worktree.baseDirectory = args.options['base-dir'];
    }
    
    if (args.options['max-worktrees']) {
      mergedConfig.worktree.maxWorktrees = parseInt(args.options['max-worktrees']);
    }
    
    if (args.options['archive-dir']) {
      mergedConfig.reset.archiveDirectory = args.options['archive-dir'];
    }
    
    if (args.options['compression-level']) {
      mergedConfig.reset.compressionLevel = parseInt(args.options['compression-level']);
    }
    
    // Map CLI flags to configuration
    if (args.flags.has('verbose')) {
      mergedConfig.display.verboseLogging = true;
    }
    
    if (args.flags.has('quiet')) {
      mergedConfig.display.verboseLogging = false;
    }
    
    if (args.flags.has('no-color')) {
      mergedConfig.display.colorOutput = false;
    }
    
    if (args.flags.has('color')) {
      mergedConfig.display.colorOutput = true;
    }
    
    if (args.flags.has('no-progress')) {
      mergedConfig.display.progressIndicators = false;
    }
    
    if (args.flags.has('progress')) {
      mergedConfig.display.progressIndicators = true;
    }
    
    // Validate merged configuration
    this.configManager.validateConfiguration(mergedConfig);
    
    return mergedConfig;
  }

  /**
   * Parse command line arguments with enhanced validation
   * @param {string[]} argv - Command line arguments
   * @returns {Object} Parsed and validated arguments
   */
  parseArguments(argv) {
    const args = CLIUtils.parseArguments(argv);
    
    // Add command-specific validation
    this.validateCommandArguments(args);
    
    return args;
  }

  /**
   * Validate command-specific arguments
   * @param {Object} args - Parsed arguments
   */
  validateCommandArguments(args) {
    const validCommands = ['create', 'list', 'remove', 'cleanup', 'status', 'help'];
    
    if (args.command && !validCommands.includes(args.command)) {
      throw new Error(`Invalid command: ${args.command}. Valid commands: ${validCommands.join(', ')}`);
    }

    // Command-specific validation
    switch (args.command) {
      case 'create':
        if (args.positional.length === 0) {
          throw new Error('Branch name is required for create command');
        }
        break;
      case 'remove':
        if (args.positional.length === 0) {
          throw new Error('Branch name is required for remove command');
        }
        break;
    }
  }

  /**
   * Format output with rich colors, icons, and progress indicators
   * Implements Requirements 8.2 - Rich output formatting
   * @param {Object} data - Data to format
   * @param {string} format - Output format type
   * @param {Object} options - Formatting options
   * @returns {string} Formatted output
   */
  formatOutput(data, format = 'default', options = {}) {
    const { colors = true, icons = true, compact = false } = options;

    switch (format) {
      case 'worktree-list':
        return this.formatWorktreeList(data, { colors, icons, compact });
      case 'worktree-info':
        return this.formatWorktreeInfo(data, { colors, icons });
      case 'status-report':
        return this.formatStatusReport(data, { colors, icons });
      case 'progress':
        return this.formatProgress(data.current, data.total, data.message);
      default:
        return JSON.stringify(data, null, 2);
    }
  }

  /**
   * Format worktree list with icons and colors
   * @private
   */
  formatWorktreeList(worktrees, options) {
    if (!worktrees || worktrees.length === 0) {
      return CLIUtils.colorize('No worktrees found', 'yellow');
    }

    let output = '';
    worktrees.forEach((worktree, index) => {
      const pathIcon = options.icons ? '📁 ' : '';
      const branchIcon = options.icons ? '🌿 ' : '';
      const commitIcon = options.icons ? '📝 ' : '';
      
      const pathColor = options.colors ? 'yellow' : null;
      const branchColor = options.colors ? 'green' : null;
      const commitColor = options.colors ? 'gray' : null;

      output += `  ${CLIUtils.colorize(pathIcon + worktree.path, pathColor)}\n`;
      output += `     ${CLIUtils.colorize(branchIcon + worktree.branch, branchColor)}\n`;
      output += `     ${CLIUtils.colorize(commitIcon + worktree.commit, commitColor)}\n`;
      
      if (!options.compact) {
        const statusIcon = this.getStatusIcon(worktree.status);
        const statusColor = this.getStatusColor(worktree.status);
        output += `     ${CLIUtils.colorize(statusIcon + ' ' + worktree.status, statusColor)}\n`;
      }
      
      if (index < worktrees.length - 1) {
        output += '\n';
      }
    });

    return output;
  }

  /**
   * Format individual worktree information
   * @private
   */
  formatWorktreeInfo(worktree, options) {
    const lines = [];
    
    lines.push(options.colors ? CLIUtils.colorize('Worktree Details:', 'cyan') : 'Worktree Details:');
    lines.push(`  Path:    ${worktree.path}`);
    lines.push(`  Branch:  ${options.colors ? CLIUtils.colorize(worktree.branch, 'green') : worktree.branch}`);
    lines.push(`  Commit:  ${options.colors ? CLIUtils.colorize(worktree.commit, 'yellow') : worktree.commit}`);
    lines.push(`  Status:  ${options.colors ? CLIUtils.colorize(worktree.status, this.getStatusColor(worktree.status)) : worktree.status}`);
    lines.push(`  Created: ${worktree.created.toLocaleString()}`);
    
    return lines.join('\n');
  }

  /**
   * Format status report with comprehensive information
   * @private
   */
  formatStatusReport(status, options) {
    const lines = [];
    
    lines.push(CLIUtils.colorize('Worktree Status Report', 'cyan'));
    lines.push(CLIUtils.colorize('=====================', 'cyan'));
    lines.push('');
    
    lines.push(`${CLIUtils.colorize('Current Location:', 'yellow')} ${status.currentDirectory}`);
    lines.push(`${CLIUtils.colorize('Repository Root:', 'yellow')}  ${status.repositoryRoot}`);
    lines.push(`${CLIUtils.colorize('Current Branch:', 'green')}   ${status.currentBranch}`);
    
    if (status.inWorktree && status.currentWorktree) {
      lines.push(`${CLIUtils.colorize('Worktree:', 'cyan')}         Yes (in ${status.currentWorktree.path})`);
    } else {
      lines.push(`${CLIUtils.colorize('Worktree:', 'gray')}         No (in main repository)`);
    }
    
    if (Object.keys(status.remotes).length > 0) {
      lines.push(`${CLIUtils.colorize('Remotes:', 'magenta')}          ${Object.keys(status.remotes).join(', ')}`);
    }
    
    return lines.join('\n');
  }

  /**
   * Get status icon for worktree status
   * @private
   */
  getStatusIcon(status) {
    const icons = {
      clean: '✅',
      dirty: '⚠️',
      detached: '🔄'
    };
    return icons[status] || '❓';
  }

  /**
   * Get color for worktree status
   * @private
   */
  getStatusColor(status) {
    const colors = {
      clean: 'green',
      dirty: 'yellow',
      detached: 'red'
    };
    return colors[status] || 'white';
  }

  /**
   * Format progress indicator
   * @private
   */
  formatProgress(current, total, message = '') {
    return CLIUtils.formatProgress(current, total, message);
  }

  /**
   * Generate auto-completion script for specified shell
   * Implements Requirements 8.1 - CLI auto-completion support
   * @param {string} shell - Target shell (bash, zsh, fish)
   * @param {string[]} commands - Available commands
   * @returns {string} Completion script
   */
  generateCompletion(shell, commands) {
    if (!this.supportedShells.includes(shell)) {
      throw new Error(`Unsupported shell: ${shell}. Supported: ${this.supportedShells.join(', ')}`);
    }

    switch (shell) {
      case 'bash':
        return this.generateBashCompletion(commands);
      case 'zsh':
        return this.generateZshCompletion(commands);
      case 'fish':
        return this.generateFishCompletion(commands);
      default:
        throw new Error(`Completion generation not implemented for ${shell}`);
    }
  }

  /**
   * Generate bash completion script
   * @private
   */
  generateBashCompletion(commands) {
    return `# Git Worktree completion for bash
_git_worktree_completion() {
    local cur prev commands options
    COMPREPLY=()
    cur="\${COMP_WORDS[COMP_CWORD]}"
    prev="\${COMP_WORDS[COMP_CWORD-1]}"
    commands="${commands.join(' ')}"
    options="--help --version --verbose --quiet --completion"
    
    case \${COMP_CWORD} in
        1)
            COMPREPLY=( $(compgen -W "$commands $options" -- $cur) )
            ;;
        2)
            case "\${COMP_WORDS[1]}" in
                create)
                    # Complete with branch prefixes
                    COMPREPLY=( $(compgen -W "feature/ bugfix/ hotfix/ refactor/" -- $cur) )
                    ;;
                remove)
                    # Complete with existing branches from worktrees
                    local branches=$(git worktree list --porcelain 2>/dev/null | grep "^branch " | sed 's/^branch refs\\/heads\\///' | sort -u)
                    COMPREPLY=( $(compgen -W "$branches" -- $cur) )
                    ;;
                help)
                    COMPREPLY=( $(compgen -W "$commands" -- $cur) )
                    ;;
            esac
            ;;
        3)
            case "\${COMP_WORDS[1]}" in
                create)
                    # Complete with existing branches for base branch
                    local branches=$(git branch --format="%(refname:short)" 2>/dev/null)
                    COMPREPLY=( $(compgen -W "$branches" -- $cur) )
                    ;;
            esac
            ;;
    esac
}

complete -F _git_worktree_completion git-worktree.js node

# Installation instructions:
# Add this to your ~/.bashrc or ~/.bash_profile:
# source <(node /path/to/git-worktree.js --completion)`;
  }

  /**
   * Generate zsh completion script
   * @private
   */
  generateZshCompletion(commands) {
    return `#compdef git-worktree.js

# Git Worktree completion for zsh
_git_worktree() {
    local context state line
    typeset -A opt_args
    
    _arguments \\
        '(--help -h)'{--help,-h}'[Show help information]' \\
        '(--version -v)'{--version,-v}'[Show version information]' \\
        '(--verbose -v)'{--verbose,-v}'[Enable verbose output]' \\
        '(--quiet -q)'{--quiet,-q}'[Suppress non-essential output]' \\
        '--completion[Generate shell completion script]' \\
        '1:command:(${commands.join(' ')})' \\
        '*::arg:->args'
    
    case $state in
        args)
            case $words[1] in
                create)
                    _arguments \\
                        '1:branch-name:_git_worktree_branch_prefixes' \\
                        '2:base-branch:_git_worktree_branches' \\
                        '--path[Custom worktree path]:path:_directories' \\
                        '--base[Base branch]:branch:_git_worktree_branches' \\
                        '(--force -f)'{--force,-f}'[Force creation without prompting]'
                    ;;
                remove)
                    _arguments \\
                        '1:branch-name:_git_worktree_existing_branches' \\
                        '(--delete-branch -d)'{--delete-branch,-d}'[Delete branch without prompting]' \\
                        '--no-delete-branch[Keep branch, skip deletion prompt]'
                    ;;
                help)
                    _arguments "1:command:(${commands.join(' ')})"
                    ;;
            esac
            ;;
    esac
}

_git_worktree_branches() {
    local branches
    branches=($(git branch --format="%(refname:short)" 2>/dev/null))
    _describe 'branches' branches
}

_git_worktree_existing_branches() {
    local branches
    branches=($(git worktree list --porcelain 2>/dev/null | grep "^branch " | sed 's/^branch refs\\/heads\\///' | sort -u))
    _describe 'worktree branches' branches
}

_git_worktree_branch_prefixes() {
    local prefixes
    prefixes=('feature/' 'bugfix/' 'hotfix/' 'refactor/')
    _describe 'branch prefixes' prefixes
}

_git_worktree "$@"

# Installation instructions:
# Add this to your ~/.zshrc:
# source <(node /path/to/git-worktree.js --completion --shell zsh)`;
  }

  /**
   * Generate fish completion script
   * @private
   */
  generateFishCompletion(commands) {
    return `# Git Worktree completion for fish
complete -c git-worktree.js -f

# Commands
${commands.map(cmd => `complete -c git-worktree.js -n '__fish_use_subcommand' -a '${cmd}' -d '${this.getCommandDescription(cmd)}'`).join('\n')}

# Global options
complete -c git-worktree.js -n '__fish_use_subcommand' -l help -s h -d 'Show help information'
complete -c git-worktree.js -n '__fish_use_subcommand' -l version -s v -d 'Show version information'
complete -c git-worktree.js -n '__fish_use_subcommand' -l verbose -s v -d 'Enable verbose output'
complete -c git-worktree.js -n '__fish_use_subcommand' -l quiet -s q -d 'Suppress non-essential output'
complete -c git-worktree.js -n '__fish_use_subcommand' -l completion -d 'Generate shell completion script'

# Command-specific completions
complete -c git-worktree.js -n '__fish_seen_subcommand_from create' -l path -d 'Custom worktree path' -r
complete -c git-worktree.js -n '__fish_seen_subcommand_from create' -l base -d 'Base branch' -xa '(git branch --format="%(refname:short)" 2>/dev/null)'
complete -c git-worktree.js -n '__fish_seen_subcommand_from create' -l force -s f -d 'Force creation without prompting'

complete -c git-worktree.js -n '__fish_seen_subcommand_from remove' -l delete-branch -s d -d 'Delete branch without prompting'
complete -c git-worktree.js -n '__fish_seen_subcommand_from remove' -l no-delete-branch -d 'Keep branch, skip deletion prompt'

# Branch name completions
complete -c git-worktree.js -n '__fish_seen_subcommand_from remove' -xa '(git worktree list --porcelain 2>/dev/null | grep "^branch " | sed "s/^branch refs\\/heads\\///" | sort -u)'

# Installation instructions:
# Save this to ~/.config/fish/completions/git-worktree.js.fish
# Or run: node /path/to/git-worktree.js --completion --shell fish > ~/.config/fish/completions/git-worktree.js.fish`;
  }

  /**
   * Get command description for completion
   * @private
   */
  getCommandDescription(command) {
    const descriptions = {
      create: 'Create a new worktree for a branch',
      list: 'List all existing worktrees',
      remove: 'Remove a worktree and optionally delete the branch',
      cleanup: 'Clean up stale worktree references',
      status: 'Show detailed worktree status information',
      help: 'Show help information for commands'
    };
    return descriptions[command] || 'Git worktree command';
  }

  /**
   * Display interactive selection menu with enhanced features
   * Implements Requirements 8.3 - Interactive menu functionality
   * @param {string} message - Menu prompt message
   * @param {Array} choices - Menu choices
   * @param {Object} options - Menu options
   * @returns {Promise<string>} Selected choice
   */
  async displayMenu(message, choices, options = {}) {
    const { 
      numbered = true, 
      colors = true, 
      icons = false,
      defaultChoice = null,
      allowCancel = false,
      showHelp = false
    } = options;

    console.log(CLIUtils.colorize(message, 'cyan'));
    console.log();

    choices.forEach((choice, index) => {
      const number = numbered ? `${index + 1}. ` : '';
      const icon = icons && choice.icon ? `${choice.icon} ` : '';
      const text = choice.text || choice;
      const description = choice.description ? ` - ${choice.description}` : '';
      
      const choiceText = `${number}${icon}${text}${description}`;
      console.log(`  ${colors ? CLIUtils.colorize(choiceText, 'white') : choiceText}`);
    });

    if (allowCancel) {
      console.log(`  ${colors ? CLIUtils.colorize('0. Cancel', 'gray') : '0. Cancel'}`);
    }

    if (showHelp) {
      console.log(`  ${colors ? CLIUtils.colorize('h. Help', 'blue') : 'h. Help'}`);
    }

    console.log();

    let prompt = `Select an option (1-${choices.length}`;
    if (allowCancel) prompt += ', 0 to cancel';
    if (showHelp) prompt += ', h for help';
    prompt += ')';
    if (defaultChoice) prompt += ` [${defaultChoice}]`;
    prompt += ': ';

    const answer = await CLIUtils.promptUser(prompt, {
      defaultValue: defaultChoice
    });

    // Handle special inputs
    if (allowCancel && (answer === '0' || answer.toLowerCase() === 'cancel')) {
      return null; // Cancelled
    }

    if (showHelp && (answer.toLowerCase() === 'h' || answer.toLowerCase() === 'help')) {
      return 'help';
    }

    const selectedIndex = parseInt(answer) - 1;
    if (selectedIndex >= 0 && selectedIndex < choices.length) {
      return choices[selectedIndex].value || choices[selectedIndex];
    }

    throw new Error('Invalid selection');
  }

  /**
   * Display interactive confirmation dialog
   * @param {string} message - Confirmation message
   * @param {Object} options - Dialog options
   * @returns {Promise<boolean>} User confirmation
   */
  async displayConfirmation(message, options = {}) {
    const {
      defaultValue = false,
      colors = true,
      yesText = 'Yes',
      noText = 'No'
    } = options;

    const colorizedMessage = colors ? CLIUtils.colorize(message, 'yellow') : message;
    const prompt = `${colorizedMessage} (${yesText}/${noText})${defaultValue !== null ? ` [${defaultValue ? yesText : noText}]` : ''}: `;

    const answer = await CLIUtils.promptUser(prompt, {
      choices: [yesText.toLowerCase(), noText.toLowerCase(), 'y', 'n', 'yes', 'no'],
      defaultValue: defaultValue !== null ? (defaultValue ? yesText.toLowerCase() : noText.toLowerCase()) : null
    });

    return ['y', 'yes', yesText.toLowerCase()].includes(answer.toLowerCase());
  }

  /**
   * Display multi-step wizard interface
   * @param {string} title - Wizard title
   * @param {Array} steps - Wizard steps
   * @param {Object} options - Wizard options
   * @returns {Promise<Object>} Collected responses
   */
  async displayWizard(title, steps, options = {}) {
    const { colors = true, allowBack = true } = options;
    const responses = {};
    let currentStep = 0;

    console.log(CLIUtils.colorize(`\n${title}`, 'cyan'));
    console.log(CLIUtils.colorize('='.repeat(title.length), 'cyan'));

    while (currentStep < steps.length) {
      const step = steps[currentStep];
      console.log(`\n${colors ? CLIUtils.colorize(`Step ${currentStep + 1}/${steps.length}: ${step.title}`, 'blue') : `Step ${currentStep + 1}/${steps.length}: ${step.title}`}`);
      
      if (step.description) {
        console.log(step.description);
      }

      try {
        let response;
        
        if (step.type === 'menu') {
          response = await this.displayMenu(step.message, step.choices, {
            ...step.options,
            colors,
            allowCancel: allowBack && currentStep > 0
          });
          
          if (response === null && allowBack) {
            currentStep = Math.max(0, currentStep - 1);
            continue;
          }
        } else if (step.type === 'input') {
          const prompt = `${step.message}${step.defaultValue ? ` [${step.defaultValue}]` : ''}: `;
          response = await CLIUtils.promptUser(prompt, {
            defaultValue: step.defaultValue,
            required: step.required
          });
        } else if (step.type === 'confirm') {
          response = await this.displayConfirmation(step.message, {
            defaultValue: step.defaultValue,
            colors
          });
        }

        responses[step.key] = response;
        currentStep++;
      } catch (error) {
        console.error(CLIUtils.colorize(`Error: ${error.message}`, 'red'));
        // Stay on current step to retry
      }
    }

    return responses;
  }

  /**
   * Display progress with spinner animation and enhanced formatting
   * Implements Requirements 8.2 - Rich output formatting
   * @param {string} message - Progress message
   * @param {Promise} operation - Operation to track
   * @param {Object} options - Progress options
   * @returns {Promise} Operation result
   */
  async displayProgressSpinner(message, operation, options = {}) {
    const { 
      colors = true,
      spinnerStyle = 'dots',
      showElapsed = false 
    } = options;
    
    const spinnerStyles = {
      dots: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
      line: ['|', '/', '-', '\\'],
      arrow: ['←', '↖', '↑', '↗', '→', '↘', '↓', '↙'],
      bounce: ['⠁', '⠂', '⠄', '⠂']
    };
    
    const spinnerChars = spinnerStyles[spinnerStyle] || spinnerStyles.dots;
    let spinnerIndex = 0;
    const startTime = Date.now();
    
    const spinner = setInterval(() => {
      const elapsed = showElapsed ? ` (${Math.round((Date.now() - startTime) / 1000)}s)` : '';
      const spinnerChar = colors ? CLIUtils.colorize(spinnerChars[spinnerIndex], 'cyan') : spinnerChars[spinnerIndex];
      process.stdout.write(`\r${spinnerChar} ${message}${elapsed}`);
      spinnerIndex = (spinnerIndex + 1) % spinnerChars.length;
    }, 100);

    try {
      const result = await operation;
      clearInterval(spinner);
      const elapsed = showElapsed ? ` (${Math.round((Date.now() - startTime) / 1000)}s)` : '';
      const successIcon = colors ? CLIUtils.colorize('✓', 'green') : '✓';
      process.stdout.write(`\r${successIcon} ${message}${elapsed}\n`);
      return result;
    } catch (error) {
      clearInterval(spinner);
      const elapsed = showElapsed ? ` (${Math.round((Date.now() - startTime) / 1000)}s)` : '';
      const errorIcon = colors ? CLIUtils.colorize('✗', 'red') : '✗';
      process.stdout.write(`\r${errorIcon} ${message}${elapsed}\n`);
      throw error;
    }
  }

  /**
   * Display progress bar with percentage and ETA
   * @param {number} current - Current progress
   * @param {number} total - Total items
   * @param {string} message - Progress message
   * @param {Object} options - Progress bar options
   * @returns {string} Formatted progress bar
   */
  displayProgressBar(current, total, message = '', options = {}) {
    const {
      width = 30,
      colors = true,
      showPercentage = true,
      showCount = true,
      showETA = false,
      startTime = null
    } = options;

    const percentage = Math.round((current / total) * 100);
    const filledLength = Math.round((width * current) / total);
    
    const filledChar = colors ? CLIUtils.colorize('█', 'green') : '█';
    const emptyChar = colors ? CLIUtils.colorize('░', 'gray') : '░';
    
    const bar = filledChar.repeat(filledLength) + emptyChar.repeat(width - filledLength);
    
    let progressText = `${message} [${bar}]`;
    
    if (showPercentage) {
      progressText += ` ${percentage}%`;
    }
    
    if (showCount) {
      progressText += ` (${current}/${total})`;
    }
    
    if (showETA && startTime && current > 0) {
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = current / elapsed;
      const remaining = (total - current) / rate;
      const eta = remaining > 60 ? `${Math.round(remaining / 60)}m` : `${Math.round(remaining)}s`;
      progressText += ` ETA: ${eta}`;
    }
    
    return progressText;
  }

  /**
   * Display real-time progress updates
   * @param {AsyncIterable} iterable - Async iterable to track
   * @param {string} message - Progress message
   * @param {Object} options - Progress options
   * @returns {Promise<Array>} Results array
   */
  async displayRealTimeProgress(iterable, message, options = {}) {
    const {
      total = null,
      colors = true,
      updateInterval = 100
    } = options;

    const results = [];
    let current = 0;
    const startTime = Date.now();
    let lastUpdate = 0;

    for await (const item of iterable) {
      results.push(item);
      current++;

      const now = Date.now();
      if (now - lastUpdate >= updateInterval) {
        if (total) {
          const progressBar = this.displayProgressBar(current, total, message, {
            colors,
            showETA: true,
            startTime
          });
          process.stdout.write(`\r${progressBar}`);
        } else {
          const spinnerChar = colors ? CLIUtils.colorize('⠋', 'cyan') : '⠋';
          process.stdout.write(`\r${spinnerChar} ${message} (${current} items)`);
        }
        lastUpdate = now;
      }
    }

    // Final update
    const successIcon = colors ? CLIUtils.colorize('✓', 'green') : '✓';
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    process.stdout.write(`\r${successIcon} ${message} - Completed ${current} items in ${elapsed}s\n`);

    return results;
  }
}

module.exports = CLIInterface;