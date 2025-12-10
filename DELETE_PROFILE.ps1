# Delete PowerShell Profile
# **Timestamp**: 2025-12-02
# Safely removes PowerShell profile (with backup)

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Red
Write-Host "  DELETE POWERSHELL PROFILE" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Red
Write-Host ""

$profilePath = $PROFILE

Write-Host "Profile Location: $profilePath" -ForegroundColor Yellow
Write-Host ""

if (-not (Test-Path $profilePath)) {
    Write-Host "✅ Profile does NOT exist - nothing to delete!" -ForegroundColor Green
    Write-Host ""
    exit
}

Write-Host "⚠️  Profile EXISTS" -ForegroundColor Yellow
Write-Host ""
Write-Host "Current profile contents:" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray
Get-Content $profilePath | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Backup first
$backupPath = "$profilePath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Write-Host "Creating backup..." -ForegroundColor Cyan
Copy-Item $profilePath $backupPath -Force
Write-Host "✅ Backed up to: $backupPath" -ForegroundColor Green
Write-Host ""

Write-Host "⚠️  WARNING: This will delete your PowerShell profile!" -ForegroundColor Red
Write-Host ""
Write-Host "After deletion:" -ForegroundColor Yellow
Write-Host "  - PowerShell will use default settings" -ForegroundColor White
Write-Host "  - Windsurf workarounds will be removed" -ForegroundColor White
Write-Host "  - Cursor terminal should work (if profile was the issue)" -ForegroundColor White
Write-Host "  - You can restore from backup if needed" -ForegroundColor White
Write-Host ""

$response = Read-Host "Type 'DELETE' to confirm deletion (or anything else to cancel)"
if ($response -ne "DELETE") {
    Write-Host ""
    Write-Host "⏭️  Cancelled - profile NOT deleted" -ForegroundColor Yellow
    Write-Host "   Backup still created at: $backupPath" -ForegroundColor Gray
    exit
}

# Delete profile
Write-Host ""
Write-Host "Deleting profile..." -ForegroundColor Cyan
Remove-Item $profilePath -Force
Write-Host "✅ Profile deleted!" -ForegroundColor Green
Write-Host ""

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  PROFILE DELETED SUCCESSFULLY" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Close Cursor IDE completely" -ForegroundColor White
Write-Host "  2. Open a NEW PowerShell window (to reload defaults)" -ForegroundColor White
Write-Host "  3. Restart Cursor IDE" -ForegroundColor White
Write-Host "  4. Test terminal: Write-Host 'Test'; Get-Date" -ForegroundColor White
Write-Host ""
Write-Host "Expected result:" -ForegroundColor Cyan
Write-Host "  ✅ Terminal should work now (no profile interference)" -ForegroundColor Green
Write-Host "  ✅ Clean PowerShell defaults" -ForegroundColor Green
Write-Host ""
Write-Host "If you need to restore:" -ForegroundColor Yellow
Write-Host "  Copy-Item '$backupPath' '$profilePath'" -ForegroundColor Gray
Write-Host ""
Write-Host "Backup location: $backupPath" -ForegroundColor Gray
Write-Host ""
