/**
 * Property-based tests for phase sequence enforcement
 * Feature: ears-workflow-skill-refactor, Property 7: Phase sequence enforcement
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4
 */

const PhaseTransitionSystem = require('../skills/phase-transition-system.js');

// Simple property-based testing implementation
function generateTestCases(generator, numRuns = 100) {
  const cases = [];
  for (let i = 0; i < numRuns; i++) {
    cases.push(generator());
  }
  return cases;
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

console.log('=== Phase Sequence Enforcement Property Tests ===');

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

/**
 * Property 7: Phase sequence enforcement
 * For any EARS-workflow initiation, the system should start with SPEC-FORGE phase, 
 * and subsequent phase transitions should follow the sequence: SPEC-FORGE → PLANNING → WORK → REVIEW
 */
test('Property 7: should enforce SPEC-FORGE → PLANNING → WORK → REVIEW sequence', () => {
  const testCases = generateTestCases(() => {
    const phases = ['spec-forge', 'planning', 'work', 'review'];
    const shuffled = shuffleArray(phases);
    return shuffled.slice(0, randomInt(1, 4));
  }, 100);

  for (const phaseSequence of testCases) {
    const phaseSystem = new PhaseTransitionSystem();
    
    // Track which phases should be completed based on proper sequence
    const correctSequence = ['spec-forge', 'planning', 'work', 'review'];
    const expectedCompleted = [];
    
    // Try to activate phases in the given order
    for (let i = 0; i < phaseSequence.length; i++) {
      const phase = phaseSequence[i];
      const validation = phaseSystem.validatePhaseTransition(phase);
      
      // Determine if this transition should be valid
      const phaseIndex = correctSequence.indexOf(phase);
      
      // Check if all prerequisite phases have been completed
      const requiredPhases = correctSequence.slice(0, phaseIndex);
      const hasAllPrerequisites = requiredPhases.every(reqPhase => 
        phaseSystem.completedPhases.has(reqPhase)
      );
      
      if (phase === 'spec-forge' || hasAllPrerequisites) {
        // Should be valid
        if (!validation.valid) {
          throw new Error(`Expected ${phase} to be valid with prerequisites met`);
        }
        if (validation.phase !== phase) {
          throw new Error(`Expected validation phase to be ${phase}`);
        }
        if (!validation.message) {
          throw new Error(`Expected validation message for ${phase}`);
        }
        
        // Complete the phase to enable next phases
        phaseSystem.completePhase(phase);
        expectedCompleted.push(phase);
      } else {
        // Should be invalid due to missing prerequisites
        if (validation.valid) {
          throw new Error(`Expected ${phase} to be invalid without prerequisites`);
        }
        if (validation.phase !== null) {
          throw new Error(`Expected validation phase to be null for invalid ${phase}`);
        }
        if (validation.type !== 'sequence-violation') {
          throw new Error(`Expected sequence-violation type for ${phase}`);
        }
        if (!validation.missingPhases || validation.missingPhases.length === 0) {
          throw new Error(`Expected missing phases for ${phase}`);
        }
        if (!validation.suggestedNext) {
          throw new Error(`Expected suggested next phase for ${phase}`);
        }
      }
    }
    
    // Verify that the system maintains correct state
    const status = phaseSystem.getWorkflowStatus();
    
    // Check that all expected completed phases are in the status
    for (const expectedPhase of expectedCompleted) {
      if (!status.completedPhases.includes(expectedPhase)) {
        throw new Error(`Expected ${expectedPhase} to be in completed phases. Got: ${status.completedPhases.join(', ')}`);
      }
    }
    
    // Check that no unexpected phases are completed
    for (const completedPhase of status.completedPhases) {
      if (!expectedCompleted.includes(completedPhase)) {
        throw new Error(`Unexpected completed phase: ${completedPhase}. Expected: ${expectedCompleted.join(', ')}`);
      }
    }
  }
});

test('should always allow SPEC-FORGE as the first phase', () => {
  const testCases = generateTestCases(() => Math.random().toString(36), 100);
  
  for (const userInput of testCases) {
    const phaseSystem = new PhaseTransitionSystem();
    
    // SPEC-FORGE should always be valid as first phase
    const validation = phaseSystem.validatePhaseTransition('spec-forge');
    
    if (!validation.valid) {
      throw new Error('SPEC-FORGE should always be valid as first phase');
    }
    if (validation.phase !== 'spec-forge') {
      throw new Error('Expected phase to be spec-forge');
    }
    if (validation.type !== 'sequence-start') {
      throw new Error('Expected type to be sequence-start');
    }
    if (!validation.message.includes('SPEC-FORGE Phase Activated')) {
      throw new Error('Expected activation message');
    }
    
    // Should be able to transition successfully
    const transition = phaseSystem.transitionToPhaseSync('spec-forge', userInput);
    if (!transition.success) {
      throw new Error('Expected successful transition to spec-forge');
    }
    if (transition.phase !== 'spec-forge') {
      throw new Error('Expected transition phase to be spec-forge');
    }
    if (transition.currentPhase !== 'spec-forge') {
      throw new Error('Expected current phase to be spec-forge');
    }
    if (transition.nextPhase !== 'planning') {
      throw new Error('Expected next phase to be planning');
    }
  }
});

test('should reject phase skipping with proper guidance', () => {
  const testCases = generateTestCases(() => {
    const targetPhase = randomChoice(['planning', 'work', 'review']);
    const allPhases = ['spec-forge', 'planning', 'work'];
    const numToComplete = randomInt(0, 2);
    const completedPhases = [];
    for (let i = 0; i < numToComplete; i++) {
      if (i < allPhases.length) {
        completedPhases.push(allPhases[i]);
      }
    }
    return { targetPhase, completedPhases };
  }, 100);
  
  for (const { targetPhase, completedPhases } of testCases) {
    const phaseSystem = new PhaseTransitionSystem();
    
    // Complete only some phases (potentially creating gaps)
    const uniqueCompleted = [...new Set(completedPhases)];
    uniqueCompleted.forEach(phase => {
      phaseSystem.completePhase(phase);
    });
    
    // Try to activate target phase
    const validation = phaseSystem.validatePhaseTransition(targetPhase);
    
    // Determine if this should be valid
    const correctSequence = ['spec-forge', 'planning', 'work', 'review'];
    const targetIndex = correctSequence.indexOf(targetPhase);
    const requiredPhases = correctSequence.slice(0, targetIndex);
    const hasAllPrerequisites = requiredPhases.every(reqPhase => 
      phaseSystem.completedPhases.has(reqPhase)
    );
    
    if (hasAllPrerequisites) {
      if (!validation.valid) {
        throw new Error(`Expected ${targetPhase} to be valid with all prerequisites`);
      }
    } else {
      if (validation.valid) {
        throw new Error(`Expected ${targetPhase} to be invalid without prerequisites`);
      }
      if (validation.type !== 'sequence-violation') {
        throw new Error(`Expected sequence-violation for ${targetPhase}`);
      }
      if (!validation.missingPhases) {
        throw new Error(`Expected missing phases for ${targetPhase}`);
      }
      if (!validation.suggestedNext) {
        throw new Error(`Expected suggested next phase for ${targetPhase}`);
      }
      if (!validation.message.includes('Phase Sequence Guidance')) {
        throw new Error(`Expected guidance message for ${targetPhase}`);
      }
      if (!validation.message.includes('Missing Prerequisites')) {
        throw new Error(`Expected prerequisites message for ${targetPhase}`);
      }
      if (!validation.message.includes('Recommended Next Step')) {
        throw new Error(`Expected recommendation message for ${targetPhase}`);
      }
    }
  }
});

test('should allow utility skills at any time', () => {
  const testCases = generateTestCases(() => {
    const utilitySkill = randomChoice(['git-worktree', 'project-reset', 'some-utility']);
    const mainPhases = ['spec-forge', 'planning', 'work', 'review'];
    const numToComplete = randomInt(0, 4);
    const completedPhases = [];
    for (let i = 0; i < numToComplete && i < mainPhases.length; i++) {
      completedPhases.push(mainPhases[i]);
    }
    return { utilitySkill, completedPhases };
  }, 100);
  
  for (const { utilitySkill, completedPhases } of testCases) {
    const phaseSystem = new PhaseTransitionSystem();
    
    // Set up random completion state
    completedPhases.forEach(phase => {
      phaseSystem.completePhase(phase);
    });
    
    // Utility skills should always be valid
    const validation = phaseSystem.validatePhaseTransition(utilitySkill);
    
    if (!validation.valid) {
      throw new Error(`Expected ${utilitySkill} to be valid anytime`);
    }
    if (validation.phase !== utilitySkill) {
      throw new Error(`Expected phase to be ${utilitySkill}`);
    }
    if (validation.type !== 'utility') {
      throw new Error(`Expected type to be utility for ${utilitySkill}`);
    }
    if (validation.message !== null) {
      throw new Error(`Expected no special message for utility ${utilitySkill}`);
    }
  }
});

test('should provide correct next phase suggestions', () => {
  for (let numPhasesToComplete = 0; numPhasesToComplete <= 3; numPhasesToComplete++) {
    const phaseSystem = new PhaseTransitionSystem();
    
    const correctSequence = ['spec-forge', 'planning', 'work', 'review'];
    
    // Complete the specified number of phases in order
    for (let i = 0; i < numPhasesToComplete; i++) {
      phaseSystem.completePhase(correctSequence[i]);
    }
    
    // Try to activate a phase that's too far ahead
    const targetPhaseIndex = numPhasesToComplete + 1;
    if (targetPhaseIndex < correctSequence.length) {
      const targetPhase = correctSequence[targetPhaseIndex];
      const validation = phaseSystem.validatePhaseTransition(targetPhase);
      
      if (validation.valid) {
        throw new Error(`Expected ${targetPhase} to be invalid when skipping phases`);
      }
      if (validation.suggestedNext !== correctSequence[numPhasesToComplete]) {
        throw new Error(`Expected suggested next to be ${correctSequence[numPhasesToComplete]}`);
      }
      if (!validation.missingPhases.includes(correctSequence[numPhasesToComplete])) {
        throw new Error(`Expected missing phases to include ${correctSequence[numPhasesToComplete]}`);
      }
    }
  }
});

test('should maintain workflow state consistency', () => {
  const testCases = generateTestCases(() => {
    const phases = ['spec-forge', 'planning', 'work', 'review'];
    const numActivations = randomInt(1, 8);
    const activations = [];
    for (let i = 0; i < numActivations; i++) {
      activations.push(randomChoice(phases));
    }
    return activations;
  }, 50);
  
  for (const phaseActivations of testCases) {
    const phaseSystem = new PhaseTransitionSystem();
    
    let expectedCompletedPhases = new Set();
    
    for (const phase of phaseActivations) {
      const validation = phaseSystem.validatePhaseTransition(phase);
      
      if (validation.valid) {
        // Complete the phase
        const completion = phaseSystem.completePhaseSync(phase);
        if (!completion.success) {
          throw new Error(`Expected successful completion of ${phase}`);
        }
        expectedCompletedPhases.add(phase);
      }
    }
    
    // Verify final state consistency
    const status = phaseSystem.getWorkflowStatus();
    
    for (const expectedPhase of expectedCompletedPhases) {
      if (!status.completedPhases.includes(expectedPhase)) {
        throw new Error(`Expected ${expectedPhase} in completed phases`);
      }
    }
    
    if (status.completedPhases.length !== expectedCompletedPhases.size) {
      throw new Error(`Expected ${expectedCompletedPhases.size} completed phases, got ${status.completedPhases.length}`);
    }
    
    // Verify progress calculation
    const expectedProgress = `${expectedCompletedPhases.size}/4`;
    if (status.progress !== expectedProgress) {
      throw new Error(`Expected progress ${expectedProgress}, got ${status.progress}`);
    }
    
    // Verify completion status
    const expectedComplete = expectedCompletedPhases.size === 4;
    if (status.isComplete !== expectedComplete) {
      throw new Error(`Expected completion status ${expectedComplete}, got ${status.isComplete}`);
    }
  }
});

// Basic smoke tests
test('should enforce basic phase sequence', () => {
  const system = new PhaseTransitionSystem();
  
  // SPEC-FORGE should be valid first
  const specForgeValidation = system.validatePhaseTransition('spec-forge');
  if (!specForgeValidation.valid) throw new Error('SPEC-FORGE should be valid as first phase');
  
  // PLANNING should be invalid without SPEC-FORGE completion
  const planningValidation = system.validatePhaseTransition('planning');
  if (planningValidation.valid) throw new Error('PLANNING should be invalid without SPEC-FORGE completion');
  
  // Complete SPEC-FORGE
  system.completePhase('spec-forge');
  
  // Now PLANNING should be valid
  const planningValidation2 = system.validatePhaseTransition('planning');
  if (!planningValidation2.valid) throw new Error('PLANNING should be valid after SPEC-FORGE completion');
});

test('should allow utility skills anytime', () => {
  const system = new PhaseTransitionSystem();
  
  const gitWorktreeValidation = system.validatePhaseTransition('git-worktree');
  if (!gitWorktreeValidation.valid) throw new Error('git-worktree should be valid anytime');
  
  const projectResetValidation = system.validatePhaseTransition('project-reset');
  if (!projectResetValidation.valid) throw new Error('project-reset should be valid anytime');
});

console.log('\n=== Test Results ===');
console.log('Passed:', passed);
console.log('Failed:', failed);
console.log('Total:', passed + failed);

if (failed === 0) {
  console.log('\n🎉 All tests passed!');
} else {
  console.log('\n❌', failed, 'test(s) failed.');
  process.exit(1);
}