# Start Cloudflare Tunnel for Games App
# Creates a public URL for your local games server

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🌐 STARTING CLOUDFLARE TUNNEL" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Check if cloudflared exists
if (-not (Test-Path "cloudflared.exe")) {
    Write-Host "❌ cloudflared.exe not found!" -ForegroundColor Red
    Write-Host "   Please ensure cloudflared.exe is in the project root." -ForegroundColor Yellow
    exit 1
}

# Check if web server is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9876" -Method GET -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Web server is running on port 9876" -ForegroundColor Green
} catch {
    Write-Host "❌ Web server not running on port 9876!" -ForegroundColor Red
    Write-Host "   Please start the web server first with: .\scripts\START_ALL_SERVERS.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🚀 Starting Cloudflare tunnel..." -ForegroundColor Blue
Write-Host "   This will create a public URL for your games server" -ForegroundColor Gray
Write-Host ""

# Start cloudflared tunnel
# The tunnel URL will be displayed in the output
Start-Process -FilePath ".\cloudflared.exe" -ArgumentList "tunnel","--url","http://localhost:9876" -NoNewWindow

Write-Host ""
Write-Host "✅ Cloudflare tunnel started!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 IMPORTANT:" -ForegroundColor Yellow
Write-Host "   - Check the cloudflared window for your tunnel URL" -ForegroundColor White
Write-Host "   - URL format: https://[random-name].trycloudflare.com" -ForegroundColor White
Write-Host "   - Share this URL with friends to access your games!" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  NOTE: Tunnel URL changes each time you restart" -ForegroundColor Yellow
Write-Host "   For a permanent URL, set up a named tunnel with Cloudflare account" -ForegroundColor Gray
Write-Host ""
Write-Host "🛑 To stop: Close the cloudflared window or run:" -ForegroundColor Cyan
Write-Host "   Get-Process cloudflared | Stop-Process -Force" -ForegroundColor White
Write-Host ""
