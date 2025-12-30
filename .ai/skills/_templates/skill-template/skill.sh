#!/bin/bash
# [Skill Name] for EARS Workflow
#
# [Detailed description of what this skill does and how it fits into the EARS workflow]
#
# Based on the Compound Engineering Plugin by EveryInc:
# https://github.com/EveryInc/compound-engineering-plugin
#
# Usage:
#   ./skill-name.sh <action> [parameter] [--confirm]
#   ./skill-name.sh help
#
# Actions:
#   action1    [Description of action1]
#   action2    [Description of action2]
#   action3    [Description of action3]
#   help       Show help message
#
# Examples:
#   ./skill-name.sh action1 "example-parameter"
#   ./skill-name.sh action2 --confirm
#   ./skill-name.sh help

set -e

# Color output functions
print_success() { echo -e "\033[32m✅ $1\033[0m"; }
print_error() { echo -e "\033[31m❌ $1\033[0m"; }
print_info() { echo -e "\033[36mℹ️  $1\033[0m"; }
print_warning() { echo -e "\033[33m⚠️  $1\033[0m"; }

# Parse arguments
ACTION="$1"
PARAMETER="$2"
CONFIRM=false

# Parse flags
while [[ $# -gt 0 ]]; do
    case $1 in
        --confirm)
            CONFIRM=true
            shift
            ;;
        *)
            shift
            ;;
    esac
done

# Validation functions
check_prerequisites() {
    # Add validation logic here
    # Example: Check if we're in a git repository
    if [ ! -d ".git" ]; then
        print_error "Not in a git repository. Please run this script from the root of your git repository."
        exit 1
    fi
    
    # Example: Check for required files
    if [ ! -d ".ai" ]; then
        print_error ".ai directory not found. Please ensure you're in an EARS Workflow project."
        exit 1
    fi
}

# Help function
show_help() {
    echo -e "\033[36m[Skill Name] for EARS Workflow\033[0m"
    echo
    echo -e "\033[33mUsage:\033[0m"
    echo "  $0 <action> [parameter] [--confirm]"
    echo
    echo -e "\033[33mActions:\033[0m"
    echo "  action1    [Description of action1]"
    echo "  action2    [Description of action2]"
    echo "  action3    [Description of action3]"
    echo "  help       Show this help message"
    echo
    echo -e "\033[33mOptions:\033[0m"
    echo "  --confirm  Skip confirmation prompts"
    echo
    echo -e "\033[33mExamples:\033[0m"
    echo "  $0 action1 \"example-parameter\""
    echo "  $0 action2 --confirm"
    echo "  $0 help"
    echo
}

# Action implementations
action1() {
    local parameter="$1"
    
    print_info "Performing action1..."
    
    # Validate parameters if needed
    if [ -z "$parameter" ]; then
        print_error "Parameter is required for action1"
        echo "Usage: $0 action1 <parameter>"
        exit 1
    fi
    
    # Add your implementation here
    print_info "Processing with parameter: $parameter"
    
    # Example: Confirmation prompt for destructive actions
    if [ "$CONFIRM" != "true" ]; then
        read -p "Are you sure you want to proceed? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Operation cancelled"
            exit 0
        fi
    fi
    
    # Perform the actual work
    # Your implementation here
    
    print_success "Action1 completed successfully"
    print_info "Next steps: [guidance for user]"
}

action2() {
    print_info "Performing action2..."
    
    # Add your implementation here
    # Your implementation here
    
    print_success "Action2 completed successfully"
}

action3() {
    print_info "Performing action3..."
    
    # Add your implementation here
    # Your implementation here
    
    print_success "Action3 completed successfully"
}

# Main execution
main() {
    # Validate prerequisites (except for help)
    if [ "$ACTION" != "help" ]; then
        check_prerequisites
    fi
    
    # Execute the requested action
    case "$ACTION" in
        "action1")
            action1 "$PARAMETER"
            ;;
        "action2")
            action2
            ;;
        "action3")
            action3
            ;;
        "help"|"")
            show_help
            ;;
        *)
            print_error "Unknown action: $ACTION"
            echo
            show_help
            exit 1
            ;;
    esac
}

# Error handling
trap 'print_error "Script interrupted"; exit 1' INT TERM

# Run main function
main