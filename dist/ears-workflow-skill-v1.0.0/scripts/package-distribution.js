#!/usr/bin/env node

/**
 * EARS-Workflow Skill Package Distribution Script
 * 
 * Creates a complete distribution package with all required files,
 * version information, and validation checks.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Package configuration
const PACKAGE_NAME = 'ears-workflow-skill';
const VERSION = '1.0.0';
const DIST_DIR = 'dist';
const ARCHIVE_NAME = `${PACKAGE_NAME}-v${VERSION}`;

// Required files and directories for distribution
const REQUIRED_FILES = [
    '.ai/SKILL.md',
    '.ai/skills/spec-forge/SKILL.md',
    '.ai/skills/planning/SKILL.md', 
    '.ai/skills/work/SKILL.md',
    '.ai/skills/review/SKILL.md',
    '.ai/skills/git-worktree/SKILL.md',
    '.ai/skills/project-reset/SKILL.md',
    '.ai/memory/lessons.md',
    '.ai/memory/decisions.md',
    '.ai/docs/guides/installation.md',
    '.ai/docs/guides/usage.md',
    'package.json',
    'README.md',
    'LICENSE',
    'INSTALL.md',
    'CHANGELOG.md'
];

const REQUIRED_DIRECTORIES = [
    '.ai',
    '.ai/skills',
    '.ai/memory',
    '.ai/workflows',
    '.ai/templates',
    '.ai/docs',
    '.ai/protocols',
    '.ai/roles'
];

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
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
    log(`[${step}] ${message}`, 'blue');
}

function logSuccess(message) {
    log(`✓ ${message}`, 'green');
}

function logError(message) {
    log(`✗ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠ ${message}`, 'yellow');
}

/**
 * Validate that all required files exist
 */
function validateRequiredFiles() {
    logStep('VALIDATE', 'Checking required files and directories...');
    
    let allValid = true;
    
    // Check required files
    for (const file of REQUIRED_FILES) {
        if (!fs.existsSync(file)) {
            logError(`Missing required file: ${file}`);
            allValid = false;
        } else {
            logSuccess(`Found: ${file}`);
        }
    }
    
    // Check required directories
    for (const dir of REQUIRED_DIRECTORIES) {
        if (!fs.existsSync(dir)) {
            logError(`Missing required directory: ${dir}`);
            allValid = false;
        } else {
            logSuccess(`Found: ${dir}`);
        }
    }
    
    if (!allValid) {
        throw new Error('Missing required files or directories. Cannot create distribution package.');
    }
    
    logSuccess('All required files and directories found');
}

/**
 * Validate YAML frontmatter in SKILL.md files
 */
function validateSkillFiles() {
    logStep('VALIDATE', 'Validating SKILL.md files...');
    
    const skillFiles = [
        '.ai/SKILL.md',
        '.ai/skills/spec-forge/SKILL.md',
        '.ai/skills/planning/SKILL.md',
        '.ai/skills/work/SKILL.md',
        '.ai/skills/review/SKILL.md',
        '.ai/skills/git-worktree/SKILL.md',
        '.ai/skills/project-reset/SKILL.md'
    ];
    
    for (const skillFile of skillFiles) {
        try {
            const content = fs.readFileSync(skillFile, 'utf8');
            
            // Check for YAML frontmatter (handle both LF and CRLF line endings)
            if (!content.startsWith('---\n') && !content.startsWith('---\r\n')) {
                throw new Error(`Missing YAML frontmatter in ${skillFile}`);
            }
            
            // Find frontmatter end (handle both line ending types)
            const startOffset = content.startsWith('---\r\n') ? 5 : 4;
            let frontmatterEnd = content.indexOf('\n---\n', startOffset);
            if (frontmatterEnd === -1) {
                frontmatterEnd = content.indexOf('\r\n---\r\n', startOffset);
            }
            if (frontmatterEnd === -1) {
                frontmatterEnd = content.indexOf('\n---', startOffset);
            }
            if (frontmatterEnd === -1) {
                frontmatterEnd = content.indexOf('\r\n---', startOffset);
            }
            
            if (frontmatterEnd === -1) {
                throw new Error(`Invalid YAML frontmatter format in ${skillFile}`);
            }
            
            const frontmatter = content.substring(startOffset, frontmatterEnd);
            
            // Basic validation - check for required fields
            if (!frontmatter.includes('name:')) {
                throw new Error(`Missing 'name' field in ${skillFile}`);
            }
            if (!frontmatter.includes('description:')) {
                throw new Error(`Missing 'description' field in ${skillFile}`);
            }
            
            logSuccess(`Valid SKILL.md: ${skillFile}`);
            
        } catch (error) {
            logError(`Invalid SKILL.md file ${skillFile}: ${error.message}`);
            throw error;
        }
    }
    
    logSuccess('All SKILL.md files validated');
}

/**
 * Create distribution directory structure
 */
function createDistributionStructure() {
    logStep('CREATE', 'Creating distribution directory structure...');
    
    // Clean existing dist directory
    if (fs.existsSync(DIST_DIR)) {
        fs.rmSync(DIST_DIR, { recursive: true, force: true });
        logSuccess('Cleaned existing distribution directory');
    }
    
    // Create dist directory
    fs.mkdirSync(DIST_DIR, { recursive: true });
    logSuccess(`Created distribution directory: ${DIST_DIR}`);
    
    // Create package directory
    const packageDir = path.join(DIST_DIR, ARCHIVE_NAME);
    fs.mkdirSync(packageDir, { recursive: true });
    logSuccess(`Created package directory: ${packageDir}`);
    
    return packageDir;
}

/**
 * Copy files to distribution package
 */
function copyFilesToPackage(packageDir) {
    logStep('COPY', 'Copying files to distribution package...');
    
    // Copy entire .ai directory
    copyDirectory('.ai', path.join(packageDir, '.ai'));
    logSuccess('Copied .ai directory');
    
    // Copy root files
    const rootFiles = ['package.json', 'README.md', 'LICENSE', 'INSTALL.md', 'CHANGELOG.md'];
    for (const file of rootFiles) {
        if (fs.existsSync(file)) {
            fs.copyFileSync(file, path.join(packageDir, file));
            logSuccess(`Copied ${file}`);
        }
    }
    
    // Copy scripts directory if it exists
    if (fs.existsSync('scripts')) {
        copyDirectory('scripts', path.join(packageDir, 'scripts'));
        logSuccess('Copied scripts directory');
    }
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
 * Create package metadata
 */
function createPackageMetadata(packageDir) {
    logStep('METADATA', 'Creating package metadata...');
    
    const metadata = {
        name: PACKAGE_NAME,
        version: VERSION,
        description: 'EARS-workflow skill package for structured development methodology',
        type: 'agent-skill-package',
        main: '.ai/SKILL.md',
        created: new Date().toISOString(),
        author: 'EARS-Workflow System',
        license: 'MIT',
        attribution: 'Based on Compound Engineering Plugin by EveryInc',
        requirements: {
            git: '>=2.20.0',
            nodejs: '>=16.0.0 (optional)',
            ide: 'Agent Skills compatible (VS Code, Cursor, JetBrains, etc.)'
        },
        features: [
            'EARS-compliant requirements creation',
            'Property-based testing integration',
            'Git worktree management',
            'Multi-perspective code reviews',
            'Compound engineering memory',
            'Progressive disclosure architecture',
            'Cross-platform compatibility',
            'Multi-IDE integration'
        ],
        skills: [
            'spec-forge',
            'planning', 
            'work',
            'review',
            'git-worktree',
            'project-reset'
        ],
        installation: {
            method1: 'Copy .ai/ directory to project root',
            method2: 'Add as git submodule',
            verification: 'Test with "use EARS workflow"'
        },
        support: {
            documentation: '.ai/docs/guides/',
            troubleshooting: '.ai/docs/guides/installation.md',
            examples: '.ai/docs/guides/usage.md'
        }
    };
    
    fs.writeFileSync(
        path.join(packageDir, 'package-metadata.json'),
        JSON.stringify(metadata, null, 2)
    );
    
    logSuccess('Created package metadata');
}

/**
 * Create installation verification script
 */
function createVerificationScript(packageDir) {
    logStep('VERIFY', 'Creating installation verification script...');
    
    const verificationScript = `#!/usr/bin/env node

/**
 * EARS-Workflow Installation Verification Script
 * 
 * Verifies that the skill package is correctly installed and functional.
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_FILES = [
    '.ai/SKILL.md',
    '.ai/skills/spec-forge/SKILL.md',
    '.ai/skills/planning/SKILL.md',
    '.ai/skills/work/SKILL.md',
    '.ai/skills/review/SKILL.md',
    '.ai/skills/git-worktree/SKILL.md',
    '.ai/skills/project-reset/SKILL.md',
    '.ai/memory/lessons.md',
    '.ai/memory/decisions.md'
];

function log(message, color = 'reset') {
    const colors = {
        green: '\\x1b[32m',
        red: '\\x1b[31m',
        yellow: '\\x1b[33m',
        blue: '\\x1b[34m',
        reset: '\\x1b[0m'
    };
    console.log(\`\${colors[color]}\${message}\${colors.reset}\`);
}

function verifyInstallation() {
    log('🔍 Verifying EARS-Workflow installation...', 'blue');
    
    let allValid = true;
    
    // Check required files
    for (const file of REQUIRED_FILES) {
        if (fs.existsSync(file)) {
            log(\`✓ Found: \${file}\`, 'green');
        } else {
            log(\`✗ Missing: \${file}\`, 'red');
            allValid = false;
        }
    }
    
    // Check YAML frontmatter in main SKILL.md
    try {
        const skillContent = fs.readFileSync('.ai/SKILL.md', 'utf8');
        if ((skillContent.startsWith('---\\n') || skillContent.startsWith('---\\r\\n')) && 
            (skillContent.includes('name: ears-workflow') || skillContent.includes('name:ears-workflow'))) {
            log('✓ Main SKILL.md has valid YAML frontmatter', 'green');
        } else {
            log('✗ Main SKILL.md missing or invalid YAML frontmatter', 'red');
            allValid = false;
        }
    } catch (error) {
        log('✗ Cannot read main SKILL.md file', 'red');
        allValid = false;
    }
    
    if (allValid) {
        log('\\n🎉 Installation verification successful!', 'green');
        log('Next steps:', 'blue');
        log('1. Test activation: "use EARS workflow"', 'yellow');
        log('2. Read documentation: .ai/docs/guides/installation.md', 'yellow');
        log('3. Try examples: .ai/docs/guides/usage.md', 'yellow');
        return true;
    } else {
        log('\\n❌ Installation verification failed!', 'red');
        log('Please check the installation guide: .ai/docs/guides/installation.md', 'yellow');
        return false;
    }
}

if (require.main === module) {
    const success = verifyInstallation();
    process.exit(success ? 0 : 1);
}

module.exports = { verifyInstallation };
`;

    fs.writeFileSync(path.join(packageDir, 'verify-installation.js'), verificationScript);
    
    // Make script executable on Unix systems
    try {
        fs.chmodSync(path.join(packageDir, 'verify-installation.js'), 0o755);
    } catch (error) {
        // Ignore chmod errors on Windows
    }
    
    logSuccess('Created installation verification script');
}

/**
 * Create archive of the package
 */
function createArchive(packageDir) {
    logStep('ARCHIVE', 'Creating distribution archive...');
    
    try {
        // Create tar.gz archive
        const archivePath = `${DIST_DIR}/${ARCHIVE_NAME}.tar.gz`;
        execSync(`tar -czf ${archivePath} -C ${DIST_DIR} ${ARCHIVE_NAME}`, { stdio: 'inherit' });
        logSuccess(`Created archive: ${archivePath}`);
        
        // Create zip archive for Windows compatibility
        const zipPath = `${DIST_DIR}/${ARCHIVE_NAME}.zip`;
        try {
            execSync(`cd ${DIST_DIR} && zip -r ${ARCHIVE_NAME}.zip ${ARCHIVE_NAME}`, { stdio: 'inherit' });
            logSuccess(`Created zip archive: ${zipPath}`);
        } catch (error) {
            logWarning('Could not create zip archive (zip command not available)');
        }
        
        return { tarPath: archivePath, zipPath: zipPath };
        
    } catch (error) {
        logError(`Failed to create archive: ${error.message}`);
        throw error;
    }
}

/**
 * Generate distribution summary
 */
function generateSummary(packageDir, archives) {
    logStep('SUMMARY', 'Generating distribution summary...');
    
    const stats = fs.statSync(packageDir);
    const fileCount = countFiles(packageDir);
    
    const summary = {
        package: {
            name: PACKAGE_NAME,
            version: VERSION,
            created: new Date().toISOString(),
            size: getDirectorySize(packageDir),
            fileCount: fileCount
        },
        archives: archives,
        contents: {
            mainSkill: '.ai/SKILL.md',
            subSkills: 6,
            documentation: 'Complete installation and usage guides',
            scripts: 'Git worktree and project reset automation',
            memory: 'Compound engineering lessons and decisions',
            tests: 'Property-based testing integration'
        },
        installation: {
            quickStart: 'cp -r .ai/ /path/to/your/project/',
            verification: 'node verify-installation.js',
            activation: '"use EARS workflow"'
        },
        support: {
            documentation: '.ai/docs/guides/',
            troubleshooting: 'See INSTALL.md and installation guide',
            community: 'Project repository discussions'
        }
    };
    
    fs.writeFileSync(
        path.join(DIST_DIR, 'distribution-summary.json'),
        JSON.stringify(summary, null, 2)
    );
    
    logSuccess('Generated distribution summary');
    
    // Print summary to console
    log('\n' + '='.repeat(60), 'bold');
    log('📦 DISTRIBUTION PACKAGE SUMMARY', 'bold');
    log('='.repeat(60), 'bold');
    log(`Package: ${PACKAGE_NAME} v${VERSION}`);
    log(`Files: ${fileCount} files`);
    log(`Size: ${formatBytes(getDirectorySize(packageDir))}`);
    log(`Location: ${packageDir}`);
    if (archives.tarPath) log(`Archive: ${archives.tarPath}`);
    if (archives.zipPath) log(`Zip: ${archives.zipPath}`);
    log('\n📋 INSTALLATION:');
    log('1. Extract archive to desired location');
    log('2. Copy .ai/ directory to your project root');
    log('3. Run: node verify-installation.js');
    log('4. Test: "use EARS workflow" in your IDE');
    log('\n📚 DOCUMENTATION:');
    log('• Quick start: INSTALL.md');
    log('• Full guide: .ai/docs/guides/installation.md');
    log('• Usage examples: .ai/docs/guides/usage.md');
    log('• Changelog: CHANGELOG.md');
    log('='.repeat(60), 'bold');
}

/**
 * Utility functions
 */
function countFiles(dir) {
    let count = 0;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        if (entry.isDirectory()) {
            count += countFiles(path.join(dir, entry.name));
        } else {
            count++;
        }
    }
    
    return count;
}

function getDirectorySize(dir) {
    let size = 0;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            size += getDirectorySize(fullPath);
        } else {
            size += fs.statSync(fullPath).size;
        }
    }
    
    return size;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Main execution
 */
function main() {
    try {
        log('🚀 Starting EARS-Workflow distribution package creation...', 'bold');
        
        // Validation
        validateRequiredFiles();
        validateSkillFiles();
        
        // Package creation
        const packageDir = createDistributionStructure();
        copyFilesToPackage(packageDir);
        createPackageMetadata(packageDir);
        createVerificationScript(packageDir);
        
        // Archive creation
        const archives = createArchive(packageDir);
        
        // Summary
        generateSummary(packageDir, archives);
        
        log('\n🎉 Distribution package created successfully!', 'green');
        
    } catch (error) {
        logError(`Failed to create distribution package: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    validateRequiredFiles,
    validateSkillFiles,
    createDistributionStructure,
    copyFilesToPackage,
    createPackageMetadata,
    createVerificationScript,
    createArchive,
    generateSummary
};