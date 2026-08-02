@echo off
REM Remove AI Games Collection Service
echo WARNING: This will permanently remove the AI Games Collection Service!
echo.
set /p confirm="Are you sure you want to remove the service? (y/N): "
if /i "%confirm%" neq "y" (
    echo Cancelled.
    exit /b 0
)

echo Removing AI Games Collection Service...
C:\nssm\nssm.exe stop AIGamesCollectionService 2>nul
C:\nssm\nssm.exe remove AIGamesCollectionService confirm
echo.
echo Service removed.