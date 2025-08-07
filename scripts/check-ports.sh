#!/bin/bash
# 엘더베리 프로젝트 포트 상태 확인 스크립트

echo "🔍 엘더베리 포트 사용 현황 분석"
echo "=================================="

# 프론트엔드 포트 확인 (5173, 5174)
echo "📱 프론트엔드 서버 상태:"
if ss -tulpn | grep -q ":5173"; then
    echo "✅ 포트 5173: 사용 중 (일반적으로 Docker 또는 Vite)"
    ss -tulpn | grep ":5173" | while read line; do
        echo "   → $line"
    done
else
    echo "⭕ 포트 5173: 사용 가능"
fi

if ss -tulpn | grep -q ":5174"; then
    echo "✅ 포트 5174: 사용 중 (일반적으로 Vite 대체 포트)"
    ss -tulpn | grep ":5174" | while read line; do
        echo "   → $line"
    done
else
    echo "⭕ 포트 5174: 사용 가능"
fi

# 백엔드 포트 확인 (8080)
echo ""
echo "🔧 백엔드 서버 상태:"
if ss -tulpn | grep -q ":8080"; then
    echo "✅ 포트 8080: 사용 중 (Spring Boot)"
    ss -tulpn | grep ":8080" | while read line; do
        echo "   → $line"
    done
else
    echo "⭕ 포트 8080: 사용 가능"
fi

# Redis 포트 확인 (6379)
echo ""
echo "💾 Redis 서버 상태:"
if ss -tulpn | grep -q ":6379"; then
    echo "✅ 포트 6379: 사용 중 (Redis)"
    ss -tulpn | grep ":6379" | while read line; do
        echo "   → $line"
    done
else
    echo "⭕ 포트 6379: 사용 가능"
fi

# Docker 컨테이너 확인
echo ""
echo "🐳 Docker 컨테이너 상태:"
if command -v docker &> /dev/null; then
    CONTAINERS=$(docker ps --filter "name=elderberry" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}")
    if [ "$CONTAINERS" ]; then
        echo "$CONTAINERS"
    else
        echo "⭕ 실행 중인 엘더베리 컨테이너 없음"
    fi
else
    echo "⚠️  Docker가 설치되지 않음"
fi

# 권장사항
echo ""
echo "💡 권장사항:"
echo "   - 개발 시: 하나의 프론트엔드만 실행 (Docker 또는 로컬)"
echo "   - Docker 중지: docker stop elderberry-frontend-dev"
echo "   - 로컬 실행: cd frontend && npm run dev"
echo "   - 포트 5173 우선 사용 권장 (표준 Vite 포트)"