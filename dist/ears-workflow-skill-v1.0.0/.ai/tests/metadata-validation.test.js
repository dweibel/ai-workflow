/**
 * Property-based tests for metadata validation
 * Feature: ears-workflow-skill-refactor, Property 14: Metadata format validation
 * Validates: Requirements 8.5
 */

const fc = require('fast-check');
const MetadataValidator = require('../skills/metadata-validator.js');

describe('Metadata Validation', () => {
  let validator;

  beforeEach(() => {
    validator = new MetadataValidator();
  });

  /**
   * Property 14: Metadata format validation
   * For any SKILL.md file in the package, the YAML frontmatter should contain 
   * valid required fields (name, description, version) in proper format
   */
  test('Property 14: Valid SKILL.md files should pass metadata validation', () => {
    fc.assert(fc.property(
      // Generate valid skill names (kebab-case)
      fc.stringOf(fc.oneof(fc.char().filter(c => /[a-z0-9-]/.test(c)), fc.constant('-')), { minLength: 2, maxLength: 20 })
        .filter(s => /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(s)),
      
      // Generate valid descriptions (meaningful sentences)
      fc.stringOf(fc.char().filter(c => /[a-zA-Z0-9 .,!?-]/.test(c)), { minLength: 20, maxLength: 200 })
        .filter(s => s.trim().length >= 20 && s.includes(' ')),
      
      // Generate valid semantic versions
      fc.tuple(
        fc.integer({ min: 0, max: 99 }),
        fc.integer({ min: 0, max: 99 }),
        fc.integer({ min: 0, max: 99 })
      ).map(([major, minor, patch]) => `${major}.${minor}.${patch}`),
      
      // Optional author
      fc.option(fc.string({ minLength: 1, maxLength: 50 })),
      
      // Optional phase
      fc.option(fc.oneof(
        fc.constant('spec-forge'),
        fc.constant('planning'),
        fc.constant('work'),
        fc.constant('review'),
        fc.constant('utility')
      )),
      
      (name, description, version, author, phase) => {
        // Arrange - Create valid YAML frontmatter
        let yamlContent = `---\nname: ${name}\ndescription: ${description}\nversion: ${version}\n`;
        
        if (author) {
          yamlContent += `author: ${author}\n`;
        }
        
        if (phase) {
          yamlContent += `phase: ${phase}\n`;
        }
        
        yamlContent += '---\n\n# Skill Content\n\nThis is a test skill.';
        
        // Act
        const result = validator.validateContent(yamlContent, 'test-skill.md');
        
        // Assert
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.metadata).toBeDefined();
        expect(result.metadata.name).toBe(name);
        expect(result.metadata.description).toBe(description);
        expect(result.metadata.version).toBe(version);
        
        if (author) {
          expect(result.metadata.author).toBe(author);
        }
        
        if (phase) {
          expect(result.metadata.phase).toBe(phase);
        }
      }
    ), { numRuns: 100 });
  });

  test('Property 14: Invalid SKILL.md files should fail metadata validation', () => {
    fc.assert(fc.property(
      // Generate invalid content scenarios
      fc.oneof(
        // Missing frontmatter
        fc.constant('# No frontmatter here\n\nJust content.'),
        
        // Empty frontmatter
        fc.constant('---\n---\n\n# Content'),
        
        // Missing required fields
        fc.record({
          name: fc.option(fc.string()),
          description: fc.option(fc.string()),
          version: fc.option(fc.string())
        }).filter(obj => !obj.name || !obj.description || !obj.version),
        
        // Invalid name format (not kebab-case)
        fc.record({
          name: fc.oneof(
            fc.string().filter(s => s.includes(' ') || s.includes('_') || /[A-Z]/.test(s)),
            fc.constant(''),
            fc.constant('a') // too short
          ),
          description: fc.string({ minLength: 20 }),
          version: fc.string()
        }),
        
        // Invalid version format
        fc.record({
          name: fc.stringOf(fc.char().filter(c => /[a-z-]/.test(c)), { minLength: 2, maxLength: 20 })
            .filter(s => /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(s)),
          description: fc.string({ minLength: 20 }),
          version: fc.oneof(
            fc.constant('1.0'), // missing patch
            fc.constant('v1.0.0'), // has 'v' prefix
            fc.constant('1.0.0.0'), // too many parts
            fc.constant('not-a-version')
          )
        }),
        
        // Description too short
        fc.record({
          name: fc.stringOf(fc.char().filter(c => /[a-z-]/.test(c)), { minLength: 2, maxLength: 20 })
            .filter(s => /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(s)),
          description: fc.string({ minLength: 1, maxLength: 19 }),
          version: fc.tuple(
            fc.integer({ min: 0, max: 9 }),
            fc.integer({ min: 0, max: 9 }),
            fc.integer({ min: 0, max: 9 })
          ).map(([major, minor, patch]) => `${major}.${minor}.${patch}`)
        })
      ),
      
      (invalidData) => {
        let yamlContent;
        
        if (typeof invalidData === 'string') {
          yamlContent = invalidData;
        } else {
          // Build YAML from invalid record
          yamlContent = '---\n';
          for (const [key, value] of Object.entries(invalidData)) {
            if (value !== undefined && value !== null) {
              yamlContent += `${key}: ${value}\n`;
            }
          }
          yamlContent += '---\n\n# Content';
        }
        
        // Act
        const result = validator.validateContent(yamlContent, 'invalid-skill.md');
        
        // Assert - Should be invalid
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }
    ), { numRuns: 100 });
  });

  test('Property 14: All existing SKILL.md files should pass validation', () => {
    // This test validates that all current SKILL.md files in the project are valid
    const result = validator.validateAllSkills('.ai');
    
    // Should find at least the main SKILL.md
    expect(result.totalFiles).toBeGreaterThan(0);
    
    // All files should be valid
    expect(result.valid).toBe(true);
    expect(result.invalidFiles).toBe(0);
    
    // Should have no critical errors
    const criticalErrors = result.summary.errors.filter(err => 
      err.includes('Missing required field') || 
      err.includes('Invalid YAML syntax') ||
      err.includes('must be in kebab-case format')
    );
    expect(criticalErrors).toHaveLength(0);
    
    // Each valid file should have proper metadata
    for (const [filePath, fileResult] of Object.entries(result.files)) {
      if (fileResult.valid) {
        expect(fileResult.metadata).toBeDefined();
        expect(fileResult.metadata.name).toBeDefined();
        expect(fileResult.metadata.description).toBeDefined();
        expect(fileResult.metadata.version).toBeDefined();
        
        // Name should be kebab-case
        expect(fileResult.metadata.name).toMatch(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/);
        
        // Version should be semantic
        expect(fileResult.metadata.version).toMatch(/^\d+\.\d+\.\d+/);
        
        // Description should be meaningful
        expect(fileResult.metadata.description.length).toBeGreaterThan(20);
      }
    }
  });

  test('Property 14: Validation should handle edge cases gracefully', () => {
    fc.assert(fc.property(
      fc.oneof(
        // File doesn't exist
        fc.constant('nonexistent-file.md'),
        
        // Empty file
        fc.constant(''),
        
        // Only frontmatter, no content
        fc.constant('---\nname: test\ndescription: A test skill for validation\nversion: 1.0.0\n---'),
        
        // Malformed YAML
        fc.constant('---\nname: test\ndescription: "unclosed quote\nversion: 1.0.0\n---'),
        
        // Valid but with warnings
        fc.constant('---\nname: test-skill\ndescription: A test skill for validation purposes\nversion: 1.0.0\nphase: unknown-phase\nunknown-field: value\n---\n\n# Content')
      ),
      
      (testCase) => {
        let result;
        
        if (testCase === 'nonexistent-file.md') {
          result = validator.validateFile(testCase);
        } else {
          result = validator.validateContent(testCase, 'test.md');
        }
        
        // Should always return a result object
        expect(result).toBeDefined();
        expect(result).toHaveProperty('valid');
        expect(result).toHaveProperty('errors');
        expect(result).toHaveProperty('warnings');
        expect(result).toHaveProperty('metadata');
        
        // Errors should be arrays
        expect(Array.isArray(result.errors)).toBe(true);
        expect(Array.isArray(result.warnings)).toBe(true);
        
        // If invalid, should have at least one error
        if (!result.valid) {
          expect(result.errors.length).toBeGreaterThan(0);
        }
      }
    ), { numRuns: 50 });
  });
});