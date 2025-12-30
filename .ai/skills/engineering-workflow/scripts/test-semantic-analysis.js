#!/usr/bin/env node

/**
 * Semantic Analysis Engine Test Tool
 * 
 * Interactive CLI tool to test and demonstrate the semantic analysis engine
 * for engineering workflow skill activation.
 */

const readline = require('readline');
const SemanticAnalysisEngine = require('../semantic-analysis-engine');

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m'
};

class SemanticAnalysisDemo {
    constructor() {
        this.engine = new SemanticAnalysisEngine();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        this.sessionContext = {
            currentPhase: null,
            recentActivities: [],
            activeFiles: [],
            workflowProgress: {
                specForge: 'pending',
                planning: 'pending',
                work: 'pending',
                review: 'pending'
            }
        };
    }

    /**
     * Start the interactive demo
     */
    async start() {
        this.printHeader();
        this.printHelp();
        
        while (true) {
            try {
                const input = await this.prompt('\n🤖 Enter your request (or "help", "context", "quit"): ');
                
                if (input.toLowerCase() === 'quit' || input.toLowerCase() === 'exit') {
                    console.log('\n👋 Goodbye!');
                    break;
                }
                
                if (input.toLowerCase() === 'help') {
                    this.printHelp();
                    continue;
                }
                
                if (input.toLowerCase() === 'context') {
                    this.showContext();
                    continue;
                }
                
                if (input.toLowerCase().startsWith('set-context')) {
                    this.setContext(input);
                    continue;
                }
                
                if (input.trim() === '') {
                    continue;
                }
                
                await this.analyzeAndDisplay(input);
                
            } catch (error) {
                console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
            }
        }
        
        this.rl.close();
    }

    /**
     * Analyze input and display results
     */
    async analyzeAndDisplay(input) {
        console.log(`\n${colors.blue}🔍 Analyzing: "${input}"${colors.reset}`);
        
        const result = this.engine.analyzeInput(input, this.sessionContext);
        
        this.displayResults(result);
        
        // Ask if user wants to simulate choosing a different option
        if (result.recommendations.length > 1) {
            const choice = await this.prompt('\n📝 Simulate choosing a different option? (y/n): ');
            if (choice.toLowerCase() === 'y') {
                await this.simulateCorrection(result, input);
            }
        }
        
        // Update session context based on top recommendation
        if (result.recommendations.length > 0) {
            this.updateSessionFromRecommendation(result.recommendations[0]);
        }
    }

    /**
     * Display analysis results
     */
    displayResults(result) {
        const { recommendations, analysis } = result;
        
        console.log(`\n${colors.cyan}📊 Analysis Results:${colors.reset}`);
        console.log(`${colors.dim}Total matches: ${analysis.totalMatches}${colors.reset}`);
        console.log(`${colors.dim}Overall confidence: ${analysis.confidence}%${colors.reset}`);
        
        if (recommendations.length === 0) {
            console.log(`${colors.yellow}⚠️  No skill recommendations found${colors.reset}`);
            return;
        }
        
        console.log(`\n${colors.green}🎯 Top Recommendations:${colors.reset}`);
        
        recommendations.forEach((rec, index) => {
            const rank = index + 1;
            const confidenceColor = rec.confidence >= 90 ? colors.green : 
                                  rec.confidence >= 75 ? colors.yellow : colors.red;
            
            console.log(`\n${colors.bold}${rank}. ${rec.skill}${colors.reset}`);
            console.log(`   ${confidenceColor}Confidence: ${rec.confidence}%${colors.reset} ${rec.originalConfidence ? `(was ${rec.originalConfidence}%)` : ''}`);
            console.log(`   ${colors.dim}Type: ${rec.type}${colors.reset}`);
            console.log(`   ${colors.dim}Trigger: "${rec.trigger}"${colors.reset}`);
            console.log(`   ${colors.dim}Reasoning: ${rec.reasoning}${colors.reset}`);
            
            if (rec.adjustmentReasons && rec.adjustmentReasons.length > 0) {
                console.log(`   ${colors.cyan}Adjustments: ${rec.adjustmentReasons.join(', ')}${colors.reset}`);
            }
            
            if (rec.persona) {
                console.log(`   ${colors.magenta}Suggested persona: ${rec.persona}${colors.reset}`);
            }
            
            if (rec.priority) {
                console.log(`   ${colors.red}Priority: ${rec.priority}${colors.reset}`);
            }
        });
        
        // Show context factors
        console.log(`\n${colors.cyan}🔍 Context Factors:${colors.reset}`);
        const factors = analysis.contextFactors;
        console.log(`   Current phase: ${factors.currentPhase || 'none'}`);
        console.log(`   Recent activities: ${factors.recentActivitiesCount}`);
        console.log(`   Active files: ${factors.activeFilesCount}`);
        console.log(`   Workflow progress: ${JSON.stringify(factors.workflowProgress)}`);
    }

    /**
     * Simulate user correction for learning
     */
    async simulateCorrection(result, input) {
        console.log(`\n${colors.yellow}Available options:${colors.reset}`);
        result.recommendations.forEach((rec, index) => {
            console.log(`${index + 1}. ${rec.skill} (${rec.confidence}%)`);
        });
        
        const choice = await this.prompt('Choose option number: ');
        const choiceIndex = parseInt(choice) - 1;
        
        if (choiceIndex >= 0 && choiceIndex < result.recommendations.length) {
            const chosen = result.recommendations[choiceIndex];
            const original = result.recommendations[0];
            
            if (chosen !== original) {
                console.log(`\n${colors.green}📚 Learning from correction...${colors.reset}`);
                this.engine.learnFromCorrection(original, chosen.skill, { input });
                console.log(`User chose ${chosen.skill} instead of ${original.skill}`);
            } else {
                console.log(`\n${colors.green}✅ User confirmed top recommendation${colors.reset}`);
            }
        } else {
            console.log(`${colors.red}Invalid choice${colors.reset}`);
        }
    }

    /**
     * Update session context based on recommendation
     */
    updateSessionFromRecommendation(recommendation) {
        // Simulate activity based on skill
        const activityMap = {
            'ears-specification': 'created requirements',
            'git-workflow': 'started implementation',
            'testing-framework': 'conducted review',
            'engineering-workflow': 'analyzed workflow'
        };
        
        const activity = activityMap[recommendation.skill];
        if (activity) {
            this.sessionContext.recentActivities.push(activity);
            if (this.sessionContext.recentActivities.length > 5) {
                this.sessionContext.recentActivities.shift();
            }
        }
        
        // Update workflow progress
        const phaseMap = {
            'ears-specification': 'specForge',
            'git-workflow': 'work',
            'testing-framework': 'review'
        };
        
        const phase = phaseMap[recommendation.skill];
        if (phase) {
            this.sessionContext.workflowProgress[phase] = 'in-progress';
            this.sessionContext.currentPhase = phase.toUpperCase();
        }
    }

    /**
     * Show current session context
     */
    showContext() {
        console.log(`\n${colors.cyan}📋 Current Session Context:${colors.reset}`);
        console.log(`Current phase: ${this.sessionContext.currentPhase || 'none'}`);
        console.log(`Recent activities: [${this.sessionContext.recentActivities.join(', ')}]`);
        console.log(`Active files: [${this.sessionContext.activeFiles.join(', ')}]`);
        console.log(`Workflow progress:`);
        Object.entries(this.sessionContext.workflowProgress).forEach(([phase, status]) => {
            const statusColor = status === 'completed' ? colors.green :
                              status === 'in-progress' ? colors.yellow : colors.dim;
            console.log(`  ${phase}: ${statusColor}${status}${colors.reset}`);
        });
    }

    /**
     * Set session context manually
     */
    setContext(input) {
        const parts = input.split(' ');
        if (parts.length < 3) {
            console.log(`${colors.red}Usage: set-context <property> <value>${colors.reset}`);
            console.log('Properties: phase, activity, file, progress');
            return;
        }
        
        const property = parts[1];
        const value = parts.slice(2).join(' ');
        
        switch (property) {
            case 'phase':
                this.sessionContext.currentPhase = value.toUpperCase();
                console.log(`${colors.green}Set current phase to: ${value}${colors.reset}`);
                break;
                
            case 'activity':
                this.sessionContext.recentActivities.push(value);
                console.log(`${colors.green}Added activity: ${value}${colors.reset}`);
                break;
                
            case 'file':
                this.sessionContext.activeFiles.push(value);
                console.log(`${colors.green}Added active file: ${value}${colors.reset}`);
                break;
                
            case 'progress':
                const [phase, status] = value.split('=');
                if (phase && status && this.sessionContext.workflowProgress.hasOwnProperty(phase)) {
                    this.sessionContext.workflowProgress[phase] = status;
                    console.log(`${colors.green}Set ${phase} progress to: ${status}${colors.reset}`);
                } else {
                    console.log(`${colors.red}Invalid progress format. Use: phase=status${colors.reset}`);
                }
                break;
                
            default:
                console.log(`${colors.red}Unknown property: ${property}${colors.reset}`);
        }
    }

    /**
     * Print application header
     */
    printHeader() {
        console.log(`${colors.bold}${colors.cyan}`);
        console.log('╔══════════════════════════════════════════════════════════════╗');
        console.log('║              Engineering Workflow Semantic Analysis          ║');
        console.log('║                    Interactive Demo Tool                     ║');
        console.log('╚══════════════════════════════════════════════════════════════╝');
        console.log(`${colors.reset}`);
        console.log('Test sophisticated skill activation with confidence scoring,');
        console.log('context awareness, and learning capabilities.\n');
    }

    /**
     * Print help information
     */
    printHelp() {
        console.log(`${colors.yellow}📖 Available Commands:${colors.reset}`);
        console.log('  help                    - Show this help');
        console.log('  context                 - Show current session context');
        console.log('  set-context <prop> <val> - Set context property');
        console.log('  quit/exit               - Exit the demo');
        console.log('');
        console.log(`${colors.yellow}📝 Example Inputs to Try:${colors.reset}`);
        console.log('  "I need to create requirements for user authentication"');
        console.log('  "Let\'s implement the login feature using TDD"');
        console.log('  "Review this code for security vulnerabilities"');
        console.log('  "Tests are failing and I need help debugging"');
        console.log('  "The requirements are unclear and need clarification"');
        console.log('  "Ready to start coding after requirements approval"');
        console.log('');
        console.log(`${colors.yellow}🔧 Context Commands:${colors.reset}`);
        console.log('  set-context phase WORK');
        console.log('  set-context activity "created requirements"');
        console.log('  set-context file "auth-requirements.md"');
        console.log('  set-context progress specForge=completed');
    }

    /**
     * Prompt user for input
     */
    prompt(question) {
        return new Promise((resolve) => {
            this.rl.question(question, resolve);
        });
    }
}

// Export for testing
module.exports = SemanticAnalysisDemo;

// Run demo if called directly
if (require.main === module) {
    const demo = new SemanticAnalysisDemo();
    demo.start().catch(console.error);
}