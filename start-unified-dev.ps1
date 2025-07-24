# ==========================================
# 통합 개발 환경 시작 스크립트
# Java + Python + React 동시 실행
# ==========================================

Write-Host "🚀 통합 개발 환경 시작 중..." -ForegroundColor Green
Write-Host ""

# 현재 디렉터리 확인
$currentPath = Get-Location
Write-Host "📁 현재 경로: $currentPath" -ForegroundColor Cyan

# 서비스별 프로세스 ID 저장
$processes = @{}

try {
    # Step 1: Java 백엔드 시작
    Write-Host "🔧 Java 백엔드 시작 중..." -ForegroundColor Yellow
    $javaProcess = Start-Process powershell -ArgumentList @(
        "-NoExit", 
        "-Command", 
        "Write-Host '🔧 Java Backend (Main API)' -ForegroundColor Yellow; java -cp build\classes com.globalcarelink.PlainJavaServer"
    ) -PassThru
    $processes['java'] = $javaProcess
    Start-Sleep -Seconds 3

    # Step 2: Python 챗봇 시작 (별도 디렉터리가 있다고 가정)
    if (Test-Path "chatbot") {
        Write-Host "🤖 Python 챗봇 시작 중..." -ForegroundColor Magenta
        $pythonProcess = Start-Process powershell -ArgumentList @(
            "-NoExit",
            "-Command", 
            "Write-Host '🤖 Python Chatbot Service' -ForegroundColor Magenta; cd chatbot; python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
        ) -PassThru
        $processes['python'] = $pythonProcess
        Start-Sleep -Seconds 3
    } else {
        Write-Host "⚠️  챗봇 디렉터리가 없습니다. Java 프록시로 대체합니다." -ForegroundColor Yellow
    }

    # Step 3: React 프론트엔드 시작
    Write-Host "⚛️  React 프론트엔드 시작 중..." -ForegroundColor Blue
    $reactProcess = Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command", 
        "Write-Host '⚛️  React Frontend (Unified UI)' -ForegroundColor Blue; cd frontend; npm run dev"
    ) -PassThru
    $processes['react'] = $reactProcess
    Start-Sleep -Seconds 5

    Write-Host ""
    Write-Host "🎯 통합 개발 환경 실행 중!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 서비스 정보:" -ForegroundColor Cyan
    Write-Host "  🌐 통합 프론트엔드: http://localhost:5173" -ForegroundColor White
    Write-Host "  🔧 Java 백엔드: http://localhost:8080/api" -ForegroundColor White
    if ($processes.ContainsKey('python')) {
        Write-Host "  🤖 Python 챗봇: http://localhost:8000" -ForegroundColor White
        Write-Host "  💬 챗봇 API (프록시): http://localhost:8080/api/chatbot" -ForegroundColor White
    }
    Write-Host "  📚 Swagger UI: http://localhost:8080/swagger-ui.html" -ForegroundColor White
    Write-Host "  🗄️  H2 Console: http://localhost:8080/h2-console" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 통합 개발 팁:" -ForegroundColor Yellow
    Write-Host "  • 모든 API 호출은 /api/* 로 통일됩니다" -ForegroundColor Gray
    Write-Host "  • 챗봇 호출: /api/chatbot/* → Python 서비스로 프록시" -ForegroundColor Gray
    Write-Host "  • 기타 API: /api/* → Java 서비스로 라우팅" -ForegroundColor Gray
    Write-Host "  • 프론트엔드 변경사항은 즉시 반영됩니다" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🛑 종료하려면 이 창에서 Ctrl+C를 누르세요" -ForegroundColor Red
    Write-Host ""

    # 프로세스 모니터링
    Write-Host "⏱️  서비스 모니터링 중... (Ctrl+C로 종료)" -ForegroundColor Magenta
    
    while ($true) {
        Start-Sleep -Seconds 10
        
        # 각 프로세스 상태 확인
        foreach ($service in $processes.Keys) {
            $process = $processes[$service]
            if ($process -and $process.HasExited) {
                Write-Host "⚠️  $service 서비스가 종료되었습니다." -ForegroundColor Yellow
            }
        }
    }
}
catch {
    Write-Host ""
    Write-Host "🛑 통합 개발 환경 종료 중..." -ForegroundColor Red
}
finally {
    # 모든 프로세스 정리
    Write-Host "🧹 서비스 프로세스 정리 중..." -ForegroundColor Yellow
    
    foreach ($service in $processes.Keys) {
        $process = $processes[$service]
        if ($process -and -not $process.HasExited) {
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            Write-Host "  ✅ $service 서비스 종료" -ForegroundColor Green
        }
    }
    
    # 관련 Node.js/Python 프로세스 정리
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*vite*" -or $_.CommandLine -like "*dev*"
    } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*uvicorn*" -or $_.CommandLine -like "*chatbot*"
    } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-Host ""
    Write-Host "👋 통합 개발 환경이 종료되었습니다." -ForegroundColor Green
    Write-Host ""
    Write-Host "🔄 재시작 방법:" -ForegroundColor Cyan
    Write-Host "  .\start-unified-dev.ps1" -ForegroundColor White
}