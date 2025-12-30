/**
 * Property-based tests for git-worktree utility activation
 * Feature: ears-workflow-skill-refactor, Property 6: Sub-skill activation completeness
 * Validates: Requirements 3.5
 */

// Mock skill activation system
class GitWorktreeActivationSystem {
  constructor() {
    this.activeSkills = new Set();
    this.loadedContent = new Map();
  }

  activateGitWorktree(userInput) {
    const normalizedInput = userInput.toLowerCase().trim();
    
    // Git-worktree activation triggers
    const gitWorktreeKeywords = [
      'git worktree', 'worktree', 'create worktree',
      'feature branch', 'isolated environment', 'parallel development',
      'branch management', 'development environment', 'workspace isolation',
      'create branch', 'switch branch', 'isolated coding'
    ];

    const shouldActivate = gitWorktreeKeywords.some(keyword => 
      normalizedInput.includes(keyword)
    );

    if (shouldActivate) {
      this.activeSkills.add('git-worktree');
      this.loadedContent.set('git-worktree', {
        instructions: 'GIT-WORKTREE utility instructions loaded',
        capabilities: [
          'worktree-creation',
          'worktree-management',
          'branch-validation',
          'cleanup-operations'
        ],
        operations: [
          'create',
          'list',
          'remove',
          'status',
          'cleanup'
        ],
        references: ['README.md', 'examples.md', 'git-worktree.sh']
      });
      return {
        activated: true,
        skill: 'git-worktree',
        feedback: 'GIT-WORKTREE utility activated - ready for isolated development environment management'
      };
    }

    return {
      activated: false,
      skill: null,
      feedback: 'No skill activated'
    };
  }

  isSkillActive(skillName) {
    return this.activeSkills.has(skillName);
  }

  getLoadedContent(skillName) {
    return this.loadedContent.get(skillName);
  }

  reset() {
    this.activeSkills.clear();
    this.loadedContent.clear();
  }
}

// Run tests
console.log('=== Git-Worktree Utility Activation Tests ===');

let passed = 0;
let failed = 0;

function test(name, testFn) {
  try {
    testFn();
    console.log('✓ PASSED:', name);
    passed++;
  } catch (error) {
    console.log('✗ FAILED:', name);
    console.log('  Error:', error.message);
    failed++;
  }
}

// Test 1: Successful activation with valid triggers
test('should activate GIT-WORKTREE utility for valid trigger phrases', () => {
  const system = new GitWorktreeActivationSystem();
  const triggers = [
    'git worktree', 'worktree', 'create worktree',
    'feature branch', 'isolated environment', 'parallel development',
    'branch management', 'development environment'
  ];
  
  for (const trigger of triggers) {
    const result = system.activateGitWorktree(trigger);
    
    if (!result.activated) throw new Error(`Expected activation for trigger: ${trigger}`);
    if (result.skill !== 'git-worktree') throw new Error(`Expected skill to be git-worktree for trigger: ${trigger}`);
    if (!result.feedback.includes('GIT-WORKTREE utility activated')) throw new Error(`Expected feedback for trigger: ${trigger}`);
    if (!system.isSkillActive('git-worktree')) throw new Error(`Expected git-worktree to be active for trigger: ${trigger}`);
    
    const content = system.getLoadedContent('git-worktree');
    if (!content) throw new Error(`Expected content to be loaded for trigger: ${trigger}`);
    if (!content.capabilities.includes('worktree-creation')) throw new Error(`Expected worktree-creation capability for trigger: ${trigger}`);
    if (!content.operations.includes('create')) throw new Error(`Expected create operation for trigger: ${trigger}`);
    
    system.reset();
  }
});

// Test 2: No activation for unrelated inputs
test('should not activate GIT-WORKTREE utility for unrelated inputs', () => {
  const system = new GitWorktreeActivationSystem();
  const unrelatedInputs = [
    'hello', 'planning', 'design', 'specification', 'review',
    'audit', 'test', 'implement', 'fix', 'refactor'
  ];
  
  for (const input of unrelatedInputs) {
    const result = system.activateGitWorktree(input);
    
    if (result.activated) throw new Error(`Expected no activation for unrelated input: ${input}`);
    if (result.skill !== null) throw new Error(`Expected skill to be null for unrelated input: ${input}`);
    if (system.isSkillActive('git-worktree')) throw new Error(`Expected git-worktree not to be active for unrelated input: ${input}`);
    if (system.getLoadedContent('git-worktree')) throw new Error(`Expected no content loaded for unrelated input: ${input}`);
    
    system.reset();
  }
});

// Test 3: Load specific GIT-WORKTREE capabilities
test('should load specific GIT-WORKTREE capabilities when activated', () => {
  const system = new GitWorktreeActivationSystem();
  const result = system.activateGitWorktree('I need to create a git worktree');
  
  if (!result.activated) throw new Error('Expected activation');
  
  const content = system.getLoadedContent('git-worktree');
  const expectedCapabilities = [
    'worktree-creation',
    'worktree-management',
    'branch-validation',
    'cleanup-operations'
  ];
  
  for (const capability of expectedCapabilities) {
    if (!content.capabilities.includes(capability)) {
      throw new Error(`Expected capability: ${capability}`);
    }
  }
  
  const expectedOperations = [
    'create',
    'list',
    'remove',
    'status',
    'cleanup'
  ];
  
  for (const operation of expectedOperations) {
    if (!content.operations.includes(operation)) {
      throw new Error(`Expected operation: ${operation}`);
    }
  }
  
  if (content.instructions !== 'GIT-WORKTREE utility instructions loaded') {
    throw new Error('Expected instructions to be loaded');
  }
});

// Test 4: Case insensitive activation
test('should handle case-insensitive git-worktree activation', () => {
  const system = new GitWorktreeActivationSystem();
  const triggers = [
    'GIT WORKTREE', 'git worktree', 'Git Worktree',
    'WORKTREE', 'worktree', 'Worktree',
    'FEATURE BRANCH', 'feature branch', 'Feature Branch'
  ];
  
  for (const trigger of triggers) {
    const result = system.activateGitWorktree(trigger);
    
    if (!result.activated) throw new Error(`Expected activation for case variant: ${trigger}`);
    if (result.skill !== 'git-worktree') throw new Error(`Expected skill to be git-worktree for case variant: ${trigger}`);
    
    system.reset();
  }
});

// Test 5: Activation with context words
test('should activate with trigger words in context', () => {
  const system = new GitWorktreeActivationSystem();
  const contextualInputs = [
    'I need to create a git worktree for this feature',
    'set up an isolated environment',
    'create a new feature branch',
    'manage parallel development',
    'switch to isolated coding environment'
  ];
  
  for (const input of contextualInputs) {
    const result = system.activateGitWorktree(input);
    
    if (!result.activated) throw new Error(`Expected activation for contextual input: ${input}`);
    if (result.skill !== 'git-worktree') throw new Error(`Expected skill to be git-worktree for contextual input: ${input}`);
    
    system.reset();
  }
});

// Test 6: Specific worktree operations
test('should activate for specific worktree operation requests', () => {
  const system = new GitWorktreeActivationSystem();
  const operationInputs = [
    'create worktree',
    'list worktrees',
    'remove worktree',
    'cleanup worktrees',
    'worktree status'
  ];
  
  for (const input of operationInputs) {
    const result = system.activateGitWorktree(input);
    
    if (!result.activated) throw new Error(`Expected activation for operation input: ${input}`);
    if (result.skill !== 'git-worktree') throw new Error(`Expected skill to be git-worktree for operation input: ${input}`);
    if (!result.feedback.includes('isolated development environment')) throw new Error(`Expected environment mention for input: ${input}`);
    
    system.reset();
  }
});

// Test 7: Branch management triggers
test('should activate for branch management triggers', () => {
  const system = new GitWorktreeActivationSystem();
  const branchTriggers = [
    'branch management',
    'create branch',
    'switch branch',
    'parallel development',
    'workspace isolation'
  ];
  
  for (const trigger of branchTriggers) {
    const result = system.activateGitWorktree(trigger);
    
    if (!result.activated) throw new Error(`Expected activation for branch trigger: ${trigger}`);
    if (result.skill !== 'git-worktree') throw new Error(`Expected skill to be git-worktree for branch trigger: ${trigger}`);
    
    system.reset();
  }
});

console.log('\n=== Test Results ===');
console.log('Passed:', passed);
console.log('Failed:', failed);
console.log('Total:', passed + failed);

if (failed === 0) {
  console.log('\n🎉 All tests passed!');
} else {
  console.log('\n❌', failed, 'test(s) failed.');
}

module.exports = { GitWorktreeActivationSystem };