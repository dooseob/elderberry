# ==========================================
# 엘더베리 백엔드 서버 시작 스크립트
# Java 21 LTS 환경 최적화
# ==========================================

Write-Host "🚀 Elderberry Backend Server (Java 21) 시작..." -ForegroundColor Green

# Create necessary directories
if (!(Test-Path "logs")) { New-Item -ItemType Directory -Path "logs" }
if (!(Test-Path "data")) { New-Item -ItemType Directory -Path "data" }

# Java 버전 확인
Write-Host "☕ Java 버전 확인..." -ForegroundColor Yellow
java -version
Write-Host ""

# JAR 파일 존재 확인
$jarFile = Get-ChildItem -Path "build/libs" -Filter "*.jar" -ErrorAction SilentlyContinue | Select-Object -First 1

if ($jarFile) {
    Write-Host "Found JAR file: $($jarFile.Name)" -ForegroundColor Yellow
    Write-Host "Starting Spring Boot application..." -ForegroundColor Yellow
    
    java -Dspring.profiles.active=dev `
         -Dlogging.level.com.globalcarelink=DEBUG `
         -Dserver.port=8080 `
         -Dspring.datasource.url="jdbc:h2:file:./data/elderberry" `
         -jar $jarFile.FullName
} else {
    Write-Host "No JAR file found. Building project first..." -ForegroundColor Yellow
    
    # Try to build with gradlew if available
    if (Test-Path "gradlew.bat") {
        Write-Host "Building with Gradle..." -ForegroundColor Yellow
        Write-Host "🏠 Gradle 빌드 (Java 21 환경)..." -ForegroundColor Cyan
        .\gradlew.bat clean build --no-daemon
        
        # Check again for JAR file
        $jarFile = Get-ChildItem -Path "build/libs" -Filter "*.jar" -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($jarFile) {
            Write-Host "Build successful. Starting application..." -ForegroundColor Green
            java -Dspring.profiles.active=dev `
                 -Dlogging.level.com.globalcarelink=DEBUG `
                 -Dserver.port=8080 `
                 -Dspring.datasource.url="jdbc:h2:file:./data/elderberry" `
                 -jar $jarFile.FullName
        } else {
            Write-Host "Build failed or no JAR produced." -ForegroundColor Red
        }
    } else {
        Write-Host "No Gradle wrapper found. Please build the project manually." -ForegroundColor Red
        Write-Host "You can use an IDE like IntelliJ IDEA or Eclipse to build and run the project." -ForegroundColor Yellow
    }
} 