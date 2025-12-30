/**
 * Simple test runner for configuration consistency property test
 * **Feature: bash-to-javascript-conversion, Property 9: Configuration consistency**
 */

const ConfigManager = require('./config-manager');
const fc = require('fast-check');

// Configure fast-check
fc.configureGlobal({ numRuns: 100 });

// Test data generators
const testGenerators = {
  configuration: () => fc.record({
    worktree: fc.record({
      baseDirectory: fc.string({ minLength: 1, maxLength: 100 }),
      branchPrefix: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1 }),
      autoCleanup: fc.boolean(),
      maxWorktrees: fc.integer({ min: 1, max: 100 })
    }),
    reset: fc.record({
      archiveDirectory: fc.string({ minLength: 1, maxLength: 100 }),
      compressionLevel: fc.integer({ min: 0, max: 9 }),
      retentionDays: fc.integer({ min: 0, max: 365 }),
      confirmDestructive: fc.boolean()
    }),
    display: fc.record({
      colorOutput: fc.boolean(),
      progressIndicators: fc.boolean(),
      verboseLogging: fc.boolean()
    })
  })
};

function runTests() {
  console.log('🧪 Running Property-Based Tests for Configuration Consistency...\n');
  
  const configManager = new ConfigManager();
  let testsPassed = 0;
  let testsTotal = 0;

  // Test 1: Configuration validation property
  testsTotal++;
  console.log('Test 1: Configuration validation property');
  try {
    fc.assert(fc.property(
      testGenerators.configuration(),
      (config) => {
        // Test that valid configurations pass validation
        configManager.validateConfiguration(config);
        
        // Test that the configuration has required structure
        if (!config.worktree || !config.reset || !config.display) {
          throw new Error('Missing required configuration sections');
        }
        
        // Test worktree configuration
        if (typeof config.worktree.baseDirectory !== 'string' ||
            !Array.isArray(config.worktree.branchPrefix) ||
            typeof config.worktree.autoCleanup !== 'boolean' ||
            typeof config.worktree.maxWorktrees !== 'number' ||
            config.worktree.maxWorktrees < 1) {
          throw new Error('Invalid worktree configuration');
        }
        
        // Test reset configuration
        if (typeof config.reset.archiveDirectory !== 'string' ||
            typeof config.reset.compressionLevel !== 'number' ||
            config.reset.compressionLevel < 0 || config.reset.compressionLevel > 9 ||
            typeof config.reset.retentionDays !== 'number' ||
            config.reset.retentionDays < 0 ||
            typeof config.reset.confirmDestructive !== 'boolean') {
          throw new Error('Invalid reset configuration');
        }
        
        // Test display configuration
        if (typeof config.display.colorOutput !== 'boolean' ||
            typeof config.display.progressIndicators !== 'boolean' ||
            typeof config.display.verboseLogging !== 'boolean') {
          throw new Error('Invalid display configuration');
        }
        
        return true;
      }
    ));
    console.log('✅ PASSED - Configuration validation property');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Configuration validation property');
    console.log('   Error:', error.message);
  }

  // Test 2: Default configuration validity
  testsTotal++;
  console.log('\nTest 2: Default configuration validity');
  try {
    const defaultConfig = configManager.getDefaultConfiguration();
    configManager.validateConfiguration(defaultConfig);
    
    // Verify specific structure
    if (!defaultConfig.worktree || !defaultConfig.reset || !defaultConfig.display) {
      throw new Error('Default configuration missing required sections');
    }
    
    console.log('✅ PASSED - Default configuration validity');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Default configuration validity');
    console.log('   Error:', error.message);
  }

  // Test 3: Configuration merge property
  testsTotal++;
  console.log('\nTest 3: Configuration merge property');
  try {
    fc.assert(fc.property(
      testGenerators.configuration(),
      testGenerators.configuration(),
      (defaultConfig, userConfig) => {
        const mergedConfig = configManager.mergeConfigurations(defaultConfig, userConfig);
        
        // Merged configuration should be valid
        configManager.validateConfiguration(mergedConfig);
        
        // User config values should override defaults where provided
        if (userConfig.worktree) {
          Object.keys(userConfig.worktree).forEach(key => {
            if (mergedConfig.worktree[key] !== userConfig.worktree[key]) {
              throw new Error(`Merge failed for worktree.${key}`);
            }
          });
        }
        
        return true;
      }
    ));
    console.log('✅ PASSED - Configuration merge property');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Configuration merge property');
    console.log('   Error:', error.message);
  }

  // Test 4: Invalid configuration rejection
  testsTotal++;
  console.log('\nTest 4: Invalid configuration rejection');
  try {
    const invalidConfigs = [
      // Invalid baseDirectory type
      {
        worktree: { baseDirectory: 123, branchPrefix: ['feature/'], autoCleanup: false, maxWorktrees: 5 },
        reset: { archiveDirectory: '.ai/archive', compressionLevel: 6, retentionDays: 30, confirmDestructive: true },
        display: { colorOutput: true, progressIndicators: true, verboseLogging: false }
      },
      // Invalid compressionLevel value
      {
        worktree: { baseDirectory: '../worktrees', branchPrefix: ['feature/'], autoCleanup: false, maxWorktrees: 5 },
        reset: { archiveDirectory: '.ai/archive', compressionLevel: 10, retentionDays: 30, confirmDestructive: true },
        display: { colorOutput: true, progressIndicators: true, verboseLogging: false }
      }
    ];

    let rejectedCount = 0;
    invalidConfigs.forEach(config => {
      try {
        configManager.validateConfiguration(config);
        throw new Error('Should have rejected invalid configuration');
      } catch (error) {
        if (error.code === 'INVALID_CONFIG') {
          rejectedCount++;
        } else {
          throw error;
        }
      }
    });

    if (rejectedCount !== invalidConfigs.length) {
      throw new Error(`Expected ${invalidConfigs.length} rejections, got ${rejectedCount}`);
    }

    console.log('✅ PASSED - Invalid configuration rejection');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Invalid configuration rejection');
    console.log('   Error:', error.message);
  }

  // Summary
  console.log(`\n📊 Test Results: ${testsPassed}/${testsTotal} tests passed`);
  
  if (testsPassed === testsTotal) {
    console.log('🎉 All property-based tests PASSED!');
    console.log('✅ Property 9: Configuration consistency - VALIDATED');
    return true;
  } else {
    console.log('❌ Some tests FAILED');
    return false;
  }
}

// Run the tests
if (require.main === module) {
  const success = runTests();
  process.exit(success ? 0 : 1);
}

module.exports = { runTests };