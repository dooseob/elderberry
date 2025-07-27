package com.globalcarelink.facility;

import com.globalcarelink.common.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 시설 매칭 이력 추적 엔티티
 * 매칭 성공률, 사용자 만족도, 추천 정확도 측정을 위한 데이터 수집
 */
@Entity
@Table(name = "facility_matching_history")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacilityMatchingHistory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 매칭 요청 정보
    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private Long facilityId;

    @Column(nullable = false)
    private String coordinatorId;

    // 매칭 점수 및 랭킹
    @Column(precision = 5, scale = 2)
    @DecimalMin(value = "0.0", message = "매칭 점수는 0 이상이어야 합니다")
    @DecimalMax(value = "100.0", message = "매칭 점수는 100 이하여야 합니다")
    private BigDecimal initialMatchScore;

    @Column(nullable = false)
    @Min(value = 1, message = "추천 순위는 1 이상이어야 합니다")
    private Integer recommendationRank;

    // 매칭 진행 상태
    @Column(name = "was_viewed")
    @Builder.Default
    private Boolean wasViewed = false;

    @Column(name = "was_contacted")
    @Builder.Default
    private Boolean wasContacted = false;

    @Column(name = "was_visited")
    @Builder.Default
    private Boolean wasVisited = false;

    @Column(name = "was_selected")
    @Builder.Default
    private Boolean wasSelected = false;

    // 매칭 상태
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private MatchingStatus status = MatchingStatus.PENDING;

    @Enumerated(EnumType.STRING)
    private MatchingOutcome outcome;

    // 피드백 및 만족도
    @Column(precision = 3, scale = 1)
    @DecimalMin(value = "1.0", message = "만족도는 1.0 이상이어야 합니다")
    @DecimalMax(value = "5.0", message = "만족도는 5.0 이하여야 합니다")
    private BigDecimal userSatisfactionScore;

    @Column(length = 1000)
    private String userFeedback;

    // 시간 추적
    private LocalDateTime viewedAt;
    private LocalDateTime contactedAt;
    private LocalDateTime visitedAt;
    private LocalDateTime selectedAt;
    private LocalDateTime completedAt;

    // 매칭에 사용된 기준 정보 (JSON 형태로 저장)
    @Column(columnDefinition = "TEXT")
    private String matchingCriteria;

    @Column(columnDefinition = "TEXT")
    private String facilitySnapshot;

    // 매칭 성과 지표
    @Column(precision = 10, scale = 2)
    private BigDecimal estimatedCost;

    @Column(precision = 10, scale = 2)
    private BigDecimal actualCost;

    public enum MatchingStatus {
        PENDING("대기중"),
        IN_PROGRESS("진행중"),
        COMPLETED("완료"),
        CANCELLED("취소"),
        FAILED("실패");

        private final String description;

        MatchingStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    public enum MatchingOutcome {
        CONTRACT_SIGNED("계약체결"),
        USER_REJECTED("사용자거부"),
        FACILITY_REJECTED("시설거부"),
        BETTER_OPTION_FOUND("더나은옵션발견"),
        BUDGET_EXCEEDED("예산초과"),
        LOCATION_ISSUE("위치문제"),
        SERVICE_MISMATCH("서비스불일치"),
        OTHER("기타");

        private final String description;

        MatchingOutcome(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    // 비즈니스 로직 메서드들

    /**
     * 사용자가 시설을 조회했을 때 호출
     */
    public void markAsViewed() {
        this.wasViewed = true;
        this.viewedAt = LocalDateTime.now();
        if (this.status == MatchingStatus.PENDING) {
            this.status = MatchingStatus.IN_PROGRESS;
        }
    }

    /**
     * 사용자가 시설에 연락했을 때 호출
     */
    public void markAsContacted() {
        this.wasContacted = true;
        this.contactedAt = LocalDateTime.now();
        this.status = MatchingStatus.IN_PROGRESS;
    }

    /**
     * 사용자가 시설을 방문했을 때 호출
     */
    public void markAsVisited() {
        this.wasVisited = true;
        this.visitedAt = LocalDateTime.now();
        this.status = MatchingStatus.IN_PROGRESS;
    }

    /**
     * 사용자가 시설을 선택했을 때 호출
     */
    public void markAsSelected(MatchingOutcome outcome) {
        this.wasSelected = true;
        this.selectedAt = LocalDateTime.now();
        this.outcome = outcome;
        
        if (outcome == MatchingOutcome.CONTRACT_SIGNED) {
            this.status = MatchingStatus.COMPLETED;
            this.completedAt = LocalDateTime.now();
        } else {
            this.status = MatchingStatus.FAILED;
        }
    }

    /**
     * 계약 완료로 표시
     */
    public void markAsContracted() {
        this.status = MatchingStatus.COMPLETED;
        this.outcome = MatchingOutcome.CONTRACT_SIGNED;
        this.completedAt = LocalDateTime.now();
        this.wasSelected = true;
    }

    /**
     * 사용자 피드백 및 만족도 업데이트
     */
    public void updateFeedback(BigDecimal satisfactionScore, String feedback) {
        this.userSatisfactionScore = satisfactionScore;
        this.userFeedback = feedback;
    }

    /**
     * 매칭 성공 여부 확인
     */
    public boolean isSuccessfulMatch() {
        return this.status == MatchingStatus.COMPLETED && 
               this.outcome == MatchingOutcome.CONTRACT_SIGNED;
    }

    /**
     * 매칭 진행률 계산 (0-100%)
     */
    public int getProgressPercentage() {
        int progress = 0;
        if (wasViewed) progress += 25;
        if (wasContacted) progress += 25;
        if (wasVisited) progress += 25;
        if (wasSelected) progress += 25;
        return progress;
    }

    /**
     * 매칭 소요 시간 계산 (시간 단위)
     */
    public Long getMatchingDurationHours() {
        if (completedAt != null && getCreatedAt() != null) {
            return java.time.Duration.between(getCreatedAt(), completedAt).toHours();
        }
        return null;
    }
    
    /**
     * 사용자 만족도 점수 조회 (호환성을 위해)
     */
    public BigDecimal getSatisfactionScore() {
        return this.userSatisfactionScore;
    }
    
    /**
     * 사용자 피드백 조회 (호환성을 위해)
     */
    public String getFeedback() {
        return this.userFeedback;
    }
}