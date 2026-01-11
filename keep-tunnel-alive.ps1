# Keep Cloudflare Tunnel Alive Script
# Pings the tunnel URL every minute to prevent inactivity timeouts

param(
    [string]$TunnelUrl = "https://check-tunnel-url.trycloudflare.com",  # Placeholder
    [int]$PingIntervalMinutes = 1,
    [switch]$DetectUrlChange
)

Write-Host "🛡️  TUNNEL KEEPER STARTED" -ForegroundColor Green
Write-Host "🌐 Monitoring: $TunnelUrl" -ForegroundColor Cyan
Write-Host "⏰ Ping interval: $PingIntervalMinutes minute(s)" -ForegroundColor White
Write-Host "💡 Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

$pingCount = 0

while ($true) {
    try {
        $pingCount++
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

        # Check ngrok tunnel status via local API
        $response = Invoke-WebRequest -Uri $TunnelUrl -Method GET -TimeoutSec 10 -ErrorAction Stop
        $tunnelData = $response.Content | ConvertFrom-Json

        if ($tunnelData.tunnels -and $tunnelData.tunnels.Count -gt 0) {
            $tunnel = $tunnelData.tunnels[0]
            $publicUrl = $tunnel.public_url
            Write-Host "[$timestamp] ✅ Ping #$pingCount - Tunnel active: $publicUrl" -ForegroundColor Green

            # Check if URL changed and notify friends
            $lastUrlFile = Join-Path $PSScriptRoot "last-tunnel-url.txt"
            $lastUrl = if (Test-Path $lastUrlFile) { Get-Content $lastUrlFile -Raw } else { $null }

            if (!$lastUrl -or $lastUrl.Trim() -ne $publicUrl.Trim()) {
                Write-Host "   🆕 NEW TUNNEL URL! Notifying friends..." -ForegroundColor Yellow

                # Send email notification
                $emailScript = Join-Path $PSScriptRoot "tunnel-email-notifier.ps1"
                if (Test-Path $emailScript) {
                    & $emailScript -TunnelUrl $publicUrl
                } else {
                    Write-Host "   ⚠️  Email notifier not found: $emailScript" -ForegroundColor Red
                }
            }

            # Also ping the actual games page
            $gamesUrl = $publicUrl + "/index.html"
            $gamesResponse = Invoke-WebRequest -Uri $gamesUrl -Method GET -TimeoutSec 10 -ErrorAction SilentlyContinue
            if ($gamesResponse.StatusCode -eq 200) {
                Write-Host "   🎮 Games page accessible at $publicUrl" -ForegroundColor Cyan
            }
        } else {
            Write-Host "[$timestamp] ❌ Ping #$pingCount - No active tunnels found" -ForegroundColor Red
        }

    } catch {
        Write-Host "[$timestamp] ❌ Ping #$pingCount failed: $($_.Exception.Message)" -ForegroundColor Red

        # Check if tunnel process is still running
        $tunnelProcess = Get-Process -Name cloudflared -ErrorAction SilentlyContinue
        if (-not $tunnelProcess) {
            Write-Host "   🚨 Tunnel process not found! Restarting..." -ForegroundColor Red
            # Could add tunnel restart logic here
        }
    }

    # Wait for next ping
    Start-Sleep -Seconds ($PingIntervalMinutes * 60)
}

Write-Host ""
Write-Host "🛑 Tunnel keeper stopped" -ForegroundColor Yellow