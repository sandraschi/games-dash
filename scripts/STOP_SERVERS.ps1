# AI Games Collection - Server Stopper
# **Timestamp**: 2025-12-13
# Cleanly stops all game servers

$ErrorActionPreference = "Stop"

function Stop-ServerJobs {
    Write-Host "🛑 Stopping AI Games Collection servers..." -ForegroundColor Red

    # Stop background jobs
    $jobs = Get-Job -Name "Games-*" -ErrorAction SilentlyContinue
    if ($jobs) {
        foreach ($job in $jobs) {
            Write-Host "   Stopping job: $($job.Name)" -ForegroundColor Yellow
            Stop-Job -Name $job.Name -ErrorAction SilentlyContinue
            Remove-Job -Name $job.Name -ErrorAction SilentlyContinue
        }
    }

    # Kill processes by port
    $ports = @(9876, 9543, 9544, 9545, 9877)
    foreach ($port in $ports) {
        $process = Get-ProcessByPort -Port $port
        if ($process) {
            Write-Host "   Killing process on port $port (PID: $($process.Id))" -ForegroundColor Yellow
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        }
    }

    Write-Host "✅ All servers stopped" -ForegroundColor Green
}

function Get-ProcessByPort {
    param([int]$Port)
    try {
        $netstat = netstat -ano | Select-String ":$Port\s.*LISTENING" | Select-Object -First 1
        if ($netstat) {
            $parts = $netstat.ToString().Split(' ', [System.StringSplitOptions]::RemoveEmptyEntries)
            $targetPid = $parts[-1]
            return Get-Process -Id $targetPid -ErrorAction SilentlyContinue
        }
    } catch {
        # Ignore errors
    }
    return $null
}

# Main execution
Stop-ServerJobs

# Clean up any Docker containers too
Write-Host "🧹 Cleaning up Docker containers..." -ForegroundColor Gray
try {
    & docker compose down --remove-orphans 2>$null
    Write-Host "   Docker containers cleaned up" -ForegroundColor Gray
} catch {
    # Docker might not be running, ignore
}

Write-Host ""
Write-Host "🎮 AI Games Collection servers have been stopped." -ForegroundColor Green
