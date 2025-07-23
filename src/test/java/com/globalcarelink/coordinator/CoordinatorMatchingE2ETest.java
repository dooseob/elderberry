package com.globalcarelink.coordinator;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.globalcarelink.auth.Member;
import com.globalcarelink.auth.MemberRepository;
import com.globalcarelink.auth.MemberRole;
import com.globalcarelink.health.HealthAssessment;
import com.globalcarelink.health.HealthAssessmentRepository;
import com.globalcarelink.profile.DomesticProfile;
import com.globalcarelink.profile.DomesticProfileRepository;
import com.globalcarelink.profile.OverseasProfile;
import com.globalcarelink.profile.OverseasProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 코디네이터 매칭 E2E 테스트
 * - 전체 매칭 프로세스 검증
 * - 실제 데이터베이스 연동
 * - 복잡한 비즈니스 로직 테스트
 * - 성능 및 동시성 테스트
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
@DisplayName("코디네이터 매칭 E2E 테스트")
class CoordinatorMatchingE2ETest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private DomesticProfileRepository domesticProfileRepository;

    @Autowired
    private OverseasProfileRepository overseasProfileRepository;

    @Autowired
    private HealthAssessmentRepository healthAssessmentRepository;

    @Autowired
    private CoordinatorLanguageSkillRepository languageSkillRepository;

    @Autowired
    private OptimizedCoordinatorMatchingService matchingService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Member domesticMember;
    private Member overseasMember;
    private Member coordinatorMember1;
    private Member coordinatorMember2;
    private DomesticProfile domesticProfile;
    private OverseasProfile overseasProfile;
    private HealthAssessment healthAssessment;

    @BeforeEach
    void setUp() {
        setupTestMembers();
        setupTestProfiles();
        setupTestHealthAssessment();
        setupTestCoordinators();
    }

    @Test
    @DisplayName("국내 환자-코디네이터 매칭 전체 플로우 테스트")
    @Transactional
    void domesticPatientCoordinatorMatching_FullFlow() throws Exception {
        // Given - 국내 환자 프로필이 이미 설정됨

        // When - 매칭 요청
        mockMvc.perform(post("/api/coordinator-matching/domestic/{profileId}", domesticProfile.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.matches").isArray())
                .andExpect(jsonPath("$.matches").isNotEmpty())
                .andExpect(jsonPath("$.matches[0].coordinatorId").exists())
                .andExpect(jsonPath("$.matches[0].matchScore").exists())
                .andExpect(jsonPath("$.matches[0].matchReasons").isArray())
                .andExpect(jsonPath("$.totalMatches").value(2)); // 설정된 코디네이터 2명

        // Then - 매칭 결과 상세 검증
        mockMvc.perform(get("/api/coordinator-matching/domestic/{profileId}/details", domesticProfile.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profileInfo.name").value(domesticProfile.getName()))
                .andExpect(jsonPath("$.profileInfo.careLocation").value(domesticProfile.getCareLocation()))
                .andExpect(jsonPath("$.matches[0].coordinator.name").exists())
                .andExpect(jsonPath("$.matches[0].coordinator.specialties").isArray())
                .andExpect(jsonPath("$.matches[0].matchDetails.languageMatch").exists())
                .andExpect(jsonPath("$.matches[0].matchDetails.locationMatch").exists())
                .andExpect(jsonPath("$.matches[0].matchDetails.experienceMatch").exists());
    }

    @Test
    @DisplayName("해외 환자-코디네이터 매칭 전체 플로우 테스트")
    @Transactional
    void overseasPatientCoordinatorMatching_FullFlow() throws Exception {
        // Given - 해외 환자 프로필이 이미 설정됨

        // When - 매칭 요청
        mockMvc.perform(post("/api/coordinator-matching/overseas/{profileId}", overseasProfile.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.matches").isArray())
                .andExpect(jsonPath("$.matches").isNotEmpty())
                .andExpect(jsonPath("$.matches[0].coordinatorId").exists())
                .andExpect(jsonPath("$.matches[0].matchScore").exists())
                .andExpect(jsonPath("$.totalMatches").value(2));

        // Then - 해외 환자 특화 매칭 정보 검증
        mockMvc.perform(get("/api/coordinator-matching/overseas/{profileId}/details", overseasProfile.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profileInfo.name").value(overseasProfile.getName()))
                .andExpect(jsonPath("$.profileInfo.currentCountry").value(overseasProfile.getCurrentCountry()))
                .andExpect(jsonPath("$.profileInfo.desiredCountry").value(overseasProfile.getDesiredCountry()))
                .andExpect(jsonPath("$.matches[0].matchDetails.languageMatch").exists())
                .andExpect(jsonPath("$.matches[0].matchDetails.countryExperience").exists())
                .andExpect(jsonPath("$.matches[0].matchDetails.visaSupport").exists());
    }

    @Test
    @DisplayName("건강 상태 기반 매칭 우선순위 테스트")
    @Transactional
    void healthBasedMatchingPriority() throws Exception {
        // Given - 중증 건강 상태 설정
        HealthAssessment severeAssessment = HealthAssessment.builder()
                .memberId(domesticMember.getId())
                .birthYear(1940) // 고령
                .adlEating(3) // 완전 도움 필요
                .adlToilet(3)
                .adlMobility(3)
                .adlCommunication(2)
                .ltciGrade(1) // 최중증
                .hasChronicDisease(true)
                .chronicDiseases(List.of("치매", "당뇨병", "고혈압"))
                .hasCognitiveDifficulty(true)
                .additionalInfo("24시간 돌봄 필요")
                .createdAt(LocalDateTime.now())
                .build();
        healthAssessmentRepository.save(severeAssessment);

        // When - 매칭 요청
        mockMvc.perform(post("/api/coordinator-matching/domestic/{profileId}", domesticProfile.getId())
                        .param("considerHealthStatus", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.matches[0].matchScore").exists())
                .andExpect(jsonPath("$.matches[0].matchReasons").isArray())
                .andExpect(jsonPath("$.healthConsiderations.careLevel").value("HIGH"))
                .andExpect(jsonPath("$.healthConsiderations.specialNeeds").isArray())
                .andExpect(jsonPath("$.healthConsiderations.specialNeeds").isNotEmpty());

        // Then - 중증 환자에 특화된 코디네이터가 우선 매칭되는지 확인
        mockMvc.perform(get("/api/coordinator-matching/domestic/{profileId}/health-priority", domesticProfile.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.priorityFactors.dementiaCare").value(true))
                .andExpect(jsonPath("$.priorityFactors.chronicDiseaseManagement").value(true))
                .andExpect(jsonPath("$.priorityFactors.intensiveCareExperience").value(true));
    }

    @Test
    @DisplayName("언어 매칭 정확도 테스트")
    @Transactional
    void languageMatchingAccuracy() throws Exception {
        // Given - 특정 언어 요구사항이 있는 프로필 생성
        OverseasProfile multilingualProfile = OverseasProfile.builder()
                .memberId(overseasMember.getId())
                .name("다국어 환자")
                .birthYear(1960)
                .gender("여성")
                .currentCountry("독일")
                .desiredCountry("한국")
                .preferredLanguages(Set.of("독일어", "영어", "한국어"))
                .hasVisaIssues(true)
                .medicalHistory("심장 질환")
                .emergencyContact("독일 응급연락처")
                .insuranceInfo("독일 보험")
                .createdAt(LocalDateTime.now())
                .build();
        overseasProfileRepository.save(multilingualProfile);

        // When - 언어 중심 매칭 요청
        mockMvc.perform(post("/api/coordinator-matching/overseas/{profileId}", multilingualProfile.getId())
                        .param("prioritizeLanguage", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.matches").isArray())
                .andExpect(jsonPath("$.languageMatchSummary.requestedLanguages").isArray())
                .andExpect(jsonPath("$.languageMatchSummary.matchedLanguages").isArray());

        // Then - 언어 매칭 상세 정보 확인
        mockMvc.perform(get("/api/coordinator-matching/language-analysis/{profileId}", multilingualProfile.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.languageRequirements.primary").exists())
                .andExpect(jsonPath("$.languageRequirements.secondary").exists())
                .andExpect(jsonPath("$.coordinatorLanguageCapabilities").isArray())
                .andExpect(jsonPath("$.matchQuality.overallScore").exists());
    }

    @Test
    @DisplayName("매칭 성능 및 응답시간 테스트")
    void matchingPerformanceTest() throws Exception {
        // Given - 대량의 테스트 데이터 생성
        createLargeTestDataset();

        long startTime = System.currentTimeMillis();

        // When - 매칭 요청
        mockMvc.perform(post("/api/coordinator-matching/domestic/{profileId}", domesticProfile.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.matches").isArray())
                .andExpect(jsonPath("$.processingTime").exists());

        long endTime = System.currentTimeMillis();
        long responseTime = endTime - startTime;

        // Then - 응답시간이 3초 이내인지 확인
        assertThat(responseTime).isLessThan(3000);

        // 매칭 품질 확인
        mockMvc.perform(get("/api/coordinator-matching/performance-metrics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.averageMatchingTime").exists())
                .andExpect(jsonPath("$.cacheHitRate").exists())
                .andExpect(jsonPath("$.totalMatchesProcessed").exists());
    }

    @Test
    @DisplayName("동시 매칭 요청 처리 테스트")
    void concurrentMatchingRequests() throws Exception {
        // Given
        int numberOfConcurrentRequests = 10;
        List<Thread> threads = new ArrayList<>();
        List<Exception> exceptions = new ArrayList<>();
        AtomicInteger successCount = new AtomicInteger(0);

        // When - 동시에 여러 매칭 요청 실행
        for (int i = 0; i < numberOfConcurrentRequests; i++) {
            Thread thread = new Thread(() -> {
                try {
                    mockMvc.perform(post("/api/coordinator-matching/domestic/{profileId}", domesticProfile.getId()))
                            .andExpect(status().isOk())
                            .andExpect(jsonPath("$.matches").isArray());
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    synchronized (exceptions) {
                        exceptions.add(e);
                    }
                }
            });
            threads.add(thread);
            thread.start();
        }

        // 모든 스레드 완료 대기
        for (Thread thread : threads) {
            thread.join();
        }

        // Then
        assertThat(exceptions).isEmpty();
        assertThat(successCount.get()).isEqualTo(numberOfConcurrentRequests);
    }

    @Test
    @DisplayName("매칭 결과 캐싱 동작 테스트")
    void matchingResultCaching() throws Exception {
        // Given
        Long profileId = domesticProfile.getId();

        // When - 첫 번째 매칭 요청 (캐시 미스)
        long firstRequestStart = System.currentTimeMillis();
        mockMvc.perform(post("/api/coordinator-matching/domestic/{profileId}", profileId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.matches").isArray());
        long firstRequestTime = System.currentTimeMillis() - firstRequestStart;

        // When - 두 번째 매칭 요청 (캐시 히트)
        long secondRequestStart = System.currentTimeMillis();
        mockMvc.perform(post("/api/coordinator-matching/domestic/{profileId}", profileId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.matches").isArray());
        long secondRequestTime = System.currentTimeMillis() - secondRequestStart;

        // Then - 두 번째 요청이 현저히 빨라야 함
        assertThat(secondRequestTime).isLessThan(firstRequestTime / 2);

        // 캐시 통계 확인
        mockMvc.perform(get("/api/coordinator-matching/cache-stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hitRate").exists())
                .andExpect(jsonPath("$.missCount").exists())
                .andExpect(jsonPath("$.hitCount").exists());
    }

    @Test
    @DisplayName("매칭 실패 시나리오 테스트")
    void matchingFailureScenarios() throws Exception {
        // Given - 매칭 불가능한 조건 설정
        DomesticProfile unmatchableProfile = DomesticProfile.builder()
                .memberId(domesticMember.getId())
                .name("매칭 불가 환자")
                .birthYear(1920) // 매우 고령
                .gender("기타")
                .careLocation("매우 외진 지역")
                .preferredLanguages(Set.of("라틴어")) // 지원하지 않는 언어
                .specialRequests("매우 특수한 요구사항")
                .emergencyContact("응급연락처")
                .familyContact("가족연락처")
                .createdAt(LocalDateTime.now())
                .build();
        domesticProfileRepository.save(unmatchableProfile);

        // When - 매칭 요청
        mockMvc.perform(post("/api/coordinator-matching/domestic/{profileId}", unmatchableProfile.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.matches").isArray())
                .andExpect(jsonPath("$.matches").isEmpty())
                .andExpect(jsonPath("$.noMatchReasons").isArray())
                .andExpect(jsonPath("$.noMatchReasons").isNotEmpty())
                .andExpect(jsonPath("$.recommendations").isArray());

        // Then - 대안 제안 확인
        mockMvc.perform(get("/api/coordinator-matching/alternatives/{profileId}", unmatchableProfile.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.alternatives").isArray())
                .andExpect(jsonPath("$.alternatives").isNotEmpty())
                .andExpect(jsonPath("$.alternatives[0].type").exists())
                .andExpect(jsonPath("$.alternatives[0].description").exists());
    }

    // ===== 헬퍼 메서드들 =====

    private void setupTestMembers() {
        domesticMember = Member.builder()
                .email("domestic@test.com")
                .password(passwordEncoder.encode("password123"))
                .name("국내 환자")
                .role(MemberRole.USER)
                .createdAt(LocalDateTime.now())
                .build();
        domesticMember = memberRepository.save(domesticMember);

        overseasMember = Member.builder()
                .email("overseas@test.com")
                .password(passwordEncoder.encode("password123"))
                .name("해외 환자")
                .role(MemberRole.USER)
                .createdAt(LocalDateTime.now())
                .build();
        overseasMember = memberRepository.save(overseasMember);

        coordinatorMember1 = Member.builder()
                .email("coordinator1@test.com")
                .password(passwordEncoder.encode("password123"))
                .name("코디네이터 1")
                .role(MemberRole.COORDINATOR)
                .createdAt(LocalDateTime.now())
                .build();
        coordinatorMember1 = memberRepository.save(coordinatorMember1);

        coordinatorMember2 = Member.builder()
                .email("coordinator2@test.com")
                .password(passwordEncoder.encode("password123"))
                .name("코디네이터 2")
                .role(MemberRole.COORDINATOR)
                .createdAt(LocalDateTime.now())
                .build();
        coordinatorMember2 = memberRepository.save(coordinatorMember2);
    }

    private void setupTestProfiles() {
        domesticProfile = DomesticProfile.builder()
                .memberId(domesticMember.getId())
                .name("김국내")
                .birthYear(1960)
                .gender("남성")
                .careLocation("서울시 강남구")
                .preferredLanguages(Set.of("한국어", "영어"))
                .specialRequests("당뇨 관리 필요")
                .emergencyContact("010-1234-5678")
                .familyContact("010-8765-4321")
                .createdAt(LocalDateTime.now())
                .build();
        domesticProfile = domesticProfileRepository.save(domesticProfile);

        overseasProfile = OverseasProfile.builder()
                .memberId(overseasMember.getId())
                .name("John Overseas")
                .birthYear(1965)
                .gender("남성")
                .currentCountry("미국")
                .desiredCountry("한국")
                .preferredLanguages(Set.of("영어", "한국어"))
                .hasVisaIssues(false)
                .medicalHistory("고혈압")
                .emergencyContact("US Emergency Contact")
                .insuranceInfo("US Insurance")
                .createdAt(LocalDateTime.now())
                .build();
        overseasProfile = overseasProfileRepository.save(overseasProfile);
    }

    private void setupTestHealthAssessment() {
        healthAssessment = HealthAssessment.builder()
                .memberId(domesticMember.getId())
                .birthYear(1960)
                .adlEating(2)
                .adlToilet(2)
                .adlMobility(2)
                .adlCommunication(1)
                .ltciGrade(3)
                .hasChronicDisease(true)
                .chronicDiseases(List.of("당뇨병"))
                .hasCognitiveDifficulty(false)
                .additionalInfo("정기적인 혈당 체크 필요")
                .createdAt(LocalDateTime.now())
                .build();
        healthAssessment = healthAssessmentRepository.save(healthAssessment);
    }

    private void setupTestCoordinators() {
        // 코디네이터 1 - 한국어, 영어 가능, 당뇨 전문
        CoordinatorLanguageSkill skill1 = CoordinatorLanguageSkill.builder()
                .coordinatorId(coordinatorMember1.getId())
                .language("한국어")
                .proficiencyLevel("NATIVE")
                .certificationInfo("모국어")
                .build();
        languageSkillRepository.save(skill1);

        CoordinatorLanguageSkill skill2 = CoordinatorLanguageSkill.builder()
                .coordinatorId(coordinatorMember1.getId())
                .language("영어")
                .proficiencyLevel("ADVANCED")
                .certificationInfo("TOEIC 950")
                .build();
        languageSkillRepository.save(skill2);

        // 코디네이터 2 - 한국어, 일본어 가능, 고혈압 전문
        CoordinatorLanguageSkill skill3 = CoordinatorLanguageSkill.builder()
                .coordinatorId(coordinatorMember2.getId())
                .language("한국어")
                .proficiencyLevel("NATIVE")
                .certificationInfo("모국어")
                .build();
        languageSkillRepository.save(skill3);

        CoordinatorLanguageSkill skill4 = CoordinatorLanguageSkill.builder()
                .coordinatorId(coordinatorMember2.getId())
                .language("일본어")
                .proficiencyLevel("INTERMEDIATE")
                .certificationInfo("JLPT N2")
                .build();
        languageSkillRepository.save(skill4);
    }

    private void createLargeTestDataset() {
        // 성능 테스트를 위한 대량 데이터 생성
        for (int i = 0; i < 100; i++) {
            Member coordinator = Member.builder()
                    .email("coord" + i + "@test.com")
                    .password(passwordEncoder.encode("password123"))
                    .name("코디네이터 " + i)
                    .role(MemberRole.COORDINATOR)
                    .createdAt(LocalDateTime.now())
                    .build();
            coordinator = memberRepository.save(coordinator);

            // 각 코디네이터에 대해 언어 스킬 추가
            CoordinatorLanguageSkill skill = CoordinatorLanguageSkill.builder()
                    .coordinatorId(coordinator.getId())
                    .language(i % 2 == 0 ? "한국어" : "영어")
                    .proficiencyLevel("ADVANCED")
                    .certificationInfo("테스트 인증 " + i)
                    .build();
            languageSkillRepository.save(skill);
        }
    }
} 