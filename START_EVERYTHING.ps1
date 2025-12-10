# Start Complete Games System with REAL Stockfish
# **Timestamp**: 2025-12-03

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  🏆 STARTING GAMES COLLECTION" -ForegroundColor White
Write-Host "  WITH REAL STOCKFISH ENGINE!" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    $result = netstat -ano | Select-String ":$Port.*LISTENING"
    return $null -ne $result
}

# Function to start server only if not already running
function Start-ServerIfNotRunning {
    param(
        [string]$Name,
        [string]$Command,
        [int]$Port,
        [int]$Delay = 2
    )
    
    if (Test-Port -Port $Port) {
        Write-Host "✅ $Name already running on port $Port" -ForegroundColor Green
        return $false
    } else {
        Write-Host "🔄 Starting $Name (port $Port)..." -ForegroundColor Cyan
        $scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
        Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$scriptPath'; $Command"
        Start-Sleep -Seconds $Delay
        return $true
    }
}

# Start Stockfish backend
Start-ServerIfNotRunning -Name "Stockfish backend" -Command "python stockfish-server.py" -Port 9543

# Start web server
Start-ServerIfNotRunning -Name "Web server" -Command "python -m http.server 9876" -Port 9876

# Start multiplayer server
Start-ServerIfNotRunning -Name "Multiplayer server" -Command "python multiplayer-server.py" -Port 9877

Write-Host ""
Write-Host "✅ ALL SERVERS STARTING!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend (Stockfish): http://localhost:9543/api/status" -ForegroundColor Yellow
Write-Host "Frontend (Games):    http://localhost:9876" -ForegroundColor Yellow
Write-Host "Multiplayer:         ws://localhost:9877" -ForegroundColor Yellow
Write-Host ""
Write-Host "Opening browser..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
Start-Process "http://localhost:9876"

Write-Host ""
Write-Host "🎮 Ready to play!" -ForegroundColor Green
Write-Host ""
Write-Host "To stop: Close all PowerShell windows" -ForegroundColor Gray
Write-Host ""

