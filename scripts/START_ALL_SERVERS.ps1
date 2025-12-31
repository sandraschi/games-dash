# Start All Games Servers with Error Handling
# **Timestamp**: 2025-12-04
# Starts all necessary services: AI backends, web server, and multiplayer server

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  🏆 STARTING ALL GAMES SERVERS" -ForegroundColor White
Write-Host "  🌍 Remote Access Ready (Burundi/iPad compatible)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Check if this script is already running
$scriptName = Split-Path -Leaf $MyInvocation.MyCommand.Path
$runningScripts = Get-Process powershell -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*$scriptName*"
}
if ($runningScripts.Count -gt 1) {
    Write-Host "❌ Another instance of $scriptName is already running!" -ForegroundColor Red
    Write-Host "   Please wait for it to finish or kill it manually." -ForegroundColor Yellow
    exit 1
}

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
        # Construct path properly: scripts/../backend/script.py
        $backendDir = Join-Path $scriptPath ".." "backend"
        $scriptName = Split-Path $Script -Leaf
        $scriptFullPath = Join-Path $backendDir $scriptName
        $process = Start-Process python -ArgumentList @(
            $scriptFullPath
        ) -PassThru -NoNewWindow -WorkingDirectory "$scriptPath\.."
        
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

# Kill existing processes aggressively
Write-Host "🧹 Cleaning up existing servers..." -ForegroundColor Yellow

# First, kill all Python processes related to games-app
Write-Host "  Killing all games-app Python processes..." -ForegroundColor Gray
try {
    $pythonProcesses = Get-Process python -ErrorAction SilentlyContinue | Where-Object {
        $_.Path -like "*games-app*" -or $_.CommandLine -like "*games-app*" -or
        $_.CommandLine -like "*stockfish-server*" -or $_.CommandLine -like "*sound-service*" -or
        $_.CommandLine -like "*web-server*" -or $_.CommandLine -like "*multiplayer-server*" -or
        $_.CommandLine -like "*shogi-server*" -or $_.CommandLine -like "*go-server*"
    }
    if ($pythonProcesses) {
        $pythonProcesses | ForEach-Object {
            Write-Host "    Killing Python process $($_.Id) ($($_.ProcessName))" -ForegroundColor DarkGray
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Seconds 2
    }
} catch {
    Write-Host "  No Python processes to clean up" -ForegroundColor DarkGray
}

# Then kill processes specifically on ports
$ports = @(8080, 9543, 9544, 9545, 9876, 9877, 9878)
foreach ($port in $ports) {
    if (Test-Port -Port $port) {
        Write-Host "  Stopping process on port $port..." -ForegroundColor Gray
        $stopped = Stop-Port -Port $port
        if ($stopped) {
            Start-Sleep -Milliseconds 500
            # Verify port is actually free
            $retries = 0
            while ((Test-Port -Port $port) -and $retries -lt 5) {
                Start-Sleep -Milliseconds 200
                $retries++
            }
        }
    }
}
Start-Sleep -Seconds 1

Write-Host ""

# Start all servers
$servers = @(
    @{Name="Stockfish AI"; Script="..\backend\stockfish-server.py"; Port=9543; Required=$true},
    @{Name="Shogi AI"; Script="..\backend\shogi-server.py"; Port=9544; Required=$true},
    @{Name="Go AI"; Script="..\backend\go-server.py"; Port=9545; Required=$true},
    @{Name="Sound Service"; Script="..\backend\sound-service.py"; Port=8080; Required=$false},
    @{Name="Web Server"; Script="..\backend\web-server.py"; Port=9876; Required=$true},
    @{Name="Multiplayer Server"; Script="..\backend\multiplayer-server.py"; Port=9877; Required=$false}
)

$allStarted = $true
$requiredFailed = $false

foreach ($server in $servers) {
    # Special handling for multiplayer server - kill WebSocket port (HTTP port is optional)
    if ($server.Script -eq "multiplayer-server.py") {
        # Only kill WebSocket port (9877) - HTTP port (9878) is optional and handled by server
        if (Test-Port -Port 9877) {
            Write-Host "  ⚠️  Port 9877 is in use, stopping existing process..." -ForegroundColor Yellow
            Stop-Port -Port 9877
            Start-Sleep -Seconds 1
        }
    }
    
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
Write-Host "🌍 REMOTE ACCESS (iPad in Burundi):" -ForegroundColor Cyan
Write-Host "  • AI servers bind to 0.0.0.0 (all interfaces)" -ForegroundColor White
Write-Host "  • Access from iPad: http://YOUR-EXTERNAL-IP:9876" -ForegroundColor White
Write-Host "  • Test AI connectivity: visit connectivity-test.html" -ForegroundColor White
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
