# ==========================================
# 배포용 통합 빌드 스크립트
# 프론트엔드 + 백엔드 → 단일 JAR 파일
# ==========================================

Write-Host "📦 배포용 통합 빌드 시작..." -ForegroundColor Green
Write-Host ""

# 현재 디렉터리 확인
$currentPath = Get-Location
Write-Host "📁 현재 경로: $currentPath" -ForegroundColor Cyan

# 빌드 시작 시간 기록
$startTime = Get-Date

try {
    # Step 1: 프론트엔드 의존성 설치
    Write-Host "📥 프론트엔드 의존성 설치 중..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "npm install 실패"
    }
    Set-Location ..
    Write-Host "  ✅ 의존성 설치 완료" -ForegroundColor Green
    Write-Host ""

    # Step 2: 프론트엔드 빌드
    Write-Host "⚛️  프론트엔드 빌드 중..." -ForegroundColor Blue
    Set-Location frontend
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "프론트엔드 빌드 실패"
    }
    Set-Location ..
    Write-Host "  ✅ 프론트엔드 빌드 완료" -ForegroundColor Green
    Write-Host ""

    # Step 3: 정적 파일 확인
    $staticPath = "src/main/resources/static"
    if (Test-Path $staticPath) {
        $staticFiles = Get-ChildItem $staticPath -Recurse | Measure-Object
        Write-Host "📁 정적 파일 생성 확인: $($staticFiles.Count)개 파일" -ForegroundColor Cyan
    } else {
        throw "정적 파일이 생성되지 않았습니다: $staticPath"
    }

    # Step 4: 백엔드 빌드 (Gradle)
    Write-Host "🔧 백엔드 JAR 빌드 중..." -ForegroundColor Yellow
    ./gradlew clean bootJar
    if ($LASTEXITCODE -ne 0) {
        throw "백엔드 빌드 실패"
    }
    Write-Host "  ✅ 백엔드 빌드 완료" -ForegroundColor Green
    Write-Host ""

    # Step 5: 빌드 결과 확인
    $jarPath = "build/libs"
    if (Test-Path $jarPath) {
        $jarFiles = Get-ChildItem $jarPath -Filter "*.jar"
        if ($jarFiles.Count -gt 0) {
            $mainJar = $jarFiles | Where-Object { $_.Name -notlike "*-plain.jar" } | Select-Object -First 1
            $jarSize = [math]::Round($mainJar.Length / 1MB, 2)
            
            Write-Host "📦 빌드 결과:" -ForegroundColor Green
            Write-Host "  📄 JAR 파일: $($mainJar.Name)" -ForegroundColor White
            Write-Host "  📊 파일 크기: ${jarSize}MB" -ForegroundColor White
            Write-Host "  📁 경로: $($mainJar.FullName)" -ForegroundColor Gray
        } else {
            throw "JAR 파일을 찾을 수 없습니다"
        }
    } else {
        throw "빌드 디렉터리를 찾을 수 없습니다: $jarPath"
    }

    # 빌드 시간 계산
    $endTime = Get-Date
    $buildTime = $endTime - $startTime
    $minutes = [math]::Floor($buildTime.TotalMinutes)
    $seconds = [math]::Floor($buildTime.TotalSeconds % 60)

    Write-Host ""
    Write-Host "🎉 배포용 빌드 완료!" -ForegroundColor Green
    Write-Host "⏱️  빌드 시간: ${minutes}분 ${seconds}초" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🚀 실행 방법:" -ForegroundColor Yellow
    Write-Host "  java -jar $($mainJar.FullName)" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 접속 URL (빌드 실행 후):" -ForegroundColor Yellow
    Write-Host "  • 통합 서비스: http://localhost:8080" -ForegroundColor White
    Write-Host "  • API 문서: http://localhost:8080/swagger-ui.html" -ForegroundColor White
    Write-Host "  • H2 콘솔: http://localhost:8080/h2-console" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 배포 팁:" -ForegroundColor Cyan
    Write-Host "  • 운영 환경에서는 -Dspring.profiles.active=prod 옵션 사용" -ForegroundColor Gray
    Write-Host "  • 메모리 설정: -Xmx1g -Xms512m 권장" -ForegroundColor Gray
    Write-Host "  • 로그 설정: -Dlogging.file.name=elderberry.log" -ForegroundColor Gray

} catch {
    Write-Host ""
    Write-Host "❌ 빌드 실패: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔍 문제 해결 방법:" -ForegroundColor Yellow
    Write-Host "  1. Node.js와 npm이 설치되어 있는지 확인" -ForegroundColor Gray
    Write-Host "  2. Java 21이 설치되어 있는지 확인" -ForegroundColor Gray
    Write-Host "  3. 인터넷 연결 상태 확인 (의존성 다운로드)" -ForegroundColor Gray
    Write-Host "  4. 디스크 공간 확인" -ForegroundColor Gray
    Write-Host "  5. 권한 문제가 있다면 관리자 권한으로 실행" -ForegroundColor Gray
    
    exit 1
} finally {
    # 원래 디렉터리로 복원
    Set-Location $currentPath
}