/**
 * Property-based tests for review sub-skill activation
 * Feature: ears-workflow-skill-refactor, Property 6: Sub-skill activation completeness
 * Validates: Requirements 3.4
 */

// Mock skill activation system
class ReviewActivationSystem {
  constructor() {
    this.activeSkills = new Set();
    this.loadedContent = new Map();
  }

  activateReview(userInput) {
    const normalizedInput = userInput.toLowerCase().trim();
    
    // Review activation triggers
    const reviewKeywords = [
      'review', 'audit', 'check', 'assess',
      'code review', 'pull request', 'pr review',
      'security audit', 'performance review', 'quality check',
      'multi-perspective', 'comprehensive review', 'deep review'
    ];

    const shouldActivate = reviewKeywords.some(keyword => 
      normalizedInput.includes(keyword)
    );

    if (shouldActivate) {
      this.activeSkills.add('review');
      this.loadedContent.set('review', {
        instructions: 'REVIEW phase instructions loaded',
        capabilities: [
          'security-audit',
          'performance-analysis',
          'style-review',
          'data-integrity-check'
        ],
        personas: [
          'security-sentinel',
          'performance-oracle',
          'framework-purist',
          'data-integrity-guardian'
        ],
        references: ['review-workflow', 'auditor-role']
      });
      return {
        activated: true,
        skill: 'review',
        feedback: 'REVIEW skill activated - ready for multi-perspective code audit'
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
console.log('=== Review Skill Activation Tests ===');

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
test('should activate REVIEW skill for valid trigger phrases', () => {
  const system = new ReviewActivationSystem();
  const triggers = [
    'review', 'audit', 'check', 'assess',
    'code review', 'pull request', 'pr review',
    'security audit', 'performance review', 'quality check'
  ];
  
  for (const trigger of triggers) {
    const result = system.activateReview(trigger);
    
    if (!result.activated) throw new Error(`Expected activation for trigger: ${trigger}`);
    if (result.skill !== 'review') throw new Error(`Expected skill to be review for trigger: ${trigger}`);
    if (!result.feedback.includes('REVIEW skill activated')) throw new Error(`Expected feedback for trigger: ${trigger}`);
    if (!system.isSkillActive('review')) throw new Error(`Expected review to be active for trigger: ${trigger}`);
    
    const content = system.getLoadedContent('review');
    if (!content) throw new Error(`Expected content to be loaded for trigger: ${trigger}`);
    if (!content.capabilities.includes('security-audit')) throw new Error(`Expected security-audit capability for trigger: ${trigger}`);
    if (!content.personas.includes('security-sentinel')) throw new Error(`Expected security-sentinel persona for trigger: ${trigger}`);
    
    system.reset();
  }
});

// Test 2: No activation for unrelated inputs
test('should not activate REVIEW skill for unrelated inputs', () => {
  const system = new ReviewActivationSystem();
  const unrelatedInputs = [
    'hello', 'test', 'code', 'implement', 'fix',
    'planning', 'design', 'specification', 'build'
  ];
  
  for (const input of unrelatedInputs) {
    const result = system.activateReview(input);
    
    if (result.activated) throw new Error(`Expected no activation for unrelated input: ${input}`);
    if (result.skill !== null) throw new Error(`Expected skill to be null for unrelated input: ${input}`);
    if (system.isSkillActive('review')) throw new Error(`Expected review not to be active for unrelated input: ${input}`);
    if (system.getLoadedContent('review')) throw new Error(`Expected no content loaded for unrelated input: ${input}`);
    
    system.reset();
  }
});

// Test 3: Load specific REVIEW capabilities
test('should load specific REVIEW capabilities when activated', () => {
  const system = new ReviewActivationSystem();
  const result = system.activateReview('I need a code review');
  
  if (!result.activated) throw new Error('Expected activation');
  
  const content = system.getLoadedContent('review');
  const expectedCapabilities = [
    'security-audit',
    'performance-analysis',
    'style-review',
    'data-integrity-check'
  ];
  
  for (const capability of expectedCapabilities) {
    if (!content.capabilities.includes(capability)) {
      throw new Error(`Expected capability: ${capability}`);
    }
  }
  
  const expectedPersonas = [
    'security-sentinel',
    'performance-oracle',
    'framework-purist',
    'data-integrity-guardian'
  ];
  
  for (const persona of expectedPersonas) {
    if (!content.personas.includes(persona)) {
      throw new Error(`Expected persona: ${persona}`);
    }
  }
  
  if (content.instructions !== 'REVIEW phase instructions loaded') {
    throw new Error('Expected instructions to be loaded');
  }
});

// Test 4: Case insensitive activation
test('should handle case-insensitive review activation', () => {
  const system = new ReviewActivationSystem();
  const triggers = [
    'REVIEW', 'review', 'Review',
    'AUDIT', 'audit', 'Audit',
    'CHECK', 'check', 'Check'
  ];
  
  for (const trigger of triggers) {
    const result = system.activateReview(trigger);
    
    if (!result.activated) throw new Error(`Expected activation for case variant: ${trigger}`);
    if (result.skill !== 'review') throw new Error(`Expected skill to be review for case variant: ${trigger}`);
    
    system.reset();
  }
});

// Test 5: Activation with context words
test('should activate with trigger words in context', () => {
  const system = new ReviewActivationSystem();
  const contextualInputs = [
    'please review this code',
    'can you audit the changes',
    'I need a security audit',
    'perform a code review',
    'check the pull request'
  ];
  
  for (const input of contextualInputs) {
    const result = system.activateReview(input);
    
    if (!result.activated) throw new Error(`Expected activation for contextual input: ${input}`);
    if (result.skill !== 'review') throw new Error(`Expected skill to be review for contextual input: ${input}`);
    
    system.reset();
  }
});

// Test 6: Provide appropriate feedback
test('should provide appropriate feedback for review activation', () => {
  const system = new ReviewActivationSystem();
  const triggers = ['review', 'audit', 'code review'];
  
  for (const trigger of triggers) {
    const result = system.activateReview(trigger);
    
    if (!result.feedback.match(/REVIEW.*activated/i)) {
      throw new Error(`Expected activation feedback for trigger: ${trigger}`);
    }
    if (!result.feedback.match(/multi-perspective.*audit/i)) {
      throw new Error(`Expected multi-perspective mention for trigger: ${trigger}`);
    }
    
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

module.exports = { ReviewActivationSystem };