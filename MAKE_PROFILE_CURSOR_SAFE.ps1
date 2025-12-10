# Make PowerShell Profile Cursor-Safe
# **Timestamp**: 2025-12-02
# Modifies Windsurf workaround profile to skip when Cursor is detected

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  MAKE PROFILE CURSOR-SAFE" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""
Write-Host "The Legacy Terminal Tool hint says:" -ForegroundColor Cyan
Write-Host "  'use legacy on systems with unsupported shell configurations'" -ForegroundColor Yellow
Write-Host ""
Write-Host "This means your Windsurf workaround profile is likely" -ForegroundColor Yellow
Write-Host "breaking Cursor's new terminal integration!" -ForegroundColor Red
Write-Host ""

$profilePath = $PROFILE

if (-not (Test-Path $profilePath)) {
    Write-Host "❌ Profile not found at: $profilePath" -ForegroundColor Red
    exit
}

# Show current profile
Write-Host "Current profile location: $profilePath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Viewing current profile..." -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray
Get-Content $profilePath | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Backup
$backupPath = "$profilePath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item $profilePath $backupPath -Force
Write-Host "✅ Backed up to: $backupPath" -ForegroundColor Green
Write-Host ""

# Read profile
$originalContent = Get-Content $profilePath -Raw
$originalLines = Get-Content $profilePath

# Check if already has Cursor check
if ($originalContent -match "CURSOR_AGENT|CURSOR_TERMINAL") {
    Write-Host "⚠️  Profile already has Cursor detection" -ForegroundColor Yellow
    Write-Host "   But it might not be working correctly" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Replace with better Cursor detection? (yes/no)"
    if ($response -ne "yes") {
        Write-Host "⏭️  Cancelled" -ForegroundColor Yellow
        exit
    }
}

Write-Host "Creating Cursor-safe version..." -ForegroundColor Cyan
Write-Host ""

# Build new profile with Cursor detection at the top
$newProfile = @"
# PowerShell Profile
# Last Modified: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
#
# IMPORTANT: This profile includes workarounds for Windsurf IDE's Linux syntax issues.
# These workarounds BREAK Cursor IDE's terminal integration!
#
# SOLUTION: Skip all workarounds when running in Cursor IDE.
# Cursor sets CURSOR_AGENT=1 when using Agent Mode terminal.
#
# If Cursor terminal is broken, this profile is likely the cause.
# The workarounds below intercept/modify commands in ways that break Cursor's
# new terminal integration (which is why Legacy Terminal Tool works - it bypasses this).

# ============================================================================
# CURSOR IDE DETECTION - Skip all workarounds when in Cursor
# ============================================================================
if (`$env:CURSOR_AGENT -eq "1" -or `$env:CURSOR_TERMINAL -eq "1") {
    # Cursor IDE detected - skip ALL workarounds
    # Cursor's terminal integration is incompatible with command interception
    # Return immediately to use default PowerShell behavior
    return
}

# Also check parent process (in case env var isn't set)
try {
    `$parentProcess = (Get-CimInstance Win32_Process -Filter "ProcessId = `$PID").ParentProcessId
    `$parentName = (Get-CimInstance Win32_Process -Filter "ProcessId = `$parentProcess").Name
    if (`$parentName -like "*cursor*" -or `$parentName -like "*Cursor*") {
        # Parent is Cursor - skip workarounds
        return
    }
} catch {
    # Ignore errors in detection
}

# ============================================================================
# WINDSURF IDE WORKAROUNDS (Only active when NOT in Cursor)
# ============================================================================
# Original Windsurf workaround code below
# These fix Windsurf's Linux syntax issues but break Cursor

"@

# Add original content (preserve it for Windsurf)
$skipHeader = $false
foreach ($line in $originalLines) {
    # Skip old header comments about Windsurf
    if ($line -match "^\s*#.*Windsurf|^\s*#.*windsurf|^\s*#.*profile loaded|^\s*#.*workaround") {
        if (-not $skipHeader) {
            $newProfile += "# (Original Windsurf workaround code preserved below)`n"
            $skipHeader = $true
        }
        continue
    }
    
    # Skip any existing Cursor detection (we're replacing it)
    if ($line -match "CURSOR_AGENT|CURSOR_TERMINAL") {
        continue
    }
    
    # Keep everything else
    $newProfile += $line + "`n"
}

# Write new profile
$newProfile | Out-File -FilePath $profilePath -Encoding UTF8 -NoNewline

Write-Host "✅ Profile updated!" -ForegroundColor Green
Write-Host ""
Write-Host "What changed:" -ForegroundColor Cyan
Write-Host "  ✅ Added CURSOR_AGENT detection at top" -ForegroundColor White
Write-Host "  ✅ Added parent process detection (backup check)" -ForegroundColor White
Write-Host "  ✅ Profile now returns immediately when Cursor detected" -ForegroundColor White
Write-Host "  ✅ Windsurf workarounds preserved (still work for Windsurf)" -ForegroundColor White
Write-Host ""
Write-Host "How it works:" -ForegroundColor Cyan
Write-Host "  - When Cursor runs: Profile exits immediately (no workarounds)" -ForegroundColor White
Write-Host "  - When Windsurf runs: Workarounds active (fixes && syntax)" -ForegroundColor White
Write-Host "  - When other terminals: Workarounds active (safe default)" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Close Cursor IDE completely" -ForegroundColor White
Write-Host "  2. Open NEW PowerShell window (reloads profile)" -ForegroundColor White
Write-Host "  3. Restart Cursor IDE" -ForegroundColor White
Write-Host "  4. Test terminal: Write-Host 'Test'; Get-Date" -ForegroundColor White
Write-Host ""
Write-Host "Expected result:" -ForegroundColor Cyan
Write-Host "  ✅ Terminal should work now (profile skipped in Cursor)" -ForegroundColor Green
Write-Host "  ✅ Windsurf still works (workarounds active there)" -ForegroundColor Green
Write-Host ""
Write-Host "If terminal still broken:" -ForegroundColor Yellow
Write-Host "  - Enable Legacy Terminal Tool (bypasses profile entirely)" -ForegroundColor White
Write-Host "  - Or use external terminals" -ForegroundColor White
Write-Host ""
