#!/usr/bin/env node

/**
 * Interactive Context Optimization Engine Testing Tool
 * 
 * Provides interactive CLI for testing and demonstrating the context
 * optimization system with real-time feedback and analysis.
 * 
 * @author Engineering Workflow System
 * @version 1.0.0
 * @date 2025-12-29
 */

const readline = require('readline');
const { ContextOptimizationEngine } = require('../context-optimization-engine');

// ANSI color codes for better output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

class ContextOptimizationDemo {
    constructor() {
        this.engine = new ContextOptimizationEngine();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        this.sessionContext = {
            currentPhase: null,
            recentFiles: [],
            recentActivities: [],
            userPreferences: {}
        };
        
        this.demoScenarios = [
            {
                name: 'High Token Usage Scenario',
                skillName: 'compound-engineering',
                userIntent: 'implement comprehensive authentication system with security audit and performance optimization',
                sessionContext: {
                    currentPhase: 'WORK',
                    recentFiles: ['auth.md', 'security.md', 'performance.md', 'api.md', 'database.md'],
                    recentActivities: ['created requirements', 'designed architecture', 'implemented core features']
                }
            },
            {
                name: 'Error-Driven Context',
                skillName: 'compound-engineering',
                userIntent: 'critical security vulnerability in authentication system needs immediate fix',
                sessionContext: {
                    currentPhase: 'WORK',
                    errorContext: 'Authentication bypass vulnerability detected',
                    recentFiles: ['auth.md', 'security-audit.md'],
                    recentActivities: ['security scan failed']
                }
            },
            {
                name: 'Discovery Mode',
                skillName: 'compound-engineering',
                userIntent: 'explore available documentation and workflows',
                sessionContext: {
                    currentPhase: null,
                    recentFiles: [],
                    recentActivities: []
                }
            },
            {
                name: 'Sequential Workflow',
                skillName: 'ears-specification',
                userIntent: 'start implementation after completing requirements',
                sessionContext: {
                    currentPhase: 'WORK',
                    recentFiles: ['requirements.md', 'design.md'],
                    recentActivities: ['created requirements', 'completed design phase']
                }
            }
        ];
    }

    async start() {
        this.printHeader();
        await this.showMainMenu();
    }

    printHeader() {
        console.log(`${colors.cyan}${colors.bright}`);
        console.log('╔══════════════════════════════════════════════════════════════╗');
        console.log('║              Context Optimization Engine Demo               ║');
        console.log('║                                                              ║');
        console.log('║  Interactive testing tool for context optimization system   ║');
        console.log('╚══════════════════════════════════════════════════════════════╝');
        console.log(`${colors.reset}\n`);
    }

    async showMainMenu() {
        while (true) {
            console.log(`${colors.bright}${colors.white}Main Menu:${colors.reset}`);
            console.log(`${colors.green}1.${colors.reset} Interactive Context Optimization`);
            console.log(`${colors.green}2.${colors.reset} Demo Scenarios`);
            console.log(`${colors.green}3.${colors.reset} Token Estimation Tool`);
            console.log(`${colors.green}4.${colors.reset} Relevance Scoring Tool`);
            console.log(`${colors.green}5.${colors.reset} Memory Optimization Demo`);
            console.log(`${colors.green}6.${colors.reset} Session Context Manager`);
            console.log(`${colors.green}7.${colors.reset} Performance Benchmarks`);
            console.log(`${colors.green}8.${colors.reset} Exit`);
            
            const choice = await this.prompt(`\n${colors.cyan}Choose an option (1-8): ${colors.reset}`);
            
            switch (choice.trim()) {
                case '1':
                    await this.interactiveOptimization();
                    break;
                case '2':
                    await this.runDemoScenarios();
                    break;
                case '3':
                    await this.tokenEstimationTool();
                    break;
                case '4':
                    await this.relevanceScoringTool();
                    break;
                case '5':
                    await this.memoryOptimizationDemo();
                    break;
                case '6':
                    await this.sessionContextManager();
                    break;
                case '7':
                    await this.performanceBenchmarks();
                    break;
                case '8':
                    console.log(`${colors.green}Thank you for using the Context Optimization Engine Demo!${colors.reset}`);
                    this.rl.close();
                    return;
                default:
                    console.log(`${colors.red}Invalid choice. Please select 1-8.${colors.reset}\n`);
            }
        }
    }

    async interactiveOptimization() {
        console.log(`\n${colors.bright}${colors.blue}Interactive Context Optimization${colors.reset}`);
        console.log('Test the context optimization engine with custom inputs.\n');
        
        const skillName = await this.prompt('Enter skill name (or press Enter for "compound-engineering"): ') || 'compound-engineering';
        const userIntent = await this.prompt('Enter user intent: ');
        
        if (!userIntent.trim()) {
            console.log(`${colors.red}User intent is required.${colors.reset}\n`);
            return;
        }
        
        console.log(`\n${colors.yellow}🔍 Analyzing context optimization...${colors.reset}`);
        
        const startTime = Date.now();
        const result = this.engine.optimizeContext(skillName, userIntent, this.sessionContext);
        const endTime = Date.now();
        
        this.displayOptimizationResult(result, endTime - startTime);
        
        await this.prompt('\nPress Enter to continue...');
    }

    async runDemoScenarios() {
        console.log(`\n${colors.bright}${colors.blue}Demo Scenarios${colors.reset}`);
        console.log('Pre-configured scenarios demonstrating different optimization patterns.\n');
        
        for (let i = 0; i < this.demoScenarios.length; i++) {
            console.log(`${colors.green}${i + 1}.${colors.reset} ${this.demoScenarios[i].name}`);
        }
        console.log(`${colors.green}${this.demoScenarios.length + 1}.${colors.reset} Run All Scenarios`);
        console.log(`${colors.green}${this.demoScenarios.length + 2}.${colors.reset} Back to Main Menu`);
        
        const choice = await this.prompt(`\nChoose a scenario (1-${this.demoScenarios.length + 2}): `);
        const choiceNum = parseInt(choice.trim());
        
        if (choiceNum === this.demoScenarios.length + 2) {
            return;
        } else if (choiceNum === this.demoScenarios.length + 1) {
            for (const scenario of this.demoScenarios) {
                await this.runScenario(scenario);
                await this.prompt('\nPress Enter to continue to next scenario...');
            }
        } else if (choiceNum >= 1 && choiceNum <= this.demoScenarios.length) {
            await this.runScenario(this.demoScenarios[choiceNum - 1]);
        } else {
            console.log(`${colors.red}Invalid choice.${colors.reset}\n`);
        }
        
        await this.prompt('\nPress Enter to continue...');
    }

    async runScenario(scenario) {
        console.log(`\n${colors.bright}${colors.magenta}Scenario: ${scenario.name}${colors.reset}`);
        console.log(`${colors.cyan}Skill:${colors.reset} ${scenario.skillName}`);
        console.log(`${colors.cyan}Intent:${colors.reset} ${scenario.userIntent}`);
        console.log(`${colors.cyan}Context:${colors.reset} ${JSON.stringify(scenario.sessionContext, null, 2)}`);
        
        console.log(`\n${colors.yellow}🔍 Running optimization...${colors.reset}`);
        
        const startTime = Date.now();
        const result = this.engine.optimizeContext(
            scenario.skillName,
            scenario.userIntent,
            scenario.sessionContext
        );
        const endTime = Date.now();
        
        this.displayOptimizationResult(result, endTime - startTime);
    }

    async tokenEstimationTool() {
        console.log(`\n${colors.bright}${colors.blue}Token Estimation Tool${colors.reset}`);
        console.log('Test token estimation for different content types.\n');
        
        while (true) {
            const content = await this.prompt('Enter content to estimate (or "back" to return): ');
            
            if (content.toLowerCase() === 'back') break;
            if (!content.trim()) continue;
            
            const contentType = await this.prompt('Content type (text/code/markdown) [text]: ') || 'text';
            
            const tokens = this.engine.estimateTokens(content, contentType);
            const chars = content.length;
            const ratio = chars / tokens;
            
            console.log(`\n${colors.green}📊 Token Estimation Results:${colors.reset}`);
            console.log(`${colors.cyan}Content Length:${colors.reset} ${chars} characters`);
            console.log(`${colors.cyan}Estimated Tokens:${colors.reset} ${tokens}`);
            console.log(`${colors.cyan}Chars per Token:${colors.reset} ${ratio.toFixed(2)}`);
            console.log(`${colors.cyan}Content Type:${colors.reset} ${contentType}\n`);
        }
    }

    async relevanceScoringTool() {
        console.log(`\n${colors.bright}${colors.blue}Relevance Scoring Tool${colors.reset}`);
        console.log('Test relevance scoring for content and user intent matching.\n');
        
        while (true) {
            const content = await this.prompt('Enter content to score (or "back" to return): ');
            
            if (content.toLowerCase() === 'back') break;
            if (!content.trim()) continue;
            
            const intent = await this.prompt('Enter user intent: ');
            if (!intent.trim()) continue;
            
            const score = this.engine.scoreRelevance(content, intent, this.sessionContext);
            
            console.log(`\n${colors.green}🎯 Relevance Scoring Results:${colors.reset}`);
            console.log(`${colors.cyan}Content:${colors.reset} ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`);
            console.log(`${colors.cyan}Intent:${colors.reset} ${intent}`);
            console.log(`${colors.cyan}Relevance Score:${colors.reset} ${score}/100`);
            
            // Score interpretation
            let interpretation;
            if (score >= 80) interpretation = `${colors.green}Highly Relevant${colors.reset}`;
            else if (score >= 60) interpretation = `${colors.yellow}Moderately Relevant${colors.reset}`;
            else if (score >= 40) interpretation = `${colors.yellow}Somewhat Relevant${colors.reset}`;
            else interpretation = `${colors.red}Low Relevance${colors.reset}`;
            
            console.log(`${colors.cyan}Interpretation:${colors.reset} ${interpretation}\n`);
        }
    }

    async memoryOptimizationDemo() {
        console.log(`\n${colors.bright}${colors.blue}Memory Optimization Demo${colors.reset}`);
        console.log('Demonstrates how memory files are optimized based on relevance.\n');
        
        // Create sample memory data
        const sampleLessons = [
            'When implementing authentication, always validate JWT tokens properly.',
            'Use proper error handling in all API endpoints to prevent information leakage.',
            'Database migrations should always be reversible and tested.',
            'Always write comprehensive tests before implementing new features.',
            'Security audits should check for common vulnerabilities like SQL injection.',
            'Performance optimization should be based on actual measurements, not assumptions.',
            'Code reviews should focus on security, performance, and maintainability.',
            'Documentation should be updated whenever code changes are made.',
            'Use environment variables for configuration, never hardcode secrets.',
            'Implement proper logging for debugging and monitoring purposes.'
        ];
        
        const sampleDecisions = [
            '2025-12-29: Decided to use JWT tokens for authentication instead of sessions.',
            '2025-12-28: Chose PostgreSQL over MongoDB for better ACID compliance.',
            '2025-12-27: Implemented REST API architecture with OpenAPI documentation.',
            '2025-12-20: Added comprehensive test suite with 90% coverage requirement.',
            '2025-12-15: Established security review process for all code changes.',
            '2024-11-01: Legacy decision about old authentication system (deprecated).',
            '2024-06-15: Very old architectural decision about monolithic structure.',
            '2024-03-01: Historical decision about database choice (no longer relevant).'
        ];
        
        const userIntent = await this.prompt('Enter user intent for memory optimization: ');
        if (!userIntent.trim()) return;
        
        console.log(`\n${colors.yellow}🧠 Optimizing memory files...${colors.reset}`);
        
        // Simulate memory optimization
        const contextManager = this.engine.contextManager;
        const pruner = contextManager.contextPruner;
        
        const result = pruner.pruneMemoryFiles(
            sampleLessons,
            sampleDecisions,
            userIntent,
            this.sessionContext
        );
        
        console.log(`\n${colors.green}📊 Memory Optimization Results:${colors.reset}`);
        console.log(`${colors.cyan}Original Lessons:${colors.reset} ${sampleLessons.length}`);
        console.log(`${colors.cyan}Optimized Lessons:${colors.reset} ${result.lessons.length}`);
        console.log(`${colors.cyan}Pruned Lessons:${colors.reset} ${result.prunedLessons}`);
        console.log(`${colors.cyan}Original Decisions:${colors.reset} ${sampleDecisions.length}`);
        console.log(`${colors.cyan}Optimized Decisions:${colors.reset} ${result.decisions.length}`);
        console.log(`${colors.cyan}Pruned Decisions:${colors.reset} ${result.prunedDecisions}`);
        
        console.log(`\n${colors.bright}${colors.green}Kept Lessons:${colors.reset}`);
        result.lessons.forEach((lesson, i) => {
            console.log(`${colors.green}${i + 1}.${colors.reset} ${lesson}`);
        });
        
        console.log(`\n${colors.bright}${colors.green}Kept Decisions:${colors.reset}`);
        result.decisions.forEach((decision, i) => {
            console.log(`${colors.green}${i + 1}.${colors.reset} ${decision}`);
        });
        
        await this.prompt('\nPress Enter to continue...');
    }

    async sessionContextManager() {
        console.log(`\n${colors.bright}${colors.blue}Session Context Manager${colors.reset}`);
        console.log('Manage and view current session context.\n');
        
        while (true) {
            console.log(`${colors.bright}${colors.white}Current Session Context:${colors.reset}`);
            console.log(JSON.stringify(this.sessionContext, null, 2));
            
            console.log(`\n${colors.green}1.${colors.reset} Update Current Phase`);
            console.log(`${colors.green}2.${colors.reset} Add Recent File`);
            console.log(`${colors.green}3.${colors.reset} Add Recent Activity`);
            console.log(`${colors.green}4.${colors.reset} Set Error Context`);
            console.log(`${colors.green}5.${colors.reset} Clear Context`);
            console.log(`${colors.green}6.${colors.reset} Back to Main Menu`);
            
            const choice = await this.prompt('\nChoose an option (1-6): ');
            
            switch (choice.trim()) {
                case '1':
                    const phase = await this.prompt('Enter current phase (PLAN/SPEC-FORGE/WORK/REVIEW): ');
                    if (['PLAN', 'SPEC-FORGE', 'WORK', 'REVIEW'].includes(phase.toUpperCase())) {
                        this.sessionContext.currentPhase = phase.toUpperCase();
                        this.engine.updateSessionContext({ currentPhase: phase.toUpperCase() });
                    }
                    break;
                case '2':
                    const file = await this.prompt('Enter file path: ');
                    if (file.trim()) {
                        this.sessionContext.recentFiles.unshift(file.trim());
                        this.sessionContext.recentFiles = this.sessionContext.recentFiles.slice(0, 10);
                        this.engine.updateSessionContext({ recentFiles: this.sessionContext.recentFiles });
                    }
                    break;
                case '3':
                    const activity = await this.prompt('Enter recent activity: ');
                    if (activity.trim()) {
                        this.sessionContext.recentActivities.unshift(activity.trim());
                        this.sessionContext.recentActivities = this.sessionContext.recentActivities.slice(0, 5);
                        this.engine.updateSessionContext({ recentActivities: this.sessionContext.recentActivities });
                    }
                    break;
                case '4':
                    const errorContext = await this.prompt('Enter error context: ');
                    this.sessionContext.errorContext = errorContext.trim() || null;
                    this.engine.updateSessionContext({ errorContext: this.sessionContext.errorContext });
                    break;
                case '5':
                    this.sessionContext = {
                        currentPhase: null,
                        recentFiles: [],
                        recentActivities: [],
                        userPreferences: {}
                    };
                    this.engine.updateSessionContext(this.sessionContext);
                    console.log(`${colors.green}Session context cleared.${colors.reset}`);
                    break;
                case '6':
                    return;
                default:
                    console.log(`${colors.red}Invalid choice.${colors.reset}`);
            }
            
            console.log('');
        }
    }

    async performanceBenchmarks() {
        console.log(`\n${colors.bright}${colors.blue}Performance Benchmarks${colors.reset}`);
        console.log('Test performance with different content sizes and complexity.\n');
        
        const benchmarks = [
            {
                name: 'Small Content (1KB)',
                content: 'word '.repeat(250),
                iterations: 1000
            },
            {
                name: 'Medium Content (10KB)',
                content: 'word '.repeat(2500),
                iterations: 100
            },
            {
                name: 'Large Content (100KB)',
                content: 'word '.repeat(25000),
                iterations: 10
            }
        ];
        
        for (const benchmark of benchmarks) {
            console.log(`${colors.yellow}Running ${benchmark.name} benchmark...${colors.reset}`);
            
            // Token estimation benchmark
            const tokenStart = Date.now();
            for (let i = 0; i < benchmark.iterations; i++) {
                this.engine.estimateTokens(benchmark.content);
            }
            const tokenEnd = Date.now();
            const tokenTime = tokenEnd - tokenStart;
            
            // Relevance scoring benchmark
            const scoreStart = Date.now();
            for (let i = 0; i < benchmark.iterations; i++) {
                this.engine.scoreRelevance(benchmark.content, 'test intent');
            }
            const scoreEnd = Date.now();
            const scoreTime = scoreEnd - scoreStart;
            
            console.log(`${colors.green}${benchmark.name} Results:${colors.reset}`);
            console.log(`  Token Estimation: ${tokenTime}ms for ${benchmark.iterations} iterations (${(tokenTime / benchmark.iterations).toFixed(2)}ms avg)`);
            console.log(`  Relevance Scoring: ${scoreTime}ms for ${benchmark.iterations} iterations (${(scoreTime / benchmark.iterations).toFixed(2)}ms avg)`);
            console.log('');
        }
        
        await this.prompt('Press Enter to continue...');
    }

    displayOptimizationResult(result, executionTime) {
        console.log(`\n${colors.bright}${colors.green}🎯 Optimization Results${colors.reset}`);
        console.log(`${colors.cyan}Execution Time:${colors.reset} ${executionTime}ms`);
        console.log(`${colors.cyan}Tier:${colors.reset} ${result.tier}`);
        console.log(`${colors.cyan}Budget:${colors.reset} ${result.budget} tokens`);
        
        // Usage statistics
        const stats = result.stats;
        console.log(`\n${colors.bright}${colors.blue}📊 Token Usage Statistics${colors.reset}`);
        console.log(`${colors.cyan}Used:${colors.reset} ${stats.used} tokens`);
        console.log(`${colors.cyan}Budget:${colors.reset} ${stats.budget} tokens`);
        console.log(`${colors.cyan}Remaining:${colors.reset} ${stats.remaining} tokens`);
        console.log(`${colors.cyan}Utilization:${colors.reset} ${stats.utilization.toFixed(1)}%`);
        
        // Memory optimization
        if (result.memoryOptimization && result.memoryOptimization.stats) {
            const memStats = result.memoryOptimization.stats;
            console.log(`\n${colors.bright}${colors.blue}🧠 Memory Optimization${colors.reset}`);
            console.log(`${colors.cyan}Lessons:${colors.reset} ${memStats.originalLessons} → ${memStats.optimizedLessons} (${memStats.prunedLessons} pruned)`);
            console.log(`${colors.cyan}Decisions:${colors.reset} ${memStats.originalDecisions} → ${memStats.optimizedDecisions} (${memStats.prunedDecisions} pruned)`);
        }
        
        // Loaded content summary
        console.log(`\n${colors.bright}${colors.blue}📄 Loaded Content${colors.reset}`);
        console.log(`${colors.cyan}Total Files:${colors.reset} ${result.loadedContent.length}`);
        
        const prunedFiles = result.loadedContent.filter(item => item.loadResult && item.loadResult.pruned);
        if (prunedFiles.length > 0) {
            console.log(`${colors.cyan}Pruned Files:${colors.reset} ${prunedFiles.length}`);
        }
        
        // Show top loaded content
        const topContent = result.loadedContent.slice(0, 5);
        topContent.forEach((item, i) => {
            const scoreColor = item.score >= 80 ? colors.green : item.score >= 60 ? colors.yellow : colors.red;
            const prunedIndicator = item.loadResult && item.loadResult.pruned ? ' (pruned)' : '';
            console.log(`  ${i + 1}. ${item.path} - Score: ${scoreColor}${item.score}${colors.reset}${prunedIndicator}`);
        });
        
        // Recommendations
        if (result.recommendations && result.recommendations.length > 0) {
            console.log(`\n${colors.bright}${colors.blue}💡 Recommendations${colors.reset}`);
            result.recommendations.forEach((rec, i) => {
                const typeColor = rec.type === 'warning' ? colors.yellow : rec.type === 'error' ? colors.red : colors.green;
                console.log(`  ${i + 1}. ${typeColor}${rec.type.toUpperCase()}:${colors.reset} ${rec.message}`);
                if (rec.action) {
                    console.log(`     ${colors.cyan}Action:${colors.reset} ${rec.action}`);
                }
            });
        }
    }

    prompt(question) {
        return new Promise((resolve) => {
            this.rl.question(question, resolve);
        });
    }
}

// Run the demo if this file is executed directly
if (require.main === module) {
    const demo = new ContextOptimizationDemo();
    demo.start().catch(console.error);
}

module.exports = ContextOptimizationDemo;