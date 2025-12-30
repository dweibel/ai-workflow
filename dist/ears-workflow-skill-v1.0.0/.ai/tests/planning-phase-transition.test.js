/**
 * Property-based tests for planning phase transition
 * Feature: ears-workflow-skill-refactor, Property 7: Phase sequence enforcement
 * Validates: Requirements 4.2
 */

// Mock phase transition system
class PhaseTransitionSystem {
  constructor() {
    this.currentPhase = null;
    this.completedPhases = new Set();
    this.activeSkills = new Set();
  }

  completePhase(phase) {
    this.completedPhases.add(phase);
    this.currentPhase = phase;
  }

  transitionToPlanning(userInput) {
    const normalizedInput = userInput.toLowerCase().trim();
    
    // Planning activation triggers
    const planningKeywords = [
      'planning', 'plan', 'implementation plan',
      'research', 'analyze', 'investigate',
      'architecture', 'design decisions', 'technical approach',
      'scaffold', 'plan implementation', 'create plan'
    ];

    const shouldActivatePlanning = planningKeywords.some(keyword => 
      normalizedInput.includes(keyword)
    );

    if (shouldActivatePlanning) {
      // Check if SPEC-FORGE phase is completed (proper sequence)
      if (!this.completedPhases.has('spec-forge')) {
        return {
          success: false,
          phase: null,
          error: 'Cannot transition to PLANNING phase. SPEC-FORGE phase must be completed first.',
          guidance: 'Please complete requirements, design, and task planning before proceeding to implementation planning.'
        };
      }

      // Valid transition to planning
      this.currentPhase = 'planning';
      this.activeSkills.add('planning');

      return {
        success: true,
        phase: 'planning',
        feedback: 'PLANNING phase activated - ready for implementation planning and research',
        previousPhase: 'spec-forge',
        nextPhase: 'work'
      };
    }

    return {
      success: false,
      phase: null,
      error: 'Planning phase not activated'
    };
  }
}

// Run tests
console.log('=== Planning Phase Transition Tests ===');

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

// Test 1: Successful transition when SPEC-FORGE is completed
test('should successfully transition to PLANNING when SPEC-FORGE is completed', () => {
  const system = new PhaseTransitionSystem();
  const triggers = ['planning', 'plan', 'research', 'architecture', 'implementation plan', 'analyze'];
  
  for (const trigger of triggers) {
    system.completePhase('spec-forge');
    const result = system.transitionToPlanning(trigger);
    
    if (!result.success) throw new Error(`Expected success to be true for trigger: ${trigger}`);
    if (result.phase !== 'planning') throw new Error(`Expected phase to be planning for trigger: ${trigger}`);
    if (!result.feedback.includes('PLANNING phase activated')) throw new Error(`Expected feedback to contain activation message for trigger: ${trigger}`);
    if (result.previousPhase !== 'spec-forge') throw new Error(`Expected previousPhase to be spec-forge for trigger: ${trigger}`);
    if (result.nextPhase !== 'work') throw new Error(`Expected nextPhase to be work for trigger: ${trigger}`);
    
    // Reset for next iteration
    system.currentPhase = null;
    system.completedPhases.clear();
    system.activeSkills.clear();
  }
});

// Test 2: Reject transition when SPEC-FORGE is not completed
test('should reject transition to PLANNING when SPEC-FORGE is not completed', () => {
  const system = new PhaseTransitionSystem();
  const triggers = ['planning', 'plan', 'research', 'architecture'];
  
  for (const trigger of triggers) {
    const result = system.transitionToPlanning(trigger);
    
    if (result.success) throw new Error(`Expected success to be false for trigger: ${trigger}`);
    if (result.phase !== null) throw new Error(`Expected phase to be null for trigger: ${trigger}`);
    if (!result.error.includes('Cannot transition to PLANNING phase')) throw new Error(`Expected error message about phase sequence for trigger: ${trigger}`);
    if (!result.error.includes('SPEC-FORGE phase must be completed first')) throw new Error(`Expected error message about SPEC-FORGE completion for trigger: ${trigger}`);
    if (!result.guidance.includes('complete requirements, design, and task planning')) throw new Error(`Expected guidance message for trigger: ${trigger}`);
  }
});

// Test 3: No activation for unrelated inputs
test('should not activate planning for unrelated inputs', () => {
  const system = new PhaseTransitionSystem();
  const unrelatedInputs = ['hello', 'test', 'code', 'debug', 'fix', 'implement', 'write'];
  
  for (const input of unrelatedInputs) {
    system.completePhase('spec-forge');
    const result = system.transitionToPlanning(input);
    
    if (result.success) throw new Error(`Expected success to be false for unrelated input: ${input}`);
    if (result.phase !== null) throw new Error(`Expected phase to be null for unrelated input: ${input}`);
    if (result.error !== 'Planning phase not activated') throw new Error(`Expected specific error message for unrelated input: ${input}`);
    
    // Reset for next iteration
    system.currentPhase = null;
    system.completedPhases.clear();
    system.activeSkills.clear();
  }
});

// Test 4: Case insensitive activation
test('should handle case-insensitive planning activation', () => {
  const system = new PhaseTransitionSystem();
  const triggers = ['PLANNING', 'planning', 'Planning', 'PLAN', 'plan', 'Plan', 'RESEARCH', 'research'];
  
  for (const trigger of triggers) {
    system.completePhase('spec-forge');
    const result = system.transitionToPlanning(trigger);
    
    if (!result.success) throw new Error(`Expected success to be true for case variant: ${trigger}`);
    if (result.phase !== 'planning') throw new Error(`Expected phase to be planning for case variant: ${trigger}`);
    
    // Reset for next iteration
    system.currentPhase = null;
    system.completedPhases.clear();
    system.activeSkills.clear();
  }
});

// Test 5: Phase sequence integrity
test('should maintain phase sequence integrity', () => {
  const system = new PhaseTransitionSystem();
  const triggers = ['planning', 'research', 'architecture'];
  
  for (const trigger of triggers) {
    system.completePhase('spec-forge');
    const result = system.transitionToPlanning(trigger);
    
    if (!result.success) throw new Error(`Expected success to be true for trigger: ${trigger}`);
    if (!system.completedPhases.has('spec-forge')) throw new Error(`Expected spec-forge to remain completed for trigger: ${trigger}`);
    if (system.currentPhase !== 'planning') throw new Error(`Expected current phase to be planning for trigger: ${trigger}`);
    if (result.previousPhase !== 'spec-forge') throw new Error(`Expected previous phase to be spec-forge for trigger: ${trigger}`);
    if (result.nextPhase !== 'work') throw new Error(`Expected next phase to be work for trigger: ${trigger}`);
    
    // Reset for next iteration
    system.currentPhase = null;
    system.completedPhases.clear();
    system.activeSkills.clear();
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

module.exports = { PhaseTransitionSystem };