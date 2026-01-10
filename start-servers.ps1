# Games Server Manager - Proper Process Management
param(
    [switch]$Stop,
    [switch]$Status,
    [switch]$Restart
)

$serverConfig = @(
    @{Name="Web Server"; Command="python backend/web-server.py"; Port=9876; ProcessName="python"},
    @{Name="Stockfish AI"; Command="python backend/simple-stockfish-server.py"; Port=10001; ProcessName="python"},
    @{Name="KataGo AI"; Command="python backend/simple-go-server.py"; Port=10002; ProcessName="python"},
    @{Name="YaneuraOu AI"; Command="python backend/simple-shogi-server.py"; Port=10003; ProcessName="python"}
)

function Test-Port {
    param([int]$Port)
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.Connect("127.0.0.1", $Port)
        $tcp.Close()
        return $true
    } catch {
        return $false
    }
}

function Kill-ServerProcesses {
    Write-Host "Cleaning up existing server processes..." -ForegroundColor Yellow

    # Kill by process name - specifically games-app related
    Get-Process python -ErrorAction SilentlyContinue | Where-Object {
        $_.Path -like "*games-app*" -or $_.CommandLine -like "*games-app*"
    } | Stop-Process -Force -ErrorAction SilentlyContinue

    # Kill by port usage for our specific ports
    foreach ($server in $serverConfig) {
        $port = $server.Port
        try {
            $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
            foreach ($conn in $connections) {
                if ($conn.State -eq "Listen") {
                    Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
                    Write-Host "   Killed process using port $port" -ForegroundColor Yellow
                }
            }
        } catch {
            # Ignore errors
        }
    }

    Start-Sleep -Seconds 2
}

function Start-Server {
    param([hashtable]$Server)

    Write-Host "Starting $($Server.Name)..." -ForegroundColor Green

    # Start as background job with proper working directory
    $job = Start-Job -ScriptBlock {
        param($cmd, $workDir)
        Set-Location $workDir
        Invoke-Expression $cmd
    } -ArgumentList $Server.Command, (Get-Location)

    # Wait for startup and test port
    $maxWait = 15
    $waited = 0
    $started = $false

    while ($waited -lt $maxWait -and -not $started) {
        Start-Sleep -Seconds 2
        $waited += 2

        if (Test-Port $Server.Port) {
            $started = $true
            Write-Host "   [OK] $($Server.Name) ready on port $($Server.Port)" -ForegroundColor Green
        }
    }

    if ($started) {
        return @{Server=$Server; Job=$job; Status="Running"}
    } else {
        Write-Host "   [FAIL] $($Server.Name) failed to start" -ForegroundColor Red
        Stop-Job $job -ErrorAction SilentlyContinue
        Remove-Job $job -ErrorAction SilentlyContinue
        return @{Server=$Server; Job=$null; Status="Failed"}
    }
}

function Show-Status {
    Write-Host "Server Status:" -ForegroundColor Cyan
    Write-Host "─" * 50

    foreach ($server in $serverConfig) {
        $status = if (Test-Port $server.Port) { "Running" } else { "Stopped" }
        Write-Host ("{0,-15} Port {1,-5} {2}" -f $server.Name, $server.Port, $status)
    }
}

# Main logic
if ($Stop) {
    Write-Host "Stopping all servers..." -ForegroundColor Red
    Kill-ServerProcesses
    Write-Host "All servers stopped" -ForegroundColor Green
    exit
}

if ($Status) {
    Show-Status
    exit
}

if ($Restart) {
    Write-Host "Restarting all servers..." -ForegroundColor Yellow
    Kill-ServerProcesses
}

Write-Host "Starting Games Server Suite" -ForegroundColor Cyan
Write-Host "=" * 50

# Always clean up first
Kill-ServerProcesses

# Start all servers
$runningServers = @()

foreach ($server in $serverConfig) {
    $result = Start-Server $server
    if ($result.Status -eq "Running") {
        $runningServers += $result
    }
}

Write-Host "`n" + "=" * 50 -ForegroundColor Cyan
Write-Host "Startup Complete!" -ForegroundColor Green

if ($runningServers.Count -gt 0) {
    Write-Host "`nRunning Servers:" -ForegroundColor Green
    foreach ($server in $runningServers) {
        Write-Host "   - $($server.Server.Name): http://localhost:$($server.Server.Port)"
    }
    Write-Host "`nGames ready at: http://localhost:9876" -ForegroundColor Cyan
} else {
    Write-Host "`nNo servers started successfully" -ForegroundColor Red
    Write-Host "Check server logs and try again" -ForegroundColor Yellow
}

Write-Host "`nCommands:"
Write-Host "   .\start-servers.ps1 -Status    # Check status"
Write-Host "   .\start-servers.ps1 -Stop      # Stop all servers"
Write-Host "   .\start-servers.ps1 -Restart   # Restart all servers"