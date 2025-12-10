# Terminal Test Script
# Run this to verify if Cursor terminal is working

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  TERMINAL FUNCTIONALITY TEST" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "Test 1: Basic output..." -ForegroundColor Yellow
Write-Host "✅ If you see this, basic output works!" -ForegroundColor Green

Write-Host ""
Write-Host "Test 2: Date command..." -ForegroundColor Yellow
Get-Date
Write-Host "✅ If you see date above, Get-Date works!" -ForegroundColor Green

Write-Host ""
Write-Host "Test 3: Python check..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python: $pythonVersion" -ForegroundColor Green
    Write-Host "✅ If you see Python version above, external commands work!" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found or command failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test 4: File system check..." -ForegroundColor Yellow
if (Test-Path ".\stockfish-server.py") {
    Write-Host "✅ File system access works!" -ForegroundColor Green
} else {
    Write-Host "❌ Cannot access files" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test 5: Process start test..." -ForegroundColor Yellow
try {
    $testProcess = Start-Process -FilePath "powershell" -ArgumentList "-Command", "Write-Host 'Process test'; Start-Sleep -Seconds 1" -PassThru -WindowStyle Hidden
    Start-Sleep -Milliseconds 500
    if ($testProcess -and -not $testProcess.HasExited) {
        Write-Host "✅ Process creation works!" -ForegroundColor Green
        $testProcess.Kill()
    } else {
        Write-Host "⚠️  Process may have started but exited immediately" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Process creation failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  TEST COMPLETE" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "If you see ALL tests above with ✅ marks:" -ForegroundColor Green
Write-Host "  → Terminal is WORKING!" -ForegroundColor Green
Write-Host ""
Write-Host "If you see this message but NO tests above:" -ForegroundColor Red
Write-Host "  → Terminal is BROKEN (no output captured)" -ForegroundColor Red
Write-Host "  → Use external PowerShell window instead" -ForegroundColor Yellow
Write-Host ""
