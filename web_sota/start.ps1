Param([switch]$Headless, [switch]$BackendOnly, [switch]$NoBrowser)

# --- SOTA Headless Standard ---
if ($Headless -and ($Host.UI.RawUI.WindowTitle -notmatch 'Hidden')) {
    Start-Process pwsh -ArgumentList '-NoProfile', '-File', $PSCommandPath, '-Headless' -WindowStyle Hidden
    exit
}
$WindowStyle = if ($Headless) { 'Hidden' } else { 'Normal' }
# ------------------------------

$WebPort = 10986
$BackendPort = 10987
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$FleetStartPath = Join-Path $ProjectRoot "scripts\FleetStartMode.ps1"
if (Test-Path -LiteralPath $FleetStartPath) {
    . $FleetStartPath
}
$SrcDir = Join-Path $ProjectRoot "src"
$Timeout = 30

Write-Host "=== Games App - Start ===" -ForegroundColor Cyan
Write-Host "Games Collection (main): http://127.0.0.1:$BackendPort" -ForegroundColor Green
Write-Host "MCP Dashboard (admin) : http://127.0.0.1:$WebPort" -ForegroundColor DarkGray

# 1. Kill port zombies
foreach ($port in @($WebPort, $BackendPort)) {
    Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
        Where-Object { $_.OwningProcess -gt 4 } |
        ForEach-Object {
            Write-Host "Killing PID $($_.OwningProcess) on port $port" -ForegroundColor Red
            try { Stop-Process -Id $_.OwningProcess -Force -ErrorAction Stop } catch {}
        }
}

# 2. Install frontend deps if missing
Push-Location $PSScriptRoot
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}
Pop-Location

# Sync Python deps
Write-Host "Syncing Python deps (uv sync)..." -ForegroundColor Yellow
uv sync

# 3. Start Python backend
Write-Host "Starting backend (port $BackendPort)..." -ForegroundColor Cyan
$backendJob = Start-Job -Name "games-backend" -ScriptBlock {
    param($WebRoot, $Port)
    Set-Location $WebRoot
    uv run uvicorn server:app --host 127.0.0.1 --port $Port --log-level info
} -ArgumentList $PSScriptRoot, $BackendPort

# Poll for backend readiness
Write-Host "Waiting for backend..." -ForegroundColor Gray
for ($i = 0; $i -lt $Timeout; $i++) {
    try {
        $r = Invoke-WebRequest -Uri "http://127.0.0.1:$BackendPort/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        if ($r.StatusCode -eq 200) {
            Write-Host "Backend is ready." -ForegroundColor Green
            break
        }
    } catch {}
    Start-Sleep 1
}

# 4. Start AI engines
Write-Host "Starting AI engines..." -ForegroundColor Cyan
$enginesDir = Join-Path $ProjectRoot "engines"
$engineScripts = @("stockfish-server.py", "shogi-server.py", "go-server.py", "edax-server.py", "gnubg-server.py", "open_spiel_server.py", "mohex-server.py")
foreach ($script in $engineScripts) {
    $relPath = "engines\$script"
    if (Test-Path (Join-Path $ProjectRoot $relPath)) {
        Start-Process -FilePath "uv" -ArgumentList "run python $relPath" -WindowStyle Hidden -WorkingDirectory $ProjectRoot
        Write-Host "  Started $script" -ForegroundColor DarkGray
        Start-Sleep -Milliseconds 500
    } else {
        Write-Host "  Skipped $script (not found)" -ForegroundColor DarkGray
    }
}
Write-Host "AI engines launched." -ForegroundColor Green

if ($BackendOnly) {
    Write-Host "Backend-only mode. Waiting..." -ForegroundColor Cyan
    Receive-Job $backendJob -Wait -AutoRemoveJob
    return
}

# 4. Start frontend (Vite)
Write-Host "Starting frontend (port $WebPort)..." -ForegroundColor Green

# Open browser to games collection once backend is ready
if (-not $NoBrowser) {
    $gamesUrl = "http://127.0.0.1:$BackendPort"
    $null = Start-Job -ScriptBlock {
        param($Url, $Timeout)
        Start-Sleep 3
        for ($i = 0; $i -lt $Timeout; $i++) {
            try {
                $null = Invoke-WebRequest -Uri "$Url/" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
                Start-Process $Url
                return
            } catch { Start-Sleep 1 }
        }
    } -ArgumentList $gamesUrl, $Timeout
}

npm run dev -- --port $WebPort --host
