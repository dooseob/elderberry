# ==========================================
# 엘더베리 프로젝트 - PowerShell 빌드 스크립트
# Java 21 환경에서 안정적 빌드
# ==========================================

Write-Host "🚀 엘더베리 프로젝트 빌드 시작..." -ForegroundColor Green

# Java 버전 확인
Write-Host "☕ Java 버전 확인..." -ForegroundColor Yellow
java -version

# Gradle 클린 빌드
Write-Host "🧹 Gradle Clean..." -ForegroundColor Yellow
.\gradlew clean --no-daemon

# 프론트엔드 빌드 포함한 전체 빌드
Write-Host "🏗️ 전체 빌드 시작..." -ForegroundColor Yellow
.\gradlew buildForDeploy --no-daemon

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 빌드 성공!" -ForegroundColor Green
    Write-Host "📦 생성된 JAR 파일:" -ForegroundColor Cyan
    Get-ChildItem -Path "build\libs\*.jar" | ForEach-Object {
        Write-Host "  - $($_.Name)" -ForegroundColor White
    }
} else {
    Write-Host "❌ 빌드 실패!" -ForegroundColor Red
    exit 1
}

Write-Host "🎯 빌드 완료!" -ForegroundColor Green