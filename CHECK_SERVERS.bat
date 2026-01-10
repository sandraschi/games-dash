@echo off
REM Quick server health check
REM **Timestamp**: 2025-12-20

echo.
echo ========================================
echo   🔍 GAMES APP - SERVER HEALTH CHECK
echo ========================================
echo.

echo Checking servers...
echo.

REM Check Web Server (9876)
powershell -Command "try { $c = New-Object System.Net.Sockets.TcpClient; $c.Connect('localhost', 11876); $c.Close(); echo '✅ Web Server (11876) - RUNNING' } catch { echo '❌ Web Server (11876) - DOWN' }" 2>nul

REM Check Stockfish AI (9543)
powershell -Command "try { $c = New-Object System.Net.Sockets.TcpClient; $c.Connect('localhost', 11543); $c.Close(); echo '✅ Stockfish AI (11543) - RUNNING' } catch { echo '❌ Stockfish AI (11543) - DOWN' }" 2>nul

REM Check Shogi AI (9544)
powershell -Command "try { $c = New-Object System.Net.Sockets.TcpClient; $c.Connect('localhost', 11544); $c.Close(); echo '✅ Shogi AI (11544) - RUNNING' } catch { echo '❌ Shogi AI (11544) - DOWN' }" 2>nul

REM Check Go AI (9545)
powershell -Command "try { $c = New-Object System.Net.Sockets.TcpClient; $c.Connect('localhost', 11545); $c.Close(); echo '✅ Go AI (11545) - RUNNING' } catch { echo '❌ Go AI (11545) - DOWN' }" 2>nul

REM Check Multiplayer (9877)
powershell -Command "try { $c = New-Object System.Net.Sockets.TcpClient; $c.Connect('localhost', 11877); $c.Close(); echo '✅ Multiplayer (11877) - RUNNING' } catch { echo '❌ Multiplayer (11877) - DOWN' }" 2>nul

echo.
echo 💡 If servers are down, run START_SERVERS_RESILIENT.ps1
echo.

pause
