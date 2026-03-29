@echo off
REM Games App Service Setup Script
echo ============================================
echo    Games App Windows Service Setup
echo ============================================
echo.

echo This script will set up a Windows service to keep all your servers running.
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo √ Running as Administrator
) else (
    echo X Please run this script as Administrator!
    pause
    exit /b 1
)

echo.
echo Checking for NSSM (Non-Sucking Service Manager)...
echo.

if exist "C:\nssm\nssm.exe" (
    echo √ NSSM found at C:\nssm\nssm.exe
) else (
    echo X NSSM not found. Downloading...
    echo.

    REM Download NSSM
    powershell -Command "& {Invoke-WebRequest -Uri 'https://nssm.cc/release/nssm-2.24.zip' -OutFile 'nssm.zip'}"

    if exist "nssm.zip" (
        echo √ NSSM downloaded successfully
        echo Extracting NSSM...

        REM Extract NSSM (using PowerShell since tar might not be available)
        powershell -Command "& {Expand-Archive -Path 'nssm.zip' -DestinationPath 'nssm_temp' -Force}"
        if exist "nssm_temp\nssm-2.24\win64\nssm.exe" (
            mkdir "C:\nssm" 2>nul
            copy "nssm_temp\nssm-2.24\win64\nssm.exe" "C:\nssm\nssm.exe"
            echo √ NSSM installed to C:\nssm\nssm.exe
        ) else (
            echo X Failed to extract NSSM
            pause
            exit /b 1
        )

        REM Clean up
        rmdir /s /q "nssm_temp" 2>nul
        del "nssm.zip" 2>nul
    ) else (
        echo X Failed to download NSSM. Please download manually from https://nssm.cc/download
        pause
        exit /b 1
    )
)

echo.
echo Installing Games App Service...
echo.

REM Install the service
powershell -ExecutionPolicy Bypass -File "games-app-service.ps1" -Install

if %errorLevel% == 0 (
    echo.
    echo ============================================
    echo        SERVICE INSTALLED SUCCESSFULLY!
    echo ============================================
    echo.
    echo Your games app servers will now start automatically
    echo when Windows boots up and stay running 24/7.
    echo.
    echo Service name: GamesAppService
    echo.
    echo Commands:
    echo   setup-games-service.bat status    - Check service status
    echo   setup-games-service.bat start     - Start service manually
    echo   setup-games-service.bat stop      - Stop service
    echo   setup-games-service.bat remove    - Remove service
    echo.
    echo Log file: service.log
    echo.
    pause
) else (
    echo.
    echo X Service installation failed!
    echo.
    pause
    exit /b 1
)