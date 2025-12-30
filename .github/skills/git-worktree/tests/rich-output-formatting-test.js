/**
 * Property-Based Test for Rich Output Formatting
 * **Feature: bash-to-javascript-conversion, Property 17: Rich output formatting**
 * **Validates: Requirements 8.2**
 */

const CLIInterface = require('../lib/cli-interface');
const CLIUtils = require('../../shared/cli-utils');

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
  worktreeData: () => ({
    path: `/test/worktree-${Math.floor(Math.random() * 1000)}`,
    branch: `feature/test-${Math.floor(Math.random() * 100)}`,
    commit: Math.random().toString(36).substring(2, 10),
    status: ['clean', 'dirty', 'detached'][Math.floor(Math.random() * 3)],
    created: new Date(Date.now() - Math.floor(Math.random() * 86400000)),
    lastAccessed: new Date()
  }),
  
  worktreeList: () => {
    const count = Math.floor(Math.random() * 8) + 1;
    const worktrees = [];
    for (let i = 0; i < count; i++) {
      worktrees.push(generators.worktreeData());
    }
    return worktrees;
  },
  
  statusData: () => ({
    currentDirectory: `/test/current-${Math.floor(Math.random() * 100)}`,
    repositoryRoot: `/test/repo-${Math.floor(Math.random() * 100)}`,
    currentBranch: `branch-${Math.floor(Math.random() * 50)}`,
    inWorktree: Math.random() > 0.5,
    currentWorktree: Math.random() > 0.5 ? generators.worktreeData() : null,
    remotes: Math.random() > 0.3 ? {
      origin: 'https://github.com/test/repo.git',
      upstream: Math.random() > 0.7 ? 'https://github.com/upstream/repo.git' : undefined
    } : {}
  }),
  
  progressData: () => ({
    current: Math.floor(Math.random() * 100),
    total: Math.floor(Math.random() * 100) + 1,
    message: `Processing item ${Math.floor(Math.random() * 1000)}`
  }),
  
  formattingOptions: () => ({
    colors: Math.random() > 0.5,
    icons: Math.random() > 0.5,
    compact: Math.random() > 0.5
  })
};

async function testWorktreeListFormatting() {
  console.log('\n🧪 Testing Worktree List Rich Formatting...');
  
  const cliInterface = new CLIInterface();
  
  return runPropertyTest(
    () => ({
      worktrees: generators.worktreeList(),
      options: generators.formattingOptions()
    }),
    (testData) => {
      const { worktrees, options } = testData;
      
      // Format worktree list
      const output = cliInterface.formatOutput(worktrees, 'worktree-list', options);
      
      // Verify output is a string
      if (typeof output !== 'string') {
        throw new Error('Output should be a string');
      }
      
      // Verify all worktrees are represented
      worktrees.forEach(worktree => {
        if (!output.includes(worktree.path)) {
          throw new Error(`Worktree path ${worktree.path} not found in output`);
        }
        if (!output.includes(worktree.branch)) {
          throw new Error(`Worktree branch ${worktree.branch} not found in output`);
        }
        if (!output.includes(worktree.commit)) {
          throw new Error(`Worktree commit ${worktree.commit} not found in output`);
        }
      });
      
      // Verify icons are present when enabled
      if (options.icons) {
        if (!output.includes('📁')) {
          throw new Error('Path icon should be present when icons enabled');
        }
        if (!output.includes('🌿')) {
          throw new Error('Branch icon should be present when icons enabled');
        }
        if (!output.includes('📝')) {
          throw new Error('Commit icon should be present when icons enabled');
        }
      }
      
      // Verify status information in non-compact mode
      if (!options.compact) {
        worktrees.forEach(worktree => {
          if (!output.includes(worktree.status)) {
            throw new Error(`Worktree status ${worktree.status} should be shown in non-compact mode`);
          }
        });
      }
      
      // Verify empty list handling
      if (worktrees.length === 0) {
        if (!output.includes('No worktrees found')) {
          throw new Error('Empty list should show appropriate message');
        }
      }
      
      return true;
    },
    15
  );
}

async function testStatusReportFormatting() {
  console.log('\n🧪 Testing Status Report Rich Formatting...');
  
  const cliInterface = new CLIInterface();
  
  return runPropertyTest(
    () => ({
      status: generators.statusData(),
      options: generators.formattingOptions()
    }),
    (testData) => {
      const { status, options } = testData;
      
      // Format status report
      const output = cliInterface.formatOutput(status, 'status-report', options);
      
      // Verify output structure
      if (!output.includes('Worktree Status Report')) {
        throw new Error('Status report should have title');
      }
      
      if (!output.includes('=====================')) {
        throw new Error('Status report should have separator');
      }
      
      // Verify required fields are present
      const requiredFields = [
        'Current Location:',
        'Repository Root:',
        'Current Branch:',
        'Worktree:'
      ];
      
      requiredFields.forEach(field => {
        if (!output.includes(field)) {
          throw new Error(`Status report should include ${field}`);
        }
      });
      
      // Verify field values are present
      if (!output.includes(status.currentDirectory)) {
        throw new Error('Current directory should be in output');
      }
      
      if (!output.includes(status.repositoryRoot)) {
        throw new Error('Repository root should be in output');
      }
      
      if (!output.includes(status.currentBranch)) {
        throw new Error('Current branch should be in output');
      }
      
      // Verify worktree status formatting
      if (status.inWorktree && status.currentWorktree) {
        if (!output.includes(`Yes (in ${status.currentWorktree.path})`)) {
          throw new Error('Worktree status should show path when in worktree');
        }
      } else {
        if (!output.includes('No (in main repository)')) {
          throw new Error('Worktree status should show main repository when not in worktree');
        }
      }
      
      // Verify remotes section
      if (Object.keys(status.remotes).length > 0) {
        if (!output.includes('Remotes:')) {
          throw new Error('Remotes section should be present when remotes exist');
        }
        
        Object.keys(status.remotes).forEach(remote => {
          if (!output.includes(remote)) {
            throw new Error(`Remote ${remote} should be listed`);
          }
        });
      }
      
      return true;
    },
    12
  );
}

async function testProgressIndicatorFormatting() {
  console.log('\n🧪 Testing Progress Indicator Rich Formatting...');
  
  const cliInterface = new CLIInterface();
  
  return runPropertyTest(
    () => {
      const progressData = generators.progressData();
      // Ensure current <= total
      progressData.current = Math.min(progressData.current, progressData.total);
      return progressData;
    },
    (progressData) => {
      const { current, total, message } = progressData;
      
      // Format progress indicator
      const output = cliInterface.formatOutput({ current, total, message }, 'progress');
      
      // Verify progress bar structure
      if (!output.includes('[')) {
        throw new Error('Progress bar should have opening bracket');
      }
      
      if (!output.includes(']')) {
        throw new Error('Progress bar should have closing bracket');
      }
      
      // Verify percentage calculation
      const expectedPercentage = Math.round((current / total) * 100);
      if (!output.includes(`${expectedPercentage}%`)) {
        throw new Error(`Progress should show ${expectedPercentage}%`);
      }
      
      // Verify current/total display
      if (!output.includes(`(${current}/${total})`)) {
        throw new Error(`Progress should show (${current}/${total})`);
      }
      
      // Verify message is included
      if (message && !output.includes(message)) {
        throw new Error('Progress message should be included');
      }
      
      // Verify progress bar characters
      if (!/[█░]/.test(output)) {
        throw new Error('Progress bar should contain progress characters');
      }
      
      return true;
    },
    18
  );
}

async function testColorFormatting() {
  console.log('\n🧪 Testing Color Formatting...');
  
  return runPropertyTest(
    () => ({
      text: `Test text ${Math.floor(Math.random() * 1000)}`,
      color: ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray'][Math.floor(Math.random() * 8)]
    }),
    (testData) => {
      const { text, color } = testData;
      
      // Test colorized output
      const colorizedOutput = CLIUtils.colorize(text, color);
      
      // Should contain the original text
      if (!colorizedOutput.includes(text)) {
        throw new Error('Colorized output should contain original text');
      }
      
      // When colors are supported, should have ANSI codes
      if (process.stdout.isTTY) {
        // Should have color codes (starts with escape sequence)
        if (!colorizedOutput.includes('\x1b[')) {
          throw new Error('Colorized output should contain ANSI escape codes when TTY is available');
        }
        
        // Should have reset code
        if (!colorizedOutput.includes('\x1b[0m')) {
          throw new Error('Colorized output should contain reset code');
        }
      }
      
      // Test with invalid color
      const invalidColorOutput = CLIUtils.colorize(text, 'invalid-color');
      if (invalidColorOutput !== text) {
        throw new Error('Invalid color should return original text');
      }
      
      return true;
    },
    10
  );
}

async function testIconAndSymbolFormatting() {
  console.log('\n🧪 Testing Icon and Symbol Formatting...');
  
  const cliInterface = new CLIInterface();
  
  return runPropertyTest(
    () => ({
      status: ['clean', 'dirty', 'detached'][Math.floor(Math.random() * 3)]
    }),
    (testData) => {
      const { status } = testData;
      
      // Test status icon generation
      const icon = cliInterface.getStatusIcon(status);
      const color = cliInterface.getStatusColor(status);
      
      // Icon should be a non-empty string
      if (typeof icon !== 'string' || icon.length === 0) {
        throw new Error('Status icon should be a non-empty string');
      }
      
      // Color should be a valid color name
      if (typeof color !== 'string' || color.length === 0) {
        throw new Error('Status color should be a non-empty string');
      }
      
      // Verify specific status mappings
      const expectedIcons = {
        clean: '✅',
        dirty: '⚠️',
        detached: '🔄'
      };
      
      const expectedColors = {
        clean: 'green',
        dirty: 'yellow',
        detached: 'red'
      };
      
      if (icon !== expectedIcons[status]) {
        throw new Error(`Status ${status} should have icon ${expectedIcons[status]}, got ${icon}`);
      }
      
      if (color !== expectedColors[status]) {
        throw new Error(`Status ${status} should have color ${expectedColors[status]}, got ${color}`);
      }
      
      return true;
    },
    15
  );
}

async function testFormattingConsistency() {
  console.log('\n🧪 Testing Formatting Consistency...');
  
  const cliInterface = new CLIInterface();
  
  return runPropertyTest(
    () => ({
      worktree: generators.worktreeData(),
      options1: generators.formattingOptions(),
      options2: generators.formattingOptions()
    }),
    (testData) => {
      const { worktree, options1, options2 } = testData;
      
      // Format the same data with different options
      const output1 = cliInterface.formatOutput(worktree, 'worktree-info', options1);
      const output2 = cliInterface.formatOutput(worktree, 'worktree-info', options2);
      
      // Both outputs should contain the same essential information
      const essentialInfo = [worktree.path, worktree.branch, worktree.commit, worktree.status];
      
      essentialInfo.forEach(info => {
        if (!output1.includes(info)) {
          throw new Error(`Output1 should contain ${info}`);
        }
        if (!output2.includes(info)) {
          throw new Error(`Output2 should contain ${info}`);
        }
      });
      
      // Both outputs should have consistent structure
      const structuralElements = ['Worktree Details:', 'Path:', 'Branch:', 'Commit:', 'Status:', 'Created:'];
      
      structuralElements.forEach(element => {
        if (!output1.includes(element)) {
          throw new Error(`Output1 should contain structural element ${element}`);
        }
        if (!output2.includes(element)) {
          throw new Error(`Output2 should contain structural element ${element}`);
        }
      });
      
      return true;
    },
    10
  );
}

async function runAllTests() {
  console.log('🚀 Starting Rich Output Formatting Property-Based Tests');
  console.log('**Feature: bash-to-javascript-conversion, Property 17: Rich output formatting**');
  console.log('**Validates: Requirements 8.2**\n');
  
  let allPassed = true;
  
  try {
    // Test 1: Worktree list formatting
    const test1 = await testWorktreeListFormatting();
    allPassed = allPassed && test1;
    
    // Test 2: Status report formatting
    const test2 = await testStatusReportFormatting();
    allPassed = allPassed && test2;
    
    // Test 3: Progress indicator formatting
    const test3 = await testProgressIndicatorFormatting();
    allPassed = allPassed && test3;
    
    // Test 4: Color formatting
    const test4 = await testColorFormatting();
    allPassed = allPassed && test4;
    
    // Test 5: Icon and symbol formatting
    const test5 = await testIconAndSymbolFormatting();
    allPassed = allPassed && test5;
    
    // Test 6: Formatting consistency
    const test6 = await testFormattingConsistency();
    allPassed = allPassed && test6;
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    allPassed = false;
  }
  
  console.log('\n📊 Test Results Summary:');
  if (allPassed) {
    console.log('🎉 All rich output formatting property tests PASSED!');
    console.log('✅ Property 17: Rich output formatting - VALIDATED');
  } else {
    console.log('❌ Some rich output formatting property tests FAILED');
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