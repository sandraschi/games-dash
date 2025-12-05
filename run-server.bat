@echo off
cd /d "%~dp0"
python -m http.server 9876
pause
