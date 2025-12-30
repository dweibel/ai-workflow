#!/bin/bash

# Project Reset Tool with Archive Enhancement
# 
# Enhanced project reset tool with automatic archiving capabilities, improved reset options,
# and archive management features. Provides safety and recovery options while making 
# reset operations more intuitive.
#
# Usage:
#   ./project-reset.sh [docs|memory|project] [options]
#   ./project-reset.sh [list-archives|archive-info|restore] [archive-name]
#
# Reset Options (with automatic archiving):
#   docs    - Clear documentation only, keep all memory
#   memory  - Reset memory files only
#   project - Clear project-specific content (memory + docs)
#
# Archive Operations:
#   list-archives           - Show all available archives
#   archive-info <name>     - Show details about specific archive
#   restore <name>          - Restore from specific archive

set -e

# Color functions for better UX
print_success() { echo -e "\033[32m✅ $1\033[0m"; }
print_warning() { echo -e "\033[33m⚠️  $1\033[0m"; }
print_error() { echo -e "\033[31m❌ $1\033[0m"; }
print_info() { echo -e "\033[36mℹ️  $1\033[0m"; }

# Archive functions
create_archive() {
    local reset_type="$1"
    local timestamp=$(date -u +%Y-%m-%d-%H%M%S)
    local archive_dir=".ai/archive/${timestamp}-${reset_type}"
    local git_commit=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    
    print_info "Creating archive: ${timestamp}-${reset_type}"
    
    # Create archive directory
    mkdir -p "$archive_dir"
    
    # Initialize counters
    local memory_count=0
    local docs_count=0
    
    # Archive memory files if they exist
    if [[ -f ".ai/memory/lessons.md" ]] || [[ -f ".ai/memory/decisions.md" ]]; then
        mkdir -p "$archive_dir/memory"
        if [[ -f ".ai/memory/lessons.md" ]]; then
            cp ".ai/memory/lessons.md" "$archive_dir/memory/"
            ((memory_count++))
        fi
        if [[ -f ".ai/memory/decisions.md" ]]; then
            cp ".ai/memory/decisions.md" "$archive_dir/memory/"
            ((memory_count++))
        fi
    fi
    
    # Archive documentation if it exists
    local doc_dirs=(".ai/docs/plans" ".ai/docs/tasks" ".ai/docs/reviews" ".ai/docs/requirements" ".ai/docs/design")
    for dir in "${doc_dirs[@]}"; do
        if [[ -d "$dir" ]]; then
            local files_found=$(find "$dir" -type f -name "*.md" ! -name "README.md" ! -name "*.template.md" 2>/dev/null | wc -l)
            if [[ $files_found -gt 0 ]]; then
                local target_dir="$archive_dir/docs/$(basename "$dir")"
                mkdir -p "$target_dir"
                find "$dir" -type f -name "*.md" ! -name "README.md" ! -name "*.template.md" -exec cp {} "$target_dir/" \; 2>/dev/null || true
                docs_count=$((docs_count + files_found))
            fi
        fi
    done
    
    # Create archive metadata
    local total_count=$((memory_count + docs_count))
    cat > "$archive_dir/archive-info.json" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "resetType": "$reset_type",
  "gitCommit": "$git_commit",
  "user": "$(whoami)",
  "filesArchived": {
    "memory": $memory_count,
    "docs": $docs_count,
    "total": $total_count
  },
  "restorationCommand": "./project-reset.sh restore ${timestamp}-${reset_type}"
}
EOF
    
    print_success "Archive created: $archive_dir ($total_count files)"
    echo "$archive_dir"
}

list_archives() {
    print_info "Available Archives:"
    
    if [[ ! -d ".ai/archive" ]]; then
        print_warning "No archives found. Archives will be created automatically during reset operations."
        return
    fi
    
    local archives=($(ls -1 ".ai/archive" | grep -E '^[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{6}-' | sort -r))
    
    if [[ ${#archives[@]} -eq 0 ]]; then
        print_warning "No archives found."
        return
    fi
    
    printf "%-25s %-10s %-8s %-12s %s\n" "Archive Name" "Type" "Files" "Date" "Git Commit"
    printf "%-25s %-10s %-8s %-12s %s\n" "------------------------" "--------" "------" "----------" "----------"
    
    for archive in "${archives[@]}"; do
        if [[ -f ".ai/archive/$archive/archive-info.json" ]]; then
            local reset_type=$(grep -o '"resetType": "[^"]*"' ".ai/archive/$archive/archive-info.json" | cut -d'"' -f4)
            local total_files=$(grep -o '"total": [0-9]*' ".ai/archive/$archive/archive-info.json" | cut -d' ' -f2)
            local date_part=$(echo "$archive" | cut -d'-' -f1-3)
            local git_commit=$(grep -o '"gitCommit": "[^"]*"' ".ai/archive/$archive/archive-info.json" | cut -d'"' -f4 | cut -c1-8)
            
            printf "%-25s %-10s %-8s %-12s %s\n" "$archive" "$reset_type" "$total_files" "$date_part" "$git_commit"
        else
            printf "%-25s %-10s %-8s %-12s %s\n" "$archive" "unknown" "?" "?" "?"
        fi
    done
}

archive_info() {
    local archive_name="$1"
    local archive_path=".ai/archive/$archive_name"
    
    if [[ ! -d "$archive_path" ]]; then
        print_error "Archive not found: $archive_name"
        return 1
    fi
    
    if [[ ! -f "$archive_path/archive-info.json" ]]; then
        print_error "Archive metadata not found: $archive_name/archive-info.json"
        return 1
    fi
    
    print_info "Archive Information: $archive_name"
    echo
    
    # Parse and display metadata
    local timestamp=$(grep -o '"timestamp": "[^"]*"' "$archive_path/archive-info.json" | cut -d'"' -f4)
    local reset_type=$(grep -o '"resetType": "[^"]*"' "$archive_path/archive-info.json" | cut -d'"' -f4)
    local git_commit=$(grep -o '"gitCommit": "[^"]*"' "$archive_path/archive-info.json" | cut -d'"' -f4)
    local user=$(grep -o '"user": "[^"]*"' "$archive_path/archive-info.json" | cut -d'"' -f4)
    local memory_count=$(grep -o '"memory": [0-9]*' "$archive_path/archive-info.json" | cut -d' ' -f2)
    local docs_count=$(grep -o '"docs": [0-9]*' "$archive_path/archive-info.json" | cut -d' ' -f2)
    local total_count=$(grep -o '"total": [0-9]*' "$archive_path/archive-info.json" | cut -d' ' -f2)
    
    echo "  Timestamp:    $timestamp"
    echo "  Reset Type:   $reset_type"
    echo "  Git Commit:   $git_commit"
    echo "  Created By:   $user"
    echo "  Files:"
    echo "    Memory:     $memory_count files"
    echo "    Docs:       $docs_count files"
    echo "    Total:      $total_count files"
    echo
    
    # Show directory structure
    print_info "Archive Contents:"
    if command -v tree >/dev/null 2>&1; then
        tree "$archive_path" -I "archive-info.json"
    else
        find "$archive_path" -type f ! -name "archive-info.json" | sed 's|^.ai/archive/[^/]*/|  |' | sort
    fi
    
    echo
    print_info "Restoration Command:"
    echo "  ./project-reset.sh restore $archive_name"
}

cleanup_archives() {
    local limit="$1"
    
    if [[ ! -d ".ai/archive" ]]; then
        return
    fi
    
    local archives=($(ls -1 ".ai/archive" | grep -E '^[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{6}-' | sort -r))
    
    if [[ ${#archives[@]} -le $limit ]]; then
        return
    fi
    
    print_info "Cleaning up old archives (keeping $limit most recent)..."
    
    for ((i=$limit; i<${#archives[@]}; i++)); do
        local archive="${archives[$i]}"
        print_info "Removing old archive: $archive"
        rm -rf ".ai/archive/$archive"
    done
}

restore_archive() {
    local archive_name="$1"
    local archive_path=".ai/archive/$archive_name"
    
    if [[ ! -d "$archive_path" ]]; then
        print_error "Archive not found: $archive_name"
        return 1
    fi
    
    print_info "Restoring from archive: $archive_name"
    print_warning "This will overwrite current memory and documentation files!"
    
    if [[ "$CONFIRM" != "true" ]]; then
        read -p "Are you sure you want to restore? (type 'RESTORE' to confirm): " confirmation
        if [[ "$confirmation" != "RESTORE" ]]; then
            print_info "Restore cancelled"
            return 0
        fi
    fi
    
    # Create backup of current state before restoration
    local backup_archive=$(create_archive "pre-restore")
    print_info "Current state backed up to: $(basename "$backup_archive")"
    
    # Restore memory files
    if [[ -d "$archive_path/memory" ]]; then
        print_info "Restoring memory files..."
        cp -r "$archive_path/memory/"* ".ai/memory/" 2>/dev/null || true
        print_success "Memory files restored"
    fi
    
    # Restore documentation
    if [[ -d "$archive_path/docs" ]]; then
        print_info "Restoring documentation..."
        for doc_dir in "$archive_path/docs"/*; do
            if [[ -d "$doc_dir" ]]; then
                local target_dir=".ai/docs/$(basename "$doc_dir")"
                mkdir -p "$target_dir"
                cp -r "$doc_dir/"* "$target_dir/" 2>/dev/null || true
                print_success "Restored $(basename "$doc_dir")"
            fi
        done
    fi
    
    print_success "Archive restoration completed!"
    print_info "Previous state backed up as: $(basename "$backup_archive")"
}

# Parse arguments
LEVEL=""
CONFIRM=false
NO_ARCHIVE=false
CLEAR_ARCHIVE=false
ARCHIVE_LIMIT=""
OPERATION=""
ARCHIVE_NAME=""

while [[ $# -gt 0 ]]; do
    case $1 in
        # Reset options
        docs|memory|project)
            LEVEL="$1"
            OPERATION="reset"
            shift
            ;;
        # Archive operations
        list-archives)
            OPERATION="list-archives"
            shift
            ;;
        archive-info)
            OPERATION="archive-info"
            ARCHIVE_NAME="$2"
            shift 2
            ;;
        restore)
            OPERATION="restore"
            ARCHIVE_NAME="$2"
            shift 2
            ;;
        # Options
        --confirm)
            CONFIRM=true
            shift
            ;;
        --no-archive)
            NO_ARCHIVE=true
            shift
            ;;
        --clear-archive)
            CLEAR_ARCHIVE=true
            shift
            ;;
        --archive-limit)
            ARCHIVE_LIMIT="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [COMMAND] [OPTIONS]"
            echo ""
            echo "Reset Commands (with automatic archiving):"
            echo "  docs    - Clear documentation only, keep all memory"
            echo "  memory  - Reset memory files only"
            echo "  project - Clear project-specific content (memory + docs)"
            echo ""
            echo "Archive Commands:"
            echo "  list-archives           - Show all available archives"
            echo "  archive-info <name>     - Show details about specific archive"
            echo "  restore <name>          - Restore from specific archive"
            echo ""
            echo "Options:"
            echo "  --confirm           Skip confirmation prompts"
            echo "  --no-archive        Skip archiving before reset"
            echo "  --clear-archive     Clear old archives before reset"
            echo "  --archive-limit N   Keep only N most recent archives"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Validation
if [[ ! -d ".ai" ]]; then
    print_error "This script must be run from the repository root (where .ai directory exists)"
    exit 1
fi

# Handle archive operations
case "$OPERATION" in
    list-archives)
        list_archives
        exit 0
        ;;
    archive-info)
        if [[ -z "$ARCHIVE_NAME" ]]; then
            print_error "Archive name is required for archive-info command"
            exit 1
        fi
        archive_info "$ARCHIVE_NAME"
        exit 0
        ;;
    restore)
        if [[ -z "$ARCHIVE_NAME" ]]; then
            print_error "Archive name is required for restore command"
            exit 1
        fi
        restore_archive "$ARCHIVE_NAME"
        exit 0
        ;;
    reset)
        # Continue with reset operation
        ;;
    *)
        if [[ -z "$OPERATION" ]]; then
            print_error "Command is required. Use: docs, memory, project, list-archives, archive-info, or restore"
        else
            print_error "Unknown operation: $OPERATION"
        fi
        echo "Use --help for usage information"
        exit 1
        ;;
esac

# Validation for reset operations
if [[ -z "$LEVEL" ]]; then
    print_error "Reset level is required. Use: docs, memory, or project"
    echo "Use --help for usage information"
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
reset_memory[docs]=false
reset_docs[docs]=true
descriptions[docs]="Clear documentation only, keep all memory files"

reset_memory[memory]=true
reset_docs[memory]=false
descriptions[memory]="Reset memory files only, keep documentation"

reset_memory[project]=true
reset_docs[project]=true
descriptions[project]="Reset memory to templates, clear project-specific docs"

print_warning "${descriptions[$LEVEL]}"

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

# Archive cleanup if requested
if [[ "$CLEAR_ARCHIVE" == "true" ]]; then
    print_info "Clearing old archives..."
    if [[ -d ".ai/archive" ]]; then
        rm -rf .ai/archive/*
        print_success "Old archives cleared"
    fi
fi

# Create archive before reset (unless disabled)
ARCHIVE_DIR=""
if [[ "$NO_ARCHIVE" != "true" ]]; then
    # Ensure archive directory exists
    mkdir -p ".ai/archive"
    
    # Create archive
    ARCHIVE_DIR=$(create_archive "$LEVEL")
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

# Archive limit cleanup if specified
if [[ -n "$ARCHIVE_LIMIT" ]]; then
    cleanup_archives "$ARCHIVE_LIMIT"
fi

print_success "Project reset completed successfully!"

# Show archive information
if [[ -n "$ARCHIVE_DIR" ]]; then
    print_info "Previous state archived as: $(basename "$ARCHIVE_DIR")"
    print_info "To restore: ./project-reset.sh restore $(basename "$ARCHIVE_DIR")"
fi

print_info "Your project is now ready for fresh development while preserving all generic engineering wisdom."

# Show next steps
print_info "Next steps:"
print_success "  1. Review .ai/memory/lessons.md and .ai/memory/decisions.md"
print_success "  2. Start your new project development"
print_success "  3. Document new patterns and lessons as you build"
print_success "  4. Use .ai/workflows/planning.md to plan your first feature"
print_success "  5. Use './project-reset.sh list-archives' to manage archives"