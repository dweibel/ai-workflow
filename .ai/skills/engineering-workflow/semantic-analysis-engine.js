/**
 * Semantic Analysis Engine for Engineering Workflow Skill Activation
 * 
 * Provides sophisticated semantic analysis with confidence scoring,
 * context awareness, and precedence rules for skill activation.
 */

const fs = require('fs');
const path = require('path');

class SemanticAnalysisEngine {
    constructor() {
        this.sessionContext = {
            currentPhase: null,
            recentActivities: [],
            activeFiles: [],
            workflowProgress: {
                specForge: 'pending',
                planning: 'pending',
                work: 'pending',
                review: 'pending'
            },
            userPreferences: {
                preferredWorkflow: 'tdd-first',
                reviewDepth: 'comprehensive',
                documentationLevel: 'detailed'
            },
            corrections: []
        };

        this.skillDefinitions = this.loadSkillDefinitions();
        this.triggerPatterns = this.initializeTriggerPatterns();
        this.contextPatterns = this.initializeContextPatterns();
    }

    /**
     * Load skill definitions from SKILL.md files
     */
    loadSkillDefinitions() {
        const skills = {};
        const skillsDir = path.join('.ai', 'skills');
        
        try {
            const skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);

            for (const skillDir of skillDirs) {
                const skillPath = path.join(skillsDir, skillDir, 'SKILL.md');
                if (fs.existsSync(skillPath)) {
                    const content = fs.readFileSync(skillPath, 'utf8');
                    const metadata = this.extractSkillMetadata(content);
                    if (metadata) {
                        skills[skillDir] = metadata;
                    }
                }
            }
        } catch (error) {
            console.warn('Could not load skill definitions:', error.message);
        }

        return skills;
    }

    /**
     * Extract metadata from SKILL.md YAML frontmatter
     */
    extractSkillMetadata(content) {
        const normalizedContent = content.replace(/\r\n/g, '\n');
        
        if (!normalizedContent.startsWith('---')) {
            return null;
        }

        const frontmatterEnd = normalizedContent.indexOf('\n---\n', 3);
        if (frontmatterEnd === -1) {
            return null;
        }

        const frontmatter = normalizedContent.substring(3, frontmatterEnd);
        const metadata = {};

        // Extract key fields
        const nameMatch = frontmatter.match(/name:\s*([^\r\n]+)/);
        const descMatch = frontmatter.match(/description:\s*([^\r\n]+)/);
        const versionMatch = frontmatter.match(/version:\s*([^\r\n]+)/);

        if (nameMatch) metadata.name = nameMatch[1].trim();
        if (descMatch) metadata.description = descMatch[1].trim();
        if (versionMatch) metadata.version = versionMatch[1].trim();

        return metadata;
    }

    /**
     * Initialize trigger patterns with confidence weights
     */
    initializeTriggerPatterns() {
        return {
            // Tier 1: Exact Matches (95-100%)
            exact: {
                'engineering-workflow': { skill: 'engineering-workflow', confidence: 100 },
                'spec-forge': { skill: 'ears-specification', confidence: 98 },
                'ears-specification': { skill: 'ears-specification', confidence: 100 },
                'git-workflow': { skill: 'git-workflow', confidence: 100 },
                'testing-framework': { skill: 'testing-framework', confidence: 100 }
            },

            // Tier 2: Primary Intent (85-94%)
            primary: {
                'structured development': { skill: 'engineering-workflow', confidence: 92 },
                'formal methodology': { skill: 'engineering-workflow', confidence: 90 },
                'create requirements': { skill: 'ears-specification', confidence: 92 },
                'implement feature': { skill: 'git-workflow', confidence: 90 },
                'review code': { skill: 'testing-framework', confidence: 92 },
                'security audit': { skill: 'testing-framework', confidence: 94 },
                'git worktree': { skill: 'git-workflow', confidence: 88 },
                'isolated environment': { skill: 'git-workflow', confidence: 85 }
            },

            // Tier 3: Semantic Intent (70-84%)
            semantic: {
                'user story': { skill: 'ears-specification', confidence: 82 },
                'acceptance criteria': { skill: 'ears-specification', confidence: 80 },
                'test coverage': { skill: 'testing-framework', confidence: 78 },
                'need to document': { skill: 'ears-specification', confidence: 75 },
                'should validate': { skill: 'testing-framework', confidence: 77 },
                'time to implement': { skill: 'git-workflow', confidence: 74 },
                'build feature': { skill: 'git-workflow', confidence: 82 },
                'fix bug': { skill: 'git-workflow', confidence: 80 }
            },

            // Tier 4: Contextual Inference (50-69%)
            contextual: {
                'authentication not working': { skill: 'git-workflow', confidence: 65, context: 'error' },
                'requirements unclear': { skill: 'ears-specification', confidence: 68, context: 'clarification' },
                'is this secure': { skill: 'testing-framework', confidence: 70, context: 'security' },
                'ready for production': { skill: 'testing-framework', confidence: 72, context: 'deployment' },
                'tests are failing': { skill: 'testing-framework', confidence: 75, context: 'debugging' }
            }
        };
    }

    /**
     * Initialize context-aware patterns
     */
    initializeContextPatterns() {
        return {
            sequential: {
                'created requirements': { next: 'git-workflow', confidence: 92 },
                'finished implementation': { next: 'testing-framework', confidence: 94 },
                'review completed': { next: 'ears-specification', confidence: 88 },
                'approved design': { next: 'git-workflow', confidence: 90 }
            },

            errorDriven: {
                'tests failing': { skill: 'testing-framework', confidence: 85 },
                'git conflicts': { skill: 'git-workflow', confidence: 90 },
                'security vulnerability': { skill: 'testing-framework', confidence: 98, persona: 'security' },
                'performance issue': { skill: 'testing-framework', confidence: 88, persona: 'performance' }
            },

            temporal: {
                'session-start': { skill: 'engineering-workflow', confidence: 75 },
                'after-long-implementation': { skill: 'testing-framework', confidence: 80 },
                'beginning-of-sprint': { skill: 'ears-specification', confidence: 85 },
                'end-of-sprint': { skill: 'testing-framework', confidence: 90 }
            }
        };
    }

    /**
     * Analyze user input and return skill activation recommendations
     */
    analyzeInput(userInput, sessionContext = {}) {
        // Update session context
        this.updateSessionContext(sessionContext);

        const input = userInput.toLowerCase().trim();
        const results = [];

        // Check exact matches first
        results.push(...this.checkExactMatches(input));

        // Check primary intent patterns
        results.push(...this.checkPrimaryIntent(input));

        // Check semantic patterns
        results.push(...this.checkSemanticPatterns(input));

        // Check contextual patterns
        results.push(...this.checkContextualPatterns(input));

        // Apply context-aware adjustments
        const adjustedResults = this.applyContextAdjustments(results, input);

        // Sort by confidence and apply precedence rules
        const finalResults = this.applyPrecedenceRules(adjustedResults);

        return {
            recommendations: finalResults.slice(0, 3), // Top 3 recommendations
            analysis: {
                input: userInput,
                processedInput: input,
                totalMatches: results.length,
                contextFactors: this.getContextFactors(),
                confidence: finalResults.length > 0 ? finalResults[0].confidence : 0
            }
        };
    }

    /**
     * Check for exact trigger matches
     */
    checkExactMatches(input) {
        const results = [];
        
        for (const [trigger, config] of Object.entries(this.triggerPatterns.exact)) {
            if (input.includes(trigger)) {
                results.push({
                    skill: config.skill,
                    confidence: config.confidence,
                    trigger: trigger,
                    type: 'exact',
                    reasoning: `Exact match for "${trigger}"`
                });
            }
        }

        return results;
    }

    /**
     * Check for primary intent patterns
     */
    checkPrimaryIntent(input) {
        const results = [];
        
        for (const [trigger, config] of Object.entries(this.triggerPatterns.primary)) {
            if (input.includes(trigger)) {
                results.push({
                    skill: config.skill,
                    confidence: config.confidence,
                    trigger: trigger,
                    type: 'primary',
                    reasoning: `Primary intent match for "${trigger}"`
                });
            }
        }

        return results;
    }

    /**
     * Check for semantic patterns
     */
    checkSemanticPatterns(input) {
        const results = [];
        
        for (const [trigger, config] of Object.entries(this.triggerPatterns.semantic)) {
            if (input.includes(trigger)) {
                results.push({
                    skill: config.skill,
                    confidence: config.confidence,
                    trigger: trigger,
                    type: 'semantic',
                    reasoning: `Semantic match for "${trigger}"`
                });
            }
        }

        return results;
    }

    /**
     * Check for contextual patterns
     */
    checkContextualPatterns(input) {
        const results = [];
        
        for (const [trigger, config] of Object.entries(this.triggerPatterns.contextual)) {
            if (input.includes(trigger)) {
                results.push({
                    skill: config.skill,
                    confidence: config.confidence,
                    trigger: trigger,
                    type: 'contextual',
                    context: config.context,
                    reasoning: `Contextual match for "${trigger}" (${config.context})`
                });
            }
        }

        return results;
    }

    /**
     * Apply context-aware adjustments to confidence scores
     */
    applyContextAdjustments(results, input) {
        return results.map(result => {
            let adjustedConfidence = result.confidence;
            let adjustmentReasons = [];

            // Sequential workflow context
            if (this.sessionContext.recentActivities.length > 0) {
                const lastActivity = this.sessionContext.recentActivities[this.sessionContext.recentActivities.length - 1];
                const sequentialPattern = this.contextPatterns.sequential[lastActivity];
                
                if (sequentialPattern && sequentialPattern.next === result.skill) {
                    adjustedConfidence = Math.min(100, adjustedConfidence + 10);
                    adjustmentReasons.push('Sequential workflow progression');
                }
            }

            // Error-driven context
            for (const [errorPattern, config] of Object.entries(this.contextPatterns.errorDriven)) {
                if (input.includes(errorPattern) && config.skill === result.skill) {
                    adjustedConfidence = Math.min(100, adjustedConfidence + 15);
                    adjustmentReasons.push(`Error-driven activation (${errorPattern})`);
                    if (config.persona) {
                        result.persona = config.persona;
                    }
                }
            }

            // Urgency detection
            const urgencyKeywords = ['critical', 'urgent', 'emergency', 'production', 'blocker'];
            if (urgencyKeywords.some(keyword => input.includes(keyword))) {
                adjustedConfidence = Math.min(100, adjustedConfidence + 8);
                adjustmentReasons.push('Urgency detected');
                result.priority = 'high';
            }

            // Multi-intent detection
            const intentCount = results.filter(r => r.skill === result.skill).length;
            if (intentCount > 1) {
                adjustedConfidence = Math.min(100, adjustedConfidence + 5);
                adjustmentReasons.push('Multiple intent indicators');
            }

            return {
                ...result,
                confidence: adjustedConfidence,
                originalConfidence: result.confidence,
                adjustmentReasons
            };
        });
    }

    /**
     * Apply precedence rules and sort results
     */
    applyPrecedenceRules(results) {
        // Group by skill and take highest confidence for each
        const skillMap = new Map();
        
        for (const result of results) {
            const existing = skillMap.get(result.skill);
            if (!existing || result.confidence > existing.confidence) {
                skillMap.set(result.skill, result);
            }
        }

        // Convert back to array and sort
        const uniqueResults = Array.from(skillMap.values());
        
        return uniqueResults.sort((a, b) => {
            // Priority override
            if (a.priority === 'high' && b.priority !== 'high') return -1;
            if (b.priority === 'high' && a.priority !== 'high') return 1;
            
            // Confidence score
            if (b.confidence !== a.confidence) return b.confidence - a.confidence;
            
            // Type precedence (exact > primary > semantic > contextual)
            const typePrecedence = { exact: 4, primary: 3, semantic: 2, contextual: 1 };
            return (typePrecedence[b.type] || 0) - (typePrecedence[a.type] || 0);
        });
    }

    /**
     * Update session context with new information
     */
    updateSessionContext(newContext) {
        if (newContext.currentPhase) {
            this.sessionContext.currentPhase = newContext.currentPhase;
        }
        
        if (newContext.recentActivities) {
            this.sessionContext.recentActivities = [
                ...this.sessionContext.recentActivities,
                ...newContext.recentActivities
            ].slice(-5); // Keep last 5 activities
        }
        
        if (newContext.activeFiles) {
            this.sessionContext.activeFiles = newContext.activeFiles;
        }
        
        if (newContext.workflowProgress) {
            this.sessionContext.workflowProgress = {
                ...this.sessionContext.workflowProgress,
                ...newContext.workflowProgress
            };
        }
    }

    /**
     * Get current context factors for analysis
     */
    getContextFactors() {
        return {
            currentPhase: this.sessionContext.currentPhase,
            recentActivitiesCount: this.sessionContext.recentActivities.length,
            activeFilesCount: this.sessionContext.activeFiles.length,
            workflowProgress: this.sessionContext.workflowProgress,
            hasRecentCorrections: this.sessionContext.corrections.length > 0
        };
    }

    /**
     * Learn from user corrections to improve future recommendations
     */
    learnFromCorrection(originalRecommendation, userChoice, context) {
        const correction = {
            timestamp: new Date().toISOString(),
            originalRecommendation,
            userChoice,
            context,
            input: context.input
        };

        this.sessionContext.corrections.push(correction);

        // Apply immediate learning adjustments
        this.adjustPatternsFromCorrection(correction);
    }

    /**
     * Adjust patterns based on user corrections
     */
    adjustPatternsFromCorrection(correction) {
        // This would implement machine learning adjustments
        // For now, we'll do simple pattern adjustments
        
        const input = correction.input.toLowerCase();
        const chosenSkill = correction.userChoice;
        
        // If user consistently chooses a different skill for certain patterns,
        // we can adjust the confidence scoring
        
        // Example: If user corrects "implement" to always mean "review first",
        // we can lower the confidence of git-workflow for "implement" patterns
        
        console.log(`Learning: User chose ${chosenSkill} instead of ${correction.originalRecommendation.skill} for input: "${input}"`);
    }

    /**
     * Generate explanation for activation decision
     */
    generateExplanation(recommendation, analysis) {
        let explanation = `Recommended ${recommendation.skill} with ${recommendation.confidence}% confidence.\n\n`;
        
        explanation += `Reasoning: ${recommendation.reasoning}\n`;
        
        if (recommendation.adjustmentReasons && recommendation.adjustmentReasons.length > 0) {
            explanation += `Context adjustments: ${recommendation.adjustmentReasons.join(', ')}\n`;
        }
        
        if (recommendation.persona) {
            explanation += `Suggested persona: ${recommendation.persona}\n`;
        }
        
        if (recommendation.priority) {
            explanation += `Priority level: ${recommendation.priority}\n`;
        }
        
        explanation += `\nContext factors:\n`;
        explanation += `- Current phase: ${analysis.contextFactors.currentPhase || 'none'}\n`;
        explanation += `- Recent activities: ${analysis.contextFactors.recentActivitiesCount}\n`;
        explanation += `- Active files: ${analysis.contextFactors.activeFilesCount}\n`;
        
        return explanation;
    }
}

module.exports = SemanticAnalysisEngine;