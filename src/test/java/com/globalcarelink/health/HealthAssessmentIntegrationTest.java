package com.globalcarelink.health;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.globalcarelink.auth.Member;
import com.globalcarelink.auth.MemberRepository;
import com.globalcarelink.auth.MemberRole;
import com.globalcarelink.health.dto.HealthAssessmentCreateRequest;
import com.globalcarelink.health.dto.HealthAssessmentStatistics;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.CacheManager;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 건강 평가 통합 테스트
 * - 전체 애플리케이션 컨텍스트 로드
 * - 실제 데이터베이스 연동
 * - 캐시 동작 검증
 * - API 엔드포인트 통합 테스트
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
@DisplayName("건강 평가 통합 테스트")
class HealthAssessmentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private HealthAssessmentRepository healthAssessmentRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private HealthAssessmentService healthAssessmentService;

    @Autowired
    private HealthAssessmentStatsService statsService;

    @Autowired
    private CacheManager cacheManager;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Member testMember;
    private HealthAssessment testAssessment;

    @BeforeEach
    void setUp() {
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
                .birthYear(1950)
                .adlEating(2)
                .adlToilet(2)
                .adlMobility(3)
                .adlCommunication(1)
                .ltciGrade(3)
                .hasChronicDisease(true)
                .chronicDiseases(List.of("당뇨병", "고혈압"))
                .hasCognitiveDifficulty(false)
                .additionalInfo("특별한 요구사항 없음")
                .createdAt(LocalDateTime.now())
                .build();
        testAssessment = healthAssessmentRepository.save(testAssessment);

        // 캐시 초기화
        cacheManager.getCacheNames().forEach(cacheName -> {
            var cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.clear();
            }
        });
    }

    @Test
    @DisplayName("건강 평가 생성 API 통합 테스트")
    @Transactional
    void createHealthAssessment_Integration() throws Exception {
        // Given
        HealthAssessmentCreateRequest request = HealthAssessmentCreateRequest.builder()
                .memberId(testMember.getId())
                .birthYear(1960)
                .adlEating(1)
                .adlToilet(1)
                .adlMobility(2)
                .adlCommunication(1)
                .ltciGrade(4)
                .hasChronicDisease(false)
                .chronicDiseases(List.of())
                .hasCognitiveDifficulty(false)
                .additionalInfo("건강한 상태")
                .build();

        // When & Then
        mockMvc.perform(post("/api/health-assessments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.memberId").value(testMember.getId()))
                .andExpect(jsonPath("$.birthYear").value(1960))
                .andExpect(jsonPath("$.adlEating").value(1))
                .andExpect(jsonPath("$.careGrade").exists());

        // 데이터베이스 확인
        List<HealthAssessment> assessments = healthAssessmentRepository.findByMemberId(testMember.getId());
        assertThat(assessments).hasSize(2); // 기존 1개 + 새로 생성 1개
        
        HealthAssessment newAssessment = assessments.stream()
                .filter(a -> a.getBirthYear() == 1960)
                .findFirst()
                .orElseThrow();
        
        assertThat(newAssessment.getAdlEating()).isEqualTo(1);
        assertThat(newAssessment.getCareGrade()).isNotNull();
    }

    @Test
    @DisplayName("건강 평가 조회 API 및 캐시 동작 테스트")
    void getHealthAssessment_WithCache() throws Exception {
        // Given
        Long assessmentId = testAssessment.getId();

        // When - 첫 번째 조회 (캐시 미스)
        mockMvc.perform(get("/api/health-assessments/{id}", assessmentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(assessmentId))
                .andExpect(jsonPath("$.memberId").value(testMember.getId()));

        // 캐시에 저장되었는지 확인
        var cache = cacheManager.getCache("healthAssessments");
        assertThat(cache).isNotNull();
        assertThat(cache.get(assessmentId)).isNotNull();

        // When - 두 번째 조회 (캐시 히트)
        mockMvc.perform(get("/api/health-assessments/{id}", assessmentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(assessmentId));
    }

    @Test
    @DisplayName("건강 평가 목록 조회 및 페이징 테스트")
    void getHealthAssessments_WithPaging() throws Exception {
        // Given - 추가 테스트 데이터 생성
        for (int i = 0; i < 5; i++) {
            HealthAssessment assessment = HealthAssessment.builder()
                    .memberId(testMember.getId())
                    .birthYear(1950 + i)
                    .adlEating(1 + (i % 3))
                    .adlToilet(1 + (i % 3))
                    .adlMobility(1 + (i % 3))
                    .adlCommunication(1 + (i % 3))
                    .ltciGrade(1 + (i % 6))
                    .hasChronicDisease(i % 2 == 0)
                    .chronicDiseases(i % 2 == 0 ? List.of("질병" + i) : List.of())
                    .hasCognitiveDifficulty(i % 3 == 0)
                    .additionalInfo("테스트 평가 " + i)
                    .createdAt(LocalDateTime.now().minusDays(i))
                    .build();
            healthAssessmentRepository.save(assessment);
        }

        // When & Then - 첫 번째 페이지
        mockMvc.perform(get("/api/health-assessments")
                        .param("page", "0")
                        .param("size", "3")
                        .param("sort", "createdAt,desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(3))
                .andExpect(jsonPath("$.totalElements").value(6)) // 기존 1개 + 새로 생성 5개
                .andExpect(jsonPath("$.totalPages").value(2))
                .andExpect(jsonPath("$.first").value(true))
                .andExpect(jsonPath("$.last").value(false));

        // When & Then - 두 번째 페이지
        mockMvc.perform(get("/api/health-assessments")
                        .param("page", "1")
                        .param("size", "3")
                        .param("sort", "createdAt,desc"))
                .andExpected(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(3))
                .andExpect(jsonPath("$.first").value(false))
                .andExpect(jsonPath("$.last").value(true));
    }

    @Test
    @DisplayName("건강 평가 통계 생성 및 캐시 테스트")
    @Transactional
    void generateStatistics_WithCache() throws Exception {
        // Given - 통계를 위한 추가 데이터 생성
        createTestDataForStatistics();

        // When - 통계 조회 (첫 번째 - 캐시 미스)
        mockMvc.perform(get("/api/health-assessments/statistics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAssessments").value(6)) // 기존 1개 + 추가 5개
                .andExpect(jsonPath("$.averageAge").exists())
                .andExpect(jsonPath("$.gradeDistribution").exists())
                .andExpect(jsonPath("$.diseaseStatistics").exists());

        // 캐시에 저장되었는지 확인
        var cache = cacheManager.getCache("healthAssessmentStats");
        assertThat(cache).isNotNull();
        assertThat(cache.get("all")).isNotNull();

        // When - 통계 재조회 (캐시 히트)
        mockMvc.perform(get("/api/health-assessments/statistics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAssessments").value(6));
    }

    @Test
    @DisplayName("건강 평가 업데이트 및 캐시 무효화 테스트")
    @Transactional
    void updateHealthAssessment_CacheEviction() throws Exception {
        // Given
        Long assessmentId = testAssessment.getId();
        
        // 먼저 조회하여 캐시에 저장
        mockMvc.perform(get("/api/health-assessments/{id}", assessmentId))
                .andExpect(status().isOk());

        // 캐시 확인
        var cache = cacheManager.getCache("healthAssessments");
        assertThat(cache.get(assessmentId)).isNotNull();

        // When - 업데이트 요청
        HealthAssessmentCreateRequest updateRequest = HealthAssessmentCreateRequest.builder()
                .memberId(testMember.getId())
                .birthYear(1955) // 변경
                .adlEating(1) // 변경
                .adlToilet(1) // 변경
                .adlMobility(2)
                .adlCommunication(1)
                .ltciGrade(4) // 변경
                .hasChronicDisease(false) // 변경
                .chronicDiseases(List.of())
                .hasCognitiveDifficulty(false)
                .additionalInfo("업데이트된 정보")
                .build();

        mockMvc.perform(put("/api/health-assessments/{id}", assessmentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.birthYear").value(1955))
                .andExpect(jsonPath("$.adlEating").value(1));

        // Then - 캐시가 무효화되었는지 확인
        // 실제로는 캐시 무효화 정책에 따라 다를 수 있음
        // 여기서는 업데이트 후 다시 조회했을 때 새로운 값이 반환되는지 확인
        mockMvc.perform(get("/api/health-assessments/{id}", assessmentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.birthYear").value(1955))
                .andExpect(jsonPath("$.adlEating").value(1));
    }

    @Test
    @DisplayName("건강 평가 삭제 테스트")
    @Transactional
    void deleteHealthAssessment() throws Exception {
        // Given
        Long assessmentId = testAssessment.getId();

        // When
        mockMvc.perform(delete("/api/health-assessments/{id}", assessmentId))
                .andExpect(status().isNoContent());

        // Then - 데이터베이스에서 삭제되었는지 확인
        mockMvc.perform(get("/api/health-assessments/{id}", assessmentId))
                .andExpect(status().isNotFound());

        assertThat(healthAssessmentRepository.findById(assessmentId)).isEmpty();
    }

    @Test
    @DisplayName("비동기 통계 생성 테스트")
    void generateStatisticsAsync() throws Exception {
        // Given
        createTestDataForStatistics();

        // When - 비동기 통계 생성 호출
        HealthAssessmentStatistics stats = statsService.generateStatisticsAsync().get();

        // Then
        assertThat(stats).isNotNull();
        assertThat(stats.getTotalAssessments()).isEqualTo(6);
        assertThat(stats.getAverageAge()).isGreaterThan(0);
        assertThat(stats.getGradeDistribution()).isNotEmpty();
        assertThat(stats.getDiseaseStatistics()).isNotEmpty();
    }

    @Test
    @DisplayName("동시성 테스트 - 여러 사용자가 동시에 건강 평가 생성")
    void concurrentHealthAssessmentCreation() throws Exception {
        // Given
        int numberOfThreads = 5;
        int assessmentsPerThread = 3;

        // When - 동시에 여러 건강 평가 생성
        List<Thread> threads = new ArrayList<>();
        List<Exception> exceptions = new ArrayList<>();

        for (int i = 0; i < numberOfThreads; i++) {
            final int threadIndex = i;
            Thread thread = new Thread(() -> {
                try {
                    for (int j = 0; j < assessmentsPerThread; j++) {
                        HealthAssessmentCreateRequest request = HealthAssessmentCreateRequest.builder()
                                .memberId(testMember.getId())
                                .birthYear(1950 + threadIndex + j)
                                .adlEating(1 + (j % 3))
                                .adlToilet(1 + (j % 3))
                                .adlMobility(1 + (j % 3))
                                .adlCommunication(1 + (j % 3))
                                .ltciGrade(1 + (j % 6))
                                .hasChronicDisease(j % 2 == 0)
                                .chronicDiseases(j % 2 == 0 ? List.of("질병" + j) : List.of())
                                .hasCognitiveDifficulty(j % 3 == 0)
                                .additionalInfo("동시성 테스트 " + threadIndex + "-" + j)
                                .build();

                        healthAssessmentService.createHealthAssessment(request);
                    }
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
        
        List<HealthAssessment> allAssessments = healthAssessmentRepository.findByMemberId(testMember.getId());
        assertThat(allAssessments).hasSize(1 + (numberOfThreads * assessmentsPerThread)); // 기존 1개 + 새로 생성된 것들
    }

    private void createTestDataForStatistics() {
        for (int i = 0; i < 5; i++) {
            HealthAssessment assessment = HealthAssessment.builder()
                    .memberId(testMember.getId())
                    .birthYear(1940 + (i * 5))
                    .adlEating(1 + (i % 3))
                    .adlToilet(1 + (i % 3))
                    .adlMobility(1 + (i % 3))
                    .adlCommunication(1 + (i % 3))
                    .ltciGrade(1 + (i % 6))
                    .hasChronicDisease(i % 2 == 0)
                    .chronicDiseases(i % 2 == 0 ? List.of("당뇨병", "고혈압") : List.of())
                    .hasCognitiveDifficulty(i % 3 == 0)
                    .additionalInfo("통계용 테스트 데이터 " + i)
                    .createdAt(LocalDateTime.now().minusDays(i))
                    .build();
            healthAssessmentRepository.save(assessment);
        }
    }
} 