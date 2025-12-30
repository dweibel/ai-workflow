/**
 * Context Optimization Engine
 * 
 * Implements smart context management with token budgeting, relevance scoring,
 * and adaptive loading strategies to optimize context window usage while
 * maintaining response quality.
 * 
 * @author Engineering Workflow System
 * @version 1.0.0
 * @date 2025-12-29
 */

const fs = require('fs');
const path = require('path');

class TokenEstimator {
    constructor() {
        // Rough token estimation: ~4 characters per token for English text
        this.CHARS_PER_TOKEN = 4;
        this.CODE_MULTIPLIER = 1.2; // Code is slightly more token-dense
        this.MARKDOWN_MULTIPLIER = 1.1; // Markdown has formatting overhead
    }

    estimateTokens(content, contentType = 'text') {
        if (!content || typeof content !== 'string') return 0;
        
        const baseTokens = Math.ceil(content.length / this.CHARS_PER_TOKEN);
        
        switch (contentType) {
            case 'code':
                return Math.ceil(baseTokens * this.CODE_MULTIPLIER);
            case 'markdown':
                return Math.ceil(baseTokens * this.MARKDOWN_MULTIPLIER);
            default:
                return baseTokens;
        }
    }

    estimateFileTokens(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const ext = path.extname(filePath).toLowerCase();
            
            let contentType = 'text';
            if (['.js', '.ts', '.py', '.java', '.cpp', '.c', '.go', '.rs'].includes(ext)) {
                contentType = 'code';
            } else if (['.md', '.markdown'].includes(ext)) {
                contentType = 'markdown';
            }
            
            return this.estimateTokens(content, contentType);
        } catch (error) {
            return 0;
        }
    }
}

class RelevanceScorer {
    constructor() {
        this.intentKeywords = {
            planning: ['plan', 'design', 'architecture', 'spec', 'requirements', 'analyze'],
            implementation: ['implement', 'code', 'build', 'develop', 'create', 'fix'],
            testing: ['test', 'validate', 'verify', 'check', 'audit', 'review'],
            documentation: ['document', 'readme', 'guide', 'docs', 'explain'],
            debugging: ['error', 'bug', 'issue', 'problem', 'fail', 'broken'],
            security: ['security', 'vulnerability', 'auth', 'permission', 'secure'],
            performance: ['performance', 'optimize', 'speed', 'memory', 'efficiency']
        };

        this.phaseKeywords = {
            PLAN: ['planning', 'documentation', 'architecture'],
            'SPEC-FORGE': ['planning', 'documentation'],
            WORK: ['implementation', 'testing', 'debugging'],
            REVIEW: ['testing', 'security', 'performance', 'documentation']
        };
    }

    scoreContent(content, userIntent, sessionContext = {}) {
        let score = 0;
        const contentLower = content.toLowerCase();
        const intentLower = userIntent.toLowerCase();

        // Intent matching (0-50 points)
        score += this.scoreIntentMatch(contentLower, intentLower);

        // Recent usage boost (0-30 points)
        score += this.scoreRecentUsage(content, sessionContext);

        // Workflow phase relevance (0-40 points)
        score += this.scorePhaseRelevance(contentLower, sessionContext.currentPhase);

        // Content freshness (0-20 points)
        score += this.scoreFreshness(content, sessionContext);

        // Cross-reference importance (0-10 points)
        score += this.scoreCrossReferences(content, sessionContext);

        return Math.min(score, 100); // Cap at 100
    }

    scoreIntentMatch(content, intent) {
        let score = 0;
        
        for (const [category, keywords] of Object.entries(this.intentKeywords)) {
            const intentMatches = keywords.filter(keyword => intent.includes(keyword)).length;
            const contentMatches = keywords.filter(keyword => content.includes(keyword)).length;
            
            if (intentMatches > 0 && contentMatches > 0) {
                score += Math.min(intentMatches * contentMatches * 10, 50);
            }
        }
        
        return Math.min(score, 50);
    }

    scoreRecentUsage(content, sessionContext) {
        if (!sessionContext.recentFiles) return 0;
        
        const recentFiles = sessionContext.recentFiles || [];
        const contentPath = this.extractPathFromContent(content);
        
        if (contentPath && recentFiles.includes(contentPath)) {
            const recency = recentFiles.indexOf(contentPath);
            return Math.max(30 - (recency * 5), 0); // More recent = higher score
        }
        
        return 0;
    }

    scorePhaseRelevance(content, currentPhase) {
        if (!currentPhase || !this.phaseKeywords[currentPhase]) return 0;
        
        const relevantCategories = this.phaseKeywords[currentPhase];
        let score = 0;
        
        for (const category of relevantCategories) {
            const keywords = this.intentKeywords[category] || [];
            const matches = keywords.filter(keyword => content.includes(keyword)).length;
            score += matches * 8; // 8 points per keyword match
        }
        
        return Math.min(score, 40);
    }

    scoreFreshness(content, sessionContext) {
        // Simple heuristic: content with recent dates or version numbers
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        
        if (content.includes(currentYear.toString())) {
            if (content.includes(`${currentYear}-${currentMonth.toString().padStart(2, '0')}`)) {
                return 20; // Very fresh
            }
            return 15; // This year
        }
        
        if (content.includes((currentYear - 1).toString())) {
            return 10; // Last year
        }
        
        return 0;
    }

    scoreCrossReferences(content, sessionContext) {
        // Content with many cross-references is likely more important
        const linkPattern = /\[.*?\]\(.*?\)/g;
        const fileRefPattern = /`[^`]*\.(md|js|ts|py|json|yaml|yml)`/g;
        
        const links = (content.match(linkPattern) || []).length;
        const fileRefs = (content.match(fileRefPattern) || []).length;
        
        return Math.min((links + fileRefs) * 2, 10);
    }

    extractPathFromContent(content) {
        // Try to extract file path from content (simple heuristic)
        const pathPattern = /(?:File|Path|Location):\s*([^\s\n]+)/i;
        const match = content.match(pathPattern);
        return match ? match[1] : null;
    }
}

class SmartContextPruner {
    constructor(tokenEstimator, relevanceScorer) {
        this.tokenEstimator = tokenEstimator;
        this.relevanceScorer = relevanceScorer;
    }

    pruneMemoryFiles(lessons, decisions, currentTask, sessionContext = {}) {
        const taskLower = currentTask.toLowerCase();
        
        // Score and filter lessons
        const scoredLessons = lessons.map(lesson => ({
            content: lesson,
            score: this.relevanceScorer.scoreContent(lesson, currentTask, sessionContext),
            tokens: this.tokenEstimator.estimateTokens(lesson)
        }));

        // Score and filter decisions
        const scoredDecisions = decisions.map(decision => ({
            content: decision,
            score: this.relevanceScorer.scoreContent(decision, currentTask, sessionContext),
            tokens: this.tokenEstimator.estimateTokens(decision),
            date: this.extractDate(decision)
        }));

        // Sort by score and recency
        const relevantLessons = scoredLessons
            .filter(item => item.score > 30) // Minimum relevance threshold
            .sort((a, b) => b.score - a.score)
            .slice(0, 15) // Keep top 15 lessons
            .map(item => item.content);

        const relevantDecisions = scoredDecisions
            .sort((a, b) => {
                // Combine score and recency
                const scoreA = b.score + (b.date ? this.getRecencyBonus(b.date) : 0);
                const scoreB = a.score + (a.date ? this.getRecencyBonus(a.date) : 0);
                return scoreA - scoreB;
            })
            .slice(0, 10) // Keep top 10 decisions
            .map(item => item.content);

        return {
            lessons: relevantLessons,
            decisions: relevantDecisions,
            prunedLessons: lessons.length - relevantLessons.length,
            prunedDecisions: decisions.length - relevantDecisions.length
        };
    }

    extractDate(content) {
        // Extract date from content (YYYY-MM-DD format)
        const datePattern = /(\d{4}-\d{2}-\d{2})/;
        const match = content.match(datePattern);
        return match ? new Date(match[1]) : null;
    }

    getRecencyBonus(date) {
        const now = new Date();
        const daysDiff = (now - date) / (1000 * 60 * 60 * 24);
        
        if (daysDiff < 7) return 20;      // Last week
        if (daysDiff < 30) return 15;     // Last month
        if (daysDiff < 90) return 10;     // Last quarter
        if (daysDiff < 365) return 5;     // Last year
        return 0;
    }

    pruneContent(content, targetTokens, preserveStructure = true) {
        if (!content || typeof content !== 'string') return content;
        
        const currentTokens = this.tokenEstimator.estimateTokens(content);
        if (currentTokens <= targetTokens) return content;
        
        const reductionRatio = targetTokens / currentTokens;
        
        if (preserveStructure) {
            return this.pruneStructuredContent(content, reductionRatio);
        } else {
            return this.pruneSimpleContent(content, reductionRatio);
        }
    }

    pruneStructuredContent(content, reductionRatio) {
        const lines = content.split('\n');
        const targetLines = Math.ceil(lines.length * reductionRatio);
        
        // Preserve headers and important structural elements
        const importantLines = [];
        const regularLines = [];
        
        lines.forEach((line, index) => {
            if (line.startsWith('#') || line.startsWith('##') || 
                line.startsWith('###') || line.trim() === '' ||
                line.includes('TODO') || line.includes('FIXME') ||
                line.includes('NOTE') || line.includes('WARNING')) {
                importantLines.push({ line, index });
            } else {
                regularLines.push({ line, index });
            }
        });
        
        // Keep all important lines and sample from regular lines
        const regularToKeep = Math.max(0, targetLines - importantLines.length);
        const sampledRegular = this.sampleLines(regularLines, regularToKeep);
        
        // Combine and sort by original index
        const keptLines = [...importantLines, ...sampledRegular]
            .sort((a, b) => a.index - b.index)
            .map(item => item.line);
        
        return keptLines.join('\n');
    }

    pruneSimpleContent(content, reductionRatio) {
        const targetLength = Math.ceil(content.length * reductionRatio);
        return content.substring(0, targetLength) + '...';
    }

    sampleLines(lines, targetCount) {
        if (lines.length <= targetCount) return lines;
        
        const step = lines.length / targetCount;
        const sampled = [];
        
        for (let i = 0; i < targetCount; i++) {
            const index = Math.floor(i * step);
            sampled.push(lines[index]);
        }
        
        return sampled;
    }
}

class ContextManager {
    constructor() {
        this.tokenEstimator = new TokenEstimator();
        this.relevanceScorer = new RelevanceScorer();
        this.contextPruner = new SmartContextPruner(this.tokenEstimator, this.relevanceScorer);
        
        // Token budget configuration
        this.tokenBudget = 8000; // Reserve tokens for responses
        this.currentUsage = 0;
        this.tierLimits = {
            discovery: 500,    // Quick exploration
            activation: 2000,  // Skill activation
            execution: 4000,   // Full implementation
            review: 3000       // Code review and audit
        };
        
        // Session context
        this.sessionContext = {
            currentPhase: null,
            recentFiles: [],
            recentActivities: [],
            userPreferences: {},
            errorContext: null
        };
    }

    updateSessionContext(updates) {
        this.sessionContext = { ...this.sessionContext, ...updates };
        
        // Maintain recent files list (max 10)
        if (updates.recentFiles) {
            this.sessionContext.recentFiles = updates.recentFiles.slice(0, 10);
        }
        
        // Maintain recent activities list (max 5)
        if (updates.recentActivities) {
            this.sessionContext.recentActivities = updates.recentActivities.slice(0, 5);
        }
    }

    loadWithBudget(content, tier, userIntent = '', contentType = 'text') {
        const estimatedTokens = this.tokenEstimator.estimateTokens(content, contentType);
        const tierLimit = this.tierLimits[tier] || this.tierLimits.execution;
        
        if (estimatedTokens <= tierLimit) {
            this.currentUsage += estimatedTokens;
            return {
                content,
                tokens: estimatedTokens,
                pruned: false,
                tier
            };
        }
        
        // Content exceeds tier limit, prune it
        const prunedContent = this.contextPruner.pruneContent(content, tierLimit, true);
        const prunedTokens = this.tokenEstimator.estimateTokens(prunedContent, contentType);
        
        this.currentUsage += prunedTokens;
        
        return {
            content: prunedContent,
            tokens: prunedTokens,
            pruned: true,
            originalTokens: estimatedTokens,
            tier,
            reductionRatio: prunedTokens / estimatedTokens
        };
    }

    getRemainingBudget() {
        return Math.max(0, this.tokenBudget - this.currentUsage);
    }

    resetUsage() {
        this.currentUsage = 0;
    }

    getUsageStats() {
        return {
            used: this.currentUsage,
            budget: this.tokenBudget,
            remaining: this.getRemainingBudget(),
            utilization: (this.currentUsage / this.tokenBudget) * 100
        };
    }

    optimizeMemoryFiles(lessonsPath, decisionsPath, userIntent) {
        try {
            const lessons = this.loadMemoryFile(lessonsPath);
            const decisions = this.loadMemoryFile(decisionsPath);
            
            const optimized = this.contextPruner.pruneMemoryFiles(
                lessons, 
                decisions, 
                userIntent, 
                this.sessionContext
            );
            
            return {
                lessons: optimized.lessons,
                decisions: optimized.decisions,
                stats: {
                    originalLessons: lessons.length,
                    optimizedLessons: optimized.lessons.length,
                    prunedLessons: optimized.prunedLessons,
                    originalDecisions: decisions.length,
                    optimizedDecisions: optimized.decisions.length,
                    prunedDecisions: optimized.prunedDecisions
                }
            };
        } catch (error) {
            console.warn('Failed to optimize memory files:', error.message);
            return { lessons: [], decisions: [], stats: {} };
        }
    }

    loadMemoryFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            // Simple parsing: split by bullet points or numbered lists
            return content
                .split(/\n[-*]\s+|\n\d+\.\s+/)
                .filter(item => item.trim().length > 0)
                .map(item => item.trim());
        } catch (error) {
            return [];
        }
    }
}

class AdaptiveLoader {
    constructor(contextManager) {
        this.contextManager = contextManager;
    }

    loadContext(skillName, userIntent, sessionContext = {}) {
        this.contextManager.updateSessionContext(sessionContext);
        
        const budget = this.contextManager.getRemainingBudget();
        const tier = this.determineTier(userIntent, sessionContext);
        
        // Get relevant content sources
        const contentSources = this.identifyContentSources(skillName, userIntent, sessionContext);
        
        // Score and rank content
        const rankedContent = this.scoreAndRankContent(contentSources, userIntent, sessionContext);
        
        // Load content within budget
        const loadedContent = this.loadWithinBudget(rankedContent, tier, budget);
        
        return {
            loadedContent,
            tier,
            budget,
            stats: this.contextManager.getUsageStats(),
            sessionContext: this.contextManager.sessionContext
        };
    }

    determineTier(userIntent, sessionContext) {
        const intentLower = userIntent.toLowerCase();
        
        // Error-driven requests get higher priority
        if (sessionContext.errorContext || 
            ['error', 'bug', 'fail', 'broken', 'issue'].some(word => intentLower.includes(word))) {
            return 'execution';
        }
        
        // Review and audit requests (check before implementation to avoid conflicts)
        if (['review', 'audit', 'check', 'validate', 'test'].some(word => intentLower.includes(word))) {
            return 'review';
        }
        
        // Implementation requests
        if (['implement', 'build', 'create', 'develop', 'code'].some(word => intentLower.includes(word))) {
            return 'execution';
        }
        
        // Skill activation requests
        if (['activate', 'use', 'run', 'execute'].some(word => intentLower.includes(word))) {
            return 'activation';
        }
        
        // Default to discovery for exploration
        return 'discovery';
    }

    identifyContentSources(skillName, userIntent, sessionContext) {
        const sources = [];
        
        // Core skill files
        if (skillName) {
            sources.push({
                type: 'skill',
                path: `.ai/skills/${skillName}/SKILL.md`,
                priority: 'high'
            });
        }
        
        // Memory files (always relevant)
        sources.push(
            {
                type: 'memory',
                path: '.ai/memory/lessons.md',
                priority: 'high'
            },
            {
                type: 'memory',
                path: '.ai/memory/decisions.md',
                priority: 'high'
            }
        );
        
        // Workflow files based on current phase
        if (sessionContext.currentPhase) {
            sources.push({
                type: 'workflow',
                path: `.ai/workflows/${sessionContext.currentPhase.toLowerCase()}.md`,
                priority: 'medium'
            });
        }
        
        // Recent files
        if (sessionContext.recentFiles) {
            sessionContext.recentFiles.forEach(filePath => {
                sources.push({
                    type: 'recent',
                    path: filePath,
                    priority: 'medium'
                });
            });
        }
        
        return sources;
    }

    scoreAndRankContent(contentSources, userIntent, sessionContext) {
        const scoredContent = [];
        
        for (const source of contentSources) {
            try {
                const content = fs.readFileSync(source.path, 'utf8');
                const score = this.contextManager.relevanceScorer.scoreContent(
                    content, 
                    userIntent, 
                    sessionContext
                );
                
                // Boost score based on priority
                const priorityBoost = {
                    'high': 20,
                    'medium': 10,
                    'low': 0
                }[source.priority] || 0;
                
                scoredContent.push({
                    ...source,
                    content,
                    score: score + priorityBoost,
                    tokens: this.contextManager.tokenEstimator.estimateTokens(content)
                });
            } catch (error) {
                // Skip files that can't be read
                continue;
            }
        }
        
        // Sort by score (highest first)
        return scoredContent.sort((a, b) => b.score - a.score);
    }

    loadWithinBudget(rankedContent, tier, budget) {
        const loadedContent = [];
        let usedTokens = 0;
        const tierLimit = this.contextManager.tierLimits[tier];
        
        for (const content of rankedContent) {
            const availableTokens = Math.min(budget - usedTokens, tierLimit - usedTokens);
            
            if (availableTokens <= 0) break;
            
            const loadResult = this.contextManager.loadWithBudget(
                content.content,
                tier,
                '', // userIntent already used for scoring
                this.getContentType(content.path)
            );
            
            loadedContent.push({
                ...content,
                loadResult
            });
            
            usedTokens += loadResult.tokens;
            
            if (usedTokens >= tierLimit) break;
        }
        
        return loadedContent;
    }

    getContentType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        
        if (['.js', '.ts', '.py', '.java', '.cpp', '.c', '.go', '.rs'].includes(ext)) {
            return 'code';
        } else if (['.md', '.markdown'].includes(ext)) {
            return 'markdown';
        }
        
        return 'text';
    }
}

class ContextOptimizationEngine {
    constructor() {
        this.contextManager = new ContextManager();
        this.adaptiveLoader = new AdaptiveLoader(this.contextManager);
        this.tokenEstimator = new TokenEstimator();
        this.relevanceScorer = new RelevanceScorer();
    }

    optimizeContext(skillName, userIntent, sessionContext = {}) {
        // Reset usage for new context loading
        this.contextManager.resetUsage();
        
        // Load optimized context
        const result = this.adaptiveLoader.loadContext(skillName, userIntent, sessionContext);
        
        // Optimize memory files if needed
        const memoryOptimization = this.contextManager.optimizeMemoryFiles(
            '.ai/memory/lessons.md',
            '.ai/memory/decisions.md',
            userIntent
        );
        
        return {
            ...result,
            memoryOptimization,
            recommendations: this.generateRecommendations(result, memoryOptimization)
        };
    }

    generateRecommendations(contextResult, memoryOptimization) {
        const recommendations = [];
        const stats = contextResult.stats;
        
        // Budget utilization recommendations
        if (stats.utilization > 90) {
            recommendations.push({
                type: 'warning',
                message: 'High token usage detected. Consider using more specific queries.',
                action: 'Use more targeted keywords to reduce context loading.'
            });
        } else if (stats.utilization < 30) {
            recommendations.push({
                type: 'info',
                message: 'Low token usage. More context could be loaded if needed.',
                action: 'Consider loading additional relevant documentation.'
            });
        }
        
        // Memory optimization recommendations
        if (memoryOptimization.stats.prunedLessons > 10) {
            recommendations.push({
                type: 'info',
                message: `Pruned ${memoryOptimization.stats.prunedLessons} less relevant lessons.`,
                action: 'Consider consolidating similar lessons to reduce memory file size.'
            });
        }
        
        // Content loading recommendations
        const prunedContent = contextResult.loadedContent.filter(item => item.loadResult.pruned);
        if (prunedContent.length > 0) {
            recommendations.push({
                type: 'warning',
                message: `${prunedContent.length} files were pruned due to size constraints.`,
                action: 'Use more specific queries or increase tier limits if full content is needed.'
            });
        }
        
        return recommendations;
    }

    getUsageStats() {
        return this.contextManager.getUsageStats();
    }

    updateSessionContext(updates) {
        this.contextManager.updateSessionContext(updates);
    }

    estimateTokens(content, contentType = 'text') {
        return this.tokenEstimator.estimateTokens(content, contentType);
    }

    scoreRelevance(content, userIntent, sessionContext = {}) {
        return this.relevanceScorer.scoreContent(content, userIntent, sessionContext);
    }
}

module.exports = {
    ContextOptimizationEngine,
    ContextManager,
    AdaptiveLoader,
    SmartContextPruner,
    RelevanceScorer,
    TokenEstimator
};