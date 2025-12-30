/**
 * YAML Frontmatter Metadata Validator
 * Validates SKILL.md files for Agent Skills Standard compliance
 * Requirements: 8.5
 */

const fs = require('fs');
const path = require('path');

class MetadataValidator {
  constructor() {
    this.requiredFields = ['name', 'description', 'version'];
    this.optionalFields = ['author', 'phase', 'dependencies'];
    this.validPhases = ['spec-forge', 'planning', 'work', 'review', 'utility'];
  }

  /**
   * Validate a single SKILL.md file's YAML frontmatter
   * @param {string} filePath - Path to SKILL.md file
   * @returns {Object} Validation result
   */
  validateFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return {
          valid: false,
          errors: [`File does not exist: ${filePath}`],
          warnings: [],
          metadata: null
        };
      }

      const content = fs.readFileSync(filePath, 'utf8');
      return this.validateContent(content, filePath);
    } catch (error) {
      return {
        valid: false,
        errors: [`Failed to read file ${filePath}: ${error.message}`],
        warnings: [],
        metadata: null
      };
    }
  }

  /**
   * Validate YAML frontmatter content
   * @param {string} content - File content
   * @param {string} filePath - File path for error reporting
   * @returns {Object} Validation result
   */
  validateContent(content, filePath = 'unknown') {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      metadata: null
    };

    // Extract YAML frontmatter
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      result.valid = false;
      result.errors.push('No YAML frontmatter found. SKILL.md files must start with --- and end with ---');
      return result;
    }

    const yamlContent = frontmatterMatch[1];
    let metadata;

    try {
      metadata = this.parseYaml(yamlContent);
      result.metadata = metadata;
    } catch (error) {
      result.valid = false;
      result.errors.push(`Invalid YAML syntax: ${error.message}`);
      return result;
    }

    // Validate required fields
    for (const field of this.requiredFields) {
      if (!metadata.hasOwnProperty(field)) {
        result.valid = false;
        result.errors.push(`Missing required field: ${field}`);
      } else if (typeof metadata[field] !== 'string' || metadata[field].trim() === '') {
        result.valid = false;
        result.errors.push(`Field '${field}' must be a non-empty string`);
      }
    }

    // Validate field formats
    if (metadata.name) {
      const nameValidation = this.validateName(metadata.name);
      if (!nameValidation.valid) {
        result.valid = false;
        result.errors.push(...nameValidation.errors);
      }
    }

    if (metadata.description) {
      const descValidation = this.validateDescription(metadata.description);
      if (!descValidation.valid) {
        result.valid = false;
        result.errors.push(...descValidation.errors);
      }
      result.warnings.push(...descValidation.warnings);
    }

    if (metadata.version) {
      const versionValidation = this.validateVersion(metadata.version);
      if (!versionValidation.valid) {
        result.valid = false;
        result.errors.push(...versionValidation.errors);
      }
    }

    // Validate optional fields
    if (metadata.phase && !this.validPhases.includes(metadata.phase)) {
      result.warnings.push(`Phase '${metadata.phase}' is not a recognized phase. Valid phases: ${this.validPhases.join(', ')}`);
    }

    if (metadata.dependencies) {
      const depsValidation = this.validateDependencies(metadata.dependencies);
      if (!depsValidation.valid) {
        result.valid = false;
        result.errors.push(...depsValidation.errors);
      }
    }

    // Check for unknown fields
    const allValidFields = [...this.requiredFields, ...this.optionalFields];
    for (const field in metadata) {
      if (!allValidFields.includes(field)) {
        result.warnings.push(`Unknown field: ${field}`);
      }
    }

    return result;
  }

  /**
   * Simple YAML parser for frontmatter (basic key-value pairs)
   * @param {string} yamlContent - YAML content to parse
   * @returns {Object} Parsed metadata
   */
  parseYaml(yamlContent) {
    const metadata = {};
    const lines = yamlContent.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '' || line.startsWith('#')) continue;

      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;

      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();

      // Handle quoted strings
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // Handle arrays (simple format: [item1, item2])
      if (value.startsWith('[') && value.endsWith(']')) {
        const arrayContent = value.slice(1, -1).trim();
        if (arrayContent === '') {
          metadata[key] = [];
        } else {
          metadata[key] = arrayContent.split(',').map(item => item.trim().replace(/^["']|["']$/g, ''));
        }
      } else {
        metadata[key] = value;
      }
    }

    return metadata;
  }

  /**
   * Validate skill name format
   * @param {string} name - Skill name
   * @returns {Object} Validation result
   */
  validateName(name) {
    const result = { valid: true, errors: [] };

    // Must be kebab-case
    if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) {
      result.valid = false;
      result.errors.push('Name must be in kebab-case format (lowercase letters, numbers, and hyphens only)');
    }

    // Length constraints
    if (name.length < 2) {
      result.valid = false;
      result.errors.push('Name must be at least 2 characters long');
    }

    if (name.length > 50) {
      result.valid = false;
      result.errors.push('Name must be 50 characters or less');
    }

    return result;
  }

  /**
   * Validate description format for semantic routing
   * @param {string} description - Skill description
   * @returns {Object} Validation result
   */
  validateDescription(description) {
    const result = { valid: true, errors: [], warnings: [] };

    // Length constraints
    if (description.length < 20) {
      result.valid = false;
      result.errors.push('Description must be at least 20 characters long for effective semantic routing');
    }

    if (description.length > 500) {
      result.warnings.push('Description is quite long (>500 chars). Consider making it more concise for better semantic routing');
    }

    // Should contain actionable language
    const actionWords = ['use', 'when', 'create', 'implement', 'manage', 'handle', 'process', 'generate', 'analyze'];
    const hasActionWord = actionWords.some(word => description.toLowerCase().includes(word));
    if (!hasActionWord) {
      result.warnings.push('Description should include action words (use, when, create, etc.) for better semantic routing');
    }

    // Should not be just a title
    if (description.split(' ').length < 5) {
      result.valid = false;
      result.errors.push('Description should be a complete sentence, not just a title');
    }

    return result;
  }

  /**
   * Validate semantic version format
   * @param {string} version - Version string
   * @returns {Object} Validation result
   */
  validateVersion(version) {
    const result = { valid: true, errors: [] };

    // Must follow semantic versioning (MAJOR.MINOR.PATCH)
    const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*|[0-9a-zA-Z-]*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*|[0-9a-zA-Z-]*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
    
    if (!semverRegex.test(version)) {
      result.valid = false;
      result.errors.push('Version must follow semantic versioning format (MAJOR.MINOR.PATCH)');
    }

    return result;
  }

  /**
   * Validate dependencies array
   * @param {Array} dependencies - Dependencies array
   * @returns {Object} Validation result
   */
  validateDependencies(dependencies) {
    const result = { valid: true, errors: [] };

    if (!Array.isArray(dependencies)) {
      result.valid = false;
      result.errors.push('Dependencies must be an array');
      return result;
    }

    for (let i = 0; i < dependencies.length; i++) {
      const dep = dependencies[i];
      if (typeof dep !== 'string' || dep.trim() === '') {
        result.valid = false;
        result.errors.push(`Dependency at index ${i} must be a non-empty string`);
      } else {
        const nameValidation = this.validateName(dep);
        if (!nameValidation.valid) {
          result.valid = false;
          result.errors.push(`Dependency '${dep}' has invalid format: ${nameValidation.errors.join(', ')}`);
        }
      }
    }

    return result;
  }

  /**
   * Validate all SKILL.md files in the .ai directory structure
   * @param {string} aiDir - Path to .ai directory (default: '.ai')
   * @returns {Object} Comprehensive validation result
   */
  validateAllSkills(aiDir = '.ai') {
    const result = {
      valid: true,
      totalFiles: 0,
      validFiles: 0,
      invalidFiles: 0,
      files: {},
      summary: {
        errors: [],
        warnings: []
      }
    };

    try {
      // Find all SKILL.md files
      const skillFiles = this.findSkillFiles(aiDir);
      result.totalFiles = skillFiles.length;

      if (skillFiles.length === 0) {
        result.valid = false;
        result.summary.errors.push('No SKILL.md files found in the directory structure');
        return result;
      }

      // Validate each file
      for (const filePath of skillFiles) {
        const fileResult = this.validateFile(filePath);
        result.files[filePath] = fileResult;

        if (fileResult.valid) {
          result.validFiles++;
        } else {
          result.invalidFiles++;
          result.valid = false;
        }

        // Collect errors and warnings
        result.summary.errors.push(...fileResult.errors.map(err => `${filePath}: ${err}`));
        result.summary.warnings.push(...fileResult.warnings.map(warn => `${filePath}: ${warn}`));
      }

    } catch (error) {
      result.valid = false;
      result.summary.errors.push(`Failed to validate skills: ${error.message}`);
    }

    return result;
  }

  /**
   * Find all SKILL.md files in directory structure
   * @param {string} rootDir - Root directory to search
   * @returns {Array} Array of SKILL.md file paths
   */
  findSkillFiles(rootDir) {
    const skillFiles = [];

    const searchDir = (dir) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            searchDir(fullPath);
          } else if (entry.name === 'SKILL.md') {
            skillFiles.push(fullPath);
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    };

    searchDir(rootDir);
    return skillFiles;
  }
}

module.exports = MetadataValidator;