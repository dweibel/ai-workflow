/**
 * Context Optimization Engine Test Suite
 * 
 * Comprehensive tests for token estimation, relevance scoring, context pruning,
 * and adaptive loading strategies.
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
} = require('../context-optimization-engine');

const fs = require('fs');
const path = require('path');

describe('Context Optimization Engine', () => {
    let engine;
    let contextManager;
    let tokenEstimator;
    let relevanceScorer;
    let contextPruner;

    beforeEach(() => {
        engine = new ContextOptimizationEngine();
        contextManager = new ContextManager();
        tokenEstimator = new TokenEstimator();
        relevanceScorer = new RelevanceScorer();
        contextPruner = new SmartContextPruner(tokenEstimator, relevanceScorer);
    });

    describe('TokenEstimator', () => {
        test('should estimate tokens for text content', () => {
            const text = 'This is a simple test with about twenty words to check token estimation accuracy.';
            const tokens = tokenEstimator.estimateTokens(text);
            
            expect(tokens).toBeGreaterThan(15);
            expect(tokens).toBeLessThan(25);
        });

        test('should apply multipliers for different content types', () => {
            const content = 'function test() { return "hello world"; }';
            
            const textTokens = tokenEstimator.estimateTokens(content, 'text');
            const codeTokens = tokenEstimator.estimateTokens(content, 'code');
            const markdownTokens = tokenEstimator.estimateTokens(content, 'markdown');
            
            expect(codeTokens).toBeGreaterThan(textTokens);
            expect(markdownTokens).toBeGreaterThan(textTokens);
            expect(codeTokens).toBeGreaterThan(markdownTokens);
        });

        test('should handle empty or invalid content', () => {
            expect(tokenEstimator.estimateTokens('')).toBe(0);
            expect(tokenEstimator.estimateTokens(null)).toBe(0);
            expect(tokenEstimator.estimateTokens(undefined)).toBe(0);
            expect(tokenEstimator.estimateTokens(123)).toBe(0);
        });

        test('should estimate tokens for large content', () => {
            const largeContent = 'word '.repeat(1000); // 5000 characters
            const tokens = tokenEstimator.estimateTokens(largeContent);
            
            expect(tokens).toBeGreaterThan(1000);
            expect(tokens).toBeLessThan(1500);
        });
    });

    describe('RelevanceScorer', () => {
        test('should score intent matches correctly', () => {
            const content = 'This document explains how to implement authentication and security features.';
            const intent = 'implement security authentication';
            
            const score = relevanceScorer.scoreContent(content, intent);
            
            expect(score).toBeGreaterThan(30);
            expect(score).toBeLessThanOrEqual(100);
        });

        test('should boost scores for recent usage', () => {
            const content = 'Test content for recent usage scoring.';
            const intent = 'test content';
            const sessionContext = {
                recentFiles: ['test-file.md', 'other-file.md']
            };
            
            // Mock extractPathFromContent to return a recent file
            jest.spyOn(relevanceScorer, 'extractPathFromContent').mockReturnValue('test-file.md');
            
            const score = relevanceScorer.scoreContent(content, intent, sessionContext);
            const baseScore = relevanceScorer.scoreContent(content, intent, {});
            
            expect(score).toBeGreaterThan(baseScore);
        });

        test('should score phase relevance', () => {
            const planningContent = 'This document contains planning and design information.';
            const implementationContent = 'This document shows how to implement and build features.';
            const intent = 'general task';
            
            const planningScore = relevanceScorer.scoreContent(planningContent, intent, { currentPhase: 'PLAN' });
            const implementationScore = relevanceScorer.scoreContent(implementationContent, intent, { currentPhase: 'WORK' });
            
            expect(planningScore).toBeGreaterThan(0);
            expect(implementationScore).toBeGreaterThan(0);
        });

        test('should score content freshness', () => {
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth() + 1;
            const currentDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
            
            const freshContent = `Updated on ${currentDate}-15 with latest information.`;
            const oldContent = 'Updated in 2020 with old information.';
            const intent = 'test';
            
            const freshScore = relevanceScorer.scoreContent(freshContent, intent);
            const oldScore = relevanceScorer.scoreContent(oldContent, intent);
            
            expect(freshScore).toBeGreaterThan(oldScore);
        });

        test('should score cross-references', () => {
            const contentWithRefs = 'See [documentation](docs.md) and check `config.json` for settings.';
            const contentWithoutRefs = 'This is plain content without any references.';
            const intent = 'test';
            
            const withRefsScore = relevanceScorer.scoreContent(contentWithRefs, intent);
            const withoutRefsScore = relevanceScorer.scoreContent(contentWithoutRefs, intent);
            
            expect(withRefsScore).toBeGreaterThan(withoutRefsScore);
        });

        test('should cap scores at 100', () => {
            const highScoringContent = 'implement security authentication build develop create test validate verify check audit review performance optimize';
            const intent = 'implement security authentication build develop create test validate verify check audit review performance optimize';
            
            const score = relevanceScorer.scoreContent(highScoringContent, intent, {
                currentPhase: 'WORK',
                recentFiles: ['test.md']
            });
            
            expect(score).toBeLessThanOrEqual(100);
        });
    });

    describe('SmartContextPruner', () => {
        test('should prune memory files based on relevance', () => {
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
            
            const result = contextPruner.pruneMemoryFiles(
                lessons,
                decisions,
                'implement authentication security',
                { currentPhase: 'WORK' }
            );
            
            expect(result.lessons.length).toBeLessThanOrEqual(lessons.length);
            expect(result.decisions.length).toBeLessThanOrEqual(decisions.length);
            expect(result.prunedLessons).toBeGreaterThanOrEqual(0);
            expect(result.prunedDecisions).toBeGreaterThanOrEqual(0);
            
            // Should keep authentication-related lesson
            expect(result.lessons.some(lesson => lesson.includes('authentication'))).toBe(true);
        });

        test('should extract dates from content', () => {
            const contentWithDate = '2025-12-29: This is a decision with a date.';
            const contentWithoutDate = 'This is content without a date.';
            
            const dateExtracted = contextPruner.extractDate(contentWithDate);
            const noDateExtracted = contextPruner.extractDate(contentWithoutDate);
            
            expect(dateExtracted).toBeInstanceOf(Date);
            expect(dateExtracted.getFullYear()).toBe(2025);
            expect(noDateExtracted).toBeNull();
        });

        test('should calculate recency bonus correctly', () => {
            const now = new Date();
            const lastWeek = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
            const lastMonth = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000);
            const lastYear = new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000);
            const veryOld = new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000);
            
            expect(contextPruner.getRecencyBonus(lastWeek)).toBe(20);
            expect(contextPruner.getRecencyBonus(lastMonth)).toBe(15);
            expect(contextPruner.getRecencyBonus(lastYear)).toBe(5);
            expect(contextPruner.getRecencyBonus(veryOld)).toBe(0);
        });

        test('should prune content to target token count', () => {
            const longContent = 'This is a long piece of content. '.repeat(100);
            const originalTokens = tokenEstimator.estimateTokens(longContent);
            const targetTokens = Math.floor(originalTokens / 2);
            
            const prunedContent = contextPruner.pruneContent(longContent, targetTokens, false);
            const prunedTokens = tokenEstimator.estimateTokens(prunedContent);
            
            expect(prunedTokens).toBeLessThanOrEqual(targetTokens * 1.1); // Allow 10% tolerance
            expect(prunedContent.length).toBeLessThan(longContent.length);
        });

        test('should preserve structure when pruning', () => {
            const structuredContent = `# Main Title
            
## Section 1
This is regular content that can be pruned.
More regular content here.

### Subsection
Even more content that might be pruned.

## Section 2
TODO: Important task that should be preserved.
Regular content again.

NOTE: Important note that should be preserved.`;
            
            const targetTokens = Math.floor(tokenEstimator.estimateTokens(structuredContent) / 2);
            const prunedContent = contextPruner.pruneContent(structuredContent, targetTokens, true);
            
            expect(prunedContent).toContain('# Main Title');
            expect(prunedContent).toContain('TODO:');
            expect(prunedContent).toContain('NOTE:');
        });
    });

    describe('ContextManager', () => {
        test('should initialize with default configuration', () => {
            expect(contextManager.tokenBudget).toBe(8000);
            expect(contextManager.currentUsage).toBe(0);
            expect(contextManager.tierLimits).toHaveProperty('discovery');
            expect(contextManager.tierLimits).toHaveProperty('activation');
            expect(contextManager.tierLimits).toHaveProperty('execution');
            expect(contextManager.tierLimits).toHaveProperty('review');
        });

        test('should update session context correctly', () => {
            const updates = {
                currentPhase: 'WORK',
                recentFiles: ['file1.md', 'file2.md'],
                recentActivities: ['activity1', 'activity2']
            };
            
            contextManager.updateSessionContext(updates);
            
            expect(contextManager.sessionContext.currentPhase).toBe('WORK');
            expect(contextManager.sessionContext.recentFiles).toEqual(['file1.md', 'file2.md']);
            expect(contextManager.sessionContext.recentActivities).toEqual(['activity1', 'activity2']);
        });

        test('should maintain recent files limit', () => {
            const manyFiles = Array.from({ length: 15 }, (_, i) => `file${i}.md`);
            
            contextManager.updateSessionContext({ recentFiles: manyFiles });
            
            expect(contextManager.sessionContext.recentFiles.length).toBe(10);
            expect(contextManager.sessionContext.recentFiles[0]).toBe('file0.md');
            expect(contextManager.sessionContext.recentFiles[9]).toBe('file9.md');
        });

        test('should load content within budget', () => {
            const content = 'This is test content for budget testing.';
            const result = contextManager.loadWithBudget(content, 'discovery');
            
            expect(result).toHaveProperty('content');
            expect(result).toHaveProperty('tokens');
            expect(result).toHaveProperty('pruned');
            expect(result).toHaveProperty('tier');
            expect(result.pruned).toBe(false);
            expect(result.tier).toBe('discovery');
        });

        test('should prune content when exceeding tier limit', () => {
            const longContent = 'This is a very long piece of content. '.repeat(200);
            const result = contextManager.loadWithBudget(longContent, 'discovery');
            
            expect(result.pruned).toBe(true);
            expect(result.tokens).toBeLessThanOrEqual(contextManager.tierLimits.discovery);
            expect(result).toHaveProperty('originalTokens');
            expect(result).toHaveProperty('reductionRatio');
        });

        test('should track token usage correctly', () => {
            const content1 = 'First piece of content.';
            const content2 = 'Second piece of content.';
            
            contextManager.resetUsage();
            expect(contextManager.currentUsage).toBe(0);
            
            const result1 = contextManager.loadWithBudget(content1, 'discovery');
            expect(contextManager.currentUsage).toBe(result1.tokens);
            
            const result2 = contextManager.loadWithBudget(content2, 'discovery');
            expect(contextManager.currentUsage).toBe(result1.tokens + result2.tokens);
        });

        test('should calculate remaining budget correctly', () => {
            contextManager.resetUsage();
            const initialRemaining = contextManager.getRemainingBudget();
            expect(initialRemaining).toBe(contextManager.tokenBudget);
            
            const content = 'Test content for budget calculation.';
            const result = contextManager.loadWithBudget(content, 'discovery');
            
            const remainingAfter = contextManager.getRemainingBudget();
            expect(remainingAfter).toBe(contextManager.tokenBudget - result.tokens);
        });

        test('should provide usage statistics', () => {
            contextManager.resetUsage();
            const content = 'Test content for statistics.';
            contextManager.loadWithBudget(content, 'discovery');
            
            const stats = contextManager.getUsageStats();
            
            expect(stats).toHaveProperty('used');
            expect(stats).toHaveProperty('budget');
            expect(stats).toHaveProperty('remaining');
            expect(stats).toHaveProperty('utilization');
            expect(stats.used + stats.remaining).toBe(stats.budget);
            expect(stats.utilization).toBeGreaterThan(0);
            expect(stats.utilization).toBeLessThanOrEqual(100);
        });
    });

    describe('AdaptiveLoader', () => {
        let adaptiveLoader;

        beforeEach(() => {
            adaptiveLoader = new AdaptiveLoader(contextManager);
        });

        test('should determine tier based on user intent', () => {
            expect(adaptiveLoader.determineTier('fix error in authentication', {})).toBe('execution');
            expect(adaptiveLoader.determineTier('implement new feature', {})).toBe('execution');
            expect(adaptiveLoader.determineTier('review code quality', {})).toBe('review');
            expect(adaptiveLoader.determineTier('activate skill', {})).toBe('activation');
            expect(adaptiveLoader.determineTier('explore documentation', {})).toBe('discovery');
        });

        test('should prioritize error contexts', () => {
            const errorContext = { errorContext: 'Authentication failed' };
            const tier = adaptiveLoader.determineTier('help with issue', errorContext);
            expect(tier).toBe('execution');
        });

        test('should identify content sources correctly', () => {
            const sources = adaptiveLoader.identifyContentSources(
                'compound-engineering',
                'implement feature',
                { currentPhase: 'WORK', recentFiles: ['test.md'] }
            );
            
            expect(sources.length).toBeGreaterThan(0);
            expect(sources.some(s => s.type === 'skill')).toBe(true);
            expect(sources.some(s => s.type === 'memory')).toBe(true);
            expect(sources.some(s => s.type === 'workflow')).toBe(true);
            expect(sources.some(s => s.type === 'recent')).toBe(true);
        });

        test('should get content type from file path', () => {
            expect(adaptiveLoader.getContentType('test.js')).toBe('code');
            expect(adaptiveLoader.getContentType('test.ts')).toBe('code');
            expect(adaptiveLoader.getContentType('test.py')).toBe('code');
            expect(adaptiveLoader.getContentType('test.md')).toBe('markdown');
            expect(adaptiveLoader.getContentType('test.txt')).toBe('text');
        });
    });

    describe('ContextOptimizationEngine Integration', () => {
        test('should optimize context with all components working together', () => {
            const result = engine.optimizeContext(
                'compound-engineering',
                'implement authentication security',
                {
                    currentPhase: 'WORK',
                    recentFiles: ['auth.md'],
                    recentActivities: ['created requirements']
                }
            );
            
            expect(result).toHaveProperty('loadedContent');
            expect(result).toHaveProperty('tier');
            expect(result).toHaveProperty('budget');
            expect(result).toHaveProperty('stats');
            expect(result).toHaveProperty('memoryOptimization');
            expect(result).toHaveProperty('recommendations');
            
            expect(Array.isArray(result.loadedContent)).toBe(true);
            expect(Array.isArray(result.recommendations)).toBe(true);
        });

        test('should generate appropriate recommendations', () => {
            // Mock high token usage
            engine.contextManager.currentUsage = 7500; // 93.75% utilization
            
            const result = engine.optimizeContext(
                'compound-engineering',
                'test intent',
                {}
            );
            
            const warningRecommendations = result.recommendations.filter(r => r.type === 'warning');
            expect(warningRecommendations.length).toBeGreaterThan(0);
        });

        test('should provide usage statistics', () => {
            const stats = engine.getUsageStats();
            
            expect(stats).toHaveProperty('used');
            expect(stats).toHaveProperty('budget');
            expect(stats).toHaveProperty('remaining');
            expect(stats).toHaveProperty('utilization');
        });

        test('should update session context', () => {
            const updates = { currentPhase: 'REVIEW' };
            engine.updateSessionContext(updates);
            
            expect(engine.contextManager.sessionContext.currentPhase).toBe('REVIEW');
        });

        test('should estimate tokens correctly', () => {
            const content = 'Test content for token estimation.';
            const tokens = engine.estimateTokens(content);
            
            expect(tokens).toBeGreaterThan(0);
            expect(typeof tokens).toBe('number');
        });

        test('should score relevance correctly', () => {
            const content = 'This is test content about authentication and security.';
            const intent = 'implement authentication';
            const score = engine.scoreRelevance(content, intent);
            
            expect(score).toBeGreaterThan(0);
            expect(score).toBeLessThanOrEqual(100);
        });
    });

    describe('Error Handling', () => {
        test('should handle missing memory files gracefully', () => {
            const result = contextManager.optimizeMemoryFiles(
                'non-existent-lessons.md',
                'non-existent-decisions.md',
                'test intent'
            );
            
            expect(result.lessons).toEqual([]);
            expect(result.decisions).toEqual([]);
            expect(result.stats).toEqual({});
        });

        test('should handle invalid content types', () => {
            expect(tokenEstimator.estimateTokens(null)).toBe(0);
            expect(tokenEstimator.estimateTokens(undefined)).toBe(0);
            expect(tokenEstimator.estimateTokens(123)).toBe(0);
            expect(tokenEstimator.estimateTokens({})).toBe(0);
        });

        test('should handle empty user intent', () => {
            const score = relevanceScorer.scoreContent('test content', '');
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(100);
        });

        test('should handle missing session context', () => {
            const result = engine.optimizeContext('test-skill', 'test intent');
            
            expect(result).toHaveProperty('loadedContent');
            expect(result).toHaveProperty('recommendations');
        });
    });

    describe('Performance Tests', () => {
        test('should handle large content efficiently', () => {
            const largeContent = 'word '.repeat(10000); // ~50KB content
            
            const startTime = Date.now();
            const tokens = tokenEstimator.estimateTokens(largeContent);
            const endTime = Date.now();
            
            expect(tokens).toBeGreaterThan(0);
            expect(endTime - startTime).toBeLessThan(100); // Should complete in <100ms
        });

        test('should handle many memory items efficiently', () => {
            const manyLessons = Array.from({ length: 100 }, (_, i) => `Lesson ${i}: Some learning content.`);
            const manyDecisions = Array.from({ length: 50 }, (_, i) => `2025-12-${(i % 28) + 1}: Decision ${i} content.`);
            
            const startTime = Date.now();
            const result = contextPruner.pruneMemoryFiles(
                manyLessons,
                manyDecisions,
                'test intent',
                {}
            );
            const endTime = Date.now();
            
            expect(result.lessons.length).toBeLessThanOrEqual(15);
            expect(result.decisions.length).toBeLessThanOrEqual(10);
            expect(endTime - startTime).toBeLessThan(500); // Should complete in <500ms
        });
    });
});