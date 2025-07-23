package com.globalcarelink.coordinator;

import com.globalcarelink.health.HealthAssessment;
import com.globalcarelink.health.HealthAssessmentRepository;
import com.globalcarelink.health.HealthAssessmentService;
import com.globalcarelink.health.dto.HealthAssessmentCreateRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("코디네이터 매칭 시스템 통합 테스트")
class CoordinatorMatchingServiceIntegrationTest {

    @Autowired
    private OptimizedCoordinatorMatchingService matchingService;

    @Autowired
    private CoordinatorCareSettingsRepository careSettingsRepository;

    @Autowired
    private CoordinatorLanguageSkillRepository languageSkillRepository;

    @Autowired
    private HealthAssessmentService healthAssessmentService;

    @Autowired
    private HealthAssessmentRepository healthAssessmentRepository;

    private HealthAssessment testAssessment;
    private CoordinatorCareSettings coordinator1;
    private CoordinatorCareSettings coordinator2;

    @BeforeEach
    void setUp() {
        setupTestData();
    }

    @Test
    @DisplayName("기본 매칭 테스트 - 케어 등급 기반")
    void findOptimalMatches_BasicMatching() {
        MatchingPreference preference = MatchingPreference.builder()
                .maxResults(10)
                .minCustomerSatisfaction(3.0)
                .build();

        List<CoordinatorMatch> matches = matchingService.findOptimalMatches(testAssessment, preference);

        assertThat(matches).isNotEmpty();
        assertThat(matches).hasSizeLessThanOrEqualTo(10);
        assertThat(matches.get(0).getMatchScore()).isGreaterThan(0.0);
        
        matches.forEach(match -> {
            assertThat(match.getCustomerSatisfaction()).isGreaterThanOrEqualTo(3.0);
            assertThat(match.getMatchReason()).isNotBlank();
        });
    }

    @Test
    @DisplayName("언어 매칭 테스트")
    void findOptimalMatches_LanguageMatching() {
        MatchingPreference preference = MatchingPreference.builder()
                .preferredLanguage("ko")
                .maxResults(5)
                .build();

        List<CoordinatorMatch> matches = matchingService.findOptimalMatches(testAssessment, preference);

        assertThat(matches).isNotEmpty();
        matches.forEach(match -> {
            boolean hasKorean = match.getLanguageSkills().stream()
                    .anyMatch(skill -> "ko".equals(skill.getLanguageCode()));
            assertThat(hasKorean).isTrue();
        });
    }

    @Test
    @DisplayName("업무량 최적화 테스트")
    void findOptimalMatches_WorkloadOptimization() {
        MatchingPreference preference = MatchingPreference.builder()
                .maxResults(20)
                .build();

        List<CoordinatorMatch> matches = matchingService.findOptimalMatches(testAssessment, preference);

        assertThat(matches).isNotEmpty();
        
        double previousWorkloadRatio = -1.0;
        for (CoordinatorMatch match : matches) {
            if (previousWorkloadRatio >= 0) {
                assertThat(match.getWorkloadRatio()).isLessThanOrEqualTo(1.0);
            }
            previousWorkloadRatio = match.getWorkloadRatio();
        }
    }

    @Test
    @DisplayName("전문 분야 매칭 테스트")
    void findOptimalMatches_SpecialtyMatching() {
        testAssessment.setLtciGrade(2);
        
        MatchingPreference preference = MatchingPreference.builder()
                .needsProfessionalConsultation(true)
                .maxResults(10)
                .build();

        List<CoordinatorMatch> matches = matchingService.findOptimalMatches(testAssessment, preference);

        assertThat(matches).isNotEmpty();
        matches.forEach(match -> {
            assertThat(match.getSpecialtyAreas()).isNotEmpty();
        });
    }

    @Test
    @DisplayName("주말 가용성 매칭 테스트")
    void findOptimalMatches_WeekendAvailability() {
        MatchingPreference preference = MatchingPreference.builder()
                .needsWeekendAvailability(true)
                .maxResults(10)
                .build();

        List<CoordinatorMatch> matches = matchingService.findOptimalMatches(testAssessment, preference);

        assertThat(matches).isNotEmpty();
        matches.forEach(match -> {
            assertThat(match.getAvailableWeekends()).isTrue();
        });
    }

    @Test
    @DisplayName("응급 대응 가능 매칭 테스트")
    void findOptimalMatches_EmergencyAvailability() {
        MatchingPreference preference = MatchingPreference.builder()
                .needsEmergencyAvailability(true)
                .maxResults(10)
                .build();

        List<CoordinatorMatch> matches = matchingService.findOptimalMatches(testAssessment, preference);

        assertThat(matches).isNotEmpty();
        matches.forEach(match -> {
            assertThat(match.getAvailableEmergency()).isTrue();
        });
    }

    @Test
    @DisplayName("지역 매칭 테스트")
    void findOptimalMatches_RegionalMatching() {
        MatchingPreference preference = MatchingPreference.builder()
                .preferredRegion("seoul")
                .maxResults(10)
                .build();

        List<CoordinatorMatch> matches = matchingService.findOptimalMatches(testAssessment, preference);

        assertThat(matches).isNotEmpty();
        matches.forEach(match -> {
            assertThat(match.getWorkingRegions()).contains("seoul");
        });
    }

    @Test
    @DisplayName("매칭 점수 정렬 테스트")
    void findOptimalMatches_ScoreOrdering() {
        MatchingPreference preference = MatchingPreference.builder()
                .maxResults(20)
                .build();

        List<CoordinatorMatch> matches = matchingService.findOptimalMatches(testAssessment, preference);

        assertThat(matches).isNotEmpty();
        
        for (int i = 0; i < matches.size() - 1; i++) {
            assertThat(matches.get(i).getMatchScore())
                    .isGreaterThanOrEqualTo(matches.get(i + 1).getMatchScore());
        }
    }

    @Test
    @DisplayName("빈 결과 처리 테스트")
    void findOptimalMatches_NoMatches() {
        MatchingPreference preference = MatchingPreference.builder()
                .minCustomerSatisfaction(5.0)
                .needsWeekendAvailability(true)
                .needsEmergencyAvailability(true)
                .maxResults(10)
                .build();

        List<CoordinatorMatch> matches = matchingService.findOptimalMatches(testAssessment, preference);

        assertThat(matches).isEmpty();
    }

    private void setupTestData() {
        createTestHealthAssessment();
        createTestCoordinators();
        createTestLanguageSkills();
    }

    private void createTestHealthAssessment() {
        HealthAssessmentCreateRequest request = HealthAssessmentCreateRequest.builder()
                .memberId("test-member-001")
                .birthYear(1950)
                .gender("M")
                .mobilityLevel(3)
                .eatingLevel(2)
                .toiletLevel(3)
                .communicationLevel(2)
                .careTargetStatus(2)
                .mealType(1)
                .diseaseTypes("고혈압, 당뇨")
                .notes("주간 돌봄 필요")
                .build();

        testAssessment = healthAssessmentService.createAssessment(request);
    }

    private void createTestCoordinators() {
        coordinator1 = CoordinatorCareSettings.builder()
                .coordinatorId("coordinator-001")
                .baseCareLevel(1)
                .maxCareLevel(3)
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

        coordinator2 = CoordinatorCareSettings.builder()
                .coordinatorId("coordinator-002")
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

        careSettingsRepository.save(coordinator1);
        careSettingsRepository.save(coordinator2);
    }

    private void createTestLanguageSkills() {
        CoordinatorLanguageSkill skill1 = CoordinatorLanguageSkill.builder()
                .coordinatorId("coordinator-001")
                .languageCode("ko")
                .languageName("한국어")
                .proficiencyLevel(CoordinatorLanguageSkill.LanguageProficiency.NATIVE)
                .certification("C2")
                .build();

        CoordinatorLanguageSkill skill2 = CoordinatorLanguageSkill.builder()
                .coordinatorId("coordinator-001")
                .languageCode("en")
                .languageName("영어")
                .proficiencyLevel(CoordinatorLanguageSkill.LanguageProficiency.BUSINESS)
                .certification("B2")
                .build();

        CoordinatorLanguageSkill skill3 = CoordinatorLanguageSkill.builder()
                .coordinatorId("coordinator-002")
                .languageCode("ko")
                .languageName("한국어")
                .proficiencyLevel(CoordinatorLanguageSkill.LanguageProficiency.NATIVE)
                .certification("C2")
                .build();

        languageSkillRepository.save(skill1);
        languageSkillRepository.save(skill2);
        languageSkillRepository.save(skill3);
    }
} 