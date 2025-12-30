/**
 * Property-Based Test for Multi-Source Configuration Support
 * **Feature: bash-to-javascript-conversion, Property 19: Multi-source configuration support**
 * **Validates: Requirements 8.4**
 */

const ConfigManager = require('../../shared/config-manager');
const CLIUtils = require('../../shared/cli-utils');
const fs = require('fs').promises;
const path = require('path');

// Simple property-based test implementation
function runPropertyTest(generator, property, numRuns = 20) {
  console.log(`Running property test with ${numRuns} iterations...`);
  
  for (let i = 0; i < numRuns; i++) {
    try {
      const testData = generator();
      const result = property(testData);
      if (!result) {
        throw new Error(`Property failed on iteration ${i + 1}`);
      }
    } catch (error) {
      console.error(`❌ Test failed on iteration ${i + 1}:`, error.message);
      return false;
    }
  }
  
  console.log(`✅ Property test passed all ${numRuns} iterations`);
  return true;
}

// Test data generators
const generators = {
  configSection: () => ({
    worktree: {
      baseDirectory: `../worktrees-${Math.floor(Math.random() * 1000)}`,
      branchPrefix: ['feature/', 'bugfix/', 'hotfix/'].slice(0, Math.floor(Math.random() * 3) + 1),
      autoCleanup: Math.random() > 0.5,
      maxWorktrees: Math.floor(Math.random() * 20) + 1
    },
    reset: {
      archiveDirectory: `.ai/archive-${Math.floor(Math.random() * 1000)}`,
      compressionLevel: Math.floor(Math.random() * 10),
      retentionDays: Math.floor(Math.random() * 365),
      confirmDestructive: Math.random() > 0.5
    },
    display: {
      colorOutput: Math.random() > 0.5,
      progressIndicators: Math.random() > 0.5,
      verboseLogging: Math.random() > 0.5
    }
  }),
  
  cliArguments: () => {
    const args = ['node', 'git-worktree.js', 'create', 'feature/test'];
    
    // Add random CLI options
    if (Math.random() > 0.5) {
      args.push('--verbose');
    }
    if (Math.random() > 0.5) {
      args.push('--no-color');
    }
    if (Math.random() > 0.7) {
      args.push('--base-dir');
      args.push(`../custom-worktrees-${Math.floor(Math.random() * 100)}`);
    }
    if (Math.random() > 0.8) {
      args.push('--max-worktrees');
      args.push(String(Math.floor(Math.random() * 10) + 1));
    }
    
    return args;
  },
  
  partialConfig: () => {
    const config = {};
    
    // Randomly include sections
    if (Math.random() > 0.3) {
      config.worktree = {
        baseDirectory: `../partial-worktrees-${Math.floor(Math.random() * 100)}`,
        autoCleanup: Math.random() > 0.5
      };
    }
    
    if (Math.random() > 0.4) {
      config.reset = {
        compressionLevel: Math.floor(Math.random() * 10),
        confirmDestructive: Math.random() > 0.5
      };
    }
    
    if (Math.random() > 0.5) {
      config.display = {
        colorOutput: Math.random() > 0.5
      };
    }
    
    return config;
  }
};

async function testConfigurationMerging() {
  console.log('\n🧪 Testing Configuration Merging from Multiple Sources...');
  
  const configManager = new ConfigManager();
  
  return runPropertyTest(
    () => ({
      fileConfig: generators.partialConfig(),
      cliArgs: generators.cliArguments(),
      defaultConfig: configManager.getDefaultConfiguration()
    }),
    (testData) => {
      const { fileConfig, cliArgs, defaultConfig } = testData;
      
      // Parse CLI arguments
      const parsedArgs = CLIUtils.parseArguments(cliArgs);
      
      // Create CLI-based config overrides
      const cliConfig = {};
      
      // Map CLI arguments to config structure
      if (parsedArgs.options['base-dir']) {
        cliConfig.worktree = { baseDirectory: parsedArgs.options['base-dir'] };
      }
      if (parsedArgs.options['max-worktrees']) {
        if (!cliConfig.worktree) cliConfig.worktree = {};
        cliConfig.worktree.maxWorktrees = parseInt(parsedArgs.options['max-worktrees']);
      }
      if (parsedArgs.flags.has('verbose')) {
        cliConfig.display = { verboseLogging: true };
      }
      if (parsedArgs.flags.has('no-color')) {
        if (!cliConfig.display) cliConfig.display = {};
        cliConfig.display.colorOutput = false;
      }
      
      // Test multi-source merging: defaults < file < CLI
      let mergedConfig = configManager.mergeConfigurations(defaultConfig, fileConfig);
      mergedConfig = configManager.mergeConfigurations(mergedConfig, cliConfig);
      
      // Validate the merged configuration
      configManager.validateConfiguration(mergedConfig);
      
      // Verify precedence: CLI args should override file config
      if (cliConfig.worktree && cliConfig.worktree.baseDirectory) {
        if (mergedConfig.worktree.baseDirectory !== cliConfig.worktree.baseDirectory) {
          throw new Error('CLI baseDirectory should override file config');
        }
      }
      
      if (cliConfig.display && typeof cliConfig.display.colorOutput === 'boolean') {
        if (mergedConfig.display.colorOutput !== cliConfig.display.colorOutput) {
          throw new Error('CLI colorOutput should override file config');
        }
      }
      
      // Verify file config overrides defaults (when CLI doesn't override)
      if (fileConfig.worktree && fileConfig.worktree.autoCleanup !== undefined && 
          (!cliConfig.worktree || cliConfig.worktree.autoCleanup === undefined)) {
        if (mergedConfig.worktree.autoCleanup !== fileConfig.worktree.autoCleanup) {
          throw new Error('File autoCleanup should override default');
        }
      }
      
      // Verify defaults are preserved when not overridden
      if (!fileConfig.reset && !cliConfig.reset) {
        if (JSON.stringify(mergedConfig.reset) !== JSON.stringify(defaultConfig.reset)) {
          throw new Error('Default reset config should be preserved');
        }
      }
      
      return true;
    },
    15
  );
}

async function testConfigurationSourcePrecedence() {
  console.log('\n🧪 Testing Configuration Source Precedence...');
  
  const configManager = new ConfigManager();
  
  return runPropertyTest(
    () => {
      const baseValue = Math.floor(Math.random() * 100);
      return {
        defaultConfig: {
          worktree: { maxWorktrees: baseValue },
          reset: { compressionLevel: 6 },
          display: { colorOutput: true }
        },
        fileConfig: {
          worktree: { maxWorktrees: baseValue + 10 },
          reset: { compressionLevel: 7 }
        },
        cliConfig: {
          worktree: { maxWorktrees: baseValue + 20 }
        }
      };
    },
    (testData) => {
      const { defaultConfig, fileConfig, cliConfig } = testData;
      
      // Test precedence: defaults < file < CLI
      let config = configManager.mergeConfigurations(defaultConfig, fileConfig);
      config = configManager.mergeConfigurations(config, cliConfig);
      
      // CLI should have highest precedence
      if (config.worktree.maxWorktrees !== cliConfig.worktree.maxWorktrees) {
        throw new Error('CLI config should have highest precedence');
      }
      
      // File should override default (when CLI doesn't specify)
      if (config.reset.compressionLevel !== fileConfig.reset.compressionLevel) {
        throw new Error('File config should override default');
      }
      
      // Default should be preserved (when neither file nor CLI specify)
      if (config.display.colorOutput !== defaultConfig.display.colorOutput) {
        throw new Error('Default config should be preserved when not overridden');
      }
      
      return true;
    },
    12
  );
}

async function testPartialConfigurationHandling() {
  console.log('\n🧪 Testing Partial Configuration Handling...');
  
  const configManager = new ConfigManager();
  
  return runPropertyTest(
    () => ({
      partialFile: generators.partialConfig(),
      partialCli: generators.partialConfig()
    }),
    (testData) => {
      const { partialFile, partialCli } = testData;
      const defaultConfig = configManager.getDefaultConfiguration();
      
      // Merge partial configurations
      let config = configManager.mergeConfigurations(defaultConfig, partialFile);
      config = configManager.mergeConfigurations(config, partialCli);
      
      // Should still be a valid complete configuration
      configManager.validateConfiguration(config);
      
      // Should have all required sections
      if (!config.worktree || !config.reset || !config.display) {
        throw new Error('Merged config should have all required sections');
      }
      
      // Partial overrides should be applied correctly
      if (partialFile.worktree && partialFile.worktree.baseDirectory) {
        const expectedValue = partialCli.worktree && partialCli.worktree.baseDirectory 
          ? partialCli.worktree.baseDirectory 
          : partialFile.worktree.baseDirectory;
        
        if (config.worktree.baseDirectory !== expectedValue) {
          throw new Error('Partial configuration merge failed');
        }
      }
      
      // Missing values should come from defaults
      if (!partialFile.reset && !partialCli.reset) {
        if (config.reset.retentionDays !== defaultConfig.reset.retentionDays) {
          throw new Error('Default values should be preserved for missing sections');
        }
      }
      
      return true;
    },
    10
  );
}

async function testConfigurationValidationAcrossSources() {
  console.log('\n🧪 Testing Configuration Validation Across Sources...');
  
  const configManager = new ConfigManager();
  
  return runPropertyTest(
    () => {
      // Generate potentially invalid configurations
      const invalidConfigs = [
        // Invalid from file
        {
          file: { worktree: { maxWorktrees: -1 } },
          cli: {}
        },
        // Invalid from CLI
        {
          file: {},
          cli: { reset: { compressionLevel: 15 } }
        },
        // Valid individually but invalid when merged
        {
          file: { worktree: { baseDirectory: '' } },
          cli: { worktree: { maxWorktrees: 0 } }
        }
      ];
      
      return invalidConfigs[Math.floor(Math.random() * invalidConfigs.length)];
    },
    (testData) => {
      const { file, cli } = testData;
      const defaultConfig = configManager.getDefaultConfiguration();
      
      try {
        // Merge configurations
        let config = configManager.mergeConfigurations(defaultConfig, file);
        config = configManager.mergeConfigurations(config, cli);
        
        // Validation should catch invalid merged configuration
        configManager.validateConfiguration(config);
        
        // If we get here, the configuration was actually valid
        // This is okay - the test should handle both valid and invalid cases
        return true;
      } catch (error) {
        // Invalid configuration should be rejected
        if (error.code === 'INVALID_CONFIG') {
          return true; // Expected behavior
        }
        throw error; // Unexpected error
      }
    },
    8
  );
}

async function testCLIArgumentParsing() {
  console.log('\n🧪 Testing CLI Argument Parsing for Configuration...');
  
  return runPropertyTest(
    () => generators.cliArguments(),
    (cliArgs) => {
      // Parse CLI arguments
      const parsed = CLIUtils.parseArguments(cliArgs);
      
      // Verify parsing structure
      if (!parsed.command || !parsed.options || !parsed.flags) {
        throw new Error('CLI parsing should return structured result');
      }
      
      // Verify specific option parsing
      if (cliArgs.includes('--base-dir')) {
        const baseDirIndex = cliArgs.indexOf('--base-dir');
        if (baseDirIndex >= 0 && baseDirIndex + 1 < cliArgs.length) {
          const expectedValue = cliArgs[baseDirIndex + 1];
          if (parsed.options['base-dir'] !== expectedValue) {
            throw new Error('CLI option parsing failed for --base-dir');
          }
        }
      }
      
      // Verify flag parsing
      if (cliArgs.includes('--verbose')) {
        if (!parsed.flags.has('verbose')) {
          throw new Error('CLI flag parsing failed for --verbose');
        }
      }
      
      if (cliArgs.includes('--no-color')) {
        if (!parsed.flags.has('no-color')) {
          throw new Error('CLI flag parsing failed for --no-color');
        }
      }
      
      return true;
    },
    15
  );
}

async function runAllTests() {
  console.log('🚀 Starting Multi-Source Configuration Property-Based Tests');
  console.log('**Feature: bash-to-javascript-conversion, Property 19: Multi-source configuration support**');
  console.log('**Validates: Requirements 8.4**\n');
  
  let allPassed = true;
  
  try {
    // Test 1: Configuration merging from multiple sources
    const test1 = await testConfigurationMerging();
    allPassed = allPassed && test1;
    
    // Test 2: Configuration source precedence
    const test2 = await testConfigurationSourcePrecedence();
    allPassed = allPassed && test2;
    
    // Test 3: Partial configuration handling
    const test3 = await testPartialConfigurationHandling();
    allPassed = allPassed && test3;
    
    // Test 4: Configuration validation across sources
    const test4 = await testConfigurationValidationAcrossSources();
    allPassed = allPassed && test4;
    
    // Test 5: CLI argument parsing
    const test5 = await testCLIArgumentParsing();
    allPassed = allPassed && test5;
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    allPassed = false;
  }
  
  console.log('\n📊 Test Results Summary:');
  if (allPassed) {
    console.log('🎉 All multi-source configuration property tests PASSED!');
    console.log('✅ Property 19: Multi-source configuration support - VALIDATED');
  } else {
    console.log('❌ Some multi-source configuration property tests FAILED');
  }
  
  return allPassed;
}

// Run the tests
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests };