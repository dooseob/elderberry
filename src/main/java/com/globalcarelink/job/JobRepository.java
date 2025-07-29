package com.globalcarelink.job;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 구인 공고 Repository
 * 구인 공고 데이터 접근 및 조회 메서드 제공
 */
@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    /**
     * 활성 공고 조회 (마감일 기준 정렬)
     */
    @Query("SELECT j FROM Job j WHERE j.status = 'ACTIVE' AND j.applicationDeadline >= CURRENT_DATE ORDER BY j.isUrgent DESC, j.isFeatured DESC, j.createdAt DESC")
    Page<Job> findActiveJobs(Pageable pageable);

    /**
     * 긴급 채용 공고 조회
     */
    @Query("SELECT j FROM Job j WHERE j.status = 'ACTIVE' AND j.isUrgent = true AND j.applicationDeadline >= CURRENT_DATE ORDER BY j.createdAt DESC")
    Page<Job> findUrgentJobs(Pageable pageable);

    /**
     * 추천 공고 조회 (상위 노출)
     */
    @Query("SELECT j FROM Job j WHERE j.status = 'ACTIVE' AND j.isFeatured = true AND j.applicationDeadline >= CURRENT_DATE ORDER BY j.createdAt DESC")
    Page<Job> findFeaturedJobs(Pageable pageable);

    /**
     * 직종별 공고 조회
     */
    @Query("SELECT j FROM Job j WHERE j.category = :category AND j.status = 'ACTIVE' AND j.applicationDeadline >= CURRENT_DATE ORDER BY j.isUrgent DESC, j.createdAt DESC")
    Page<Job> findByCategory(@Param("category") Job.JobCategory category, Pageable pageable);

    /**
     * 근무 형태별 공고 조회
     */
    @Query("SELECT j FROM Job j WHERE j.workType = :workType AND j.status = 'ACTIVE' AND j.applicationDeadline >= CURRENT_DATE ORDER BY j.createdAt DESC")
    Page<Job> findByWorkType(@Param("workType") Job.WorkType workType, Pageable pageable);

    /**
     * 경력별 공고 조회
     */
    @Query("SELECT j FROM Job j WHERE j.experienceLevel = :experienceLevel AND j.status = 'ACTIVE' AND j.applicationDeadline >= CURRENT_DATE ORDER BY j.createdAt DESC")
    Page<Job> findByExperienceLevel(@Param("experienceLevel") Job.ExperienceLevel experienceLevel, Pageable pageable);

    /**
     * 지역별 공고 조회 (주소 기반)
     */
    @Query("SELECT j FROM Job j WHERE j.workLocation LIKE %:location% AND j.status = 'ACTIVE' AND j.applicationDeadline >= CURRENT_DATE ORDER BY j.createdAt DESC")
    Page<Job> findByLocationContaining(@Param("location") String location, Pageable pageable);

    /**
     * 회사명으로 공고 검색
     */
    @Query("SELECT j FROM Job j WHERE j.companyName LIKE %:companyName% AND j.status = 'ACTIVE' AND j.applicationDeadline >= CURRENT_DATE ORDER BY j.createdAt DESC")
    Page<Job> findByCompanyNameContaining(@Param("companyName") String companyName, Pageable pageable);

    /**
     * 제목으로 공고 검색
     */
    @Query("SELECT j FROM Job j WHERE j.title LIKE %:keyword% AND j.status = 'ACTIVE' AND j.applicationDeadline >= CURRENT_DATE ORDER BY j.createdAt DESC")
    Page<Job> findByTitleContaining(@Param("keyword") String keyword, Pageable pageable);

    /**
     * 통합 검색 (제목 + 회사명 + 내용)
     */
    @Query("SELECT j FROM Job j WHERE (j.title LIKE %:keyword% OR j.companyName LIKE %:keyword% OR j.description LIKE %:keyword%) AND j.status = 'ACTIVE' AND j.applicationDeadline >= CURRENT_DATE ORDER BY j.isUrgent DESC, j.createdAt DESC")
    Page<Job> findByKeywordSearch(@Param("keyword") String keyword, Pageable pageable);

    /**
     * 급여 범위로 공고 검색
     */
    @Query("SELECT j FROM Job j WHERE j.minSalary >= :minSalary AND j.status = 'ACTIVE' AND j.applicationDeadline >= CURRENT_DATE ORDER BY j.minSalary DESC")
    Page<Job> findBySalaryRange(@Param("minSalary") BigDecimal minSalary, Pageable pageable);

    /**
     * 복합 조건 검색 (직종 + 지역 + 경력)
     */
    @Query("SELECT j FROM Job j WHERE " +
           "(:category IS NULL OR j.category = :category) AND " +
           "(:location IS NULL OR j.workLocation LIKE %:location%) AND " +
           "(:experienceLevel IS NULL OR j.experienceLevel = :experienceLevel) AND " +
           "(:workType IS NULL OR j.workType = :workType) AND " +
           "j.status = 'ACTIVE' AND j.applicationDeadline >= CURRENT_DATE " +
           "ORDER BY j.isUrgent DESC, j.isFeatured DESC, j.createdAt DESC")
    Page<Job> findByMultipleConditions(
            @Param("category") Job.JobCategory category,
            @Param("location") String location,
            @Param("experienceLevel") Job.ExperienceLevel experienceLevel,
            @Param("workType") Job.WorkType workType,
            Pageable pageable
    );

    /**
     * 특정 고용주의 공고 조회
     */
    @Query("SELECT j FROM Job j WHERE j.employer.id = :employerId ORDER BY j.createdAt DESC")
    Page<Job> findByEmployerId(@Param("employerId") Long employerId, Pageable pageable);

    /**
     * 마감 임박 공고 조회 (3일 이내)
     */
    @Query("SELECT j FROM Job j WHERE j.status = 'ACTIVE' AND j.applicationDeadline BETWEEN CURRENT_DATE AND :deadline ORDER BY j.applicationDeadline ASC")
    List<Job> findJobsWithUpcomingDeadline(@Param("deadline") LocalDate deadline);

    /**
     * 인기 공고 조회 (조회수 기준)
     */
    @Query("SELECT j FROM Job j WHERE j.status = 'ACTIVE' AND j.applicationDeadline >= CURRENT_DATE ORDER BY j.viewCount DESC, j.createdAt DESC")
    Page<Job> findPopularJobs(Pageable pageable);

    /**
     * 최신 공고 조회 (등록일 기준)
     */
    @Query("SELECT j FROM Job j WHERE j.status = 'ACTIVE' AND j.applicationDeadline >= CURRENT_DATE ORDER BY j.createdAt DESC")
    Page<Job> findLatestJobs(Pageable pageable);

    /**
     * 조회수 증가
     */
    @Modifying
    @Query("UPDATE Job j SET j.viewCount = j.viewCount + 1 WHERE j.id = :jobId")
    void incrementViewCount(@Param("jobId") Long jobId);

    /**
     * 특정 직종의 공고 수 조회
     */
    @Query("SELECT COUNT(j) FROM Job j WHERE j.category = :category AND j.status = 'ACTIVE' AND j.applicationDeadline >= CURRENT_DATE")
    long countActiveJobsByCategory(@Param("category") Job.JobCategory category);

    /**
     * 특정 고용주의 활성 공고 수 조회
     */
    @Query("SELECT COUNT(j) FROM Job j WHERE j.employer.id = :employerId AND j.status = 'ACTIVE' AND j.applicationDeadline >= CURRENT_DATE")
    long countActiveJobsByEmployer(@Param("employerId") Long employerId);

    /**
     * 오늘 등록된 공고 수 조회
     */
    @Query("SELECT COUNT(j) FROM Job j WHERE CAST(j.createdAt AS date) = CURRENT_DATE AND j.status = 'ACTIVE'")
    long countTodayJobs();

    /**
     * 마감된 공고 자동 업데이트 (배치 작업용)
     */
    @Modifying
    @Query("UPDATE Job j SET j.status = 'CLOSED' WHERE j.status = 'ACTIVE' AND j.applicationDeadline < CURRENT_DATE")
    int updateExpiredJobsToclosed();

    /**
     * 위치 기반 검색 (위도, 경도 반경 내)
     * 참고: 실제 거리 계산은 서비스 레이어에서 처리
     */
    @Query("SELECT j FROM Job j WHERE j.latitude BETWEEN :minLat AND :maxLat AND j.longitude BETWEEN :minLng AND :maxLng AND j.status = 'ACTIVE' AND j.applicationDeadline >= CURRENT_DATE")
    List<Job> findJobsInLocationRange(
            @Param("minLat") BigDecimal minLat,
            @Param("maxLat") BigDecimal maxLat,
            @Param("minLng") BigDecimal minLng,
            @Param("maxLng") BigDecimal maxLng
    );

    /**
     * 특정 공고의 지원자 수 조회
     */
    @Query("SELECT COUNT(ja) FROM JobApplication ja WHERE ja.job.id = :jobId")
    long countApplicationsByJobId(@Param("jobId") Long jobId);

    /**
     * 공고 ID와 고용주 ID로 조회 (수정/삭제 권한 확인용)
     */
    Optional<Job> findByIdAndEmployerId(Long id, Long employerId);

    /**
     * 통계용: 직종별 공고 수
     */
    @Query("SELECT j.category, COUNT(j) FROM Job j WHERE j.status = 'ACTIVE' AND j.applicationDeadline >= CURRENT_DATE GROUP BY j.category")
    List<Object[]> getJobStatsByCategory();

    /**
     * 통계용: 지역별 공고 수 (H2 호환)
     */
    @Query("SELECT j.workLocation, COUNT(j) FROM Job j WHERE j.status = 'ACTIVE' AND j.applicationDeadline >= CURRENT_DATE GROUP BY j.workLocation")
    List<Object[]> getJobStatsByLocation();
}