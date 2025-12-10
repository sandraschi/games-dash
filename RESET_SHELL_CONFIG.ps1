# Reset Shell Configuration to Defaults
# **Timestamp**: 2025-12-02
# Resets PowerShell profile and Cursor shell settings to defaults

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  RESET SHELL CONFIGURATION TO DEFAULTS" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

# Check current PowerShell profile
Write-Host "Checking PowerShell profile..." -ForegroundColor Cyan
$profilePath = $PROFILE
Write-Host "  Profile path: $profilePath" -ForegroundColor Gray

if (Test-Path $profilePath) {
    Write-Host "  ⚠️  Profile EXISTS - backing up before reset" -ForegroundColor Yellow
    
    # Backup existing profile
    $backupPath = "$profilePath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $profilePath $backupPath -Force
    Write-Host "  ✅ Backed up to: $backupPath" -ForegroundColor Green
    
    # Show what's in the profile
    Write-Host ""
    Write-Host "Current profile contents:" -ForegroundColor Cyan
    Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray
    Get-Content $profilePath | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray
    Write-Host ""
    
    # Ask for confirmation
    $response = Read-Host "Delete profile and reset to default? (yes/no)"
    if ($response -eq "yes") {
        Remove-Item $profilePath -Force
        Write-Host "  ✅ Profile deleted" -ForegroundColor Green
    } else {
        Write-Host "  ⏭️  Skipped - profile kept" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✅ No profile found - already at default" -ForegroundColor Green
}

Write-Host ""

# Check for Cursor-specific environment variables
Write-Host "Checking Cursor environment variables..." -ForegroundColor Cyan
$cursorVars = @(
    "CURSOR_AGENT",
    "CURSOR_TERMINAL",
    "CURSOR_SHELL"
)

$foundVars = @()
foreach ($var in $cursorVars) {
    $value = [Environment]::GetEnvironmentVariable($var, "User")
    if ($value) {
        Write-Host "  ⚠️  Found: $var = $value" -ForegroundColor Yellow
        $foundVars += $var
    }
}

if ($foundVars.Count -eq 0) {
    Write-Host "  ✅ No Cursor-specific environment variables found" -ForegroundColor Green
} else {
    Write-Host ""
    $response = Read-Host "Remove Cursor environment variables? (yes/no)"
    if ($response -eq "yes") {
        foreach ($var in $foundVars) {
            [Environment]::SetEnvironmentVariable($var, $null, "User")
            Write-Host "  ✅ Removed: $var" -ForegroundColor Green
        }
        Write-Host "  ⚠️  Restart Cursor for changes to take effect" -ForegroundColor Yellow
    }
}

Write-Host ""

# Check Cursor settings directory
Write-Host "Checking Cursor settings..." -ForegroundColor Cyan
$cursorSettingsPath = "$env:APPDATA\Cursor\User\settings.json"
if (Test-Path $cursorSettingsPath) {
    Write-Host "  Found: $cursorSettingsPath" -ForegroundColor Gray
    
    # Check for terminal-related settings
    $settings = Get-Content $cursorSettingsPath -Raw | ConvertFrom-Json
    $terminalSettings = @()
    
    if ($settings.'terminal.integrated.shell.windows') {
        $terminalSettings += "terminal.integrated.shell.windows"
    }
    if ($settings.'terminal.integrated.shellArgs.windows') {
        $terminalSettings += "terminal.integrated.shellArgs.windows"
    }
    if ($settings.'terminal.integrated.profiles.windows') {
        $terminalSettings += "terminal.integrated.profiles.windows"
    }
    
    if ($terminalSettings.Count -gt 0) {
        Write-Host "  ⚠️  Found custom terminal settings:" -ForegroundColor Yellow
        foreach ($setting in $terminalSettings) {
            Write-Host "    - $setting" -ForegroundColor Gray
        }
        Write-Host ""
        Write-Host "  To reset Cursor terminal settings:" -ForegroundColor Yellow
        Write-Host "  1. Open Cursor Settings (Ctrl+Shift+J)" -ForegroundColor White
        Write-Host "  2. Search for 'terminal'" -ForegroundColor White
        Write-Host "  3. Reset to defaults or delete custom settings" -ForegroundColor White
    } else {
        Write-Host "  ✅ No custom terminal settings found" -ForegroundColor Green
    }
} else {
    Write-Host "  ✅ No Cursor settings file found" -ForegroundColor Green
}

Write-Host ""

# Check for workspaceStorage (known to cause issues)
Write-Host "Checking Cursor workspace storage..." -ForegroundColor Cyan
$workspaceStoragePath = "$env:APPDATA\Cursor\User\workspaceStorage"
if (Test-Path $workspaceStoragePath) {
    Write-Host "  ⚠️  Found workspaceStorage directory" -ForegroundColor Yellow
    Write-Host "  Location: $workspaceStoragePath" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  This directory can cause terminal issues." -ForegroundColor Yellow
    Write-Host "  Deleting it will reset workspace settings but may fix terminal." -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Delete workspaceStorage? (yes/no)"
    if ($response -eq "yes") {
        Remove-Item $workspaceStoragePath -Recurse -Force
        Write-Host "  ✅ Deleted workspaceStorage" -ForegroundColor Green
        Write-Host "  ⚠️  Restart Cursor for changes to take effect" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✅ No workspaceStorage directory found" -ForegroundColor Green
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  RESET COMPLETE" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Close Cursor IDE completely" -ForegroundColor White
Write-Host "2. Open a NEW PowerShell window (to reload profile)" -ForegroundColor White
Write-Host "3. Restart Cursor IDE" -ForegroundColor White
Write-Host "4. Test terminal: Write-Host 'Test'; Get-Date" -ForegroundColor White
Write-Host ""

Write-Host "If terminal still doesn't work:" -ForegroundColor Yellow
Write-Host "- Enable Legacy Terminal Tool in Cursor settings" -ForegroundColor White
Write-Host "- Use external terminals until Cursor fixes the bug" -ForegroundColor White
Write-Host ""
