#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Generate basic test files for games that don't have tests yet

.DESCRIPTION
    Scans the games directory and identifies games without corresponding test files,
    then generates basic test templates to kickstart testing.

.PARAMETER GameName
    Specific game name to generate tests for (optional)

.PARAMETER Force
    Overwrite existing test files

.EXAMPLE
    .\generate-game-tests.ps1
    # Generate tests for all games missing tests

.EXAMPLE
    .\generate-game-tests.ps1 -GameName chess
    # Generate test for specific game
#>

[CmdletBinding()]
param(
    [string]$GameName,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

# Get list of games
$gamesDir = Join-Path $PSScriptRoot "..\games"
$testsDir = Join-Path $PSScriptRoot "..\tests"
$templateFile = Join-Path $PSScriptRoot "..\tests\templates\game-test-template.js"

# Ensure directories exist
if (-not (Test-Path $testsDir)) {
    New-Item -ItemType Directory -Path $testsDir -Force | Out-Null
}

if (-not (Test-Path $templateFile)) {
    Write-Error "Template file not found: $templateFile"
    exit 1
}

# Get all game files
$gameFiles = Get-ChildItem -Path $gamesDir -Filter "*.html" -File

if ($GameName) {
    # Filter to specific game
    $gameFiles = $gameFiles | Where-Object { $_.BaseName -like "*$GameName*" }
}

$template = Get-Content $templateFile -Raw

$generated = 0
$skipped = 0

foreach ($gameFile in $gameFiles) {
    $gameName = $gameFile.BaseName
    $testFileName = "$gameName.test.js"
    $testFilePath = Join-Path $testsDir $testFileName

    if ((Test-Path $testFilePath) -and -not $Force) {
        Write-Host "⏭️  Skipping $gameName (test exists)" -ForegroundColor Gray
        $skipped++
        continue
    }

    # Customize template for this game
    $testContent = $template -replace 'Game Name', $gameName
    $testContent = $testContent -replace 'GameLogic', "$($gameName -replace '-', '')Logic"
    $testContent = $testContent -replace 'game-logic', "$gameName-logic"

    # Write test file
    $testContent | Out-File -FilePath $testFilePath -Encoding UTF8 -Force

    Write-Host "✅ Generated test for $gameName" -ForegroundColor Green
    $generated++
}

Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "  Generated: $generated test files" -ForegroundColor Green
Write-Host "  Skipped: $skipped existing tests" -ForegroundColor Yellow
Write-Host "  Total games: $($gameFiles.Count)" -ForegroundColor White

if ($generated -gt 0) {
    Write-Host "`n🎯 Next Steps:" -ForegroundColor Magenta
    Write-Host "  1. Review generated test files in $testsDir" -ForegroundColor White
    Write-Host "  2. Extract game logic from HTML files into testable classes" -ForegroundColor White
    Write-Host "  3. Customize test cases for each game's specific rules" -ForegroundColor White
    Write-Host "  4. Run 'npm test' to verify tests work" -ForegroundColor White
}
