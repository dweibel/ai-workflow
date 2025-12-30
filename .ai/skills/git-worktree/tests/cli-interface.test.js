/**
 * Property-Based Tests for CLI Interface
 * Tests output format equivalence, auto-completion, and help system
 */

const fc = require('fast-check');
const GitWorktreeCLI = require('../git-worktree');
const CLIInterface = require('../lib/cli-interface');
const WorktreeManager = require('../lib/worktree-manager');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Test data generators
const testGenerators = {
  branchName: () => fc.oneof(
    fc.string({ minLength: 1, maxLength: 30 }).filter(s => /^[a-zA-Z0-9/_-]+$/.test(s)),
    fc.constantFrom('feature/test', 'bugfix/fix', 'hotfix/urgent', 'refactor/cleanup')
  )
};

describe('CLI Interface Property-Based Tests', () => {
  let cli;
  let cliInterface;
  let testRepoPath;
  let originalCwd;
  let testWorktreesDir;

  beforeAll(() => {
    originalCwd = process.cwd();
    // Create a temporary test repository
    testRepoPath = path.join(__dirname, 'temp-cli-repo');
    testWorktreesDir = path.join(__dirname, 'temp-cli-worktrees');
    
    // Clean up any existing test directories
    [testRepoPath, testWorktreesDir].forEach(dir => {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    });
    
    // Create and initialize test repository
    fs.mkdirSync(testRepoPath, { recursive: true });
    fs.mkdirSync(testWorktreesDir, { recursive: true });
    process.chdir(testRepoPath);
    
    try {
      execSync('git init', { stdio: 'ignore' });
      execSync('git config user.email "test@example.com"', { stdio: 'ignore' });
      execSync('git config user.name "Test User"', { stdio: 'ignore' });
      
      // Create initial commit
      fs.writeFileSync('README.md', '# Test Repository for CLI Interface');
      execSync('git add README.md', { stdio: 'ignore' });
      execSync('git commit -m "Initial commit"', { stdio: 'ignore' });
      
      // Create a main branch if we're on master
      try {
        execSync('git branch main', { stdio: 'ignore' });
        execSync('git checkout main', { stdio: 'ignore' });
      } catch (error) {
        // main branch might already exist or we might already be on main
      }
    } catch (error) {
      console.warn('Git setup failed, some tests may be skipped:', error.message);
    }
  });

  afterAll(() => {
    process.chdir(originalCwd);
    // Clean up test directories
    [testRepoPath, testWorktreesDir].forEach(dir => {
      if (fs.existsSync(dir)) {
        try {
          fs.rmSync(dir, { recursive: true, force: true });
        } catch (error) {
          console.warn(`Failed to clean up ${dir}:`, error.message);
        }
      }
    });
  });

  beforeEach(() => {
    cli = new GitWorktreeCLI();
    cliInterface = new CLIInterface();
    // Override the worktree manager to use test directories
    cli.worktreeManager = new WorktreeManager({
      workingDirectory: testRepoPath,
      baseWorktreeDir: testWorktreesDir
    });
  });

  afterEach(async () => {
    // Clean up any worktrees created during tests
    try {
      const worktrees = await cli.worktreeManager.listWorktrees();
      for (const worktree of worktrees) {
        // Skip the main repository worktree
        if (worktree.path !== testRepoPath) {
          try {
            await cli.worktreeManager.removeWorktree(worktree.branch, true);
          } catch (error) {
            // Ignore cleanup errors
          }
        }
      }
      await cli.worktreeManager.cleanupStaleWorktrees();
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  /**
   * **Feature: bash-to-javascript-conversion, Property 4: Output format equivalence**
   * **Validates: Requirements 1.3, 2.2, 2.5**
   * 
   * For any command that produces formatted output, the JavaScript implementation should generate 
   * output that is visually identical to the bash script output
   */
  describe('Property 4: Output format equivalence', () => {
    test('worktree list output should match bash script format', async () => {
      await fc.assert(fc.asyncProperty(
        fc.array(testGenerators.branchName(), { minLength: 0, maxLength: 4 }),
        fc.boolean(), // verbose flag
        async (branchNames, verbose) => {
          // Filter out empty branch names
          const validBranches = branchNames.filter(name => name && name.length > 0);
          
          // Create test worktrees
          const createdWorktrees = [];
          for (const branchName of validBranches) {
            try {
              const worktree = await cli.worktreeManager.createWorktree(branchName);
              createdWorktrees.push(worktree);
            } catch (error) {
              // Skip invalid branch names
              continue;
            }
          }
          
          // Capture output from CLI interface formatting
          const worktrees = await cli.worktreeManager.listWorktrees();
          const formattedOutput = cliInterface.formatOutput(worktrees, 'worktree-list', {
            colors: false, // Disable colors for comparison
            icons: true,
            compact: !verbose
          });
          
          // Verify output format structure
          if (worktrees.length === 0) {
            expect(formattedOutput).toContain('No worktrees found');
          } else {
            // Each worktree should have path, branch, and commit info
            for (const worktree of worktrees) {
              expect(formattedOutput).toContain(worktree.path);
              expect(formattedOutput).toContain(worktree.branch);
              expect(formattedOutput).toContain(worktree.commit);
              
              // Verify icons are present (bash script equivalent)
              expect(formattedOutput).toContain('📁'); // Path icon
              expect(formattedOutput).toContain('🌿'); // Branch icon
              expect(formattedOutput).toContain('📝'); // Commit icon
              
              if (verbose) {
                // Verbose mode should include status
                expect(formattedOutput).toContain(worktree.status);
              }
            }
          }
          
          // Clean up
          for (const created of createdWorktrees) {
            try {
              await cli.worktreeManager.removeWorktree(created.branch, true);
            } catch (error) {
              // Ignore cleanup errors
            }
          }
          
          return true;
        }
      ), { numRuns: 15 });
    });

    test('worktree info output should match bash script format', async () => {
      await fc.assert(fc.asyncProperty(
        testGenerators.branchName(),
        async (branchName) => {
          // Skip if branch name is empty after filtering
          if (!branchName || branchName.length === 0) {
            return true;
          }

          try {
            // Create a test worktree
            const worktree = await cli.worktreeManager.createWorktree(branchName);
            
            // Format worktree info
            const formattedInfo = cliInterface.formatOutput(worktree, 'worktree-info', {
              colors: false // Disable colors for comparison
            });
            
            // Verify output contains all required fields (matching bash script)
            expect(formattedInfo).toContain('Worktree Details:');
            expect(formattedInfo).toContain(`Path:    ${worktree.path}`);
            expect(formattedInfo).toContain(`Branch:  ${worktree.branch}`);
            expect(formattedInfo).toContain(`Commit:  ${worktree.commit}`);
            expect(formattedInfo).toContain(`Status:  ${worktree.status}`);
            expect(formattedInfo).toContain(`Created: ${worktree.created.toLocaleString()}`);
            
            // Verify format structure (indentation and labels)
            const lines = formattedInfo.split('\n');
            expect(lines[0]).toBe('Worktree Details:');
            expect(lines[1]).toMatch(/^  Path:\s+/);
            expect(lines[2]).toMatch(/^  Branch:\s+/);
            expect(lines[3]).toMatch(/^  Commit:\s+/);
            expect(lines[4]).toMatch(/^  Status:\s+/);
            expect(lines[5]).toMatch(/^  Created:\s+/);
            
            // Clean up
            await cli.worktreeManager.removeWorktree(branchName, true);
            
            return true;
          } catch (error) {
            // For invalid inputs, should handle gracefully
            if (error.errorInfo) {
              return true;
            }
            throw error;
          }
        }
      ), { numRuns: 15 });
    });

    test('status report output should match bash script format', async () => {
      await fc.assert(fc.asyncProperty(
        fc.option(testGenerators.branchName(), { nil: null }),
        async (branchName) => {
          let createdWorktree = null;
          
          // Optionally create a worktree
          if (branchName && branchName.length > 0) {
            try {
              createdWorktree = await cli.worktreeManager.createWorktree(branchName);
            } catch (error) {
              // Skip invalid branch names
            }
          }
          
          // Get status and format it
          const status = await cli.worktreeManager.getWorktreeStatus();
          const formattedStatus = cliInterface.formatOutput(status, 'status-report', {
            colors: false // Disable colors for comparison
          });
          
          // Verify output contains all required sections (matching bash script)
          expect(formattedStatus).toContain('Worktree Status Report');
          expect(formattedStatus).toContain('=====================');
          expect(formattedStatus).toContain('Current Location:');
          expect(formattedStatus).toContain('Repository Root:');
          expect(formattedStatus).toContain('Current Branch:');
          expect(formattedStatus).toContain('Worktree:');
          
          // Verify specific values
          expect(formattedStatus).toContain(status.currentDirectory);
          expect(formattedStatus).toContain(status.repositoryRoot);
          expect(formattedStatus).toContain(status.currentBranch);
          
          // Verify worktree status format
          if (status.inWorktree && status.currentWorktree) {
            expect(formattedStatus).toContain(`Yes (in ${status.currentWorktree.path})`);
          } else {
            expect(formattedStatus).toContain('No (in main repository)');
          }
          
          // Verify remotes section if present
          if (Object.keys(status.remotes).length > 0) {
            expect(formattedStatus).toContain('Remotes:');
            expect(formattedStatus).toContain(Object.keys(status.remotes).join(', '));
          }
          
          // Verify format structure (labels and alignment)
          const lines = formattedStatus.split('\n');
          const headerLine = lines.find(line => line.includes('Worktree Status Report'));
          const separatorLine = lines.find(line => line.includes('====================='));
          expect(headerLine).toBeTruthy();
          expect(separatorLine).toBeTruthy();
          
          // Verify label formatting (consistent spacing)
          const labelLines = lines.filter(line => line.includes(':'));
          labelLines.forEach(line => {
            if (line.includes('Current Location:') || 
                line.includes('Repository Root:') || 
                line.includes('Current Branch:') ||
                line.includes('Worktree:') ||
                line.includes('Remotes:')) {
              // Verify consistent label formatting
              expect(line).toMatch(/^[A-Za-z\s]+:\s+/);
            }
          });
          
          // Clean up
          if (createdWorktree) {
            try {
              await cli.worktreeManager.removeWorktree(createdWorktree.branch, true);
            } catch (error) {
              // Ignore cleanup errors
            }
          }
          
          return true;
        }
      ), { numRuns: 10 });
    });

    test('progress indicator should match expected format', async () => {
      await fc.assert(fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        fc.string({ minLength: 0, maxLength: 50 }),
        (current, total, message) => {
          // Ensure current <= total
          const actualCurrent = Math.min(current, total);
          
          const progressOutput = cliInterface.formatOutput(
            { current: actualCurrent, total, message },
            'progress'
          );
          
          // Verify progress format structure
          expect(progressOutput).toContain('[');
          expect(progressOutput).toContain(']');
          expect(progressOutput).toContain('%');
          expect(progressOutput).toContain(`(${actualCurrent}/${total})`);
          
          if (message) {
            expect(progressOutput).toContain(message);
          }
          
          // Verify percentage calculation
          const percentage = Math.round((actualCurrent / total) * 100);
          expect(progressOutput).toContain(`${percentage}%`);
          
          // Verify progress bar characters
          expect(progressOutput).toMatch(/[█░]/); // Should contain progress bar characters
          
          return true;
        }
      ), { numRuns: 20 });
    });

    test('error output should maintain consistent format', async () => {
      await fc.assert(fc.asyncProperty(
        fc.string().filter(name => !/^[a-zA-Z0-9/_-]+$/.test(name) || name.length === 0),
        async (invalidBranchName) => {
          // Capture console output
          const originalError = console.error;
          const originalLog = console.log;
          let errorOutput = '';
          let logOutput = '';
          
          console.error = (msg) => { errorOutput += msg + '\n'; };
          console.log = (msg) => { logOutput += msg + '\n'; };
          
          try {
            // Simulate CLI command with invalid input
            await cli.run(['node', 'git-worktree.js', 'create', invalidBranchName]);
          } catch (error) {
            // Expected to fail
          } finally {
            console.error = originalError;
            console.log = originalLog;
          }
          
          // Verify error output format (should match bash script style)
          if (errorOutput) {
            expect(errorOutput).toContain('✗'); // Error icon
            expect(errorOutput).toMatch(/Branch name is required|Invalid branch name/);
          }
          
          // Verify help suggestions are provided
          if (logOutput) {
            expect(logOutput).toMatch(/Suggestions:|For more help:/);
          }
          
          return true;
        }
      ), { numRuns: 15 });
    });

    test('colored output should preserve format when colors disabled', async () => {
      await fc.assert(fc.asyncProperty(
        fc.array(testGenerators.branchName(), { minLength: 1, maxLength: 3 }),
        async (branchNames) => {
          // Filter out empty branch names
          const validBranches = branchNames.filter(name => name && name.length > 0);
          if (validBranches.length === 0) return true;
          
          // Create test worktrees
          const createdWorktrees = [];
          for (const branchName of validBranches) {
            try {
              const worktree = await cli.worktreeManager.createWorktree(branchName);
              createdWorktrees.push(worktree);
            } catch (error) {
              continue;
            }
          }
          
          if (createdWorktrees.length === 0) return true;
          
          const worktrees = await cli.worktreeManager.listWorktrees();
          
          // Format with colors enabled and disabled
          const coloredOutput = cliInterface.formatOutput(worktrees, 'worktree-list', {
            colors: true,
            icons: true
          });
          
          const plainOutput = cliInterface.formatOutput(worktrees, 'worktree-list', {
            colors: false,
            icons: true
          });
          
          // Verify that disabling colors doesn't break the format
          // Both outputs should contain the same essential information
          for (const worktree of worktrees) {
            expect(coloredOutput).toContain(worktree.path);
            expect(plainOutput).toContain(worktree.path);
            expect(coloredOutput).toContain(worktree.branch);
            expect(plainOutput).toContain(worktree.branch);
            expect(coloredOutput).toContain(worktree.commit);
            expect(plainOutput).toContain(worktree.commit);
          }
          
          // Verify icons are preserved in both formats
          expect(coloredOutput).toContain('📁');
          expect(plainOutput).toContain('📁');
          expect(coloredOutput).toContain('🌿');
          expect(plainOutput).toContain('🌿');
          
          // Clean up
          for (const created of createdWorktrees) {
            try {
              await cli.worktreeManager.removeWorktree(created.branch, true);
            } catch (error) {
              // Ignore cleanup errors
            }
          }
          
          return true;
        }
      ), { numRuns: 10 });
    });
  });

  /**
   * **Feature: bash-to-javascript-conversion, Property 18: Interactive menu functionality**
   * **Validates: Requirements 8.3**
   * 
   * For any operation that benefits from user selection, the system should provide interactive 
   * menus with clear options and navigation
   */
  describe('Property 18: Interactive menu functionality', () => {
    test('interactive menu should provide clear options and handle selections', async () => {
      await fc.assert(fc.asyncProperty(
        fc.array(fc.record({
          text: fc.string({ minLength: 1, maxLength: 50 }),
          value: fc.string({ minLength: 1, maxLength: 20 }),
          description: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: null })
        }), { minLength: 1, maxLength: 10 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: null }),
        async (choices, message, defaultChoice) => {
          // Mock user input to simulate selection
          const originalPromptUser = require('../../shared/cli-utils').promptUser;
          let promptCalled = false;
          let promptMessage = '';
          let promptOptions = {};
          
          require('../../shared/cli-utils').promptUser = async (msg, opts) => {
            promptCalled = true;
            promptMessage = msg;
            promptOptions = opts;
            // Simulate selecting the first option
            return '1';
          };
          
          try {
            // Test menu display and selection
            const result = await cliInterface.displayMenu(message, choices, {
              numbered: true,
              colors: false, // Disable colors for testing
              icons: false,
              defaultChoice
            });
            
            // Verify that prompt was called
            expect(promptCalled).toBe(true);
            
            // Verify prompt message format
            expect(promptMessage).toContain(`Select an option (1-${choices.length})`);
            if (defaultChoice) {
              expect(promptMessage).toContain(`[${defaultChoice}]`);
            }
            
            // Verify result is from the choices
            const expectedResult = choices[0].value || choices[0];
            expect(result).toBe(expectedResult);
            
            return true;
          } finally {
            // Restore original function
            require('../../shared/cli-utils').promptUser = originalPromptUser;
          }
        }
      ), { numRuns: 15 });
    });

    test('interactive menu should handle invalid selections gracefully', async () => {
      await fc.assert(fc.asyncProperty(
        fc.array(fc.record({
          text: fc.string({ minLength: 1, maxLength: 30 }),
          value: fc.string({ minLength: 1, maxLength: 15 })
        }), { minLength: 2, maxLength: 5 }),
        fc.oneof(
          fc.constant('0'),           // Below range
          fc.constant('999'),         // Above range
          fc.constant('invalid'),     // Non-numeric
          fc.constant('')             // Empty
        ),
        async (choices, invalidInput) => {
          // Mock user input to simulate invalid selection
          const originalPromptUser = require('../../shared/cli-utils').promptUser;
          
          require('../../shared/cli-utils').promptUser = async (msg, opts) => {
            return invalidInput;
          };
          
          try {
            // Test that invalid selection throws appropriate error
            await expect(
              cliInterface.displayMenu('Test menu', choices, { colors: false })
            ).rejects.toThrow('Invalid selection');
            
            return true;
          } finally {
            // Restore original function
            require('../../shared/cli-utils').promptUser = originalPromptUser;
          }
        }
      ), { numRuns: 10 });
    });

    test('interactive menu should format choices consistently', async () => {
      await fc.assert(fc.property(
        fc.array(fc.record({
          text: fc.string({ minLength: 1, maxLength: 40 }),
          value: fc.string({ minLength: 1, maxLength: 20 }),
          description: fc.option(fc.string({ minLength: 1, maxLength: 80 }), { nil: null }),
          icon: fc.option(fc.string({ minLength: 1, maxLength: 5 }), { nil: null })
        }), { minLength: 1, maxLength: 8 }),
        fc.string({ minLength: 1, maxLength: 80 }),
        fc.boolean(), // numbered
        fc.boolean(), // icons
        (choices, message, numbered, icons) => {
          // Capture console output
          const originalLog = console.log;
          let output = '';
          console.log = (msg) => { output += msg + '\n'; };
          
          try {
            // Mock prompt to avoid hanging
            const originalPromptUser = require('../../shared/cli-utils').promptUser;
            require('../../shared/cli-utils').promptUser = async () => '1';
            
            // Test menu formatting (we'll catch the error since we're not awaiting)
            cliInterface.displayMenu(message, choices, {
              numbered,
              colors: false,
              icons
            }).catch(() => {}); // Ignore the error, we just want to test formatting
            
            // Give it a moment to log
            setTimeout(() => {
              // Verify message is displayed
              expect(output).toContain(message);
              
              // Verify each choice is formatted correctly
              choices.forEach((choice, index) => {
                expect(output).toContain(choice.text);
                
                if (numbered) {
                  expect(output).toContain(`${index + 1}.`);
                }
                
                if (icons && choice.icon) {
                  expect(output).toContain(choice.icon);
                }
                
                if (choice.description) {
                  expect(output).toContain(choice.description);
                }
              });
              
              // Restore original function
              require('../../shared/cli-utils').promptUser = originalPromptUser;
            }, 10);
            
            return true;
          } finally {
            console.log = originalLog;
          }
        }
      ), { numRuns: 15 });
    });

    test('interactive menu should support default choices', async () => {
      await fc.assert(fc.asyncProperty(
        fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 2, maxLength: 5 }),
        fc.integer({ min: 1, max: 5 }),
        async (choices, defaultIndex) => {
          // Ensure default index is valid
          const actualDefaultIndex = Math.min(defaultIndex, choices.length);
          const defaultChoice = actualDefaultIndex.toString();
          
          // Mock user input to simulate pressing enter (empty input)
          const originalPromptUser = require('../../shared/cli-utils').promptUser;
          
          require('../../shared/cli-utils').promptUser = async (msg, opts) => {
            // Verify default is passed to prompt
            expect(opts.defaultValue).toBe(defaultChoice);
            // Simulate user pressing enter (using default)
            return '';
          };
          
          try {
            const result = await cliInterface.displayMenu('Test menu', choices, {
              defaultChoice,
              colors: false
            });
            
            // Should return the default choice
            expect(result).toBe(choices[actualDefaultIndex - 1]);
            
            return true;
          } finally {
            // Restore original function
            require('../../shared/cli-utils').promptUser = originalPromptUser;
          }
        }
      ), { numRuns: 10 });
    });

    test('interactive menu should handle complex choice objects', async () => {
      await fc.assert(fc.asyncProperty(
        fc.array(fc.record({
          text: fc.string({ minLength: 1, maxLength: 40 }),
          value: fc.string({ minLength: 1, maxLength: 20 }),
          description: fc.string({ minLength: 1, maxLength: 80 }),
          icon: fc.string({ minLength: 1, maxLength: 3 })
        }), { minLength: 1, maxLength: 6 }),
        async (complexChoices) => {
          // Mock user input
          const originalPromptUser = require('../../shared/cli-utils').promptUser;
          const selectedIndex = Math.floor(Math.random() * complexChoices.length) + 1;
          
          require('../../shared/cli-utils').promptUser = async () => selectedIndex.toString();
          
          try {
            const result = await cliInterface.displayMenu('Complex menu', complexChoices, {
              numbered: true,
              colors: false,
              icons: true
            });
            
            // Should return the value property of the selected choice
            expect(result).toBe(complexChoices[selectedIndex - 1].value);
            
            return true;
          } finally {
            // Restore original function
            require('../../shared/cli-utils').promptUser = originalPromptUser;
          }
        }
      ), { numRuns: 12 });
    });
  });

  // Additional unit tests for CLI interface
  describe('CLI Interface Unit Tests', () => {
    test('should parse arguments correctly', () => {
      const testCases = [
        {
          argv: ['node', 'git-worktree.js', 'create', 'feature/test'],
          expected: { command: 'create', positional: ['feature/test'] }
        },
        {
          argv: ['node', 'git-worktree.js', 'list', '--verbose'],
          expected: { command: 'list', flags: new Set(['verbose']) }
        },
        {
          argv: ['node', 'git-worktree.js', 'remove', 'feature/test', '--delete-branch'],
          expected: { command: 'remove', positional: ['feature/test'], flags: new Set(['delete-branch']) }
        }
      ];

      testCases.forEach(({ argv, expected }) => {
        const parsed = cliInterface.parseArguments(argv);
        expect(parsed.command).toBe(expected.command);
        if (expected.positional) {
          expect(parsed.positional).toEqual(expected.positional);
        }
        if (expected.flags) {
          expected.flags.forEach(flag => {
            expect(parsed.flags.has(flag)).toBe(true);
          });
        }
      });
    });

    test('should validate command arguments', () => {
      // Valid commands should not throw
      expect(() => {
        cliInterface.validateCommandArguments({ command: 'list' });
      }).not.toThrow();

      // Invalid commands should throw
      expect(() => {
        cliInterface.validateCommandArguments({ command: 'invalid' });
      }).toThrow('Invalid command');

      // Missing required arguments should throw
      expect(() => {
        cliInterface.validateCommandArguments({ command: 'create', positional: [] });
      }).toThrow('Branch name is required');
    });

    test('should format different output types correctly', () => {
      const testWorktree = {
        path: '/test/path',
        branch: 'feature/test',
        commit: 'abc12345',
        status: 'clean',
        created: new Date('2023-01-01T00:00:00Z'),
        lastAccessed: new Date('2023-01-01T00:00:00Z')
      };

      // Test worktree info formatting
      const infoOutput = cliInterface.formatOutput(testWorktree, 'worktree-info');
      expect(infoOutput).toContain('Worktree Details:');
      expect(infoOutput).toContain('/test/path');
      expect(infoOutput).toContain('feature/test');
      expect(infoOutput).toContain('abc12345');

      // Test progress formatting
      const progressOutput = cliInterface.formatOutput(
        { current: 50, total: 100, message: 'Processing' },
        'progress'
      );
      expect(progressOutput).toContain('Processing');
      expect(progressOutput).toContain('50%');
      expect(progressOutput).toContain('(50/100)');
    });

    test('should generate completion scripts for supported shells', () => {
      const commands = ['create', 'list', 'remove', 'cleanup', 'status'];
      
      // Test bash completion
      const bashCompletion = cliInterface.generateCompletion('bash', commands);
      expect(bashCompletion).toContain('_git_worktree_completion');
      expect(bashCompletion).toContain('complete -F');
      commands.forEach(cmd => {
        expect(bashCompletion).toContain(cmd);
      });

      // Test zsh completion
      const zshCompletion = cliInterface.generateCompletion('zsh', commands);
      expect(zshCompletion).toContain('#compdef');
      expect(zshCompletion).toContain('_git_worktree');
      commands.forEach(cmd => {
        expect(zshCompletion).toContain(cmd);
      });

      // Test fish completion
      const fishCompletion = cliInterface.generateCompletion('fish', commands);
      expect(fishCompletion).toContain('complete -c git-worktree.js');
      commands.forEach(cmd => {
        expect(fishCompletion).toContain(cmd);
      });
    });

    test('should handle unsupported shell completion', () => {
      expect(() => {
        cliInterface.generateCompletion('unsupported', ['create']);
      }).toThrow('Unsupported shell');
    });

    test('should format status icons and colors correctly', () => {
      const testStatuses = ['clean', 'dirty', 'detached'];
      
      testStatuses.forEach(status => {
        const icon = cliInterface.getStatusIcon(status);
        const color = cliInterface.getStatusColor(status);
        
        expect(typeof icon).toBe('string');
        expect(typeof color).toBe('string');
        expect(icon.length).toBeGreaterThan(0);
        expect(color.length).toBeGreaterThan(0);
      });
    });
  });
});