#!/bin/bash
# 개발 서버 중지 스크립트

echo "🛑 개발 서버 중지 중..."
echo "=============================="

# PID 파일에서 프로세스 종료
if [ -f logs/backend.pid ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo "🔧 백엔드 서버 중지 중... (PID: $BACKEND_PID)"
        kill $BACKEND_PID
    fi
    rm -f logs/backend.pid
fi

if [ -f logs/frontend.pid ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "⚛️  프론트엔드 서버 중지 중... (PID: $FRONTEND_PID)"
        kill $FRONTEND_PID
    fi
    rm -f logs/frontend.pid
fi

# 관련 프로세스 강제 종료
echo "🧹 관련 프로세스 정리 중..."
pkill -f "vite" 2>/dev/null || true
pkill -f "gradlew.*bootRun" 2>/dev/null || true
pkill -f "npm.*dev" 2>/dev/null || true

# Docker Redis 중지
echo "🐳 Redis Docker 중지 중..."
docker-compose -f docker-compose.simple.yml down > /dev/null 2>&1

echo ""
echo "✅ 개발 서버 중지 완료!"
echo ""