# Check Shell Configuration for Cursor Workarounds
# **Timestamp**: 2025-12-02
# Identifies shell configs that might interfere with Cursor terminal

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  CHECKING SHELL CONFIGURATION" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check PowerShell profile
Write-Host "1. PowerShell Profile Check" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray
$profilePath = $PROFILE

if (Test-Path $profilePath) {
    Write-Host "✅ Profile exists: $profilePath" -ForegroundColor Green
    Write-Host ""
    Write-Host "Profile contents:" -ForegroundColor Cyan
    $content = Get-Content $profilePath
    $content | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    
    # Check for CURSOR_AGENT references
    Write-Host ""
    $cursorAgentRefs = $content | Select-String -Pattern "CURSOR_AGENT" -CaseSensitive
    if ($cursorAgentRefs) {
        Write-Host "⚠️  FOUND CURSOR_AGENT references (workaround from summer):" -ForegroundColor Yellow
        $cursorAgentRefs | ForEach-Object { Write-Host "    Line $($_.LineNumber): $($_.Line)" -ForegroundColor Yellow }
        Write-Host ""
        Write-Host "This might be interfering with current Cursor terminal!" -ForegroundColor Red
    } else {
        Write-Host "✅ No CURSOR_AGENT references found" -ForegroundColor Green
    }
    
    # Check for prompt overrides
    $promptRefs = $content | Select-String -Pattern "function Prompt|Prompt\s*=" -CaseSensitive
    if ($promptRefs) {
        Write-Host ""
        Write-Host "⚠️  FOUND custom Prompt function:" -ForegroundColor Yellow
        $promptRefs | ForEach-Object { Write-Host "    Line $($_.LineNumber): $($_.Line)" -ForegroundColor Yellow }
    }
    
} else {
    Write-Host "✅ No PowerShell profile found (using defaults)" -ForegroundColor Green
}

Write-Host ""
Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Check environment variables
Write-Host "2. Environment Variables Check" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray

$envVars = @(
    "CURSOR_AGENT",
    "CURSOR_TERMINAL",
    "CURSOR_SHELL"
)

$found = $false
foreach ($var in $envVars) {
    $value = [Environment]::GetEnvironmentVariable($var, "User")
    if ($value) {
        Write-Host "⚠️  $var = $value" -ForegroundColor Yellow
        $found = $true
    }
}

if (-not $found) {
    Write-Host "✅ No Cursor-specific environment variables set" -ForegroundColor Green
}

Write-Host ""
Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Check Cursor settings
Write-Host "3. Cursor Settings Check" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray

$settingsPath = "$env:APPDATA\Cursor\User\settings.json"
if (Test-Path $settingsPath) {
    Write-Host "✅ Settings file found" -ForegroundColor Green
    try {
        $settings = Get-Content $settingsPath -Raw | ConvertFrom-Json
        
        # Check terminal settings
        $terminalSettings = @()
        $props = $settings.PSObject.Properties.Name | Where-Object { $_ -like "*terminal*" }
        if ($props) {
            Write-Host ""
            Write-Host "⚠️  Found terminal-related settings:" -ForegroundColor Yellow
            foreach ($prop in $props) {
                Write-Host "    - $prop" -ForegroundColor Gray
                $terminalSettings += $prop
            }
        } else {
            Write-Host "✅ No custom terminal settings found" -ForegroundColor Green
        }
        
        # Check for Legacy Terminal Tool setting
        if ($settings.'agent.terminal.legacy') {
            Write-Host ""
            Write-Host "ℹ️  Legacy Terminal Tool: $($settings.'agent.terminal.legacy')" -ForegroundColor Cyan
        }
        
    } catch {
        Write-Host "⚠️  Could not parse settings.json: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ No settings file found (using defaults)" -ForegroundColor Green
}

Write-Host ""
Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Summary
Write-Host "4. Summary & Recommendations" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

$hasIssues = $false

if ((Test-Path $profilePath) -and ($content | Select-String -Pattern "CURSOR_AGENT")) {
    Write-Host "⚠️  ISSUE FOUND: PowerShell profile has CURSOR_AGENT workaround" -ForegroundColor Red
    Write-Host "   This was likely added in summer 2025 to fix previous bugs" -ForegroundColor Yellow
    Write-Host "   It may now be interfering with current Cursor terminal" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   RECOMMENDATION: Reset profile to defaults" -ForegroundColor Cyan
    Write-Host "   Run: .\RESET_SHELL_CONFIG.ps1" -ForegroundColor White
    $hasIssues = $true
}

if (-not $hasIssues) {
    Write-Host "✅ No obvious configuration issues found" -ForegroundColor Green
    Write-Host "   Terminal issues are likely due to Cursor bug, not config" -ForegroundColor Gray
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
