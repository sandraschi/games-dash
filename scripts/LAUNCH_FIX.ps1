# Launch web server in background
# ⚠️  USER-SPECIFIC PATH: Adapt the -WorkingDirectory path for your repository location
# Default assumes repository is at: D:\Dev\repos\games-app
# Change this path to match your actual repository location

param(
    [string]$RepoPath = "D:\Dev\repos\games-app"  # ← ADAPT THIS FOR YOUR SYSTEM
)

if (-not (Test-Path $RepoPath)) {
    Write-Warning "⚠️  Repository path not found: $RepoPath"
    Write-Warning "Please adapt the `$RepoPath` variable in this script for your system!"
    exit 1
}

Start-Process python -ArgumentList "-m http.server 9876" -WorkingDirectory $RepoPath -WindowStyle Minimized
