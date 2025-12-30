/**
 * Property-Based Tests for ArchiveManager
 * **Feature: bash-to-javascript-conversion, Property 8: Archive integrity validation**
 * **Validates: Requirements 3.5**
 * **Feature: bash-to-javascript-conversion, Property 6: Progress indication**
 * **Validates: Requirements 3.2**
 */

const fc = require('fast-check');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const ArchiveManager = require('../lib/archive-manager');
const MetadataHandler = require('../lib/metadata-handler');

describe('ArchiveManager Property-Based Tests', () => {
  let archiveManager;
  let metadataHandler;
  let tempDir;

  beforeEach(async () => {
    archiveManager = new ArchiveManager();
    metadataHandler = new MetadataHandler();
    
    // Create temporary directory for testing
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'archive-test-'));
  });

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await fs.rmdir(tempDir, { recursive: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  /**
   * **Feature: bash-to-javascript-conversion, Property 8: Archive integrity validation**
   * **Validates: Requirements 3.5**
   * 
   * For any archive restoration operation, the system should validate archive integrity 
   * and metadata consistency before proceeding with restoration
   */
  test('Property 8: Archive integrity validation - validates archive before restoration', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random archive scenarios
        fc.record({
          operation: fc.oneof(
            fc.constant('light'),
            fc.constant('medium'),
            fc.constant('full'),
            fc.constant('custom')
          ),
          archiveName: fc.string({ minLength: 1, maxLength: 30 }).filter(s => !/[<>:"|?*\x00-\x1f]/.test(s)),
          includeMemory: fc.boolean(),
          includeDocs: fc.boolean(),
          fileCount: fc.integer({ min: 0, max: 10 })
        }),
        async (scenario) => {
          const archivePath = path.join(tempDir, `test-archive-${scenario.archiveName}`);
          
          // Create a test archive with proper structure
          await fs.mkdir(archivePath, { recursive: true });
          
          // Generate valid metadata
          const metadata = await metadataHandler.generateMetadata(scenario.operation, {
            resetLevel: scenario.operation,
            archiveName: scenario.archiveName
          });
          
          // Create memory directory if specified
          if (scenario.includeMemory) {
            const memoryDir = path.join(archivePath, 'memory');
            await fs.mkdir(memoryDir, { recursive: true });
            
            // Create some test memory files
            await fs.writeFile(path.join(memoryDir, 'lessons.md'), '# Test lessons\n');
            await fs.writeFile(path.join(memoryDir, 'decisions.md'), '# Test decisions\n');
          }
          
          // Create docs directory if specified
          if (scenario.includeDocs) {
            const docsDir = path.join(archivePath, 'docs');
            await fs.mkdir(docsDir, { recursive: true });
            
            // Create subdirectories and files
            const subDirs = ['plans', 'tasks', 'reviews'];
            for (const subDir of subDirs) {
              const subDirPath = path.join(docsDir, subDir);
              await fs.mkdir(subDirPath, { recursive: true });
              
              // Create some test files
              for (let i = 0; i < Math.min(scenario.fileCount, 3); i++) {
                await fs.writeFile(
                  path.join(subDirPath, `test-${i}.md`), 
                  `# Test document ${i}\nContent for ${subDir}`
                );
              }
            }
          }
          
          // Update metadata with actual file counts
          const actualCounts = {
            memory: scenario.includeMemory ? 2 : 0,
            docs: scenario.includeDocs ? Math.min(scenario.fileCount * 3, 9) : 0,
            total: (scenario.includeMemory ? 2 : 0) + (scenario.includeDocs ? Math.min(scenario.fileCount * 3, 9) : 0)
          };
          
          metadata.contents.files = actualCounts;
          
          // Save metadata file
          const metadataPath = path.join(archivePath, 'archive-info.json');
          await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
          
          // Test: Valid archive should pass validation
          const isValid = await archiveManager.validateArchive(archivePath);
          expect(isValid).toBe(true);
          
          // Test: Archive metadata should be retrievable
          const retrievedMetadata = await archiveManager.getArchiveMetadata(archivePath);
          expect(retrievedMetadata).toEqual(metadata);
          
          // Test: Validation should detect required fields
          expect(retrievedMetadata.version).toBeDefined();
          expect(retrievedMetadata.created).toBeDefined();
          expect(retrievedMetadata.operation).toBeDefined();
          expect(retrievedMetadata.contents).toBeDefined();
          
          // Test: Archive structure should be consistent with metadata
          if (scenario.includeMemory) {
            const memoryExists = await fs.access(path.join(archivePath, 'memory')).then(() => true).catch(() => false);
            expect(memoryExists).toBe(true);
          }
          
          if (scenario.includeDocs) {
            const docsExists = await fs.access(path.join(archivePath, 'docs')).then(() => true).catch(() => false);
            expect(docsExists).toBe(true);
          }
        }
      ),
      { numRuns: 50 } // Reduced runs due to file system operations
    );
  });

  test('Property 8 Extension: Invalid archives fail validation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          archiveName: fc.string({ minLength: 1, maxLength: 30 }).filter(s => !/[<>:"|?*\x00-\x1f]/.test(s)),
          corruptionType: fc.oneof(
            fc.constant('missing_metadata'),
            fc.constant('invalid_json'),
            fc.constant('missing_required_field'),
            fc.constant('empty_archive')
          )
        }),
        async (scenario) => {
          const archivePath = path.join(tempDir, `corrupt-archive-${scenario.archiveName}`);
          await fs.mkdir(archivePath, { recursive: true });
          
          switch (scenario.corruptionType) {
            case 'missing_metadata':
              // Don't create metadata file
              break;
              
            case 'invalid_json':
              // Create invalid JSON metadata
              await fs.writeFile(
                path.join(archivePath, 'archive-info.json'),
                '{ invalid json content'
              );
              break;
              
            case 'missing_required_field':
              // Create metadata missing required fields
              const incompleteMetadata = {
                version: '1.0.0',
                // Missing created, operation, etc.
              };
              await fs.writeFile(
                path.join(archivePath, 'archive-info.json'),
                JSON.stringify(incompleteMetadata)
              );
              break;
              
            case 'empty_archive':
              // Create valid metadata but no actual content
              const metadata = await metadataHandler.generateMetadata('full');
              metadata.contents.files = { memory: 5, docs: 10, total: 15 }; // Claim files exist
              await fs.writeFile(
                path.join(archivePath, 'archive-info.json'),
                JSON.stringify(metadata)
              );
              break;
          }
          
          // All corrupted archives should fail validation
          const isValid = await archiveManager.validateArchive(archivePath);
          expect(isValid).toBe(false);
        }
      ),
      { numRuns: 30 }
    );
  });

  test('Property 8 Extension: Archive creation and extraction round-trip integrity', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          operation: fc.oneof(fc.constant('light'), fc.constant('medium'), fc.constant('full')),
          testFiles: fc.array(
            fc.record({
              path: fc.string({ minLength: 1, maxLength: 20 }).filter(s => !/[<>:"|?*\x00-\x1f\\\/]/.test(s)),
              content: fc.string({ maxLength: 100 })
            }),
            { maxLength: 5 }
          )
        }),
        async (scenario) => {
          // Create source directory with test structure
          const sourceDir = path.join(tempDir, 'source');
          const archiveDir = path.join(tempDir, 'archive');
          const extractDir = path.join(tempDir, 'extract');
          
          await fs.mkdir(sourceDir, { recursive: true });
          await fs.mkdir(path.join(sourceDir, '.ai', 'memory'), { recursive: true });
          await fs.mkdir(path.join(sourceDir, '.ai', 'docs', 'plans'), { recursive: true });
          
          // Create test files
          for (const file of scenario.testFiles) {
            const filePath = path.join(sourceDir, '.ai', 'memory', `${file.path}.md`);
            await fs.writeFile(filePath, file.content);
          }
          
          // Generate metadata
          const metadata = await metadataHandler.generateMetadata(scenario.operation);
          
          // Create archive
          await archiveManager.createArchive(sourceDir, archiveDir, metadata);
          
          // Validate archive
          const isValid = await archiveManager.validateArchive(archiveDir);
          expect(isValid).toBe(true);
          
          // Extract archive
          await archiveManager.extractArchive(archiveDir, extractDir);
          
          // Verify extracted files match original files
          for (const file of scenario.testFiles) {
            const originalPath = path.join(sourceDir, '.ai', 'memory', `${file.path}.md`);
            const extractedPath = path.join(extractDir, '.ai', 'memory', `${file.path}.md`);
            
            const originalExists = await fs.access(originalPath).then(() => true).catch(() => false);
            const extractedExists = await fs.access(extractedPath).then(() => true).catch(() => false);
            
            if (originalExists) {
              expect(extractedExists).toBe(true);
              
              const originalContent = await fs.readFile(originalPath, 'utf8');
              const extractedContent = await fs.readFile(extractedPath, 'utf8');
              expect(extractedContent).toBe(originalContent);
            }
          }
        }
      ),
      { numRuns: 20 } // Reduced due to complex file operations
    );
  });

  /**
   * **Feature: bash-to-javascript-conversion, Property 6: Progress indication**
   * **Validates: Requirements 3.2**
   * 
   * For any long-running operation, the system should provide progress callbacks 
   * or indicators that inform users of operation status
   */
  test('Property 6: Progress indication - provides progress callbacks for long-running operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random archive scenarios with varying complexity
        fc.record({
          operation: fc.oneof(
            fc.constant('light'),
            fc.constant('medium'),
            fc.constant('full'),
            fc.constant('custom')
          ),
          archiveName: fc.string({ minLength: 1, maxLength: 20 }).filter(s => !/[<>:"|?*\x00-\x1f]/.test(s)),
          fileCount: fc.integer({ min: 1, max: 20 }), // Ensure we have files to process
          includeMemory: fc.boolean(),
          includeDocs: fc.boolean(),
          useCompression: fc.boolean()
        }),
        async (scenario) => {
          // Skip scenarios with no files to process
          if (!scenario.includeMemory && !scenario.includeDocs) {
            return;
          }

          const sourceDir = path.join(tempDir, `source-${scenario.archiveName}`);
          const archiveDir = path.join(tempDir, `archive-${scenario.archiveName}`);
          
          // Create source directory structure
          await fs.mkdir(sourceDir, { recursive: true });
          
          let expectedFileCount = 0;
          
          // Create memory files if specified
          if (scenario.includeMemory) {
            const memoryDir = path.join(sourceDir, '.ai', 'memory');
            await fs.mkdir(memoryDir, { recursive: true });
            
            await fs.writeFile(path.join(memoryDir, 'lessons.md'), '# Test lessons\nSome content');
            await fs.writeFile(path.join(memoryDir, 'decisions.md'), '# Test decisions\nSome content');
            expectedFileCount += 2;
          }
          
          // Create documentation files if specified
          if (scenario.includeDocs) {
            const docsDir = path.join(sourceDir, '.ai', 'docs');
            await fs.mkdir(docsDir, { recursive: true });
            
            const subDirs = ['plans', 'tasks', 'reviews'];
            for (const subDir of subDirs) {
              const subDirPath = path.join(docsDir, subDir);
              await fs.mkdir(subDirPath, { recursive: true });
              
              // Create test files
              const filesInDir = Math.min(scenario.fileCount, 5);
              for (let i = 0; i < filesInDir; i++) {
                await fs.writeFile(
                  path.join(subDirPath, `test-${i}.md`), 
                  `# Test document ${i}\nContent for ${subDir}\n${'x'.repeat(100)}`
                );
                expectedFileCount++;
              }
            }
          }
          
          // Track progress callbacks
          const progressEvents = [];
          const progressCallback = (progress) => {
            progressEvents.push(progress);
          };
          
          // Generate metadata
          const metadata = await metadataHandler.generateMetadata(scenario.operation, {
            resetLevel: scenario.operation,
            archiveName: scenario.archiveName
          });
          
          // Create archive with progress tracking
          await archiveManager.createArchive(sourceDir, archiveDir, metadata, {
            progressCallback,
            compression: scenario.useCompression
          });
          
          // Verify progress indication properties
          
          // Property 1: Progress callbacks should be called
          expect(progressEvents.length).toBeGreaterThan(0);
          
          // Property 2: Progress should include required fields
          for (const event of progressEvents) {
            expect(event).toHaveProperty('phase');
            expect(event).toHaveProperty('total');
            expect(event).toHaveProperty('processed');
            expect(typeof event.phase).toBe('string');
            expect(typeof event.total).toBe('number');
            expect(typeof event.processed).toBe('number');
          }
          
          // Property 3: Progress should be monotonically increasing
          let lastProcessed = -1;
          for (const event of progressEvents) {
            if (event.phase !== 'counting') { // Skip counting phase for monotonic check
              expect(event.processed).toBeGreaterThanOrEqual(lastProcessed);
              lastProcessed = event.processed;
            }
          }
          
          // Property 4: Final progress should indicate completion
          const finalEvent = progressEvents[progressEvents.length - 1];
          expect(finalEvent.phase).toBe('complete');
          expect(finalEvent.processed).toBe(finalEvent.total);
          
          // Property 5: Total should be consistent across events (after counting)
          const nonCountingEvents = progressEvents.filter(e => e.phase !== 'counting');
          if (nonCountingEvents.length > 1) {
            const firstTotal = nonCountingEvents[0].total;
            for (const event of nonCountingEvents) {
              expect(event.total).toBe(firstTotal);
            }
          }
          
          // Property 6: Progress phases should follow logical order
          const phases = progressEvents.map(e => e.phase);
          const expectedPhases = ['counting', 'archiving'];
          
          if (scenario.includeMemory) {
            expectedPhases.push('memory');
          }
          if (scenario.includeDocs) {
            expectedPhases.push('documentation');
          }
          expectedPhases.push('metadata', 'complete');
          
          // Check that all expected phases appear in order
          let phaseIndex = 0;
          for (const phase of phases) {
            if (phaseIndex < expectedPhases.length && phase === expectedPhases[phaseIndex]) {
              phaseIndex++;
            }
          }
          
          // Should have seen all expected phases
          expect(phaseIndex).toBe(expectedPhases.length);
          
          // Test extraction progress as well
          const extractDir = path.join(tempDir, `extract-${scenario.archiveName}`);
          const extractProgressEvents = [];
          const extractProgressCallback = (progress) => {
            extractProgressEvents.push(progress);
          };
          
          await archiveManager.extractArchive(archiveDir, extractDir, {
            progressCallback: extractProgressCallback
          });
          
          // Verify extraction progress
          expect(extractProgressEvents.length).toBeGreaterThan(0);
          
          const finalExtractEvent = extractProgressEvents[extractProgressEvents.length - 1];
          expect(finalExtractEvent.phase).toBe('complete');
        }
      ),
      { numRuns: 30 } // Reduced runs due to file system operations and progress tracking
    );
  });
});