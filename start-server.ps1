# Start Simple HTTP Server for Games App
# **Timestamp**: 2025-12-03

Write-Host ""
Write-Host "🎮 Starting Games Collection Web Server..." -ForegroundColor Cyan
Write-Host ""

# Check if Python is available
$pythonCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    $pythonCmd = "python3"
}

if ($pythonCmd) {
    Write-Host "Using Python HTTP Server" -ForegroundColor Green
    Write-Host "Server running at: http://localhost:9876" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Open in browser: http://localhost:9876/index.html" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press Ctrl+C to stop server" -ForegroundColor DarkGray
    Write-Host ""
    
    # Start Python HTTP server
    & $pythonCmd -m http.server 9876
} else {
    Write-Host "❌ Python not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Use Node.js" -ForegroundColor Yellow
    
    if (Get-Command npx -ErrorAction SilentlyContinue) {
        Write-Host "Starting http-server with Node.js..." -ForegroundColor Green
        Write-Host ""
        npx --yes http-server -p 9876 -o
    } else {
        Write-Host ""
        Write-Host "Neither Python nor Node.js found!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please install one of:" -ForegroundColor Yellow
        Write-Host "• Python: https://www.python.org/downloads/" -ForegroundColor White
        Write-Host "• Node.js: https://nodejs.org/" -ForegroundColor White
        Write-Host ""
        Write-Host "Or use VS Code 'Live Server' extension" -ForegroundColor Cyan
    }
}
