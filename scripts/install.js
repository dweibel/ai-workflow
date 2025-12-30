#!/usr/bin/env node

/**
 * EARS-Workflow Skill Package Installation Script
 * 
 * Cross-platform JavaScript installation script that installs the EARS-workflow 
 * skill package into a target project directory.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}[INSTALL]${colors.reset} ${message}`);
}

function success(message) {
    console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function error(message) {
    console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function warning(message) {
    console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

/**
 * Show usage information
 */
function showUsage() {
    console.log('EARS-Workflow Skill Package Installation Script');
    console.log('');
    console.log('Usage: node install.js [OPTIONS] [TARGET_PROJECT_DIR]');
    console.log('');
    console.log('Arguments:');
    console.log('  TARGET_PROJECT_DIR    Path to target project directory (default: current directory)');
    console.log('');
    console.log('Options:');
    console.log('  -h, --help           Show this help message');
    console.log('  -v, --verify         Verify installation after copying files');
    console.log('  -f, --force          Force installation even if .ai directory exists');
    console.log('  --backup             Create backup of existing .ai directory');
    console.log('');
    console.log('Examples:');
    console.log('  node install.js                           # Install in current directory');
    console.log('  node install.js /path/to/my/project       # Install in specific project');
    console.log('  node install.js --verify                  # Install and verify');
    console.log('  node install.js --force /path/to/project  # Force install even if .ai exists');
    console.log('  node install.js --backup --verify         # Backup existing and verify');
}

/**
 * Parse command line arguments
 */
function parseArguments() {
    const args = process.argv.slice(2);
    const options = {
        targetDir: process.cwd(),
        verify: false,
        force: false,
        backup: false,
        help: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        switch (arg) {
            case '-h':
            case '--help':
                options.help = true;
                break;
            case '-v':
            case '--verify':
                options.verify = true;
                break;
            case '-f':
            case '--force':
                options.force = true;
                break;
            case '--backup':
                options.backup = true;
                break;
            default:
                if (!arg.startsWith('-')) {
                    options.targetDir = path.resolve(arg);
                } else {
                    error(`Unknown option: ${arg}`);
                    showUsage();
                    process.exit(1);
                }
                break;
        }
    }

    return options;
}

/**
 * Recursively copy directory
 */
function copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

/**
 * Create backup of existing .ai directory
 */
function createBackup(targetDir) {
    const aiDir = path.join(targetDir, '.ai');
    if (!fs.existsSync(aiDir)) {
        return null;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '-' + 
                     new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('.')[0];
    const backupName = `.ai.backup.${timestamp}`;
    const backupPath = path.join(targetDir, backupName);

    log(`Creating backup: ${backupPath}`);
    
    try {
        copyDirectory(aiDir, backupPath);
        fs.rmSync(aiDir, { recursive: true, force: true });
        success(`Backup created: ${backupName}`);
        return backupName;
    } catch (err) {
        error(`Failed to create backup: ${err.message}`);
        throw err;
    }
}

/**
 * Validate source directory
 */
function validateSource(packageDir) {
    const skillFile = path.join(packageDir, '.ai', 'SKILL.md');
    if (!fs.existsSync(skillFile)) {
        error('Source directory does not contain EARS-Workflow skill package');
        error(`Expected to find: ${skillFile}`);
        return false;
    }
    
    // Validate main SKILL.md has correct content
    try {
        const content = fs.readFileSync(skillFile, 'utf8');
        if (!content.includes('name: ears-workflow') && !content.includes('name:ears-workflow')) {
            error('Invalid EARS-Workflow skill package - missing ears-workflow name in SKILL.md');
            return false;
        }
    } catch (err) {
        error(`Cannot read SKILL.md: ${err.message}`);
        return false;
    }
    
    success(`Valid EARS-Workflow package found at: ${packageDir}`);
    return true;
}

/**
 * Validate target directory
 */
function validateTarget(targetDir) {
    if (!fs.existsSync(targetDir)) {
        error(`Target directory does not exist: ${targetDir}`);
        return false;
    }
    
    if (!fs.statSync(targetDir).isDirectory()) {
        error(`Target path is not a directory: ${targetDir}`);
        return false;
    }
    
    success(`Target directory validated: ${targetDir}`);
    return true;
}

/**
 * Check for existing installation
 */
function checkExistingInstallation(targetDir, options) {
    const aiDir = path.join(targetDir, '.ai');
    
    if (!fs.existsSync(aiDir)) {
        return true; // No existing installation
    }
    
    warning('Target directory already contains .ai directory');
    console.log(`Existing: ${aiDir}`);
    console.log('');
    
    if (options.force) {
        log('Force option enabled - will overwrite existing installation');
        return true;
    }
    
    if (options.backup) {
        log('Backup option enabled - will backup existing installation');
        return true;
    }
    
    console.log('Options:');
    console.log('1. Use --force to overwrite existing installation');
    console.log('2. Use --backup to backup existing installation');
    console.log('3. Choose a different target directory');
    console.log('');
    
    // In non-interactive environments, default to safe behavior
    if (process.env.CI || process.env.NODE_ENV === 'test') {
        error('Existing .ai directory found and no --force or --backup option specified');
        return false;
    }
    
    // For interactive use, we could prompt, but for now require explicit options
    error('Existing .ai directory found. Use --force or --backup option to proceed.');
    return false;
}

/**
 * Install the skill package
 */
function installPackage(packageDir, targetDir, options) {
    log('Installing EARS-Workflow skill package...');
    
    // Handle existing installation
    const aiDir = path.join(targetDir, '.ai');
    if (fs.existsSync(aiDir)) {
        if (options.backup) {
            createBackup(targetDir);
        } else if (options.force) {
            log('Removing existing .ai directory...');
            fs.rmSync(aiDir, { recursive: true, force: true });
            success('Removed existing .ai directory');
        }
    }
    
    // Copy .ai directory
    log('Copying .ai directory...');
    const sourceAiDir = path.join(packageDir, '.ai');
    copyDirectory(sourceAiDir, aiDir);
    success(`Copied .ai directory to ${targetDir}`);
    
    // Copy additional files if they don't exist in target
    const optionalFiles = ['README.md', 'INSTALL.md', 'CHANGELOG.md', 'LICENSE'];
    for (const file of optionalFiles) {
        const sourcePath = path.join(packageDir, file);
        const targetPath = path.join(targetDir, file);
        
        if (fs.existsSync(sourcePath) && !fs.existsSync(targetPath)) {
            fs.copyFileSync(sourcePath, targetPath);
            success(`Copied ${file}`);
        }
    }
    
    // Set executable permissions for scripts (Unix-like systems)
    if (process.platform !== 'win32') {
        try {
            const skillsDir = path.join(aiDir, 'skills');
            if (fs.existsSync(skillsDir)) {
                setExecutablePermissions(skillsDir);
                success('Set executable permissions for skill scripts');
            }
        } catch (err) {
            warning(`Could not set executable permissions: ${err.message}`);
        }
    }
}

/**
 * Set executable permissions for shell scripts
 */
function setExecutablePermissions(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
            setExecutablePermissions(fullPath);
        } else if (entry.name.endsWith('.sh')) {
            try {
                fs.chmodSync(fullPath, 0o755);
            } catch (err) {
                // Ignore chmod errors
            }
        }
    }
}

/**
 * Verify installation
 */
function verifyInstallation(targetDir, packageDir) {
    log('Verifying installation...');
    
    // Check if verification script exists in package
    const verifyScript = path.join(packageDir, 'verify-installation.js');
    if (fs.existsSync(verifyScript)) {
        // Copy verification script temporarily
        const tempVerifyScript = path.join(targetDir, 'verify-installation.js');
        fs.copyFileSync(verifyScript, tempVerifyScript);
        
        try {
            // Run verification in target directory
            const originalCwd = process.cwd();
            process.chdir(targetDir);
            
            // Import and run verification
            const { verifyInstallation } = require(path.resolve(tempVerifyScript));
            const result = verifyInstallation();
            
            process.chdir(originalCwd);
            
            // Clean up verification script
            fs.unlinkSync(tempVerifyScript);
            
            if (result) {
                success('Installation verification passed');
                return true;
            } else {
                error('Installation verification failed');
                return false;
            }
        } catch (err) {
            error(`Verification failed: ${err.message}`);
            // Clean up verification script
            try {
                fs.unlinkSync(tempVerifyScript);
            } catch (cleanupErr) {
                // Ignore cleanup errors
            }
            return false;
        }
    } else {
        // Basic verification without script
        return basicVerification(targetDir);
    }
}

/**
 * Basic verification without verification script
 */
function basicVerification(targetDir) {
    const requiredFiles = [
        '.ai/SKILL.md',
        '.ai/skills/compound-engineering/SKILL.md',
        '.ai/skills/ears-specification/SKILL.md',
        '.ai/skills/git-workflow/SKILL.md',
        '.ai/skills/testing-framework/SKILL.md',
        '.ai/memory/lessons.md',
        '.ai/memory/decisions.md'
    ];
    
    let allValid = true;
    
    for (const file of requiredFiles) {
        const filePath = path.join(targetDir, file);
        if (fs.existsSync(filePath)) {
            success(`Found: ${file}`);
        } else {
            error(`Missing: ${file}`);
            allValid = false;
        }
    }
    
    if (allValid) {
        success('Basic verification passed');
    } else {
        error('Basic verification failed');
    }
    
    return allValid;
}

/**
 * Show completion message
 */
function showCompletion(targetDir, options) {
    console.log('');
    console.log('🎉 EARS-Workflow skill package installed successfully!');
    console.log('');
    console.log(`📍 Installation location: ${path.join(targetDir, '.ai')}`);
    console.log('');
    console.log('🚀 Next steps:');
    console.log('1. Open your IDE in the target project directory');
    console.log('2. Test activation: "use EARS workflow"');
    console.log('3. Read documentation: .ai/docs/guides/installation.md');
    console.log('4. Try examples: .ai/docs/guides/usage.md');
    console.log('');
    console.log('💡 Quick test:');
    console.log(`   cd ${targetDir}`);
    console.log('   # In your IDE: "use EARS workflow"');
    console.log('');
    console.log('🔧 IDE-specific setup:');
    console.log('• VS Code: Restart VS Code for skill discovery');
    console.log('• Cursor: Configure Agent-Decided rules (optional)');
    console.log('• JetBrains: Use \'openskills transpile .ai/SKILL.md --target jetbrains\'');
    console.log('');
    success('Installation complete!');
}

/**
 * Main installation function
 */
function main() {
    const options = parseArguments();
    
    if (options.help) {
        showUsage();
        process.exit(0);
    }
    
    // Get package directory (where this script is located)
    const scriptDir = path.dirname(__filename);
    const packageDir = path.dirname(scriptDir);
    
    log('EARS-Workflow Skill Package Installation');
    log(`Source: ${packageDir}`);
    log(`Target: ${options.targetDir}`);
    
    try {
        // Validation
        if (!validateSource(packageDir)) {
            process.exit(1);
        }
        
        if (!validateTarget(options.targetDir)) {
            process.exit(1);
        }
        
        if (!checkExistingInstallation(options.targetDir, options)) {
            process.exit(1);
        }
        
        // Installation
        installPackage(packageDir, options.targetDir, options);
        
        // Verification
        if (options.verify) {
            if (!verifyInstallation(options.targetDir, packageDir)) {
                process.exit(1);
            }
        }
        
        // Completion
        showCompletion(options.targetDir, options);
        
    } catch (err) {
        error(`Installation failed: ${err.message}`);
        console.error(err.stack);
        process.exit(1);
    }
}

// Export functions for testing
module.exports = {
    parseArguments,
    validateSource,
    validateTarget,
    checkExistingInstallation,
    installPackage,
    verifyInstallation,
    basicVerification,
    copyDirectory,
    createBackup,
    setExecutablePermissions
};

// Run main function if script is executed directly
if (require.main === module) {
    main();
}