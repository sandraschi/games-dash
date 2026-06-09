# games-app PyInstaller sidecar build (standalone, pre-Tauri)
# Builds: dist/games-app-backend.exe -> native/resources/ + native/binaries/

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$RepoName = "games-app"
$Triple = "x86_64-pc-windows-msvc"
$ResourceDir = "$PSScriptRoot\resources"
$DevDir = "$PSScriptRoot\binaries"

Write-Host "=== $RepoName Sidecar Build ===" -ForegroundColor Cyan

# Step 1: Build React frontend for bundling
Write-Host "[1/3] Building React frontend..." -ForegroundColor Yellow
Push-Location "$Root\web_sota"
npm install
npm run build
Pop-Location

# Step 2: PyInstaller
Write-Host "[2/3] Building PyInstaller backend..." -ForegroundColor Yellow
Push-Location "$Root"
uv sync
uv run pyinstaller "$RepoName-backend.spec" --clean --noconfirm
Pop-Location

# Step 3: Copy to Tauri locations
Write-Host "[3/3] Copying to native/resources/ + native/binaries/" -ForegroundColor Yellow
$src = "$Root\dist\games-app-backend.exe"
if (-not (Test-Path $src)) {
    Write-Error "PyInstaller output not found: $src"
    exit 1
}
New-Item -ItemType Directory -Force -Path $ResourceDir, $DevDir | Out-Null
Copy-Item $src "$ResourceDir\games-app-backend.exe" -Force
Copy-Item $src "$DevDir\games-app-backend-$Triple.exe" -Force

Write-Host "Sidecar ready. Run: cd native && npx @tauri-apps/cli build" -ForegroundColor Green
