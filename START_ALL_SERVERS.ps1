# Start All Games Servers with Error Handling
# **Timestamp**: 2025-12-04

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  🏆 STARTING ALL GAMES SERVERS" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Function to start server with error handling
function Start-Server {
    param(
        [string]$Name,
        [string]$Script,
        [int]$Port,
        [int]$Delay = 2
    )
    
    Write-Host "Starting $Name (port $Port)..." -ForegroundColor Cyan
    
    try {
        $process = Start-Process powershell -ArgumentList @(
            "-NoExit",
            "-Command",
            "cd '$scriptPath'; `$ErrorActionPreference='Continue'; python $Script 2>&1 | Tee-Object -FilePath `"$scriptPath\logs\$Name-`$(Get-Date -Format 'yyyyMMdd-HHmmss').log`""
        ) -PassThru -WindowStyle Normal
        
        if ($process) {
            Write-Host "  ✅ $Name started (PID: $($process.Id))" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Failed to start $Name" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "  ❌ ERROR starting $Name : $_" -ForegroundColor Red
        return $false
    }
    
    Start-Sleep -Seconds $Delay
    return $true
}

# Create logs directory
$logsDir = Join-Path $scriptPath "logs"
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir | Out-Null
}

# Kill existing processes on ports
Write-Host "Checking for existing servers..." -ForegroundColor Yellow
$ports = @(9543, 9544, 9545, 9876)
foreach ($port in $ports) {
    $existing = netstat -ano | Select-String ":$port.*LISTENING"
    if ($existing) {
        Write-Host "  ⚠️  Port $port is in use" -ForegroundColor Yellow
        $parts = $existing.ToString().Split() | Where-Object { $_ -match '^\d+$' }
        if ($parts) {
            $processId = $parts[-1]
            Write-Host "    Killing process $processId..." -ForegroundColor Yellow
            taskkill /F /PID $processId 2>$null
            Start-Sleep -Seconds 1
        }
    }
}

Write-Host ""

# Start all servers
$servers = @(
    @{Name="Stockfish"; Script="stockfish-server.py"; Port=9543},
    @{Name="Shogi"; Script="shogi-server.py"; Port=9544},
    @{Name="Go"; Script="go-server.py"; Port=9545},
    @{Name="Web Server"; Script="web-server.py"; Port=9876}
)

$allStarted = $true
foreach ($server in $servers) {
    if (-not (Start-Server -Name $server.Name -Script $server.Script -Port $server.Port)) {
        $allStarted = $false
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green

if ($allStarted) {
    Write-Host "✅ ALL SERVERS STARTED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Backend Servers:" -ForegroundColor Yellow
    Write-Host "  Stockfish: http://localhost:9543/api/status" -ForegroundColor White
    Write-Host "  Shogi:     http://localhost:9544/api/status" -ForegroundColor White
    Write-Host "  Go:        http://localhost:9545/api/status" -ForegroundColor White
    Write-Host ""
    Write-Host "Frontend:" -ForegroundColor Yellow
    Write-Host "  Games:     http://localhost:9876" -ForegroundColor White
    Write-Host ""
    Write-Host "Opening browser..." -ForegroundColor Cyan
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:9876"
    Write-Host ""
    Write-Host "🎮 Ready to play!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Logs are saved to: $logsDir" -ForegroundColor Gray
    Write-Host "To stop: Close the PowerShell windows or run:" -ForegroundColor Gray
    Write-Host "  Get-Process python | Stop-Process -Force" -ForegroundColor Gray
} else {
    Write-Host "❌ SOME SERVERS FAILED TO START!" -ForegroundColor Red
    Write-Host "Check the PowerShell windows for error messages" -ForegroundColor Yellow
    Write-Host "Logs are saved to: $logsDir" -ForegroundColor Gray
}

Write-Host ""
