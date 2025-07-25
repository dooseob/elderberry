# LightCare 개발 계획서 (토큰 제한 고려)

## 📋 개요

이 문서는 LightCare 프로젝트를 토큰 제한을 고려하여 체계적으로 개발하기 위한 단계별 계획서입니다.

**프로젝트 특성:**
- **개발팀**: 4명 (AI 의존도 100%)
- **기술스택**: JDK 21 + Spring Boot 3.3.5 + React 18
- **개발기간**: 2주 완성 목표
- **예산**: 자본금 0원 (무료 서비스 활용)

---

## 🎯 Phase 1: 핵심 인프라 구축 (1-2일)

### 📌 Phase 1-A: 프로젝트 초기 설정
**예상 토큰**: ~8,000 토큰  
**소요시간**: 반나절

#### 구현 대상
- [ ] Gradle 멀티모듈 프로젝트 구조 생성
- [ ] Spring Boot 3.3.5 기본 설정
- [ ] SQLite 데이터베이스 연결
- [ ] 기본 패키지 구조 생성

#### 핵심 파일
```
build.gradle.kts
settings.gradle.kts
src/main/resources/application.yml
src/main/java/com/example/carelink/CareLinkApplication.java
```

#### AI 프롬프트 예시
```
"JDK 21 + Spring Boot 3.3.5 기반 멀티모듈 Gradle 프로젝트를 생성해주세요. 
모듈 구성: api-module, member-module, facility-module
SQLite 데이터베이스 설정 포함"
```

---

### 📌 Phase 1-B: 기본 보안 설정
**예상 토큰**: ~6,000 토큰  
**소요시간**: 반나절

#### 구현 대상
- [ ] Spring Security 6.x 설정
- [ ] JWT 토큰 기반 인증
- [ ] CORS 설정
- [ ] 기본 예외 처리

#### 핵심 파일
```
SecurityConfig.java
JwtTokenProvider.java
GlobalExceptionHandler.java
```

---

## 🎯 Phase 2: 회원 관리 시스템 (2-3일)

### 📌 Phase 2-A: 기본 회원 기능
**예상 토큰**: ~10,000 토큰  
**소요시간**: 1일

#### 구현 대상
- [ ] Member 엔티티 (5가지 역할 지원)
- [ ] 회원가입/로그인 API
- [ ] 비밀번호 암호화
- [ ] 기본 CRUD 기능

#### 엔티티 설계
```java
@Entity
public class Member {
    private Long id;
    private String email;
    private String password;
    private String name;
    private MemberRole role; // ADMIN, FACILITY, COORDINATOR, DOMESTIC_USER, OVERSEAS_USER
    private Boolean isJobSeeker;
    // 기본 필드들...
}
```

---

### 📌 Phase 2-B: 국내/해외 사용자 구분
**예상 토큰**: ~8,000 토큰  
**소요시간**: 반나절

#### 구현 대상
- [ ] 프로필 엔티티 (국내/해외 구분)
- [ ] 다국어 기본 설정
- [ ] 지역별 접근 권한

---

## 🎯 Phase 3: 건강 상태 평가 시스템 (3-4일)

### 📌 Phase 3-A: 돌봄지수 체크 시스템
**예상 토큰**: ~12,000 토큰  
**소요시간**: 1.5일

#### 구현 대상
- [ ] HealthAssessment 엔티티
- [ ] 4개 영역 평가 로직 (걷기, 식사, 배변, 의사소통)
- [ ] ADL 점수 계산
- [ ] 종합 케어 등급 산출

#### 핵심 클래스
```java
@Entity
public class HealthAssessment {
    private Integer mobilityLevel;      // 1-3
    private Integer eatingLevel;        // 1-3
    private Integer toiletLevel;        // 1-3
    private Integer communicationLevel; // 1-3
    private Integer ltciGrade;          // 장기요양보험 등급
    private String overallCareGrade;    // 종합 케어 등급
}

@Service
public class CareGradeCalculator {
    public CareGrade calculateComprehensiveGrade(HealthAssessment assessment);
}
```

---

### 📌 Phase 3-B: React 체크리스트 UI
**예상 토큰**: ~10,000 토큰  
**소요시간**: 1일

#### 구현 대상
- [ ] React 18 + TypeScript 프로젝트 설정
- [ ] 건강 상태 체크리스트 폼
- [ ] 단계별 진행 UI
- [ ] 결과 표시 컴포넌트

---

## 🎯 Phase 4: 코디네이터 매칭 시스템 (4-5일)

### 📌 Phase 4-A: 코디네이터 프로필 관리
**예상 토큰**: ~15,000 토큰  
**소요시간**: 2일

#### 구현 대상
- [ ] CoordinatorProfile 엔티티
- [ ] 자기 설정 케어 등급 시스템
- [ ] 전문성 및 경력 관리
- [ ] 실시간 가용성 관리

#### 핵심 기능
```java
@Entity
public class CoordinatorCareSettings {
    private Set<Integer> preferredCareGrades;    // 선호 케어 등급
    private Set<Integer> excludedCareGrades;     // 거부 케어 등급
    private Set<String> specialtyAreas;         // 전문 분야
    private Integer maxSimultaneousCases;       // 동시 담당 가능 케이스
}
```

---

### 📌 Phase 4-B: AI 기반 매칭 알고리즘
**예상 토큰**: ~12,000 토큰  
**소요시간**: 1.5일

#### 구현 대상
- [ ] 다층 매칭 시스템
- [ ] 종합 점수 계산 로직
- [ ] 업무량 최적화
- [ ] 매칭 결과 설명 생성

#### 매칭 로직
```java
@Service
public class OptimizedCoordinatorMatchingService {
    // 1. 기본 자격 필터링 (40%)
    // 2. 전문성 매칭 (25%)  
    // 3. 경력 및 성과 (20%)
    // 4. 위치 접근성 (10%)
    // 5. 실시간 가용성 (5%)
}
```

---

## 🎯 Phase 5: 시설 관리 시스템 (5-6일)

### 📌 Phase 5-A: 시설 등급 및 분류
**예상 토큰**: ~14,000 토큰  
**소요시간**: 1.5일

#### 구현 대상
- [ ] FacilityProfile 엔티티
- [ ] 시설 타입별 분류 (양로시설, 요양병원 등)
- [ ] A-E 등급 시스템
- [ ] 전문 특화 시설 관리

---

### 📌 Phase 5-B: 시설 매칭 및 추천
**예상 토큰**: ~12,000 토큰  
**소요시간**: 1일

#### 구현 대상
- [ ] 시설-환자 매칭 로직
- [ ] 코디네이터 시설 전문성 연동
- [ ] 견학 계획 및 평가 시스템

---

## 🎯 Phase 6: 공공데이터 API 연동 (6-7일)

### 📌 Phase 6-A: 기본 API 연동
**예상 토큰**: ~10,000 토큰  
**소요시간**: 1일

#### 구현 대상
- [ ] 국민건강보험공단 장기요양기관 API
- [ ] 건강보험심사평가원 병원정보 API
- [ ] API 클라이언트 구성

#### 인증키 활용
```
CCXHQiSSQ0J+RRaadSjmmS7ltxG/tlSVOYMjh45MmGne68ptgGAaAJVJti8nBazSjLemTAyb5gAuj43xq7fTog==
```

---

### 📌 Phase 6-B: 외교부 API 연동
**예상 토큰**: ~8,000 토큰  
**소요시간**: 반나절

#### 구현 대상
- [ ] 재외국민 서비스 API
- [ ] 국가별 입국 요건 API
- [ ] 다국어 데이터 처리

---

## 🎯 Phase 7: 챗봇 연동 인터페이스 (7일)

### 📌 Phase 7-A: 챗봇 호환성 API
**예상 토큰**: ~8,000 토큰  
**소요시간**: 반나절

#### 구현 대상
- [ ] 챗봇 연동 API 엔드포인트
- [ ] 세션 관리 시스템
- [ ] 프로세스 추적 연동

**주의**: 챗봇 구현체는 다른 팀원이 담당

---

## 🎯 Phase 8: 프론트엔드 통합 (8-10일)

### 📌 Phase 8-A: 메인 UI 구성
**예상 토큰**: ~15,000 토큰  
**소요시간**: 2일

#### 구현 대상
- [ ] 'elderberry' 디자인 시스템
- [ ] 메인 페이지 및 네비게이션
- [ ] 사용자 권한별 UI

---

### 📌 Phase 8-B: 기능별 페이지 구현
**예상 토큰**: ~18,000 토큰  
**소요시간**: 2.5일

#### 구현 대상
- [ ] 건강 체크리스트 페이지
- [ ] 코디네이터 매칭 결과 페이지
- [ ] 시설 검색 및 상세 페이지
- [ ] 사용자 프로필 관리 페이지

---

## 🎯 Phase 9: 테스트 및 최적화 (11-12일)

### 📌 Phase 9-A: 단위 테스트
**예상 토큰**: ~10,000 토큰  
**소요시간**: 1일

#### 구현 대상
- [ ] JUnit 5 테스트 코드
- [ ] MockMvc 통합 테스트
- [ ] 매칭 알고리즘 테스트

---

### 📌 Phase 9-B: 통합 테스트 및 배포
**예상 토큰**: ~8,000 토큰  
**소요시간**: 1일

#### 구현 대상
- [ ] E2E 테스트
- [ ] Railway/Render 배포 설정
- [ ] GitHub Actions CI/CD

---

## 📊 개발 진행 관리

### 토큰 사용량 추적
- **총 예상 토큰**: ~196,000 토큰
- **일일 권장 토큰**: ~14,000 토큰
- **Phase별 토큰 분배**: 균등 분할

### 우선순위 관리
1. **P0 (Critical)**: Phase 1-4 (핵심 기능)
2. **P1 (High)**: Phase 5-6 (시설 관리, API 연동)
3. **P2 (Medium)**: Phase 7-8 (UI, 챗봇 연동)
4. **P3 (Low)**: Phase 9 (테스트, 최적화)

### 체크포인트
- **Day 3**: Phase 2 완료 확인
- **Day 6**: Phase 4 완료 확인
- **Day 9**: Phase 6 완료 확인
- **Day 12**: 전체 시스템 완성

---

## 🚨 리스크 관리

### 주요 리스크
1. **토큰 초과 사용**: 복잡한 로직을 단순화
2. **API 연동 실패**: Mock 데이터로 우선 개발
3. **시간 부족**: P2, P3 기능 축소

### 완화 방안
- Phase별 완료 후 다음 단계 진행
- 핵심 기능 우선 구현 (MVP 접근)
- 실시간 진행 상황 체크

---

## 📝 다음 단계

1. **Phase 1-A 시작**: 프로젝트 초기 설정
2. **토큰 사용량 모니터링** 시작
3. **일일 체크포인트** 설정

이 계획서를 바탕으로 체계적인 개발을 진행하시기 바랍니다.