# Free Tunnel Setup with Email Notifications
# Uses Cloudflare tunnel (free) with automatic URL change notifications

param(
    [switch]$Setup,
    [switch]$Start,
    [switch]$Test
)

if ($Setup) {
    Write-Host "📧 SETTING UP FREE TUNNEL WITH EMAIL NOTIFICATIONS" -ForegroundColor Green
    Write-Host "=================================================" -ForegroundColor Green
    Write-Host ""

    # Check if email is configured
    $emailConfig = Join-Path $PSScriptRoot "tunnel-email-config.json"
    if (!(Test-Path $emailConfig)) {
        Write-Host "📧 Email notifications not configured yet." -ForegroundColor Yellow
        Write-Host "This is required for URL change notifications." -ForegroundColor White
        Write-Host ""

        $setupEmail = Read-Host "Set up email notifications now? (y/n)"
        if ($setupEmail -eq 'y' -or $setupEmail -eq 'Y') {
            $emailScript = Join-Path $PSScriptRoot "tunnel-email-notifier.ps1"
            if (Test-Path $emailScript) {
                & $emailScript -Setup
            } else {
                Write-Host "❌ Email script not found" -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host "⚠️  Email setup cancelled. URL changes won't be notified." -ForegroundColor Yellow
        }
    } else {
        Write-Host "✅ Email notifications already configured" -ForegroundColor Green
    }

    # Check if cloudflared exists
    if (!(Test-Path "cloudflared.exe")) {
        Write-Host ""
        Write-Host "📥 Downloading cloudflared..." -ForegroundColor Cyan
        try {
            Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "cloudflared.exe"
            Write-Host "✅ cloudflared downloaded successfully" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to download cloudflared: $($_.Exception.Message)" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "✅ cloudflared.exe found" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "🎯 SETUP COMPLETE!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 To start your free tunnel:" -ForegroundColor Cyan
    Write-Host "   .\setup-free-tunnel.ps1 -Start" -ForegroundColor White
    Write-Host ""
    Write-Host "🧪 To test email notifications:" -ForegroundColor Cyan
    Write-Host "   .\setup-free-tunnel.ps1 -Test" -ForegroundColor White

} elseif ($Start) {
    Write-Host "🚀 STARTING FREE CLOUDFLARE TUNNEL" -ForegroundColor Green
    Write-Host "=================================" -ForegroundColor Green
    Write-Host ""

    # Check prerequisites
    if (!(Test-Path "cloudflared.exe")) {
        Write-Host "❌ cloudflared.exe not found. Run setup first." -ForegroundColor Red
        exit 1
    }

    $emailConfig = Join-Path $PSScriptRoot "tunnel-email-config.json"
    if (!(Test-Path $emailConfig)) {
        Write-Host "⚠️  Email not configured. URL changes won't be notified." -ForegroundColor Yellow
        Write-Host "Run: .\setup-free-tunnel.ps1 -Setup" -ForegroundColor Cyan
        Write-Host ""
    }

    Write-Host "🌐 Starting tunnel for port 9876..." -ForegroundColor Cyan
    Write-Host "Note: This will create a temporary URL that changes on restart." -ForegroundColor Yellow
    Write-Host "Friends will be notified automatically via email." -ForegroundColor White
    Write-Host ""

    # Start tunnel and capture URL
    try {
        $job = Start-Job -ScriptBlock {
            Set-Location $using:PSScriptRoot
            .\cloudflared.exe tunnel --url "http://localhost:9876" 2>&1
        }

        Write-Host "⏳ Waiting for tunnel to establish..." -ForegroundColor White
        Start-Sleep -Seconds 5

        # Check if tunnel started
        $process = Get-Process -Name cloudflared -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "✅ Tunnel started (PID: $($process.Id))" -ForegroundColor Green
            Write-Host ""
            Write-Host "🎯 TUNNEL STATUS: ACTIVE" -ForegroundColor Green
            Write-Host "The tunnel URL will appear in the output above." -ForegroundColor White
            Write-Host "Look for: https://xxxxx.trycloudflare.com" -ForegroundColor Cyan
            Write-Host ""

            # Start the keeper to monitor and send emails
            Write-Host "🛡️ Starting tunnel keeper..." -ForegroundColor Cyan
            $keeperScript = Join-Path $PSScriptRoot "keep-tunnel-alive.ps1"
            if (Test-Path $keeperScript) {
                & $keeperScript
            } else {
                Write-Host "⚠️  Keeper script not found. Manual URL monitoring required." -ForegroundColor Yellow
            }

        } else {
            Write-Host "❌ Tunnel failed to start" -ForegroundColor Red
            Stop-Job $job -ErrorAction SilentlyContinue
            Remove-Job $job -ErrorAction SilentlyContinue
            exit 1
        }

    } catch {
        Write-Host "❌ Error starting tunnel: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }

} elseif ($Test) {
    Write-Host "🧪 TESTING FREE TUNNEL EMAIL SYSTEM" -ForegroundColor Green
    Write-Host "===================================" -ForegroundColor Green
    Write-Host ""

    $emailScript = Join-Path $PSScriptRoot "tunnel-email-notifier.ps1"
    if (Test-Path $emailScript) {
        $testUrl = "https://test-tunnel.trycloudflare.com"
        Write-Host "📧 Sending test email with URL: $testUrl" -ForegroundColor Cyan
        & $emailScript -TunnelUrl $testUrl
    } else {
        Write-Host "❌ Email script not found" -ForegroundColor Red
        exit 1
    }

} else {
    Write-Host "🎮 Free Tunnel Setup Script" -ForegroundColor Green
    Write-Host "===========================" -ForegroundColor Green
    Write-Host ""
    Write-Host "This script sets up completely FREE remote access:" -ForegroundColor White
    Write-Host "- Cloudflare Tunnel (free, no account needed)" -ForegroundColor Cyan
    Write-Host "- Automatic email notifications for URL changes" -ForegroundColor Cyan
    Write-Host "- No domains, no payments, no registration required" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor White
    Write-Host "  .\setup-free-tunnel.ps1 -Setup     Configure email and download cloudflared" -ForegroundColor Cyan
    Write-Host "  .\setup-free-tunnel.ps1 -Start     Start the tunnel with monitoring" -ForegroundColor Cyan
    Write-Host "  .\setup-free-tunnel.ps1 -Test      Test email notifications" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🚨 IMPORTANT: URLs will change when you restart the tunnel." -ForegroundColor Yellow
    Write-Host "   But friends get automatic email notifications!" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Perfect for: Anyone who clones this repo and wants remote access" -ForegroundColor Green
}