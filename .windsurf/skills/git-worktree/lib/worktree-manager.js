/**
 * Git Worktree Manager Module
 * Provides cross-platform git worktree management with structured error handling
 * Implements Requirements 1.1, 2.1, 2.3, 2.4
 */

const path = require('path');
const fs = require('fs').promises;
const GitOperations = require('./git-operations');
const FileOperations = require('../../shared/file-operations');
const ErrorHandler = require('../../shared/error-handler');

/**
 * Worktree data model following the design specification
 * @typedef {Object} Worktree
 * @property {string} path - Absolute path to worktree directory
 * @property {string} branch - Associated git branch name
 * @property {string} commit - Current commit hash
 * @property {'clean'|'dirty'|'detached'} status - Worktree status
 * @property {Date} created - Creation timestamp
 * @property {Date} lastAccessed - Last access timestamp
 */

/**
 * Git Worktree Manager class for cross-platform worktree operations
 * Implements behavioral equivalence with bash scripts while providing enhanced functionality
 */
class WorktreeManager {
  constructor(options = {}) {
    this.gitOps = new GitOperations(options);
    this.baseWorktreeDir = options.baseWorktreeDir || this._getDefaultWorktreeDir();
    this.branchPrefixes = options.branchPrefixes || ['feature/', 'bugfix/', 'refactor/', 'hotfix/'];
    this.maxWorktrees = options.maxWorktrees || 10;
    this.autoCleanup = options.autoCleanup !== false; // Default to true
  }

  /**
   * Update configuration settings
   * @param {Object} config - Configuration object
   */
  updateConfiguration(config) {
    if (config.worktree) {
      this.baseWorktreeDir = config.worktree.baseDirectory || this.baseWorktreeDir;
      this.branchPrefixes = config.worktree.branchPrefix || this.branchPrefixes;
      this.maxWorktrees = config.worktree.maxWorktrees || this.maxWorktrees;
      this.autoCleanup = config.worktree.autoCleanup !== undefined ? config.worktree.autoCleanup : this.autoCleanup;
    }
  }

  /**
   * Create a new worktree with proper branch management
   * Implements Requirements 2.1, 2.3 - CLI interface equivalence
   * @param {string} branchName - Name of the branch for the worktree
   * @param {string} [baseBranch='main'] - Base branch to create from
   * @param {string} [worktreePath] - Custom worktree path
   * @returns {Promise<Worktree>} Created worktree information
   */
  async createWorktree(branchName, baseBranch = 'main', worktreePath = null) {
    try {
      // Validate inputs
      if (!branchName) {
        const errorInfo = ErrorHandler.createError(
          'INVALID_INPUT',
          'Branch name is required for create action',
          { operation: 'create_worktree', parameters: { branchName, baseBranch } },
          ['Provide a valid branch name', 'Use format: feature/branch-name']
        );
        const error = new Error(errorInfo.message);
        error.errorInfo = errorInfo;
        throw error;
      }

      // Validate branch name format (same as bash script)
      if (!/^[a-zA-Z0-9/_-]+$/.test(branchName)) {
        const errorInfo = ErrorHandler.createError(
          'INVALID_INPUT',
          'Invalid branch name. Use only letters, numbers, hyphens, underscores, and forward slashes.',
          { operation: 'create_worktree', parameters: { branchName } },
          ['Use only letters, numbers, hyphens, underscores, and forward slashes', 'Example: feature/user-auth']
        );
        const error = new Error(errorInfo.message);
        error.errorInfo = errorInfo;
        throw error;
      }

      // Set default worktree path if not provided
      if (!worktreePath) {
        worktreePath = path.join(this.baseWorktreeDir, branchName);
      }

      // Ensure base worktree directory exists
      await FileOperations.ensureDirectory(path.dirname(worktreePath));

      // Check if branch already exists
      const branches = await this.gitOps.getBranches();
      const branchExists = branches.local.includes(branchName);

      let result;
      if (branchExists) {
        // Create worktree for existing branch
        result = await this.gitOps.executeGitCommand('worktree', ['add', worktreePath, branchName]);
      } else {
        // Create new branch and worktree
        result = await this.gitOps.executeGitCommand('worktree', ['add', '-b', branchName, worktreePath, baseBranch]);
      }

      // Get commit hash for the new worktree
      const commitResult = await this.gitOps.executeGitCommand('rev-parse', ['HEAD'], {
        workingDirectory: worktreePath
      });

      // Create worktree object
      const worktree = {
        path: path.resolve(worktreePath),
        branch: branchName,
        commit: commitResult.stdout.substring(0, 8),
        status: 'clean',
        created: new Date(),
        lastAccessed: new Date()
      };

      return worktree;

    } catch (error) {
      if (error.errorInfo) {
        throw error;
      }
      const errorInfo = ErrorHandler.createError(
        'WORKTREE_CREATE_FAILED',
        `Failed to create worktree for branch '${branchName}': ${error.message}`,
        { operation: 'create_worktree', parameters: { branchName, baseBranch, worktreePath } },
        ['Check that the base branch exists', 'Ensure the worktree path is accessible', 'Verify git repository state']
      );
      const newError = new Error(errorInfo.message);
      newError.errorInfo = errorInfo;
      throw newError;
    }
  }

  /**
   * List all existing worktrees with formatted output
   * Implements Requirements 2.2, 2.5 - Output format equivalence
   * @returns {Promise<Worktree[]>} Array of worktree information
   */
  async listWorktrees() {
    try {
      const result = await this.gitOps.executeGitCommand('worktree', ['list', '--porcelain']);
      const worktrees = [];
      
      if (!result.stdout.trim()) {
        return worktrees;
      }

      const lines = result.stdout.split('\n');
      let currentWorktree = {};

      for (const line of lines) {
        if (line.startsWith('worktree ')) {
          // If we have a previous worktree, add it to the array
          if (currentWorktree.path) {
            worktrees.push(await this._enrichWorktreeInfo(currentWorktree));
          }
          currentWorktree = {
            path: line.substring(9), // Remove 'worktree ' prefix
          };
        } else if (line.startsWith('branch ')) {
          const branchRef = line.substring(7); // Remove 'branch ' prefix
          currentWorktree.branch = branchRef.startsWith('refs/heads/') 
            ? branchRef.substring(11) // Remove 'refs/heads/' prefix
            : branchRef;
        } else if (line.startsWith('HEAD ')) {
          currentWorktree.commit = line.substring(5, 13); // Get first 8 chars of commit hash
        } else if (line.startsWith('detached')) {
          currentWorktree.status = 'detached';
        } else if (line === '') {
          // Empty line indicates end of worktree entry
          if (currentWorktree.path) {
            worktrees.push(await this._enrichWorktreeInfo(currentWorktree));
            currentWorktree = {};
          }
        }
      }

      // Add the last worktree if it exists
      if (currentWorktree.path) {
        worktrees.push(await this._enrichWorktreeInfo(currentWorktree));
      }

      return worktrees;

    } catch (error) {
      if (error.errorInfo) {
        throw error;
      }
      const errorInfo = ErrorHandler.createError(
        'WORKTREE_LIST_FAILED',
        `Failed to list worktrees: ${error.message}`,
        { operation: 'list_worktrees' },
        ['Check git repository state', 'Verify worktrees exist']
      );
      const newError = new Error(errorInfo.message);
      newError.errorInfo = errorInfo;
      throw newError;
    }
  }

  /**
   * Remove a worktree and optionally delete the branch
   * Implements Requirements 2.3, 2.4 - CLI interface equivalence
   * @param {string} branchName - Name of the branch/worktree to remove
   * @param {boolean} [deleteBranch=false] - Whether to delete the branch as well
   * @returns {Promise<{worktreeRemoved: boolean, branchDeleted: boolean}>}
   */
  async removeWorktree(branchName, deleteBranch = false) {
    try {
      if (!branchName) {
        const errorInfo = ErrorHandler.createError(
          'INVALID_INPUT',
          'Branch name is required for remove action',
          { operation: 'remove_worktree', parameters: { branchName } },
          ['Provide a valid branch name', 'Use: remove <branch-name>']
        );
        const error = new Error(errorInfo.message);
        error.errorInfo = errorInfo;
        throw error;
      }

      // Find the worktree path for the branch
      const worktrees = await this.listWorktrees();
      const targetWorktree = worktrees.find(wt => wt.branch === branchName);

      if (!targetWorktree) {
        const errorInfo = ErrorHandler.createError(
          'WORKTREE_NOT_FOUND',
          `No worktree found for branch '${branchName}'`,
          { operation: 'remove_worktree', parameters: { branchName } },
          ['Check the branch name spelling', 'Use list command to see available worktrees']
        );
        const error = new Error(errorInfo.message);
        error.errorInfo = errorInfo;
        throw error;
      }

      // Remove the worktree
      await this.gitOps.executeGitCommand('worktree', ['remove', targetWorktree.path, '--force']);
      
      let branchDeleted = false;
      if (deleteBranch) {
        try {
          await this.gitOps.executeGitCommand('branch', ['-D', branchName]);
          branchDeleted = true;
        } catch (error) {
          // Branch deletion failed, but worktree was removed successfully
          // This is not a critical error
        }
      }

      return {
        worktreeRemoved: true,
        branchDeleted
      };

    } catch (error) {
      if (error.errorInfo) {
        throw error;
      }
      const errorInfo = ErrorHandler.createError(
        'WORKTREE_REMOVE_FAILED',
        `Failed to remove worktree for branch '${branchName}': ${error.message}`,
        { operation: 'remove_worktree', parameters: { branchName, deleteBranch } },
        ['Check that the worktree exists', 'Ensure no processes are using the worktree directory']
      );
      const newError = new Error(errorInfo.message);
      newError.errorInfo = errorInfo;
      throw newError;
    }
  }

  /**
   * Clean up stale worktrees
   * Implements Requirements 2.4 - CLI interface equivalence
   * @returns {Promise<{cleaned: string[], errors: string[]}>}
   */
  async cleanupStaleWorktrees() {
    try {
      const result = await this.gitOps.executeGitCommand('worktree', ['prune', '-v']);
      
      // Parse the output to extract cleaned worktrees
      const lines = result.stdout.split('\n').filter(line => line.trim());
      const cleaned = [];
      const errors = [];

      lines.forEach(line => {
        if (line.includes('Removing worktrees/')) {
          cleaned.push(line.trim());
        } else if (line.includes('error') || line.includes('failed')) {
          errors.push(line.trim());
        }
      });

      return { cleaned, errors };

    } catch (error) {
      if (error.errorInfo) {
        throw error;
      }
      const errorInfo = ErrorHandler.createError(
        'WORKTREE_CLEANUP_FAILED',
        `Failed to cleanup stale worktrees: ${error.message}`,
        { operation: 'cleanup_stale_worktrees' },
        ['Check git repository state', 'Verify worktree permissions']
      );
      const newError = new Error(errorInfo.message);
      newError.errorInfo = errorInfo;
      throw newError;
    }
  }

  /**
   * Get worktree status information
   * Implements Requirements 2.5 - CLI interface equivalence
   * @returns {Promise<Object>} Status information
   */
  async getWorktreeStatus() {
    try {
      const currentDir = process.cwd();
      const repoInfo = await this.gitOps.getRepositoryInfo();
      const worktrees = await this.listWorktrees();
      
      // Check if we're in a worktree
      let currentWorktree = null;
      for (const worktree of worktrees) {
        if (currentDir.startsWith(worktree.path) && worktree.path !== repoInfo.root) {
          currentWorktree = worktree;
          break;
        }
      }

      return {
        currentDirectory: currentDir,
        repositoryRoot: repoInfo.root,
        currentBranch: repoInfo.currentBranch,
        inWorktree: currentWorktree !== null,
        currentWorktree,
        allWorktrees: worktrees,
        remotes: repoInfo.remotes
      };

    } catch (error) {
      if (error.errorInfo) {
        throw error;
      }
      const errorInfo = ErrorHandler.createError(
        'WORKTREE_STATUS_FAILED',
        `Failed to get worktree status: ${error.message}`,
        { operation: 'get_worktree_status' },
        ['Check git repository state', 'Verify you are in a git repository']
      );
      const newError = new Error(errorInfo.message);
      newError.errorInfo = errorInfo;
      throw newError;
    }
  }

  /**
   * Get default worktree directory based on repository location
   * @private
   * @returns {string} Default worktree directory path
   */
  _getDefaultWorktreeDir() {
    try {
      const repoRoot = this.gitOps.workingDirectory;
      return path.join(path.dirname(repoRoot), 'worktrees');
    } catch (error) {
      // Fallback to current directory if we can't determine repo root
      return path.join(process.cwd(), '..', 'worktrees');
    }
  }

  /**
   * Enrich worktree information with additional metadata
   * @private
   * @param {Object} worktree - Basic worktree information
   * @returns {Promise<Worktree>} Enriched worktree information
   */
  async _enrichWorktreeInfo(worktree) {
    try {
      // Set default status if not already set
      if (!worktree.status) {
        worktree.status = 'clean';
      }

      // Try to get file stats for creation/access times
      try {
        const stats = await fs.stat(worktree.path);
        worktree.created = stats.birthtime || stats.ctime;
        worktree.lastAccessed = stats.atime;
      } catch (error) {
        // If we can't get file stats, use current time
        const now = new Date();
        worktree.created = now;
        worktree.lastAccessed = now;
      }

      // Check if worktree has uncommitted changes
      try {
        const statusCheck = await this.gitOps.executeGitCommand('status', ['--porcelain'], {
          workingDirectory: worktree.path
        });
        if (statusCheck.stdout.trim()) {
          worktree.status = 'dirty';
        }
      } catch (error) {
        // If we can't check status, assume clean
      }

      return worktree;
    } catch (error) {
      // Return basic worktree info if enrichment fails
      return {
        ...worktree,
        created: new Date(),
        lastAccessed: new Date(),
        status: worktree.status || 'clean'
      };
    }
  }
}

module.exports = WorktreeManager;