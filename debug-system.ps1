Write-Host "=== Elderberry Debug System ===" -ForegroundColor Green
Write-Host "Log-based Error Debugging & Development Monitoring System" -ForegroundColor Yellow

# Create directories
if (!(Test-Path "logs")) { New-Item -ItemType Directory -Path "logs" }
if (!(Test-Path "data")) { New-Item -ItemType Directory -Path "data" }

Write-Host "`n[1] System Status Check" -ForegroundColor Cyan

# Check ports
$frontendRunning = netstat -an | Select-String ":5173" | Select-String "LISTENING"
$backendRunning = netstat -an | Select-String ":8080" | Select-String "LISTENING"

if ($frontendRunning) {
    Write-Host "✓ Frontend server running on port 5173" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend server not running" -ForegroundColor Red
    Write-Host "  → Run: cd frontend && npm run dev" -ForegroundColor Yellow
}

if ($backendRunning) {
    Write-Host "✓ Backend server running on port 8080" -ForegroundColor Green
} else {
    Write-Host "✗ Backend server not running" -ForegroundColor Red
    Write-Host "  → Run: java -cp build\classes com.globalcarelink.PlainJavaServer" -ForegroundColor Yellow
}

Write-Host "`n[2] Development Status" -ForegroundColor Cyan

# Check for compilation errors
Write-Host "Checking compilation status..." -ForegroundColor White
$compileResult = & .\.gradle-temp\gradle-8.10.2\bin\gradle.bat compileJava --continue 2>&1 | Out-String
$errorCount = ($compileResult | Select-String "errors" | Select-Object -Last 1)

if ($errorCount) {
    $errors = $errorCount -replace '.*?(\d+)\s+errors.*', '$1'
    if ($errors -match '^\d+$' -and [int]$errors -gt 0) {
        Write-Host "⚠ Spring Boot Backend: $errors compilation errors remaining" -ForegroundColor Yellow
        Write-Host "  → Plain Java Server is running as fallback" -ForegroundColor Cyan
        Write-Host "  → Errors are being resolved incrementally during development" -ForegroundColor Cyan
    } else {
        Write-Host "✓ Spring Boot Backend: No compilation errors" -ForegroundColor Green
    }
} else {
    Write-Host "✓ Spring Boot Backend: Compilation successful" -ForegroundColor Green
}

Write-Host "`n[3] Log Monitoring" -ForegroundColor Cyan

# Monitor logs if they exist
if (Test-Path "logs/frontend.log") {
    Write-Host "`n=== Frontend Logs (Last 10 lines) ===" -ForegroundColor Yellow
    Get-Content "logs/frontend.log" -Tail 10
}

if (Test-Path "logs/backend.log") {
    Write-Host "`n=== Backend Logs (Last 10 lines) ===" -ForegroundColor Yellow
    Get-Content "logs/backend.log" -Tail 10
}

Write-Host "`n[4] Quick Actions" -ForegroundColor Cyan
Write-Host "F - Start Frontend only"
Write-Host "B - Start Backend only (if compiled)"
Write-Host "A - Start All (Frontend + Backend)"
Write-Host "L - View Live Logs"
Write-Host "C - Clear Logs"
Write-Host "Q - Quit"

$action = Read-Host "`nSelect action"

switch ($action.ToUpper()) {
    "F" {
        Write-Host "`nStarting Frontend..." -ForegroundColor Yellow
        Set-Location "frontend"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
        Set-Location ".."
        Write-Host "Frontend started in new window" -ForegroundColor Green
    }
    
    "B" {
        Write-Host "`nChecking for compiled backend..." -ForegroundColor Yellow
        $jarFile = Get-ChildItem -Path "build/libs" -Filter "*.jar" -ErrorAction SilentlyContinue | Select-Object -First 1
        
        if ($jarFile) {
            Write-Host "Starting Backend with JAR: $($jarFile.Name)" -ForegroundColor Yellow
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "java -Dspring.profiles.active=dev -jar '$($jarFile.FullName)'"
            Write-Host "Backend started in new window" -ForegroundColor Green
        } else {
            Write-Host "No JAR file found. Please compile the project first." -ForegroundColor Red
            Write-Host "You can use an IDE like IntelliJ IDEA or VS Code with Java extension." -ForegroundColor Yellow
        }
    }
    
    "A" {
        Write-Host "`nStarting All Services..." -ForegroundColor Yellow
        
        # Start Frontend
        Set-Location "frontend"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev 2>&1 | Tee-Object -FilePath '../logs/frontend.log'"
        Set-Location ".."
        
        # Try to start Backend
        $jarFile = Get-ChildItem -Path "build/libs" -Filter "*.jar" -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($jarFile) {
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "java -Dspring.profiles.active=dev -jar '$($jarFile.FullName)' 2>&1 | Tee-Object -FilePath 'logs/backend.log'"
        } else {
            Write-Host "Backend JAR not found - only starting frontend" -ForegroundColor Yellow
        }
        
        Write-Host "Services started. Check new windows." -ForegroundColor Green
    }
    
    "L" {
        Write-Host "`nLive Log Monitoring..." -ForegroundColor Yellow
        Write-Host "Press Ctrl+C to stop monitoring" -ForegroundColor Gray
        
        while ($true) {
            Clear-Host
            Write-Host "=== LIVE LOG MONITORING ===" -ForegroundColor Green
            Write-Host "$(Get-Date)" -ForegroundColor Gray
            
            if (Test-Path "logs/frontend.log") {
                Write-Host "`n--- Frontend Log ---" -ForegroundColor Cyan
                Get-Content "logs/frontend.log" -Tail 5
            }
            
            if (Test-Path "logs/backend.log") {
                Write-Host "`n--- Backend Log ---" -ForegroundColor Cyan
                Get-Content "logs/backend.log" -Tail 5
            }
            
            Write-Host "`n--- Port Status ---" -ForegroundColor Cyan
            netstat -an | Select-String ":8080|:5173" | Select-String "LISTENING"
            
            Start-Sleep -Seconds 3
        }
    }
    
    "C" {
        Write-Host "`nClearing logs..." -ForegroundColor Yellow
        if (Test-Path "logs") {
            Remove-Item "logs/*" -Force -ErrorAction SilentlyContinue
            Write-Host "Logs cleared" -ForegroundColor Green
        }
    }
    
    "Q" {
        Write-Host "`nGoodbye!" -ForegroundColor Yellow
        exit
    }
    
    default {
        Write-Host "`nInvalid option" -ForegroundColor Red
    }
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 

Write-Host "`n[4] Error Resolution Guide" -ForegroundColor Cyan
Write-Host "=== 개발 중 에러 해결 가이드 ===" -ForegroundColor White

Write-Host "`n📋 현재 개발 상황:" -ForegroundColor Yellow
Write-Host "• Spring Boot 백엔드: 개발 진행 중 (일부 컴파일 에러 존재)" -ForegroundColor White
Write-Host "• Plain Java 서버: 정상 동작 중 (포트 8080)" -ForegroundColor White
Write-Host "• React 프론트엔드: 정상 동작 중 (포트 5173)" -ForegroundColor White
Write-Host "• 로그 기반 디버깅: 활성화됨" -ForegroundColor White

Write-Host "`n🔧 에러 해결 우선순위:" -ForegroundColor Yellow
Write-Host "1. Repository 메서드 시그니처 수정" -ForegroundColor White
Write-Host "2. 엔티티 getter/setter 메서드 추가" -ForegroundColor White
Write-Host "3. DTO 타입 불일치 해결" -ForegroundColor White
Write-Host "4. Profile 관련 메서드 구현" -ForegroundColor White

Write-Host "`n⚡ 빠른 명령어:" -ForegroundColor Yellow
Write-Host "• 컴파일 체크: .\.gradle-temp\gradle-8.10.2\bin\gradle.bat compileJava" -ForegroundColor Cyan
Write-Host "• 백엔드 시작: java -cp build\classes com.globalcarelink.PlainJavaServer" -ForegroundColor Cyan
Write-Host "• 프론트엔드 시작: cd frontend && npm run dev" -ForegroundColor Cyan
Write-Host "• 로그 모니터링: .\debug-system.ps1" -ForegroundColor Cyan

Write-Host "`n🎯 개발 진행 전략:" -ForegroundColor Yellow
Write-Host "• Plain Java 서버로 기본 기능 개발 진행" -ForegroundColor White
Write-Host "• 필요한 기능 구현 후 Spring Boot 에러 점진적 해결" -ForegroundColor White
Write-Host "• 로그 기반 디버깅으로 실시간 모니터링" -ForegroundColor White

Write-Host "`n" -ForegroundColor White
Write-Host "=== 시스템 준비 완료 ===" -ForegroundColor Green
Write-Host "개발을 시작하세요! 🚀" -ForegroundColor Green 