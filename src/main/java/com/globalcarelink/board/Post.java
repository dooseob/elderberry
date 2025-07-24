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
 * 게시글 엔티티
 * 게시판의 개별 게시글을 관리
 */
@Entity
@Table(name = "posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Post extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 게시글 제목
     */
    @Column(nullable = false, length = 200)
    private String title;

    /**
     * 게시글 내용 (HTML 허용)
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
     * 소속 게시판
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;

    /**
     * 조회수
     */
    @Column(nullable = false)
    private Long viewCount = 0L;

    /**
     * 공지글 여부 (게시판 상단 고정)
     */
    @Column(nullable = false)
    private Boolean isPinned = false;

    /**
     * 삭제 여부 (soft delete)
     */
    @Column(nullable = false)
    private Boolean isDeleted = false;

    /**
     * 게시글 상태
     * ACTIVE: 일반 게시글
     * HIDDEN: 숨김 처리 (관리자만 볼 수 있음)
     * REPORTED: 신고된 게시글
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostStatus status = PostStatus.ACTIVE;

    /**
     * 해당 게시글의 댓글 목록
     */
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    /**
     * 게시글 상태 열거형
     */
    public enum PostStatus {
        ACTIVE("활성"),
        HIDDEN("숨김"),
        REPORTED("신고됨");

        private final String displayName;

        PostStatus(String displayName) {
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
     * 소프트 삭제
     */
    public void softDelete() {
        this.isDeleted = true;
    }

    /**
     * 게시글 숨김 처리
     */
    public void hide() {
        this.status = PostStatus.HIDDEN;
    }

    /**
     * 게시글 신고 처리
     */
    public void report() {
        this.status = PostStatus.REPORTED;
    }

    /**
     * 게시글 활성화
     */
    public void activate() {
        this.status = PostStatus.ACTIVE;
        this.isDeleted = false;
    }
}