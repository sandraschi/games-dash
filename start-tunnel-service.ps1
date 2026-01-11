# Tunnel Service Startup Script
# Starts Cloudflare tunnel and hands off to keeper for monitoring

param(
    [int]$LocalPort = 9876
)

Write-Host "🚀 STARTING CLOUDFLARE TUNNEL FOR SERVICE" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# Check if cloudflared exists
if (!(Test-Path "cloudflared.exe")) {
    Write-Host "❌ cloudflared.exe not found" -ForegroundColor Red
    exit 1
}

# Check if tunnel is already running
$existingProcess = Get-Process -Name cloudflared -ErrorAction SilentlyContinue
if ($existingProcess) {
    Write-Host "⚠️  cloudflared already running (PID: $($existingProcess.Id))" -ForegroundColor Yellow
    Write-Host "   Skipping startup - keeper will monitor existing tunnel" -ForegroundColor Gray
    exit 0
}

Write-Host "🌐 Starting Cloudflare tunnel on port $LocalPort..." -ForegroundColor Cyan

# Start tunnel in background
$job = Start-Job -ScriptBlock {
    param($port)
    Set-Location $using:PSScriptRoot
    .\cloudflared.exe tunnel --url "http://localhost:$port" 2>&1
} -ArgumentList $LocalPort

# Wait for tunnel to start
Write-Host "⏳ Waiting for tunnel to establish..." -ForegroundColor White
Start-Sleep -Seconds 3

# Verify tunnel started
$tunnelProcess = Get-Process -Name cloudflared -ErrorAction SilentlyContinue
if ($tunnelProcess) {
    Write-Host "✅ Tunnel started successfully (PID: $($tunnelProcess.Id))" -ForegroundColor Green
    Write-Host "   Keeper will now monitor and maintain the tunnel" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "❌ Tunnel failed to start" -ForegroundColor Red

    # Clean up job
    Stop-Job $job -ErrorAction SilentlyContinue
    Remove-Job $job -ErrorAction SilentlyContinue

    exit 1
}