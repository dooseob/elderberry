#!/bin/bash

# 프론트엔드 개발 모드 시작 스크립트
# 백엔드와 독립적으로 개발 서버 실행

echo "🎨 프론트엔드 개발 서버 시작 중..."

# 1. 기존 프론트엔드 프로세스 정리
echo "1️⃣ 기존 프론트엔드 프로세스 정리 중..."
pkill -f "vite" 2>/dev/null || true
lsof -ti:5173 | head -5 | xargs -r kill -9 2>/dev/null || true

# 2. 프론트엔드 디렉토리로 이동
cd frontend

# 3. 의존성 확인
echo "2️⃣ 의존성 확인 중..."
if [ ! -d "node_modules" ]; then
    echo "   node_modules가 없습니다. npm install 실행 중..."
    npm install --legacy-peer-deps
fi

# 4. 개발 서버 시작
echo "3️⃣ Vite 개발 서버 시작 중..."
nohup npm run dev > ../logs/frontend.log 2>&1 &

# 5. 프론트엔드 시작 대기
echo "4️⃣ 프론트엔드 시작 대기 중..."
cd ..
for i in {1..20}; do
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo "✅ 프론트엔드 서버 시작 완료!"
        echo "   URL: http://localhost:5173"
        echo "   개발자 도구: F12 → Console 탭에서 에러 확인"
        exit 0
    fi
    echo "   대기 중... ($i/20)"
    sleep 3
done

echo "❌ 프론트엔드 서버 시작 실패. logs/frontend.log 확인 필요"
exit 1