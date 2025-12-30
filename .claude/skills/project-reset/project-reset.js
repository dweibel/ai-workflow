#!/usr/bin/env node

/**
 * Project Reset Tool - JavaScript Implementation
 * Enhanced project reset tool with automatic archiving capabilities, improved reset options,
 * and archive management features. Provides safety and recovery options while making 
 * reset operations more intuitive.
 */

const ResetManager = require('./lib/reset-manager');
const ErrorHandler = require('../shared/error-handler');

// Color functions for better UX
const colors = {
  success: (text) => `\x1b[32m✅ ${text}\x1b[0m`,
  warning: (text) => `\x1b[33m⚠️  ${text}\x1b[0m`,
  error: (text) => `\x1b[31m❌ ${text}\x1b[0m`,
  info: (text) => `\x1b[36mℹ️  ${text}\x1b[0m`
};

class ProjectResetCLI {
  constructor() {
    this.resetManager = new ResetManager();
  }

  /**
   * Main CLI entry point
   */
  async run() {
    try {
      const args = this.parseArguments(process.argv.slice(2));
      
      if (args.help) {
        this.showHelp();
        return;
      }

      // Handle archive operations
      if (args.operation === 'list-archives') {
        await this.listArchives();
        return;
      }

      if (args.operation === 'archive-info') {
        if (!args.archiveName) {
          console.error(colors.error('Archive name is required for archive-info command'));
          process.exit(1);
        }
        await this.showArchiveInfo(args.archiveName);
        return;
      }

      if (args.operation === 'restore') {
        if (!args.archiveName) {
          console.error(colors.error('Archive name is required for restore command'));
          process.exit(1);
        }
        await this.restoreArchive(args.archiveName, args);
        return;
      }

      // Handle reset operations
      if (!args.level) {
        console.error(colors.error('Reset level is required. Use: light, medium, full, or custom'));
        console.log('Use --help for usage information');
        process.exit(1);
      }

      await this.performReset(args.level, args);

    } catch (error) {
      if (error.code) {
        // Structured error from ErrorHandler
        console.error(ErrorHandler.formatErrorMessage(error));
      } else {
        console.error(colors.error(`Unexpected error: ${error.message}`));
      }
      process.exit(1);
    }
  }

  /**
   * Parse command line arguments
   * @param {string[]} argv - Command line arguments
   * @returns {Object} Parsed arguments
   */
  parseArguments(argv) {
    const args = {
      level: null,
      operation: null,
      archiveName: null,
      confirm: false,
      noArchive: false,
      clearArchive: false,
      archiveLimit: null,
      customPaths: [],
      help: false
    };

    for (let i = 0; i < argv.length; i++) {
      const arg = argv[i];

      switch (arg) {
        // Reset levels
        case 'light':
        case 'medium':
        case 'full':
        case 'custom':
          args.level = arg;
          args.operation = 'reset';
          break;

        // Archive operations
        case 'list-archives':
          args.operation = 'list-archives';
          break;
        case 'archive-info':
          args.operation = 'archive-info';
          args.archiveName = argv[++i];
          break;
        case 'restore':
          args.operation = 'restore';
          args.archiveName = argv[++i];
          break;

        // Options
        case '--confirm':
          args.confirm = true;
          break;
        case '--no-archive':
          args.noArchive = true;
          break;
        case '--clear-archive':
          args.clearArchive = true;
          break;
        case '--archive-limit':
          args.archiveLimit = parseInt(argv[++i]);
          break;
        case '--custom-paths':
          // Parse comma-separated paths
          args.customPaths = argv[++i].split(',').map(p => p.trim());
          break;
        case '-h':
        case '--help':
          args.help = true;
          break;

        default:
          console.error(colors.error(`Unknown option: ${arg}`));
          console.log('Use --help for usage information');
          process.exit(1);
      }
    }

    return args;
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log(`
Project Reset Tool - JavaScript Implementation

Usage: node project-reset.js [COMMAND] [OPTIONS]

Reset Commands (with automatic archiving):
  light   - Clear documentation only, keep all memory
  medium  - Reset memory files only
  full    - Clear project-specific content (memory + docs)
  custom  - Custom reset with --custom-paths option

Archive Commands:
  list-archives           - Show all available archives
  archive-info <name>     - Show details about specific archive
  restore <name>          - Restore from specific archive

Options:
  --confirm               Skip confirmation prompts
  --no-archive            Skip archiving before reset
  --clear-archive         Clear old archives before reset
  --archive-limit N       Keep only N most recent archives
  --custom-paths <paths>  Comma-separated paths for custom reset
  -h, --help             Show this help message

Examples:
  node project-reset.js light
  node project-reset.js full --confirm
  node project-reset.js custom --custom-paths ".ai/docs/plans,.ai/memory/lessons.md"
  node project-reset.js list-archives
  node project-reset.js restore 2024-01-15-123456-full-reset
`);
  }

  /**
   * Perform reset operation
   * @param {string} level - Reset level
   * @param {Object} options - Reset options
   */
  async performReset(level, options) {
    console.log(colors.info(`Project Reset Tool - Level: ${level}`));
    console.log(colors.info('This will reset your project to a clean state for new development'));

    // Show what will be reset
    this.showResetPreview(level, options);

    // Confirmation
    if (!options.confirm) {
      console.log(colors.warning('This action cannot be undone!'));
      const confirmation = await this.promptUser('Are you sure you want to proceed? (type \'RESET\' to confirm): ');
      if (confirmation !== 'RESET') {
        console.log(colors.info('Reset cancelled'));
        return;
      }
    }

    console.log(colors.info('Starting reset process...'));

    // Perform the reset
    const result = await this.resetManager.performReset(level, {
      confirm: options.confirm,
      noArchive: options.noArchive,
      clearArchive: options.clearArchive,
      archiveLimit: options.archiveLimit,
      customPaths: options.customPaths
    });

    console.log(colors.success('Project reset completed successfully!'));

    // Show archive information
    if (result.archiveInfo) {
      console.log(colors.info(`Previous state archived as: ${result.archiveInfo.name}`));
      console.log(colors.info(`To restore: node project-reset.js restore ${result.archiveInfo.name}`));
    }

    this.showNextSteps();
  }

  /**
   * Show reset preview
   * @param {string} level - Reset level
   * @param {Object} options - Reset options
   */
  showResetPreview(level, options) {
    const descriptions = {
      light: 'Clear documentation only, keep all memory files',
      medium: 'Reset memory files only, keep documentation',
      full: 'Reset memory to templates, clear project-specific docs',
      custom: 'Custom reset with user-specified paths'
    };

    console.log(colors.warning(descriptions[level]));

    console.log(colors.info('The following actions will be performed:'));

    if (level === 'medium' || level === 'full') {
      console.log(colors.warning('  • Reset .ai/memory/lessons.md from template'));
      console.log(colors.warning('  • Reset .ai/memory/decisions.md from template'));
    }

    if (level === 'light' || level === 'full') {
      console.log(colors.warning('  • Clear .ai/docs/plans/ (except README.md)'));
      console.log(colors.warning('  • Clear .ai/docs/tasks/ (except README.md)'));
      console.log(colors.warning('  • Clear .ai/docs/reviews/ (except README.md)'));
      console.log(colors.warning('  • Clear .ai/docs/requirements/ (except README.md and templates)'));
      console.log(colors.warning('  • Clear .ai/docs/design/ (except README.md)'));
    }

    if (level === 'custom' && options.customPaths.length > 0) {
      console.log(colors.warning('  • Custom paths:'));
      options.customPaths.forEach(path => {
        console.log(colors.warning(`    - ${path}`));
      });
    }

    console.log(colors.info('The following will be PRESERVED:'));
    console.log(colors.success('  • .ai/protocols/ (generic engineering protocols)'));
    console.log(colors.success('  • .ai/workflows/ (generic workflows)'));
    console.log(colors.success('  • .ai/roles/ (generic role definitions)'));
    console.log(colors.success('  • .ai/skills/ (reusable automation tools)'));
    console.log(colors.success('  • All README.md files (templates and documentation)'));
    console.log(colors.success('  • Template files (*.template.md)'));
  }

  /**
   * List available archives
   */
  async listArchives() {
    console.log(colors.info('Available Archives:'));

    const archives = await this.resetManager.listArchives();

    if (archives.length === 0) {
      console.log(colors.warning('No archives found. Archives will be created automatically during reset operations.'));
      return;
    }

    // Display archives in table format
    console.log();
    console.log('Archive Name'.padEnd(30) + 'Type'.padEnd(12) + 'Files'.padEnd(8) + 'Date'.padEnd(12) + 'Valid');
    console.log('-'.repeat(70));

    for (const archive of archives) {
      const name = archive.name.padEnd(30);
      const type = (archive.metadata?.operation || 'unknown').padEnd(12);
      const files = (archive.metadata?.contents?.files?.total || '?').toString().padEnd(8);
      const date = archive.metadata?.created ? 
        new Date(archive.metadata.created).toLocaleDateString().padEnd(12) : 
        'unknown'.padEnd(12);
      const valid = archive.valid ? '✅' : '❌';

      console.log(`${name}${type}${files}${date}${valid}`);
    }
  }

  /**
   * Show archive information
   * @param {string} archiveName - Archive name
   */
  async showArchiveInfo(archiveName) {
    const archives = await this.resetManager.listArchives();
    const archive = archives.find(a => a.name === archiveName);

    if (!archive) {
      console.error(colors.error(`Archive not found: ${archiveName}`));
      return;
    }

    if (!archive.metadata) {
      console.error(colors.error(`Archive metadata not found: ${archiveName}`));
      return;
    }

    console.log(colors.info(`Archive Information: ${archiveName}`));
    console.log();

    const metadata = archive.metadata;
    console.log(`  Timestamp:    ${new Date(metadata.created).toLocaleString()}`);
    console.log(`  Operation:    ${metadata.operation}`);
    console.log(`  Git Commit:   ${metadata.source?.gitCommit?.substring(0, 8) || 'unknown'}`);
    console.log(`  Git Branch:   ${metadata.source?.gitBranch || 'unknown'}`);
    console.log(`  Created By:   ${metadata.source?.user || 'unknown'}`);
    console.log(`  Files:`);
    console.log(`    Memory:     ${metadata.contents?.files?.memory || 0} files`);
    console.log(`    Docs:       ${metadata.contents?.files?.docs || 0} files`);
    console.log(`    Total:      ${metadata.contents?.files?.total || 0} files`);
    console.log(`  Valid:        ${archive.valid ? 'Yes' : 'No'}`);

    console.log();
    console.log(colors.info('Restoration Command:'));
    console.log(`  node project-reset.js restore ${archiveName}`);
  }

  /**
   * Restore from archive
   * @param {string} archiveName - Archive name
   * @param {Object} options - Restore options
   */
  async restoreArchive(archiveName, options) {
    console.log(colors.info(`Restoring from archive: ${archiveName}`));
    console.log(colors.warning('This will overwrite current memory and documentation files!'));

    if (!options.confirm) {
      const confirmation = await this.promptUser('Are you sure you want to restore? (type \'RESTORE\' to confirm): ');
      if (confirmation !== 'RESTORE') {
        console.log(colors.info('Restore cancelled'));
        return;
      }
    }

    const result = await this.resetManager.restoreFromArchive(archiveName, options);

    console.log(colors.success('Archive restoration completed!'));
    console.log(colors.info(`Previous state backed up as: ${result.backupCreated}`));
  }

  /**
   * Show next steps after reset
   */
  showNextSteps() {
    console.log(colors.info('Your project is now ready for fresh development while preserving all generic engineering wisdom.'));
    console.log();
    console.log(colors.info('Next steps:'));
    console.log(colors.success('  1. Review .ai/memory/lessons.md and .ai/memory/decisions.md'));
    console.log(colors.success('  2. Start your new project development'));
    console.log(colors.success('  3. Document new patterns and lessons as you build'));
    console.log(colors.success('  4. Use .ai/workflows/planning.md to plan your first feature'));
    console.log(colors.success('  5. Use \'node project-reset.js list-archives\' to manage archives'));
  }

  /**
   * Prompt user for input
   * @param {string} question - Question to ask
   * @returns {Promise<string>} User input
   */
  async promptUser(question) {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  const cli = new ProjectResetCLI();
  cli.run().catch(error => {
    console.error(colors.error(`Fatal error: ${error.message}`));
    process.exit(1);
  });
}

module.exports = ProjectResetCLI;