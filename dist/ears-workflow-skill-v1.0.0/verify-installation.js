#!/usr/bin/env node

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
        green: '\x1b[32m',
        red: '\x1b[31m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        reset: '\x1b[0m'
    };
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function verifyInstallation() {
    log('🔍 Verifying EARS-Workflow installation...', 'blue');
    
    let allValid = true;
    
    // Check required files
    for (const file of REQUIRED_FILES) {
        if (fs.existsSync(file)) {
            log(`✓ Found: ${file}`, 'green');
        } else {
            log(`✗ Missing: ${file}`, 'red');
            allValid = false;
        }
    }
    
    // Check YAML frontmatter in main SKILL.md
    try {
        const skillContent = fs.readFileSync('.ai/SKILL.md', 'utf8');
        if ((skillContent.startsWith('---\n') || skillContent.startsWith('---\r\n')) && 
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
        log('\n🎉 Installation verification successful!', 'green');
        log('Next steps:', 'blue');
        log('1. Test activation: "use EARS workflow"', 'yellow');
        log('2. Read documentation: .ai/docs/guides/installation.md', 'yellow');
        log('3. Try examples: .ai/docs/guides/usage.md', 'yellow');
        return true;
    } else {
        log('\n❌ Installation verification failed!', 'red');
        log('Please check the installation guide: .ai/docs/guides/installation.md', 'yellow');
        return false;
    }
}

if (require.main === module) {
    const success = verifyInstallation();
    process.exit(success ? 0 : 1);
}

module.exports = { verifyInstallation };
