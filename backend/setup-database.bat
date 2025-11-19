@echo off
echo ========================================
echo   Chess App - PostgreSQL Setup
echo ========================================
echo.

echo Checking if PostgreSQL is installed...
psql --version >nul 2>&1
if errorlevel 1 (
    echo ❌ PostgreSQL is not installed or not in PATH
    echo.
    echo Please install PostgreSQL from: https://www.postgresql.org/download/
    pause
    exit /b 1
)

echo ✅ PostgreSQL found
echo.

echo Creating database 'chess_db'...
echo.
psql -U postgres -c "CREATE DATABASE chess_db;" 2>nul

if errorlevel 1 (
    echo ⚠️  Database might already exist or error occurred
) else (
    echo ✅ Database created successfully
)

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Update backend/.env with your PostgreSQL credentials
echo 2. Run: cd backend
echo 3. Run: pnpm dev
echo.
echo The database schema will be initialized automatically on first run.
echo.
pause
