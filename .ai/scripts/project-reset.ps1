#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Reset project to clean state using template files

.DESCRIPTION
    This script implements Option 2 (Template-Based Reset) from the project reset strategy.
    It resets memory files to template versions and clears project-specific documentation
    while preserving generic engineering wisdom and reusable tooling.

.PARAMETER Level
    Reset level: Light, Medium, Full, or Custom
    - Light: Clear docs only, keep all memory
    - Medium: Reset memory to templates, clear project docs
    - Full: Reset everything to templates, clear all docs
    - Custom: Interactive mode to choose what to reset

.PARAMETER Confirm
    Skip confirmation prompts (use with caution)

.EXAMPLE
    .\.ai\scripts\project-reset.ps1 -Level Medium
    
.EXAMPLE
    .\.ai\scripts\project-reset.ps1 -Level Custom
    
.EXAMPLE
    .\.ai\scripts\project-reset.ps1 -Level Full -Confirm
#>

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("Light", "Medium", "Full", "Custom")]
    [string]$Level,
    
    [switch]$Confirm
)

# Color functions for better UX
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }

# Validation
if (-not (Test-Path ".ai")) {
    Write-Error "This script must be run from the repository root (where .ai directory exists)"
    exit 1
}

if (-not (Test-Path ".ai/templates/lessons.template.md") -or -not (Test-Path ".ai/templates/decisions.template.md")) {
    Write-Error "Template files not found. Please ensure .ai/templates/*.template.md files exist"
    exit 1
}

Write-Info "Project Reset Tool - Level: $Level"
Write-Info "This will reset your project to a clean state for new development"

# Define what each level does
$resetActions = @{
    "Light" = @{
        "Memory" = $false
        "Docs" = $true
        "Description" = "Clear project docs only, keep all memory files"
    }
    "Medium" = @{
        "Memory" = $true
        "Docs" = $true
        "Description" = "Reset memory to templates, clear project-specific docs"
    }
    "Full" = @{
        "Memory" = $true
        "Docs" = $true
        "Description" = "Reset everything to templates, clear all documentation"
    }
    "Custom" = @{
        "Memory" = $null
        "Docs" = $null
        "Description" = "Interactive mode - choose what to reset"
    }
}

$action = $resetActions[$Level]
Write-Warning $action.Description

# Custom level - ask user what to reset
if ($Level -eq "Custom") {
    Write-Info "Custom Reset - Choose what to reset:"
    
    $resetMemory = $null
    while ($resetMemory -eq $null) {
        $response = Read-Host "Reset memory files to templates? (y/n)"
        if ($response -match "^[yY]") { $resetMemory = $true }
        elseif ($response -match "^[nN]") { $resetMemory = $false }
        else { Write-Warning "Please enter 'y' or 'n'" }
    }
    
    $resetDocs = $null
    while ($resetDocs -eq $null) {
        $response = Read-Host "Clear project documentation? (y/n)"
        if ($response -match "^[yY]") { $resetDocs = $true }
        elseif ($response -match "^[nN]") { $resetDocs = $false }
        else { Write-Warning "Please enter 'y' or 'n'" }
    }
    
    $action.Memory = $resetMemory
    $action.Docs = $resetDocs
}

# Show what will be reset
Write-Info "The following actions will be performed:"
if ($action.Memory) {
    Write-Warning "  • Reset .ai/memory/lessons.md from template"
    Write-Warning "  • Reset .ai/memory/decisions.md from template"
}
if ($action.Docs) {
    Write-Warning "  • Clear .ai/docs/plans/ (except README.md)"
    Write-Warning "  • Clear .ai/docs/tasks/ (except README.md)"
    Write-Warning "  • Clear .ai/docs/reviews/ (except README.md)"
    Write-Warning "  • Clear .ai/docs/requirements/ (except README.md and templates)"
    Write-Warning "  • Clear .ai/docs/design/ (except README.md)"
}

Write-Info "The following will be PRESERVED:"
Write-Success "  • .ai/protocols/ (generic engineering protocols)"
Write-Success "  • .ai/workflows/ (generic workflows)"
Write-Success "  • .ai/roles/ (generic role definitions)"
Write-Success "  • .ai/scripts/ (reusable automation tools)"
Write-Success "  • All README.md files (templates and documentation)"
Write-Success "  • Template files (*.template.md)"

# Confirmation
if (-not $Confirm) {
    Write-Warning "This action cannot be undone!"
    $confirmation = Read-Host "Are you sure you want to proceed? (type 'RESET' to confirm)"
    if ($confirmation -ne "RESET") {
        Write-Info "Reset cancelled"
        exit 0
    }
}

Write-Info "Starting reset process..."

# Reset memory files
if ($action.Memory) {
    Write-Info "Resetting memory files to templates..."
    
    try {
        # Get current date for template placeholders
        $currentDate = Get-Date -Format "yyyy-MM-dd"
        
        # Reset lessons.md
        $lessonsTemplate = Get-Content ".ai/templates/lessons.template.md" -Raw
        $lessonsContent = $lessonsTemplate -replace '\[DATE\]', $currentDate
        Set-Content ".ai/memory/lessons.md" -Value $lessonsContent -NoNewline
        Write-Success "Reset .ai/memory/lessons.md"
        
        # Reset decisions.md  
        $decisionsTemplate = Get-Content ".ai/templates/decisions.template.md" -Raw
        $decisionsContent = $decisionsTemplate -replace '\[DATE\]', $currentDate
        Set-Content ".ai/memory/decisions.md" -Value $decisionsContent -NoNewline
        Write-Success "Reset .ai/memory/decisions.md"
        
    } catch {
        Write-Error "Failed to reset memory files: $($_.Exception.Message)"
        exit 1
    }
}

# Clear documentation
if ($action.Docs) {
    Write-Info "Clearing project documentation..."
    
    $docDirs = @(
        ".ai/docs/plans",
        ".ai/docs/tasks", 
        ".ai/docs/reviews",
        ".ai/docs/requirements",
        ".ai/docs/design"
    )
    
    foreach ($dir in $docDirs) {
        if (Test-Path $dir) {
            try {
                # Get all files except README.md and *.template.md
                $filesToRemove = Get-ChildItem $dir -File | Where-Object { 
                    $_.Name -ne "README.md" -and $_.Name -notlike "*.template.md" 
                }
                
                foreach ($file in $filesToRemove) {
                    Remove-Item $file.FullName -Force
                    Write-Success "Removed $($file.FullName)"
                }
                
                # Also clear subdirectories (like user-stories)
                $subDirs = Get-ChildItem $dir -Directory
                foreach ($subDir in $subDirs) {
                    $subFiles = Get-ChildItem $subDir.FullName -File | Where-Object { 
                        $_.Name -ne "README.md" -and $_.Name -notlike "*.template.md" 
                    }
                    foreach ($file in $subFiles) {
                        Remove-Item $file.FullName -Force
                        Write-Success "Removed $($file.FullName)"
                    }
                }
                
            } catch {
                Write-Error "Failed to clear $dir: $($_.Exception.Message)"
            }
        }
    }
}

Write-Success "Project reset completed successfully!"
Write-Info "Your project is now ready for fresh development while preserving all generic engineering wisdom."

# Show next steps
Write-Info "Next steps:"
Write-Success "  1. Review .ai/memory/lessons.md and .ai/memory/decisions.md"
Write-Success "  2. Start your new project development"
Write-Success "  3. Document new patterns and lessons as you build"
Write-Success "  4. Use .ai/workflows/planning.md to plan your first feature"