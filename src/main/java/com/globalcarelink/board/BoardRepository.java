package com.globalcarelink.board;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 게시판 Repository
 * 게시판 데이터 접근 및 조회 메서드 제공
 */
@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {

    /**
     * 활성화된 게시판 목록 조회 (정렬 순서대로)
     */
    List<Board> findByIsActiveTrueOrderBySortOrderAsc();

    /**
     * 게시판 타입으로 조회
     */
    Optional<Board> findByTypeAndIsActiveTrue(Board.BoardType type);

    /**
     * 게시판 이름으로 검색 (활성화된 게시판만)
     */
    @Query("SELECT b FROM Board b WHERE b.isActive = true AND b.name LIKE %:name% ORDER BY b.sortOrder ASC")
    List<Board> findByNameContainingAndIsActiveTrue(@Param("name") String name);

    /**
     * 관리자 전용 게시판 조회
     */
    List<Board> findByAdminOnlyTrueAndIsActiveTrueOrderBySortOrderAsc();

    /**
     * 일반 사용자용 게시판 조회 (관리자 전용 제외)
     */
    List<Board> findByAdminOnlyFalseAndIsActiveTrueOrderBySortOrderAsc();

    /**
     * 게시판별 게시글 수 조회
     */
    @Query("SELECT b.id, COUNT(p) FROM Board b LEFT JOIN b.posts p WHERE b.isActive = true AND (p.isDeleted = false OR p IS NULL) GROUP BY b.id")
    List<Object[]> findBoardPostCounts();

    /**
     * 특정 게시판의 활성 게시글 수 조회
     */
    @Query("SELECT COUNT(p) FROM Post p WHERE p.board.id = :boardId AND p.isDeleted = false")
    long countActivePostsByBoardId(@Param("boardId") Long boardId);

    /**
     * 게시판 존재 여부 확인 (ID와 활성화 상태)
     */
    boolean existsByIdAndIsActiveTrue(Long id);

    /**
     * 게시판 타입 존재 여부 확인
     */
    boolean existsByTypeAndIsActiveTrue(Board.BoardType type);
}