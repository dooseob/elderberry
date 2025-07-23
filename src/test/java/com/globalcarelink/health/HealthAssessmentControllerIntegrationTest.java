package com.globalcarelink.health;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.globalcarelink.health.dto.HealthAssessmentCreateRequest;
import com.globalcarelink.health.dto.HealthAssessmentUpdateRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("건강 평가 시스템 통합 테스트")
class HealthAssessmentControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private HealthAssessmentService healthAssessmentService;

    @Autowired
    private HealthAssessmentRepository healthAssessmentRepository;

    private HealthAssessmentCreateRequest validCreateRequest;
    private HealthAssessmentUpdateRequest validUpdateRequest;

    @BeforeEach
    void setUp() {
        setupTestData();
    }

    @Test
    @DisplayName("건강 평가 생성 통합 테스트 - 성공")
    @WithMockUser(roles = "USER_DOMESTIC")
    void createAssessment_Integration_Success() throws Exception {
        mockMvc.perform(post("/api/health-assessments")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validCreateRequest)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.memberId").value("test-member-001"))
                .andExpect(jsonPath("$.mobilityLevel").value(2))
                .andExpect(jsonPath("$.eatingLevel").value(2))
                .andExpect(jsonPath("$.toiletLevel").value(3))
                .andExpect(jsonPath("$.communicationLevel").value(2))
                .andExpect(jsonPath("$.ltciGrade").value(3))
                .andExpect(jsonPath("$.adlScore").exists())
                .andExpect(jsonPath("$.overallCareGrade").exists())
                .andExpect(jsonPath("$.assessmentDate").exists());
    }

    @Test
    @DisplayName("건강 평가 조회 통합 테스트 - 성공")
    @WithMockUser(roles = "USER_DOMESTIC")
    void getAssessment_Integration_Success() throws Exception {
        HealthAssessment created = healthAssessmentService.createAssessment(validCreateRequest);
        
        mockMvc.perform(get("/api/health-assessments/{assessmentId}", created.getId()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(created.getId()))
                .andExpect(jsonPath("$.memberId").value("test-member-001"))
                .andExpect(jsonPath("$.adlScore").value(created.getAdlScore()))
                .andExpect(jsonPath("$.overallCareGrade").value(created.getOverallCareGrade()));
    }

    @Test
    @DisplayName("건강 평가 수정 통합 테스트 - 성공")
    @WithMockUser(roles = "USER_DOMESTIC")
    void updateAssessment_Integration_Success() throws Exception {
        HealthAssessment created = healthAssessmentService.createAssessment(validCreateRequest);
        
        mockMvc.perform(put("/api/health-assessments/{assessmentId}", created.getId())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validUpdateRequest)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(created.getId()))
                .andExpect(jsonPath("$.mobilityLevel").value(validUpdateRequest.getMobilityLevel()))
                .andExpect(jsonPath("$.eatingLevel").value(validUpdateRequest.getEatingLevel()))
                .andExpect(jsonPath("$.adlScore").exists());
    }

    @Test
    @DisplayName("회원별 건강 평가 이력 조회 통합 테스트")
    @WithMockUser(roles = "USER_DOMESTIC")
    void getMemberAssessments_Integration_Success() throws Exception {
        healthAssessmentService.createAssessment(validCreateRequest);
        
        HealthAssessmentCreateRequest secondRequest = HealthAssessmentCreateRequest.builder()
                .memberId("test-member-001")
                .mobilityLevel(3)
                .eatingLevel(3)
                .toiletLevel(3)
                .communicationLevel(3)
                .ltciGrade(2)
                .careTargetStatus(3)
                .mealType(2)
                .diseaseTypes("고혈압")
                .build();
        
        healthAssessmentService.createAssessment(secondRequest);

        mockMvc.perform(get("/api/health-assessments/member/test-member-001"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].memberId").value("test-member-001"))
                .andExpect(jsonPath("$[1].memberId").value("test-member-001"));
    }

    @Test
    @DisplayName("건강 평가 통계 조회 통합 테스트")
    @WithMockUser(roles = "ADMIN")
    void getStatistics_Integration_Success() throws Exception {
        healthAssessmentService.createAssessment(validCreateRequest);
        
        HealthAssessmentCreateRequest request2 = HealthAssessmentCreateRequest.builder()
                .memberId("test-member-002")
                .mobilityLevel(1)
                .eatingLevel(1)
                .toiletLevel(1)
                .communicationLevel(1)
                .ltciGrade(5)
                .build();
        
        healthAssessmentService.createAssessment(request2);

        mockMvc.perform(get("/api/health-assessments/statistics"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.totalAssessments").value(2))
                .andExpect(jsonPath("$.completeAssessments").value(2))
                .andExpect(jsonPath("$.careGradeDistribution").isArray())
                .andExpect(jsonPath("$.adlScoreDistribution").isArray());
    }

    @Test
    @DisplayName("케어 등급별 평가 조회 통합 테스트")
    @WithMockUser(roles = "COORDINATOR")
    void getAssessmentsByCareGrade_Integration_Success() throws Exception {
        healthAssessmentService.createAssessment(validCreateRequest);
        
        HealthAssessmentCreateRequest grade1Request = HealthAssessmentCreateRequest.builder()
                .memberId("test-member-002")
                .mobilityLevel(3)
                .eatingLevel(3)
                .toiletLevel(3)
                .communicationLevel(3)
                .ltciGrade(1)
                .careTargetStatus(3)
                .build();
        
        healthAssessmentService.createAssessment(grade1Request);

        mockMvc.perform(get("/api/health-assessments/care-grade")
                        .param("minGrade", "1")
                        .param("maxGrade", "3"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @DisplayName("특화 케어 대상자 조회 통합 테스트")
    @WithMockUser(roles = "COORDINATOR")
    void getSpecializedCareTargets_Integration_Success() throws Exception {
        HealthAssessmentCreateRequest hospiceRequest = HealthAssessmentCreateRequest.builder()
                .memberId("hospice-patient")
                .mobilityLevel(3)
                .eatingLevel(3)
                .toiletLevel(3)
                .communicationLevel(3)
                .careTargetStatus(1)
                .mealType(3)
                .diseaseTypes("말기암")
                .build();
        
        healthAssessmentService.createAssessment(hospiceRequest);

        mockMvc.perform(get("/api/health-assessments/hospice-care"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].memberId").value("hospice-patient"))
                .andExpect(jsonPath("$[0].careTargetStatus").value(1));
    }

    @Test
    @DisplayName("치매 전문 케어 대상자 조회 통합 테스트")
    @WithMockUser(roles = "COORDINATOR")
    void getDementiaCareTargets_Integration_Success() throws Exception {
        HealthAssessmentCreateRequest dementiaRequest = HealthAssessmentCreateRequest.builder()
                .memberId("dementia-patient")
                .mobilityLevel(2)
                .eatingLevel(2)
                .toiletLevel(2)
                .communicationLevel(3)
                .ltciGrade(6)
                .diseaseTypes("치매")
                .build();
        
        healthAssessmentService.createAssessment(dementiaRequest);

        mockMvc.perform(get("/api/health-assessments/dementia-care"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].memberId").value("dementia-patient"))
                .andExpect(jsonPath("$[0].ltciGrade").value(6));
    }

    @Test
    @DisplayName("ADL 점수 자동 계산 검증")
    @WithMockUser(roles = "USER_DOMESTIC")
    void adlScoreCalculation_Integration_Test() throws Exception {
        HealthAssessmentCreateRequest request = HealthAssessmentCreateRequest.builder()
                .memberId("adl-test-member")
                .mobilityLevel(2)
                .eatingLevel(1)
                .toiletLevel(3)
                .communicationLevel(2)
                .build();

        mockMvc.perform(post("/api/health-assessments")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.adlScore").value(180))
                .andExpect(jsonPath("$.overallCareGrade").exists());
    }

    @Test
    @DisplayName("케어 등급 계산 로직 검증")
    @WithMockUser(roles = "USER_DOMESTIC")
    void careGradeCalculation_Integration_Test() throws Exception {
        HealthAssessmentCreateRequest severeRequest = HealthAssessmentCreateRequest.builder()
                .memberId("severe-patient")
                .mobilityLevel(3)
                .eatingLevel(3)
                .toiletLevel(3)
                .communicationLevel(3)
                .ltciGrade(1)
                .careTargetStatus(3)
                .mealType(3)
                .build();

        mockMvc.perform(post("/api/health-assessments")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(severeRequest)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.overallCareGrade").value("1등급 (최중증 - 중증지표)"));
    }

    @Test
    @DisplayName("권한별 접근 제어 테스트")
    @WithMockUser(roles = "USER_DOMESTIC")
    void accessControl_Integration_Test() throws Exception {
        mockMvc.perform(get("/api/health-assessments/statistics"))
                .andDo(print())
                .andExpect(status().isForbidden());
    }

    private void setupTestData() {
        validCreateRequest = HealthAssessmentCreateRequest.builder()
                .memberId("test-member-001")
                .gender("M")
                .birthYear(1950)
                .mobilityLevel(2)
                .eatingLevel(2)
                .toiletLevel(3)
                .communicationLevel(2)
                .ltciGrade(3)
                .careTargetStatus(4)
                .mealType(1)
                .diseaseTypes("고혈압, 당뇨")
                .build();

        validUpdateRequest = HealthAssessmentUpdateRequest.builder()
                .mobilityLevel(1)
                .eatingLevel(1)
                .toiletLevel(2)
                .communicationLevel(1)
                .ltciGrade(4)
                .careTargetStatus(4)
                .mealType(1)
                .diseaseTypes("고혈압")
                .build();
    }
} 