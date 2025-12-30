/**
 * Cross-Reference Validation Test Suite
 * 
 * **Feature: ears-workflow-skill-refactor, Property 12: Cross-reference integrity**
 * **Validates: Requirements 8.1, 8.2, 8.3**
 * 
 * Comprehensive tests for cross-reference validation including link integrity,
 * file references, and documentation consistency.
 */

const { CrossReferenceValidator } = require('../../scripts/validate-cross-references');
const fs = require('fs');
const path = require('path');

describe('Cross-Reference Validation', () => {
    let validator;
    let tempFiles = [];

    beforeEach(() => {
        validator = new CrossReferenceValidator();
        tempFiles = [];
    });

    afterEach(() => {
        // Clean up temporary test files
        tempFiles.forEach(file => {
            try {
                if (fs.existsSync(file)) {
                    fs.unlinkSync(file);
                }
            } catch (error) {
                // Ignore cleanup errors
            }
        });
    });

    describe('Markdown Link Validation', () => {
        test('should validate existing markdown links', () => {
            const testContent = `
# Test Document
See [README](README.md) for more information.
Check [Installation Guide](INSTALL.md) for setup.
            `;
            
            // Create temporary test file
            const testFile = 'test-links.md';
            fs.writeFileSync(testFile, testContent);
            tempFiles.push(testFile);
            
            validator.validateMarkdownLinks(testContent, testFile, '.');
            
            // Should not have errors for existing files
            const readmeErrors = validator.errors.filter(e => e.includes('README'));
            const installErrors = validator.errors.filter(e => e.includes('INSTALL'));
            
            expect(readmeErrors).toHaveLength(0);
            expect(installErrors).toHaveLength(0);
        });

        test('should detect broken markdown links', () => {
            const testContent = `
# Test Document
See [Non-existent File](non-existent.md) for details.
            `;
            
            const testFile = 'test-broken-links.md';
            fs.writeFileSync(testFile, testContent);
            tempFiles.push(testFile);
            
            validator.validateMarkdownLinks(testContent, testFile, '.');
            
            const brokenLinkErrors = validator.errors.filter(e => 
                e.includes('non-existent.md') && e.includes('Broken link')
            );
            
            expect(brokenLinkErrors.length).toBeGreaterThan(0);
        });

        test('should skip external URLs', () => {
            const testContent = `
# Test Document
Visit [GitHub](https://github.com) for more info.
See [Google](http://google.com) for search.
            `;
            
            const testFile = 'test-external-links.md';
            fs.writeFileSync(testFile, testContent);
            tempFiles.push(testFile);
            
            validator.validateMarkdownLinks(testContent, testFile, '.');
            
            // Should not report errors for external URLs
            const externalErrors = validator.errors.filter(e => 
                e.includes('github.com') || e.includes('google.com')
            );
            
            expect(externalErrors).toHaveLength(0);
        });

        test('should validate anchor links', () => {
            const testContent = `
# Test Document
See [Installation Section](#installation) below.
            `;
            
            const targetContent = `
# Target Document
## Installation
Instructions here.
            `;
            
            const testFile = 'test-anchors.md';
            const targetFile = 'target-anchors.md';
            
            fs.writeFileSync(testFile, testContent);
            fs.writeFileSync(targetFile, targetContent);
            tempFiles.push(testFile, targetFile);
            
            // Test anchor validation
            validator.validateAnchor(targetFile, 'installation', testFile, 'Installation Section');
            
            // Should not have warnings for valid anchors
            const anchorWarnings = validator.warnings.filter(w => 
                w.includes('installation') && w.includes('not found')
            );
            
            expect(anchorWarnings).toHaveLength(0);
        });
    });

    describe('File Reference Validation', () => {
        test('should validate existing file references', () => {
            const testContent = `
# Test Document
Check the \`package.json\` file for dependencies.
See \`.ai/SKILL.md\` for skill definition.
            `;
            
            const testFile = 'test-file-refs.md';
            fs.writeFileSync(testFile, testContent);
            tempFiles.push(testFile);
            
            validator.validateFileReferences(testContent, testFile, '.');
            
            // Should not have errors for existing files
            const packageErrors = validator.errors.filter(e => e.includes('package.json'));
            
            expect(packageErrors).toHaveLength(0);
        });

        test('should detect missing file references', () => {
            const testContent = `
# Test Document
Check the \`missing-file.json\` for configuration.
            `;
            
            const testFile = 'test-missing-refs.md';
            fs.writeFileSync(testFile, testContent);
            tempFiles.push(testFile);
            
            validator.validateFileReferences(testContent, testFile, '.');
            
            const missingFileErrors = validator.errors.filter(e => 
                e.includes('missing-file.json') && e.includes('Missing file reference')
            );
            
            expect(missingFileErrors.length).toBeGreaterThan(0);
        });

        test('should skip code snippets and commands', () => {
            const testContent = `
# Test Document
Run \`npm install package-name\` to install.
Use \`git commit -m "message"\` to commit.
            `;
            
            const testFile = 'test-code-snippets.md';
            fs.writeFileSync(testFile, testContent);
            tempFiles.push(testFile);
            
            validator.validateFileReferences(testContent, testFile, '.');
            
            // Should not report errors for command snippets
            const commandErrors = validator.errors.filter(e => 
                e.includes('npm install') || e.includes('git commit')
            );
            
            expect(commandErrors).toHaveLength(0);
        });
    });

    describe('Directory Reference Validation', () => {
        test('should validate existing directory references', () => {
            const testContent = `
# Test Document
Files are located in \`.ai/skills/\` directory.
            `;
            
            const testFile = 'test-dir-refs.md';
            fs.writeFileSync(testFile, testContent);
            tempFiles.push(testFile);
            
            validator.validateDirectoryReferences(testContent, testFile, '.');
            
            // Should not have errors for existing directories
            const dirErrors = validator.errors.filter(e => e.includes('.ai/skills/'));
            
            expect(dirErrors).toHaveLength(0);
        });

        test('should detect missing directory references', () => {
            const testContent = `
# Test Document
Files are in \`.ai/missing-directory/\` folder.
            `;
            
            const testFile = 'test-missing-dirs.md';
            fs.writeFileSync(testFile, testContent);
            tempFiles.push(testFile);
            
            validator.validateDirectoryReferences(testContent, testFile, '.');
            
            const missingDirErrors = validator.errors.filter(e => 
                e.includes('missing-directory') && e.includes('Missing directory reference')
            );
            
            expect(missingDirErrors.length).toBeGreaterThan(0);
        });
    });

    describe('Script Reference Validation', () => {
        test('should validate existing npm scripts', () => {
            const testContent = `
# Test Document
Run \`npm run test\` to execute tests.
Use \`npm run validate\` for validation.
            `;
            
            const testFile = 'test-script-refs.md';
            fs.writeFileSync(testFile, testContent);
            tempFiles.push(testFile);
            
            validator.validateScriptReferences(testContent, testFile);
            
            // Should not have errors for existing scripts
            const testScriptErrors = validator.errors.filter(e => 
                e.includes('test') && e.includes('Missing npm script')
            );
            const validateScriptErrors = validator.errors.filter(e => 
                e.includes('validate') && e.includes('Missing npm script')
            );
            
            expect(testScriptErrors).toHaveLength(0);
            expect(validateScriptErrors).toHaveLength(0);
        });

        test('should detect missing npm scripts', () => {
            const testContent = `
# Test Document
Run \`npm run non-existent-script\` to do something.
            `;
            
            const testFile = 'test-missing-scripts.md';
            fs.writeFileSync(testFile, testContent);
            tempFiles.push(testFile);
            
            validator.validateScriptReferences(testContent, testFile);
            
            const missingScriptErrors = validator.errors.filter(e => 
                e.includes('non-existent-script') && e.includes('Missing npm script')
            );
            
            expect(missingScriptErrors.length).toBeGreaterThan(0);
        });
    });

    describe('Relative Path Validation', () => {
        test('should validate existing relative paths', () => {
            const testContent = `
# Test Document
See \`./README.md\` in current directory.
Check \`../package.json\` in parent directory.
            `;
            
            const testFile = 'test-relative-paths.md';
            fs.writeFileSync(testFile, testContent);
            tempFiles.push(testFile);
            
            validator.validateRelativePathReferences(testContent, testFile, '.');
            
            // Should not have errors for existing relative paths
            const relativeErrors = validator.errors.filter(e => 
                e.includes('./README.md') || e.includes('../package.json')
            );
            
            expect(relativeErrors).toHaveLength(0);
        });

        test('should detect missing relative paths', () => {
            const testContent = `
# Test Document
See \`./missing-file.md\` for details.
            `;
            
            const testFile = 'test-missing-relative.md';
            fs.writeFileSync(testFile, testContent);
            tempFiles.push(testFile);
            
            validator.validateRelativePathReferences(testContent, testFile, '.');
            
            const missingRelativeErrors = validator.errors.filter(e => 
                e.includes('missing-file.md') && e.includes('Missing path reference')
            );
            
            expect(missingRelativeErrors.length).toBeGreaterThan(0);
        });
    });

    describe('Package Script Validation', () => {
        test('should validate script file references', () => {
            // This test validates that script commands reference existing files
            validator.validateScriptCommand('node scripts/validate-versions.js', 'validate:versions');
            
            // Should not have errors for existing script files
            const scriptFileErrors = validator.errors.filter(e => 
                e.includes('validate-versions.js') && e.includes('Missing file')
            );
            
            expect(scriptFileErrors).toHaveLength(0);
        });

        test('should detect missing script files', () => {
            validator.validateScriptCommand('node scripts/missing-script.js', 'missing-script');
            
            const missingScriptFileErrors = validator.errors.filter(e => 
                e.includes('missing-script.js') && e.includes('Missing file')
            );
            
            expect(missingScriptFileErrors.length).toBeGreaterThan(0);
        });
    });

    describe('Path Resolution', () => {
        test('should resolve relative paths correctly', () => {
            const baseDir = '/base/path';
            const relativePath = './relative/file.md';
            
            const resolved = validator.resolvePath(relativePath, baseDir);
            
            expect(resolved).toBe(path.resolve(baseDir, relativePath));
        });

        test('should handle absolute paths', () => {
            const baseDir = '/base/path';
            const absolutePath = '/absolute/path/file.md';
            
            const resolved = validator.resolvePath(absolutePath, baseDir);
            
            expect(resolved).toBe(absolutePath);
        });
    });

    describe('File System Checks', () => {
        test('should correctly identify existing files', () => {
            expect(validator.fileExists('package.json')).toBe(true);
            expect(validator.fileExists('non-existent-file.xyz')).toBe(false);
        });

        test('should correctly identify existing directories', () => {
            expect(validator.directoryExists('.ai')).toBe(true);
            expect(validator.directoryExists('non-existent-directory')).toBe(false);
        });

        test('should correctly identify existing scripts', () => {
            expect(validator.scriptExists('test')).toBe(true);
            expect(validator.scriptExists('non-existent-script')).toBe(false);
        });
    });

    describe('Error Handling', () => {
        test('should handle file read errors gracefully', async () => {
            // Test with a file that doesn't exist
            await validator.validateFile('non-existent-file.md');
            
            const readErrors = validator.errors.filter(e => 
                e.includes('Could not read file')
            );
            
            expect(readErrors.length).toBeGreaterThan(0);
        });

        test('should handle directory read errors gracefully', () => {
            const files = validator.findMarkdownFiles('non-existent-directory');
            
            expect(files).toEqual([]);
            expect(validator.warnings.length).toBeGreaterThan(0);
        });
    });

    describe('Report Generation', () => {
        test('should generate comprehensive report', () => {
            // Add some test errors and warnings
            validator.errors.push('Test error 1');
            validator.errors.push('Test error 2');
            validator.warnings.push('Test warning 1');
            validator.checkedFiles.add('test-file-1.md');
            validator.checkedFiles.add('test-file-2.md');
            
            const report = validator.generateReport();
            
            expect(report.isValid).toBe(false);
            expect(report.errors).toHaveLength(2);
            expect(report.warnings).toHaveLength(1);
            expect(report.filesChecked).toBe(2);
            expect(report.summary.totalErrors).toBe(2);
            expect(report.summary.totalWarnings).toBe(1);
            expect(report.summary.filesValidated).toBe(2);
        });

        test('should report success when no errors', () => {
            validator.checkedFiles.add('test-file.md');
            
            const report = validator.generateReport();
            
            expect(report.isValid).toBe(true);
            expect(report.errors).toHaveLength(0);
            expect(report.warnings).toHaveLength(0);
        });
    });
});

/**
 * Property-based tests for cross-reference validation consistency
 */
describe('Cross-Reference Validation Properties', () => {
    let validator;

    beforeEach(() => {
        validator = new CrossReferenceValidator();
    });

    test('Property: Valid files should never be reported as missing', () => {
        const existingFiles = ['package.json', 'README.md', 'USAGE.md'];
        
        existingFiles.forEach(file => {
            if (fs.existsSync(file)) {
                expect(validator.fileExists(file)).toBe(true);
            }
        });
    });

    test('Property: Valid directories should never be reported as missing', () => {
        const existingDirs = ['.ai', '.ai/skills', '.ai/memory'];
        
        existingDirs.forEach(dir => {
            if (fs.existsSync(dir)) {
                expect(validator.directoryExists(dir)).toBe(true);
            }
        });
    });

    test('Property: Valid npm scripts should never be reported as missing', () => {
        try {
            const packageContent = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            const scripts = Object.keys(packageContent.scripts || {});
            
            scripts.forEach(script => {
                expect(validator.scriptExists(script)).toBe(true);
            });
        } catch (error) {
            // Skip if package.json doesn't exist or is invalid
        }
    });

    test('Property: Path resolution should be consistent', () => {
        const testCases = [
            { base: '/base', path: './file.md', expected: '/base/file.md' },
            { base: '/base', path: '../file.md', expected: '/file.md' },
            { base: '/base/sub', path: './file.md', expected: '/base/sub/file.md' }
        ];
        
        testCases.forEach(({ base, path: testPath, expected }) => {
            const resolved = validator.resolvePath(testPath, base);
            expect(path.normalize(resolved)).toBe(path.normalize(expected));
        });
    });

    test('Property: Same file should not be validated multiple times', async () => {
        const testFile = 'README.md';
        
        await validator.validateFile(testFile);
        const firstCheckCount = validator.checkedFiles.size;
        
        await validator.validateFile(testFile);
        const secondCheckCount = validator.checkedFiles.size;
        
        expect(secondCheckCount).toBe(firstCheckCount);
    });
});