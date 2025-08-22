#!/bin/bash

# 🔥 Clerk 마이그레이션 테스트 스크립트
# Phase 1 완전 전환 확인용

echo "🚀 Clerk 마이그레이션 테스트 시작..."

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "\n${YELLOW}🧪 테스트: $test_name${NC}"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ 통과: $test_name${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ 실패: $test_name${NC}"
        ((TESTS_FAILED++))
    fi
}

# Test 1: 프론트엔드 패키지 확인
run_test "Clerk React SDK 설치 확인" \
    "grep -q '@clerk/clerk-react' package.json"

# Test 2: 백엔드 의존성 확인
run_test "Clerk Java SDK 의존성 확인" \
    "grep -q 'com.clerk:clerk-sdk-java' ../build.gradle.kts"

# Test 3: 환경 설정 파일 확인
run_test "프론트엔드 .env.example 설정 확인" \
    "test -f .env.example && grep -q 'VITE_CLERK_PUBLISHABLE_KEY' .env.example"

# Test 4: 백엔드 설정 확인
run_test "백엔드 Clerk 설정 확인" \
    "grep -q 'clerk:' ../src/main/resources/application.yml"

# Test 5: Clerk 컴포넌트 파일 확인
run_test "Clerk 프론트엔드 컴포넌트 파일 존재" \
    "test -f src/providers/ClerkProvider.tsx && \
     test -f src/hooks/useElderberryAuth.ts && \
     test -f src/components/auth/ClerkLoginPage.tsx"

# Test 6: Clerk 백엔드 클래스 확인
run_test "Clerk 백엔드 클래스 파일 존재" \
    "test -f ../src/main/java/com/globalcarelink/auth/clerk/ClerkConfig.java && \
     test -f ../src/main/java/com/globalcarelink/auth/clerk/ClerkJwtAuthenticationFilter.java && \
     test -f ../src/main/java/com/globalcarelink/auth/clerk/ClerkRoleMapper.java"

# Test 7: App.tsx 업데이트 확인
run_test "App.tsx Clerk 통합 확인" \
    "grep -q 'ElderberryClerkProvider' src/App.tsx && \
     grep -q 'ClerkLoginPageWrapper' src/App.tsx"

# Test 8: 라우트 설정 확인
run_test "신규 Clerk 라우트 설정 확인" \
    "grep -q 'ClerkLoginPageWrapper' src/App.tsx && \
     grep -q 'ClerkSignupPageWrapper' src/App.tsx"

# Test 9: 레거시 라우트 안전성 확인
run_test "레거시 라우트 백업 확인" \
    "grep -q 'login-legacy' src/App.tsx && \
     grep -q 'signup-legacy' src/App.tsx"

# Test 10: 마이그레이션 문서 확인
run_test "마이그레이션 가이드 문서 존재" \
    "test -f ../CLERK_MIGRATION_GUIDE.md"

# 최종 결과 출력
echo -e "\n" "="*50
echo -e "${YELLOW}🔥 Clerk 마이그레이션 테스트 결과${NC}"
echo -e "="*50

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 모든 테스트 통과! ($TESTS_PASSED/$((TESTS_PASSED + TESTS_FAILED)))${NC}"
    echo -e "\n${GREEN}✅ Phase 1 완전 전환 마이그레이션 성공!${NC}"
    echo -e "\n📋 다음 단계:"
    echo -e "1. Clerk 대시보드에서 조직 생성"
    echo -e "2. 환경변수 실제 키로 설정"
    echo -e "3. 서버 실행 후 로그인 테스트"
    echo -e "4. 역할별 권한 테스트"
    echo -e "\n📚 자세한 내용: CLERK_MIGRATION_GUIDE.md 참조"
else
    echo -e "${RED}❌ $TESTS_FAILED개 테스트 실패 ($TESTS_PASSED/$((TESTS_PASSED + TESTS_FAILED)))${NC}"
    echo -e "\n🔧 실패한 테스트들을 확인하고 수정해주세요."
fi

echo -e "\n🚀 테스트 완료!"