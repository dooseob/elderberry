package com.globalcarelink.e2e;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.globalcarelink.coordinator.CoordinatorCareSettings;
import com.globalcarelink.coordinator.CoordinatorCareSettingsRepository;
import com.globalcarelink.coordinator.CoordinatorLanguageSkill;
import com.globalcarelink.coordinator.CoordinatorLanguageSkillRepository;
import com.globalcarelink.coordinator.MatchingPreference;
import com.globalcarelink.health.HealthAssessment;
import com.globalcarelink.health.HealthAssessmentRepository;
import com.globalcarelink.health.dto.HealthAssessmentCreateRequest;
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
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("건강 평가 → 코디네이터 매칭 E2E 테스트")
class HealthAssessmentToCoordinatorMatchingE2ETest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private HealthAssessmentRepository healthAssessmentRepository;

    @Autowired
    private CoordinatorCareSettingsRepository coordinatorCareSettingsRepository;

    @Autowired
    private CoordinatorLanguageSkillRepository coordinatorLanguageSkillRepository;

    @BeforeEach
    void setUp() {
        setupTestCoordinators();
    }

    @Test
    @DisplayName("완전한 E2E 플로우: 건강평가 생성 → 매칭 → 결과 확인")
    @WithMockUser(roles = "USER_DOMESTIC")
    void completeE2EFlow_HealthAssessmentToMatching() throws Exception {
        HealthAssessmentCreateRequest assessmentRequest = HealthAssessmentCreateRequest.builder()
                .memberId("e2e-test-member")
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

        MvcResult assessmentResult = mockMvc.perform(post("/api/health-assessments")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assessmentRequest)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.memberId").value("e2e-test-member"))
                .andExpect(jsonPath("$.adlScore").exists())
                .andExpect(jsonPath("$.overallCareGrade").exists())
                .andReturn();

        String assessmentJson = assessmentResult.getResponse().getContentAsString();
        HealthAssessment createdAssessment = objectMapper.readValue(assessmentJson, HealthAssessment.class);
        Long assessmentId = createdAssessment.getId();

        assertThat(assessmentId).isNotNull();
        assertThat(createdAssessment.getAdlScore()).isEqualTo(180);

        MatchingPreference matchingPreference = MatchingPreference.builder()
                .preferredLanguage("ko")
                .preferredRegion("seoul")
                .maxResults(10)
                .minCustomerSatisfaction(3.0)
                .needsWeekendAvailability(false)
                .needsEmergencyAvailability(false)
                .build();

        mockMvc.perform(post("/api/coordinator-matching/match")
                        .with(csrf())
                        .param("healthAssessmentId", assessmentId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(matchingPreference)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].coordinatorId").exists())
                .andExpect(jsonPath("$[0].matchScore").exists())
                .andExpect(jsonPath("$[0].matchReason").exists())
                .andExpect(jsonPath("$[0].experienceYears").exists())
                .andExpect(jsonPath("$[0].customerSatisfaction").exists())
                .andExpect(jsonPath("$[0].specialtyAreas").isArray())
                .andExpect(jsonPath("$[0].languageSkills").isArray())
                .andExpect(jsonPath("$[0].workingRegions").isArray());
    }

    @Test
    @DisplayName("중증 환자 E2E 플로우: 1등급 → 의료전문 코디네이터 매칭")
    @WithMockUser(roles = "USER_DOMESTIC") 
    void severePatientE2EFlow() throws Exception {
        HealthAssessmentCreateRequest severeRequest = HealthAssessmentCreateRequest.builder()
                .memberId("severe-patient")
                .gender("F")
                .birthYear(1940)
                .mobilityLevel(3)
                .eatingLevel(3)
                .toiletLevel(3)
                .communicationLevel(3)
                .ltciGrade(1)
                .careTargetStatus(3)
                .mealType(3)
                .diseaseTypes("뇌졸중, 치매")
                .build();

        MvcResult assessmentResult = mockMvc.perform(post("/api/health-assessments")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(severeRequest)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.overallCareGrade").value("1등급 (최중증 - 중증지표)"))
                .andReturn();

        String assessmentJson = assessmentResult.getResponse().getContentAsString();
        HealthAssessment createdAssessment = objectMapper.readValue(assessmentJson, HealthAssessment.class);
        Long assessmentId = createdAssessment.getId();

        MatchingPreference medicalPreference = MatchingPreference.builder()
                .needsProfessionalConsultation(true)
                .needsEmergencyAvailability(true)
                .maxResults(5)
                .minCustomerSatisfaction(4.0)
                .build();

        mockMvc.perform(post("/api/coordinator-matching/match")
                        .with(csrf())
                        .param("healthAssessmentId", assessmentId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(medicalPreference)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].availableEmergency").value(true))
                .andExpect(jsonPath("$[0].specialtyAreas").isArray())
                .andExpect(jsonPath("$[0].customerSatisfaction").value(4.2));
    }

    @Test
    @DisplayName("치매 환자 E2E 플로우: 6등급 → 치매전문 코디네이터 매칭")
    @WithMockUser(roles = "USER_OVERSEAS")
    void dementiaPatientE2EFlow() throws Exception {
        HealthAssessmentCreateRequest dementiaRequest = HealthAssessmentCreateRequest.builder()
                .memberId("dementia-patient")
                .gender("M")
                .birthYear(1935)
                .mobilityLevel(2)
                .eatingLevel(2)
                .toiletLevel(2)
                .communicationLevel(3)
                .ltciGrade(6)
                .careTargetStatus(4)
                .mealType(2)
                .diseaseTypes("알츠하이머")
                .build();

        MvcResult assessmentResult = mockMvc.perform(post("/api/health-assessments")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dementiaRequest)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.ltciGrade").value(6))
                .andReturn();

        String assessmentJson = assessmentResult.getResponse().getContentAsString();
        HealthAssessment createdAssessment = objectMapper.readValue(assessmentJson, HealthAssessment.class);
        Long assessmentId = createdAssessment.getId();

        MatchingPreference dementiaPreference = MatchingPreference.builder()
                .preferredLanguage("en")
                .countryCode("US")
                .maxResults(10)
                .minCustomerSatisfaction(3.5)
                .build();

        mockMvc.perform(post("/api/coordinator-matching/match")
                        .with(csrf())
                        .param("healthAssessmentId", assessmentId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dementiaPreference)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].languageSkills").isArray())
                .andExpect(jsonPath("$[0].specialtyAreas").isArray());
    }

    @Test
    @DisplayName("경증 환자 E2E 플로우: 5등급 → 일반 코디네이터 매칭")
    @WithMockUser(roles = "USER_DOMESTIC")
    void mildPatientE2EFlow() throws Exception {
        HealthAssessmentCreateRequest mildRequest = HealthAssessmentCreateRequest.builder()
                .memberId("mild-patient")
                .gender("F")
                .birthYear(1960)
                .mobilityLevel(1)
                .eatingLevel(1)
                .toiletLevel(1)
                .communicationLevel(1)
                .ltciGrade(5)
                .careTargetStatus(4)
                .mealType(1)
                .diseaseTypes("고혈압")
                .build();

        MvcResult assessmentResult = mockMvc.perform(post("/api/health-assessments")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mildRequest)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.adlScore").value(100))
                .andReturn();

        String assessmentJson = assessmentResult.getResponse().getContentAsString();
        HealthAssessment createdAssessment = objectMapper.readValue(assessmentJson, HealthAssessment.class);
        Long assessmentId = createdAssessment.getId();

        MatchingPreference generalPreference = MatchingPreference.builder()
                .preferredRegion("seoul")
                .maxResults(15)
                .minCustomerSatisfaction(3.0)
                .needsWeekendAvailability(true)
                .build();

        mockMvc.perform(post("/api/coordinator-matching/match")
                        .with(csrf())
                        .param("healthAssessmentId", assessmentId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(generalPreference)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpected(jsonPath("$[0].availableWeekends").value(true))
                .andExpect(jsonPath("$[0].workingRegions").isArray())
                .andExpected(jsonPath("$[0].workloadRatio").exists());
    }

    @Test
    @DisplayName("다중 평가 업데이트 → 재매칭 E2E 플로우")
    @WithMockUser(roles = "USER_DOMESTIC")
    void multipleAssessmentUpdateE2EFlow() throws Exception {
        HealthAssessmentCreateRequest initialRequest = HealthAssessmentCreateRequest.builder()
                .memberId("update-test-member")
                .mobilityLevel(1)
                .eatingLevel(1)
                .toiletLevel(1)
                .communicationLevel(1)
                .ltciGrade(5)
                .build();

        MvcResult initialResult = mockMvc.perform(post("/api/health-assessments")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(initialRequest)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andReturn();

        HealthAssessment initialAssessment = objectMapper.readValue(
                initialResult.getResponse().getContentAsString(), HealthAssessment.class);

        MatchingPreference initialPreference = MatchingPreference.builder()
                .maxResults(10)
                .build();

        MvcResult initialMatchingResult = mockMvc.perform(post("/api/coordinator-matching/match")
                        .with(csrf())
                        .param("healthAssessmentId", initialAssessment.getId().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(initialPreference)))
                .andDo(print())
                .andExpected(status().isOk())
                .andReturn();

        String initialMatchingJson = initialMatchingResult.getResponse().getContentAsString();
        assertThat(initialMatchingJson).contains("coordinatorId");

        com.globalcarelink.health.dto.HealthAssessmentUpdateRequest updateRequest = 
                com.globalcarelink.health.dto.HealthAssessmentUpdateRequest.builder()
                        .mobilityLevel(3)
                        .eatingLevel(3)
                        .toiletLevel(3)
                        .communicationLevel(3)
                        .ltciGrade(1)
                        .careTargetStatus(3)
                        .build();

        mockMvc.perform(put("/api/health-assessments/{assessmentId}", initialAssessment.getId())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpected(jsonPath("$.adlScore").value(300));

        MatchingPreference updatedPreference = MatchingPreference.builder()
                .needsProfessionalConsultation(true)
                .maxResults(5)
                .minCustomerSatisfaction(4.0)
                .build();

        mockMvc.perform(post("/api/coordinator-matching/match")
                        .with(csrf())
                        .param("healthAssessmentId", initialAssessment.getId().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedPreference)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpected(jsonPath("$[0].specialtyAreas").isArray());
    }

    @Test
    @DisplayName("매칭 통계 조회 E2E 플로우")
    @WithMockUser(roles = "ADMIN")
    void matchingStatisticsE2EFlow() throws Exception {
        HealthAssessmentCreateRequest request1 = HealthAssessmentCreateRequest.builder()
                .memberId("stats-member-1")
                .mobilityLevel(2)
                .eatingLevel(2)
                .toiletLevel(2)
                .communicationLevel(2)
                .ltciGrade(3)
                .build();

        HealthAssessmentCreateRequest request2 = HealthAssessmentCreateRequest.builder()
                .memberId("stats-member-2")
                .mobilityLevel(1)
                .eatingLevel(1)
                .toiletLevel(1)
                .communicationLevel(1)
                .ltciGrade(5)
                .build();

        mockMvc.perform(post("/api/health-assessments")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/health-assessments")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/health-assessments/statistics"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAssessments").value(2))
                .andExpected(jsonPath("$.completeAssessments").value(2))
                .andExpect(jsonPath("$.careGradeDistribution").isArray());

        mockMvc.perform(get("/api/coordinator-matching/statistics"))
                .andDo(print())
                .andExpected(status().isOk())
                .andExpect(jsonPath("$.totalActiveCoordinators").exists())
                .andExpect(jsonPath("$.averageCustomerSatisfaction").exists())
                .andExpected(jsonPath("$.availableCoordinators").exists());
    }

    private void setupTestCoordinators() {
        CoordinatorCareSettings coordinator1 = CoordinatorCareSettings.builder()
                .coordinatorId("e2e-coordinator-001")
                .baseCareLevel(1)
                .maxCareLevel(5)
                .experienceYears(5)
                .successfulCases(120)
                .customerSatisfaction(4.2)
                .maxSimultaneousCases(8)
                .specialtyAreas(Set.of("medical", "elderly_care"))
                .workingRegions(Set.of("seoul", "incheon"))
                .availableWeekends(true)
                .availableEmergency(true)
                .isActive(true)
                .build();

        CoordinatorCareSettings coordinator2 = CoordinatorCareSettings.builder()
                .coordinatorId("e2e-coordinator-002")
                .baseCareLevel(2)
                .maxCareLevel(5)
                .experienceYears(3)
                .successfulCases(80)
                .customerSatisfaction(3.8)
                .maxSimultaneousCases(6)
                .specialtyAreas(Set.of("rehabilitation"))
                .workingRegions(Set.of("seoul", "gyeonggi"))
                .availableWeekends(false)
                .availableEmergency(false)
                .isActive(true)
                .build();

        coordinatorCareSettingsRepository.save(coordinator1);
        coordinatorCareSettingsRepository.save(coordinator2);

        CoordinatorLanguageSkill skill1 = CoordinatorLanguageSkill.builder()
                .coordinatorId("e2e-coordinator-001")
                .languageCode("ko")
                .languageName("한국어")
                .proficiencyLevel(CoordinatorLanguageSkill.LanguageProficiency.NATIVE)
                .certification("C2")
                .build();

        CoordinatorLanguageSkill skill2 = CoordinatorLanguageSkill.builder()
                .coordinatorId("e2e-coordinator-001")
                .languageCode("en")
                .languageName("영어")
                .proficiencyLevel(CoordinatorLanguageSkill.LanguageProficiency.BUSINESS)
                .certification("B2")
                .build();

        CoordinatorLanguageSkill skill3 = CoordinatorLanguageSkill.builder()
                .coordinatorId("e2e-coordinator-002")
                .languageCode("ko")
                .languageName("한국어")
                .proficiencyLevel(CoordinatorLanguageSkill.LanguageProficiency.NATIVE)
                .certification("C2")
                .build();

        coordinatorLanguageSkillRepository.save(skill1);
        coordinatorLanguageSkillRepository.save(skill2);
        coordinatorLanguageSkillRepository.save(skill3);
    }
} 