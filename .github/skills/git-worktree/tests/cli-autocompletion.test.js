/**
 * Simple Property Test for CLI Auto-completion Support
 * **Feature: bash-to-javascript-conversion, Property 16: CLI auto-completion support**
 * **Validates: Requirements 8.1**
 */

const CLIInterface = require('../lib/cli-interface');

function testAutoCompletionSupport() {
  console.log('🧪 Testing CLI Auto-completion Support Property...\n');
  
  const cliInterface = new CLIInterface();
  let testsPassed = 0;
  let testsTotal = 0;

  // Test 1: Bash completion script generation
  testsTotal++;
  console.log('Test 1: Bash completion script generation');
  try {
    const commands = ['create', 'list', 'remove', 'cleanup', 'status'];
    const bashCompletion = cliInterface.generateCompletion('bash', commands);
    
    // Verify bash completion structure
    if (!bashCompletion.includes('_git_worktree_completion')) {
      throw new Error('Missing bash completion function name');
    }
    if (!bashCompletion.includes('complete -F')) {
      throw new Error('Missing bash complete command');
    }
    if (!bashCompletion.includes('COMPREPLY')) {
      throw new Error('Missing COMPREPLY variable usage');
    }
    
    // Verify all commands are included
    for (const command of commands) {
      if (!bashCompletion.includes(command)) {
        throw new Error(`Missing command in completion: ${command}`);
      }
    }
    
    // Verify branch completion for create command
    if (!bashCompletion.includes('feature/') || !bashCompletion.includes('bugfix/')) {
      throw new Error('Missing branch prefix completion for create command');
    }
    
    // Verify branch completion for remove command
    if (!bashCompletion.includes('git worktree list --porcelain')) {
      throw new Error('Missing worktree branch completion for remove command');
    }
    
    // Verify installation instructions
    if (!bashCompletion.includes('~/.bashrc') && !bashCompletion.includes('Installation instructions')) {
      throw new Error('Missing installation instructions');
    }
    
    console.log('✅ PASSED - Bash completion script generated correctly');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Bash completion script generation');
    console.log('   Error:', error.message);
  }

  // Test 2: Zsh completion script generation
  testsTotal++;
  console.log('\nTest 2: Zsh completion script generation');
  try {
    const commands = ['create', 'list', 'remove', 'cleanup', 'status'];
    const zshCompletion = cliInterface.generateCompletion('zsh', commands);
    
    // Verify zsh completion structure
    if (!zshCompletion.includes('#compdef')) {
      throw new Error('Missing zsh compdef directive');
    }
    if (!zshCompletion.includes('_git_worktree')) {
      throw new Error('Missing zsh completion function name');
    }
    if (!zshCompletion.includes('_arguments')) {
      throw new Error('Missing zsh _arguments usage');
    }
    
    // Verify all commands are included
    for (const command of commands) {
      if (!zshCompletion.includes(command)) {
        throw new Error(`Missing command in completion: ${command}`);
      }
    }
    
    // Verify option completions
    if (!zshCompletion.includes('--help') || !zshCompletion.includes('--version')) {
      throw new Error('Missing global option completions');
    }
    
    // Verify command-specific completions
    if (!zshCompletion.includes('_git_worktree_branch_prefixes')) {
      throw new Error('Missing branch prefix completion function');
    }
    if (!zshCompletion.includes('_git_worktree_existing_branches')) {
      throw new Error('Missing existing branch completion function');
    }
    
    // Verify installation instructions
    if (!zshCompletion.includes('~/.zshrc')) {
      throw new Error('Missing zsh installation instructions');
    }
    
    console.log('✅ PASSED - Zsh completion script generated correctly');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Zsh completion script generation');
    console.log('   Error:', error.message);
  }

  // Test 3: Fish completion script generation
  testsTotal++;
  console.log('\nTest 3: Fish completion script generation');
  try {
    const commands = ['create', 'list', 'remove', 'cleanup', 'status'];
    const fishCompletion = cliInterface.generateCompletion('fish', commands);
    
    // Verify fish completion structure
    if (!fishCompletion.includes('complete -c git-worktree.js')) {
      throw new Error('Missing fish complete command');
    }
    if (!fishCompletion.includes('__fish_use_subcommand')) {
      throw new Error('Missing fish subcommand detection');
    }
    if (!fishCompletion.includes('__fish_seen_subcommand_from')) {
      throw new Error('Missing fish subcommand completion');
    }
    
    // Verify all commands are included with descriptions
    for (const command of commands) {
      if (!fishCompletion.includes(`-a '${command}'`)) {
        throw new Error(`Missing command completion: ${command}`);
      }
    }
    
    // Verify global options
    if (!fishCompletion.includes('-l help') || !fishCompletion.includes('-l version')) {
      throw new Error('Missing global option completions');
    }
    
    // Verify command-specific options
    if (!fishCompletion.includes('-l path') || !fishCompletion.includes('-l base')) {
      throw new Error('Missing create command option completions');
    }
    if (!fishCompletion.includes('-l delete-branch')) {
      throw new Error('Missing remove command option completions');
    }
    
    // Verify installation instructions
    if (!fishCompletion.includes('~/.config/fish/completions/')) {
      throw new Error('Missing fish installation instructions');
    }
    
    console.log('✅ PASSED - Fish completion script generated correctly');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Fish completion script generation');
    console.log('   Error:', error.message);
  }

  // Test 4: Unsupported shell handling
  testsTotal++;
  console.log('\nTest 4: Unsupported shell handling');
  try {
    const commands = ['create', 'list'];
    
    try {
      cliInterface.generateCompletion('unsupported-shell', commands);
      throw new Error('Should have thrown error for unsupported shell');
    } catch (error) {
      if (!error.message.includes('Unsupported shell')) {
        throw new Error('Wrong error message for unsupported shell');
      }
    }
    
    console.log('✅ PASSED - Unsupported shell properly rejected');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Unsupported shell handling');
    console.log('   Error:', error.message);
  }

  // Test 5: Command description consistency
  testsTotal++;
  console.log('\nTest 5: Command description consistency');
  try {
    const commands = ['create', 'list', 'remove', 'cleanup', 'status', 'help'];
    
    for (const command of commands) {
      const description = cliInterface.getCommandDescription(command);
      
      if (typeof description !== 'string' || description.length === 0) {
        throw new Error(`Invalid description for command ${command}: ${description}`);
      }
      
      // Verify description is meaningful (not just the command name)
      if (description === command) {
        throw new Error(`Description is just the command name for: ${command}`);
      }
    }
    
    // Test unknown command
    const unknownDescription = cliInterface.getCommandDescription('unknown-command');
    if (typeof unknownDescription !== 'string' || unknownDescription.length === 0) {
      throw new Error('Invalid description for unknown command');
    }
    
    console.log('✅ PASSED - Command descriptions are consistent');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Command description consistency');
    console.log('   Error:', error.message);
  }

  // Test 6: Completion script completeness for different command sets
  testsTotal++;
  console.log('\nTest 6: Completion script completeness for different command sets');
  try {
    const testCommandSets = [
      ['create'],
      ['create', 'list'],
      ['create', 'list', 'remove'],
      ['create', 'list', 'remove', 'cleanup', 'status']
    ];
    
    for (const commands of testCommandSets) {
      for (const shell of ['bash', 'zsh', 'fish']) {
        const completion = cliInterface.generateCompletion(shell, commands);
        
        // Verify all commands in the set are included
        for (const command of commands) {
          if (!completion.includes(command)) {
            throw new Error(`Command ${command} missing from ${shell} completion`);
          }
        }
        
        // Verify completion is not empty
        if (completion.length < 100) {
          throw new Error(`${shell} completion script too short for commands: ${commands.join(', ')}`);
        }
      }
    }
    
    console.log('✅ PASSED - Completion scripts complete for different command sets');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Completion script completeness');
    console.log('   Error:', error.message);
  }

  // Test 7: Completion script syntax validation (basic)
  testsTotal++;
  console.log('\nTest 7: Completion script syntax validation');
  try {
    const commands = ['create', 'list', 'remove', 'cleanup', 'status'];
    
    // Test bash completion syntax
    const bashCompletion = cliInterface.generateCompletion('bash', commands);
    
    // Basic bash syntax checks
    const bashFunctionStart = bashCompletion.indexOf('_git_worktree_completion() {');
    const bashFunctionEnd = bashCompletion.lastIndexOf('}');
    if (bashFunctionStart === -1 || bashFunctionEnd === -1 || bashFunctionStart >= bashFunctionEnd) {
      throw new Error('Invalid bash function structure');
    }
    
    // Check for balanced quotes and brackets
    const bashQuotes = (bashCompletion.match(/"/g) || []).length;
    if (bashQuotes % 2 !== 0) {
      throw new Error('Unbalanced quotes in bash completion');
    }
    
    // Test zsh completion syntax
    const zshCompletion = cliInterface.generateCompletion('zsh', commands);
    
    // Basic zsh syntax checks
    if (!zshCompletion.includes('_git_worktree() {') || !zshCompletion.includes('_git_worktree "$@"')) {
      throw new Error('Invalid zsh function structure');
    }
    
    // Test fish completion syntax
    const fishCompletion = cliInterface.generateCompletion('fish', commands);
    
    // Basic fish syntax checks
    const completeCommands = (fishCompletion.match(/complete -c git-worktree\.js/g) || []).length;
    if (completeCommands < commands.length) {
      throw new Error('Insufficient complete commands in fish completion');
    }
    
    console.log('✅ PASSED - Completion script syntax is valid');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Completion script syntax validation');
    console.log('   Error:', error.message);
  }

  // Test 8: Context-aware completion features
  testsTotal++;
  console.log('\nTest 8: Context-aware completion features');
  try {
    const commands = ['create', 'list', 'remove', 'cleanup', 'status'];
    
    // Test bash completion context awareness
    const bashCompletion = cliInterface.generateCompletion('bash', commands);
    
    // Verify create command gets branch prefixes
    if (!bashCompletion.includes('create)') || 
        !bashCompletion.includes('feature/ bugfix/ hotfix/ refactor/')) {
      throw new Error('Create command missing branch prefix completion');
    }
    
    // Verify remove command gets existing branches
    if (!bashCompletion.includes('remove)') || 
        !bashCompletion.includes('git worktree list --porcelain')) {
      throw new Error('Remove command missing existing branch completion');
    }
    
    // Verify help command gets command list
    if (!bashCompletion.includes('help)') || 
        !bashCompletion.includes('$(compgen -W "$commands"')) {
      throw new Error('Help command missing command list completion');
    }
    
    // Test zsh completion context awareness
    const zshCompletion = cliInterface.generateCompletion('zsh', commands);
    
    // Verify create command options
    if (!zshCompletion.includes('create)') || 
        !zshCompletion.includes('--path') || 
        !zshCompletion.includes('--base')) {
      throw new Error('Create command missing option completions in zsh');
    }
    
    // Verify remove command options
    if (!zshCompletion.includes('remove)') || 
        !zshCompletion.includes('--delete-branch')) {
      throw new Error('Remove command missing option completions in zsh');
    }
    
    console.log('✅ PASSED - Context-aware completion features work correctly');
    testsPassed++;
  } catch (error) {
    console.log('❌ FAILED - Context-aware completion features');
    console.log('   Error:', error.message);
  }

  // Summary
  console.log(`\n📊 Test Results: ${testsPassed}/${testsTotal} tests passed`);
  
  if (testsPassed === testsTotal) {
    console.log('🎉 All tests PASSED!');
    console.log('✅ Property 16: CLI auto-completion support - VALIDATED');
    return true;
  } else {
    console.log('❌ Some tests FAILED');
    return false;
  }
}

// Run the test
if (require.main === module) {
  const success = testAutoCompletionSupport();
  process.exit(success ? 0 : 1);
}

module.exports = { testAutoCompletionSupport };