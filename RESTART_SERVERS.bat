@echo off
REM Server restart utility
REM **Timestamp**: 2025-12-20

echo.
echo ========================================
echo   🔄 GAMES APP - SERVER RESTART UTILITY
echo ========================================
echo.

if "%1"=="" (
    echo Usage:
    echo   RESTART_SERVERS.bat -All              (restart all servers)
    echo   RESTART_SERVERS.bat "Web Server"      (restart specific server)
    echo   RESTART_SERVERS.bat "Stockfish AI"    (restart Stockfish)
    echo.
    echo Available servers:
    echo   • Web Server
    echo   • Stockfish AI
    echo   • Shogi AI
    echo   • Go AI
    echo   • Multiplayer
    echo.
    pause
    exit /b 0
)

powershell -ExecutionPolicy Bypass -File "%~dp0RESTART_SERVERS.ps1" -Server "%~1"

echo.
echo Press any key to continue...
pause >nul
