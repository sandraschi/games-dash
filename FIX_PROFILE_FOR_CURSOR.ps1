# Fix PowerShell Profile for Cursor Compatibility
# Modifies Windsurf workaround to be Cursor-aware

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  FIX PROFILE FOR CURSOR COMPATIBILITY" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

$profilePath = $PROFILE

if (-not (Test-Path $profilePath)) {
    Write-Host "❌ Profile not found at: $profilePath" -ForegroundColor Red
    Write-Host "   Nothing to fix!" -ForegroundColor Yellow
    exit
}

# Backup first
$backupPath = "$profilePath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item $profilePath $backupPath -Force
Write-Host "✅ Backed up profile to: $backupPath" -ForegroundColor Green
Write-Host ""

# Read current profile
$content = Get-Content $profilePath -Raw

# Check if it's a Windsurf workaround
if ($content -notmatch "Windsurf|windsurf") {
    Write-Host "⚠️  Profile doesn't mention Windsurf" -ForegroundColor Yellow
    Write-Host "   It might still have && workarounds though" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "Current profile will be modified to:" -ForegroundColor Cyan
Write-Host "  1. Keep Windsurf workaround (for Windsurf IDE)" -ForegroundColor White
Write-Host "  2. Skip workaround when CURSOR_AGENT is set (for Cursor IDE)" -ForegroundColor White
Write-Host "  3. Add comment explaining the fix" -ForegroundColor White
Write-Host ""

$response = Read-Host "Proceed with modification? (yes/no)"
if ($response -ne "yes") {
    Write-Host "⏭️  Cancelled" -ForegroundColor Yellow
    exit
}

# Create modified profile
$newContent = @"
# PowerShell Profile
# Modified: $(Get-Date -Format 'yyyy-MM-dd')
# 
# This profile includes workarounds for Windsurf IDE's Linux syntax issues (especially &&).
# The workarounds are DISABLED when running in Cursor IDE to avoid interfering with Cursor's terminal.
#
# Detection:
# - Windsurf: Uses WINDSURF_AGENT environment variable
# - Cursor: Uses CURSOR_AGENT environment variable
#
# If you're using Cursor IDE and terminal is broken, the workarounds below might be interfering.
# They are automatically disabled when CURSOR_AGENT is set.

# Skip Windsurf workarounds when running in Cursor IDE
if (`$env:CURSOR_AGENT -eq "1") {
    # Cursor IDE detected - skip Windsurf workarounds
    # Cursor handles terminal differently and workarounds can interfere
    return
}

# Original Windsurf workaround code below
# (Only active when NOT in Cursor IDE)

"@

# Add original content (but wrap it to skip if Cursor)
$originalLines = Get-Content $profilePath
$inWindsurfBlock = $false
$windsurfCode = @()

foreach ($line in $originalLines) {
    # Skip comments about Windsurf at top
    if ($line -match "^\s*#.*Windsurf|^\s*#.*windsurf|^\s*#.*profile loaded") {
        continue
    }
    
    # Keep everything else
    $windsurfCode += $line
}

# Add the original code
if ($windsurfCode.Count -gt 0) {
    $newContent += ($windsurfCode -join "`n")
}

# Write new profile
$newContent | Out-File -FilePath $profilePath -Encoding UTF8 -NoNewline

Write-Host ""
Write-Host "✅ Profile modified!" -ForegroundColor Green
Write-Host ""
Write-Host "Changes made:" -ForegroundColor Cyan
Write-Host "  - Added CURSOR_AGENT check at top" -ForegroundColor White
Write-Host "  - Profile now skips Windsurf workarounds when in Cursor" -ForegroundColor White
Write-Host "  - Original code preserved (still works for Windsurf)" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Close Cursor IDE completely" -ForegroundColor White
Write-Host "  2. Open a NEW PowerShell window (to reload profile)" -ForegroundColor White
Write-Host "  3. Restart Cursor IDE" -ForegroundColor White
Write-Host "  4. Test terminal: Write-Host 'Test'; Get-Date" -ForegroundColor White
Write-Host ""
Write-Host "If terminal still doesn't work:" -ForegroundColor Yellow
Write-Host "  - It's the Cursor bug, not your profile" -ForegroundColor Gray
Write-Host "  - Use external terminals or batch files" -ForegroundColor Gray
Write-Host ""
