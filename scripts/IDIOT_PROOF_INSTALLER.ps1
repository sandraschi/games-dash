# User-Friendly Games Collection Installer
# **Timestamp**: 2025-12-12
# One-click installation for complete gaming setup

param(
    [switch]$IncludeTailscale,
    [switch]$SkipBrowser,
    [string]$CustomPort = "9876"
)

# Admin rights check
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$adminRole = [Security.Principal.WindowsBuiltInRole]::Administrator

if (-not $currentPrincipal.IsInRole($adminRole)) {
    Write-Host "🔑 This installer needs administrator privileges." -ForegroundColor Yellow
    Write-Host "Please right-click this file and select 'Run as administrator'" -ForegroundColor Cyan
    Read-Host "Press Enter to exit"
    exit 1
}

# Set execution policy for this session
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force

# Configuration
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Colors for output
$Green = "Green"
$Yellow = "Yellow"
$Cyan = "Cyan"
$Red = "Red"
$White = "White"
$Magenta = "Magenta"

function Write-Step {
    param([string]$Message, [string]$Color = $Cyan)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor $Color
    Write-Host " $Message" -ForegroundColor White
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor $Color
}

function Write-Status {
    param([string]$Message, [string]$Color = $White)
    Write-Host "  $Message" -ForegroundColor $Color
}

function Test-Command {
    param([string]$Command)
    try {
        $null = Get-Command $Command -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

function Get-LocalIP {
    try {
        $ipInfo = Get-NetIPAddress | Where-Object {
            $_.AddressFamily -eq "IPv4" -and
            $_.IPAddress -notlike "127.*" -and
            $_.IPAddress -notlike "169.*" -and
            $_.IPAddress -notlike "172.*"  # Skip Docker networks
        } | Select-Object -First 1
        return $ipInfo.IPAddress
    } catch {
        return "192.168.1.100"  # Fallback
    }
}

# ===== MAIN INSTALLATION =====

Write-Step "🎮 GAMES COLLECTION - IDIOT-PROOF INSTALLER" $Magenta
Write-Host ""
Write-Host "Welcome to the easiest games installation ever!" -ForegroundColor White
Write-Host "This will set up everything automatically." -ForegroundColor Gray
Write-Host ""

# Check if already installed
if (Test-Path "docker-compose.yml" -and (docker compose ps 2>$null | Select-String "games-")) {
    Write-Host "⚠️  Games collection appears to be already installed!" -ForegroundColor Yellow
    $reinstall = Read-Host "Do you want to reinstall? (y/n)"
    if ($reinstall -notmatch "^[Yy]") {
        Write-Host "Installation cancelled." -ForegroundColor Yellow
        exit 0
    }
    Write-Status "Stopping existing services..." $Yellow
    docker compose down 2>$null | Out-Null
}

# ===== STEP 1: Prerequisites Check =====

Write-Step "🔍 CHECKING PREREQUISITES" $Yellow

$prerequisites = @(
    @{Name = "PowerShell 5.1+"; Check = { $PSVersionTable.PSVersion.Major -ge 5 }; Required = $true},
    @{Name = "Windows 10/11"; Check = { (Get-WmiObject -Class Win32_OperatingSystem).Caption -match "Windows (10|11)" }; Required = $true},
    @{Name = "Internet Connection"; Check = { Test-Connection -ComputerName google.com -Count 1 -Quiet }; Required = $true}
)

$allGood = $true
foreach ($prereq in $prerequisites) {
    Write-Status "Checking $($prereq.Name)..." $White
    try {
        $result = & $prereq.Check
        if ($result) {
            Write-Status "✅ $($prereq.Name) - OK" $Green
        } else {
            Write-Status "❌ $($prereq.Name) - FAILED" $Red
            if ($prereq.Required) { $allGood = $false }
        }
    } catch {
        Write-Status "❌ $($prereq.Name) - ERROR: $($_.Exception.Message)" $Red
        if ($prereq.Required) { $allGood = $false }
    }
}

if (-not $allGood) {
    Write-Host ""
    Write-Host "❌ Required prerequisites not met. Please fix the issues above." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# ===== STEP 2: Docker Installation =====

Write-Step "🐳 INSTALLING DOCKER DESKTOP" $Cyan

if (Test-Command "docker") {
    Write-Status "✅ Docker already installed" $Green
    $dockerVersion = docker --version
    Write-Status "Version: $dockerVersion" $White
} else {
    Write-Status "📥 Downloading Docker Desktop..." $Yellow

    try {
        $dockerUrl = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
        $installerPath = "$env:TEMP\DockerDesktopInstaller.exe"

        Write-Status "Downloading installer..." $White
        Invoke-WebRequest -Uri $dockerUrl -OutFile $installerPath -UseBasicParsing

        Write-Status "Installing Docker Desktop (this will take a few minutes)..." $Yellow
        Write-Status "Please wait and don't close this window..." $White

        # Run installer silently
        $process = Start-Process -FilePath $installerPath -ArgumentList "install --quiet" -Wait -PassThru

        if ($process.ExitCode -eq 0) {
            Write-Status "✅ Docker Desktop installed successfully!" $Green
            Write-Status "Starting Docker service..." $Yellow

            # Start Docker service
            Start-Service -Name "com.docker.service" -ErrorAction SilentlyContinue
            Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -ErrorAction SilentlyContinue

            # Wait for Docker to start
            Write-Status "Waiting for Docker to start (this takes ~30 seconds)..." $White
            $attempts = 0
            while ($attempts -lt 30) {
                Start-Sleep 2
                if (Test-Command "docker") {
                    try {
                        $null = docker info 2>$null
                        break
                    } catch {
                        # Docker not ready yet
                    }
                }
                $attempts++
            }

            if (Test-Command "docker") {
                Write-Status "✅ Docker is ready!" $Green
            } else {
                Write-Status "⚠️  Docker installed but may need manual start" $Yellow
                Write-Status "Please start Docker Desktop manually if prompted" $White
            }
        } else {
            Write-Status "❌ Docker installation failed" $Red
            Write-Status "Please download Docker Desktop manually from https://docker.com" $Yellow
            Read-Host "Press Enter to continue anyway (may not work)"
        }
    } catch {
        Write-Status "❌ Docker installation failed: $($_.Exception.Message)" $Red
        Write-Status "Please install Docker Desktop manually from https://docker.com" $Yellow
        Read-Host "Press Enter to continue anyway"
    }
}

# ===== STEP 3: Tailscale Setup (Optional) =====

if ($IncludeTailscale) {
    Write-Step "🔐 SETTING UP TAILSCALE VPN" $Cyan

    if (Test-Command "tailscale") {
        Write-Status "✅ Tailscale already installed" $Green
    } else {
        Write-Status "📥 Installing Tailscale..." $Yellow

        try {
            $tailscaleUrl = "https://pkgs.tailscale.com/stable/tailscale-setup-latest.exe"
            $installerPath = "$env:TEMP\TailscaleInstaller.exe"

            Write-Status "Downloading Tailscale installer..." $White
            Invoke-WebRequest -Uri $tailscaleUrl -OutFile $installerPath -UseBasicParsing

            Write-Status "Installing Tailscale..." $Yellow
            $process = Start-Process -FilePath $installerPath -ArgumentList "/S" -Wait -PassThru

            if ($process.ExitCode -eq 0) {
                Write-Status "✅ Tailscale installed successfully!" $Green
                Write-Status "Please login to Tailscale when prompted" $Yellow
                Write-Status "Then run this installer again to complete setup" $White
                Read-Host "Press Enter after Tailscale login to continue"
            } else {
                Write-Status "❌ Tailscale installation failed" $Red
                $IncludeTailscale = $false
            }
        } catch {
            Write-Status "❌ Tailscale installation failed: $($_.Exception.Message)" $Red
            $IncludeTailscale = $false
        }
    }
}

# ===== STEP 4: Firewall Configuration =====

Write-Step "🔥 CONFIGURING FIREWALL" $Cyan

$ports = @(9876, 9543, 9544, 9545, 9877)
$firewallConfigured = $true

foreach ($port in $ports) {
    $ruleName = "Games Collection Port $port"
    $existingRule = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue

    if (-not $existingRule) {
        try {
            New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Protocol TCP -LocalPort $port -Action Allow -ErrorAction Stop | Out-Null
            Write-Status "✅ Port $port opened" $Green
        } catch {
            Write-Status "❌ Failed to open port $port" $Red
            $firewallConfigured = $false
        }
    } else {
        Write-Status "✅ Port $port already open" $Green
    }
}

if (-not $firewallConfigured) {
    Write-Status "⚠️  Some firewall rules failed. You may need manual configuration." $Yellow
}

# ===== STEP 5: Deploy Services =====

Write-Step "🚀 DEPLOYING GAMES SERVICES" $Green

Write-Status "Building and starting all services..." $Yellow
Write-Status "This may take 2-3 minutes on first run..." $White

try {
    # Clean up any existing containers
    docker compose down 2>$null | Out-Null

    # Build and start services
    $buildOutput = docker compose up --build -d 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Status "✅ Services deployed successfully!" $Green

        # Wait for services to be ready
        Write-Status "Waiting for services to start..." $White
        Start-Sleep 15

        # Check service status
        Write-Step "📊 SERVICE STATUS" $Cyan
        $statusOutput = docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
        Write-Host $statusOutput

    } else {
        Write-Status "❌ Service deployment failed" $Red
        Write-Status "Build output:" $Yellow
        Write-Host $buildOutput
        Read-Host "Press Enter to exit"
        exit 1
    }
} catch {
    Write-Status "❌ Deployment failed: $($_.Exception.Message)" $Red
    Read-Host "Press Enter to exit"
    exit 1
}

# ===== STEP 6: Final Configuration =====

Write-Step "🎯 FINAL CONFIGURATION" $Magenta

# Get IP addresses
$localIP = Get-LocalIP
Write-Status "Your local IP: $localIP" $Green

$tailscaleIP = $null
if ($IncludeTailscale -and (Test-Command "tailscale")) {
    try {
        $tailscaleIP = tailscale ip -4 2>$null
        if ($tailscaleIP) {
            Write-Status "Tailscale IP: $tailscaleIP" $Green
        }
    } catch {
        Write-Status "Tailscale not connected (run 'tailscale login' if needed)" $Yellow
    }
}

# ===== STEP 7: Success Message =====

Write-Step "🎉 INSTALLATION COMPLETE!" $Green

Write-Host ""
Write-Host "🎮 Your games collection is now running!" -ForegroundColor White
Write-Host ""

Write-Host "🌐 Access URLs:" -ForegroundColor Yellow
Write-Host "  💻 Local PC:       http://localhost:$CustomPort" -ForegroundColor White
Write-Host "  📱 Local Network:  http://$localIP`:$CustomPort" -ForegroundColor White
if ($tailscaleIP) {
    Write-Host "  🌍 Internet:       http://$tailscaleIP`:$CustomPort" -ForegroundColor White
    Write-Host "     (Works from anywhere!)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🎯 What you can do now:" -ForegroundColor Cyan
Write-Host "  • Play 69 games with world-class AI opponents" -ForegroundColor White
Write-Host "  • Access from any device on your WiFi" -ForegroundColor White
if ($tailscaleIP) {
    Write-Host "  • Play from internet (coffee shops, hotels, etc.)" -ForegroundColor White
}
Write-Host "  • Services auto-restart if they crash" -ForegroundColor White
Write-Host "  • Zero maintenance required" -ForegroundColor White

Write-Host ""
Write-Host "🛠️  Management commands:" -ForegroundColor Gray
Write-Host "  • Stop:  docker compose down" -ForegroundColor White
Write-Host "  • Start: docker compose up -d" -ForegroundColor White
Write-Host "  • Logs:  docker compose logs -f" -ForegroundColor White
Write-Host "  • Update: docker compose pull && docker compose up -d" -ForegroundColor White

Write-Host ""
if (-not $SkipBrowser) {
    Write-Host "🌐 Opening browser..." -ForegroundColor Cyan
    Start-Process "http://localhost:$CustomPort"
}

Write-Host ""
Write-Host "🎊 Enjoy your games collection!" -ForegroundColor Green
Write-Host "   (Seriously, 69 games is a lot. Have fun!)" -ForegroundColor Gray

# Wait for user to see the message
Read-Host "Press Enter to finish"
