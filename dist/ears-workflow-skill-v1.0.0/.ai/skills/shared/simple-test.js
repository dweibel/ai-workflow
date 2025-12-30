/**
 * Simple test for configuration consistency without external dependencies
 * **Feature: bash-to-javascript-conversion, Property 9: Configuration consistency**
 */

const ConfigManager = require('./config-manager');

function testConfigurationConsistency() {
  console.log('🧪 Testing Configuration Consistency Property...\n');
  
  const configManager = new ConfigManager();
  let testsPassed = 0;
  let testsTotal = 0;

  // Test 1: Default configuration is valid
  testsTotal++;
  console.log('Test 1: Default configuration validation');
  try {
    const defaultConfig = configManager.getDefaultConfiguration();
    configManager.validateConfiguration(defaultConfig);
    
    // Check structure
    if (!defaultConfig.worktree || !defaultConfig.reset || !defaultConfig.display) {
      throw new Error('Missing required sections');
    }
    
    console.log('✅ PASSED - Default configuration is valid');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Default configuration validation');
    console.log('   Error:', error.message);
  }

  // Test 2: Valid configuration passes validation
  testsTotal++;
  console.log('\nTest 2: Valid configuration validation');
  try {
    const validConfig = {
      worktree: {
        baseDirectory: '../worktrees',
        branchPrefix: ['feature/', 'bugfix/'],
        autoCleanup: true,
        maxWorktrees: 5
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
    
    configManager.validateConfiguration(validConfig);
    console.log('✅ PASSED - Valid configuration passes validation');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Valid configuration validation');
    console.log('   Error:', error.message);
  }

  // Test 3: Invalid configuration is rejected
  testsTotal++;
  console.log('\nTest 3: Invalid configuration rejection');
  try {
    const invalidConfig = {
      worktree: {
        baseDirectory: 123, // Invalid type
        branchPrefix: ['feature/'],
        autoCleanup: false,
        maxWorktrees: 5
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
    
    try {
      configManager.validateConfiguration(invalidConfig);
      throw new Error('Should have rejected invalid configuration');
    } catch (validationError) {
      if (validationError.code === 'INVALID_CONFIG') {
        console.log('✅ PASSED - Invalid configuration properly rejected');
        testsPassed++;
      } else {
        throw validationError;
      }
    }
  } catch (error) {
    console.log('❌ FAILED - Invalid configuration rejection');
    console.log('   Error:', error.message);
  }

  // Test 4: Configuration merge works correctly
  testsTotal++;
  console.log('\nTest 4: Configuration merge');
  try {
    const defaultConfig = configManager.getDefaultConfiguration();
    const userConfig = {
      worktree: {
        baseDirectory: '/custom/path',
        autoCleanup: true
      },
      display: {
        colorOutput: false
      }
    };
    
    const mergedConfig = configManager.mergeConfigurations(defaultConfig, userConfig);
    configManager.validateConfiguration(mergedConfig);
    
    // Check that user values override defaults
    if (mergedConfig.worktree.baseDirectory !== '/custom/path') {
      throw new Error('User baseDirectory not applied');
    }
    if (mergedConfig.worktree.autoCleanup !== true) {
      throw new Error('User autoCleanup not applied');
    }
    if (mergedConfig.display.colorOutput !== false) {
      throw new Error('User colorOutput not applied');
    }
    
    // Check that unspecified values remain from defaults
    if (mergedConfig.worktree.branchPrefix !== defaultConfig.worktree.branchPrefix) {
      throw new Error('Default branchPrefix not preserved');
    }
    
    console.log('✅ PASSED - Configuration merge works correctly');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Configuration merge');
    console.log('   Error:', error.message);
  }

  // Test 5: Config path access
  testsTotal++;
  console.log('\nTest 5: Configuration path access');
  try {
    const config = configManager.getDefaultConfiguration();
    
    const baseDir = configManager.getConfigValue(config, 'worktree.baseDirectory');
    if (baseDir !== config.worktree.baseDirectory) {
      throw new Error('Path access failed for existing value');
    }
    
    const nonExistent = configManager.getConfigValue(config, 'nonexistent.path', 'default');
    if (nonExistent !== 'default') {
      throw new Error('Default value not returned for non-existent path');
    }
    
    console.log('✅ PASSED - Configuration path access works');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Configuration path access');
    console.log('   Error:', error.message);
  }

  // Summary
  console.log(`\n📊 Test Results: ${testsPassed}/${testsTotal} tests passed`);
  
  if (testsPassed === testsTotal) {
    console.log('🎉 All tests PASSED!');
    console.log('✅ Property 9: Configuration consistency - VALIDATED');
    return true;
  } else {
    console.log('❌ Some tests FAILED');
    return false;
  }
}

// Run the test
if (require.main === module) {
  const success = testConfigurationConsistency();
  process.exit(success ? 0 : 1);
}

module.exports = { testConfigurationConsistency };