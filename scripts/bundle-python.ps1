# Bundle Python embed for Games Collection Electron build
# Creates python-embed/ with Python 3.12 + aiohttp, aiohttp-cors (no user install needed)
# **Timestamp**: 2025-02-07

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$PythonVersion = "3.12.7"
$EmbedUrl = "https://www.python.org/ftp/python/$PythonVersion/python-$PythonVersion-embed-amd64.zip"
$EmbedZip = Join-Path $Root "python-embed.zip"
$EmbedDir = Join-Path $Root "python-embed"
$GetPipUrl = "https://bootstrap.pypa.io/get-pip.py"

Set-Location $Root

if (Test-Path $EmbedDir) {
    Write-Host "[BUNDLE] Removing existing python-embed..."
    Remove-Item -Recurse -Force $EmbedDir
}

Write-Host "[BUNDLE] Downloading Python $PythonVersion embed..."
Invoke-WebRequest -Uri $EmbedUrl -OutFile $EmbedZip -UseBasicParsing

Write-Host "[BUNDLE] Extracting..."
Expand-Archive -Path $EmbedZip -DestinationPath $EmbedDir -Force
Remove-Item $EmbedZip

# Enable site-packages (required for pip)
$PthPath = Join-Path $EmbedDir "python312._pth"
(Get-Content $PthPath) -replace "#import site", "import site" | Set-Content $PthPath

# Download get-pip.py
Write-Host "[BUNDLE] Installing pip..."
$GetPipPath = Join-Path $EmbedDir "get-pip.py"
Invoke-WebRequest -Uri $GetPipUrl -OutFile $GetPipPath -UseBasicParsing

$PythonExe = Join-Path $EmbedDir "python.exe"
& $PythonExe $GetPipPath
if ($LASTEXITCODE -ne 0) { throw "get-pip failed" }
Remove-Item $GetPipPath

# Install AI server deps only (stockfish, go, shogi)
Write-Host "[BUNDLE] Installing aiohttp, aiohttp-cors..."
& $PythonExe -m pip install --no-cache-dir aiohttp aiohttp-cors

Write-Host "[BUNDLE] Done. python-embed ready at $EmbedDir"
