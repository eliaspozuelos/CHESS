# Chess Game - Start Servers (PowerShell)

Write-Host "========================================"
Write-Host "  Chess Game - Starting Servers"
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; pnpm dev"

Start-Sleep -Seconds 3

Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; pnpm dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Both servers are starting..."
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:4000" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green
