# Keep Cloudflare Tunnel Alive Script
# Pings the tunnel URL every minute to prevent inactivity timeouts

param(
    [string]$TunnelUrl = "https://check-tunnel-url.trycloudflare.com",  # Placeholder - will be auto-detected
    [int]$PingIntervalMinutes = 1,
    [int]$LocalPort = 9876
)

Write-Host "🛡️  TUNNEL KEEPER STARTED" -ForegroundColor Green
Write-Host "🌐 Monitoring: $TunnelUrl" -ForegroundColor Cyan
Write-Host "⏰ Ping interval: $PingIntervalMinutes minute(s)" -ForegroundColor White
Write-Host "💡 Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

$pingCount = 0
$consecutiveFailures = 0
$maxConsecutiveFailures = 3

Write-Host "🛡️  CLOUDFLARE TUNNEL KEEPER STARTED" -ForegroundColor Green
Write-Host "Monitoring tunnel health and keeping it alive..." -ForegroundColor White
Write-Host ""

while ($true) {
    try {
        $pingCount++
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

        # Check if cloudflared process is running
        $tunnelProcess = Get-Process -Name cloudflared -ErrorAction SilentlyContinue

        if (-not $tunnelProcess) {
            Write-Host "[$timestamp] 🚨 CRITICAL: cloudflared process not found!" -ForegroundColor Red
            Write-Host "   Attempting to restart tunnel..." -ForegroundColor Yellow

            # Try to restart the tunnel
            try {
                $restartJob = Start-Job -ScriptBlock {
                    param($port)
                    Set-Location $using:PSScriptRoot
                    .\cloudflared.exe tunnel --url "http://localhost:$port" 2>&1
                } -ArgumentList $LocalPort

                Start-Sleep -Seconds 3

                # Check if restart worked
                $newProcess = Get-Process -Name cloudflared -ErrorAction SilentlyContinue
                if ($newProcess) {
                    Write-Host "   ✅ Tunnel restarted successfully (PID: $($newProcess.Id))" -ForegroundColor Green
                    $consecutiveFailures = 0

                    # Wait a bit for tunnel to establish
                    Start-Sleep -Seconds 5
                } else {
                    Write-Host "   ❌ Tunnel restart failed" -ForegroundColor Red
                    $consecutiveFailures++
                }

                # Clean up the job
                Stop-Job $restartJob -ErrorAction SilentlyContinue
                Remove-Job $restartJob -ErrorAction SilentlyContinue

            } catch {
                Write-Host "   ❌ Error restarting tunnel: $($_.Exception.Message)" -ForegroundColor Red
                $consecutiveFailures++
            }

            # Skip ping check this round since we just restarted
            Start-Sleep -Seconds ($PingIntervalMinutes * 60)
            continue
        }

        # Ping the tunnel URL to keep it active
        # Note: Even if webserver is down, tunnel should respond (with error, but tunnel stays alive)
        try {
            $response = Invoke-WebRequest -Uri $TunnelUrl -Method GET -TimeoutSec 15 -ErrorAction Stop

            # Any response means tunnel is alive (even 502/503/404 from backend)
            Write-Host "[$timestamp] ✅ Ping #$pingCount - Tunnel alive (HTTP $($response.StatusCode))" -ForegroundColor Green
            $consecutiveFailures = 0

            # Check if webserver is responding (optional - doesn't affect tunnel stability)
            $webserverUp = $false
            try {
                $localResponse = Invoke-WebRequest -Uri "http://localhost:$LocalPort" -Method GET -TimeoutSec 5 -ErrorAction Stop
                $webserverUp = $true
                Write-Host "   🌐 Webserver OK (port $LocalPort)" -ForegroundColor Cyan
            } catch {
                Write-Host "   ⚠️  Webserver down (port $LocalPort) - but tunnel remains stable" -ForegroundColor Yellow
            }

        } catch {
            Write-Host "[$timestamp] ❌ Ping #$pingCount failed: $($_.Exception.Message)" -ForegroundColor Red
            $consecutiveFailures++

            # If tunnel URL is completely unreachable, it might be down
            if ($consecutiveFailures -ge $maxConsecutiveFailures) {
                Write-Host "   🚨 $maxConsecutiveFailures consecutive failures - tunnel may be down" -ForegroundColor Red
                Write-Host "   Killing existing process to force restart..." -ForegroundColor Yellow

                # Force kill and restart
                Stop-Process -Name cloudflared -Force -ErrorAction SilentlyContinue
                Start-Sleep -Seconds 2
                $consecutiveFailures = 0
            }
        }

        # Show process info occasionally
        if ($pingCount % 10 -eq 0) {  # Every 10 pings
            $process = Get-Process -Name cloudflared -ErrorAction SilentlyContinue
            if ($process) {
                $uptime = (Get-Date) - $process.StartTime
                Write-Host "   📊 Process status: PID $($process.Id), Uptime: $($uptime.TotalMinutes.ToString('F1')) minutes" -ForegroundColor Gray
            }
        }

    } catch {
        Write-Host "[$timestamp] 💥 Unexpected error in tunnel keeper: $($_.Exception.Message)" -ForegroundColor Red
        $consecutiveFailures++
    }

    # Wait for next ping
    Start-Sleep -Seconds ($PingIntervalMinutes * 60)
}

Write-Host ""
Write-Host "🛑 Tunnel keeper stopped" -ForegroundColor Yellow