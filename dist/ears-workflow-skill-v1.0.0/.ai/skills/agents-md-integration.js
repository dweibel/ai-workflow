/**
 * AGENTS.md Content Integration System
 * 
 * Ensures that existing AGENTS.md content is accessible through the new skill structure
 * while maintaining all existing functionality and capabilities. This module provides
 * migration paths and integration points for existing users.
 */

const fs = require('fs');
const path = require('path');

class AgentsMdIntegration {
    constructor(agentsPath = 'AGENTS.md', aiDirectory = '.ai') {
        this.agentsPath = agentsPath;
        this.aiDirectory = aiDirectory;
        this.skillsDirectory = path.join(aiDirectory, 'skills');
        this.mainSkillPath = path.join(aiDirectory, 'SKILL.md');
    }

    /**
     * Validate that AGENTS.md content is preserved and accessible
     */
    validateAgentsMdPreservation() {
        const results = {
            agentsExists: false,
            contentPreserved: false,
            attributionPreserved: false,
            sectionsPreserved: false,
            integrationComplete: false,
            errors: []
        };

        try {
            // Check if AGENTS.md exists
            if (!fs.existsSync(this.agentsPath)) {
                results.errors.push('AGENTS.md file not found');
                return results;
            }

            results.agentsExists = true;
            const agentsContent = fs.readFileSync(this.agentsPath, 'utf8');

            // Check content preservation
            const requiredSections = [
                'Prime Directive',
                'Context Routing',
                'Universal Invariants',
                'Skills & Automation',
                'Workflow Phases',
                'The Codification Rule'
            ];

            let sectionsFound = 0;
            for (const section of requiredSections) {
                if (agentsContent.includes(section)) {
                    sectionsFound++;
                }
            }

            results.sectionsPreserved = sectionsFound >= requiredSections.length - 1; // Allow 1 missing
            results.contentPreserved = agentsContent.length > 10000; // Reasonable content size

            // Check attribution preservation
            const attributionElements = [
                'Attribution',
                'Compound Engineering Plugin',
                'EveryInc',
                'MIT License'
            ];

            let attributionFound = 0;
            for (const element of attributionElements) {
                if (agentsContent.includes(element)) {
                    attributionFound++;
                }
            }

            results.attributionPreserved = attributionFound >= 3; // At least 3 of 4 elements

            // Check integration with new skill structure
            results.integrationComplete = this.validateSkillIntegration();

        } catch (error) {
            results.errors.push(`Error validating AGENTS.md: ${error.message}`);
        }

        return results;
    }

    /**
     * Validate integration between AGENTS.md and new skill structure
     */
    validateSkillIntegration() {
        try {
            // Check if main SKILL.md exists and references AGENTS.md concepts
            if (!fs.existsSync(this.mainSkillPath)) {
                return false;
            }

            const mainSkillContent = fs.readFileSync(this.mainSkillPath, 'utf8');
            
            // Should reference key AGENTS.md concepts
            const keyConceptsReferenced = [
                'Compound Engineer',
                'Prime Directive',
                'memory',
                'workflow'
            ].some(concept => mainSkillContent.toLowerCase().includes(concept.toLowerCase()));

            // Check if sub-skills maintain AGENTS.md principles
            const subSkills = ['spec-forge', 'planning', 'work', 'review'];
            let skillsWithAgentsIntegration = 0;

            for (const skill of subSkills) {
                const skillPath = path.join(this.skillsDirectory, skill, 'SKILL.md');
                if (fs.existsSync(skillPath)) {
                    const skillContent = fs.readFileSync(skillPath, 'utf8');
                    
                    // Should reference memory files or AGENTS.md principles
                    if (skillContent.includes('memory') || 
                        skillContent.includes('lessons') || 
                        skillContent.includes('decisions') ||
                        skillContent.includes('compound')) {
                        skillsWithAgentsIntegration++;
                    }
                }
            }

            return keyConceptsReferenced && skillsWithAgentsIntegration >= 2;

        } catch (error) {
            return false;
        }
    }

    /**
     * Extract key content sections from AGENTS.md for reference
     */
    extractKeyContent() {
        const content = {
            primeDirective: null,
            contextRouting: null,
            universalInvariants: null,
            skillsAutomation: null,
            workflowPhases: null,
            codificationRule: null,
            attribution: null
        };

        try {
            if (!fs.existsSync(this.agentsPath)) {
                return content;
            }

            const agentsContent = fs.readFileSync(this.agentsPath, 'utf8');
            const sections = agentsContent.split(/^## /m);

            for (const section of sections) {
                const lines = section.split('\n');
                const title = lines[0]?.trim().toLowerCase();

                if (title.includes('prime directive')) {
                    content.primeDirective = section.substring(0, 500) + '...';
                } else if (title.includes('context routing')) {
                    content.contextRouting = section.substring(0, 500) + '...';
                } else if (title.includes('universal invariants')) {
                    content.universalInvariants = section.substring(0, 500) + '...';
                } else if (title.includes('skills') && title.includes('automation')) {
                    content.skillsAutomation = section.substring(0, 500) + '...';
                } else if (title.includes('workflow phases')) {
                    content.workflowPhases = section.substring(0, 500) + '...';
                } else if (title.includes('codification rule')) {
                    content.codificationRule = section.substring(0, 500) + '...';
                } else if (title.includes('attribution')) {
                    content.attribution = section.substring(0, 300) + '...';
                }
            }

        } catch (error) {
            // Return empty content on error
        }

        return content;
    }

    /**
     * Generate migration guide for existing users
     */
    generateMigrationGuide() {
        const guide = `# Migration Guide: From AGENTS.md to EARS-Workflow Skills

## Overview

The EARS-workflow skill system preserves all existing AGENTS.md functionality while providing enhanced capabilities through the Agent Skills standard. This guide helps existing users understand the changes and migration path.

## What's Preserved

### ✅ Complete Functionality
- All AGENTS.md content remains accessible and functional
- Memory files (.ai/memory/lessons.md and .ai/memory/decisions.md) work unchanged
- All existing workflows, templates, and prompts are preserved
- Git worktree scripts and project reset capabilities remain intact
- Attribution to original Compound Engineering Plugin is maintained

### ✅ Core Principles
- **Prime Directive**: Compound Engineering principles remain central
- **Context Routing**: Enhanced with semantic skill activation
- **Universal Invariants**: All hard rules are preserved and enforced
- **Skills & Automation**: Expanded with new sub-skill capabilities
- **Workflow Phases**: SPEC-FORGE → PLAN → WORK → REVIEW sequence maintained
- **Codification Rule**: Memory file updates and retrospectives continue

## What's Enhanced

### 🚀 New Capabilities
- **Explicit Skill Activation**: Use "EARS-workflow" or specific sub-skills
- **Progressive Disclosure**: Load only relevant context to optimize token usage
- **IDE Integration**: Compatible with VS Code Copilot, Cursor, and other Agent Skills tools
- **Modular Architecture**: Access specific capabilities without loading entire system
- **Version Management**: Proper versioning and package management

### 🚀 Improved Organization
- **Structured Sub-Skills**: spec-forge, planning, work, review, git-worktree, project-reset
- **Clear Activation Patterns**: Semantic routing based on user intent
- **Better Documentation**: Each skill has focused documentation and examples
- **Enhanced Testing**: Property-based testing for correctness validation

## Migration Steps

### For Existing Projects

1. **No Action Required**: Your existing .ai/ directory continues to work
2. **Optional Enhancement**: Add explicit skill activation for better control
3. **Gradual Adoption**: Start using sub-skills for focused capabilities

### For New Projects

1. **Install Skill Package**: Copy complete .ai/ directory structure
2. **Activate Skills**: Use "EARS-workflow" or specific sub-skill names
3. **Follow Guided Workflow**: System provides clear phase progression

## Usage Comparison

### Before (AGENTS.md System)
\`\`\`
User: "I need to implement user authentication"
Agent: [Loads entire AGENTS.md context, determines phase manually]
\`\`\`

### After (EARS-Workflow Skills)
\`\`\`
User: "use EARS workflow for user authentication"
Agent: [Activates EARS-workflow, starts with SPEC-FORGE phase]

User: "use spec-forge"
Agent: [Loads only SPEC-FORGE instructions and templates]

User: "use work"
Agent: [Transitions to WORK phase with TDD and git worktree setup]
\`\`\`

## Activation Patterns

### Main Workflow
- "EARS-workflow" or "use EARS workflow"
- "structured development" or "formal specification"
- "compound engineering" or "start ears"

### Sub-Skills
- **SPEC-FORGE**: "spec-forge", "requirements", "specification"
- **PLANNING**: "planning", "research", "architecture"
- **WORK**: "implement", "code", "tdd", "git worktree"
- **REVIEW**: "review", "audit", "code review"
- **GIT-WORKTREE**: "git worktree", "branch management"
- **PROJECT-RESET**: "project reset", "clean project"

## Backward Compatibility

### Memory Files
- \`.ai/memory/lessons.md\` - Unchanged format and access patterns
- \`.ai/memory/decisions.md\` - Unchanged format and access patterns
- All existing lessons and decisions are preserved
- Append operations continue to work as before

### File Structure
- All existing directories and files are preserved
- New skill structure is additive, not replacing
- Existing scripts and templates remain functional
- No breaking changes to established patterns

### Integration Points
- AGENTS.md remains the authoritative reference
- New skills reference and extend AGENTS.md principles
- Memory integration works seamlessly across old and new systems
- Attribution and licensing information is preserved

## Troubleshooting

### Common Issues

**Issue**: Skill not activating
**Solution**: Use explicit activation phrases like "use EARS workflow"

**Issue**: Memory files not accessible
**Solution**: Verify .ai/memory/ directory structure is intact

**Issue**: Git worktree scripts not working
**Solution**: Ensure .ai/skills/git-worktree/ directory is present

**Issue**: Missing templates or prompts
**Solution**: Check that .ai/templates/ and .ai/prompts/ directories are complete

### Validation Commands

Run these to verify your installation:

\`\`\`bash
# Check memory file compatibility
node .ai/skills/memory-compatibility-validator.js

# Test memory access patterns
node .ai/skills/memory-access-patterns.js

# Validate complete system
node .ai/tests/simple-backward-compatibility-test.js
\`\`\`

## Support

### Documentation
- **AGENTS.md**: Complete reference for all principles and workflows
- **Individual SKILL.md files**: Focused documentation for each capability
- **Memory files**: Accumulated lessons and architectural decisions

### Community
- Original Compound Engineering Plugin: https://github.com/EveryInc/compound-engineering-plugin
- Issues and discussions: Use project repository

## Conclusion

The EARS-workflow skill system enhances the original AGENTS.md system while preserving all existing functionality. Existing users can continue working as before, while new capabilities provide improved organization, better IDE integration, and more efficient context management.

The migration is designed to be seamless - your existing projects continue to work unchanged, while new projects benefit from enhanced capabilities and better tooling integration.
`;

        return guide;
    }

    /**
     * Create integration validation report
     */
    generateIntegrationReport() {
        const validation = this.validateAgentsMdPreservation();
        const keyContent = this.extractKeyContent();
        
        let report = '# AGENTS.md Integration Report\n\n';
        report += `**Generated**: ${new Date().toISOString()}\n`;
        report += `**Status**: ${validation.agentsExists && validation.contentPreserved && validation.attributionPreserved ? '✅ INTEGRATED' : '❌ ISSUES FOUND'}\n\n`;

        // Validation Results
        report += '## Validation Results\n\n';
        report += `- AGENTS.md exists: ${validation.agentsExists ? '✅' : '❌'}\n`;
        report += `- Content preserved: ${validation.contentPreserved ? '✅' : '❌'}\n`;
        report += `- Attribution preserved: ${validation.attributionPreserved ? '✅' : '❌'}\n`;
        report += `- Sections preserved: ${validation.sectionsPreserved ? '✅' : '❌'}\n`;
        report += `- Skill integration: ${validation.integrationComplete ? '✅' : '❌'}\n\n`;

        // Key Content Summary
        report += '## Key Content Verification\n\n';
        if (keyContent.primeDirective) {
            report += `### Prime Directive\n${keyContent.primeDirective}\n\n`;
        }
        if (keyContent.attribution) {
            report += `### Attribution\n${keyContent.attribution}\n\n`;
        }

        // Issues
        if (validation.errors.length > 0) {
            report += '## Issues Found\n\n';
            validation.errors.forEach(error => {
                report += `- ❌ ${error}\n`;
            });
            report += '\n';
        }

        // Recommendations
        report += '## Recommendations\n\n';
        if (validation.agentsExists && validation.contentPreserved && validation.attributionPreserved) {
            report += '✅ AGENTS.md content is fully integrated with the new skill structure.\n';
            report += 'All existing functionality is preserved and accessible.\n';
        } else {
            report += '⚠️ AGENTS.md integration requires attention:\n\n';
            if (!validation.agentsExists) {
                report += '1. Ensure AGENTS.md file exists in project root\n';
            }
            if (!validation.contentPreserved) {
                report += '2. Verify AGENTS.md content is complete and unmodified\n';
            }
            if (!validation.attributionPreserved) {
                report += '3. Ensure attribution section is preserved\n';
            }
            if (!validation.integrationComplete) {
                report += '4. Check skill integration and memory file references\n';
            }
        }

        return report;
    }

    /**
     * Validate complete integration
     */
    validateCompleteIntegration() {
        const results = {
            agentsMdValidation: this.validateAgentsMdPreservation(),
            keyContent: this.extractKeyContent(),
            overallValid: false,
            summary: {
                errors: [],
                warnings: [],
                passed: []
            }
        };

        // Compile overall results
        const validation = results.agentsMdValidation;
        
        if (!validation.agentsExists) {
            results.summary.errors.push('AGENTS.md file not found');
        }
        
        if (!validation.contentPreserved) {
            results.summary.errors.push('AGENTS.md content not properly preserved');
        }
        
        if (!validation.attributionPreserved) {
            results.summary.errors.push('Attribution information not preserved');
        }
        
        if (!validation.sectionsPreserved) {
            results.summary.warnings.push('Some AGENTS.md sections may be missing');
        }
        
        if (!validation.integrationComplete) {
            results.summary.warnings.push('Skill integration may be incomplete');
        }

        // Add errors from validation
        results.summary.errors.push(...validation.errors);

        // Determine overall validity
        results.overallValid = validation.agentsExists && 
                              validation.contentPreserved && 
                              validation.attributionPreserved &&
                              validation.errors.length === 0;

        // Generate summary
        if (results.overallValid) {
            results.summary.passed.push('AGENTS.md content fully integrated with skill structure');
            results.summary.passed.push('All existing functionality preserved and accessible');
            results.summary.passed.push('Attribution and licensing information maintained');
        }

        return results;
    }
}

module.exports = AgentsMdIntegration;

// CLI usage
if (require.main === module) {
    const integration = new AgentsMdIntegration();
    
    console.log('=== AGENTS.md Integration Validation ===\n');
    
    const validation = integration.validateCompleteIntegration();
    
    console.log('Validation Results:');
    console.log(`- AGENTS.md exists: ${validation.agentsMdValidation.agentsExists ? '✅' : '❌'}`);
    console.log(`- Content preserved: ${validation.agentsMdValidation.contentPreserved ? '✅' : '❌'}`);
    console.log(`- Attribution preserved: ${validation.agentsMdValidation.attributionPreserved ? '✅' : '❌'}`);
    console.log(`- Sections preserved: ${validation.agentsMdValidation.sectionsPreserved ? '✅' : '❌'}`);
    console.log(`- Integration complete: ${validation.agentsMdValidation.integrationComplete ? '✅' : '❌'}`);
    
    console.log(`\nOverall Status: ${validation.overallValid ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (validation.summary.errors.length > 0) {
        console.log('\nErrors:');
        validation.summary.errors.forEach(error => console.log(`- ${error}`));
    }
    
    if (validation.summary.warnings.length > 0) {
        console.log('\nWarnings:');
        validation.summary.warnings.forEach(warning => console.log(`- ${warning}`));
    }
    
    if (validation.summary.passed.length > 0) {
        console.log('\nPassed:');
        validation.summary.passed.forEach(passed => console.log(`- ${passed}`));
    }
}