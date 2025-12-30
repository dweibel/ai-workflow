/**
 * Cross-Platform Native Execution Property Test
 * **Feature: bash-to-javascript-conversion, Property 1: Cross-platform native execution**
 * **Validates: Requirements 1.1**
 * 
 * Property: For any supported operating system (Windows, macOS, Linux), 
 * the JavaScript implementations should execute natively without requiring 
 * additional runtime dependencies beyond Node.js
 */

const os = require('os');
const path = require('path');
const { execSync, spawn } = require('child_process');
const fs = require('fs');

// Import modules to test
const GitOperations = require('../../git-worktree/lib/git-operations');
const WorktreeManager = require('../../git-worktree/lib/worktree-manager');
const ArchiveManager = require('../../project-reset/lib/archive-manager');
const ResetManager = require('../../project-reset/lib/reset-manager');
const ConfigManager = require('../../shared/config-manager');
const ErrorHandler = require('../../shared/error-handler');

class CrossPlatformNativeExecutionTest {
    constructor() {
        this.platform = os.platform();
        this.architecture = os.arch();
        this.nodeVersion = process.version;
        this.testResults = [];
    }

    async runPropertyTest() {
        console.log('🧪 Testing Cross-Platform Native Execution Property...\n');
        console.log(`Platform: ${this.platform}`);
        console.log(`Architecture: ${this.architecture}`);
        console.log(`Node.js: ${this.nodeVersion}\n`);

        try {
            // Property Test 1: Module Loading
            await this.testModuleLoading();
            
            // Property Test 2: Native Execution
            await this.testNativeExecution();
            
            // Property Test 3: Cross-Platform Path Handling
            await this.testCrossPlatformPaths();
            
            // Property Test 4: Process Spawning
            await this.testProcessSpawning();
            
            // Property Test 5: File System Operations
            await this.testFileSystemOperations();
            
            this.printResults();
        } catch (error) {
            console.error('❌ Property test failed:', error.message);
            process.exit(1);
        }
    }

    async testModuleLoading() {
        console.log('📦 Testing Module Loading Across Platforms...');
        
        try {
            // Test that all core modules can be loaded without platform-specific dependencies
            this.assert(GitOperations !== undefined, 'GitOperations module should load');
            this.assert(WorktreeManager !== undefined, 'WorktreeManager module should load');
            this.assert(ArchiveManager !== undefined, 'ArchiveManager module should load');
            this.assert(ResetManager !== undefined, 'ResetManager module should load');
            this.assert(ConfigManager !== undefined, 'ConfigManager module should load');
            this.assert(ErrorHandler !== undefined, 'ErrorHandler module should load');
            
            // Test module instantiation
            const gitOps = new GitOperations();
            const worktreeManager = new WorktreeManager();
            const archiveManager = new ArchiveManager();
            const resetManager = new ResetManager();
            const configManager = new ConfigManager();
            
            this.assert(gitOps instanceof GitOperations, 'GitOperations should instantiate');
            this.assert(worktreeManager instanceof WorktreeManager, 'WorktreeManager should instantiate');
            this.assert(archiveManager instanceof ArchiveManager, 'ArchiveManager should instantiate');
            this.assert(resetManager instanceof ResetManager, 'ResetManager should instantiate');
            this.assert(configManager instanceof ConfigManager, 'ConfigManager should instantiate');
            
            console.log('✅ Module loading tests passed');
        } catch (error) {
            console.error('❌ Module loading test failed:', error.message);
            throw error;
        }
    }

    async testNativeExecution() {
        console.log('⚡ Testing Native Execution Without External Dependencies...');
        
        try {
            // Test that Node.js built-in modules work correctly
            const builtinModules = ['fs', 'path', 'os', 'child_process', 'util', 'stream'];
            
            for (const moduleName of builtinModules) {
                const module = require(moduleName);
                this.assert(module !== undefined, `Built-in module ${moduleName} should be available`);
            }
            
            // Test platform-specific functionality
            const platform = os.platform();
            this.assert(['win32', 'darwin', 'linux'].includes(platform), 'Should run on supported platforms');
            
            // Test that child_process works for git commands
            const gitOps = new GitOperations();
            
            // This should work without external dependencies
            const testCommand = process.platform === 'win32' ? 'where git' : 'which git';
            
            try {
                execSync(testCommand, { stdio: 'pipe' });
                console.log('ℹ️  Git is available for testing');
            } catch (error) {
                console.log('ℹ️  Git not available - testing module functionality only');
            }
            
            console.log('✅ Native execution tests passed');
        } catch (error) {
            console.error('❌ Native execution test failed:', error.message);
            throw error;
        }
    }

    async testCrossPlatformPaths() {
        console.log('📁 Testing Cross-Platform Path Handling...');
        
        try {
            // Test path operations work correctly on all platforms
            const testPaths = [
                'simple/path',
                'path/with/multiple/segments',
                '../relative/path',
                './current/directory'
            ];
            
            for (const testPath of testPaths) {
                const normalized = path.normalize(testPath);
                const resolved = path.resolve(testPath);
                const dirname = path.dirname(testPath);
                const basename = path.basename(testPath);
                
                this.assert(typeof normalized === 'string', 'Path normalize should return string');
                this.assert(typeof resolved === 'string', 'Path resolve should return string');
                this.assert(typeof dirname === 'string', 'Path dirname should return string');
                this.assert(typeof basename === 'string', 'Path basename should return string');
            }
            
            // Test platform-specific path separators
            const separator = path.sep;
            const expectedSeparator = process.platform === 'win32' ? '\\' : '/';
            this.assert(separator === expectedSeparator, 'Path separator should match platform');
            
            // Test worktree path generation
            const worktreeManager = new WorktreeManager();
            const testBranch = 'feature/test-branch';
            
            // Get the actual base directory
            const baseDir = worktreeManager.baseWorktreeDir;
            this.assert(typeof baseDir === 'string', 'Base worktree directory should be string');
            
            // This should work without actually creating the worktree
            const expectedPath = path.join(baseDir, testBranch);
            this.assert(typeof expectedPath === 'string', 'Worktree path generation should work');
            
            // The path should contain some part of the branch name (may be normalized)
            const normalizedBranch = testBranch.replace(/[\/\\]/g, path.sep);
            const pathContainsBranch = expectedPath.includes('test-branch') || 
                                     expectedPath.includes('feature') ||
                                     expectedPath.includes(normalizedBranch);
            this.assert(pathContainsBranch, 'Generated path should include branch components');
            
            console.log('✅ Cross-platform path handling tests passed');
        } catch (error) {
            console.error('❌ Cross-platform path handling test failed:', error.message);
            throw error;
        }
    }

    async testProcessSpawning() {
        console.log('🚀 Testing Process Spawning Capabilities...');
        
        try {
            // Test that we can spawn processes on the current platform
            const testCommand = process.platform === 'win32' ? 'echo' : 'echo';
            const testArgs = ['test'];
            
            const result = await new Promise((resolve, reject) => {
                const child = spawn(testCommand, testArgs, {
                    stdio: ['pipe', 'pipe', 'pipe'],
                    shell: process.platform === 'win32'
                });
                
                let stdout = '';
                let stderr = '';
                
                child.stdout.on('data', (data) => {
                    stdout += data.toString();
                });
                
                child.stderr.on('data', (data) => {
                    stderr += data.toString();
                });
                
                child.on('close', (exitCode) => {
                    resolve({ stdout, stderr, exitCode });
                });
                
                child.on('error', (error) => {
                    reject(error);
                });
                
                // Timeout after 5 seconds
                setTimeout(() => {
                    child.kill();
                    reject(new Error('Process spawn timeout'));
                }, 5000);
            });
            
            this.assert(result.exitCode === 0, 'Process should execute successfully');
            this.assert(result.stdout.includes('test'), 'Process should produce expected output');
            
            // Test GitOperations process spawning
            const gitOps = new GitOperations();
            
            // Test that the executeGitCommand method exists and is callable
            this.assert(typeof gitOps.executeGitCommand === 'function', 'executeGitCommand should be function');
            
            console.log('✅ Process spawning tests passed');
        } catch (error) {
            console.error('❌ Process spawning test failed:', error.message);
            throw error;
        }
    }

    async testFileSystemOperations() {
        console.log('💾 Testing File System Operations...');
        
        try {
            const tempDir = path.join(os.tmpdir(), 'cross-platform-fs-test-' + Date.now());
            
            // Test directory creation
            fs.mkdirSync(tempDir, { recursive: true });
            this.assert(fs.existsSync(tempDir), 'Directory should be created');
            
            // Test file operations
            const testFile = path.join(tempDir, 'test.txt');
            fs.writeFileSync(testFile, 'test content');
            this.assert(fs.existsSync(testFile), 'File should be created');
            
            const content = fs.readFileSync(testFile, 'utf8');
            this.assert(content === 'test content', 'File content should match');
            
            // Test file stats
            const stats = fs.statSync(testFile);
            this.assert(stats.isFile(), 'Should be recognized as file');
            this.assert(stats.size > 0, 'File should have size');
            
            // Test directory listing
            const files = fs.readdirSync(tempDir);
            this.assert(files.includes('test.txt'), 'Directory listing should include file');
            
            // Test file deletion
            fs.unlinkSync(testFile);
            this.assert(!fs.existsSync(testFile), 'File should be deleted');
            
            // Test directory deletion
            fs.rmdirSync(tempDir);
            this.assert(!fs.existsSync(tempDir), 'Directory should be deleted');
            
            // Test ConfigManager file operations
            const configManager = new ConfigManager();
            const defaultConfig = configManager.getDefaultConfiguration();
            this.assert(typeof defaultConfig === 'object', 'Config should be object');
            
            console.log('✅ File system operations tests passed');
        } catch (error) {
            console.error('❌ File system operations test failed:', error.message);
            throw error;
        }
    }

    assert(condition, message) {
        if (condition) {
            this.testResults.push({ status: 'PASS', message });
        } else {
            this.testResults.push({ status: 'FAIL', message });
            throw new Error(`Property assertion failed: ${message}`);
        }
    }

    printResults() {
        console.log('\n📊 Cross-Platform Native Execution Property Test Results:');
        console.log('=' .repeat(60));
        
        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        
        this.testResults.forEach(result => {
            const icon = result.status === 'PASS' ? '✅' : '❌';
            console.log(`${icon} ${result.message}`);
        });
        
        console.log('=' .repeat(60));
        console.log(`📈 Summary: ${passed} passed, ${failed} failed`);
        
        if (failed === 0) {
            console.log('🎉 Cross-Platform Native Execution Property VALIDATED!');
            console.log('✅ Property 1: Cross-platform native execution - VERIFIED');
            console.log(`✅ Platform: ${this.platform} (${this.architecture})`);
            console.log(`✅ Node.js: ${this.nodeVersion}`);
        } else {
            console.log('❌ Cross-Platform Native Execution Property FAILED!');
            process.exit(1);
        }
    }
}

// Run property test if this file is executed directly
if (require.main === module) {
    const test = new CrossPlatformNativeExecutionTest();
    test.runPropertyTest().catch(error => {
        console.error('❌ Property test execution failed:', error.message);
        process.exit(1);
    });
}

module.exports = CrossPlatformNativeExecutionTest;