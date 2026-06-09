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
$SrcDir = Join-Path $ProjectRoot "src"
$Timeout = 30

Write-Host "=== Games App - Start ===" -ForegroundColor Cyan
Write-Host "Frontend : http://127.0.0.1:$WebPort" -ForegroundColor Green
Write-Host "Backend  : http://127.0.0.1:$BackendPort" -ForegroundColor Yellow

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

# 3. Start Python backend
Write-Host "Starting backend (port $BackendPort)..." -ForegroundColor Cyan
$backendJob = Start-Job -Name "games-backend" -ScriptBlock {
    param($Root, $Port)
    Set-Location $Root
    uv run uvicorn server:app --host 127.0.0.1 --port $Port --log-level info
} -ArgumentList $ProjectRoot, $BackendPort

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

if ($BackendOnly) {
    Write-Host "Backend-only mode. Waiting..." -ForegroundColor Cyan
    Receive-Job $backendJob -Wait -AutoRemoveJob
    return
}

# 4. Start frontend (Vite)
Write-Host "Starting frontend (port $WebPort)..." -ForegroundColor Green

# Open browser once frontend is ready
if (-not $NoBrowser) {
    $frontendUrl = "http://127.0.0.1:$WebPort"
    $null = Start-Job -ScriptBlock {
        param($Url, $Timeout)
        Start-Sleep 5
        for ($i = 0; $i -lt $Timeout; $i++) {
            try {
                $null = Invoke-WebRequest -Uri $Url -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
                Start-Process $Url
                return
            } catch { Start-Sleep 1 }
        }
    } -ArgumentList $frontendUrl, $Timeout
}

npm run dev -- --port $WebPort --host
