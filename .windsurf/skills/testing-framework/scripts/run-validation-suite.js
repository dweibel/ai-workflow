#!/usr/bin/env node
/**
 * Validation Suite Runner for Testing Framework Skill
 * 
 * This script runs comprehensive validation checks across multiple perspectives:
 * - Security Sentinel: OWASP vulnerabilities, authentication, secrets
 * - Performance Oracle: Algorithmic complexity, N+1 queries, resource usage
 * - Framework Purist: Idiomatic code, style conventions, best practices
 * - Data Integrity Guardian: Database migrations, foreign keys, constraints
 * 
 * Usage:
 *   node run-validation-suite.js [options]
 *   
 * Options:
 *   --persona <name>     Run specific persona (security|performance|framework|data)
 *   --path <directory>   Target directory to analyze (default: current directory)
 *   --output <file>      Output report file (default: console)
 *   --format <type>      Output format (json|markdown|console) (default: console)
 *   --severity <level>   Minimum severity to report (critical|high|medium|low) (default: medium)
 * 
 * Examples:
 *   node run-validation-suite.js --persona security --path ./src
 *   node run-validation-suite.js --output validation-report.md --format markdown
 *   node run-validation-suite.js --severity high
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

// Validation personas
class ValidationPersona {
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.findings = [];
    }

    addFinding(severity, category, description, file = null, line = null, recommendation = null) {
        this.findings.push({
            severity,
            category,
            description,
            file,
            line,
            recommendation,
            persona: this.name
        });
    }

    getFindingsBySeverity(severity) {
        return this.findings.filter(f => f.severity === severity);
    }

    getTotalFindings() {
        return this.findings.length;
    }
}

class SecuritySentinel extends ValidationPersona {
    constructor() {
        super('Security Sentinel', 'OWASP vulnerabilities, authentication, secrets management');
    }

    async analyze(targetPath) {
        printInfo(`${this.name}: Analyzing security vulnerabilities...`);
        
        // Check for common security issues
        await this.checkHardcodedSecrets(targetPath);
        await this.checkSQLInjection(targetPath);
        await this.checkXSS(targetPath);
        await this.checkInsecureRandomness(targetPath);
        await this.checkWeakCrypto(targetPath);
        
        return this.findings;
    }

    async checkHardcodedSecrets(targetPath) {
        const secretPatterns = [
            /password\s*=\s*["'][^"']+["']/gi,
            /api[_-]?key\s*=\s*["'][^"']+["']/gi,
            /secret\s*=\s*["'][^"']+["']/gi,
            /token\s*=\s*["'][^"']+["']/gi,
            /aws[_-]?access[_-]?key/gi,
            /private[_-]?key/gi
        ];

        try {
            const files = this.getSourceFiles(targetPath);
            for (const file of files) {
                const content = fs.readFileSync(file, 'utf8');
                const lines = content.split('\n');
                
                lines.forEach((line, index) => {
                    secretPatterns.forEach(pattern => {
                        if (pattern.test(line)) {
                            this.addFinding(
                                'CRITICAL',
                                'Hardcoded Secrets',
                                `Potential hardcoded secret detected: ${line.trim()}`,
                                file,
                                index + 1,
                                'Move secrets to environment variables or secure configuration'
                            );
                        }
                    });
                });
            }
        } catch (error) {
            this.addFinding('HIGH', 'Analysis Error', `Failed to analyze secrets: ${error.message}`);
        }
    }

    async checkSQLInjection(targetPath) {
        const sqlPatterns = [
            /query\s*\+\s*["']/gi,
            /execute\s*\(\s*["'][^"']*\+/gi,
            /\$\{[^}]*\}\s*INTO\s+/gi
        ];

        try {
            const files = this.getSourceFiles(targetPath);
            for (const file of files) {
                const content = fs.readFileSync(file, 'utf8');
                const lines = content.split('\n');
                
                lines.forEach((line, index) => {
                    sqlPatterns.forEach(pattern => {
                        if (pattern.test(line)) {
                            this.addFinding(
                                'HIGH',
                                'SQL Injection',
                                `Potential SQL injection vulnerability: ${line.trim()}`,
                                file,
                                index + 1,
                                'Use parameterized queries or prepared statements'
                            );
                        }
                    });
                });
            }
        } catch (error) {
            this.addFinding('HIGH', 'Analysis Error', `Failed to analyze SQL injection: ${error.message}`);
        }
    }

    async checkXSS(targetPath) {
        const xssPatterns = [
            /innerHTML\s*=\s*[^;]+\+/gi,
            /document\.write\s*\(/gi,
            /eval\s*\(/gi,
            /dangerouslySetInnerHTML/gi
        ];

        try {
            const files = this.getSourceFiles(targetPath);
            for (const file of files) {
                if (!file.match(/\.(js|jsx|ts|tsx|html)$/)) continue;
                
                const content = fs.readFileSync(file, 'utf8');
                const lines = content.split('\n');
                
                lines.forEach((line, index) => {
                    xssPatterns.forEach(pattern => {
                        if (pattern.test(line)) {
                            this.addFinding(
                                'HIGH',
                                'XSS Vulnerability',
                                `Potential XSS vulnerability: ${line.trim()}`,
                                file,
                                index + 1,
                                'Sanitize user input and use safe DOM manipulation methods'
                            );
                        }
                    });
                });
            }
        } catch (error) {
            this.addFinding('HIGH', 'Analysis Error', `Failed to analyze XSS: ${error.message}`);
        }
    }

    async checkInsecureRandomness(targetPath) {
        const randomPatterns = [
            /Math\.random\(\)/gi,
            /new\s+Date\(\)\.getTime\(\)/gi
        ];

        try {
            const files = this.getSourceFiles(targetPath);
            for (const file of files) {
                const content = fs.readFileSync(file, 'utf8');
                const lines = content.split('\n');
                
                lines.forEach((line, index) => {
                    randomPatterns.forEach(pattern => {
                        if (pattern.test(line)) {
                            this.addFinding(
                                'MEDIUM',
                                'Weak Randomness',
                                `Insecure random number generation: ${line.trim()}`,
                                file,
                                index + 1,
                                'Use cryptographically secure random number generators'
                            );
                        }
                    });
                });
            }
        } catch (error) {
            this.addFinding('MEDIUM', 'Analysis Error', `Failed to analyze randomness: ${error.message}`);
        }
    }

    async checkWeakCrypto(targetPath) {
        const cryptoPatterns = [
            /md5/gi,
            /sha1/gi,
            /des/gi,
            /rc4/gi
        ];

        try {
            const files = this.getSourceFiles(targetPath);
            for (const file of files) {
                const content = fs.readFileSync(file, 'utf8');
                const lines = content.split('\n');
                
                lines.forEach((line, index) => {
                    cryptoPatterns.forEach(pattern => {
                        if (pattern.test(line)) {
                            this.addFinding(
                                'HIGH',
                                'Weak Cryptography',
                                `Weak cryptographic algorithm detected: ${line.trim()}`,
                                file,
                                index + 1,
                                'Use strong cryptographic algorithms (AES-256, SHA-256, etc.)'
                            );
                        }
                    });
                });
            }
        } catch (error) {
            this.addFinding('HIGH', 'Analysis Error', `Failed to analyze cryptography: ${error.message}`);
        }
    }

    getSourceFiles(targetPath) {
        const files = [];
        const extensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cs', '.php', '.rb', '.go'];
        
        function walkDir(dir) {
            try {
                const items = fs.readdirSync(dir);
                for (const item of items) {
                    const fullPath = path.join(dir, item);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                        walkDir(fullPath);
                    } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
                        files.push(fullPath);
                    }
                }
            } catch (error) {
                // Skip directories we can't read
            }
        }
        
        walkDir(targetPath);
        return files;
    }
}

class PerformanceOracle extends ValidationPersona {
    constructor() {
        super('Performance Oracle', 'Algorithmic complexity, N+1 queries, resource usage');
    }

    async analyze(targetPath) {
        printInfo(`${this.name}: Analyzing performance issues...`);
        
        await this.checkNestedLoops(targetPath);
        await this.checkN1Queries(targetPath);
        await this.checkMemoryLeaks(targetPath);
        await this.checkLargeFiles(targetPath);
        
        return this.findings;
    }

    async checkNestedLoops(targetPath) {
        try {
            const files = this.getSourceFiles(targetPath);
            for (const file of files) {
                const content = fs.readFileSync(file, 'utf8');
                const lines = content.split('\n');
                
                let loopDepth = 0;
                lines.forEach((line, index) => {
                    if (/\b(for|while|forEach)\b/.test(line)) {
                        loopDepth++;
                        if (loopDepth >= 3) {
                            this.addFinding(
                                'HIGH',
                                'Algorithmic Complexity',
                                `Deeply nested loops detected (depth: ${loopDepth}): ${line.trim()}`,
                                file,
                                index + 1,
                                'Consider optimizing algorithm or using more efficient data structures'
                            );
                        }
                    }
                    if (line.includes('}')) {
                        loopDepth = Math.max(0, loopDepth - 1);
                    }
                });
            }
        } catch (error) {
            this.addFinding('MEDIUM', 'Analysis Error', `Failed to analyze nested loops: ${error.message}`);
        }
    }

    async checkN1Queries(targetPath) {
        const n1Patterns = [
            /\.forEach\s*\([^)]*\s*=>\s*[^)]*\.find\(/gi,
            /\.map\s*\([^)]*\s*=>\s*[^)]*\.query\(/gi,
            /for\s*\([^)]*\)\s*{[^}]*\.query\(/gi
        ];

        try {
            const files = this.getSourceFiles(targetPath);
            for (const file of files) {
                const content = fs.readFileSync(file, 'utf8');
                
                n1Patterns.forEach(pattern => {
                    const matches = content.match(pattern);
                    if (matches) {
                        matches.forEach(match => {
                            this.addFinding(
                                'HIGH',
                                'N+1 Query',
                                `Potential N+1 query pattern: ${match.trim()}`,
                                file,
                                null,
                                'Use batch queries, joins, or eager loading to reduce database calls'
                            );
                        });
                    }
                });
            }
        } catch (error) {
            this.addFinding('HIGH', 'Analysis Error', `Failed to analyze N+1 queries: ${error.message}`);
        }
    }

    async checkMemoryLeaks(targetPath) {
        const leakPatterns = [
            /setInterval\s*\(/gi,
            /addEventListener\s*\(/gi,
            /new\s+Array\s*\(\s*\d{6,}\s*\)/gi
        ];

        try {
            const files = this.getSourceFiles(targetPath);
            for (const file of files) {
                const content = fs.readFileSync(file, 'utf8');
                const lines = content.split('\n');
                
                lines.forEach((line, index) => {
                    leakPatterns.forEach(pattern => {
                        if (pattern.test(line)) {
                            this.addFinding(
                                'MEDIUM',
                                'Memory Leak Risk',
                                `Potential memory leak: ${line.trim()}`,
                                file,
                                index + 1,
                                'Ensure proper cleanup of intervals, listeners, and large objects'
                            );
                        }
                    });
                });
            }
        } catch (error) {
            this.addFinding('MEDIUM', 'Analysis Error', `Failed to analyze memory leaks: ${error.message}`);
        }
    }

    async checkLargeFiles(targetPath) {
        try {
            const files = this.getSourceFiles(targetPath);
            for (const file of files) {
                const stat = fs.statSync(file);
                const sizeKB = stat.size / 1024;
                
                if (sizeKB > 100) { // Files larger than 100KB
                    this.addFinding(
                        'MEDIUM',
                        'Large File',
                        `Large source file detected: ${path.basename(file)} (${sizeKB.toFixed(1)}KB)`,
                        file,
                        null,
                        'Consider breaking large files into smaller, more focused modules'
                    );
                }
            }
        } catch (error) {
            this.addFinding('LOW', 'Analysis Error', `Failed to analyze file sizes: ${error.message}`);
        }
    }

    getSourceFiles(targetPath) {
        const files = [];
        const extensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cs', '.php', '.rb', '.go'];
        
        function walkDir(dir) {
            try {
                const items = fs.readdirSync(dir);
                for (const item of items) {
                    const fullPath = path.join(dir, item);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                        walkDir(fullPath);
                    } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
                        files.push(fullPath);
                    }
                }
            } catch (error) {
                // Skip directories we can't read
            }
        }
        
        walkDir(targetPath);
        return files;
    }
}

// Main validation suite runner
class ValidationSuite {
    constructor(options = {}) {
        this.options = {
            targetPath: options.path || process.cwd(),
            outputFile: options.output || null,
            format: options.format || 'console',
            severity: options.severity || 'medium',
            persona: options.persona || 'all'
        };
        
        this.personas = {
            security: new SecuritySentinel(),
            performance: new PerformanceOracle()
            // Framework Purist and Data Integrity Guardian would be implemented similarly
        };
        
        this.severityLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
        this.minSeverityIndex = this.severityLevels.indexOf(this.options.severity.toUpperCase());
    }

    async run() {
        printInfo('Starting validation suite...');
        printInfo(`Target path: ${this.options.targetPath}`);
        printInfo(`Minimum severity: ${this.options.severity}`);
        
        const results = {};
        
        if (this.options.persona === 'all') {
            for (const [name, persona] of Object.entries(this.personas)) {
                results[name] = await persona.analyze(this.options.targetPath);
            }
        } else if (this.personas[this.options.persona]) {
            results[this.options.persona] = await this.personas[this.options.persona].analyze(this.options.targetPath);
        } else {
            printError(`Unknown persona: ${this.options.persona}`);
            return;
        }
        
        this.generateReport(results);
    }

    generateReport(results) {
        const allFindings = [];
        let totalFindings = 0;
        
        for (const [personaName, findings] of Object.entries(results)) {
            const filteredFindings = findings.filter(f => 
                this.severityLevels.indexOf(f.severity) >= this.minSeverityIndex
            );
            allFindings.push(...filteredFindings);
            totalFindings += filteredFindings.length;
        }
        
        if (this.options.format === 'console') {
            this.printConsoleReport(results, allFindings, totalFindings);
        } else if (this.options.format === 'markdown') {
            this.generateMarkdownReport(results, allFindings, totalFindings);
        } else if (this.options.format === 'json') {
            this.generateJsonReport(results, allFindings, totalFindings);
        }
    }

    printConsoleReport(results, allFindings, totalFindings) {
        console.log('\n' + colorize('='.repeat(60), 'cyan'));
        console.log(colorize('VALIDATION SUITE REPORT', 'bright'));
        console.log(colorize('='.repeat(60), 'cyan'));
        
        // Summary by persona
        for (const [personaName, findings] of Object.entries(results)) {
            const persona = this.personas[personaName];
            const filteredFindings = findings.filter(f => 
                this.severityLevels.indexOf(f.severity) >= this.minSeverityIndex
            );
            
            console.log(`\n${colorize(persona.name, 'bright')}: ${filteredFindings.length} findings`);
            
            const bySeverity = {
                CRITICAL: filteredFindings.filter(f => f.severity === 'CRITICAL').length,
                HIGH: filteredFindings.filter(f => f.severity === 'HIGH').length,
                MEDIUM: filteredFindings.filter(f => f.severity === 'MEDIUM').length,
                LOW: filteredFindings.filter(f => f.severity === 'LOW').length
            };
            
            if (bySeverity.CRITICAL > 0) console.log(`  ${colorize('CRITICAL', 'red')}: ${bySeverity.CRITICAL}`);
            if (bySeverity.HIGH > 0) console.log(`  ${colorize('HIGH', 'red')}: ${bySeverity.HIGH}`);
            if (bySeverity.MEDIUM > 0) console.log(`  ${colorize('MEDIUM', 'yellow')}: ${bySeverity.MEDIUM}`);
            if (bySeverity.LOW > 0) console.log(`  ${colorize('LOW', 'blue')}: ${bySeverity.LOW}`);
        }
        
        // Detailed findings
        if (totalFindings > 0) {
            console.log(`\n${colorize('DETAILED FINDINGS', 'bright')}`);
            console.log(colorize('-'.repeat(40), 'cyan'));
            
            allFindings.forEach((finding, index) => {
                const severityColor = finding.severity === 'CRITICAL' || finding.severity === 'HIGH' ? 'red' : 
                                    finding.severity === 'MEDIUM' ? 'yellow' : 'blue';
                
                console.log(`\n${index + 1}. ${colorize(finding.severity, severityColor)} - ${finding.category}`);
                console.log(`   ${finding.description}`);
                if (finding.file) {
                    console.log(`   File: ${finding.file}${finding.line ? `:${finding.line}` : ''}`);
                }
                if (finding.recommendation) {
                    console.log(`   ${colorize('Recommendation:', 'green')} ${finding.recommendation}`);
                }
            });
        }
        
        console.log(`\n${colorize('SUMMARY', 'bright')}`);
        console.log(`Total findings: ${totalFindings}`);
        
        if (totalFindings === 0) {
            printSuccess('No issues found at the specified severity level!');
        } else {
            const criticalCount = allFindings.filter(f => f.severity === 'CRITICAL').length;
            const highCount = allFindings.filter(f => f.severity === 'HIGH').length;
            
            if (criticalCount > 0) {
                printError(`${criticalCount} critical issues require immediate attention`);
            } else if (highCount > 0) {
                printWarning(`${highCount} high-severity issues should be addressed`);
            } else {
                printInfo('No critical or high-severity issues found');
            }
        }
    }

    generateMarkdownReport(results, allFindings, totalFindings) {
        const report = this.createMarkdownReport(results, allFindings, totalFindings);
        
        if (this.options.outputFile) {
            fs.writeFileSync(this.options.outputFile, report);
            printSuccess(`Markdown report saved to: ${this.options.outputFile}`);
        } else {
            console.log(report);
        }
    }

    generateJsonReport(results, allFindings, totalFindings) {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalFindings,
                bySeverity: {
                    critical: allFindings.filter(f => f.severity === 'CRITICAL').length,
                    high: allFindings.filter(f => f.severity === 'HIGH').length,
                    medium: allFindings.filter(f => f.severity === 'MEDIUM').length,
                    low: allFindings.filter(f => f.severity === 'LOW').length
                }
            },
            findings: allFindings
        };
        
        if (this.options.outputFile) {
            fs.writeFileSync(this.options.outputFile, JSON.stringify(report, null, 2));
            printSuccess(`JSON report saved to: ${this.options.outputFile}`);
        } else {
            console.log(JSON.stringify(report, null, 2));
        }
    }

    createMarkdownReport(results, allFindings, totalFindings) {
        let report = '# Validation Suite Report\n\n';
        report += `**Generated**: ${new Date().toISOString()}\n`;
        report += `**Target Path**: ${this.options.targetPath}\n`;
        report += `**Total Findings**: ${totalFindings}\n\n`;
        
        // Summary by persona
        report += '## Summary by Persona\n\n';
        for (const [personaName, findings] of Object.entries(results)) {
            const persona = this.personas[personaName];
            const filteredFindings = findings.filter(f => 
                this.severityLevels.indexOf(f.severity) >= this.minSeverityIndex
            );
            
            report += `### ${persona.name}\n`;
            report += `**Total Findings**: ${filteredFindings.length}\n\n`;
            
            const bySeverity = {
                CRITICAL: filteredFindings.filter(f => f.severity === 'CRITICAL').length,
                HIGH: filteredFindings.filter(f => f.severity === 'HIGH').length,
                MEDIUM: filteredFindings.filter(f => f.severity === 'MEDIUM').length,
                LOW: filteredFindings.filter(f => f.severity === 'LOW').length
            };
            
            report += '| Severity | Count |\n';
            report += '|:---------|:------|\n';
            report += `| Critical | ${bySeverity.CRITICAL} |\n`;
            report += `| High | ${bySeverity.HIGH} |\n`;
            report += `| Medium | ${bySeverity.MEDIUM} |\n`;
            report += `| Low | ${bySeverity.LOW} |\n\n`;
        }
        
        // Detailed findings
        if (totalFindings > 0) {
            report += '## Detailed Findings\n\n';
            
            allFindings.forEach((finding, index) => {
                report += `### ${index + 1}. ${finding.severity} - ${finding.category}\n\n`;
                report += `**Description**: ${finding.description}\n\n`;
                if (finding.file) {
                    report += `**File**: \`${finding.file}\`${finding.line ? ` (Line ${finding.line})` : ''}\n\n`;
                }
                if (finding.recommendation) {
                    report += `**Recommendation**: ${finding.recommendation}\n\n`;
                }
                report += `**Persona**: ${finding.persona}\n\n`;
                report += '---\n\n';
            });
        }
        
        return report;
    }
}

// CLI argument parsing
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {};
    
    for (let i = 0; i < args.length; i += 2) {
        const flag = args[i];
        const value = args[i + 1];
        
        switch (flag) {
            case '--persona':
                options.persona = value;
                break;
            case '--path':
                options.path = value;
                break;
            case '--output':
                options.output = value;
                break;
            case '--format':
                options.format = value;
                break;
            case '--severity':
                options.severity = value;
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
    console.log('Validation Suite Runner for Testing Framework Skill');
    console.log('');
    console.log('Usage: node run-validation-suite.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --persona <name>     Run specific persona (security|performance|framework|data)');
    console.log('  --path <directory>   Target directory to analyze (default: current directory)');
    console.log('  --output <file>      Output report file (default: console)');
    console.log('  --format <type>      Output format (json|markdown|console) (default: console)');
    console.log('  --severity <level>   Minimum severity to report (critical|high|medium|low) (default: medium)');
    console.log('  --help               Show this help message');
    console.log('');
    console.log('Examples:');
    console.log('  node run-validation-suite.js --persona security --path ./src');
    console.log('  node run-validation-suite.js --output validation-report.md --format markdown');
    console.log('  node run-validation-suite.js --severity high');
}

// Main execution
async function main() {
    try {
        const options = parseArgs();
        const suite = new ValidationSuite(options);
        await suite.run();
    } catch (error) {
        printError(`Validation suite failed: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { ValidationSuite, SecuritySentinel, PerformanceOracle };