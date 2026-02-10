@echo off
echo ==========================================
echo      Helados Bon App - Auto Starter
echo ==========================================
echo.

echo [1/2] Installing dependencies (this may take a minute)...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Could not install dependencies.
    echo Please make sure you have Node.js installed.
    echo Download it here: https://nodejs.org/
    echo.
    pause
    exit /b
)

echo.
echo [2/2] Starting the app...
echo.
echo When the server starts, open http://localhost:5173 in your browser.
echo.
call npm run dev
pause
