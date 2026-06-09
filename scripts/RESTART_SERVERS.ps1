# Games App - Server Restart Utility
# **Timestamp**: 2025-12-20
# Restart individual servers or all servers

param(
    [string]$Server,  # Specific server to restart
    [switch]$All,     # Restart all servers
    [switch]$Force    # Force kill existing processes
)

$ErrorActionPreference = "Stop"

# Server configuration
$servers = @(
    @{ Name = "Web Server"; Command = "python web-server.py"; Port = 9876 },
    @{ Name = "Stockfish AI"; Command = "python stockfish-server.py"; Port = 9543 },
    @{ Name = "Shogi AI"; Command = "python shogi-server.py"; Port = 9544 },
    @{ Name = "Go AI"; Command = "python go-server.py"; Port = 9545 },
    @{ Name = "Multiplayer"; Command = "python multiplayer-server.py"; Port = 9877 }
)

function Test-Port {
    param([int]$Port)
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Connect("127.0.0.1", $Port)
        $tcpClient.Close()
        return $true
    } catch {
        return $false
    }
}

function Get-ProcessByPort {
    param([int]$Port)
    $netstat = netstat -ano | Select-String ":$Port\s.*LISTENING"
    if ($netstat) {
        $parts = $netstat.ToString().Split(' ', [System.StringSplitOptions]::RemoveEmptyEntries)
        $targetPid = $parts[-1]
        return Get-Process -Id $targetPid -ErrorAction SilentlyContinue
    }
    return $null
}

function Stop-Server {
    param($server)

    Write-Host "🛑 Stopping $($server.Name)..." -ForegroundColor Yellow

    # Kill process by port
    $process = Get-ProcessByPort -Port $server.Port
    if ($process) {
        Write-Host "   Killing process (PID: $($process.Id))" -ForegroundColor Gray
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
    }

    # Kill background job
    $jobName = "Games-$($server.Name.Replace(' ', ''))"
    $job = Get-Job -Name $jobName -ErrorAction SilentlyContinue
    if ($job) {
        Write-Host "   Removing job: $jobName" -ForegroundColor Gray
        Remove-Job -Name $jobName -Force -ErrorAction SilentlyContinue
    }

    # Wait for port to be freed
    $waited = 0
    while ((Test-Port -Port $server.Port) -and $waited -lt 10) {
        Start-Sleep -Seconds 1
        $waited++
    }

    if (Test-Port -Port $server.Port) {
        Write-Host "   ⚠️  Port $($server.Port) still in use" -ForegroundColor Yellow
        return $false
    } else {
        Write-Host "   ✅ Port $($server.Port) freed" -ForegroundColor Green
        return $true
    }
}

function Start-Server {
    param($server)

    Write-Host "🚀 Starting $($server.Name)..." -ForegroundColor Green

    # Start as background job
    $jobName = "Games-$($server.Name.Replace(' ', ''))"
    $job = Start-Job -Name $jobName -ScriptBlock {
        param($cmd, $workDir, $name)
        try {
            Set-Location $workDir
            Write-Host "[$name] Starting..." -ForegroundColor Cyan
            Invoke-Expression $cmd
        } catch {
            Write-Host "[$name] Error: $_" -ForegroundColor Red
        }
    } -ArgumentList $server.Command, $PSScriptRoot, $server.Name

    Write-Host "   Job: $jobName (ID: $($job.Id))" -ForegroundColor Gray

    # Wait for server to start
    $maxWait = 15
    $waited = 0
    while (-not (Test-Port -Port $server.Port) -and $waited -lt $maxWait) {
        Start-Sleep -Seconds 1
        $waited++
    }

    if (Test-Port -Port $server.Port) {
        Write-Host "   ✅ $($server.Name) running on port $($server.Port)" -ForegroundColor Green
        return $true
    } else {
        Write-Host "   ❌ $($server.Name) failed to start" -ForegroundColor Red
        Write-Host "   Job state: $($job.State)" -ForegroundColor Red
        return $false
    }
}

function Restart-Server {
    param($server)

    Write-Host ""
    Write-Host "🔄 RESTARTING: $($server.Name)" -ForegroundColor Cyan
    Write-Host "=" * 40 -ForegroundColor Cyan

    # Stop server
    $stopped = Stop-Server -server $server
    if (-not $stopped -and -not $Force) {
        Write-Host "   ⚠️  Could not stop cleanly. Use -Force to force kill." -ForegroundColor Yellow
        return $false
    }

    # Start server
    $started = Start-Server -server $server

    if ($started) {
        Write-Host "   🎉 $($server.Name) restarted successfully!" -ForegroundColor Green
        return $true
    } else {
        Write-Host "   💥 $($server.Name) restart failed!" -ForegroundColor Red
        return $false
    }
}

# Main execution
if (-not $Server -and -not $All) {
    Write-Host "🔄 Games App Server Restart Utility" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\RESTART_SERVERS.ps1 -All                    # Restart all servers" -ForegroundColor White
    Write-Host "  .\RESTART_SERVERS.ps1 -Server 'Web Server'    # Restart specific server" -ForegroundColor White
    Write-Host "  .\RESTART_SERVERS.ps1 -Server 'Stockfish AI'  # Restart Stockfish" -ForegroundColor White
    Write-Host ""
    Write-Host "Available servers:" -ForegroundColor Green
    foreach ($server in $servers) {
        Write-Host "  • $($server.Name)" -ForegroundColor Gray
    }
    exit 0
}

$restartList = @()

if ($All) {
    $restartList = $servers
    Write-Host "🔄 Restarting ALL servers..." -ForegroundColor Cyan
} elseif ($Server) {
    $foundServer = $servers | Where-Object { $_.Name -eq $Server }
    if (-not $foundServer) {
        Write-Host "❌ Server '$Server' not found. Available servers:" -ForegroundColor Red
        foreach ($server in $servers) {
            Write-Host "  • $($server.Name)" -ForegroundColor Gray
        }
        exit 1
    }
    $restartList = @($foundServer)
    Write-Host "🔄 Restarting server: $($foundServer.Name)" -ForegroundColor Cyan
} else {
    Write-Host "❌ Specify -All or -Server parameter" -ForegroundColor Red
    exit 1
}

$results = @()

foreach ($server in $restartList) {
    $success = Restart-Server -server $server
    $results += @{ Server = $server.Name; Success = $success }
    Start-Sleep -Seconds 2  # Stagger restarts
}

Write-Host ""
Write-Host "📊 RESTART RESULTS:" -ForegroundColor Cyan
Write-Host "=" * 30 -ForegroundColor Cyan

$successCount = 0
foreach ($result in $results) {
    $status = if ($result.Success) { "✅ SUCCESS" } else { "❌ FAILED" }
    $color = if ($result.Success) { "Green" } else { "Red" }
    Write-Host "   $($result.Server): $status" -ForegroundColor $color
    if ($result.Success) { $successCount++ }
}

Write-Host ""
Write-Host "Summary: $successCount/$($results.Count) servers restarted successfully" -ForegroundColor $(if ($successCount -eq $results.Count) { "Green" } else { "Yellow" })

if ($successCount -lt $results.Count) {
    Write-Host ""
    Write-Host "💡 Tips:" -ForegroundColor Yellow
    Write-Host "  • Check server logs for error details" -ForegroundColor Gray
    Write-Host "  • Use CHECK_SERVERS.ps1 to verify status" -ForegroundColor Gray
    Write-Host "  • Try START_SERVERS_RESILIENT.ps1 for full restart" -ForegroundColor Gray
}
