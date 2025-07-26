# ==========================================
# 엘더베리 Docker 개발 환경 관리 스크립트
# Java 21 + React 18 + PostgreSQL + Redis
# ==========================================

param(
    [string]$Action = "help",
    [switch]$Build,
    [switch]$Clean,
    [switch]$Logs,
    [switch]$Production
)

Write-Host "🐳 엘더베리 Docker 개발 환경" -ForegroundColor Blue
Write-Host "============================" -ForegroundColor Blue

# 환경변수 파일 확인
function Check-EnvFiles {
    $envFiles = @(".env", "frontend/.env")
    $missing = @()
    
    foreach ($file in $envFiles) {
        if (!(Test-Path $file)) {
            $missing += $file
        }
    }
    
    if ($missing.Count -gt 0) {
        Write-Host "⚠️  환경변수 파일이 없습니다:" -ForegroundColor Yellow
        foreach ($file in $missing) {
            Write-Host "  • $file (예제: $file.example)" -ForegroundColor Gray
        }
        Write-Host ""
        Write-Host "환경변수 파일을 생성하시겠습니까? (y/N)" -ForegroundColor Yellow
        $response = Read-Host
        
        if ($response -eq "y" -or $response -eq "Y") {
            foreach ($file in $missing) {
                $exampleFile = "$file.example"
                if (Test-Path $exampleFile) {
                    Copy-Item $exampleFile $file
                    Write-Host "  ✅ $file 생성됨" -ForegroundColor Green
                }
            }
        }
    }
}

# Docker 상태 확인
function Check-DockerStatus {
    Write-Host "🔍 Docker 서비스 상태..." -ForegroundColor Cyan
    
    try {
        $containers = docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Select-String "elderberry"
        
        if ($containers) {
            Write-Host "실행 중인 컨테이너:" -ForegroundColor Green
            $containers | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
        } else {
            Write-Host "  ⭕ 실행 중인 엘더베리 컨테이너가 없습니다" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ❌ Docker가 실행되지 않음" -ForegroundColor Red
        return $false
    }
    return $true
}

# 개발 환경 시작
function Start-DockerDev {
    Write-Host "🚀 Docker 개발 환경 시작..." -ForegroundColor Green
    
    Check-EnvFiles
    
    if ($Build) {
        Write-Host "🔨 이미지 빌드 중..." -ForegroundColor Yellow
        docker-compose build --no-cache
    }
    
    Write-Host "🐳 컨테이너 시작 중..." -ForegroundColor Cyan
    docker-compose up -d postgres redis
    
    Start-Sleep 10
    
    Write-Host "🔧 백엔드 서비스 시작..." -ForegroundColor Yellow
    docker-compose up -d backend
    
    Start-Sleep 15
    
    Write-Host "🎨 프론트엔드 서비스 시작..." -ForegroundColor Yellow
    docker-compose up -d frontend
    
    Write-Host ""
    Write-Host "✅ Docker 개발 환경 시작 완료!" -ForegroundColor Green
    Write-Host "🌐 접속 URL:" -ForegroundColor Cyan
    Write-Host "  • 프론트엔드: http://localhost:5173" -ForegroundColor White
    Write-Host "  • 백엔드 API: http://localhost:8080/api" -ForegroundColor White
    Write-Host "  • Swagger UI: http://localhost:8080/swagger-ui.html" -ForegroundColor White
    Write-Host "  • H2 콘솔: http://localhost:8080/h2-console" -ForegroundColor White
    Write-Host ""
    Write-Host "📊 상태 확인: docker-compose ps" -ForegroundColor Gray
    Write-Host "📋 로그 확인: .\docker-dev.ps1 -Action logs" -ForegroundColor Gray
}

# 프로덕션 환경 시작
function Start-Production {
    Write-Host "🚀 프로덕션 환경 시작..." -ForegroundColor Green
    
    Write-Host "🔨 프로덕션 빌드..." -ForegroundColor Yellow
    docker-compose --profile production build
    
    Write-Host "🐳 프로덕션 서비스 시작..." -ForegroundColor Cyan
    docker-compose --profile production up -d
    
    Write-Host ""
    Write-Host "✅ 프로덕션 환경 시작 완료!" -ForegroundColor Green
    Write-Host "🌐 접속 URL:" -ForegroundColor Cyan
    Write-Host "  • 서비스: http://localhost" -ForegroundColor White
    Write-Host "  • HTTPS: https://localhost" -ForegroundColor White
}

# 환경 중지
function Stop-DockerDev {
    Write-Host "🛑 Docker 환경 중지..." -ForegroundColor Yellow
    docker-compose down
    Write-Host "✅ 모든 컨테이너 중지됨" -ForegroundColor Green
}

# 환경 정리
function Clean-DockerDev {
    Write-Host "🧹 Docker 환경 정리..." -ForegroundColor Yellow
    
    Write-Host "컨테이너 및 볼륨을 정리하시겠습니까? (y/N)" -ForegroundColor Yellow
    $response = Read-Host
    
    if ($response -eq "y" -or $response -eq "Y") {
        docker-compose down -v --remove-orphans
        docker system prune -f
        docker volume prune -f
        Write-Host "✅ Docker 환경 정리 완료" -ForegroundColor Green
    }
}

# 로그 확인
function Show-Logs {
    Write-Host "📋 Docker 로그..." -ForegroundColor Cyan
    docker-compose logs --tail=50 -f
}

# 메인 실행 로직
switch ($Action.ToLower()) {
    "start" {
        if ($Production) {
            Start-Production
        } else {
            Start-DockerDev
        }
    }
    "stop" {
        Stop-DockerDev
    }
    "restart" {
        Stop-DockerDev
        Start-Sleep 3
        Start-DockerDev
    }
    "status" {
        Check-DockerStatus
        docker-compose ps
    }
    "logs" {
        Show-Logs
    }
    "clean" {
        Clean-DockerDev
    }
    "build" {
        Write-Host "🔨 Docker 이미지 빌드..." -ForegroundColor Yellow
        docker-compose build --no-cache
        Write-Host "✅ 빌드 완료!" -ForegroundColor Green
    }
    default {
        Write-Host "🐳 Docker 개발 환경 사용법:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "기본 명령어:" -ForegroundColor Yellow
        Write-Host "  .\docker-dev.ps1 -Action start          # 개발 환경 시작" -ForegroundColor Gray
        Write-Host "  .\docker-dev.ps1 -Action start -Build   # 빌드 후 시작" -ForegroundColor Gray
        Write-Host "  .\docker-dev.ps1 -Action start -Production # 프로덕션 환경" -ForegroundColor Gray
        Write-Host "  .\docker-dev.ps1 -Action stop           # 환경 중지" -ForegroundColor Gray
        Write-Host "  .\docker-dev.ps1 -Action restart        # 환경 재시작" -ForegroundColor Gray
        Write-Host "  .\docker-dev.ps1 -Action status         # 상태 확인" -ForegroundColor Gray
        Write-Host "  .\docker-dev.ps1 -Action logs           # 로그 확인" -ForegroundColor Gray
        Write-Host "  .\docker-dev.ps1 -Action build          # 이미지 빌드" -ForegroundColor Gray
        Write-Host "  .\docker-dev.ps1 -Action clean          # 환경 정리" -ForegroundColor Gray
        Write-Host ""
        Write-Host "옵션:" -ForegroundColor Yellow
        Write-Host "  -Build        이미지 다시 빌드" -ForegroundColor Gray
        Write-Host "  -Clean        캐시 및 볼륨 정리" -ForegroundColor Gray
        Write-Host "  -Production   프로덕션 모드" -ForegroundColor Gray
    }
}

Write-Host ""