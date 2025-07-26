# ==========================================
# 엘더베리 개발 환경 통합 관리 스크립트 v3.0
# Java 21 LTS + React 18 + Docker 환경 지원
# ==========================================

param(
    [string]$Action = "status",
    [switch]$Java21,
    [switch]$Docker,
    [switch]$Clean,
    [switch]$Verbose
)

Write-Host "🚀 엘더베리 개발 환경 관리자 v3.0" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# 환경변수 로드
function Load-Environment {
    if (Test-Path ".env") {
        Write-Host "📋 환경변수 로드 중..." -ForegroundColor Yellow
        Get-Content ".env" | ForEach-Object {
            if ($_ -match "^([^#][^=]*)=(.*)$") {
                [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
            }
        }
    }
}

# Java 환경 확인
function Check-JavaEnvironment {
    Write-Host "☕ Java 환경 검사..." -ForegroundColor Cyan
    
    try {
        $javaVersion = java -version 2>&1 | Select-String "version"
        Write-Host "  ✅ Java: $javaVersion" -ForegroundColor Green
        
        if ($javaVersion -match "21\.") {
            Write-Host "  🎯 Java 21 LTS 확인됨!" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Java 21이 아님. Java 21 LTS 권장" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ❌ Java가 설치되지 않음 또는 PATH 설정 오류" -ForegroundColor Red
        return $false
    }
    
    Write-Host "  🏠 JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Gray
    return $true
}

# Node.js 환경 확인
function Check-NodeEnvironment {
    Write-Host "🟢 Node.js 환경 검사..." -ForegroundColor Cyan
    
    try {
        $nodeVersion = node --version
        $npmVersion = npm --version
        Write-Host "  ✅ Node.js: $nodeVersion" -ForegroundColor Green
        Write-Host "  ✅ npm: v$npmVersion" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Node.js가 설치되지 않음" -ForegroundColor Red
        return $false
    }
    return $true
}

# Docker 환경 확인
function Check-DockerEnvironment {
    Write-Host "🐳 Docker 환경 검사..." -ForegroundColor Cyan
    
    try {
        $dockerVersion = docker --version
        Write-Host "  ✅ Docker: $dockerVersion" -ForegroundColor Green
        
        $dockerCompose = docker-compose --version 2>$null
        if ($dockerCompose) {
            Write-Host "  ✅ Docker Compose: $dockerCompose" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ⚠️  Docker가 설치되지 않음 (선택사항)" -ForegroundColor Yellow
        return $false
    }
    return $true
}

# 프로젝트 상태 확인
function Check-ProjectStatus {
    Write-Host "📊 프로젝트 상태 검사..." -ForegroundColor Cyan
    
    # 포트 확인
    $frontendPort = netstat -an | Select-String ":5173" | Select-String "LISTENING"
    $backendPort = netstat -an | Select-String ":8080" | Select-String "LISTENING"
    
    if ($frontendPort) {
        Write-Host "  ✅ 프론트엔드 서버 실행 중 (포트 5173)" -ForegroundColor Green
    } else {
        Write-Host "  ⭕ 프론트엔드 서버 중지됨" -ForegroundColor Yellow
    }
    
    if ($backendPort) {
        Write-Host "  ✅ 백엔드 서버 실행 중 (포트 8080)" -ForegroundColor Green
    } else {
        Write-Host "  ⭕ 백엔드 서버 중지됨" -ForegroundColor Yellow
    }
    
    # 빌드 아티팩트 확인
    if (Test-Path "build/libs/*.jar") {
        $jarFiles = Get-ChildItem "build/libs/*.jar"
        Write-Host "  📦 JAR 파일: $($jarFiles.Count)개" -ForegroundColor Green
    }
    
    if (Test-Path "src/main/resources/static/index.html") {
        Write-Host "  🎨 프론트엔드 빌드 완료" -ForegroundColor Green
    }
}

# 개발 환경 시작
function Start-Development {
    Write-Host "🚀 개발 환경 시작..." -ForegroundColor Green
    
    if ($Docker) {
        Write-Host "🐳 Docker 환경으로 시작..." -ForegroundColor Cyan
        docker-compose up -d
    } else {
        # 백엔드 시작
        Write-Host "🔧 백엔드 서버 시작..." -ForegroundColor Yellow
        Start-Process PowerShell -ArgumentList "-Command", ".\gradlew.bat bootRun --no-daemon" -WindowStyle Minimized
        Start-Sleep 5
        
        # 프론트엔드 시작
        Write-Host "🎨 프론트엔드 서버 시작..." -ForegroundColor Yellow
        Start-Process PowerShell -ArgumentList "-Command", "cd frontend; npm run dev" -WindowStyle Normal
    }
    
    Write-Host "✅ 개발 환경 시작 완료!" -ForegroundColor Green
    Write-Host "🌐 접속 URL:" -ForegroundColor Cyan
    Write-Host "  • 프론트엔드: http://localhost:5173" -ForegroundColor White
    Write-Host "  • 백엔드 API: http://localhost:8080/api" -ForegroundColor White
    Write-Host "  • Swagger UI: http://localhost:8080/swagger-ui.html" -ForegroundColor White
}

# 환경 정리
function Clean-Environment {
    Write-Host "🧹 개발 환경 정리..." -ForegroundColor Yellow
    
    if ($Docker) {
        docker-compose down
        docker system prune -f
    }
    
    if (Test-Path "build") {
        Remove-Item -Recurse -Force "build"
        Write-Host "  ✅ build 디렉토리 정리" -ForegroundColor Green
    }
    
    if (Test-Path "frontend/node_modules") {
        Write-Host "  🗑️ node_modules 정리 중..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force "frontend/node_modules"
        Write-Host "  ✅ node_modules 정리 완료" -ForegroundColor Green
    }
    
    Write-Host "✅ 환경 정리 완료!" -ForegroundColor Green
}

# 메인 실행 로직
Load-Environment

switch ($Action.ToLower()) {
    "status" {
        Check-JavaEnvironment
        Check-NodeEnvironment
        Check-DockerEnvironment
        Check-ProjectStatus
    }
    "start" {
        Check-JavaEnvironment
        Check-NodeEnvironment
        Start-Development
    }
    "clean" {
        Clean-Environment
    }
    "build" {
        Write-Host "🏗️ 프로젝트 빌드..." -ForegroundColor Green
        if ($Java21) {
            Write-Host "☕ Java 21 기능 활성화..." -ForegroundColor Cyan
        }
        & ".\build-deploy.ps1"
    }
    default {
        Write-Host "사용법: .\dev-environment.ps1 [-Action status|start|clean|build] [-Java21] [-Docker] [-Clean]" -ForegroundColor Yellow
        Write-Host "예시:" -ForegroundColor Gray
        Write-Host "  .\dev-environment.ps1 -Action status      # 환경 상태 확인" -ForegroundColor Gray
        Write-Host "  .\dev-environment.ps1 -Action start       # 개발 환경 시작" -ForegroundColor Gray
        Write-Host "  .\dev-environment.ps1 -Action start -Docker # Docker로 시작" -ForegroundColor Gray
        Write-Host "  .\dev-environment.ps1 -Action build -Java21 # Java 21 빌드" -ForegroundColor Gray
        Write-Host "  .\dev-environment.ps1 -Action clean       # 환경 정리" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "🎯 개발 환경 관리 완료!" -ForegroundColor Green