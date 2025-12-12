@echo off
REM Games Collection One-Click Installer
REM This batch file runs the PowerShell installer with admin rights

title Games Collection Installer

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║                🎮 GAMES COLLECTION INSTALLER                 ║
echo ║                                                              ║
echo ║                One-Click Setup for 69 Games                  ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo This will install Docker, configure networking, and set up
echo your complete games collection with AI opponents.
echo.
echo Requirements:
echo • Windows 10/11
echo • Internet connection
echo • Administrator privileges (will be requested)
echo.
echo The installation takes about 5-10 minutes.
echo.

pause

echo.
echo Starting installation with administrator privileges...
echo.

REM Run PowerShell installer as administrator
powershell.exe -ExecutionPolicy Bypass -Command "& { Start-Process powershell.exe -ArgumentList '-ExecutionPolicy Bypass -File ""%~dp0IDIOT_PROOF_INSTALLER.ps1""' -Verb RunAs -Wait }"

echo.
echo Installation script completed.
echo If the installer window closed, check if everything worked!
echo.
pause
