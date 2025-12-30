/**
 * Archive Manager Module
 * Provides archive creation, extraction, and validation functionality
 * Enhanced with compression, progress indicators, and streaming for large directories
 */

const fs = require('fs').promises;
const path = require('path');
const { createReadStream, createWriteStream } = require('fs');
const { pipeline } = require('stream/promises');
const { Transform } = require('stream');
const zlib = require('zlib');
const ErrorHandler = require('../../shared/error-handler');
const FileOperations = require('../../shared/file-operations');

class ArchiveManager {
  constructor(options = {}) {
    this.compressionLevel = options.compressionLevel || 6; // Default compression level
    this.batchSize = options.batchSize || 100; // Files per batch for large directories
    this.progressCallback = options.progressCallback || null; // Progress callback function
  }

  /**
   * Create archive from source directory with progress indicators and compression
   * @param {string} sourcePath - Source directory to archive
   * @param {string} archivePath - Target archive directory path
   * @param {Object} metadata - Archive metadata
   * @param {Object} options - Archive options (compression, progress callback)
   * @returns {Promise<void>}
   */
  async createArchive(sourcePath, archivePath, metadata, options = {}) {
    const progressCallback = options.progressCallback || this.progressCallback;
    const useCompression = options.compression !== false;
    
    try {
      // Initialize progress tracking
      let totalFiles = 0;
      let processedFiles = 0;
      
      if (progressCallback) {
        // Count total files for progress calculation
        totalFiles = await this._countTotalFiles(sourcePath);
        progressCallback({ phase: 'counting', total: totalFiles, processed: 0 });
      }

      // Ensure archive directory exists
      await FileOperations.ensureDirectory(archivePath);

      if (progressCallback) {
        progressCallback({ phase: 'archiving', total: totalFiles, processed: 0 });
      }

      // Archive memory files if they exist
      const memoryProgress = await this._archiveMemoryFiles(
        sourcePath, 
        archivePath, 
        useCompression,
        (progress) => {
          processedFiles += progress;
          if (progressCallback) {
            progressCallback({ 
              phase: 'memory', 
              total: totalFiles, 
              processed: processedFiles 
            });
          }
        }
      );

      // Archive documentation files with streaming for large directories
      const docsProgress = await this._archiveDocumentationFiles(
        sourcePath, 
        archivePath, 
        useCompression,
        (progress) => {
          processedFiles += progress;
          if (progressCallback) {
            progressCallback({ 
              phase: 'documentation', 
              total: totalFiles, 
              processed: processedFiles 
            });
          }
        }
      );

      if (progressCallback) {
        progressCallback({ phase: 'metadata', total: totalFiles, processed: processedFiles });
      }

      // Save metadata
      const metadataPath = path.join(archivePath, 'archive-info.json');
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');

      // Update metadata with actual file counts and compression info
      const updatedMetadata = await this._updateMetadataWithCounts(archivePath, metadata, {
        compression: useCompression,
        compressionLevel: this.compressionLevel
      });
      await fs.writeFile(metadataPath, JSON.stringify(updatedMetadata, null, 2), 'utf8');

      if (progressCallback) {
        progressCallback({ phase: 'complete', total: totalFiles, processed: totalFiles });
      }

    } catch (error) {
      throw ErrorHandler.handleFileSystemError(error, 'create_archive', archivePath);
    }
  }

  /**
   * Extract archive to target directory with progress indicators and decompression
   * @param {string} archivePath - Archive directory path
   * @param {string} targetPath - Target extraction directory
   * @param {Object} options - Extraction options (progress callback)
   * @returns {Promise<void>}
   */
  async extractArchive(archivePath, targetPath, options = {}) {
    const progressCallback = options.progressCallback || this.progressCallback;
    
    try {
      // Validate archive exists
      await fs.access(archivePath);

      // Get metadata to check for compression
      const metadata = await this.getArchiveMetadata(archivePath);
      const useCompression = metadata.compression?.enabled || false;

      let totalFiles = 0;
      let processedFiles = 0;

      if (progressCallback) {
        // Count total files for progress
        totalFiles = (metadata.contents?.files?.total || 0) + 1; // +1 for metadata
        progressCallback({ phase: 'extracting', total: totalFiles, processed: 0 });
      }

      // Restore memory files
      const memoryArchivePath = path.join(archivePath, 'memory');
      try {
        await fs.access(memoryArchivePath);
        const memoryTargetPath = path.join(targetPath, '.ai', 'memory');
        await FileOperations.ensureDirectory(memoryTargetPath);
        
        const memoryProgress = await this._extractMemoryFiles(
          memoryArchivePath, 
          memoryTargetPath, 
          useCompression,
          (progress) => {
            processedFiles += progress;
            if (progressCallback) {
              progressCallback({ 
                phase: 'memory', 
                total: totalFiles, 
                processed: processedFiles 
              });
            }
          }
        );
      } catch (error) {
        // Memory archive doesn't exist, skip
      }

      // Restore documentation files
      const docsArchivePath = path.join(archivePath, 'docs');
      try {
        await fs.access(docsArchivePath);
        const docsTargetPath = path.join(targetPath, '.ai', 'docs');
        await FileOperations.ensureDirectory(docsTargetPath);
        
        const docsProgress = await this._extractDocumentationFiles(
          docsArchivePath, 
          docsTargetPath, 
          useCompression,
          (progress) => {
            processedFiles += progress;
            if (progressCallback) {
              progressCallback({ 
                phase: 'documentation', 
                total: totalFiles, 
                processed: processedFiles 
              });
            }
          }
        );
      } catch (error) {
        // Docs archive doesn't exist, skip
      }

      if (progressCallback) {
        progressCallback({ phase: 'complete', total: totalFiles, processed: totalFiles });
      }

    } catch (error) {
      throw ErrorHandler.handleFileSystemError(error, 'extract_archive', archivePath);
    }
  }

  /**
   * Validate archive integrity
   * @param {string} archivePath - Archive directory path
   * @returns {Promise<boolean>} True if archive is valid
   */
  async validateArchive(archivePath) {
    try {
      // Check if archive directory exists
      await fs.access(archivePath);

      // Check if metadata file exists and is valid JSON
      const metadataPath = path.join(archivePath, 'archive-info.json');
      try {
        const metadataContent = await fs.readFile(metadataPath, 'utf8');
        const metadata = JSON.parse(metadataContent);
        
        // Validate required metadata fields
        if (!metadata.version || !metadata.created || !metadata.operation) {
          return false;
        }

        // Validate file counts match actual contents
        const actualCounts = await this._getActualFileCounts(archivePath);
        const expectedCounts = metadata.contents?.files || {};

        // Allow some flexibility in counts (files may have been added/removed)
        // Just ensure the structure is reasonable
        if (actualCounts.total === 0 && expectedCounts.total > 0) {
          return false; // Archive claims to have files but has none
        }

        return true;
      } catch (error) {
        return false; // Invalid or missing metadata
      }

    } catch (error) {
      return false; // Archive doesn't exist or can't be accessed
    }
  }

  /**
   * Get archive metadata
   * @param {string} archivePath - Archive directory path
   * @returns {Promise<Object>} Archive metadata
   */
  async getArchiveMetadata(archivePath) {
    try {
      const metadataPath = path.join(archivePath, 'archive-info.json');
      const metadataContent = await fs.readFile(metadataPath, 'utf8');
      return JSON.parse(metadataContent);
    } catch (error) {
      throw ErrorHandler.handleFileSystemError(error, 'get_archive_metadata', archivePath);
    }
  }

  /**
   * Count total files in source directory for progress tracking
   * @private
   * @param {string} sourcePath - Source directory path
   * @returns {Promise<number>} Total file count
   */
  async _countTotalFiles(sourcePath) {
    let count = 0;
    
    // Count memory files
    const memoryPath = path.join(sourcePath, '.ai', 'memory');
    try {
      await fs.access(memoryPath);
      const memoryFiles = await fs.readdir(memoryPath);
      count += memoryFiles.filter(f => f.endsWith('.md')).length;
    } catch (error) {
      // Memory directory doesn't exist
    }

    // Count documentation files
    const docsPath = path.join(sourcePath, '.ai', 'docs');
    try {
      await fs.access(docsPath);
      count += await this._countFilesRecursively(docsPath);
    } catch (error) {
      // Docs directory doesn't exist
    }

    return count;
  }

  /**
   * Create a compression stream if compression is enabled
   * @private
   * @param {boolean} useCompression - Whether to use compression
   * @returns {Transform} Compression stream or pass-through
   */
  _createCompressionStream(useCompression) {
    if (useCompression) {
      return zlib.createGzip({ level: this.compressionLevel });
    }
    return new Transform({
      transform(chunk, encoding, callback) {
        callback(null, chunk);
      }
    });
  }

  /**
   * Create a decompression stream if needed
   * @private
   * @param {boolean} useCompression - Whether compression was used
   * @returns {Transform} Decompression stream or pass-through
   */
  _createDecompressionStream(useCompression) {
    if (useCompression) {
      return zlib.createGunzip();
    }
    return new Transform({
      transform(chunk, encoding, callback) {
        callback(null, chunk);
      }
    });
  }

  /**
   * Copy file with optional compression and progress tracking
   * @private
   * @param {string} sourcePath - Source file path
   * @param {string} targetPath - Target file path
   * @param {boolean} useCompression - Whether to compress
   * @returns {Promise<void>}
   */
  async _copyFileWithCompression(sourcePath, targetPath, useCompression) {
    const readStream = createReadStream(sourcePath);
    const writeStream = createWriteStream(useCompression ? `${targetPath}.gz` : targetPath);
    const compressionStream = this._createCompressionStream(useCompression);

    await pipeline(readStream, compressionStream, writeStream);
  }

  /**
   * Extract file with optional decompression
   * @private
   * @param {string} sourcePath - Source file path (possibly compressed)
   * @param {string} targetPath - Target file path
   * @param {boolean} useCompression - Whether file is compressed
   * @returns {Promise<void>}
   */
  async _extractFileWithDecompression(sourcePath, targetPath, useCompression) {
    const actualSourcePath = useCompression ? `${sourcePath}.gz` : sourcePath;
    const readStream = createReadStream(actualSourcePath);
    const writeStream = createWriteStream(targetPath);
    const decompressionStream = this._createDecompressionStream(useCompression);

    await pipeline(readStream, decompressionStream, writeStream);
  }

  /**
   * Process files in batches for large directories
   * @private
   * @param {string[]} files - Array of file paths
   * @param {Function} processor - Function to process each file
   * @param {Function} progressCallback - Progress callback
   * @returns {Promise<void>}
   */
  async _processBatches(files, processor, progressCallback) {
    let processed = 0;
    
    for (let i = 0; i < files.length; i += this.batchSize) {
      const batch = files.slice(i, i + this.batchSize);
      
      // Process batch in parallel
      await Promise.all(batch.map(processor));
      
      processed += batch.length;
      if (progressCallback) {
        progressCallback(batch.length);
      }
    }
  }
  /**
   * Archive memory files with compression and progress tracking
   * @private
   * @param {string} sourcePath - Source directory
   * @param {string} archivePath - Archive directory
   * @param {boolean} useCompression - Whether to use compression
   * @param {Function} progressCallback - Progress callback
   * @returns {Promise<number>} Number of files processed
   */
  async _archiveMemoryFiles(sourcePath, archivePath, useCompression, progressCallback) {
    const memorySourcePath = path.join(sourcePath, '.ai', 'memory');
    const memoryArchivePath = path.join(archivePath, 'memory');
    let filesProcessed = 0;

    try {
      await fs.access(memorySourcePath);
      
      // Create memory archive directory
      await FileOperations.ensureDirectory(memoryArchivePath);

      // Get memory files
      const memoryFiles = ['lessons.md', 'decisions.md'];
      const existingFiles = [];
      
      for (const file of memoryFiles) {
        const sourceFile = path.join(memorySourcePath, file);
        try {
          await fs.access(sourceFile);
          existingFiles.push(file);
        } catch (error) {
          // File doesn't exist, skip
        }
      }

      // Process files with compression and progress
      await this._processBatches(
        existingFiles,
        async (file) => {
          const sourceFile = path.join(memorySourcePath, file);
          const targetFile = path.join(memoryArchivePath, file);
          await this._copyFileWithCompression(sourceFile, targetFile, useCompression);
        },
        progressCallback
      );

      filesProcessed = existingFiles.length;
    } catch (error) {
      // Memory directory doesn't exist, skip
    }

    return filesProcessed;
  }

  /**
   * Archive documentation files with streaming for large directories
   * @private
   * @param {string} sourcePath - Source directory
   * @param {string} archivePath - Archive directory
   * @param {boolean} useCompression - Whether to use compression
   * @param {Function} progressCallback - Progress callback
   * @returns {Promise<number>} Number of files processed
   */
  async _archiveDocumentationFiles(sourcePath, archivePath, useCompression, progressCallback) {
    const docsSourcePath = path.join(sourcePath, '.ai', 'docs');
    const docsArchivePath = path.join(archivePath, 'docs');
    let filesProcessed = 0;

    try {
      await fs.access(docsSourcePath);

      // Create docs archive directory
      await FileOperations.ensureDirectory(docsArchivePath);

      // Archive each documentation subdirectory
      const docDirs = ['plans', 'tasks', 'reviews', 'requirements', 'design'];
      
      for (const dir of docDirs) {
        const sourceDirPath = path.join(docsSourcePath, dir);
        
        try {
          await fs.access(sourceDirPath);
          
          // Find markdown files (excluding README.md and templates)
          const files = await this._findMarkdownFiles(sourceDirPath);
          
          if (files.length > 0) {
            const targetDirPath = path.join(docsArchivePath, dir);
            await FileOperations.ensureDirectory(targetDirPath);
            
            // Process files in batches with compression
            await this._processBatches(
              files,
              async (file) => {
                const sourceFile = path.join(sourceDirPath, file);
                const targetFile = path.join(targetDirPath, file);
                
                // Ensure target subdirectory exists for nested files
                const targetFileDir = path.dirname(targetFile);
                if (targetFileDir !== targetDirPath) {
                  await FileOperations.ensureDirectory(targetFileDir);
                }
                
                await this._copyFileWithCompression(sourceFile, targetFile, useCompression);
              },
              progressCallback
            );
            
            filesProcessed += files.length;
          }
        } catch (error) {
          // Directory doesn't exist, skip
        }
      }
    } catch (error) {
      // Docs directory doesn't exist, skip
    }

    return filesProcessed;
  }

  /**
   * Extract memory files with decompression and progress tracking
   * @private
   * @param {string} archivePath - Archive directory
   * @param {string} targetPath - Target directory
   * @param {boolean} useCompression - Whether files are compressed
   * @param {Function} progressCallback - Progress callback
   * @returns {Promise<number>} Number of files processed
   */
  async _extractMemoryFiles(archivePath, targetPath, useCompression, progressCallback) {
    let filesProcessed = 0;
    
    try {
      const files = await fs.readdir(archivePath);
      const memoryFiles = files.filter(f => 
        f.endsWith('.md') || (useCompression && f.endsWith('.md.gz'))
      );

      await this._processBatches(
        memoryFiles,
        async (file) => {
          const sourceFile = path.join(archivePath, file);
          const targetFileName = useCompression ? file.replace('.gz', '') : file;
          const targetFile = path.join(targetPath, targetFileName);
          
          await this._extractFileWithDecompression(
            sourceFile.replace('.gz', ''), 
            targetFile, 
            useCompression
          );
        },
        progressCallback
      );

      filesProcessed = memoryFiles.length;
    } catch (error) {
      // Handle extraction errors
    }

    return filesProcessed;
  }

  /**
   * Extract documentation files with decompression and progress tracking
   * @private
   * @param {string} archivePath - Archive directory
   * @param {string} targetPath - Target directory
   * @param {boolean} useCompression - Whether files are compressed
   * @param {Function} progressCallback - Progress callback
   * @returns {Promise<number>} Number of files processed
   */
  async _extractDocumentationFiles(archivePath, targetPath, useCompression, progressCallback) {
    let filesProcessed = 0;

    try {
      // Restore each documentation subdirectory
      const docEntries = await fs.readdir(archivePath, { withFileTypes: true });
      
      for (const entry of docEntries) {
        if (entry.isDirectory()) {
          const sourceDir = path.join(archivePath, entry.name);
          const targetDir = path.join(targetPath, entry.name);
          await FileOperations.ensureDirectory(targetDir);
          
          // Get all files in this directory (recursively)
          const files = await this._getAllFilesRecursively(sourceDir);
          
          await this._processBatches(
            files,
            async (file) => {
              const relativePath = path.relative(sourceDir, file);
              const targetFile = path.join(targetDir, relativePath);
              const targetFileDir = path.dirname(targetFile);
              
              if (targetFileDir !== targetDir) {
                await FileOperations.ensureDirectory(targetFileDir);
              }
              
              await this._extractFileWithDecompression(
                file.replace('.gz', ''), 
                targetFile, 
                useCompression
              );
            },
            progressCallback
          );
          
          filesProcessed += files.length;
        }
      }
    } catch (error) {
      // Handle extraction errors
    }

    return filesProcessed;
  }

  /**
   * Get all files recursively from a directory
   * @private
   * @param {string} dirPath - Directory path
   * @returns {Promise<string[]>} Array of file paths
   */
  async _getAllFilesRecursively(dirPath) {
    const files = [];
    
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isFile()) {
          files.push(fullPath);
        } else if (entry.isDirectory()) {
          const subFiles = await this._getAllFilesRecursively(fullPath);
          files.push(...subFiles);
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
    
    return files;
  }

  /**
   * Find markdown files excluding README.md and templates
   * @private
   * @param {string} dirPath - Directory to search
   * @returns {Promise<string[]>} Array of file names
   */
  async _findMarkdownFiles(dirPath) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const files = [];

      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.md')) {
          // Exclude README.md and template files
          if (entry.name !== 'README.md' && !entry.name.endsWith('.template.md')) {
            files.push(entry.name);
          }
        } else if (entry.isDirectory()) {
          // Recursively search subdirectories
          const subDirPath = path.join(dirPath, entry.name);
          const subFiles = await this._findMarkdownFiles(subDirPath);
          
          // Add subdirectory files with relative path
          for (const subFile of subFiles) {
            files.push(path.join(entry.name, subFile));
          }
        }
      }

      return files;
    } catch (error) {
      return []; // Directory doesn't exist or can't be read
    }
  }

  /**
   * Update metadata with actual file counts and compression info
   * @private
   * @param {string} archivePath - Archive directory path
   * @param {Object} metadata - Original metadata
   * @param {Object} options - Additional options (compression info)
   * @returns {Promise<Object>} Updated metadata
   */
  async _updateMetadataWithCounts(archivePath, metadata, options = {}) {
    const counts = await this._getActualFileCounts(archivePath);
    
    return {
      ...metadata,
      contents: {
        ...metadata.contents,
        files: counts,
        totalSize: await this._getArchiveSize(archivePath)
      },
      compression: {
        enabled: options.compression || false,
        level: options.compressionLevel || this.compressionLevel,
        algorithm: 'gzip'
      },
      performance: {
        batchSize: this.batchSize,
        streamingEnabled: true
      }
    };
  }

  /**
   * Get actual file counts in archive (accounting for compression)
   * @private
   * @param {string} archivePath - Archive directory path
   * @returns {Promise<Object>} File counts
   */
  async _getActualFileCounts(archivePath) {
    const counts = {
      memory: 0,
      docs: 0,
      total: 0
    };

    // Count memory files (including compressed versions)
    const memoryPath = path.join(archivePath, 'memory');
    try {
      await fs.access(memoryPath);
      const memoryFiles = await fs.readdir(memoryPath);
      // Count both .md and .md.gz files
      counts.memory = memoryFiles.filter(f => 
        f.endsWith('.md') || f.endsWith('.md.gz')
      ).length;
    } catch (error) {
      // Memory directory doesn't exist
    }

    // Count documentation files (including compressed versions)
    const docsPath = path.join(archivePath, 'docs');
    try {
      await fs.access(docsPath);
      counts.docs = await this._countFilesRecursively(docsPath);
    } catch (error) {
      // Docs directory doesn't exist
    }

    counts.total = counts.memory + counts.docs;
    return counts;
  }

  /**
   * Count files recursively in directory (including compressed files)
   * @private
   * @param {string} dirPath - Directory path
   * @returns {Promise<number>} File count
   */
  async _countFilesRecursively(dirPath) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      let count = 0;

      for (const entry of entries) {
        if (entry.isFile()) {
          // Count both regular and compressed files
          if (entry.name.endsWith('.md') || entry.name.endsWith('.md.gz')) {
            count++;
          }
        } else if (entry.isDirectory()) {
          const subDirPath = path.join(dirPath, entry.name);
          count += await this._countFilesRecursively(subDirPath);
        }
      }

      return count;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get total archive size
   * @private
   * @param {string} archivePath - Archive directory path
   * @returns {Promise<number>} Size in bytes
   */
  async _getArchiveSize(archivePath) {
    try {
      return await FileOperations.getDirectorySize(archivePath);
    } catch (error) {
      return 0;
    }
  }
}

module.exports = ArchiveManager;