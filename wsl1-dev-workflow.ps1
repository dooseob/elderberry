# ==========================================
# WSL1 환경 최적화 개발 워크플로우
# Docker 없이 네이티브 개발에 집중
# ==========================================

Write-Host "🖥️  WSL1 기반 엘더베리 개발 환경" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# WSL1 환경 확인
function Check-WSL1Environment {
    Write-Host "🔍 WSL1 환경 확인..." -ForegroundColor Cyan
    
    # Java 환경 확인 (PowerShell에서)
    Write-Host "  ☕ Windows Java 21 확인 중..." -ForegroundColor Yellow
    try {
        $javaVersion = java -version 2>&1 | Select-String "version"
        Write-Host "    ✅ $javaVersion" -ForegroundColor Green
    } catch {
        Write-Host "    ❌ Java 21 설치 필요" -ForegroundColor Red
    }
    
    # Node.js 확인
    Write-Host "  🟢 Node.js 확인 중..." -ForegroundColor Yellow
    try {
        $nodeVersion = node --version
        Write-Host "    ✅ Node.js $nodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "    ❌ Node.js 설치 필요" -ForegroundColor Red
    }
    
    Write-Host "  💡 WSL1 최적화: Docker 비활성화, 네이티브 개발 모드" -ForegroundColor Cyan
}

# 프론트엔드 개발 서버 시작 (별도 터미널)
function Start-Frontend {
    Write-Host "🎨 프론트엔드 개발 서버 시작..." -ForegroundColor Blue
    
    # React 개발 서버 (새 터미널에서)
    $frontendScript = @"
Write-Host '🚀 React 개발 서버 시작...' -ForegroundColor Blue
Set-Location '$PWD/frontend'
npm run dev
"@
    
    Start-Process PowerShell -ArgumentList "-NoExit", "-Command", $frontendScript
    Write-Host "  ✅ React 서버가 새 터미널에서 시작됨 (포트 5173)" -ForegroundColor Green
}

# 백엔드 개발 서버 시작 (별도 터미널)
function Start-Backend {
    Write-Host "🔧 백엔드 개발 서버 시작..." -ForegroundColor Yellow
    
    # Spring Boot 서버 (새 터미널에서)
    $backendScript = @"
Write-Host '🚀 Spring Boot 서버 시작...' -ForegroundColor Yellow
Write-Host '☕ Java 21 환경에서 실행...' -ForegroundColor Cyan
Set-Location '$PWD'
java -version
Write-Host ''
Write-Host '🌱 Spring Boot 시작 중...' -ForegroundColor Green
.\gradlew.bat bootRun --no-daemon
"@
    
    Start-Process PowerShell -ArgumentList "-NoExit", "-Command", $backendScript
    Write-Host "  ✅ Spring Boot 서버가 새 터미널에서 시작됨 (포트 8080)" -ForegroundColor Green
}

# 개발 환경 상태 확인
function Check-DevStatus {
    Write-Host "📊 개발 서버 상태 확인..." -ForegroundColor Cyan
    
    # 포트 확인
    $frontendRunning = netstat -an | Select-String ":5173" | Select-String "LISTENING"
    $backendRunning = netstat -an | Select-String ":8080" | Select-String "LISTENING"
    
    if ($frontendRunning) {
        Write-Host "  ✅ 프론트엔드: http://localhost:5173 실행 중" -ForegroundColor Green
    } else {
        Write-Host "  ⭕ 프론트엔드: 중지됨" -ForegroundColor Yellow
    }
    
    if ($backendRunning) {
        Write-Host "  ✅ 백엔드: http://localhost:8080 실행 중" -ForegroundColor Green
    } else {
        Write-Host "  ⭕ 백엔드: 중지됨" -ForegroundColor Yellow
    }
}

# API 연동 테스트
function Test-APIConnection {
    Write-Host "🔗 API 연동 테스트..." -ForegroundColor Cyan
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -Method GET -TimeoutSec 5
        Write-Host "  ✅ 백엔드 Health Check: $($response.status)" -ForegroundColor Green
        
        # API 엔드포인트 테스트
        try {
            $apiResponse = Invoke-RestMethod -Uri "http://localhost:8080/api" -Method GET -TimeoutSec 5
            Write-Host "  ✅ API 기본 엔드포인트 응답 정상" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠️  API 엔드포인트 확인 필요" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "  ❌ 백엔드 서버 연결 실패" -ForegroundColor Red
        Write-Host "     Spring Boot 서버가 실행 중인지 확인하세요" -ForegroundColor Gray
    }
}

# 빠른 빌드 테스트
function Quick-Build {
    Write-Host "⚡ 빠른 빌드 테스트..." -ForegroundColor Yellow
    
    Write-Host "  📦 프론트엔드 빌드 확인..." -ForegroundColor Cyan
    Set-Location frontend
    $frontendBuild = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✅ 프론트엔드 빌드 성공" -ForegroundColor Green
    } else {
        Write-Host "    ❌ 프론트엔드 빌드 실패" -ForegroundColor Red
    }
    Set-Location ..
    
    Write-Host "  🔧 백엔드 컴파일 확인..." -ForegroundColor Cyan
    $backendCompile = .\gradlew.bat compileJava --no-daemon 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✅ 백엔드 컴파일 성공" -ForegroundColor Green
    } else {
        Write-Host "    ❌ 백엔드 컴파일 실패 - Repository 에러 확인 필요" -ForegroundColor Red
    }
}

# 메인 메뉴
function Show-Menu {
    Write-Host ""
    Write-Host "🎯 WSL1 개발 워크플로우 선택:" -ForegroundColor Cyan
    Write-Host "1. 환경 상태 확인" -ForegroundColor White
    Write-Host "2. 프론트엔드 서버 시작" -ForegroundColor White  
    Write-Host "3. 백엔드 서버 시작" -ForegroundColor White
    Write-Host "4. 전체 개발 환경 시작" -ForegroundColor White
    Write-Host "5. API 연동 테스트" -ForegroundColor White
    Write-Host "6. 빠른 빌드 테스트" -ForegroundColor White
    Write-Host "7. 개발 가이드 보기" -ForegroundColor White
    Write-Host "8. 종료" -ForegroundColor White
    Write-Host ""
}

# 개발 가이드
function Show-DevGuide {
    Write-Host ""
    Write-Host "📚 WSL1 개발 환경 가이드" -ForegroundColor Green
    Write-Host "=========================" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 현재 우선순위:" -ForegroundColor Cyan
    Write-Host "  1. Repository 에러 67개 해결" -ForegroundColor Yellow
    Write-Host "  2. 프론트엔드-백엔드 API 연동 확인" -ForegroundColor Yellow
    Write-Host "  3. React 컴포넌트 기능 개발" -ForegroundColor Yellow
    Write-Host "  4. Spring Boot API 엔드포인트 개발" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔧 개발 워크플로우:" -ForegroundColor Cyan
    Write-Host "  • PowerShell에서 백엔드 실행 (.\gradlew.bat bootRun)" -ForegroundColor Gray
    Write-Host "  • 별도 터미널에서 프론트엔드 실행 (npm run dev)" -ForegroundColor Gray
    Write-Host "  • WSL1에서 코드 편집 (VS Code)" -ForegroundColor Gray
    Write-Host "  • Git 관리는 WSL1에서" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📂 주요 디렉토리:" -ForegroundColor Cyan
    Write-Host "  • 프론트엔드: ./frontend/" -ForegroundColor Gray
    Write-Host "  • 백엔드: ./src/main/java/" -ForegroundColor Gray
    Write-Host "  • 설정: ./src/main/resources/" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🌐 개발 URL:" -ForegroundColor Cyan
    Write-Host "  • 프론트엔드: http://localhost:5173" -ForegroundColor Gray
    Write-Host "  • 백엔드 API: http://localhost:8080/api" -ForegroundColor Gray
    Write-Host "  • Swagger UI: http://localhost:8080/swagger-ui.html" -ForegroundColor Gray
    Write-Host "  • H2 Console: http://localhost:8080/h2-console" -ForegroundColor Gray
}

# 메인 실행 로직
Check-WSL1Environment

do {
    Show-Menu
    $choice = Read-Host "선택하세요 (1-8)"
    
    switch ($choice) {
        "1" { Check-DevStatus }
        "2" { Start-Frontend }
        "3" { Start-Backend }
        "4" { 
            Start-Backend
            Start-Sleep 3
            Start-Frontend
            Write-Host ""
            Write-Host "✅ 전체 개발 환경 시작됨!" -ForegroundColor Green
            Write-Host "🌐 프론트엔드: http://localhost:5173" -ForegroundColor Cyan
            Write-Host "🔧 백엔드: http://localhost:8080" -ForegroundColor Cyan
        }
        "5" { Test-APIConnection }
        "6" { Quick-Build }
        "7" { Show-DevGuide }
        "8" { 
            Write-Host "개발 환경을 종료합니다." -ForegroundColor Yellow
            break
        }
        default { Write-Host "잘못된 선택입니다." -ForegroundColor Red }
    }
    
    if ($choice -ne "8") {
        Write-Host ""
        Write-Host "계속하려면 Enter를 누르세요..." -ForegroundColor Gray
        Read-Host
    }
} while ($choice -ne "8")

Write-Host ""
Write-Host "🎯 WSL1 개발 환경 관리 완료!" -ForegroundColor Green