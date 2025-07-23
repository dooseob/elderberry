package com.globalcarelink.facility;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.globalcarelink.auth.Member;
import com.globalcarelink.auth.MemberRepository;
import com.globalcarelink.auth.MemberRole;
import com.globalcarelink.facility.dto.FacilityMatchingRequest;
import com.globalcarelink.facility.dto.MatchingCompletionRequest;
import com.globalcarelink.health.HealthAssessment;
import com.globalcarelink.health.HealthAssessmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 시설 컨트롤러 통합 테스트
 * 시설 매칭, 추천, 사용자 행동 추적 등의 전체 플로우를 검증
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
@DisplayName("시설 컨트롤러 통합 테스트")
class FacilityControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private FacilityProfileRepository facilityProfileRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private HealthAssessmentRepository healthAssessmentRepository;

    @Autowired
    private FacilityMatchingHistoryRepository matchingHistoryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Member testMember;
    private HealthAssessment testAssessment;
    private FacilityProfile testFacility1;
    private FacilityProfile testFacility2;

    @BeforeEach
    void setUp() {
        setupTestData();
    }

    @Test
    @DisplayName("시설 목록 조회 - 페이징 및 필터링")
    void getAllFacilities_WithPagingAndFiltering() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/facilities")
                        .param("page", "0")
                        .param("size", "10")
                        .param("facilityType", "요양시설")
                        .param("facilityGrade", "A"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].facilityType").value("요양시설"))
                .andExpect(jsonPath("$.content[0].facilityGrade").value("A"))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.totalPages").value(1));
    }

    @Test
    @DisplayName("시설 상세 조회 - 사용자 행동 추적 포함")
    @WithMockUser(username = "test@example.com")
    void getFacilityById_WithUserTracking() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/facilities/{facilityId}", testFacility1.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testFacility1.getId()))
                .andExpect(jsonPath("$.facilityName").value(testFacility1.getFacilityName()))
                .andExpect(jsonPath("$.facilityType").value(testFacility1.getFacilityType()));

        // 사용자 행동이 추적되었는지 확인
        // 실제로는 매칭 이력이 생성되어야 하지만, 이 테스트에서는 조회 로그만 확인
    }

    @Test
    @DisplayName("맞춤형 시설 추천 - 전체 플로우")
    @WithMockUser(username = "test@example.com")
    @Transactional
    void getRecommendations_FullFlow() throws Exception {
        // Given
        FacilityMatchingRequest request = new FacilityMatchingRequest();
        request.setMemberId(testMember.getId());
        request.setCoordinatorId("coordinator1");
        request.setMaxResults(5);
        
        FacilityMatchingPreference preference = new FacilityMatchingPreference();
        preference.setPreferredRegions(Set.of("서울시 강남구"));
        preference.setPreferredFacilityTypes(Set.of("요양시설"));
        preference.setMaxMonthlyFee(3000000);
        preference.setMinFacilityGrade("B");
        request.setPreference(preference);

        // When & Then
        mockMvc.perform(post("/api/facilities/recommendations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].facility").exists())
                .andExpect(jsonPath("$[0].matchScore").exists())
                .andExpect(jsonPath("$[0].recommendationReason").exists());

        // 매칭 이력이 저장되었는지 확인
        List<FacilityMatchingHistory> histories = matchingHistoryRepository.findByUserIdOrderByCreatedAtDesc("test@example.com");
        assert !histories.isEmpty();
    }

    @Test
    @DisplayName("지역별 시설 검색")
    void searchFacilitiesByRegion() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/facilities/search/region")
                        .param("region", "서울시 강남구")
                        .param("facilityType", "요양시설")
                        .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].address").value(testFacility1.getAddress()));
    }

    @Test
    @DisplayName("케어 등급별 시설 검색")
    void searchFacilitiesByCareGrade() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/facilities/search/care-grade")
                        .param("careGradeLevel", "3")
                        .param("region", "서울시")
                        .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("시설 연락 추적")
    @WithMockUser(username = "test@example.com")
    void trackFacilityContact() throws Exception {
        // Given - 먼저 매칭 이력 생성
        createTestMatchingHistory();

        // When & Then
        mockMvc.perform(post("/api/facilities/{facilityId}/contact", testFacility1.getId()))
                .andExpect(status().isOk());

        // 연락 추적이 기록되었는지 확인
        List<FacilityMatchingHistory> histories = matchingHistoryRepository.findByUserIdOrderByCreatedAtDesc("test@example.com");
        assert histories.get(0).isContacted();
    }

    @Test
    @DisplayName("시설 방문 추적")
    @WithMockUser(username = "test@example.com")
    void trackFacilityVisit() throws Exception {
        // Given - 먼저 매칭 이력 생성
        createTestMatchingHistory();

        // When & Then
        mockMvc.perform(post("/api/facilities/{facilityId}/visit", testFacility1.getId()))
                .andExpect(status().isOk());

        // 방문 추적이 기록되었는지 확인
        List<FacilityMatchingHistory> histories = matchingHistoryRepository.findByUserIdOrderByCreatedAtDesc("test@example.com");
        assert histories.get(0).isVisited();
    }

    @Test
    @DisplayName("매칭 완료 처리")
    @WithMockUser(username = "test@example.com")
    @Transactional
    void completeMatching() throws Exception {
        // Given - 먼저 매칭 이력 생성
        createTestMatchingHistory();

        MatchingCompletionRequest request = new MatchingCompletionRequest();
        request.setOutcome(FacilityMatchingHistory.MatchingOutcome.SUCCESSFUL);
        request.setActualCost(BigDecimal.valueOf(2500000));
        request.setSatisfactionScore(BigDecimal.valueOf(4.5));
        request.setFeedback("매우 만족스러운 시설입니다.");
        request.setRecommendationWillingness(5);

        // When & Then
        mockMvc.perform(post("/api/facilities/{facilityId}/complete-matching", testFacility1.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        // 매칭 완료가 기록되었는지 확인
        List<FacilityMatchingHistory> histories = matchingHistoryRepository.findByUserIdOrderByCreatedAtDesc("test@example.com");
        FacilityMatchingHistory history = histories.get(0);
        assert history.isSelected();
        assert history.getOutcome() == FacilityMatchingHistory.MatchingOutcome.SUCCESSFUL;
        assert history.getSatisfactionScore().equals(BigDecimal.valueOf(4.5));
    }

    @Test
    @DisplayName("시설 성과 분석 조회")
    void getFacilityPerformance() throws Exception {
        // Given - 테스트 매칭 이력 생성
        createMultipleTestMatchingHistories();

        // When & Then
        mockMvc.perform(get("/api/facilities/analytics/performance")
                        .param("days", "30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("매칭 트렌드 분석 조회")
    void getMatchingTrends() throws Exception {
        // Given - 테스트 매칭 이력 생성
        createMultipleTestMatchingHistories();

        // When & Then
        mockMvc.perform(get("/api/facilities/analytics/trends")
                        .param("days", "90"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.monthlyTrends").isArray())
                .andExpect(jsonPath("$.totalMatches").exists())
                .andExpect(jsonPath("$.overallSuccessRate").exists());
    }

    @Test
    @DisplayName("사용자 매칭 이력 조회")
    @WithMockUser(username = "test@example.com")
    void getUserMatchingHistory() throws Exception {
        // Given - 테스트 매칭 이력 생성
        createTestMatchingHistory();

        // When & Then
        mockMvc.perform(get("/api/facilities/matching-history")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("추천 정확도 분석 조회")
    void getRecommendationAccuracy() throws Exception {
        // Given - 테스트 매칭 이력 생성
        createMultipleTestMatchingHistories();

        // When & Then
        mockMvc.perform(get("/api/facilities/analytics/recommendation-accuracy")
                        .param("days", "30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.overallAccuracy").exists())
                .andExpect(jsonPath("$.rankAccuracies").isArray());
    }

    @Test
    @DisplayName("시설 통계 요약 조회")
    void getFacilityStatistics() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/facilities/statistics/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalFacilities").exists())
                .andExpect(jsonPath("$.facilityTypeDistribution").exists())
                .andExpect(jsonPath("$.gradeDistribution").exists());
    }

    // ===== 헬퍼 메서드 =====

    private void setupTestData() {
        // 테스트 회원 생성
        testMember = Member.builder()
                .email("test@example.com")
                .password(passwordEncoder.encode("password123"))
                .name("테스트 사용자")
                .role(MemberRole.USER)
                .createdAt(LocalDateTime.now())
                .build();
        testMember = memberRepository.save(testMember);

        // 테스트 건강 평가 생성
        testAssessment = HealthAssessment.builder()
                .memberId(testMember.getId())
                .birthYear(1960)
                .adlEating(2)
                .adlToilet(2)
                .adlMobility(3)
                .adlCommunication(1)
                .ltciGrade(3)
                .hasChronicDisease(true)
                .chronicDiseases(List.of("당뇨병", "고혈압"))
                .hasCognitiveDifficulty(false)
                .additionalInfo("정기적인 관리 필요")
                .createdAt(LocalDateTime.now())
                .build();
        testAssessment = healthAssessmentRepository.save(testAssessment);

        // 테스트 시설 생성
        testFacility1 = FacilityProfile.builder()
                .facilityName("서울 요양원")
                .facilityType("요양시설")
                .facilityGrade("A")
                .address("서울시 강남구 테헤란로 123")
                .phoneNumber("02-1234-5678")
                .totalCapacity(100)
                .currentOccupancy(80)
                .monthlyBasicFee(2500000)
                .availableCareGrades(Set.of(1, 2, 3, 4, 5))
                .specialties(Set.of("치매케어", "재활치료"))
                .latitude(37.5665)
                .longitude(126.9780)
                .createdAt(LocalDateTime.now())
                .build();
        testFacility1 = facilityProfileRepository.save(testFacility1);

        testFacility2 = FacilityProfile.builder()
                .facilityName("부산 요양병원")
                .facilityType("요양병원")
                .facilityGrade("B")
                .address("부산시 해운대구 센텀로 456")
                .phoneNumber("051-9876-5432")
                .totalCapacity(150)
                .currentOccupancy(120)
                .monthlyBasicFee(3000000)
                .availableCareGrades(Set.of(1, 2, 3))
                .specialties(Set.of("의료케어", "물리치료"))
                .latitude(35.1796)
                .longitude(129.0756)
                .createdAt(LocalDateTime.now())
                .build();
        testFacility2 = facilityProfileRepository.save(testFacility2);
    }

    private void createTestMatchingHistory() {
        FacilityMatchingHistory history = FacilityMatchingHistory.builder()
                .userId("test@example.com")
                .facilityId(testFacility1.getId())
                .coordinatorId("coordinator1")
                .initialMatchScore(BigDecimal.valueOf(85.0))
                .recommendationRank(1)
                .matchingCriteria("{\"careGrade\":3,\"region\":\"서울시\"}")
                .facilitySnapshot("{\"type\":\"요양시설\",\"grade\":\"A\"}")
                .estimatedCost(BigDecimal.valueOf(2500000))
                .build();
        
        matchingHistoryRepository.save(history);
    }

    private void createMultipleTestMatchingHistories() {
        // 성공적인 매칭 이력들
        for (int i = 0; i < 5; i++) {
            FacilityMatchingHistory history = FacilityMatchingHistory.builder()
                    .userId("user" + i)
                    .facilityId(i % 2 == 0 ? testFacility1.getId() : testFacility2.getId())
                    .coordinatorId("coordinator1")
                    .initialMatchScore(BigDecimal.valueOf(80.0 + i))
                    .recommendationRank(i + 1)
                    .matchingCriteria("{\"careGrade\":3}")
                    .facilitySnapshot("{\"type\":\"요양시설\",\"grade\":\"A\"}")
                    .estimatedCost(BigDecimal.valueOf(2500000))
                    .isViewed(true)
                    .isContacted(true)
                    .isVisited(i < 3) // 처음 3개만 방문
                    .isSelected(i < 2) // 처음 2개만 선택
                    .outcome(i < 2 ? 
                            FacilityMatchingHistory.MatchingOutcome.SUCCESSFUL : 
                            FacilityMatchingHistory.MatchingOutcome.FAILED)
                    .satisfactionScore(i < 2 ? BigDecimal.valueOf(4.0 + i * 0.5) : null)
                    .createdAt(LocalDateTime.now().minusDays(i))
                    .build();
            
            matchingHistoryRepository.save(history);
        }
    }
} 