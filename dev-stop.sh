#!/bin/bash
# 개발 서버 중지 스크립트 (최적화 버전)

# 공통 함수 불러오기
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/scripts/dev-common.sh"

log_header "개발 서버 중지"

# PID 파일에서 프로세스 종료 (개선된 방법)
SERVICES_STOPPED=0

if [ -f logs/backend.pid ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if kill -0 "$BACKEND_PID" 2>/dev/null; then
        log_info "백엔드 서버 중지 중... (PID: $BACKEND_PID)"
        kill "$BACKEND_PID" 2>/dev/null || true
        
        # 정상 종료 대기 (최대 10초)
        local attempt=0
        while [ $attempt -lt 10 ] && kill -0 "$BACKEND_PID" 2>/dev/null; do
            sleep 1
            attempt=$((attempt + 1))
        done
        
        # 여전히 실행 중이면 강제 종료
        if kill -0 "$BACKEND_PID" 2>/dev/null; then
            log_warning "백엔드 강제 종료 중... (PID: $BACKEND_PID)"
            kill -9 "$BACKEND_PID" 2>/dev/null || true
        fi
        
        log_success "백엔드 서버 중지 완료"
        SERVICES_STOPPED=$((SERVICES_STOPPED + 1))
    else
        log_warning "백엔드 PID $BACKEND_PID: 이미 종료됨"
    fi
    rm -f logs/backend.pid
else
    log_info "백엔드: PID 파일 없음"
fi

if [ -f logs/frontend.pid ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if kill -0 "$FRONTEND_PID" 2>/dev/null; then
        log_info "프론트엔드 서버 중지 중... (PID: $FRONTEND_PID)"
        kill "$FRONTEND_PID" 2>/dev/null || true
        
        # 정상 종료 대기 (최대 5초)
        local attempt=0
        while [ $attempt -lt 5 ] && kill -0 "$FRONTEND_PID" 2>/dev/null; do
            sleep 1
            attempt=$((attempt + 1))
        done
        
        # 여전히 실행 중이면 강제 종료
        if kill -0 "$FRONTEND_PID" 2>/dev/null; then
            log_warning "프론트엔드 강제 종료 중... (PID: $FRONTEND_PID)"
            kill -9 "$FRONTEND_PID" 2>/dev/null || true
        fi
        
        log_success "프론트엔드 서버 중지 완료"
        SERVICES_STOPPED=$((SERVICES_STOPPED + 1))
    else
        log_warning "프론트엔드 PID $FRONTEND_PID: 이미 종료됨"
    fi
    rm -f logs/frontend.pid
else
    log_info "프론트엔드: PID 파일 없음"
fi

# 관련 프로세스 강제 정리
log_info "관련 프로세스 정리 중..."

VITE_PROCESSES=$(pgrep -f "vite" 2>/dev/null || true)
if [ -n "$VITE_PROCESSES" ]; then
    pkill -f "vite" 2>/dev/null && log_info "Vite 프로세스 정리 완료" || true
fi

GRADLE_PROCESSES=$(pgrep -f "gradlew.*bootRun" 2>/dev/null || true)
if [ -n "$GRADLE_PROCESSES" ]; then
    pkill -f "gradlew.*bootRun" 2>/dev/null && log_info "Gradle 프로세스 정리 완료" || true
fi

NPM_PROCESSES=$(pgrep -f "npm.*dev" 2>/dev/null || true)
if [ -n "$NPM_PROCESSES" ]; then
    pkill -f "npm.*dev" 2>/dev/null && log_info "npm dev 프로세스 정리 완료" || true
fi

# Docker Redis 중지
log_info "Redis Docker 중지 중..."
if [ -f "docker-compose.simple.yml" ]; then
    if docker-compose -f docker-compose.simple.yml down > /dev/null 2>&1; then
        log_success "Redis Docker 중지 완료"
    else
        log_warning "Redis Docker 중지 실패 (이미 중지되었을 수 있음)"
    fi
else
    log_info "docker-compose.simple.yml 파일 없음 (Redis 건너뜀)"
fi

# 포트 점유 확인
echo ""
log_info "포트 상태 최종 확인..."

if netstat -an 2>/dev/null | grep -q ":8080.*LISTEN"; then
    log_warning "포트 8080이 여전히 사용 중입니다"
else
    log_success "포트 8080: 사용 가능"
fi

if netstat -an 2>/dev/null | grep -q ":5173.*LISTEN" || netstat -an 2>/dev/null | grep -q ":5174.*LISTEN"; then
    log_warning "프론트엔드 포트(5173/5174)가 여전히 사용 중입니다"
else
    log_success "프론트엔드 포트: 사용 가능"
fi

echo ""
if [ $SERVICES_STOPPED -gt 0 ]; then
    log_success "개발 서버 중지 완료! ($SERVICES_STOPPED개 서비스 중지됨)"
else
    log_info "중지할 서비스가 없었습니다"
fi

echo ""
echo "💡 다음 단계:"
echo "   • 서버 시작: ./dev-start.sh"
echo "   • 서버 상태: ./dev-status.sh"
echo "   • 자동 재시작: ./dev-restart.sh"
echo ""