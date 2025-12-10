# Start All Games Servers as Background Jobs
# **Timestamp**: 2025-12-02
# Use this if Cursor IDE terminal is broken - run in your own PowerShell window

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  🏆 STARTING ALL GAMES SERVERS (Background Jobs)" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "Working Directory: $scriptPath" -ForegroundColor Yellow
Write-Host ""

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    $result = netstat -ano | Select-String ":$Port.*LISTENING"
    return $null -ne $result
}

# Function to kill process on port
function Stop-Port {
    param([int]$Port)
    $existing = netstat -ano | Select-String ":$Port.*LISTENING"
    if ($existing) {
        $parts = $existing.ToString().Split() | Where-Object { $_ -match '^\d+$' }
        if ($parts) {
            $processId = $parts[-1]
            try {
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                Start-Sleep -Milliseconds 500
                return $true
            } catch {
                return $false
            }
        }
    }
    return $false
}

# Clean up existing jobs
Write-Host "🧹 Cleaning up existing jobs..." -ForegroundColor Yellow
Get-Job | Remove-Job -Force -ErrorAction SilentlyContinue

# Kill existing processes on ports
Write-Host "🧹 Cleaning up existing servers on ports..." -ForegroundColor Yellow
$ports = @(9543, 9544, 9545, 9876, 9877, 9878)
foreach ($port in $ports) {
    if (Test-Port -Port $port) {
        Write-Host "  Stopping process on port $port..." -ForegroundColor Gray
        Stop-Port -Port $port | Out-Null
    }
}
Start-Sleep -Seconds 1

Write-Host ""

# Start all servers as background jobs
Write-Host "🚀 Starting servers as background jobs..." -ForegroundColor Cyan
Write-Host ""

$servers = @(
    @{Name="Stockfish AI"; Script="stockfish-server.py"; Port=9543},
    @{Name="Shogi AI"; Script="shogi-server.py"; Port=9544},
    @{Name="Go AI"; Script="go-server.py"; Port=9545},
    @{Name="Web Server"; Script="web-server.py"; Port=9876},
    @{Name="Multiplayer Server"; Script="multiplayer-server.py"; Port=9877}
)

$jobs = @()

foreach ($server in $servers) {
    Write-Host "  Starting $($server.Name) (port $($server.Port))..." -ForegroundColor Cyan
    
    $job = Start-Job -ScriptBlock {
        param($scriptPath, $script, $port)
        Set-Location $scriptPath
        python $script
    } -ArgumentList $scriptPath, $server.Script, $server.Port -Name $server.Name
    
    $jobs += $job
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "⏳ Waiting for servers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "📊 Checking server status..." -ForegroundColor Cyan
Write-Host ""

$allRunning = $true
foreach ($server in $servers) {
    if (Test-Port -Port $server.Port) {
        Write-Host "  ✅ $($server.Name) - Port $($server.Port) - RUNNING" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($server.Name) - Port $($server.Port) - NOT RUNNING" -ForegroundColor Red
        $allRunning = $false
        
        # Check job status
        $job = Get-Job -Name $server.Name -ErrorAction SilentlyContinue
        if ($job) {
            $jobOutput = Receive-Job -Job $job -ErrorAction SilentlyContinue
            if ($jobOutput) {
                Write-Host "    Job output: $($jobOutput -join ' ')" -ForegroundColor Yellow
            }
            if ($job.State -eq "Failed") {
                Write-Host "    Job failed! Check errors above." -ForegroundColor Red
            }
        }
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green

if ($allRunning) {
    Write-Host "✅ ALL SERVERS STARTED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎮 AI Backend Servers:" -ForegroundColor Yellow
    Write-Host "  ♟️  Stockfish: http://localhost:9543/api/status" -ForegroundColor White
    Write-Host "  🎌 Shogi:     http://localhost:9544/api/status" -ForegroundColor White
    Write-Host "  ⚫ Go:        http://localhost:9545/api/status" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 Frontend:" -ForegroundColor Yellow
    Write-Host "  Games:       http://localhost:9876" -ForegroundColor White
    Write-Host ""
    Write-Host "👥 Multiplayer:" -ForegroundColor Yellow
    Write-Host "  WebSocket:   ws://localhost:9877" -ForegroundColor White
    Write-Host ""
    
    Write-Host "Opening browser..." -ForegroundColor Cyan
    Start-Sleep -Seconds 1
    Start-Process "http://localhost:9876"
    
    Write-Host ""
    Write-Host "🎮 Ready to play!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "⚠️  SOME SERVERS FAILED TO START" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Check job status with:" -ForegroundColor Yellow
    Write-Host "  Get-Job | Format-Table" -ForegroundColor Gray
    Write-Host ""
    Write-Host "View job output with:" -ForegroundColor Yellow
    Write-Host "  Get-Job | Receive-Job" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Stop all jobs with:" -ForegroundColor Yellow
    Write-Host "  Get-Job | Stop-Job; Get-Job | Remove-Job" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📝 Useful commands:" -ForegroundColor Cyan
Write-Host "  Get-Job                    # View all background jobs" -ForegroundColor Gray
Write-Host "  Get-Job | Receive-Job      # View job output" -ForegroundColor Gray
Write-Host "  Get-Job | Stop-Job         # Stop all jobs" -ForegroundColor Gray
Write-Host "  Get-Job | Remove-Job       # Remove all jobs" -ForegroundColor Gray
Write-Host "  netstat -ano | Select-String ':(9543|9544|9545|9876|9877)'  # Check ports" -ForegroundColor Gray
Write-Host ""
