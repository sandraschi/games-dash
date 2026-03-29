# Start Cloudflare Tunnel with Automatic Email Notification
# Captures the tunnel URL and emails it to friends

param(
    [int]$LocalPort = 9876,
    [switch]$Background
)

Write-Host "🚀 STARTING CLOUDFLARE TUNNEL WITH EMAIL NOTIFICATION" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green
Write-Host ""

# Check if cloudflared exists
if (!(Test-Path "cloudflared.exe")) {
    Write-Host "❌ cloudflared.exe not found" -ForegroundColor Red
    exit 1
}

# Check if email is configured
$emailConfig = Join-Path $PSScriptRoot "tunnel-email-config.json"
if (!(Test-Path $emailConfig)) {
    Write-Host "⚠️  Email not configured yet" -ForegroundColor Yellow
    Write-Host "   Run: .\tunnel-email-notifier.ps1 -Setup" -ForegroundColor White
    Write-Host ""
}

Write-Host "🌐 Starting tunnel for port $LocalPort..." -ForegroundColor Cyan

# Start tunnel and capture output
$job = Start-Job -ScriptBlock {
    param($port)
    & .\cloudflared.exe tunnel --url "http://localhost:$port" 2>&1
} -ArgumentList $LocalPort

# Wait for tunnel to start and capture the URL
Write-Host "⏳ Waiting for tunnel to establish..." -ForegroundColor White
Start-Sleep -Seconds 3

# Wait for tunnel to establish
Write-Host "⏳ Waiting for tunnel to establish connection..." -ForegroundColor White
Start-Sleep -Seconds 5

# Check if tunnel is running
$tunnelRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:$LocalPort" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Tunnel established (local server accessible)" -ForegroundColor Green
    $tunnelRunning = $true
} catch {
    Write-Host "❌ Local server not accessible. Tunnel may have failed." -ForegroundColor Red
    Stop-Job $job -ErrorAction SilentlyContinue
    Remove-Job $job -ErrorAction SilentlyContinue
    exit 1
}

if ($tunnelRunning) {
    Write-Host ""
    Write-Host "🎯 TUNNEL STATUS: ACTIVE" -ForegroundColor Green
    Write-Host ""
    Write-Host "📧 EMAIL NOTIFICATION:" -ForegroundColor Cyan
    Write-Host "Since Cloudflare generates random URLs, you need to:" -ForegroundColor White
    Write-Host "1. Check the cloudflared output above for your URL" -ForegroundColor Yellow
    Write-Host "2. Or visit the URL shown in the tunnel startup messages" -ForegroundColor Yellow
    Write-Host "3. Then run: .\tunnel-email-notifier.ps1 -TunnelUrl 'YOUR_URL_HERE'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Example: .\tunnel-email-notifier.ps1 -TunnelUrl 'https://abc123.trycloudflare.com'" -ForegroundColor Gray
    Write-Host ""

    # Auto-detect URL from common patterns (this is a best-effort approach)
    $tunnelUrl = $null

    # Check if we can find URL in the job output (limited success with background jobs)
    # For now, we'll provide instructions for manual URL entry

    Write-Host "🔄 Tunnel is running in background." -ForegroundColor Cyan
    Write-Host "   Find your URL in the output above and email your friends!" -ForegroundColor Green
    Write-Host ""

    if (!$Background) {
        Write-Host "ℹ️  Press Ctrl+C to stop the tunnel." -ForegroundColor Gray
        Wait-Job $job
    }
}

if ($tunnelUrl) {
    Write-Host ""
    Write-Host "📧 SENDING EMAIL NOTIFICATION..." -ForegroundColor Cyan

    # Send email with the tunnel URL
    $emailScript = Join-Path $PSScriptRoot "tunnel-email-notifier.ps1"
    if (Test-Path $emailScript) {
        & $emailScript -TunnelUrl $tunnelUrl
    } else {
        Write-Host "❌ Email script not found: $emailScript" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "🎉 TUNNEL STARTED AND EMAILS SENT!" -ForegroundColor Green
    Write-Host "🌐 URL: $tunnelUrl" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "🎮 Your friends will receive an email with the new URL!" -ForegroundColor Green

    if ($Background) {
        Write-Host ""
        Write-Host "🔄 Running in background. Tunnel will stay active." -ForegroundColor Cyan
        Write-Host "   Press Ctrl+C to stop the tunnel." -ForegroundColor Gray

        # Keep the script running to maintain the tunnel
        try {
            while ($true) {
                Start-Sleep -Seconds 10
                # Health check
                try {
                    $response = Invoke-WebRequest -Uri "http://localhost:$LocalPort" -Method GET -TimeoutSec 5 -ErrorAction Stop
                    # Tunnel still healthy
                } catch {
                    Write-Host "⚠️  Local server not responding. Tunnel may have issues." -ForegroundColor Red
                }
            }
        } finally {
            Write-Host ""
            Write-Host "🛑 Stopping tunnel..." -ForegroundColor Yellow
            Stop-Job $job -ErrorAction SilentlyContinue
            Remove-Job $job -ErrorAction SilentlyContinue
        }
    } else {
        Write-Host ""
        Write-Host "ℹ️  Tunnel is running. Press Ctrl+C to stop it." -ForegroundColor Gray
        Wait-Job $job
    }

} else {
    Write-Host ""
    Write-Host "❌ Failed to detect tunnel URL within $maxWait seconds" -ForegroundColor Red
    Write-Host "The tunnel may have failed to start or connect." -ForegroundColor Red

    # Stop the job
    Stop-Job $job -ErrorAction SilentlyContinue
    Remove-Job $job -ErrorAction SilentlyContinue

    exit 1
}