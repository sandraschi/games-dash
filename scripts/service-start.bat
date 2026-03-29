@echo off
REM Start Games App Service
echo Starting Games App Service...
C:\nssm\nssm.exe start GamesAppService
echo.
echo Service started. Check status with service-status.bat