# Phase 3: 건강 상태 평가 시스템

## 🎯 개요
**소요기간**: 3-4일  
**예상 토큰**: ~22,000 토큰  
**목표**: KB라이프생명 기반 돌봄지수 체크 시스템 + React UI 구현

---

## 📌 Phase 3-A: 돌봄지수 체크 시스템

### 구현 대상
- [ ] HealthAssessment 엔티티
- [ ] 4개 영역 평가 로직 (걷기, 식사, 배변, 의사소통)
- [ ] ADL 점수 계산 알고리즘
- [ ] 종합 케어 등급 산출
- [ ] 장기요양보험 등급 연동

### 엔티티 설계
```java
@Entity
@Table(name = "health_assessments")
public class HealthAssessment extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "member_id", nullable = false)
    private String memberId;
    
    // 기본 정보
    private String gender;
    private Integer birthYear;
    
    // ADL 평가 (1-3점)
    @Column(name = "mobility_level", nullable = false)
    private Integer mobilityLevel;        // 걷기 활동
    
    @Column(name = "eating_level", nullable = false) 
    private Integer eatingLevel;          // 식사 활동
    
    @Column(name = "toilet_level", nullable = false)
    private Integer toiletLevel;          // 배변 활동
    
    @Column(name = "communication_level", nullable = false)
    private Integer communicationLevel;   // 의사소통
    
    // 장기요양보험 정보
    @Column(name = "ltci_grade")
    private Integer ltciGrade;           // 1-5등급, 6(인지지원), 7(모름), 8(없음)
    
    // 돌봄대상자 상태  
    @Column(name = "care_target_status")
    private Integer careTargetStatus;    // 1-4 (생명예후 상태)
    
    // 계산된 결과
    @Column(name = "adl_score")
    private Integer adlScore;            // ADL 점수 (4-12점)
    
    @Column(name = "overall_care_grade")
    private String overallCareGrade;     // 종합 케어 등급
    
    @Column(name = "assessment_date")
    private LocalDateTime assessmentDate;
}
```

### 돌봄지수 평가 기준 (KB라이프생명 기반)

#### 1. 걷기 활동 능력 (care_mobility)
```yaml
등급 1 (독립): 혼자서 가능해요
등급 2 (부분도움): 부분적인 도움이 필요해요 (타인의 부축, 지팡이 이용 등)  
등급 3 (완전도움): 혼자서는 보행이 어려워요 (휠체어 사용 등)
```

#### 2. 식사 활동 능력 (care_eating)
```yaml
등급 1 (독립): 혼자서 가능해요
등급 2 (부분도움): 부분적인 도움이 필요해요 (반찬 집기, 자르기 등 일부 도움)
등급 3 (완전도움): 완전한 도움이 필요해요 (음식을 떠 먹여줌)
```

#### 3. 배변 활동 능력 (care_toilet)  
```yaml
등급 1 (독립): 혼자서 화장실을 이용할 수 있어요
등급 2 (부분도움): 화장실 이용 시 부분적인 도움이 필요해요
등급 3 (완전도움): 완전한 도움이 필요해요 (간이변기, 기저귀 착용 등)
```

#### 4. 의사소통 능력 (care_communication)
```yaml
등급 1 (정상): 정상적으로 가능해요  
등급 2 (부분제한): 때때로 어려워요 (화장실 이용의사 표현 가능)
등급 3 (심각제한): 소통이 어려워요 (화장실 이용의사 표현 잘 못함)
```

### 케어 등급 계산 로직
```java
@Service
public class CareGradeCalculator {
    
    public CareGrade calculateComprehensiveGrade(HealthAssessment assessment) {
        // 1. 기본 ADL 점수 계산 (일상생활수행능력)
        int adlScore = calculateADLScore(assessment);
        
        // 2. 장기요양보험 등급 반영
        int ltciGrade = assessment.getLtciGrade();
        
        // 3. 돌봄대상자 상태 반영  
        int careTargetStatus = assessment.getCareTargetStatus();
        
        // 4. 종합 케어 등급 도출
        return determineOverallCareGrade(adlScore, ltciGrade, careTargetStatus);
    }
    
    private int calculateADLScore(HealthAssessment assessment) {
        int mobility = assessment.getMobilityLevel();    // 1-3
        int eating = assessment.getEatingLevel();        // 1-3  
        int toilet = assessment.getToiletLevel();        // 1-3
        int communication = assessment.getCommunicationLevel(); // 1-3
        
        // 각 영역별 가중치 적용
        return (mobility * 25) + (eating * 20) + (toilet * 30) + (communication * 25);
    }
}
```

### API 엔드포인트
```
POST /api/health-assessments                    - 건강 평가 생성
GET  /api/health-assessments/{memberId}         - 회원별 평가 조회
PUT  /api/health-assessments/{id}               - 평가 정보 수정
POST /api/health-assessments/calculate          - 케어 등급 계산
GET  /api/health-assessments/statistics         - 통계 조회 (관리자)
```

---

## 📌 Phase 3-B: React 체크리스트 UI

### 구현 대상
- [ ] React 18 + TypeScript 프로젝트 설정 확장
- [ ] 건강 상태 체크리스트 폼 컴포넌트
- [ ] 단계별 진행 UI (Step Wizard)
- [ ] 결과 표시 컴포넌트
- [ ] 반응형 모바일 최적화

### 컴포넌트 구조
```typescript
// 건강 상태 체크리스트 컴포넌트
export const HealthAssessmentForm: React.FC = () => {
  const [assessment, setAssessment] = useState<HealthAssessmentData>({
    mobility: null,
    eating: null, 
    toilet: null,
    communication: null,
    ltciGrade: null,
    careTargetStatus: null
  });

  const assessmentQuestions = {
    mobility: {
      title: "걷기 활동 능력",
      options: [
        { value: 1, label: "혼자서 가능해요" },
        { value: 2, label: "부분적인 도움이 필요해요\n(타인의 부축, 지팡이 이용 등)" },
        { value: 3, label: "혼자서는 보행이 어려워요\n(휠체어 사용 등)" }
      ]
    },
    // ... 다른 항목들
  };

  const handleSubmit = async () => {
    const result = await healthAssessmentApi.calculate(assessment);
    // 결과 처리 및 코디네이터 추천
  };
};
```

### UI/UX 기능
- **단계별 진행**: 4단계 Step Wizard (걷기→식사→배변→의사소통)
- **실시간 미리보기**: 선택할 때마다 예상 등급 표시  
- **접근성**: 시각장애인 스크린리더 지원
- **모바일 최적화**: Touch-friendly 버튼 크기
- **다국어 지원**: 한/영/중/일 언어 전환

### 결과 표시 화면
```typescript
export const AssessmentResult: React.FC<{result: CareGradeResult}> = ({result}) => {
  return (
    <div className="assessment-result">
      <div className="result-summary">
        <h2>건강 상태 평가 결과</h2>
        <div className="care-grade-badge">
          <span className="grade">{result.overallCareGrade}</span>
          <span className="score">ADL 점수: {result.adlScore}점</span>
        </div>
      </div>
      
      <div className="recommendations">
        <h3>🎯 매칭된 코디네이터: {result.matchedCoordinators.length}명</h3>
        <h3>🏥 추천 요양시설: {result.recommendedFacilities.length}곳</h3>
        
        <div className="next-steps">
          <button onClick={() => navigate('/coordinator-matching')}>
            코디네이터 매칭 시작
          </button>
          <button onClick={() => navigate('/facility-search')}>
            시설 둘러보기  
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## 🔗 외부 연동 준비

### 장기요양기관 평가 API 연동
```java
@Component
public class LtciEvaluationApiClient {
    
    @Value("${ltci.evaluation.api.key}")
    private String apiKey;
    
    @Value("${ltci.evaluation.base.url}")  
    private String baseUrl;
    
    public List<FacilityEvaluation> getFacilityEvaluations(String region) {
        // 공공데이터 API 호출
        // 인증키: CCXHQiSSQ0J+RRaadSjmmS7ltxG/tlSVOYMjh45MmGne68ptgGAaAJVJti8nBazSjLemTAyb5gAuj43xq7fTog==
    }
}
```

---

## 📊 통계 및 분석

### 평가 결과 통계
- **케어 등급별 분포**: 1등급(최중증) ~ 6등급(인지지원) 비율
- **지역별 평가 현황**: 시/도별 평가 완료율
- **연령대별 케어 등급**: 60대, 70대, 80대+ 등급 분포  
- **성별 케어 패턴**: 남/여 케어 등급 차이 분석

### 관리자 대시보드 데이터
```java
@RestController
@RequestMapping("/api/admin/health-assessments")
public class HealthAssessmentAdminController {
    
    @GetMapping("/statistics")
    public ResponseEntity<AssessmentStatistics> getStatistics() {
        return ResponseEntity.ok(assessmentStatisticsService.getOverallStatistics());
    }
    
    @GetMapping("/grade-distribution") 
    public ResponseEntity<Map<String, Long>> getCareGradeDistribution() {
        return ResponseEntity.ok(assessmentStatisticsService.getCareGradeDistribution());
    }
}
```

---

## 🛠 개발 도구

### 테스트 명령어
```bash
# 백엔드 건강평가 테스트
./gradlew :test --tests "*HealthAssessmentTest"

# 케어등급 계산 테스트  
./gradlew :test --tests "*CareGradeCalculatorTest"

# 프론트엔드 테스트
cd frontend && npm test HealthAssessmentForm
```

### API 테스트
```bash
# 건강 평가 생성
curl -X POST http://localhost:8080/api/health-assessments \
  -H "Content-Type: application/json" \
  -d '{"memberId":"user123","mobilityLevel":2,"eatingLevel":1,"toiletLevel":2,"communicationLevel":1}'

# 케어 등급 계산
curl -X POST http://localhost:8080/api/health-assessments/calculate \
  -H "Content-Type: application/json"  
  -d '{"adlScore":80,"ltciGrade":3,"careTargetStatus":4}'
```

---

## 📋 확인 사항

### Phase 3-A 완료 체크리스트
- [ ] 4개 영역 건강 평가 로직 구현
- [ ] ADL 점수 계산 알고리즘 검증
- [ ] 장기요양보험 등급 연동 확인
- [ ] 종합 케어 등급 산출 정확성 테스트
- [ ] API 엔드포인트 정상 동작 확인

### Phase 3-B 완료 체크리스트  
- [ ] React 체크리스트 폼 완성
- [ ] 단계별 진행 UI 동작 확인
- [ ] 모바일 반응형 레이아웃 검증
- [ ] 백엔드 API 연동 성공
- [ ] 결과 화면 표시 완료

---

## 🎯 다음 단계

**Phase 4-A**: 코디네이터 프로필 관리  
- CoordinatorProfile 엔티티
- 자기 설정 케어 등급 시스템
- 전문성 및 경력 관리  
- 실시간 가용성 관리

**중간 체크포인트**: Phase 3 완료 후 코디네이터 매칭 시스템 구축