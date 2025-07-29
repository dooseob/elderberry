package com.globalcarelink.board;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 댓글 리포지토리
 * 댓글 데이터 접근 계층
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    /**
     * 활성 댓글 조회
     */
    Optional<Comment> findByIdAndActiveTrue(Long id);

    /**
     * 특정 게시글의 활성 댓글 목록 조회
     */
    Page<Comment> findByPostIdAndActiveTrue(Long postId, Pageable pageable);

    /**
     * 특정 작성자의 댓글 수 조회
     */
    long countByAuthorIdAndActiveTrue(Long authorId);

    /**
     * 특정 게시글의 댓글 수 조회
     */
    long countByPostIdAndActiveTrue(Long postId);

    /**
     * 특정 작성자의 댓글 목록 조회
     */
    Page<Comment> findByAuthorIdAndActiveTrueOrderByCreatedAtDesc(Long authorId, Pageable pageable);

    /**
     * 최근 댓글 조회
     */
    @Query("SELECT c FROM Comment c WHERE c.active = true ORDER BY c.createdAt DESC")
    Page<Comment> findRecentComments(Pageable pageable);
}