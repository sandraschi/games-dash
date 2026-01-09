#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Repository backup script with enhanced error handling and multiple destinations
.DESCRIPTION
    Creates compressed ZIP backups of the repository and saves to multiple locations
.PARAMETER IncludeBuild
    Include dist/ and build/ folders (default: false)
.PARAMETER Force
    Overwrite existing backups (default: false)
#>

param(
    [switch]$IncludeBuild = $false,
    [switch]$Force = $false,
    [switch]$WhatIf = $false
)

# Get repository information
try {
    $repoName = (Get-Item .).Name
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $backupName = "${repoName}_backup_${timestamp}.zip"
}
catch {
    Write-Host "Error: Must run from repository root" -ForegroundColor Red
    exit 1
}

Write-Host "Repository Backup - $repoName" -ForegroundColor Cyan
Write-Host "Timestamp: $timestamp" -ForegroundColor Gray

if ($WhatIf) {
    Write-Host "DRY RUN MODE - No files will be created" -ForegroundColor Yellow
    exit 0
}

# Define backup destinations
$desktopBackup = Join-Path ([Environment]::GetFolderPath("Desktop")) "repo backup"
$nDriveBackup = Join-Path "N:\Backup\Dev\repo-backups" $repoName

# Only add OneDrive if it exists
$backupDestinations = @(
    @{ Name = "Desktop"; Path = $desktopBackup; BackupPath = (Join-Path $desktopBackup $backupName) }
    @{ Name = "N: Drive"; Path = $nDriveBackup; BackupPath = (Join-Path $nDriveBackup $backupName) }
)

if ($env:OneDrive) {
    $oneDriveBackup = Join-Path (Join-Path $env:OneDrive "Backup") "repo-backups" $repoName
    $backupDestinations += @{ Name = "OneDrive"; Path = $oneDriveBackup; BackupPath = (Join-Path $oneDriveBackup $backupName) }
}

# Create backup directories if they don't exist
foreach ($dest in $backupDestinations) {
    if (-not (Test-Path $dest.Path)) {
        Write-Host "Creating directory: $($dest.Path)" -ForegroundColor Gray
        New-Item -ItemType Directory -Path $dest.Path -Force | Out-Null
    }
}

# Define exclusions
$exclusions = @(
    ".venv", "venv", "env", ".env",
    "__pycache__", ".mypy_cache", ".ruff_cache", ".pytest_cache",
    "node_modules",
    "*.pyc", "*.pyo", "*.pyd",
    ".DS_Store", "Thumbs.db",
    "*.log", "*.bak", "*.backup", "*.tmp",
    ".vbox", "*.vdi", "*.vmdk", "*.vbox",
    "MagicMock", "sandboxes", "quarantine", "analysis", "backups",
    ".git", ".gitignore", ".cursorignore",
    "*.exe", "*.dll", "*.pdb", "*.so", "*.dylib",
    "target", "Cargo.lock",
    "dist", "build", "*.whl", "*.tar.gz",
    "*.db", "*.sqlite", "*.sqlite3",
    "*.lock", "*.pid", "*.pidfile",
    "*.swp", "*.swo", "*.cache", "*.lockfile"
)

if (-not $IncludeBuild) {
    $exclusions += @("dist", "build")
}

# Get all files to backup
Write-Host "Analyzing repository..." -ForegroundColor Cyan
$allFiles = Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue
$backupFiles = $allFiles | Where-Object {
    $file = $_
    $shouldExclude = $false
    
    foreach ($excl in $exclusions) {
        $pattern = $excl -replace '\*', '.*' -replace '\.', '\.'
        if ($file.FullName -match $pattern -or $file.FullName -match [regex]::Escape($excl)) {
            $shouldExclude = $true
            break
        }
    }
    
    -not $shouldExclude
}

$totalSize = ($allFiles | Measure-Object -Property Length -Sum).Sum
$backupSize = ($backupFiles | Measure-Object -Property Length -Sum).Sum
$excludedSize = $totalSize - $backupSize

Write-Host "Total size: $([math]::Round($totalSize / 1MB, 2)) MB" -ForegroundColor White
Write-Host "Excluded: $([math]::Round($excludedSize / 1MB, 2)) MB" -ForegroundColor Red
Write-Host "Backup size: $([math]::Round($backupSize / 1MB, 2)) MB" -ForegroundColor Green
Write-Host "Files: $($backupFiles.Count)" -ForegroundColor White
Write-Host ""

# Create backups
Write-Host "Creating backups..." -ForegroundColor Cyan
$successfulBackups = 0
$failedBackups = 0

foreach ($dest in $backupDestinations) {
    Write-Host "  -> $($dest.Name) backup..." -ForegroundColor Gray
    
    try {
        # Remove existing backup if not Force
        if ((Test-Path $dest.BackupPath) -and -not $Force) {
            Write-Host "    Backup already exists. Use -Force to overwrite." -ForegroundColor Yellow
            continue
        }
        
        # Create ZIP archive using built-in Compress-Archive
        Compress-Archive -Path $backupFiles.FullName -DestinationPath $dest.BackupPath -Force
        
        $backupSize = (Get-Item $dest.BackupPath).Length / 1MB
        $successfulBackups++
        
        Write-Host "  SUCCESS: $($dest.Name): $([math]::Round($backupSize, 2)) MB" -ForegroundColor Green
    }
    catch {
        $failedBackups++
        Write-Host "  FAILED: $($dest.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Summary
Write-Host "Backup Summary:" -ForegroundColor Cyan
Write-Host "Successful: $successfulBackups" -ForegroundColor $(if ($successfulBackups -gt 0) { "Green" } else { "Red" })
Write-Host "Failed: $failedBackups" -ForegroundColor $(if ($failedBackups -gt 0) { "Red" } else { "Gray" })

if ($successfulBackups -gt 0) {
    Write-Host "Backup completed successfully!" -ForegroundColor Green
} else {
    Write-Host "No backups created" -ForegroundColor Red
}

exit ($failedBackups)
