@echo off
REM Stop Games App Service
echo Stopping Games App Service...
C:\nssm\nssm.exe stop GamesAppService
echo.
echo Service stopped.