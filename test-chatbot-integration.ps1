# ==========================================
# 챗봇 통합 테스트 스크립트
# Context7 방식: 최소 변경으로 최대 효과
# ==========================================

Write-Host "🧪 챗봇 통합 테스트 시작..." -ForegroundColor Green
Write-Host ""

# Step 1: 기존 서버 상태 확인
Write-Host "📊 현재 서버 상태 확인 중..." -ForegroundColor Cyan

$javaRunning = netstat -an | Select-String ":8080" | Select-String "LISTENING"
$pythonRunning = netstat -an | Select-String ":8000" | Select-String "LISTENING"

if ($javaRunning) {
    Write-Host "  ✅ Java 서버 실행 중 (8080)" -ForegroundColor Green
} else {
    Write-Host "  ❌ Java 서버 미실행 - 먼저 서버를 시작하세요" -ForegroundColor Red
    Write-Host "     명령: java -cp build\classes com.globalcarelink.PlainJavaServer" -ForegroundColor Yellow
    return
}

if ($pythonRunning) {
    Write-Host "  ✅ Python 챗봇 실행 중 (8000)" -ForegroundColor Green
    $chatbotAvailable = $true
} else {
    Write-Host "  ⚠️  Python 챗봇 미실행 - 프록시 에러 테스트로 진행" -ForegroundColor Yellow
    $chatbotAvailable = $false
}

Write-Host ""

# Step 2: 기본 API 테스트
Write-Host "🔧 기본 API 엔드포인트 테스트..." -ForegroundColor Blue

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/status" -Method GET
    Write-Host "  ✅ 기본 API 정상: $($response.service)" -ForegroundColor Green
} catch {
    Write-Host "  ❌ 기본 API 오류: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: 챗봇 프록시 테스트
Write-Host "🤖 챗봇 프록시 테스트..." -ForegroundColor Magenta

if ($chatbotAvailable) {
    try {
        # 챗봇 헬스체크 (프록시를 통해)
        $chatbotResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/chatbot/health" -Method GET -TimeoutSec 5
        Write-Host "  ✅ 챗봇 프록시 성공!" -ForegroundColor Green
        Write-Host "     응답: $($chatbotResponse | ConvertTo-Json -Compress)" -ForegroundColor Gray
    } catch {
        Write-Host "  ⚠️  챗봇 프록시 연결 문제: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    try {
        # 챗봇 없을 때 에러 응답 테스트
        $errorResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/chatbot/test" -Method GET -TimeoutSec 5
        Write-Host "  ❓ 예상치 못한 성공 응답" -ForegroundColor Yellow
    } catch {
        Write-Host "  ✅ 챗봇 미연결 시 적절한 에러 응답 확인" -ForegroundColor Green
        Write-Host "     에러: $($_.Exception.Message)" -ForegroundColor Gray
    }
}

Write-Host ""

# Step 4: 프론트엔드 연동 가이드
Write-Host "⚛️  프론트엔드 연동 가이드:" -ForegroundColor Blue
Write-Host "  📁 모든 API는 동일한 도메인에서 접근:" -ForegroundColor White
Write-Host "     - 게시판: /api/boards/*" -ForegroundColor Gray
Write-Host "     - 구인구직: /api/jobs/*" -ForegroundColor Gray  
Write-Host "     - 리뷰: /api/reviews/*" -ForegroundColor Gray
Write-Host "     - 챗봇: /api/chatbot/*" -ForegroundColor Gray
Write-Host ""
Write-Host "  🔧 프론트엔드 설정 (axios 예시):" -ForegroundColor White
Write-Host "     const api = axios.create({ baseURL: '/api' })" -ForegroundColor Gray
Write-Host "     api.get('/boards') // 게시판" -ForegroundColor Gray  
Write-Host "     api.post('/chatbot/chat', data) // 챗봇" -ForegroundColor Gray

Write-Host ""

# Step 5: 개발 환경 안내  
Write-Host "🚀 개발 환경 시작 방법:" -ForegroundColor Green
Write-Host "  1️⃣  Java + React만: .\start-hybrid-dev.ps1" -ForegroundColor White
Write-Host "  2️⃣  Java + Python + React: .\start-unified-dev.ps1" -ForegroundColor White
Write-Host "  3️⃣  기존 방식: .\start-dev.ps1" -ForegroundColor White

Write-Host ""
Write-Host "✨ 챗봇 통합 테스트 완료!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 핵심 장점:" -ForegroundColor Cyan
Write-Host "  • 단일 API 도메인으로 CORS 문제 없음" -ForegroundColor Gray
Write-Host "  • 기존 코드 변경 없이 챗봇 통합" -ForegroundColor Gray
Write-Host "  • Python 챗봇 유무에 관계없이 동작" -ForegroundColor Gray
Write-Host "  • 점진적 확장 가능" -ForegroundColor Gray