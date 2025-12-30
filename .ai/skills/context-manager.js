/**
 * EARS-Workflow Context Manager
 * 
 * Implements progressive disclosure for skill context management.
 * Manages token-efficient loading of skill metadata and instructions.
 * Provides incremental loading for multiple sub-skills.
 * 
 * @version 1.0.0
 * @author EARS-Workflow System
 */

const fs = require('fs');
const path = require('path');

class ContextManager {
    constructor() {
        // Context tiers for progressive disclosure
        this.CONTEXT_TIERS = {
            DISCOVERY: 'discovery',     // Minimal metadata for skill detection (~50 tokens)
            ACTIVATION: 'activation',   // Phase-specific instructions (~500-1000 tokens)
            EXECUTION: 'execution'      // Supporting files and detailed procedures (variable)
        };

        // Token limits for context management
        this.TOKEN_LIMITS = {
            DISCOVERY_PER_SKILL: 50,
            ACTIVATION_PER_SKILL: 1000,
            EXECUTION_PER_FILE: 2000,
            TOTAL_CONTEXT_LIMIT: 8000
        };

        // Current context state
        this.loadedContext = {
            discovery: new Map(),       // skill -> metadata
            activation: new Map(),      // skill -> instructions
            execution: new Map()        // file -> content
        };

        // Active skills tracking
        this.activeSkills = new Set();
        this.inactiveSkills = new Set();
        
        // Context usage tracking
        this.tokenUsage = {
            discovery: 0,
            activation: 0,
            execution: 0,
            total: 0
        };

        // Skill directory paths
        this.skillsPath = path.join(process.cwd(), '.ai', 'skills');
        this.mainSkillPath = path.join(process.cwd(), '.ai', 'SKILL.md');
    }

    /**
     * Initialize context manager and load discovery metadata for all skills
     * @returns {Promise<Object>} Initialization result with loaded skills
     */
    async initialize() {
        try {
            // Load main skill metadata
            const mainSkillMetadata = await this.loadSkillMetadata(this.mainSkillPath);
            if (mainSkillMetadata) {
                this.loadedContext.discovery.set('ears-workflow', mainSkillMetadata);
                this.inactiveSkills.add('ears-workflow');
            }

            // Discover all sub-skills
            const subSkills = await this.discoverSubSkills();
            
            // Load discovery metadata for all sub-skills
            for (const skillName of subSkills) {
                const skillPath = path.join(this.skillsPath, skillName, 'SKILL.md');
                const metadata = await this.loadSkillMetadata(skillPath);
                
                if (metadata) {
                    this.loadedContext.discovery.set(skillName, metadata);
                    this.inactiveSkills.add(skillName);
                }
            }

            // Calculate discovery token usage
            this.updateTokenUsage();

            return {
                success: true,
                skillsLoaded: this.loadedContext.discovery.size,
                discoveryTokens: this.tokenUsage.discovery,
                availableSkills: Array.from(this.inactiveSkills)
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                skillsLoaded: 0
            };
        }
    }

    /**
     * Activate a skill and load its detailed instructions
     * @param {string} skillName - Name of the skill to activate
     * @returns {Promise<Object>} Activation result with loaded context
     */
    async activateSkill(skillName) {
        try {
            // Validate skill exists
            if (!this.inactiveSkills.has(skillName) && !this.activeSkills.has(skillName)) {
                throw new Error(`Skill '${skillName}' not found`);
            }

            // Skip if already active
            if (this.activeSkills.has(skillName)) {
                return {
                    success: true,
                    alreadyActive: true,
                    skillName: skillName,
                    tokensUsed: 0
                };
            }

            // Check context limits before activation
            const estimatedTokens = this.TOKEN_LIMITS.ACTIVATION_PER_SKILL;
            if (this.tokenUsage.total + estimatedTokens > this.TOKEN_LIMITS.TOTAL_CONTEXT_LIMIT) {
                // Attempt to free up context by deactivating least recently used skills
                const freed = await this.freeContextSpace(estimatedTokens);
                if (!freed) {
                    throw new Error('Context limit exceeded and unable to free sufficient space');
                }
            }

            // Load skill instructions
            const instructions = await this.loadSkillInstructions(skillName);
            if (!instructions) {
                throw new Error(`Failed to load instructions for skill '${skillName}'`);
            }

            // Update context state
            this.loadedContext.activation.set(skillName, instructions);
            this.activeSkills.add(skillName);
            this.inactiveSkills.delete(skillName);

            // Update token usage
            this.updateTokenUsage();

            return {
                success: true,
                skillName: skillName,
                tokensUsed: this.estimateTokens(instructions.content),
                totalTokens: this.tokenUsage.total,
                contextTier: this.CONTEXT_TIERS.ACTIVATION
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                skillName: skillName
            };
        }
    }

    /**
     * Deactivate a skill and unload its detailed instructions
     * @param {string} skillName - Name of the skill to deactivate
     * @returns {Object} Deactivation result
     */
    deactivateSkill(skillName) {
        try {
            // Validate skill is active
            if (!this.activeSkills.has(skillName)) {
                return {
                    success: true,
                    alreadyInactive: true,
                    skillName: skillName,
                    tokensFreed: 0
                };
            }

            // Calculate tokens to be freed
            const instructions = this.loadedContext.activation.get(skillName);
            const tokensFreed = instructions ? this.estimateTokens(instructions.content) : 0;

            // Remove from active context
            this.loadedContext.activation.delete(skillName);
            this.activeSkills.delete(skillName);
            this.inactiveSkills.add(skillName);

            // Update token usage
            this.updateTokenUsage();

            return {
                success: true,
                skillName: skillName,
                tokensFreed: tokensFreed,
                totalTokens: this.tokenUsage.total
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                skillName: skillName
            };
        }
    }

    /**
     * Load execution-tier supporting files incrementally
     * @param {string} filePath - Path to the file to load
     * @param {string} skillContext - Associated skill context
     * @returns {Promise<Object>} File loading result
     */
    async loadSupportingFile(filePath, skillContext = null) {
        try {
            // Check if file already loaded
            if (this.loadedContext.execution.has(filePath)) {
                return {
                    success: true,
                    alreadyLoaded: true,
                    filePath: filePath,
                    tokensUsed: 0
                };
            }

            // Check context limits
            const estimatedTokens = this.TOKEN_LIMITS.EXECUTION_PER_FILE;
            if (this.tokenUsage.total + estimatedTokens > this.TOKEN_LIMITS.TOTAL_CONTEXT_LIMIT) {
                const freed = await this.freeContextSpace(estimatedTokens);
                if (!freed) {
                    throw new Error('Context limit exceeded for supporting file');
                }
            }

            // Load file content
            const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
            const content = await fs.promises.readFile(absolutePath, 'utf8');

            // Store in execution context
            this.loadedContext.execution.set(filePath, {
                content: content,
                skillContext: skillContext,
                loadedAt: new Date(),
                tokens: this.estimateTokens(content)
            });

            // Update token usage
            this.updateTokenUsage();

            return {
                success: true,
                filePath: filePath,
                tokensUsed: this.estimateTokens(content),
                totalTokens: this.tokenUsage.total,
                contextTier: this.CONTEXT_TIERS.EXECUTION
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                filePath: filePath
            };
        }
    }

    /**
     * Unload supporting files to free context space
     * @param {string|Array} filePaths - File path(s) to unload
     * @returns {Object} Unloading result
     */
    unloadSupportingFiles(filePaths) {
        try {
            const paths = Array.isArray(filePaths) ? filePaths : [filePaths];
            let totalTokensFreed = 0;

            for (const filePath of paths) {
                const fileData = this.loadedContext.execution.get(filePath);
                if (fileData) {
                    totalTokensFreed += fileData.tokens;
                    this.loadedContext.execution.delete(filePath);
                }
            }

            // Update token usage
            this.updateTokenUsage();

            return {
                success: true,
                filesUnloaded: paths.length,
                tokensFreed: totalTokensFreed,
                totalTokens: this.tokenUsage.total
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get current context status and usage
     * @returns {Object} Context status information
     */
    getContextStatus() {
        return {
            tokenUsage: { ...this.tokenUsage },
            tokenLimits: { ...this.TOKEN_LIMITS },
            utilizationPercent: Math.round((this.tokenUsage.total / this.TOKEN_LIMITS.TOTAL_CONTEXT_LIMIT) * 100),
            activeSkills: Array.from(this.activeSkills),
            inactiveSkills: Array.from(this.inactiveSkills),
            loadedFiles: Array.from(this.loadedContext.execution.keys()),
            contextTiers: {
                discovery: this.loadedContext.discovery.size,
                activation: this.loadedContext.activation.size,
                execution: this.loadedContext.execution.size
            }
        };
    }

    /**
     * Get minimal metadata for skill discovery (Tier 1)
     * @param {string} skillName - Name of the skill
     * @returns {Object|null} Skill metadata or null if not found
     */
    getSkillMetadata(skillName) {
        return this.loadedContext.discovery.get(skillName) || null;
    }

    /**
     * Get all available skills with minimal metadata
     * @returns {Object} All skills with discovery metadata
     */
    getAllSkillsMetadata() {
        const skills = {};
        for (const [skillName, metadata] of this.loadedContext.discovery) {
            skills[skillName] = {
                name: metadata.name,
                description: metadata.description,
                version: metadata.version,
                phase: metadata.phase,
                active: this.activeSkills.has(skillName),
                tokens: this.TOKEN_LIMITS.DISCOVERY_PER_SKILL
            };
        }
        return skills;
    }

    /**
     * Discover all available sub-skills in the skills directory
     * @returns {Promise<Array>} Array of skill names
     */
    async discoverSubSkills() {
        try {
            const entries = await fs.promises.readdir(this.skillsPath, { withFileTypes: true });
            const subSkills = [];

            for (const entry of entries) {
                if (entry.isDirectory() && !entry.name.startsWith('_')) {
                    const skillPath = path.join(this.skillsPath, entry.name, 'SKILL.md');
                    try {
                        await fs.promises.access(skillPath);
                        subSkills.push(entry.name);
                    } catch {
                        // Skip directories without SKILL.md
                    }
                }
            }

            return subSkills;

        } catch (error) {
            return [];
        }
    }

    /**
     * Load skill metadata from SKILL.md file
     * @param {string} skillPath - Path to SKILL.md file
     * @returns {Promise<Object|null>} Parsed metadata or null
     */
    async loadSkillMetadata(skillPath) {
        try {
            const content = await fs.promises.readFile(skillPath, 'utf8');
            const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
            
            if (!yamlMatch) {
                return null;
            }

            // Simple YAML parsing for frontmatter
            const yamlContent = yamlMatch[1];
            const metadata = {};
            
            const lines = yamlContent.split('\n');
            for (const line of lines) {
                const match = line.match(/^(\w+):\s*(.+)$/);
                if (match) {
                    metadata[match[1]] = match[2].replace(/^["']|["']$/g, '');
                }
            }

            return {
                ...metadata,
                tokens: this.TOKEN_LIMITS.DISCOVERY_PER_SKILL,
                loadedAt: new Date()
            };

        } catch (error) {
            return null;
        }
    }

    /**
     * Load detailed skill instructions
     * @param {string} skillName - Name of the skill
     * @returns {Promise<Object|null>} Skill instructions or null
     */
    async loadSkillInstructions(skillName) {
        try {
            let skillPath;
            
            if (skillName === 'ears-workflow') {
                skillPath = this.mainSkillPath;
            } else {
                skillPath = path.join(this.skillsPath, skillName, 'SKILL.md');
            }

            const content = await fs.promises.readFile(skillPath, 'utf8');
            
            return {
                skillName: skillName,
                content: content,
                tokens: this.estimateTokens(content),
                loadedAt: new Date()
            };

        } catch (error) {
            return null;
        }
    }

    /**
     * Estimate token count for content (rough approximation)
     * @param {string} content - Content to estimate
     * @returns {number} Estimated token count
     */
    estimateTokens(content) {
        if (!content) return 0;
        
        // Rough estimation: ~4 characters per token
        return Math.ceil(content.length / 4);
    }

    /**
     * Update token usage calculations
     */
    updateTokenUsage() {
        this.tokenUsage.discovery = this.loadedContext.discovery.size * this.TOKEN_LIMITS.DISCOVERY_PER_SKILL;
        
        this.tokenUsage.activation = 0;
        for (const instructions of this.loadedContext.activation.values()) {
            this.tokenUsage.activation += instructions.tokens || this.estimateTokens(instructions.content);
        }

        this.tokenUsage.execution = 0;
        for (const fileData of this.loadedContext.execution.values()) {
            this.tokenUsage.execution += fileData.tokens;
        }

        this.tokenUsage.total = this.tokenUsage.discovery + this.tokenUsage.activation + this.tokenUsage.execution;
    }

    /**
     * Free context space by deactivating least recently used skills
     * @param {number} tokensNeeded - Number of tokens needed
     * @returns {Promise<boolean>} Whether sufficient space was freed
     */
    async freeContextSpace(tokensNeeded) {
        let tokensFreed = 0;

        // First, try to unload execution files (least critical)
        const executionFiles = Array.from(this.loadedContext.execution.entries())
            .sort((a, b) => a[1].loadedAt - b[1].loadedAt); // Oldest first

        for (const [filePath, fileData] of executionFiles) {
            if (tokensFreed >= tokensNeeded) break;
            
            tokensFreed += fileData.tokens;
            this.loadedContext.execution.delete(filePath);
        }

        // If still need more space, deactivate skills (more impactful)
        if (tokensFreed < tokensNeeded) {
            const activeSkillsArray = Array.from(this.activeSkills);
            
            for (const skillName of activeSkillsArray) {
                if (tokensFreed >= tokensNeeded) break;
                
                const result = this.deactivateSkill(skillName);
                if (result.success) {
                    tokensFreed += result.tokensFreed;
                }
            }
        }

        this.updateTokenUsage();
        return tokensFreed >= tokensNeeded;
    }

    /**
     * Reset context manager state
     */
    reset() {
        this.loadedContext.discovery.clear();
        this.loadedContext.activation.clear();
        this.loadedContext.execution.clear();
        
        this.activeSkills.clear();
        this.inactiveSkills.clear();
        
        this.tokenUsage = {
            discovery: 0,
            activation: 0,
            execution: 0,
            total: 0
        };
    }

    /**
     * Get context optimization recommendations
     * @returns {Object} Optimization suggestions
     */
    getOptimizationRecommendations() {
        const status = this.getContextStatus();
        const recommendations = [];

        if (status.utilizationPercent > 80) {
            recommendations.push({
                type: 'warning',
                message: 'Context usage is high (>80%). Consider deactivating unused skills.',
                action: 'deactivate-unused-skills'
            });
        }

        if (this.activeSkills.size > 3) {
            recommendations.push({
                type: 'suggestion',
                message: 'Multiple skills active. Use specific sub-skills for focused work.',
                action: 'use-specific-subskills'
            });
        }

        if (this.loadedContext.execution.size > 5) {
            recommendations.push({
                type: 'suggestion',
                message: 'Many supporting files loaded. Consider unloading unused files.',
                action: 'unload-unused-files'
            });
        }

        return {
            utilizationPercent: status.utilizationPercent,
            recommendations: recommendations,
            canOptimize: recommendations.length > 0
        };
    }
}

// Export for use in skill system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContextManager;
}

// Global instance for immediate use
if (typeof window !== 'undefined') {
    window.ContextManager = ContextManager;
}