# 엘더베리 개발 서버 시작 스크립트 v2.0
Write-Host "====================================" -ForegroundColor Green
Write-Host "🚀 엘더베리 개발 환경 시작" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# 로그 디렉토리 생성
if (!(Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs"
    Write-Host "✓ logs 디렉토리 생성" -ForegroundColor Yellow
}

if (!(Test-Path "data")) {
    New-Item -ItemType Directory -Path "data"
    Write-Host "✓ data 디렉토리 생성" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 개발 환경 상태" -ForegroundColor Cyan

# 포트 상태 확인
$frontendRunning = netstat -an | Select-String ":5173" | Select-String "LISTENING"
$backendRunning = netstat -an | Select-String ":8080" | Select-String "LISTENING"

Write-Host ""
if ($frontendRunning) {
    Write-Host "✓ 프론트엔드 서버 실행 중 (포트 5173)" -ForegroundColor Green
} else {
    Write-Host "○ 프론트엔드 서버 중지됨" -ForegroundColor Yellow
}

if ($backendRunning) {
    Write-Host "✓ 백엔드 서버 실행 중 (포트 8080)" -ForegroundColor Green
} else {
    Write-Host "○ 백엔드 서버 중지됨" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 현재 개발 상황:" -ForegroundColor Cyan
Write-Host "• Plain Java 서버: 정상 동작 (기본 기능 구현됨)" -ForegroundColor White
Write-Host "• Spring Boot 백엔드: 개발 진행 중 (67개 에러 점진적 해결)" -ForegroundColor White
Write-Host "• React 프론트엔드: 정상 동작" -ForegroundColor White
Write-Host "• 로그 기반 디버깅: 활성화" -ForegroundColor White

Write-Host ""
Write-Host "🚀 서버 시작 옵션:" -ForegroundColor Cyan
Write-Host "1. 전체 개발 환경 시작 (권장)" -ForegroundColor White
Write-Host "2. 프론트엔드만 시작" -ForegroundColor White
Write-Host "3. 백엔드만 시작" -ForegroundColor White
Write-Host "4. 디버깅 시스템만 실행" -ForegroundColor White
Write-Host "5. 종료" -ForegroundColor White

$choice = Read-Host "`n선택하세요 (1-5)"

switch ($choice) {
    "1" {
        Write-Host "`n🚀 전체 개발 환경 시작..." -ForegroundColor Green
        
        # 백엔드 시작 (Plain Java Server)
        if (!$backendRunning) {
            Write-Host "백엔드 서버 시작 중..." -ForegroundColor Yellow
            Start-Process PowerShell -ArgumentList "-Command", "java -cp build\classes com.globalcarelink.PlainJavaServer" -WindowStyle Minimized
            Start-Sleep 3
        }
        
        # 프론트엔드 시작
        if (!$frontendRunning) {
            Write-Host "프론트엔드 서버 시작 중..." -ForegroundColor Yellow
            Start-Process PowerShell -ArgumentList "-Command", "cd frontend; npm run dev" -WindowStyle Normal
            Start-Sleep 2
        }
        
        Write-Host ""
        Write-Host "✅ 개발 환경 시작 완료!" -ForegroundColor Green
        Write-Host "📱 프론트엔드: http://localhost:5173" -ForegroundColor Cyan
        Write-Host "🔧 백엔드: http://localhost:8080" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "💡 디버깅 시스템 실행: .\debug-system.ps1" -ForegroundColor Yellow
    }
    "2" {
        Write-Host "`n🎨 프론트엔드 서버 시작..." -ForegroundColor Green
        Set-Location frontend
        npm run dev
    }
    "3" {
        Write-Host "`n🔧 백엔드 서버 시작..." -ForegroundColor Green
        java -cp build\classes com.globalcarelink.PlainJavaServer
    }
    "4" {
        Write-Host "`n🔍 디버깅 시스템 실행..." -ForegroundColor Green
        .\debug-system.ps1
    }
    "5" {
        Write-Host "종료합니다." -ForegroundColor Yellow
        exit
    }
    default {
        Write-Host "잘못된 선택입니다. 전체 환경을 시작합니다." -ForegroundColor Red
        # 기본값으로 전체 시작
    }
} 