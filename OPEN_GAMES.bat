@echo off
REM Games App Launcher
REM **Timestamp**: 2025-12-13

echo 🎮 Opening Games App...
echo.

echo 🌐 Opening web browser...
start http://localhost:9876

echo.
echo ✅ Games App is running!
echo.
echo 🎯 Access URLs:
echo    Web Interface: http://localhost:9876
echo    Chess AI:       http://localhost:9543
echo    Shogi AI:       http://localhost:9544
echo    Go AI:          http://localhost:9545
echo    Multiplayer:    ws://localhost:9877
echo.
echo 🔒 Servers are protected as background jobs
echo    Use STOP_SERVERS.ps1 to cleanly shut them down
echo.
echo Press any key to close this window...
pause > nul
