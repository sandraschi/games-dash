@echo off
REM Start All Games Servers - Simple Batch File
REM **Timestamp**: 2025-12-02
REM Use this if PowerShell terminal is broken - double-click in Windows Explorer!

echo.
echo ===============================================
echo   Starting All Games Servers
echo ===============================================
echo.

cd /d "%~dp0"

echo Starting Stockfish AI (port 11543)...
start "Stockfish AI" pwsh -NoExit -Command "cd '%CD%'; python backend/stockfish-server.py"

timeout /t 2 /nobreak >nul

echo Starting Shogi AI (port 11544)...
start "Shogi AI" pwsh -NoExit -Command "cd '%CD%'; python backend/shogi-server.py"

timeout /t 2 /nobreak >nul

echo Starting Go AI (port 11545)...
start "Go AI" pwsh -NoExit -Command "cd '%CD%'; python backend/go-server.py"

timeout /t 2 /nobreak >nul

echo Starting Web Server (port 11876)...
start "Web Server" pwsh -NoExit -Command "cd '%CD%'; python backend/web-server.py"

timeout /t 2 /nobreak >nul

echo Starting Multiplayer Server (port 11877)...
start "Multiplayer Server" pwsh -NoExit -Command "cd '%CD%'; python backend/multiplayer-server.py"

timeout /t 3 /nobreak >nul

echo.
echo ===============================================
echo   All servers starting in separate windows
echo ===============================================
echo.
echo Opening browser...
timeout /t 2 /nobreak >nul
start http://localhost:11876

echo.
echo Ready to play!
echo.
echo To stop: Close the PowerShell windows
echo.
pause
