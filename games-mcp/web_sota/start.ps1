# This is a stale copy. Use the root start scripts instead:
Param([switch]$Headless)
$RootDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
& "$RootDir\web_sota\start.ps1" @($Headless ? '-Headless' : @())
