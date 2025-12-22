# Setup Remote AI Access for iPad
# **Timestamp**: 2025-12-22
# This script configures the games app for remote AI access from iPad via Tailscale

Write-Host "🚀 Setting up Remote AI Access for iPad..." -ForegroundColor Green
Write-Host "This will fix the AI functionality that NEVER worked on iPad before!" -ForegroundColor Yellow
Write-Host ""

# Check if running as administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ Please run this script as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Step 1: Check if AI servers are running
Write-Host "📊 Step 1: Checking AI Server Status..." -ForegroundColor Cyan

$aiProcesses = @(
    @{Name = "Stockfish"; Port = 9543; Process = "stockfish-server.py" },
    @{Name = "YaneuraOu"; Port = 9544; Process = "shogi-server.py" },
    @{Name = "KataGo"; Port = 9545; Process = "go-server.py" },
    @{Name = "Multiplayer"; Port = 9877; Process = "multiplayer-server.py" }
)

$allRunning = $true
foreach ($ai in $aiProcesses) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($ai.Port)/api/status" -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ $($ai.Name): RUNNING on port $($ai.Port)" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($ai.Name): NOT RUNNING on port $($ai.Port)" -ForegroundColor Red
        $allRunning = $false
    }
}

if (-not $allRunning) {
    Write-Host ""
    Write-Host "🔧 AI servers are not running. Starting them..." -ForegroundColor Yellow
    Write-Host "Run this command to start AI servers:" -ForegroundColor Cyan
    Write-Host ".\START_ALL_SERVERS.ps1" -ForegroundColor White
    Write-Host ""
    $startAi = Read-Host "Start AI servers now? (y/n)"
    if ($startAi -eq 'y' -or $startAi -eq 'Y') {
        & ".\START_ALL_SERVERS.ps1"
        Start-Sleep -Seconds 3
    } else {
        Write-Host "Please start AI servers manually with .\START_ALL_SERVERS.ps1" -ForegroundColor Yellow
    }
}

# Step 2: Check Docker status
Write-Host ""
Write-Host "🐳 Step 2: Checking Docker Status..." -ForegroundColor Cyan

try {
    $dockerVersion = docker --version 2>$null
    Write-Host "✅ Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker: NOT INSTALLED" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check if games container is running
$containerStatus = docker ps --filter "name=games-collection-web" --format "{{.Status}}" 2>$null
if ($containerStatus) {
    Write-Host "✅ Games container: RUNNING ($containerStatus)" -ForegroundColor Green
} else {
    Write-Host "❌ Games container: NOT RUNNING" -ForegroundColor Red
    Write-Host "Starting Docker container..." -ForegroundColor Yellow
    docker compose up -d
    Start-Sleep -Seconds 5
}

# Step 3: Configure Firewall
Write-Host ""
Write-Host "🔥 Step 3: Configuring Windows Firewall..." -ForegroundColor Cyan

$firewallRules = @(
    @{Name = "Games Web Server"; Port = 9876; Description = "Games Collection Web Interface" },
    @{Name = "Games Stockfish AI"; Port = 9543; Description = "Chess AI Server" },
    @{Name = "Games Shogi AI"; Port = 9544; Description = "Shogi AI Server" },
    @{Name = "Games Go AI"; Port = 9545; Description = "Go AI Server" },
    @{Name = "Games Multiplayer"; Port = 9877; Description = "Multiplayer Server" }
)

foreach ($rule in $firewallRules) {
    $existingRule = Get-NetFirewallRule -DisplayName $rule.Name -ErrorAction SilentlyContinue
    if (-not $existingRule) {
        New-NetFirewallRule -DisplayName $rule.Name -Direction Inbound -Protocol TCP -LocalPort $rule.Port -Action Allow -Description $rule.Description
        Write-Host "✅ Created firewall rule: $($rule.Name) (port $($rule.Port))" -ForegroundColor Green
    } else {
        Write-Host "✅ Firewall rule exists: $($rule.Name) (port $($rule.Port))" -ForegroundColor Green
    }
}

# Step 4: Test connectivity
Write-Host ""
Write-Host "🧪 Step 4: Testing Local Connectivity..." -ForegroundColor Cyan

$localTests = @(
    @{Name = "Web Server"; Url = "http://localhost:9876" },
    @{Name = "Stockfish AI"; Url = "http://localhost:9543/api/status" },
    @{Name = "Shogi AI"; Url = "http://localhost:9544/api/status" },
    @{Name = "Go AI"; Url = "http://localhost:9545/api/status" }
)

foreach ($test in $localTests) {
    try {
        $response = Invoke-WebRequest -Uri $test.Url -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ $($test.Name): CONNECTED" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($test.Name): FAILED - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Step 5: Check Tailscale
Write-Host ""
Write-Host "🌐 Step 5: Checking Tailscale Configuration..." -ForegroundColor Cyan

try {
    $tailscaleStatus = & tailscale status 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Tailscale: RUNNING" -ForegroundColor Green

        # Get Tailscale IP
        $tailscaleIP = & tailscale ip -4 2>$null
        if ($tailscaleIP) {
            Write-Host "✅ Tailscale IP: $tailscaleIP" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Could not get Tailscale IP" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Tailscale: NOT RUNNING" -ForegroundColor Red
        Write-Host "Please start Tailscale and connect to your tailnet" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Tailscale not found. Install from https://tailscale.com/download" -ForegroundColor Yellow
}

# Step 6: Rebuild Docker container with new AI proxy configuration
Write-Host ""
Write-Host "🔨 Step 6: Rebuilding Docker Container with AI Proxy Fix..." -ForegroundColor Cyan

Write-Host "Stopping existing container..." -ForegroundColor Yellow
docker compose down

Write-Host "Rebuilding with new AI proxy configuration..." -ForegroundColor Yellow
docker compose build --no-cache

Write-Host "Starting updated container..." -ForegroundColor Yellow
docker compose up -d

# Wait for container to start
Write-Host "Waiting for container to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 7: Final connectivity test
Write-Host ""
Write-Host "🎯 Step 7: Final Connectivity Test..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "http://localhost:9876/connectivity-test.html" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ Web server: ACCESSIBLE" -ForegroundColor Green
} catch {
    Write-Host "❌ Web server: NOT ACCESSIBLE - $($_.Exception.Message)" -ForegroundColor Red
}

# Step 8: Instructions for iPad access
Write-Host ""
Write-Host "📱 iPad Access Instructions:" -ForegroundColor Cyan
Write-Host "1. Make sure your iPad is connected to the same Tailscale network" -ForegroundColor White
Write-Host "2. Open Safari on iPad and go to: http://$tailscaleIP:9876" -ForegroundColor White
Write-Host "3. Go to the connectivity test page to verify AI works" -ForegroundColor White
Write-Host "4. AI should now work perfectly from your iPad! 🎉" -ForegroundColor Green

Write-Host ""
Write-Host "🔧 Troubleshooting:" -ForegroundColor Yellow
Write-Host "- If AI still doesn't work, visit: http://localhost:9876/connectivity-test.html" -ForegroundColor White
Write-Host "- Check the 'Emergency Diagnostics' section" -ForegroundColor White
Write-Host "- Make sure Tailscale is running on both PC and iPad" -ForegroundColor White

Write-Host ""
Write-Host "🎊 Setup Complete! AI should now work on iPad via Tailscale!" -ForegroundColor Green
Write-Host "Test it now: http://localhost:9876/connectivity-test.html" -ForegroundColor Cyan
