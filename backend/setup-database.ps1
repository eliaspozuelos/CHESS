# Chess App - PostgreSQL Setup Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Chess App - PostgreSQL Setup"
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is installed
Write-Host "Checking if PostgreSQL is installed..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version 2>$null
    Write-Host "✅ PostgreSQL found: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ PostgreSQL is not installed or not in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install PostgreSQL from: https://www.postgresql.org/download/" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host ""
Write-Host "Creating database 'chess_db'..." -ForegroundColor Yellow
Write-Host ""

# Create database
try {
    psql -U postgres -c "CREATE DATABASE chess_db;" 2>$null
    Write-Host "✅ Database created successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Database might already exist or error occurred" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Setup Complete!"
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update backend/.env with your PostgreSQL credentials"
Write-Host "2. Run: cd backend"
Write-Host "3. Run: pnpm dev"
Write-Host ""
Write-Host "The database schema will be initialized automatically on first run."
Write-Host ""
pause
