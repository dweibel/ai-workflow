# Shared Infrastructure for JavaScript Skills

This directory contains shared modules used across JavaScript skill implementations for the bash-to-javascript conversion project.

## Modules

### ErrorHandler (`error-handler.js`)
Provides structured error handling following the design specification's ErrorInformation model.

**Features:**
- Git command error handling with specific suggestions
- File system error handling with context
- User input validation errors
- Structured error formatting for display

**Usage:**
```javascript
const ErrorHandler = require('./shared/error-handler');

try {
  // Some operation
} catch (error) {
  const structuredError = ErrorHandler.handleGitError(error, 'git worktree add', context);
  console.error(ErrorHandler.formatErrorMessage(structuredError));
}
```

### ConfigManager (`config-manager.js`)
Manages JSON-based configuration files with validation and merging capabilities.

**Features:**
- Default configuration management
- JSON schema validation
- Configuration merging (user overrides defaults)
- Path-based value access
- Configuration caching

**Usage:**
```javascript
const ConfigManager = require('./shared/config-manager');

const configManager = new ConfigManager();
const config = await configManager.loadConfiguration('.ai/config/skills.json');
const baseDir = configManager.getConfigValue(config, 'worktree.baseDirectory');
```

### FileOperations (`file-operations.js`)
Cross-platform file system operations with safety checks and error handling.

**Features:**
- Recursive directory copying with exclusion patterns
- Safe directory removal with critical path protection
- Directory size calculation
- Path validation against requirements
- Cross-platform path utilities

**Usage:**
```javascript
const FileOperations = require('./shared/file-operations');

await FileOperations.copyDirectory(source, dest, { exclude: ['node_modules'] });
await FileOperations.ensureDirectory('/path/to/directory');
const size = await FileOperations.getDirectorySize('/path/to/directory');
```

### CLIUtils (`cli-utils.js`)
Common CLI functionality for argument parsing, formatting, and user interaction.

**Features:**
- Command line argument parsing
- Table formatting for output
- Help text generation
- User prompting with validation
- Terminal color support
- Progress indicators

**Usage:**
```javascript
const CLIUtils = require('./shared/cli-utils');

const args = CLIUtils.parseArguments(process.argv);
const table = CLIUtils.formatTable(data, ['name', 'status', 'path']);
const input = await CLIUtils.promptUser('Enter branch name', { required: true });
```

## Testing

### Property-Based Testing
The shared infrastructure includes property-based testing support using fast-check.

**Test Setup:**
- `test-setup.js` - Jest configuration for property-based testing
- Custom matchers for error information and configuration validation
- Test data generators for common patterns

**Running Tests:**
```bash
# Run all tests
npm test

# Run specific test file
npm test -- --testPathPattern="config-manager.test.js"

# Run with coverage
npm test -- --coverage
```

### Simple Test Runner
For environments where Jest is not available, use the simple test runner:

```bash
node .ai/skills/shared/simple-test.js
```

## Configuration Schema

The configuration follows this structure:

```json
{
  "worktree": {
    "baseDirectory": "../worktrees",
    "branchPrefix": ["feature/", "bugfix/", "hotfix/"],
    "autoCleanup": false,
    "maxWorktrees": 10
  },
  "reset": {
    "archiveDirectory": ".ai/archive",
    "compressionLevel": 6,
    "retentionDays": 30,
    "confirmDestructive": true
  },
  "display": {
    "colorOutput": true,
    "progressIndicators": true,
    "verboseLogging": false
  }
}
```

## Error Handling

All modules follow the structured error handling pattern:

```javascript
{
  code: "ERROR_CODE",
  message: "Human-readable message",
  command: "command that failed",
  exitCode: 1,
  context: {
    operation: "operation_name",
    parameters: { /* operation parameters */ },
    environment: { /* environment info */ }
  },
  suggestions: ["suggestion 1", "suggestion 2"],
  documentation: "https://link-to-docs"
}
```

## Property-Based Testing

The infrastructure supports property-based testing with the following properties validated:

- **Property 9: Configuration consistency** - JSON-based configuration files follow established schema and validation patterns

Test generators are provided for:
- Valid configuration objects
- Branch names
- File paths
- Git commands

## Integration

These shared modules are designed to be used by:
- Git Worktree Manager (`git-worktree/`)
- Project Reset Manager (`project-reset/`)
- Any future JavaScript skill implementations

All modules follow the design principles:
- Cross-platform compatibility
- Structured error handling
- Comprehensive testing
- Clear separation of concerns