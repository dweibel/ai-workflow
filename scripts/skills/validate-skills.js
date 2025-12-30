#!/usr/bin/env node
/**
 * Skills Validation Script
 * 
 * This script validates SKILL.md files for compliance with the Agent Skills standard:
 * - YAML frontmatter validation
 * - Required fields presence
 * - Format compliance
 * - Cross-references validation
 * 
 * Usage:
 *   node validate-skills.js [options]
 *   
 * Options:
 *   --path <directory>   Skills directory to validate (default: .ai/skills)
 *   --skill <name>       Validate specific skill only
 *   --format <type>      Output format (console|json|markdown) (default: console)
 *   --output <file>      Output file (default: console)
 *   --strict             Enable strict validation mode
 * 
 * Examples:
 *   node validate-skills.js
 *   node validate-skills.js --skill compound-engineering
 *   node validate-skills.js --format json --output validation-report.json
 */

const fs = require('fs');
const path = require('path');

// Simple YAML parser for frontmatter (basic implementation)
function parseYaml(yamlString) {
    const lines = yamlString.trim().split('\n');
    const result = {};
    let currentKey = null;
    let currentValue = '';
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;
        
        // Check for key: value pattern
        const match = trimmedLine.match(/^(\w+):\s*(.*)$/);
        if (match) {
            // Save previous key-value if exists
            if (currentKey) {
                result[currentKey] = currentValue.trim();
            }
            
            const [, key, value] = match;
            currentKey = key;
            currentValue = value;
            
            // Remove quotes if present and it's a complete value
            if (currentValue && (currentValue.startsWith('"') && currentValue.endsWith('"') || 
                                currentValue.startsWith("'") && currentValue.endsWith("'"))) {
                currentValue = currentValue.slice(1, -1);
            }
        } else if (currentKey) {
            // This is a continuation of the previous value
            currentValue += ' ' + trimmedLine;
        }
    }
    
    // Save the last key-value pair
    if (currentKey) {
        result[currentKey] = currentValue.trim();
    }
    
    return result;
}

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

class SkillValidator {
    constructor(options = {}) {
        this.options = {
            skillsPath: options.path || '.ai/skills',
            skillName: options.skill || null,
            format: options.format || 'console',
            outputFile: options.output || null,
            strict: options.strict || false
        };
        
        this.requiredFields = ['name', 'description'];
        this.optionalFields = ['version', 'author', 'phase', 'dependencies'];
        this.validationResults = [];
    }

    async validate() {
        printInfo('Starting skills validation...');
        
        if (!fs.existsSync(this.options.skillsPath)) {
            printError(`Skills directory not found: ${this.options.skillsPath}`);
            return false;
        }
        
        const skillsToValidate = this.getSkillsToValidate();
        if (skillsToValidate.length === 0) {
            printWarning('No skills found to validate');
            return true;
        }
        
        printInfo(`Validating ${skillsToValidate.length} skills...`);
        
        for (const skillName of skillsToValidate) {
            await this.validateSkill(skillName);
        }
        
        this.generateReport();
        return this.validationResults.every(result => result.valid);
    }

    getSkillsToValidate() {
        if (this.options.skillName) {
            const skillPath = path.join(this.options.skillsPath, this.options.skillName);
            if (fs.existsSync(skillPath) && fs.statSync(skillPath).isDirectory()) {
                return [this.options.skillName];
            } else {
                printError(`Skill not found: ${this.options.skillName}`);
                return [];
            }
        }
        
        const skills = [];
        try {
            const items = fs.readdirSync(this.options.skillsPath);
            for (const item of items) {
                const skillPath = path.join(this.options.skillsPath, item);
                const stat = fs.statSync(skillPath);
                
                if (stat.isDirectory() && !item.startsWith('.') && !item.startsWith('_') && item !== 'shared') {
                    skills.push(item);
                }
            }
        } catch (error) {
            printError(`Failed to read skills directory: ${error.message}`);
        }
        
        return skills;
    }

    async validateSkill(skillName) {
        const skillPath = path.join(this.options.skillsPath, skillName);
        const skillFile = path.join(skillPath, 'SKILL.md');
        
        const result = {
            skill: skillName,
            path: skillPath,
            valid: true,
            errors: [],
            warnings: [],
            info: []
        };
        
        // Check if SKILL.md exists
        if (!fs.existsSync(skillFile)) {
            result.valid = false;
            result.errors.push('SKILL.md file not found');
            this.validationResults.push(result);
            return;
        }
        
        try {
            const content = fs.readFileSync(skillFile, 'utf8');
            await this.validateSkillContent(content, result);
            await this.validateSkillStructure(skillPath, result);
        } catch (error) {
            result.valid = false;
            result.errors.push(`Failed to read SKILL.md: ${error.message}`);
        }
        
        this.validationResults.push(result);
    }

    async validateSkillContent(content, result) {
        // Extract YAML frontmatter
        const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        if (!frontmatterMatch) {
            result.valid = false;
            result.errors.push('No YAML frontmatter found');
            return;
        }
        
        let frontmatter;
        try {
            frontmatter = parseYaml(frontmatterMatch[1]);
        } catch (error) {
            result.valid = false;
            result.errors.push(`Invalid YAML frontmatter: ${error.message}`);
            return;
        }
        
        // Validate required fields
        for (const field of this.requiredFields) {
            if (!frontmatter[field]) {
                result.valid = false;
                result.errors.push(`Missing required field: ${field}`);
            } else if (typeof frontmatter[field] !== 'string' || frontmatter[field].trim() === '') {
                result.valid = false;
                result.errors.push(`Field '${field}' must be a non-empty string`);
            }
        }
        
        // Validate field formats
        if (frontmatter.name) {
            if (!/^[a-z0-9-]+$/.test(frontmatter.name)) {
                result.valid = false;
                result.errors.push('Name must be kebab-case (lowercase letters, numbers, hyphens only)');
            }
            
            if (frontmatter.name !== result.skill) {
                result.warnings.push(`Name '${frontmatter.name}' does not match directory name '${result.skill}'`);
            }
        }
        
        if (frontmatter.version) {
            if (!/^\d+\.\d+\.\d+$/.test(frontmatter.version)) {
                result.warnings.push('Version should follow semantic versioning (e.g., 1.0.0)');
            }
        }
        
        if (frontmatter.description) {
            if (frontmatter.description.length < 20) {
                result.warnings.push('Description is quite short - consider adding more detail for better semantic routing');
            }
            
            if (frontmatter.description.length > 500) {
                result.warnings.push('Description is very long - consider shortening for better token efficiency');
            }
            
            if (!frontmatter.description.toLowerCase().includes('use this skill when')) {
                result.warnings.push('Consider adding "Use this skill when..." pattern to description for better activation routing');
            }
        }
        
        // Validate content structure
        const markdownContent = content.substring(frontmatterMatch[0].length);
        
        if (!markdownContent.includes('# ')) {
            result.warnings.push('No main heading found in content');
        }
        
        if (!markdownContent.includes('## Overview')) {
            result.warnings.push('No Overview section found - consider adding for better documentation');
        }
        
        // Check for common sections
        const recommendedSections = [
            'Overview',
            'Usage',
            'Examples',
            'Integration',
            'Error Handling'
        ];
        
        for (const section of recommendedSections) {
            if (!markdownContent.includes(`## ${section}`) && !markdownContent.includes(`### ${section}`)) {
                result.info.push(`Consider adding ${section} section for better documentation`);
            }
        }
        
        result.frontmatter = frontmatter;
        result.contentLength = markdownContent.length;
    }

    async validateSkillStructure(skillPath, result) {
        const items = fs.readdirSync(skillPath);
        
        // Check for recommended directories
        const recommendedDirs = ['scripts', 'templates', 'references'];
        for (const dir of recommendedDirs) {
            if (items.includes(dir)) {
                const dirPath = path.join(skillPath, dir);
                if (fs.statSync(dirPath).isDirectory()) {
                    result.info.push(`Found ${dir} directory`);
                    
                    // Check if directory has content
                    const dirItems = fs.readdirSync(dirPath);
                    if (dirItems.length === 0) {
                        result.warnings.push(`${dir} directory is empty`);
                    }
                }
            }
        }
        
        // Check for executable scripts
        if (items.includes('scripts')) {
            const scriptsPath = path.join(skillPath, 'scripts');
            const scriptFiles = fs.readdirSync(scriptsPath);
            
            for (const scriptFile of scriptFiles) {
                const scriptPath = path.join(scriptsPath, scriptFile);
                const stat = fs.statSync(scriptPath);
                
                if (stat.isFile() && (scriptFile.endsWith('.sh') || scriptFile.endsWith('.js'))) {
                    // Check if script is executable (Unix-like systems)
                    if (process.platform !== 'win32') {
                        if (!(stat.mode & parseInt('111', 8))) {
                            result.warnings.push(`Script ${scriptFile} is not executable`);
                        }
                    }
                }
            }
        }
        
        // Check for README files
        const readmeFiles = items.filter(item => item.toLowerCase().startsWith('readme'));
        if (readmeFiles.length === 0) {
            result.info.push('Consider adding a README.md file for detailed documentation');
        }
        
        result.structure = {
            files: items.filter(item => fs.statSync(path.join(skillPath, item)).isFile()),
            directories: items.filter(item => fs.statSync(path.join(skillPath, item)).isDirectory())
        };
    }

    generateReport() {
        if (this.options.format === 'console') {
            this.printConsoleReport();
        } else if (this.options.format === 'json') {
            this.generateJsonReport();
        } else if (this.options.format === 'markdown') {
            this.generateMarkdownReport();
        }
    }

    printConsoleReport() {
        console.log('\n' + colorize('='.repeat(60), 'cyan'));
        console.log(colorize('SKILLS VALIDATION REPORT', 'bright'));
        console.log(colorize('='.repeat(60), 'cyan'));
        
        const totalSkills = this.validationResults.length;
        const validSkills = this.validationResults.filter(r => r.valid).length;
        const invalidSkills = totalSkills - validSkills;
        
        console.log(`\nTotal skills: ${totalSkills}`);
        console.log(`Valid skills: ${colorize(validSkills, 'green')}`);
        console.log(`Invalid skills: ${colorize(invalidSkills, invalidSkills > 0 ? 'red' : 'green')}`);
        
        for (const result of this.validationResults) {
            console.log(`\n${colorize('─'.repeat(40), 'cyan')}`);
            console.log(`${colorize('Skill:', 'bright')} ${result.skill}`);
            console.log(`${colorize('Status:', 'bright')} ${result.valid ? colorize('VALID', 'green') : colorize('INVALID', 'red')}`);
            
            if (result.frontmatter) {
                console.log(`${colorize('Name:', 'bright')} ${result.frontmatter.name || 'N/A'}`);
                console.log(`${colorize('Version:', 'bright')} ${result.frontmatter.version || 'N/A'}`);
                console.log(`${colorize('Description:', 'bright')} ${result.frontmatter.description ? result.frontmatter.description.substring(0, 100) + '...' : 'N/A'}`);
            }
            
            if (result.errors.length > 0) {
                console.log(`${colorize('Errors:', 'red')}`);
                for (const error of result.errors) {
                    console.log(`  ${colorize('✗', 'red')} ${error}`);
                }
            }
            
            if (result.warnings.length > 0) {
                console.log(`${colorize('Warnings:', 'yellow')}`);
                for (const warning of result.warnings) {
                    console.log(`  ${colorize('⚠', 'yellow')} ${warning}`);
                }
            }
            
            if (this.options.strict && result.info.length > 0) {
                console.log(`${colorize('Info:', 'blue')}`);
                for (const info of result.info) {
                    console.log(`  ${colorize('ℹ', 'blue')} ${info}`);
                }
            }
        }
        
        console.log(`\n${colorize('SUMMARY', 'bright')}`);
        if (invalidSkills === 0) {
            printSuccess('All skills are valid!');
        } else {
            printError(`${invalidSkills} skill(s) have validation errors`);
        }
    }

    generateJsonReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total: this.validationResults.length,
                valid: this.validationResults.filter(r => r.valid).length,
                invalid: this.validationResults.filter(r => !r.valid).length
            },
            results: this.validationResults
        };
        
        const output = JSON.stringify(report, null, 2);
        
        if (this.options.outputFile) {
            fs.writeFileSync(this.options.outputFile, output);
            printSuccess(`JSON report saved to: ${this.options.outputFile}`);
        } else {
            console.log(output);
        }
    }

    generateMarkdownReport() {
        let report = '# Skills Validation Report\n\n';
        report += `**Generated**: ${new Date().toISOString()}\n`;
        report += `**Total Skills**: ${this.validationResults.length}\n`;
        report += `**Valid Skills**: ${this.validationResults.filter(r => r.valid).length}\n`;
        report += `**Invalid Skills**: ${this.validationResults.filter(r => !r.valid).length}\n\n`;
        
        report += '## Summary\n\n';
        report += '| Skill | Status | Errors | Warnings |\n';
        report += '|:------|:-------|:-------|:---------|\n';
        
        for (const result of this.validationResults) {
            const status = result.valid ? '✅ Valid' : '❌ Invalid';
            report += `| ${result.skill} | ${status} | ${result.errors.length} | ${result.warnings.length} |\n`;
        }
        
        report += '\n## Detailed Results\n\n';
        
        for (const result of this.validationResults) {
            report += `### ${result.skill}\n\n`;
            report += `**Status**: ${result.valid ? '✅ Valid' : '❌ Invalid'}\n\n`;
            
            if (result.frontmatter) {
                report += `**Name**: ${result.frontmatter.name || 'N/A'}\n`;
                report += `**Version**: ${result.frontmatter.version || 'N/A'}\n`;
                report += `**Description**: ${result.frontmatter.description || 'N/A'}\n\n`;
            }
            
            if (result.errors.length > 0) {
                report += '**Errors**:\n';
                for (const error of result.errors) {
                    report += `- ❌ ${error}\n`;
                }
                report += '\n';
            }
            
            if (result.warnings.length > 0) {
                report += '**Warnings**:\n';
                for (const warning of result.warnings) {
                    report += `- ⚠️ ${warning}\n`;
                }
                report += '\n';
            }
            
            if (result.info.length > 0) {
                report += '**Recommendations**:\n';
                for (const info of result.info) {
                    report += `- ℹ️ ${info}\n`;
                }
                report += '\n';
            }
            
            report += '---\n\n';
        }
        
        if (this.options.outputFile) {
            fs.writeFileSync(this.options.outputFile, report);
            printSuccess(`Markdown report saved to: ${this.options.outputFile}`);
        } else {
            console.log(report);
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
            case '--path':
                options.path = args[++i];
                break;
            case '--skill':
                options.skill = args[++i];
                break;
            case '--format':
                options.format = args[++i];
                break;
            case '--output':
                options.output = args[++i];
                break;
            case '--strict':
                options.strict = true;
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
    console.log('Skills Validation Script');
    console.log('');
    console.log('Usage: node validate-skills.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --path <directory>   Skills directory to validate (default: .ai/skills)');
    console.log('  --skill <name>       Validate specific skill only');
    console.log('  --format <type>      Output format (console|json|markdown) (default: console)');
    console.log('  --output <file>      Output file (default: console)');
    console.log('  --strict             Enable strict validation mode');
    console.log('  --help               Show this help message');
    console.log('');
    console.log('Examples:');
    console.log('  node validate-skills.js');
    console.log('  node validate-skills.js --skill compound-engineering');
    console.log('  node validate-skills.js --format json --output validation-report.json');
}

// Main execution
async function main() {
    try {
        const options = parseArgs();
        const validator = new SkillValidator(options);
        const success = await validator.validate();
        process.exit(success ? 0 : 1);
    } catch (error) {
        printError(`Validation failed: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { SkillValidator };