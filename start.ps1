# LogIQ - Script khoi dong (Windows)
$ErrorActionPreference = "Continue"
Set-Location $PSScriptRoot

function Stop-Port {
    param([int]$Port)
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    foreach ($conn in $connections) {
        if ($conn.OwningProcess -and $conn.OwningProcess -ne 0) {
            Write-Host "Dung process PID $($conn.OwningProcess) tren port $Port..." -ForegroundColor Yellow
            taskkill /PID $conn.OwningProcess /F 2>$null | Out-Null
        }
    }
}

Write-Host ""
Write-Host "  LogIQ - Khoi dong server" -ForegroundColor Cyan
Write-Host "  ========================" -ForegroundColor Cyan
Write-Host ""

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "LOI: Chua cai Node.js!" -ForegroundColor Red
    Write-Host "Tai tai: https://nodejs.org (ban LTS)" -ForegroundColor Yellow
    Read-Host "Nhan Enter de thoat"
    exit 1
}

Write-Host "Node.js: $(node -v)" -ForegroundColor Green

if (-not (Test-Path "node_modules")) {
    Write-Host "Cai dependencies lan dau (npm install)..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "LOI: npm install that bai!" -ForegroundColor Red
        Read-Host "Nhan Enter de thoat"
        exit 1
    }
}

# Giai phong port 3000 va xoa lock file cu
Stop-Port -Port 3000
if (Test-Path ".next\dev\lock") {
    Remove-Item ".next\dev\lock" -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 1

Write-Host ""
Write-Host "Server: http://localhost:3000" -ForegroundColor Green
Write-Host "Dung server: Ctrl+C" -ForegroundColor Gray
Write-Host ""

# Mo trinh duyet sau 2 giay
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:3000"
} | Out-Null

npm run dev

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "LOI khoi dong server! Thu chay:" -ForegroundColor Red
    Write-Host "  taskkill /F /IM node.exe" -ForegroundColor Yellow
    Write-Host "  npm run dev" -ForegroundColor Yellow
    Read-Host "Nhan Enter de thoat"
}