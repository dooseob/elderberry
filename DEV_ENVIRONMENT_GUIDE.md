# 엘더베리 최적화된 개발 환경 가이드

## 📋 개요

하이브리드 개발환경(Redis Docker + 로컬 백엔드/프론트엔드)을 위한 최적화된 스크립트 시스템입니다.

### 🎯 핵심 특징

- **🔧 환경 의존성 자동 체크**: Java, Node.js, Docker 설치 상태 확인
- **⚡ 스마트 헬스체크**: 백엔드, 프론트엔드, Redis 상태 실시간 모니터링  
- **🔄 자동 재시작**: 안전한 서비스 중지 후 재시작
- **📊 로그 관리**: 자동 로테이션 및 에러 감지
- **🎨 색상 로그**: 직관적인 상태 표시 시스템
- **🛡️ 에러 처리**: 강화된 예외 처리 및 롤백 기능

## 🚀 빠른 시작

### 1. 서버 시작
```bash
./dev-start.sh
```

### 2. 서버 상태 확인
```bash
./dev-status.sh
```

### 3. 서버 중지
```bash
./dev-stop.sh
```

### 4. 자동 재시작
```bash
./dev-restart.sh
```

## 📁 스크립트 구조

```
elderberry/
├── dev-start.sh           # 최적화된 서버 시작 스크립트
├── dev-stop.sh            # 안전한 서버 중지 스크립트
├── dev-status.sh          # 상세한 상태 확인 스크립트
├── dev-restart.sh         # 스마트 재시작 스크립트
├── scripts/
│   └── dev-common.sh      # 공통 함수 라이브러리
└── logs/
    ├── backend.log        # 백엔드 로그
    ├── frontend.log       # 프론트엔드 로그
    ├── backend.pid        # 백엔드 프로세스 ID
    └── frontend.pid       # 프론트엔드 프로세스 ID
```

## 🔧 주요 기능

### 환경 의존성 체크
```bash
# Java 21/17/11 체크
✅ Java 21.0.4 설치됨

# Node.js 18+ 체크
✅ Node.js v20.11.1 설치됨

# Docker 및 Docker Compose 체크
✅ Docker 24.0.7 실행중
✅ Docker Compose 2.21.0 설치됨
```

### 헬스체크 시스템
- **백엔드**: HTTP 헬스체크 (최대 60초 대기)
- **프론트엔드**: 포트 리스닝 확인 (최대 30초 대기)
- **Redis**: Docker 컨테이너 및 연결 테스트

### 로그 관리
- **자동 로테이션**: 10MB 초과 시 자동 백업
- **에러 감지**: 최근 50라인에서 에러/예외 자동 탐지
- **상세 정보**: 파일 크기, 라인 수, 최종 수정 시간 표시

### 프로세스 관리
- **PID 추적**: 백엔드/프론트엔드 프로세스 ID 관리
- **안전한 종료**: SIGTERM → SIGKILL 순차 처리
- **좀비 프로세스 방지**: 시그널 핸들러 설정

## 📊 상태 표시 시스템

### 색상 코드
- 🟢 **초록색**: 정상 상태 (`✅`)
- 🟡 **노란색**: 경고 상태 (`⚠️`)
- 🔴 **빨간색**: 오류 상태 (`❌`)
- 🔵 **파란색**: 정보 메시지 (`ℹ️`)

### 서비스 상태
```bash
🌐 서비스 포트 상태:
✅ 백엔드 (8080): 실행중
   └─ Health Check: OK
✅ 프론트엔드 (5173): 실행중
✅ Redis (6379): 실행중
   └─ Redis Ping: PONG
✅ Redis UI (8081): 실행중
```

## 🛠️ 고급 사용법

### 개별 서비스 관리
```bash
# 백엔드만 재시작
pkill -f "gradlew.*bootRun"
./gradlew bootRun > logs/backend.log 2>&1 &

# 프론트엔드만 재시작  
pkill -f "vite"
cd frontend && npm run dev > ../logs/frontend.log 2>&1 &
```

### 로그 모니터링
```bash
# 실시간 백엔드 로그
tail -f logs/backend.log

# 실시간 프론트엔드 로그
tail -f logs/frontend.log

# 에러만 필터링
grep -i "error\|exception" logs/backend.log

# 최근 에러 확인
tail -n 50 logs/backend.log | grep -i error
```

### Docker Redis 관리
```bash
# Redis 컨테이너 상태 확인
docker ps | grep elderberry-redis-dev

# Redis 접속 테스트
docker exec elderberry-redis-dev redis-cli -a elderberry123! ping

# Redis UI 접속
http://localhost:8081 (admin/elderberry123!)
```

## 🔍 문제 해결

### 포트 충돌
```bash
# 포트 사용 프로세스 확인
netstat -an | grep :8080
lsof -i :8080

# 강제 종료
pkill -f "gradlew.*bootRun"
pkill -f "vite"
```

### 서비스 비정상 종료
```bash
# 1. 상태 확인
./dev-status.sh

# 2. 강제 중지
./dev-stop.sh

# 3. 로그 확인
tail -n 100 logs/backend.log
tail -n 100 logs/frontend.log

# 4. 재시작
./dev-start.sh
```

### 환경 의존성 문제
```bash
# Java 설치 (Ubuntu/Debian)
sudo apt update
sudo apt install openjdk-21-jdk

# Node.js 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

## 📈 성능 최적화

### 로그 관리
- 로그 파일이 10MB 초과하면 자동 로테이션
- 7일 이상 된 백업 로그는 자동 삭제
- 실시간 에러 감지로 빠른 문제 파악

### 메모리 사용량
- 백엔드: ~300-500MB (Spring Boot + H2)
- 프론트엔드: ~100-200MB (Vite Dev Server)
- Redis: ~50-100MB (Docker Container)

### 시작 시간
- 전체 환경: ~15-30초
- 백엔드만: ~10-15초  
- 프론트엔드만: ~5-10초

## 🔗 관련 링크

### 서비스 접속
- **프론트엔드**: http://localhost:5173
- **백엔드 API**: http://localhost:8080
- **H2 Console**: http://localhost:8080/h2-console
- **Redis UI**: http://localhost:8081

### 테스트 계정
- **이메일**: test.domestic@example.com
- **비밀번호**: Password123!

## 📝 변경 이력

### v2.0 (2025-07-30) - 최적화 버전
- ✅ 환경 의존성 자동 체크 추가
- ✅ 색상 로그 시스템 도입
- ✅ 헬스체크 시스템 강화
- ✅ 자동 재시작 기능 추가
- ✅ 로그 로테이션 및 에러 감지
- ✅ 공통 함수 라이브러리 구축
- ✅ 안전한 프로세스 관리 시스템

### v1.0 (이전 버전)
- 기본 start/stop/status 스크립트
- 단순 PID 관리
- 기본 로그 출력

## 🤝 기여 방법

개선 사항이나 버그 발견 시:
1. 로그 파일 확인 (`logs/*.log`)
2. 상태 스크립트 실행 (`./dev-status.sh`)
3. 문제 상황 보고

---

**✨ 최적화된 개발 환경으로 더 효율적인 개발을 경험하세요!**