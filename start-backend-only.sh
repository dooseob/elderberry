#!/bin/bash

# 백엔드 독립 시작 스크립트
# 프론트엔드 빌드 없이 백엔드만 빠르게 시작

echo "🚀 백엔드 독립 시작 중..."

# 1. 기존 프로세스 정리
echo "1️⃣ 기존 프로세스 정리 중..."
pkill -f "bootRun" 2>/dev/null || true
lsof -ti:8080 | head -5 | xargs -r kill -9 2>/dev/null || true

# 2. Redis 상태 확인 및 시작
echo "2️⃣ Redis 상태 확인 중..."
if ! docker ps | grep -q redis; then
    echo "   Redis 시작 중..."
    docker run -d --name redis-cache -p 6379:6379 redis:alpine 2>/dev/null || true
fi

# 3. 백엔드만 시작 (프론트엔드 빌드 스킵)
echo "3️⃣ 백엔드 서버 시작 중..."
export SKIP_FRONTEND_BUILD=true
nohup ./gradlew bootRun --exclude-task buildFrontend > logs/backend.log 2>&1 &

# 4. 백엔드 시작 대기
echo "4️⃣ 백엔드 시작 대기 중..."
for i in {1..30}; do
    if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
        echo "✅ 백엔드 서버 시작 완료!"
        echo "   URL: http://localhost:8080"
        echo "   Health: http://localhost:8080/actuator/health"
        exit 0
    fi
    echo "   대기 중... ($i/30)"
    sleep 2
done

echo "❌ 백엔드 서버 시작 실패. logs/backend.log 확인 필요"
exit 1