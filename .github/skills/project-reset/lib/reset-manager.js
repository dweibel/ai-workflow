/**
 * Project Reset Manager Module
 * Provides enhanced project reset functionality with archive support
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const ErrorHandler = require('../../shared/error-handler');
const FileOperations = require('../../shared/file-operations');
const ConfigManager = require('../../shared/config-manager');
const ArchiveManager = require('./archive-manager');
const MetadataHandler = require('./metadata-handler');

/**
 * Reset operation levels
 * @typedef {'light'|'medium'|'full'|'custom'} ResetLevel
 */

/**
 * Reset options
 * @typedef {Object} ResetOptions
 * @property {boolean} confirm - Skip confirmation prompts
 * @property {boolean} noArchive - Skip archiving before reset
 * @property {boolean} clearArchive - Clear old archives before reset
 * @property {number} archiveLimit - Keep only N most recent archives
 * @property {string[]} customPaths - Custom paths to reset (for custom level)
 */

class ResetManager {
  constructor() {
    this.configManager = new ConfigManager();
    this.archiveManager = new ArchiveManager();
    this.metadataHandler = new MetadataHandler();
  }

  /**
   * Perform project reset operation
   * @param {ResetLevel} level - Reset level (light, medium, full, custom)
   * @param {ResetOptions} options - Reset options
   * @returns {Promise<Object>} Reset result with archive information
   */
  async performReset(level, options = {}) {
    try {
      // Validate reset level
      const validLevels = ['light', 'medium', 'full', 'custom'];
      if (!validLevels.includes(level)) {
        throw ErrorHandler.createError(
          'INVALID_RESET_LEVEL',
          `Invalid reset level: ${level}`,
          { operation: 'perform_reset', parameters: { level, options } },
          [`Valid levels: ${validLevels.join(', ')}`]
        );
      }

      // Load configuration
      const config = await this.configManager.loadConfiguration();

      // Validate repository
      await this._validateRepository();

      // Get reset definition
      const resetDefinition = this._getResetDefinition(level, options);

      // Create archive before reset (unless disabled)
      let archiveInfo = null;
      if (!options.noArchive) {
        archiveInfo = await this.createArchive(`${level}-reset`, {
          resetLevel: level,
          customPaths: options.customPaths
        });
      }

      // Perform the reset operations
      const resetResult = await this._executeReset(resetDefinition, config);

      // Clean up old archives if requested
      if (options.clearArchive) {
        await this._cleanupArchives(config, 0);
      } else if (options.archiveLimit) {
        await this._cleanupArchives(config, options.archiveLimit);
      }

      return {
        success: true,
        level,
        resetResult,
        archiveInfo,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }
      throw ErrorHandler.createError(
        'RESET_OPERATION_FAILED',
        `Reset operation failed: ${error.message}`,
        { operation: 'perform_reset', parameters: { level, options } },
        ['Check repository state', 'Verify file permissions']
      );
    }
  }

  /**
   * Create archive with metadata
   * @param {string} archiveName - Name for the archive
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Archive information
   */
  async createArchive(archiveName, metadata = {}) {
    try {
      const config = await this.configManager.loadConfiguration();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fullArchiveName = `${timestamp}-${archiveName}`;
      const archivePath = path.join(config.reset.archiveDirectory, fullArchiveName);

      // Ensure archive directory exists
      await FileOperations.ensureDirectory(config.reset.archiveDirectory);

      // Generate comprehensive metadata
      const archiveMetadata = await this.metadataHandler.generateMetadata('archive', {
        archiveName: fullArchiveName,
        originalName: archiveName,
        ...metadata
      });

      // Create the archive
      await this.archiveManager.createArchive('.', archivePath, archiveMetadata);

      return {
        name: fullArchiveName,
        path: archivePath,
        metadata: archiveMetadata,
        created: new Date().toISOString()
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }
      throw ErrorHandler.createError(
        'ARCHIVE_CREATION_FAILED',
        `Failed to create archive: ${error.message}`,
        { operation: 'create_archive', parameters: { archiveName, metadata } },
        ['Check disk space', 'Verify write permissions']
      );
    }
  }

  /**
   * Restore from archive
   * @param {string} archiveName - Name of archive to restore
   * @param {Object} options - Restoration options
   * @returns {Promise<Object>} Restoration result
   */
  async restoreFromArchive(archiveName, options = {}) {
    try {
      const config = await this.configManager.loadConfiguration();
      const archivePath = path.join(config.reset.archiveDirectory, archiveName);

      // Validate archive exists and is valid
      const isValid = await this.archiveManager.validateArchive(archivePath);
      if (!isValid) {
        throw ErrorHandler.createError(
          'INVALID_ARCHIVE',
          `Archive validation failed: ${archiveName}`,
          { operation: 'restore_archive', parameters: { archiveName } },
          ['Check archive integrity', 'Verify archive was not corrupted']
        );
      }

      // Create backup of current state before restoration
      const backupInfo = await this.createArchive('pre-restore', {
        restorationSource: archiveName
      });

      // Extract archive
      await this.archiveManager.extractArchive(archivePath, '.');

      return {
        success: true,
        restoredFrom: archiveName,
        backupCreated: backupInfo.name,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }
      throw ErrorHandler.createError(
        'RESTORE_OPERATION_FAILED',
        `Failed to restore from archive: ${error.message}`,
        { operation: 'restore_archive', parameters: { archiveName } },
        ['Verify archive exists', 'Check file permissions']
      );
    }
  }

  /**
   * List available archives
   * @returns {Promise<Array>} List of archive information
   */
  async listArchives() {
    try {
      const config = await this.configManager.loadConfiguration();
      const archiveDir = config.reset.archiveDirectory;

      // Check if archive directory exists
      try {
        await fs.access(archiveDir);
      } catch (error) {
        return []; // No archives directory means no archives
      }

      const entries = await fs.readdir(archiveDir, { withFileTypes: true });
      const archives = [];

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const archivePath = path.join(archiveDir, entry.name);
          try {
            const metadata = await this.archiveManager.getArchiveMetadata(archivePath);
            archives.push({
              name: entry.name,
              path: archivePath,
              metadata,
              valid: await this.archiveManager.validateArchive(archivePath)
            });
          } catch (error) {
            // Archive has issues, include with error info
            archives.push({
              name: entry.name,
              path: archivePath,
              metadata: null,
              valid: false,
              error: error.message
            });
          }
        }
      }

      // Sort by creation date (newest first)
      archives.sort((a, b) => {
        const aDate = a.metadata?.created || '0';
        const bDate = b.metadata?.created || '0';
        return bDate.localeCompare(aDate);
      });

      return archives;
    } catch (error) {
      throw ErrorHandler.handleFileSystemError(error, 'list_archives', 'archive directory');
    }
  }

  /**
   * Get reset definition for a specific level
   * @private
   * @param {ResetLevel} level - Reset level
   * @param {ResetOptions} options - Reset options
   * @returns {Object} Reset definition
   */
  _getResetDefinition(level, options) {
    const definitions = {
      light: {
        description: 'Clear documentation only, keep all memory',
        resetMemory: false,
        resetDocs: true,
        paths: [
          '.ai/docs/plans',
          '.ai/docs/tasks', 
          '.ai/docs/reviews',
          '.ai/docs/requirements',
          '.ai/docs/design'
        ]
      },
      medium: {
        description: 'Reset memory files only, keep documentation',
        resetMemory: true,
        resetDocs: false,
        paths: [
          '.ai/memory/lessons.md',
          '.ai/memory/decisions.md'
        ]
      },
      full: {
        description: 'Reset memory to templates, clear project-specific docs',
        resetMemory: true,
        resetDocs: true,
        paths: [
          '.ai/memory/lessons.md',
          '.ai/memory/decisions.md',
          '.ai/docs/plans',
          '.ai/docs/tasks',
          '.ai/docs/reviews', 
          '.ai/docs/requirements',
          '.ai/docs/design'
        ]
      },
      custom: {
        description: 'Custom reset with user-specified paths',
        resetMemory: false,
        resetDocs: false,
        paths: options.customPaths || []
      }
    };

    return definitions[level];
  }

  /**
   * Execute the reset operations
   * @private
   * @param {Object} resetDefinition - Reset definition
   * @param {Object} config - Configuration
   * @returns {Promise<Object>} Reset execution result
   */
  async _executeReset(resetDefinition, config) {
    const results = {
      memoryReset: false,
      docsCleared: [],
      filesProcessed: 0,
      errors: []
    };

    try {
      // Reset memory files if required
      if (resetDefinition.resetMemory) {
        await this._resetMemoryFiles();
        results.memoryReset = true;
      }

      // Clear documentation if required
      if (resetDefinition.resetDocs) {
        for (const docPath of resetDefinition.paths) {
          if (docPath.includes('docs/')) {
            try {
              await this._clearDocumentationDirectory(docPath);
              results.docsCleared.push(docPath);
            } catch (error) {
              results.errors.push(`Failed to clear ${docPath}: ${error.message}`);
            }
          }
        }
      }

      // Process custom paths
      for (const customPath of resetDefinition.paths) {
        if (!customPath.includes('docs/') && !customPath.includes('memory/')) {
          try {
            await this._processCustomPath(customPath);
            results.filesProcessed++;
          } catch (error) {
            results.errors.push(`Failed to process ${customPath}: ${error.message}`);
          }
        }
      }

      return results;
    } catch (error) {
      throw ErrorHandler.createError(
        'RESET_EXECUTION_FAILED',
        `Reset execution failed: ${error.message}`,
        { operation: 'execute_reset', parameters: { resetDefinition } },
        ['Check file permissions', 'Verify template files exist']
      );
    }
  }

  /**
   * Reset memory files to templates
   * @private
   */
  async _resetMemoryFiles() {
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Reset lessons.md
    const lessonsTemplate = await fs.readFile('.ai/templates/lessons.template.md', 'utf8');
    const lessonsContent = lessonsTemplate.replace(/\[DATE\]/g, currentDate);
    await fs.writeFile('.ai/memory/lessons.md', lessonsContent, 'utf8');

    // Reset decisions.md  
    const decisionsTemplate = await fs.readFile('.ai/templates/decisions.template.md', 'utf8');
    const decisionsContent = decisionsTemplate.replace(/\[DATE\]/g, currentDate);
    await fs.writeFile('.ai/memory/decisions.md', decisionsContent, 'utf8');
  }

  /**
   * Clear documentation directory
   * @private
   * @param {string} dirPath - Directory path to clear
   */
  async _clearDocumentationDirectory(dirPath) {
    try {
      await fs.access(dirPath);
      
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const entryPath = path.join(dirPath, entry.name);
        
        // Skip README.md and template files
        if (entry.name === 'README.md' || entry.name.endsWith('.template.md')) {
          continue;
        }
        
        if (entry.isDirectory()) {
          // Recursively clear subdirectories
          await this._clearDocumentationDirectory(entryPath);
        } else {
          await fs.unlink(entryPath);
        }
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      // Directory doesn't exist, nothing to clear
    }
  }

  /**
   * Process custom path for reset
   * @private
   * @param {string} customPath - Custom path to process
   */
  async _processCustomPath(customPath) {
    try {
      const stats = await fs.stat(customPath);
      
      if (stats.isDirectory()) {
        await FileOperations.removeDirectory(customPath, { force: true });
      } else {
        await fs.unlink(customPath);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      // File/directory doesn't exist, nothing to process
    }
  }

  /**
   * Validate repository state
   * @private
   */
  async _validateRepository() {
    try {
      // Check if we're in a repository root (has .ai directory)
      await fs.access('.ai');
    } catch (error) {
      throw ErrorHandler.createError(
        'INVALID_REPOSITORY',
        'This script must be run from the repository root (where .ai directory exists)',
        { operation: 'validate_repository' },
        ['Navigate to repository root directory', 'Ensure .ai directory exists']
      );
    }
  }

  /**
   * Clean up old archives
   * @private
   * @param {Object} config - Configuration
   * @param {number} limit - Number of archives to keep (0 = remove all)
   */
  async _cleanupArchives(config, limit) {
    try {
      const archives = await this.listArchives();
      
      if (archives.length <= limit) {
        return; // Nothing to clean up
      }

      // Remove oldest archives beyond the limit
      const archivesToRemove = archives.slice(limit);
      
      for (const archive of archivesToRemove) {
        await FileOperations.removeDirectory(archive.path, { force: true });
      }
    } catch (error) {
      // Non-critical error, log but don't fail the operation
      console.warn(`Warning: Failed to cleanup archives: ${error.message}`);
    }
  }

  /**
   * Get current git commit hash
   * @private
   * @returns {string} Git commit hash or 'unknown'
   */
  _getCurrentGitCommit() {
    try {
      return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    } catch (error) {
      return 'unknown';
    }
  }
}

module.exports = ResetManager;