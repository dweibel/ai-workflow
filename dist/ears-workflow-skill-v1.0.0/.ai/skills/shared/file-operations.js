/**
 * Shared File Operations Module
 * Provides cross-platform file handling for JavaScript skill implementations
 */

const fs = require('fs').promises;
const path = require('path');
const ErrorHandler = require('./error-handler');

class FileOperations {
  /**
   * Copy directory recursively with cross-platform support
   * @param {string} source - Source directory path
   * @param {string} destination - Destination directory path
   * @param {Object} options - Copy options
   * @param {boolean} options.overwrite - Overwrite existing files
   * @param {string[]} options.exclude - Patterns to exclude
   * @returns {Promise<void>}
   */
  static async copyDirectory(source, destination, options = {}) {
    const { overwrite = false, exclude = [] } = options;
    
    try {
      // Ensure source exists
      await fs.access(source);
      
      // Create destination directory
      await this.ensureDirectory(destination);
      
      // Read source directory
      const entries = await fs.readdir(source, { withFileTypes: true });
      
      for (const entry of entries) {
        const sourcePath = path.join(source, entry.name);
        const destPath = path.join(destination, entry.name);
        
        // Check if entry should be excluded
        if (exclude.some(pattern => entry.name.includes(pattern))) {
          continue;
        }
        
        if (entry.isDirectory()) {
          await this.copyDirectory(sourcePath, destPath, options);
        } else {
          // Check if destination exists and overwrite is false
          if (!overwrite) {
            try {
              await fs.access(destPath);
              continue; // Skip existing file
            } catch (error) {
              // File doesn't exist, proceed with copy
            }
          }
          
          await fs.copyFile(sourcePath, destPath);
        }
      }
    } catch (error) {
      throw ErrorHandler.handleFileSystemError(error, 'copy_directory', source);
    }
  }

  /**
   * Remove directory recursively with safety checks
   * @param {string} dirPath - Directory path to remove
   * @param {Object} options - Remove options
   * @param {boolean} options.force - Force removal without confirmation
   * @param {string[]} options.preserve - Patterns to preserve
   * @returns {Promise<void>}
   */
  static async removeDirectory(dirPath, options = {}) {
    const { force = false, preserve = [] } = options;
    
    try {
      // Safety check - don't remove critical directories
      const normalizedPath = path.resolve(dirPath);
      const criticalPaths = [
        path.resolve('.'),
        path.resolve('..'),
        path.resolve(process.env.HOME || process.env.USERPROFILE || '/'),
        path.resolve('/'),
        path.resolve('C:\\')
      ];
      
      if (criticalPaths.some(critical => normalizedPath === critical)) {
        throw ErrorHandler.createError(
          'UNSAFE_OPERATION',
          `Refusing to remove critical directory: ${dirPath}`,
          { operation: 'remove_directory', parameters: { dirPath } },
          ['Use a more specific path', 'Verify the intended directory']
        );
      }
      
      // Check if directory exists
      try {
        await fs.access(dirPath);
      } catch (error) {
        // Directory doesn't exist, nothing to do
        return;
      }
      
      // Remove directory
      await fs.rmdir(dirPath, { recursive: true, force });
    } catch (error) {
      if (error.code) {
        // Already a structured error
        throw error;
      }
      throw ErrorHandler.handleFileSystemError(error, 'remove_directory', dirPath);
    }
  }

  /**
   * Ensure directory exists, creating it if necessary
   * @param {string} dirPath - Directory path to ensure
   * @returns {Promise<void>}
   */
  static async ensureDirectory(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      throw ErrorHandler.handleFileSystemError(error, 'ensure_directory', dirPath);
    }
  }

  /**
   * Get directory size recursively
   * @param {string} dirPath - Directory path
   * @returns {Promise<number>} Size in bytes
   */
  static async getDirectorySize(dirPath) {
    try {
      let totalSize = 0;
      
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const entryPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          totalSize += await this.getDirectorySize(entryPath);
        } else {
          const stats = await fs.stat(entryPath);
          totalSize += stats.size;
        }
      }
      
      return totalSize;
    } catch (error) {
      throw ErrorHandler.handleFileSystemError(error, 'get_directory_size', dirPath);
    }
  }

  /**
   * Validate path against requirements
   * @param {string} filePath - Path to validate
   * @param {Object} requirements - Validation requirements
   * @param {boolean} requirements.mustExist - Path must exist
   * @param {boolean} requirements.mustBeDirectory - Path must be a directory
   * @param {boolean} requirements.mustBeFile - Path must be a file
   * @param {boolean} requirements.mustBeWritable - Path must be writable
   * @returns {Promise<boolean>} True if valid
   */
  static async validatePath(filePath, requirements = {}) {
    const {
      mustExist = false,
      mustBeDirectory = false,
      mustBeFile = false,
      mustBeWritable = false
    } = requirements;
    
    try {
      if (mustExist) {
        await fs.access(filePath);
        
        const stats = await fs.stat(filePath);
        
        if (mustBeDirectory && !stats.isDirectory()) {
          throw ErrorHandler.createError(
            'PATH_VALIDATION_ERROR',
            `Path is not a directory: ${filePath}`,
            { operation: 'validate_path', parameters: { filePath, requirements } },
            ['Ensure the path points to a directory']
          );
        }
        
        if (mustBeFile && !stats.isFile()) {
          throw ErrorHandler.createError(
            'PATH_VALIDATION_ERROR',
            `Path is not a file: ${filePath}`,
            { operation: 'validate_path', parameters: { filePath, requirements } },
            ['Ensure the path points to a file']
          );
        }
      }
      
      if (mustBeWritable) {
        await fs.access(filePath, fs.constants.W_OK);
      }
      
      return true;
    } catch (error) {
      if (error.code) {
        // Already a structured error
        throw error;
      }
      throw ErrorHandler.handleFileSystemError(error, 'validate_path', filePath);
    }
  }

  /**
   * Format file size for human-readable display
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size string
   */
  static formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  }

  /**
   * Get cross-platform path separator
   * @returns {string} Path separator for current platform
   */
  static getPathSeparator() {
    return path.sep;
  }

  /**
   * Normalize path for cross-platform compatibility
   * @param {string} filePath - Path to normalize
   * @returns {string} Normalized path
   */
  static normalizePath(filePath) {
    return path.normalize(filePath);
  }

  /**
   * Join paths with cross-platform compatibility
   * @param {...string} paths - Path segments to join
   * @returns {string} Joined path
   */
  static joinPaths(...paths) {
    return path.join(...paths);
  }
}

module.exports = FileOperations;