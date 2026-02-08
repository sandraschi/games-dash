# Run Games Collection as native Windows app (no Docker/Python)
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..."
    npm install
}
npm run start:standalone
