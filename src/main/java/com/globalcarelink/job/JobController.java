package com.globalcarelink.job;

import com.globalcarelink.auth.Member;
import com.globalcarelink.auth.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 구인구직 컨트롤러
 * 구인 공고 및 지원서 관련 REST API 엔드포인트 제공
 */
@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@Slf4j
public class JobController {

    private final JobService jobService;
    private final JobApplicationService jobApplicationService;
    private final MemberService memberService;

    /**
     * 활성 구인 공고 목록 조회
     */
    @GetMapping
    public ResponseEntity<Page<Job>> getActiveJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdDate") String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        
        log.info("활성 구인 공고 목록 조회: 페이지={}, 크기={}", page, size);
        
        Sort.Direction sortDirection = "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));
        
        Page<Job> jobs = jobService.getActiveJobs(pageable);
        return ResponseEntity.ok(jobs);
    }

    /**
     * 긴급 채용 공고 조회
     */
    @GetMapping("/urgent")
    public ResponseEntity<Page<Job>> getUrgentJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("긴급 채용 공고 조회: 페이지={}, 크기={}", page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Job> jobs = jobService.getUrgentJobs(pageable);
        
        return ResponseEntity.ok(jobs);
    }

    /**
     * 추천 공고 조회
     */
    @GetMapping("/featured")
    public ResponseEntity<Page<Job>> getFeaturedJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("추천 공고 조회: 페이지={}, 크기={}", page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Job> jobs = jobService.getFeaturedJobs(pageable);
        
        return ResponseEntity.ok(jobs);
    }

    /**
     * 인기 공고 조회 (조회수 기준)
     */
    @GetMapping("/popular")
    public ResponseEntity<Page<Job>> getPopularJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("인기 공고 조회: 페이지={}, 크기={}", page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Job> jobs = jobService.getPopularJobs(pageable);
        
        return ResponseEntity.ok(jobs);
    }

    /**
     * 최신 공고 조회
     */
    @GetMapping("/latest")
    public ResponseEntity<Page<Job>> getLatestJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("최신 공고 조회: 페이지={}, 크기={}", page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Job> jobs = jobService.getLatestJobs(pageable);
        
        return ResponseEntity.ok(jobs);
    }

    /**
     * 구인 공고 검색
     */
    @GetMapping("/search")
    public ResponseEntity<Page<Job>> searchJobs(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("구인 공고 검색: 키워드={}", keyword);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Job> jobs = jobService.searchJobs(keyword, pageable);
        
        return ResponseEntity.ok(jobs);
    }

    /**
     * 복합 조건 검색
     */
    @GetMapping("/filter")
    public ResponseEntity<Page<Job>> searchJobsWithFilters(
            @RequestParam(required = false) Job.JobCategory category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Job.ExperienceLevel experienceLevel,
            @RequestParam(required = false) Job.WorkType workType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("복합 조건 검색: 직종={}, 지역={}, 경력={}, 근무형태={}", 
                category, location, experienceLevel, workType);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Job> jobs = jobService.searchJobsWithFilters(category, location, experienceLevel, workType, pageable);
        
        return ResponseEntity.ok(jobs);
    }

    /**
     * 직종별 공고 조회
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<Page<Job>> getJobsByCategory(
            @PathVariable Job.JobCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("직종별 공고 조회: 직종={}", category);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Job> jobs = jobService.getJobsByCategory(category, pageable);
        
        return ResponseEntity.ok(jobs);
    }

    /**
     * 지역별 공고 조회
     */
    @GetMapping("/location")
    public ResponseEntity<Page<Job>> getJobsByLocation(
            @RequestParam String location,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("지역별 공고 조회: 지역={}", location);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Job> jobs = jobService.getJobsByLocation(location, pageable);
        
        return ResponseEntity.ok(jobs);
    }

    /**
     * 구인 공고 상세 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobDetail(@PathVariable Long id) {
        log.info("구인 공고 상세 조회: ID={}", id);
        
        Job job = jobService.getJobById(id);
        return ResponseEntity.ok(job);
    }

    /**
     * 새 구인 공고 등록
     */
    @PostMapping
    public ResponseEntity<Job> createJob(
            @RequestBody JobCreateRequest request,
            Authentication auth) {
        
        log.info("새 구인 공고 등록: 제목={}", request.getTitle());
        
        Member employer = getCurrentMember(auth);
        if (employer == null) {
            return ResponseEntity.status(401).build();
        }
        
        Job job = jobService.createJob(employer, request);
        return ResponseEntity.ok(job);
    }

    /**
     * 구인 공고 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<Job> updateJob(
            @PathVariable Long id,
            @RequestBody JobUpdateRequest request,
            Authentication auth) {
        
        log.info("구인 공고 수정: ID={}", id);
        
        Member employer = getCurrentMember(auth);
        if (employer == null) {
            return ResponseEntity.status(401).build();
        }
        
        Job job = jobService.updateJob(id, employer, request);
        return ResponseEntity.ok(job);
    }

    /**
     * 구인 공고 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(
            @PathVariable Long id,
            Authentication auth) {
        
        log.info("구인 공고 삭제: ID={}", id);
        
        Member employer = getCurrentMember(auth);
        if (employer == null) {
            return ResponseEntity.status(401).build();
        }
        
        jobService.deleteJob(id, employer);
        return ResponseEntity.noContent().build();
    }

    /**
     * 특정 고용주의 공고 목록 조회
     */
    @GetMapping("/employer/{employerId}")
    public ResponseEntity<Page<Job>> getJobsByEmployer(
            @PathVariable Long employerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("고용주별 공고 조회: 고용주ID={}", employerId);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Job> jobs = jobService.getJobsByEmployer(employerId, pageable);
        
        return ResponseEntity.ok(jobs);
    }

    /**
     * 내 공고 목록 조회 (고용주용)
     */
    @GetMapping("/my")
    public ResponseEntity<Page<Job>> getMyJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth) {
        
        log.info("내 공고 목록 조회");
        
        Member employer = getCurrentMember(auth);
        if (employer == null) {
            return ResponseEntity.status(401).build();
        }
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Job> jobs = jobService.getJobsByEmployer(employer.getId(), pageable);
        
        return ResponseEntity.ok(jobs);
    }

    /**
     * 마감 임박 공고 조회
     */
    @GetMapping("/deadline-approaching")
    public ResponseEntity<List<Job>> getJobsWithUpcomingDeadline() {
        log.info("마감 임박 공고 조회");
        
        List<Job> jobs = jobService.getJobsWithUpcomingDeadline();
        return ResponseEntity.ok(jobs);
    }

    /**
     * 구인 공고 통계 조회
     */
    @GetMapping("/stats/category")
    public ResponseEntity<List<Object[]>> getJobStatsByCategory() {
        log.info("직종별 공고 통계 조회");
        
        List<Object[]> stats = jobService.getJobStatsByCategory();
        return ResponseEntity.ok(stats);
    }

    /**
     * 오늘 등록된 공고 수 조회
     */
    @GetMapping("/stats/today")
    public ResponseEntity<Long> getTodayJobCount() {
        log.info("오늘 등록된 공고 수 조회");
        
        long count = jobService.getTodayJobCount();
        return ResponseEntity.ok(count);
    }

    /**
     * 구인 공고에 지원하기
     */
    @PostMapping("/{jobId}/apply")
    public ResponseEntity<JobApplication> applyToJob(
            @PathVariable Long jobId,
            @RequestBody JobApplicationRequest request,
            Authentication auth) {
        
        log.info("구인 공고 지원: 공고ID={}", jobId);
        
        Member applicant = getCurrentMember(auth);
        if (applicant == null) {
            return ResponseEntity.status(401).build();
        }
        
        JobApplication application = jobApplicationService.applyToJob(jobId, applicant, request);
        return ResponseEntity.ok(application);
    }

    /**
     * 특정 공고의 지원서 목록 조회 (고용주용)
     */
    @GetMapping("/{jobId}/applications")
    public ResponseEntity<Page<JobApplication>> getApplicationsByJob(
            @PathVariable Long jobId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth) {
        
        log.info("공고별 지원서 목록 조회: 공고ID={}", jobId);
        
        Member employer = getCurrentMember(auth);
        if (employer == null) {
            return ResponseEntity.status(401).build();
        }
        
        Pageable pageable = PageRequest.of(page, size);
        Page<JobApplication> applications = jobApplicationService.getApplicationsByJob(jobId, employer, pageable);
        
        return ResponseEntity.ok(applications);
    }

    /**
     * 내 지원 목록 조회 (구직자용)
     */
    @GetMapping("/applications/my")
    public ResponseEntity<Page<JobApplication>> getMyApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth) {
        
        log.info("내 지원 목록 조회");
        
        Member applicant = getCurrentMember(auth);
        if (applicant == null) {
            return ResponseEntity.status(401).build();
        }
        
        Pageable pageable = PageRequest.of(page, size);
        Page<JobApplication> applications = jobApplicationService.getApplicationsByApplicant(applicant.getId(), pageable);
        
        return ResponseEntity.ok(applications);
    }

    /**
     * 지원서 상태 업데이트 (고용주용)
     */
    @PutMapping("/applications/{applicationId}/status")
    public ResponseEntity<JobApplication> updateApplicationStatus(
            @PathVariable Long applicationId,
            @RequestBody ApplicationStatusUpdateRequest request,
            Authentication auth) {
        
        log.info("지원서 상태 업데이트: 지원서ID={}, 상태={}", applicationId, request.getStatus());
        
        Member employer = getCurrentMember(auth);
        if (employer == null) {
            return ResponseEntity.status(401).build();
        }
        
        JobApplication application = jobApplicationService.updateApplicationStatus(
                applicationId, employer, request.getStatus(), request.getEmployerNotes());
        
        return ResponseEntity.ok(application);
    }

    /**
     * 면접 일정 설정 (고용주용)
     */
    @PutMapping("/applications/{applicationId}/interview")
    public ResponseEntity<JobApplication> scheduleInterview(
            @PathVariable Long applicationId,
            @RequestBody InterviewScheduleRequest request,
            Authentication auth) {
        
        log.info("면접 일정 설정: 지원서ID={}", applicationId);
        
        Member employer = getCurrentMember(auth);
        if (employer == null) {
            return ResponseEntity.status(401).build();
        }
        
        JobApplication application = jobApplicationService.scheduleInterview(
                applicationId, employer, request.getDateTime(), 
                request.getLocation(), request.getInterviewType());
        
        return ResponseEntity.ok(application);
    }

    /**
     * 지원 취소 (구직자용)
     */
    @DeleteMapping("/applications/{applicationId}")
    public ResponseEntity<Void> withdrawApplication(
            @PathVariable Long applicationId,
            Authentication auth) {
        
        log.info("지원 취소: 지원서ID={}", applicationId);
        
        Member applicant = getCurrentMember(auth);
        if (applicant == null) {
            return ResponseEntity.status(401).build();
        }
        
        jobApplicationService.withdrawApplication(applicationId, applicant);
        return ResponseEntity.noContent().build();
    }

    /**
     * 현재 인증된 사용자 조회
     */
    private Member getCurrentMember(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            return null;
        }
        
        try {
            return memberService.findByUsername(auth.getName());
        } catch (Exception e) {
            log.warn("사용자 조회 실패: username={}", auth.getName(), e);
            return null;
        }
    }

    // DTO 클래스들 (임시로 내부 클래스로 구현, 추후 별도 파일로 분리 예정)

    public static class JobApplicationRequest {
        private String coverLetter;
        private String resumeFileName;
        private String resumeFilePath;
        private String expectedSalary;
        private String applicantNotes;
        private String contactPhone;
        private String contactEmail;
        
        // Getter/Setter
        public String getCoverLetter() { return coverLetter; }
        public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }
        public String getResumeFileName() { return resumeFileName; }
        public void setResumeFileName(String resumeFileName) { this.resumeFileName = resumeFileName; }
        public String getResumeFilePath() { return resumeFilePath; }
        public void setResumeFilePath(String resumeFilePath) { this.resumeFilePath = resumeFilePath; }
        public String getExpectedSalary() { return expectedSalary; }
        public void setExpectedSalary(String expectedSalary) { this.expectedSalary = expectedSalary; }
        public String getApplicantNotes() { return applicantNotes; }
        public void setApplicantNotes(String applicantNotes) { this.applicantNotes = applicantNotes; }
        public String getContactPhone() { return contactPhone; }
        public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
        public String getContactEmail() { return contactEmail; }
        public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    }

    public static class ApplicationStatusUpdateRequest {
        private JobApplication.ApplicationStatus status;
        private String employerNotes;
        
        // Getter/Setter
        public JobApplication.ApplicationStatus getStatus() { return status; }
        public void setStatus(JobApplication.ApplicationStatus status) { this.status = status; }
        public String getEmployerNotes() { return employerNotes; }
        public void setEmployerNotes(String employerNotes) { this.employerNotes = employerNotes; }
    }

    public static class InterviewScheduleRequest {
        private java.time.LocalDateTime dateTime;
        private String location;
        private JobApplication.InterviewType interviewType;
        
        // Getter/Setter
        public java.time.LocalDateTime getDateTime() { return dateTime; }
        public void setDateTime(java.time.LocalDateTime dateTime) { this.dateTime = dateTime; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public JobApplication.InterviewType getInterviewType() { return interviewType; }
        public void setInterviewType(JobApplication.InterviewType interviewType) { this.interviewType = interviewType; }
    }
}