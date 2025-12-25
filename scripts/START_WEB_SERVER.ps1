# Start Web Server - Standalone Script
# **Timestamp**: 2025-12-05

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🌐 STARTING WEB SERVER" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "Working Directory: $scriptPath" -ForegroundColor Yellow
Write-Host ""

# Check Python
Write-Host "Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  ✅ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Python not found!" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check port
Write-Host ""
Write-Host "Checking port 9876..." -ForegroundColor Yellow
$portCheck = netstat -ano | Select-String ":9876.*LISTENING"
if ($portCheck) {
    Write-Host "  ⚠️  Port 9876 is already in use!" -ForegroundColor Yellow
    Write-Host "  $portCheck" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Killing existing process..." -ForegroundColor Yellow
    $parts = $portCheck.ToString().Split() | Where-Object { $_ -match '^\d+$' }
    if ($parts) {
        $pid = $parts[-1]
        taskkill /F /PID $pid 2>$null
        Start-Sleep -Seconds 2
    }
}

# Start server
Write-Host ""
Write-Host "Starting web server on port 9876..." -ForegroundColor Cyan
Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  Server will run in this window" -ForegroundColor White
Write-Host "  URL: http://localhost:9876" -ForegroundColor White
Write-Host "  Press Ctrl+C to stop" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

try {
    python -m http.server 9876
} catch {
    Write-Host ""
    Write-Host "❌ ERROR: Server failed to start!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}
