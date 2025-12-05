# Test Web Server Startup
cd d:\Dev\repos\games-app

Write-Host "Testing Python..." -ForegroundColor Yellow
python --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Python not found!" -ForegroundColor Red
    exit 1
}

Write-Host "`nTesting http.server module..." -ForegroundColor Yellow
python -c "import http.server; print('OK')"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: http.server module not available!" -ForegroundColor Red
    exit 1
}

Write-Host "`nChecking if port 9876 is free..." -ForegroundColor Yellow
$portCheck = netstat -ano | findstr ":9876.*LISTENING"
if ($portCheck) {
    Write-Host "WARNING: Port 9876 is already in use!" -ForegroundColor Yellow
    Write-Host $portCheck
} else {
    Write-Host "Port 9876 is free" -ForegroundColor Green
}

Write-Host "`nStarting web server..." -ForegroundColor Yellow
Write-Host "Server will run in this window. Press Ctrl+C to stop." -ForegroundColor Cyan
Write-Host ""

python -m http.server 9876
