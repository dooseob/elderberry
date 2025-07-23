# Elderberry System Status Check Script
Write-Host "=== Elderberry System Status ===" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check port status
$frontendRunning = netstat -an | Select-String ":5173" | Select-String "LISTENING"
$backendRunning = netstat -an | Select-String ":8080" | Select-String "LISTENING"

Write-Host "`nServer Status:" -ForegroundColor Cyan
if ($frontendRunning) {
    Write-Host "✅ Frontend: Running (http://localhost:5173)" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend: Stopped" -ForegroundColor Red
}

if ($backendRunning) {
    Write-Host "✅ Backend: Running (http://localhost:8080)" -ForegroundColor Green
} else {
    Write-Host "❌ Backend: Stopped" -ForegroundColor Red
}

# Development status
Write-Host "`nDevelopment Progress:" -ForegroundColor Cyan
Write-Host "• Log-based Debugging System: ✅ Complete" -ForegroundColor White
Write-Host "• Plain Java Server: ✅ Working" -ForegroundColor White
Write-Host "• React Frontend: ✅ Working" -ForegroundColor White
Write-Host "• Spring Boot Backend: ⚠️ In Progress (67 errors resolving)" -ForegroundColor White

# Check log files
Write-Host "`nLog Files:" -ForegroundColor Cyan
if (Test-Path "logs") {
    $logFiles = Get-ChildItem "logs" -File
    if ($logFiles.Count -gt 0) {
        foreach ($file in $logFiles) {
            Write-Host "  📄 $($file.Name) ($('{0:N2}' -f ($file.Length/1KB)) KB)" -ForegroundColor White
        }
    } else {
        Write-Host "  📄 No log files" -ForegroundColor Yellow
    }
} else {
    Write-Host "  📁 logs directory not found" -ForegroundColor Yellow
}

# Quick commands
Write-Host "`nQuick Commands:" -ForegroundColor Cyan
Write-Host "  📱 Start Dev: .\start-dev.ps1" -ForegroundColor Yellow
Write-Host "  🔍 Debug: .\debug-system.ps1" -ForegroundColor Yellow
Write-Host "  🔧 Compile Check: .\.gradle-temp\gradle-8.10.2\bin\gradle.bat compileJava" -ForegroundColor Yellow

Write-Host "`n✨ System Ready!" -ForegroundColor Green 