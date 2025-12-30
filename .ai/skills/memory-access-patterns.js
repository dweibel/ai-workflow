/**
 * Memory Access Patterns Preservation
 * 
 * Ensures that existing memory file access patterns continue to work
 * with the new EARS-workflow skill structure. This module provides
 * backward-compatible access methods and validates existing patterns.
 */

const fs = require('fs');
const path = require('path');

class MemoryAccessPatterns {
    constructor(aiDirectory = '.ai') {
        this.aiDirectory = aiDirectory;
        this.memoryDirectory = path.join(aiDirectory, 'memory');
        this.lessonsFile = path.join(this.memoryDirectory, 'lessons.md');
        this.decisionsFile = path.join(this.memoryDirectory, 'decisions.md');
    }

    /**
     * Legacy method: Load lessons as used in original AGENTS.md system
     * Maintains backward compatibility with existing access patterns
     */
    loadLessons() {
        try {
            if (!fs.existsSync(this.lessonsFile)) {
                throw new Error(`Lessons file not found: ${this.lessonsFile}`);
            }

            const content = fs.readFileSync(this.lessonsFile, 'utf8');
            
            // Parse lessons into structured format for backward compatibility
            const lessons = this.parseLessonsContent(content);
            
            return {
                success: true,
                content: content,
                lessons: lessons,
                file: this.lessonsFile,
                lastModified: fs.statSync(this.lessonsFile).mtime
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                content: null,
                lessons: [],
                file: this.lessonsFile
            };
        }
    }

    /**
     * Legacy method: Load decisions as used in original AGENTS.md system
     * Maintains backward compatibility with existing access patterns
     */
    loadDecisions() {
        try {
            if (!fs.existsSync(this.decisionsFile)) {
                throw new Error(`Decisions file not found: ${this.decisionsFile}`);
            }

            const content = fs.readFileSync(this.decisionsFile, 'utf8');
            
            // Parse decisions into structured format for backward compatibility
            const decisions = this.parseDecisionsContent(content);
            
            return {
                success: true,
                content: content,
                decisions: decisions,
                file: this.decisionsFile,
                lastModified: fs.statSync(this.decisionsFile).mtime
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                content: null,
                decisions: [],
                file: this.decisionsFile
            };
        }
    }

    /**
     * Parse lessons content into structured format
     */
    parseLessonsContent(content) {
        const lessons = [];
        const lines = content.split('\n');
        let currentCategory = null;
        
        for (const line of lines) {
            // Detect category headers (## Category Name)
            const categoryMatch = line.match(/^## (.+)$/);
            if (categoryMatch) {
                currentCategory = categoryMatch[1].trim();
                continue;
            }
            
            // Detect lesson items (- When doing X, always ensure Y to prevent Z.)
            const lessonMatch = line.match(/^- When (.+), always (.+) to prevent (.+)\.$/);
            if (lessonMatch && currentCategory) {
                lessons.push({
                    category: currentCategory,
                    action: lessonMatch[1].trim(),
                    safeguard: lessonMatch[2].trim(),
                    prevention: lessonMatch[3].trim(),
                    fullText: line.substring(2).trim() // Remove "- " prefix
                });
            }
        }
        
        return lessons;
    }

    /**
     * Parse decisions content into structured format
     */
    parseDecisionsContent(content) {
        const decisions = [];
        const sections = content.split(/^## /m);
        
        for (const section of sections) {
            if (!section.trim()) continue;
            
            const lines = section.split('\n');
            const title = lines[0]?.trim();
            
            if (!title) continue;
            
            const decision = {
                title: title,
                status: null,
                date: null,
                context: null,
                decision: null,
                rationale: null,
                consequences: null,
                examples: null,
                alternatives: null,
                fullText: section
            };
            
            // Parse structured fields
            for (const line of lines) {
                const statusMatch = line.match(/\*\*Status\*\*:\s*(.+)/);
                if (statusMatch) decision.status = statusMatch[1].trim();
                
                const dateMatch = line.match(/\*\*Date\*\*:\s*(.+)/);
                if (dateMatch) decision.date = dateMatch[1].trim();
                
                const contextMatch = line.match(/\*\*Context\*\*:\s*(.+)/);
                if (contextMatch) decision.context = contextMatch[1].trim();
                
                const decisionMatch = line.match(/\*\*Decision\*\*:\s*(.+)/);
                if (decisionMatch) decision.decision = decisionMatch[1].trim();
                
                const rationaleMatch = line.match(/\*\*Rationale\*\*:\s*(.+)/);
                if (rationaleMatch) decision.rationale = rationaleMatch[1].trim();
            }
            
            decisions.push(decision);
        }
        
        return decisions;
    }

    /**
     * Legacy method: Append lesson to lessons file
     * Maintains backward compatibility with existing update patterns
     */
    appendLesson(category, lesson) {
        try {
            if (!fs.existsSync(this.lessonsFile)) {
                throw new Error(`Lessons file not found: ${this.lessonsFile}`);
            }

            let content = fs.readFileSync(this.lessonsFile, 'utf8');
            
            // Find the category section or create it
            const categoryHeader = `## ${category}`;
            const categoryIndex = content.indexOf(categoryHeader);
            
            if (categoryIndex === -1) {
                // Category doesn't exist, add it before the template section
                const templateIndex = content.indexOf('## Template for New Lessons');
                if (templateIndex !== -1) {
                    const beforeTemplate = content.substring(0, templateIndex);
                    const afterTemplate = content.substring(templateIndex);
                    content = beforeTemplate + `${categoryHeader}\n\n- ${lesson}\n\n---\n\n` + afterTemplate;
                } else {
                    // No template section, append at end
                    content += `\n\n---\n\n${categoryHeader}\n\n- ${lesson}\n`;
                }
            } else {
                // Category exists, find the end of the section and add lesson
                const nextSectionIndex = content.indexOf('\n## ', categoryIndex + categoryHeader.length);
                const nextHrIndex = content.indexOf('\n---\n', categoryIndex + categoryHeader.length);
                
                let insertIndex;
                if (nextSectionIndex !== -1 && nextHrIndex !== -1) {
                    insertIndex = Math.min(nextSectionIndex, nextHrIndex);
                } else if (nextSectionIndex !== -1) {
                    insertIndex = nextSectionIndex;
                } else if (nextHrIndex !== -1) {
                    insertIndex = nextHrIndex;
                } else {
                    insertIndex = content.length;
                }
                
                const beforeInsert = content.substring(0, insertIndex);
                const afterInsert = content.substring(insertIndex);
                content = beforeInsert + `- ${lesson}\n` + afterInsert;
            }
            
            fs.writeFileSync(this.lessonsFile, content, 'utf8');
            
            return {
                success: true,
                message: `Lesson added to ${category} category`,
                file: this.lessonsFile
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                file: this.lessonsFile
            };
        }
    }

    /**
     * Legacy method: Append decision to decisions file
     * Maintains backward compatibility with existing update patterns
     */
    appendDecision(title, status, date, context, decision, rationale) {
        try {
            if (!fs.existsSync(this.decisionsFile)) {
                throw new Error(`Decisions file not found: ${this.decisionsFile}`);
            }

            let content = fs.readFileSync(this.decisionsFile, 'utf8');
            
            // Create new decision entry
            const newDecision = `
## ${title}

**Status**: ${status}  
**Date**: ${date}  
**Context**: ${context}  
**Decision**: ${decision}  
**Rationale**: ${rationale}  

---
`;
            
            // Find insertion point (before maintenance section or at end)
            const maintenanceIndex = content.indexOf('## Maintenance');
            const templateIndex = content.indexOf('## How to Add New Decisions');
            
            let insertIndex;
            if (maintenanceIndex !== -1) {
                insertIndex = maintenanceIndex;
            } else if (templateIndex !== -1) {
                insertIndex = templateIndex;
            } else {
                insertIndex = content.length;
            }
            
            const beforeInsert = content.substring(0, insertIndex);
            const afterInsert = content.substring(insertIndex);
            content = beforeInsert + newDecision + afterInsert;
            
            fs.writeFileSync(this.decisionsFile, content, 'utf8');
            
            return {
                success: true,
                message: `Decision "${title}" added`,
                file: this.decisionsFile
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                file: this.decisionsFile
            };
        }
    }

    /**
     * Validate that existing access patterns still work
     */
    validateAccessPatterns() {
        const results = {
            canLoadLessons: false,
            canLoadDecisions: false,
            canAppendLessons: false,
            canAppendDecisions: false,
            errors: []
        };

        try {
            // Test loading lessons
            const lessonsResult = this.loadLessons();
            if (lessonsResult.success) {
                results.canLoadLessons = true;
            } else {
                results.errors.push(`Cannot load lessons: ${lessonsResult.error}`);
            }

            // Test loading decisions
            const decisionsResult = this.loadDecisions();
            if (decisionsResult.success) {
                results.canLoadDecisions = true;
            } else {
                results.errors.push(`Cannot load decisions: ${decisionsResult.error}`);
            }

            // Test appending (dry run - don't actually modify files)
            if (fs.existsSync(this.lessonsFile) && fs.access) {
                try {
                    fs.accessSync(this.lessonsFile, fs.constants.W_OK);
                    results.canAppendLessons = true;
                } catch (error) {
                    results.errors.push(`Cannot write to lessons file: ${error.message}`);
                }
            }

            if (fs.existsSync(this.decisionsFile) && fs.access) {
                try {
                    fs.accessSync(this.decisionsFile, fs.constants.W_OK);
                    results.canAppendDecisions = true;
                } catch (error) {
                    results.errors.push(`Cannot write to decisions file: ${error.message}`);
                }
            }

        } catch (error) {
            results.errors.push(`Access pattern validation error: ${error.message}`);
        }

        return results;
    }

    /**
     * Get memory file statistics for compatibility reporting
     */
    getMemoryStats() {
        const stats = {
            lessons: { exists: false, size: 0, modified: null, lessonCount: 0, categories: [] },
            decisions: { exists: false, size: 0, modified: null, decisionCount: 0, sections: [] }
        };

        try {
            // Lessons stats
            if (fs.existsSync(this.lessonsFile)) {
                const lessonsStats = fs.statSync(this.lessonsFile);
                const lessonsResult = this.loadLessons();
                
                stats.lessons.exists = true;
                stats.lessons.size = lessonsStats.size;
                stats.lessons.modified = lessonsStats.mtime;
                
                if (lessonsResult.success) {
                    stats.lessons.lessonCount = lessonsResult.lessons.length;
                    stats.lessons.categories = [...new Set(lessonsResult.lessons.map(l => l.category))];
                }
            }

            // Decisions stats
            if (fs.existsSync(this.decisionsFile)) {
                const decisionsStats = fs.statSync(this.decisionsFile);
                const decisionsResult = this.loadDecisions();
                
                stats.decisions.exists = true;
                stats.decisions.size = decisionsStats.size;
                stats.decisions.modified = decisionsStats.mtime;
                
                if (decisionsResult.success) {
                    stats.decisions.decisionCount = decisionsResult.decisions.length;
                    stats.decisions.sections = decisionsResult.decisions.map(d => d.title).filter(Boolean);
                }
            }

        } catch (error) {
            // Stats collection is non-critical, continue with partial data
        }

        return stats;
    }
}

module.exports = MemoryAccessPatterns;

// CLI usage
if (require.main === module) {
    const patterns = new MemoryAccessPatterns();
    
    console.log('=== Memory Access Patterns Test ===\n');
    
    // Test loading
    console.log('Testing lesson loading...');
    const lessonsResult = patterns.loadLessons();
    console.log(`Lessons: ${lessonsResult.success ? '✅' : '❌'} (${lessonsResult.lessons?.length || 0} lessons found)`);
    
    console.log('Testing decision loading...');
    const decisionsResult = patterns.loadDecisions();
    console.log(`Decisions: ${decisionsResult.success ? '✅' : '❌'} (${decisionsResult.decisions?.length || 0} decisions found)`);
    
    // Test access patterns
    console.log('\nTesting access patterns...');
    const validation = patterns.validateAccessPatterns();
    console.log(`Load lessons: ${validation.canLoadLessons ? '✅' : '❌'}`);
    console.log(`Load decisions: ${validation.canLoadDecisions ? '✅' : '❌'}`);
    console.log(`Append lessons: ${validation.canAppendLessons ? '✅' : '❌'}`);
    console.log(`Append decisions: ${validation.canAppendDecisions ? '✅' : '❌'}`);
    
    if (validation.errors.length > 0) {
        console.log('\nErrors found:');
        validation.errors.forEach(error => console.log(`- ${error}`));
    }
    
    // Show stats
    console.log('\nMemory file statistics:');
    const stats = patterns.getMemoryStats();
    console.log(`Lessons: ${stats.lessons.lessonCount} lessons in ${stats.lessons.categories.length} categories`);
    console.log(`Decisions: ${stats.decisions.decisionCount} decisions`);
}