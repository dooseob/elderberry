# 🚨 엘더베리 프로젝트 긴급 복구 매뉴얼

## 📊 현재 상황 분석

### ✅ 정상 동작 중인 부분
- **백엔드 서버**: ✅ Spring Boot (포트 8080) 정상 실행
- **프론트엔드 서버**: ✅ Vite 개발 서버 (포트 5173) 정상 실행  
- **데이터베이스**: ✅ H2 파일 DB 정상 연결
- **Redis 캐시**: ✅ Docker 컨테이너 정상 동작
- **API 통신**: ✅ 로그인 API 200 OK 응답

### 🚨 문제 발생 영역
- **프론트엔드 렌더링**: React 컴포넌트 무한 루프 에러
- **홈화면 출력**: NotificationBell 컴포넌트 크래시로 인한 화면 표시 안됨
- **사용자 인터페이스**: 브라우저에서 빈 화면 또는 에러 화면만 표시

## 🎯 즉시 실행 복구 계획 (5분 내)

### 1단계: 백엔드 독립 검증 (2분)
```bash
# 백엔드만 독립적으로 시작하여 API 기능 확인
chmod +x start-backend-only.sh
./start-backend-only.sh

# 백엔드 API 완전 테스트
chmod +x test-backend-api.sh
./test-backend-api.sh
```

### 2단계: 프론트엔드 개발 모드 시작 (3분)
```bash
# 프론트엔드 개발 서버 독립 시작
chmod +x start-frontend-dev.sh
./start-frontend-dev.sh
```

### 3단계: 브라우저 테스트 도구 사용
```bash
# 브라우저에서 다음 파일 열기
file:///tmp/browser-test.html

# 또는 직접 브라우저 접속
http://localhost:5173
```

## 🔧 문제별 대응 방안

### A. 백엔드 문제 발생 시

#### A1. 포트 8080 충돌
```bash
# 포트 사용 프로세스 확인 및 종료
lsof -ti:8080 | head -5 | xargs -r kill -9
./start-backend-only.sh
```

#### A2. 빌드 실패
```bash
# 클린 빌드 후 재시작
./gradlew clean
./start-backend-only.sh
```

#### A3. 데이터베이스 연결 실패
```bash
# H2 데이터베이스 파일 권한 확인
ls -la data/elderberry_new.mv.db
chmod 664 data/elderberry_new.mv.db
```

### B. 프론트엔드 문제 발생 시

#### B1. React 렌더링 에러 (현재 주요 문제)
**임시 해결책**: NotificationBell 비활성화 (이미 적용됨)
```typescript
// Header.tsx에서 이미 적용된 수정
{isAuthenticated && false && (
  <div className="notification-wrapper">
    <NotificationBell />
    <NotificationPanel />
  </div>
)}
```

#### B2. Vite 서버 시작 실패
```bash
# node_modules 재설치
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run dev
```

#### B3. TypeScript 컴파일 에러
```bash
# TypeScript 캐시 삭제
cd frontend
rm -rf .vite
npm run dev
```

### C. 통합 문제 발생 시

#### C1. CORS 에러
백엔드에서 이미 설정되어 있으나, 확인 방법:
```bash
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS http://localhost:8080/api/auth/login
```

#### C2. API 통신 실패
브라우저 개발자 도구에서 Network 탭 확인:
1. F12 → Network 탭
2. 로그인 시도
3. 에러 상태 코드 확인

## 📋 복구 우선순위

### 🟥 즉시 처리 (5분 내)
1. **NotificationBell 비활성화** ✅ 완료
2. **백엔드 API 검증** - `./test-backend-api.sh` 실행
3. **프론트엔드 기본 화면 확인** - http://localhost:5173 접속

### 🟨 단기 처리 (30분 내)
1. **NotificationBell 무한 루프 근본 해결**
2. **React Error Boundary 강화**
3. **로딩 상태 처리 개선**

### 🟩 중장기 처리 (1시간 내)
1. **전체 컴포넌트 의존성 검토**
2. **성능 최적화 및 메모이제이션 적용**
3. **에러 모니터링 시스템 구축**

## 🎯 성공 지표

### MVP 복구 성공 기준
- ✅ 홈화면 정상 표시
- ✅ 로그인/로그아웃 기능 동작
- ✅ 기본 네비게이션 작동
- ✅ API 통신 정상

### 완전 복구 성공 기준
- ✅ 모든 페이지 정상 렌더링
- ✅ 실시간 알림 시스템 동작
- ✅ 성능 최적화 완료
- ✅ 에러 없는 안정적 동작

## 🔄 백업 계획

### 계획 A: 현재 방식 (권장)
- 백엔드 + 프론트엔드 독립 실행
- NotificationBell 임시 비활성화
- 기본 기능 우선 확보

### 계획 B: Docker 환경 (대안)
```bash
# Docker Compose 환경으로 전환
docker-compose -f docker-compose.dev.yml up -d
```

### 계획 C: 최소 기능 버전 (최후 수단)
- 정적 HTML 페이지로 임시 대체
- 백엔드 API만 사용하는 간단한 인터페이스
- 점진적 기능 복구

## 📞 문제 발생 시 연락처

**즉시 확인해야 할 로그 파일들:**
- `logs/backend.log` - 백엔드 서버 로그
- `logs/frontend.log` - 프론트엔드 개발 서버 로그
- 브라우저 개발자 도구 Console 탭

**복구 상태 확인 명령어:**
```bash
# 전체 시스템 상태 한번에 확인
curl -s http://localhost:8080/actuator/health && echo " - Backend OK" || echo " - Backend FAIL"
curl -s http://localhost:5173 > /dev/null && echo "Frontend OK" || echo "Frontend FAIL"
```

---

**📅 작성일**: 2025-08-12  
**🎯 목표**: 5분 내 기본 기능 복구, 30분 내 안정화  
**📊 현재 진행률**: 백엔드 100% / 프론트엔드 70% / 통합 60%