# Keep Cloudflare Tunnel Alive Script
# Pings the tunnel URL every minute to prevent inactivity timeouts

param(
    [string]$TunnelUrl = "https://persistent-organisms-ellis-incl.trycloudflare.com",
    [int]$PingIntervalMinutes = 1
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

        # Ping the tunnel URL
        $response = Invoke-WebRequest -Uri $TunnelUrl -Method GET -TimeoutSec 10 -ErrorAction Stop

        Write-Host "[$timestamp] ✅ Ping #$pingCount - Status: $($response.StatusCode)" -ForegroundColor Green

        # Also ping the main games page to be sure
        $gamesResponse = Invoke-WebRequest -Uri "$TunnelUrl/index.html" -Method GET -TimeoutSec 10 -ErrorAction SilentlyContinue
        if ($gamesResponse.StatusCode -eq 200) {
            Write-Host "   🎮 Games page accessible" -ForegroundColor Cyan
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