# games-app Tauri Release Build Pipeline
# Produces: native/target/release/bundle/nsis/Games Collection_*_x64-setup.exe

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$RepoName = "games-app"
$Triple = "x86_64-pc-windows-msvc"
$ResourceDir = "$PSScriptRoot\resources"
$DevDir = "$PSScriptRoot\binaries"

Write-Host "=== $RepoName Tauri Release Build ===" -ForegroundColor Cyan

# Step 1: React frontend
Write-Host "[1/4] Building React frontend..." -ForegroundColor Yellow
Push-Location "$Root\web_sota"
npm install
npm run build
Pop-Location

# Step 2: PyInstaller backend
Write-Host "[2/4] Building PyInstaller backend..." -ForegroundColor Yellow
Push-Location "$Root"
# Build frontend-dist first so it's bundled
uv run pyinstaller "$RepoName-backend.spec" --clean --noconfirm
Pop-Location

# Step 3: Copy to Tauri resources + dev fallback
Write-Host "[3/4] Staging backend in Tauri resources..." -ForegroundColor Yellow
$src = "$Root\dist\games-app-backend.exe"
if (-not (Test-Path $src)) {
    Write-Error "PyInstaller output not found: $src"
    exit 1
}
New-Item -ItemType Directory -Force -Path $ResourceDir, $DevDir | Out-Null
Copy-Item $src "$ResourceDir\games-app-backend.exe" -Force
Copy-Item $src "$DevDir\games-app-backend-$Triple.exe" -Force

# Step 4: Tauri NSIS bundle
Write-Host "[4/4] Building Tauri NSIS installer..." -ForegroundColor Yellow
Push-Location $PSScriptRoot
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
npm install
npx @tauri-apps/cli build
Pop-Location

$Installers = Get-ChildItem "$PSScriptRoot\target\release\bundle\nsis\*_x64-setup.exe" -ErrorAction SilentlyContinue
if ($Installers) {
    Write-Host "Ship: $($Installers[0].FullName)" -ForegroundColor Green
} else {
    Write-Host "NSIS installer not found. Check target/release/bundle/nsis/" -ForegroundColor Red
}
