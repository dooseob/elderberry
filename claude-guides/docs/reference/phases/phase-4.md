# Phase 4: 코디네이터 매칭 시스템

## 🎯 개요
**소요기간**: 4-5일  
**예상 토큰**: ~27,000 토큰  
**목표**: AI 기반 코디네이터 자동 매칭 시스템 + 자기 설정 케어 등급 관리

---

## 📌 Phase 4-A: 코디네이터 프로필 관리

### 구현 대상
- [ ] CoordinatorProfile 엔티티
- [ ] 자기 설정 케어 등급 시스템  
- [ ] 전문성 및 경력 관리
- [ ] 실시간 가용성 관리
- [ ] 성과 기반 신뢰도 점수

### 코디네이터 전문 분야별 분류
```yaml
의료 전문 코디네이터:
  - 간호사, 사회복지사, 요양보호사 자격 보유
  - 의료진과의 전문적 소통 능력
  - 치매, 뇌졸중 등 특정 질환 전문성

법무/행정 전문 코디네이터:  
  - 행정사, 법무사 등 자격 보유
  - 비자, 보험, 행정절차 전문 지식
  - 외국인 관련 법령 숙지

언어 전문 코디네이터:
  - 다국어 구사 능력 (영어, 중국어, 일본어)
  - 번역/통역 자격증 보유
  - 문화적 차이 이해 및 중재 능력

심리 상담 전문 코디네이터:
  - 심리상담사, 사회복지사 자격
  - 가족 갈등 중재 및 심리적 지원
  - 치매 환자 및 가족 상담 전문성
```

### 엔티티 설계
```java
@Entity
@Table(name = "coordinator_care_settings")
public class CoordinatorCareSettings extends BaseEntity {
    @Id
    private Long id;
    private String coordinatorId;
    
    // 시스템 자동 산출 등급
    private Integer baseCareLevel;           // 자격증 기반 기본 등급
    private Integer maxCareLevel;            // 경력 기반 최대 등급
    
    // 코디네이터 개인 설정
    @ElementCollection
    private Set<Integer> preferredCareGrades;    // 선호 케어 등급 [1,2,3,4,5,6]
    
    @ElementCollection  
    private Set<Integer> excludedCareGrades;     // 거부 케어 등급 [1,2]
    
    @ElementCollection
    private Set<String> specialtyAreas;         // 전문 분야 ["dementia", "medical"]
    
    // 업무량 설정
    private Integer maxSimultaneousCases;       // 동시 담당 가능 케이스 수
    private Integer preferredCasesPerMonth;     // 월 선호 케이스 수
    
    // 근무 조건 설정
    private Boolean availableWeekends;          // 주말 근무 가능 여부
    private Boolean availableEmergency;         // 응급 상황 대응 가능 여부
    private Set<String> workingRegions;         // 근무 가능 지역
    
    // 성과 기반 조정
    private Double performanceScore;            // 성과 점수 (0.0-5.0)
    private Double customerSatisfaction;        // 고객 만족도 (0.0-5.0)
    private Integer successfulCases;            // 성공 케이스 수
    private Integer totalCases;                 // 총 담당 케이스 수
    
    private LocalDateTime lastUpdated;
}
```

### 자격증 기반 기본 등급 시스템
```yaml
Tier 1 (요양보호사): 
  - 기본 케어 등급: 4-5등급, 인지지원등급
  - 상한선: 3등급까지 가능 (경력 2년+ 시)
  
Tier 2 (간호조무사, 사회복지사):
  - 기본 케어 등급: 2-5등급  
  - 상한선: 1등급까지 가능 (경력 5년+ 시)
  
Tier 3 (간호사, 의료진):
  - 기본 케어 등급: 1-5등급 전체
  - 특수 케어: 호스피스, 의료진 협력 케어
```

### API 엔드포인트
```
GET  /api/coordinators/{coordinatorId}/care-settings       - 케어 설정 조회
PUT  /api/coordinators/{coordinatorId}/care-settings       - 케어 설정 업데이트
POST /api/coordinators/{coordinatorId}/care-grades/preferences  - 선호/거부 등급 설정
GET  /api/coordinators/{coordinatorId}/matching-statistics     - 매칭 성과 통계
POST /api/coordinators/{coordinatorId}/availability            - 실시간 가용성 업데이트
```

---

## 📌 Phase 4-B: AI 기반 매칭 알고리즘

### 구현 대상  
- [ ] 다층 매칭 시스템 (Multi-Layer Matching)
- [ ] 종합 점수 계산 로직
- [ ] 업무량 최적화 분배
- [ ] 매칭 결과 설명 생성
- [ ] 실시간 가용성 반영

### 매칭 알고리즘 구조
```java
@Service
public class OptimizedCoordinatorMatchingService {
    
    public List<CoordinatorMatch> findOptimalMatches(HealthAssessment assessment, 
                                                   MatchingPreference preference) {
        
        // 1단계: 기본 자격 필터링
        List<Coordinator> eligibleCoordinators = filterByBasicQualifications(assessment);
        
        // 2단계: 코디네이터 설정 매칭
        List<Coordinator> settingsMatched = filterByCoordinatorSettings(eligibleCoordinators, assessment);
        
        // 3단계: AI 스코어링 및 최적화
        List<CoordinatorMatch> scoredMatches = calculateOptimalMatches(settingsMatched, assessment);
        
        // 4단계: 실시간 가용성 확인
        return filterByRealTimeAvailability(scoredMatches, preference);
    }
}
```

### 종합 점수 계산 (5.0 만점)
```java
private double calculateComprehensiveMatchScore(Coordinator coordinator, HealthAssessment assessment) {
    double score = 0.0;
    
    // 1. 전문성 매칭 점수 (40%)
    score += calculateSpecialtyMatchScore(coordinator, assessment) * 0.4;
    
    // 2. 경력 및 성과 점수 (25%)
    score += calculateExperienceScore(coordinator) * 0.25;
    
    // 3. 고객 만족도 점수 (20%)
    score += coordinator.getCareSettings().getCustomerSatisfaction() * 0.2;
    
    // 4. 지역 접근성 점수 (10%)
    score += calculateLocationScore(coordinator, assessment) * 0.1;
    
    // 5. 실시간 가용성 보너스 (5%)
    score += calculateAvailabilityBonus(coordinator) * 0.05;
    
    return Math.min(score, 5.0); // 최대 5점
}
```

### 전문성 기반 스마트 매칭
```java
private double calculateSpecialtyMatchScore(Coordinator coordinator, HealthAssessment assessment) {
    double specialtyScore = 0.0;
    Set<String> coordinatorSpecialties = coordinator.getCareSettings().getSpecialtyAreas();
    
    // 치매 전문성 매칭
    if (assessment.getLtciGrade() == 6 || assessment.getCommunicationLevel() == 3) {
        if (coordinatorSpecialties.contains("dementia")) {
            specialtyScore += 2.0;
        }
    }
    
    // 의료 전문성 매칭 (1-2등급, 상태1-2)
    if (assessment.getOverallCareGrade().getLevel() <= 2 || assessment.getCareTargetStatus() <= 2) {
        if (coordinatorSpecialties.contains("medical")) {
            specialtyScore += 2.0;
        }
    }
    
    // 재활 전문성 매칭
    if (assessment.getMobilityLevel() >= 2) {
        if (coordinatorSpecialties.contains("rehabilitation")) {
            specialtyScore += 1.5;
        }
    }
    
    // 다국어 지원 (재외동포)
    if (assessment.isOverseasKorean()) {
        if (coordinatorSpecialties.contains("multilingual")) {
            specialtyScore += 1.0;
        }
    }
    
    return Math.min(specialtyScore, 5.0);
}
```

### 업무량 최적화 분배
```java
@Component
public class CoordinatorWorkloadOptimizer {
    
    public List<CoordinatorMatch> optimizeWorkloadDistribution(List<CoordinatorMatch> matches) {
        return matches.stream()
            .map(match -> {
                Coordinator coordinator = match.getCoordinator();
                double workloadScore = calculateWorkloadScore(coordinator);
                
                // 업무량이 적은 코디네이터에게 가산점
                double adjustedScore = match.getMatchScore() + (workloadScore * 0.3);
                
                return new CoordinatorMatch(coordinator, adjustedScore, 
                    match.getMatchReason() + generateWorkloadReason(workloadScore));
            })
            .sorted(Comparator.comparing(CoordinatorMatch::getMatchScore).reversed())
            .collect(Collectors.toList());
    }
    
    private double calculateWorkloadScore(Coordinator coordinator) {
        CoordinatorCareSettings settings = coordinator.getCareSettings();
        int currentCases = getCurrentActiveCases(coordinator.getId());
        int maxCases = settings.getMaxSimultaneousCases();
        
        // 업무량 비율 계산 (낮을수록 높은 점수)
        double workloadRatio = (double) currentCases / maxCases;
        
        if (workloadRatio >= 1.0) return 0.0;      // 포화 상태
        if (workloadRatio >= 0.8) return 1.0;      // 거의 포화
        if (workloadRatio >= 0.6) return 2.0;      // 적정 수준
        if (workloadRatio >= 0.4) return 3.0;      // 여유 있음
        return 4.0;                                // 매우 여유
    }
}
```

### 지능형 매칭 결과 설명
```java
public class MatchingExplanationGenerator {
    
    public String generateMatchReason(Coordinator coordinator, HealthAssessment assessment) {
        StringBuilder reason = new StringBuilder();
        
        // 전문성 매칭 이유
        if (isSpecialtyMatch(coordinator, assessment)) {
            reason.append("🎯 전문 분야 완벽 매칭: ");
            reason.append(getSpecialtyDescription(coordinator, assessment));
            reason.append("\n");
        }
        
        // 경력 매칭 이유
        int experience = coordinator.getCareSettings().getExperienceYears();
        reason.append("📊 경력: ").append(experience).append("년 (");
        if (experience >= 10) reason.append("최고 전문가");
        else if (experience >= 5) reason.append("숙련 전문가");
        else if (experience >= 2) reason.append("경력자");
        else reason.append("신입");
        reason.append(")\n");
        
        // 성과 이유
        double satisfaction = coordinator.getCareSettings().getCustomerSatisfaction();
        reason.append("⭐ 고객 만족도: ").append(satisfaction).append("/5.0");
        if (satisfaction >= 4.5) reason.append(" (최우수)");
        else if (satisfaction >= 4.0) reason.append(" (우수)");
        else if (satisfaction >= 3.5) reason.append(" (양호)");
        reason.append("\n");
        
        // 가용성 이유
        int currentLoad = getCurrentActiveCases(coordinator.getId());
        int maxLoad = coordinator.getCareSettings().getMaxSimultaneousCases();
        reason.append("⏰ 현재 업무량: ").append(currentLoad).append("/").append(maxLoad);
        if (currentLoad < maxLoad * 0.6) reason.append(" (즉시 배정 가능)");
        else if (currentLoad < maxLoad * 0.8) reason.append(" (배정 가능)");
        else reason.append(" (일정 조율 필요)");
        
        return reason.toString();
    }
}
```

---

## 🎨 React 매칭 결과 UI

### 매칭 결과 컴포넌트
```typescript
export const CoordinatorMatchingResult: React.FC<{matches: CoordinatorMatch[]}> = ({matches}) => {
  const [selectedCoordinator, setSelectedCoordinator] = useState<CoordinatorMatch | null>(null);

  return (
    <div className="coordinator-matching-result">
      <h2>🎯 매칭된 코디네이터 ({matches.length}명)</h2>
      
      <div className="matching-summary">
        <div className="best-match">
          <h3>🏆 최고 매칭 (매칭도: {matches[0].matchScore.toFixed(1)}/5.0)</h3>
          <CoordinatorCard coordinator={matches[0]} />
        </div>
        
        <div className="alternative-matches">
          <h3>📋 다른 추천 코디네이터</h3>
          {matches.slice(1, 4).map((match, index) => (
            <CoordinatorCard key={index} coordinator={match} compact />
          ))}
        </div>
      </div>
      
      <div className="matching-actions">
        <button 
          className="primary-button"
          onClick={() => requestConsultation(matches[0])}
        >
          최고 매칭 코디네이터와 상담 신청
        </button>
        <button 
          className="secondary-button"
          onClick={() => viewAllMatches()}
        >
          전체 매칭 결과 보기 ({matches.length}명)
        </button>
      </div>
    </div>
  );
};

const CoordinatorCard: React.FC<{coordinator: CoordinatorMatch, compact?: boolean}> = ({coordinator, compact = false}) => {
  return (
    <div className={`coordinator-card ${compact ? 'compact' : ''}`}>
      <div className="coordinator-header">
        <div className="coordinator-info">
          <h4>{coordinator.name}</h4>
          <span className="specialties">
            {coordinator.specialtyAreas.map(area => (
              <span key={area} className="specialty-badge">{area}</span>
            ))}
          </span>
        </div>
        <div className="match-score">
          <span className="score">{coordinator.matchScore.toFixed(1)}</span>
          <span className="max-score">/5.0</span>
        </div>
      </div>
      
      {!compact && (
        <div className="coordinator-details">
          <div className="match-reason">
            <h5>🎯 매칭 이유</h5>
            <p>{coordinator.matchReason}</p>
          </div>
          
          <div className="coordinator-stats">
            <div className="stat">
              <span className="stat-label">경력</span>
              <span className="stat-value">{coordinator.experienceYears}년</span>
            </div>
            <div className="stat">
              <span className="stat-label">성공 케이스</span>
              <span className="stat-value">{coordinator.successfulCases}건</span>
            </div>
            <div className="stat">
              <span className="stat-label">만족도</span>
              <span className="stat-value">{coordinator.customerSatisfaction.toFixed(1)}/5.0</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## 📊 성능 모니터링

### 매칭 성공률 추적
```yaml
매칭 성공률 추적:
  - 초기 매칭 성공률: 매칭 후 계약 체결율
  - 장기 만족도: 3개월 후 고객 만족도  
  - 코디네이터 만족도: 업무 부하 적정성
  - 재매칭률: 코디네이터 변경 요청률

실시간 최적화:
  - A/B 테스트: 매칭 알고리즘 성능 비교
  - 머신러닝: 매칭 성공 패턴 학습
  - 피드백 루프: 결과 기반 알고리즘 개선
  - 계절별 조정: 시기별 수요 패턴 반영
```

### 관리자 매칭 통계 API
```java
@RestController
@RequestMapping("/api/admin/coordinator-matching")
public class CoordinatorMatchingAdminController {
    
    @GetMapping("/statistics")
    public ResponseEntity<MatchingStatistics> getMatchingStatistics() {
        return ResponseEntity.ok(matchingStatisticsService.getOverallStatistics());
    }
    
    @GetMapping("/success-rate")
    public ResponseEntity<Map<String, Double>> getMatchingSuccessRate() {
        return ResponseEntity.ok(matchingStatisticsService.getSuccessRateBySpecialty());
    }
    
    @GetMapping("/coordinator-workload")
    public ResponseEntity<List<CoordinatorWorkloadReport>> getCoordinatorWorkload() {
        return ResponseEntity.ok(matchingStatisticsService.getWorkloadReports());
    }
}
```

---

## 🛠 개발 도구

### 테스트 명령어
```bash
# 매칭 알고리즘 테스트
./gradlew :test --tests "*CoordinatorMatchingServiceTest"

# 업무량 최적화 테스트  
./gradlew :test --tests "*WorkloadOptimizerTest"

# 전문성 매칭 테스트
./gradlew :test --tests "*SpecialtyMatchingTest"
```

### 매칭 시뮬레이션 테스트
```bash
# 대량 매칭 테스트
curl -X POST http://localhost:8080/api/coordinator-matching/simulate \
  -H "Content-Type: application/json" \
  -d '{"healthAssessmentId":123,"coordinatorCount":100}'

# 성능 테스트  
./gradlew :test --tests "*MatchingPerformanceTest"
```

---

## 📋 확인 사항

### Phase 4-A 완료 체크리스트
- [ ] 코디네이터 자기 설정 케어 등급 시스템 구현
- [ ] 전문성 및 자격증 기반 등급 자동 산출
- [ ] 실시간 가용성 관리 기능
- [ ] 성과 기반 신뢰도 점수 계산
- [ ] API 엔드포인트 정상 동작 확인

### Phase 4-B 완료 체크리스트  
- [ ] AI 기반 다층 매칭 알고리즘 구현
- [ ] 종합 점수 계산 로직 정확성 검증
- [ ] 업무량 최적화 분배 기능
- [ ] 매칭 결과 설명 생성
- [ ] React 매칭 결과 UI 완성

---

## 🎯 다음 단계

**Phase 5-A**: 시설 등급 및 분류 시스템
- FacilityProfile 엔티티
- 시설 타입별 분류 (양로시설, 요양병원 등)  
- A-E 등급 시스템
- 장기요양기관 평가 API 연동

**중간 체크포인트**: Phase 4 완료 후 시설 관리 시스템 구축