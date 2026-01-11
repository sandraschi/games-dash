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

Write-Host "🛡️  NGROK TUNNEL KEEPER STARTED" -ForegroundColor Green
Write-Host "Monitoring tunnel health with persistent URL..." -ForegroundColor White
Write-Host ""

while ($true) {
    try {
        $pingCount++
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

        # Check ngrok tunnel status via local API
        try {
            $response = Invoke-WebRequest -Uri $TunnelUrl -Method GET -TimeoutSec 10 -ErrorAction Stop
            $tunnelData = $response.Content | ConvertFrom-Json

            if ($tunnelData.tunnels -and $tunnelData.tunnels.Count -gt 0) {
                $tunnel = $tunnelData.tunnels[0]
                $publicUrl = $tunnel.public_url

                # Check if URL changed (should be rare with ngrok)
                if (!$currentTunnelUrl) {
                    $currentTunnelUrl = $publicUrl
                    Write-Host "[$timestamp] 🎯 Tunnel established: $publicUrl" -ForegroundColor Green

                    # Send initial email notification
                    $emailScript = Join-Path $PSScriptRoot "tunnel-email-notifier.ps1"
                    if (Test-Path $emailScript) {
                        & $emailScript -TunnelUrl $publicUrl
                    }
                } elseif ($currentTunnelUrl -ne $publicUrl) {
                    Write-Host "[$timestamp] 🆕 URL CHANGED! Old: $currentTunnelUrl" -ForegroundColor Yellow
                    Write-Host "[$timestamp] 🆕 URL CHANGED! New: $publicUrl" -ForegroundColor Yellow
                    $currentTunnelUrl = $publicUrl

                    # Send email notification for URL change
                    $emailScript = Join-Path $PSScriptRoot "tunnel-email-notifier.ps1"
                    if (Test-Path $emailScript) {
                        & $emailScript -TunnelUrl $publicUrl
                    }
                } else {
                    Write-Host "[$timestamp] ✅ Ping #$pingCount - Tunnel stable: $publicUrl" -ForegroundColor Green
                }

                # Check if webserver is responding
                try {
                    $localResponse = Invoke-WebRequest -Uri "http://localhost:$LocalPort" -Method GET -TimeoutSec 5 -ErrorAction Stop
                    Write-Host "   🌐 Webserver OK (port $LocalPort)" -ForegroundColor Cyan
                } catch {
                    Write-Host "   ⚠️  Webserver down (port $LocalPort)" -ForegroundColor Yellow
                }

            } else {
                Write-Host "[$timestamp] ❌ Ping #$pingCount - No active tunnels found" -ForegroundColor Red
            }

        } catch {
            Write-Host "[$timestamp] ❌ Ping #$pingCount failed: $($_.Exception.Message)" -ForegroundColor Red

            # Check if ngrok process is still running
            $ngrokProcess = Get-Process -Name ngrok -ErrorAction SilentlyContinue
            if (-not $ngrokProcess) {
                Write-Host "   🚨 CRITICAL: ngrok process not found!" -ForegroundColor Red
                Write-Host "   Ngrok tunnel has crashed. URL will persist on restart." -ForegroundColor Yellow

                # For ngrok, we don't auto-restart - let user do it manually
                # This preserves the URL and avoids URL churn
                Write-Host "   Manual restart recommended to restore tunnel." -ForegroundColor Cyan

                # Wait longer before next check
                Start-Sleep -Seconds (5 * 60)  # Wait 5 minutes
                continue
            } else {
                Write-Host "   ⚠️  Ngrok process running but API unreachable" -ForegroundColor Yellow
            }
        }

        # Show process info occasionally
        if ($pingCount % 10 -eq 0) {  # Every 10 pings
            $process = Get-Process -Name ngrok -ErrorAction SilentlyContinue
            if ($process) {
                $uptime = (Get-Date) - $process.StartTime
                Write-Host "   📊 Process status: PID $($process.Id), Uptime: $($uptime.TotalMinutes.ToString('F1')) minutes" -ForegroundColor Gray
                if ($currentTunnelUrl) {
                    Write-Host "   🔗 Current URL: $currentTunnelUrl" -ForegroundColor Gray
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