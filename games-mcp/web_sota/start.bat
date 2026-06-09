@echo off
REM Stale copy — redirecting to root start.ps1
cd /d "%~dp0..\..\web_sota"
powershell -ExecutionPolicy Bypass -File "%~dp0..\..\web_sota\start.ps1"
