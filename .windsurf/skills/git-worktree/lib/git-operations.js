/**
 * Git Operations Module
 * Provides cross-platform git command execution with structured error handling
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ErrorHandler = require('../../shared/error-handler');

/**
 * Git Operations class for cross-platform git command execution
 * Implements Requirements 1.2, 1.5, 7.1
 */
class GitOperations {
  constructor(options = {}) {
    this.workingDirectory = options.workingDirectory || process.cwd();
    this.timeout = options.timeout || 30000; // 30 second default timeout
    this.encoding = options.encoding || 'utf8';
  }

  /**
   * Execute a git command with proper error handling and validation
   * @param {string} command - Git subcommand (e.g., 'status', 'branch')
   * @param {string[]} args - Command arguments
   * @param {Object} options - Execution options
   * @returns {Promise<{stdout: string, stderr: string, exitCode: number}>}
   */
  async executeGitCommand(command, args = [], options = {}) {
    const fullCommand = 'git';
    const fullArgs = [command, ...args];
    const execOptions = {
      cwd: options.workingDirectory || this.workingDirectory,
      timeout: options.timeout || this.timeout,
      encoding: this.encoding,
      ...options
    };

    try {
      // Validate that we're in a git repository before executing commands
      if (command !== 'init' && command !== 'clone') {
        await this.validateRepository(execOptions.cwd);
      }

      return new Promise((resolve, reject) => {
        const child = spawn(fullCommand, fullArgs, {
          cwd: execOptions.cwd,
          stdio: ['pipe', 'pipe', 'pipe'],
          shell: process.platform === 'win32' // Use shell on Windows for better compatibility
        });

        let stdout = '';
        let stderr = '';
        let timeoutId;

        // Set up timeout
        if (execOptions.timeout) {
          timeoutId = setTimeout(() => {
            child.kill('SIGTERM');
            reject(new Error(`Command timed out after ${execOptions.timeout}ms`));
          }, execOptions.timeout);
        }

        // Collect output
        child.stdout.on('data', (data) => {
          stdout += data.toString(execOptions.encoding);
        });

        child.stderr.on('data', (data) => {
          stderr += data.toString(execOptions.encoding);
        });

        child.on('close', (exitCode) => {
          if (timeoutId) clearTimeout(timeoutId);
          
          const result = {
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            exitCode
          };

          if (exitCode === 0) {
            resolve(result);
          } else {
            const error = new Error(`Git command failed: git ${fullArgs.join(' ')}`);
            error.code = exitCode;
            error.stdout = stdout;
            error.stderr = stderr;
            
            // Create structured error information
            const errorInfo = ErrorHandler.handleGitError(error, `git ${command} ${args.join(' ')}`, {
              operation: 'git_command_execution',
              parameters: { command, args, options: execOptions }
            });
            
            // Attach structured error info to the error object
            error.errorInfo = errorInfo;
            reject(error);
          }
        });

        child.on('error', (error) => {
          if (timeoutId) clearTimeout(timeoutId);
          
          // Create structured error information
          const errorInfo = ErrorHandler.handleGitError(error, `git ${command} ${args.join(' ')}`, {
            operation: 'git_command_execution',
            parameters: { command, args, options: execOptions }
          });
          
          // Attach structured error info to the error object
          error.errorInfo = errorInfo;
          reject(error);
        });
      });

    } catch (error) {
      // Create structured error information
      const errorInfo = ErrorHandler.handleGitError(error, `git ${command} ${args.join(' ')}`, {
        operation: 'git_command_execution',
        parameters: { command, args, options: execOptions }
      });
      
      // Attach structured error info to the error object
      error.errorInfo = errorInfo;
      throw error;
    }
  }

  /**
   * Get list of all branches (local and remote)
   * @returns {Promise<{local: string[], remote: string[], current: string}>}
   */
  async getBranches() {
    try {
      const result = await this.executeGitCommand('branch', ['-a']);
      const lines = result.stdout.split('\n').filter(line => line.trim());
      
      const branches = {
        local: [],
        remote: [],
        current: null
      };

      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('* ')) {
          branches.current = trimmed.substring(2);
          branches.local.push(branches.current);
        } else if (trimmed.startsWith('remotes/')) {
          branches.remote.push(trimmed.substring(8)); // Remove 'remotes/' prefix
        } else if (trimmed && !trimmed.includes('->')) {
          branches.local.push(trimmed);
        }
      });

      return branches;
    } catch (error) {
      throw this._enhanceError(error, 'get_branches');
    }
  }

  /**
   * Get the current branch name
   * @returns {Promise<string>} Current branch name
   */
  async getCurrentBranch() {
    try {
      const result = await this.executeGitCommand('rev-parse', ['--abbrev-ref', 'HEAD']);
      return result.stdout;
    } catch (error) {
      throw this._enhanceError(error, 'get_current_branch');
    }
  }

  /**
   * Validate that the current directory is a git repository
   * @param {string} [directory] - Directory to validate (defaults to working directory)
   * @returns {Promise<boolean>} True if valid git repository
   */
  async validateRepository(directory = this.workingDirectory) {
    try {
      const gitDir = path.join(directory, '.git');
      
      // Check if .git exists (either as directory or file for worktrees)
      if (!fs.existsSync(gitDir)) {
        throw new Error('Not a git repository (no .git directory found)');
      }

      // Additional validation: try to get repository root using direct spawn
      // (avoid circular dependency with executeGitCommand)
      return new Promise((resolve, reject) => {
        const { spawn } = require('child_process');
        const child = spawn('git', ['rev-parse', '--show-toplevel'], {
          cwd: directory,
          stdio: ['pipe', 'pipe', 'pipe'],
          shell: process.platform === 'win32'
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        child.on('close', (exitCode) => {
          if (exitCode === 0) {
            resolve(true);
          } else {
            const error = new Error(`Repository validation failed: ${stderr}`);
            const errorInfo = ErrorHandler.createError(
              'INVALID_REPOSITORY',
              `Directory is not a valid git repository: ${directory}`,
              {
                operation: 'repository_validation',
                parameters: { directory }
              },
              [
                'Ensure you are in a git repository directory',
                'Run "git init" to initialize a new repository',
                'Check that the .git directory exists and is not corrupted'
              ]
            );
            error.errorInfo = errorInfo;
            reject(error);
          }
        });

        child.on('error', (error) => {
          const errorInfo = ErrorHandler.createError(
            'INVALID_REPOSITORY',
            `Directory is not a valid git repository: ${directory}`,
            {
              operation: 'repository_validation',
              parameters: { directory }
            },
            [
              'Ensure you are in a git repository directory',
              'Run "git init" to initialize a new repository',
              'Check that the .git directory exists and is not corrupted'
            ]
          );
          error.errorInfo = errorInfo;
          reject(error);
        });
      });
    } catch (error) {
      const errorInfo = ErrorHandler.createError(
        'INVALID_REPOSITORY',
        `Directory is not a valid git repository: ${directory}`,
        {
          operation: 'repository_validation',
          parameters: { directory }
        },
        [
          'Ensure you are in a git repository directory',
          'Run "git init" to initialize a new repository',
          'Check that the .git directory exists and is not corrupted'
        ]
      );
      
      error.errorInfo = errorInfo;
      throw error;
    }
  }

  /**
   * Check if the working directory is clean (no uncommitted changes)
   * @returns {Promise<{isClean: boolean, status: string}>}
   */
  async checkWorkingDirectoryClean() {
    try {
      const result = await this.executeGitCommand('status', ['--porcelain']);
      const isClean = result.stdout.length === 0;
      
      return {
        isClean,
        status: result.stdout
      };
    } catch (error) {
      throw this._enhanceError(error, 'check_working_directory_status');
    }
  }

  /**
   * Get repository information
   * @returns {Promise<Object>} Repository information
   */
  async getRepositoryInfo() {
    try {
      const [rootResult, remoteResult, currentBranch] = await Promise.all([
        this.executeGitCommand('rev-parse', ['--show-toplevel']),
        this.executeGitCommand('remote', ['-v']).catch(() => ({ stdout: '' })),
        this.getCurrentBranch()
      ]);

      const remotes = {};
      if (remoteResult.stdout) {
        remoteResult.stdout.split('\n').forEach(line => {
          const match = line.match(/^(\w+)\s+(.+?)\s+\((fetch|push)\)$/);
          if (match) {
            const [, name, url, type] = match;
            if (!remotes[name]) remotes[name] = {};
            remotes[name][type] = url;
          }
        });
      }

      return {
        root: rootResult.stdout,
        currentBranch,
        remotes
      };
    } catch (error) {
      throw this._enhanceError(error, 'get_repository_info');
    }
  }

  /**
   * Enhance error with additional context
   * @private
   */
  _enhanceError(error, operation) {
    if (!error.errorInfo) {
      error.errorInfo = ErrorHandler.createError(
        'GIT_OPERATION_FAILED',
        `Git operation failed: ${operation}`,
        {
          operation,
          parameters: { workingDirectory: this.workingDirectory }
        },
        ['Check git repository state', 'Verify git is installed and accessible']
      );
    }
    return error;
  }
}

module.exports = GitOperations;