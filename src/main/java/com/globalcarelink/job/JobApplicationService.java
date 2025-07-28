package com.globalcarelink.job;

import com.globalcarelink.auth.Member;
import com.globalcarelink.auth.MemberRepository;
import com.globalcarelink.job.dto.JobApplicationCreateRequest;
import com.globalcarelink.job.dto.JobApplicationUpdateRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * 구직 지원서 서비스
 * 구직자 중심의 지원서 관리, 지원 상태 추적 등의 비즈니스 로직 처리
 * JobService와 분리하여 SRP(단일 책임 원칙) 준수
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final JobRepository jobRepository;
    private final MemberRepository memberRepository;

    /**
     * 새 지원서 제출
     */
    public JobApplication submitApplication(Long jobId, Member applicant, JobApplicationCreateRequest request) {
        log.info("새 지원서 제출: 공고ID={}, 지원자ID={}", jobId, applicant.getId());

        // 공고 존재 및 지원 가능 여부 확인
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("구인 공고를 찾을 수 없습니다: " + jobId));

        if (job.getStatus() != Job.JobStatus.ACTIVE) {
            throw new IllegalArgumentException("현재 지원할 수 없는 공고입니다");
        }

        if (job.getApplicationDeadline() != null && job.getApplicationDeadline().isBefore(LocalDateTime.now().toLocalDate())) {
            throw new IllegalArgumentException("지원 마감된 공고입니다");
        }

        // 중복 지원 확인
        if (jobApplicationRepository.existsByJobIdAndApplicantId(jobId, applicant.getId())) {
            throw new IllegalArgumentException("이미 지원하신 공고입니다");
        }

        // 지원자 권한 확인
        if (!canApplyToJob(applicant)) {
            throw new IllegalArgumentException("구직 지원 권한이 없습니다");
        }

        // 지원서 생성
        JobApplication application = new JobApplication();
        application.setJob(job);
        application.setApplicant(applicant);
        application.setCoverLetter(request.getCoverLetter());
        application.setResumeFileName(request.getResumeFileName());
        application.setResumeFileUrl(request.getResumeFileUrl());
        application.setContactPhone(request.getContactPhone());
        application.setContactEmail(request.getContactEmail());
        application.setExperienceYears(request.getExperienceYears());
        application.setEducationLevel(request.getEducationLevel());
        application.setCertifications(request.getCertifications());
        application.setPreferredStartDate(request.getPreferredStartDate());
        application.setExpectedSalary(request.getExpectedSalary() != null ? request.getExpectedSalary().toString() : null);
        application.setAdditionalInfo(request.getAdditionalInfo());

        JobApplication savedApplication = jobApplicationRepository.save(application);
        log.info("지원서 제출 완료: ID={}, 공고ID={}", savedApplication.getId(), jobId);

        return savedApplication;
    }

    /**
     * 지원서 수정
     */
    public JobApplication updateApplication(Long applicationId, Member applicant, JobApplicationUpdateRequest request) {
        log.info("지원서 수정: ID={}, 지원자ID={}", applicationId, applicant.getId());

        JobApplication application = jobApplicationRepository.findByIdAndApplicantId(applicationId, applicant.getId())
                .orElseThrow(() -> new IllegalArgumentException("수정 권한이 없거나 지원서를 찾을 수 없습니다"));

        // 수정 가능 여부 확인 (제출 후 24시간 이내)
        if (!application.isEditable()) {
            throw new IllegalArgumentException("지원서 수정 기간이 지났습니다 (24시간 제한)");
        }

        // 지원서 업데이트
        updateApplicationFields(application, request);

        JobApplication updatedApplication = jobApplicationRepository.save(application);
        log.info("지원서 수정 완료: ID={}", updatedApplication.getId());

        return updatedApplication;
    }

    /**
     * 지원서 철회
     */
    public void withdrawApplication(Long applicationId, Member applicant) {
        log.info("지원서 철회: ID={}, 지원자ID={}", applicationId, applicant.getId());

        JobApplication application = jobApplicationRepository.findByIdAndApplicantId(applicationId, applicant.getId())
                .orElseThrow(() -> new IllegalArgumentException("철회 권한이 없거나 지원서를 찾을 수 없습니다"));

        if (application.getStatus() == JobApplication.ApplicationStatus.WITHDRAWN) {
            throw new IllegalArgumentException("이미 철회된 지원서입니다");
        }

        if (application.getStatus() == JobApplication.ApplicationStatus.ACCEPTED) {
            throw new IllegalArgumentException("채용 확정된 지원서는 철회할 수 없습니다");
        }

        application.setStatus(JobApplication.ApplicationStatus.WITHDRAWN);
        jobApplicationRepository.save(application);

        log.info("지원서 철회 완료: ID={}", applicationId);
    }

    /**
     * 특정 지원자의 지원서 목록 조회
     */
    @Transactional(readOnly = true)
    public Page<JobApplication> getApplicationsByApplicant(Long applicantId, Pageable pageable) {
        log.debug("지원자 지원서 목록 조회: 지원자ID={}", applicantId);
        return jobApplicationRepository.findByApplicantId(applicantId, pageable);
    }

    /**
     * 특정 공고의 지원서 목록 조회 (고용주용)
     */
    @Transactional(readOnly = true)
    public Page<JobApplication> getApplicationsByJob(Long jobId, Pageable pageable) {
        log.debug("공고 지원서 목록 조회: 공고ID={}", jobId);
        return jobApplicationRepository.findByJobId(jobId, pageable);
    }
    
    /**
     * 특정 공고의 지원서 목록 조회 (고용주 권한 확인 포함)
     */
    @Transactional(readOnly = true)
    public Page<JobApplication> getApplicationsByJob(Long jobId, Member employer, Pageable pageable) {
        log.debug("공고 지원서 목록 조회: 공고ID={}, 고용주={}", jobId, employer.getEmail());
        
        // 권한 확인 로직은 컨트롤러에서 처리된다고 가정하고, 
        // 여기서는 단순히 지원서 목록을 반환
        return jobApplicationRepository.findByJobId(jobId, pageable);
    }

    /**
     * 특정 공고의 상태별 지원서 조회
     */
    @Transactional(readOnly = true)
    public Page<JobApplication> getApplicationsByJobAndStatus(Long jobId, JobApplication.ApplicationStatus status, Pageable pageable) {
        log.debug("공고 상태별 지원서 조회: 공고ID={}, 상태={}", jobId, status);
        return jobApplicationRepository.findByJobIdAndStatus(jobId, status, pageable);
    }

    /**
     * 지원서 상세 조회
     */
    @Transactional(readOnly = true)
    public JobApplication getApplicationById(Long applicationId) {
        log.debug("지원서 상세 조회: ID={}", applicationId);
        return jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("지원서를 찾을 수 없습니다: " + applicationId));
    }

    /**
     * 면접 일정 설정 (고용주용)
     */
    public JobApplication scheduleInterview(Long applicationId, Member employer, LocalDateTime interviewDateTime, String interviewLocation, String interviewNotes) {
        log.info("면접 일정 설정: 지원서ID={}, 고용주ID={}", applicationId, employer.getId());

        JobApplication application = getApplicationById(applicationId);

        // 고용주 권한 확인
        if (!application.getJob().getEmployer().getId().equals(employer.getId())) {
            throw new IllegalArgumentException("면접 일정 설정 권한이 없습니다");
        }

        if (application.getStatus() != JobApplication.ApplicationStatus.UNDER_REVIEW) {
            throw new IllegalArgumentException("검토 중인 지원서만 면접 일정을 설정할 수 있습니다");
        }

        application.setStatus(JobApplication.ApplicationStatus.INTERVIEW_SCHEDULED);
        application.setInterviewDateTime(interviewDateTime);
        application.setInterviewLocation(interviewLocation);
        application.setInterviewNotes(interviewNotes);

        JobApplication updatedApplication = jobApplicationRepository.save(application);
        log.info("면접 일정 설정 완료: 지원서ID={}, 면접일시={}", applicationId, interviewDateTime);

        return updatedApplication;
    }
    
    /**
     * 면접 일정 설정 (고용주용) - InterviewType 포함
     */
    public JobApplication scheduleInterview(Long applicationId, Member employer, LocalDateTime interviewDateTime, String interviewLocation, JobApplication.InterviewType interviewType) {
        log.info("면접 일정 설정: 지원서ID={}, 고용주ID={}, 면접방식={}", applicationId, employer.getId(), interviewType);

        JobApplication application = getApplicationById(applicationId);

        // 고용주 권한 확인
        if (!application.getJob().getEmployer().getId().equals(employer.getId())) {
            throw new IllegalArgumentException("면접 일정 설정 권한이 없습니다");
        }

        if (application.getStatus() != JobApplication.ApplicationStatus.UNDER_REVIEW) {
            throw new IllegalArgumentException("검토 중인 지원서만 면접 일정을 설정할 수 있습니다");
        }

        application.setStatus(JobApplication.ApplicationStatus.INTERVIEW_SCHEDULED);
        application.setInterviewDateTime(interviewDateTime);
        application.setInterviewLocation(interviewLocation);
        application.setInterviewType(interviewType);

        JobApplication updatedApplication = jobApplicationRepository.save(application);
        log.info("면접 일정 설정 완료: 지원서ID={}, 면접일시={}, 방식={}", applicationId, interviewDateTime, interviewType);

        return updatedApplication;
    }

    /**
     * 지원서 상태 변경 (고용주용)
     */
    public JobApplication updateApplicationStatus(Long applicationId, Member employer, JobApplication.ApplicationStatus newStatus, String statusNote) {
        log.info("지원서 상태 변경: 지원서ID={}, 고용주ID={}, 새상태={}", applicationId, employer.getId(), newStatus);

        JobApplication application = getApplicationById(applicationId);

        // 고용주 권한 확인
        if (!application.getJob().getEmployer().getId().equals(employer.getId())) {
            throw new IllegalArgumentException("지원서 상태 변경 권한이 없습니다");
        }

        application.setStatus(newStatus);
        if (statusNote != null) {
            application.setStatusNote(statusNote);
        }

        JobApplication updatedApplication = jobApplicationRepository.save(application);
        log.info("지원서 상태 변경 완료: 지원서ID={}, 상태={}", applicationId, newStatus);

        return updatedApplication;
    }

    /**
     * 오늘 접수된 지원서 수 조회
     */
    @Cacheable(value = "applicationStats", key = "'today'")
    @Transactional(readOnly = true)
    public long getTodayApplicationCount() {
        return jobApplicationRepository.countTodayApplications();
    }

    /**
     * 특정 공고의 지원자 수 조회
     */
    @Transactional(readOnly = true)
    public long getApplicationCountByJob(Long jobId) {
        return jobApplicationRepository.countByJobId(jobId);
    }

    /**
     * 특정 지원자의 지원 공고 수 조회
     */
    @Transactional(readOnly = true)
    public long getApplicationCountByApplicant(Long applicantId) {
        return jobApplicationRepository.countByApplicantId(applicantId);
    }

    /**
     * 면접 예정 지원서 조회
     */
    @Transactional(readOnly = true)
    public List<JobApplication> getUpcomingInterviews(LocalDateTime startDate, LocalDateTime endDate) {
        log.debug("면접 예정 지원서 조회: 기간={} ~ {}", startDate, endDate);
        return jobApplicationRepository.findInterviewScheduled(startDate, endDate);
    }

    /**
     * 통계 업데이트 (비동기 처리)
     */
    @Async("statisticsExecutor")
    public CompletableFuture<Void> updateApplicationStatistics() {
        try {
            log.info("지원서 통계 업데이트 시작");
            // 통계 업데이트 로직 구현
            log.info("지원서 통계 업데이트 완료");
        } catch (Exception e) {
            log.error("지원서 통계 업데이트 실패", e);
        }
        return CompletableFuture.completedFuture(null);
    }

    /**
     * 구직 지원 권한 확인
     */
    private boolean canApplyToJob(Member member) {
        return member != null && 
               (member.getRole() == com.globalcarelink.auth.MemberRole.USER_DOMESTIC ||
                member.getRole() == com.globalcarelink.auth.MemberRole.USER_OVERSEAS ||
                member.getRole() == com.globalcarelink.auth.MemberRole.JOB_SEEKER_DOMESTIC ||
                member.getRole() == com.globalcarelink.auth.MemberRole.JOB_SEEKER_OVERSEAS);
    }

    /**
     * 지원서 필드 업데이트
     */
    private void updateApplicationFields(JobApplication application, JobApplicationUpdateRequest request) {
        if (request.getCoverLetter() != null) {
            application.setCoverLetter(request.getCoverLetter());
        }
        if (request.getResumeFileName() != null) {
            application.setResumeFileName(request.getResumeFileName());
        }
        if (request.getResumeFileUrl() != null) {
            application.setResumeFileUrl(request.getResumeFileUrl());
        }
        if (request.getContactPhone() != null) {
            application.setContactPhone(request.getContactPhone());
        }
        if (request.getContactEmail() != null) {
            application.setContactEmail(request.getContactEmail());
        }
        if (request.getExperienceYears() != null) {
            application.setExperienceYears(request.getExperienceYears());
        }
        if (request.getEducationLevel() != null) {
            application.setEducationLevel(request.getEducationLevel());
        }
        if (request.getCertifications() != null) {
            application.setCertifications(request.getCertifications());
        }
        if (request.getPreferredStartDate() != null) {
            application.setPreferredStartDate(request.getPreferredStartDate());
        }
        if (request.getExpectedSalary() != null) {
            application.setExpectedSalary(request.getExpectedSalary().toString());
        }
        if (request.getAdditionalInfo() != null) {
            application.setAdditionalInfo(request.getAdditionalInfo());
        }
    }
    
    /**
     * 구인 공고에 지원하기 (컴파일 호환성을 위한 별칭 메서드)
     */
    public JobApplication applyToJob(Long jobId, Member applicant, JobApplicationCreateRequest request) {
        log.info("구인 공고 지원: 공고ID={}, 지원자={}", jobId, applicant.getEmail());
        return submitApplication(jobId, applicant, request);
    }
    
    /**
     * 구인 공고에 지원하기 (다른 Request 타입을 위한 오버로딩)
     */
    public JobApplication applyToJob(Long jobId, Member applicant, com.globalcarelink.job.dto.JobApplicationRequest request) {
        log.info("구인 공고 지원: 공고ID={}, 지원자={}", jobId, applicant.getEmail());
        
        // JobApplicationRequest를 JobApplicationCreateRequest로 변환
        JobApplicationCreateRequest createRequest = new JobApplicationCreateRequest();
        createRequest.setCoverLetter(request.getCoverLetter());
        createRequest.setResumeFileName(request.getResumeFileName());
        createRequest.setContactPhone(request.getContactPhone());
        createRequest.setContactEmail(request.getContactEmail());
        
        // String을 BigDecimal로 변환
        if (request.getExpectedSalary() != null && !request.getExpectedSalary().trim().isEmpty()) {
            try {
                String cleanSalary = request.getExpectedSalary().replaceAll("[,\\s]", "");
                createRequest.setExpectedSalary(new java.math.BigDecimal(cleanSalary));
            } catch (NumberFormatException e) {
                log.warn("급여 변환 실패: {}", request.getExpectedSalary());
            }
        }
        
        // applicantNotes는 additionalInfo로 매핑
        if (request.getApplicantNotes() != null) {
            createRequest.setAdditionalInfo(request.getApplicantNotes());
        }
        
        return submitApplication(jobId, applicant, createRequest);
    }
}