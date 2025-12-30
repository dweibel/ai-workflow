/**
 * Simple test for metadata validation without external dependencies
 * Feature: ears-workflow-skill-refactor, Property 14: Metadata format validation
 * Validates: Requirements 8.5
 */

const MetadataValidator = require('../skills/metadata-validator.js');

console.log('=== Metadata Validation Property Tests ===');

let passed = 0;
let total = 0;

function runTest(name, testFn) {
  total++;
  try {
    testFn();
    console.log(`✓ ${name}`);
    passed++;
    return true;
  } catch (error) {
    console.log(`✗ ${name}: ${error.message}`);
    return false;
  }
}

// Test 1: Valid metadata should pass validation
runTest('Valid metadata passes validation', () => {
  const validator = new MetadataValidator();
  const validYaml = `---
name: test-skill
description: A comprehensive test skill for validation purposes with meaningful content
version: 1.0.0
author: Test Author
phase: spec-forge
---

# Test Skill

This is test content.`;

  const result = validator.validateContent(validYaml, 'test.md');
  
  if (!result.valid) {
    throw new Error(`Expected valid result, got errors: ${result.errors.join(', ')}`);
  }
  
  if (!result.metadata) {
    throw new Error('Expected metadata to be present');
  }
  
  if (result.metadata.name !== 'test-skill') {
    throw new Error(`Expected name 'test-skill', got '${result.metadata.name}'`);
  }
});

// Test 2: Missing required fields should fail validation
runTest('Missing required fields fail validation', () => {
  const validator = new MetadataValidator();
  const invalidYaml = `---
name: test-skill
description: A test description
---

# Test Skill`;

  const result = validator.validateContent(invalidYaml, 'test.md');
  
  if (result.valid) {
    throw new Error('Expected invalid result for missing version field');
  }
  
  if (result.errors.length === 0) {
    throw new Error('Expected at least one error for missing required field');
  }
  
  const hasVersionError = result.errors.some(err => err.includes('version'));
  if (!hasVersionError) {
    throw new Error('Expected error about missing version field');
  }
});

// Test 3: Invalid name format should fail validation
runTest('Invalid name format fails validation', () => {
  const validator = new MetadataValidator();
  const invalidYaml = `---
name: Invalid_Name_With_Underscores
description: A comprehensive test skill for validation purposes with meaningful content
version: 1.0.0
---

# Test Skill`;

  const result = validator.validateContent(invalidYaml, 'test.md');
  
  if (result.valid) {
    throw new Error('Expected invalid result for non-kebab-case name');
  }
  
  const hasNameError = result.errors.some(err => err.includes('kebab-case'));
  if (!hasNameError) {
    throw new Error('Expected error about kebab-case format');
  }
});

// Test 4: Invalid version format should fail validation
runTest('Invalid version format fails validation', () => {
  const validator = new MetadataValidator();
  const invalidYaml = `---
name: test-skill
description: A comprehensive test skill for validation purposes with meaningful content
version: 1.0
---

# Test Skill`;

  const result = validator.validateContent(invalidYaml, 'test.md');
  
  if (result.valid) {
    throw new Error('Expected invalid result for invalid version format');
  }
  
  const hasVersionError = result.errors.some(err => err.includes('semantic versioning'));
  if (!hasVersionError) {
    throw new Error('Expected error about semantic versioning format');
  }
});

// Test 5: Short description should fail validation
runTest('Short description fails validation', () => {
  const validator = new MetadataValidator();
  const invalidYaml = `---
name: test-skill
description: Too short
version: 1.0.0
---

# Test Skill`;

  const result = validator.validateContent(invalidYaml, 'test.md');
  
  if (result.valid) {
    throw new Error('Expected invalid result for short description');
  }
  
  const hasDescError = result.errors.some(err => err.includes('20 characters'));
  if (!hasDescError) {
    throw new Error('Expected error about description length');
  }
});

// Test 6: No frontmatter should fail validation
runTest('No frontmatter fails validation', () => {
  const validator = new MetadataValidator();
  const invalidContent = `# Test Skill

This has no frontmatter.`;

  const result = validator.validateContent(invalidContent, 'test.md');
  
  if (result.valid) {
    throw new Error('Expected invalid result for missing frontmatter');
  }
  
  const hasFrontmatterError = result.errors.some(err => err.includes('YAML frontmatter'));
  if (!hasFrontmatterError) {
    throw new Error('Expected error about missing YAML frontmatter');
  }
});

// Test 7: Existing SKILL.md files should be valid
runTest('Existing SKILL.md files are valid', () => {
  const validator = new MetadataValidator();
  const result = validator.validateAllSkills('.ai');
  
  if (result.totalFiles === 0) {
    throw new Error('Expected to find at least one SKILL.md file');
  }
  
  if (!result.valid) {
    const criticalErrors = result.summary.errors.filter(err => 
      err.includes('Missing required field') || 
      err.includes('Invalid YAML syntax') ||
      err.includes('must be in kebab-case format')
    );
    
    if (criticalErrors.length > 0) {
      throw new Error(`Critical validation errors in existing files: ${criticalErrors.join('; ')}`);
    }
  }
  
  console.log(`  Found ${result.totalFiles} SKILL.md files, ${result.validFiles} valid, ${result.invalidFiles} invalid`);
  if (result.summary.warnings.length > 0) {
    console.log(`  Warnings: ${result.summary.warnings.length}`);
  }
});

console.log(`\nResults: ${passed}/${total} tests passed`);

if (passed === total) {
  console.log('✓ All metadata validation tests passed!');
  process.exit(0);
} else {
  console.log('✗ Some tests failed');
  process.exit(1);
}