# Remote Deployment Script for iPad Gaming
# **Timestamp**: 2025-12-12
# Sets up crash-resistant Docker deployment with network access

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  🎮 GAMES COLLECTION - REMOTE DEPLOYMENT" -ForegroundColor White
Write-Host "  📱 iPad Gaming Setup" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

# Check if Docker is running
Write-Host "🐳 Checking Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>$null
    Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found or not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop first" -ForegroundColor Yellow
    exit 1
}

# Find PC IP address
Write-Host ""
Write-Host "🔍 Finding your PC's IP address..." -ForegroundColor Yellow
$ipInfo = Get-NetIPAddress | Where-Object { $_.AddressFamily -eq "IPv4" -and $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*" } | Select-Object -First 1
$pcIP = $ipInfo.IPAddress
Write-Host "✅ Your PC IP: $pcIP" -ForegroundColor Green
Write-Host "📱 Local network access: http://$pcIP`:9876" -ForegroundColor Cyan

# Check for Tailscale
Write-Host ""
Write-Host "🔐 Checking for Tailscale VPN..." -ForegroundColor Yellow
try {
    $tailscaleIP = tailscale ip -4 2>$null
    if ($tailscaleIP) {
        Write-Host "✅ Tailscale detected! IP: $tailscaleIP" -ForegroundColor Green
        Write-Host "🌍 Internet access: http://$tailscaleIP`:9876" -ForegroundColor Cyan
        Write-Host "   (Works from anywhere with internet!)" -ForegroundColor White
    } else {
        Write-Host "⚠️  Tailscale not detected or not connected" -ForegroundColor Yellow
        Write-Host "   For internet access, install Tailscale: https://tailscale.com/download/windows" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️  Tailscale not installed" -ForegroundColor Yellow
    Write-Host "   For internet access, install Tailscale: https://tailscale.com/download/windows" -ForegroundColor Gray
}

# Setup firewall rules
Write-Host ""
Write-Host "🔥 Setting up Windows Firewall..." -ForegroundColor Yellow
$ports = @(9876, 9543, 9544, 9545, 9877)
foreach ($port in $ports) {
    $ruleName = "Games Remote Port $port"
    $existingRule = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
    if (-not $existingRule) {
        try {
            New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Protocol TCP -LocalPort $port -Action Allow -ErrorAction Stop | Out-Null
            Write-Host "  ✅ Port $port opened" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠️  Could not open port $port (might already be open)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ✅ Port $port already open" -ForegroundColor Green
    }
}

# Clean up existing containers
Write-Host ""
Write-Host "🧹 Cleaning up existing containers..." -ForegroundColor Yellow
docker compose down 2>$null | Out-Null

# Build and start services
Write-Host ""
Write-Host "🚀 Building and starting services..." -ForegroundColor Cyan
Write-Host "This may take a few minutes on first run..." -ForegroundColor Yellow

docker compose up --build -d

# Wait for services to start
Write-Host ""
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service status
Write-Host ""
Write-Host "📊 Checking service status..." -ForegroundColor Cyan
$services = docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
Write-Host $services

# Test web access
Write-Host ""
Write-Host "🧪 Testing web access..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9876" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ Web server responding (status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Web server not responding" -ForegroundColor Red
    Write-Host "Check logs: docker compose logs games-web" -ForegroundColor Yellow
}

# Test AI servers
Write-Host ""
Write-Host "🤖 Testing AI servers..." -ForegroundColor Yellow
$aiPorts = @(9543, 9544, 9545)
foreach ($port in $aiPorts) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port/api/status" -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ AI server on port $port responding" -ForegroundColor Green
    } catch {
        Write-Host "❌ AI server on port $port not responding" -ForegroundColor Red
    }
}

# Final instructions
Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "🎮 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access URLs:" -ForegroundColor Yellow
Write-Host "  📱 Local Network (iPad/Phone): http://$pcIP`:9876" -ForegroundColor White
Write-Host "  💻 Local PC:                   http://localhost:9876" -ForegroundColor White

# Show Tailscale info if available
if ($tailscaleIP) {
    Write-Host "  🌍 Internet (Tailscale):       http://$tailscaleIP`:9876" -ForegroundColor White
    Write-Host "     (Works from anywhere!)" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "🔧 Management Commands:" -ForegroundColor Cyan
Write-Host "  View logs:     docker compose logs -f" -ForegroundColor Gray
Write-Host "  Stop all:      docker compose down" -ForegroundColor Gray
Write-Host "  Restart:       docker compose restart" -ForegroundColor Gray
Write-Host "  Update:        docker compose pull && docker compose up -d" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Full guide: REMOTE_DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Ready to play 69 games on your iPad!" -ForegroundColor Green
Write-Host ""

# Optional: Open browser
$openBrowser = Read-Host "Open browser to test local access? (y/n)"
if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
    Start-Process "http://localhost:9876"
}
