package com.globalcarelink.board;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 게시글 Repository
 * 게시글 데이터 접근 및 조회 메서드 제공
 */
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    /**
     * 특정 게시판의 활성 게시글 조회 (페이징, 공지글 우선)
     */
    @Query("SELECT p FROM Post p WHERE p.board.id = :boardId AND p.isDeleted = false ORDER BY p.isPinned DESC, p.createdAt DESC")
    Page<Post> findByBoardIdAndIsDeletedFalse(@Param("boardId") Long boardId, Pageable pageable);

    /**
     * 특정 게시판의 활성 게시글 조회 (active 필드 기준)
     */
    Page<Post> findByBoardIdAndActiveTrue(Long boardId, Pageable pageable);

    /**
     * 활성 게시글 조회 (ID 기준)
     */
    Optional<Post> findByIdAndActiveTrue(Long id);

    /**
     * 특정 게시판의 공지글만 조회
     */
    @Query("SELECT p FROM Post p WHERE p.board.id = :boardId AND p.isPinned = true AND p.isDeleted = false ORDER BY p.createdAt DESC")
    List<Post> findPinnedPostsByBoardId(@Param("boardId") Long boardId);

    /**
     * 제목으로 게시글 검색 (특정 게시판)
     */
    @Query("SELECT p FROM Post p WHERE p.board.id = :boardId AND p.title LIKE %:keyword% AND p.isDeleted = false ORDER BY p.isPinned DESC, p.createdAt DESC")
    Page<Post> findByBoardIdAndTitleContaining(@Param("boardId") Long boardId, @Param("keyword") String keyword, Pageable pageable);

    /**
     * 내용으로 게시글 검색 (특정 게시판)
     */
    @Query("SELECT p FROM Post p WHERE p.board.id = :boardId AND p.content LIKE %:keyword% AND p.isDeleted = false ORDER BY p.isPinned DESC, p.createdAt DESC")
    Page<Post> findByBoardIdAndContentContaining(@Param("boardId") Long boardId, @Param("keyword") String keyword, Pageable pageable);

    /**
     * 제목 + 내용으로 게시글 검색 (특정 게시판)
     */
    @Query("SELECT p FROM Post p WHERE p.board.id = :boardId AND (p.title LIKE %:keyword% OR p.content LIKE %:keyword%) AND p.isDeleted = false ORDER BY p.isPinned DESC, p.createdAt DESC")
    Page<Post> findByBoardIdAndTitleOrContentContaining(@Param("boardId") Long boardId, @Param("keyword") String keyword, Pageable pageable);

    /**
     * 제목으로 게시글 검색 (활성 상태, 대소문자 무시)
     */
    Page<Post> findByBoardIdAndActiveTrueAndTitleContainingIgnoreCase(Long boardId, String keyword, Pageable pageable);

    /**
     * 내용으로 게시글 검색 (활성 상태, 대소문자 무시)
     */
    Page<Post> findByBoardIdAndActiveTrueAndContentContainingIgnoreCase(Long boardId, String keyword, Pageable pageable);

    /**
     * 작성자명으로 게시글 검색 (활성 상태, 대소문자 무시)
     */
    Page<Post> findByBoardIdAndActiveTrueAndAuthorUsernameContainingIgnoreCase(Long boardId, String keyword, Pageable pageable);

    /**
     * 제목 또는 내용으로 게시글 검색 (활성 상태, 대소문자 무시)
     */
    @Query("SELECT p FROM Post p WHERE p.board.id = :boardId AND p.active = true AND (UPPER(p.title) LIKE UPPER(CONCAT('%', :keyword, '%')) OR UPPER(p.content) LIKE UPPER(CONCAT('%', :keyword, '%')))")
    Page<Post> findByBoardIdAndActiveTrueAndTitleOrContentContainingIgnoreCase(@Param("boardId") Long boardId, @Param("keyword") String keyword, Pageable pageable);

    /**
     * 작성자별 게시글 조회
     */
    @Query("SELECT p FROM Post p WHERE p.author.id = :authorId AND p.isDeleted = false ORDER BY p.createdAt DESC")
    Page<Post> findByAuthorIdAndIsDeletedFalse(@Param("authorId") Long authorId, Pageable pageable);

    /**
     * 특정 기간 내 게시글 조회
     */
    @Query("SELECT p FROM Post p WHERE p.board.id = :boardId AND p.createdAt BETWEEN :startDate AND :endDate AND p.isDeleted = false ORDER BY p.createdAt DESC")
    Page<Post> findByBoardIdAndDateRange(@Param("boardId") Long boardId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    /**
     * 인기 게시글 조회 (조회수 기준)
     */
    @Query("SELECT p FROM Post p WHERE p.board.id = :boardId AND p.isDeleted = false ORDER BY p.viewCount DESC, p.createdAt DESC")
    Page<Post> findPopularPostsByBoardId(@Param("boardId") Long boardId, Pageable pageable);

    /**
     * 전체 게시판에서 최신 게시글 조회 (메인페이지용)
     */
    @Query("SELECT p FROM Post p WHERE p.isDeleted = false AND p.status = 'ACTIVE' ORDER BY p.createdAt DESC")
    Page<Post> findLatestPosts(Pageable pageable);

    /**
     * 신고된 게시글 조회 (관리자용)
     */
    @Query("SELECT p FROM Post p WHERE p.status = 'REPORTED' ORDER BY p.updatedAt DESC")
    Page<Post> findReportedPosts(Pageable pageable);

    /**
     * 특정 사용자의 게시글 수 조회
     */
    @Query("SELECT COUNT(p) FROM Post p WHERE p.author.id = :authorId AND p.isDeleted = false")
    long countByAuthorIdAndIsDeletedFalse(@Param("authorId") Long authorId);

    /**
     * 조회수 증가
     */
    @Modifying
    @Query("UPDATE Post p SET p.viewCount = p.viewCount + 1 WHERE p.id = :postId")
    void incrementViewCount(@Param("postId") Long postId);

    /**
     * 게시글 존재 여부 확인 (ID와 삭제 상태)
     */
    boolean existsByIdAndIsDeletedFalse(Long id);

    /**
     * 특정 게시판의 게시글 존재 여부 확인
     */
    boolean existsByBoardIdAndIsDeletedFalse(Long boardId);

    /**
     * 게시글 ID와 작성자 ID로 조회 (수정/삭제 권한 확인용)
     */
    Optional<Post> findByIdAndAuthorIdAndIsDeletedFalse(Long id, Long authorId);

    /**
     * 오늘 작성된 게시글 수 조회
     */
    @Query("SELECT COUNT(p) FROM Post p WHERE p.board.id = :boardId AND CAST(p.createdAt AS date) = CURRENT_DATE AND p.isDeleted = false")
    long countTodayPostsByBoardId(@Param("boardId") Long boardId);

    /**
     * 베스트 게시글 조회 (조회수 + 댓글 수 기준)
     */
    @Query("SELECT p FROM Post p LEFT JOIN p.comments c WHERE p.board.id = :boardId AND p.isDeleted = false GROUP BY p ORDER BY (p.viewCount + COUNT(c)) DESC, p.createdAt DESC")
    Page<Post> findBestPostsByBoardId(@Param("boardId") Long boardId, Pageable pageable);
}