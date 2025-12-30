# Compound Engineering Lessons Learned

> **Memory system for codifying lessons from past mistakes and corrections**

This file contains lessons learned from actual development sessions, extracted from chat history corrections, failed tests, and user feedback. Each lesson follows the format: "When doing X, always ensure Y to prevent Z."

## Documentation and Structure

- When creating skill documentation, always use consistent terminology (skills vs sub-skills) to prevent user confusion.
- When referencing file paths, always verify they exist in the actual directory structure to prevent broken references.
- When updating version information, always synchronize across all files (package.json, SKILL.md files, documentation) to prevent inconsistencies.
- When creating activation triggers, always maintain a single authoritative reference to prevent conflicting instructions.

## Installation and Setup

- When providing installation instructions, always consolidate into a single comprehensive guide with cross-references to prevent duplication and maintenance burden.
- When supporting multiple platforms, always document platform-specific requirements clearly to prevent setup failures.
- When creating validation scripts, always check for actual file existence rather than assuming structure to prevent false positives.

## Skills and Activation

- When designing skill activation, always use semantic analysis with confidence scoring to improve user experience.
- When creating skill metadata, always follow Agent Skills Standard YAML frontmatter format to ensure compatibility.
- When routing between skills, always load appropriate context progressively to optimize token usage.

## Testing and Validation

- When writing tests, always validate against actual file structure rather than assumed structure to prevent test failures.
- When creating validation scripts, always handle cross-platform compatibility (line endings, path separators) to prevent platform-specific failures.
- When checking dependencies, always allow Node.js built-in modules while preventing external dependencies to maintain portability.

## Version Management

- When releasing updates, always update all version references simultaneously to prevent inconsistencies.
- When creating version validation, always check semantic versioning format to ensure compatibility.
- When documenting versions, always include release dates and compatibility matrices to help users.

## Attribution and Licensing

- When adapting existing work, always maintain clear attribution to original authors to respect intellectual property.
- When creating derivative works, always document the relationship to original work to provide proper context.
- When using open source components, always verify license compatibility to prevent legal issues.

## Cross-Platform Compatibility

- When creating bash scripts, always document that Windows users need WSL or Git Bash to prevent execution failures.
- When handling file paths, always use forward slashes in documentation for consistency across platforms.
- When setting file permissions, always handle platform differences gracefully to prevent permission errors.

## Memory Management

- When memory files exceed 100 entries, always consolidate similar patterns into higher-level principles to prevent context window bloat.
- When lessons become obsolete due to automation, always archive them to maintain relevant content.
- When extracting lessons from sessions, always focus on underlying principles rather than specific symptoms to maximize learning value.

---

*This file is automatically updated through retrospective analysis of development sessions. Each lesson represents a real mistake that was made and corrected, codified to prevent future occurrences.*
## Code Simplification and Maintenance

- When maintaining installation scripts, always remove redundant wrappers that provide no additional functionality to reduce maintenance overhead and potential confusion.

## Cross-Reference Validation

- When implementing cross-reference validation, always distinguish between example/template references and actual file references to prevent false positives.
- When creating documentation with example file paths, always use clear placeholder formatting (e.g., `[feature-name]`, `YYYY-MM-DD-feature-name`) to indicate they are templates.
- When validating cross-references, always provide clear categorization of errors (broken links vs missing examples vs template references) to help users prioritize fixes.
- When building validation systems, always include fix suggestions and categorization to make error resolution more efficient.

## Documentation Consistency and Maintenance

- When standardizing naming conventions, always update all references consistently across the entire documentation set to prevent user confusion.
- When consolidating platform-specific instructions, always create a single authoritative section with clear requirements to reduce maintenance overhead.
- When creating missing referenced files, always ensure they follow the established patterns and quality standards to maintain system coherence.
- When removing attribution inconsistencies, always maintain clear licensing information while removing redundant or conflicting attribution statements.