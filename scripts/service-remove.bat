@echo off
REM Remove Games App Service
echo WARNING: This will permanently remove the Games App Service!
echo.
set /p confirm="Are you sure you want to remove the service? (y/N): "
if /i "%confirm%" neq "y" (
    echo Cancelled.
    exit /b 0
)

echo Removing Games App Service...
C:\nssm\nssm.exe stop GamesAppService 2>nul
C:\nssm\nssm.exe remove GamesAppService confirm
echo.
echo Service removed.