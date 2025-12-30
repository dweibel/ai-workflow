#!/usr/bin/env node

/**
 * Context Optimization Engine Validation Script
 * 
 * Validates the context optimization system without requiring
 * external test frameworks. Provides comprehensive testing and validation.
 * 
 * @author Engineering Workflow System
 * @version 1.0.0
 * @date 2025-12-29
 */

const {
    ContextOptimizationEngine,
    ContextManager,
    AdaptiveLoader,
    SmartContextPruner,
    RelevanceScorer,
    TokenEstimator
} = require('./context-optimization-engine');

// ANSI color codes for output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

class ContextOptimizationValidator {
    constructor() {
        this.engine = new ContextOptimizationEngine();
        this.contextManager = new ContextManager();
        this.tokenEstimator = new TokenEstimator();
        this.relevanceScorer = new RelevanceScorer();
        this.contextPruner = new SmartContextPruner(this.tokenEstimator, this.relevanceScorer);
        
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    async runValidation() {
        console.log(`${colors.cyan}${colors.bright}`);
        console.log('╔══════════════════════════════════════════════════════════════╗');
        console.log('║           Context Optimization Engine Validation            ║');
        console.log('╚══════════════════════════════════════════════════════════════╝');
        console.log(`${colors.reset}\n`);

        // Run all validation tests
        await this.validateTokenEstimator();
        await this.validateRelevanceScorer();
        await this.validateContextPruner();
        await this.validateContextManager();
        await this.validateAdaptiveLoader();
        await this.validateEngineIntegration();
        await this.validatePerformance();
        await this.validateErrorHandling();

        // Print summary
        this.printSummary();
        
        return this.testResults.failed === 0;
    }

    async validateTokenEstimator() {
        console.log(`${colors.blue}${colors.bright}Testing Token Estimator...${colors.reset}`);
        
        // Test basic token estimation
        this.test('Basic token estimation', () => {
            const text = 'This is a simple test with about twenty words to check token estimation accuracy.';
            const tokens = this.tokenEstimator.estimateTokens(text);
            return tokens > 15 && tokens < 25;
        });

        // Test content type multipliers
        this.test('Content type multipliers', () => {
            const content = 'function test() { return "hello world"; }';
            const textTokens = this.tokenEstimator.estimateTokens(content, 'text');
            const codeTokens = this.tokenEstimator.estimateTokens(content, 'code');
            const markdownTokens = this.tokenEstimator.estimateTokens(content, 'markdown');
            
            return codeTokens > textTokens && markdownTokens > textTokens && codeTokens > markdownTokens;
        });

        // Test edge cases
        this.test('Edge case handling', () => {
            return this.tokenEstimator.estimateTokens('') === 0 &&
                   this.tokenEstimator.estimateTokens(null) === 0 &&
                   this.tokenEstimator.estimateTokens(undefined) === 0 &&
                   this.tokenEstimator.estimateTokens(123) === 0;
        });

        console.log('');
    }

    async validateRelevanceScorer() {
        console.log(`${colors.blue}${colors.bright}Testing Relevance Scorer...${colors.reset}`);
        
        // Test intent matching
        this.test('Intent matching', () => {
            const content = 'This document explains how to implement authentication and security features.';
            const intent = 'implement security authentication';
            const score = this.relevanceScorer.scoreContent(content, intent);
            return score > 30 && score <= 100;
        });

        // Test recent usage scoring
        this.test('Recent usage boost', () => {
            const content = 'Test content for recent usage scoring.';
            const intent = 'test content';
            const sessionContext = { recentFiles: ['test-file.md'] };
            
            // Mock the path extraction
            const originalExtract = this.relevanceScorer.extractPathFromContent;
            this.relevanceScorer.extractPathFromContent = () => 'test-file.md';
            
            const score = this.relevanceScorer.scoreContent(content, intent, sessionContext);
            const baseScore = this.relevanceScorer.scoreContent(content, intent, {});
            
            // Restore original method
            this.relevanceScorer.extractPathFromContent = originalExtract;
            
            return score > baseScore;
        });

        // Test phase relevance
        this.test('Phase relevance scoring', () => {
            const planningContent = 'This document contains planning and design information.';
            const implementationContent = 'This document shows how to implement and build features.';
            const intent = 'general task';
            
            const planningScore = this.relevanceScorer.scoreContent(planningContent, intent, { currentPhase: 'PLAN' });
            const implementationScore = this.relevanceScorer.scoreContent(implementationContent, intent, { currentPhase: 'WORK' });
            
            return planningScore > 0 && implementationScore > 0;
        });

        // Test score capping
        this.test('Score capping at 100', () => {
            const highScoringContent = 'implement security authentication build develop create test validate verify check audit review performance optimize';
            const intent = 'implement security authentication build develop create test validate verify check audit review performance optimize';
            
            const score = this.relevanceScorer.scoreContent(highScoringContent, intent, {
                currentPhase: 'WORK',
                recentFiles: ['test.md']
            });
            
            return score <= 100;
        });

        console.log('');
    }

    async validateContextPruner() {
        console.log(`${colors.blue}${colors.bright}Testing Context Pruner...${colors.reset}`);
        
        // Test memory file pruning
        this.test('Memory file pruning', () => {
            const lessons = [
                'When implementing authentication, always validate tokens.',
                'Use proper error handling in API endpoints.',
                'Database migrations should be reversible.',
                'Always write tests before implementation.',
                'Security audits should check for SQL injection.'
            ];
            
            const decisions = [
                '2025-12-29: Decided to use JWT for authentication.',
                '2025-12-20: Chose PostgreSQL for database.',
                '2025-12-15: Implemented REST API architecture.',
                '2024-11-01: Legacy decision about old system.',
                '2024-06-01: Very old architectural decision.'
            ];
            
            const result = this.contextPruner.pruneMemoryFiles(
                lessons,
                decisions,
                'implement authentication security',
                { currentPhase: 'WORK' }
            );
            
            return result.lessons.length <= lessons.length &&
                   result.decisions.length <= decisions.length &&
                   result.prunedLessons >= 0 &&
                   result.prunedDecisions >= 0 &&
                   result.lessons.some(lesson => lesson.includes('authentication'));
        });

        // Test date extraction
        this.test('Date extraction', () => {
            const contentWithDate = '2025-12-29: This is a decision with a date.';
            const contentWithoutDate = 'This is content without a date.';
            
            const dateExtracted = this.contextPruner.extractDate(contentWithDate);
            const noDateExtracted = this.contextPruner.extractDate(contentWithoutDate);
            
            return dateExtracted instanceof Date &&
                   dateExtracted.getFullYear() === 2025 &&
                   noDateExtracted === null;
        });

        // Test content pruning
        this.test('Content pruning', () => {
            const longContent = 'This is a long piece of content. '.repeat(100);
            const originalTokens = this.tokenEstimator.estimateTokens(longContent);
            const targetTokens = Math.floor(originalTokens / 2);
            
            const prunedContent = this.contextPruner.pruneContent(longContent, targetTokens, false);
            const prunedTokens = this.tokenEstimator.estimateTokens(prunedContent);
            
            return prunedTokens <= targetTokens * 1.1 && // Allow 10% tolerance
                   prunedContent.length < longContent.length;
        });

        console.log('');
    }

    async validateContextManager() {
        console.log(`${colors.blue}${colors.bright}Testing Context Manager...${colors.reset}`);
        
        // Test initialization
        this.test('Initialization', () => {
            return this.contextManager.tokenBudget === 8000 &&
                   this.contextManager.currentUsage === 0 &&
                   this.contextManager.tierLimits.hasOwnProperty('discovery') &&
                   this.contextManager.tierLimits.hasOwnProperty('activation') &&
                   this.contextManager.tierLimits.hasOwnProperty('execution') &&
                   this.contextManager.tierLimits.hasOwnProperty('review');
        });

        // Test session context updates
        this.test('Session context updates', () => {
            const updates = {
                currentPhase: 'WORK',
                recentFiles: ['file1.md', 'file2.md'],
                recentActivities: ['activity1', 'activity2']
            };
            
            this.contextManager.updateSessionContext(updates);
            
            return this.contextManager.sessionContext.currentPhase === 'WORK' &&
                   this.contextManager.sessionContext.recentFiles.length === 2 &&
                   this.contextManager.sessionContext.recentActivities.length === 2;
        });

        // Test budget management
        this.test('Budget management', () => {
            const content = 'This is test content for budget testing.';
            this.contextManager.resetUsage();
            
            const result = this.contextManager.loadWithBudget(content, 'discovery');
            
            return result.hasOwnProperty('content') &&
                   result.hasOwnProperty('tokens') &&
                   result.hasOwnProperty('pruned') &&
                   result.hasOwnProperty('tier') &&
                   result.tier === 'discovery';
        });

        // Test usage statistics
        this.test('Usage statistics', () => {
            this.contextManager.resetUsage();
            const content = 'Test content for statistics.';
            this.contextManager.loadWithBudget(content, 'discovery');
            
            const stats = this.contextManager.getUsageStats();
            
            return stats.hasOwnProperty('used') &&
                   stats.hasOwnProperty('budget') &&
                   stats.hasOwnProperty('remaining') &&
                   stats.hasOwnProperty('utilization') &&
                   stats.used + stats.remaining === stats.budget &&
                   stats.utilization > 0 &&
                   stats.utilization <= 100;
        });

        console.log('');
    }

    async validateAdaptiveLoader() {
        console.log(`${colors.blue}${colors.bright}Testing Adaptive Loader...${colors.reset}`);
        
        const adaptiveLoader = new AdaptiveLoader(this.contextManager);
        
        // Test tier determination
        this.test('Tier determination', () => {
            return adaptiveLoader.determineTier('fix error in authentication', {}) === 'execution' &&
                   adaptiveLoader.determineTier('implement new feature', {}) === 'execution' &&
                   adaptiveLoader.determineTier('review code quality', {}) === 'review' &&
                   adaptiveLoader.determineTier('activate skill', {}) === 'activation' &&
                   adaptiveLoader.determineTier('explore documentation', {}) === 'discovery';
        });

        // Test error context prioritization
        this.test('Error context prioritization', () => {
            const errorContext = { errorContext: 'Authentication failed' };
            const tier = adaptiveLoader.determineTier('help with issue', errorContext);
            return tier === 'execution';
        });

        // Test content source identification
        this.test('Content source identification', () => {
            const sources = adaptiveLoader.identifyContentSources(
                'compound-engineering',
                'implement feature',
                { currentPhase: 'WORK', recentFiles: ['test.md'] }
            );
            
            return sources.length > 0 &&
                   sources.some(s => s.type === 'skill') &&
                   sources.some(s => s.type === 'memory') &&
                   sources.some(s => s.type === 'workflow') &&
                   sources.some(s => s.type === 'recent');
        });

        // Test content type detection
        this.test('Content type detection', () => {
            return adaptiveLoader.getContentType('test.js') === 'code' &&
                   adaptiveLoader.getContentType('test.ts') === 'code' &&
                   adaptiveLoader.getContentType('test.py') === 'code' &&
                   adaptiveLoader.getContentType('test.md') === 'markdown' &&
                   adaptiveLoader.getContentType('test.txt') === 'text';
        });

        console.log('');
    }

    async validateEngineIntegration() {
        console.log(`${colors.blue}${colors.bright}Testing Engine Integration...${colors.reset}`);
        
        // Test context optimization
        this.test('Context optimization', () => {
            const result = this.engine.optimizeContext(
                'compound-engineering',
                'implement authentication security',
                {
                    currentPhase: 'WORK',
                    recentFiles: ['auth.md'],
                    recentActivities: ['created requirements']
                }
            );
            
            return result.hasOwnProperty('loadedContent') &&
                   result.hasOwnProperty('tier') &&
                   result.hasOwnProperty('budget') &&
                   result.hasOwnProperty('stats') &&
                   result.hasOwnProperty('memoryOptimization') &&
                   result.hasOwnProperty('recommendations') &&
                   Array.isArray(result.loadedContent) &&
                   Array.isArray(result.recommendations);
        });

        // Test usage statistics
        this.test('Usage statistics', () => {
            const stats = this.engine.getUsageStats();
            
            return stats.hasOwnProperty('used') &&
                   stats.hasOwnProperty('budget') &&
                   stats.hasOwnProperty('remaining') &&
                   stats.hasOwnProperty('utilization');
        });

        // Test session context updates
        this.test('Session context updates', () => {
            const updates = { currentPhase: 'REVIEW' };
            this.engine.updateSessionContext(updates);
            
            return this.engine.contextManager.sessionContext.currentPhase === 'REVIEW';
        });

        // Test token estimation
        this.test('Token estimation', () => {
            const content = 'Test content for token estimation.';
            const tokens = this.engine.estimateTokens(content);
            
            return tokens > 0 && typeof tokens === 'number';
        });

        // Test relevance scoring
        this.test('Relevance scoring', () => {
            const content = 'This is test content about authentication and security.';
            const intent = 'implement authentication';
            const score = this.engine.scoreRelevance(content, intent);
            
            return score > 0 && score <= 100;
        });

        console.log('');
    }

    async validatePerformance() {
        console.log(`${colors.blue}${colors.bright}Testing Performance...${colors.reset}`);
        
        // Test token estimation performance
        this.test('Token estimation performance', () => {
            const content = 'word '.repeat(1000); // ~5KB content
            const startTime = Date.now();
            
            for (let i = 0; i < 100; i++) {
                this.tokenEstimator.estimateTokens(content);
            }
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            return duration < 1000; // Should complete 100 estimations in <1 second
        });

        // Test relevance scoring performance
        this.test('Relevance scoring performance', () => {
            const content = 'This is test content for performance testing with various keywords like implement, security, authentication, and development.';
            const intent = 'implement security features';
            const startTime = Date.now();
            
            for (let i = 0; i < 100; i++) {
                this.relevanceScorer.scoreContent(content, intent);
            }
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            return duration < 1000; // Should complete 100 scorings in <1 second
        });

        // Test memory optimization performance
        this.test('Memory optimization performance', () => {
            const lessons = Array.from({ length: 50 }, (_, i) => `Lesson ${i}: Some learning content about development.`);
            const decisions = Array.from({ length: 25 }, (_, i) => `2025-12-${(i % 28) + 1}: Decision ${i} about architecture.`);
            
            const startTime = Date.now();
            
            for (let i = 0; i < 10; i++) {
                this.contextPruner.pruneMemoryFiles(lessons, decisions, 'test intent', {});
            }
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            return duration < 1000; // Should complete 10 optimizations in <1 second
        });

        console.log('');
    }

    async validateErrorHandling() {
        console.log(`${colors.blue}${colors.bright}Testing Error Handling...${colors.reset}`);
        
        // Test invalid content handling
        this.test('Invalid content handling', () => {
            return this.tokenEstimator.estimateTokens(null) === 0 &&
                   this.tokenEstimator.estimateTokens(undefined) === 0 &&
                   this.tokenEstimator.estimateTokens(123) === 0 &&
                   this.tokenEstimator.estimateTokens({}) === 0;
        });

        // Test empty user intent
        this.test('Empty user intent handling', () => {
            const score = this.relevanceScorer.scoreContent('test content', '');
            return score >= 0 && score <= 100;
        });

        // Test missing session context
        this.test('Missing session context handling', () => {
            try {
                const result = this.engine.optimizeContext('test-skill', 'test intent');
                return result.hasOwnProperty('loadedContent') && result.hasOwnProperty('recommendations');
            } catch (error) {
                return false;
            }
        });

        // Test missing memory files
        this.test('Missing memory files handling', () => {
            try {
                const result = this.contextManager.optimizeMemoryFiles(
                    'non-existent-lessons.md',
                    'non-existent-decisions.md',
                    'test intent'
                );
                return Array.isArray(result.lessons) && Array.isArray(result.decisions);
            } catch (error) {
                return false;
            }
        });

        console.log('');
    }

    test(name, testFunction) {
        this.testResults.total++;
        
        try {
            const result = testFunction();
            if (result) {
                console.log(`  ${colors.green}✓${colors.reset} ${name}`);
                this.testResults.passed++;
            } else {
                console.log(`  ${colors.red}✗${colors.reset} ${name}`);
                this.testResults.failed++;
            }
        } catch (error) {
            console.log(`  ${colors.red}✗${colors.reset} ${name} (Error: ${error.message})`);
            this.testResults.failed++;
        }
    }

    printSummary() {
        console.log(`${colors.bright}${colors.cyan}Validation Summary:${colors.reset}`);
        console.log(`${colors.green}Passed: ${this.testResults.passed}${colors.reset}`);
        console.log(`${colors.red}Failed: ${this.testResults.failed}${colors.reset}`);
        console.log(`Total: ${this.testResults.total}`);
        
        if (this.testResults.failed === 0) {
            console.log(`\n${colors.green}${colors.bright}🎉 All tests passed! Context Optimization Engine is working correctly.${colors.reset}`);
        } else {
            console.log(`\n${colors.red}${colors.bright}❌ Some tests failed. Please review the implementation.${colors.reset}`);
        }
        
        const successRate = (this.testResults.passed / this.testResults.total * 100).toFixed(1);
        console.log(`Success Rate: ${successRate}%\n`);
    }
}

// Run validation if this file is executed directly
if (require.main === module) {
    const validator = new ContextOptimizationValidator();
    validator.runValidation().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('Validation failed with error:', error);
        process.exit(1);
    });
}

module.exports = ContextOptimizationValidator;