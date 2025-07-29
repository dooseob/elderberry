# 🐳 Docker 환경 설정 가이드

## 📋 현재 상황
- **WSL2 환경**: Docker가 설치되지 않은 상태
- **개발 환경**: 현재 ./dev-start.sh로 로컬 실행 중
- **Docker 파일**: docker-compose.dev.yml 준비 완료

## 🚀 Docker 설치 및 설정 단계

### **Option 1: Docker Desktop 설치 (권장)**

#### **1. Docker Desktop 다운로드**
```bash
# Windows 환경에서 실행
# https://docs.docker.com/desktop/install/windows/
# Docker Desktop for Windows 다운로드 및 설치
```

#### **2. WSL2 통합 활성화**
```bash
# Docker Desktop 설정 → Resources → WSL Integration
# Enable integration with my default WSL distro 체크
# Enable integration with additional distros: Ubuntu 체크
```

#### **3. WSL2에서 Docker 확인**
```bash
# WSL2 터미널에서 실행
docker --version
docker-compose --version
```

### **Option 2: 현재 환경에서 계속 개발 (임시)**

#### **기존 방식으로 개발 계속**
```bash
# 현재 잘 작동하는 방식 유지
./dev-start.sh              # 프론트엔드 + 백엔드 실행
./dev-status.sh             # 상태 확인
./dev-stop.sh               # 중지
```

#### **Docker 없이도 팀 협업 가능**
- ✅ GitHub Actions CI/CD는 Docker 없이도 작동
- ✅ 기존 개발 환경 그대로 유지
- ✅ 추후 Docker 설치 시 즉시 전환 가능

## 🎯 **추천 방법: 단계적 접근**

### **1단계: 현재 개발 계속 (즉시)**
```bash
# 기존 방식으로 팀 협업 시작
./dev-start.sh
# 프론트엔드: http://localhost:5173
# 백엔드: http://localhost:8080
```

### **2단계: Docker Desktop 설치 (여유 있을 때)**
```bash
# Windows에서 Docker Desktop 설치
# WSL2 통합 활성화 후 
docker-compose -f docker-compose.dev.yml up -d
```

### **3단계: 팀원과 환경 통일**
```bash
# 모든 팀원이 Docker 설치 완료 시
git pull
docker-compose up -d  # 완전 통일된 환경
```

## 💡 **현재 최적 선택**

**✅ 현재는 기존 방식 계속 사용 권장**
- 이미 완전히 작동하는 개발 환경
- 팀원 합류 시 ./dev-start.sh 가이드 제공
- Docker 설치는 시간 여유 있을 때 진행

**📋 팀원 온보딩 (Docker 없는 환경)**
```bash
# 1. 레포지토리 클론
git clone 레포지토리
cd elderberry

# 2. 기존 방식으로 실행
./dev-start.sh

# 3. 브라우저 확인
# http://localhost:5173 (프론트엔드)
# http://localhost:8080 (백엔드)

# 4. 테스트 로그인
# test.domestic@example.com / Password123!
```

## 🔄 **Docker 설치 후 마이그레이션**

```bash
# Docker 설치 완료 시 즉시 전환 가능
./dev-stop.sh                                # 기존 환경 종료
docker-compose -f docker-compose.dev.yml up -d  # Docker 환경 시작
```

**혜택:**
- ✅ 완전 동일한 환경 보장
- ✅ Redis, PostgreSQL 등 확장 서비스 쉽게 추가
- ✅ 프로덕션과 동일한 환경 테스트