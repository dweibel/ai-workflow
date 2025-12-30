/**
 * Simple Property Test for CLI Output Format Equivalence
 * **Feature: bash-to-javascript-conversion, Property 4: Output format equivalence**
 * **Validates: Requirements 1.3, 2.2, 2.5**
 */

const CLIInterface = require('../lib/cli-interface');
const WorktreeManager = require('../lib/worktree-manager');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Simple property-based testing without external dependencies
function generateBranchName() {
  const prefixes = ['feature/', 'bugfix/', 'hotfix/', 'refactor/'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.random().toString(36).substring(2, 8);
  return prefix + suffix;
}

function generateWorktreeData() {
  return {
    path: `/test/worktrees/${generateBranchName()}`,
    branch: generateBranchName(),
    commit: Math.random().toString(16).substring(2, 10),
    status: ['clean', 'dirty', 'detached'][Math.floor(Math.random() * 3)],
    created: new Date(Date.now() - Math.random() * 86400000), // Random date within last day
    lastAccessed: new Date()
  };
}

function testOutputFormatEquivalence() {
  console.log('🧪 Testing CLI Output Format Equivalence Property...\n');
  
  const cliInterface = new CLIInterface();
  let testsPassed = 0;
  let testsTotal = 0;

  // Test 1: Worktree list output format consistency
  testsTotal++;
  console.log('Test 1: Worktree list output format consistency');
  try {
    const testWorktrees = [];
    for (let i = 0; i < 3; i++) {
      testWorktrees.push(generateWorktreeData());
    }
    
    // Test with colors disabled for consistent comparison
    const formattedOutput = cliInterface.formatOutput(testWorktrees, 'worktree-list', {
      colors: false,
      icons: true,
      compact: false
    });
    
    // Verify output contains required elements (matching bash script format)
    for (const worktree of testWorktrees) {
      if (!formattedOutput.includes(worktree.path)) {
        throw new Error(`Output missing worktree path: ${worktree.path}`);
      }
      if (!formattedOutput.includes(worktree.branch)) {
        throw new Error(`Output missing worktree branch: ${worktree.branch}`);
      }
      if (!formattedOutput.includes(worktree.commit)) {
        throw new Error(`Output missing worktree commit: ${worktree.commit}`);
      }
    }
    
    // Verify icons are present (bash script equivalent)
    if (!formattedOutput.includes('📁')) {
      throw new Error('Missing path icon (📁)');
    }
    if (!formattedOutput.includes('🌿')) {
      throw new Error('Missing branch icon (🌿)');
    }
    if (!formattedOutput.includes('📝')) {
      throw new Error('Missing commit icon (📝)');
    }
    
    console.log('✅ PASSED - Worktree list format matches bash script structure');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Worktree list format consistency');
    console.log('   Error:', error.message);
  }

  // Test 2: Worktree info output format consistency
  testsTotal++;
  console.log('\nTest 2: Worktree info output format consistency');
  try {
    const testWorktree = generateWorktreeData();
    
    const formattedInfo = cliInterface.formatOutput(testWorktree, 'worktree-info', {
      colors: false
    });
    
    // Verify output contains all required fields (matching bash script)
    const requiredElements = [
      'Worktree Details:',
      `Path:    ${testWorktree.path}`,
      `Branch:  ${testWorktree.branch}`,
      `Commit:  ${testWorktree.commit}`,
      `Status:  ${testWorktree.status}`,
      `Created: ${testWorktree.created.toLocaleString()}`
    ];
    
    for (const element of requiredElements) {
      if (!formattedInfo.includes(element)) {
        throw new Error(`Output missing required element: ${element}`);
      }
    }
    
    // Verify format structure (indentation and labels)
    const lines = formattedInfo.split('\n');
    if (lines[0] !== 'Worktree Details:') {
      throw new Error('Incorrect header format');
    }
    
    // Check label formatting (consistent spacing)
    const labelPattern = /^  [A-Za-z]+:\s+/;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() && !labelPattern.test(lines[i])) {
        throw new Error(`Incorrect label format on line ${i + 1}: ${lines[i]}`);
      }
    }
    
    console.log('✅ PASSED - Worktree info format matches bash script structure');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Worktree info format consistency');
    console.log('   Error:', error.message);
  }

  // Test 3: Status report output format consistency
  testsTotal++;
  console.log('\nTest 3: Status report output format consistency');
  try {
    const testStatus = {
      currentDirectory: '/test/current/dir',
      repositoryRoot: '/test/repo',
      currentBranch: 'main',
      inWorktree: false,
      currentWorktree: null,
      allWorktrees: [generateWorktreeData(), generateWorktreeData()],
      remotes: { origin: { fetch: 'git@github.com:test/repo.git' } }
    };
    
    const formattedStatus = cliInterface.formatOutput(testStatus, 'status-report', {
      colors: false
    });
    
    // Verify output contains all required sections (matching bash script)
    const requiredSections = [
      'Worktree Status Report',
      '=====================',
      'Current Location:',
      'Repository Root:',
      'Current Branch:',
      'Worktree:',
      'Remotes:'
    ];
    
    for (const section of requiredSections) {
      if (!formattedStatus.includes(section)) {
        throw new Error(`Output missing required section: ${section}`);
      }
    }
    
    // Verify specific values
    if (!formattedStatus.includes(testStatus.currentDirectory)) {
      throw new Error('Missing current directory');
    }
    if (!formattedStatus.includes(testStatus.repositoryRoot)) {
      throw new Error('Missing repository root');
    }
    if (!formattedStatus.includes(testStatus.currentBranch)) {
      throw new Error('Missing current branch');
    }
    
    // Verify worktree status format
    if (!formattedStatus.includes('No (in main repository)')) {
      throw new Error('Incorrect worktree status format');
    }
    
    console.log('✅ PASSED - Status report format matches bash script structure');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Status report format consistency');
    console.log('   Error:', error.message);
  }

  // Test 4: Progress indicator format consistency
  testsTotal++;
  console.log('\nTest 4: Progress indicator format consistency');
  try {
    const testCases = [
      { current: 0, total: 100, message: 'Starting' },
      { current: 50, total: 100, message: 'Processing' },
      { current: 100, total: 100, message: 'Complete' }
    ];
    
    for (const testCase of testCases) {
      const progressOutput = cliInterface.formatOutput(testCase, 'progress');
      
      // Verify progress format structure
      if (!progressOutput.includes('[') || !progressOutput.includes(']')) {
        throw new Error('Missing progress bar brackets');
      }
      if (!progressOutput.includes('%')) {
        throw new Error('Missing percentage indicator');
      }
      if (!progressOutput.includes(`(${testCase.current}/${testCase.total})`)) {
        throw new Error('Missing current/total indicator');
      }
      
      if (testCase.message && !progressOutput.includes(testCase.message)) {
        throw new Error(`Missing progress message: ${testCase.message}`);
      }
      
      // Verify percentage calculation
      const percentage = Math.round((testCase.current / testCase.total) * 100);
      if (!progressOutput.includes(`${percentage}%`)) {
        throw new Error(`Incorrect percentage calculation: expected ${percentage}%`);
      }
      
      // Verify progress bar characters
      if (!/[█░]/.test(progressOutput)) {
        throw new Error('Missing progress bar characters');
      }
    }
    
    console.log('✅ PASSED - Progress indicator format is consistent');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Progress indicator format consistency');
    console.log('   Error:', error.message);
  }

  // Test 5: Color output preservation when disabled
  testsTotal++;
  console.log('\nTest 5: Color output preservation when disabled');
  try {
    const testWorktrees = [generateWorktreeData(), generateWorktreeData()];
    
    // Format with colors enabled and disabled
    const coloredOutput = cliInterface.formatOutput(testWorktrees, 'worktree-list', {
      colors: true,
      icons: true
    });
    
    const plainOutput = cliInterface.formatOutput(testWorktrees, 'worktree-list', {
      colors: false,
      icons: true
    });
    
    // Verify that disabling colors doesn't break the format
    // Both outputs should contain the same essential information
    for (const worktree of testWorktrees) {
      if (!coloredOutput.includes(worktree.path) || !plainOutput.includes(worktree.path)) {
        throw new Error(`Path missing in colored or plain output: ${worktree.path}`);
      }
      if (!coloredOutput.includes(worktree.branch) || !plainOutput.includes(worktree.branch)) {
        throw new Error(`Branch missing in colored or plain output: ${worktree.branch}`);
      }
      if (!coloredOutput.includes(worktree.commit) || !plainOutput.includes(worktree.commit)) {
        throw new Error(`Commit missing in colored or plain output: ${worktree.commit}`);
      }
    }
    
    // Verify icons are preserved in both formats
    if (!coloredOutput.includes('📁') || !plainOutput.includes('📁')) {
      throw new Error('Path icon missing in colored or plain output');
    }
    if (!coloredOutput.includes('🌿') || !plainOutput.includes('🌿')) {
      throw new Error('Branch icon missing in colored or plain output');
    }
    
    console.log('✅ PASSED - Color output preservation works correctly');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Color output preservation');
    console.log('   Error:', error.message);
  }

  // Test 6: Empty worktree list handling
  testsTotal++;
  console.log('\nTest 6: Empty worktree list handling');
  try {
    const emptyWorktrees = [];
    const formattedOutput = cliInterface.formatOutput(emptyWorktrees, 'worktree-list', {
      colors: false,
      icons: true
    });
    
    if (!formattedOutput.includes('No worktrees found')) {
      throw new Error('Empty list not handled correctly');
    }
    
    console.log('✅ PASSED - Empty worktree list handled correctly');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Empty worktree list handling');
    console.log('   Error:', error.message);
  }

  // Test 7: Status icon and color consistency
  testsTotal++;
  console.log('\nTest 7: Status icon and color consistency');
  try {
    const testStatuses = ['clean', 'dirty', 'detached'];
    
    for (const status of testStatuses) {
      const icon = cliInterface.getStatusIcon(status);
      const color = cliInterface.getStatusColor(status);
      
      if (typeof icon !== 'string' || icon.length === 0) {
        throw new Error(`Invalid icon for status ${status}: ${icon}`);
      }
      if (typeof color !== 'string' || color.length === 0) {
        throw new Error(`Invalid color for status ${status}: ${color}`);
      }
    }
    
    // Test unknown status
    const unknownIcon = cliInterface.getStatusIcon('unknown');
    const unknownColor = cliInterface.getStatusColor('unknown');
    
    if (typeof unknownIcon !== 'string' || unknownIcon.length === 0) {
      throw new Error('Invalid icon for unknown status');
    }
    if (typeof unknownColor !== 'string' || unknownColor.length === 0) {
      throw new Error('Invalid color for unknown status');
    }
    
    console.log('✅ PASSED - Status icon and color consistency maintained');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Status icon and color consistency');
    console.log('   Error:', error.message);
  }

  // Summary
  console.log(`\n📊 Test Results: ${testsPassed}/${testsTotal} tests passed`);
  
  if (testsPassed === testsTotal) {
    console.log('🎉 All tests PASSED!');
    console.log('✅ Property 4: Output format equivalence - VALIDATED');
    return true;
  } else {
    console.log('❌ Some tests FAILED');
    return false;
  }
}

// Run the test
if (require.main === module) {
  const success = testOutputFormatEquivalence();
  process.exit(success ? 0 : 1);
}

module.exports = { testOutputFormatEquivalence };