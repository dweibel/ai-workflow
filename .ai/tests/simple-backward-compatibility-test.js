/**
 * Simple backward compatibility test without external dependencies
 * Tests core functionality to ensure memory files work correctly
 */

const fs = require('fs');
const path = require('path');
const MemoryCompatibilityValidator = require('../skills/memory-compatibility-validator.js');
const MemoryAccessPatterns = require('../skills/memory-access-patterns.js');

// Simple test runner
function runTest(testName, testFn) {
    try {
        testFn();
        console.log(`✅ ${testName}`);
        return true;
    } catch (error) {
        console.log(`❌ ${testName}: ${error.message}`);
        return false;
    }
}

function expect(actual) {
    return {
        toBe: (expected) => {
            if (actual !== expected) {
                throw new Error(`Expected ${expected}, got ${actual}`);
            }
        },
        toContain: (expected) => {
            if (!actual.includes(expected)) {
                throw new Error(`Expected "${actual}" to contain "${expected}"`);
            }
        },
        toBeGreaterThan: (expected) => {
            if (actual <= expected) {
                throw new Error(`Expected ${actual} to be greater than ${expected}`);
            }
        },
        toBeDefined: () => {
            if (actual === undefined) {
                throw new Error(`Expected value to be defined`);
            }
        }
    };
}

console.log('=== Backward Compatibility Tests ===\n');

let passedTests = 0;
let totalTests = 0;

// Test 1: Memory file accessibility
totalTests++;
if (runTest('Memory files are accessible', () => {
    const validator = new MemoryCompatibilityValidator();
    const accessValidation = validator.validateFileAccess();
    
    expect(accessValidation.lessonsExists).toBe(true);
    expect(accessValidation.decisionsExists).toBe(true);
    expect(accessValidation.memoryDirExists).toBe(true);
})) passedTests++;

// Test 2: Memory file formats
totalTests++;
if (runTest('Memory file formats are valid', () => {
    const validator = new MemoryCompatibilityValidator();
    const formatValidation = validator.validateFileFormats();
    
    expect(formatValidation.lessonsFormat.valid).toBe(true);
    expect(formatValidation.decisionsFormat.valid).toBe(true);
})) passedTests++;

// Test 3: Memory access patterns
totalTests++;
if (runTest('Memory access patterns work', () => {
    const accessPatterns = new MemoryAccessPatterns();
    const validation = accessPatterns.validateAccessPatterns();
    
    expect(validation.canLoadLessons).toBe(true);
    expect(validation.canLoadDecisions).toBe(true);
    expect(validation.canAppendLessons).toBe(true);
    expect(validation.canAppendDecisions).toBe(true);
})) passedTests++;

// Test 4: Actual memory loading
totalTests++;
if (runTest('Memory files can be loaded', () => {
    const accessPatterns = new MemoryAccessPatterns();
    
    const lessonsResult = accessPatterns.loadLessons();
    const decisionsResult = accessPatterns.loadDecisions();
    
    expect(lessonsResult.success).toBe(true);
    expect(lessonsResult.content).toBeDefined();
    
    expect(decisionsResult.success).toBe(true);
    expect(decisionsResult.content).toBeDefined();
})) passedTests++;

// Test 5: Skill integration
totalTests++;
if (runTest('Skills can access memory files', () => {
    const validator = new MemoryCompatibilityValidator();
    const integrationValidation = validator.validateSkillIntegration();
    
    expect(integrationValidation.skillsCanAccessMemory).toBe(true);
    expect(integrationValidation.memoryReferencesValid).toBe(true);
    expect(integrationValidation.pathsCorrect).toBe(true);
})) passedTests++;

// Test 6: AGENTS.md preservation
totalTests++;
if (runTest('AGENTS.md content is preserved', () => {
    expect(fs.existsSync('AGENTS.md')).toBe(true);
    
    const agentsContent = fs.readFileSync('AGENTS.md', 'utf8');
    expect(agentsContent).toContain('Compound Engineering');
    expect(agentsContent).toContain('Attribution');
    expect(agentsContent).toContain('Prime Directive');
    expect(agentsContent).toContain('Context Routing');
})) passedTests++;

// Test 7: File structure preservation
totalTests++;
if (runTest('File structure is preserved', () => {
    const directories = ['workflows', 'templates', 'prompts', 'protocols', 'roles', 'docs', 'memory'];
    
    for (const dir of directories) {
        const dirPath = path.join('.ai', dir);
        if (fs.existsSync(dirPath)) {
            const stats = fs.statSync(dirPath);
            expect(stats.isDirectory()).toBe(true);
        }
    }
})) passedTests++;

// Test 8: Complete compatibility validation
totalTests++;
if (runTest('Complete compatibility validation passes', () => {
    const validator = new MemoryCompatibilityValidator();
    const completeValidation = validator.validateComplete();
    
    expect(completeValidation.overallValid).toBe(true);
    expect(completeValidation.summary.errors.length).toBe(0);
})) passedTests++;

// Test 9: Memory statistics consistency
totalTests++;
if (runTest('Memory statistics are consistent', () => {
    const accessPatterns = new MemoryAccessPatterns();
    const stats = accessPatterns.getMemoryStats();
    
    expect(stats.lessons.exists).toBe(true);
    expect(stats.decisions.exists).toBe(true);
    expect(stats.lessons.size).toBeGreaterThan(0);
    expect(stats.decisions.size).toBeGreaterThan(0);
})) passedTests++;

// Test 10: Property-based test simulation
totalTests++;
if (runTest('Property-based behavior simulation', () => {
    // Simulate property-based testing by running multiple iterations
    const validator = new MemoryCompatibilityValidator();
    const accessPatterns = new MemoryAccessPatterns();
    
    for (let i = 0; i < 10; i++) {
        // Test different file types
        const fileTypes = ['lessons', 'decisions'];
        const fileType = fileTypes[i % fileTypes.length];
        
        if (fileType === 'lessons') {
            const result = accessPatterns.loadLessons();
            expect(result.success).toBe(true);
        } else {
            const result = accessPatterns.loadDecisions();
            expect(result.success).toBe(true);
        }
        
        // Test validation
        const validation = validator.validateComplete();
        expect(validation.overallValid).toBe(true);
    }
})) passedTests++;

console.log(`\n=== Test Results ===`);
console.log(`Passed: ${passedTests}/${totalTests}`);
console.log(`Success Rate: ${Math.round((passedTests/totalTests) * 100)}%`);

if (passedTests === totalTests) {
    console.log('🎉 All backward compatibility tests passed!');
    process.exit(0);
} else {
    console.log('❌ Some tests failed');
    process.exit(1);
}