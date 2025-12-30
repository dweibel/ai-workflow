/**
 * Metadata Handler Module
 * Provides JSON metadata generation and management for archives
 */

const { execSync } = require('child_process');
const os = require('os');
const ErrorHandler = require('../../shared/error-handler');

/**
 * Archive metadata structure following the design specification
 * @typedef {Object} ArchiveMetadata
 * @property {string} version - Metadata format version
 * @property {string} created - Archive creation timestamp
 * @property {string} operation - Operation type (light, medium, full, custom)
 * @property {Object} source - Source information
 * @property {string} source.path - Original project path
 * @property {string} [source.gitCommit] - Git commit at archive time
 * @property {string} [source.gitBranch] - Git branch at archive time
 * @property {Object} contents - Archive contents information
 * @property {string[]} contents.directories - Archived directory paths
 * @property {string[]} contents.files - Archived file paths
 * @property {number} contents.totalSize - Total archive size in bytes
 * @property {Object} restoration - Restoration information
 * @property {string[]} restoration.compatible - Compatible restoration targets
 * @property {string[]} restoration.requirements - System requirements for restoration
 */

class MetadataHandler {
  /**
   * Generate comprehensive metadata for archive operation
   * @param {string} operation - Operation type (archive, restore, etc.)
   * @param {Object} options - Additional options
   * @returns {Promise<ArchiveMetadata>} Generated metadata
   */
  async generateMetadata(operation, options = {}) {
    try {
      const metadata = {
        version: '1.0.0',
        created: new Date().toISOString(),
        operation: options.resetLevel || operation,
        source: {
          path: process.cwd(),
          gitCommit: this._getCurrentGitCommit(),
          gitBranch: this._getCurrentGitBranch(),
          user: os.userInfo().username,
          platform: process.platform,
          nodeVersion: process.version
        },
        contents: {
          directories: this._getArchivedDirectories(options),
          files: [], // Will be populated during archive creation
          totalSize: 0 // Will be calculated during archive creation
        },
        restoration: {
          compatible: this._getCompatibleTargets(),
          requirements: this._getSystemRequirements()
        },
        metadata: {
          generator: 'project-reset-manager',
          generatorVersion: '1.0.0',
          ...options
        }
      };

      // Validate metadata structure
      this.validateMetadata(metadata);

      return metadata;
    } catch (error) {
      throw ErrorHandler.createError(
        'METADATA_GENERATION_FAILED',
        `Failed to generate metadata: ${error.message}`,
        { operation: 'generate_metadata', parameters: { operation, options } },
        ['Check git repository state', 'Verify system information access']
      );
    }
  }

  /**
   * Validate metadata structure and required fields
   * @param {ArchiveMetadata} metadata - Metadata to validate
   * @throws {ErrorInformation} If metadata is invalid
   */
  validateMetadata(metadata) {
    const errors = [];

    // Validate required top-level fields
    if (!metadata.version) {
      errors.push('Missing required field: version');
    }
    if (!metadata.created) {
      errors.push('Missing required field: created');
    }
    if (!metadata.operation) {
      errors.push('Missing required field: operation');
    }

    // Validate source information
    if (!metadata.source) {
      errors.push('Missing required field: source');
    } else {
      if (!metadata.source.path) {
        errors.push('Missing required field: source.path');
      }
    }

    // Validate contents information
    if (!metadata.contents) {
      errors.push('Missing required field: contents');
    } else {
      if (!Array.isArray(metadata.contents.directories)) {
        errors.push('contents.directories must be an array');
      }
      if (!Array.isArray(metadata.contents.files)) {
        errors.push('contents.files must be an array');
      }
      if (typeof metadata.contents.totalSize !== 'number') {
        errors.push('contents.totalSize must be a number');
      }
    }

    // Validate restoration information
    if (!metadata.restoration) {
      errors.push('Missing required field: restoration');
    } else {
      if (!Array.isArray(metadata.restoration.compatible)) {
        errors.push('restoration.compatible must be an array');
      }
      if (!Array.isArray(metadata.restoration.requirements)) {
        errors.push('restoration.requirements must be an array');
      }
    }

    // Validate timestamp format
    if (metadata.created) {
      try {
        new Date(metadata.created);
      } catch (error) {
        errors.push('created timestamp must be a valid ISO date string');
      }
    }

    // Validate operation type
    const validOperations = ['light', 'medium', 'full', 'custom', 'archive', 'restore'];
    if (metadata.operation && !validOperations.includes(metadata.operation)) {
      errors.push(`operation must be one of: ${validOperations.join(', ')}`);
    }

    if (errors.length > 0) {
      throw ErrorHandler.createError(
        'INVALID_METADATA',
        'Metadata validation failed',
        { operation: 'validate_metadata', parameters: { errors } },
        errors.map(error => `Fix: ${error}`)
      );
    }
  }

  /**
   * Format metadata for display
   * @param {ArchiveMetadata} metadata - Metadata to format
   * @returns {string} Formatted metadata display
   */
  formatMetadataDisplay(metadata) {
    const lines = [];
    
    lines.push(`Archive Information:`);
    lines.push(`  Version:      ${metadata.version}`);
    lines.push(`  Created:      ${new Date(metadata.created).toLocaleString()}`);
    lines.push(`  Operation:    ${metadata.operation}`);
    lines.push(``);
    
    lines.push(`Source Information:`);
    lines.push(`  Path:         ${metadata.source.path}`);
    if (metadata.source.gitCommit) {
      lines.push(`  Git Commit:   ${metadata.source.gitCommit.substring(0, 8)}`);
    }
    if (metadata.source.gitBranch) {
      lines.push(`  Git Branch:   ${metadata.source.gitBranch}`);
    }
    lines.push(`  User:         ${metadata.source.user || 'unknown'}`);
    lines.push(`  Platform:     ${metadata.source.platform || 'unknown'}`);
    lines.push(``);
    
    lines.push(`Contents:`);
    lines.push(`  Directories:  ${metadata.contents.directories.length}`);
    lines.push(`  Files:        ${metadata.contents.files?.total || 0}`);
    if (metadata.contents.totalSize) {
      lines.push(`  Total Size:   ${this._formatFileSize(metadata.contents.totalSize)}`);
    }
    lines.push(``);
    
    if (metadata.contents.directories.length > 0) {
      lines.push(`Archived Directories:`);
      metadata.contents.directories.forEach(dir => {
        lines.push(`  • ${dir}`);
      });
      lines.push(``);
    }
    
    lines.push(`Restoration:`);
    lines.push(`  Compatible:   ${metadata.restoration.compatible.join(', ')}`);
    if (metadata.restoration.requirements.length > 0) {
      lines.push(`  Requirements:`);
      metadata.restoration.requirements.forEach(req => {
        lines.push(`    • ${req}`);
      });
    }
    
    return lines.join('\n');
  }

  /**
   * Migrate from bash metadata format (if needed)
   * @param {Object} bashMetadata - Legacy bash metadata
   * @returns {ArchiveMetadata} Converted metadata
   */
  migrateFromBashMetadata(bashMetadata) {
    try {
      // Convert bash metadata structure to new JSON format
      const metadata = {
        version: '1.0.0',
        created: bashMetadata.timestamp || new Date().toISOString(),
        operation: bashMetadata.resetType || 'unknown',
        source: {
          path: process.cwd(),
          gitCommit: bashMetadata.gitCommit || 'unknown',
          user: bashMetadata.user || 'unknown'
        },
        contents: {
          directories: [],
          files: {
            memory: bashMetadata.filesArchived?.memory || 0,
            docs: bashMetadata.filesArchived?.docs || 0,
            total: bashMetadata.filesArchived?.total || 0
          },
          totalSize: 0
        },
        restoration: {
          compatible: ['project-reset-manager'],
          requirements: ['Node.js runtime', 'Git repository']
        },
        metadata: {
          generator: 'bash-to-js-migration',
          originalFormat: 'bash',
          migrated: new Date().toISOString()
        }
      };

      this.validateMetadata(metadata);
      return metadata;
    } catch (error) {
      throw ErrorHandler.createError(
        'MIGRATION_FAILED',
        `Failed to migrate bash metadata: ${error.message}`,
        { operation: 'migrate_metadata', parameters: { bashMetadata } },
        ['Check bash metadata format', 'Verify required fields exist']
      );
    }
  }

  /**
   * Get current git commit hash
   * @private
   * @returns {string} Git commit hash or 'unknown'
   */
  _getCurrentGitCommit() {
    try {
      return execSync('git rev-parse HEAD', { encoding: 'utf8', stdio: 'pipe' }).trim();
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Get current git branch name
   * @private
   * @returns {string} Git branch name or 'unknown'
   */
  _getCurrentGitBranch() {
    try {
      return execSync('git branch --show-current', { encoding: 'utf8', stdio: 'pipe' }).trim();
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Get directories that will be archived based on options
   * @private
   * @param {Object} options - Archive options
   * @returns {string[]} Array of directory paths
   */
  _getArchivedDirectories(options) {
    const directories = [];
    
    // Standard directories based on reset level
    if (options.resetLevel === 'light' || options.resetLevel === 'full') {
      directories.push('.ai/docs/plans', '.ai/docs/tasks', '.ai/docs/reviews', 
                     '.ai/docs/requirements', '.ai/docs/design');
    }
    
    if (options.resetLevel === 'medium' || options.resetLevel === 'full') {
      directories.push('.ai/memory');
    }
    
    // Custom paths
    if (options.customPaths) {
      directories.push(...options.customPaths);
    }
    
    return directories;
  }

  /**
   * Get compatible restoration targets
   * @private
   * @returns {string[]} Array of compatible targets
   */
  _getCompatibleTargets() {
    return [
      'project-reset-manager',
      'ears-workflow-skill',
      'compound-engineering'
    ];
  }

  /**
   * Get system requirements for restoration
   * @private
   * @returns {string[]} Array of system requirements
   */
  _getSystemRequirements() {
    return [
      'Node.js runtime (v14 or higher)',
      'Git repository',
      'File system write permissions',
      '.ai directory structure'
    ];
  }

  /**
   * Format file size for human-readable display
   * @private
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size string
   */
  _formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  }
}

module.exports = MetadataHandler;