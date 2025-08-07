# Elderberry Project - Class Diagram

## 전체 시스템 아키텍처 - 클래스 다이어그램

```mermaid
classDiagram
    %% =====================================
    %% 공통 기반 클래스 (Common Layer)
    %% =====================================
    
    class BaseEntity {
        <<abstract>>
        -LocalDateTime createdAt
        -LocalDateTime updatedAt
        +getCreatedDate() LocalDateTime
        +getLastModifiedDate() LocalDateTime
    }

    %% =====================================
    %% 인증 및 사용자 관리 (Auth Domain)
    %% =====================================
    
    class Member {
        -Long id
        -String email
        -String password
        -String name
        -String phoneNumber
        -MemberRole role
        -Boolean isJobSeeker
        -Boolean isActive
        -Boolean emailVerified
        -String language
        -String region
        +updateProfile(String, String, String, String) void
        +updatePassword(String) void
        +toggleJobSeekerStatus() void
        +deactivate() void
        +activate() void
        +verifyEmail() void
        +isOverseasUser() boolean
        +isStaff() boolean
        +getUsername() String
    }

    class MemberRole {
        <<enumeration>>
        ADMIN
        FACILITY
        COORDINATOR
        USER_DOMESTIC
        USER_OVERSEAS
        JOB_SEEKER_DOMESTIC
        JOB_SEEKER_OVERSEAS
        +getDisplayName() String
        +getDescription() String
        +getMemberType() MemberType
        +isPatientFamily() boolean
        +isJobSeeker() boolean
        +isStaff() boolean
        +isOverseas() boolean
        +isDomestic() boolean
        +canUseCoordinatorService() boolean
        +canUseJobService() boolean
        +canUseHealthAssessment() boolean
    }

    class MemberController {
        -MemberService memberService
        -JwtTokenProvider jwtTokenProvider
        +login(LoginRequest) ResponseEntity~EnhancedTokenResponse~
        +register(MemberRegisterRequest) ResponseEntity~ApiResponse~Member~~
        +refreshToken(RefreshTokenRequest) ResponseEntity~EnhancedTokenResponse~
        +logout(HttpServletRequest) ResponseEntity~ApiResponse~String~~
        +getProfile() ResponseEntity~MemberResponse~
        +updateProfile(MemberUpdateRequest) ResponseEntity~MemberResponse~
        +validateToken(TokenValidationRequest) ResponseEntity~TokenValidationResponse~
    }

    class JwtTokenProvider {
        -String secretKey
        -long tokenValidityInMilliseconds
        -RedisJwtBlacklistService blacklistService
        +createToken(String, MemberRole) String
        +getUsername(String) String
        +validateToken(String) boolean
        +isTokenBlacklisted(String) boolean
        +blacklistToken(String) void
        +getTokenExpirationTime(String) LocalDateTime
    }

    class RedisJwtBlacklistService {
        -RedisTemplate redisTemplate
        +addToBlacklist(String, Duration) void
        +isBlacklisted(String) boolean
        +removeFromBlacklist(String) void
        +getBlacklistSize() long
    }

    %% =====================================
    %% 시설 관리 (Facility Domain)
    %% =====================================
    
    class FacilityProfile {
        -Long id
        -String externalId
        -String dataSource
        -LocalDateTime lastSyncedAt
        -String facilityCode
        -String facilityName
        -String facilityType
        -String facilityGrade
        -Integer evaluationScore
        -String phoneNumber
        -String email
        -String address
        -String region
        -String district
        -BigDecimal latitude
        -BigDecimal longitude
        -Integer totalCapacity
        -Integer currentOccupancy
        -Integer availableBeds
        -Set~Integer~ acceptableCareGrades
        -Set~String~ specializations
        -Boolean hasDoctor
        -Boolean hasNurse24h
        -Integer monthlyBasicFee
        -Boolean isActive
        +calculateAvailableBeds() void
        +hasAvailableSpace() boolean
        +canAcceptCareGrade(Integer) boolean
        +hasSpecialization(String) boolean
        +getOverseasFriendlyScore() double
        +getReliabilityScore() int
        +getEstimatedMonthlyCostRange() String
        +isCompatibleWithCareGrade(Integer) boolean
        +generateFacilitySummary() String
    }

    class FacilityController {
        -FacilityRecommendationService recommendationService
        -FacilityProfileService profileService
        +searchFacilities(FacilitySearchRequest) ResponseEntity~List~FacilityRecommendation~~
        +getFacilityRecommendations(RecommendationRequest) ResponseEntity~FacilityRecommendationResponse~
        +getFacilityDetails(Long) ResponseEntity~FacilityProfile~
        +completeFacilityMatching(MatchingCompletionRequest) ResponseEntity~ApiResponse~String~~
    }

    class FacilityRecommendationService {
        -FacilityProfileService facilityProfileService
        -HealthAssessmentService healthAssessmentService
        -FacilityMatchingAnalyticsService analyticsService
        +getRecommendations(RecommendationRequest) FacilityRecommendationResponse
        +searchFacilities(FacilitySearchRequest) List~FacilityRecommendation~
        +calculateCompatibilityScore(FacilityProfile, HealthAssessment) double
        +generateMatchingExplanation(FacilityProfile, HealthAssessment) String
    }

    class FacilityMatchingHistory {
        -Long id
        -Long memberId
        -Long facilityId
        -MatchingOutcome matchingOutcome
        -String matchingReason
        -BigDecimal confidenceScore
        -String notes
        +isSuccessfulMatch() boolean
        +updateOutcome(MatchingOutcome, String) void
    }

    %% =====================================
    %% 건강 평가 (Health Domain)
    %% =====================================
    
    class HealthAssessment {
        -Long id
        -String memberId
        -String gender
        -Integer birthYear
        -Integer mobilityLevel
        -Integer eatingLevel
        -Integer toiletLevel
        -Integer communicationLevel
        -Integer ltciGrade
        -Integer careTargetStatus
        -Integer mealType
        -String diseaseTypes
        -Integer adlScore
        -String overallCareGrade
        -LocalDateTime assessmentDate
        +calculateAdlScore() void
        +isOverseasKorean() boolean
        +getOverallScore() double
        +getCareGradeLevel() int
        +isComplete() boolean
        +updateAssessment(Integer, Integer, Integer, Integer) void
        +hasDiseaseType(String) boolean
        +hasSevereIndicators() boolean
        +hasDementiaRelatedCondition() boolean
        +needsHospiceCare() boolean
        +getSpecializedCareType() String
        +getEstimatedMonthlyCostRange() String
        +generateAssessmentSummary() String
    }

    class HealthAssessmentController {
        -HealthAssessmentService assessmentService
        -HealthAssessmentStatsService statsService
        +createAssessment(HealthAssessmentCreateRequest) ResponseEntity~HealthAssessment~
        +getAssessment(Long) ResponseEntity~HealthAssessment~
        +updateAssessment(Long, HealthAssessmentUpdateRequest) ResponseEntity~HealthAssessment~
        +deleteAssessment(Long) ResponseEntity~Void~
        +getAssessmentsByMember(String) ResponseEntity~List~HealthAssessment~~
        +getAssessmentStatistics(String) ResponseEntity~HealthAssessmentStatistics~
    }

    class CareGradeCalculator {
        +calculateCareGrade(HealthAssessment) String
        +calculateAdlScore(Integer, Integer, Integer, Integer) Integer
        +determineSpecializedCare(HealthAssessment) String
        +estimateMonthlyCost(HealthAssessment) String
    }

    %% =====================================
    %% 구인구직 (Job Domain)
    %% =====================================
    
    class Job {
        -Long id
        -String title
        -String description
        -Member employer
        -String companyName
        -String workLocation
        -BigDecimal latitude
        -BigDecimal longitude
        -JobCategory category
        -SalaryType salaryType
        -BigDecimal minSalary
        -BigDecimal maxSalary
        -ExperienceLevel experienceLevel
        -WorkType workType
        -String workHours
        -Integer recruitCount
        -LocalDate applicationDeadline
        -String preferredQualifications
        -String benefits
        -String contactPhone
        -String contactEmail
        -Long viewCount
        -JobStatus status
        -Boolean isUrgent
        -Boolean isFeatured
        -List~JobApplication~ applications
        +incrementViewCount() void
        +getApplicationCount() int
        +isDeadlineApproaching() boolean
        +isExpired() boolean
        +close() void
        +suspend() void
        +reactivate() void
    }

    class JobApplication {
        -Long id
        -Job job
        -Member applicant
        -ApplicationStatus status
        -String coverLetter
        -String resumeFileName
        -String resumeFilePath
        -String expectedSalary
        -LocalDateTime availableStartDate
        -String applicantNotes
        -String employerNotes
        -LocalDateTime interviewDateTime
        -String interviewLocation
        -InterviewType interviewType
        -LocalDateTime processedAt
        +getApplicantName() String
        +getJobTitle() String
        +getCompanyName() String
        +hasResumeFile() boolean
        +hasInterviewScheduled() boolean
        +startReview() void
        +scheduleInterview(LocalDateTime, String, InterviewType) void
        +completeInterview() void
        +accept() void
        +reject() void
        +withdraw() void
        +isFinalDecisionMade() boolean
        +isActive() boolean
        +isEditable() boolean
    }

    %% =====================================
    %% 리뷰 시스템 (Review Domain)
    %% =====================================
    
    class Review {
        -Long id
        -Member reviewer
        -FacilityProfile facility
        -String title
        -String content
        -BigDecimal overallRating
        -BigDecimal serviceQualityRating
        -BigDecimal facilityRating
        -BigDecimal staffRating
        -BigDecimal priceRating
        -BigDecimal accessibilityRating
        -ReviewType reviewType
        -ReviewStatus status
        -Boolean recommended
        -LocalDateTime visitDate
        -Integer serviceDurationDays
        -Integer helpfulCount
        -Integer notHelpfulCount
        -Integer reportCount
        -String adminResponse
        -LocalDateTime adminResponseDate
        -Member adminResponder
        -Boolean verified
        -Boolean anonymous
        -List~String~ imageUrls
        -List~String~ tags
        +getReviewerDisplayName() String
        +getFacilityName() String
        +getAverageDetailRating() BigDecimal
        +hasImages() boolean
        +hasTags() boolean
        +hasAdminResponse() boolean
        +incrementHelpfulVote() void
        +incrementNotHelpfulVote() void
        +incrementReportCount() void
        +addAdminResponse(String, Member) void
        +block() void
        +activate() void
        +delete() void
        +addImageUrl(String) void
        +addTag(String) void
        +isActive() boolean
        +isEditable(Member) boolean
    }

    class ReviewVote {
        -Long id
        -Review review
        -Member voter
        -VoteType voteType
        +getVoterName() String
        +getReviewId() Long
        +isHelpful() boolean
        +isNotHelpful() boolean
    }

    class ReviewReport {
        -Long id
        -Review review
        -Member reporter
        -ReportReason reason
        -String description
        -ReportStatus status
        -String resolution
        -LocalDateTime resolvedAt
        -Member resolver
        +getReporterName() String
        +getReviewId() Long
        +getResolverName() String
        +resolve(String, Member) void
        +reject(String, Member) void
        +startReview() void
        +isResolved() boolean
        +isPending() boolean
    }

    %% =====================================
    %% 게시판 (Board Domain)
    %% =====================================
    
    class Board {
        -Long id
        -String name
        -String description
        -BoardType type
        -Boolean isActive
        -Integer sortOrder
        -Boolean adminOnly
        -List~Post~ posts
    }

    class Post {
        -Long id
        -String title
        -String content
        -Member author
        -Board board
        -Long viewCount
        -Boolean isPinned
        -Boolean isDeleted
        -Boolean active
        -PostStatus status
        -List~Comment~ comments
        +incrementViewCount() void
        +softDelete() void
        +hide() void
        +report() void
        +activate() void
        +updateContent(String, String) void
        +deactivate() void
    }

    class Comment {
        -Long id
        -String content
        -Member author
        -Post post
        -Comment parent
        -List~Comment~ children
        -Boolean isDeleted
        -Boolean active
        -Integer depth
        -CommentStatus status
        +softDelete() void
        +hide() void
        +report() void
        +activate() void
        +updateContent(String) void
        +deactivate() void
        +addChild(Comment) void
    }

    %% =====================================
    %% 코디네이터 시스템 (Coordinator Domain)
    %% =====================================
    
    class CoordinatorCareSettings {
        -Long id
        -String coordinatorId
        -Integer baseCareLevel
        -Integer maxCareLevel
        -Set~Integer~ preferredCareGrades
        -Set~Integer~ excludedCareGrades
        -Set~String~ specialtyAreas
        -Integer maxSimultaneousCases
        -Integer preferredCasesPerMonth
        -Boolean availableWeekends
        -Boolean availableEmergency
        -Set~String~ workingRegions
        -Double performanceScore
        -Double customerSatisfaction
        -Integer successfulCases
        -Integer totalCases
        -LocalDateTime lastUpdated
        -Integer experienceYears
        -Boolean isActive
        +isEligibleForCareGrade(Integer) boolean
        +hasSpecialty(String) boolean
        +getSuccessRate() double
        +canTakeNewCase() boolean
        +getCurrentActiveCases() int
        +getLanguageSkills() Set~CoordinatorLanguageSkill~
    }

    class CoordinatorLanguageSkill {
        -Long id
        -String coordinatorId
        -String languageCode
        -String languageName
        -ProficiencyLevel proficiencyLevel
        -Boolean isNative
        -String certification
    }

    class CoordinatorMatch {
        -Long id
        -String coordinatorId
        -Long memberId
        -Long facilityId
        -MatchStatus status
        -BigDecimal matchScore
        -String matchExplanation
        -LocalDateTime matchDate
        -LocalDateTime completionDate
        -String notes
    }

    class OptimizedCoordinatorMatchingService {
        -CoordinatorCareSettingsService careSettingsService
        -LanguageMatchingService languageMatchingService
        -CoordinatorWorkloadOptimizer workloadOptimizer
        -MatchingExplanationGenerator explanationGenerator
        +findBestCoordinatorMatch(HealthAssessment, String) CoordinatorMatch
        +simulateMatching(MatchingSimulationRequest) MatchingSimulationResult
        +getMatchingStatistics(String) CoordinatorMatchingStatistics
        +optimizeWorkload(String) void
    }

    %% =====================================
    %% 프론트엔드 FSD 아키텍처
    %% =====================================
    
    class App {
        <<React Component>>
        +render() ReactElement
    }

    class MainLayout {
        <<Widget Layer>>
        -children ReactNode
        +render() ReactElement
    }

    class Header {
        <<Widget Layer>>
        -user User
        -navigation NavigationItem[]
        +render() ReactElement
    }

    class Sidebar {
        <<Widget Layer>>
        -menuItems MenuItem[]
        -isCollapsed boolean
        +render() ReactElement
    }

    class Footer {
        <<Widget Layer>>
        -links FooterLink[]
        +render() ReactElement
    }

    %% Features Layer
    class AuthFeature {
        <<Feature Layer>>
        +LoginForm() ReactElement
        +RegisterForm() ReactElement
        +ForgotPasswordForm() ReactElement
    }

    class FacilityFeature {
        <<Feature Layer>>
        +FacilitySearchForm() ReactElement
        +FacilityCard() ReactElement
        +FacilityRecommendations() ReactElement
    }

    class HealthFeature {
        <<Feature Layer>>
        +HealthAssessmentWizard() ReactElement
        +HealthAssessmentStep() ReactElement
        +HealthResults() ReactElement
    }

    class JobsFeature {
        <<Feature Layer>>
        +JobSearchForm() ReactElement
        +JobCard() ReactElement
        +JobApplicationForm() ReactElement
    }

    class DashboardFeature {
        <<Feature Layer>>
        +DashboardSummary() ReactElement
        +DashboardCharts() ReactElement
        +RecentActivities() ReactElement
    }

    %% Entities Layer
    class UserEntity {
        <<Entity Layer>>
        +User type
        +UserWithProfile type
        +CreateUserRequest type
        +UpdateUserRequest type
        +isUserWithDomesticProfile() boolean
        +isUserWithOverseasProfile() boolean
    }

    class FacilityEntity {
        <<Entity Layer>>
        +Facility type
        +FacilityDetail type
        +FacilityRecommendation type
        +FacilitySearchFilters type
        +isFacilityWithRecommendation() boolean
        +isFacilityDetail() boolean
    }

    class HealthEntity {
        <<Entity Layer>>
        +HealthAssessment type
        +CreateHealthAssessmentRequest type
        +CareGradeResult type
        +isValidAdlLevel() boolean
        +isHealthAssessmentComplete() boolean
    }

    %% Shared Layer
    class UIComponents {
        <<Shared Layer>>
        +Button() ReactElement
        +Input() ReactElement
        +Modal() ReactElement
        +Card() ReactElement
        +LoadingSpinner() ReactElement
    }

    class ApiService {
        <<Shared Layer>>
        -baseUrl string
        -httpClient AxiosInstance
        +get() Promise
        +post() Promise
        +put() Promise
        +delete() Promise
    }

    class AuthStore {
        <<Shared Layer>>
        -user User | null
        -isAuthenticated boolean
        -token string | null
        +login() Promise
        +logout() void
        +refreshToken() Promise
        +getUser() User | null
    }

    %% =====================================
    %% 관계 정의
    %% =====================================
    
    BaseEntity <|-- Member
    BaseEntity <|-- FacilityProfile
    BaseEntity <|-- HealthAssessment
    BaseEntity <|-- Job
    BaseEntity <|-- JobApplication
    BaseEntity <|-- Review
    BaseEntity <|-- ReviewVote
    BaseEntity <|-- ReviewReport
    BaseEntity <|-- Board
    BaseEntity <|-- Post
    BaseEntity <|-- Comment
    BaseEntity <|-- CoordinatorCareSettings
    BaseEntity <|-- CoordinatorLanguageSkill
    BaseEntity <|-- CoordinatorMatch
    BaseEntity <|-- FacilityMatchingHistory

    Member ||--|| MemberRole : contains
    Member ||--o{ Job : employer
    Member ||--o{ JobApplication : applicant
    Member ||--o{ Review : reviewer
    Member ||--o{ ReviewVote : voter
    Member ||--o{ ReviewReport : reporter
    Member ||--o{ Post : author
    Member ||--o{ Comment : author

    FacilityProfile ||--o{ Review : facility
    FacilityProfile ||--o{ FacilityMatchingHistory : facility
    FacilityProfile ||--o{ CoordinatorMatch : facility

    Job ||--o{ JobApplication : job
    Review ||--o{ ReviewVote : review
    Review ||--o{ ReviewReport : review
    Board ||--o{ Post : board
    Post ||--o{ Comment : post
    Comment ||--o{ Comment : parent

    MemberController ..> Member : uses
    MemberController ..> JwtTokenProvider : uses
    JwtTokenProvider ..> RedisJwtBlacklistService : uses

    FacilityController ..> FacilityRecommendationService : uses
    FacilityRecommendationService ..> FacilityProfile : uses
    FacilityRecommendationService ..> HealthAssessment : uses

    HealthAssessmentController ..> HealthAssessment : uses
    HealthAssessmentController ..> CareGradeCalculator : uses

    OptimizedCoordinatorMatchingService ..> CoordinatorCareSettings : uses
    OptimizedCoordinatorMatchingService ..> CoordinatorLanguageSkill : uses
    OptimizedCoordinatorMatchingService ..> CoordinatorMatch : uses

    %% Frontend Dependencies
    App ..> MainLayout : uses
    MainLayout ..> Header : contains
    MainLayout ..> Sidebar : contains
    MainLayout ..> Footer : contains

    AuthFeature ..> UserEntity : uses
    FacilityFeature ..> FacilityEntity : uses
    HealthFeature ..> HealthEntity : uses

    AuthFeature ..> UIComponents : uses
    FacilityFeature ..> UIComponents : uses
    HealthFeature ..> UIComponents : uses
    JobsFeature ..> UIComponents : uses
    DashboardFeature ..> UIComponents : uses

    AuthFeature ..> ApiService : uses
    FacilityFeature ..> ApiService : uses
    HealthFeature ..> ApiService : uses
    JobsFeature ..> ApiService : uses

    AuthFeature ..> AuthStore : uses

    %% 열거형 클래스들
    class JobCategory {
        <<enumeration>>
        CAREGIVER
        NURSE
        PHYSICAL_THERAPIST
        OCCUPATIONAL_THERAPIST
        SOCIAL_WORKER
        FACILITY_MANAGER
        ADMINISTRATOR
        DRIVER
        COOK
        CLEANER
        OTHER
    }

    class SalaryType {
        <<enumeration>>
        HOURLY
        DAILY
        MONTHLY
        ANNUAL
        NEGOTIABLE
    }

    class ExperienceLevel {
        <<enumeration>>
        ENTRY
        JUNIOR
        SENIOR
        EXPERT
        ANY
    }

    class WorkType {
        <<enumeration>>
        FULL_TIME
        PART_TIME
        CONTRACT
        SHIFT
        FLEXIBLE
    }

    class JobStatus {
        <<enumeration>>
        ACTIVE
        CLOSED
        SUSPENDED
        DELETED
    }

    class ApplicationStatus {
        <<enumeration>>
        SUBMITTED
        UNDER_REVIEW
        INTERVIEW_SCHEDULED
        INTERVIEW_COMPLETED
        ACCEPTED
        REJECTED
        WITHDRAWN
        ON_HOLD
    }

    class ReviewType {
        <<enumeration>>
        FACILITY
        SERVICE
        CAREGIVER
        PROGRAM
    }

    class ReviewStatus {
        <<enumeration>>
        ACTIVE
        PENDING
        BLOCKED
        DELETED
    }

    class VoteType {
        <<enumeration>>
        HELPFUL
        NOT_HELPFUL
    }

    class ReportReason {
        <<enumeration>>
        INAPPROPRIATE_CONTENT
        SPAM
        FAKE_REVIEW
        OFFENSIVE_LANGUAGE
        PRIVACY_VIOLATION
        COPYRIGHT_VIOLATION
        COMMERCIAL_PROMOTION
        UNRELATED_CONTENT
        OTHER
    }

    class BoardType {
        <<enumeration>>
        NOTICE
        QNA
        FREE
        JOB
    }

    class PostStatus {
        <<enumeration>>
        ACTIVE
        HIDDEN
        REPORTED
    }

    class CommentStatus {
        <<enumeration>>
        ACTIVE
        HIDDEN
        REPORTED
    }

    Job ||--|| JobCategory : contains
    Job ||--|| SalaryType : contains
    Job ||--|| ExperienceLevel : contains
    Job ||--|| WorkType : contains
    Job ||--|| JobStatus : contains

    JobApplication ||--|| ApplicationStatus : contains
    Review ||--|| ReviewType : contains
    Review ||--|| ReviewStatus : contains
    ReviewVote ||--|| VoteType : contains
    ReviewReport ||--|| ReportReason : contains
    Board ||--|| BoardType : contains
    Post ||--|| PostStatus : contains
    Comment ||--|| CommentStatus : contains
```

## 클래스 다이어그램 설계 원칙

### 1. 아키텍처 레이어 구조

#### Backend (Spring Boot + JPA)
- **Entity Layer**: JPA 엔티티 클래스들
- **Controller Layer**: REST API 컨트롤러
- **Service Layer**: 비즈니스 로직 처리
- **Repository Layer**: 데이터 접근 (Spring Data JPA)

#### Frontend (React + TypeScript + FSD)
- **App Layer**: 애플리케이션 초기화 및 전역 설정
- **Pages Layer**: 라우트별 페이지 컴포넌트
- **Widgets Layer**: 독립적인 UI 위젯 (Header, Sidebar, Footer)
- **Features Layer**: 비즈니스 기능 모듈 (Auth, Facility, Health, Jobs)
- **Entities Layer**: 비즈니스 엔티티 도메인 모델
- **Shared Layer**: 재사용 가능한 공통 코드 (UI, API, Hooks)

### 2. 주요 설계 패턴

#### Domain-Driven Design (DDD)
- **Aggregate Root**: Member, FacilityProfile, HealthAssessment
- **Value Objects**: 열거형 클래스들 (MemberRole, JobCategory 등)
- **Domain Services**: 복잡한 비즈니스 로직 처리

#### Repository Pattern
- Spring Data JPA 기반 데이터 접근
- 자동 쿼리 생성 및 커스텀 쿼리 지원

#### MVC Pattern
- Model: Entity 클래스들
- View: React 컴포넌트들
- Controller: Spring Boot 컨트롤러들

### 3. 핵심 도메인별 설계

#### 인증 시스템 (Auth)
- **JWT 기반 인증**: JwtTokenProvider, RedisJwtBlacklistService
- **역할 기반 접근 제어**: MemberRole 열거형으로 7가지 역할 분리
- **토큰 블랙리스트**: Redis를 활용한 로그아웃 처리

#### 시설 관리 (Facility)
- **포괄적 시설 정보**: 80+ 필드를 가진 FacilityProfile
- **AI 추천 시스템**: FacilityRecommendationService
- **매칭 이력 추적**: FacilityMatchingHistory

#### 건강 평가 (Health)
- **KB라이프생명 기반**: 4가지 ADL 지표 평가
- **자동 점수 계산**: CareGradeCalculator
- **개인화된 케어 등급**: 종합적인 건강 상태 평가

#### 구인구직 (Jobs)
- **완전한 채용 프로세스**: Job ↔ JobApplication
- **다양한 직종 지원**: JobCategory 열거형
- **면접 일정 관리**: 상태별 처리 플로우

#### 리뷰 시스템 (Review)
- **다차원 평점**: 5개 카테고리별 세부 평가
- **사용자 참여**: ReviewVote (도움됨/안됨)
- **컨텐츠 관리**: ReviewReport (신고 시스템)

#### 게시판 (Board)
- **계층형 댓글**: 대댓글 지원 (parent_id, depth)
- **다양한 게시판 타입**: NOTICE, QNA, FREE, JOB
- **관리자 기능**: 공지글, 숨김 처리, 신고 관리

#### 코디네이터 시스템 (Coordinator)
- **개인화된 설정**: CoordinatorCareSettings
- **다국어 지원**: CoordinatorLanguageSkill
- **AI 매칭**: OptimizedCoordinatorMatchingService

### 4. Feature-Sliced Design (FSD) 적용

#### 의존성 규칙
- **상위 레이어** → **하위 레이어**만 참조 가능
- app → pages → widgets → features → entities → shared

#### Public API 패턴
- 모든 레이어에 index.ts 파일로 캡슐화
- 내부 구현 은닉, 안정적인 인터페이스 제공

#### 세그먼트별 역할
- **ui/**: UI 컴포넌트
- **model/**: 비즈니스 로직 및 타입
- **api/**: 외부 API 통신
- **lib/**: 유틸리티 함수

### 5. 확장성 및 유지보수성

#### 모듈화 설계
- 도메인별 독립적 확장 가능
- 인터페이스 기반 의존성 주입

#### 타입 안전성
- TypeScript 엄격 모드 적용
- 컴파일 타임 에러 검출

#### 테스트 용이성
- 단위 테스트, 통합 테스트 지원
- Mock 객체 활용 가능한 구조

이 클래스 다이어그램은 Elderberry 프로젝트의 전체 아키텍처를 포괄적으로 표현하며, 백엔드 Java 코드와 프론트엔드 React TypeScript 코드의 실제 구현과 완전히 일치합니다.