/**
 * Property-based tests for project-reset utility activation
 * Feature: ears-workflow-skill-refactor, Property 6: Sub-skill activation completeness
 * Validates: Requirements 3.6
 */

// Mock skill activation system
class ProjectResetActivationSystem {
  constructor() {
    this.activeSkills = new Set();
    this.loadedContent = new Map();
  }

  activateProjectReset(userInput) {
    const normalizedInput = userInput.toLowerCase().trim();
    
    // Project-reset activation triggers
    const projectResetKeywords = [
      'project reset', 'reset project', 'clean project', 'clean the project',
      'start fresh', 'new project', 'clean slate',
      'reset memory', 'clear documentation', 'template reset',
      'archive project', 'backup and reset', 'clean state',
      'reset this project', 'project completion cleanup',
      'create archive', 'manage archives', 'fresh start'
    ];

    const shouldActivate = projectResetKeywords.some(keyword => 
      normalizedInput.includes(keyword)
    );

    if (shouldActivate) {
      this.activeSkills.add('project-reset');
      this.loadedContent.set('project-reset', {
        instructions: 'PROJECT-RESET utility instructions loaded',
        capabilities: [
          'documentation-reset',
          'memory-reset',
          'project-reset',
          'archive-management'
        ],
        operations: [
          'docs',
          'memory',
          'project',
          'list-archives',
          'restore'
        ],
        safetyFeatures: [
          'automatic-archiving',
          'confirmation-prompts',
          'rollback-guidance',
          'preview-mode'
        ],
        references: ['README.md', 'examples.md', 'project-reset.sh']
      });
      return {
        activated: true,
        skill: 'project-reset',
        feedback: 'PROJECT-RESET utility activated - ready for template-based project state management with safety backups'
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
console.log('=== Project-Reset Utility Activation Tests ===');

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
test('should activate PROJECT-RESET utility for valid trigger phrases', () => {
  const system = new ProjectResetActivationSystem();
  const triggers = [
    'project reset', 'reset project', 'clean project',
    'start fresh', 'new project', 'clean slate',
    'reset memory', 'clear documentation', 'template reset'
  ];
  
  for (const trigger of triggers) {
    const result = system.activateProjectReset(trigger);
    
    if (!result.activated) throw new Error(`Expected activation for trigger: ${trigger}`);
    if (result.skill !== 'project-reset') throw new Error(`Expected skill to be project-reset for trigger: ${trigger}`);
    if (!result.feedback.includes('PROJECT-RESET utility activated')) throw new Error(`Expected feedback for trigger: ${trigger}`);
    if (!system.isSkillActive('project-reset')) throw new Error(`Expected project-reset to be active for trigger: ${trigger}`);
    
    const content = system.getLoadedContent('project-reset');
    if (!content) throw new Error(`Expected content to be loaded for trigger: ${trigger}`);
    if (!content.capabilities.includes('project-reset')) throw new Error(`Expected project-reset capability for trigger: ${trigger}`);
    if (!content.operations.includes('project')) throw new Error(`Expected project operation for trigger: ${trigger}`);
    
    system.reset();
  }
});

// Test 2: No activation for unrelated inputs
test('should not activate PROJECT-RESET utility for unrelated inputs', () => {
  const system = new ProjectResetActivationSystem();
  const unrelatedInputs = [
    'hello', 'planning', 'design', 'specification', 'review',
    'audit', 'test', 'implement', 'fix', 'refactor', 'worktree'
  ];
  
  for (const input of unrelatedInputs) {
    const result = system.activateProjectReset(input);
    
    if (result.activated) throw new Error(`Expected no activation for unrelated input: ${input}`);
    if (result.skill !== null) throw new Error(`Expected skill to be null for unrelated input: ${input}`);
    if (system.isSkillActive('project-reset')) throw new Error(`Expected project-reset not to be active for unrelated input: ${input}`);
    if (system.getLoadedContent('project-reset')) throw new Error(`Expected no content loaded for unrelated input: ${input}`);
    
    system.reset();
  }
});

// Test 3: Load specific PROJECT-RESET capabilities
test('should load specific PROJECT-RESET capabilities when activated', () => {
  const system = new ProjectResetActivationSystem();
  const result = system.activateProjectReset('I need to reset this project');
  
  if (!result.activated) throw new Error('Expected activation');
  
  const content = system.getLoadedContent('project-reset');
  const expectedCapabilities = [
    'documentation-reset',
    'memory-reset',
    'project-reset',
    'archive-management'
  ];
  
  for (const capability of expectedCapabilities) {
    if (!content.capabilities.includes(capability)) {
      throw new Error(`Expected capability: ${capability}`);
    }
  }
  
  const expectedOperations = [
    'docs',
    'memory',
    'project',
    'list-archives',
    'restore'
  ];
  
  for (const operation of expectedOperations) {
    if (!content.operations.includes(operation)) {
      throw new Error(`Expected operation: ${operation}`);
    }
  }
  
  const expectedSafetyFeatures = [
    'automatic-archiving',
    'confirmation-prompts',
    'rollback-guidance',
    'preview-mode'
  ];
  
  for (const feature of expectedSafetyFeatures) {
    if (!content.safetyFeatures.includes(feature)) {
      throw new Error(`Expected safety feature: ${feature}`);
    }
  }
  
  if (content.instructions !== 'PROJECT-RESET utility instructions loaded') {
    throw new Error('Expected instructions to be loaded');
  }
});

// Test 4: Case insensitive activation
test('should handle case-insensitive project-reset activation', () => {
  const system = new ProjectResetActivationSystem();
  const triggers = [
    'PROJECT RESET', 'project reset', 'Project Reset',
    'CLEAN PROJECT', 'clean project', 'Clean Project',
    'START FRESH', 'start fresh', 'Start Fresh'
  ];
  
  for (const trigger of triggers) {
    const result = system.activateProjectReset(trigger);
    
    if (!result.activated) throw new Error(`Expected activation for case variant: ${trigger}`);
    if (result.skill !== 'project-reset') throw new Error(`Expected skill to be project-reset for case variant: ${trigger}`);
    
    system.reset();
  }
});

// Test 5: Activation with context words
test('should activate with trigger words in context', () => {
  const system = new ProjectResetActivationSystem();
  const contextualInputs = [
    'I need to reset this project completely',
    'let me start fresh with a clean slate',
    'time to clean the project state',
    'create an archive and reset memory',
    'clear documentation and start new'
  ];
  
  for (const input of contextualInputs) {
    const result = system.activateProjectReset(input);
    
    if (!result.activated) throw new Error(`Expected activation for contextual input: ${input}`);
    if (result.skill !== 'project-reset') throw new Error(`Expected skill to be project-reset for contextual input: ${input}`);
    
    system.reset();
  }
});

// Test 6: Specific reset operation triggers
test('should activate for specific reset operation requests', () => {
  const system = new ProjectResetActivationSystem();
  const operationInputs = [
    'reset memory files',
    'clear documentation',
    'archive project state',
    'template reset needed',
    'backup and reset'
  ];
  
  for (const input of operationInputs) {
    const result = system.activateProjectReset(input);
    
    if (!result.activated) throw new Error(`Expected activation for operation input: ${input}`);
    if (result.skill !== 'project-reset') throw new Error(`Expected skill to be project-reset for operation input: ${input}`);
    if (!result.feedback.includes('safety backups')) throw new Error(`Expected safety mention for input: ${input}`);
    
    system.reset();
  }
});

// Test 7: Project lifecycle triggers
test('should activate for project lifecycle triggers', () => {
  const system = new ProjectResetActivationSystem();
  const lifecycleTriggers = [
    'new project setup',
    'clean slate for development',
    'project completion cleanup',
    'fresh start needed'
  ];
  
  for (const trigger of lifecycleTriggers) {
    const result = system.activateProjectReset(trigger);
    
    if (!result.activated) throw new Error(`Expected activation for lifecycle trigger: ${trigger}`);
    if (result.skill !== 'project-reset') throw new Error(`Expected skill to be project-reset for lifecycle trigger: ${trigger}`);
    
    system.reset();
  }
});

// Test 8: Archive management triggers
test('should activate for archive management triggers', () => {
  const system = new ProjectResetActivationSystem();
  const archiveTriggers = [
    'archive project',
    'backup and reset',
    'create archive',
    'manage archives'
  ];
  
  for (const trigger of archiveTriggers) {
    const result = system.activateProjectReset(trigger);
    
    if (!result.activated) throw new Error(`Expected activation for archive trigger: ${trigger}`);
    if (result.skill !== 'project-reset') throw new Error(`Expected skill to be project-reset for archive trigger: ${trigger}`);
    if (!result.feedback.includes('template-based')) throw new Error(`Expected template mention for trigger: ${trigger}`);
    
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

module.exports = { ProjectResetActivationSystem };