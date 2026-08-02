@echo off
REM Stop AI Games Collection Service
echo Stopping AI Games Collection Service...
C:\nssm\nssm.exe stop AIGamesCollectionService
echo.
echo Service stopped.