/**
 * Cross-IDE Compatibility Tests
 * 
 * Tests for Requirements 8.1, 8.2, 8.3:
 * - VS Code Copilot skill discovery
 * - Cursor Agent-Decided rules integration
 * - CLI tool compatibility with openskills
 * 
 * @version 1.0.0
 */

const fc = require('fast-check');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Mock IDE environments for testing
class IDEEnvironment {
    constructor(type, version = '1.0.0') {
        this.type = type;
        this.version = version;
        this.skillPaths = this.getSkillPaths();
        this.supportedFormats = this.getSupportedFormats();
    }

    getSkillPaths() {
        switch (this.type) {
            case 'vscode-copilot':
                return ['.github/skills/', '.claude/skills/', '.ai/'];
            case 'cursor':
                return ['.cursor/', '.ai/', 'cursor-rules/'];
            case 'openskills':
                return ['.ai/', 'skills/', '.openskills/'];
            default:
                return ['.ai/'];
        }
    }

    getSupportedFormats() {
        switch (this.type) {
            case 'vscode-copilot':
                return ['skill.md', 'SKILL.md', 'skill.yaml'];
            case 'cursor':
                return ['SKILL.md', '.cursorrules', 'rules.md'];
            case 'openskills':
                return ['SKILL.md', 'skill.json', 'skill.yaml'];
            default:
                return ['SKILL.md'];
        }
    }

    discoverSkills(basePath) {
        const discoveredSkills = [];
        const errors = [];

        for (const skillPath of this.skillPaths) {
            const fullPath = path.join(basePath, skillPath);
            
            if (fs.existsSync(fullPath)) {
                try {
                    this.scanDirectory(fullPath, discoveredSkills, errors);
                } catch (error) {
                    errors.push(`Failed to scan ${fullPath}: ${error.message}`);
                }
            }
        }

        return {
            skills: discoveredSkills,
            errors: errors,
            totalFound: discoveredSkills.length
        };
    }

    scanDirectory(dirPath, skills, errors) {
        const entries = fs.readdirSync(dirPath);

        for (const entry of entries) {
            const entryPath = path.join(dirPath, entry);
            const stats = fs.statSync(entryPath);

            if (stats.isDirectory()) {
                // Recursively scan subdirectories
                this.scanDirectory(entryPath, skills, errors);
            } else if (this.isSkillFile(entry)) {
                try {
                    const skillData = this.parseSkillFile(entryPath);
                    if (skillData) {
                        skills.push({
                            path: entryPath,
                            name: skillData.name || path.basename(entry, path.extname(entry)),
                            description: skillData.description || '',
                            version: skillData.version || '1.0.0',
                            metadata: skillData,
                            ideCompatible: this.validateIDECompatibility(skillData)
                        });
                    }
                } catch (error) {
                    errors.push(`Failed to parse skill file ${entryPath}: ${error.message}`);
                }
            }
        }
    }

    isSkillFile(filename) {
        return this.supportedFormats.some(format => 
            filename.toLowerCase().includes(format.toLowerCase()) ||
            filename.endsWith(format)
        );
    }

    parseSkillFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Try to parse YAML frontmatter
        if (content.startsWith('---\n')) {
            const endIndex = content.indexOf('\n---\n', 4);
            if (endIndex !== -1) {
                const yamlContent = content.substring(4, endIndex);
                try {
                    return yaml.load(yamlContent);
                } catch (error) {
                    throw new Error(`Invalid YAML frontmatter: ${error.message}`);
                }
            }
        }

        // Try to parse as pure YAML
        if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
            try {
                return yaml.load(content);
            } catch (error) {
                throw new Error(`Invalid YAML file: ${error.message}`);
            }
        }

        // Try to parse as JSON
        if (filePath.endsWith('.json')) {
            try {
                return JSON.parse(content);
            } catch (error) {
                throw new Error(`Invalid JSON file: ${error.message}`);
            }
        }

        // For markdown files without frontmatter, extract basic info
        if (filePath.endsWith('.md')) {
            const lines = content.split('\n');
            const title = lines.find(line => line.startsWith('# '));
            return {
                name: title ? title.substring(2).trim() : path.basename(filePath, '.md'),
                description: 'Markdown skill file',
                version: '1.0.0'
            };
        }

        return null;
    }

    validateIDECompatibility(skillData) {
        const compatibility = {
            compatible: true,
            issues: [],
            warnings: []
        };

        // Check required fields for this IDE
        const requiredFields = this.getRequiredFields();
        for (const field of requiredFields) {
            if (!skillData[field]) {
                compatibility.compatible = false;
                compatibility.issues.push(`Missing required field: ${field}`);
            }
        }

        // Check IDE-specific requirements
        switch (this.type) {
            case 'vscode-copilot':
                this.validateVSCodeCompatibility(skillData, compatibility);
                break;
            case 'cursor':
                this.validateCursorCompatibility(skillData, compatibility);
                break;
            case 'openskills':
                this.validateOpenSkillsCompatibility(skillData, compatibility);
                break;
        }

        return compatibility;
    }

    getRequiredFields() {
        switch (this.type) {
            case 'vscode-copilot':
                return ['name', 'description'];
            case 'cursor':
                return ['name', 'description'];
            case 'openskills':
                return ['name', 'description', 'version'];
            default:
                return ['name', 'description'];
        }
    }

    validateVSCodeCompatibility(skillData, compatibility) {
        // VS Code Copilot specific validations
        if (skillData.name && !skillData.name.match(/^[a-z][a-z0-9-]*$/)) {
            compatibility.warnings.push('Skill name should be kebab-case for VS Code compatibility');
        }

        if (skillData.description && skillData.description.length < 20) {
            compatibility.warnings.push('Description should be at least 20 characters for better discovery');
        }

        // Check for VS Code specific fields
        if (skillData.vscode) {
            if (skillData.vscode.commands && !Array.isArray(skillData.vscode.commands)) {
                compatibility.issues.push('VS Code commands should be an array');
                compatibility.compatible = false;
            }
        }
    }

    validateCursorCompatibility(skillData, compatibility) {
        // Cursor specific validations
        if (skillData.cursor) {
            if (skillData.cursor.rules && !Array.isArray(skillData.cursor.rules)) {
                compatibility.issues.push('Cursor rules should be an array');
                compatibility.compatible = false;
            }
        }

        // Check for agent-decided compatibility
        if (skillData.agentDecided !== undefined && typeof skillData.agentDecided !== 'boolean') {
            compatibility.warnings.push('agentDecided should be a boolean value');
        }
    }

    validateOpenSkillsCompatibility(skillData, compatibility) {
        // OpenSkills specific validations
        if (!skillData.version || !skillData.version.match(/^\d+\.\d+\.\d+/)) {
            compatibility.issues.push('Version must be in semantic versioning format (x.y.z)');
            compatibility.compatible = false;
        }

        if (skillData.dependencies && !Array.isArray(skillData.dependencies)) {
            compatibility.issues.push('Dependencies should be an array');
            compatibility.compatible = false;
        }

        // Check for transpilation compatibility
        if (skillData.transpile !== undefined && typeof skillData.transpile !== 'object') {
            compatibility.warnings.push('Transpile configuration should be an object');
        }
    }

    testSkillActivation(skillData) {
        // Simulate skill activation for this IDE
        const activation = {
            success: false,
            loadTime: 0,
            errors: [],
            warnings: []
        };

        const startTime = Date.now();

        try {
            // Validate skill can be loaded
            if (!skillData.name) {
                throw new Error('Skill name is required for activation');
            }

            if (!skillData.description) {
                throw new Error('Skill description is required for activation');
            }

            // IDE-specific activation logic
            switch (this.type) {
                case 'vscode-copilot':
                    this.activateVSCodeSkill(skillData, activation);
                    break;
                case 'cursor':
                    this.activateCursorSkill(skillData, activation);
                    break;
                case 'openskills':
                    this.activateOpenSkill(skillData, activation);
                    break;
            }

            activation.success = true;
        } catch (error) {
            activation.errors.push(error.message);
        }

        activation.loadTime = Date.now() - startTime;
        return activation;
    }

    activateVSCodeSkill(skillData, activation) {
        // VS Code specific activation
        if (skillData.vscode && skillData.vscode.commands) {
            for (const command of skillData.vscode.commands) {
                if (!command.name || !command.description) {
                    activation.warnings.push(`Command missing name or description: ${JSON.stringify(command)}`);
                }
            }
        }
    }

    activateCursorSkill(skillData, activation) {
        // Cursor specific activation
        if (skillData.cursor && skillData.cursor.rules) {
            for (const rule of skillData.cursor.rules) {
                if (typeof rule !== 'string' && typeof rule !== 'object') {
                    activation.warnings.push(`Invalid rule format: ${typeof rule}`);
                }
            }
        }
    }

    activateOpenSkill(skillData, activation) {
        // OpenSkills specific activation
        if (skillData.dependencies) {
            for (const dep of skillData.dependencies) {
                if (typeof dep !== 'string') {
                    activation.warnings.push(`Invalid dependency format: ${typeof dep}`);
                }
            }
        }
    }
}

// Test generators
const ideTypeGen = fc.constantFrom('vscode-copilot', 'cursor', 'openskills');
const versionGen = fc.tuple(
    fc.integer({ min: 1, max: 5 }),
    fc.integer({ min: 0, max: 20 }),
    fc.integer({ min: 0, max: 50 })
).map(([major, minor, patch]) => `${major}.${minor}.${patch}`);

describe('Cross-IDE Compatibility Tests', () => {
    /**
     * Test for Requirement 8.1: VS Code Copilot compatibility
     * WHEN the skill is used with VS Code Copilot, THEN the system SHALL be discoverable
     */
    test('Requirement 8.1: VS Code Copilot skill discovery', () => {
        fc.assert(fc.property(
            versionGen,
            (version) => {
                const vscode = new IDEEnvironment('vscode-copilot', version);
                const discovery = vscode.discoverSkills('.');

                // Should discover at least the main SKILL.md
                expect(discovery.totalFound).toBeGreaterThan(0);
                expect(discovery.errors.length).toBeLessThanOrEqual(2); // Allow minor discovery issues

                // Should find main EARS-workflow skill
                const mainSkill = discovery.skills.find(skill => 
                    skill.name === 'ears-workflow' || 
                    skill.path.includes('SKILL.md')
                );
                expect(mainSkill).toBeDefined();

                if (mainSkill) {
                    expect(mainSkill.ideCompatible.compatible).toBe(true);
                    expect(mainSkill.metadata.name).toBeDefined();
                    expect(mainSkill.metadata.description).toBeDefined();
                }
            }
        ), { numRuns: 20 });
    });

    /**
     * Test for Requirement 8.2: Cursor integration
     * WHEN the skill is used with Cursor, THEN the system SHALL integrate with Agent-Decided rules
     */
    test('Requirement 8.2: Cursor Agent-Decided rules integration', () => {
        fc.assert(fc.property(
            versionGen,
            (version) => {
                const cursor = new IDEEnvironment('cursor', version);
                const discovery = cursor.discoverSkills('.');

                // Should discover skills compatible with Cursor
                expect(discovery.totalFound).toBeGreaterThan(0);

                // Test skill activation in Cursor environment
                for (const skill of discovery.skills) {
                    const activation = cursor.testSkillActivation(skill.metadata);
                    
                    // Should be able to activate without critical errors
                    expect(activation.success).toBe(true);
                    expect(activation.loadTime).toBeLessThan(1000); // Should load quickly
                    
                    // Critical errors should not occur
                    const criticalErrors = activation.errors.filter(error =>
                        error.includes('required') || error.includes('missing')
                    );
                    expect(criticalErrors.length).toBe(0);
                }
            }
        ), { numRuns: 15 });
    });

    /**
     * Test for Requirement 8.3: CLI tool compatibility
     * WHEN the skill is used with CLI tools like openskills, THEN the system SHALL be compatible
     */
    test('Requirement 8.3: OpenSkills CLI tool compatibility', () => {
        fc.assert(fc.property(
            versionGen,
            (version) => {
                const openskills = new IDEEnvironment('openskills', version);
                const discovery = openskills.discoverSkills('.');

                // Should discover skills with proper metadata
                expect(discovery.totalFound).toBeGreaterThan(0);

                // All discovered skills should have required fields for CLI tools
                for (const skill of discovery.skills) {
                    expect(skill.metadata.name).toBeDefined();
                    expect(skill.metadata.description).toBeDefined();
                    expect(skill.metadata.version).toBeDefined();

                    // Version should be semantic
                    expect(skill.metadata.version).toMatch(/^\d+\.\d+\.\d+/);

                    // Should be compatible with transpilation
                    const activation = openskills.testSkillActivation(skill.metadata);
                    expect(activation.success).toBe(true);
                }
            }
        ), { numRuns: 20 });
    });

    /**
     * Cross-IDE consistency test
     * Skills should work consistently across different IDE environments
     */
    test('Cross-IDE consistency', () => {
        fc.assert(fc.property(
            ideTypeGen,
            ideTypeGen.filter(ide => ide !== 'vscode-copilot'), // Ensure different IDEs
            versionGen,
            (ide1Type, ide2Type, version) => {
                const ide1 = new IDEEnvironment(ide1Type, version);
                const ide2 = new IDEEnvironment(ide2Type, version);

                const discovery1 = ide1.discoverSkills('.');
                const discovery2 = ide2.discoverSkills('.');

                // Both should discover skills (may be different counts due to IDE differences)
                expect(discovery1.totalFound).toBeGreaterThan(0);
                expect(discovery2.totalFound).toBeGreaterThan(0);

                // Main skill should be discoverable by both
                const mainSkill1 = discovery1.skills.find(s => s.name === 'ears-workflow');
                const mainSkill2 = discovery2.skills.find(s => s.name === 'ears-workflow');

                if (mainSkill1 && mainSkill2) {
                    // Core metadata should be consistent
                    expect(mainSkill1.metadata.name).toBe(mainSkill2.metadata.name);
                    expect(mainSkill1.metadata.version).toBe(mainSkill2.metadata.version);
                    
                    // Both should be able to activate the skill
                    const activation1 = ide1.testSkillActivation(mainSkill1.metadata);
                    const activation2 = ide2.testSkillActivation(mainSkill2.metadata);
                    
                    expect(activation1.success).toBe(true);
                    expect(activation2.success).toBe(true);
                }
            }
        ), { numRuns: 25 });
    });

    /**
     * Skill metadata validation across IDEs
     * All IDEs should be able to parse and validate skill metadata
     */
    test('Skill metadata validation across IDEs', () => {
        const ides = [
            new IDEEnvironment('vscode-copilot'),
            new IDEEnvironment('cursor'),
            new IDEEnvironment('openskills')
        ];

        for (const ide of ides) {
            const discovery = ide.discoverSkills('.');
            
            // Should discover skills without critical parsing errors
            expect(discovery.totalFound).toBeGreaterThan(0);
            
            const criticalErrors = discovery.errors.filter(error =>
                error.includes('Invalid YAML') || 
                error.includes('Invalid JSON') ||
                error.includes('Failed to parse')
            );
            expect(criticalErrors.length).toBe(0);

            // All discovered skills should have valid metadata
            for (const skill of discovery.skills) {
                expect(skill.metadata).toBeDefined();
                expect(typeof skill.metadata).toBe('object');
                
                // Should have basic required fields
                expect(skill.metadata.name).toBeDefined();
                expect(typeof skill.metadata.name).toBe('string');
                expect(skill.metadata.name.length).toBeGreaterThan(0);
            }
        }
    });

    /**
     * Performance test across IDEs
     * Skill discovery and activation should be performant across all IDEs
     */
    test('Performance consistency across IDEs', () => {
        const ides = [
            new IDEEnvironment('vscode-copilot'),
            new IDEEnvironment('cursor'),
            new IDEEnvironment('openskills')
        ];

        const performanceResults = [];

        for (const ide of ides) {
            const startTime = Date.now();
            const discovery = ide.discoverSkills('.');
            const discoveryTime = Date.now() - startTime;

            // Test activation performance
            let totalActivationTime = 0;
            let successfulActivations = 0;

            for (const skill of discovery.skills.slice(0, 3)) { // Test first 3 skills
                const activation = ide.testSkillActivation(skill.metadata);
                totalActivationTime += activation.loadTime;
                if (activation.success) successfulActivations++;
            }

            performanceResults.push({
                ide: ide.type,
                discoveryTime,
                averageActivationTime: totalActivationTime / Math.max(1, discovery.skills.length),
                successfulActivations,
                totalSkills: discovery.skills.length
            });
        }

        // All IDEs should have reasonable performance
        for (const result of performanceResults) {
            expect(result.discoveryTime).toBeLessThan(5000); // Discovery under 5 seconds
            expect(result.averageActivationTime).toBeLessThan(100); // Activation under 100ms
            expect(result.successfulActivations).toBeGreaterThan(0); // At least one successful activation
        }

        // Performance should be relatively consistent across IDEs
        const discoveryTimes = performanceResults.map(r => r.discoveryTime);
        const maxDiscoveryTime = Math.max(...discoveryTimes);
        const minDiscoveryTime = Math.min(...discoveryTimes);
        const discoveryTimeRatio = maxDiscoveryTime / Math.max(1, minDiscoveryTime);
        
        expect(discoveryTimeRatio).toBeLessThan(10); // No more than 10x difference
    });
});

// Integration tests for specific IDE scenarios
describe('IDE-Specific Integration Tests', () => {
    test('VS Code Copilot skill directory structure', () => {
        const vscode = new IDEEnvironment('vscode-copilot');
        
        // Test standard VS Code skill paths
        const skillPaths = ['.github/skills/', '.claude/skills/', '.ai/'];
        
        for (const skillPath of skillPaths) {
            if (fs.existsSync(skillPath)) {
                const discovery = vscode.discoverSkills(skillPath);
                
                // Should handle the directory structure correctly
                expect(discovery.errors.length).toBe(0);
                
                // If skills are found, they should be valid
                for (const skill of discovery.skills) {
                    expect(skill.ideCompatible.compatible).toBe(true);
                }
            }
        }
    });

    test('Cursor rules integration', () => {
        const cursor = new IDEEnvironment('cursor');
        const discovery = cursor.discoverSkills('.');

        // Should find skills that can integrate with Cursor rules
        expect(discovery.totalFound).toBeGreaterThan(0);

        // Test that skills can be converted to Cursor rules format
        for (const skill of discovery.skills) {
            const activation = cursor.testSkillActivation(skill.metadata);
            
            // Should activate successfully
            expect(activation.success).toBe(true);
            
            // Should not have rule-related errors
            const ruleErrors = activation.errors.filter(error =>
                error.includes('rule') || error.includes('cursor')
            );
            expect(ruleErrors.length).toBe(0);
        }
    });

    test('OpenSkills transpilation compatibility', () => {
        const openskills = new IDEEnvironment('openskills');
        const discovery = openskills.discoverSkills('.');

        // Should find skills with proper versioning for transpilation
        expect(discovery.totalFound).toBeGreaterThan(0);

        for (const skill of discovery.skills) {
            // Should have semantic versioning
            expect(skill.metadata.version).toMatch(/^\d+\.\d+\.\d+/);
            
            // Should be compatible with CLI tools
            const activation = openskills.testSkillActivation(skill.metadata);
            expect(activation.success).toBe(true);
            
            // Should not have transpilation-blocking errors
            const transpileErrors = activation.errors.filter(error =>
                error.includes('transpile') || 
                error.includes('version') ||
                error.includes('dependency')
            );
            expect(transpileErrors.length).toBe(0);
        }
    });

    test('MCP server interface compatibility', () => {
        // Test that skills provide appropriate interfaces for MCP integration
        const discovery = new IDEEnvironment('openskills').discoverSkills('.');
        
        for (const skill of discovery.skills) {
            // Skills should have metadata that supports MCP integration
            expect(skill.metadata.name).toBeDefined();
            expect(skill.metadata.description).toBeDefined();
            
            // Should not have MCP-incompatible features
            if (skill.metadata.mcp) {
                expect(typeof skill.metadata.mcp).toBe('object');
                
                if (skill.metadata.mcp.servers) {
                    expect(Array.isArray(skill.metadata.mcp.servers)).toBe(true);
                }
            }
        }
    });
});