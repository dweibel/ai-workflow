/**
 * Property-based tests for error handling completeness
 * Feature: ears-workflow-skill-refactor, Property 5: Error handling completeness
 * Validates: Requirements 2.5
 */

const fc = require('fast-check');
const SkillActivationRouter = require('../skills/activation-router.js');
const ActivationErrorHandler = require('../skills/activation-error-handler.js');

// Mock file system for testing
class MockFileSystem {
    constructor() {
        this.files = new Map();
        this.directories = new Set();
        this.permissions = new Map();
        this.corrupted = new Set();
    }

    setFile(path, content) {
        this.files.set(path, content);
        this.permissions.set(path, 'read');
    }

    setDirectory(path) {
        this.directories.add(path);
        this.permissions.set(path, 'read');
    }

    removeFile(path) {
        this.files.delete(path);
        this.permissions.delete(path);
    }

    removeDirectory(path) {
        this.directories.delete(path);
        this.permissions.delete(path);
    }

    setPermission(path, permission) {
        this.permissions.set(path, permission);
    }

    corruptFile(path) {
        this.corrupted.add(path);
    }

    fileExists(path) {
        return this.files.has(path) && this.permissions.get(path) === 'read';
    }

    directoryExists(path) {
        return this.directories.has(path) && this.permissions.get(path) === 'read';
    }

    readFile(path) {
        if (!this.fileExists(path)) {
            throw new Error(`File not found: ${path}`);
        }
        if (this.corrupted.has(path)) {
            return 'corrupted content ###invalid###';
        }
        return this.files.get(path);
    }

    reset() {
        this.files.clear();
        this.directories.clear();
        this.permissions.clear();
        this.corrupted.clear();
    }
}

// Mock error handler that uses the mock file system
class MockActivationErrorHandler extends ActivationErrorHandler {
    constructor(mockFs) {
        super();
        this.mockFs = mockFs;
    }

    fileExists(filePath) {
        return this.mockFs.fileExists(filePath);
    }

    directoryExists(dirPath) {
        return this.mockFs.directoryExists(dirPath);
    }

    validateYAMLFrontmatter(filePath) {
        try {
            const content = this.mockFs.readFile(filePath);
            
            if (content.includes('corrupted') || content.includes('###invalid###')) {
                return { valid: false, error: 'Corrupted YAML content' };
            }

            const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
            if (!yamlMatch) {
                return { valid: false, error: 'No YAML frontmatter found' };
            }

            const yamlContent = yamlMatch[1];
            const requiredFields = ['name', 'description', 'version'];
            
            for (const field of requiredFields) {
                if (!yamlContent.includes(`${field}:`)) {
                    return { valid: false, error: `Missing required field: ${field}` };
                }
            }

            return { valid: true };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    validateMemoryFile(filePath) {
        try {
            const content = this.mockFs.readFile(filePath);
            
            if (content.includes('corrupted') || content.includes('###invalid###')) {
                return { valid: false, error: 'Corrupted memory file' };
            }

            if (content.trim().length === 0) {
                return { valid: false, error: 'Empty file' };
            }

            return { valid: true };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }
}

describe('Error Handling Completeness', () => {
    let mockFs;
    let errorHandler;
    let router;

    beforeEach(() => {
        mockFs = new MockFileSystem();
        errorHandler = new MockActivationErrorHandler(mockFs);
        router = new SkillActivationRouter();
        // Inject mock error handler
        router.errorHandler = errorHandler;
    });

    afterEach(() => {
        mockFs.reset();
        router.reset();
    });

    /**
     * Property 5: Error handling completeness
     * For any skill activation failure, the system should generate helpful error messages 
     * with troubleshooting guidance
     */
    test('should detect and handle missing files errors', () => {
        fc.assert(fc.property(
            fc.subarray(errorHandler.requiredFiles, { minLength: 1, maxLength: 5 }),
            fc.subarray(errorHandler.requiredDirectories, { minLength: 1, maxLength: 3 }),
            (missingFiles, missingDirs) => {
                // Arrange - create a partial installation with some files missing
                const allFiles = errorHandler.requiredFiles;
                const allDirs = errorHandler.requiredDirectories;
                
                // Add existing files and directories
                allFiles.filter(f => !missingFiles.includes(f)).forEach(file => {
                    mockFs.setFile(file, `---\nname: test\ndescription: test\nversion: 1.0.0\n---\n# Test`);
                });
                
                allDirs.filter(d => !missingDirs.includes(d)).forEach(dir => {
                    mockFs.setDirectory(dir);
                });

                // Act - try to activate with missing files
                const result = router.analyzeInput('use ears workflow');

                // Assert - should detect missing files error
                expect(result.type).toBe('error');
                expect(result.error).toBe('missing-files');
                expect(result.message).toContain('Missing Files');
                expect(result.details.missing.length).toBeGreaterThan(0);
                expect(result.troubleshooting).toBeDefined();
                expect(result.troubleshooting.length).toBeGreaterThan(0);
                expect(result.recovery).toBeDefined();
                expect(result.recovery.length).toBeGreaterThan(0);
            }
        ), { numRuns: 50 });
    });

    test('should detect and handle invalid YAML errors', () => {
        fc.assert(fc.property(
            fc.constantFrom(
                '---\nname: test\n# missing description and version\n---',
                '---\nname: test\ndescription: test\n# missing version\n---',
                '---\n# missing name\ndescription: test\nversion: 1.0.0\n---',
                'no yaml frontmatter at all',
                '---\ninvalid: yaml: syntax:\n---'
            ),
            (invalidYaml) => {
                // Arrange - create installation with invalid YAML
                errorHandler.requiredDirectories.forEach(dir => mockFs.setDirectory(dir));
                errorHandler.requiredFiles.forEach(file => {
                    if (file.endsWith('SKILL.md')) {
                        mockFs.setFile(file, invalidYaml);
                    } else {
                        mockFs.setFile(file, 'valid content');
                    }
                });

                // Act - try to activate with invalid YAML
                const result = router.analyzeInput('use ears workflow');

                // Assert - should detect YAML error
                expect(result.type).toBe('error');
                expect(result.error).toBe('invalid-yaml');
                expect(result.message).toContain('Invalid Metadata');
                expect(result.troubleshooting).toContain('Check YAML frontmatter syntax');
                expect(result.recovery).toContain('Fix YAML syntax errors manually');
            }
        ), { numRuns: 50 });
    });

    test('should detect and handle permission denied errors', () => {
        fc.assert(fc.property(
            fc.subarray(errorHandler.requiredFiles, { minLength: 1, maxLength: 3 }),
            (restrictedFiles) => {
                // Arrange - create installation with permission issues
                errorHandler.requiredDirectories.forEach(dir => mockFs.setDirectory(dir));
                errorHandler.requiredFiles.forEach(file => {
                    mockFs.setFile(file, `---\nname: test\ndescription: test\nversion: 1.0.0\n---\n# Test`);
                    if (restrictedFiles.includes(file)) {
                        mockFs.setPermission(file, 'denied');
                    }
                });

                // Act - try to activate with permission issues
                const result = router.analyzeInput('use ears workflow');

                // Assert - should detect permission error (manifests as missing files)
                expect(result.type).toBe('error');
                expect(['missing-files', 'permission-denied']).toContain(result.error);
                expect(result.message).toMatch(/Missing Files|Permission Denied/);
                expect(result.troubleshooting).toBeDefined();
                expect(result.recovery).toBeDefined();
            }
        ), { numRuns: 50 });
    });

    test('should detect and handle corrupted memory files', () => {
        fc.assert(fc.property(
            fc.constantFrom('.ai/memory/lessons.md', '.ai/memory/decisions.md'),
            (memoryFile) => {
                // Arrange - create installation with corrupted memory
                errorHandler.requiredDirectories.forEach(dir => mockFs.setDirectory(dir));
                errorHandler.requiredFiles.forEach(file => {
                    mockFs.setFile(file, `---\nname: test\ndescription: test\nversion: 1.0.0\n---\n# Test`);
                });
                
                // Add memory files
                mockFs.setFile('.ai/memory/lessons.md', '# Lessons\n\nValid content');
                mockFs.setFile('.ai/memory/decisions.md', '# Decisions\n\nValid content');
                
                // Corrupt one memory file
                mockFs.corruptFile(memoryFile);

                // Act - try to activate with corrupted memory
                const result = router.analyzeInput('use ears workflow');

                // Assert - should detect corrupted memory error
                expect(result.type).toBe('error');
                expect(result.error).toBe('corrupted-memory');
                expect(result.message).toContain('Corrupted Memory Files');
                expect(result.troubleshooting).toContain('Check memory file contents');
                expect(result.recovery).toContain('Restore memory files from backup');
            }
        ), { numRuns: 50 });
    });

    test('should provide comprehensive error context', () => {
        fc.assert(fc.property(
            fc.oneof(
                fc.constant('missing-files'),
                fc.constant('invalid-yaml'),
                fc.constant('corrupted-memory')
            ),
            (errorType) => {
                // Arrange - create specific error condition
                switch (errorType) {
                    case 'missing-files':
                        // Leave some files missing
                        mockFs.setDirectory('.ai');
                        break;
                    case 'invalid-yaml':
                        errorHandler.requiredDirectories.forEach(dir => mockFs.setDirectory(dir));
                        mockFs.setFile('.ai/SKILL.md', 'invalid yaml');
                        break;
                    case 'corrupted-memory':
                        errorHandler.requiredDirectories.forEach(dir => mockFs.setDirectory(dir));
                        errorHandler.requiredFiles.forEach(file => {
                            mockFs.setFile(file, `---\nname: test\ndescription: test\nversion: 1.0.0\n---\n# Test`);
                        });
                        mockFs.setFile('.ai/memory/lessons.md', 'corrupted');
                        mockFs.corruptFile('.ai/memory/lessons.md');
                        break;
                }

                // Act
                const result = router.analyzeInput('use ears workflow');

                // Assert - should provide comprehensive error information
                expect(result.type).toBe('error');
                expect(result.error).toBe(errorType);
                expect(result.message).toBeDefined();
                expect(result.message.length).toBeGreaterThan(50); // Substantial error message
                expect(result.details).toBeDefined();
                expect(result.troubleshooting).toBeDefined();
                expect(result.troubleshooting.length).toBeGreaterThan(0);
                expect(result.recovery).toBeDefined();
                expect(result.recovery.length).toBeGreaterThan(0);
            }
        ), { numRuns: 50 });
    });

    test('should handle analysis errors gracefully', () => {
        fc.assert(fc.property(
            fc.string({ minLength: 1, maxLength: 100 }),
            (userInput) => {
                // Arrange - create a router that will throw during analysis
                const faultyRouter = new SkillActivationRouter();
                faultyRouter.detectMainWorkflow = () => {
                    throw new Error('Simulated analysis error');
                };

                // Act
                const result = faultyRouter.analyzeInput(userInput);

                // Assert - should handle analysis error gracefully
                expect(result.type).toBe('error');
                expect(result.error).toBe('analysis-error');
                expect(result.message).toContain('Failed to analyze input');
                expect(result.message).toContain('Simulated analysis error');
                expect(result.details.errorMessage).toBe('Simulated analysis error');
                expect(result.details.input).toBe(userInput);
                expect(result.troubleshooting).toBeDefined();
                expect(result.recovery).toBeDefined();
            }
        ), { numRuns: 50 });
    });

    test('should provide specific troubleshooting steps for each error type', () => {
        const errorTypes = [
            'missing-files',
            'invalid-yaml', 
            'dependency-missing',
            'context-overflow',
            'permission-denied',
            'corrupted-memory'
        ];

        errorTypes.forEach(errorType => {
            const troubleshooting = errorHandler.getTroubleshootingSteps(errorType, {});
            const recovery = errorHandler.getRecoveryOptions(errorType, {});

            expect(troubleshooting).toBeDefined();
            expect(Array.isArray(troubleshooting)).toBe(true);
            expect(troubleshooting.length).toBeGreaterThan(0);
            expect(troubleshooting.every(step => typeof step === 'string')).toBe(true);
            expect(troubleshooting.every(step => step.length > 10)).toBe(true); // Substantial steps

            expect(recovery).toBeDefined();
            expect(Array.isArray(recovery)).toBe(true);
            expect(recovery.length).toBeGreaterThan(0);
            expect(recovery.every(option => typeof option === 'string')).toBe(true);
            expect(recovery.every(option => option.length > 10)).toBe(true); // Substantial options
        });
    });

    test('should generate appropriate error messages for all error types', () => {
        fc.assert(fc.property(
            fc.constantFrom(
                'missing-files',
                'invalid-yaml',
                'dependency-missing', 
                'context-overflow',
                'permission-denied',
                'corrupted-memory',
                'circular-dependency',
                'version-mismatch'
            ),
            fc.record({
                missing: fc.array(fc.string(), { maxLength: 3 }),
                file: fc.string(),
                yamlError: fc.string(),
                missingDeps: fc.array(fc.string(), { maxLength: 3 }),
                tokenCount: fc.integer({ min: 1000, max: 10000 }),
                limit: fc.integer({ min: 8000, max: 9000 })
            }),
            (errorType, context) => {
                // Act
                const message = errorHandler.generateErrorMessage(errorType, context);

                // Assert
                expect(message).toBeDefined();
                expect(typeof message).toBe('string');
                expect(message.length).toBeGreaterThan(50); // Substantial message
                expect(message).toMatch(/❌|⚠️/); // Should have error/warning emoji
                expect(message).toContain('**'); // Should have markdown formatting
                
                // Should contain error type specific content
                if (errorType === 'missing-files') {
                    expect(message).toContain('Missing Files');
                } else if (errorType === 'invalid-yaml') {
                    expect(message).toContain('Invalid Metadata');
                } else if (errorType === 'context-overflow') {
                    expect(message).toContain('Context Limit');
                }
            }
        ), { numRuns: 50 });
    });

    test('should maintain error handling consistency across multiple failures', () => {
        fc.assert(fc.property(
            fc.array(fc.constantFrom('use ears workflow', 'spec-forge', 'planning'), { minLength: 2, maxLength: 5 }),
            (inputs) => {
                // Arrange - create consistent error condition (missing files)
                mockFs.setDirectory('.ai');
                // Leave required files missing

                const results = [];
                
                // Act - try multiple activations with same error condition
                inputs.forEach(input => {
                    const result = router.analyzeInput(input);
                    results.push(result);
                });

                // Assert - should provide consistent error handling
                results.forEach(result => {
                    expect(result.type).toBe('error');
                    expect(result.error).toBe('missing-files');
                    expect(result.message).toContain('Missing Files');
                    expect(result.troubleshooting).toBeDefined();
                    expect(result.recovery).toBeDefined();
                });

                // All results should have similar structure
                const firstResult = results[0];
                results.slice(1).forEach(result => {
                    expect(result.error).toBe(firstResult.error);
                    expect(result.troubleshooting.length).toBe(firstResult.troubleshooting.length);
                    expect(result.recovery.length).toBe(firstResult.recovery.length);
                });
            }
        ), { numRuns: 50 });
    });

    test('should handle edge cases in error detection', () => {
        fc.assert(fc.property(
            fc.oneof(
                fc.constant(''), // empty input
                fc.constant('   '), // whitespace only
                fc.string({ minLength: 1000, maxLength: 2000 }), // very long input
                fc.string().filter(s => s.includes('\n') || s.includes('\t')), // special characters
                fc.string().filter(s => /[^\x00-\x7F]/.test(s)) // non-ASCII characters
            ),
            (edgeCaseInput) => {
                // Arrange - create error condition
                mockFs.setDirectory('.ai');
                // Leave files missing to trigger error

                // Act
                const result = router.analyzeInput(edgeCaseInput);

                // Assert - should handle edge cases gracefully
                expect(result.type).toBe('error');
                expect(result.message).toBeDefined();
                expect(result.troubleshooting).toBeDefined();
                expect(result.recovery).toBeDefined();
                
                // Should not crash or return undefined
                expect(result.error).toBeDefined();
                expect(typeof result.error).toBe('string');
            }
        ), { numRuns: 50 });
    });
});

describe('Error Handler Validation', () => {
    let errorHandler;
    let mockFs;

    beforeEach(() => {
        mockFs = new MockFileSystem();
        errorHandler = new MockActivationErrorHandler(mockFs);
    });

    test('should validate complete installation correctly', () => {
        // Arrange - create complete valid installation
        errorHandler.requiredDirectories.forEach(dir => mockFs.setDirectory(dir));
        errorHandler.requiredFiles.forEach(file => {
            mockFs.setFile(file, `---\nname: test\ndescription: test\nversion: 1.0.0\n---\n# Test`);
        });
        mockFs.setFile('.ai/memory/lessons.md', '# Lessons\n\nValid content');
        mockFs.setFile('.ai/memory/decisions.md', '# Decisions\n\nValid content');

        // Act
        const validation = errorHandler.validateInstallation();

        // Assert
        expect(validation.valid).toBe(true);
        expect(validation.errors).toEqual([]);
        expect(validation.summary).toContain('all checks passed');
    });

    test('should detect multiple error types in single validation', () => {
        // Arrange - create installation with multiple issues
        mockFs.setDirectory('.ai');
        mockFs.setFile('.ai/SKILL.md', 'invalid yaml'); // Invalid YAML
        // Missing other required files and directories

        // Act
        const validation = errorHandler.validateInstallation();

        // Assert
        expect(validation.valid).toBe(false);
        expect(validation.errors.length).toBeGreaterThan(1);
        
        const errorTypes = validation.errors.map(e => e.type);
        expect(errorTypes).toContain('missing-files');
        expect(errorTypes).toContain('invalid-yaml');
    });

    test('should prioritize critical errors in summary', () => {
        fc.assert(fc.property(
            fc.integer({ min: 0, max: 3 }), // critical errors
            fc.integer({ min: 0, max: 3 }), // high errors  
            fc.integer({ min: 0, max: 3 }), // medium errors
            (criticalCount, highCount, mediumCount) => {
                // Arrange - create errors with different severities
                const errors = [];
                
                for (let i = 0; i < criticalCount; i++) {
                    errors.push({ severity: 'critical', type: 'missing-files' });
                }
                for (let i = 0; i < highCount; i++) {
                    errors.push({ severity: 'high', type: 'invalid-yaml' });
                }
                for (let i = 0; i < mediumCount; i++) {
                    errors.push({ severity: 'medium', type: 'corrupted-memory' });
                }

                // Act
                const summary = errorHandler.generateValidationSummary(errors, []);

                // Assert - should prioritize by severity
                if (criticalCount > 0) {
                    expect(summary).toContain('❌');
                    expect(summary).toContain('critical');
                } else if (highCount > 0) {
                    expect(summary).toContain('⚠️');
                    expect(summary).toContain('high-priority');
                } else if (mediumCount > 0) {
                    expect(summary).toContain('⚠️');
                    expect(summary).toContain('medium-priority');
                } else {
                    expect(summary).toContain('✅');
                    expect(summary).toContain('all checks passed');
                }
            }
        ), { numRuns: 50 });
    });
});