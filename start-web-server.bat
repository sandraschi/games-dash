@echo off
cd /d "d:\Dev\repos\games-app"
echo Starting Web Server on port 9876...
echo.
python -m http.server 9876
pause
