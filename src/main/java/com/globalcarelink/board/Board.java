package com.globalcarelink.board;

import com.globalcarelink.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * 게시판 엔티티
 * 공지사항, Q&A, 자유게시판, 취업정보 등 다양한 게시판 타입 지원
 */
@Entity
@Table(name = "boards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Board extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 게시판 이름 (한국어)
     * 예: "공지사항", "Q&A 게시판", "자유게시판", "취업정보"
     */
    @Column(nullable = false, length = 100)
    private String name;

    /**
     * 게시판 설명
     */
    @Column(length = 500)
    private String description;

    /**
     * 게시판 타입
     * NOTICE: 공지사항 (관리자만 작성)
     * QNA: 질문답변
     * FREE: 자유게시판
     * JOB: 취업정보
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BoardType type;

    /**
     * 게시판 활성화 여부
     */
    @Column(nullable = false)
    private Boolean isActive = true;

    /**
     * 정렬 순서 (작은 숫자가 위에 표시)
     */
    @Column(nullable = false)
    private Integer sortOrder = 0;

    /**
     * 관리자만 작성 가능 여부
     */
    @Column(nullable = false)
    private Boolean adminOnly = false;

    /**
     * 해당 게시판의 게시글 목록
     */
    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Post> posts = new ArrayList<>();

    /**
     * 게시판 타입 열거형
     */
    public enum BoardType {
        NOTICE("공지사항"),
        QNA("질문답변"),
        FREE("자유게시판"),
        JOB("취업정보");

        private final String displayName;

        BoardType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

}