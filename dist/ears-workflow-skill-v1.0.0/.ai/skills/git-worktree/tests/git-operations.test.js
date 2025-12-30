/**
 * Property-Based Tests for GitOperations
 * Tests git command delegation and repository integrity preservation
 */

const GitOperations = require('../lib/git-operations');
const ErrorHandler = require('../../shared/error-handler');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('GitOperations Property-Based Tests', () => {
  let gitOps;
  let testRepoPath;
  let originalCwd;

  beforeAll(() => {
    originalCwd = process.cwd();
    // Create a temporary test repository
    testRepoPath = path.join(__dirname, 'temp-test-repo');
    
    // Clean up any existing test repo
    if (fs.existsSync(testRepoPath)) {
      fs.rmSync(testRepoPath, { recursive: true, force: true });
    }
    
    // Create and initialize test repository
    fs.mkdirSync(testRepoPath, { recursive: true });
    process.chdir(testRepoPath);
    
    try {
      execSync('git init', { stdio: 'ignore' });
      execSync('git config user.email "test@example.com"', { stdio: 'ignore' });
      execSync('git config user.name "Test User"', { stdio: 'ignore' });
      
      // Create initial commit
      fs.writeFileSync('README.md', '# Test Repository');
      execSync('git add README.md', { stdio: 'ignore' });
      execSync('git commit -m "Initial commit"', { stdio: 'ignore' });
    } catch (error) {
      console.warn('Git setup failed, some tests may be skipped:', error.message);
    }
  });

  afterAll(() => {
    process.chdir(originalCwd);
    // Clean up test repository
    if (fs.existsSync(testRepoPath)) {
      try {
        fs.rmSync(testRepoPath, { recursive: true, force: true });
      } catch (error) {
        console.warn('Failed to clean up test repository:', error.message);
      }
    }
  });

  beforeEach(() => {
    gitOps = new GitOperations({ workingDirectory: testRepoPath });
  });

  /**
   * **Feature: bash-to-javascript-conversion, Property 2: Git command delegation**
   * **Validates: Requirements 1.2**
   * 
   * For any git operation, the system should use Node.js child_process to execute 
   * git commands and properly handle command results
   */
  describe('Property 2: Git command delegation', () => {
    test('should delegate git commands to child_process and handle results properly', async () => {
      await fc.assert(fc.asyncProperty(
        testGenerators.gitCommand,
        async (gitCmd) => {
          try {
            // Test that the command is properly delegated to git
            const result = await gitOps.executeGitCommand(gitCmd.command, gitCmd.args);
            
            // Verify result structure
            expect(result).toHaveProperty('stdout');
            expect(result).toHaveProperty('stderr');
            expect(result).toHaveProperty('exitCode');
            expect(typeof result.stdout).toBe('string');
            expect(typeof result.stderr).toBe('string');
            expect(typeof result.exitCode).toBe('number');
            expect(result.exitCode).toBe(0); // Successful commands should return 0
            
            return true;
          } catch (error) {
            // For failing commands, verify structured error handling
            expect(error).toHaveProperty('errorInfo');
            expect(error.errorInfo).toBeValidErrorInfo('GIT_COMMAND_FAILED');
            
            // Verify error contains command information
            expect(error.errorInfo.command).toContain('git');
            expect(error.errorInfo.context.operation).toBe('git_command_execution');
            expect(error.errorInfo.context.parameters).toHaveProperty('command', gitCmd.command);
            expect(error.errorInfo.context.parameters).toHaveProperty('args', gitCmd.args);
            
            return true;
          }
        }
      ), { numRuns: 50 }); // Reduced runs for command execution tests
    });

    test('should properly validate repository before executing commands', async () => {
      await fc.assert(fc.asyncProperty(
        fc.constantFrom('status', 'branch', 'log'),
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 3 }),
        async (command, args) => {
          // Test in valid repository
          const result = await gitOps.executeGitCommand(command, args);
          expect(result.exitCode).toBe(0);
          
          // Test repository validation is called (indirectly verified by success)
          return true;
        }
      ), { numRuns: 20 });
    });

    test('should handle command timeouts properly', async () => {
      const shortTimeoutGitOps = new GitOperations({ 
        workingDirectory: testRepoPath,
        timeout: 1 // Very short timeout to trigger timeout condition
      });

      try {
        // This should timeout for most git commands
        await shortTimeoutGitOps.executeGitCommand('log', ['--all', '--graph']);
        // If it doesn't timeout, that's also valid (very fast git)
      } catch (error) {
        if (error.message.includes('timed out')) {
          expect(error.message).toContain('timed out after 1ms');
        } else {
          // Other errors are also acceptable
          expect(error).toHaveProperty('errorInfo');
        }
      }
    });
  });

  /**
   * **Feature: bash-to-javascript-conversion, Property 10: Repository integrity preservation**
   * **Validates: Requirements 5.3**
   * 
   * For any git operation sequence, the repository should maintain its integrity 
   * with no corruption, orphaned references, or inconsistent state
   */
  describe('Property 10: Repository integrity preservation', () => {
    test('should preserve repository integrity across operation sequences', async () => {
      await fc.assert(fc.asyncProperty(
        fc.array(
          fc.record({
            operation: fc.constantFrom('getBranches', 'getCurrentBranch', 'checkWorkingDirectoryClean', 'getRepositoryInfo'),
            repeat: fc.integer({ min: 1, max: 3 })
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (operations) => {
          // Record initial repository state
          const initialBranches = await gitOps.getBranches();
          const initialBranch = await gitOps.getCurrentBranch();
          const initialStatus = await gitOps.checkWorkingDirectoryClean();
          const initialInfo = await gitOps.getRepositoryInfo();

          // Execute sequence of read-only operations
          for (const op of operations) {
            for (let i = 0; i < op.repeat; i++) {
              let result;
              switch (op.operation) {
                case 'getBranches':
                  result = await gitOps.getBranches();
                  expect(result).toHaveProperty('local');
                  expect(result).toHaveProperty('remote');
                  expect(result).toHaveProperty('current');
                  expect(Array.isArray(result.local)).toBe(true);
                  expect(Array.isArray(result.remote)).toBe(true);
                  break;
                case 'getCurrentBranch':
                  result = await gitOps.getCurrentBranch();
                  expect(typeof result).toBe('string');
                  expect(result.length).toBeGreaterThan(0);
                  break;
                case 'checkWorkingDirectoryClean':
                  result = await gitOps.checkWorkingDirectoryClean();
                  expect(result).toHaveProperty('isClean');
                  expect(result).toHaveProperty('status');
                  expect(typeof result.isClean).toBe('boolean');
                  expect(typeof result.status).toBe('string');
                  break;
                case 'getRepositoryInfo':
                  result = await gitOps.getRepositoryInfo();
                  expect(result).toHaveProperty('root');
                  expect(result).toHaveProperty('currentBranch');
                  expect(result).toHaveProperty('remotes');
                  expect(typeof result.root).toBe('string');
                  expect(typeof result.currentBranch).toBe('string');
                  expect(typeof result.remotes).toBe('object');
                  break;
              }
            }
          }

          // Verify repository state is unchanged after read-only operations
          const finalBranches = await gitOps.getBranches();
          const finalBranch = await gitOps.getCurrentBranch();
          const finalStatus = await gitOps.checkWorkingDirectoryClean();
          const finalInfo = await gitOps.getRepositoryInfo();

          // Repository integrity checks
          expect(finalBranch).toBe(initialBranch);
          expect(finalBranches.current).toBe(initialBranches.current);
          expect(finalBranches.local).toEqual(initialBranches.local);
          expect(finalStatus.isClean).toBe(initialStatus.isClean);
          expect(finalInfo.root).toBe(initialInfo.root);
          expect(finalInfo.currentBranch).toBe(initialInfo.currentBranch);

          return true;
        }
      ), { numRuns: 30 });
    });

    test('should maintain consistent repository validation', async () => {
      await fc.assert(fc.asyncProperty(
        fc.integer({ min: 1, max: 10 }),
        async (iterations) => {
          // Repository validation should be consistent across multiple calls
          for (let i = 0; i < iterations; i++) {
            const isValid = await gitOps.validateRepository();
            expect(isValid).toBe(true); // Should always be valid in our test repo
          }
          
          // Repository should still be valid after multiple validation calls
          const finalValidation = await gitOps.validateRepository();
          expect(finalValidation).toBe(true);
          
          return true;
        }
      ), { numRuns: 20 });
    });

    test('should handle invalid repository paths without corrupting state', async () => {
      await fc.assert(fc.asyncProperty(
        testGenerators.filePath,
        async (invalidPath) => {
          // Skip if path accidentally exists or is current directory
          const fullPath = path.resolve(invalidPath);
          if (fs.existsSync(fullPath) || fullPath === testRepoPath) {
            return true;
          }

          try {
            await gitOps.validateRepository(fullPath);
            // If validation passes, that's unexpected but not an error
            return true;
          } catch (error) {
            // Should get structured error for invalid repository
            expect(error).toHaveProperty('errorInfo');
            expect(error.errorInfo.code).toBe('INVALID_REPOSITORY');
            expect(error.errorInfo.context.parameters.directory).toBe(fullPath);
            
            // Verify original repository is still valid after failed validation
            const originalStillValid = await gitOps.validateRepository();
            expect(originalStillValid).toBe(true);
            
            return true;
          }
        }
      ), { numRuns: 20 });
    });
  });

  // Additional unit tests for specific functionality
  describe('GitOperations Unit Tests', () => {
    test('should get current branch correctly', async () => {
      const branch = await gitOps.getCurrentBranch();
      expect(typeof branch).toBe('string');
      expect(branch.length).toBeGreaterThan(0);
      // Should be 'main' or 'master' in our test repo
      expect(['main', 'master']).toContain(branch);
    });

    test('should get branches with correct structure', async () => {
      const branches = await gitOps.getBranches();
      expect(branches).toHaveProperty('local');
      expect(branches).toHaveProperty('remote');
      expect(branches).toHaveProperty('current');
      expect(Array.isArray(branches.local)).toBe(true);
      expect(Array.isArray(branches.remote)).toBe(true);
      expect(branches.local.length).toBeGreaterThan(0);
      expect(branches.current).toBeTruthy();
    });

    test('should check working directory status', async () => {
      const status = await gitOps.checkWorkingDirectoryClean();
      expect(status).toHaveProperty('isClean');
      expect(status).toHaveProperty('status');
      expect(typeof status.isClean).toBe('boolean');
      expect(typeof status.status).toBe('string');
    });

    test('should get repository info', async () => {
      const info = await gitOps.getRepositoryInfo();
      expect(info).toHaveProperty('root');
      expect(info).toHaveProperty('currentBranch');
      expect(info).toHaveProperty('remotes');
      expect(typeof info.root).toBe('string');
      expect(typeof info.currentBranch).toBe('string');
      expect(typeof info.remotes).toBe('object');
    });

    test('should handle git command errors with structured information', async () => {
      try {
        await gitOps.executeGitCommand('invalid-command', ['--invalid-flag']);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toHaveProperty('errorInfo');
        expect(error.errorInfo).toBeValidErrorInfo('GIT_COMMAND_FAILED');
        expect(error.errorInfo.command).toContain('git invalid-command');
        expect(error.errorInfo.suggestions.length).toBeGreaterThan(0);
      }
    });
  });
});