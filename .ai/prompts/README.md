# Prompts Directory

This directory contains structured AI prompts that guide agents through systematic engineering workflows. These prompts implement the EARS workflow methodology by codifying best practices into executable instructions.

## Workflow Prompts

### Memory Management
- **`memory-loading.md`** - Instructions for loading EARS workflow memory at workflow start
- **`lessons-extraction.md`** - System for identifying and extracting lessons learned during execution

### Requirements Engineering
- **`requirements-template.md`** - Template and instructions for creating EARS-compliant requirements documents
- **`ears-validation.md`** - Validation prompts for EARS pattern compliance
- **`incose-validation.md`** - Quality validation against INCOSE engineering standards

### Specification Analysis
- **`testability-analysis.md`** - Analysis system for determining what can be automatically tested
- **`correctness-properties.md`** - Generation of formal correctness properties for property-based testing
- **`round-trip-detection.md`** - Auto-detection of when round-trip testing requirements are needed

## Usage

These prompts are designed to be executed by AI agents during specific workflow phases:

```
PHASE: Requirements → Use: requirements-template.md, ears-validation.md, incose-validation.md
PHASE: Design → Use: testability-analysis.md, correctness-properties.md, round-trip-detection.md
PHASE: Retrospective → Use: lessons-extraction.md
PHASE: Startup → Use: memory-loading.md
```

## Prompt Philosophy

Each prompt follows the EARS workflow principle by:
- **Systematic Process**: Step-by-step instructions for consistent execution
- **Quality Gates**: Built-in validation and quality checks
- **Knowledge Capture**: Integration with memory system for continuous improvement
- **Automation**: Structured format enables reliable AI execution

## Integration with Workflows

These prompts integrate with the main workflow files in `.ai/workflows/`:
- **Planning Phase**: Uses memory-loading and requirements prompts
- **Execution Phase**: Uses analysis and property generation prompts
- **Review Phase**: Uses validation and extraction prompts

## Customization

To customize prompts for your organization:
1. Modify the structured instructions to match your standards
2. Add organization-specific validation rules
3. Include references to your internal tools and processes
4. Maintain the structured format for reliable AI execution

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-19  
**Part of**: EARS Workflow System