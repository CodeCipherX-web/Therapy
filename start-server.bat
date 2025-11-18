@echo off
cd /d "%~dp0"
echo Starting TranquilMind server on http://localhost:4000
echo.
echo Press Ctrl+C to stop the server
echo.
npx serve . -p 4000
pause

