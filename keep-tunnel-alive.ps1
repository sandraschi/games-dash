# Keep Cloudflare Tunnel Alive Script
# Pings the tunnel URL every minute to prevent inactivity timeouts

param(
    [string]$TunnelUrl = "http://localhost:4040/api/tunnels",  # Ngrok local API
    [int]$PingIntervalMinutes = 1,
    [int]$LocalPort = 9876
)

Write-Host "🛡️  TUNNEL KEEPER STARTED" -ForegroundColor Green
Write-Host "🌐 Monitoring: $TunnelUrl" -ForegroundColor Cyan
Write-Host "⏰ Ping interval: $PingIntervalMinutes minute(s)" -ForegroundColor White
Write-Host "💡 Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

$pingCount = 0
$currentTunnelUrl = $null
$urlFile = Join-Path $PSScriptRoot "current-tunnel-url.txt"

# Load saved URL if it exists
if (Test-Path $urlFile) {
    $currentTunnelUrl = Get-Content $urlFile -Raw
    Write-Host "📁 Loaded saved URL: $currentTunnelUrl" -ForegroundColor Gray
}

Write-Host "🛡️  CLOUDFLARE TUNNEL KEEPER STARTED" -ForegroundColor Green
Write-Host "Monitoring free tunnel with automatic email notifications..." -ForegroundColor White
Write-Host ""

while ($true) {
    try {
        $pingCount++
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

        # Check if cloudflared process is running
        $tunnelProcess = Get-Process -Name cloudflared -ErrorAction SilentlyContinue

        if (-not $tunnelProcess) {
            Write-Host "[$timestamp] 🚨 CRITICAL: cloudflared process not found!" -ForegroundColor Red
            Write-Host "   Free tunnel has stopped. Will detect when restarted." -ForegroundColor Yellow

            # Clear current URL since tunnel is down
            $currentTunnelUrl = $null
            if (Test-Path $urlFile) { Remove-Item $urlFile }

            # Wait longer before next check when tunnel is down
            Start-Sleep -Seconds (2 * 60)  # Wait 2 minutes
            continue
        }

        # If we have a URL to monitor, ping it
        if ($currentTunnelUrl) {
            try {
                $response = Invoke-WebRequest -Uri $currentTunnelUrl -Method GET -TimeoutSec 15 -ErrorAction Stop

                # Any response means tunnel is working (even errors from backend)
                Write-Host "[$timestamp] ✅ Ping #$pingCount - Tunnel responding: $currentTunnelUrl" -ForegroundColor Green

                # Check if webserver is responding
                try {
                    $localResponse = Invoke-WebRequest -Uri "http://localhost:$LocalPort" -Method GET -TimeoutSec 5 -ErrorAction Stop
                    Write-Host "   🌐 Webserver OK (port $LocalPort)" -ForegroundColor Cyan
                } catch {
                    Write-Host "   ⚠️  Webserver down (port $LocalPort) - tunnel still works" -ForegroundColor Yellow
                }

            } catch {
                Write-Host "[$timestamp] ❌ Ping #$pingCount failed: $($_.Exception.Message)" -ForegroundColor Red
                Write-Host "   Tunnel URL not responding. May have changed or tunnel crashed." -ForegroundColor Yellow

                # Clear the URL since it's not working
                $currentTunnelUrl = $null
                if (Test-Path $urlFile) { Remove-Item $urlFile }
            }
        } else {
            # No URL to monitor - wait for user to set one via email notifier
            Write-Host "[$timestamp] ⏳ Waiting for tunnel URL to be set..." -ForegroundColor Gray
            Write-Host "   Use: .\tunnel-email-notifier.ps1 -TunnelUrl 'YOUR_URL'" -ForegroundColor Cyan
        }

        # Show process info occasionally
        if ($pingCount % 10 -eq 0) {  # Every 10 pings
            $process = Get-Process -Name cloudflared -ErrorAction SilentlyContinue
            if ($process) {
                $uptime = (Get-Date) - $process.StartTime
                Write-Host "   📊 Process status: PID $($process.Id), Uptime: $($uptime.TotalMinutes.ToString('F1')) minutes" -ForegroundColor Gray
                if ($currentTunnelUrl) {
                    Write-Host "   🔗 Monitoring URL: $currentTunnelUrl" -ForegroundColor Gray
                }
            }
        }

    } catch {
        Write-Host "[$timestamp] 💥 Unexpected error in tunnel keeper: $($_.Exception.Message)" -ForegroundColor Red
    }

    # Wait for next ping
    Start-Sleep -Seconds ($PingIntervalMinutes * 60)
}

Write-Host ""
Write-Host "🛑 Tunnel keeper stopped" -ForegroundColor Yellow