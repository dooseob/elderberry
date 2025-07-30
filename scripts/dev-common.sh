#!/bin/bash
# 공통 개발 환경 함수들
# 각 스크립트에서 source로 불러와서 사용

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 로그 함수들
log_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_header() {
    echo -e "${BLUE}🚀 $1${NC}"
    echo "========================================="
}

# 환경 체크 함수들
check_java() {
    if command -v java >/dev/null 2>&1; then
        JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
        if [[ "$JAVA_VERSION" =~ ^(21|17|11)\. ]]; then
            log_success "Java $JAVA_VERSION 설치됨"
            return 0
        else
            log_warning "Java $JAVA_VERSION 발견됨 (권장: Java 11+)"
            return 1
        fi
    else
        log_error "Java가 설치되지 않았습니다"
        echo "   설치 방법: sudo apt install openjdk-21-jdk"
        return 1
    fi
}

check_nodejs() {
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version)
        if [[ "$NODE_VERSION" =~ ^v(18|20|22)\. ]]; then
            log_success "Node.js $NODE_VERSION 설치됨"
            return 0
        else
            log_warning "Node.js $NODE_VERSION 발견됨 (권장: v18+)"
            return 1
        fi
    else
        log_error "Node.js가 설치되지 않았습니다"
        echo "   설치 방법: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
        return 1
    fi
}

check_npm() {
    if command -v npm >/dev/null 2>&1; then
        NPM_VERSION=$(npm --version)
        log_success "npm $NPM_VERSION 설치됨"
        return 0
    else
        log_error "npm이 설치되지 않았습니다"
        return 1
    fi
}

check_docker() {
    if command -v docker >/dev/null 2>&1; then
        if docker info >/dev/null 2>&1; then
            DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
            log_success "Docker $DOCKER_VERSION 실행중"
            return 0
        else
            log_error "Docker가 설치되었지만 실행되지 않습니다"
            echo "   시작 방법: sudo systemctl start docker"
            return 1
        fi
    else
        log_error "Docker가 설치되지 않았습니다"
        echo "   설치 방법: curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
        return 1
    fi
}

check_docker_compose() {
    if command -v docker-compose >/dev/null 2>&1; then
        COMPOSE_VERSION=$(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1)
        log_success "Docker Compose $COMPOSE_VERSION 설치됨"
        return 0
    elif docker compose version >/dev/null 2>&1; then
        COMPOSE_VERSION=$(docker compose version --short)
        log_success "Docker Compose (plugin) $COMPOSE_VERSION 설치됨"
        return 0
    else
        log_error "Docker Compose가 설치되지 않았습니다"
        return 1
    fi
}

# 포트 체크 함수
check_port() {
    local port=$1
    local service_name=$2
    
    if netstat -an 2>/dev/null | grep -q ":${port}.*LISTEN"; then
        log_success "$service_name (포트 $port): 실행중"
        return 0
    else
        log_warning "$service_name (포트 $port): 사용 가능"
        return 1
    fi
}

# 프로세스 체크 함수
check_process_by_pid() {
    local pid_file=$1
    local service_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            log_success "$service_name: PID $pid (실행중)"
            return 0
        else
            log_warning "$service_name: PID $pid (종료됨)"
            rm -f "$pid_file"
            return 1
        fi
    else
        log_warning "$service_name: PID 파일 없음"
        return 1
    fi
}

# 서비스 헬스체크 함수
health_check_backend() {
    local max_attempts=30
    local attempt=0
    
    log_info "백엔드 헬스체크 시작..."
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:8080/actuator/health >/dev/null 2>&1; then
            log_success "백엔드 헬스체크: OK"
            return 0
        fi
        
        attempt=$((attempt + 1))
        if [ $((attempt % 5)) -eq 0 ]; then
            log_info "백엔드 시작 대기 중... ($attempt/${max_attempts})"
        fi
        sleep 2
    done
    
    log_warning "백엔드 헬스체크: 타임아웃 (logs/backend.log 확인 필요)"
    return 1
}

health_check_frontend() {
    local max_attempts=15
    local attempt=0
    
    log_info "프론트엔드 헬스체크 시작..."
    
    while [ $attempt -lt $max_attempts ]; do
        if netstat -an 2>/dev/null | grep -q ":5173.*LISTEN" || netstat -an 2>/dev/null | grep -q ":5174.*LISTEN"; then
            log_success "프론트엔드 헬스체크: OK"
            return 0
        fi
        
        attempt=$((attempt + 1))
        if [ $((attempt % 3)) -eq 0 ]; then
            log_info "프론트엔드 시작 대기 중... ($attempt/${max_attempts})"
        fi
        sleep 2
    done
    
    log_warning "프론트엔드 헬스체크: 타임아웃 (logs/frontend.log 확인 필요)"
    return 1
}

health_check_redis() {
    if docker ps --format "table {{.Names}}" | grep -q "elderberry-redis-dev"; then
        if docker exec elderberry-redis-dev redis-cli -a elderberry123! ping >/dev/null 2>&1; then
            log_success "Redis 헬스체크: PONG"
            return 0
        else
            log_warning "Redis 헬스체크: 연결 실패"
            return 1
        fi
    else
        log_warning "Redis 컨테이너: 실행되지 않음"
        return 1
    fi
}

# 로그 관리 함수
setup_log_directory() {
    if [ ! -d "logs" ]; then
        mkdir -p logs
        log_info "로그 디렉토리 생성: logs/"
    fi
}

rotate_log_if_needed() {
    local log_file=$1
    local max_size_mb=${2:-10}  # 기본 10MB
    
    if [ -f "$log_file" ]; then
        local size_mb=$(( $(stat -f%z "$log_file" 2>/dev/null || stat -c%s "$log_file" 2>/dev/null || echo 0) / 1024 / 1024 ))
        
        if [ $size_mb -gt $max_size_mb ]; then
            local backup_file="${log_file}.$(date +%Y%m%d_%H%M%S)"
            mv "$log_file" "$backup_file"
            log_info "로그 로테이션: $log_file -> $(basename $backup_file)"
            
            # 7일 이전 백업 파일 삭제
            find "$(dirname "$log_file")" -name "$(basename "$log_file").20*" -mtime +7 -delete 2>/dev/null || true
        fi
    fi
}

# 의존성 체크 (전체)
check_all_dependencies() {
    log_header "환경 의존성 체크"
    
    local java_ok=0
    local node_ok=0
    local docker_ok=0
    local compose_ok=0
    
    check_java && java_ok=1
    check_nodejs && node_ok=1
    check_npm
    check_docker && docker_ok=1
    check_docker_compose && compose_ok=1
    
    echo ""
    
    if [ $java_ok -eq 1 ] && [ $node_ok -eq 1 ] && [ $docker_ok -eq 1 ] && [ $compose_ok -eq 1 ]; then
        log_success "모든 의존성이 충족되었습니다!"
        return 0
    else
        log_warning "일부 의존성이 누락되었습니다. 위의 안내를 참고하여 설치해주세요."
        echo ""
        echo "📖 설치 가이드:"
        echo "   Java: https://docs.oracle.com/en/java/javase/21/"
        echo "   Node.js: https://nodejs.org/"
        echo "   Docker: https://docs.docker.com/engine/install/"
        return 1
    fi
}

# 클린업 함수
cleanup_on_exit() {
    log_info "정리 작업 중..."
    
    # PID 파일 정리
    for pid_file in logs/*.pid; do
        if [ -f "$pid_file" ]; then
            local pid=$(cat "$pid_file" 2>/dev/null)
            if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
                log_info "프로세스 종료: PID $pid"
                kill "$pid" 2>/dev/null || true
            fi
            rm -f "$pid_file"
        fi
    done
}

# 시그널 핸들러 설정
setup_signal_handlers() {
    trap cleanup_on_exit EXIT
    trap cleanup_on_exit INT
    trap cleanup_on_exit TERM
}