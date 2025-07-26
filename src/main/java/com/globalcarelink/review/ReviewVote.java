package com.globalcarelink.review;

import com.globalcarelink.auth.Member;
import com.globalcarelink.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 리뷰 투표 엔티티
 * 사용자가 리뷰에 대해 도움됨/도움안됨 투표를 관리
 */
@Entity
@Table(name = "review_votes", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"review_id", "voter_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewVote extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 투표 대상 리뷰
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    /**
     * 투표자
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voter_id", nullable = false)
    private Member voter;

    /**
     * 투표 타입 (도움됨/도움안됨)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VoteType voteType;

    /**
     * 투표 타입 열거형
     */
    public enum VoteType {
        HELPFUL("도움됨"),
        NOT_HELPFUL("도움안됨");

        private final String displayName;

        VoteType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    /**
     * 투표자 이름 반환 (안전한 접근)
     */
    public String getVoterName() {
        return this.voter != null ? this.voter.getName() : "알 수 없음";
    }

    /**
     * 리뷰 ID 반환 (안전한 접근)
     */
    public Long getReviewId() {
        return this.review != null ? this.review.getId() : null;
    }

    /**
     * 도움됨 투표 여부 확인
     */
    public boolean isHelpful() {
        return this.voteType == VoteType.HELPFUL;
    }

    /**
     * 도움안됨 투표 여부 확인
     */
    public boolean isNotHelpful() {
        return this.voteType == VoteType.NOT_HELPFUL;
    }
}