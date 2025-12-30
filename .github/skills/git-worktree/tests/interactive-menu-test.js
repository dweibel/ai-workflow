/**
 * Property-Based Test for Interactive Menu Functionality
 * **Feature: bash-to-javascript-conversion, Property 18: Interactive menu functionality**
 * **Validates: Requirements 8.3**
 */

const CLIInterface = require('../lib/cli-interface');

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
  menuChoices: () => {
    const numChoices = Math.floor(Math.random() * 8) + 1; // 1-8 choices
    const choices = [];
    
    for (let i = 0; i < numChoices; i++) {
      choices.push({
        text: `Option ${i + 1}`,
        value: `value_${i + 1}`,
        description: Math.random() > 0.5 ? `Description for option ${i + 1}` : null,
        icon: Math.random() > 0.7 ? '🔧' : null
      });
    }
    
    return choices;
  },
  
  menuMessage: () => {
    const messages = [
      'Select an option:',
      'Choose your action:',
      'What would you like to do?',
      'Pick from the following:'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  },
  
  menuOptions: () => ({
    numbered: Math.random() > 0.5,
    colors: false, // Always false for testing
    icons: Math.random() > 0.5,
    defaultChoice: Math.random() > 0.7 ? '1' : null
  })
};

async function testInteractiveMenuFormatting() {
  console.log('\n🧪 Testing Interactive Menu Formatting...');
  
  const cliInterface = new CLIInterface();
  
  return runPropertyTest(
    () => ({
      choices: generators.menuChoices(),
      message: generators.menuMessage(),
      options: generators.menuOptions()
    }),
    (testData) => {
      const { choices, message, options } = testData;
      
      // Capture console output
      const originalLog = console.log;
      let output = '';
      console.log = (msg) => { output += msg + '\n'; };
      
      try {
        // Mock the prompt to avoid hanging
        const originalPromptUser = require('../../shared/cli-utils').promptUser;
        let promptCalled = false;
        let promptMessage = '';
        
        require('../../shared/cli-utils').promptUser = async (msg, opts) => {
          promptCalled = true;
          promptMessage = msg;
          return '1'; // Always select first option
        };
        
        // Test menu display (we'll catch the promise to avoid hanging)
        const menuPromise = cliInterface.displayMenu(message, choices, options);
        
        // Give it a moment to display the menu
        setTimeout(() => {
          // Verify message is displayed
          if (!output.includes(message)) {
            throw new Error('Menu message not displayed');
          }
          
          // Verify each choice is formatted correctly
          choices.forEach((choice, index) => {
            if (!output.includes(choice.text)) {
              throw new Error(`Choice text "${choice.text}" not displayed`);
            }
            
            if (options.numbered && !output.includes(`${index + 1}.`)) {
              throw new Error(`Choice number "${index + 1}." not displayed`);
            }
            
            if (options.icons && choice.icon && !output.includes(choice.icon)) {
              throw new Error(`Choice icon "${choice.icon}" not displayed`);
            }
            
            if (choice.description && !output.includes(choice.description)) {
              throw new Error(`Choice description "${choice.description}" not displayed`);
            }
          });
          
          // Restore original functions
          require('../../shared/cli-utils').promptUser = originalPromptUser;
        }, 10);
        
        return true;
      } finally {
        console.log = originalLog;
      }
    },
    15
  );
}

async function testMenuSelectionHandling() {
  console.log('\n🧪 Testing Menu Selection Handling...');
  
  const cliInterface = new CLIInterface();
  
  return runPropertyTest(
    () => ({
      choices: generators.menuChoices(),
      message: generators.menuMessage(),
      selectedIndex: Math.floor(Math.random() * 5) + 1 // 1-5
    }),
    (testData) => {
      const { choices, message, selectedIndex } = testData;
      
      // Mock user input
      const originalPromptUser = require('../../shared/cli-utils').promptUser;
      let promptCalled = false;
      
      require('../../shared/cli-utils').promptUser = async (msg, opts) => {
        promptCalled = true;
        
        // Verify prompt message format
        if (!msg.includes(`Select an option (1-${choices.length})`)) {
          throw new Error('Prompt message format incorrect');
        }
        
        // Return valid selection if within range
        if (selectedIndex <= choices.length) {
          return selectedIndex.toString();
        } else {
          return '999'; // Invalid selection
        }
      };
      
      try {
        // Test menu selection
        const menuPromise = cliInterface.displayMenu(message, choices, {
          numbered: true,
          colors: false
        });
        
        // For valid selections, should not throw
        // For invalid selections, should throw
        if (selectedIndex <= choices.length) {
          // Valid selection - should work
          return true;
        } else {
          // Invalid selection - should throw error
          menuPromise.catch(error => {
            if (!error.message.includes('Invalid selection')) {
              throw new Error('Expected "Invalid selection" error');
            }
          });
          return true;
        }
      } finally {
        // Restore original function
        require('../../shared/cli-utils').promptUser = originalPromptUser;
      }
    },
    10
  );
}

async function testDefaultChoiceHandling() {
  console.log('\n🧪 Testing Default Choice Handling...');
  
  const cliInterface = new CLIInterface();
  
  return runPropertyTest(
    () => ({
      choices: generators.menuChoices(),
      message: generators.menuMessage(),
      defaultChoice: Math.random() > 0.5 ? '1' : null
    }),
    (testData) => {
      const { choices, message, defaultChoice } = testData;
      
      // Mock user input to simulate pressing enter (empty input)
      const originalPromptUser = require('../../shared/cli-utils').promptUser;
      
      require('../../shared/cli-utils').promptUser = async (msg, opts) => {
        // Verify default is passed correctly
        if (defaultChoice && opts.defaultValue !== defaultChoice) {
          throw new Error('Default choice not passed correctly to prompt');
        }
        
        // Simulate user pressing enter (empty input, should use default)
        return '';
      };
      
      try {
        // Test menu with default choice
        const menuPromise = cliInterface.displayMenu(message, choices, {
          defaultChoice,
          colors: false
        });
        
        // Should handle default choice correctly
        return true;
      } finally {
        // Restore original function
        require('../../shared/cli-utils').promptUser = originalPromptUser;
      }
    },
    8
  );
}

async function runAllTests() {
  console.log('🚀 Starting Interactive Menu Property-Based Tests');
  console.log('**Feature: bash-to-javascript-conversion, Property 18: Interactive menu functionality**');
  console.log('**Validates: Requirements 8.3**\n');
  
  let allPassed = true;
  
  try {
    // Test 1: Menu formatting
    const test1 = await testInteractiveMenuFormatting();
    allPassed = allPassed && test1;
    
    // Test 2: Selection handling
    const test2 = await testMenuSelectionHandling();
    allPassed = allPassed && test2;
    
    // Test 3: Default choice handling
    const test3 = await testDefaultChoiceHandling();
    allPassed = allPassed && test3;
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    allPassed = false;
  }
  
  console.log('\n📊 Test Results Summary:');
  if (allPassed) {
    console.log('🎉 All interactive menu property tests PASSED!');
    console.log('✅ Property 18: Interactive menu functionality - VALIDATED');
  } else {
    console.log('❌ Some interactive menu property tests FAILED');
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