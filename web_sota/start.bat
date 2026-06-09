@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "D:\Dev\repos\games-app\start.ps1"
echo.
echo === exited %ERRORLEVEL% ===
pause
