# 엘더베리 프로젝트 개발 가이드

## 📋 현재 개발 상황 (2025-01-26)

### ✅ 완료된 주요 작업
- **Spring Boot 3.x 기반 백엔드**: 완전한 프로젝트 구조 구축
- **React 18 + TypeScript 프론트엔드**: 정상 동작 (포트 5173)
- **H2 Database**: 파일 기반 데이터베이스 (./data/elderberry)
- **JWT 인증 시스템**: Spring Security 6.x 통합 완성
- **공공데이터 API 연동**: 요양시설, 병원, 약국 정보 자동 동기화
- **시설 매칭 시스템**: 추천 알고리즘 및 매칭 이력 관리
- **포트폴리오 자동화 시스템**: STAR 방법론 기반 자동 기록

### ⚠️ 현재 이슈
- **Java 환경 설정**: WSL에서 Windows JAVA_HOME 인식 문제
- **Spring Boot 빌드**: Gradle 빌드가 Java 경로 문제로 실패
- **컴파일 에러**: Repository 메서드 시그니처 불일치 (67개)

## 🚀 개발 시작 방법

### 1. 데이터베이스 설정
```yaml
# 개발 환경 (기본값)
- H2 파일 데이터베이스: jdbc:h2:file:./data/elderberry
- H2 콘솔: http://localhost:8080/h2-console
- 사용자명: sa / 비밀번호: (없음)

# 테스트 환경
- H2 인메모리: jdbc:h2:mem:testdb

# 프로덕션 환경 (추후)
- SQLite: jdbc:sqlite:./data/elderberry.db
```

### 2. 프론트엔드 시작
```bash
cd frontend
npm install
npm run dev  # 포트 5173에서 실행
```

### 3. 백엔드 시작 (Java 환경 설정 후)
```bash
# WSL에서 Java 설정
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH

# 빌드 및 실행
./gradlew clean build -x test
java -jar build/libs/elderberry-*.jar
```

## 🏗️ 프로젝트 구조

### 백엔드 (Spring Boot)
```
src/main/java/com/globalcarelink/
├── auth/           # 인증/인가 (JWT, Spring Security)
├── coordinator/    # 코디네이터 관리
├── external/       # 공공데이터 API 연동
├── facility/       # 시설 정보 및 매칭
├── health/         # 건강 평가
├── member/         # 회원 관리
├── profile/        # 프로필 관리
└── common/         # 공통 유틸리티
```

### 프론트엔드 (React + TypeScript)
```
frontend/src/
├── features/       # 기능별 컴포넌트
├── services/       # API 통신
├── stores/         # 상태 관리 (Zustand)
├── components/     # 공통 컴포넌트
└── types/          # TypeScript 타입 정의
```

## 🔧 주요 기능 및 API

### 1. 인증 API
- POST `/api/auth/signup` - 회원가입
- POST `/api/auth/login` - 로그인
- POST `/api/auth/refresh` - 토큰 갱신
- POST `/api/auth/logout` - 로그아웃

### 2. 시설 관리 API
- GET `/api/facilities/search` - 시설 검색
- GET `/api/facilities/{id}` - 시설 상세
- POST `/api/facilities/recommend` - 시설 추천
- POST `/api/facilities/matching/complete` - 매칭 완료

### 3. 공공데이터 API 프록시
- GET `/api/public-data/ltci/search` - 요양시설 검색
- GET `/api/public-data/hospital/search` - 병원 검색
- GET `/api/public-data/pharmacy/search` - 약국 검색

## 📊 현재 에러 해결 가이드

### Repository 메서드 시그니처 수정 필요
```java
// 현재 (에러)
List<Entity> findByField(String field);

// 수정 필요
Page<Entity> findByField(String field, Pageable pageable);
```

### 주요 에러 위치
- `CoordinatorCareSettingsRepository.java`
- `CoordinatorLanguageSkillRepository.java`
- `HealthAssessmentRepository.java`

## 🎯 개발 우선순위

1. **즉시 해결**: Java 환경 설정 문제 해결
2. **단기**: Repository 메서드 시그니처 통일
3. **중기**: 프론트엔드-백엔드 연동 완성
4. **장기**: Docker 환경 구축 및 배포 준비

## 📚 기술 스택

### Backend
- Java 17
- Spring Boot 3.2.x
- Spring Security 6.x
- Spring Data JPA
- H2 Database (개발) / SQLite (프로덕션 예정)
- Gradle 8.x

### Frontend
- React 18
- TypeScript 5.x
- Vite
- Zustand (상태 관리)
- Tailwind CSS
- React Query

### Infrastructure
- Docker & Docker Compose (준비 중)
- Redis (캐시, 준비 중)
- PostgreSQL (확장 시 사용 예정)

---

## 🔄 Context7 활용 규칙

- 모든 명령은 순차적으로 작업
- 답변은 한국어로 작성
- 코드에는 한국어 주석 추가
- 로컬 프로젝트 파일 검토 후 답변
- 중간 확인 없이 완료까지 작업
- 실제 프로젝트 상태 기반으로 작업

---

**🚀 현재 상태: Spring Boot 프로젝트 빌드 환경 설정 필요**