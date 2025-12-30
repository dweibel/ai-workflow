/**
 * Property-Based Tests for Configuration Manager
 * **Feature: bash-to-javascript-conversion, Property 9: Configuration consistency**
 * **Validates: Requirements 4.1, 4.2, 4.4**
 */

const ConfigManager = require('../config-manager');
const ErrorHandler = require('../error-handler');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

describe('ConfigManager Property-Based Tests', () => {
  let configManager;
  let tempDir;

  beforeEach(async () => {
    configManager = new ConfigManager();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'config-test-'));
  });

  afterEach(async () => {
    // Clean up temp directory
    try {
      await fs.rmdir(tempDir, { recursive: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  /**
   * **Feature: bash-to-javascript-conversion, Property 9: Configuration consistency**
   * For any configuration requirement, the system should use JSON-based configuration files 
   * that follow the project's established schema and validation patterns
   */
  test('Property 9: Configuration consistency - JSON schema validation', () => {
    fc.assert(fc.property(
      testGenerators.configuration(),
      (config) => {
        // Test that valid configurations pass validation
        expect(() => configManager.validateConfiguration(config)).not.toThrow();
        
        // Test that the configuration follows the expected structure
        expect(config).toBeValidConfiguration();
        
        // Test that all required fields are present
        expect(config).toHaveProperty('worktree');
        expect(config).toHaveProperty('reset');
        expect(config).toHaveProperty('display');
        
        // Test worktree configuration structure
        expect(config.worktree).toHaveProperty('baseDirectory');
        expect(config.worktree).toHaveProperty('branchPrefix');
        expect(config.worktree).toHaveProperty('autoCleanup');
        expect(config.worktree).toHaveProperty('maxWorktrees');
        
        // Test reset configuration structure
        expect(config.reset).toHaveProperty('archiveDirectory');
        expect(config.reset).toHaveProperty('compressionLevel');
        expect(config.reset).toHaveProperty('retentionDays');
        expect(config.reset).toHaveProperty('confirmDestructive');
        
        // Test display configuration structure
        expect(config.display).toHaveProperty('colorOutput');
        expect(config.display).toHaveProperty('progressIndicators');
        expect(config.display).toHaveProperty('verboseLogging');
        
        return true;
      }
    ));
  });

  test('Property 9: Configuration consistency - Save and load round trip', async () => {
    await fc.assert(fc.asyncProperty(
      testGenerators.configuration(),
      async (originalConfig) => {
        const configPath = path.join(tempDir, 'test-config.json');
        
        // Save configuration
        await configManager.saveConfiguration(originalConfig, configPath);
        
        // Load configuration
        const loadedConfig = await configManager.loadConfiguration(configPath);
        
        // Verify round trip consistency
        expect(loadedConfig).toEqual(originalConfig);
        expect(loadedConfig).toBeValidConfiguration();
        
        return true;
      }
    ));
  });

  test('Property 9: Configuration consistency - Default configuration is always valid', () => {
    const defaultConfig = configManager.getDefaultConfiguration();
    
    // Test that default configuration is valid
    expect(() => configManager.validateConfiguration(defaultConfig)).not.toThrow();
    expect(defaultConfig).toBeValidConfiguration();
    
    // Test specific default values match expected types
    expect(typeof defaultConfig.worktree.baseDirectory).toBe('string');
    expect(Array.isArray(defaultConfig.worktree.branchPrefix)).toBe(true);
    expect(typeof defaultConfig.worktree.autoCleanup).toBe('boolean');
    expect(typeof defaultConfig.worktree.maxWorktrees).toBe('number');
    expect(defaultConfig.worktree.maxWorktrees).toBeGreaterThan(0);
    
    expect(typeof defaultConfig.reset.archiveDirectory).toBe('string');
    expect(typeof defaultConfig.reset.compressionLevel).toBe('number');
    expect(defaultConfig.reset.compressionLevel).toBeGreaterThanOrEqual(0);
    expect(defaultConfig.reset.compressionLevel).toBeLessThanOrEqual(9);
    expect(typeof defaultConfig.reset.retentionDays).toBe('number');
    expect(defaultConfig.reset.retentionDays).toBeGreaterThanOrEqual(0);
    expect(typeof defaultConfig.reset.confirmDestructive).toBe('boolean');
    
    expect(typeof defaultConfig.display.colorOutput).toBe('boolean');
    expect(typeof defaultConfig.display.progressIndicators).toBe('boolean');
    expect(typeof defaultConfig.display.verboseLogging).toBe('boolean');
  });

  test('Property 9: Configuration consistency - Merge preserves structure', () => {
    fc.assert(fc.property(
      testGenerators.configuration(),
      testGenerators.configuration(),
      (defaultConfig, userConfig) => {
        const mergedConfig = configManager.mergeConfigurations(defaultConfig, userConfig);
        
        // Merged configuration should be valid
        expect(() => configManager.validateConfiguration(mergedConfig)).not.toThrow();
        expect(mergedConfig).toBeValidConfiguration();
        
        // User config values should override defaults where provided
        if (userConfig.worktree) {
          Object.keys(userConfig.worktree).forEach(key => {
            expect(mergedConfig.worktree[key]).toEqual(userConfig.worktree[key]);
          });
        }
        
        if (userConfig.reset) {
          Object.keys(userConfig.reset).forEach(key => {
            expect(mergedConfig.reset[key]).toEqual(userConfig.reset[key]);
          });
        }
        
        if (userConfig.display) {
          Object.keys(userConfig.display).forEach(key => {
            expect(mergedConfig.display[key]).toEqual(userConfig.display[key]);
          });
        }
        
        return true;
      }
    ));
  });

  test('Property 9: Configuration consistency - Invalid configurations are rejected', () => {
    // Test invalid worktree configurations
    const invalidConfigs = [
      // Invalid baseDirectory type
      {
        worktree: { baseDirectory: 123, branchPrefix: ['feature/'], autoCleanup: false, maxWorktrees: 5 },
        reset: { archiveDirectory: '.ai/archive', compressionLevel: 6, retentionDays: 30, confirmDestructive: true },
        display: { colorOutput: true, progressIndicators: true, verboseLogging: false }
      },
      // Invalid branchPrefix type
      {
        worktree: { baseDirectory: '../worktrees', branchPrefix: 'feature/', autoCleanup: false, maxWorktrees: 5 },
        reset: { archiveDirectory: '.ai/archive', compressionLevel: 6, retentionDays: 30, confirmDestructive: true },
        display: { colorOutput: true, progressIndicators: true, verboseLogging: false }
      },
      // Invalid maxWorktrees value
      {
        worktree: { baseDirectory: '../worktrees', branchPrefix: ['feature/'], autoCleanup: false, maxWorktrees: 0 },
        reset: { archiveDirectory: '.ai/archive', compressionLevel: 6, retentionDays: 30, confirmDestructive: true },
        display: { colorOutput: true, progressIndicators: true, verboseLogging: false }
      },
      // Invalid compressionLevel value
      {
        worktree: { baseDirectory: '../worktrees', branchPrefix: ['feature/'], autoCleanup: false, maxWorktrees: 5 },
        reset: { archiveDirectory: '.ai/archive', compressionLevel: 10, retentionDays: 30, confirmDestructive: true },
        display: { colorOutput: true, progressIndicators: true, verboseLogging: false }
      },
      // Invalid retentionDays value
      {
        worktree: { baseDirectory: '../worktrees', branchPrefix: ['feature/'], autoCleanup: false, maxWorktrees: 5 },
        reset: { archiveDirectory: '.ai/archive', compressionLevel: 6, retentionDays: -1, confirmDestructive: true },
        display: { colorOutput: true, progressIndicators: true, verboseLogging: false }
      }
    ];

    invalidConfigs.forEach(config => {
      expect(() => configManager.validateConfiguration(config)).toThrow();
    });
  });

  test('Property 9: Configuration consistency - Config path access works correctly', () => {
    fc.assert(fc.property(
      testGenerators.configuration(),
      (config) => {
        // Test getting existing values
        expect(configManager.getConfigValue(config, 'worktree.baseDirectory'))
          .toBe(config.worktree.baseDirectory);
        expect(configManager.getConfigValue(config, 'reset.compressionLevel'))
          .toBe(config.reset.compressionLevel);
        expect(configManager.getConfigValue(config, 'display.colorOutput'))
          .toBe(config.display.colorOutput);
        
        // Test getting non-existent values with defaults
        expect(configManager.getConfigValue(config, 'nonexistent.path', 'default'))
          .toBe('default');
        expect(configManager.getConfigValue(config, 'worktree.nonexistent', null))
          .toBe(null);
        
        return true;
      }
    ));
  });

  test('Property 9: Configuration consistency - Error handling follows structured format', async () => {
    const invalidJsonPath = path.join(tempDir, 'invalid.json');
    await fs.writeFile(invalidJsonPath, '{ invalid json }', 'utf8');
    
    try {
      await configManager.loadConfiguration(invalidJsonPath);
      fail('Should have thrown an error for invalid JSON');
    } catch (error) {
      // Error should follow structured format
      expect(error).toBeValidErrorInfo();
      expect(error.code).toBeDefined();
      expect(error.message).toBeDefined();
      expect(error.context).toBeDefined();
      expect(Array.isArray(error.suggestions)).toBe(true);
    }
  });
});