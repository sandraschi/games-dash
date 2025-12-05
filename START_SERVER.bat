@echo off
cd /d "%~dp0"
echo Starting web server on port 9876...
python -m http.server 9876
