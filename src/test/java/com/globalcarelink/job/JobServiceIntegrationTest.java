package com.globalcarelink.job;

import com.globalcarelink.auth.Member;
import com.globalcarelink.auth.MemberRepository;
import com.globalcarelink.auth.MemberRole;
import com.globalcarelink.config.IntegrationTestConfig;
import com.globalcarelink.job.dto.JobCreateRequest;
import com.globalcarelink.job.dto.JobUpdateRequest;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.awaitility.Awaitility.await;

/**
 * JobService 통합 테스트
 * 실제 데이터베이스와의 상호작용을 검증하여 구인구직 시스템의 신뢰성 확보
 * Mock 의존성을 최소화하고 실제 운영 환경과 유사한 조건에서 테스트
 * 
 * DISABLED: Job 엔티티가 temp-disabled 폴더로 이동됨
 */
@Disabled("Job 엔티티가 비활성화됨 - temp-disabled 폴더에 위치")
@DataJpaTest
@ActiveProfiles("test")
@Import({JobService.class, JobApplicationService.class, IntegrationTestConfig.class})
@SpringJUnitConfig
@DisplayName("구인구직 서비스 통합 테스트 - 실제 DB 상호작용")
class JobServiceIntegrationTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private JobService jobService;

    @Autowired
    private JobApplicationService jobApplicationService;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private IntegrationTestConfig.TestPerformanceMonitor performanceMonitor;

    // ===== 핵심 비즈니스 로직 통합 테스트 =====

    @Test
    @DisplayName("실제 DB 테스트 - 구인 공고 생성 및 검색")
    @Transactional
    void testCreateJobAndSearch() {
        // Given - 실제 DB에 저장된 회원 데이터
        Member employer = createAndSaveEmployer("employer1", "채용담당자1");
        entityManager.flush();

        JobCreateRequest request = new JobCreateRequest();
        request.setTitle("요양보호사 채용 공고");
        request.setDescription("경력 3년 이상의 요양보호사를 모집합니다.");
        request.setCompanyName("서울요양원");
        request.setWorkLocation("서울특별시 강남구");
        request.setDetailAddress("테헤란로 123");
        request.setCategory(Job.JobCategory.CAREGIVER);
        request.setSalaryType(Job.SalaryType.MONTHLY);
        request.setMinSalary(BigDecimal.valueOf(2800000));
        request.setMaxSalary(BigDecimal.valueOf(3200000));
        request.setExperienceLevel(Job.ExperienceLevel.SENIOR);
        request.setMinExperienceYears(3);
        request.setWorkType(Job.WorkType.FULL_TIME);
        request.setWorkHours("09:00-18:00");
        request.setRecruitCount(2);
        request.setApplicationDeadline(LocalDate.now().plusDays(30));
        request.setPreferredQualifications("요양보호사 자격증 필수, 치매 전문 과정 이수자 우대");
        request.setBenefits("4대보험, 연차수당, 명절선물");
        request.setContactPhone("02-1234-5678");
        request.setContactEmail("hr@seoul-care.com");
        request.setContactPerson("김채용");
        request.setIsUrgent(false);

        // When - 구인 공고 생성
        long startTime = System.nanoTime();
        Job savedJob = jobService.createJob(employer.getId(), request);
        long endTime = System.nanoTime();
        
        entityManager.flush();

        // Then - 정상 생성 검증
        performanceMonitor.validateQueryPerformance((endTime - startTime) / 1_000_000, "구인공고 생성");
        
        assertThat(savedJob.getId()).isNotNull();
        assertThat(savedJob.getTitle()).isEqualTo("요양보호사 채용 공고");
        assertThat(savedJob.getEmployer().getId()).isEqualTo(employer.getId());
        assertThat(savedJob.getCategory()).isEqualTo(Job.JobCategory.CAREGIVER);
        assertThat(savedJob.getMinSalary()).isEqualByComparingTo(BigDecimal.valueOf(2800000));
        assertThat(savedJob.getStatus()).isEqualTo(Job.JobStatus.ACTIVE);

        // 검색 기능 테스트
        Page<Job> searchResults = jobService.searchJobs(
            "요양보호사", null, null, null, null, PageRequest.of(0, 10)
        );
        
        assertThat(searchResults.getContent()).hasSize(1);
        assertThat(searchResults.getContent().get(0).getId()).isEqualTo(savedJob.getId());
    }

    @Test
    @DisplayName("실제 DB 테스트 - 구직 지원 시스템 및 상태 관리")
    @Transactional
    void testJobApplicationSystem() {
        // Given - 구인 공고와 구직자 준비
        Member employer = createAndSaveEmployer("employer2", "채용담당자2");
        Member jobSeeker = createAndSaveJobSeeker("jobseeker1", "구직자1");
        
        Job job = createAndSaveJob(employer, "간병인 모집", Job.JobCategory.NURSE);
        entityManager.flush();

        // When - 구직 지원
        JobApplication application = jobApplicationService.applyForJob(
            job.getId(), 
            jobSeeker, 
            "안녕하세요. 간병인 경력 5년차 김구직입니다."
        );
        
        entityManager.flush();
        entityManager.clear(); // 1차 캐시 초기화

        // Then - 지원 내역 저장 검증
        assertThat(application.getId()).isNotNull();
        assertThat(application.getJob().getId()).isEqualTo(job.getId());
        assertThat(application.getApplicant().getId()).isEqualTo(jobSeeker.getId());
        assertThat(application.getStatus()).isEqualTo(JobApplication.ApplicationStatus.APPLIED);

        // 지원자 수 업데이트 검증
        Job updatedJob = jobRepository.findById(job.getId()).orElseThrow();
        assertThat(updatedJob.getApplicationCount()).isEqualTo(1);

        // 지원 상태 변경 테스트
        jobApplicationService.updateApplicationStatus(
            application.getId(), 
            employer, 
            JobApplication.ApplicationStatus.INTERVIEW_SCHEDULED,
            "1차 면접 일정을 안내드립니다."
        );
        
        entityManager.flush();
        
        JobApplication updatedApplication = jobApplicationRepository.findById(application.getId()).orElseThrow();
        assertThat(updatedApplication.getStatus()).isEqualTo(JobApplication.ApplicationStatus.INTERVIEW_SCHEDULED);
        assertThat(updatedApplication.getEmployerNote()).contains("1차 면접 일정");
    }

    @Test
    @DisplayName("실제 DB 테스트 - 복합 검색 조건 및 페이징")
    void testComplexJobSearchWithPaging() {
        // Given - 다양한 조건의 구인 공고들 생성
        Member employer1 = createAndSaveEmployer("employer3", "채용담당자3");
        Member employer2 = createAndSaveEmployer("employer4", "채용담당자4");
        
        // 서울 지역 요양보호사 공고 3개
        for (int i = 1; i <= 3; i++) {
            Job job = createAndSaveJob(employer1, "서울 요양보호사 " + i, Job.JobCategory.CAREGIVER);
            job.setWorkLocation("서울특별시 강남구");
            job.setMinSalary(BigDecimal.valueOf(2500000 + i * 100000));
            job.setMaxSalary(BigDecimal.valueOf(3000000 + i * 100000));
        }
        
        // 부산 지역 간병인 공고 2개
        for (int i = 1; i <= 2; i++) {
            Job job = createAndSaveJob(employer2, "부산 간병인 " + i, Job.JobCategory.NURSE);
            job.setWorkLocation("부산광역시 해운대구");
            job.setMinSalary(BigDecimal.valueOf(2300000 + i * 50000));
            job.setMaxSalary(BigDecimal.valueOf(2800000 + i * 50000));
        }
        
        entityManager.flush();

        // When - 복합 검색 (서울 + 요양보호사 + 급여 조건)
        long searchStartTime = System.nanoTime();
        Page<Job> searchResults = jobService.searchJobs(
            "요양보호사",                    // 제목 키워드
            Job.JobCategory.CAREGIVER,       // 직종
            "서울",                          // 지역
            BigDecimal.valueOf(2600000),     // 최소 급여
            BigDecimal.valueOf(3500000),     // 최대 급여
            PageRequest.of(0, 2)             // 페이징 (2개씩)
        );
        long searchEndTime = System.nanoTime();

        // Then - 검색 결과 및 성능 검증
        performanceMonitor.validateQueryPerformance(
            (searchEndTime - searchStartTime) / 1_000_000, 
            "복합조건 구인공고 검색"
        );
        
        assertThat(searchResults.getContent()).hasSize(2); // 페이지 크기 제한
        assertThat(searchResults.getTotalElements()).isEqualTo(3); // 전체 결과 수
        assertThat(searchResults.hasNext()).isTrue(); // 다음 페이지 존재
        
        // 정렬 및 필터링 검증
        for (Job job : searchResults.getContent()) {
            assertThat(job.getTitle()).contains("요양보호사");
            assertThat(job.getCategory()).isEqualTo(Job.JobCategory.CAREGIVER);
            assertThat(job.getWorkLocation()).contains("서울");
            assertThat(job.getMinSalary()).isGreaterThanOrEqualTo(BigDecimal.valueOf(2600000));
        }
    }

    @Test
    @DisplayName("실제 DB 테스트 - 구인공고 만료 및 자동 상태 관리")
    @Transactional
    void testJobExpirationAndStatusManagement() {
        // Given - 만료일이 지난 구인 공고 생성
        Member employer = createAndSaveEmployer("employer5", "채용담당자5");
        Job expiredJob = createAndSaveJob(employer, "만료된 구인공고", Job.JobCategory.ADMINISTRATOR);
        expiredJob.setApplicationDeadline(LocalDate.now().minusDays(1)); // 어제 만료
        
        Job activeJob = createAndSaveJob(employer, "활성 구인공고", Job.JobCategory.ADMINISTRATOR);
        activeJob.setApplicationDeadline(LocalDate.now().plusDays(7)); // 일주일 후 만료
        
        entityManager.flush();

        // When - 만료 공고 상태 업데이트 (배치 작업 시뮬레이션)
        jobService.updateExpiredJobs();
        entityManager.flush();
        entityManager.clear();

        // Then - 만료된 공고 상태 변경 검증
        Job updatedExpiredJob = jobRepository.findById(expiredJob.getId()).orElseThrow();
        Job updatedActiveJob = jobRepository.findById(activeJob.getId()).orElseThrow();
        
        assertThat(updatedExpiredJob.getStatus()).isEqualTo(Job.JobStatus.CLOSED);
        assertThat(updatedActiveJob.getStatus()).isEqualTo(Job.JobStatus.ACTIVE);
        
        // 활성 공고만 검색되는지 확인
        Page<Job> activeJobs = jobService.searchActiveJobs(PageRequest.of(0, 10));
        assertThat(activeJobs.getContent())
            .filteredOn(job -> job.getId().equals(updatedActiveJob.getId()))
            .hasSize(1);
        assertThat(activeJobs.getContent())
            .filteredOn(job -> job.getId().equals(updatedExpiredJob.getId()))
            .hasSize(0);
    }

    @Test
    @DisplayName("실제 DB 테스트 - 통계 데이터 계산 및 집계")
    void testJobStatisticsCalculation() {
        // Given - 다양한 상태의 구인공고 및 지원서 생성
        Member employer = createAndSaveEmployer("stats_employer", "통계용채용담당자");
        Member jobSeeker1 = createAndSaveJobSeeker("stats_seeker1", "통계용구직자1");
        Member jobSeeker2 = createAndSaveJobSeeker("stats_seeker2", "통계용구직자2");
        Member jobSeeker3 = createAndSaveJobSeeker("stats_seeker3", "통계용구직자3");
        
        // 인기 공고 (지원자 많음)
        Job popularJob = createAndSaveJob(employer, "인기 구인공고", Job.JobCategory.CAREGIVER);
        jobApplicationService.applyForJob(popularJob.getId(), jobSeeker1, "지원합니다 1");
        jobApplicationService.applyForJob(popularJob.getId(), jobSeeker2, "지원합니다 2");
        jobApplicationService.applyForJob(popularJob.getId(), jobSeeker3, "지원합니다 3");
        
        // 일반 공고 (지원자 적음)
        Job normalJob = createAndSaveJob(employer, "일반 구인공고", Job.JobCategory.NURSE);
        jobApplicationService.applyForJob(normalJob.getId(), jobSeeker1, "지원합니다");
        
        entityManager.flush();

        // When - 통계 데이터 계산
        long statsStartTime = System.nanoTime();
        
        // 공고별 지원자 수 통계
        List<Job> jobsWithApplications = jobRepository.findAllWithApplicationCount();
        
        // 카테고리별 공고 수 통계
        long caregiverJobCount = jobRepository.countByCategory(Job.JobCategory.CAREGIVER);
        long nurseJobCount = jobRepository.countByCategory(Job.JobCategory.NURSE);
        
        long statsEndTime = System.nanoTime();

        // Then - 통계 정확성 및 성능 검증
        performanceMonitor.validateQueryPerformance(
            (statsEndTime - statsStartTime) / 1_000_000, 
            "구인공고 통계 계산"
        );
        
        // 지원자 수 통계 검증
        Job popularJobResult = jobsWithApplications.stream()
            .filter(job -> job.getId().equals(popularJob.getId()))
            .findFirst()
            .orElseThrow();
        assertThat(popularJobResult.getApplicationCount()).isEqualTo(3);
        
        Job normalJobResult = jobsWithApplications.stream()
            .filter(job -> job.getId().equals(normalJob.getId()))
            .findFirst()
            .orElseThrow();
        assertThat(normalJobResult.getApplicationCount()).isEqualTo(1);
        
        // 카테고리별 통계 검증
        assertThat(caregiverJobCount).isEqualTo(1);
        assertThat(nurseJobCount).isEqualTo(1);
    }

    @Test
    @DisplayName("실제 DB 테스트 - 대용량 데이터 처리 성능")
    void testLargeDataSetPerformance() {
        // Given - 대용량 구인공고 데이터 생성 (100개)
        Member employer = createAndSaveEmployer("bulk_employer", "대용량테스트채용담당자");
        
        long bulkInsertStartTime = System.nanoTime();
        
        for (int i = 1; i <= 100; i++) {
            Job job = new Job();
            job.setTitle("대용량테스트공고 " + i);
            job.setDescription("대용량 테스트용 공고 설명 " + i);
            job.setEmployer(employer);
            job.setCompanyName("테스트회사 " + i);
            job.setWorkLocation("서울특별시 강남구");
            job.setCategory(Job.JobCategory.values()[i % Job.JobCategory.values().length]);
            job.setSalaryType(Job.SalaryType.MONTHLY);
            job.setMinSalary(BigDecimal.valueOf(2500000 + (i % 10) * 100000));
            job.setMaxSalary(BigDecimal.valueOf(3000000 + (i % 10) * 100000));
            job.setExperienceLevel(Job.ExperienceLevel.ANY);
            job.setWorkType(Job.WorkType.FULL_TIME);
            job.setRecruitCount(1);
            job.setApplicationDeadline(LocalDate.now().plusDays(30));
            job.setStatus(Job.JobStatus.ACTIVE);
            job.setCreatedDate(LocalDateTime.now());
            
            entityManager.persist(job);
            
            if (i % 20 == 0) {
                entityManager.flush(); // 배치 플러시
                entityManager.clear();
            }
        }
        
        entityManager.flush();
        long bulkInsertEndTime = System.nanoTime();

        // When - 대용량 데이터 검색 성능 테스트
        entityManager.clear(); // 1차 캐시 초기화
        
        long searchStartTime = System.nanoTime();
        Page<Job> searchResults = jobService.searchJobs(
            "대용량테스트", null, null, null, null, PageRequest.of(0, 10)
        );
        long searchEndTime = System.nanoTime();

        // Then - 성능 요구사항 검증
        long insertTimeMs = (bulkInsertEndTime - bulkInsertStartTime) / 1_000_000;
        long searchTimeMs = (searchEndTime - searchStartTime) / 1_000_000;
        
        performanceMonitor.validateBatchSize(100, "구인공고 대량 생성");
        
        assertThat(insertTimeMs).isLessThan(3000L)
            .describedAs("100개 구인공고 생성은 3초 이내에 완료되어야 함");
        assertThat(searchTimeMs).isLessThan(200L)
            .describedAs("대용량 데이터 검색은 200ms 이내에 완료되어야 함");
        
        assertThat(searchResults.getContent()).hasSize(10);
        assertThat(searchResults.getTotalElements()).isEqualTo(100);
        
        System.out.println("100개 구인공고 생성 시간: " + insertTimeMs + "ms");
        System.out.println("대용량 데이터 검색 시간: " + searchTimeMs + "ms");
    }

    // ===== 테스트 데이터 생성 헬퍼 메서드 =====

    private Member createAndSaveEmployer(String username, String name) {
        Member employer = new Member();
        employer.setUsername(username);
        employer.setPassword("$2a$10$dummyhash");
        employer.setName(name);
        employer.setEmail(username + "@employer.com");
        employer.setPhoneNumber("02-1234-5678");
        employer.setRole(MemberRole.EMPLOYER);
        employer.setCreatedDate(LocalDateTime.now());
        
        return entityManager.persistAndFlush(employer);
    }

    private Member createAndSaveJobSeeker(String username, String name) {
        Member jobSeeker = new Member();
        jobSeeker.setUsername(username);
        jobSeeker.setPassword("$2a$10$dummyhash");
        jobSeeker.setName(name);
        jobSeeker.setEmail(username + "@jobseeker.com");
        jobSeeker.setPhoneNumber("010-1234-5678");
        jobSeeker.setRole(MemberRole.MEMBER);
        jobSeeker.setCreatedDate(LocalDateTime.now());
        
        return entityManager.persistAndFlush(jobSeeker);
    }

    private Job createAndSaveJob(Member employer, String title, Job.JobCategory category) {
        Job job = new Job();
        job.setTitle(title);
        job.setDescription("테스트용 공고 설명");
        job.setEmployer(employer);
        job.setCompanyName("테스트회사");
        job.setWorkLocation("서울특별시 강남구");
        job.setCategory(category);
        job.setSalaryType(Job.SalaryType.MONTHLY);
        job.setMinSalary(BigDecimal.valueOf(2800000));
        job.setMaxSalary(BigDecimal.valueOf(3200000));
        job.setExperienceLevel(Job.ExperienceLevel.ANY);
        job.setWorkType(Job.WorkType.FULL_TIME);
        job.setRecruitCount(1);
        job.setApplicationDeadline(LocalDate.now().plusDays(30));
        job.setStatus(Job.JobStatus.ACTIVE);
        job.setCreatedDate(LocalDateTime.now());
        
        return entityManager.persistAndFlush(job);
    }
}