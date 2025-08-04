#!/bin/bash
# 개발 서버 상태 확인 스크립트 (최적화 버전)

# 공통 함수 불러오기
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/scripts/dev-common.sh"

log_header "개발 서버 상태 확인"

# 포트 상태 확인 (개선된 방법)
echo "🌐 서비스 포트 상태:"

RUNNING_SERVICES=0
TOTAL_SERVICES=4

# 백엔드 체크
if ss -tuln 2>/dev/null | grep -q ":8082" || netstat -an 2>/dev/null | grep -q ":8082.*LISTEN"; then
    log_success "백엔드 (8082): 실행중"
    RUNNING_SERVICES=$((RUNNING_SERVICES + 1))
    
    # API 헬스 체크 (비동기 타임아웃 5초)
    if timeout 5 curl -s http://localhost:8082/actuator/health >/dev/null 2>&1; then
        log_success "      └─ Health Check: OK"
    else
        log_warning "      └─ Health Check: 시작 중 또는 비활성화"
    fi
else
    log_error "백엔드 (8082): 중지됨"
fi

# 프론트엔드 체크
if ss -tuln 2>/dev/null | grep -q ":5173" || netstat -an 2>/dev/null | grep -q ":5173.*LISTEN"; then
    log_success "프론트엔드 (5173): 실행중"
    RUNNING_SERVICES=$((RUNNING_SERVICES + 1))
elif ss -tuln 2>/dev/null | grep -q ":5174" || netstat -an 2>/dev/null | grep -q ":5174.*LISTEN"; then
    log_success "프론트엔드 (5174): 실행중"
    RUNNING_SERVICES=$((RUNNING_SERVICES + 1))
else
    log_error "프론트엔드: 중지됨"
fi

# Redis 체크
if ss -tuln 2>/dev/null | grep -q ":6379" || netstat -an 2>/dev/null | grep -q ":6379.*LISTEN"; then
    log_success "Redis (6379): 실행중"
    RUNNING_SERVICES=$((RUNNING_SERVICES + 1))
    
    # Redis 연결 테스트 (비동기 타임아웃 3초)
    if timeout 3 docker exec elderberry-redis-dev redis-cli -a elderberry123! ping >/dev/null 2>&1; then
        log_success "      └─ Redis Ping: PONG"
    else
        log_warning "      └─ Redis Ping: 연결 실패"
    fi
else
    log_error "Redis (6379): 중지됨"
fi

# Redis UI 체크
if ss -tuln 2>/dev/null | grep -q ":8081" || netstat -an 2>/dev/null | grep -q ":8081.*LISTEN"; then
    log_success "Redis UI (8081): 실행중"
    RUNNING_SERVICES=$((RUNNING_SERVICES + 1))
else
    log_error "Redis UI (8081): 중지됨"
fi

echo ""
echo "🔍 프로세스 상태:"

# PID 상태 확인 (공통 함수 사용)
check_process_by_pid "logs/backend.pid" "백엔드"
check_process_by_pid "logs/frontend.pid" "프론트엔드"

# Docker 컨테이너 상태
echo ""
echo "🐳 Docker 컨테이너 상태:"

if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "elderberry-redis-dev"; then
    REDIS_STATUS=$(docker ps --format "table {{.Names}}\t{{.Status}}" | grep "elderberry-redis-dev" | awk '{print $2" "$3" "$4}' || echo "Unknown")
    log_success "elderberry-redis-dev: $REDIS_STATUS"
else
    log_error "elderberry-redis-dev: 실행 중이 아님"
fi

# 로그 파일 상태 (개선된 방법)
echo ""
echo "📋 로그 파일 상태:"

if [ -f logs/backend.log ]; then
    BACKEND_SIZE=$(du -h logs/backend.log 2>/dev/null | cut -f1 || echo "unknown")
    BACKEND_LINES=$(wc -l < logs/backend.log 2>/dev/null || echo "unknown")
    BACKEND_MODIFIED=$(stat -c %y logs/backend.log 2>/dev/null | cut -d'.' -f1 || echo "unknown")
    echo "   📄 backend.log: $BACKEND_SIZE ($BACKEND_LINES lines, 최종수정: $BACKEND_MODIFIED)"
    
    # 최근 에러 체크
    if tail -n 50 logs/backend.log 2>/dev/null | grep -qi "error\|exception\|failed"; then
        log_warning "      └─ 최근 에러 또는 예외 발견"
    fi
else
    log_warning "backend.log: 파일 없음"
fi

if [ -f logs/frontend.log ]; then
    FRONTEND_SIZE=$(du -h logs/frontend.log 2>/dev/null | cut -f1 || echo "unknown")
    FRONTEND_LINES=$(wc -l < logs/frontend.log 2>/dev/null || echo "unknown")
    FRONTEND_MODIFIED=$(stat -c %y logs/frontend.log 2>/dev/null | cut -d'.' -f1 || echo "unknown")
    echo "   📄 frontend.log: $FRONTEND_SIZE ($FRONTEND_LINES lines, 최종수정: $FRONTEND_MODIFIED)"
    
    # 최근 에러 체크
    if tail -n 50 logs/frontend.log 2>/dev/null | grep -qi "error\|failed\|warn"; then
        log_warning "      └─ 최근 에러 또는 경고 발견"
    fi
else
    log_warning "frontend.log: 파일 없음"
fi

# 로그 로테이션 상태
echo ""
echo "🔄 로그 로테이션:"
ROTATED_LOGS=$(find logs -name "*.log.20*" 2>/dev/null | wc -l)
if [ $ROTATED_LOGS -gt 0 ]; then
    log_info "$ROTATED_LOGS개의 로테이션된 로그 파일 존재"
else
    log_info "로테이션된 로그 파일 없음"
fi

# 전체 상태 요약
echo ""
log_header "전체 상태 요약"

if [ $RUNNING_SERVICES -eq $TOTAL_SERVICES ]; then
    log_success "모든 서비스가 정상 실행 중입니다! ($RUNNING_SERVICES/$TOTAL_SERVICES)"
elif [ $RUNNING_SERVICES -gt 0 ]; then
    log_warning "일부 서비스가 실행 중입니다 ($RUNNING_SERVICES/$TOTAL_SERVICES)"
else
    log_error "모든 서비스가 중지된 상태입니다 ($RUNNING_SERVICES/$TOTAL_SERVICES)"
fi

echo ""
echo "🔗 빠른 액세스 링크:"
if [ $RUNNING_SERVICES -gt 0 ]; then
    if ss -tuln 2>/dev/null | grep -q ":8082" || netstat -an 2>/dev/null | grep -q ":8082.*LISTEN"; then echo "   • 백엔드: http://localhost:8082"; fi
    if ss -tuln 2>/dev/null | grep -q ":5173" || netstat -an 2>/dev/null | grep -q ":5173.*LISTEN"; then echo "   • 프론트엔드: http://localhost:5173"; fi
    if ss -tuln 2>/dev/null | grep -q ":5174" || netstat -an 2>/dev/null | grep -q ":5174.*LISTEN"; then echo "   • 프론트엔드: http://localhost:5174"; fi
    if ss -tuln 2>/dev/null | grep -q ":8082" || netstat -an 2>/dev/null | grep -q ":8082.*LISTEN"; then echo "   • H2 Console: http://localhost:8082/h2-console"; fi
    if ss -tuln 2>/dev/null | grep -q ":8081" || netstat -an 2>/dev/null | grep -q ":8081.*LISTEN"; then echo "   • Redis UI: http://localhost:8081"; fi
else
    log_info "실행 중인 서비스가 없습니다"
fi

echo ""
echo "💡 사용 가능한 명령어:"
if [ $RUNNING_SERVICES -eq 0 ]; then
    echo "   • 서버 시작: ./dev-start.sh"
elif [ $RUNNING_SERVICES -lt $TOTAL_SERVICES ]; then
    echo "   • 서버 재시작: ./dev-restart.sh"
    echo "   • 서버 중지: ./dev-stop.sh"
else
    echo "   • 서버 중지: ./dev-stop.sh"
    echo "   • 서버 재시작: ./dev-restart.sh"
fi

echo "   • 백엔드 로그: tail -f logs/backend.log"
echo "   • 프론트엔드 로그: tail -f logs/frontend.log"
echo "   • 로그 에러 검색: grep -i error logs/*.log"

# 자동 재시작 제안
if [ $RUNNING_SERVICES -gt 0 ] && [ $RUNNING_SERVICES -lt $TOTAL_SERVICES ]; then
    echo ""
    log_warning "일부 서비스가 비정상 상태입니다. ./dev-restart.sh로 재시작을 고려해보세요."
fi

echo ""