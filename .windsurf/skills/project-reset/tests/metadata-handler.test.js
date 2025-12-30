/**
 * Property-Based Tests for MetadataHandler
 * **Feature: bash-to-javascript-conversion, Property 5: JSON metadata generation**
 * **Validates: Requirements 3.1**
 */

const fc = require('fast-check');
const MetadataHandler = require('../lib/metadata-handler');

describe('MetadataHandler Property-Based Tests', () => {
  let metadataHandler;

  beforeEach(() => {
    metadataHandler = new MetadataHandler();
  });

  /**
   * **Feature: bash-to-javascript-conversion, Property 5: JSON metadata generation**
   * **Validates: Requirements 3.1**
   * 
   * For any archive operation, the system should create JSON-formatted metadata 
   * that contains all required fields and follows the defined schema
   */
  test('Property 5: JSON metadata generation - generates valid JSON metadata for any operation', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random operation types and options
        fc.oneof(
          fc.constant('light'),
          fc.constant('medium'), 
          fc.constant('full'),
          fc.constant('custom'),
          fc.constant('archive')
        ),
        fc.record({
          resetLevel: fc.oneof(
            fc.constant('light'),
            fc.constant('medium'),
            fc.constant('full'),
            fc.constant('custom')
          ),
          archiveName: fc.string({ minLength: 1, maxLength: 50 }),
          customPaths: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { maxLength: 10 })
        }),
        async (operation, options) => {
          // Generate metadata
          const metadata = await metadataHandler.generateMetadata(operation, options);

          // Verify metadata is valid JSON (can be stringified and parsed)
          const jsonString = JSON.stringify(metadata);
          expect(jsonString).toBeDefined();
          expect(typeof jsonString).toBe('string');
          
          const parsedMetadata = JSON.parse(jsonString);
          expect(parsedMetadata).toEqual(metadata);

          // Verify all required fields are present
          expect(metadata).toHaveProperty('version');
          expect(metadata).toHaveProperty('created');
          expect(metadata).toHaveProperty('operation');
          expect(metadata).toHaveProperty('source');
          expect(metadata).toHaveProperty('contents');
          expect(metadata).toHaveProperty('restoration');

          // Verify field types
          expect(typeof metadata.version).toBe('string');
          expect(typeof metadata.created).toBe('string');
          expect(typeof metadata.operation).toBe('string');
          expect(typeof metadata.source).toBe('object');
          expect(typeof metadata.contents).toBe('object');
          expect(typeof metadata.restoration).toBe('object');

          // Verify source object structure
          expect(metadata.source).toHaveProperty('path');
          expect(typeof metadata.source.path).toBe('string');

          // Verify contents object structure
          expect(metadata.contents).toHaveProperty('directories');
          expect(metadata.contents).toHaveProperty('files');
          expect(metadata.contents).toHaveProperty('totalSize');
          expect(Array.isArray(metadata.contents.directories)).toBe(true);
          expect(typeof metadata.contents.totalSize).toBe('number');

          // Verify restoration object structure
          expect(metadata.restoration).toHaveProperty('compatible');
          expect(metadata.restoration).toHaveProperty('requirements');
          expect(Array.isArray(metadata.restoration.compatible)).toBe(true);
          expect(Array.isArray(metadata.restoration.requirements)).toBe(true);

          // Verify timestamp is valid ISO date
          expect(() => new Date(metadata.created)).not.toThrow();
          const date = new Date(metadata.created);
          expect(date.toISOString()).toBe(metadata.created);

          // Verify operation matches input or options
          const expectedOperation = options.resetLevel || operation;
          expect(metadata.operation).toBe(expectedOperation);

          // Verify metadata passes validation
          expect(() => metadataHandler.validateMetadata(metadata)).not.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 5 Extension: Metadata validation rejects invalid structures', () => {
    fc.assert(
      fc.property(
        // Generate invalid metadata by removing required fields
        fc.record({
          version: fc.option(fc.string()),
          created: fc.option(fc.string()),
          operation: fc.option(fc.string()),
          source: fc.option(fc.record({
            path: fc.option(fc.string())
          })),
          contents: fc.option(fc.record({
            directories: fc.option(fc.array(fc.string())),
            files: fc.option(fc.array(fc.string())),
            totalSize: fc.option(fc.integer())
          })),
          restoration: fc.option(fc.record({
            compatible: fc.option(fc.array(fc.string())),
            requirements: fc.option(fc.array(fc.string()))
          }))
        }),
        (invalidMetadata) => {
          // Remove some required fields to make it invalid
          const metadata = { ...invalidMetadata };
          
          // If all required fields are present, make it invalid by removing one
          if (metadata.version && metadata.created && metadata.operation && 
              metadata.source?.path && metadata.contents?.directories && 
              metadata.restoration?.compatible) {
            delete metadata.version; // Remove required field
          }

          // Validation should throw for invalid metadata
          expect(() => metadataHandler.validateMetadata(metadata)).toThrow();
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 5 Extension: Metadata display formatting is consistent', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant('light'),
          fc.constant('medium'),
          fc.constant('full')
        ),
        fc.record({
          resetLevel: fc.oneof(
            fc.constant('light'),
            fc.constant('medium'),
            fc.constant('full')
          )
        }),
        async (operation, options) => {
          const metadata = await metadataHandler.generateMetadata(operation, options);
          const displayText = metadataHandler.formatMetadataDisplay(metadata);

          // Verify display text is a string
          expect(typeof displayText).toBe('string');
          expect(displayText.length).toBeGreaterThan(0);

          // Verify key information is included in display
          expect(displayText).toContain('Archive Information');
          expect(displayText).toContain(metadata.version);
          expect(displayText).toContain(metadata.operation);
          expect(displayText).toContain('Source Information');
          expect(displayText).toContain('Contents');
          expect(displayText).toContain('Restoration');

          // Verify display is human-readable (contains proper formatting)
          expect(displayText).toMatch(/\n/); // Contains newlines
          expect(displayText).toMatch(/\s{2,}/); // Contains indentation
        }
      ),
      { numRuns: 50 }
    );
  });
});