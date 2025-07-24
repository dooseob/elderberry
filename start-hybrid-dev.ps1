# ==========================================
# 하이브리드 개발 환경 시작 스크립트
# 프론트엔드(5173) + 백엔드(8080) 분리 개발
# ==========================================

Write-Host "🚀 하이브리드 개발 환경 시작 중..." -ForegroundColor Green
Write-Host ""

# 현재 디렉터리 확인
$currentPath = Get-Location
Write-Host "📁 현재 경로: $currentPath" -ForegroundColor Cyan

# 필수 파일 존재 확인
$requiredFiles = @(
    "build.gradle.kts",
    "frontend/package.json",
    "frontend/vite.config.ts"
)

foreach ($file in $requiredFiles) {
    if (-Not (Test-Path $file)) {
        Write-Host "❌ 필수 파일이 없습니다: $file" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ 프로젝트 구조 확인 완료" -ForegroundColor Green
Write-Host ""

# 백엔드 서버 시작 (별도 터미널)
Write-Host "🔧 백엔드 API 서버 시작 중..." -ForegroundColor Yellow
$backendJob = Start-Process powershell -ArgumentList @(
    "-NoExit", 
    "-Command", 
    "Write-Host '🔧 백엔드 API 서버 (Plain Java)' -ForegroundColor Yellow; java -cp build\classes com.globalcarelink.PlainJavaServer"
) -PassThru

Start-Sleep -Seconds 3

# 프론트엔드 개발 서버 시작 (별도 터미널)  
Write-Host "⚛️  프론트엔드 개발 서버 시작 중..." -ForegroundColor Blue
$frontendJob = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command", 
    "Write-Host '⚛️  프론트엔드 개발 서버 (React + Vite)' -ForegroundColor Blue; cd frontend; npm run dev"
) -PassThru

# 잠시 대기 후 상태 확인
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "🎯 하이브리드 개발 환경 실행 중!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 서비스 정보:" -ForegroundColor Cyan
Write-Host "  🌐 프론트엔드: http://localhost:5173" -ForegroundColor White
Write-Host "  🔧 백엔드 API: http://localhost:8080/api" -ForegroundColor White
Write-Host "  📚 Swagger UI: http://localhost:8080/swagger-ui.html" -ForegroundColor White
Write-Host "  🗄️  H2 Console: http://localhost:8080/h2-console" -ForegroundColor White
Write-Host ""
Write-Host "💡 개발 팁:" -ForegroundColor Yellow
Write-Host "  • 프론트엔드 변경사항은 즉시 반영됩니다 (Hot Reload)" -ForegroundColor Gray
Write-Host "  • API 호출은 자동으로 프록시됩니다 (/api/* → localhost:8080)" -ForegroundColor Gray
Write-Host "  • 백엔드 변경시에는 서버를 재시작하세요" -ForegroundColor Gray
Write-Host ""
Write-Host "🛑 종료하려면 이 창에서 Ctrl+C를 누르세요" -ForegroundColor Red
Write-Host ""

# 프로세스 모니터링 및 정리
try {
    Write-Host "⏱️  서버 모니터링 중... (Ctrl+C로 종료)" -ForegroundColor Magenta
    
    while ($true) {
        Start-Sleep -Seconds 10
        
        # 프로세스 상태 확인
        if ($backendJob -and $backendJob.HasExited) {
            Write-Host "⚠️  백엔드 서버가 종료되었습니다." -ForegroundColor Yellow
        }
        
        if ($frontendJob -and $frontendJob.HasExited) {
            Write-Host "⚠️  프론트엔드 서버가 종료되었습니다." -ForegroundColor Yellow
        }
    }
}
catch {
    Write-Host ""
    Write-Host "🛑 개발 환경 종료 중..." -ForegroundColor Red
}
finally {
    # 프로세스 정리
    Write-Host "🧹 프로세스 정리 중..." -ForegroundColor Yellow
    
    if ($backendJob -and -not $backendJob.HasExited) {
        Stop-Process -Id $backendJob.Id -Force -ErrorAction SilentlyContinue
        Write-Host "  ✅ 백엔드 서버 종료" -ForegroundColor Green
    }
    
    if ($frontendJob -and -not $frontendJob.HasExited) {
        Stop-Process -Id $frontendJob.Id -Force -ErrorAction SilentlyContinue
        Write-Host "  ✅ 프론트엔드 서버 종료" -ForegroundColor Green
    }
    
    # Node.js 프로세스 정리 (Vite dev server)
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*vite*" -or $_.CommandLine -like "*dev*"
    } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-Host ""
    Write-Host "👋 하이브리드 개발 환경이 종료되었습니다." -ForegroundColor Green
}