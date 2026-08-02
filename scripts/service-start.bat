@echo off
REM Start AI Games Collection Service
echo Starting AI Games Collection Service...
C:\nssm\nssm.exe start AIGamesCollectionService
echo.
echo Service started. Check status with service-status.bat