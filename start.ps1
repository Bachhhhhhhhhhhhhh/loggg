# LogIQ - Script khoi dong nhanh (Windows)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "=== LogIQ Setup ===" -ForegroundColor Cyan

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "LOI: Chua cai Node.js. Tai tai https://nodejs.org" -ForegroundColor Red
    exit 1
}

Write-Host "Node: $(node -v)" -ForegroundColor Green

if (-not (Test-Path "node_modules")) {
    Write-Host "Dang cai dependencies (npm install)..." -ForegroundColor Yellow
    npm install
}

# Dung server cu neu con chay tren port 3000
$conn = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -First 1
if ($conn) {
    Write-Host "Dang dung process cu tren port 3000 (PID $($conn.OwningProcess))..." -ForegroundColor Yellow
    taskkill /PID $conn.OwningProcess /F 2>$null
    Start-Sleep -Seconds 1
}

Write-Host ""
Write-Host "Khoi dong server tai http://localhost:3000" -ForegroundColor Green
Write-Host "Nhan Ctrl+C de dung server" -ForegroundColor Gray
Write-Host ""

npm run dev