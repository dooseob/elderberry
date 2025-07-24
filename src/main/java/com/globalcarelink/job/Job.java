package com.globalcarelink.job;

import com.globalcarelink.auth.Member;
import com.globalcarelink.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 구인 공고 엔티티
 * 요양원, 병원 등에서 올리는 구인 공고
 */
@Entity
@Table(name = "jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Job extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 공고 제목
     */
    @Column(nullable = false, length = 200)
    private String title;

    /**
     * 공고 내용 (상세 설명)
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    /**
     * 작성자 (시설 관리자 또는 HR 담당자)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", nullable = false)
    private Member employer;

    /**
     * 회사명 (시설명)
     */
    @Column(nullable = false, length = 100)
    private String companyName;

    /**
     * 업무 위치 (주소)
     */
    @Column(nullable = false, length = 300)
    private String workLocation;

    /**
     * 상세 주소
     */
    @Column(length = 300)
    private String detailAddress;

    /**
     * 위도 (지도 표시용)
     */
    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;

    /**
     * 경도 (지도 표시용)
     */
    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;

    /**
     * 직종 카테고리
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobCategory category;

    /**
     * 급여 유형
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SalaryType salaryType;

    /**
     * 최소 급여
     */
    @Column(precision = 12, scale = 2)
    private BigDecimal minSalary;

    /**
     * 최대 급여
     */
    @Column(precision = 12, scale = 2)
    private BigDecimal maxSalary;

    /**
     * 경력 요구사항
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExperienceLevel experienceLevel;

    /**
     * 최소 경력 년수
     */
    @Column
    private Integer minExperienceYears;

    /**
     * 근무 형태
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkType workType;

    /**
     * 근무 시간 (예: "09:00-18:00")
     */
    @Column(length = 100)
    private String workHours;

    /**
     * 모집 인원
     */
    @Column(nullable = false)
    private Integer recruitCount = 1;

    /**
     * 채용 마감일
     */
    @Column(nullable = false)
    private LocalDate applicationDeadline;

    /**
     * 우대 사항
     */
    @Column(columnDefinition = "TEXT")
    private String preferredQualifications;

    /**
     * 복리후생
     */
    @Column(columnDefinition = "TEXT")
    private String benefits;

    /**
     * 연락처 (전화번호)
     */
    @Column(length = 20)
    private String contactPhone;

    /**
     * 연락처 (이메일)
     */
    @Column(length = 100)
    private String contactEmail;

    /**
     * 담당자명
     */
    @Column(length = 50)
    private String contactPerson;

    /**
     * 조회수
     */
    @Column(nullable = false)
    private Long viewCount = 0L;

    /**
     * 공고 상태
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobStatus status = JobStatus.ACTIVE;

    /**
     * 긴급 채용 여부
     */
    @Column(nullable = false)
    private Boolean isUrgent = false;

    /**
     * 상위 노출 여부 (유료 옵션)
     */
    @Column(nullable = false)
    private Boolean isFeatured = false;

    /**
     * 해당 공고의 지원서 목록
     */
    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<JobApplication> applications = new ArrayList<>();

    /**
     * 직종 카테고리 열거형
     */
    public enum JobCategory {
        CAREGIVER("요양보호사"),
        NURSE("간병인"),
        PHYSICAL_THERAPIST("물리치료사"),
        OCCUPATIONAL_THERAPIST("작업치료사"),
        SOCIAL_WORKER("사회복지사"),
        FACILITY_MANAGER("시설관리자"),
        ADMINISTRATOR("사무직"),
        DRIVER("운전기사"),
        COOK("조리사"),
        CLEANER("청소원"),
        OTHER("기타");

        private final String displayName;

        JobCategory(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    /**
     * 급여 유형 열거형
     */
    public enum SalaryType {
        HOURLY("시급"),
        DAILY("일급"),
        MONTHLY("월급"),
        ANNUAL("연봉"),
        NEGOTIABLE("협의");

        private final String displayName;

        SalaryType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    /**
     * 경력 수준 열거형
     */
    public enum ExperienceLevel {
        ENTRY("신입"),
        JUNIOR("경력 1-3년"),
        SENIOR("경력 3-5년"),
        EXPERT("경력 5년 이상"),
        ANY("경력무관");

        private final String displayName;

        ExperienceLevel(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    /**
     * 근무 형태 열거형
     */
    public enum WorkType {
        FULL_TIME("정규직"),
        PART_TIME("계약직"),
        CONTRACT("파트타임"),
        SHIFT("교대근무"),
        FLEXIBLE("유연근무");

        private final String displayName;

        WorkType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    /**
     * 공고 상태 열거형
     */
    public enum JobStatus {
        ACTIVE("모집중"),
        CLOSED("마감"),
        SUSPENDED("임시중단"),
        DELETED("삭제됨");

        private final String displayName;

        JobStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    /**
     * 조회수 증가
     */
    public void incrementViewCount() {
        this.viewCount = (this.viewCount != null ? this.viewCount : 0) + 1;
    }

    /**
     * 지원자 수 조회
     */
    public int getApplicationCount() {
        return this.applications != null ? this.applications.size() : 0;
    }

    /**
     * 마감일 임박 여부 확인 (3일 이내)
     */
    public boolean isDeadlineApproaching() {
        return this.applicationDeadline != null && 
               LocalDate.now().plusDays(3).isAfter(this.applicationDeadline);
    }

    /**
     * 마감일 지남 여부 확인
     */
    public boolean isExpired() {
        return this.applicationDeadline != null && 
               LocalDate.now().isAfter(this.applicationDeadline);
    }

    /**
     * 급여 범위 문자열 반환
     */
    public String getSalaryRange() {
        if (salaryType == SalaryType.NEGOTIABLE) {
            return "협의";
        }
        
        StringBuilder sb = new StringBuilder();
        if (minSalary != null) {
            sb.append(String.format("%,.0f", minSalary));
        }
        if (maxSalary != null && !maxSalary.equals(minSalary)) {
            if (minSalary != null) {
                sb.append(" ~ ");
            }
            sb.append(String.format("%,.0f", maxSalary));
        }
        sb.append("원 (").append(salaryType.getDisplayName()).append(")");
        
        return sb.toString();
    }

    /**
     * 공고 마감 처리
     */
    public void close() {
        this.status = JobStatus.CLOSED;
    }

    /**
     * 공고 일시 중단
     */
    public void suspend() {
        this.status = JobStatus.SUSPENDED;
    }

    /**
     * 공고 재활성화
     */
    public void reactivate() {
        if (this.status != JobStatus.DELETED && !isExpired()) {
            this.status = JobStatus.ACTIVE;
        }
    }
}