package com.globalcarelink.coordinator;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.globalcarelink.health.HealthAssessment;
import com.globalcarelink.health.HealthAssessmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CoordinatorMatchingController.class)
@ActiveProfiles("test")
@DisplayName("코디네이터 매칭 Controller API 테스트")
class CoordinatorMatchingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OptimizedCoordinatorMatchingService matchingService;

    @MockBean
    private HealthAssessmentService healthAssessmentService;

    @MockBean
    private CoordinatorCareSettingsService coordinatorCareSettingsService;

    @Autowired
    private ObjectMapper objectMapper;

    private HealthAssessment testAssessment;
    private MatchingPreference testPreference;
    private List<CoordinatorMatch> testMatches;
    private CoordinatorMatchingStatistics testStatistics;

    @BeforeEach
    void setUp() {
        setupTestData();
    }

    @Test
    @DisplayName("코디네이터 매칭 성공")
    @WithMockUser(roles = "USER_DOMESTIC")
    void matchCoordinators_Success() throws Exception {
        given(healthAssessmentService.getAssessmentById(1L)).willReturn(Optional.of(testAssessment));
        given(matchingService.findOptimalMatches(any(HealthAssessment.class), any(MatchingPreference.class)))
                .willReturn(testMatches);

        mockMvc.perform(post("/api/coordinator-matching/match")
                        .with(csrf())
                        .param("healthAssessmentId", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testPreference)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].coordinatorId").value("coordinator-001"))
                .andExpect(jsonPath("$[0].matchScore").value(4.5))
                .andExpect(jsonPath("$[0].matchReason").exists())
                .andExpect(jsonPath("$[0].experienceYears").value(5))
                .andExpect(jsonPath("$[0].customerSatisfaction").value(4.2));
    }

    @Test
    @DisplayName("코디네이터 매칭 실패 - 건강평가 없음")
    @WithMockUser(roles = "USER_DOMESTIC")
    void matchCoordinators_NotFound() throws Exception {
        given(healthAssessmentService.getAssessmentById(999L)).willReturn(Optional.empty());

        mockMvc.perform(post("/api/coordinator-matching/match")
                        .with(csrf())
                        .param("healthAssessmentId", "999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testPreference)))
                .andDo(print())
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("코디네이터 매칭 실패 - 권한 없음")
    void matchCoordinators_Unauthorized() throws Exception {
        mockMvc.perform(post("/api/coordinator-matching/match")
                        .with(csrf())
                        .param("healthAssessmentId", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testPreference)))
                .andDo(print())
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("코디네이터 매칭 실패 - 유효성 검증 오류")
    @WithMockUser(roles = "USER_DOMESTIC")
    void matchCoordinators_ValidationError() throws Exception {
        MatchingPreference invalidPreference = MatchingPreference.builder()
                .maxResults(-1)
                .minCustomerSatisfaction(6.0)
                .build();

        mockMvc.perform(post("/api/coordinator-matching/match")
                        .with(csrf())
                        .param("healthAssessmentId", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidPreference)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("전문분야별 코디네이터 조회 성공")
    @WithMockUser(roles = "USER_DOMESTIC")
    void getCoordinatorsBySpecialty_Success() throws Exception {
        List<CoordinatorCareSettings> specialtyCoordinators = List.of(
                createTestCoordinatorSettings("coordinator-001", Set.of("medical"))
        );
        
        given(coordinatorCareSettingsService.getCoordinatorsBySpecialty("medical"))
                .willReturn(specialtyCoordinators);

        mockMvc.perform(get("/api/coordinator-matching/specialty/medical"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].coordinatorId").value("coordinator-001"));
    }

    @Test
    @DisplayName("가용한 코디네이터 조회 성공")
    @WithMockUser(roles = "COORDINATOR")
    void getAvailableCoordinators_Success() throws Exception {
        List<CoordinatorCareSettings> availableCoordinators = List.of(
                createTestCoordinatorSettings("coordinator-001", Set.of("medical")),
                createTestCoordinatorSettings("coordinator-002", Set.of("rehabilitation"))
        );
        
        given(coordinatorCareSettingsService.getAvailableCoordinators())
                .willReturn(availableCoordinators);

        mockMvc.perform(get("/api/coordinator-matching/available"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @DisplayName("가용한 코디네이터 조회 실패 - 권한 없음")
    @WithMockUser(roles = "USER_DOMESTIC")
    void getAvailableCoordinators_Forbidden() throws Exception {
        mockMvc.perform(get("/api/coordinator-matching/available"))
                .andDo(print())
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("매칭 통계 조회 성공")
    @WithMockUser(roles = "ADMIN")
    void getMatchingStatistics_Success() throws Exception {
        given(coordinatorCareSettingsService.getMatchingStatistics())
                .willReturn(testStatistics);

        mockMvc.perform(get("/api/coordinator-matching/statistics"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.totalActiveCoordinators").value(50))
                .andExpect(jsonPath("$.averageCustomerSatisfaction").value(4.1))
                .andExpect(jsonPath("$.availableCoordinators").value(30))
                .andExpect(jsonPath("$.totalSuccessfulMatches").value(1200))
                .andExpect(jsonPath("$.overallMatchingSuccessRate").value(85.5))
                .andExpect(jsonPath("$.averageResponseTime").value(12.3));
    }

    @Test
    @DisplayName("매칭 통계 조회 실패 - 권한 없음")
    @WithMockUser(roles = "USER_DOMESTIC")
    void getMatchingStatistics_Forbidden() throws Exception {
        mockMvc.perform(get("/api/coordinator-matching/statistics"))
                .andDo(print())
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("매칭 시뮬레이션 성공")
    @WithMockUser(roles = "ADMIN")
    void simulateMatching_Success() throws Exception {
        MatchingSimulationRequest simulationRequest = MatchingSimulationRequest.builder()
                .healthAssessmentCount(100)
                .coordinatorCount(20)
                .simulationType("REALISTIC")
                .includeLanguageMatching(true)
                .includeSpecialtyMatching(true)
                .includeWorkloadOptimization(true)
                .build();

        MatchingSimulationResult simulationResult = MatchingSimulationResult.builder()
                .totalHealthAssessments(100)
                .totalCoordinators(20)
                .successfulMatches(95)
                .averageMatchingScore(4.2)
                .matchingSuccessRate(95.0)
                .executionTimeMs(1500L)
                .build();

        given(coordinatorCareSettingsService.runMatchingSimulation(any(MatchingSimulationRequest.class)))
                .willReturn(simulationResult);

        mockMvc.perform(post("/api/coordinator-matching/simulate")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(simulationRequest)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.totalHealthAssessments").value(100))
                .andExpect(jsonPath("$.totalCoordinators").value(20))
                .andExpect(jsonPath("$.successfulMatches").value(95))
                .andExpect(jsonPath("$.averageMatchingScore").value(4.2))
                .andExpect(jsonPath("$.matchingSuccessRate").value(95.0))
                .andExpect(jsonPath("$.executionTimeMs").value(1500));
    }

    @Test
    @DisplayName("매칭 시뮬레이션 실패 - 유효성 검증 오류")
    @WithMockUser(roles = "ADMIN")
    void simulateMatching_ValidationError() throws Exception {
        MatchingSimulationRequest invalidRequest = MatchingSimulationRequest.builder()
                .healthAssessmentCount(-1)
                .coordinatorCount(0)
                .simulationType("INVALID")
                .build();

        mockMvc.perform(post("/api/coordinator-matching/simulate")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("CSRF 토큰 없이 POST 요청 실패")
    @WithMockUser(roles = "USER_DOMESTIC")
    void postWithoutCsrf_Forbidden() throws Exception {
        mockMvc.perform(post("/api/coordinator-matching/match")
                        .param("healthAssessmentId", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testPreference)))
                .andDo(print())
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("잘못된 Content-Type으로 요청 실패")
    @WithMockUser(roles = "USER_DOMESTIC")
    void postWithWrongContentType_UnsupportedMediaType() throws Exception {
        mockMvc.perform(post("/api/coordinator-matching/match")
                        .with(csrf())
                        .param("healthAssessmentId", "1")
                        .contentType(MediaType.TEXT_PLAIN)
                        .content("invalid content"))
                .andDo(print())
                .andExpect(status().isUnsupportedMediaType());
    }

    private void setupTestData() {
        testAssessment = HealthAssessment.builder()
                .id(1L)
                .memberId("test-member-001")
                .mobilityLevel(2)
                .eatingLevel(2)
                .toiletLevel(2)
                .communicationLevel(2)
                .ltciGrade(3)
                .careTargetStatus(4)
                .mealType(1)
                .adlScore(180)
                .overallCareGrade("3등급 (중등증)")
                .build();

        testPreference = MatchingPreference.builder()
                .preferredLanguage("ko")
                .preferredRegion("seoul")
                .maxResults(20)
                .minCustomerSatisfaction(3.0)
                .needsWeekendAvailability(false)
                .needsEmergencyAvailability(false)
                .build();

        CoordinatorMatch match1 = CoordinatorMatch.builder()
                .coordinatorId("coordinator-001")
                .name("김코디네이터")
                .matchScore(4.5)
                .matchReason("전문 분야 매칭 및 높은 경력")
                .experienceYears(5)
                .successfulCases(120)
                .customerSatisfaction(4.2)
                .specialtyAreas(Set.of("medical", "elderly_care"))
                .languageSkills(List.of())
                .availableWeekends(true)
                .availableEmergency(true)
                .workingRegions(Set.of("seoul", "incheon"))
                .currentActiveCases(3)
                .maxSimultaneousCases(8)
                .workloadRatio(0.375)
                .build();

        CoordinatorMatch match2 = CoordinatorMatch.builder()
                .coordinatorId("coordinator-002")
                .name("이코디네이터")
                .matchScore(4.0)
                .matchReason("지역 매칭 및 적정 경력")
                .experienceYears(3)
                .successfulCases(80)
                .customerSatisfaction(3.8)
                .specialtyAreas(Set.of("rehabilitation"))
                .languageSkills(List.of())
                .availableWeekends(false)
                .availableEmergency(false)
                .workingRegions(Set.of("seoul", "gyeonggi"))
                .currentActiveCases(2)
                .maxSimultaneousCases(6)
                .workloadRatio(0.333)
                .build();

        testMatches = List.of(match1, match2);

        testStatistics = CoordinatorMatchingStatistics.builder()
                .totalActiveCoordinators(50L)
                .averageCustomerSatisfaction(4.1)
                .availableCoordinators(30)
                .totalSuccessfulMatches(1200L)
                .overallMatchingSuccessRate(85.5)
                .averageResponseTime(12.3)
                .build();
    }

    private CoordinatorCareSettings createTestCoordinatorSettings(String coordinatorId, Set<String> specialtyAreas) {
        return CoordinatorCareSettings.builder()
                .coordinatorId(coordinatorId)
                .baseCareLevel(1)
                .maxCareLevel(5)
                .experienceYears(5)
                .successfulCases(100)
                .customerSatisfaction(4.0)
                .maxSimultaneousCases(8)
                .specialtyAreas(specialtyAreas)
                .workingRegions(Set.of("seoul"))
                .availableWeekends(true)
                .availableEmergency(false)
                .isActive(true)
                .build();
    }
} 