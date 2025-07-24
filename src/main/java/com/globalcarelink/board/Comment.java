package com.globalcarelink.board;

import com.globalcarelink.auth.Member;
import com.globalcarelink.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * 댓글 엔티티
 * 게시글의 댓글 및 대댓글 지원
 */
@Entity
@Table(name = "comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Comment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 댓글 내용
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    /**
     * 작성자
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private Member author;

    /**
     * 소속 게시글
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    /**
     * 부모 댓글 (대댓글인 경우)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Comment parent;

    /**
     * 자식 댓글들 (대댓글들)
     */
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> children = new ArrayList<>();

    /**
     * 삭제 여부 (soft delete)
     */
    @Column(nullable = false)
    private Boolean isDeleted = false;

    /**
     * 댓글 깊이 (0: 일반 댓글, 1: 대댓글)
     */
    @Column(nullable = false)
    private Integer depth = 0;

    /**
     * 댓글 상태
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CommentStatus status = CommentStatus.ACTIVE;

    /**
     * 댓글 상태 열거형
     */
    public enum CommentStatus {
        ACTIVE("활성"),
        HIDDEN("숨김"),
        REPORTED("신고됨");

        private final String displayName;

        CommentStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    /**
     * 작성자 이름 반환 (안전한 접근)
     */
    public String getAuthorName() {
        return this.author != null ? this.author.getName() : "알 수 없음";
    }

    /**
     * 대댓글 여부 확인
     */
    public boolean isReply() {
        return this.parent != null;
    }

    /**
     * 소프트 삭제
     */
    public void softDelete() {
        this.isDeleted = true;
    }

    /**
     * 댓글 숨김 처리
     */
    public void hide() {
        this.status = CommentStatus.HIDDEN;
    }

    /**
     * 댓글 신고 처리
     */
    public void report() {
        this.status = CommentStatus.REPORTED;
    }

    /**
     * 댓글 활성화
     */
    public void activate() {
        this.status = CommentStatus.ACTIVE;
        this.isDeleted = false;
    }

    /**
     * 대댓글 추가
     */
    public void addChild(Comment child) {
        if (this.children == null) {
            this.children = new ArrayList<>();
        }
        this.children.add(child);
        child.setParent(this);
        child.setDepth(this.depth + 1);
    }
}