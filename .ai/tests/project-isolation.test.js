/**
 * Property-based tests for project isolation
 * 
 * **Feature: ears-workflow-skill-refactor, Property 12: Project isolation**
 * **Validates: Requirements 6.4**
 * 
 * Tests that multiple projects using the skill package maintain independent
 * memory files and project-specific state without cross-project contamination:
 * - Each project has independent memory files
 * - Project-specific state is maintained
 * - No cross-project state contamination occurs
 * - Memory modifications in one project don't affect others
 * 
 * @version 1.0.0
 */

const fc = require('fast-check');
const fs = require('fs');
const path = require('path');
const ProjectIsolationManager = require('../skills/project-isolation-manager.js');

// Mock project environment for testing
class MockProjectEnvironment {
    constructor() {
        this.projects = new Map();
        this.tempDirs = [];
    }

    createProject(projectName, basePath = 'temp') {
        const projectPath = path.join(basePath, `project-${projectName}`);
        this.tempDirs.push(projectPath);

        // Create project directory structure
        const aiPath = path.join(projectPath, '.ai');
        const memoryPath = path.join(aiPath, 'memory');

        try {
            fs.mkdirSync(projectPath, { recursive: true });
            fs.mkdirSync(aiPath, { recursive: true });
            fs.mkdirSync(memoryPath, { recursive: true });

            // Create isolation manager for this project
            const isolationManager = new ProjectIsolationManager(projectPath);
            const initResult = isolationManager.initializeIsolation();

            this.projects.set(projectName, {
                path: projectPath,
                aiPath: aiPath,
                memoryPath: memoryPath,
                isolationManager: isolationManager,
                initResult: initResult
            });

            return {
                success: initResult.success,
                projectPath: projectPath,
                projectId: isolationManager.projectId,
                isolationManager: isolationManager
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                projectPath: projectPath
            };
        }
    }

    getProject(projectName) {
        return this.projects.get(projectName);
    }

    getAllProjects() {
        return Array.from(this.projects.values());
    }

    modifyProjectMemory(projectName, memoryFile, modification) {
        const project = this.projects.get(projectName);
        if (!project) {
            return { success: false, error: 'Project not found' };
        }

        try {
            const filePath = path.join(project.memoryPath, memoryFile);
            if (!fs.existsSync(filePath)) {
                return { success: false, error: 'Memory file not found' };
            }

            const originalContent = fs.readFileSync(filePath, 'utf8');
            const modifiedContent = originalContent + '\n' + modification;
            fs.writeFileSync(filePath, modifiedContent);

            return {
                success: true,
                originalContent: originalContent,
                modifiedContent: modifiedContent,
                modification: modification
            };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    validateProjectIsolation(projectName) {
        const project = this.projects.get(projectName);
        if (!project) {
            return { success: false, error: 'Project not found' };
        }

        return project.isolationManager.getIsolationStatus();
    }

    detectCrossProjectContamination() {
        const contamination = {
            hasContamination: false,
            contaminationTypes: [],
            affectedProjects: [],
            details: []
        };

        const projects = this.getAllProjects();
        
        // Check for duplicate project IDs
        const projectIds = new Map();
        for (const project of projects) {
            const projectId = project.isolationManager.projectId;
            if (projectIds.has(projectId)) {
                contamination.hasContamination = true;
                contamination.contaminationTypes.push('DUPLICATE_PROJECT_ID');
                contamination.affectedProjects.push(project.path);
                contamination.details.push(`Duplicate project ID: ${projectId}`);
            } else {
                projectIds.set(projectId, project.path);
            }
        }

        // Check for shared memory file content
        const memoryFiles = ['lessons.md', 'decisions.md'];
        for (const memoryFile of memoryFiles) {
            const fileContents = new Map();
            
            for (const project of projects) {
                const filePath = path.join(project.memoryPath, memoryFile);
                if (fs.existsSync(filePath)) {
                    const content = fs.readFileSync(filePath, 'utf8');
                    const contentHash = require('crypto').createHash('md5').update(content).digest('hex');
                    
                    if (fileContents.has(contentHash)) {
                        contamination.hasContamination = true;
                        contamination.contaminationTypes.push('SHARED_MEMORY_CONTENT');
                        contamination.affectedProjects.push(project.path);
                        contamination.details.push(`Identical ${memoryFile} content between projects`);
                    } else {
                        fileContents.set(contentHash, project.path);
                    }
                }
            }
        }

        // Check for cross-project references in memory files
        for (const project of projects) {
            const otherProjectIds = projects
                .filter(p => p !== project)
                .map(p => p.isolationManager.projectId);

            for (const memoryFile of memoryFiles) {
                const filePath = path.join(project.memoryPath, memoryFile);
                if (fs.existsSync(filePath)) {
                    const content = fs.readFileSync(filePath, 'utf8');
                    
                    for (const otherProjectId of otherProjectIds) {
                        if (content.includes(otherProjectId)) {
                            contamination.hasContamination = true;
                            contamination.contaminationTypes.push('CROSS_PROJECT_REFERENCE');
                            contamination.affectedProjects.push(project.path);
                            contamination.details.push(`Project ${project.path} references ${otherProjectId}`);
                        }
                    }
                }
            }
        }

        return contamination;
    }

    cleanup() {
        for (const tempDir of this.tempDirs) {
            try {
                if (fs.existsSync(tempDir)) {
                    fs.rmSync(tempDir, { recursive: true, force: true });
                }
            } catch (error) {
                // Ignore cleanup errors in tests
            }
        }
        this.tempDirs = [];
        this.projects.clear();
    }
}

// Test generators
const projectNameGen = fc.string({ minLength: 3, maxLength: 10 }).map(s => s.replace(/[^a-zA-Z0-9]/g, ''));
const projectSetGen = fc.array(projectNameGen, { minLength: 2, maxLength: 5 }).map(arr => [...new Set(arr)]);
const memoryModificationGen = fc.string({ minLength: 10, maxLength: 100 }).map(s => `- Test modification: ${s}`);

describe('Project Isolation Property Tests', () => {
    let mockEnv;

    beforeEach(() => {
        mockEnv = new MockProjectEnvironment();
    });

    afterEach(() => {
        mockEnv.cleanup();
    });

    /**
     * Property 12.1: Each project has independent memory files
     * For any set of projects, each should have its own memory files with unique content
     */
    test('Property 12.1: Each project has independent memory files', () => {
        fc.assert(fc.property(
            projectSetGen,
            (projectNames) => {
                const createdProjects = [];

                // Create multiple projects
                for (const projectName of projectNames) {
                    const result = mockEnv.createProject(projectName);
                    if (result.success) {
                        createdProjects.push(projectName);
                    }
                }

                // Should have created at least 2 projects for meaningful test
                if (createdProjects.length < 2) {
                    return true; // Skip if not enough projects created
                }

                // Each project should have its own memory files
                for (const projectName of createdProjects) {
                    const project = mockEnv.getProject(projectName);
                    expect(project).toBeDefined();
                    expect(project.initResult.success).toBe(true);

                    // Memory files should exist
                    const lessonsPath = path.join(project.memoryPath, 'lessons.md');
                    const decisionsPath = path.join(project.memoryPath, 'decisions.md');
                    
                    expect(fs.existsSync(lessonsPath)).toBe(true);
                    expect(fs.existsSync(decisionsPath)).toBe(true);

                    // Files should contain project-specific markers
                    const lessonsContent = fs.readFileSync(lessonsPath, 'utf8');
                    const decisionsContent = fs.readFileSync(decisionsPath, 'utf8');
                    
                    expect(lessonsContent).toContain(project.isolationManager.projectId);
                    expect(decisionsContent).toContain(project.isolationManager.projectId);
                }

                // No cross-project contamination should exist
                const contamination = mockEnv.detectCrossProjectContamination();
                expect(contamination.hasContamination).toBe(false);
            }
        ), { numRuns: 20 });
    });

    /**
     * Property 12.2: Project modifications don't affect other projects
     * For any project modification, other projects should remain unaffected
     */
    test('Property 12.2: Project modifications don\'t affect other projects', () => {
        fc.assert(fc.property(
            projectSetGen,
            memoryModificationGen,
            fc.constantFrom('lessons.md', 'decisions.md'),
            (projectNames, modification, memoryFile) => {
                const createdProjects = [];

                // Create multiple projects
                for (const projectName of projectNames) {
                    const result = mockEnv.createProject(projectName);
                    if (result.success) {
                        createdProjects.push(projectName);
                    }
                }

                if (createdProjects.length < 2) {
                    return true; // Skip if not enough projects
                }

                // Get original content from all projects
                const originalContents = new Map();
                for (const projectName of createdProjects) {
                    const project = mockEnv.getProject(projectName);
                    const filePath = path.join(project.memoryPath, memoryFile);
                    if (fs.existsSync(filePath)) {
                        originalContents.set(projectName, fs.readFileSync(filePath, 'utf8'));
                    }
                }

                // Modify first project
                const firstProject = createdProjects[0];
                const modifyResult = mockEnv.modifyProjectMemory(firstProject, memoryFile, modification);
                
                if (modifyResult.success) {
                    // Other projects should be unaffected
                    for (let i = 1; i < createdProjects.length; i++) {
                        const otherProject = createdProjects[i];
                        const project = mockEnv.getProject(otherProject);
                        const filePath = path.join(project.memoryPath, memoryFile);
                        
                        if (fs.existsSync(filePath)) {
                            const currentContent = fs.readFileSync(filePath, 'utf8');
                            const originalContent = originalContents.get(otherProject);
                            
                            expect(currentContent).toBe(originalContent);
                            expect(currentContent).not.toContain(modification);
                        }
                    }

                    // Modified project should contain the modification
                    const modifiedProject = mockEnv.getProject(firstProject);
                    const modifiedFilePath = path.join(modifiedProject.memoryPath, memoryFile);
                    const modifiedContent = fs.readFileSync(modifiedFilePath, 'utf8');
                    expect(modifiedContent).toContain(modification);
                }
            }
        ), { numRuns: 25 });
    });

    /**
     * Property 12.3: Project IDs are unique across projects
     * For any set of projects, each should have a unique project ID
     */
    test('Property 12.3: Project IDs are unique across projects', () => {
        fc.assert(fc.property(
            projectSetGen,
            (projectNames) => {
                const createdProjects = [];
                const projectIds = new Set();

                // Create projects and collect IDs
                for (const projectName of projectNames) {
                    const result = mockEnv.createProject(projectName);
                    if (result.success) {
                        createdProjects.push(projectName);
                        projectIds.add(result.projectId);
                    }
                }

                // Number of unique IDs should equal number of projects
                expect(projectIds.size).toBe(createdProjects.length);

                // Each project should have a valid project ID format
                for (const projectName of createdProjects) {
                    const project = mockEnv.getProject(projectName);
                    const projectId = project.isolationManager.projectId;
                    
                    expect(projectId).toMatch(/^proj_[a-f0-9]{8}_[a-z0-9]+$/);
                    expect(projectIds.has(projectId)).toBe(true);
                }
            }
        ), { numRuns: 30 });
    });

    /**
     * Property 12.4: Project state files are isolated
     * For any project, state files should be project-specific and not shared
     */
    test('Property 12.4: Project state files are isolated', () => {
        fc.assert(fc.property(
            projectSetGen,
            (projectNames) => {
                const createdProjects = [];

                // Create projects
                for (const projectName of projectNames) {
                    const result = mockEnv.createProject(projectName);
                    if (result.success) {
                        createdProjects.push(projectName);
                    }
                }

                // Each project should have its own state file
                for (const projectName of createdProjects) {
                    const project = mockEnv.getProject(projectName);
                    const stateFilePath = path.join(project.aiPath, '.project-state.json');
                    
                    expect(fs.existsSync(stateFilePath)).toBe(true);
                    
                    const stateContent = fs.readFileSync(stateFilePath, 'utf8');
                    const stateData = JSON.parse(stateContent);
                    
                    expect(stateData.projectId).toBe(project.isolationManager.projectId);
                    expect(stateData.projectPath).toBe(project.path);
                    expect(Array.isArray(stateData.memoryFiles)).toBe(true);
                    expect(stateData.memoryFiles.length).toBeGreaterThan(0);
                }

                // State files should not reference other projects
                for (const projectName of createdProjects) {
                    const project = mockEnv.getProject(projectName);
                    const stateFilePath = path.join(project.aiPath, '.project-state.json');
                    const stateContent = fs.readFileSync(stateFilePath, 'utf8');
                    
                    // Should not contain other project IDs
                    const otherProjects = createdProjects.filter(p => p !== projectName);
                    for (const otherProjectName of otherProjects) {
                        const otherProject = mockEnv.getProject(otherProjectName);
                        expect(stateContent).not.toContain(otherProject.isolationManager.projectId);
                    }
                }
            }
        ), { numRuns: 20 });
    });

    /**
     * Property 12.5: Isolation validation passes for all projects
     * For any set of projects, isolation validation should pass for each
     */
    test('Property 12.5: Isolation validation passes for all projects', () => {
        fc.assert(fc.property(
            projectSetGen,
            (projectNames) => {
                const createdProjects = [];

                // Create projects
                for (const projectName of projectNames) {
                    const result = mockEnv.createProject(projectName);
                    if (result.success) {
                        createdProjects.push(projectName);
                    }
                }

                // Each project should pass isolation validation
                for (const projectName of createdProjects) {
                    const isolationStatus = mockEnv.validateProjectIsolation(projectName);
                    
                    expect(isolationStatus.isolated).toBe(true);
                    expect(isolationStatus.isolationLevel).toMatch(/^(COMPLETE|GOOD)$/);
                    expect(isolationStatus.validation.errors.length).toBe(0);
                    
                    // Should have valid project ID and path
                    expect(isolationStatus.projectId).toMatch(/^proj_[a-f0-9]{8}_[a-z0-9]+$/);
                    expect(isolationStatus.projectPath).toBeDefined();
                    expect(typeof isolationStatus.projectPath).toBe('string');
                    
                    // Should have memory files tracked
                    expect(Object.keys(isolationStatus.memoryFiles).length).toBeGreaterThan(0);
                    expect(isolationStatus.memoryFiles['lessons.md']).toBeDefined();
                    expect(isolationStatus.memoryFiles['decisions.md']).toBeDefined();
                }
            }
        ), { numRuns: 25 });
    });

    /**
     * Property 12.6: Cross-project contamination detection works
     * For any projects with potential contamination, detection should identify it
     */
    test('Property 12.6: Cross-project contamination detection works', () => {
        fc.assert(fc.property(
            fc.array(projectNameGen, { minLength: 2, maxLength: 3 }),
            (projectNames) => {
                const createdProjects = [];

                // Create projects
                for (const projectName of projectNames) {
                    const result = mockEnv.createProject(projectName);
                    if (result.success) {
                        createdProjects.push(projectName);
                    }
                }

                if (createdProjects.length < 2) {
                    return true; // Skip if not enough projects
                }

                // Initially, no contamination should exist
                let contamination = mockEnv.detectCrossProjectContamination();
                expect(contamination.hasContamination).toBe(false);

                // Artificially create contamination by copying content
                const firstProject = mockEnv.getProject(createdProjects[0]);
                const secondProject = mockEnv.getProject(createdProjects[1]);
                
                const firstLessonsPath = path.join(firstProject.memoryPath, 'lessons.md');
                const secondLessonsPath = path.join(secondProject.memoryPath, 'lessons.md');
                
                const firstContent = fs.readFileSync(firstLessonsPath, 'utf8');
                fs.writeFileSync(secondLessonsPath, firstContent); // Create identical content
                
                // Now contamination should be detected
                contamination = mockEnv.detectCrossProjectContamination();
                expect(contamination.hasContamination).toBe(true);
                expect(contamination.contaminationTypes).toContain('SHARED_MEMORY_CONTENT');
                expect(contamination.affectedProjects.length).toBeGreaterThan(0);
            }
        ), { numRuns: 15 });
    });

    /**
     * Property 12.7: Project cleanup maintains isolation
     * For any project cleanup operation, other projects should remain unaffected
     */
    test('Property 12.7: Project cleanup maintains isolation', () => {
        fc.assert(fc.property(
            projectSetGen,
            (projectNames) => {
                const createdProjects = [];

                // Create projects
                for (const projectName of projectNames) {
                    const result = mockEnv.createProject(projectName);
                    if (result.success) {
                        createdProjects.push(projectName);
                    }
                }

                if (createdProjects.length < 2) {
                    return true; // Skip if not enough projects
                }

                // Get original state of all projects
                const originalStates = new Map();
                for (const projectName of createdProjects) {
                    const isolationStatus = mockEnv.validateProjectIsolation(projectName);
                    originalStates.set(projectName, isolationStatus);
                }

                // Clean up first project
                const firstProject = mockEnv.getProject(createdProjects[0]);
                const cleanupResult = firstProject.isolationManager.cleanupProjectState();
                
                if (cleanupResult.success) {
                    // Other projects should be unaffected
                    for (let i = 1; i < createdProjects.length; i++) {
                        const otherProjectName = createdProjects[i];
                        const currentStatus = mockEnv.validateProjectIsolation(otherProjectName);
                        const originalStatus = originalStates.get(otherProjectName);
                        
                        expect(currentStatus.isolated).toBe(originalStatus.isolated);
                        expect(currentStatus.projectId).toBe(originalStatus.projectId);
                        expect(currentStatus.isolationLevel).toBe(originalStatus.isolationLevel);
                        
                        // Memory files should still exist and be unchanged
                        expect(Object.keys(currentStatus.memoryFiles).length).toBe(
                            Object.keys(originalStatus.memoryFiles).length
                        );
                    }
                }
            }
        ), { numRuns: 20 });
    });
});

// Integration tests for complete project isolation
describe('Project Isolation Integration Tests', () => {
    let mockEnv;

    beforeEach(() => {
        mockEnv = new MockProjectEnvironment();
    });

    afterEach(() => {
        mockEnv.cleanup();
    });

    test('Complete project isolation workflow', () => {
        // Create multiple projects
        const projectNames = ['alpha', 'beta', 'gamma'];
        const createdProjects = [];

        for (const projectName of projectNames) {
            const result = mockEnv.createProject(projectName);
            expect(result.success).toBe(true);
            createdProjects.push(projectName);
        }

        // Validate initial isolation
        for (const projectName of createdProjects) {
            const isolationStatus = mockEnv.validateProjectIsolation(projectName);
            expect(isolationStatus.isolated).toBe(true);
            expect(isolationStatus.isolationLevel).toMatch(/^(COMPLETE|GOOD)$/);
        }

        // Modify each project differently
        const modifications = [
            '- Alpha project modification',
            '- Beta project modification', 
            '- Gamma project modification'
        ];

        for (let i = 0; i < createdProjects.length; i++) {
            const projectName = createdProjects[i];
            const modification = modifications[i];
            
            const modifyResult = mockEnv.modifyProjectMemory(projectName, 'lessons.md', modification);
            expect(modifyResult.success).toBe(true);
        }

        // Verify modifications are isolated
        for (let i = 0; i < createdProjects.length; i++) {
            const projectName = createdProjects[i];
            const project = mockEnv.getProject(projectName);
            const lessonsPath = path.join(project.memoryPath, 'lessons.md');
            const content = fs.readFileSync(lessonsPath, 'utf8');
            
            // Should contain own modification
            expect(content).toContain(modifications[i]);
            
            // Should not contain other modifications
            for (let j = 0; j < modifications.length; j++) {
                if (i !== j) {
                    expect(content).not.toContain(modifications[j]);
                }
            }
        }

        // Final contamination check
        const contamination = mockEnv.detectCrossProjectContamination();
        expect(contamination.hasContamination).toBe(false);
    });

    test('Project isolation under stress conditions', () => {
        // Create many projects quickly
        const projectCount = 10;
        const createdProjects = [];

        for (let i = 0; i < projectCount; i++) {
            const result = mockEnv.createProject(`stress-${i}`);
            expect(result.success).toBe(true);
            createdProjects.push(`stress-${i}`);
        }

        // Rapid modifications to all projects
        for (const projectName of createdProjects) {
            const modification = `- Stress test modification for ${projectName}`;
            const modifyResult = mockEnv.modifyProjectMemory(projectName, 'lessons.md', modification);
            expect(modifyResult.success).toBe(true);
        }

        // All projects should maintain isolation
        for (const projectName of createdProjects) {
            const isolationStatus = mockEnv.validateProjectIsolation(projectName);
            expect(isolationStatus.isolated).toBe(true);
        }

        // No contamination should occur
        const contamination = mockEnv.detectCrossProjectContamination();
        expect(contamination.hasContamination).toBe(false);

        // Each project should have unique content
        const projectContents = new Map();
        for (const projectName of createdProjects) {
            const project = mockEnv.getProject(projectName);
            const lessonsPath = path.join(project.memoryPath, 'lessons.md');
            const content = fs.readFileSync(lessonsPath, 'utf8');
            
            expect(projectContents.has(content)).toBe(false);
            projectContents.set(content, projectName);
        }
    });

    test('Project isolation recovery after contamination', () => {
        // Create two projects
        const project1Result = mockEnv.createProject('recovery1');
        const project2Result = mockEnv.createProject('recovery2');
        
        expect(project1Result.success).toBe(true);
        expect(project2Result.success).toBe(true);

        // Artificially create contamination
        const project1 = mockEnv.getProject('recovery1');
        const project2 = mockEnv.getProject('recovery2');
        
        const project1LessonsPath = path.join(project1.memoryPath, 'lessons.md');
        const project2LessonsPath = path.join(project2.memoryPath, 'lessons.md');
        
        const originalContent = fs.readFileSync(project1LessonsPath, 'utf8');
        fs.writeFileSync(project2LessonsPath, originalContent); // Create contamination
        
        // Contamination should be detected
        let contamination = mockEnv.detectCrossProjectContamination();
        expect(contamination.hasContamination).toBe(true);
        
        // Re-initialize isolation for project2
        const newInitResult = project2.isolationManager.initializeIsolation();
        expect(newInitResult.success).toBe(true);
        
        // Contamination should be resolved
        contamination = mockEnv.detectCrossProjectContamination();
        expect(contamination.hasContamination).toBe(false);
        
        // Both projects should be properly isolated again
        const status1 = mockEnv.validateProjectIsolation('recovery1');
        const status2 = mockEnv.validateProjectIsolation('recovery2');
        
        expect(status1.isolated).toBe(true);
        expect(status2.isolated).toBe(true);
        expect(status1.projectId).not.toBe(status2.projectId);
    });
});