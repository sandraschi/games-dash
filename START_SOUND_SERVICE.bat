@echo off
REM Game Sound Service Starter
REM Starts the sound service and server manager

echo ============================================
echo 🎵 STARTING GAME SOUND SERVICE 🎵
echo ============================================

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Python is not installed or not in PATH
    echo Please install Python 3.7+ and add it to your PATH
    pause
    exit /b 1
)

REM Check if required packages are installed
python -c "import pydub, aiohttp" >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Installing required packages...
    pip install pydub aiohttp psutil
    if errorlevel 1 (
        echo ❌ ERROR: Failed to install required packages
        pause
        exit /b 1
    )
)

echo ✅ Starting Game Sound Service...
echo 📡 Service will be available at: http://localhost:8080
echo 🎵 Sound effects for all games
echo 🔧 Remote server restart capability
echo.
echo Press Ctrl+C to stop the service
echo.

python sound-service.py

pause





