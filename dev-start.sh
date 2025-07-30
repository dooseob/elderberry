#!/bin/bash
# 엘더베리 개발 환경 시간절약 스크립트
# 프론트엔드와 백엔드를 동시에 백그라운드로 실행

echo "🚀 엘더베리 개발 환경 시작 중..."
echo "========================================="

# 기존 프로세스 정리
echo "🧹 기존 프로세스 정리 중..."
pkill -f "vite" 2>/dev/null || true
pkill -f "gradlew.*bootRun" 2>/dev/null || true

# Docker Redis 시작
echo "🐳 Redis Docker 시작 중..."
docker-compose -f docker-compose.simple.yml up -d > /dev/null 2>&1
sleep 3

# 로그 디렉토리 생성
mkdir -p logs

echo ""
echo "🔧 백엔드 서버 시작 중... (백그라운드)"
# 백엔드 백그라운드 실행
nohup ./gradlew bootRun > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "   └─ PID: $BACKEND_PID (로그: logs/backend.log)"

echo ""
echo "⚛️  프론트엔드 서버 시작 중... (백그라운드)"
# 프론트엔드 백그라운드 실행
cd frontend
nohup npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   └─ PID: $FRONTEND_PID (로그: logs/frontend.log)"
cd ..

# PID 파일 저장
echo $BACKEND_PID > logs/backend.pid
echo $FRONTEND_PID > logs/frontend.pid

echo ""
echo "⏱️  서버 시작 대기 중... (15초)"
sleep 15

echo ""
echo "📊 서버 상태 확인..."

# 포트 상태 확인
if netstat -an 2>/dev/null | grep -q ":8080.*LISTEN"; then
    echo "   ✅ 백엔드: http://localhost:8080 (실행중)"
else
    echo "   ⚠️  백엔드: 시작 중... (logs/backend.log 확인)"
fi

if netstat -an 2>/dev/null | grep -q ":5173.*LISTEN"; then
    echo "   ✅ 프론트엔드: http://localhost:5173 (실행중)"
elif netstat -an 2>/dev/null | grep -q ":5174.*LISTEN"; then
    echo "   ✅ 프론트엔드: http://localhost:5174 (실행중)"
else
    echo "   ⚠️  프론트엔드: 시작 중... (logs/frontend.log 확인)"
fi

echo ""
echo "🎯 개발 환경 시작 완료!"
echo "========================================="
echo "📱 프론트엔드: http://localhost:5173 (또는 5174)"
echo "🔧 백엔드: http://localhost:8080"
echo "📊 H2 Console: http://localhost:8080/h2-console"
echo "🐳 Redis: localhost:6379 (password: elderberry123!)"
echo "🔍 Redis UI: http://localhost:8081 (admin/elderberry123!)"
echo ""
echo "📋 유용한 명령어:"
echo "   • 로그 확인: tail -f logs/backend.log"
echo "   • 로그 확인: tail -f logs/frontend.log"
echo "   • 서버 중지: ./dev-stop.sh"
echo "   • 서버 상태: ./dev-status.sh"
echo ""