Param([switch]$Headless, [switch]$NoEngines)

if ($Headless -and ($Host.UI.RawUI.WindowTitle -notmatch 'Hidden')) {
    Start-Process pwsh -ArgumentList '-NoProfile', '-File', $PSCommandPath, '-Headless' -WindowStyle Hidden
    exit
}

$ErrorActionPreference = "Continue"
$ScriptRoot = Split-Path -Parent $PSCommandPath
$BackendPort = 10987
$FrontendPort = 10986
$EnginePorts = @(10001, 10002, 10003)

Write-Host 'Starting games-app...' -ForegroundColor Cyan

# Port zombie clearing
$PortsToClear = @($BackendPort) + $EnginePorts
foreach ($port in $PortsToClear) {
    Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
        ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
}

# Start engine servers
if (-not $NoEngines) {
    Write-Host 'Starting AI engines...' -ForegroundColor Cyan
    $Engines = @(
        @{Name="Stockfish"; Script="engines\stockfish-server.py"; Port=10001},
        @{Name="KataGo";    Script="engines\go-server.py";        Port=10002},
        @{Name="YaneuraOu"; Script="engines\shogi-server.py";     Port=10003}
    )
    foreach ($e in $Engines) {
        Start-Process pwsh -WindowStyle Hidden -ArgumentList @(
            "-NoProfile", "-Command",
            "uv run python `"$($ScriptRoot)\$($e.Script)`""
        )
        Write-Host "  $($e.Name) starting on port $($e.Port)..." -ForegroundColor Gray
    }
}

# Start FastAPI gateway
Write-Host 'Starting gateway...' -ForegroundColor Cyan
$BackendJob = Start-Job -Name "games-backend" -ScriptBlock {
    param($Root, $Port)
    Set-Location $Root
    uv run uvicorn web_sota.server:app --host 127.0.0.1 --port $Port --log-level warning
} -ArgumentList $ScriptRoot, $BackendPort

# Readiness poll
for ($i = 0; $i -lt 60; $i++) {
    try {
        $r = Invoke-WebRequest -Uri "http://127.0.0.1:$BackendPort/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($r.StatusCode -eq 200) { break }
    } catch {}
    Start-Sleep 1
}

Write-Host "Gateway ready on http://127.0.0.1:$BackendPort" -ForegroundColor Green
Write-Host "Games:    http://127.0.0.1:$BackendPort/" -ForegroundColor Yellow
Write-Host "Engines:  Stockfish=10001  KataGo=10002  YaneuraOu=10003" -ForegroundColor Gray
Write-Host "AI disabled: start with -NoEngines or run just serve" -ForegroundColor DarkGray

# Open browser
Start-Process "http://127.0.0.1:$BackendPort/"

# Keep-alive
while ($true) {
    if ($BackendJob.State -eq "Completed" -or $BackendJob.State -eq "Failed") {
        Receive-Job $BackendJob; break
    }
    Start-Sleep 2
}
