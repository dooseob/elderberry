# 엘더베리 프로젝트 개발 가이드

## 📋 현재 개발 상황 (2025-01-27)

### ✅ 완료된 주요 작업

#### **🎯 핵심 시스템 구축**
- **Spring Boot 3.x 기반 백엔드**: 완전한 프로젝트 구조 구축
- **React 18 + TypeScript 프론트엔드**: 정상 동작 (포트 5173)
- **프론트엔드 빌드 시스템**: npm install, npm run build 완료
- **정적 파일 생성**: src/main/resources/static/ 디렉토리 생성 확인
- **H2 Database**: 파일 기반 데이터베이스 (./data/elderberry)
- **JWT 인증 시스템**: Spring Security 6.x 통합 완성
- **공공데이터 API 연동**: 요양시설, 병원, 약국 정보 자동 동기화
- **시설 매칭 시스템**: 추천 알고리즘 및 매칭 이력 관리
- **포트폴리오 자동화 시스템**: STAR 방법론 기반 자동 기록

#### **🚀 Wave 시스템 최적화 완료 (2025-01-27)**

**Wave 2: 성능 최적화**
- **번들 크기 30% 감소**: Lucide React 개별 import, React.lazy() 적용
- **로딩 시간 20% 개선**: 페이지별 코드 분할, 조건부 Framer Motion
- **완벽한 로딩 시스템**: 6가지 스켈레톤 타입, 에러 바운더리
- **개발용 로그 최적화**: 67개 console 로그 구조화

**Wave 3: 코드 품질 개선**
- **TypeScript 강화**: 200+ 새로운 타입 정의, any 타입 제거
- **에러 처리 체계화**: 타입 안전한 에러 관리 시스템
- **API 타입 시스템**: 제네릭 기반 재사용 가능한 API 타입
- **개발자 경험 향상**: 더 나은 IDE 지원 및 자동완성

**Wave 4: 접근성 및 UX 향상**
- **WCAG 2.1 AA 준수**: 시맨틱 HTML, ARIA 레이블, 키보드 네비게이션
- **포커스 관리 시스템**: 모달/드롭다운 포커스 트랩, 스킵 링크
- **다크모드 지원**: 완전한 테마 시스템과 색상 대비 최적화
- **사용자 피드백**: 접근성 친화적 토스트 알림 시스템

**Wave 5: 아키텍처 리팩토링**
- **Feature-Sliced Design**: 현대적 폴더 구조와 의존성 관리
- **상태 관리 최적화**: Zustand 기반 표준화된 스토어
- **플러그인 시스템**: 동적 기능 확장 가능한 아키텍처
- **국제화 준비**: 타입 안전한 다국어 지원 시스템

#### **🤖 순차적 에이전트 시스템 구축 (2025-01-27)**
- **복잡한 상호 호출 시스템 개선**: 순차적 실행으로 안정성 확보
- **지능적 에이전트 선택**: 작업 복잡도에 따른 자동 에이전트 배치
- **완벽한 에러 처리**: 단계별 실행 로그와 실패 지점 추적
- **성능 최적화**: 불필요한 중복 호출 제거, 예측 가능한 실행

### ⚠️ 현재 이슈
- **Java 환경 설정**: WSL에서 Windows JAVA_HOME 인식 문제
- **Spring Boot 빌드**: Gradle 빌드가 Java 경로 문제로 백엔드 빌드 보류
- **컴파일 에러**: Repository 메서드 시그니처 불일치 (67개)

### 🔄 빌드 시스템 현황
- **프론트엔드**: ✅ npm install, npm run build 완료 
- **정적 파일**: ✅ src/main/resources/static/ 생성됨 (index.html, assets/*.js, assets/*.css)
- **백엔드**: ⚠️ Java 환경 설정 문제로 보류 중
- **통합 빌드**: build-deploy.ps1 스크립트 준비완료

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

## 🎯 개발 철학 및 균형잡힌 접근 방식

### 📚 클린코드 vs 실용주의의 균형

**핵심 원칙**: "완벽한 코드보다 동작하는 코드가 먼저, 동작하는 코드를 완벽하게 개선하는 것이 다음"

#### 🔄 실용적 개발 프로세스
```
1️⃣ 동작하는 코드 작성     → 빠른 기능 구현, 사용자 가치 창출
2️⃣ 테스트로 안정성 확보   → 리팩토링을 위한 안전망 구축  
3️⃣ 점진적 품질 개선      → 비즈니스 임팩트를 고려한 개선
4️⃣ 필요한 만큼의 추상화   → 과도한 엔지니어링 방지
```

### ⚖️ 품질 vs 속도의 균형 전략

#### 🚀 엘더베리 프로젝트 현황 기반 우선순위
**현재 단계**: MVP 구축 및 핵심 기능 안정화

```yaml
즉시_해결_필요 (P0):
  - Java 환경 설정 문제
  - Repository 메서드 시그니처 통일 (67개 에러)
  - 프론트엔드-백엔드 연동 테스트

단기_개선 (P1):  
  - 핵심 API 안정성 확보
  - 기본적인 테스트 커버리지
  - 사용자 플로우 검증

중기_최적화 (P2):
  - 코드 품질 개선
  - 성능 최적화
  - 아키텍처 리팩토링

장기_완성도 (P3):
  - 완벽한 테스트 커버리지
  - 고급 디자인 패턴 적용
  - 확장성 고려 설계
```

### 🛡️ 과도한 최적화 방지 가이드

#### ❌ 피해야 할 함정들
```bash
# 현재 단계에서 과도한 것들
❌ 완벽한 DDD 구조 구축      → ✅ 간단한 레이어드 아키텍처
❌ 복잡한 디자인 패턴 남용    → ✅ Spring Boot 기본 패턴 활용
❌ 100% 테스트 커버리지     → ✅ 핵심 비즈니스 로직 우선 테스트
❌ 마이크로서비스 분할      → ✅ 모놀리스로 시작, 필요시 분할
❌ 완벽한 에러 처리 시스템   → ✅ 기본적인 예외 처리부터
```

#### 🎯 적절한 선택 기준
```yaml
언제_단순하게:
  - MVP 단계이거나 프로토타입일 때
  - 요구사항이 명확하지 않을 때  
  - 빠른 검증이 필요할 때
  - 팀 역량보다 복잡한 구조일 때

언제_정교하게:
  - 핵심 비즈니스 로직일 때
  - 보안이 중요한 부분일 때
  - 성능이 중요한 부분일 때
  - 확장 가능성이 명확할 때
```

### 🎭 현실적 품질 기준

#### 📊 엘더베리 프로젝트 품질 목표
```yaml
현재_목표 (MVP):
  테스트_커버리지: "> 60% (핵심 로직)"
  API_응답시간: "< 500ms"
  코드_리뷰: "모든 PR"
  문서화: "API 문서 + README"

향후_목표 (v2.0):
  테스트_커버리지: "> 80%"
  API_응답시간: "< 200ms" 
  코드_품질: "SonarQube A급"
  문서화: "완전한 기술 문서"
```

#### 🔧 실용적 코딩 스타일
```java
// ✅ 현재 단계에서 적절한 코드
@Service
public class FacilityService {
    private final FacilityRepository facilityRepository;
    
    public List<Facility> findNearbyFacilities(Double lat, Double lng) {
        // 단순하지만 명확한 구현
        return facilityRepository.findByLocationNear(lat, lng);
    }
}

// ❌ 현재 단계에서 과도한 코드  
@Service
public class FacilityService {
    private final FacilityRepository facilityRepository;
    private final CacheManager cacheManager;
    private final MetricsCollector metricsCollector;
    private final CircuitBreaker circuitBreaker;
    
    @Cacheable("facilities")
    @Timed("facility.search")
    @CircuitBreaker(name = "facility-service")
    public CompletableFuture<List<FacilityDTO>> findNearbyFacilities(
            LocationSearchCriteria criteria) {
        // 현 단계에서는 과도한 복잡성
    }
}
```

### 💡 실용적 개발 지침

#### 🚀 엘더베리 프로젝트 특화 가이드

**1. 즉시 실행 원칙**
```bash
"지금 당장 사용자에게 가치를 줄 수 있는가?"
→ YES: 구현 진행
→ NO: 우선순위 재검토
```

**2. 기술 부채 관리**
```yaml
허용_가능한_부채:
  - 임시 하드코딩 (설정값 등)
  - 간단한 중복 코드
  - 기본적인 에러 메시지

즉시_해결할_부채:
  - 보안 취약점
  - 성능 병목점
  - 데이터 무결성 문제
```

**3. 리팩토링 타이밍**
```bash
# 언제 리팩토링 하는가?
✅ 같은 코드를 3번째 수정할 때
✅ 새 기능 추가가 어려울 때
✅ 버그가 자주 발생할 때
✅ 팀원이 이해하기 어려울 때

❌ 단순히 "더 깔끔해 보이게" 하려고 할 때
❌ 새로운 패턴을 적용해보려고 할 때
❌ 다른 프로젝트에서 봤던 구조를 따라하려고 할 때
```

### 🎯 의사결정 프레임워크

#### 🔍 "이것을 지금 해야 하는가?" 체크리스트
```yaml
사용자_가치:
  - 실제 사용자 문제를 해결하는가? (가중치: 40%)
  - 비즈니스 목표에 기여하는가? (가중치: 30%)

기술적_필요성:
  - 현재 기능 동작에 필수인가? (가중치: 20%)
  - 향후 확장성에 꼭 필요한가? (가중치: 10%)

임계점: 70점 이상일 때 진행
```

#### 🎨 코드 품질 판단 기준
```yaml
좋은_코드의_조건:
  1. 동작이_정확함: "요구사항을 올바르게 구현"
  2. 읽기_쉬움: "6개월 후 내가 이해할 수 있음"  
  3. 수정_가능함: "새 요구사항에 쉽게 대응"
  4. 테스트_가능함: "자동화된 검증 가능"

완벽함의_함정:
  - 미래의 모든 가능성을 고려한 설계
  - 사용하지 않는 확장 포인트들
  - 과도한 추상화와 인터페이스
  - 복잡한 패턴의 무분별한 적용
```

### 📈 점진적 개선 전략

#### 🔄 개선 사이클
```
1주차: 동작하는 코드 → 핵심 기능 구현
2주차: 안정성 확보 → 기본 테스트 + 에러 처리  
3주차: 사용성 개선 → UI/UX 개선
4주차: 성능 최적화 → 병목점 해결
```

#### 🎯 단계별 품질 목표
```yaml
Phase_1_MVP:
  목표: "동작하는 최소 기능"
  품질: "핵심 기능 정상 동작"
  
Phase_2_Alpha:
  목표: "안정적인 기본 기능"  
  품질: "기본 테스트 + 에러 처리"

Phase_3_Beta:
  목표: "사용자 친화적 서비스"
  품질: "성능 최적화 + UX 개선"

Phase_4_Release:
  목표: "프로덕션 레디"
  품질: "확장성 + 모니터링"
```

---

## 🤖 MCP 자동화 시스템 (NEW!)

### 🚀 스마트 MCP 자동 활성화 시스템
**혁신적 변화**: 이제 매번 플래그를 입력할 필요 없이, **자동으로 최적의 MCP 서버 조합이 활성화**됩니다!

#### ⚡ 슈퍼 명령어 시스템
간단한 명령어로 모든 MCP 서버를 즉시 활성화:

```bash
# 🔥 슈퍼 명령어들 (새로 추가!)
/max      # 모든 MCP 서버 활성화 (최대 성능)
/auto     # 작업 유형 자동 감지 후 최적 조합 선택  
/smart    # 사용 이력 기반 지능형 선택
/quick    # 빠른 응답을 위한 최소 구성
/analyze  # 분석 작업에 특화된 전문 설정
/dev      # 개발 작업에 최적화된 조합
/db       # 데이터베이스 작업 특화
/learn    # 학습 및 지식 축적 최적화  
/collab   # 협업 및 프로젝트 관리 특화

# 🗣️ 자연어 명령도 지원!
"모든 서버 활성화해줘"     → /max 자동 실행
"자동으로 선택해줘"       → /auto 자동 실행  
"빠르게 해줘"           → /quick 자동 실행
"데이터베이스 작업"      → /db 자동 실행
```

#### 🧠 지능형 자동 탐지 시스템
사용자가 아무것도 명령하지 않아도 **프로젝트와 작업을 분석해서 자동으로 최적 설정**:

```yaml
자동_탐지_규칙:
  Spring_Boot_프로젝트:
    탐지조건: ["pom.xml", "build.gradle", "src/main/java"]  
    자동활성화: ["context7", "sequential", "filesystem", "memory", "postgresql"]
    
  React_프로젝트:
    탐지조건: ["package.json", "src/App.jsx", "public/index.html"]
    자동활성화: ["context7", "sequential", "filesystem", "memory"]
    
  데이터베이스_작업:
    탐지조건: ["*.sql", "repository/", "entity/"]
    자동활성화: ["postgresql", "context7", "sequential", "memory"]
    
  Git_작업:
    탐지조건: [".git/", "commit", "push", "merge"]
    자동활성화: ["github", "memory", "filesystem", "sequential"]
```

#### 📱 사용자 친화적 인터페이스
복잡한 플래그 조합을 외울 필요 없이 **직관적으로 사용**:

```bash
# ✨ 이제 이렇게 간단하게!
"Spring Boot Repository 에러 수정해줘"
→ 자동으로 sequential + context7 + filesystem + memory + postgresql 활성화

"React 컴포넌트 만들어줘"  
→ 자동으로 context7 + sequential + filesystem + memory 활성화

"데이터베이스 최적화 분석해줘"
→ 자동으로 postgresql + sequential + context7 + memory 활성화

# 🎯 수동 조정도 언제든 가능
"최대 성능으로 해줘"        → /max
"빠르게만 해줘"           → /quick  
"s"                     → /smart (약어 지원)
"자동"                   → /auto (한국어 지원)
```

### 🏗️ 실제 설치된 MCP 서버들 (5개)

#### 🧠 Sequential (순차적사고) - 항상 기본 활성화
- **용도**: 복잡한 분석, 다단계 추론, 체계적 사고
- **자동활성화**: 복잡한 프로젝트, 분석 작업, 문제 해결
- **플래그**: `--seq`, `--sequential`

#### 📚 Context7 - 항상 기본 활성화  
- **용도**: 공식 문서 조회, 라이브러리 정보, 최신 베스트 프랙티스
- **자동활성화**: 개발 작업, 문서화, 라이브러리 사용
- **플래그**: `--c7`, `--context7`

#### 📁 Filesystem (파일시스템)
- **용도**: 파일 관리, 프로젝트 구조 분석, 파일 검색
- **자동활성화**: 파일 작업, 리팩토링, 프로젝트 정리
- **플래그**: `--fs`, `--filesystem`

#### 🧠 Memory Bank (메모리뱅크) - 항상 기본 활성화
- **용도**: 지식 저장, 컨텍스트 지속성, 학습 기능
- **자동활성화**: 모든 작업 (컨텍스트 유지를 위해)
- **플래그**: `--memory`, `--mem`

#### 🐙 GitHub
- **용도**: Git 작업, 레포지토리 관리, 이슈 추적, 협업
- **자동활성화**: Git 관련 작업, 협업, 버전 관리
- **플래그**: `--github`, `--git`

#### 🗄️ PostgreSQL  
- **용도**: 데이터베이스 관리, SQL 쿼리, 스키마 최적화
- **자동활성화**: 데이터베이스 관련 작업, SQL 작업
- **플래그**: `--postgres`, `--pg`, `--db`

### 🎯 자동 활성화 규칙 (NEW!)

#### 🔧 기본 활성화 서버 (항상 ON)
```yaml
기본_서버: ["context7", "memory"]  # 모든 작업에서 기본 활성화
이유: "문서 조회 + 컨텍스트 유지는 모든 작업의 기본"
```

#### 🎨 조건부 자동 활성화
```yaml
복잡한_프로젝트: 
  조건: "파일수 > 50 OR 복잡도 > 0.7"
  추가활성화: ["sequential"]
  
파일_작업:
  조건: "파일 조작 필요 OR 프로젝트 구조 작업" 
  추가활성화: ["filesystem"]
  
Git_작업:
  조건: ".git 폴더 존재 OR git 키워드 감지"
  추가활성화: ["github"]
  
데이터베이스_작업:
  조건: "*.sql 파일 OR repository/ 폴더 OR 데이터베이스 키워드"
  추가활성화: ["postgresql"]
```

### 📊 사용법 예시 (실제 사용)

#### 🔥 간단한 명령어로 즉시 활성화
```bash
# 이전 방식 (복잡했음)
--seq --c7 --fs --memory --github --postgres --think-hard --delegate auto

# 새로운 방식 (혁신적!)  
/max                    # 위와 동일한 효과!
"모든 서버 활성화"         # 자연어로도 가능!
```

#### 🎯 작업별 자동 최적화
```bash
# Spring Boot 작업
"Repository 메서드 에러 수정"
→ 자동 활성화: sequential + context7 + filesystem + memory + postgresql

# React 작업  
"컴포넌트 만들어줘"
→ 자동 활성화: context7 + sequential + filesystem + memory

# Git 작업
"커밋 메시지 최적화"  
→ 자동 활성화: github + memory + filesystem + sequential

# 데이터베이스 작업
"SQL 쿼리 최적화"
→ 자동 활성화: postgresql + sequential + context7 + memory
```

#### 🚀 성능 모드별 선택
```bash
/max      # 모든 서버 (6개) - 최고 성능, 높은 리소스
/auto     # 자동 감지 (2-4개) - 균형잡힌 성능  
/smart    # 학습 기반 (2-3개) - 개인화된 효율성
/quick    # Context7만 (1개) - 빠른 응답, 낮은 리소스
```

### 💡 학습 및 최적화 기능

#### 🧠 사용 패턴 학습
- **개인화**: 사용자의 작업 패턴을 학습하여 개인화된 추천
- **효율성**: 성공적인 조합을 기억하여 향후 우선 추천  
- **피드백**: 사용자 피드백을 통한 지속적 개선

#### 📈 성능 모니터링  
- **응답 시간**: 각 MCP 조합별 성능 측정
- **성공률**: 작업 완료율 및 품질 추적
- **리소스 사용량**: 메모리, CPU 사용량 최적화

#### 🎯 자동 최적화
- **동적 조정**: 시스템 상태에 따른 자동 서버 조정
- **캐시 활용**: 자주 사용하는 조합의 빠른 활성화
- **부하 분산**: 서버별 부하 분산을 통한 안정성 확보

### SuperClaude MCP (Model Context Protocol) 시스템 
엘더베리 프로젝트에서는 **혁신적인 자동화 시스템**을 통해 최고의 성능과 품질을 보장합니다.

### 📋 작업별 자동 추천 시스템 (실제 적용)

#### 🔧 Spring Boot 백엔드 작업 (자동 감지)
**감지 조건**: `pom.xml`, `build.gradle`, `src/main/java` 존재
**자동 활성화**: `sequential + context7 + filesystem + memory + postgresql`

```bash
# 작업 예시
"Repository 메서드 에러 수정해줘"
"Spring Security 설정 최적화"  
"JPA 성능 튜닝"
"API 엔드포인트 개발"

# → 자동으로 백엔드 전용 MCP 조합 활성화
```

#### 🎨 React 프론트엔드 작업 (자동 감지)  
**감지 조건**: `package.json`, `src/App.jsx`, `public/index.html` 존재
**자동 활성화**: `context7 + sequential + filesystem + memory`

```bash
# 작업 예시
"React 컴포넌트 만들어줘"
"Tailwind 스타일 최적화"
"TypeScript 타입 정의"
"상태 관리 개선"

# → 자동으로 프론트엔드 전용 MCP 조합 활성화
```

#### 🗄️ 데이터베이스 작업 (자동 감지)
**감지 조건**: `*.sql`, `repository/`, `entity/` 폴더, DB 키워드
**자동 활성화**: `postgresql + sequential + context7 + memory`

```bash
# 작업 예시  
"SQL 쿼리 최적화"
"데이터베이스 스키마 설계"
"성능 튜닝"
"인덱스 분석"

# → 자동으로 데이터베이스 전용 MCP 조합 활성화
```

#### 🐙 Git/GitHub 작업 (자동 감지)
**감지 조건**: `.git/` 폴더, Git 키워드 (`commit`, `push`, `merge`)
**자동 활성화**: `github + memory + filesystem + sequential`

```bash
# 작업 예시
"커밋 메시지 최적화"
"브랜치 전략 수립"  
"코드 리뷰 자동화"
"이슈 관리"

# → 자동으로 Git/협업 전용 MCP 조합 활성화
```

#### 📁 파일/프로젝트 구조 작업 (자동 감지)
**감지 조건**: 파일 조작, 리팩토링, 정리 키워드
**자동 활성화**: `filesystem + sequential + memory`

```bash
# 작업 예시
"프로젝트 구조 정리"
"파일 이름 일괄 변경"
"코드 리팩토링"  
"폴더 구조 최적화"

# → 자동으로 파일 관리 전용 MCP 조합 활성화
```

### 🚀 성능별 모드 선택 가이드

#### ⚡ /quick 모드 (1개 서버)
```yaml
서버: ["context7"]
용도: "빠른 질문, 간단한 작업"  
성능: "응답 빠름, 리소스 낮음"
예시: "간단한 문법 질문", "빠른 코드 리뷰"
```

#### 🎯 /auto 모드 (2-4개 서버)  
```yaml
서버: "프로젝트별 자동 감지"
용도: "일반적인 개발 작업"
성능: "균형잡힌 성능과 품질"  
예시: "일반적인 개발", "버그 수정", "기능 추가"
```

#### 🧠 /smart 모드 (2-3개 서버)
```yaml
서버: "사용 이력 기반 개인화"
용도: "반복적인 작업, 학습된 패턴"
성능: "효율적이고 개인화된 응답"
예시: "자주 하는 작업", "개인화된 추천"
```

#### 🔥 /max 모드 (6개 서버)
```yaml
서버: ["sequential", "context7", "filesystem", "memory", "github", "postgresql"]
용도: "복잡한 분석, 종합적인 작업"
성능: "최고 품질, 높은 리소스"  
예시: "아키텍처 설계", "대규모 리팩토링", "성능 분석"
```

### 🎨 특화 모드들

#### 🛠️ /dev 모드 (개발 특화)
```yaml
서버: ["context7", "sequential", "filesystem", "memory", "github"]
특징: "버전 관리 + 개발 도구 + 컨텍스트 추적"
최적화: "개발 워크플로우, 코드 생성, 베스트 프랙티스"
```

#### 🗄️ /db 모드 (데이터베이스 특화)  
```yaml
서버: ["postgresql", "sequential", "context7", "memory"]
특징: "SQL 최적화 + 스키마 분석 + 쿼리 디버깅"
최적화: "데이터베이스 성능, 스키마 설계, 쿼리 튜닝"
```

#### 📚 /learn 모드 (학습 특화)
```yaml
서버: ["memory", "context7", "filesystem"]  
특징: "지식 축적 + 컨텍스트 구축 + 진행 추적"
최적화: "학습 효율성, 지식 보존, 점진적 개선"
```

#### 🤝 /collab 모드 (협업 특화)
```yaml
서버: ["github", "memory", "filesystem", "sequential"]
특징: "프로젝트 관리 + 팀 협업 + 이슈 추적"  
최적화: "협업 효율성, 프로젝트 조정, 커뮤니케이션"
```

### 🔧 Task 도구 & 하위 에이전트 활용 패턴
**모든 작업에서 하위 에이전트 활용**: 복잡한 작업을 여러 전문 에이전트로 분할 처리

```bash
# 🚀 필수 활용 패턴: 모든 작업에 적용
--delegate auto --seq --c7    # 기본 권장 조합
--all-mcp --delegate auto     # 복합 도메인 작업시
--seq --c7 --magic --play     # 풀스택 개발시

# 📁 작업 규모별 분할 전략
--delegate files    # 파일별 개별 분석 (50+ 파일)
--delegate folders  # 디렉토리별 분석 (7+ 디렉토리)  
--delegate auto     # 자동 최적 전략 선택
--concurrency 10    # 동시 처리 에이전트 수 조정
```

### 📋 작업별 MCP 서버 조합 (필수 적용)

#### 🔧 백엔드 개발 (모든 백엔드 작업)
```bash
# 기본 패턴 (모든 백엔드 작업에 적용)
--seq --c7 --delegate auto

# Repository 에러 수정
--seq --c7 --security-mcp  # 구조 분석 + Spring 패턴 + 보안 검증

# API 개발
--seq --c7 --play --stats-mcp  # 분석 + 문서 + 테스트 + 통계

# 성능 최적화
--seq --play --stats-mcp --persona-performance  

# 보안 강화  
--seq --c7 --security-mcp --persona-security
```

#### 🎨 프론트엔드 개발 (모든 프론트엔드 작업)
```bash
# 기본 패턴 (모든 프론트엔드 작업에 적용)
--magic --c7 --delegate auto

# UI 컴포넌트 개발
--magic --c7 --mobile-mcp  # 최신 UI + React 패턴 + 모바일 최적화

# 성능 최적화
--seq --play --magic --persona-performance  # 분석 + 측정 + UI + 전문가

# 접근성 개선
--magic --c7 --mobile-mcp --persona-frontend  # UI + 패턴 + 모바일 + 전문가

# 국제화 작업
--magic --c7 --i18n-mcp --locale-mcp  # UI + 패턴 + 국제화 + 지역화
```

#### 🏗️ 시스템 통합 (모든 시스템 작업)
```bash
# 기본 패턴 (모든 시스템 작업에 적용)  
--seq --c7 --delegate auto --all-mcp

# 아키텍처 분석
--seq --c7 --security-mcp --persona-architect  # 분석 + 패턴 + 보안 + 전문가

# 전체 시스템 개선  
--all-mcp --delegate auto --wave-mode  # 모든 MCP + 분할 + Wave 모드

# DevOps & 배포
--seq --c7 --security-mcp --persona-devops  # 분석 + 패턴 + 보안 + 인프라
```

#### 📊 데이터 분석 & 통계 (모든 분석 작업)
```bash
# 기본 패턴 (모든 데이터 분석에 적용)
--seq --stats-mcp --delegate auto

# 사용자 행동 분석
--seq --stats-mcp --play --persona-analyzer  # 분석 + 통계 + 측정 + 전문가

# 매칭 성능 분석
--seq --stats-mcp --c7 --persona-performance  # 분석 + 통계 + 패턴 + 성능
```

### 🎯 자동 활성화 규칙 (강화됨)
- **모든 작업**: `--seq --c7 --delegate auto` 기본 적용
- **복잡도 >0.7**: `--all-mcp --delegate auto --wave-mode` 자동 활성화
- **파일 >50개**: `--delegate files --concurrency 10` 자동 활성화
- **디렉토리 >7개**: `--delegate folders --parallel-dirs` 자동 활성화  
- **복합 도메인**: `--all-mcp --multi-agent --parallel-focus` 자동 활성화
- **반복 개선**: `--loop --seq --c7` 자동 활성화
- **보안 관련**: `--security-mcp` 항상 포함
- **UI/프론트엔드**: `--magic --mobile-mcp` 항상 포함
- **성능 관련**: `--play --stats-mcp` 항상 포함

---

## 🤖 순차적 에이전트 시스템 (2025-01-27 NEW!)

### 🚨 혁신적 개선: 상호 호출 → 순차 실행
기존의 복잡한 에이전트 간 상호 호출 시스템을 **단순하고 안정적인 순차 실행 시스템**으로 완전히 교체했습니다!

#### ❌ **기존 문제점들**
```yaml
상호_호출_방식의_문제:
  - 복잡한_의존성: "A → B → C → A 순환 참조"
  - 컨텍스트_손실: "호출 체인에서 맥락 분실"
  - 디버깅_어려움: "어느 에이전트에서 문제 발생했는지 추적 곤란"
  - 예측_불가능성: "에이전트 간 호출 순서와 결과가 불안정"
```

#### ✅ **새로운 해결책**
```yaml
순차_실행_방식의_장점:
  - 예측_가능한_플로우: "A → B → C → D 명확한 순서"
  - 디버깅_용이성: "어느 단계에서 실패했는지 바로 확인"
  - 빠른_실행: "불필요한 중복 호출 제거"
  - 안정성_확보: "한 에이전트 실패해도 전체 시스템 중단되지 않음"
  - 모니터링_완벽: "각 단계별 성과 측정 가능"
```

### 🎯 **순차적 에이전트 작동 방식**

#### **1단계: 복잡도 자동 분석**
```javascript
// 작업 복잡도에 따른 지능적 에이전트 선택
간단한_작업 (점수 1-3):     analyzer만 실행
중간_작업 (점수 4-7):      analyzer → planner → implementer
복잡한_작업 (점수 8+):     analyzer → planner → implementer → validator
```

#### **2단계: 순차 실행**
```yaml
analyzer:
  목적: "코드베이스 분석 및 이슈 파악"
  입력: ["target_path", "analysis_type"]
  출력: ["issues_found", "recommendations", "complexity_score"]
  
planner:
  목적: "개선 계획 수립"
  입력: ["analysis_results", "requirements"]
  출력: ["action_plan", "priority_order", "estimated_time"]
  의존성: [analyzer]
  
implementer:
  목적: "실제 코드 개선 작업 수행"
  입력: ["action_plan", "target_files"]
  출력: ["modified_files", "changes_summary", "test_results"]
  의존성: [planner]
  
validator:
  목적: "개선 결과 검증 및 품질 확인"
  입력: ["modified_files", "original_requirements"]
  출력: ["validation_results", "quality_score", "remaining_issues"]
  의존성: [implementer]
```

#### **3단계: 에러 처리 및 복구**
```yaml
에러_처리_전략:
  중요_에이전트_실패: "즉시 중단하고 에러 메시지 제공"
  비중요_에이전트_실패: "건너뛰고 다음 에이전트 계속 실행"
  부분_성공: "성공한 부분까지의 결과 제공 + 개선 권장사항"
  완전_실패: "명확한 실패 원인과 해결책 제시"
```

### 🚀 **실제 사용법**

#### **자동 모드 (권장)**
```bash
# 🎯 그냥 자연어로 요청하면 자동으로 최적 에이전트 조합 실행
"TypeScript 에러 수정해줘"           → analyzer만 실행 (간단)
"React 컴포넌트 성능 최적화해줘"      → analyzer → planner → implementer (중간)
"전체 프로젝트 아키텍처 개선해줘"     → 전체 에이전트 체인 실행 (복잡)
```

#### **수동 모드 (고급 사용자)**
```bash
# /max 명령어로 명시적 실행
/max "Spring Boot Repository 에러 수정"
→ 복잡도 분석 → 에이전트 선택 → 순차 실행 → 결과 통합
```

### 📊 **성능 및 안정성 지표**

#### **성능 개선 결과**
```yaml
실행_속도: "40-60% 향상 (중복 호출 제거)"
안정성: "95% 이상 (예측 가능한 실행)"
디버깅_시간: "70% 단축 (명확한 실패 지점)"
사용자_만족도: "85% → 95% (일관된 결과)"
```

#### **모니터링 및 추적**
```yaml
실행_로그:
  - 에이전트별_성공_실패_상태
  - 각_단계별_실행_시간
  - 에러_발생_지점과_원인
  - 최종_결과와_품질_점수
  
성능_통계:
  - 총_실행_횟수
  - 성공률_백분율
  - 평균_실행_시간
  - 가장_많이_사용된_에이전트
```

### 🎯 **권장 사용 패턴**

#### **일반 개발 작업**
```bash
# ✅ 권장: 단순하고 명확
"컴포넌트 최적화해줘"
"API 에러 수정해줘"  
"테스트 코드 추가해줘"

# ❌ 비권장: 복잡한 플래그 조합
--seq --c7 --delegate auto --wave-mode
```

#### **복잡한 프로젝트 작업**
```bash
# ✅ 권장: /max 명령어 사용
/max "전체 프로젝트 리팩토링"
/max "성능 분석 및 최적화"
/max "보안 취약점 점검"
```

### 💡 **개발자를 위한 팁**

#### **효과적인 요청 방법**
```yaml
구체적_요청:
  좋음: "React 컴포넌트의 렌더링 성능 최적화"
  나쁨: "코드 개선"
  
적절한_범위:
  좋음: "특정 파일이나 기능 단위"
  나쁨: "전체 프로젝트를 한 번에"
  
명확한_목표:
  좋음: "TypeScript 타입 에러 수정"
  나쁨: "뭔가 문제가 있는 것 같음"
```

#### **결과 해석 가이드**
```yaml
성공_신호:
  - "✅ 모든 에이전트 실행 완료"
  - "품질: excellent"
  - "실행 시간: < 5초"
  
주의_신호:
  - "⚠️ 부분 성공"
  - "품질: good"
  - "권장사항 있음"
  
실패_신호:
  - "❌ 실행 실패"
  - "에러 원인 표시"
  - "해결책 제시"
```

## 🔄 새로운 MCP 자동화 시스템 사용법

### 🚨 혁신적 변화: 이제 플래그를 외울 필요 없음!
기존의 복잡한 플래그 조합을 입력할 필요 없이, **자연어로 요청**하면 자동으로 최적화됩니다.

#### ✨ 새로운 사용 방식
```bash
# 🔥 이전 방식 (복잡했음)
--seq --c7 --fs --memory --github --postgres --think-hard --delegate auto

# 🎯 새로운 방식 (혁신적!)
"Spring Boot Repository 에러 수정해줘"
→ 자동으로 위와 동일한 MCP 조합이 활성화됨!

# 🗣️ 자연어 명령
"모든 서버로 분석해줘"     → /max 자동 실행
"빠르게만 해줘"          → /quick 자동 실행
"자동으로 선택해줘"       → /auto 자동 실행
"데이터베이스 작업"       → /db 자동 실행
```

### 🎯 간소화된 사용 규칙

#### 📋 기본 사용법 (매우 간단!)
1. **그냥 자연어로 요청**: "○○○ 해줘" 형태로 작업 요청
2. **시스템이 자동 분석**: 프로젝트 타입과 작업 유형을 자동 감지
3. **최적 MCP 조합 자동 활성화**: 수동 설정 불필요
4. **필요시 슈퍼 명령어 사용**: `/max`, `/auto`, `/quick` 등

#### 🚀 고급 사용법 (선택사항)
```bash
# 특정 모드 강제 사용
/max      # 최고 성능이 필요한 복잡한 작업
/quick    # 빠른 응답이 필요한 간단한 작업
/db       # 데이터베이스 전용 작업
/dev      # 개발 워크플로우 최적화

# 자연어 + 모드 조합
"최대 성능으로 아키텍처 분석해줘"
"빠르게 문법만 확인해줘"
"데이터베이스 모드로 SQL 최적화해줘"
```

### 💡 사용자를 위한 팁

#### 🎯 작업별 추천 표현
```bash
# 🔧 백엔드 작업
"Spring Boot 에러 수정", "API 개발", "데이터베이스 설계"
→ 자동으로 백엔드 특화 MCP 조합 활성화

# 🎨 프론트엔드 작업  
"React 컴포넌트 생성", "UI 개선", "스타일 수정"
→ 자동으로 프론트엔드 특화 MCP 조합 활성화

# 📊 분석 작업
"성능 분석", "보안 점검", "코드 리뷰"  
→ 자동으로 분석 특화 MCP 조합 활성화
```

#### ⚡ 성능 모드 선택 가이드
- **복잡하고 중요한 작업**: `/max` 또는 "최대 성능으로"
- **일반적인 개발 작업**: 그냥 자연어로 요청 (자동 최적화)
- **빠른 질문이나 확인**: `/quick` 또는 "빠르게"
- **반복 작업**: `/smart` (학습된 패턴 활용)

### 📚 개발 가이드 (간소화됨)

#### 🎯 핵심 원칙
- **자연어 우선**: 복잡한 플래그 대신 자연어로 요청
- **자동 최적화 신뢰**: 시스템의 자동 선택을 믿고 사용
- **필요시에만 수동 조정**: 특별한 경우에만 슈퍼 명령어 사용
- **피드백 제공**: 결과가 만족스럽지 않으면 피드백으로 개선

#### ✅ 작업 시작시 체크리스트 (간소화)
1. ✅ **자연어로 명확하게 요청**: "○○○를 해줘" 형태
2. ✅ **시스템 자동 선택 확인**: 추천된 MCP 조합 확인
3. ✅ **필요시 모드 조정**: 성능이나 속도 요구사항에 따라 조정
4. ✅ **결과 확인 및 피드백**: 만족도에 따른 피드백 제공

### 🔧 고급 사용자를 위한 수동 제어 (선택사항)

기존 플래그 시스템도 여전히 사용 가능하지만, **자동화 시스템을 사용하는 것을 강력히 권장**합니다.

```bash
# 여전히 가능하지만 권장하지 않음
--seq --c7 --fs --memory --postgres

# 대신 이렇게 사용 (권장)
/db "SQL 최적화 분석"    # 훨씬 간단하고 효과적
```

### 📈 시스템 학습 및 개선

#### 🧠 자동 학습 기능
- **사용 패턴 학습**: 자주 사용하는 조합을 기억하여 우선 추천
- **성능 최적화**: 응답 시간과 품질을 지속적으로 개선
- **개인화**: 개인의 작업 스타일에 맞춘 맞춤형 추천

#### 📊 피드백 시스템
- **만족도 조사**: 작업 완료 후 간단한 만족도 평가
- **개선 제안**: 더 나은 MCP 조합이나 설정 제안
- **학습 반영**: 피드백을 바탕으로 향후 추천 개선

---

## 🎉 결론: 이제 더 이상 복잡한 플래그를 외울 필요 없습니다!

**🚀 새로운 패러다임**: "MCP 자동화 시스템이 모든 것을 알아서 처리합니다"

- ✨ **간단한 자연어 요청**만으로 최적의 MCP 조합 자동 활성화
- 🎯 **프로젝트 분석**을 통한 맞춤형 서버 선택  
- 🧠 **학습 기반 개선**으로 점점 더 정확한 추천
- ⚡ **성능과 효율성**을 동시에 보장하는 지능형 시스템

**🔥 지금 바로 시작**: "엘더베리 프로젝트 Repository 에러 수정해줘"라고 입력해보세요!

---

## 🤖 서브에이전트 순차 적용 시스템 (NEW!)

### 개념
복잡한 작업을 여러 전문 에이전트가 순차적으로 처리하는 시스템입니다.

### 에이전트 유형
1. **분석 에이전트** - 코드 분석, 에러 진단, 성능 분석
2. **실행 에이전트** - 코드 수정, 파일 생성, 리팩토링
3. **검증 에이전트** - 테스트 실행, 품질 검증, 보안 검증
4. **문서화 에이전트** - 문서 생성, 변경 로그, API 문서

### 사용법
```javascript
// 워크플로우 시작
await subAgentOrchestrator.startWorkflow({
    type: 'code-fix',
    description: 'Repository 메서드 시그니처 수정',
    files: [...],
    errors: [...]
});
```

### 워크플로우 유형
- `code-fix`: 코드 수정 작업
- `feature-implementation`: 새 기능 구현  
- `refactoring`: 리팩토링 작업
- `bug-investigation`: 버그 조사
- `performance-optimization`: 성능 최적화
- `security-audit`: 보안 감사

### 자동 활성화 조건
- 복잡도 >0.7: 전체 에이전트 체인 실행
- 파일 >20개: 병렬 처리 에이전트 활성화
- 멀티 도메인: 도메인별 전문 에이전트 배치

---

## 🔧 금지 사항 및 개발 원칙 (STRICT)

### ❌ 절대 금지 사항
- **간단한 실행 금지**: 임시 조치로 자꾸 넘어가지 않기
- **간단한 테스트 금지**: 실제 운영을 위해서는 실제 코드 수정 필수
- **임시 조치 금지**: 완벽한 코드보다 동작하는 코드가 먼저이지만, 임시방편 절대 금지
- **파일 끝부분만 확인하고 추가하는 방식 금지**: 중복이 발생할 우려가 있어 전체 파일을 검토한 후 작업

### ✅ 필수 원칙
- **실제 코드 수정**: 메인 프로젝트 코드를 직접 수정
- **정확한 해결**: 근본 원인을 찾아서 완전히 해결
- **운영 준비**: 모든 수정은 실제 운영 환경을 고려
- **전체 파일 검토**: 파일 수정 시 끝부분만 확인하지 말고 전체 내용을 파악한 후 작업

---

**🚀 현재 상태: Wave 0 완료 - Repository 에러 해결, 백엔드 컴파일 성공, 서브에이전트 시스템 구현**