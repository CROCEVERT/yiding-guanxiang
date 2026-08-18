@echo off
setlocal
cd /d "%~dp0"

echo.
echo Starting the local preview at http://127.0.0.1:5173/
echo Phone preview uses this computer's LAN IP, for example http://192.168.x.x:5173/
echo Keep this window open while using the app.
echo Press Ctrl+C or close this window to stop the server.
echo.

if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo.
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)

call npm run dev -- --host 0.0.0.0 --port 5173

echo.
echo The local preview has stopped.
pause
