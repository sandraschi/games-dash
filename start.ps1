Param([switch]$Headless, [switch]$Dashboard)

if ($Headless -and ($Host.UI.RawUI.WindowTitle -notmatch 'Hidden')) {
    Start-Process pwsh -ArgumentList '-NoProfile', '-File', $PSCommandPath, '-Headless' -WindowStyle Hidden
    exit
}

$ErrorActionPreference = "Stop"
$ScriptRoot = Split-Path -Parent $PSCommandPath
$BackendPort = 10987
$FrontendPort = 10986
Write-Host 'Starting games-app...' -ForegroundColor Cyan
Write-Host "Gateway: http://127.0.0.1:$BackendPort" -ForegroundColor Green
Write-Host "Games:   http://127.0.0.1:$BackendPort/games-collection/" -ForegroundColor Yellow
if ($Dashboard) {
    Write-Host "MCP UI:  http://127.0.0.1:$FrontendPort" -ForegroundColor Blue
}

# Port zombie clearing
Get-NetTCPConnection -LocalPort $BackendPort -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
if ($Dashboard) {
    Get-NetTCPConnection -LocalPort $FrontendPort -ErrorAction SilentlyContinue |
        ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
}

# Start backend
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

# Optional: start Vite frontend (MCP dashboard)
if ($Dashboard) {
    $WebRoot = Join-Path $ScriptRoot "web_sota"
    Start-Process -NoNewWindow -FilePath "cmd.exe" -ArgumentList @("/c", "npm", "run", "dev", "--", "--port", "$FrontendPort", "--host") -WorkingDirectory $WebRoot
    Start-Sleep 2
    Start-Process "http://127.0.0.1:$FrontendPort"
} else {
    # Open games collection by default
    Start-Process "http://127.0.0.1:$BackendPort/games-collection/"
}

# Keep-alive
while ($true) {
    if ($BackendJob.State -eq "Completed" -or $BackendJob.State -eq "Failed") {
        Receive-Job $BackendJob; break
    }
    Start-Sleep 2
}
