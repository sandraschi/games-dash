# Start All Services in Windows Container
# **Timestamp**: 2025-12-04

Write-Host "🚀 Starting Games Collection Services..." -ForegroundColor Green

# Start web server in background
# Note: web-server.py runs on port 9876 by default
$webServer = Start-Process -FilePath "python" -ArgumentList "web-server.py" -PassThru -NoNewWindow
Start-Sleep -Seconds 2
Write-Host "✅ Web server started (PID: $($webServer.Id))" -ForegroundColor Green

# Start Stockfish server in background
$stockfish = Start-Process -FilePath "python" -ArgumentList "stockfish-server.py" -PassThru -NoNewWindow
Write-Host "✅ Stockfish server started (PID: $($stockfish.Id))" -ForegroundColor Green

# Start Shogi server in background
$shogi = Start-Process -FilePath "python" -ArgumentList "shogi-server.py" -PassThru -NoNewWindow
Write-Host "✅ Shogi server started (PID: $($shogi.Id))" -ForegroundColor Green

# Start Go server in background
$go = Start-Process -FilePath "python" -ArgumentList "go-server.py" -PassThru -NoNewWindow
Write-Host "✅ Go server started (PID: $($go.Id))" -ForegroundColor Green

# Start Multiplayer server in background
$multiplayer = Start-Process -FilePath "python" -ArgumentList "multiplayer-server.py" -PassThru -NoNewWindow
Write-Host "✅ Multiplayer server started (PID: $($multiplayer.Id))" -ForegroundColor Green

Write-Host ""
Write-Host "🎮 All services started!" -ForegroundColor Cyan
Write-Host "Web: http://localhost:9876" -ForegroundColor Yellow
Write-Host "Stockfish: http://localhost:9543" -ForegroundColor Yellow
Write-Host "Shogi: http://localhost:9544" -ForegroundColor Yellow
Write-Host "Go: http://localhost:9545" -ForegroundColor Yellow
Write-Host "Multiplayer: ws://localhost:9877" -ForegroundColor Yellow
Write-Host ""

# Keep script running
Write-Host "Press Ctrl+C to stop all services..." -ForegroundColor Gray
try {
    while ($true) {
        Start-Sleep -Seconds 1
        # Check if any process died
        if ($webServer.HasExited -or $stockfish.HasExited -or $shogi.HasExited -or $go.HasExited -or $multiplayer.HasExited) {
            Write-Host "⚠️  One or more services have stopped!" -ForegroundColor Red
            break
        }
    }
} finally {
    Write-Host "🛑 Stopping all services..." -ForegroundColor Yellow
    Stop-Process -Id $webServer.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $stockfish.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $shogi.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $go.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $multiplayer.Id -Force -ErrorAction SilentlyContinue
    Write-Host "✅ All services stopped" -ForegroundColor Green
}

