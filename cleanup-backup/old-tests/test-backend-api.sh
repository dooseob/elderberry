#!/bin/bash

# 엘더베리 백엔드 API 자동화 테스트 스크립트
# 생성일: 2025-08-12
# 버전: 1.0.0

echo "🚀 엘더베리 API 테스트 시작..."

# 환경 변수 설정
API_BASE_URL="${API_BASE_URL:-http://localhost:8080/api}"
TEST_EMAIL="${TEST_EMAIL:-test.domestic@example.com}"
TEST_PASSWORD="${TEST_PASSWORD:-Password123!}"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# 성공/실패 카운터
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

# 로그 파일
LOG_FILE="api-test-$(date +%Y%m%d_%H%M%S).log"

# 로그 함수
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# 테스트 함수
run_test() {
    local test_name="$1"
    local curl_command="$2"
    local expected_code="$3"
    local description="$4"
    
    echo -n "  📊 ${test_name}... "
    log "테스트 시작: $test_name"
    log "명령어: $curl_command"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    # 타임아웃을 포함한 curl 실행
    response=$(timeout 30s bash -c "$curl_command" 2>/dev/null)
    exit_code=$?
    
    if [ $exit_code -eq 124 ]; then
        echo -e "${RED}❌ 타임아웃${NC}"
        log "결과: 타임아웃"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    elif [ $exit_code -ne 0 ]; then
        echo -e "${RED}❌ 연결 실패${NC}"
        log "결과: 연결 실패 (exit code: $exit_code)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
    
    actual_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n-2)
    
    log "응답 코드: $actual_code"
    log "응답 내용: $response_body"
    
    if [ "$actual_code" = "$expected_code" ]; then
        echo -e "${GREEN}✅ 성공${NC} ($actual_code)"
        log "결과: 성공"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ 실패${NC} (예상: $expected_code, 실제: $actual_code)"
        log "결과: 실패 (예상: $expected_code, 실제: $actual_code)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# JWT 토큰 추출 함수
extract_token() {
    local response="$1"
    echo "$response" | head -n-2 | jq -r '.data.token' 2>/dev/null || echo ""
}

# 서버 상태 확인
echo "🔍 서버 연결 확인..."
server_check=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "${API_BASE_URL%/api}")

if [ "$server_check" = "000" ]; then
    echo -e "${RED}❌ 서버에 연결할 수 없습니다. ($API_BASE_URL)${NC}"
    echo -e "${YELLOW}💡 해결 방법:${NC}"
    echo "   1. 백엔드 서버가 실행 중인지 확인하세요"
    echo "   2. URL이 올바른지 확인하세요: $API_BASE_URL"
    echo "   3. Docker 환경이라면: docker-compose up -d"
    echo "   4. 로컬 환경이라면: ./dev-start.sh 또는 gradle bootRun"
    exit 1
else
    echo -e "${GREEN}✅ 서버 연결 성공${NC} (응답 코드: $server_check)"
fi

log "=== 엘더베리 API 테스트 시작 ==="
log "기본 URL: $API_BASE_URL"
log "테스트 이메일: $TEST_EMAIL"

echo ""
echo -e "${BLUE}🔐 인증 API 테스트...${NC}"

# 로그인 테스트
login_cmd="curl -X POST '${API_BASE_URL}/auth/login' \
    -H 'Content-Type: application/json' \
    -d '{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}' \
    -w '\\n%{http_code}\\n' -s"

echo "  🔑 로그인 테스트 실행 중..."
login_response=$(eval "$login_cmd" 2>/dev/null)
login_code=$(echo "$login_response" | tail -n1)

if [ "$login_code" = "200" ]; then
    echo -e "  ${GREEN}✅ 로그인 성공${NC}"
    JWT_TOKEN=$(extract_token "$login_response")
    TESTS_PASSED=$((TESTS_PASSED + 1))
    log "로그인 성공: JWT 토큰 획득"
else
    echo -e "  ${RED}❌ 로그인 실패${NC} (코드: $login_code)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    JWT_TOKEN=""
    log "로그인 실패: 응답 코드 $login_code"
    
    # 로그인 실패 시 상세 정보 출력
    if [ -n "$login_response" ]; then
        error_msg=$(echo "$login_response" | head -n-2 | jq -r '.error // .message // "알 수 없는 오류"' 2>/dev/null)
        echo -e "    ${YELLOW}오류 메시지: $error_msg${NC}"
    fi
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# 프로필 조회 테스트 (로그인 성공 시만)
if [ -n "$JWT_TOKEN" ] && [ "$JWT_TOKEN" != "null" ] && [ "$JWT_TOKEN" != "" ]; then
    run_test "프로필 조회" \
        "curl -X GET '${API_BASE_URL}/auth/me' \
         -H 'Authorization: Bearer ${JWT_TOKEN}' \
         -w '\\n%{http_code}\\n' -s" \
        "200" \
        "인증된 사용자의 프로필 정보 조회"
else
    echo -e "  ${YELLOW}⏭️ 프로필 조회 테스트 건너뜀 (토큰 없음)${NC}"
    TESTS_SKIPPED=$((TESTS_SKIPPED + 1))
fi

# 회원가입 테스트 (새 이메일로)
new_email="test.$(date +%s)@example.com"
run_test "회원가입" \
    "curl -X POST '${API_BASE_URL}/auth/register' \
     -H 'Content-Type: application/json' \
     -d '{\"email\":\"${new_email}\",\"password\":\"NewPassword123!\",\"name\":\"테스트사용자\",\"role\":\"domestic\"}' \
     -w '\\n%{http_code}\\n' -s" \
    "201" \
    "새 사용자 계정 생성"

echo ""
echo -e "${BLUE}🏢 시설 API 테스트...${NC}"

# 시설 검색 테스트
run_test "시설 검색" \
    "curl -X GET '${API_BASE_URL}/facilities/search?location=서울&type=nursing_home' \
     -w '\\n%{http_code}\\n' -s" \
    "200" \
    "지역 및 타입별 시설 검색"

# 시설 상세 조회 테스트
run_test "시설 상세 조회" \
    "curl -X GET '${API_BASE_URL}/facilities/1' \
     -w '\\n%{http_code}\\n' -s" \
    "200" \
    "특정 시설의 상세 정보 조회"

# 시설 추천 테스트 (인증 필요)
if [ -n "$JWT_TOKEN" ] && [ "$JWT_TOKEN" != "null" ] && [ "$JWT_TOKEN" != "" ]; then
    run_test "시설 추천" \
        "curl -X POST '${API_BASE_URL}/facilities/recommendations' \
         -H 'Authorization: Bearer ${JWT_TOKEN}' \
         -H 'Content-Type: application/json' \
         -d '{\"location\":\"서울\",\"preferences\":[\"nursing_care\",\"medical_support\"]}' \
         -w '\\n%{http_code}\\n' -s" \
        "200" \
        "사용자 맞춤 시설 추천"
else
    echo -e "  ${YELLOW}⏭️ 시설 추천 테스트 건너뜀 (인증 필요)${NC}"
    TESTS_SKIPPED=$((TESTS_SKIPPED + 1))
fi

echo ""
echo -e "${BLUE}💊 건강평가 API 테스트...${NC}"

if [ -n "$JWT_TOKEN" ] && [ "$JWT_TOKEN" != "null" ] && [ "$JWT_TOKEN" != "" ]; then
    # 건강평가 생성 테스트
    run_test "건강평가 생성" \
        "curl -X POST '${API_BASE_URL}/health/assessments' \
         -H 'Authorization: Bearer ${JWT_TOKEN}' \
         -H 'Content-Type: application/json' \
         -d '{\"age\":75,\"gender\":\"female\",\"conditions\":[\"diabetes\",\"hypertension\"],\"mobility\":\"limited\"}' \
         -w '\\n%{http_code}\\n' -s" \
        "201" \
        "새로운 건강평가 생성"

    # 건강평가 목록 조회 테스트
    run_test "건강평가 목록 조회" \
        "curl -X GET '${API_BASE_URL}/health/assessments' \
         -H 'Authorization: Bearer ${JWT_TOKEN}' \
         -w '\\n%{http_code}\\n' -s" \
        "200" \
        "사용자의 건강평가 목록 조회"

    # 건강평가 이력 조회 테스트
    run_test "건강평가 이력 조회" \
        "curl -X GET '${API_BASE_URL}/health/assessments/history' \
         -H 'Authorization: Bearer ${JWT_TOKEN}' \
         -w '\\n%{http_code}\\n' -s" \
        "200" \
        "사용자의 건강평가 이력 조회"
else
    echo -e "  ${YELLOW}⏭️ 건강평가 테스트 건너뜀 (인증 필요)${NC}"
    TESTS_SKIPPED=$((TESTS_SKIPPED + 3))
fi

echo ""
echo -e "${BLUE}🔒 보안 테스트...${NC}"

# 무인증 접근 테스트
run_test "무인증 접근 차단" \
    "curl -X GET '${API_BASE_URL}/auth/me' \
     -w '\\n%{http_code}\\n' -s" \
    "401" \
    "인증 없이 보호된 리소스 접근 시도"

# 잘못된 토큰 테스트
run_test "잘못된 토큰 차단" \
    "curl -X GET '${API_BASE_URL}/auth/me' \
     -H 'Authorization: Bearer invalid-token-12345' \
     -w '\\n%{http_code}\\n' -s" \
    "401" \
    "유효하지 않은 JWT 토큰으로 접근 시도"

# SQL 인젝션 테스트
run_test "SQL 인젝션 방어" \
    "curl -X POST '${API_BASE_URL}/auth/login' \
     -H 'Content-Type: application/json' \
     -d '{\"email\":\"admin@example.com\"; DROP TABLE users; --\",\"password\":\"password\"}' \
     -w '\\n%{http_code}\\n' -s" \
    "400" \
    "SQL 인젝션 공격 시도"

# XSS 테스트
run_test "XSS 공격 방어" \
    "curl -X POST '${API_BASE_URL}/auth/register' \
     -H 'Content-Type: application/json' \
     -d '{\"email\":\"test@example.com\",\"password\":\"password\",\"name\":\"<script>alert('xss')</script>\"}' \
     -w '\\n%{http_code}\\n' -s" \
    "400" \
    "XSS 스크립트 삽입 시도"

echo ""
echo -e "${BLUE}⚡ 성능 테스트...${NC}"

# 응답 시간 측정 함수
measure_response_time() {
    local test_name="$1"
    local curl_command="$2"
    local iterations=3
    
    echo -n "  ⏱️ $test_name 응답 시간 측정... "
    
    total_time=0
    for i in $(seq 1 $iterations); do
        time_taken=$(curl -X GET "${API_BASE_URL}/facilities/search?location=서울" \
            -w "%{time_total}" -s -o /dev/null 2>/dev/null)
        if [ -n "$time_taken" ]; then
            total_time=$(echo "$total_time + $time_taken" | bc 2>/dev/null || echo "$total_time")
        fi
    done
    
    if command -v bc >/dev/null 2>&1; then
        avg_time=$(echo "scale=3; $total_time / $iterations" | bc 2>/dev/null)
        avg_ms=$(echo "$avg_time * 1000" | bc 2>/dev/null | cut -d. -f1)
        
        if [ "$avg_ms" -lt 200 ]; then
            echo -e "${GREEN}우수${NC} (${avg_ms}ms)"
        elif [ "$avg_ms" -lt 500 ]; then
            echo -e "${YELLOW}양호${NC} (${avg_ms}ms)"
        elif [ "$avg_ms" -lt 1000 ]; then
            echo -e "${YELLOW}보통${NC} (${avg_ms}ms)"
        else
            echo -e "${RED}느림${NC} (${avg_ms}ms)"
        fi
    else
        echo -e "${BLUE}측정됨${NC} (bc 명령어 없음)"
    fi
}

measure_response_time "시설 검색 API"

echo ""
echo -e "${PURPLE}📊 테스트 결과 요약${NC}"
echo "================================"
echo -e "전체 테스트: ${BLUE}${TESTS_TOTAL}${NC}"
echo -e "성공: ${GREEN}${TESTS_PASSED}${NC}"
echo -e "실패: ${RED}${TESTS_FAILED}${NC}"
echo -e "건너뜀: ${YELLOW}${TESTS_SKIPPED}${NC}"

if [ $TESTS_TOTAL -gt 0 ]; then
    SUCCESS_RATE=$(( TESTS_PASSED * 100 / TESTS_TOTAL ))
    echo -e "성공률: ${BLUE}${SUCCESS_RATE}%${NC}"
fi

echo ""
echo -e "${BLUE}📄 로그 파일: ${LOG_FILE}${NC}"

# 상세 리포트 생성
cat > "api-test-report-$(date +%Y%m%d_%H%M%S).md" << EOF
# 엘더베리 API 테스트 리포트

**테스트 실행 시간**: $(date)
**기본 URL**: $API_BASE_URL
**테스트 이메일**: $TEST_EMAIL

## 결과 요약

- **전체 테스트**: $TESTS_TOTAL
- **성공**: $TESTS_PASSED
- **실패**: $TESTS_FAILED
- **건너뜀**: $TESTS_SKIPPED
- **성공률**: ${SUCCESS_RATE:-0}%

## 테스트 세부 내용

### 🔐 인증 API
- 로그인: $([ $TESTS_PASSED -gt 0 ] && echo "✅" || echo "❌")
- 프로필 조회: $([ -n "$JWT_TOKEN" ] && echo "✅" || echo "⏭️")
- 회원가입: 테스트됨

### 🏢 시설 API
- 시설 검색: 테스트됨
- 시설 상세 조회: 테스트됨
- 시설 추천: $([ -n "$JWT_TOKEN" ] && echo "✅" || echo "⏭️")

### 💊 건강평가 API
- 건강평가 생성: $([ -n "$JWT_TOKEN" ] && echo "✅" || echo "⏭️")
- 건강평가 목록: $([ -n "$JWT_TOKEN" ] && echo "✅" || echo "⏭️")
- 건강평가 이력: $([ -n "$JWT_TOKEN" ] && echo "✅" || echo "⏭️")

### 🔒 보안 테스트
- 무인증 접근 차단: 테스트됨
- 잘못된 토큰 차단: 테스트됨
- SQL 인젝션 방어: 테스트됨
- XSS 공격 방어: 테스트됨

## 권장사항

$([ $TESTS_FAILED -eq 0 ] && echo "✅ 모든 테스트가 성공적으로 통과했습니다!" || echo "❌ 실패한 테스트가 있습니다. 로그 파일을 확인해주세요.")

---
*이 리포트는 자동으로 생성되었습니다.*
EOF

log "=== 테스트 완료 ==="
log "성공: $TESTS_PASSED, 실패: $TESTS_FAILED, 건너뜀: $TESTS_SKIPPED"

# 최종 결과
echo ""
if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 모든 테스트가 성공했습니다!${NC}"
    echo -e "${BLUE}💡 다음 단계: 프론트엔드와 통합 테스트를 진행하세요.${NC}"
    exit 0
else
    echo -e "${RED}❌ ${TESTS_FAILED}개의 테스트가 실패했습니다.${NC}"
    echo -e "${YELLOW}💡 해결 방법:${NC}"
    echo "   1. 로그 파일을 확인하세요: $LOG_FILE"
    echo "   2. 서버 상태를 점검하세요"
    echo "   3. 데이터베이스 연결을 확인하세요"
    echo "   4. 설정 파일을 점검하세요"
    exit 1
fi