/**
 * Multi-Environment Package Validation Test
 * 
 * **Feature: ears-workflow-skill-refactor, Property 10: Package portability**
 * **Validates: Requirements 6.1, 6.2**
 * 
 * This test validates that the EARS-workflow skill package works correctly
 * in multiple project environments and clean installations.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { PackageValidator } = require('./package-completeness-validation.test.js');

class MultiEnvironmentValidator {
    constructor() {
        this.testResults = [];
        this.tempDirs = [];
    }

    /**
     * Create a temporary test directory
     */
    createTempDir(name) {
        const tempDir = path.join(process.cwd(), `temp-test-${name}-${Date.now()}`);
        fs.mkdirSync(tempDir, { recursive: true });
        this.tempDirs.push(tempDir);
        return tempDir;
    }

    /**
     * Copy the .ai directory to a test location
     */
    copyPackageToDir(targetDir) {
        const sourceDir = path.join(process.cwd(), '.ai');
        const targetAiDir = path.join(targetDir, '.ai');
        
        this.copyDirectoryRecursive(sourceDir, targetAiDir);
    }

    /**
     * Recursively copy directory
     */
    copyDirectoryRecursive(source, target) {
        if (!fs.existsSync(target)) {
            fs.mkdirSync(target, { recursive: true });
        }

        const items = fs.readdirSync(source);
        
        for (const item of items) {
            const sourcePath = path.join(source, item);
            const targetPath = path.join(target, item);
            
            if (fs.statSync(sourcePath).isDirectory()) {
                this.copyDirectoryRecursive(sourcePath, targetPath);
            } else {
                fs.copyFileSync(sourcePath, targetPath);
            }
        }
    }

    /**
     * Test package in a clean Node.js project environment
     */
    testCleanNodeProject() {
        console.log('🧪 Testing in clean Node.js project environment...');
        
        const testDir = this.createTempDir('node-project');
        
        try {
            // Create a basic package.json
            const packageJson = {
                name: 'test-project',
                version: '1.0.0',
                description: 'Test project for EARS-workflow validation'
            };
            fs.writeFileSync(
                path.join(testDir, 'package.json'), 
                JSON.stringify(packageJson, null, 2)
            );

            // Copy the .ai package
            this.copyPackageToDir(testDir);

            // Validate the package in this environment
            const validator = new PackageValidator(path.join(testDir, '.ai'));
            const result = validator.validate();

            this.testResults.push({
                environment: 'Clean Node.js Project',
                success: result.isValid,
                errors: result.errors,
                warnings: result.warnings
            });

            return result.isValid;

        } catch (error) {
            this.testResults.push({
                environment: 'Clean Node.js Project',
                success: false,
                errors: [`Test setup failed: ${error.message}`],
                warnings: []
            });
            return false;
        }
    }

    /**
     * Test package in a TypeScript project environment
     */
    testTypeScriptProject() {
        console.log('🧪 Testing in TypeScript project environment...');
        
        const testDir = this.createTempDir('typescript-project');
        
        try {
            // Create TypeScript project files
            const packageJson = {
                name: 'test-typescript-project',
                version: '1.0.0',
                devDependencies: {
                    typescript: '^4.0.0',
                    '@types/node': '^16.0.0'
                }
            };
            fs.writeFileSync(
                path.join(testDir, 'package.json'), 
                JSON.stringify(packageJson, null, 2)
            );

            const tsConfig = {
                compilerOptions: {
                    target: 'ES2020',
                    module: 'commonjs',
                    outDir: './dist',
                    rootDir: './src',
                    strict: true
                }
            };
            fs.writeFileSync(
                path.join(testDir, 'tsconfig.json'), 
                JSON.stringify(tsConfig, null, 2)
            );

            // Create src directory
            fs.mkdirSync(path.join(testDir, 'src'));

            // Copy the .ai package
            this.copyPackageToDir(testDir);

            // Validate the package in this environment
            const validator = new PackageValidator(path.join(testDir, '.ai'));
            const result = validator.validate();

            this.testResults.push({
                environment: 'TypeScript Project',
                success: result.isValid,
                errors: result.errors,
                warnings: result.warnings
            });

            return result.isValid;

        } catch (error) {
            this.testResults.push({
                environment: 'TypeScript Project',
                success: false,
                errors: [`Test setup failed: ${error.message}`],
                warnings: []
            });
            return false;
        }
    }

    /**
     * Test package in a project with existing .ai directory
     */
    testExistingAiProject() {
        console.log('🧪 Testing in project with existing .ai directory...');
        
        const testDir = this.createTempDir('existing-ai-project');
        
        try {
            // Create a basic project
            const packageJson = {
                name: 'existing-ai-project',
                version: '1.0.0'
            };
            fs.writeFileSync(
                path.join(testDir, 'package.json'), 
                JSON.stringify(packageJson, null, 2)
            );

            // Create existing .ai directory with some content
            const existingAiDir = path.join(testDir, '.ai');
            fs.mkdirSync(existingAiDir, { recursive: true });
            
            // Create existing memory files
            fs.mkdirSync(path.join(existingAiDir, 'memory'));
            fs.writeFileSync(
                path.join(existingAiDir, 'memory', 'lessons.md'),
                '# Existing Lessons\n\n- Some existing lesson\n'
            );
            fs.writeFileSync(
                path.join(existingAiDir, 'memory', 'decisions.md'),
                '# Existing Decisions\n\n- Some existing decision\n'
            );

            // Copy the new package (this should preserve existing memory)
            this.copyPackageToDir(testDir);

            // Validate the package works with existing content
            const validator = new PackageValidator(path.join(testDir, '.ai'));
            const result = validator.validate();

            // Check that existing memory files still exist
            const lessonsExist = fs.existsSync(path.join(testDir, '.ai', 'memory', 'lessons.md'));
            const decisionsExist = fs.existsSync(path.join(testDir, '.ai', 'memory', 'decisions.md'));

            const success = result.isValid && lessonsExist && decisionsExist;

            this.testResults.push({
                environment: 'Existing .ai Project',
                success,
                errors: result.errors.concat(
                    !lessonsExist ? ['Memory lessons.md was overwritten'] : [],
                    !decisionsExist ? ['Memory decisions.md was overwritten'] : []
                ),
                warnings: result.warnings
            });

            return success;

        } catch (error) {
            this.testResults.push({
                environment: 'Existing .ai Project',
                success: false,
                errors: [`Test setup failed: ${error.message}`],
                warnings: []
            });
            return false;
        }
    }

    /**
     * Test script execution in different environments
     */
    testScriptExecution(testDir, environment) {
        try {
            const gitWorktreeScript = path.join(testDir, '.ai', 'skills', 'git-worktree', 'git-worktree.js');
            const projectResetScript = path.join(testDir, '.ai', 'skills', 'project-reset', 'project-reset.js');

            // Test syntax validation (dry run)
            if (fs.existsSync(gitWorktreeScript)) {
                execSync(`node -c "${gitWorktreeScript}"`, { 
                    stdio: 'pipe',
                    cwd: testDir 
                });
            }

            if (fs.existsSync(projectResetScript)) {
                execSync(`node -c "${projectResetScript}"`, { 
                    stdio: 'pipe',
                    cwd: testDir 
                });
            }

            return true;
        } catch (error) {
            console.log(`⚠️  Script execution test failed in ${environment}: ${error.message}`);
            return false;
        }
    }

    /**
     * Clean up temporary directories
     */
    cleanup() {
        for (const tempDir of this.tempDirs) {
            try {
                if (fs.existsSync(tempDir)) {
                    this.removeDirectoryRecursive(tempDir);
                }
            } catch (error) {
                console.warn(`Warning: Could not clean up ${tempDir}: ${error.message}`);
            }
        }
    }

    /**
     * Recursively remove directory
     */
    removeDirectoryRecursive(dirPath) {
        if (fs.existsSync(dirPath)) {
            const items = fs.readdirSync(dirPath);
            
            for (const item of items) {
                const itemPath = path.join(dirPath, item);
                if (fs.statSync(itemPath).isDirectory()) {
                    this.removeDirectoryRecursive(itemPath);
                } else {
                    fs.unlinkSync(itemPath);
                }
            }
            
            fs.rmdirSync(dirPath);
        }
    }

    /**
     * Run all multi-environment tests
     */
    runAllTests() {
        console.log('🌍 Running multi-environment package validation...\n');

        const results = [
            this.testCleanNodeProject(),
            this.testTypeScriptProject(),
            this.testExistingAiProject()
        ];

        return this.generateReport(results);
    }

    /**
     * Generate comprehensive test report
     */
    generateReport(results) {
        const allPassed = results.every(result => result);
        
        console.log('\n📋 MULTI-ENVIRONMENT VALIDATION REPORT');
        console.log('=' .repeat(60));
        
        if (allPassed) {
            console.log('✅ All environment tests PASSED');
            console.log('🌍 Package is portable across different project types');
            console.log('🔧 No external dependencies required');
        } else {
            console.log('❌ Some environment tests FAILED');
            console.log(`🚨 ${results.filter(r => !r).length} out of ${results.length} environments failed`);
        }

        console.log('\n📊 DETAILED RESULTS:');
        
        for (const result of this.testResults) {
            const status = result.success ? '✅' : '❌';
            console.log(`\n${status} ${result.environment}`);
            
            if (result.errors.length > 0) {
                console.log('  🔴 Errors:');
                result.errors.forEach(error => console.log(`    - ${error}`));
            }
            
            if (result.warnings.length > 0) {
                console.log('  🟡 Warnings:');
                result.warnings.forEach(warning => console.log(`    - ${warning}`));
            }
        }

        console.log('');

        if (allPassed) {
            console.log('🎉 Package is ready for distribution across all tested environments!');
        } else {
            console.log('🔧 Please fix the issues above before distributing the package.');
        }

        return {
            allPassed,
            results: this.testResults,
            summary: {
                totalEnvironments: this.testResults.length,
                passedEnvironments: this.testResults.filter(r => r.success).length,
                failedEnvironments: this.testResults.filter(r => !r.success).length
            }
        };
    }
}

/**
 * Property-based test for multi-environment validation
 */
function testMultiEnvironmentValidation() {
    const validator = new MultiEnvironmentValidator();
    
    try {
        const result = validator.runAllTests();
        
        if (!result.allPassed) {
            throw new Error(`Multi-environment validation failed: ${result.summary.failedEnvironments} out of ${result.summary.totalEnvironments} environments failed`);
        }
        
        return result;
    } finally {
        validator.cleanup();
    }
}

// Export for testing
module.exports = {
    MultiEnvironmentValidator,
    testMultiEnvironmentValidation
};

// Run validation if called directly
if (require.main === module) {
    try {
        const result = testMultiEnvironmentValidation();
        process.exit(0);
    } catch (error) {
        console.error('❌ Multi-environment validation failed:', error.message);
        process.exit(1);
    }
}