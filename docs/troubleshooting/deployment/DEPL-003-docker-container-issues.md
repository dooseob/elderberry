# DEPL-003: Docker 컨테이너 및 이미지 빌드 문제

## 문제 상황
- **발생일**: 2025-07-30
- **심각도**: [ERROR]
- **영향범위**: Docker 환경 전체

백엔드와 데이터베이스 Docker 이미지가 없고, 프론트엔드 이미지는 있지만 실행되지 않는 문제

## 증상
1. `docker images` 확인 시 백엔드 이미지 없음
2. 프론트엔드 컨테이너가 시작 후 바로 종료됨 (Exit 1)
3. Docker Compose 빌드 실패

## 원인 분석

### 1. 백엔드 Docker 이미지 빌드 실패
- **근본 원인**: buildx 설정 문제 및 Node.js 설치 오류
- **상세 내용**:
  ```
  docker: 'docker buildx build' requires 1 argument
  E: Failed to fetch http://archive.ubuntu.com/ubuntu/... Hash Sum mismatch
  ```

### 2. 프론트엔드 의존성 문제
- **근본 원인**: Dockerfile에서 npm install 누락
- **상세 내용**: vite 명령어를 찾을 수 없음

## 해결 방법

### 1. Dockerfile 수정 (Node.js 안정적 설치)
```dockerfile
# Node.js 설치 (Ubuntu 기반) - 안정적인 방법
RUN apt-get clean && rm -rf /var/lib/apt/lists/* \
    && apt-get update --fix-missing \
    && apt-get install -y --no-install-recommends \
        curl \
        ca-certificates \
        gnupg \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /usr/share/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" > /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
```

### 2. 프론트엔드 의존성 명시적 설치
```dockerfile
# 프론트엔드 의존성 명시적 설치
WORKDIR /app/frontend
RUN npm install --legacy-peer-deps

# 작업 디렉토리를 다시 루트로 변경
WORKDIR /app
```

### 3. Docker 빌드 명령 수정
```bash
# buildx 대신 표준 docker build 사용
docker build -t elderberry-backend:latest .

# Docker Compose로 전체 스택 빌드
docker-compose -f docker-compose.dev.yml up --build -d
```

## 해결 결과
- ✅ 백엔드 이미지 생성 성공 (elderberry-backend:latest - 659MB)
- ✅ 프론트엔드 컨테이너 정상 실행
- ✅ 4개 서비스 모두 정상 작동
  - elderberry-backend-dev (포트 8080)
  - elderberry-frontend-dev (포트 5173)
  - elderberry-redis-dev (포트 6379)
  - elderberry-redis-commander-dev (포트 8081)

## 교훈
1. Ubuntu 패키지 저장소 미러 동기화 문제 대비 필요
2. Docker 빌드 시 의존성은 명시적으로 설치
3. buildx 문제 발생 시 표준 build 명령 사용

## 관련 파일
- `/Dockerfile`
- `/frontend/Dockerfile.dev`
- `/docker-compose.dev.yml`

## 태그
[Docker], [Container], [Build], [Node.js], [Ubuntu], [Hash Sum Mismatch]