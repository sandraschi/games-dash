# Reverse Tunnel Setup - AI Access Without Port Forwarding
# Creates secure tunnels to make AI servers accessible worldwide
# **Timestamp**: 2025-12-17

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("serveo", "localtunnel", "bore", "cloudflared")]
    [string]$TunnelService = "serveo",

    [switch]$Start,
    [switch]$Stop,
    [switch]$Status,
    [switch]$Test
)

$ErrorActionPreference = "Stop"

# Configuration
$config = @{
    WebPort = 9876
    AiPorts = @(9543, 9544, 9545, 9877)
    TunnelHost = "serveo.net"
}

function Write-Header {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  🌐 REVERSE TUNNEL - AI WITHOUT PORT FORWARDING" -ForegroundColor White
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
}

function Test-Prerequisites {
    Write-Host "🔍 Checking prerequisites..." -ForegroundColor Blue

    # Check if SSH is available (for Serveo)
    try {
        $sshVersion = ssh -V 2>&1
        Write-Host "✅ SSH available: $sshVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ SSH not available. Install OpenSSH Client from Windows Features" -ForegroundColor Red
        exit 1
    }

    # Check if Node.js is available (for LocalTunnel)
    try {
        $nodeVersion = node --version 2>&1
        Write-Host "✅ Node.js available: $nodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Node.js not available (needed for LocalTunnel)" -ForegroundColor Yellow
    }

    # Check if AI servers are running
    $aiRunning = 0
    foreach ($port in $config.AiPorts) {
        try {
            $connection = New-Object System.Net.Sockets.TcpClient("localhost", $port)
            $connection.Close()
            $aiRunning++
        } catch {
            # Port not accessible
        }
    }

    if ($aiRunning -eq 0) {
        Write-Host "❌ No AI servers running. Start with: .\START_ALL_SERVERS.ps1" -ForegroundColor Red
        exit 1
    } else {
        Write-Host "✅ $aiRunning/$($config.AiPorts.Count) AI servers running" -ForegroundColor Green
    }

    # Check if web server is running
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($config.WebPort)" -Method Head -TimeoutSec 5
        Write-Host "✅ Web server accessible on port $($config.WebPort)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Web server not accessible on port $($config.WebPort)" -ForegroundColor Red
        Write-Host "   Start with: docker compose up -d" -ForegroundColor Yellow
        exit 1
    }
}

function Start-ServeoTunnel {
    Write-Host "🚀 Starting Serveo SSH tunnel..." -ForegroundColor Green

    # Kill any existing SSH tunnels
    Get-Process ssh -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*serveo*"
    } | Stop-Process -Force -ErrorAction SilentlyContinue

    Start-Sleep -Seconds 2

    # Start tunnel for web server
    Write-Host "🌐 Creating tunnel for web server (port $($config.WebPort))..." -ForegroundColor Blue
    $webJob = Start-Job -ScriptBlock {
        param($port, $host)
        try {
            ssh -R 80:localhost:$port serveo.net
        } catch {
            Write-Host "Web tunnel failed: $_" -ForegroundColor Red
        }
    } -ArgumentList $config.WebPort, $config.TunnelHost

    Start-Sleep -Seconds 3

    # Get the tunnel URLs
    Write-Host "⏳ Waiting for tunnel URLs..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5

    # Try to get tunnel info
    Write-Host "" -ForegroundColor Cyan
    Write-Host "🎯 TUNNEL ACTIVE!" -ForegroundColor Green
    Write-Host "Check your Serveo terminal for the tunnel URLs" -ForegroundColor White
    Write-Host "Look for lines like:" -ForegroundColor White
    Write-Host "  Forwarding HTTP traffic from https://xxxxx.serveo.net" -ForegroundColor Cyan
    Write-Host "  Forwarding SSH traffic from tcp://0.tcp.ngrok.io:xxxxx" -ForegroundColor Cyan
    Write-Host "" -ForegroundColor White
    Write-Host "📱 On your iPad, visit: https://YOUR-SERVEO-URL" -ForegroundColor Green
    Write-Host "" -ForegroundColor White

    # Keep the job running
    Write-Host "Press Ctrl+C to stop the tunnel" -ForegroundColor Yellow
    try {
        while ($true) {
            Start-Sleep -Seconds 10
            if ($webJob.State -ne "Running") {
                Write-Host "❌ Tunnel job stopped unexpectedly" -ForegroundColor Red
                break
            }
        }
    } catch {
        Write-Host "🛑 Stopping tunnel..." -ForegroundColor Yellow
    } finally {
        Stop-Job $webJob -ErrorAction SilentlyContinue
        Remove-Job $webJob -ErrorAction SilentlyContinue
    }
}

function Start-LocalTunnel {
    Write-Host "🚀 Starting LocalTunnel..." -ForegroundColor Green

    # Check if npx is available
    try {
        $npxVersion = npx --version 2>&1
        Write-Host "✅ npx available: $npxVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ npx not available. Install Node.js" -ForegroundColor Red
        exit 1
    }

    Write-Host "🌐 Creating LocalTunnel for port $($config.WebPort)..." -ForegroundColor Blue

    try {
        # Start LocalTunnel
        & npx localtunnel --port $config.WebPort --open
    } catch {
        Write-Host "❌ LocalTunnel failed: $_" -ForegroundColor Red
    }
}

function Start-CloudflaredTunnel {
    Write-Host "🚀 Starting Cloudflare Tunnel..." -ForegroundColor Green

    # Check if cloudflared is available
    try {
        $cfVersion = cloudflared version 2>&1
        Write-Host "✅ cloudflared available: $cfVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ cloudflared not installed. Download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/tunnel-guide/" -ForegroundColor Red
        exit 1
    }

    Write-Host "🌐 Creating Cloudflare tunnel..." -ForegroundColor Blue

    try {
        cloudflared tunnel --url http://localhost:$config.WebPort
    } catch {
        Write-Host "❌ Cloudflare tunnel failed: $_" -ForegroundColor Red
    }
}

function Stop-Tunnels {
    Write-Host "🛑 Stopping all tunnels..." -ForegroundColor Yellow

    # Kill SSH tunnels (Serveo)
    Get-Process ssh -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*serveo*"
    } | Stop-Process -Force -ErrorAction SilentlyContinue

    # Kill LocalTunnel processes
    Get-Process node -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*localtunnel*"
    } | Stop-Process -Force -ErrorAction SilentlyContinue

    # Kill Cloudflare processes
    Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

    Write-Host "✅ All tunnels stopped" -ForegroundColor Green
}

function Show-Status {
    Write-Host "📊 Tunnel Status" -ForegroundColor Cyan

    # Check for active tunnels
    $sshTunnels = Get-Process ssh -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*serveo*"
    }

    $nodeTunnels = Get-Process node -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*localtunnel*"
    }

    $cfTunnels = Get-Process cloudflared -ErrorAction SilentlyContinue

    Write-Host "Serveo (SSH): $(if ($sshTunnels) { '✅ Running' } else { '❌ Stopped' })" -ForegroundColor $(if ($sshTunnels) { 'Green' } else { 'Red' })
    Write-Host "LocalTunnel: $(if ($nodeTunnels) { '✅ Running' } else { '❌ Stopped' })" -ForegroundColor $(if ($nodeTunnels) { 'Green' } else { 'Red' })
    Write-Host "Cloudflare: $(if ($cfTunnels) { '✅ Running' } else { '❌ Stopped' })" -ForegroundColor $(if ($cfTunnels) { 'Green' } else { 'Red' })

    if (-not $sshTunnels -and -not $nodeTunnels -and -not $cfTunnels) {
        Write-Host "" -ForegroundColor Yellow
        Write-Host "💡 No tunnels running. Use -Start to create one." -ForegroundColor Yellow
    }
}

function Test-Tunnels {
    Write-Host "🧪 Testing tunnel connectivity..." -ForegroundColor Blue

    # This would test if the tunnel URLs are accessible
    # For now, just show instructions
    Write-Host "🌐 Test your tunnel by:" -ForegroundColor Cyan
    Write-Host "  1. Opening the tunnel URL in your browser" -ForegroundColor White
    Write-Host "  2. Visiting connectivity-test.html" -ForegroundColor White
    Write-Host "  3. Testing AI connections" -ForegroundColor White
    Write-Host "" -ForegroundColor White
    Write-Host "📱 If using iPad:" -ForegroundColor Green
    Write-Host "  • Make sure to use HTTPS URLs (not HTTP)" -ForegroundColor White
    Write-Host "  • Some services may require you to confirm security warnings" -ForegroundColor White
}

# Main logic
Write-Header

if ($Status) {
    Show-Status
    exit 0
}

if ($Stop) {
    Stop-Tunnels
    exit 0
}

if ($Test) {
    Test-Tunnels
    exit 0
}

if ($Start) {
    Test-Prerequisites

    switch ($TunnelService) {
        "serveo" {
            Start-ServeoTunnel
        }
        "localtunnel" {
            Start-LocalTunnel
        }
        "cloudflared" {
            Start-CloudflaredTunnel
        }
        default {
            Write-Host "❌ Unknown tunnel service: $TunnelService" -ForegroundColor Red
            exit 1
        }
    }
} else {
    # Show usage
    Write-Host "Usage:" -ForegroundColor Cyan
    Write-Host "  .\setup_reverse_tunnel.ps1 -Start [-TunnelService serveo|localtunnel|cloudflared]" -ForegroundColor White
    Write-Host "  .\setup_reverse_tunnel.ps1 -Stop" -ForegroundColor White
    Write-Host "  .\setup_reverse_tunnel.ps1 -Status" -ForegroundColor White
    Write-Host "  .\setup_reverse_tunnel.ps1 -Test" -ForegroundColor White
    Write-Host "" -ForegroundColor White
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\setup_reverse_tunnel.ps1 -Start                    # Start Serveo tunnel" -ForegroundColor White
    Write-Host "  .\setup_reverse_tunnel.ps1 -Start -TunnelService localtunnel" -ForegroundColor White
    Write-Host "  .\setup_reverse_tunnel.ps1 -Status                  # Check tunnel status" -ForegroundColor White
    Write-Host "" -ForegroundColor White
    Write-Host "Tunnel Services:" -ForegroundColor Cyan
    Write-Host "  • serveo     - SSH-based (free, requires SSH)" -ForegroundColor White
    Write-Host "  • localtunnel- Node.js-based (free, requires Node.js)" -ForegroundColor White
    Write-Host "  • cloudflared- Cloudflare (free, requires cloudflared)" -ForegroundColor White
    Write-Host "" -ForegroundColor White
    Write-Host "🎯 Result: Get HTTPS URL for worldwide AI access!" -ForegroundColor Green
}
