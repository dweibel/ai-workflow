/**
 * Property-based tests for phase skip validation
 * Feature: ears-workflow-skill-refactor, Property 8: Phase skip validation
 * Validates: Requirements 4.5
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

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomSubset(array, maxSize) {
  const size = randomInt(0, Math.min(maxSize, array.length));
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, size);
}

console.log('=== Phase Skip Validation Property Tests ===');

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
 * Property 8: Phase skip validation
 * For any attempt to skip phases in the workflow sequence, 
 * the system should provide guidance about the proper sequence rather than allowing the skip
 */
test('Property 8: should prevent phase skipping with proper guidance', () => {
  const testCases = generateTestCases(() => {
    const allPhases = ['spec-forge', 'planning', 'work', 'review'];
    const targetPhase = randomChoice(['planning', 'work', 'review']); // Can't skip to spec-forge
    const completedPhases = randomSubset(['spec-forge', 'planning', 'work'], 2);
    return { targetPhase, completedPhases };
  }, 100);

  for (const { targetPhase, completedPhases } of testCases) {
    const phaseSystem = new PhaseTransitionSystem();
    
    // Complete only some phases (potentially creating gaps)
    completedPhases.forEach(phase => {
      phaseSystem.completePhase(phase);
    });
    
    // Try to activate target phase
    const validation = phaseSystem.validatePhaseTransition(targetPhase);
    
    // Determine if this should be valid based on proper sequence
    const correctSequence = ['spec-forge', 'planning', 'work', 'review'];
    const targetIndex = correctSequence.indexOf(targetPhase);
    const requiredPhases = correctSequence.slice(0, targetIndex);
    const hasAllPrerequisites = requiredPhases.every(reqPhase => 
      phaseSystem.completedPhases.has(reqPhase)
    );
    
    if (hasAllPrerequisites) {
      // Should be valid - all prerequisites are met
      if (!validation.valid) {
        throw new Error(`Expected ${targetPhase} to be valid when all prerequisites are met`);
      }
      if (validation.phase !== targetPhase) {
        throw new Error(`Expected validation phase to be ${targetPhase}`);
      }
    } else {
      // Should be invalid - phase skipping detected
      if (validation.valid) {
        throw new Error(`Expected ${targetPhase} to be invalid when skipping phases. Completed: ${completedPhases.join(', ')}`);
      }
      if (validation.phase !== null) {
        throw new Error(`Expected validation phase to be null for invalid ${targetPhase}`);
      }
      if (validation.type !== 'sequence-violation') {
        throw new Error(`Expected sequence-violation type for ${targetPhase}`);
      }
      
      // Verify guidance is provided
      if (!validation.message) {
        throw new Error(`Expected guidance message for ${targetPhase}`);
      }
      if (!validation.message.includes('Phase Sequence Guidance')) {
        throw new Error(`Expected 'Phase Sequence Guidance' in message for ${targetPhase}`);
      }
      if (!validation.message.includes('Missing Prerequisites')) {
        throw new Error(`Expected 'Missing Prerequisites' in message for ${targetPhase}`);
      }
      if (!validation.message.includes('Recommended Next Step')) {
        throw new Error(`Expected 'Recommended Next Step' in message for ${targetPhase}`);
      }
      
      // Verify missing phases are correctly identified
      if (!validation.missingPhases || validation.missingPhases.length === 0) {
        throw new Error(`Expected missing phases for ${targetPhase}`);
      }
      
      const expectedMissing = requiredPhases.filter(reqPhase => 
        !phaseSystem.completedPhases.has(reqPhase)
      );
      
      for (const expectedPhase of expectedMissing) {
        if (!validation.missingPhases.includes(expectedPhase)) {
          throw new Error(`Expected ${expectedPhase} in missing phases for ${targetPhase}`);
        }
      }
      
      // Verify suggested next phase is the first missing phase
      if (!validation.suggestedNext) {
        throw new Error(`Expected suggested next phase for ${targetPhase}`);
      }
      if (validation.suggestedNext !== expectedMissing[0]) {
        throw new Error(`Expected suggested next to be ${expectedMissing[0]}, got ${validation.suggestedNext}`);
      }
    }
  }
});

test('should detect all possible phase skip scenarios', () => {
  const skipScenarios = [
    // Skip from nothing to planning
    { completed: [], target: 'planning', shouldFail: true },
    // Skip from nothing to work  
    { completed: [], target: 'work', shouldFail: true },
    // Skip from nothing to review
    { completed: [], target: 'review', shouldFail: true },
    // Skip from spec-forge to work
    { completed: ['spec-forge'], target: 'work', shouldFail: true },
    // Skip from spec-forge to review
    { completed: ['spec-forge'], target: 'review', shouldFail: true },
    // Skip from planning to review
    { completed: ['spec-forge', 'planning'], target: 'review', shouldFail: true },
    // Valid transitions (no skipping)
    { completed: [], target: 'spec-forge', shouldFail: false },
    { completed: ['spec-forge'], target: 'planning', shouldFail: false },
    { completed: ['spec-forge', 'planning'], target: 'work', shouldFail: false },
    { completed: ['spec-forge', 'planning', 'work'], target: 'review', shouldFail: false }
  ];

  for (const scenario of skipScenarios) {
    const phaseSystem = new PhaseTransitionSystem();
    
    // Set up completed phases
    scenario.completed.forEach(phase => {
      phaseSystem.completePhase(phase);
    });
    
    // Try to activate target phase
    const validation = phaseSystem.validatePhaseTransition(scenario.target);
    
    if (scenario.shouldFail) {
      if (validation.valid) {
        throw new Error(`Expected ${scenario.target} to fail with completed phases: ${scenario.completed.join(', ')}`);
      }
      if (validation.type !== 'sequence-violation') {
        throw new Error(`Expected sequence-violation for ${scenario.target} with completed: ${scenario.completed.join(', ')}`);
      }
      if (!validation.message.includes('Phase Sequence Guidance')) {
        throw new Error(`Expected guidance message for ${scenario.target}`);
      }
    } else {
      if (!validation.valid) {
        throw new Error(`Expected ${scenario.target} to succeed with completed phases: ${scenario.completed.join(', ')}`);
      }
      if (validation.phase !== scenario.target) {
        throw new Error(`Expected validation phase to be ${scenario.target}`);
      }
    }
  }
});

test('should provide specific guidance for each type of skip', () => {
  const skipTypes = [
    { target: 'planning', expectedMissing: ['spec-forge'] },
    { target: 'work', expectedMissing: ['spec-forge', 'planning'] },
    { target: 'review', expectedMissing: ['spec-forge', 'planning', 'work'] }
  ];

  for (const skipType of skipTypes) {
    const phaseSystem = new PhaseTransitionSystem();
    // Don't complete any phases - maximum skip scenario
    
    const validation = phaseSystem.validatePhaseTransition(skipType.target);
    
    if (validation.valid) {
      throw new Error(`Expected ${skipType.target} to be invalid when skipping all prerequisites`);
    }
    
    // Check that all expected missing phases are identified
    for (const expectedPhase of skipType.expectedMissing) {
      if (!validation.missingPhases.includes(expectedPhase)) {
        throw new Error(`Expected ${expectedPhase} in missing phases for ${skipType.target}`);
      }
    }
    
    // Check that suggested next is the first missing phase
    if (validation.suggestedNext !== skipType.expectedMissing[0]) {
      throw new Error(`Expected suggested next to be ${skipType.expectedMissing[0]} for ${skipType.target}`);
    }
    
    // Check that guidance message contains target phase name
    if (!validation.message.includes(skipType.target.toUpperCase())) {
      throw new Error(`Expected guidance message to mention ${skipType.target.toUpperCase()}`);
    }
    
    // Check that guidance message contains first missing phase
    if (!validation.message.includes(skipType.expectedMissing[0].toUpperCase())) {
      throw new Error(`Expected guidance message to mention ${skipType.expectedMissing[0].toUpperCase()}`);
    }
  }
});

test('should handle partial completion scenarios correctly', () => {
  const partialScenarios = [
    // Complete spec-forge, try to skip to work (should fail)
    { completed: ['spec-forge'], target: 'work', expectedMissing: ['planning'] },
    // Complete spec-forge, try to skip to review (should fail)  
    { completed: ['spec-forge'], target: 'review', expectedMissing: ['planning', 'work'] },
    // Complete spec-forge and planning, try to skip to review (should fail)
    { completed: ['spec-forge', 'planning'], target: 'review', expectedMissing: ['work'] }
  ];

  for (const scenario of partialScenarios) {
    const phaseSystem = new PhaseTransitionSystem();
    
    // Complete specified phases
    scenario.completed.forEach(phase => {
      phaseSystem.completePhase(phase);
    });
    
    const validation = phaseSystem.validatePhaseTransition(scenario.target);
    
    if (validation.valid) {
      throw new Error(`Expected ${scenario.target} to be invalid with partial completion: ${scenario.completed.join(', ')}`);
    }
    
    // Verify missing phases are correctly identified
    for (const expectedMissing of scenario.expectedMissing) {
      if (!validation.missingPhases.includes(expectedMissing)) {
        throw new Error(`Expected ${expectedMissing} in missing phases for ${scenario.target} with completed: ${scenario.completed.join(', ')}`);
      }
    }
    
    // Verify suggested next is the first missing phase
    if (validation.suggestedNext !== scenario.expectedMissing[0]) {
      throw new Error(`Expected suggested next to be ${scenario.expectedMissing[0]} for ${scenario.target}`);
    }
    
    // Verify guidance message quality
    if (!validation.message.includes('workflow requires completing phases in sequence')) {
      throw new Error(`Expected sequence requirement message for ${scenario.target}`);
    }
  }
});

test('should maintain consistency across multiple skip attempts', () => {
  const testCases = generateTestCases(() => {
    const phases = ['planning', 'work', 'review'];
    const numAttempts = randomInt(2, 5);
    const attempts = [];
    for (let i = 0; i < numAttempts; i++) {
      attempts.push(randomChoice(phases));
    }
    return attempts;
  }, 50);

  for (const attempts of testCases) {
    const phaseSystem = new PhaseTransitionSystem();
    // Start with no completed phases to ensure all attempts fail
    
    for (const targetPhase of attempts) {
      const validation = phaseSystem.validatePhaseTransition(targetPhase);
      
      // All should fail since no phases are completed
      if (validation.valid) {
        throw new Error(`Expected ${targetPhase} to be invalid with no completed phases`);
      }
      
      // All should have consistent error structure
      if (validation.type !== 'sequence-violation') {
        throw new Error(`Expected sequence-violation for ${targetPhase}`);
      }
      if (!validation.missingPhases || validation.missingPhases.length === 0) {
        throw new Error(`Expected missing phases for ${targetPhase}`);
      }
      if (!validation.suggestedNext) {
        throw new Error(`Expected suggested next for ${targetPhase}`);
      }
      if (validation.suggestedNext !== 'spec-forge') {
        throw new Error(`Expected suggested next to be spec-forge for ${targetPhase}, got ${validation.suggestedNext}`);
      }
      
      // All should have proper guidance messages
      if (!validation.message.includes('Phase Sequence Guidance')) {
        throw new Error(`Expected guidance header for ${targetPhase}`);
      }
      if (!validation.message.includes('SPEC-FORGE')) {
        throw new Error(`Expected SPEC-FORGE mention for ${targetPhase}`);
      }
    }
  }
});

test('should provide educational context in guidance messages', () => {
  const educationalPhrases = [
    'workflow discipline',
    'foundation needed',
    'proper sequence',
    'builds the foundation',
    'ensures proper'
  ];

  const phases = ['planning', 'work', 'review'];
  
  for (const phase of phases) {
    const phaseSystem = new PhaseTransitionSystem();
    const validation = phaseSystem.validatePhaseTransition(phase);
    
    if (validation.valid) {
      throw new Error(`Expected ${phase} to be invalid with no prerequisites`);
    }
    
    // Check that guidance message contains educational context
    let hasEducationalContent = false;
    for (const phrase of educationalPhrases) {
      if (validation.message.toLowerCase().includes(phrase)) {
        hasEducationalContent = true;
        break;
      }
    }
    
    if (!hasEducationalContent) {
      throw new Error(`Expected educational content in guidance message for ${phase}. Message: ${validation.message}`);
    }
    
    // Check that message explains why the sequence matters
    if (!validation.message.includes('foundation') && !validation.message.includes('discipline')) {
      throw new Error(`Expected explanation of sequence importance for ${phase}`);
    }
  }
});

test('should handle edge cases in phase skip detection', () => {
  const edgeCases = [
    // Try to activate current phase (should be valid if already completed)
    { completed: ['spec-forge'], target: 'spec-forge', shouldSucceed: true },
    // Try to activate already completed phase
    { completed: ['spec-forge', 'planning'], target: 'spec-forge', shouldSucceed: true },
    // Try to activate next valid phase
    { completed: ['spec-forge'], target: 'planning', shouldSucceed: true },
    // Try to activate with all phases completed
    { completed: ['spec-forge', 'planning', 'work', 'review'], target: 'review', shouldSucceed: true }
  ];

  for (const edgeCase of edgeCases) {
    const phaseSystem = new PhaseTransitionSystem();
    
    // Set up completed phases
    edgeCase.completed.forEach(phase => {
      phaseSystem.completePhase(phase);
    });
    
    const validation = phaseSystem.validatePhaseTransition(edgeCase.target);
    
    if (edgeCase.shouldSucceed) {
      if (!validation.valid) {
        throw new Error(`Expected ${edgeCase.target} to succeed with completed: ${edgeCase.completed.join(', ')}`);
      }
    } else {
      if (validation.valid) {
        throw new Error(`Expected ${edgeCase.target} to fail with completed: ${edgeCase.completed.join(', ')}`);
      }
      if (!validation.message.includes('Phase Sequence Guidance')) {
        throw new Error(`Expected guidance message for ${edgeCase.target}`);
      }
    }
  }
});

// Basic smoke tests
test('should prevent basic phase skipping', () => {
  const system = new PhaseTransitionSystem();
  
  // Try to skip to work without completing spec-forge and planning
  const validation = system.validatePhaseTransition('work');
  
  if (validation.valid) {
    throw new Error('Should not allow skipping to work phase');
  }
  if (validation.type !== 'sequence-violation') {
    throw new Error('Should detect sequence violation');
  }
  if (!validation.missingPhases.includes('spec-forge')) {
    throw new Error('Should identify spec-forge as missing');
  }
  if (!validation.missingPhases.includes('planning')) {
    throw new Error('Should identify planning as missing');
  }
  if (validation.suggestedNext !== 'spec-forge') {
    throw new Error('Should suggest spec-forge as next step');
  }
});

test('should provide helpful guidance messages', () => {
  const system = new PhaseTransitionSystem();
  
  const validation = system.validatePhaseTransition('review');
  
  if (validation.valid) {
    throw new Error('Should not allow skipping to review phase');
  }
  if (!validation.message.includes('Phase Sequence Guidance')) {
    throw new Error('Should include guidance header');
  }
  if (!validation.message.includes('Missing Prerequisites')) {
    throw new Error('Should mention missing prerequisites');
  }
  if (!validation.message.includes('Recommended Next Step')) {
    throw new Error('Should provide recommendation');
  }
  if (!validation.message.includes('SPEC-FORGE')) {
    throw new Error('Should mention SPEC-FORGE as starting point');
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
  process.exit(1);
}