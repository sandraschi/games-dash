# View PowerShell Profile Contents
# Shows what's in your profile that might interfere with Cursor

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  POWERSHELL PROFILE VIEWER" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$profilePath = $PROFILE
Write-Host "Profile Path: $profilePath" -ForegroundColor Yellow
Write-Host ""

if (Test-Path $profilePath) {
    Write-Host "✅ Profile EXISTS" -ForegroundColor Green
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Gray
    Write-Host "PROFILE CONTENTS:" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Gray
    Write-Host ""
    
    $content = Get-Content $profilePath
    $lineNum = 1
    foreach ($line in $content) {
        # Highlight Windsurf/Cursor references
        if ($line -match "Windsurf|windsurf|WINDSURF") {
            Write-Host "$lineNum`: " -NoNewline -ForegroundColor Gray
            Write-Host $line -ForegroundColor Yellow
        } elseif ($line -match "Cursor|CURSOR|cursor") {
            Write-Host "$lineNum`: " -NoNewline -ForegroundColor Gray
            Write-Host $line -ForegroundColor Cyan
        } elseif ($line -match "&&|\`&\`&") {
            Write-Host "$lineNum`: " -NoNewline -ForegroundColor Gray
            Write-Host $line -ForegroundColor Red
        } else {
            Write-Host "$lineNum`: $line" -ForegroundColor White
        }
        $lineNum++
    }
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Gray
    Write-Host ""
    
    # Analyze profile
    Write-Host "ANALYSIS:" -ForegroundColor Cyan
    Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray
    
    $windsurfRefs = $content | Select-String -Pattern "Windsurf|windsurf" -CaseSensitive
    $cursorRefs = $content | Select-String -Pattern "Cursor|CURSOR" -CaseSensitive
    $andAndRefs = $content | Select-String -Pattern "&&|\`&\`&" -CaseSensitive
    
    if ($windsurfRefs) {
        Write-Host "⚠️  Found Windsurf references:" -ForegroundColor Yellow
        $windsurfRefs | ForEach-Object { Write-Host "    Line $($_.LineNumber): $($_.Line.Trim())" -ForegroundColor Yellow }
        Write-Host ""
    }
    
    if ($cursorRefs) {
        Write-Host "ℹ️  Found Cursor references:" -ForegroundColor Cyan
        $cursorRefs | ForEach-Object { Write-Host "    Line $($_.LineNumber): $($_.Line.Trim())" -ForegroundColor Cyan }
        Write-Host ""
    }
    
    if ($andAndRefs) {
        Write-Host "⚠️  Found && syntax handling:" -ForegroundColor Red
        $andAndRefs | ForEach-Object { Write-Host "    Line $($_.LineNumber): $($_.Line.Trim())" -ForegroundColor Red }
        Write-Host ""
    }
    
    Write-Host "─────────────────────────────────────────────" -ForegroundColor Gray
    
} else {
    Write-Host "❌ Profile does NOT exist" -ForegroundColor Red
    Write-Host ""
    Write-Host "Profile would be at: $profilePath" -ForegroundColor Gray
}

Write-Host ""
