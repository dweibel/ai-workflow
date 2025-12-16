#!/bin/bash

# Project Reset Tool - Template-Based Reset (Option 2)
# 
# This script implements Option 2 (Template-Based Reset) from the project reset strategy.
# It resets memory files to template versions and clears project-specific documentation
# while preserving generic engineering wisdom and reusable tooling.
#
# Usage:
#   ./.ai/scripts/project-reset.sh [light|medium|full|custom] [--confirm]
#
# Levels:
#   light  - Clear docs only, keep all memory
#   medium - Reset memory to templates, clear project docs  
#   full   - Reset everything to templates, clear all docs
#   custom - Interactive mode to choose what to reset

set -e

# Color functions for better UX
print_success() { echo -e "\033[32m✅ $1\033[0m"; }
print_warning() { echo -e "\033[33m⚠️  $1\033[0m"; }
print_error() { echo -e "\033[31m❌ $1\033[0m"; }
print_info() { echo -e "\033[36mℹ️  $1\033[0m"; }

# Parse arguments
LEVEL=""
CONFIRM=false

while [[ $# -gt 0 ]]; do
    case $1 in
        light|medium|full|custom)
            LEVEL="$1"
            shift
            ;;
        --confirm)
            CONFIRM=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [light|medium|full|custom] [--confirm]"
            echo ""
            echo "Levels:"
            echo "  light  - Clear docs only, keep all memory"
            echo "  medium - Reset memory to templates, clear project docs"
            echo "  full   - Reset everything to templates, clear all docs"
            echo "  custom - Interactive mode to choose what to reset"
            echo ""
            echo "Options:"
            echo "  --confirm  Skip confirmation prompts"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

if [[ -z "$LEVEL" ]]; then
    print_error "Level is required. Use: light, medium, full, or custom"
    echo "Use --help for usage information"
    exit 1
fi

# Validation
if [[ ! -d ".ai" ]]; then
    print_error "This script must be run from the repository root (where .ai directory exists)"
    exit 1
fi

if [[ ! -f ".ai/templates/lessons.template.md" ]] || [[ ! -f ".ai/templates/decisions.template.md" ]]; then
    print_error "Template files not found. Please ensure .ai/templates/*.template.md files exist"
    exit 1
fi

print_info "Project Reset Tool - Level: $LEVEL"
print_info "This will reset your project to a clean state for new development"

# Define what each level does
declare -A reset_memory reset_docs descriptions
reset_memory[light]=false
reset_docs[light]=true
descriptions[light]="Clear project docs only, keep all memory files"

reset_memory[medium]=true
reset_docs[medium]=true
descriptions[medium]="Reset memory to templates, clear project-specific docs"

reset_memory[full]=true
reset_docs[full]=true
descriptions[full]="Reset everything to templates, clear all documentation"

reset_memory[custom]=""
reset_docs[custom]=""
descriptions[custom]="Interactive mode - choose what to reset"

print_warning "${descriptions[$LEVEL]}"

# Custom level - ask user what to reset
if [[ "$LEVEL" == "custom" ]]; then
    print_info "Custom Reset - Choose what to reset:"
    
    while true; do
        read -p "Reset memory files to templates? (y/n): " response
        case $response in
            [yY]|[yY][eE][sS]) reset_memory[custom]=true; break;;
            [nN]|[nN][oO]) reset_memory[custom]=false; break;;
            *) print_warning "Please enter 'y' or 'n'";;
        esac
    done
    
    while true; do
        read -p "Clear project documentation? (y/n): " response
        case $response in
            [yY]|[yY][eE][sS]) reset_docs[custom]=true; break;;
            [nN]|[nN][oO]) reset_docs[custom]=false; break;;
            *) print_warning "Please enter 'y' or 'n'";;
        esac
    done
fi

# Show what will be reset
print_info "The following actions will be performed:"
if [[ "${reset_memory[$LEVEL]}" == "true" ]]; then
    print_warning "  • Reset .ai/memory/lessons.md from template"
    print_warning "  • Reset .ai/memory/decisions.md from template"
fi
if [[ "${reset_docs[$LEVEL]}" == "true" ]]; then
    print_warning "  • Clear .ai/docs/plans/ (except README.md)"
    print_warning "  • Clear .ai/docs/tasks/ (except README.md)"
    print_warning "  • Clear .ai/docs/reviews/ (except README.md)"
    print_warning "  • Clear .ai/docs/requirements/ (except README.md and templates)"
    print_warning "  • Clear .ai/docs/design/ (except README.md)"
fi

print_info "The following will be PRESERVED:"
print_success "  • .ai/protocols/ (generic engineering protocols)"
print_success "  • .ai/workflows/ (generic workflows)"
print_success "  • .ai/roles/ (generic role definitions)"
print_success "  • .ai/scripts/ (reusable automation tools)"
print_success "  • All README.md files (templates and documentation)"
print_success "  • Template files (*.template.md)"

# Confirmation
if [[ "$CONFIRM" != "true" ]]; then
    print_warning "This action cannot be undone!"
    read -p "Are you sure you want to proceed? (type 'RESET' to confirm): " confirmation
    if [[ "$confirmation" != "RESET" ]]; then
        print_info "Reset cancelled"
        exit 0
    fi
fi

print_info "Starting reset process..."

# Reset memory files
if [[ "${reset_memory[$LEVEL]}" == "true" ]]; then
    print_info "Resetting memory files to templates..."
    
    # Get current date for template placeholders
    current_date=$(date +%Y-%m-%d)
    
    # Reset lessons.md
    if sed "s/\[DATE\]/$current_date/g" ".ai/templates/lessons.template.md" > ".ai/memory/lessons.md"; then
        print_success "Reset .ai/memory/lessons.md"
    else
        print_error "Failed to reset .ai/memory/lessons.md"
        exit 1
    fi
    
    # Reset decisions.md
    if sed "s/\[DATE\]/$current_date/g" ".ai/templates/decisions.template.md" > ".ai/memory/decisions.md"; then
        print_success "Reset .ai/memory/decisions.md"
    else
        print_error "Failed to reset .ai/memory/decisions.md"
        exit 1
    fi
fi

# Clear documentation
if [[ "${reset_docs[$LEVEL]}" == "true" ]]; then
    print_info "Clearing project documentation..."
    
    doc_dirs=(".ai/docs/plans" ".ai/docs/tasks" ".ai/docs/reviews" ".ai/docs/requirements" ".ai/docs/design")
    
    for dir in "${doc_dirs[@]}"; do
        if [[ -d "$dir" ]]; then
            # Remove all files except README.md and *.template.md
            find "$dir" -type f -name "*.md" ! -name "README.md" ! -name "*.template.md" -delete 2>/dev/null || true
            
            # Also check subdirectories
            find "$dir" -type d -mindepth 1 -exec sh -c '
                for subdir; do
                    find "$subdir" -type f -name "*.md" ! -name "README.md" ! -name "*.template.md" -delete 2>/dev/null || true
                done
            ' sh {} +
            
            print_success "Cleared $dir"
        fi
    done
fi

print_success "Project reset completed successfully!"
print_info "Your project is now ready for fresh development while preserving all generic engineering wisdom."

# Show next steps
print_info "Next steps:"
print_success "  1. Review .ai/memory/lessons.md and .ai/memory/decisions.md"
print_success "  2. Start your new project development"
print_success "  3. Document new patterns and lessons as you build"
print_success "  4. Use .ai/workflows/planning.md to plan your first feature"