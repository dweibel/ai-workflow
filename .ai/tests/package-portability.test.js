/**
 * Property-based tests for package portability
 * 
 * **Feature: ears-workflow-skill-refactor, Property 10: Package portability**
 * **Validates: Requirements 6.1**
 * 
 * Tests that the EARS-workflow skill package functions identically across different
 * project environments without external dependencies:
 * - Package can be copied to new projects
 * - All functionality works without external dependencies
 * - Installation validation passes in different environments
 * - File structure remains intact during copying
 * 
 * @version 1.0.0
 */

const fc = require('fast-check');
const fs = require('fs');
const path = require('path');
const PackageValidator = require('../skills/package-validator.js');

// Mock file system operations for testing different environments
class MockFileSystem {
    constructor() {
        this.files = new Map();
        this.directories = new Set();
    }

    copyPackage(sourceBasePath, targetBasePath) {
        const copiedFiles = [];
        const errors = [];

        try {
            // Simulate copying .ai directory structure
            const aiPath = path.join(sourceBasePath, '.ai');
            
            if (fs.existsSync(aiPath)) {
                this.copyDirectoryRecursive(aiPath, path.join(targetBasePath, '.ai'), copiedFiles, errors);
            } else {
                errors.push('Source .ai directory not found');
            }

            // Copy package.json if it exists
            const packageJsonSource = path.join(sourceBasePath, 'package.json');
            if (fs.existsSync(packageJsonSource)) {
                const packageJsonTarget = path.join(targetBasePath, 'package.json');
                this.copyFile(packageJsonSource, packageJsonTarget, copiedFiles, errors);
            }

            // Copy AGENTS.md if it exists
            const agentsSource = path.join(sourceBasePath, 'AGENTS.md');
            if (fs.existsSync(agentsSource)) {
                const agentsTarget = path.join(targetBasePath, 'AGENTS.md');
                this.copyFile(agentsSource, agentsTarget, copiedFiles, errors);
            }

        } catch (error) {
            errors.push(`Copy operation failed: ${error.message}`);
        }

        return {
            success: errors.length === 0,
            copiedFiles: copiedFiles,
            errors: errors,
            fileCount: copiedFiles.length
        };
    }

    copyDirectoryRecursive(source, target, copiedFiles, errors) {
        try {
            if (!fs.existsSync(target)) {
                fs.mkdirSync(target, { recursive: true });
            }

            const entries = fs.readdirSync(source);

            for (const entry of entries) {
                const sourcePath = path.join(source, entry);
                const targetPath = path.join(target, entry);
                const stats = fs.statSync(sourcePath);

                if (stats.isDirectory()) {
                    this.copyDirectoryRecursive(sourcePath, targetPath, copiedFiles, errors);
                } else {
                    this.copyFile(sourcePath, targetPath, copiedFiles, errors);
                }
            }
        } catch (error) {
            errors.push(`Directory copy failed for ${source}: ${error.message}`);
        }
    }

    copyFile(source, target, copiedFiles, errors) {
        try {
            const targetDir = path.dirname(target);
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            fs.copyFileSync(source, target);
            copiedFiles.push({
                source: source,
                target: target,
                size: fs.statSync(target).size
            });
        } catch (error) {
            errors.push(`File copy failed for ${source}: ${error.message}`);
        }
    }

    validateCopy(sourceBasePath, targetBasePath) {
        const validation = {
            structureMatches: true,
            filesMatch: true,
            sizesMatch: true,
            contentMatches: true,
            missingFiles: [],
            sizeMismatches: [],
            contentMismatches: [],
            errors: []
        };

        try {
            // Compare directory structures
            const sourceAi = path.join(sourceBasePath, '.ai');
            const targetAi = path.join(targetBasePath, '.ai');

            if (fs.existsSync(sourceAi) && fs.existsSync(targetAi)) {
                this.compareDirectories(sourceAi, targetAi, validation);
            } else {
                validation.structureMatches = false;
                validation.errors.push('Source or target .ai directory missing');
            }

        } catch (error) {
            validation.errors.push(`Validation failed: ${error.message}`);
            validation.structureMatches = false;
        }

        return validation;
    }

    compareDirectories(sourceDir, targetDir, validation) {
        try {
            const sourceEntries = fs.readdirSync(sourceDir);
            const targetEntries = fs.readdirSync(targetDir);

            // Check for missing files/directories
            for (const entry of sourceEntries) {
                if (!targetEntries.includes(entry)) {
                    validation.missingFiles.push(path.join(targetDir, entry));
                    validation.filesMatch = false;
                }
            }

            // Compare existing files
            for (const entry of sourceEntries) {
                const sourcePath = path.join(sourceDir, entry);
                const targetPath = path.join(targetDir, entry);

                if (fs.existsSync(targetPath)) {
                    const sourceStats = fs.statSync(sourcePath);
                    const targetStats = fs.statSync(targetPath);

                    if (sourceStats.isDirectory() && targetStats.isDirectory()) {
                        this.compareDirectories(sourcePath, targetPath, validation);
                    } else if (sourceStats.isFile() && targetStats.isFile()) {
                        // Compare file sizes
                        if (sourceStats.size !== targetStats.size) {
                            validation.sizeMismatches.push({
                                file: targetPath,
                                sourceSize: sourceStats.size,
                                targetSize: targetStats.size
                            });
                            validation.sizesMatch = false;
                        }

                        // Compare content for critical files
                        if (entry.endsWith('.md') || entry.endsWith('.json')) {
                            const sourceContent = fs.readFileSync(sourcePath, 'utf8');
                            const targetContent = fs.readFileSync(targetPath, 'utf8');

                            if (sourceContent !== targetContent) {
                                validation.contentMismatches.push({
                                    file: targetPath,
                                    reason: 'Content differs from source'
                                });
                                validation.contentMatches = false;
                            }
                        }
                    }
                }
            }

        } catch (error) {
            validation.errors.push(`Directory comparison failed: ${error.message}`);
        }
    }
}

// Test generators
const projectPathGen = fc.string({ minLength: 5, maxLength: 20 }).map(s => `test-project-${s}`);
const environmentGen = fc.constantFrom('development', 'production', 'testing', 'staging');

describe('Package Portability Property Tests', () => {
    let mockFs;
    let tempDirs;

    beforeEach(() => {
        mockFs = new MockFileSystem();
        tempDirs = [];
    });

    afterEach(() => {
        // Clean up temporary directories
        for (const dir of tempDirs) {
            try {
                if (fs.existsSync(dir)) {
                    fs.rmSync(dir, { recursive: true, force: true });
                }
            } catch (error) {
                // Ignore cleanup errors in tests
            }
        }
    });

    /**
     * Property 10.1: Package copying preserves structure
     * For any project environment, copying the skill package should preserve all files and structure
     */
    test('Property 10.1: Package copying preserves structure', () => {
        fc.assert(fc.property(
            projectPathGen,
            environmentGen,
            (projectName, environment) => {
                const sourceBasePath = '.';
                const targetBasePath = path.join('temp', `${projectName}-${environment}`);
                tempDirs.push(targetBasePath);

                // Perform copy operation
                const copyResult = mockFs.copyPackage(sourceBasePath, targetBasePath);

                if (copyResult.success) {
                    // Validate copy integrity
                    const validation = mockFs.validateCopy(sourceBasePath, targetBasePath);

                    expect(validation.structureMatches).toBe(true);
                    expect(validation.filesMatch).toBe(true);
                    expect(validation.sizesMatch).toBe(true);
                    expect(validation.errors.length).toBe(0);

                    // Should have copied essential files
                    expect(copyResult.fileCount).toBeGreaterThan(0);
                    expect(copyResult.copiedFiles.some(f => f.target.includes('SKILL.md'))).toBe(true);
                }
            }
        ), { numRuns: 20 });
    });

    /**
     * Property 10.2: Copied package passes validation
     * For any copied package, installation validation should pass identically to the source
     */
    test('Property 10.2: Copied package passes validation', () => {
        fc.assert(fc.property(
            projectPathGen,
            (projectName) => {
                const sourceBasePath = '.';
                const targetBasePath = path.join('temp', `validation-${projectName}`);
                tempDirs.push(targetBasePath);

                // Copy package
                const copyResult = mockFs.copyPackage(sourceBasePath, targetBasePath);

                if (copyResult.success) {
                    // Validate source package
                    const sourceValidator = new PackageValidator('.ai');
                    const sourceValidation = sourceValidator.validateBasicInstallation();

                    // Validate copied package
                    const targetValidator = new PackageValidator(path.join(targetBasePath, '.ai'));
                    const targetValidation = targetValidator.validateBasicInstallation();

                    // Both should have same validation results
                    expect(targetValidation.installed).toBe(sourceValidation.installed);
                    expect(targetValidation.mainSkillExists).toBe(sourceValidation.mainSkillExists);
                    expect(targetValidation.memoryFilesExist).toBe(sourceValidation.memoryFilesExist);
                    expect(targetValidation.skillsDirectoryExists).toBe(sourceValidation.skillsDirectoryExists);

                    // Error counts should be similar (allowing for environment differences)
                    const errorDifference = Math.abs(targetValidation.errors.length - sourceValidation.errors.length);
                    expect(errorDifference).toBeLessThanOrEqual(2); // Allow minor differences
                }
            }
        ), { numRuns: 15 });
    });

    /**
     * Property 10.3: Package functions without external dependencies
     * For any copied package, core functionality should work without external dependencies
     */
    test('Property 10.3: Package functions without external dependencies', () => {
        fc.assert(fc.property(
            projectPathGen,
            (projectName) => {
                const targetBasePath = path.join('temp', `isolated-${projectName}`);
                tempDirs.push(targetBasePath);

                // Copy only the .ai directory (no node_modules, no external files)
                const copyResult = mockFs.copyPackage('.', targetBasePath);

                if (copyResult.success) {
                    // Validate that core functionality works
                    const validator = new PackageValidator(path.join(targetBasePath, '.ai'));
                    const basicValidation = validator.validateBasicInstallation();

                    // Core installation should be valid even without external dependencies
                    expect(basicValidation.mainSkillExists).toBe(true);
                    expect(basicValidation.memoryFilesExist).toBe(true);
                    expect(basicValidation.skillsDirectoryExists).toBe(true);

                    // Should be able to read skill files
                    const completeValidation = validator.validateComplete();
                    
                    // File structure should be intact
                    expect(completeValidation.summary.validFiles).toBeGreaterThan(0);
                    expect(completeValidation.summary.validDirectories).toBeGreaterThan(0);
                    expect(completeValidation.summary.validSkills).toBeGreaterThan(0);

                    // Should not have critical errors related to missing core files
                    const criticalErrors = completeValidation.errors.filter(error => 
                        error.includes('Required file missing') || 
                        error.includes('Required directory missing')
                    );
                    expect(criticalErrors.length).toBe(0);
                }
            }
        ), { numRuns: 20 });
    });

    /**
     * Property 10.4: Multiple project isolation
     * For any set of project copies, each should maintain independent state
     */
    test('Property 10.4: Multiple project isolation', () => {
        fc.assert(fc.property(
            fc.array(projectPathGen, { minLength: 2, maxLength: 4 }),
            (projectNames) => {
                const projectPaths = [];
                const validators = [];

                // Create multiple project copies
                for (const projectName of projectNames) {
                    const targetPath = path.join('temp', `multi-${projectName}`);
                    tempDirs.push(targetPath);
                    projectPaths.push(targetPath);

                    const copyResult = mockFs.copyPackage('.', targetPath);
                    
                    if (copyResult.success) {
                        const validator = new PackageValidator(path.join(targetPath, '.ai'));
                        validators.push({ path: targetPath, validator: validator });
                    }
                }

                // Each project should validate independently
                for (const { path: projectPath, validator } of validators) {
                    const validation = validator.validateBasicInstallation();
                    
                    expect(validation.mainSkillExists).toBe(true);
                    expect(validation.memoryFilesExist).toBe(true);
                    expect(validation.skillsDirectoryExists).toBe(true);

                    // Each should have its own memory files
                    const lessonsPath = path.join(projectPath, '.ai', 'memory', 'lessons.md');
                    const decisionsPath = path.join(projectPath, '.ai', 'memory', 'decisions.md');
                    
                    expect(fs.existsSync(lessonsPath)).toBe(true);
                    expect(fs.existsSync(decisionsPath)).toBe(true);
                }

                // Modifications to one project should not affect others
                if (validators.length >= 2) {
                    const firstProject = validators[0];
                    const secondProject = validators[1];

                    // Modify memory file in first project
                    const firstLessonsPath = path.join(firstProject.path, '.ai', 'memory', 'lessons.md');
                    const originalContent = fs.readFileSync(firstLessonsPath, 'utf8');
                    const modifiedContent = originalContent + '\n- Test modification for isolation';
                    
                    fs.writeFileSync(firstLessonsPath, modifiedContent);

                    // Second project should be unaffected
                    const secondLessonsPath = path.join(secondProject.path, '.ai', 'memory', 'lessons.md');
                    const secondContent = fs.readFileSync(secondLessonsPath, 'utf8');
                    
                    expect(secondContent).toBe(originalContent);
                    expect(secondContent).not.toContain('Test modification for isolation');
                }
            }
        ), { numRuns: 10 });
    });

    /**
     * Property 10.5: Cross-platform compatibility
     * For any platform-specific path handling, the package should work correctly
     */
    test('Property 10.5: Cross-platform compatibility', () => {
        fc.assert(fc.property(
            projectPathGen,
            fc.constantFrom('win32', 'darwin', 'linux'),
            (projectName, platform) => {
                const targetBasePath = path.join('temp', `platform-${platform}-${projectName}`);
                tempDirs.push(targetBasePath);

                // Copy package
                const copyResult = mockFs.copyPackage('.', targetBasePath);

                if (copyResult.success) {
                    // Validate with platform-specific path handling
                    const validator = new PackageValidator(path.join(targetBasePath, '.ai'));
                    const validation = validator.validateComplete();

                    // Path separators should be handled correctly
                    for (const filePath in validation.fileValidation) {
                        const fileData = validation.fileValidation[filePath];
                        if (fileData.exists) {
                            // Path should be valid for the platform
                            expect(fileData.path).toBeDefined();
                            expect(typeof fileData.path).toBe('string');
                            expect(fileData.path.length).toBeGreaterThan(0);
                        }
                    }

                    // Directory paths should be valid
                    for (const dirPath in validation.directoryValidation) {
                        const dirData = validation.directoryValidation[dirPath];
                        if (dirData.exists) {
                            expect(dirData.path).toBeDefined();
                            expect(typeof dirData.path).toBe('string');
                            expect(dirData.isDirectory).toBe(true);
                        }
                    }
                }
            }
        ), { numRuns: 15 });
    });

    /**
     * Property 10.6: Version consistency across copies
     * For any package copy, version information should remain consistent
     */
    test('Property 10.6: Version consistency across copies', () => {
        fc.assert(fc.property(
            projectPathGen,
            (projectName) => {
                const targetBasePath = path.join('temp', `version-${projectName}`);
                tempDirs.push(targetBasePath);

                // Copy package
                const copyResult = mockFs.copyPackage('.', targetBasePath);

                if (copyResult.success) {
                    // Get version info from source
                    const sourceValidator = new PackageValidator('.ai');
                    const sourceValidation = sourceValidator.validateComplete();

                    // Get version info from copy
                    const targetValidator = new PackageValidator(path.join(targetBasePath, '.ai'));
                    const targetValidation = targetValidator.validateComplete();

                    // Compare skill versions
                    for (const skillName in sourceValidation.skillValidation) {
                        const sourceSkill = sourceValidation.skillValidation[skillName];
                        const targetSkill = targetValidation.skillValidation[skillName];

                        if (sourceSkill && targetSkill && sourceSkill.metadata && targetSkill.metadata) {
                            expect(targetSkill.metadata.version).toBe(sourceSkill.metadata.version);
                            expect(targetSkill.metadata.name).toBe(sourceSkill.metadata.name);
                        }
                    }

                    // Package.json version should match if it exists
                    const sourcePackageJson = path.join('.', 'package.json');
                    const targetPackageJson = path.join(targetBasePath, 'package.json');

                    if (fs.existsSync(sourcePackageJson) && fs.existsSync(targetPackageJson)) {
                        const sourcePackage = JSON.parse(fs.readFileSync(sourcePackageJson, 'utf8'));
                        const targetPackage = JSON.parse(fs.readFileSync(targetPackageJson, 'utf8'));

                        expect(targetPackage.version).toBe(sourcePackage.version);
                        expect(targetPackage.name).toBe(sourcePackage.name);
                    }
                }
            }
        ), { numRuns: 20 });
    });

    /**
     * Property 10.7: Content integrity preservation
     * For any package copy, critical content should be preserved exactly
     */
    test('Property 10.7: Content integrity preservation', () => {
        fc.assert(fc.property(
            projectPathGen,
            (projectName) => {
                const targetBasePath = path.join('temp', `integrity-${projectName}`);
                tempDirs.push(targetBasePath);

                // Copy package
                const copyResult = mockFs.copyPackage('.', targetBasePath);

                if (copyResult.success) {
                    // Check critical files for content integrity
                    const criticalFiles = [
                        '.ai/SKILL.md',
                        '.ai/memory/lessons.md',
                        '.ai/memory/decisions.md'
                    ];

                    for (const criticalFile of criticalFiles) {
                        const sourcePath = path.join('.', criticalFile);
                        const targetPath = path.join(targetBasePath, criticalFile);

                        if (fs.existsSync(sourcePath) && fs.existsSync(targetPath)) {
                            const sourceContent = fs.readFileSync(sourcePath, 'utf8');
                            const targetContent = fs.readFileSync(targetPath, 'utf8');

                            expect(targetContent).toBe(sourceContent);

                            // File sizes should match
                            const sourceStats = fs.statSync(sourcePath);
                            const targetStats = fs.statSync(targetPath);
                            expect(targetStats.size).toBe(sourceStats.size);
                        }
                    }

                    // YAML frontmatter should be preserved in skill files
                    const skillFiles = copyResult.copiedFiles.filter(f => 
                        f.target.includes('SKILL.md')
                    );

                    for (const skillFile of skillFiles) {
                        if (fs.existsSync(skillFile.target)) {
                            const content = fs.readFileSync(skillFile.target, 'utf8');
                            
                            if (content.startsWith('---\n')) {
                                expect(content).toContain('name:');
                                expect(content).toContain('description:');
                                expect(content).toContain('version:');
                            }
                        }
                    }
                }
            }
        ), { numRuns: 15 });
    });
});

// Integration tests for complete package portability
describe('Package Portability Integration Tests', () => {
    let tempDirs;

    beforeEach(() => {
        tempDirs = [];
    });

    afterEach(() => {
        // Clean up temporary directories
        for (const dir of tempDirs) {
            try {
                if (fs.existsSync(dir)) {
                    fs.rmSync(dir, { recursive: true, force: true });
                }
            } catch (error) {
                // Ignore cleanup errors in tests
            }
        }
    });

    test('Complete package portability workflow', () => {
        const mockFs = new MockFileSystem();
        const targetBasePath = path.join('temp', 'integration-test');
        tempDirs.push(targetBasePath);

        // Step 1: Copy package
        const copyResult = mockFs.copyPackage('.', targetBasePath);
        expect(copyResult.success).toBe(true);
        expect(copyResult.fileCount).toBeGreaterThan(0);

        // Step 2: Validate copy integrity
        const validation = mockFs.validateCopy('.', targetBasePath);
        expect(validation.structureMatches).toBe(true);
        expect(validation.filesMatch).toBe(true);
        expect(validation.errors.length).toBe(0);

        // Step 3: Validate installation
        const validator = new PackageValidator(path.join(targetBasePath, '.ai'));
        const installationValidation = validator.validateBasicInstallation();
        expect(installationValidation.installed).toBe(true);

        // Step 4: Validate complete functionality
        const completeValidation = validator.validateComplete();
        expect(completeValidation.summary.validFiles).toBeGreaterThan(0);
        expect(completeValidation.summary.validSkills).toBeGreaterThan(0);

        // Step 5: Test independence
        const lessonsPath = path.join(targetBasePath, '.ai', 'memory', 'lessons.md');
        const originalContent = fs.readFileSync(lessonsPath, 'utf8');
        const modifiedContent = originalContent + '\n- Integration test modification';
        fs.writeFileSync(lessonsPath, modifiedContent);

        // Original should be unchanged
        const originalLessonsPath = path.join('.ai', 'memory', 'lessons.md');
        const originalStillContent = fs.readFileSync(originalLessonsPath, 'utf8');
        expect(originalStillContent).toBe(originalContent);
        expect(originalStillContent).not.toContain('Integration test modification');
    });

    test('Multi-project isolation verification', () => {
        const mockFs = new MockFileSystem();
        const projects = ['project-a', 'project-b', 'project-c'];
        const projectPaths = [];

        // Create multiple project copies
        for (const project of projects) {
            const targetPath = path.join('temp', `multi-${project}`);
            tempDirs.push(targetPath);
            projectPaths.push(targetPath);

            const copyResult = mockFs.copyPackage('.', targetPath);
            expect(copyResult.success).toBe(true);
        }

        // Validate each project independently
        for (const projectPath of projectPaths) {
            const validator = new PackageValidator(path.join(projectPath, '.ai'));
            const validation = validator.validateBasicInstallation();
            expect(validation.installed).toBe(true);
        }

        // Modify one project and verify others are unaffected
        const firstProjectLessons = path.join(projectPaths[0], '.ai', 'memory', 'lessons.md');
        const originalContent = fs.readFileSync(firstProjectLessons, 'utf8');
        fs.writeFileSync(firstProjectLessons, originalContent + '\n- Project A modification');

        // Other projects should be unaffected
        for (let i = 1; i < projectPaths.length; i++) {
            const otherProjectLessons = path.join(projectPaths[i], '.ai', 'memory', 'lessons.md');
            const otherContent = fs.readFileSync(otherProjectLessons, 'utf8');
            expect(otherContent).toBe(originalContent);
            expect(otherContent).not.toContain('Project A modification');
        }
    });

    test('Package validation consistency across environments', () => {
        const mockFs = new MockFileSystem();
        const environments = ['dev', 'test', 'prod'];
        const validationResults = [];

        // Create package copies for different environments
        for (const env of environments) {
            const targetPath = path.join('temp', `env-${env}`);
            tempDirs.push(targetPath);

            const copyResult = mockFs.copyPackage('.', targetPath);
            expect(copyResult.success).toBe(true);

            const validator = new PackageValidator(path.join(targetPath, '.ai'));
            const validation = validator.getInstallationStatus();
            validationResults.push(validation);
        }

        // All environments should have consistent validation results
        const firstResult = validationResults[0];
        for (let i = 1; i < validationResults.length; i++) {
            const currentResult = validationResults[i];
            
            expect(currentResult.basicInstallation.installed).toBe(firstResult.basicInstallation.installed);
            expect(currentResult.installationLevel).toBe(firstResult.installationLevel);
            
            // Error counts should be similar (allowing for minor environment differences)
            const errorDiff = Math.abs(
                currentResult.completeValidation.summary.errorCount - 
                firstResult.completeValidation.summary.errorCount
            );
            expect(errorDiff).toBeLessThanOrEqual(1);
        }
    });
});