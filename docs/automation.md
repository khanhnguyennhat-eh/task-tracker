# Task Tracker Automation

This directory contains configuration files and scripts for automating routine tasks in the Task Tracker project.

## Overview

The automation system helps streamline the development workflow by automating:

- Feature implementation setup
- Testing
- Documentation updates
- Dependency installation

## Components

1. **automation-config.json** - Configuration file that defines automation rules
2. **automation.ps1** - PowerShell script that implements the automation rules
3. **vscode-automation-extension.json** - Configuration for a VS Code extension (for future use)
4. **.vscode/tasks.json** - VS Code tasks configuration for immediate use

## How to Use

### From the Terminal

Run the PowerShell script with the appropriate action from the project root directory:

```powershell
# Start a new feature implementation
.\automation.ps1 -Action start-feature -FeatureName "Toast Notifications"

# Complete a feature implementation
.\automation.ps1 -Action complete-feature -FeatureName "Toast Notifications"

# Test the current implementation
.\automation.ps1 -Action test

# Install a dependency
.\automation.ps1 -Action install -PackageName "react-toastify"

# Show help
.\automation.ps1 -Action help
```

### From VS Code

1. Open the Command Palette (Ctrl+Shift+P)
2. Type "Tasks: Run Task"
3. Select one of the Task Tracker automation tasks:
   - Start Feature Implementation
   - Complete Feature Implementation
   - Test Implementation
   - Install Dependency

> **Note:** The VS Code tasks have been configured to bypass PowerShell execution policy restrictions and use absolute paths to ensure consistent behavior across different environments.

- Install Dependency

## What It Does

### Start Feature Implementation

- Creates a feature-specific checklist in the docs/checklists directory
- Opens the planning document for reference
- Sets up the necessary environment for feature development

### Complete Feature Implementation

- Updates the feature checklist with the completion date
- Marks all checklist items as completed
- Updates the planning document to mark the feature as completed

### Test Implementation

- Starts the development server
- Runs linting

### Install Dependency

- Installs the specified package via npm

## Customizing Automation

You can modify the automation rules by editing the `automation-config.json` file. The configuration supports:

- Custom commands
- Triggers
- Security restrictions

## Troubleshooting

If you encounter issues with the automation scripts or VS Code tasks, try the following:

1. **PowerShell Execution Policy**: Ensure your PowerShell execution policy allows running scripts.

   ```powershell
   Get-ExecutionPolicy
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **File Paths**: The VS Code tasks are configured to use `${workspaceFolder}` to ensure proper path resolution. If running manually, make sure you're in the correct directory.

3. **Task Failures**: If a VS Code task fails, try running the PowerShell script directly from the terminal to see more detailed error messages.

4. **PowerShell Version**: The automation scripts are designed to work with PowerShell 5.1 and above. Check your version with:
   ```powershell
   $PSVersionTable.PSVersion
   ```

## Future Enhancements

The `vscode-automation-extension.json` file provides a template for creating a full VS Code extension that integrates these automations more deeply into the IDE. This could be developed in the future to provide a more seamless experience.
