#!/bin/bash
# 개발 서버 자동 재시작 스크립트 (최적화 버전)
# 안전한 중지 후 재시작을 수행하는 스마트 스크립트

# 공통 함수 불러오기
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/scripts/dev-common.sh"

# 시그널 핸들러 설정
setup_signal_handlers

log_header "개발 서버 자동 재시작"

# 현재 상태 확인
log_info "현재 서버 상태 확인 중..."

BACKEND_RUNNING=0
FRONTEND_RUNNING=0
REDIS_RUNNING=0

if netstat -an 2>/dev/null | grep -q ":8080.*LISTEN"; then
    BACKEND_RUNNING=1
    log_info "백엔드: 실행 중"
fi

if netstat -an 2>/dev/null | grep -q ":5173.*LISTEN" || netstat -an 2>/dev/null | grep -q ":5174.*LISTEN"; then
    FRONTEND_RUNNING=1
    log_info "프론트엔드: 실행 중"
fi

if netstat -an 2>/dev/null | grep -q ":6379.*LISTEN"; then
    REDIS_RUNNING=1
    log_info "Redis: 실행 중"
fi

TOTAL_RUNNING=$((BACKEND_RUNNING + FRONTEND_RUNNING + REDIS_RUNNING))

if [ $TOTAL_RUNNING -eq 0 ]; then
    log_info "모든 서비스가 중지된 상태입니다. 바로 시작합니다."
    exec ./dev-start.sh
else
    log_info "$TOTAL_RUNNING개 서비스가 실행 중입니다. 안전한 재시작을 진행합니다."
fi

echo ""
log_info "1단계: 기존 서비스 안전하게 중지 중..."

# 개선된 중지 로직 (dev-stop.sh 로직 통합)
SERVICES_STOPPED=0

# 백엔드 안전 중지
if [ -f logs/backend.pid ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if kill -0 "$BACKEND_PID" 2>/dev/null; then
        log_info "백엔드 프로세스 중지 중... (PID: $BACKEND_PID)"
        kill "$BACKEND_PID" 2>/dev/null || true
        
        # 정상 종료 대기 (최대 15초)
        local attempt=0
        while [ $attempt -lt 15 ] && kill -0 "$BACKEND_PID" 2>/dev/null; do
            if [ $((attempt % 5)) -eq 0 ]; then
                log_info "백엔드 종료 대기 중... ($attempt/15초)"
            fi
            sleep 1
            attempt=$((attempt + 1))
        done
        
        # 강제 종료가 필요한 경우
        if kill -0 "$BACKEND_PID" 2>/dev/null; then
            log_warning "백엔드 강제 종료 중... (PID: $BACKEND_PID)"
            kill -9 "$BACKEND_PID" 2>/dev/null || true
            sleep 2
        fi
        
        log_success "백엔드 중지 완료"
        SERVICES_STOPPED=$((SERVICES_STOPPED + 1))
    fi
    rm -f logs/backend.pid
fi

# 프론트엔드 안전 중지
if [ -f logs/frontend.pid ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if kill -0 "$FRONTEND_PID" 2>/dev/null; then
        log_info "프론트엔드 프로세스 중지 중... (PID: $FRONTEND_PID)"
        kill "$FRONTEND_PID" 2>/dev/null || true
        
        # 정상 종료 대기 (최대 10초)
        local attempt=0
        while [ $attempt -lt 10 ] && kill -0 "$FRONTEND_PID" 2>/dev/null; do
            if [ $((attempt % 3)) -eq 0 ]; then
                log_info "프론트엔드 종료 대기 중... ($attempt/10초)"
            fi
            sleep 1
            attempt=$((attempt + 1))
        done
        
        # 강제 종료가 필요한 경우
        if kill -0 "$FRONTEND_PID" 2>/dev/null; then
            log_warning "프론트엔드 강제 종료 중... (PID: $FRONTEND_PID)"
            kill -9 "$FRONTEND_PID" 2>/dev/null || true
            sleep 1
        fi
        
        log_success "프론트엔드 중지 완료"
        SERVICES_STOPPED=$((SERVICES_STOPPED + 1))
    fi
    rm -f logs/frontend.pid
fi

# 추가 프로세스 정리
log_info "관련 프로세스 정리 중..."
pkill -f "vite" 2>/dev/null && log_info "잔여 Vite 프로세스 정리" || true
pkill -f "gradlew.*bootRun" 2>/dev/null && log_info "잔여 Gradle 프로세스 정리" || true
pkill -f "npm.*dev" 2>/dev/null && log_info "잔여 npm 프로세스 정리" || true

# Redis는 재시작하지 않음 (Docker 컨테이너는 계속 실행)
if [ $REDIS_RUNNING -eq 1 ]; then
    log_info "Redis는 Docker 컨테이너로 계속 실행 중입니다"
fi

# 포트 해제 확인
echo ""
log_info "2단계: 포트 해제 확인 중..."

PORT_CHECK_ATTEMPTS=0
MAX_PORT_CHECK_ATTEMPTS=10

while [ $PORT_CHECK_ATTEMPTS -lt $MAX_PORT_CHECK_ATTEMPTS ]; do
    BACKEND_PORT_FREE=1
    FRONTEND_PORT_FREE=1
    
    if netstat -an 2>/dev/null | grep -q ":8080.*LISTEN"; then
        BACKEND_PORT_FREE=0
    fi
    
    if netstat -an 2>/dev/null | grep -q ":5173.*LISTEN" || netstat -an 2>/dev/null | grep -q ":5174.*LISTEN"; then
        FRONTEND_PORT_FREE=0
    fi
    
    if [ $BACKEND_PORT_FREE -eq 1 ] && [ $FRONTEND_PORT_FREE -eq 1 ]; then
        log_success "모든 포트가 해제되었습니다"
        break
    fi
    
    PORT_CHECK_ATTEMPTS=$((PORT_CHECK_ATTEMPTS + 1))
    if [ $((PORT_CHECK_ATTEMPTS % 3)) -eq 0 ]; then
        log_info "포트 해제 대기 중... ($PORT_CHECK_ATTEMPTS/$MAX_PORT_CHECK_ATTEMPTS)"
    fi
    sleep 1
done

if [ $PORT_CHECK_ATTEMPTS -eq $MAX_PORT_CHECK_ATTEMPTS ]; then
    log_warning "일부 포트가 여전히 점유 중입니다. 강제로 재시작을 진행합니다."
fi

# 잠시 대기 (시스템 안정화)
log_info "시스템 안정화 대기 중... (3초)"
sleep 3

echo ""
log_info "3단계: 환경 체크 및 서비스 재시작..."

# 환경 의존성 체크 (빠른 체크)
if ! check_all_dependencies; then
    log_error "환경 의존성 체크 실패. 재시작을 중단합니다."
    exit 1
fi

# 로그 디렉토리 및 로테이션
setup_log_directory
rotate_log_if_needed "logs/backend.log" 10
rotate_log_if_needed "logs/frontend.log" 10

# Redis Docker 상태 확인 및 필요시 재시작
if [ $REDIS_RUNNING -eq 0 ]; then
    log_info "Redis Docker 시작 중..."
    if [ -f "docker-compose.simple.yml" ]; then
        if docker-compose -f docker-compose.simple.yml up -d > /dev/null 2>&1; then
            log_success "Redis Docker 시작 완료"
            sleep 3
        else
            log_warning "Redis Docker 시작 실패 (계속 진행)"
        fi
    fi
fi

# 백엔드 재시작
log_info "백엔드 서버 재시작 중..."
if [ -f "gradlew" ]; then
    nohup ./gradlew bootRun > logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > logs/backend.pid
    log_success "백엔드 재시작: PID $BACKEND_PID"
else
    log_error "gradlew 파일이 없습니다"
    exit 1
fi

# 프론트엔드 재시작
log_info "프론트엔드 서버 재시작 중..."
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
    log_success "프론트엔드 재시작: PID $FRONTEND_PID"
    cd ..
else
    log_error "frontend 디렉토리가 없습니다"
    exit 1
fi

echo ""
log_info "4단계: 서비스 헬스체크..."

# 향상된 헬스체크 (재시작 후 더 긴 대기 시간)
health_check_backend
BACKEND_HEALTH=$?

health_check_frontend
FRONTEND_HEALTH=$?

health_check_redis
REDIS_HEALTH=$?

echo ""
log_header "재시작 완료"

# 재시작 결과 요약
echo "🔄 재시작 결과:"
if [ $SERVICES_STOPPED -gt 0 ]; then
    log_success "$SERVICES_STOPPED개 서비스를 중지했습니다"
else
    log_info "중지할 서비스가 없었습니다"
fi

# 서비스 상태 요약
HEALTHY_SERVICES=0
echo ""
echo "🌐 서비스 상태:"

if [ $BACKEND_HEALTH -eq 0 ]; then
    log_success "백엔드: http://localhost:8080"
    HEALTHY_SERVICES=$((HEALTHY_SERVICES + 1))
else
    log_warning "백엔드: 시작 중 (logs/backend.log 확인)"
fi

if [ $FRONTEND_HEALTH -eq 0 ]; then
    if netstat -an 2>/dev/null | grep -q ":5173.*LISTEN"; then
        log_success "프론트엔드: http://localhost:5173"
    elif netstat -an 2>/dev/null | grep -q ":5174.*LISTEN"; then
        log_success "프론트엔드: http://localhost:5174"
    fi
    HEALTHY_SERVICES=$((HEALTHY_SERVICES + 1))
else
    log_warning "프론트엔드: 시작 중 (logs/frontend.log 확인)"
fi

if [ $REDIS_HEALTH -eq 0 ]; then
    log_success "Redis: localhost:6379"
    HEALTHY_SERVICES=$((HEALTHY_SERVICES + 1))
else
    log_warning "Redis: 연결 확인 필요"
fi

echo ""
echo "📊 추가 서비스:"
echo "   • H2 Console: http://localhost:8080/h2-console"
echo "   • Redis UI: http://localhost:8081"

echo ""
echo "💡 사용 가능한 명령어:"
echo "   • 서버 상태: ./dev-status.sh"
echo "   • 서버 중지: ./dev-stop.sh"
echo "   • 백엔드 로그: tail -f logs/backend.log"
echo "   • 프론트엔드 로그: tail -f logs/frontend.log"
echo ""

# 최종 결과
if [ $HEALTHY_SERVICES -eq 3 ]; then
    log_success "재시작이 성공적으로 완료되었습니다! 모든 서비스가 정상 작동 중입니다."
    exit 0
elif [ $HEALTHY_SERVICES -gt 0 ]; then
    log_warning "재시작이 부분적으로 성공했습니다. ($HEALTHY_SERVICES/3개 서비스 정상)"
    echo "   문제가 있는 서비스의 로그를 확인해주세요."
    exit 1
else
    log_error "재시작에 실패했습니다. 로그를 확인하고 수동으로 문제를 해결해주세요."
    echo ""
    echo "🔧 수동 복구 방법:"
    echo "   1. ./dev-stop.sh 로 완전 중지"
    echo "   2. 로그 확인: tail -f logs/backend.log"
    echo "   3. ./dev-start.sh 로 재시작"
    exit 1
fi