@echo off
cd /d "%~dp0"
echo Starting TranquilMind server on http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.
npx serve . -p 3000
pause

