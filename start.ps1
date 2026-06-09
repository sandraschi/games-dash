Param([switch]$Headless)

if ($Headless -and ($Host.UI.RawUI.WindowTitle -notmatch 'Hidden')) {
    Start-Process pwsh -ArgumentList '-NoProfile', '-File', $PSCommandPath, '-Headless' -WindowStyle Hidden
    exit
}

$ErrorActionPreference = "Stop"
$ScriptRoot = Split-Path -Parent $PSCommandPath
$BackendPort = 10987
$FrontendPort = 10986
Write-Host 'Starting games-app...' -ForegroundColor Cyan

# Port zombie clearing
Get-NetTCPConnection -LocalPort $BackendPort -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Get-NetTCPConnection -LocalPort $FrontendPort -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }

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

# Start frontend
$WebRoot = Join-Path $ScriptRoot "web_sota"
$npx = (Get-Command "npx" -ErrorAction SilentlyContinue).Source
if (-not $npx) {
    $npx = (Get-Command "npx.cmd" -ErrorAction SilentlyContinue).Source
}
if ($npx) {
    $args = @("/c", $npx, "vite", "--port", "$FrontendPort", "--host")
    Start-Process -NoNewWindow -FilePath "cmd.exe" -ArgumentList $args -WorkingDirectory $WebRoot
} else {
    Write-Host "npx not found — install Node.js or run 'npm --prefix web_sota install'" -ForegroundColor Yellow
}

# Auto-open browser
Start-Process "http://127.0.0.1:$FrontendPort"

# Keep-alive
while ($true) {
    if ($BackendJob.State -eq "Completed" -or $BackendJob.State -eq "Failed") {
        Receive-Job $BackendJob; break
    }
    Start-Sleep 2
}
