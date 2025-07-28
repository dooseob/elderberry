package com.globalcarelink.job;

import com.globalcarelink.auth.Member;
import com.globalcarelink.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 구직 지원서 엔티티
 * 구직자가 구인 공고에 지원할 때 생성되는 지원서
 */
@Entity
@Table(name = "job_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JobApplication extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 지원한 구인 공고
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    /**
     * 지원자 (구직자)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_id", nullable = false)
    private Member applicant;

    /**
     * 지원서 상태
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.SUBMITTED;

    /**
     * 자기소개서
     */
    @Column(columnDefinition = "TEXT")
    private String coverLetter;

    /**
     * 이력서 파일명 (업로드된 파일)
     */
    @Column(length = 255)
    private String resumeFileName;

    /**
     * 이력서 파일 경로
     */
    @Column(length = 500)
    private String resumeFilePath;

    /**
     * 희망 급여
     */
    @Column(length = 100)
    private String expectedSalary;

    /**
     * 근무 가능 시작일
     */
    @Column
    private LocalDateTime availableStartDate;

    /**
     * 추가 메모 (지원자가 작성)
     */
    @Column(columnDefinition = "TEXT")
    private String applicantNotes;

    /**
     * 고용주 메모 (HR 담당자가 작성)
     */
    @Column(columnDefinition = "TEXT")
    private String employerNotes;

    /**
     * 면접 일정
     */
    @Column
    private LocalDateTime interviewDateTime;

    /**
     * 면접 장소
     */
    @Column(length = 300)
    private String interviewLocation;

    /**
     * 면접 방식 (대면, 화상, 전화)
     */
    @Enumerated(EnumType.STRING)
    private InterviewType interviewType;

    /**
     * 연락처 (지원자 휴대폰)
     */
    @Column(length = 20)
    private String contactPhone;

    /**
     * 연락처 (지원자 이메일)
     */
    @Column(length = 100)
    private String contactEmail;

    /**
     * 지원서 처리 일시 (최종 결정 시간)
     */
    @Column
    private LocalDateTime processedAt;

    /**
     * 지원서 상태 열거형
     */
    public enum ApplicationStatus {
        SUBMITTED("지원완료"),
        UNDER_REVIEW("검토중"),
        INTERVIEW_SCHEDULED("면접예정"),
        INTERVIEW_COMPLETED("면접완료"),
        ACCEPTED("합격"),
        REJECTED("불합격"),
        WITHDRAWN("지원취소"),
        ON_HOLD("보류");

        private final String displayName;

        ApplicationStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    /**
     * 면접 방식 열거형
     */
    public enum InterviewType {
        IN_PERSON("대면면접"),
        VIDEO_CALL("화상면접"),
        PHONE_CALL("전화면접"),
        ONLINE_TEST("온라인테스트");

        private final String displayName;

        InterviewType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    /**
     * 지원자 이름 반환 (안전한 접근)
     */
    public String getApplicantName() {
        return this.applicant != null ? this.applicant.getName() : "알 수 없음";
    }

    /**
     * 공고 제목 반환 (안전한 접근)
     */
    public String getJobTitle() {
        return this.job != null ? this.job.getTitle() : "알 수 없음";
    }

    /**
     * 회사명 반환 (안전한 접근)
     */
    public String getCompanyName() {
        return this.job != null ? this.job.getCompanyName() : "알 수 없음";
    }

    /**
     * 이력서 파일 존재 여부
     */
    public boolean hasResumeFile() {
        return this.resumeFileName != null && !this.resumeFileName.trim().isEmpty();
    }

    /**
     * 면접 일정 존재 여부
     */
    public boolean hasInterviewScheduled() {
        return this.interviewDateTime != null;
    }

    /**
     * 지원서 검토 시작
     */
    public void startReview() {
        this.status = ApplicationStatus.UNDER_REVIEW;
    }

    /**
     * 면접 일정 설정
     */
    public void scheduleInterview(LocalDateTime dateTime, String location, InterviewType type) {
        this.status = ApplicationStatus.INTERVIEW_SCHEDULED;
        this.interviewDateTime = dateTime;
        this.interviewLocation = location;
        this.interviewType = type;
    }

    /**
     * 면접 완료 처리
     */
    public void completeInterview() {
        this.status = ApplicationStatus.INTERVIEW_COMPLETED;
    }

    /**
     * 합격 처리
     */
    public void accept() {
        this.status = ApplicationStatus.ACCEPTED;
        this.processedAt = LocalDateTime.now();
    }

    /**
     * 불합격 처리
     */
    public void reject() {
        this.status = ApplicationStatus.REJECTED;
        this.processedAt = LocalDateTime.now();
    }

    /**
     * 지원 취소
     */
    public void withdraw() {
        this.status = ApplicationStatus.WITHDRAWN;
        this.processedAt = LocalDateTime.now();
    }

    /**
     * 보류 처리
     */
    public void putOnHold() {
        this.status = ApplicationStatus.ON_HOLD;
    }

    /**
     * 최종 결정 여부 확인
     */
    public boolean isFinalDecisionMade() {
        return this.status == ApplicationStatus.ACCEPTED || 
               this.status == ApplicationStatus.REJECTED || 
               this.status == ApplicationStatus.WITHDRAWN;
    }

    /**
     * 활성 지원서 여부 확인 (취소되지 않은 지원서)
     */
    public boolean isActive() {
        return this.status != ApplicationStatus.WITHDRAWN;
    }
}