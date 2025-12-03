# Start Complete Games System with REAL Stockfish
# **Timestamp**: 2025-12-03

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  🏆 STARTING GAMES COLLECTION" -ForegroundColor White
Write-Host "  WITH REAL STOCKFISH ENGINE!" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

# Start Stockfish backend
Write-Host "1️⃣ Starting Real Stockfish backend (port 9543)..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd D:\Dev\repos\games-app; python stockfish-server.py"

Start-Sleep -Seconds 2

# Start web server
Write-Host "2️⃣ Starting web server (port 9876)..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd D:\Dev\repos\games-app; python -m http.server 9876"

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "✅ BOTH SERVERS STARTING!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend (Stockfish): http://localhost:9543/api/status" -ForegroundColor Yellow
Write-Host "Frontend (Games):    http://localhost:9876" -ForegroundColor Yellow
Write-Host ""
Write-Host "Opening browser..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
Start-Process "http://localhost:9876"

Write-Host ""
Write-Host "🎮 Ready to play!" -ForegroundColor Green
Write-Host ""
Write-Host "To stop: Close both PowerShell windows" -ForegroundColor Gray
Write-Host ""

