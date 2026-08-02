# Start Games Collection - Consolidated Script
# Handles the reorganized directory structure (backend/)

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "   Starting AI Games Collection Stack (2025-12-31)" -ForegroundColor White
Write-Host "===============================================" -ForegroundColor Cyan

# Function to kill process on specific port
function Stop-ProcessOnPort {
    param([int]$Port)
    $process = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1
    if ($process) {
        Write-Host "⚠️ Killing process on port $Port (PID: $process)..." -ForegroundColor Yellow
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
    }
}

# Cleanup old sessions
Write-Host "🧹 Cleaning up old sessions..." -ForegroundColor Cyan
@(9543, 9544, 9545, 9877, 5003, 5001, 9878, 9879, 10726) | ForEach-Object { Stop-ProcessOnPort $_ }

$ROOT = Get-Location
$BACKEND = Join-Path $ROOT "backend"

function Start-GameServer {
    param(
        [string]$Name,
        [string]$File,
        [int]$Port,
        [string]$WorkingDir = $BACKEND
    )

    Write-Host "🔄 Starting $Name on port $Port..." -ForegroundColor Yellow
    # Run in a new window so the user can see logs if needed
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$WorkingDir'; python '$File' $Port"
    Start-Sleep -Seconds 1
}

# 1. AI Engines
Start-GameServer -Name "Stockfish AI" -File "stockfish-server.py" -Port 9543
Start-GameServer -Name "Shogi AI" -File "shogi-server.py" -Port 9544
Start-GameServer -Name "Go AI" -File "go-server.py" -Port 9545

# 2. Communication & Logic
Start-GameServer -Name "Multiplayer" -File "multiplayer-server.py" -Port 9877
Start-GameServer -Name "Kanji API" -File "kanji-api.py" -Port 5003
Start-GameServer -Name "JLPT API" -File "jlpt-api.py" -Port 5001

# 3. Audio & Services
Start-GameServer -Name "Sound Service" -File "sound-service.py" -Port 9879

# 4. Web Server (MUST BE RUN FROM ROOT, reservoir port 10726)
Start-GameServer -Name "Web Server" -File "$BACKEND\web_server.py" -Port 10726 -WorkingDir $ROOT

Write-Host ""
Write-Host "All servers starting in separate windows." -ForegroundColor Green
Write-Host "Opening browser at http://localhost:10726" -ForegroundColor Cyan
Start-Sleep -Seconds 2
Start-Process "http://localhost:10726"

Write-Host "🎮 Ready to play!" -ForegroundColor Green
