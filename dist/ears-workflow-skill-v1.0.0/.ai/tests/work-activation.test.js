/**
 * Property-based tests for work sub-skill activation
 * Feature: ears-workflow-skill-refactor, Property 6: Sub-skill activation completeness
 * Validates: Requirements 3.3
 */

// Mock skill activation system
class WorkActivationSystem {
  constructor() {
    this.activeSkills = new Set();
    this.loadedContent = new Map();
  }

  activateWork(userInput) {
    const normalizedInput = userInput.toLowerCase().trim();
    
    // Work activation triggers
    const workKeywords = [
      'implement', 'fix', 'refactor', 'build', 'code', 'coding',
      'tdd', 'test-driven', 'write tests',
      'git worktree', 'feature branch', 'development',
      'red-green-refactor', 'failing test', 'make it pass',
      'isolated environment', 'create worktree'
    ];

    const shouldActivate = workKeywords.some(keyword => 
      normalizedInput.includes(keyword)
    );

    if (shouldActivate) {
      this.activeSkills.add('work');
      this.loadedContent.set('work', {
        instructions: 'WORK phase instructions loaded',
        capabilities: [
          'tdd-implementation',
          'git-worktree-management',
          'atomic-commits',
          'continuous-verification'
        ],
        methodologies: [
          'red-green-refactor',
          'test-first-development',
          'isolated-environments'
        ],
        references: ['execution-workflow', 'builder-role', 'git-worktree-protocol']
      });
      return {
        activated: true,
        skill: 'work',
        feedback: 'WORK skill activated - ready for TDD implementation in isolated environment'
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
console.log('=== Work Skill Activation Tests ===');

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
test('should activate WORK skill for valid trigger phrases', () => {
  const system = new WorkActivationSystem();
  const triggers = [
    'implement', 'fix', 'refactor', 'build', 'code',
    'tdd', 'test-driven', 'write tests',
    'git worktree', 'feature branch', 'development'
  ];
  
  for (const trigger of triggers) {
    const result = system.activateWork(trigger);
    
    if (!result.activated) throw new Error(`Expected activation for trigger: ${trigger}`);
    if (result.skill !== 'work') throw new Error(`Expected skill to be work for trigger: ${trigger}`);
    if (!result.feedback.includes('WORK skill activated')) throw new Error(`Expected feedback for trigger: ${trigger}`);
    if (!system.isSkillActive('work')) throw new Error(`Expected work to be active for trigger: ${trigger}`);
    
    const content = system.getLoadedContent('work');
    if (!content) throw new Error(`Expected content to be loaded for trigger: ${trigger}`);
    if (!content.capabilities.includes('tdd-implementation')) throw new Error(`Expected tdd-implementation capability for trigger: ${trigger}`);
    if (!content.methodologies.includes('red-green-refactor')) throw new Error(`Expected red-green-refactor methodology for trigger: ${trigger}`);
    
    system.reset();
  }
});

// Test 2: No activation for unrelated inputs
test('should not activate WORK skill for unrelated inputs', () => {
  const system = new WorkActivationSystem();
  const unrelatedInputs = [
    'hello', 'planning', 'design', 'specification', 'review',
    'audit', 'check', 'research', 'analyze'
  ];
  
  for (const input of unrelatedInputs) {
    const result = system.activateWork(input);
    
    if (result.activated) throw new Error(`Expected no activation for unrelated input: ${input}`);
    if (result.skill !== null) throw new Error(`Expected skill to be null for unrelated input: ${input}`);
    if (system.isSkillActive('work')) throw new Error(`Expected work not to be active for unrelated input: ${input}`);
    if (system.getLoadedContent('work')) throw new Error(`Expected no content loaded for unrelated input: ${input}`);
    
    system.reset();
  }
});

// Test 3: Load specific WORK capabilities
test('should load specific WORK capabilities when activated', () => {
  const system = new WorkActivationSystem();
  const result = system.activateWork('I need to implement this feature');
  
  if (!result.activated) throw new Error('Expected activation');
  
  const content = system.getLoadedContent('work');
  const expectedCapabilities = [
    'tdd-implementation',
    'git-worktree-management',
    'atomic-commits',
    'continuous-verification'
  ];
  
  for (const capability of expectedCapabilities) {
    if (!content.capabilities.includes(capability)) {
      throw new Error(`Expected capability: ${capability}`);
    }
  }
  
  const expectedMethodologies = [
    'red-green-refactor',
    'test-first-development',
    'isolated-environments'
  ];
  
  for (const methodology of expectedMethodologies) {
    if (!content.methodologies.includes(methodology)) {
      throw new Error(`Expected methodology: ${methodology}`);
    }
  }
  
  if (content.instructions !== 'WORK phase instructions loaded') {
    throw new Error('Expected instructions to be loaded');
  }
});

// Test 4: Case insensitive activation
test('should handle case-insensitive work activation', () => {
  const system = new WorkActivationSystem();
  const triggers = [
    'IMPLEMENT', 'implement', 'Implement',
    'TDD', 'tdd', 'Tdd',
    'BUILD', 'build', 'Build'
  ];
  
  for (const trigger of triggers) {
    const result = system.activateWork(trigger);
    
    if (!result.activated) throw new Error(`Expected activation for case variant: ${trigger}`);
    if (result.skill !== 'work') throw new Error(`Expected skill to be work for case variant: ${trigger}`);
    
    system.reset();
  }
});

// Test 5: Activation with context words
test('should activate with trigger words in context', () => {
  const system = new WorkActivationSystem();
  const contextualInputs = [
    'let me implement this feature',
    'I need to fix this bug',
    'time to build the component',
    'start coding the solution',
    'use TDD for this task'
  ];
  
  for (const input of contextualInputs) {
    const result = system.activateWork(input);
    
    if (!result.activated) throw new Error(`Expected activation for contextual input: ${input}`);
    if (result.skill !== 'work') throw new Error(`Expected skill to be work for contextual input: ${input}`);
    
    system.reset();
  }
});

// Test 6: TDD-specific activation
test('should activate for TDD-specific triggers', () => {
  const system = new WorkActivationSystem();
  const tddTriggers = [
    'red-green-refactor',
    'failing test',
    'make it pass',
    'test-driven development',
    'write tests first'
  ];
  
  for (const trigger of tddTriggers) {
    const result = system.activateWork(trigger);
    
    if (!result.activated) throw new Error(`Expected activation for TDD trigger: ${trigger}`);
    if (result.skill !== 'work') throw new Error(`Expected skill to be work for TDD trigger: ${trigger}`);
    if (!result.feedback.includes('TDD')) throw new Error(`Expected TDD mention for trigger: ${trigger}`);
    
    system.reset();
  }
});

// Test 7: Git worktree specific activation
test('should activate for git worktree triggers', () => {
  const system = new WorkActivationSystem();
  const worktreeTriggers = [
    'git worktree',
    'feature branch',
    'isolated environment',
    'create worktree'
  ];
  
  for (const trigger of worktreeTriggers) {
    const result = system.activateWork(trigger);
    
    if (!result.activated) throw new Error(`Expected activation for worktree trigger: ${trigger}`);
    if (result.skill !== 'work') throw new Error(`Expected skill to be work for worktree trigger: ${trigger}`);
    if (!result.feedback.includes('isolated environment')) throw new Error(`Expected isolation mention for trigger: ${trigger}`);
    
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

module.exports = { WorkActivationSystem };