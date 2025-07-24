package com.globalcarelink.job;

import com.globalcarelink.auth.Member;
import com.globalcarelink.auth.MemberRepository;
import com.globalcarelink.job.dto.JobCreateRequest;
import com.globalcarelink.job.dto.JobUpdateRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * 구인구직 서비스
 * 구인 공고 등록, 수정, 검색 등의 비즈니스 로직 처리
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class JobService {

    private final JobRepository jobRepository;
    private final MemberRepository memberRepository;

    /**
     * 활성 구인 공고 목록 조회 (캐시 적용)
     */
    @Cacheable(value = "jobs", key = "'active'")
    @Transactional(readOnly = true)
    public Page<Job> getActiveJobs(Pageable pageable) {
        log.debug("활성 구인 공고 목록 조회: 페이지={}", pageable.getPageNumber());
        return jobRepository.findActiveJobs(pageable);
    }

    /**
     * 긴급 채용 공고 조회
     */
    @Transactional(readOnly = true)
    public Page<Job> getUrgentJobs(Pageable pageable) {
        log.debug("긴급 채용 공고 조회: 페이지={}", pageable.getPageNumber());
        return jobRepository.findUrgentJobs(pageable);
    }

    /**
     * 추천 공고 조회 (상위 노출)
     */
    @Cacheable(value = "jobs", key = "'featured'")
    @Transactional(readOnly = true)
    public Page<Job> getFeaturedJobs(Pageable pageable) {
        log.debug("추천 공고 조회: 페이지={}", pageable.getPageNumber());
        return jobRepository.findFeaturedJobs(pageable);
    }

    /**
     * ID로 구인 공고 상세 조회 (조회수 증가)
     */
    @Transactional
    public Job getJobById(Long jobId) {
        log.debug("구인 공고 상세 조회: ID={}", jobId);
        
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("구인 공고를 찾을 수 없습니다: " + jobId));
        
        // 조회수 증가 (비동기 처리)
        incrementViewCountAsync(jobId);
        
        return job;
    }

    /**
     * 구인 공고 등록
     */
    public Job createJob(Member employer, JobCreateRequest request) {
        log.info("구인 공고 등록: 고용주ID={}, 제목={}", employer.getId(), request.getTitle());

        // 고용주 권한 확인
        if (!canPostJob(employer)) {
            throw new IllegalArgumentException("구인 공고 등록 권한이 없습니다");
        }

        Job job = new Job();
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setEmployer(employer);
        job.setCompanyName(request.getCompanyName());
        job.setWorkLocation(request.getWorkLocation());
        job.setDetailAddress(request.getDetailAddress());
        job.setLatitude(request.getLatitude());
        job.setLongitude(request.getLongitude());
        job.setCategory(request.getCategory());
        job.setSalaryType(request.getSalaryType());
        job.setMinSalary(request.getMinSalary());
        job.setMaxSalary(request.getMaxSalary());
        job.setExperienceLevel(request.getExperienceLevel());
        job.setMinExperienceYears(request.getMinExperienceYears());
        job.setWorkType(request.getWorkType());
        job.setWorkHours(request.getWorkHours());
        job.setRecruitCount(request.getRecruitCount());
        job.setApplicationDeadline(request.getApplicationDeadline());
        job.setPreferredQualifications(request.getPreferredQualifications());
        job.setBenefits(request.getBenefits());
        job.setContactPhone(request.getContactPhone());
        job.setContactEmail(request.getContactEmail());
        job.setContactPerson(request.getContactPerson());
        job.setIsUrgent(request.getIsUrgent());

        Job savedJob = jobRepository.save(job);
        log.info("구인 공고 등록 완료: ID={}, 제목={}", savedJob.getId(), savedJob.getTitle());

        return savedJob;
    }

    /**
     * 구인 공고 수정
     */
    public Job updateJob(Long jobId, Member employer, JobUpdateRequest request) {
        log.info("구인 공고 수정: ID={}, 고용주ID={}", jobId, employer.getId());

        Job job = jobRepository.findByIdAndEmployerId(jobId, employer.getId())
                .orElseThrow(() -> new IllegalArgumentException("수정 권한이 없거나 공고를 찾을 수 없습니다"));

        // 마감된 공고는 수정 불가
        if (job.getStatus() == Job.JobStatus.CLOSED) {
            throw new IllegalArgumentException("마감된 공고는 수정할 수 없습니다");
        }

        updateJobFields(job, request);
        
        Job updatedJob = jobRepository.save(job);
        log.info("구인 공고 수정 완료: ID={}, 제목={}", updatedJob.getId(), updatedJob.getTitle());

        return updatedJob;
    }

    /**
     * 구인 공고 삭제 (상태 변경)
     */
    public void deleteJob(Long jobId, Member employer) {
        log.info("구인 공고 삭제: ID={}, 고용주ID={}", jobId, employer.getId());

        Job job = jobRepository.findByIdAndEmployerId(jobId, employer.getId())
                .orElseThrow(() -> new IllegalArgumentException("삭제 권한이 없거나 공고를 찾을 수 없습니다"));

        job.setStatus(Job.JobStatus.DELETED);
        jobRepository.save(job);

        log.info("구인 공고 삭제 완료: ID={}", jobId);
    }

    /**
     * 구인 공고 검색
     */
    @Transactional(readOnly = true)
    public Page<Job> searchJobs(String keyword, Pageable pageable) {
        log.debug("구인 공고 검색: 키워드={}", keyword);
        
        if (keyword == null || keyword.trim().isEmpty()) {
            return getActiveJobs(pageable);
        }
        
        return jobRepository.findByKeywordSearch(keyword.trim(), pageable);
    }

    /**
     * 복합 조건 검색
     */
    @Transactional(readOnly = true)
    public Page<Job> searchJobsWithFilters(
            Job.JobCategory category,
            String location,
            Job.ExperienceLevel experienceLevel,
            Job.WorkType workType,
            Pageable pageable) {
        
        log.debug("구인 공고 복합 검색: 직종={}, 지역={}, 경력={}, 근무형태={}", 
                 category, location, experienceLevel, workType);
        
        return jobRepository.findByMultipleConditions(category, location, experienceLevel, workType, pageable);
    }

    /**
     * 직종별 공고 조회
     */
    @Transactional(readOnly = true)
    public Page<Job> getJobsByCategory(Job.JobCategory category, Pageable pageable) {
        log.debug("직종별 공고 조회: 직종={}", category);
        return jobRepository.findByCategory(category, pageable);
    }

    /**
     * 지역별 공고 조회
     */
    @Transactional(readOnly = true)
    public Page<Job> getJobsByLocation(String location, Pageable pageable) {
        log.debug("지역별 공고 조회: 지역={}", location);
        return jobRepository.findByLocationContaining(location, pageable);
    }

    /**
     * 인기 공고 조회 (조회수 기준)
     */
    @Cacheable(value = "jobs", key = "'popular'")
    @Transactional(readOnly = true)
    public Page<Job> getPopularJobs(Pageable pageable) {
        log.debug("인기 공고 조회");
        return jobRepository.findPopularJobs(pageable);
    }

    /**
     * 최신 공고 조회
     */
    @Transactional(readOnly = true)
    public Page<Job> getLatestJobs(Pageable pageable) {
        log.debug("최신 공고 조회");
        return jobRepository.findLatestJobs(pageable);
    }

    /**
     * 특정 고용주의 공고 목록 조회
     */
    @Transactional(readOnly = true)
    public Page<Job> getJobsByEmployer(Long employerId, Pageable pageable) {
        log.debug("고용주별 공고 조회: 고용주ID={}", employerId);
        return jobRepository.findByEmployerId(employerId, pageable);
    }

    /**
     * 마감 임박 공고 조회 (3일 이내)
     */
    @Transactional(readOnly = true)
    public List<Job> getJobsWithUpcomingDeadline() {
        LocalDate deadline = LocalDate.now().plusDays(3);
        log.debug("마감 임박 공고 조회: 기준일={}", deadline);
        return jobRepository.findJobsWithUpcomingDeadline(deadline);
    }

    /**
     * 구인 공고 통계 조회
     */
    @Cacheable(value = "jobStats", key = "'category'")
    @Transactional(readOnly = true)
    public List<Object[]> getJobStatsByCategory() {
        log.debug("직종별 구인 공고 통계 조회");
        return jobRepository.getJobStatsByCategory();
    }

    /**
     * 오늘 등록된 공고 수 조회
     */
    @Transactional(readOnly = true)
    public long getTodayJobCount() {
        return jobRepository.countTodayJobs();
    }

    /**
     * 특정 고용주의 활성 공고 수 조회
     */
    @Transactional(readOnly = true)
    public long getActiveJobCountByEmployer(Long employerId) {
        return jobRepository.countActiveJobsByEmployer(employerId);
    }

    /**
     * 조회수 증가 (비동기 처리)
     */
    @Async("jobExecutor")
    public CompletableFuture<Void> incrementViewCountAsync(Long jobId) {
        try {
            jobRepository.incrementViewCount(jobId);
            log.debug("조회수 증가 완료: 공고ID={}", jobId);
        } catch (Exception e) {
            log.error("조회수 증가 실패: 공고ID={}", jobId, e);
        }
        return CompletableFuture.completedFuture(null);
    }

    /**
     * 만료된 공고 자동 마감 (스케줄러용)
     */
    @Transactional
    public int closeExpiredJobs() {
        log.info("만료된 공고 자동 마감 시작");
        int closedCount = jobRepository.updateExpiredJobsToclosed();
        log.info("만료된 공고 자동 마감 완료: {}개", closedCount);
        return closedCount;
    }

    /**
     * 구인 공고 등록 권한 확인
     */
    private boolean canPostJob(Member member) {
        return member != null && 
               (member.getRole() == com.globalcarelink.auth.MemberRole.FACILITY ||
                member.getRole() == com.globalcarelink.auth.MemberRole.ADMIN);
    }

    /**
     * 구인 공고 필드 업데이트
     */
    private void updateJobFields(Job job, JobUpdateRequest request) {
        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            job.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            job.setDescription(request.getDescription());
        }
        if (request.getCompanyName() != null && !request.getCompanyName().trim().isEmpty()) {
            job.setCompanyName(request.getCompanyName().trim());
        }
        if (request.getWorkLocation() != null) {
            job.setWorkLocation(request.getWorkLocation());
        }
        if (request.getDetailAddress() != null) {
            job.setDetailAddress(request.getDetailAddress());
        }
        if (request.getLatitude() != null) {
            job.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            job.setLongitude(request.getLongitude());
        }
        if (request.getCategory() != null) {
            job.setCategory(request.getCategory());
        }
        if (request.getSalaryType() != null) {
            job.setSalaryType(request.getSalaryType());
        }
        if (request.getMinSalary() != null) {
            job.setMinSalary(request.getMinSalary());
        }
        if (request.getMaxSalary() != null) {
            job.setMaxSalary(request.getMaxSalary());
        }
        if (request.getExperienceLevel() != null) {
            job.setExperienceLevel(request.getExperienceLevel());
        }
        if (request.getMinExperienceYears() != null) {
            job.setMinExperienceYears(request.getMinExperienceYears());
        }
        if (request.getWorkType() != null) {
            job.setWorkType(request.getWorkType());
        }
        if (request.getWorkHours() != null) {
            job.setWorkHours(request.getWorkHours());
        }
        if (request.getRecruitCount() != null && request.getRecruitCount() > 0) {
            job.setRecruitCount(request.getRecruitCount());
        }
        if (request.getApplicationDeadline() != null) {
            job.setApplicationDeadline(request.getApplicationDeadline());
        }
        if (request.getPreferredQualifications() != null) {
            job.setPreferredQualifications(request.getPreferredQualifications());
        }
        if (request.getBenefits() != null) {
            job.setBenefits(request.getBenefits());
        }
        if (request.getContactPhone() != null) {
            job.setContactPhone(request.getContactPhone());
        }
        if (request.getContactEmail() != null) {
            job.setContactEmail(request.getContactEmail());
        }
        if (request.getContactPerson() != null) {
            job.setContactPerson(request.getContactPerson());
        }
        if (request.getIsUrgent() != null) {
            job.setIsUrgent(request.getIsUrgent());
        }
    }

}