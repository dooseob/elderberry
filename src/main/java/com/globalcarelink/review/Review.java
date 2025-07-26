package com.globalcarelink.review;

import com.globalcarelink.auth.Member;
import com.globalcarelink.common.entity.BaseEntity;
import com.globalcarelink.facility.FacilityProfile;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 리뷰 엔티티
 * 시설 및 서비스에 대한 사용자 리뷰 관리
 */
@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Review extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 리뷰 작성자
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private Member reviewer;

    /**
     * 리뷰 대상 시설
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facility_id", nullable = false)
    private FacilityProfile facility;

    /**
     * 리뷰 제목
     */
    @Column(nullable = false, length = 200)
    private String title;

    /**
     * 리뷰 내용
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    /**
     * 전체 평점 (1.0 ~ 5.0)
     */
    @Column(nullable = false, precision = 2, scale = 1)
    private BigDecimal overallRating;

    /**
     * 서비스 품질 평점
     */
    @Column(precision = 2, scale = 1)
    private BigDecimal serviceQualityRating;

    /**
     * 시설 환경 평점
     */
    @Column(precision = 2, scale = 1)
    private BigDecimal facilityRating;

    /**
     * 직원 친절도 평점
     */
    @Column(precision = 2, scale = 1)
    private BigDecimal staffRating;

    /**
     * 가격 만족도 평점
     */
    @Column(precision = 2, scale = 1)
    private BigDecimal priceRating;

    /**
     * 접근성 평점
     */
    @Column(precision = 2, scale = 1)
    private BigDecimal accessibilityRating;

    /**
     * 리뷰 타입
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReviewType reviewType = ReviewType.FACILITY;

    /**
     * 리뷰 상태
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReviewStatus status = ReviewStatus.ACTIVE;

    /**
     * 추천 여부 (시설을 다른 사람에게 추천하겠는가)
     */
    @Column(nullable = false)
    private Boolean recommended = true;

    /**
     * 방문 날짜
     */
    @Column
    private LocalDateTime visitDate;

    /**
     * 서비스 이용 기간 (일 단위)
     */
    @Column
    private Integer serviceDurationDays;

    /**
     * 도움이 된다고 투표한 수
     */
    @Column(nullable = false)
    private Integer helpfulCount = 0;

    /**
     * 도움이 안 된다고 투표한 수
     */
    @Column(nullable = false)
    private Integer notHelpfulCount = 0;

    /**
     * 신고 횟수
     */
    @Column(nullable = false)
    private Integer reportCount = 0;

    /**
     * 관리자 응답
     */
    @Column(columnDefinition = "TEXT")
    private String adminResponse;

    /**
     * 관리자 응답 일시
     */
    @Column
    private LocalDateTime adminResponseDate;

    /**
     * 관리자 응답 작성자
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_responder_id")
    private Member adminResponder;

    /**
     * 검증된 리뷰 여부 (실제 이용자 확인)
     */
    @Column(nullable = false)
    private Boolean verified = false;

    /**
     * 익명 리뷰 여부
     */
    @Column(nullable = false)
    private Boolean anonymous = false;

    /**
     * 첨부 이미지 URL 목록
     */
    @ElementCollection
    @CollectionTable(name = "review_images", joinColumns = @JoinColumn(name = "review_id"))
    @Column(name = "image_url", length = 500)
    private List<String> imageUrls = new ArrayList<>();

    /**
     * 태그 목록 (장점/단점 태그)
     */
    @ElementCollection
    @CollectionTable(name = "review_tags", joinColumns = @JoinColumn(name = "review_id"))
    @Column(name = "tag", length = 50)
    private List<String> tags = new ArrayList<>();

    /**
     * 리뷰 타입 열거형
     */
    public enum ReviewType {
        FACILITY("시설 리뷰"),
        SERVICE("서비스 리뷰"),
        CAREGIVER("요양보호사 리뷰"),
        PROGRAM("프로그램 리뷰");

        private final String displayName;

        ReviewType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    /**
     * 리뷰 상태 열거형
     */
    public enum ReviewStatus {
        ACTIVE("활성"),
        PENDING("검토중"),
        BLOCKED("차단됨"),
        DELETED("삭제됨");

        private final String displayName;

        ReviewStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    /**
     * 리뷰어 이름 반환 (익명 처리 고려)
     */
    public String getReviewerDisplayName() {
        if (this.anonymous || this.reviewer == null) {
            return "익명";
        }
        return this.reviewer.getName();
    }

    /**
     * 시설명 반환 (안전한 접근)
     */
    public String getFacilityName() {
        return this.facility != null ? this.facility.getName() : "알 수 없음";
    }

    /**
     * 평균 세부 평점 계산
     */
    public BigDecimal getAverageDetailRating() {
        int count = 0;
        BigDecimal sum = BigDecimal.ZERO;

        if (serviceQualityRating != null) {
            sum = sum.add(serviceQualityRating);
            count++;
        }
        if (facilityRating != null) {
            sum = sum.add(facilityRating);
            count++;
        }
        if (staffRating != null) {
            sum = sum.add(staffRating);
            count++;
        }
        if (priceRating != null) {
            sum = sum.add(priceRating);
            count++;
        }
        if (accessibilityRating != null) {
            sum = sum.add(accessibilityRating);
            count++;
        }

        if (count == 0) {
            return BigDecimal.ZERO;
        }

        return sum.divide(BigDecimal.valueOf(count), 1, BigDecimal.ROUND_HALF_UP);
    }


    /**
     * 이미지 첨부 여부
     */
    public boolean hasImages() {
        return imageUrls != null && !imageUrls.isEmpty();
    }

    /**
     * 태그 존재 여부
     */
    public boolean hasTags() {
        return tags != null && !tags.isEmpty();
    }

    /**
     * 관리자 응답 존재 여부
     */
    public boolean hasAdminResponse() {
        return adminResponse != null && !adminResponse.trim().isEmpty();
    }

    /**
     * 도움됨 투표 증가
     */
    public void incrementHelpfulVote() {
        this.helpfulCount = (this.helpfulCount != null ? this.helpfulCount : 0) + 1;
    }

    /**
     * 도움됨 투표 감소
     */
    public void decrementHelpfulVote() {
        this.helpfulCount = Math.max(0, (this.helpfulCount != null ? this.helpfulCount : 0) - 1);
    }

    /**
     * 도움 안됨 투표 증가
     */
    public void incrementNotHelpfulVote() {
        this.notHelpfulCount = (this.notHelpfulCount != null ? this.notHelpfulCount : 0) + 1;
    }

    /**
     * 도움 안됨 투표 감소
     */
    public void decrementNotHelpfulVote() {
        this.notHelpfulCount = Math.max(0, (this.notHelpfulCount != null ? this.notHelpfulCount : 0) - 1);
    }

    /**
     * 신고 횟수 증가
     */
    public void incrementReportCount() {
        this.reportCount = (this.reportCount != null ? this.reportCount : 0) + 1;
        
        // 신고 횟수가 임계값을 초과하면 자동으로 검토 상태로 변경
        if (this.reportCount >= 5) {
            this.status = ReviewStatus.PENDING;
        }
    }

    /**
     * 관리자 응답 추가
     */
    public void addAdminResponse(String response, Member admin) {
        this.adminResponse = response;
        this.adminResponseDate = LocalDateTime.now();
        this.adminResponder = admin;
    }

    /**
     * 리뷰 차단
     */
    public void block() {
        this.status = ReviewStatus.BLOCKED;
    }

    /**
     * 리뷰 활성화
     */
    public void activate() {
        this.status = ReviewStatus.ACTIVE;
    }

    /**
     * 리뷰 삭제 (soft delete)
     */
    public void delete() {
        this.status = ReviewStatus.DELETED;
    }

    /**
     * 검증 상태 설정
     */
    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    /**
     * 이미지 추가
     */
    public void addImageUrl(String imageUrl) {
        if (this.imageUrls == null) {
            this.imageUrls = new ArrayList<>();
        }
        this.imageUrls.add(imageUrl);
    }

    /**
     * 태그 추가
     */
    public void addTag(String tag) {
        if (this.tags == null) {
            this.tags = new ArrayList<>();
        }
        if (!this.tags.contains(tag)) {
            this.tags.add(tag);
        }
    }

    /**
     * 활성 리뷰 여부 확인
     */
    public boolean isActive() {
        return this.status == ReviewStatus.ACTIVE;
    }

    /**
     * 수정 가능 여부 확인 (작성자 본인만 가능, 24시간 이내)
     */
    public boolean isEditable(Member member) {
        if (!this.reviewer.equals(member)) {
            return false;
        }
        
        if (this.status != ReviewStatus.ACTIVE) {
            return false;
        }
        
        // 24시간 이내만 수정 가능
        LocalDateTime cutoff = this.getCreatedDate().plusHours(24);
        return LocalDateTime.now().isBefore(cutoff);
    }
}