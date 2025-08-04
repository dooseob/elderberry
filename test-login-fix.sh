#!/bin/bash

# 로그인 문제 수정 검증 테스트
# 451.md에서 발견된 문제들이 해결되었는지 확인

echo "🔍 로그인 문제 수정 검증 테스트 시작"
echo "========================================"

BASE_URL="http://localhost:8080"
TEST_USER='{"email": "test.domestic@example.com", "password": "Password123!", "rememberMe": false}'
WRONG_USER='{"email": "wrong@example.com", "password": "wrongpassword", "rememberMe": false}'

# Test 1: 올바른 API 경로 테스트
echo ""
echo "✅ Test 1: 올바른 API 경로 (/api/auth/login) 테스트"
echo "---------------------------------------------"
response=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "$TEST_USER")

http_code="${response: -3}"
body="${response%???}"

if [ "$http_code" = "200" ]; then
  echo "  ✅ 성공: HTTP 200 OK"
  echo "  📝 토큰 확인: $(echo "$body" | grep -o '"accessToken":"[^"]*' | head -c 60)..."
  echo "  📝 사용자 이름: $(echo "$body" | grep -o '"name":"[^"]*' | cut -d'"' -f4)"
else
  echo "  ❌ 실패: HTTP $http_code"
  echo "  📝 응답: $body"
fi

# Test 2: 잘못된 API 경로 테스트 (401 예상)
echo ""
echo "✅ Test 2: 잘못된 API 경로 (/auth/login) 테스트 (401 예상)"
echo "---------------------------------------------------"
response=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "$TEST_USER")

http_code="${response: -3}"
body="${response%???}"

if [ "$http_code" = "401" ]; then
  echo "  ✅ 성공: 잘못된 경로는 HTTP 401 반환 (예상된 동작)"
  echo "  📝 에러 메시지: $(echo "$body" | grep -o '"message":"[^"]*' | cut -d'"' -f4)"
else
  echo "  ⚠️  예상과 다른 응답: HTTP $http_code"
  echo "  📝 응답: $body"
fi

# Test 3: 잘못된 인증 정보 테스트 (401 예상)
echo ""
echo "✅ Test 3: 잘못된 인증 정보 테스트 (401 예상)"
echo "----------------------------------------"
response=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "$WRONG_USER")

http_code="${response: -3}"
body="${response%???}"

if [ "$http_code" = "401" ]; then
  echo "  ✅ 성공: 잘못된 인증 정보는 HTTP 401 반환 (예상된 동작)"
else
  echo "  ⚠️  예상과 다른 응답: HTTP $http_code"
  echo "  📝 응답: $body"
fi

# Test 4: 백엔드 헬스 체크
echo ""
echo "✅ Test 4: 백엔드 서버 상태 확인"
echo "----------------------------"
health_response=$(curl -s "$BASE_URL/actuator/health")
if echo "$health_response" | grep -q '"status":"UP"'; then
  echo "  ✅ 성공: 백엔드 서버 정상 작동"
else
  echo "  ❌ 실패: 백엔드 서버 상태 이상"
  echo "  📝 응답: $health_response"
fi

echo ""
echo "🎉 로그인 문제 수정 검증 테스트 완료"
echo "================================="
echo ""
echo "📋 수정사항 요약:"
echo "  1. ✅ API 경로 통일: /auth/login → /api/auth/login"
echo "  2. ✅ 무한 리다이렉트 루프 해결: useEffect 의존성 최적화"
echo "  3. ✅ 에러 처리 중복 제거: authApi와 authStore 분리"
echo "  4. ✅ React DevTools 경고 숨김: main.tsx에서 console.info 필터링"
echo "  5. ✅ 불필요한 console.log 정리: DEBUG_MODE=false로 설정"
echo ""
echo "🔧 프론트엔드에서 테스트하려면:"
echo "  1. 프론트엔드 서버 실행: cd frontend && npm run dev"
echo "  2. http://localhost:5173 접속"
echo "  3. 'Use Test Account' 버튼으로 테스트 계정 자동 입력"
echo "  4. 로그인 시도"