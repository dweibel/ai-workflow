/**
 * Simple Property Test for Comprehensive Help System
 * **Feature: bash-to-javascript-conversion, Property 20: Comprehensive help system**
 * **Validates: Requirements 8.5**
 */

const GitWorktreeCLI = require('../git-worktree');
const CLIUtils = require('../../shared/cli-utils');

// Capture console output for testing
function captureOutput(fn) {
  const originalLog = console.log;
  const originalError = console.error;
  let output = '';
  
  console.log = (msg) => { output += msg + '\n'; };
  console.error = (msg) => { output += msg + '\n'; };
  
  try {
    fn();
    return output;
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
}

function testComprehensiveHelpSystem() {
  console.log('🧪 Testing Comprehensive Help System Property...\n');
  
  const cli = new GitWorktreeCLI();
  let testsPassed = 0;
  let testsTotal = 0;

  // Test 1: General help display completeness
  testsTotal++;
  console.log('Test 1: General help display completeness');
  try {
    const helpOutput = captureOutput(() => {
      cli.displayHelp();
    });
    
    // Verify help contains all required sections
    const requiredSections = [
      'Git Worktree Management (JavaScript)',
      'Cross-platform git worktree management',
      'COMMANDS:',
      'OPTIONS:',
      'EXAMPLES:',
      'TROUBLESHOOTING:'
    ];
    
    for (const section of requiredSections) {
      if (!helpOutput.includes(section)) {
        throw new Error(`Missing required section: ${section}`);
      }
    }
    
    // Verify all commands are documented
    const expectedCommands = ['create', 'list', 'remove', 'cleanup', 'status', 'help'];
    for (const command of expectedCommands) {
      if (!helpOutput.includes(command)) {
        throw new Error(`Missing command in help: ${command}`);
      }
    }
    
    // Verify global options are documented
    const expectedOptions = ['--help', '--version', '--verbose', '--quiet', '--completion'];
    for (const option of expectedOptions) {
      if (!helpOutput.includes(option)) {
        throw new Error(`Missing option in help: ${option}`);
      }
    }
    
    // Verify examples are provided
    if (!helpOutput.includes('node git-worktree.js create feature/user-auth')) {
      throw new Error('Missing create command example');
    }
    if (!helpOutput.includes('node git-worktree.js list --verbose')) {
      throw new Error('Missing list command example');
    }
    
    // Verify troubleshooting guidance
    const troubleshootingItems = [
      'Ensure you are in a git repository',
      'Check that git is installed',
      'Verify branch names use only',
      'Use --verbose flag',
      'Check file permissions'
    ];
    
    for (const item of troubleshootingItems) {
      if (!helpOutput.includes(item)) {
        throw new Error(`Missing troubleshooting item: ${item}`);
      }
    }
    
    // Verify additional help guidance
    if (!helpOutput.includes('For more help on specific commands:')) {
      throw new Error('Missing command-specific help guidance');
    }
    
    console.log('✅ PASSED - General help display is comprehensive');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - General help display completeness');
    console.log('   Error:', error.message);
  }

  // Test 2: Command-specific help completeness
  testsTotal++;
  console.log('\nTest 2: Command-specific help completeness');
  try {
    const commands = ['create', 'list', 'remove', 'cleanup', 'status'];
    
    for (const command of commands) {
      const helpOutput = captureOutput(() => {
        cli.displayCommandHelp(command);
      });
      
      // Verify command help structure
      if (!helpOutput.includes(command.toUpperCase())) {
        throw new Error(`Missing command header for: ${command}`);
      }
      if (!helpOutput.includes('USAGE:')) {
        throw new Error(`Missing usage section for: ${command}`);
      }
      if (!helpOutput.includes('EXAMPLES:')) {
        throw new Error(`Missing examples section for: ${command}`);
      }
      
      // Verify usage line format
      if (!helpOutput.includes(`git-worktree.js ${command}`)) {
        throw new Error(`Missing proper usage format for: ${command}`);
      }
      
      // Verify examples are provided
      const examplePattern = new RegExp(`git-worktree\\.js ${command}`, 'g');
      const exampleMatches = helpOutput.match(examplePattern);
      if (!exampleMatches || exampleMatches.length < 1) {
        throw new Error(`Missing examples for command: ${command}`);
      }
      
      // Command-specific validations
      if (command === 'create') {
        if (!helpOutput.includes('--path') || !helpOutput.includes('--base') || !helpOutput.includes('--force')) {
          throw new Error('Create command missing expected options');
        }
        if (!helpOutput.includes('feature/user-auth')) {
          throw new Error('Create command missing branch name example');
        }
      }
      
      if (command === 'remove') {
        if (!helpOutput.includes('--delete-branch') || !helpOutput.includes('--no-delete-branch')) {
          throw new Error('Remove command missing expected options');
        }
      }
      
      if (command === 'list') {
        if (!helpOutput.includes('--verbose')) {
          throw new Error('List command missing verbose option');
        }
      }
    }
    
    console.log('✅ PASSED - Command-specific help is comprehensive');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Command-specific help completeness');
    console.log('   Error:', error.message);
  }

  // Test 3: Help for unknown commands
  testsTotal++;
  console.log('\nTest 3: Help for unknown commands');
  try {
    const helpOutput = captureOutput(() => {
      cli.displayCommandHelp('unknown-command');
    });
    
    if (!helpOutput.includes('No help available for command: unknown-command')) {
      throw new Error('Unknown command help not handled properly');
    }
    
    console.log('✅ PASSED - Unknown command help handled correctly');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Help for unknown commands');
    console.log('   Error:', error.message);
  }

  // Test 4: Version information display
  testsTotal++;
  console.log('\nTest 4: Version information display');
  try {
    const versionOutput = captureOutput(() => {
      cli.displayVersion();
    });
    
    // Verify version information structure
    if (!versionOutput.includes('Git Worktree Manager (JavaScript)')) {
      throw new Error('Missing application name in version');
    }
    if (!versionOutput.includes('v1.0.0')) {
      throw new Error('Missing version number');
    }
    if (!versionOutput.includes('Cross-platform git worktree management')) {
      throw new Error('Missing description in version');
    }
    if (!versionOutput.includes('EARS-workflow skill package')) {
      throw new Error('Missing package reference in version');
    }
    
    console.log('✅ PASSED - Version information is complete');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Version information display');
    console.log('   Error:', error.message);
  }

  // Test 5: Help system integration with CLIUtils
  testsTotal++;
  console.log('\nTest 5: Help system integration with CLIUtils');
  try {
    // Test CLIUtils.displayHelp function
    const helpConfig = {
      name: 'Test Command',
      description: 'Test description',
      commands: [
        { name: 'test', description: 'Test command' }
      ],
      options: [
        { long: 'help', short: 'h', description: 'Show help' }
      ],
      examples: [
        { command: 'test --help', description: 'Show help' }
      ]
    };
    
    const utilsHelp = CLIUtils.displayHelp(helpConfig);
    
    // Verify CLIUtils help structure
    if (!utilsHelp.includes('Test Command')) {
      throw new Error('CLIUtils help missing command name');
    }
    if (!utilsHelp.includes('Test description')) {
      throw new Error('CLIUtils help missing description');
    }
    if (!utilsHelp.includes('COMMANDS:')) {
      throw new Error('CLIUtils help missing commands section');
    }
    if (!utilsHelp.includes('OPTIONS:')) {
      throw new Error('CLIUtils help missing options section');
    }
    if (!utilsHelp.includes('EXAMPLES:')) {
      throw new Error('CLIUtils help missing examples section');
    }
    
    console.log('✅ PASSED - Help system integrates correctly with CLIUtils');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Help system integration with CLIUtils');
    console.log('   Error:', error.message);
  }

  // Test 6: Help accessibility and formatting
  testsTotal++;
  console.log('\nTest 6: Help accessibility and formatting');
  try {
    const helpOutput = captureOutput(() => {
      cli.displayHelp();
    });
    
    // Verify proper formatting and structure
    const lines = helpOutput.split('\n');
    
    // Check for proper section headers (should be in caps or have special formatting)
    const sectionHeaders = lines.filter(line => 
      line.includes('COMMANDS:') || 
      line.includes('OPTIONS:') || 
      line.includes('EXAMPLES:') ||
      line.includes('TROUBLESHOOTING:')
    );
    
    if (sectionHeaders.length < 4) {
      throw new Error('Missing section headers in help output');
    }
    
    // Check for proper indentation (examples and options should be indented)
    const indentedLines = lines.filter(line => line.startsWith('  '));
    if (indentedLines.length < 5) {
      throw new Error('Insufficient indented content in help output');
    }
    
    // Check for reasonable line lengths (accessibility)
    const longLines = lines.filter(line => line.length > 120);
    if (longLines.length > lines.length * 0.1) {
      throw new Error('Too many long lines in help output (accessibility concern)');
    }
    
    // Check for empty lines for readability
    const emptyLines = lines.filter(line => line.trim() === '');
    if (emptyLines.length < 3) {
      throw new Error('Insufficient spacing in help output');
    }
    
    console.log('✅ PASSED - Help formatting is accessible and well-structured');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Help accessibility and formatting');
    console.log('   Error:', error.message);
  }

  // Test 7: Help content accuracy and usefulness
  testsTotal++;
  console.log('\nTest 7: Help content accuracy and usefulness');
  try {
    // Test create command help accuracy
    const createHelp = captureOutput(() => {
      cli.displayCommandHelp('create');
    });
    
    // Verify accurate parameter descriptions
    if (!createHelp.includes('<branch-name>')) {
      throw new Error('Create help missing required parameter format');
    }
    if (!createHelp.includes('[base-branch]')) {
      throw new Error('Create help missing optional parameter format');
    }
    
    // Verify option descriptions are meaningful
    if (!createHelp.includes('Custom worktree directory path')) {
      throw new Error('Create help missing meaningful option description');
    }
    
    // Test remove command help accuracy
    const removeHelp = captureOutput(() => {
      cli.displayCommandHelp('remove');
    });
    
    if (!removeHelp.includes('Delete the branch without prompting')) {
      throw new Error('Remove help missing accurate option description');
    }
    
    // Verify examples are realistic and useful
    if (!createHelp.includes('feature/user-auth') || !createHelp.includes('bugfix/login-issue')) {
      throw new Error('Create help missing realistic branch name examples');
    }
    
    console.log('✅ PASSED - Help content is accurate and useful');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Help content accuracy and usefulness');
    console.log('   Error:', error.message);
  }

  // Test 8: Help system error handling
  testsTotal++;
  console.log('\nTest 8: Help system error handling');
  try {
    // Test with null/undefined inputs
    let errorOutput = captureOutput(() => {
      try {
        cli.displayCommandHelp(null);
      } catch (error) {
        console.log('Error handled gracefully');
      }
    });
    
    // Should handle gracefully without crashing
    if (errorOutput.includes('Error handled gracefully') || errorOutput.includes('No help available')) {
      // Good - error was handled
    } else {
      throw new Error('Null input not handled gracefully');
    }
    
    // Test with empty string
    errorOutput = captureOutput(() => {
      cli.displayCommandHelp('');
    });
    
    if (!errorOutput.includes('No help available for command:')) {
      throw new Error('Empty string input not handled properly');
    }
    
    console.log('✅ PASSED - Help system handles errors gracefully');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Help system error handling');
    console.log('   Error:', error.message);
  }

  // Test 9: Help system completeness across all features
  testsTotal++;
  console.log('\nTest 9: Help system completeness across all features');
  try {
    const generalHelp = captureOutput(() => {
      cli.displayHelp();
    });
    
    // Verify coverage of all major features mentioned in requirements
    const featureKeywords = [
      'worktree',
      'branch',
      'create',
      'remove',
      'list',
      'cleanup',
      'status',
      'cross-platform',
      'git repository',
      'completion'
    ];
    
    for (const keyword of featureKeywords) {
      if (!generalHelp.toLowerCase().includes(keyword.toLowerCase())) {
        throw new Error(`Help missing coverage of feature: ${keyword}`);
      }
    }
    
    // Verify help mentions key benefits
    const benefits = [
      'enhanced functionality',
      'management',
      'troubleshooting'
    ];
    
    for (const benefit of benefits) {
      if (!generalHelp.toLowerCase().includes(benefit.toLowerCase())) {
        throw new Error(`Help missing benefit description: ${benefit}`);
      }
    }
    
    console.log('✅ PASSED - Help system covers all major features');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Help system completeness across features');
    console.log('   Error:', error.message);
  }

  // Test 10: Help system consistency with bash script
  testsTotal++;
  console.log('\nTest 10: Help system consistency with bash script');
  try {
    const helpOutput = captureOutput(() => {
      cli.displayHelp();
    });
    
    // Verify similar structure to bash script help
    // Should include usage patterns similar to bash script
    if (!helpOutput.includes('node git-worktree.js create feature/user-auth')) {
      throw new Error('Missing bash-equivalent usage pattern');
    }
    if (!helpOutput.includes('node git-worktree.js list')) {
      throw new Error('Missing bash-equivalent list usage');
    }
    if (!helpOutput.includes('node git-worktree.js remove feature/user-auth')) {
      throw new Error('Missing bash-equivalent remove usage');
    }
    
    // Verify similar examples to bash script
    if (!helpOutput.includes('feature/user-auth')) {
      throw new Error('Missing bash-equivalent example branch name');
    }
    
    // Verify troubleshooting covers similar issues as bash script would
    if (!helpOutput.includes('git repository') || !helpOutput.includes('branch names')) {
      throw new Error('Missing bash-equivalent troubleshooting guidance');
    }
    
    console.log('✅ PASSED - Help system is consistent with bash script approach');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Help system consistency with bash script');
    console.log('   Error:', error.message);
  }

  // Summary
  console.log(`\n📊 Test Results: ${testsPassed}/${testsTotal} tests passed`);
  
  if (testsPassed === testsTotal) {
    console.log('🎉 All tests PASSED!');
    console.log('✅ Property 20: Comprehensive help system - VALIDATED');
    return true;
  } else {
    console.log('❌ Some tests FAILED');
    return false;
  }
}

// Run the test
if (require.main === module) {
  const success = testComprehensiveHelpSystem();
  process.exit(success ? 0 : 1);
}

module.exports = { testComprehensiveHelpSystem };