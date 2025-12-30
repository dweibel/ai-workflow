#!/usr/bin/env node
/**
 * Skills Synchronization Script
 * 
 * This script synchronizes skills from the main .ai/skills directory to 
 * cross-platform locations for IDE compatibility:
 * - .github/skills/ (VS Code/GitHub Copilot)
 * 
 * Usage:
 *   node sync-skills.js [options]
 *   
 * Options:
 *   --dry-run        Show what would be synced without making changes
 *   --target <name>  Sync to specific target (github|all) (default: all)
 *   --clean          Remove existing files before sync
 *   --verbose        Show detailed output
 * 
 * Examples:
 *   node sync-skills.js --dry-run
 *   node sync-skills.js --target github
 *   node sync-skills.js --clean --verbose
 */

const fs = require('fs');
const path = require('path');

// Color output functions
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function colorize(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

function printSuccess(message) {
    console.log(colorize(`✓ ${message}`, 'green'));
}

function printError(message) {
    console.log(colorize(`✗ ${message}`, 'red'));
}

function printWarning(message) {
    console.log(colorize(`⚠ ${message}`, 'yellow'));
}

function printInfo(message) {
    console.log(colorize(`ℹ ${message}`, 'cyan'));
}

class SkillsSyncer {
    constructor(options = {}) {
        this.options = {
            dryRun: options.dryRun || false,
            target: options.target || 'all',
            clean: options.clean || false,
            verbose: options.verbose || false
        };
        
        this.sourceDir = '.ai/skills';
        this.targets = {
            github: '.github/skills'
        };
        
        this.stats = {
            copied: 0,
            skipped: 0,
            errors: 0
        };
    }

    async sync() {
        printInfo('Starting skills synchronization...');
        
        if (this.options.dryRun) {
            printWarning('DRY RUN MODE - No files will be modified');
        }
        
        // Validate source directory exists
        if (!fs.existsSync(this.sourceDir)) {
            printError(`Source directory not found: ${this.sourceDir}`);
            return false;
        }
        
        // Get list of skills to sync
        const skills = this.getSkillDirectories();
        if (skills.length === 0) {
            printWarning('No skills found to sync');
            return true;
        }
        
        printInfo(`Found ${skills.length} skills to sync: ${skills.join(', ')}`);
        
        // Determine targets to sync
        const targetsToSync = this.options.target === 'all' 
            ? Object.keys(this.targets)
            : [this.options.target];
        
        // Sync to each target
        for (const targetName of targetsToSync) {
            if (!this.targets[targetName]) {
                printError(`Unknown target: ${targetName}`);
                continue;
            }
            
            await this.syncToTarget(targetName, skills);
        }
        
        this.printSummary();
        return this.stats.errors === 0;
    }

    getSkillDirectories() {
        const skills = [];
        
        try {
            const items = fs.readdirSync(this.sourceDir);
            for (const item of items) {
                const skillPath = path.join(this.sourceDir, item);
                const stat = fs.statSync(skillPath);
                
                if (stat.isDirectory() && !item.startsWith('.') && !item.startsWith('_')) {
                    // Check if it has a SKILL.md file
                    const skillFile = path.join(skillPath, 'SKILL.md');
                    if (fs.existsSync(skillFile)) {
                        skills.push(item);
                    } else if (this.options.verbose) {
                        printWarning(`Skipping ${item} - no SKILL.md found`);
                    }
                }
            }
        } catch (error) {
            printError(`Failed to read source directory: ${error.message}`);
        }
        
        return skills;
    }

    async syncToTarget(targetName, skills) {
        const targetDir = this.targets[targetName];
        
        printInfo(`Syncing to ${targetName} (${targetDir})...`);
        
        // Create target directory if it doesn't exist
        if (!this.options.dryRun) {
            try {
                fs.mkdirSync(targetDir, { recursive: true });
            } catch (error) {
                printError(`Failed to create target directory ${targetDir}: ${error.message}`);
                this.stats.errors++;
                return;
            }
        }
        
        // Clean target directory if requested
        if (this.options.clean) {
            await this.cleanTarget(targetDir);
        }
        
        // Sync each skill
        for (const skill of skills) {
            await this.syncSkill(skill, targetDir);
        }
    }

    async cleanTarget(targetDir) {
        if (this.options.dryRun) {
            printInfo(`Would clean target directory: ${targetDir}`);
            return;
        }
        
        try {
            if (fs.existsSync(targetDir)) {
                const items = fs.readdirSync(targetDir);
                for (const item of items) {
                    const itemPath = path.join(targetDir, item);
                    fs.rmSync(itemPath, { recursive: true, force: true });
                }
                if (this.options.verbose) {
                    printInfo(`Cleaned target directory: ${targetDir}`);
                }
            }
        } catch (error) {
            printError(`Failed to clean target directory ${targetDir}: ${error.message}`);
            this.stats.errors++;
        }
    }

    async syncSkill(skillName, targetDir) {
        const sourceSkillDir = path.join(this.sourceDir, skillName);
        const targetSkillDir = path.join(targetDir, skillName);
        
        if (this.options.verbose) {
            printInfo(`Syncing skill: ${skillName}`);
        }
        
        try {
            if (this.options.dryRun) {
                printInfo(`Would copy: ${sourceSkillDir} → ${targetSkillDir}`);
                this.stats.copied++;
                return;
            }
            
            // Create target skill directory
            fs.mkdirSync(targetSkillDir, { recursive: true });
            
            // Copy skill files
            await this.copyDirectory(sourceSkillDir, targetSkillDir);
            
            this.stats.copied++;
            if (this.options.verbose) {
                printSuccess(`Synced skill: ${skillName}`);
            }
            
        } catch (error) {
            printError(`Failed to sync skill ${skillName}: ${error.message}`);
            this.stats.errors++;
        }
    }

    async copyDirectory(source, target) {
        const items = fs.readdirSync(source);
        
        for (const item of items) {
            const sourcePath = path.join(source, item);
            const targetPath = path.join(target, item);
            const stat = fs.statSync(sourcePath);
            
            if (stat.isDirectory()) {
                fs.mkdirSync(targetPath, { recursive: true });
                await this.copyDirectory(sourcePath, targetPath);
            } else {
                fs.copyFileSync(sourcePath, targetPath);
            }
        }
    }

    printSummary() {
        console.log('\n' + colorize('='.repeat(50), 'cyan'));
        console.log(colorize('SYNC SUMMARY', 'bright'));
        console.log(colorize('='.repeat(50), 'cyan'));
        
        console.log(`Skills copied: ${colorize(this.stats.copied, 'green')}`);
        console.log(`Skills skipped: ${colorize(this.stats.skipped, 'yellow')}`);
        console.log(`Errors: ${colorize(this.stats.errors, this.stats.errors > 0 ? 'red' : 'green')}`);
        
        if (this.stats.errors === 0) {
            printSuccess('Skills synchronization completed successfully!');
        } else {
            printError('Skills synchronization completed with errors');
        }
    }
}

// CLI argument parsing
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {};
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        switch (arg) {
            case '--dry-run':
                options.dryRun = true;
                break;
            case '--target':
                options.target = args[++i];
                break;
            case '--clean':
                options.clean = true;
                break;
            case '--verbose':
                options.verbose = true;
                break;
            case '--help':
                printHelp();
                process.exit(0);
                break;
        }
    }
    
    return options;
}

function printHelp() {
    console.log('Skills Synchronization Script');
    console.log('');
    console.log('Usage: node sync-skills.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --dry-run        Show what would be synced without making changes');
    console.log('  --target <name>  Sync to specific target (github|claude|all) (default: all)');
    console.log('  --clean          Remove existing files before sync');
    console.log('  --verbose        Show detailed output');
    console.log('  --help           Show this help message');
    console.log('');
    console.log('Examples:');
    console.log('  node sync-skills.js --dry-run');
    console.log('  node sync-skills.js --target github');
    console.log('  node sync-skills.js --clean --verbose');
}

// Main execution
async function main() {
    try {
        const options = parseArgs();
        const syncer = new SkillsSyncer(options);
        const success = await syncer.sync();
        process.exit(success ? 0 : 1);
    } catch (error) {
        printError(`Sync failed: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { SkillsSyncer };