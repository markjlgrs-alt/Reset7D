# ══════════════════════════════════════════
#  Reset 7D — Iniciar backend
# ══════════════════════════════════════════

# Mata qualquer processo que já esteja usando a porta 3001
$portPid = (Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue).OwningProcess
if ($portPid) {
  Write-Host "`n🛑 Encerrando servidor anterior (PID $portPid)..." -ForegroundColor Yellow
  Stop-Process -Id $portPid -Force -ErrorAction SilentlyContinue
  Start-Sleep -Milliseconds 800
}

Set-Location "$PSScriptRoot\backend"

if (-not (Test-Path "node_modules")) {
  Write-Host "`n📦 Instalando dependências..." -ForegroundColor Cyan
  npm install
}

Write-Host "`n🚀 Iniciando servidor em http://localhost:3001 ..." -ForegroundColor Green
Write-Host "   App:  http://localhost:3001/app.html" -ForegroundColor Gray
Write-Host "   Pressione Ctrl+C para encerrar.`n" -ForegroundColor Gray

# Aguarda o servidor subir e abre o navegador
Start-Process powershell -ArgumentList "-Command Start-Sleep 2; Start-Process 'http://localhost:3001/app.html'" -WindowStyle Hidden

node server.js
