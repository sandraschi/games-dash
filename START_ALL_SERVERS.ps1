# Start All Games Servers with Error Handling
# **Timestamp**: 2025-12-04
# Starts all necessary services: AI backends, web server, and multiplayer server

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  🏆 STARTING ALL GAMES SERVERS" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

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

# Function to start server with error handling
function Start-Server {
    param(
        [string]$Name,
        [string]$Script,
        [int]$Port,
        [int]$Delay = 2
    )
    
    Write-Host "🔄 Starting $Name (port $Port)..." -ForegroundColor Cyan
    
    # Check if port is in use
    if (Test-Port -Port $Port) {
        Write-Host "  ⚠️  Port $Port is in use, stopping existing process..." -ForegroundColor Yellow
        Stop-Port -Port $Port
        Start-Sleep -Seconds 1
    }
    
    # Check if script exists
    $scriptFile = Join-Path $scriptPath $Script
    if (-not (Test-Path $scriptFile)) {
        Write-Host "  ❌ Script not found: $Script" -ForegroundColor Red
        return $false
    }
    
    try {
        $process = Start-Process pwsh -ArgumentList @(
            "-NoExit",
            "-Command",
            "cd '$scriptPath'; python '$Script'"
        ) -PassThru -WindowStyle Normal
        
        if ($process) {
            Write-Host "  ✅ $Name started (PID: $($process.Id))" -ForegroundColor Green
            
            # Wait a bit and verify it's actually running
            Start-Sleep -Seconds $Delay
            if (Test-Port -Port $Port) {
                Write-Host "  ✅ $Name confirmed running on port $Port" -ForegroundColor Green
                return $true
            } else {
                Write-Host "  ⚠️  $Name started but port $Port not yet listening..." -ForegroundColor Yellow
                return $true  # Give it benefit of the doubt
            }
        } else {
            Write-Host "  ❌ Failed to start $Name" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "  ❌ ERROR starting $Name : $_" -ForegroundColor Red
        return $false
    }
}

# Create logs directory
$logsDir = Join-Path $scriptPath "logs"
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
}

# Kill existing processes on ports
Write-Host "🧹 Cleaning up existing servers..." -ForegroundColor Yellow
$ports = @(9543, 9544, 9545, 9876, 9877)
foreach ($port in $ports) {
    if (Test-Port -Port $port) {
        Write-Host "  Stopping process on port $port..." -ForegroundColor Gray
        Stop-Port -Port $port | Out-Null
    }
}
Start-Sleep -Seconds 1

Write-Host ""

# Start all servers
$servers = @(
    @{Name="Stockfish AI"; Script="stockfish-server.py"; Port=9543; Required=$true},
    @{Name="Shogi AI"; Script="shogi-server.py"; Port=9544; Required=$true},
    @{Name="Go AI"; Script="go-server.py"; Port=9545; Required=$true},
    @{Name="Web Server"; Script="web-server.py"; Port=9876; Required=$true},
    @{Name="Multiplayer Server"; Script="multiplayer-server.py"; Port=9877; Required=$false}
)

$allStarted = $true
$requiredFailed = $false

foreach ($server in $servers) {
    $started = Start-Server -Name $server.Name -Script $server.Script -Port $server.Port
    if (-not $started) {
        $allStarted = $false
        if ($server.Required) {
            $requiredFailed = $true
        }
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green

if ($allStarted -or -not $requiredFailed) {
    Write-Host "✅ ALL REQUIRED SERVERS STARTED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎮 AI Backend Servers:" -ForegroundColor Yellow
    Write-Host "  ♟️  Stockfish: http://localhost:9543/api/status" -ForegroundColor White
    Write-Host "  🎌 Shogi:     http://localhost:9544/api/status" -ForegroundColor White
    Write-Host "  ⚫ Go:        http://localhost:9545/api/status" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 Frontend:" -ForegroundColor Yellow
    Write-Host "  Games:       http://localhost:9876" -ForegroundColor White
    Write-Host ""
    Write-Host "👥 Multiplayer (optional):" -ForegroundColor Yellow
    Write-Host "  WebSocket:   ws://localhost:9877" -ForegroundColor White
    Write-Host ""
    Write-Host "Opening browser..." -ForegroundColor Cyan
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:9876"
    Write-Host ""
    Write-Host "🎮 Ready to play!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 To stop all servers:" -ForegroundColor Gray
    Write-Host "  Get-Process python | Where-Object {$_.Path -like '*python*'} | Stop-Process -Force" -ForegroundColor Gray
} else {
    Write-Host "❌ REQUIRED SERVERS FAILED TO START!" -ForegroundColor Red
    Write-Host "Check the PowerShell windows for error messages" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  - Python not in PATH" -ForegroundColor Gray
    Write-Host "  - Missing dependencies (pip install -r requirements.txt)" -ForegroundColor Gray
    Write-Host "  - AI engine binaries not found" -ForegroundColor Gray
}

Write-Host ""
