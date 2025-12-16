# Templates Directory

This directory contains template files used by the project reset tools to restore clean baseline configurations.

## Available Templates

### Memory Templates

- **`lessons.template.md`** - Clean baseline for lessons learned with generic engineering wisdom
- **`decisions.template.md`** - Clean baseline for architectural decisions with example patterns

## Usage

These templates are used by the project reset scripts:

```powershell
# Windows
.\.ai\scripts\project-reset.ps1 -Level Medium

# Unix/Linux/macOS
./.ai/scripts/project-reset.sh medium
```

## Template Maintenance

When updating templates:

1. **Preserve Generic Wisdom**: Keep patterns that apply to any project
2. **Use Placeholders**: Use `[DATE]` for dynamic date insertion
3. **Remove Project-Specific Content**: Avoid references to specific features or implementations
4. **Maintain Structure**: Keep the established format and sections
5. **Update Both Files**: Ensure consistency between lessons and decisions templates

## Template Philosophy

Templates embody the Compound Engineering principle by:
- **Preserving Knowledge**: Generic engineering wisdom is retained across projects
- **Enabling Fresh Starts**: Project-specific content is cleanly removed
- **Maintaining Standards**: Consistent structure and quality patterns
- **Reducing Setup Time**: New projects start with proven patterns

## Customization

To customize templates for your organization:

1. Edit the template files to include your specific standards
2. Add organization-specific patterns and conventions
3. Include references to your internal tools and processes
4. Maintain the `[DATE]` placeholder for dynamic content

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-16  
**Part of**: Compound Engineering System