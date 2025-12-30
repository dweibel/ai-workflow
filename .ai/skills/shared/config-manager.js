/**
 * Shared Configuration Manager Module
 * Provides JSON-based configuration management for JavaScript skill implementations
 */

const fs = require('fs').promises;
const path = require('path');
const ErrorHandler = require('./error-handler');

/**
 * Skill configuration structure following the design specification
 * @typedef {Object} SkillConfiguration
 * @property {Object} worktree - Worktree configuration
 * @property {string} worktree.baseDirectory - Base directory for worktrees
 * @property {string[]} worktree.branchPrefix - Allowed branch prefixes
 * @property {boolean} worktree.autoCleanup - Auto-cleanup stale worktrees
 * @property {number} worktree.maxWorktrees - Maximum concurrent worktrees
 * @property {Object} reset - Reset configuration
 * @property {string} reset.archiveDirectory - Archive storage location
 * @property {number} reset.compressionLevel - Archive compression level
 * @property {number} reset.retentionDays - Archive retention period
 * @property {boolean} reset.confirmDestructive - Require confirmation for destructive operations
 * @property {Object} display - Display configuration
 * @property {boolean} display.colorOutput - Enable colored output
 * @property {boolean} display.progressIndicators - Show progress bars
 * @property {boolean} display.verboseLogging - Enable verbose logging
 */

class ConfigManager {
  constructor() {
    this.configCache = new Map();
    this.defaultConfig = this.getDefaultConfiguration();
  }

  /**
   * Get default configuration values
   * @returns {SkillConfiguration} Default configuration
   */
  getDefaultConfiguration() {
    return {
      worktree: {
        baseDirectory: '../worktrees',
        branchPrefix: ['feature/', 'bugfix/', 'hotfix/', 'refactor/'],
        autoCleanup: false,
        maxWorktrees: 10
      },
      reset: {
        archiveDirectory: '.ai/archive',
        compressionLevel: 6,
        retentionDays: 30,
        confirmDestructive: true
      },
      display: {
        colorOutput: true,
        progressIndicators: true,
        verboseLogging: false
      }
    };
  }

  /**
   * Load configuration from file with fallback to defaults
   * @param {string} configPath - Path to configuration file
   * @returns {Promise<SkillConfiguration>} Loaded configuration
   */
  async loadConfiguration(configPath = '.ai/config/skills.json') {
    try {
      // Check cache first
      if (this.configCache.has(configPath)) {
        return this.configCache.get(configPath);
      }

      let config = { ...this.defaultConfig };

      try {
        const configFile = await fs.readFile(configPath, 'utf8');
        const userConfig = JSON.parse(configFile);
        config = this.mergeConfigurations(config, userConfig);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          // File exists but has issues - this is an error
          throw ErrorHandler.handleFileSystemError(
            error,
            'read_config',
            configPath
          );
        }
        // File doesn't exist - use defaults (not an error)
      }

      // Validate configuration
      this.validateConfiguration(config);

      // Cache the configuration
      this.configCache.set(configPath, config);

      return config;
    } catch (error) {
      if (error.code) {
        // Already a structured error
        throw error;
      }
      throw ErrorHandler.createError(
        'CONFIG_LOAD_ERROR',
        `Failed to load configuration from ${configPath}`,
        { operation: 'load_config', parameters: { configPath } },
        ['Check configuration file syntax', 'Verify file permissions']
      );
    }
  }

  /**
   * Save configuration to file
   * @param {SkillConfiguration} config - Configuration to save
   * @param {string} configPath - Path to save configuration
   * @returns {Promise<void>}
   */
  async saveConfiguration(config, configPath = '.ai/config/skills.json') {
    try {
      // Validate before saving
      this.validateConfiguration(config);

      // Ensure directory exists
      const configDir = path.dirname(configPath);
      await fs.mkdir(configDir, { recursive: true });

      // Save configuration
      await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');

      // Update cache
      this.configCache.set(configPath, config);
    } catch (error) {
      if (error.code) {
        // Already a structured error
        throw error;
      }
      throw ErrorHandler.handleFileSystemError(
        error,
        'save_config',
        configPath
      );
    }
  }

  /**
   * Merge user configuration with defaults
   * @param {SkillConfiguration} defaultConfig - Default configuration
   * @param {Partial<SkillConfiguration>} userConfig - User configuration
   * @returns {SkillConfiguration} Merged configuration
   */
  mergeConfigurations(defaultConfig, userConfig) {
    const merged = { ...defaultConfig };

    // Deep merge each section
    if (userConfig.worktree) {
      merged.worktree = { ...defaultConfig.worktree, ...userConfig.worktree };
    }
    if (userConfig.reset) {
      merged.reset = { ...defaultConfig.reset, ...userConfig.reset };
    }
    if (userConfig.display) {
      merged.display = { ...defaultConfig.display, ...userConfig.display };
    }

    return merged;
  }

  /**
   * Validate configuration structure and values
   * @param {SkillConfiguration} config - Configuration to validate
   * @throws {ErrorInformation} If configuration is invalid
   */
  validateConfiguration(config) {
    const errors = [];

    // Validate worktree configuration
    if (config.worktree) {
      if (typeof config.worktree.baseDirectory !== 'string') {
        errors.push('worktree.baseDirectory must be a string');
      }
      if (!Array.isArray(config.worktree.branchPrefix)) {
        errors.push('worktree.branchPrefix must be an array');
      }
      if (typeof config.worktree.autoCleanup !== 'boolean') {
        errors.push('worktree.autoCleanup must be a boolean');
      }
      if (typeof config.worktree.maxWorktrees !== 'number' || config.worktree.maxWorktrees < 1) {
        errors.push('worktree.maxWorktrees must be a positive number');
      }
    }

    // Validate reset configuration
    if (config.reset) {
      if (typeof config.reset.archiveDirectory !== 'string') {
        errors.push('reset.archiveDirectory must be a string');
      }
      if (typeof config.reset.compressionLevel !== 'number' || 
          config.reset.compressionLevel < 0 || config.reset.compressionLevel > 9) {
        errors.push('reset.compressionLevel must be a number between 0 and 9');
      }
      if (typeof config.reset.retentionDays !== 'number' || config.reset.retentionDays < 0) {
        errors.push('reset.retentionDays must be a non-negative number');
      }
      if (typeof config.reset.confirmDestructive !== 'boolean') {
        errors.push('reset.confirmDestructive must be a boolean');
      }
    }

    // Validate display configuration
    if (config.display) {
      if (typeof config.display.colorOutput !== 'boolean') {
        errors.push('display.colorOutput must be a boolean');
      }
      if (typeof config.display.progressIndicators !== 'boolean') {
        errors.push('display.progressIndicators must be a boolean');
      }
      if (typeof config.display.verboseLogging !== 'boolean') {
        errors.push('display.verboseLogging must be a boolean');
      }
    }

    if (errors.length > 0) {
      throw ErrorHandler.createError(
        'INVALID_CONFIG',
        'Configuration validation failed',
        { operation: 'validate_config', parameters: { errors } },
        errors.map(error => `Fix: ${error}`)
      );
    }
  }

  /**
   * Get configuration value by path (e.g., 'worktree.baseDirectory')
   * @param {SkillConfiguration} config - Configuration object
   * @param {string} path - Dot-separated path to value
   * @param {*} defaultValue - Default value if path not found
   * @returns {*} Configuration value
   */
  getConfigValue(config, path, defaultValue = undefined) {
    const keys = path.split('.');
    let current = config;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return defaultValue;
      }
    }

    return current;
  }

  /**
   * Clear configuration cache
   */
  clearCache() {
    this.configCache.clear();
  }
}

module.exports = ConfigManager;