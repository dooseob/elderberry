#!/bin/bash
# 엘더베리 개발 환경 시간절약 스크립트 (최적화 버전)
# 프론트엔드와 백엔드를 동시에 백그라운드로 실행

# 공통 함수 불러오기
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/scripts/dev-common.sh"

# 시그널 핸들러 설정
setup_signal_handlers

log_header "엘더베리 개발 환경 시작"

# 1. 환경 의존성 체크
if ! check_all_dependencies; then
    log_error "환경 의존성 체크 실패. 누락된 도구들을 설치한 후 다시 시도해주세요."
    exit 1
fi

echo ""
log_info "기존 프로세스 정리 중..."

# 기존 프로세스 정리 (향상된 방법)
if [ -f logs/backend.pid ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if kill -0 "$BACKEND_PID" 2>/dev/null; then
        log_info "기존 백엔드 프로세스 종료: PID $BACKEND_PID"
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    rm -f logs/backend.pid
fi

if [ -f logs/frontend.pid ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if kill -0 "$FRONTEND_PID" 2>/dev/null; then
        log_info "기존 프론트엔드 프로세스 종료: PID $FRONTEND_PID"
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    rm -f logs/frontend.pid
fi

# 추가 프로세스 정리
pkill -f "vite" 2>/dev/null && log_info "Vite 프로세스 정리 완료" || true
pkill -f "gradlew.*bootRun" 2>/dev/null && log_info "Gradle 프로세스 정리 완료" || true
pkill -f "npm.*dev" 2>/dev/null && log_info "npm dev 프로세스 정리 완료" || true

echo ""
log_info "Redis Docker 시작 중..."

# Docker Redis 시작 (에러 처리 개선)
if [ -f "docker-compose.simple.yml" ]; then
    if docker-compose -f docker-compose.simple.yml up -d > /dev/null 2>&1; then
        log_success "Redis Docker 시작 완료"
        sleep 3
    else
        log_warning "Redis Docker 시작 실패 (계속 진행)"
    fi
else
    log_warning "docker-compose.simple.yml 파일이 없습니다 (Redis 건너뜀)"
fi

# 로그 디렉토리 설정
setup_log_directory

# 로그 로테이션
rotate_log_if_needed "logs/backend.log" 10
rotate_log_if_needed "logs/frontend.log" 10

echo ""
log_info "백엔드 서버 시작 중... (백그라운드)"

# 백엔드 시작 (에러 처리 개선)
if [ -f "gradlew" ]; then
    nohup ./gradlew bootRun > logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > logs/backend.pid
    log_success "백엔드 시작: PID $BACKEND_PID (로그: logs/backend.log)"
else
    log_error "gradlew 파일이 없습니다"
    exit 1
fi

echo ""
log_info "프론트엔드 서버 시작 중... (백그라운드)"

# 프론트엔드 시작 (에러 처리 개선)
if [ -d "frontend" ]; then
    cd frontend
    
    # npm 의존성 체크
    if [ ! -d "node_modules" ]; then
        log_info "node_modules가 없습니다. npm install을 실행합니다..."
        npm install
    fi
    
    nohup npm run dev > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../logs/frontend.pid
    log_success "프론트엔드 시작: PID $FRONTEND_PID (로그: logs/frontend.log)"
    cd ..
else
    log_error "frontend 디렉토리가 없습니다"
    exit 1
fi

echo ""
log_info "서비스 헬스체크 시작..."

# 백엔드 헬스체크
health_check_backend
BACKEND_HEALTH=$?

# 프론트엔드 헬스체크
health_check_frontend
FRONTEND_HEALTH=$?

# Redis 헬스체크
health_check_redis
REDIS_HEALTH=$?

echo ""
log_header "개발 환경 시작 완료"

# 상태 요약
echo "🌐 서비스 상태:"
if [ $BACKEND_HEALTH -eq 0 ]; then
    log_success "백엔드: http://localhost:8080"
else
    log_warning "백엔드: 시작 중 (logs/backend.log 확인)"
fi

if [ $FRONTEND_HEALTH -eq 0 ]; then
    if netstat -an 2>/dev/null | grep -q ":5173.*LISTEN"; then
        log_success "프론트엔드: http://localhost:5173"
    elif netstat -an 2>/dev/null | grep -q ":5174.*LISTEN"; then
        log_success "프론트엔드: http://localhost:5174"
    fi
else
    log_warning "프론트엔드: 시작 중 (logs/frontend.log 확인)"
fi

if [ $REDIS_HEALTH -eq 0 ]; then
    log_success "Redis: localhost:6379"
else
    log_warning "Redis: 연결 확인 필요"
fi

echo ""
echo "📊 추가 서비스:"
echo "   • H2 Console: http://localhost:8080/h2-console"
echo "   • Redis UI: http://localhost:8081 (admin/elderberry123!)"
echo ""
echo "📋 유용한 명령어:"
echo "   • 백엔드 로그: tail -f logs/backend.log"
echo "   • 프론트엔드 로그: tail -f logs/frontend.log"
echo "   • 서버 상태: ./dev-status.sh"
echo "   • 서버 중지: ./dev-stop.sh"
echo "   • 자동 재시작: ./dev-restart.sh"
echo ""

# 자동 재시작 옵션 안내
if [ $BACKEND_HEALTH -ne 0 ] || [ $FRONTEND_HEALTH -ne 0 ]; then
    echo "⚠️  일부 서비스가 정상 시작되지 않았습니다."
    echo "   ./dev-restart.sh 명령어로 재시작을 시도할 수 있습니다."
    exit 1
fi

log_success "모든 서비스가 정상적으로 시작되었습니다!"