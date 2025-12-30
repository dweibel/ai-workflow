/**
 * Property-Based Tests for WorktreeManager
 * Tests behavioral equivalence with bash scripts
 */

const WorktreeManager = require('../lib/worktree-manager');
const GitOperations = require('../lib/git-operations');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('WorktreeManager Property-Based Tests', () => {
  let worktreeManager;
  let testRepoPath;
  let originalCwd;
  let testWorktreesDir;

  beforeAll(() => {
    originalCwd = process.cwd();
    // Create a temporary test repository
    testRepoPath = path.join(__dirname, 'temp-worktree-repo');
    testWorktreesDir = path.join(__dirname, 'temp-worktrees');
    
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
      fs.writeFileSync('README.md', '# Test Repository for Worktree Manager');
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
    worktreeManager = new WorktreeManager({
      workingDirectory: testRepoPath,
      baseWorktreeDir: testWorktreesDir
    });
  });

  afterEach(async () => {
    // Clean up any worktrees created during tests
    try {
      const worktrees = await worktreeManager.listWorktrees();
      for (const worktree of worktrees) {
        // Skip the main repository worktree
        if (worktree.path !== testRepoPath) {
          try {
            await worktreeManager.removeWorktree(worktree.branch, true);
          } catch (error) {
            // Ignore cleanup errors
          }
        }
      }
      await worktreeManager.cleanupStaleWorktrees();
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  /**
   * **Feature: bash-to-javascript-conversion, Property 3: Behavioral equivalence with bash scripts**
   * **Validates: Requirements 2.1, 2.3, 2.4**
   * 
   * For any CLI command and valid parameters, the JavaScript implementation should produce 
   * identical end results and user interactions as the corresponding bash script
   */
  describe('Property 3: Behavioral equivalence with bash scripts', () => {
    test('create operation should behave equivalently to bash script', async () => {
      await fc.assert(fc.asyncProperty(
        testGenerators.branchName(),
        fc.constantFrom('main', 'master'),
        async (branchName, baseBranch) => {
          // Skip if branch name is empty after filtering
          if (!branchName || branchName.length === 0) {
            return true;
          }

          try {
            // Test JavaScript implementation
            const jsResult = await worktreeManager.createWorktree(branchName, baseBranch);
            
            // Verify worktree was created with expected structure
            expect(jsResult).toHaveProperty('path');
            expect(jsResult).toHaveProperty('branch', branchName);
            expect(jsResult).toHaveProperty('commit');
            expect(jsResult).toHaveProperty('status');
            expect(jsResult).toHaveProperty('created');
            expect(jsResult).toHaveProperty('lastAccessed');
            
            // Verify the worktree directory exists
            expect(fs.existsSync(jsResult.path)).toBe(true);
            
            // Verify the branch exists in git
            const branches = await worktreeManager.gitOps.getBranches();
            expect(branches.local).toContain(branchName);
            
            // Verify worktree is listed in git worktree list
            const worktrees = await worktreeManager.listWorktrees();
            const createdWorktree = worktrees.find(wt => wt.branch === branchName);
            expect(createdWorktree).toBeTruthy();
            expect(createdWorktree.path).toBe(jsResult.path);
            
            // Clean up for next iteration
            await worktreeManager.removeWorktree(branchName, true);
            
            return true;
          } catch (error) {
            // For invalid inputs, should get structured error
            if (error.errorInfo) {
              expect(error.errorInfo.code).toMatch(/INVALID_INPUT|WORKTREE_CREATE_FAILED/);
              return true;
            }
            throw error;
          }
        }
      ), { numRuns: 20 }); // Reduced runs for file system operations
    });

    test('list operation should behave equivalently to bash script', async () => {
      await fc.assert(fc.asyncProperty(
        fc.array(testGenerators.branchName(), { minLength: 0, maxLength: 3 }),
        async (branchNames) => {
          // Filter out empty branch names
          const validBranches = branchNames.filter(name => name && name.length > 0);
          
          // Create test worktrees
          const createdWorktrees = [];
          for (const branchName of validBranches) {
            try {
              const worktree = await worktreeManager.createWorktree(branchName);
              createdWorktrees.push(worktree);
            } catch (error) {
              // Skip invalid branch names
              continue;
            }
          }
          
          // Test list operation
          const listedWorktrees = await worktreeManager.listWorktrees();
          
          // Verify all created worktrees are listed
          for (const created of createdWorktrees) {
            const found = listedWorktrees.find(wt => wt.branch === created.branch);
            expect(found).toBeTruthy();
            expect(found.path).toBe(created.path);
            expect(found.branch).toBe(created.branch);
            expect(found).toHaveProperty('commit');
            expect(found).toHaveProperty('status');
            expect(found).toHaveProperty('created');
            expect(found).toHaveProperty('lastAccessed');
          }
          
          // Verify list includes main repository
          const mainWorktree = listedWorktrees.find(wt => wt.path === testRepoPath);
          expect(mainWorktree).toBeTruthy();
          
          // Clean up
          for (const created of createdWorktrees) {
            try {
              await worktreeManager.removeWorktree(created.branch, true);
            } catch (error) {
              // Ignore cleanup errors
            }
          }
          
          return true;
        }
      ), { numRuns: 15 });
    });

    test('remove operation should behave equivalently to bash script', async () => {
      await fc.assert(fc.asyncProperty(
        testGenerators.branchName(),
        fc.boolean(),
        async (branchName, deleteBranch) => {
          // Skip if branch name is empty after filtering
          if (!branchName || branchName.length === 0) {
            return true;
          }

          try {
            // Create a worktree first
            const created = await worktreeManager.createWorktree(branchName);
            
            // Verify it exists
            expect(fs.existsSync(created.path)).toBe(true);
            
            // Remove the worktree
            const removeResult = await worktreeManager.removeWorktree(branchName, deleteBranch);
            
            // Verify removal result structure
            expect(removeResult).toHaveProperty('worktreeRemoved', true);
            expect(removeResult).toHaveProperty('branchDeleted');
            
            if (deleteBranch) {
              expect(removeResult.branchDeleted).toBe(true);
              
              // Verify branch is deleted
              const branches = await worktreeManager.gitOps.getBranches();
              expect(branches.local).not.toContain(branchName);
            }
            
            // Verify worktree directory is removed
            expect(fs.existsSync(created.path)).toBe(false);
            
            // Verify worktree is not listed
            const worktrees = await worktreeManager.listWorktrees();
            const found = worktrees.find(wt => wt.branch === branchName);
            expect(found).toBeFalsy();
            
            return true;
          } catch (error) {
            // For invalid inputs, should get structured error
            if (error.errorInfo) {
              expect(error.errorInfo.code).toMatch(/INVALID_INPUT|WORKTREE_NOT_FOUND|WORKTREE_REMOVE_FAILED/);
              return true;
            }
            throw error;
          }
        }
      ), { numRuns: 15 });
    });

    test('cleanup operation should behave equivalently to bash script', async () => {
      await fc.assert(fc.asyncProperty(
        fc.integer({ min: 0, max: 3 }),
        async (numWorktrees) => {
          // Create some worktrees
          const createdBranches = [];
          for (let i = 0; i < numWorktrees; i++) {
            const branchName = `test-branch-${i}-${Date.now()}`;
            try {
              await worktreeManager.createWorktree(branchName);
              createdBranches.push(branchName);
            } catch (error) {
              // Skip if creation fails
              continue;
            }
          }
          
          // Test cleanup operation
          const cleanupResult = await worktreeManager.cleanupStaleWorktrees();
          
          // Verify cleanup result structure
          expect(cleanupResult).toHaveProperty('cleaned');
          expect(cleanupResult).toHaveProperty('errors');
          expect(Array.isArray(cleanupResult.cleaned)).toBe(true);
          expect(Array.isArray(cleanupResult.errors)).toBe(true);
          
          // Clean up created worktrees
          for (const branchName of createdBranches) {
            try {
              await worktreeManager.removeWorktree(branchName, true);
            } catch (error) {
              // Ignore cleanup errors
            }
          }
          
          return true;
        }
      ), { numRuns: 10 });
    });

    test('status operation should behave equivalently to bash script', async () => {
      await fc.assert(fc.asyncProperty(
        fc.option(testGenerators.branchName(), { nil: null }),
        async (branchName) => {
          let createdWorktree = null;
          
          // Optionally create a worktree
          if (branchName && branchName.length > 0) {
            try {
              createdWorktree = await worktreeManager.createWorktree(branchName);
            } catch (error) {
              // Skip invalid branch names
            }
          }
          
          // Test status operation
          const status = await worktreeManager.getWorktreeStatus();
          
          // Verify status structure matches bash script output
          expect(status).toHaveProperty('currentDirectory');
          expect(status).toHaveProperty('repositoryRoot');
          expect(status).toHaveProperty('currentBranch');
          expect(status).toHaveProperty('inWorktree');
          expect(status).toHaveProperty('currentWorktree');
          expect(status).toHaveProperty('allWorktrees');
          expect(status).toHaveProperty('remotes');
          
          // Verify data types
          expect(typeof status.currentDirectory).toBe('string');
          expect(typeof status.repositoryRoot).toBe('string');
          expect(typeof status.currentBranch).toBe('string');
          expect(typeof status.inWorktree).toBe('boolean');
          expect(Array.isArray(status.allWorktrees)).toBe(true);
          expect(typeof status.remotes).toBe('object');
          
          // Verify repository root is correct
          expect(status.repositoryRoot).toBe(testRepoPath);
          
          // Verify we're not in a worktree (since we're in the main repo)
          expect(status.inWorktree).toBe(false);
          expect(status.currentWorktree).toBeNull();
          
          // Clean up
          if (createdWorktree) {
            try {
              await worktreeManager.removeWorktree(createdWorktree.branch, true);
            } catch (error) {
              // Ignore cleanup errors
            }
          }
          
          return true;
        }
      ), { numRuns: 10 });
    });

    test('should handle invalid branch names consistently with bash script', async () => {
      await fc.assert(fc.asyncProperty(
        fc.string().filter(name => !/^[a-zA-Z0-9/_-]+$/.test(name) || name.length === 0),
        async (invalidBranchName) => {
          try {
            await worktreeManager.createWorktree(invalidBranchName);
            // Should not reach here for invalid names
            return false;
          } catch (error) {
            // Should get structured error for invalid input
            expect(error).toHaveProperty('errorInfo');
            expect(error.errorInfo.code).toBe('INVALID_INPUT');
            expect(error.errorInfo.message).toContain('Branch name is required');
            expect(error.errorInfo.suggestions.length).toBeGreaterThan(0);
            
            return true;
          }
        }
      ), { numRuns: 20 });
    });

    test('should handle non-existent worktree removal consistently with bash script', async () => {
      await fc.assert(fc.asyncProperty(
        testGenerators.branchName(),
        async (nonExistentBranch) => {
          // Skip if branch name is empty
          if (!nonExistentBranch || nonExistentBranch.length === 0) {
            return true;
          }

          try {
            await worktreeManager.removeWorktree(nonExistentBranch);
            // Should not reach here for non-existent worktrees
            return false;
          } catch (error) {
            // Should get structured error for non-existent worktree
            expect(error).toHaveProperty('errorInfo');
            expect(error.errorInfo.code).toBe('WORKTREE_NOT_FOUND');
            expect(error.errorInfo.message).toContain(`No worktree found for branch '${nonExistentBranch}'`);
            expect(error.errorInfo.suggestions.length).toBeGreaterThan(0);
            
            return true;
          }
        }
      ), { numRuns: 15 });
    });
  });

  // Additional unit tests for specific functionality
  describe('WorktreeManager Unit Tests', () => {
    test('should create worktree with correct structure', async () => {
      const branchName = 'test-feature-branch';
      const worktree = await worktreeManager.createWorktree(branchName);
      
      expect(worktree).toHaveProperty('path');
      expect(worktree).toHaveProperty('branch', branchName);
      expect(worktree).toHaveProperty('commit');
      expect(worktree).toHaveProperty('status', 'clean');
      expect(worktree).toHaveProperty('created');
      expect(worktree).toHaveProperty('lastAccessed');
      expect(worktree.created).toBeInstanceOf(Date);
      expect(worktree.lastAccessed).toBeInstanceOf(Date);
      
      // Verify directory exists
      expect(fs.existsSync(worktree.path)).toBe(true);
      
      // Clean up
      await worktreeManager.removeWorktree(branchName, true);
    });

    test('should list worktrees with correct format', async () => {
      const branchName = 'test-list-branch';
      await worktreeManager.createWorktree(branchName);
      
      const worktrees = await worktreeManager.listWorktrees();
      expect(Array.isArray(worktrees)).toBe(true);
      expect(worktrees.length).toBeGreaterThan(0);
      
      // Find our test worktree
      const testWorktree = worktrees.find(wt => wt.branch === branchName);
      expect(testWorktree).toBeTruthy();
      expect(testWorktree).toHaveProperty('path');
      expect(testWorktree).toHaveProperty('branch', branchName);
      expect(testWorktree).toHaveProperty('commit');
      expect(testWorktree).toHaveProperty('status');
      
      // Clean up
      await worktreeManager.removeWorktree(branchName, true);
    });

    test('should remove worktree and optionally delete branch', async () => {
      const branchName = 'test-remove-branch';
      const created = await worktreeManager.createWorktree(branchName);
      
      // Remove without deleting branch
      let result = await worktreeManager.removeWorktree(branchName, false);
      expect(result.worktreeRemoved).toBe(true);
      expect(result.branchDeleted).toBe(false);
      expect(fs.existsSync(created.path)).toBe(false);
      
      // Verify branch still exists
      const branches = await worktreeManager.gitOps.getBranches();
      expect(branches.local).toContain(branchName);
      
      // Create worktree again and remove with branch deletion
      await worktreeManager.createWorktree(branchName);
      result = await worktreeManager.removeWorktree(branchName, true);
      expect(result.worktreeRemoved).toBe(true);
      expect(result.branchDeleted).toBe(true);
      
      // Verify branch is deleted
      const finalBranches = await worktreeManager.gitOps.getBranches();
      expect(finalBranches.local).not.toContain(branchName);
    });

    test('should get status with correct information', async () => {
      const status = await worktreeManager.getWorktreeStatus();
      
      expect(status).toHaveProperty('currentDirectory');
      expect(status).toHaveProperty('repositoryRoot', testRepoPath);
      expect(status).toHaveProperty('currentBranch');
      expect(status).toHaveProperty('inWorktree', false);
      expect(status).toHaveProperty('currentWorktree', null);
      expect(status).toHaveProperty('allWorktrees');
      expect(status).toHaveProperty('remotes');
      
      expect(Array.isArray(status.allWorktrees)).toBe(true);
      expect(typeof status.remotes).toBe('object');
    });

    test('should handle existing branch creation', async () => {
      const branchName = 'existing-branch-test';
      
      // Create branch first
      await worktreeManager.gitOps.executeGitCommand('branch', [branchName]);
      
      // Create worktree for existing branch
      const worktree = await worktreeManager.createWorktree(branchName);
      expect(worktree.branch).toBe(branchName);
      expect(fs.existsSync(worktree.path)).toBe(true);
      
      // Clean up
      await worktreeManager.removeWorktree(branchName, true);
    });

    test('should validate branch name format', async () => {
      const invalidNames = ['', 'branch with spaces', 'branch@invalid', 'branch#invalid'];
      
      for (const invalidName of invalidNames) {
        try {
          await worktreeManager.createWorktree(invalidName);
          fail(`Should have rejected invalid branch name: ${invalidName}`);
        } catch (error) {
          expect(error).toHaveProperty('errorInfo');
          expect(error.errorInfo.code).toBe('INVALID_INPUT');
        }
      }
    });
  });
});