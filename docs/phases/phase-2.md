# Phase 2: 회원 관리 시스템

## 🎯 개요
**소요기간**: 2-3일  
**예상 토큰**: ~18,000 토큰  
**목표**: 5가지 역할 기반 회원 관리 시스템 + 국내/해외 사용자 구분

---

## 📌 Phase 2-A: 기본 회원 기능

### 구현 대상
- ✅ Member 엔티티 (5가지 역할 지원)
- ✅ 회원가입/로그인 API
- ✅ 비밀번호 암호화 (BCrypt)
- ✅ 기본 CRUD 기능
- ✅ JWT 토큰 인증 통합

### 엔티티 설계
```java
@Entity
@Table(name = "members")
public class Member extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String name;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberRole role;
    
    @Column(name = "is_job_seeker")
    private Boolean isJobSeeker = false;
    
    private String phoneNumber;
    private String language;      // 언어 선호도
    private String region;        // 지역 정보
    private Boolean isActive = true;
}
```

### 역할 정의 (MemberRole)
```java
public enum MemberRole {
    ADMIN,          // 시스템 관리자
    FACILITY,       // 시설 관리자  
    COORDINATOR,    // 코디네이터
    DOMESTIC_USER,  // 국내 사용자
    OVERSEAS_USER   // 해외 사용자 (재외동포)
}
```

### API 엔드포인트
```
POST /api/auth/register     - 회원가입
POST /api/auth/login        - 로그인  
GET  /api/members/{id}      - 회원 조회
PUT  /api/members/{id}      - 회원 정보 수정
DELETE /api/members/{id}    - 회원 탈퇴
GET  /api/members           - 회원 목록 (관리자)
```

---

## 📌 Phase 2-B: 국내/해외 사용자 구분

### 구현 대상
- ✅ DomesticProfile 엔티티 (국내 사용자 전용)
- ✅ OverseasProfile 엔티티 (해외 사용자 전용)  
- ✅ ProfileService (프로필 관리 로직)
- ✅ 다국어 기본 설정 준비
- ✅ 역할별 프로필 생성 제한

### DomesticProfile 구조
```java
@Entity
@Table(name = "domestic_profiles")
public class DomesticProfile extends BaseEntity {
    @OneToOne(fetch = FetchType.LAZY)
    private Member member;
    
    // 기본 정보
    private LocalDate birthDate;
    private String gender;
    private String address;
    private String postalCode;
    
    // 응급 연락처  
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelation;
    
    // 건강 정보
    private String healthInsuranceNumber;
    private Integer ltciGrade;              // 장기요양등급
    private String ltciCertificateNumber;
    
    // 케어 정보
    private String preferredRegion;
    private String careLevel;
    private String specialNeeds;
    private String budgetRange;
    
    // 완성도 추적
    private Integer profileCompletionPercentage = 0;
}
```

### OverseasProfile 구조  
```java
@Entity
@Table(name = "overseas_profiles")
public class OverseasProfile extends BaseEntity {
    @OneToOne(fetch = FetchType.LAZY)
    private Member member;
    
    // 기본 정보
    private LocalDate birthDate;
    private String gender;
    private String overseasAddress;
    private String residenceCountry;        // 필수
    private String residenceCity;
    
    // 여권/비자 정보
    private String passportNumber;
    private LocalDate passportExpiryDate;
    private String visaStatus;
    private LocalDate visaExpiryDate;
    
    // 연락처 (해외/한국)
    private String overseasContactName;
    private String overseasContactPhone;
    private String koreaContactName;
    private String koreaContactPhone;
    
    // 입국 관련
    private String entryPurpose;
    private String expectedStayDuration;
    private String preferredCommunicationMethod;
    private String timeZonePreference;
    
    // 코디네이터 서비스
    private Boolean coordinatorRequired = true;
    
    // 완성도 추적
    private Integer profileCompletionPercentage = 0;
}
```

### 프로필 API 엔드포인트
```
POST /api/profiles/domestic/{memberId}    - 국내 프로필 생성
GET  /api/profiles/domestic/{memberId}    - 국내 프로필 조회  
PUT  /api/profiles/domestic/{memberId}    - 국내 프로필 수정

POST /api/profiles/overseas/{memberId}    - 해외 프로필 생성
GET  /api/profiles/overseas/{memberId}    - 해외 프로필 조회
PUT  /api/profiles/overseas/{memberId}    - 해외 프로필 수정

GET  /api/profiles/domestic?minCompletion=80         - 완성도별 조회
GET  /api/profiles/overseas?country=미국              - 국가별 조회  
GET  /api/profiles/overseas/coordinator-required     - 코디네이터 필요 대상
GET  /api/profiles/overseas/expiring-documents       - 서류 만료 예정자
```

---

## 🔒 보안 기능

### 입력 검증 및 보안
- **입력 Sanitization**: XSS 방지
- **SQL 인젝션 방지**: 패턴 검사  
- **개인정보 마스킹**: 이메일, 전화번호, 여권번호
- **비밀번호 정책**: 8자 이상, 대소문자+숫자+특수문자
- **역할별 접근 제어**: DOMESTIC_USER ↔ OVERSEAS_USER 분리

### 프로필 생성 제한
```java
// 국내 사용자는 해외 프로필 생성 불가
if (member.getRole() == MemberRole.DOMESTIC_USER) {
    throw new CustomException.BadRequest("국내 사용자는 해외 프로필을 생성할 수 없습니다");
}

// 해외 사용자는 국내 프로필 생성 불가
if (member.getRole() == MemberRole.OVERSEAS_USER) {  
    throw new CustomException.BadRequest("해외 사용자는 국내 프로필을 생성할 수 없습니다");
}
```

---

## 📊 프로필 완성도 시스템

### 자동 완성도 계산
- **국내 프로필**: 15개 필드 기준 (기본정보 5개, 연락처 3개, 건강정보 3개, 케어정보 4개)
- **해외 프로필**: 25개 필드 기준 (여권정보, 연락처 분리, 입국정보 추가)
- **완성도 임계값**: 국내 80%, 해외 70%

### 단계별 정보 수집
1. **기본 정보**: 생년월일, 성별, 주소
2. **연락처**: 응급연락처 (해외의 경우 해외+한국 분리)  
3. **건강 정보**: 보험, 장기요양등급
4. **케어 정보**: 선호지역, 예산, 특별 요구사항

---

## 🛠 개발 도구

### 테스트 명령어
```bash
# 회원 기능 테스트
./gradlew :test --tests "*MemberServiceTest"

# 프로필 기능 테스트  
./gradlew :test --tests "*ProfileServiceTest"

# API 통합 테스트
./gradlew :test --tests "*ControllerTest"
```

### API 문서 확인
```bash
# Swagger UI 접속
http://localhost:8080/swagger-ui.html

# OpenAPI 스펙 확인
http://localhost:8080/api-docs
```

---

## 📋 확인 사항

### Phase 2-A 완료 체크리스트
- [ ] 5가지 역할로 회원가입 성공
- [ ] JWT 토큰으로 로그인 성공  
- [ ] 비밀번호 BCrypt 암호화 확인
- [ ] 역할별 권한 접근 제어 동작
- [ ] Swagger API 문서 생성 확인

### Phase 2-B 완료 체크리스트
- [ ] 국내/해외 프로필 생성 분리 동작
- [ ] 프로필 완성도 자동 계산
- [ ] 개인정보 마스킹 처리 확인
- [ ] 서류 만료 예정자 조회 기능
- [ ] 코디네이터 필요 대상 자동 식별

---

## 🎯 다음 단계

**Phase 3-A**: 돌봄지수 체크 시스템
- HealthAssessment 엔티티
- 4개 영역 평가 로직 (걷기, 식사, 배변, 의사소통)  
- ADL 점수 계산
- 종합 케어 등급 산출

**중간 체크포인트**: Phase 2 완료 후 Phase 3 진행