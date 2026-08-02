@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "D:\Dev\repos\ai-games-collection\start.ps1"
echo.
echo === exited %ERRORLEVEL% ===
pause
