#!/bin/bash
# 개발 서버 상태 확인 스크립트

echo "📊 개발 서버 상태 확인"
echo "======================"

# 포트 상태 확인
echo ""
echo "🌐 포트 상태:"

if netstat -an 2>/dev/null | grep -q ":8080.*LISTEN"; then
    echo "   ✅ 백엔드 (8080): 실행중"
    
    # API 헬스 체크
    if curl -s http://localhost:8080/actuator/health >/dev/null 2>&1; then
        echo "      └─ Health Check: OK"
    else
        echo "      └─ Health Check: 시작 중..."
    fi
else
    echo "   ❌ 백엔드 (8080): 중지됨"
fi

if netstat -an 2>/dev/null | grep -q ":5173.*LISTEN"; then
    echo "   ✅ 프론트엔드 (5173): 실행중"
elif netstat -an 2>/dev/null | grep -q ":5174.*LISTEN"; then
    echo "   ✅ 프론트엔드 (5174): 실행중"
else
    echo "   ❌ 프론트엔드: 중지됨"
fi

if netstat -an 2>/dev/null | grep -q ":6379.*LISTEN"; then
    echo "   ✅ Redis (6379): 실행중"
    
    # Redis 연결 테스트
    if docker exec elderberry-redis-dev redis-cli -a elderberry123! ping >/dev/null 2>&1; then
        echo "      └─ Redis Ping: PONG"
    else
        echo "      └─ Redis Ping: 연결 실패"
    fi
else
    echo "   ❌ Redis (6379): 중지됨"
fi

if netstat -an 2>/dev/null | grep -q ":8081.*LISTEN"; then
    echo "   ✅ Redis UI (8081): 실행중"
else
    echo "   ❌ Redis UI (8081): 중지됨"
fi

# PID 상태 확인
echo ""
echo "🔍 프로세스 상태:"

if [ -f logs/backend.pid ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo "   ✅ 백엔드 PID: $BACKEND_PID (실행중)"
    else
        echo "   ⚠️  백엔드 PID: $BACKEND_PID (종료됨)"
        rm -f logs/backend.pid
    fi
else
    echo "   ❌ 백엔드: PID 파일 없음"
fi

if [ -f logs/frontend.pid ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "   ✅ 프론트엔드 PID: $FRONTEND_PID (실행중)"
    else
        echo "   ⚠️  프론트엔드 PID: $FRONTEND_PID (종료됨)"
        rm -f logs/frontend.pid
    fi
else
    echo "   ❌ 프론트엔드: PID 파일 없음"
fi

# 로그 파일 상태
echo ""
echo "📋 로그 파일:"
if [ -f logs/backend.log ]; then
    BACKEND_SIZE=$(du -h logs/backend.log | cut -f1)
    echo "   📄 backend.log: $BACKEND_SIZE"
else
    echo "   ❌ backend.log: 파일 없음"
fi

if [ -f logs/frontend.log ]; then
    FRONTEND_SIZE=$(du -h logs/frontend.log | cut -f1)
    echo "   📄 frontend.log: $FRONTEND_SIZE"
else
    echo "   ❌ frontend.log: 파일 없음"
fi

echo ""
echo "💡 명령어:"
echo "   • 서버 시작: ./dev-start.sh"
echo "   • 서버 중지: ./dev-stop.sh"
echo "   • 백엔드 로그: tail -f logs/backend.log"
echo "   • 프론트엔드 로그: tail -f logs/frontend.log"
echo ""