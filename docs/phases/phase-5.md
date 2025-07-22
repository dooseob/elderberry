# Phase 5: 시설 관리 시스템

## 🎯 개요
**소요기간**: 5-6일  
**예상 토큰**: ~26,000 토큰  
**목표**: 장기요양기관 평가 API 연동 + AI 기반 시설-환자 매칭 시스템

---

## 📌 Phase 5-A: 시설 등급 및 분류

### 구현 대상
- [ ] FacilityProfile 엔티티
- [ ] 시설 타입별 분류 (양로시설, 요양병원 등)
- [ ] A-E 등급 시스템 (건강보험심사평가원 기준)
- [ ] 전문 특화 시설 관리
- [ ] 장기요양기관 평가 API 연동

### 시설 타입별 분류 시스템
```yaml
주거복지시설:
  - 양로시설: 65세 이상 노인 공동생활 (등급 불필요)
  - 노인공동생활가정: 소규모 공동주택 (5-9명)
  - 노인복지주택: 독립주거 + 복지서비스

의료복지시설:
  - 노인요양시설: 장기요양 1-5등급 대상 (24시간 케어)
  - 노인요양공동생활가정: 소규모 요양시설 (5-9명)
  - 단기보호시설: 임시보호 서비스 (최대 15일)

의료기관:
  - 요양병원: 의료진 상주, 의료서비스 제공
  - 노인전문병원: 노인 특화 의료서비스
  - 노인요양병원: 장기입원 + 요양서비스

재가복지시설:
  - 방문요양서비스: 가정 방문 케어
  - 주야간보호서비스: 낮/밤 임시보호
  - 단기보호서비스: 가족 휴식 지원
```

### 시설 등급 분류 (건강보험심사평가원 기준)
```yaml
A등급 (최우수):
  - 평가점수: 90점 이상
  - 특징: 최고 수준의 케어 품질, 의료진 우수, 시설 현대화
  - 대상: 1-2등급 중증환자 전문 케어

B등급 (우수):
  - 평가점수: 80-89점  
  - 특징: 양질의 케어 서비스, 안정적 운영
  - 대상: 2-3등급 중등도 환자 적합

C등급 (보통):
  - 평가점수: 70-79점
  - 특징: 기본 케어 서비스 제공, 표준적 운영
  - 대상: 3-5등급 경증환자 적합

D등급 (개선필요):
  - 평가점수: 60-69점
  - 특징: 케어 품질 개선 필요, 운영상 이슈
  - 주의: 매칭 시 신중 검토 필요

E등급 (부적합):
  - 평가점수: 60점 미만
  - 특징: 심각한 품질 문제, 행정처분 이력
  - 제외: 매칭 대상에서 제외 권장
```

### 엔티티 설계
```java
@Entity
@Table(name = "facility_profiles")
public class FacilityProfile extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // 기본 정보
    private String facilityName;
    private String facilityType;           // "양로시설", "노인요양시설", "요양병원" 등
    private String facilityGrade;          // "A", "B", "C", "D", "E"
    private Integer evaluationScore;       // 건강보험심사평가원 점수
    
    // 케어 가능 등급
    @ElementCollection
    private Set<Integer> acceptableCareGrades;  // [1,2,3,4,5,6]
    
    // 전문 분야
    @ElementCollection
    private Set<String> specializations;       // ["dementia", "medical", "rehabilitation"]
    
    // 시설 규모 및 정원
    private Integer totalCapacity;             // 총 정원
    private Integer currentOccupancy;          // 현재 입주자 수
    private Integer availableBeds;             // 가용 침대 수
    
    // 의료진 정보
    private Boolean hasDoctor;                 // 의사 상주 여부
    private Boolean hasNurse24h;               // 24시간 간호사 상주
    private Integer nurseCount;                // 간호사 수
    private Integer caregiverCount;            // 요양보호사 수
    
    // 시설 특징
    private Boolean hasElevator;               // 엘리베이터 보유
    private Boolean hasEmergencySystem;        // 응급시스템 구비
    private Boolean hasRehabilitationRoom;     // 재활실 보유
    private Boolean hasDementiaProgram;        // 치매 프로그램 운영
    
    // 위치 및 접근성
    private String region;                     // 지역 (시/도)
    private String district;                   // 구/군
    private Double latitude;                   // 위도
    private Double longitude;                  // 경도
    private Boolean nearSubway;                // 지하철 접근성
    private Boolean nearHospital;              // 병원 근접성
    
    // 비용 정보
    private Integer monthlyBasicFee;           // 월 기본료
    private Integer admissionFee;              // 입소금
    private Boolean acceptsLtci;               // 장기요양보험 적용
    
    private LocalDateTime lastUpdated;
}
```

### 장기요양기관 평가 API 연동
```java
@Component
public class LtciEvaluationApiClient {
    
    @Value("${ltci.evaluation.api.key}")
    private String apiKey;
    
    @Value("${ltci.evaluation.base.url}")  
    private String baseUrl;
    
    public List<FacilityEvaluationData> getFacilityEvaluations(String region) {
        try {
            String url = baseUrl + "/ltci-evaluations";
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url)
                    .queryParam("serviceKey", apiKey)
                    .queryParam("region", region)
                    .queryParam("numOfRows", 1000);
            
            ResponseEntity<LtciApiResponse> response = restTemplate.exchange(
                    builder.toUriString(), 
                    HttpMethod.GET, 
                    new HttpEntity<>(headers), 
                    LtciApiResponse.class
            );
            
            return response.getBody().getItems();
            
        } catch (Exception e) {
            log.error("장기요양기관 평가 API 호출 실패: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }
}
```

---

## 📌 Phase 5-B: 시설 매칭 및 추천

### 구현 대상  
- [ ] 시설-환자 매칭 로직
- [ ] 코디네이터 시설 전문성 연동
- [ ] 견학 계획 및 평가 시스템
- [ ] 재외동포 맞춤 시설 추천
- [ ] 신뢰성 점수 기반 필터링

### 재외동포 맞춤 시설 매칭
```java
@Service
public class OverseasKoreanFacilityMatchingService {
    
    public OverseasKoreanNursingFacilityResponse searchForOverseasKoreans(
        OverseasKoreanNursingSearchRequest request) {
        
        // 1. 기본 검색 (지역, 유형별)
        List<FacilityProfile> basicResults = facilityRepository
            .findByRegionAndFacilityType(request.getRegion(), request.getFacilityType());
        
        // 2. 재외동포 친화성 점수 계산
        List<EnhancedFacilityInfo> enhanced = basicResults.stream()
            .map(facility -> {
                // 공항 접근성, 다국어 지원, 의료진 수준 등 평가
                int score = calculateOverseasFriendlyScore(facility, request);
                
                // 신뢰성 검증 (개폐업 정보 API 활용)
                FacilityReliabilityResponse reliability = validateFacilityReliability(facility.getId());
                
                return EnhancedFacilityInfo.builder()
                    .basicInfo(facility)
                    .overseasFriendlyScore(score)
                    .reliabilityInfo(reliability)
                    .build();
            })
            .filter(f -> f.getReliabilityInfo().getRiskLevel() != RiskLevel.HIGH)
            .sorted(Comparator.comparing(EnhancedFacilityInfo::getOverseasFriendlyScore).reversed())
            .collect(Collectors.toList());
        
        // 3. 상세 정보 조회 (상위 10개 시설)
        List<CompleteFacilityInfo> completeFacilities = enhanced.stream()
            .limit(10)
            .map(this::enrichWithDetailInfo)
            .collect(Collectors.toList());
        
        return OverseasKoreanNursingFacilityResponse.builder()
            .facilities(completeFacilities)
            .totalCount(enhanced.size())
            .searchCriteria(request)
            .build();
    }
}
```

### 시설 매칭 알고리즘
```java
@Service
public class FacilityMatchingService {
    
    public List<FacilityMatch> findCompatibleFacilities(HealthAssessment assessment, 
                                                       FacilityPreference preference) {
        
        CareGrade careGrade = assessment.getOverallCareGrade();
        
        return facilityRepository.findAll().stream()
            .filter(facility -> isBasicCompatible(facility, careGrade))
            .filter(facility -> hasAvailability(facility))
            .filter(facility -> meetsQualityStandard(facility))
            .map(facility -> calculateFacilityMatch(facility, assessment, preference))
            .sorted(Comparator.comparing(FacilityMatch::getMatchScore).reversed())
            .limit(20)
            .collect(Collectors.toList());
    }
    
    private FacilityMatch calculateFacilityMatch(FacilityProfile facility, 
                                               HealthAssessment assessment, 
                                               FacilityPreference preference) {
        double score = 0.0;
        
        // 1. 시설 등급 점수 (30%)
        score += calculateFacilityGradeScore(facility) * 0.3;
        
        // 2. 전문성 매칭 점수 (25%)
        score += calculateSpecializationScore(facility, assessment) * 0.25;
        
        // 3. 의료진 적합성 점수 (20%)
        score += calculateMedicalStaffScore(facility, assessment) * 0.2;
        
        // 4. 위치 접근성 점수 (15%)
        score += calculateLocationScore(facility, preference) * 0.15;
        
        // 5. 비용 적합성 점수 (10%)
        score += calculateCostScore(facility, preference) * 0.1;
        
        String explanation = generateFacilityMatchExplanation(facility, assessment, score);
        
        return new FacilityMatch(facility, score, explanation);
    }
}
```

### 코디네이터 시설 전문성 연동
```java
@Entity
public class CoordinatorFacilityExpertise {
    @Id
    private Long id;
    private String coordinatorId;
    
    // 시설 타입별 전문성
    @ElementCollection
    private Set<String> expertFacilityTypes;     // ["노인요양시설", "요양병원", "치매전문시설"]
    
    // 시설 등급별 경험
    @ElementCollection
    private Map<String, Integer> facilityGradeExperience; // {"A": 5, "B": 12, "C": 8}
    
    // 지역별 시설 네트워크
    @ElementCollection
    private Set<String> familiarRegions;         // ["서울 강남구", "경기 성남시"]
    
    // 협력 시설 목록
    @ElementCollection
    private Set<Long> partnerFacilities;         // 협력 관계 시설 ID
}
```

---

## 🎨 React 시설 검색 UI

### 시설 검색 컴포넌트
```typescript
export const FacilitySearchPage: React.FC = () => {
  const [searchCriteria, setSearchCriteria] = useState<FacilitySearchCriteria>({
    region: '',
    facilityType: '',
    careGrade: '',
    budget: '',
    specializations: []
  });
  
  const [facilities, setFacilities] = useState<FacilityMatch[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const results = await facilityApi.searchFacilities(searchCriteria);
      setFacilities(results);
    } catch (error) {
      toast.error('시설 검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="facility-search-page">
      <div className="search-filters">
        <FacilitySearchFilters 
          criteria={searchCriteria}
          onChange={setSearchCriteria}
          onSearch={handleSearch}
        />
      </div>
      
      <div className="search-results">
        {loading ? (
          <FacilitySearchSkeleton />
        ) : (
          <FacilitySearchResults facilities={facilities} />
        )}
      </div>
    </div>
  );
};

const FacilityCard: React.FC<{facility: FacilityMatch}> = ({facility}) => {
  return (
    <div className="facility-card">
      <div className="facility-header">
        <h3>{facility.facilityName}</h3>
        <div className="facility-grade">
          <span className={`grade-badge grade-${facility.facilityGrade.toLowerCase()}`}>
            {facility.facilityGrade}등급
          </span>
          <span className="match-score">매칭도: {facility.matchScore.toFixed(1)}/5.0</span>
        </div>
      </div>
      
      <div className="facility-info">
        <div className="location">
          <span className="icon">📍</span>
          <span>{facility.region} {facility.district}</span>
        </div>
        <div className="capacity">
          <span className="icon">🏠</span>
          <span>입주 가능: {facility.availableBeds}자리</span>
        </div>
        <div className="cost">
          <span className="icon">💰</span>
          <span>월 이용료: {facility.monthlyBasicFee.toLocaleString()}만원</span>
        </div>
      </div>
      
      <div className="facility-specializations">
        {facility.specializations.map(spec => (
          <span key={spec} className="specialization-badge">{spec}</span>
        ))}
      </div>
      
      <div className="facility-actions">
        <button 
          className="primary-button"
          onClick={() => viewFacilityDetail(facility.id)}
        >
          상세 정보
        </button>
        <button 
          className="secondary-button"
          onClick={() => requestVisit(facility.id)}
        >
          견학 신청
        </button>
      </div>
    </div>
  );
};
```

---

## 📊 시설 평가 및 통계

### 시설 신뢰성 점수 계산
```java
private int calculateReliabilityScore(FacilityProfile facility) {
    int score = 50; // 기본 점수
    
    // 운영 상태별 점수
    switch (facility.getBusinessStatus()) {
        case "정상", "운영중": score += 40; break;
        case "휴업": score += 10; break;
        case "폐업", "말소": score = 0; break;
    }
    
    // 운영 기간별 추가 점수 (신뢰성 지표)
    if (facility.getOpeningDate() != null) {
        long years = ChronoUnit.YEARS.between(facility.getOpeningDate(), LocalDate.now());
        score += Math.min(years * 2, 10);
    }
    
    // 평가 등급별 추가 점수
    switch (facility.getFacilityGrade()) {
        case "A": score += 10; break;
        case "B": score += 5; break;
        case "C": score += 0; break;
        case "D": score -= 5; break;
        case "E": score -= 15; break;
    }
    
    return Math.min(score, 100);
}
```

### API 엔드포인트
```
GET  /api/facilities/search                     - 시설 검색
GET  /api/facilities/{id}                       - 시설 상세 조회
POST /api/facilities/{id}/visit-request         - 견학 신청
GET  /api/facilities/overseas-friendly          - 재외동포 친화 시설
GET  /api/facilities/statistics                 - 시설 통계 (관리자)
POST /api/facilities/batch-update               - 평가 데이터 일괄 업데이트
```

---

## 🛠 개발 도구

### 테스트 명령어
```bash
# 시설 매칭 테스트
./gradlew :test --tests "*FacilityMatchingServiceTest"

# API 연동 테스트  
./gradlew :test --tests "*LtciEvaluationApiClientTest"

# 신뢰성 점수 테스트
./gradlew :test --tests "*FacilityReliabilityTest"
```

### API 데이터 동기화
```bash
# 장기요양기관 평가 데이터 동기화
curl -X POST http://localhost:8080/api/facilities/sync-evaluation-data \
  -H "Authorization: Bearer {admin-token}"

# 개폐업 정보 확인
curl -X POST http://localhost:8080/api/facilities/validate-business-status
```

---

## 📋 확인 사항

### Phase 5-A 완료 체크리스트
- [ ] 시설 타입별 분류 시스템 구현
- [ ] A-E 등급 시스템 적용
- [ ] 장기요양기관 평가 API 연동 성공
- [ ] 전문 특화 시설 관리 기능
- [ ] 신뢰성 점수 계산 로직 검증

### Phase 5-B 완료 체크리스트  
- [ ] 시설-환자 매칭 알고리즘 구현
- [ ] 재외동포 맞춤 시설 추천 기능
- [ ] React 시설 검색 UI 완성
- [ ] 견학 신청 및 평가 시스템
- [ ] 코디네이터 시설 전문성 연동

---

## 🎯 다음 단계

**Phase 6-A**: 공공데이터 API 통합 연동
- 국민건강보험공단 장기요양기관 API
- 건강보험심사평가원 병원정보 API
- 외교부 재외국민 서비스 API
- API 클라이언트 통합 구성

**중간 체크포인트**: Phase 5 완료 후 공공데이터 연동 시스템 구축