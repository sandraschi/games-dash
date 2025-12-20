@echo off
REM Start SSH Reverse Tunnel for AI Access
REM Makes AI servers accessible worldwide without port forwarding
REM **Timestamp**: 2025-12-17

echo.
echo ===================================================
echo   🌐 SSH REVERSE TUNNEL - GLOBAL AI ACCESS
echo ===================================================
echo.

echo 🔍 Checking prerequisites...

REM Check if SSH is available
ssh -V >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ SSH not available. Install OpenSSH from Windows Features.
    pause
    exit /b 1
) else (
    echo ✅ SSH available
)

REM Check if web server is running
curl -s http://localhost:9876 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Web server not running. Start with: docker compose up -d
    pause
    exit /b 1
) else (
    echo ✅ Web server accessible
)

REM Check AI servers
set AI_COUNT=0
for %%p in (9543 9544 9545 9877) do (
    REM Simple port check using PowerShell
    powershell -Command "try { $c = New-Object System.Net.Sockets.TcpClient; $c.Connect('localhost', %%p); $c.Close(); exit 0 } catch { exit 1 }" >nul 2>&1
    if !errorlevel! equ 0 (
        set /a AI_COUNT+=1
    )
)
if %AI_COUNT% equ 0 (
    echo ❌ No AI servers running. Start with: .\START_ALL_SERVERS.ps1
    pause
    exit /b 1
) else (
    echo ✅ %AI_COUNT%/4 AI servers running
)

echo.
echo 🚀 Starting SSH reverse tunnel...
echo This will create a secure tunnel to serveo.net
echo Your AI will be accessible worldwide!
echo.

REM Create the tunnel
echo 🌐 Creating tunnel for port 9876 (web + AI servers)...
echo Press Ctrl+C to stop the tunnel
echo.

ssh -R 80:localhost:9876 serveo.net

echo.
echo 🛑 Tunnel stopped.
echo To restart: run this batch file again
echo.
pause
