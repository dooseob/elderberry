package com.globalcarelink.job;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 구직 지원서 Repository
 * 지원서 데이터 접근 및 조회 메서드 제공
 */
@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    /**
     * 특정 공고의 지원서 목록 조회
     */
    @Query("SELECT ja FROM JobApplication ja WHERE ja.job.id = :jobId ORDER BY ja.createdAt DESC")
    Page<JobApplication> findByJobId(@Param("jobId") Long jobId, Pageable pageable);

    /**
     * 특정 지원자의 지원서 목록 조회
     */
    @Query("SELECT ja FROM JobApplication ja WHERE ja.applicant.id = :applicantId ORDER BY ja.createdAt DESC")
    Page<JobApplication> findByApplicantId(@Param("applicantId") Long applicantId, Pageable pageable);

    /**
     * 특정 공고에 대한 특정 지원자의 지원서 조회
     */
    Optional<JobApplication> findByJobIdAndApplicantId(Long jobId, Long applicantId);

    /**
     * ID와 지원자 ID로 지원서 조회 (수정/삭제 권한 확인용)
     */
    Optional<JobApplication> findByIdAndApplicantId(Long id, Long applicantId);

    /**
     * 상태별 지원서 조회
     */
    @Query("SELECT ja FROM JobApplication ja WHERE ja.status = :status ORDER BY ja.createdAt DESC")
    Page<JobApplication> findByStatus(@Param("status") JobApplication.ApplicationStatus status, Pageable pageable);

    /**
     * 특정 공고의 상태별 지원서 조회
     */
    @Query("SELECT ja FROM JobApplication ja WHERE ja.job.id = :jobId AND ja.status = :status ORDER BY ja.createdAt DESC")
    Page<JobApplication> findByJobIdAndStatus(
            @Param("jobId") Long jobId, 
            @Param("status") JobApplication.ApplicationStatus status, 
            Pageable pageable
    );

    /**
     * 면접 예정 지원서 조회
     */
    @Query("SELECT ja FROM JobApplication ja WHERE ja.status = 'INTERVIEW_SCHEDULED' AND ja.interviewDateTime BETWEEN :startDate AND :endDate ORDER BY ja.interviewDateTime ASC")
    List<JobApplication> findInterviewScheduled(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * 특정 공고의 지원자 수 조회
     */
    @Query("SELECT COUNT(ja) FROM JobApplication ja WHERE ja.job.id = :jobId")
    long countByJobId(@Param("jobId") Long jobId);

    /**
     * 특정 공고의 상태별 지원자 수 조회
     */
    @Query("SELECT COUNT(ja) FROM JobApplication ja WHERE ja.job.id = :jobId AND ja.status = :status")
    long countByJobIdAndStatus(@Param("jobId") Long jobId, @Param("status") JobApplication.ApplicationStatus status);

    /**
     * 특정 지원자의 지원 공고 수 조회
     */
    @Query("SELECT COUNT(ja) FROM JobApplication ja WHERE ja.applicant.id = :applicantId")
    long countByApplicantId(@Param("applicantId") Long applicantId);

    /**
     * 오늘 접수된 지원서 수 조회
     */
    @Query("SELECT COUNT(ja) FROM JobApplication ja WHERE CAST(ja.createdAt AS date) = CURRENT_DATE")
    long countTodayApplications();

    /**
     * 특정 기간 내 지원서 조회
     */
    @Query("SELECT ja FROM JobApplication ja WHERE ja.createdAt BETWEEN :startDate AND :endDate ORDER BY ja.createdAt DESC")
    Page<JobApplication> findByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    /**
     * 중복 지원 방지를 위한 존재 여부 확인
     */
    boolean existsByJobIdAndApplicantId(Long jobId, Long applicantId);

    /**
     * 특정 고용주의 공고에 대한 지원서 조회 (고용주용)
     */
    @Query("SELECT ja FROM JobApplication ja WHERE ja.job.employer.id = :employerId ORDER BY ja.createdAt DESC")
    Page<JobApplication> findByEmployerId(@Param("employerId") Long employerId, Pageable pageable);

    /**
     * 이력서 파일이 있는 지원서 조회
     */
    @Query("SELECT ja FROM JobApplication ja WHERE ja.resumeFileName IS NOT NULL ORDER BY ja.createdAt DESC")
    Page<JobApplication> findApplicationsWithResume(Pageable pageable);

    /**
     * 연락처 정보가 있는 지원서 조회
     */
    @Query("SELECT ja FROM JobApplication ja WHERE ja.contactPhone IS NOT NULL OR ja.contactEmail IS NOT NULL ORDER BY ja.createdAt DESC")
    Page<JobApplication> findApplicationsWithContact(Pageable pageable);
}