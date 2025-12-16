#!/bin/bash
# Git Worktree Management Script for Compound Engineering
#
# This script provides utilities for managing git worktrees in the Compound Engineering workflow.
# It supports creating, listing, and cleaning up worktrees with proper branch management.
#
# Based on the Compound Engineering Plugin by EveryInc:
# https://github.com/EveryInc/compound-engineering-plugin
#
# Usage:
#   ./git-worktree.sh create <branch-name> [base-branch] [worktree-path]
#   ./git-worktree.sh list
#   ./git-worktree.sh remove <branch-name>
#   ./git-worktree.sh cleanup
#   ./git-worktree.sh status
#
# Examples:
#   ./git-worktree.sh create feature/user-auth
#   ./git-worktree.sh create feature/user-auth main
#   ./git-worktree.sh list
#   ./git-worktree.sh remove feature/user-auth
#   ./git-worktree.sh cleanup

set -e

# Color output functions
print_success() { echo -e "\033[32m✓ $1\033[0m"; }
print_error() { echo -e "\033[31m✗ $1\033[0m"; }
print_info() { echo -e "\033[36mℹ $1\033[0m"; }
print_warning() { echo -e "\033[33m⚠ $1\033[0m"; }

# Validate git repository
check_git_repo() {
    if [ ! -d ".git" ]; then
        print_error "Not in a git repository. Please run this script from the root of your git repository."
        exit 1
    fi
}

# Get the repository root directory
get_repo_root() {
    git rev-parse --show-toplevel 2>/dev/null
}

# Create a new worktree
create_worktree() {
    local branch_name="$1"
    local base_branch="${2:-main}"
    local worktree_path="$3"
    
    if [ -z "$branch_name" ]; then
        print_error "Branch name is required for create action"
        echo "Usage: $0 create <branch-name> [base-branch] [worktree-path]"
        exit 1
    fi
    
    # Validate branch name format
    if [[ ! "$branch_name" =~ ^[a-zA-Z0-9/_-]+$ ]]; then
        print_error "Invalid branch name. Use only letters, numbers, hyphens, underscores, and forward slashes."
        exit 1
    fi
    
    # Set default worktree path if not provided
    if [ -z "$worktree_path" ]; then
        local repo_root
        repo_root=$(get_repo_root)
        local worktrees_dir="$(dirname "$repo_root")/worktrees"
        worktree_path="$worktrees_dir/$branch_name"
    fi
    
    print_info "Creating worktree for branch '$branch_name' based on '$base_branch'"
    print_info "Worktree path: $worktree_path"
    
    # Check if branch already exists
    if git branch --list "$branch_name" | grep -q "$branch_name"; then
        print_warning "Branch '$branch_name' already exists"
        read -p "Do you want to create a worktree for the existing branch? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Operation cancelled"
            exit 0
        fi
        
        # Create worktree for existing branch
        git worktree add "$worktree_path" "$branch_name"
    else
        # Create new branch and worktree
        git worktree add -b "$branch_name" "$worktree_path" "$base_branch"
    fi
    
    print_success "Worktree created successfully"
    print_info "To switch to the worktree: cd '$worktree_path'"
    print_info "To remove the worktree later: $0 remove '$branch_name'"
}

# List all worktrees
list_worktrees() {
    print_info "Current worktrees:"
    
    local worktree_path=""
    local branch=""
    local commit=""
    
    while IFS= read -r line; do
        if [[ $line =~ ^worktree\ (.+)$ ]]; then
            worktree_path="${BASH_REMATCH[1]}"
            echo -e "  \033[33m📁 $worktree_path\033[0m"
        elif [[ $line =~ ^branch\ (.+)$ ]]; then
            branch="${BASH_REMATCH[1]}"
            echo -e "     \033[32m🌿 $branch\033[0m"
        elif [[ $line =~ ^HEAD\ (.+)$ ]]; then
            commit="${BASH_REMATCH[1]:0:8}"
            echo -e "     \033[37m📝 $commit\033[0m"
        elif [[ -z $line ]]; then
            echo
        fi
    done < <(git worktree list --porcelain)
}

# Remove a worktree
remove_worktree() {
    local branch_name="$1"
    
    if [ -z "$branch_name" ]; then
        print_error "Branch name is required for remove action"
        echo "Usage: $0 remove <branch-name>"
        exit 1
    fi
    
    # Find the worktree path for the branch
    local worktree_path=""
    local current_path=""
    local current_branch=""
    
    while IFS= read -r line; do
        if [[ $line =~ ^worktree\ (.+)$ ]]; then
            current_path="${BASH_REMATCH[1]}"
        elif [[ $line =~ ^branch\ (.+)$ ]]; then
            current_branch="${BASH_REMATCH[1]}"
            if [[ "$current_branch" == "refs/heads/$branch_name" ]]; then
                worktree_path="$current_path"
                break
            fi
        fi
    done < <(git worktree list --porcelain)
    
    if [ -z "$worktree_path" ]; then
        print_error "No worktree found for branch '$branch_name'"
        exit 1
    fi
    
    print_info "Removing worktree for branch '$branch_name' at '$worktree_path'"
    
    # Remove the worktree
    git worktree remove "$worktree_path" --force
    
    print_success "Worktree removed successfully"
    
    # Ask if user wants to delete the branch
    read -p "Do you want to delete the branch '$branch_name' as well? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if git branch -D "$branch_name"; then
            print_success "Branch '$branch_name' deleted successfully"
        else
            print_warning "Failed to delete branch '$branch_name'"
        fi
    fi
}

# Cleanup stale worktrees
cleanup_worktrees() {
    print_info "Cleaning up stale worktrees..."
    
    if git worktree prune -v; then
        print_success "Worktree cleanup completed"
    else
        print_warning "Worktree cleanup encountered issues"
    fi
}

# Show worktree status
show_status() {
    print_info "Worktree Status Report"
    echo -e "\033[36m=====================\033[0m"
    
    # Current directory info
    local current_dir
    current_dir=$(pwd)
    
    if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        local current_branch
        current_branch=$(git branch --show-current)
        local repo_root
        repo_root=$(get_repo_root)
        
        echo -e "\033[33mCurrent Location:\033[0m $current_dir"
        echo -e "\033[33mRepository Root:\033[0m  $repo_root"
        echo -e "\033[32mCurrent Branch:\033[0m   $current_branch"
        
        # Check if we're in a worktree
        local in_worktree=false
        local worktree_path=""
        
        while IFS= read -r line; do
            if [[ $line =~ ^worktree\ (.+)$ ]]; then
                worktree_path="${BASH_REMATCH[1]}"
                if [[ "$current_dir" == "$worktree_path"* ]] && [[ "$worktree_path" != "$repo_root" ]]; then
                    in_worktree=true
                    echo -e "\033[36mWorktree:\033[0m         Yes (in $worktree_path)"
                    break
                fi
            fi
        done < <(git worktree list --porcelain)
        
        if [ "$in_worktree" = false ]; then
            echo -e "\033[37mWorktree:\033[0m         No (in main repository)"
        fi
        
        echo
        list_worktrees
    else
        print_error "Not in a git repository"
    fi
}

# Main execution
check_git_repo

case "${1:-}" in
    "create")
        create_worktree "$2" "$3" "$4"
        ;;
    "list")
        list_worktrees
        ;;
    "remove")
        remove_worktree "$2"
        ;;
    "cleanup")
        cleanup_worktrees
        ;;
    "status")
        show_status
        ;;
    *)
        echo "Git Worktree Management Script for Compound Engineering"
        echo
        echo "Usage:"
        echo "  $0 create <branch-name> [base-branch] [worktree-path]"
        echo "  $0 list"
        echo "  $0 remove <branch-name>"
        echo "  $0 cleanup"
        echo "  $0 status"
        echo
        echo "Examples:"
        echo "  $0 create feature/user-auth"
        echo "  $0 create feature/user-auth main"
        echo "  $0 list"
        echo "  $0 remove feature/user-auth"
        echo "  $0 cleanup"
        echo "  $0 status"
        exit 1
        ;;
esac