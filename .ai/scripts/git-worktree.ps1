#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Git Worktree Management Script for Compound Engineering
    
.DESCRIPTION
    This script provides utilities for managing git worktrees in the Compound Engineering workflow.
    It supports creating, listing, and cleaning up worktrees with proper branch management.
    
    Based on the Compound Engineering Plugin by EveryInc:
    https://github.com/EveryInc/compound-engineering-plugin
    
.PARAMETER Action
    The action to perform: create, list, remove, or cleanup
    
.PARAMETER BranchName
    The name of the branch for the worktree (required for create action)
    
.PARAMETER BaseBranch
    The base branch to create the new branch from (defaults to main)
    
.PARAMETER WorktreePath
    Custom path for the worktree (optional, defaults to ../worktrees/{branch-name})
    
.EXAMPLE
    .\git-worktree.ps1 -Action create -BranchName "feature/user-auth"
    
.EXAMPLE
    .\git-worktree.ps1 -Action list
    
.EXAMPLE
    .\git-worktree.ps1 -Action remove -BranchName "feature/user-auth"
    
.EXAMPLE
    .\git-worktree.ps1 -Action cleanup
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("create", "list", "remove", "cleanup", "status")]
    [string]$Action,
    
    [Parameter(Mandatory=$false)]
    [string]$BranchName,
    
    [Parameter(Mandatory=$false)]
    [string]$BaseBranch = "main",
    
    [Parameter(Mandatory=$false)]
    [string]$WorktreePath
)

# Color output functions
function Write-Success { param($Message) Write-Host "✓ $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "✗ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "⚠ $Message" -ForegroundColor Yellow }

# Validate git repository
function Test-GitRepository {
    if (-not (Test-Path ".git")) {
        Write-Error "Not in a git repository. Please run this script from the root of your git repository."
        exit 1
    }
}

# Get the repository root directory
function Get-RepoRoot {
    return (git rev-parse --show-toplevel 2>$null) -replace '/', '\'
}

# Create a new worktree
function New-Worktree {
    param($BranchName, $BaseBranch, $WorktreePath)
    
    if (-not $BranchName) {
        Write-Error "Branch name is required for create action"
        exit 1
    }
    
    # Validate branch name format
    if ($BranchName -notmatch '^[a-zA-Z0-9/_-]+$') {
        Write-Error "Invalid branch name. Use only letters, numbers, hyphens, underscores, and forward slashes."
        exit 1
    }
    
    # Set default worktree path if not provided
    if (-not $WorktreePath) {
        $repoRoot = Get-RepoRoot
        $worktreesDir = Join-Path (Split-Path $repoRoot -Parent) "worktrees"
        $WorktreePath = Join-Path $worktreesDir $BranchName
    }
    
    Write-Info "Creating worktree for branch '$BranchName' based on '$BaseBranch'"
    Write-Info "Worktree path: $WorktreePath"
    
    # Check if branch already exists
    $branchExists = git branch --list $BranchName 2>$null
    if ($branchExists) {
        Write-Warning "Branch '$BranchName' already exists"
        $response = Read-Host "Do you want to create a worktree for the existing branch? (y/N)"
        if ($response -ne 'y' -and $response -ne 'Y') {
            Write-Info "Operation cancelled"
            exit 0
        }
        
        # Create worktree for existing branch
        git worktree add $WorktreePath $BranchName
    } else {
        # Create new branch and worktree
        git worktree add -b $BranchName $WorktreePath $BaseBranch
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Worktree created successfully"
        Write-Info "To switch to the worktree: cd '$WorktreePath'"
        Write-Info "To remove the worktree later: .\git-worktree.ps1 -Action remove -BranchName '$BranchName'"
    } else {
        Write-Error "Failed to create worktree"
        exit 1
    }
}

# List all worktrees
function Get-Worktrees {
    Write-Info "Current worktrees:"
    git worktree list --porcelain | ForEach-Object {
        if ($_ -match '^worktree (.+)$') {
            $path = $matches[1]
            Write-Host "  📁 $path" -ForegroundColor Yellow
        } elseif ($_ -match '^branch (.+)$') {
            $branch = $matches[1]
            Write-Host "     🌿 $branch" -ForegroundColor Green
        } elseif ($_ -match '^HEAD (.+)$') {
            $commit = $matches[1].Substring(0, 8)
            Write-Host "     📝 $commit" -ForegroundColor Gray
        } elseif ($_ -eq "") {
            Write-Host ""
        }
    }
}

# Remove a worktree
function Remove-Worktree {
    param($BranchName)
    
    if (-not $BranchName) {
        Write-Error "Branch name is required for remove action"
        exit 1
    }
    
    # Find the worktree path for the branch
    $worktreePath = $null
    $currentBranch = $null
    
    git worktree list --porcelain | ForEach-Object {
        if ($_ -match '^worktree (.+)$') {
            $currentPath = $matches[1]
        } elseif ($_ -match '^branch (.+)$') {
            $currentBranch = $matches[1]
            if ($currentBranch -eq "refs/heads/$BranchName") {
                $worktreePath = $currentPath
            }
        }
    }
    
    if (-not $worktreePath) {
        Write-Error "No worktree found for branch '$BranchName'"
        exit 1
    }
    
    Write-Info "Removing worktree for branch '$BranchName' at '$worktreePath'"
    
    # Remove the worktree
    git worktree remove $worktreePath --force
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Worktree removed successfully"
        
        # Ask if user wants to delete the branch
        $response = Read-Host "Do you want to delete the branch '$BranchName' as well? (y/N)"
        if ($response -eq 'y' -or $response -eq 'Y') {
            git branch -D $BranchName
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Branch '$BranchName' deleted successfully"
            } else {
                Write-Warning "Failed to delete branch '$BranchName'"
            }
        }
    } else {
        Write-Error "Failed to remove worktree"
        exit 1
    }
}

# Cleanup stale worktrees
function Invoke-WorktreeCleanup {
    Write-Info "Cleaning up stale worktrees..."
    
    git worktree prune -v
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Worktree cleanup completed"
    } else {
        Write-Warning "Worktree cleanup encountered issues"
    }
}

# Show worktree status
function Get-WorktreeStatus {
    Write-Info "Worktree Status Report"
    Write-Host "=====================" -ForegroundColor Cyan
    
    # Current directory info
    $currentDir = Get-Location
    $isWorktree = git rev-parse --is-inside-work-tree 2>$null
    
    if ($isWorktree) {
        $currentBranch = git branch --show-current
        $repoRoot = Get-RepoRoot
        
        Write-Host "Current Location: $currentDir" -ForegroundColor Yellow
        Write-Host "Repository Root:  $repoRoot" -ForegroundColor Yellow
        Write-Host "Current Branch:   $currentBranch" -ForegroundColor Green
        
        # Check if we're in a worktree
        $worktreeList = git worktree list --porcelain
        $inWorktree = $false
        
        $worktreeList | ForEach-Object {
            if ($_ -match '^worktree (.+)$') {
                $wtPath = $matches[1] -replace '/', '\'
                if ($currentDir.Path.StartsWith($wtPath) -and $wtPath -ne $repoRoot) {
                    $inWorktree = $true
                    Write-Host "Worktree:         Yes (in $wtPath)" -ForegroundColor Cyan
                }
            }
        }
        
        if (-not $inWorktree) {
            Write-Host "Worktree:         No (in main repository)" -ForegroundColor Gray
        }
        
        Write-Host ""
        Get-Worktrees
    } else {
        Write-Error "Not in a git repository"
    }
}

# Main execution
Test-GitRepository

switch ($Action) {
    "create" { New-Worktree -BranchName $BranchName -BaseBranch $BaseBranch -WorktreePath $WorktreePath }
    "list" { Get-Worktrees }
    "remove" { Remove-Worktree -BranchName $BranchName }
    "cleanup" { Invoke-WorktreeCleanup }
    "status" { Get-WorktreeStatus }
}