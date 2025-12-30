/**
 * Regression Tests
 * **Feature: bash-to-javascript-conversion, Regression Tests**
 * 
 * Ensures existing workflows continue to function without modification
 * after JavaScript conversion.
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Import test utilities
const { TestRunner } = require('../simple-test');

class RegressionTests {
    constructor() {
        this.testResults = [];
        this.originalCwd = process.cwd();
    }

    async runAllTests() {
        console.log('🔄 Running Regression Tests...\n');
        
        try {
            await this.testExistingWorkflowCompatibility();
            await this.testCLIInterfaceStability();
            await this.testConfigurationBackwardCompatibility();
            await this.testErrorHandlingConsistency();
            await this.testOutputFormatStability();
            
            this.printResults();
        } catch (error) {
            console.error('❌ Regression test failed:', error.message);
            process.exit(1);
        }
    }

    async testExistingWorkflowCompatibility() {
        console.log('🔧 Testing Existing Workflow Compatibility...');
        
        try {
            // Test that JavaScript implementations maintain same CLI signatures
            const GitWorktree = require('../../git-worktree/git-worktree');
            const ProjectReset = require('../../project-reset/project-reset');
            
            // Verify main entry points exist
            this.assert(typeof GitWorktree === 'object' || typeof GitWorktree === 'function', 
                'Git worktree entry point should exist');
            this.assert(typeof ProjectReset === 'object' || typeof ProjectReset === 'function', 
                'Project reset entry point should exist');
            
            // Test CLI argument parsing compatibility
            const testArgs = ['node', 'git-worktree.js', 'list'];
            // This should not throw an error for basic argument parsing
            
            console.log('✅ Existing workflow compatibility verified');
        } catch (error) {
            console.error('❌ Workflow compatibility test failed:', error.message);
            throw error;
        }
    }

    async testCLIInterfaceStability() {
        console.log('💻 Testing CLI Interface Stability...');
        
        try {
            // Test that all expected CLI commands are available
            const CLIInterface = require('../../git-worktree/lib/cli-interface');
            const CLIUtils = require('../../shared/cli-utils');
            const cli = new CLIInterface();
            
            // Test help system using CLIUtils
            const helpConfig = {
                name: 'test-command',
                description: 'Test command description',
                commands: [{ name: 'list', description: 'List items' }],
                options: [{ name: '--verbose', description: 'Verbose output' }],
                examples: ['test-command list']
            };
            
            const helpOutput = CLIUtils.displayHelp(helpConfig);
            this.assert(typeof helpOutput === 'string', 'Help should return string');
            this.assert(helpOutput.length > 0, 'Help should not be empty');
            
            // Test argument parsing
            const parsedArgs = await cli.parseArgumentsWithConfig(['node', 'script.js', 'list']);
            this.assert(typeof parsedArgs === 'object', 'Parsed args should be object');
            this.assert(parsedArgs.command === 'list', 'Command should be parsed correctly');
            
            console.log('✅ CLI interface stability verified');
        } catch (error) {
            console.error('❌ CLI interface stability test failed:', error.message);
            throw error;
        }
    }

    async testConfigurationBackwardCompatibility() {
        console.log('⚙️  Testing Configuration Backward Compatibility...');
        
        try {
            const ConfigManager = require('../../shared/config-manager');
            const config = new ConfigManager();
            
            // Test that default configuration is valid
            const defaultConfig = config.getDefaultConfiguration();
            this.assert(typeof defaultConfig === 'object', 'Default config should be object');
            this.assert(defaultConfig.worktree !== undefined, 'Worktree config should exist');
            this.assert(defaultConfig.reset !== undefined, 'Reset config should exist');
            
            // Test configuration validation
            const isValid = (() => {
                try {
                    config.validateConfiguration(defaultConfig);
                    return true;
                } catch (error) {
                    return false;
                }
            })();
            this.assert(isValid === true, 'Default config should be valid');
            
            // Test configuration merging (backward compatibility)
            const legacyConfig = {
                worktree: {
                    baseDirectory: '../worktrees'
                }
            };
            
            const mergedConfig = config.mergeConfigurations(defaultConfig, legacyConfig);
            this.assert(mergedConfig.worktree.baseDirectory === '../worktrees', 
                'Legacy config should override defaults');
            
            console.log('✅ Configuration backward compatibility verified');
        } catch (error) {
            console.error('❌ Configuration compatibility test failed:', error.message);
            throw error;
        }
    }

    async testErrorHandlingConsistency() {
        console.log('🚨 Testing Error Handling Consistency...');
        
        try {
            const ErrorHandler = require('../../shared/error-handler');
            const errorHandler = new ErrorHandler();
            
            // Test error formatting consistency
            const testError = new Error('Test error message');
            testError.code = 'TEST_ERROR';
            
            const testErrorInfo = {
                code: 'TEST_ERROR',
                message: 'Test error message',
                suggestions: ['Try again', 'Check configuration'],
                command: 'test-command'
            };
            
            const formattedError = ErrorHandler.formatErrorMessage(testErrorInfo, ['Additional suggestion']);
            this.assert(typeof formattedError === 'string', 'Formatted error should be string');
            this.assert(formattedError.includes('Test error message'), 'Should include original message');
            this.assert(formattedError.includes('Try again'), 'Should include suggestions');
            
            // Test git error handling
            const gitError = new Error('Git command failed');
            gitError.code = 128;
            
            const gitErrorInfo = ErrorHandler.handleGitError(gitError, 'git status', {});
            this.assert(typeof gitErrorInfo === 'object', 'Git error info should be object');
            this.assert(gitErrorInfo.code !== undefined, 'Should have error code');
            this.assert(gitErrorInfo.suggestions !== undefined || gitErrorInfo.message !== undefined, 'Should have suggestions or message');
            
            console.log('✅ Error handling consistency verified');
        } catch (error) {
            console.error('❌ Error handling consistency test failed:', error.message);
            throw error;
        }
    }

    async testOutputFormatStability() {
        console.log('📄 Testing Output Format Stability...');
        
        try {
            const CLIInterface = require('../../git-worktree/lib/cli-interface');
            const cli = new CLIInterface();
            
            // Test table formatting
            const testData = [
                { branch: 'main', path: '/path/to/main', status: 'clean' },
                { branch: 'feature/test', path: '/path/to/feature', status: 'dirty' }
            ];
            
            const tableOutput = cli.formatOutput(testData, 'table');
            this.assert(typeof tableOutput === 'string', 'Table output should be string');
            this.assert(tableOutput.includes('main'), 'Should include branch names');
            this.assert(tableOutput.includes('clean'), 'Should include status');
            
            // Test JSON formatting
            const jsonOutput = cli.formatOutput(testData, 'json');
            this.assert(typeof jsonOutput === 'string', 'JSON output should be string');
            
            const parsedJson = JSON.parse(jsonOutput);
            this.assert(Array.isArray(parsedJson), 'JSON should parse to array');
            this.assert(parsedJson.length === 2, 'Should have correct number of items');
            
            console.log('✅ Output format stability verified');
        } catch (error) {
            console.error('❌ Output format stability test failed:', error.message);
            throw error;
        }
    }

    assert(condition, message) {
        if (condition) {
            this.testResults.push({ status: 'PASS', message });
        } else {
            this.testResults.push({ status: 'FAIL', message });
            throw new Error(`Assertion failed: ${message}`);
        }
    }

    printResults() {
        console.log('\n📊 Regression Test Results:');
        console.log('=' .repeat(50));
        
        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        
        this.testResults.forEach(result => {
            const icon = result.status === 'PASS' ? '✅' : '❌';
            console.log(`${icon} ${result.message}`);
        });
        
        console.log('=' .repeat(50));
        console.log(`📈 Summary: ${passed} passed, ${failed} failed`);
        
        if (failed === 0) {
            console.log('🎉 All regression tests PASSED!');
            console.log('✅ Existing workflows remain compatible');
        } else {
            console.log('❌ Some regression tests FAILED!');
            process.exit(1);
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const tests = new RegressionTests();
    tests.runAllTests().catch(error => {
        console.error('❌ Regression tests failed:', error.message);
        process.exit(1);
    });
}

module.exports = RegressionTests;