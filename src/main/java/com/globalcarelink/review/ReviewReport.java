package com.globalcarelink.review;

import com.globalcarelink.auth.Member;
import com.globalcarelink.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 리뷰 신고 엔티티
 * 부적절한 리뷰 신고 관리
 */
@Entity
@Table(name = "review_reports",
       uniqueConstraints = @UniqueConstraint(columnNames = {"review_id", "reporter_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewReport extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 신고 대상 리뷰
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    /**
     * 신고자
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private Member reporter;

    /**
     * 신고 사유
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportReason reason;

    /**
     * 신고 상세 설명
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * 신고 처리 상태
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportStatus status = ReportStatus.PENDING;

    /**
     * 처리 결과
     */
    @Column(columnDefinition = "TEXT")
    private String resolution;

    /**
     * 처리 일시
     */
    @Column
    private LocalDateTime resolvedAt;

    /**
     * 처리 담당자
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolver_id")
    private Member resolver;

    /**
     * 신고 사유 열거형
     */
    public enum ReportReason {
        INAPPROPRIATE_CONTENT("부적절한 내용"),
        SPAM("스팸"),
        FAKE_REVIEW("가짜 리뷰"),
        OFFENSIVE_LANGUAGE("욕설/비방"),
        PRIVACY_VIOLATION("개인정보 노출"),
        COPYRIGHT_VIOLATION("저작권 침해"),
        COMMERCIAL_PROMOTION("상업적 홍보"),
        UNRELATED_CONTENT("관련 없는 내용"),
        OTHER("기타");

        private final String displayName;

        ReportReason(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    /**
     * 신고 처리 상태 열거형
     */
    public enum ReportStatus {
        PENDING("처리 대기"),
        UNDER_REVIEW("검토 중"),
        RESOLVED("해결됨"),
        REJECTED("기각됨");

        private final String displayName;

        ReportStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    /**
     * 신고자 이름 반환 (안전한 접근)
     */
    public String getReporterName() {
        return this.reporter != null ? this.reporter.getName() : "알 수 없음";
    }

    /**
     * 리뷰 ID 반환 (안전한 접근)
     */
    public Long getReviewId() {
        return this.review != null ? this.review.getId() : null;
    }

    /**
     * 처리자 이름 반환 (안전한 접근)
     */
    public String getResolverName() {
        return this.resolver != null ? this.resolver.getName() : null;
    }

    /**
     * 신고 해결 처리
     */
    public void resolve(String resolution, Member resolver) {
        this.status = ReportStatus.RESOLVED;
        this.resolution = resolution;
        this.resolvedAt = LocalDateTime.now();
        this.resolver = resolver;
    }

    /**
     * 신고 기각 처리
     */
    public void reject(String resolution, Member resolver) {
        this.status = ReportStatus.REJECTED;
        this.resolution = resolution;
        this.resolvedAt = LocalDateTime.now();
        this.resolver = resolver;
    }

    /**
     * 검토 시작
     */
    public void startReview() {
        this.status = ReportStatus.UNDER_REVIEW;
    }

    /**
     * 처리 완료 여부 확인
     */
    public boolean isResolved() {
        return this.status == ReportStatus.RESOLVED || this.status == ReportStatus.REJECTED;
    }

    /**
     * 처리 대기 중인지 확인
     */
    public boolean isPending() {
        return this.status == ReportStatus.PENDING;
    }
}