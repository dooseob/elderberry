#!/bin/bash

# 엘더베리 백엔드 API 빠른 테스트 스크립트
# 사용법: ./quick-api-test.sh

BASE_URL="http://localhost:8080"
API_URL="$BASE_URL/api"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수들
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# HTTP 상태 코드 색상 함수
color_status() {
  local status=$1
  if [[ $status -ge 200 && $status -lt 300 ]]; then
    echo -e "${GREEN}$status${NC}"
  elif [[ $status -ge 300 && $status -lt 400 ]]; then
    echo -e "${YELLOW}$status${NC}"
  else
    echo -e "${RED}$status${NC}"
  fi
}

# API 테스트 함수
test_api() {
  local method=$1
  local endpoint=$2
  local data=$3
  local auth_token=$4
  local description=$5
  
  local headers=""
  if [[ -n "$auth_token" ]]; then
    headers="-H 'Authorization: Bearer $auth_token'"
  fi
  
  if [[ -n "$data" ]]; then
    headers="$headers -H 'Content-Type: application/json'"
  fi
  
  local cmd="curl -s -w '%{http_code}' -o /tmp/response.json $headers"
  if [[ -n "$data" ]]; then
    cmd="$cmd -d '$data'"
  fi
  cmd="$cmd -X $method $endpoint"
  
  local status_code=$(eval $cmd)
  local response=$(cat /tmp/response.json 2>/dev/null || echo "")
  
  printf "%-8s %-40s $(color_status $status_code) %s\n" "$method" "${endpoint##*/api}" "$status_code" "$description"
  
  # 에러 응답이면 상세 정보 출력
  if [[ $status_code -ge 400 ]]; then
    if [[ -n "$response" && "$response" != "null" ]]; then
      echo "    └─ $(echo $response | head -c 100)..."
    fi
  fi
  
  return $status_code
}

echo -e "${BLUE}🚀 엘더베리 백엔드 API 빠른 테스트${NC}"
echo "========================================================"

# 1. 헬스체크
log_info "1. 서버 상태 확인 중..."
test_api "GET" "$BASE_URL/actuator/health" "" "" "서버 상태"

# 2. 인증 테스트
log_info "2. 인증 시스템 테스트 중..."
ACCESS_TOKEN=""

# 로그인 시도
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test.domestic@example.com","password":"Password123!"}')

if [[ $? -eq 0 ]]; then
  ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
  if [[ -n "$ACCESS_TOKEN" ]]; then
    log_success "로그인 성공 (토큰 길이: ${#ACCESS_TOKEN})"
    test_api "GET" "$API_URL/auth/me" "" "$ACCESS_TOKEN" "내 정보 조회"
  else
    log_error "토큰 파싱 실패"
  fi
else
  log_error "로그인 실패"
fi

echo ""

# 3. 공개 API 테스트
log_info "3. 공개 API 테스트 중..."
test_api "GET" "$API_URL/facilities" "" "" "시설 목록"
test_api "GET" "$API_URL/facilities/search?keyword=요양원&region=서울" "" "" "시설 검색"
test_api "GET" "$API_URL/boards" "" "" "게시판 목록"
test_api "GET" "$API_URL/jobs" "" "" "구인구직 목록"

echo ""

# 4. 인증 필요한 API 테스트
if [[ -n "$ACCESS_TOKEN" ]]; then
  log_info "4. 인증 필요한 API 테스트 중..."
  test_api "GET" "$API_URL/members/profile" "" "$ACCESS_TOKEN" "프로필 조회"
  test_api "GET" "$API_URL/notifications" "" "$ACCESS_TOKEN" "알림 목록"
  test_api "GET" "$API_URL/chat/rooms" "" "$ACCESS_TOKEN" "채팅방 목록"
  
  # 건강평가 생성 테스트 (샘플 데이터)
  HEALTH_DATA='{"memberId":1,"basicInfo":{"age":75,"gender":"FEMALE","weight":55,"height":160},"healthConditions":{"chronicDiseases":["DIABETES"],"mobility":"WALKER_NEEDED","cognitiveState":"NORMAL"}}'
  test_api "POST" "$API_URL/health/assessments" "$HEALTH_DATA" "$ACCESS_TOKEN" "건강평가 생성"
else
  log_warning "4. 인증 토큰이 없어 인증 필요한 API 테스트 건너뜀"
fi

echo ""

# 5. 챗봇 테스트
log_info "5. 챗봇 테스트 중..."
CHATBOT_DATA='{"message":"안녕하세요","sessionId":"test-session"}'
test_api "POST" "$API_URL/chatbot/chat" "$CHATBOT_DATA" "" "챗봇 대화"

echo ""

# 6. 요약 정보
log_info "테스트 완료 요약:"
echo "  🔗 Base URL: $BASE_URL"
echo "  🔑 인증: $(if [[ -n "$ACCESS_TOKEN" ]]; then echo '✅ 성공'; else echo '❌ 실패'; fi)"
echo "  📊 주요 엔드포인트 확인됨"

echo ""
echo "📚 사용 가능한 도구들:"
echo "  • Node.js 테스트: node api-test-suite.js"
echo "  • Postman 컬렉션: postman-collection.json"
echo "  • 개별 테스트: curl -X GET $API_URL/facilities"

# 임시 파일 정리
rm -f /tmp/response.json