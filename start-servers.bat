@echo off
echo ========================================
echo   Chess Game - Starting Servers
echo ========================================
echo.

echo Starting Backend Server...
start "Chess Backend" cmd /k "cd backend && pnpm dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Chess Frontend" cmd /k "pnpm dev"

echo.
echo ========================================
echo   Both servers are starting...
echo ========================================
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:4000
echo ========================================
