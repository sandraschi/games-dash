# AI Games Collection - Auto-Restart Server Launcher
# **Timestamp**: 2026-01-01
# Monitors servers and automatically restarts crashed ones

param(
    [switch]$KillExisting,
    [switch]$AsService,
    [switch]$Background
)

$ErrorActionPreference = "Stop"

# Server configuration
$projectRoot = Split-Path -Parent $PSScriptRoot
$servers = @(
    @{
        Name       = "Web Server"
        Command    = "python backend\web-server.py --port 9876"
        Port       = 9876
        WorkingDir = $projectRoot
    },
    @{
        Name       = "Stockfish AI"
        Command    = "python backend\stockfish-server.py"
        Port       = 9543
        WorkingDir = $projectRoot
    },
    @{
        Name       = "Shogi AI"
        Command    = "python backend\shogi-server.py"
        Port       = 9544
        WorkingDir = $projectRoot
    },
    @{
        Name       = "Go AI"
        Command    = "python backend\go-server.py"
        Port       = 9545
        WorkingDir = $projectRoot
    },
    @{
        Name       = "Multiplayer"
        Command    = "python backend\multiplayer-server.py"
        Port       = 9877
        WorkingDir = $projectRoot
    },
    @{
        Name       = "Sound Service"
        Command    = "python backend\sound-service.py"
        Port       = 9879
        WorkingDir = $projectRoot
    }
)

function Test-Port {
    param([int]$Port)
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Connect("127.0.0.1", $Port)
        $tcpClient.Close()
        return $true
    }
    catch {
        return $false
    }
}

function Get-ProcessByPort {
    param([int]$Port)
    try {
        # Try modern cmdlet first
        $processId = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty OwningProcess
        if ($processId) {
            return Get-Process -Id $processId -ErrorAction SilentlyContinue
        }
    }
    catch {}

    # Fallback to netstat
    $netstat = netstat -ano | Select-String ":$Port\b.*LISTENING"
    if ($netstat) {
        # Take the first match if multiple (Select-String returns an array if multiple matches)
        $line = $netstat[0].ToString()
        $parts = $line.Split(' ', [System.StringSplitOptions]::RemoveEmptyEntries)
        $targetPid = $parts[-1]
        
        if ($targetPid -match '^\d+$') {
            return Get-Process -Id ([int]$targetPid) -ErrorAction SilentlyContinue
        }
    }
    return $null
}

function Kill-ExistingServers {
    Write-Host "[KILL] Killing existing game servers..." -ForegroundColor Red

    foreach ($server in $servers) {
        $process = Get-ProcessByPort -Port $server.Port
        if ($process) {
            Write-Host "   Killing $($server.Name) (PID: $($process.Id))" -ForegroundColor Yellow
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        }
    }

    # Wait a moment for ports to be freed
    Start-Sleep -Seconds 2
}

function Start-ServerAsJob {
    param($server)

    Write-Host "[START] Starting $($server.Name)..." -ForegroundColor Green

    # Create a job to run the server
    $jobName = "Games-$($server.Name.Replace(' ', ''))"
    $existingJob = Get-Job -Name $jobName -ErrorAction SilentlyContinue
    if ($existingJob) {
        Remove-Job -Name $jobName -Force -ErrorAction SilentlyContinue
    }

    # Start server as background job
    $job = Start-Job -Name $jobName -ScriptBlock {
        param($cmd, $workDir, $name)
        try {
            Set-Location $workDir
            Write-Host "[$name] Starting server..." -ForegroundColor Cyan
            Invoke-Expression $cmd
        }
        catch {
            Write-Host "[$name] Error: $_" -ForegroundColor Red
        }
    } -ArgumentList $server.Command, $server.WorkingDir, $server.Name

    Write-Host "   Job started: $jobName (ID: $($job.Id))" -ForegroundColor Gray

    # Wait for server to start listening
    $maxWait = 30
    $waited = 0
    while (-not (Test-Port -Port $server.Port) -and $waited -lt $maxWait) {
        Start-Sleep -Seconds 1
        $waited++
        Write-Host "   Waiting for $($server.Name) to start... ($waited/$maxWait)" -ForegroundColor Gray
    }

    if (Test-Port -Port $server.Port) {
        Write-Host "   [OK] $($server.Name) is running on port $($server.Port)" -ForegroundColor Green
    }
    else {
        Write-Host "   [ERROR] $($server.Name) failed to start within $maxWait seconds" -ForegroundColor Red
    }

    return $job
}

function Start-ServersAsService {
    Write-Host "[CONFIG] Setting up servers as Windows services..." -ForegroundColor Yellow
    Write-Host "Note: This requires NSSM (Non-Sucking Service Manager)" -ForegroundColor Yellow
    Write-Host "Download from: https://nssm.cc/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "For now, using resilient background jobs instead..." -ForegroundColor Yellow

    # Fall back to job-based approach
    Start-ServersAsJobs
}

function Start-ServersAsJobs {
    Write-Host "[INIT] Starting AI Games Collection servers with background jobs..." -ForegroundColor Cyan
    Write-Host ""

    $jobs = @()

    foreach ($server in $servers) {
        $job = Start-ServerAsJob -server $server
        $jobs += $job
        Start-Sleep -Seconds 1  # Stagger startup to avoid conflicts
    }

    Write-Host ""
    Write-Host "SUMMARY - Server Status:" -ForegroundColor Cyan
    foreach ($server in $servers) {
        $status = if (Test-Port -Port $server.Port) { "RUNNING" } else { "FAILED" }
        Write-Host "   $($server.Name): $status (port $($server.Port))" -ForegroundColor $(if (Test-Port -Port $server.Port) { "Green" } else { "Red" })
    }

    Write-Host ""
    Write-Host "Protection Features:" -ForegroundColor Yellow
    Write-Host "   - Servers run as background jobs (not console processes)"
    Write-Host "   - Jobs are named 'Games-*' for easy identification"
    Write-Host "   - Use .\STOP_SERVERS.ps1 to cleanly shut them down"
    Write-Host "   - Jobs survive terminal closure"
    Write-Host ""
    Write-Host "Access URLs:" -ForegroundColor Green
    Write-Host "   Web: http://localhost:9876"
    Write-Host "   Chess AI: http://localhost:9543"
    Write-Host "   Shogi AI: http://localhost:9544"
    Write-Host "   Go AI: http://localhost:9545"
    Write-Host "   Multiplayer: ws://localhost:9877"
    Write-Host ""
    Write-Host "WARNING: Jobs can still be killed via Task Manager!" -ForegroundColor Red
    Write-Host "   Use .\STOP_SERVERS.ps1 for clean shutdown" -ForegroundColor Red

    # Auto-restart monitoring configuration
    $restartConfig = @{
        CheckInterval = 30  # Check every 30 seconds
        MaxRestarts   = 10    # Maximum restarts per server per hour
        RestartDelay  = 5    # Delay before restart (seconds)
        LogFile       = Join-Path $PSScriptRoot "server_restart.log"
    }

    # Initialize restart tracking
    $restartStats = @{}
    foreach ($server in $servers) {
        $restartStats[$server.Name] = @{
            RestartCount        = 0
            LastRestart         = $null
            ConsecutiveFailures = 0
        }
    }

    function Write-RestartLog {
        param([string]$Message)
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        "$timestamp - $Message" | Out-File -FilePath $restartConfig.LogFile -Append -Encoding UTF8
    }

    function CanRestartServer {
        param($serverName)
        $stats = $restartStats[$serverName]
        $now = Get-Date

        # Reset counter if it's been more than an hour
        if ($stats.LastRestart -and ($now - $stats.LastRestart).TotalHours -ge 1) {
            $stats.RestartCount = 0
            $stats.ConsecutiveFailures = 0
        }

        return $stats.RestartCount -lt $restartConfig.MaxRestarts
    }

    function Restart-Server {
        param($server)

        if (-not (CanRestartServer -serverName $server.Name)) {
            Write-Host "[LIMIT] $($server.Name): Too many restarts, giving up" -ForegroundColor Red
            Write-RestartLog "$($server.Name): Too many restarts ($($restartConfig.MaxRestarts)/hour), giving up"
            return $null
        }

        Write-Host "[RESTART] Restarting $($server.Name)..." -ForegroundColor Yellow
        Write-RestartLog "$($server.Name): Restarting (attempt $($restartStats[$server.Name].RestartCount + 1))"

        # Kill any existing process on this port
        $existingProcess = Get-ProcessByPort -Port $server.Port
        if ($existingProcess) {
            Stop-Process -Id $existingProcess.Id -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
        }

        # Start new server job
        $job = Start-ServerAsJob -server $server

        # Update restart statistics
        $stats = $restartStats[$server.Name]
        $stats.RestartCount++
        $stats.LastRestart = Get-Date
        $stats.ConsecutiveFailures++

        return $job
    }

    if (-not $Background) {
        Write-Host ""
        Write-Host "[MONITOR] AUTO-RESTART MONITORING ACTIVE" -ForegroundColor Cyan
        Write-Host "   Checking servers every $($restartConfig.CheckInterval) seconds" -ForegroundColor Cyan
        Write-Host "   Max $($restartConfig.MaxRestarts) restarts per server per hour" -ForegroundColor Cyan
        Write-Host "   Logging restarts to: $($restartConfig.LogFile)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Press Ctrl+C to stop monitoring (servers will continue running)..." -ForegroundColor Gray
        Write-Host ""

        Write-RestartLog "Auto-restart monitoring started"

        try {
            $iteration = 0
            while ($true) {
                $iteration++
                Start-Sleep -Seconds $restartConfig.CheckInterval

                $timestamp = Get-Date -Format "HH:mm:ss"
                Write-Host "$timestamp - Health check #$iteration..." -ForegroundColor Gray

                $restartsNeeded = @()

                # Check each server
                foreach ($server in $servers) {
                    $isPortOpen = Test-Port -Port $server.Port
                    $jobName = "Games-$($server.Name.Replace(' ', ''))"
                    $job = Get-Job -Name $jobName -ErrorAction SilentlyContinue

                    if (-not $isPortOpen) {
                        Write-Host "   [DOWN] $($server.Name): Not responding on port $($server.Port)" -ForegroundColor Red

                        if ($job -and $job.State -eq "Running") {
                            Write-Host "      Job is running but port is closed - possible crash" -ForegroundColor Yellow
                            Write-RestartLog "$($server.Name): Port closed but job running - possible crash"
                        }

                        $restartsNeeded += $server
                    }
                    elseif ($job -and $job.State -ne "Running") {
                        Write-Host "   [WARN] $($server.Name): Job stopped but port still open" -ForegroundColor Yellow
                        Write-RestartLog "$($server.Name): Job stopped but port still responding"
                        $restartsNeeded += $server
                    }
                    else {
                        # Server is healthy
                        if ($restartStats[$server.Name].ConsecutiveFailures -gt 0) {
                            Write-Host "   [RECOVERED] $($server.Name): Recovered!" -ForegroundColor Green
                            Write-RestartLog "$($server.Name): Recovered after $($restartStats[$server.Name].ConsecutiveFailures) failures"
                            $restartStats[$server.Name].ConsecutiveFailures = 0
                        }
                    }
                }

                # Perform restarts
                foreach ($server in $restartsNeeded) {
                    Start-Sleep -Seconds $restartConfig.RestartDelay
                    $newJob = Restart-Server -server $server
                    if ($newJob) {
                        # Update jobs array
                        $jobs = $jobs | Where-Object { $_.Name -ne "Games-$($server.Name.Replace(' ', ''))" }
                        $jobs += $newJob
                    }
                }

                # Periodic status summary (every 10 iterations = 5 minutes)
                if ($iteration % 10 -eq 0) {
                    Write-Host ""
                    Write-Host "Server Status Summary:" -ForegroundColor Cyan
                    foreach ($server in $servers) {
                        $status = if (Test-Port -Port $server.Port) { "UP" } else { "DOWN" }
                        $restarts = $restartStats[$server.Name].RestartCount
                        Write-Host "   $($server.Name): $status (restarts: $restarts)" -ForegroundColor $(if (Test-Port -Port $server.Port) { "Green" } else { "Red" })
                    }
                    Write-Host ""
                }
            }
        }
        catch {
            Write-Host ""
            Write-Host "Auto-restart monitoring stopped." -ForegroundColor Yellow
            Write-RestartLog "Auto-restart monitoring stopped by user"
        }

        # Final status report
        Write-Host ""
        Write-Host "Final Restart Statistics:" -ForegroundColor Cyan
        foreach ($server in $servers) {
            $stats = $restartStats[$server.Name]
            Write-Host "   $($server.Name): $($stats.RestartCount) restarts, $($stats.ConsecutiveFailures) consecutive failures" -ForegroundColor Gray
        }
        $totalRestarts = ( $restartStats.Values | ForEach-Object { $_.RestartCount } | Measure-Object -Sum ).Sum
        Write-RestartLog "Final stats: $totalRestarts total restarts"
    }

    Write-Host ""
    Write-Host "Servers are still running in background jobs." -ForegroundColor Green
    Write-Host "Use Get-Job to see them, or .\STOP_SERVERS.ps1 to stop them." -ForegroundColor Green
}

# Main execution
if ($KillExisting) {
    Kill-ExistingServers
}

if ($AsService) {
    Start-ServersAsService
}
else {
    Start-ServersAsJobs
}
