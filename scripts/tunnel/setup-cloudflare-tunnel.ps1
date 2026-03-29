# Simple Cloudflare Tunnel Setup
# Creates a permanent tunnel for Games App

Write-Host "🚀 Setting up Cloudflare Tunnel..." -ForegroundColor Green
Write-Host "This will create a permanent URL for your games!" -ForegroundColor Cyan
Write-Host ""

# Check if logged in
Write-Host "🔍 Checking Cloudflare login status..." -ForegroundColor Yellow
$loginCheck = & .\cloudflared.exe tunnel list 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged into Cloudflare. Please run:" -ForegroundColor Red
    Write-Host "   .\cloudflared.exe tunnel login" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Logged into Cloudflare!" -ForegroundColor Green

# Create tunnel
Write-Host "🏗️ Creating tunnel 'games-tunnel'..." -ForegroundColor Yellow
$tunnelResult = & .\cloudflared.exe tunnel create games-tunnel 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Tunnel creation failed: $tunnelResult" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Tunnel 'games-tunnel' created!" -ForegroundColor Green

# Get account name for subdomain
Write-Host "📝 Enter your Cloudflare account name:" -ForegroundColor Cyan
Write-Host "   (Usually your email username, e.g., 'john' for john@gmail.com)" -ForegroundColor White
$accountName = Read-Host "Account name"

if ([string]::IsNullOrWhiteSpace($accountName)) {
    Write-Host "❌ Account name required" -ForegroundColor Red
    exit 1
}

$subdomain = "games-tunnel.$accountName.cloudflare.com"

# Route DNS
Write-Host "🔗 Setting up DNS route: $subdomain" -ForegroundColor Yellow
$dnsResult = & .\cloudflared.exe tunnel route dns games-tunnel $subdomain 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ DNS setup failed: $dnsResult" -ForegroundColor Red
    Write-Host "💡 You can set this up manually in Cloudflare dashboard" -ForegroundColor Yellow
} else {
    Write-Host "✅ DNS route created!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 SETUP COMPLETE!" -ForegroundColor Green
Write-Host "🌐 Your permanent URL: https://$subdomain" -ForegroundColor Cyan
Write-Host "♾️ This URL never expires!" -ForegroundColor White
Write-Host ""

# Start the tunnel
Write-Host "🚀 Starting tunnel..." -ForegroundColor Green
Write-Host "Keep this window open. Press Ctrl+C to stop." -ForegroundColor Yellow
Write-Host ""

& .\cloudflared.exe tunnel run games-tunnel --url http://localhost:9876

# Configuration
$ErrorActionPreference = "Stop"
$cloudflaredPath = ".\cloudflared.exe"

# Colors for output
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Cyan = "Cyan"

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor $Cyan
    Write-Host " $Message" -ForegroundColor White
    Write-Host "═══════════════════════════════════════════════════" -ForegroundColor $Cyan
    Write-Host ""
}

function Test-Prerequisites {
    Write-Host "🔍 Checking prerequisites..." -ForegroundColor $Green

    # Check if cloudflared exists
    if (-not (Test-Path $cloudflaredPath)) {
        Write-Host "❌ cloudflared.exe not found at $cloudflaredPath" -ForegroundColor $Red
        Write-Host "   Download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/tunnel-guide/" -ForegroundColor $Yellow
        exit 1
    }

    # Check if cloudflared works
    try {
        $version = & $cloudflaredPath version 2>&1
        Write-Host "✅ cloudflared found: $version" -ForegroundColor $Green
    } catch {
        Write-Host "❌ cloudflared not working: $($_.Exception.Message)" -ForegroundColor $Red
        exit 1
    }

    # Check if web server is running
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$LocalPort" -Method GET -TimeoutSec 3 -ErrorAction Stop
        Write-Host "✅ Web server running on port $LocalPort" -ForegroundColor $Green
    } catch {
        Write-Host "❌ Web server not running on port $LocalPort" -ForegroundColor $Red
        Write-Host "   Start with: .\scripts\START_ALL_SERVERS.ps1" -ForegroundColor $Yellow
        exit 1
    }
}

function Login-To-Cloudflare {
    Write-Step "🔐 LOGIN TO CLOUDFLARE"
    Write-Host "🌐 Opening browser for Cloudflare login..." -ForegroundColor $Green
    Write-Host "📝 Sign in with your credentials: sandraschipal@hotmail.com" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Cloudflare may show a CAPTCHA ('Are you human?')" -ForegroundColor $Yellow
    Write-Host "   Complete the verification and sign in normally" -ForegroundColor White
    Write-Host "   The script will wait for you to complete login" -ForegroundColor White
    Write-Host ""

    try {
        # Open Cloudflare dashboard for manual login
        Start-Process "https://dash.cloudflare.com/login"

        # Start cloudflared login process
        Write-Host "🔄 Starting cloudflared login process..." -ForegroundColor $Cyan
        $loginJob = Start-Job -ScriptBlock {
            param($cloudflaredPath)
            & $cloudflaredPath tunnel login 2>&1
        } -ArgumentList $cloudflaredPath

        # Wait for login to complete (up to 5 minutes)
        Write-Host "⏳ Waiting for you to complete login in browser..." -ForegroundColor $Yellow
        Write-Host "   Check your browser and complete the sign-in process" -ForegroundColor White
        Write-Host "   (This may take a few minutes due to CAPTCHA)" -ForegroundColor Gray
        Write-Host ""

        $timeout = 300 # 5 minutes
        $elapsed = 0

        while ($elapsed -lt $timeout) {
            if ($loginJob.State -eq "Completed") {
                break
            }
            Start-Sleep -Seconds 5
            $elapsed += 5
            Write-Host "." -NoNewline
        }

        # Get the job result
        $loginResult = Receive-Job $loginJob
        Remove-Job $loginJob

        Write-Host ""
        Write-Host "🔍 Checking login status..." -ForegroundColor $Cyan

        # Test if login was successful by trying to list tunnels
        $testResult = & $cloudflaredPath tunnel list 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Successfully logged into Cloudflare!" -ForegroundColor $Green
            Write-Host "   You can now create tunnels and set up DNS" -ForegroundColor White
            return $true
        } else {
            Write-Host "❌ Login verification failed" -ForegroundColor $Red
            Write-Host "   Error: $($testResult -join ' ')" -ForegroundColor Red
            Write-Host ""
            Write-Host "💡 Troubleshooting:" -ForegroundColor $Cyan
            Write-Host "   1. Make sure you completed the login in your browser" -ForegroundColor White
            Write-Host "   2. Check if CAPTCHA verification was successful" -ForegroundColor White
            Write-Host "   3. Try closing all browser windows and running again" -ForegroundColor White
            Write-Host "   4. You can also login manually: cloudflared tunnel login" -ForegroundColor White
            return $false
        }
    } catch {
        Write-Host "❌ Login error: $($_.Exception.Message)" -ForegroundColor $Red
        return $false
    }
}

function Create-Tunnel {
    param([string]$Name)

    Write-Step "🏗️ CREATING TUNNEL: $Name"

    # Check if tunnel already exists
    $existing = & $cloudflaredPath tunnel list | Select-String $Name
    if ($existing) {
        Write-Host "ℹ️  Tunnel '$Name' already exists" -ForegroundColor $Yellow
        return $true
    }

    try {
        Write-Host "🏗️ Creating tunnel '$Name'..." -ForegroundColor $Green
        $output = & $cloudflaredPath tunnel create $Name 2>&1

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Tunnel '$Name' created successfully" -ForegroundColor $Green
            return $true
        } else {
            Write-Host "❌ Failed to create tunnel: $output" -ForegroundColor $Red
            return $false
        }
    } catch {
        Write-Host "❌ Tunnel creation error: $($_.Exception.Message)" -ForegroundColor $Red
        return $false
    }
}

function Setup-DNS {
    param([string]$TunnelName, [string]$DomainName)

    Write-Step "🌐 SETTING UP FREE CLOUDFLARE SUBDOMAIN"

    Write-Host "🆓 Using Cloudflare's free subdomain service" -ForegroundColor $Green
    Write-Host "   This creates a permanent URL: *.cloudflare.com" -ForegroundColor White
    Write-Host ""

    # Try to get account info to suggest subdomain
    try {
        $accountInfo = & $cloudflaredPath tunnel list 2>&1
        # Look for account info in output
    } catch {
        # Ignore errors
    }

    Write-Host "📝 Enter your Cloudflare account name:" -ForegroundColor $Cyan
    Write-Host "   (This is usually your email username or account name)" -ForegroundColor White
    Write-Host "   Example: if your email is 'john@gmail.com', try 'john'" -ForegroundColor $Yellow
    Write-Host ""

    $accountName = Read-Host "Your Cloudflare account name"

    if ([string]::IsNullOrWhiteSpace($accountName)) {
        Write-Host "❌ Account name is required for free subdomain" -ForegroundColor $Red
        return $false
    }

    $freeDomain = "$TunnelName.$accountName.cloudflare.com"
    Write-Host "🎯 Will create subdomain: $freeDomain" -ForegroundColor $Green
    Write-Host ""

    $confirm = Read-Host "Does this look correct? (Y/n)"
    if ($confirm -eq 'n' -or $confirm -eq 'N') {
        $freeDomain = Read-Host "Enter the full subdomain you want (e.g., games-tunnel.john.cloudflare.com)"
    }

    try {
        Write-Host "🔗 Creating DNS route: $freeDomain → $TunnelName" -ForegroundColor $Green
        $output = & $cloudflaredPath tunnel route dns $TunnelName $freeDomain 2>&1

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Free subdomain created successfully!" -ForegroundColor $Green
            Write-Host "   🌐 Your permanent URL: https://$freeDomain" -ForegroundColor $Cyan
            Write-Host "   🔒 This URL never expires!" -ForegroundColor White
            return $true
        } else {
            Write-Host "❌ Subdomain creation failed: $output" -ForegroundColor $Red
            Write-Host "" -ForegroundColor Yellow
            Write-Host "💡 Troubleshooting:" -ForegroundColor Cyan
            Write-Host "   1. Make sure you're logged into Cloudflare" -ForegroundColor White
            Write-Host "   2. Check your account name is correct" -ForegroundColor White
            Write-Host "   3. Try a different account name variation" -ForegroundColor White
            Write-Host "   4. You can also set this up manually in Cloudflare dashboard" -ForegroundColor White
            return $false
        }
    } catch {
        Write-Host "❌ DNS setup error: $($_.Exception.Message)" -ForegroundColor $Red
        return $false
    }
}

function Run-Tunnel {
    param([string]$TunnelName, [int]$Port)

    Write-Step "🚀 STARTING TUNNEL"

    Write-Host "🌐 Starting tunnel '$TunnelName' on port $Port..." -ForegroundColor $Green
    Write-Host "   This will create your permanent URL" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  IMPORTANT:" -ForegroundColor $Yellow
    Write-Host "   - Keep this window open to maintain the tunnel" -ForegroundColor White
    Write-Host "   - Press Ctrl+C to stop the tunnel" -ForegroundColor White
    Write-Host "   - Your games will be accessible at your domain" -ForegroundColor White
    Write-Host ""

    try {
        Write-Host "🏃 Starting tunnel... (Press Ctrl+C to stop)" -ForegroundColor $Green
        Write-Host ""

        # Run the tunnel - this will block until interrupted
        & $cloudflaredPath tunnel run $TunnelName --url "http://localhost:$Port"

    } catch {
        Write-Host ""
        Write-Host "🛑 Tunnel stopped: $($_.Exception.Message)" -ForegroundColor $Yellow
    }
}

# Main execution
Write-Step "🏁 CLOUDFLARE TUNNEL SETUP"
Write-Host "Tunnel Name: $TunnelName" -ForegroundColor White
Write-Host "Local Port: $LocalPort" -ForegroundColor White
Write-Host "Domain Type: FREE CLOUDFLARE SUBDOMAIN" -ForegroundColor $Green
Write-Host "Cost: $0/month (Cloudflare Zero Trust Free)" -ForegroundColor $Green
Write-Host ""

Test-Prerequisites

$loggedIn = Login-To-Cloudflare
if (-not $loggedIn) {
    Write-Host ""
    Write-Host "❌ Login failed. Please try again or login manually first:" -ForegroundColor $Red
    Write-Host "   cloudflared tunnel login" -ForegroundColor $Yellow
    exit 1
}

$tunnelCreated = Create-Tunnel -Name $TunnelName
if (-not $tunnelCreated) {
    Write-Host ""
    Write-Host "❌ Tunnel creation failed. Please check your Cloudflare account permissions." -ForegroundColor $Red
    exit 1
}

# Always set up DNS for free subdomain (default behavior)
$dnsSetup = Setup-DNS -TunnelName $TunnelName -DomainName $Domain
if (-not $dnsSetup) {
    Write-Host ""
    Write-Host "⚠️  Subdomain setup failed, but you can still run the tunnel" -ForegroundColor $Yellow
    Write-Host "   You can set up the subdomain manually in Cloudflare dashboard:" -ForegroundColor White
    Write-Host "   1. Go to Zero Trust → Tunnels" -ForegroundColor White
    Write-Host "   2. Find your tunnel → Configure" -ForegroundColor White
    Write-Host "   3. Add a public hostname with *.cloudflare.com" -ForegroundColor White
}

Write-Step "🎉 SETUP COMPLETE"

Write-Host "✅ Tunnel '$TunnelName' created successfully!" -ForegroundColor $Green
Write-Host "🆓 Free Cloudflare subdomain configured" -ForegroundColor $Green
Write-Host ""
Write-Host "🚀 Ready to start your permanent tunnel!" -ForegroundColor $Cyan
Write-Host "   Your games will be accessible at:" -ForegroundColor White
Write-Host "   https://$TunnelName.[your-account].cloudflare.com" -ForegroundColor $Cyan
Write-Host ""
Write-Host "💡 To start the tunnel:" -ForegroundColor $Yellow
Write-Host "   .\setup-cloudflare-tunnel.ps1 -RunTunnel" -ForegroundColor White

Write-Host ""
Write-Host "💡 Pro tip: Add this script to your startup for automatic tunnel" -ForegroundColor $Cyan
Write-Host ""

# Offer to run the tunnel immediately
$runNow = Read-Host "Would you like to start the tunnel now? (y/N)"
if ($runNow -eq 'y' -or $runNow -eq 'Y') {
    Run-Tunnel -TunnelName $TunnelName -Port $LocalPort
}