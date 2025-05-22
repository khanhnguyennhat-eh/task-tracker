# Task Tracker Automation Script
# Description: Implements automation rules for Task Tracker development

param (
    [Parameter(Mandatory = $false)]
    [string]$Action = "help",

    [Parameter(Mandatory = $false)]
    [string]$FeatureName = "",

    [Parameter(Mandatory = $false)]
    [string]$PackageName = ""
)

$ConfigFile = "automation-config.json"
$RootDir = $PSScriptRoot

function Read-ConfigFile {
    if (Test-Path "$RootDir\$ConfigFile") {
        $configContent = Get-Content -Path "$RootDir\$ConfigFile" -Raw
        return ConvertFrom-Json $configContent
    }
    else {
        Write-Error "Configuration file not found: $ConfigFile"
        exit 1
    }
}

function Start-Feature {
    param([string]$FeatureName)

    if ([string]::IsNullOrEmpty($FeatureName)) {
        $FeatureName = Read-Host -Prompt "Enter the name of the feature you're starting"
    }

    # Normalize feature name for file naming
    $NormalizedFeatureName = $FeatureName.ToLower().Replace(" ", "-")

    # Create checklist directory if it doesn't exist
    $ChecklistDir = "$RootDir\docs\checklists"
    if (-not (Test-Path $ChecklistDir)) {
        New-Item -Path $ChecklistDir -ItemType Directory -Force | Out-Null
        Write-Host "Created checklist directory: $ChecklistDir"
    }

    # Create feature-specific checklist
    $ChecklistTemplate = "$RootDir\docs\task-completion-checklist.md"
    $FeatureChecklist = "$ChecklistDir\$NormalizedFeatureName-checklist.md"

    if (Test-Path $ChecklistTemplate) {
        $Template = Get-Content -Path $ChecklistTemplate -Raw
        $FeatureContent = $Template -replace "\[Feature Name\]", $FeatureName
        $FeatureContent = $FeatureContent -replace "\[Brief description of the task\]", "Implementation of $FeatureName feature"
        $FeatureContent = $FeatureContent -replace "\[Link to planning item in docs/next-planning.md\]", "See docs/next-planning.md"
        
        Set-Content -Path $FeatureChecklist -Value $FeatureContent
        Write-Host "Created feature checklist: $FeatureChecklist"
    }
    else {
        Write-Error "Checklist template not found: $ChecklistTemplate"
    }

    # Open planning document for reference
    $PlanningDoc = "$RootDir\docs\next-planning.md"
    if (Test-Path $PlanningDoc) {
        Write-Host "Opening planning document for reference..."
        Start-Process "code" -ArgumentList $PlanningDoc
    }

    Write-Host "Feature implementation started: $FeatureName" -ForegroundColor Green
    Write-Host "Checklist created at: $FeatureChecklist" -ForegroundColor Green
}

function Complete-Feature {
    param([string]$FeatureName)

    if ([string]::IsNullOrEmpty($FeatureName)) {
        $FeatureName = Read-Host -Prompt "Enter the name of the feature you've completed"
    }

    $NormalizedFeatureName = $FeatureName.ToLower().Replace(" ", "-")
    $FeatureChecklist = "$RootDir\docs\checklists\$NormalizedFeatureName-checklist.md"
    
    # Update checklist if it exists
    if (Test-Path $FeatureChecklist) {
        $ChecklistContent = Get-Content -Path $FeatureChecklist -Raw
        $CurrentDate = Get-Date -Format "MMMM d, yyyy"
        $UpdatedContent = $ChecklistContent -replace "_Date Completed: \[Date\]_", "_Date Completed: $CurrentDate_"
        
        # Mark all checkboxes as completed
        $UpdatedContent = $UpdatedContent -replace "- \[ \]", "- [x]"
        
        Set-Content -Path $FeatureChecklist -Value $UpdatedContent
        Write-Host "Updated feature checklist: $FeatureChecklist"
    }
    
    # Update planning document
    $PlanningDoc = "$RootDir\docs\next-planning.md"
    if (Test-Path $PlanningDoc) {
        $PlanningContent = Get-Content -Path $PlanningDoc -Raw
        
        # This is a simple text replacement and might need adjustments
        # for more complex planning document structures
        $UpdatedPlanning = $PlanningContent -replace "- \[ \] $FeatureName", "- [x] $FeatureName"
        $UpdatedPlanning = $UpdatedPlanning -replace "- \[ \] Implement $FeatureName", "- [x] Implement $FeatureName"
        
        Set-Content -Path $PlanningDoc -Value $UpdatedPlanning
        Write-Host "Updated planning document: $PlanningDoc"
    }
    
    Write-Host "Feature implementation completed: $FeatureName" -ForegroundColor Green
}

function Test-Implementation {
    # Start development server
    Write-Host "Starting development server..." -ForegroundColor Yellow
    Start-Process "npm" -ArgumentList "run", "dev" -NoNewWindow
    
    # Wait a moment for server to start
    Start-Sleep -Seconds 5
    
    # Run linting
    Write-Host "Running linter..." -ForegroundColor Yellow
    npm run lint
    
    Write-Host "Implementation testing complete" -ForegroundColor Green
}

function Install-Dependency {
    param([string]$PackageName)
    
    if ([string]::IsNullOrEmpty($PackageName)) {
        $PackageName = Read-Host -Prompt "Enter the name of the package to install"
    }
    
    Write-Host "Installing package: $PackageName" -ForegroundColor Yellow
    npm install $PackageName
    
    Write-Host "Package installed: $PackageName" -ForegroundColor Green
}

function Show-Help {
    Write-Host "Task Tracker Automation Script" -ForegroundColor Cyan
    Write-Host "==============================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor White
    Write-Host "  .\automation.ps1 -Action <action> [-FeatureName <name>] [-PackageName <name>]" -ForegroundColor White
    Write-Host ""
    Write-Host "Actions:" -ForegroundColor White
    Write-Host "  start-feature     Start implementation of a new feature" -ForegroundColor White
    Write-Host "  complete-feature  Mark a feature as completed" -ForegroundColor White
    Write-Host "  test              Test the current implementation" -ForegroundColor White
    Write-Host "  install           Install a dependency" -ForegroundColor White
    Write-Host "  help              Show this help message" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor White
    Write-Host "  .\automation.ps1 -Action start-feature -FeatureName 'Dark Mode Toggle'" -ForegroundColor White
    Write-Host "  .\automation.ps1 -Action complete-feature -FeatureName 'Dark Mode Toggle'" -ForegroundColor White
    Write-Host "  .\automation.ps1 -Action test" -ForegroundColor White
    Write-Host "  .\automation.ps1 -Action install -PackageName 'react-toastify'" -ForegroundColor White
}

# Main execution
try {
    $Config = Read-ConfigFile
    
    switch ($Action.ToLower()) {
        "start-feature" {
            Start-Feature -FeatureName $FeatureName
        }
        "complete-feature" {
            Complete-Feature -FeatureName $FeatureName
        }
        "test" {
            Test-Implementation
        }
        "install" {
            Install-Dependency -PackageName $PackageName
        }
        default {
            Show-Help
        }
    }
}
catch {
    Write-Host "Error executing automation script: $_" -ForegroundColor Red
    Write-Host "Script path: $PSScriptRoot" -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Red
}
