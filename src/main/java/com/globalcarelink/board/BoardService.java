package com.globalcarelink.board;

import com.globalcarelink.auth.Member;
import com.globalcarelink.auth.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 게시판 서비스
 * 게시판 생성, 수정, 조회 등의 비즈니스 로직 처리
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class BoardService {

    private final BoardRepository boardRepository;
    private final PostRepository postRepository;
    private final MemberRepository memberRepository;

    /**
     * 활성화된 모든 게시판 조회 (캐시 적용)
     */
    @Cacheable(value = "boards", key = "'all'")
    @Transactional(readOnly = true)
    public List<Board> getAllActiveBoards() {
        log.debug("모든 활성 게시판 조회");
        return boardRepository.findByIsActiveTrueOrderBySortOrderAsc();
    }

    /**
     * 일반 사용자용 게시판 조회 (관리자 전용 제외)
     */
    @Cacheable(value = "boards", key = "'public'")
    @Transactional(readOnly = true)
    public List<Board> getPublicBoards() {
        log.debug("일반 사용자용 게시판 조회");
        return boardRepository.findByAdminOnlyFalseAndIsActiveTrueOrderBySortOrderAsc();
    }

    /**
     * 관리자 전용 게시판 조회
     */
    @Transactional(readOnly = true)
    public List<Board> getAdminBoards() {
        log.debug("관리자 전용 게시판 조회");
        return boardRepository.findByAdminOnlyTrueAndIsActiveTrueOrderBySortOrderAsc();
    }

    /**
     * ID로 게시판 조회
     */
    @Transactional(readOnly = true)
    public Board getBoardById(Long boardId) {
        log.debug("게시판 조회: ID={}", boardId);
        return boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("게시판을 찾을 수 없습니다: " + boardId));
    }

    /**
     * 게시판 타입으로 조회
     */
    @Transactional(readOnly = true)
    public Board getBoardByType(Board.BoardType type) {
        log.debug("게시판 조회: 타입={}", type);
        return boardRepository.findByTypeAndIsActiveTrue(type)
                .orElseThrow(() -> new IllegalArgumentException("해당 타입의 게시판을 찾을 수 없습니다: " + type));
    }

    /**
     * 게시판 생성 (관리자 전용)
     */
    public Board createBoard(String name, String description, Board.BoardType type, boolean adminOnly, Integer sortOrder) {
        log.info("새 게시판 생성: 이름={}, 타입={}", name, type);

        // 중복 타입 확인
        if (boardRepository.existsByTypeAndIsActiveTrue(type)) {
            throw new IllegalArgumentException("해당 타입의 게시판이 이미 존재합니다: " + type);
        }

        Board board = new Board();
        board.setName(name);
        board.setDescription(description);
        board.setType(type);
        board.setAdminOnly(adminOnly);
        board.setSortOrder(sortOrder != null ? sortOrder : 0);
        board.setIsActive(true);

        Board savedBoard = boardRepository.save(board);
        log.info("게시판 생성 완료: ID={}, 이름={}", savedBoard.getId(), savedBoard.getName());

        return savedBoard;
    }

    /**
     * 게시판 수정 (관리자 전용)
     */
    public Board updateBoard(Long boardId, String name, String description, boolean adminOnly, Integer sortOrder) {
        log.info("게시판 수정: ID={}", boardId);

        Board board = getBoardById(boardId);
        
        if (name != null && !name.trim().isEmpty()) {
            board.setName(name.trim());
        }
        if (description != null) {
            board.setDescription(description.trim());
        }
        board.setAdminOnly(adminOnly);
        if (sortOrder != null) {
            board.setSortOrder(sortOrder);
        }

        Board updatedBoard = boardRepository.save(board);
        log.info("게시판 수정 완료: ID={}, 이름={}", updatedBoard.getId(), updatedBoard.getName());

        return updatedBoard;
    }

    /**
     * 게시판 비활성화 (soft delete)
     */
    public void deactivateBoard(Long boardId) {
        log.info("게시판 비활성화: ID={}", boardId);

        Board board = getBoardById(boardId);
        board.setIsActive(false);
        boardRepository.save(board);

        log.info("게시판 비활성화 완료: ID={}, 이름={}", board.getId(), board.getName());
    }

    /**
     * 게시판 활성화
     */
    public void activateBoard(Long boardId) {
        log.info("게시판 활성화: ID={}", boardId);

        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("게시판을 찾을 수 없습니다: " + boardId));
        
        board.setIsActive(true);
        boardRepository.save(board);

        log.info("게시판 활성화 완료: ID={}, 이름={}", board.getId(), board.getName());
    }

    /**
     * 게시판 이름으로 검색
     */
    @Transactional(readOnly = true)
    public List<Board> searchBoardsByName(String name) {
        log.debug("게시판 이름 검색: 키워드={}", name);
        
        if (name == null || name.trim().isEmpty()) {
            return getAllActiveBoards();
        }
        
        return boardRepository.findByNameContainingAndIsActiveTrue(name.trim());
    }

    /**
     * 게시판별 게시글 수 조회
     */
    @Transactional(readOnly = true)
    public long getPostCountByBoard(Long boardId) {
        log.debug("게시판 게시글 수 조회: 게시판ID={}", boardId);
        return boardRepository.countActivePostsByBoardId(boardId);
    }

    /**
     * 게시판 접근 권한 확인
     */
    @Transactional(readOnly = true)
    public boolean canAccessBoard(Long boardId, Member member) {
        Board board = getBoardById(boardId);
        
        // 비활성 게시판은 접근 불가
        if (!board.getIsActive()) {
            log.warn("비활성 게시판 접근 시도: 게시판ID={}, 사용자ID={}", boardId, member.getId());
            return false;
        }
        
        // 관리자 전용 게시판은 관리자만 접근 가능
        if (board.getAdminOnly() && !isAdmin(member)) {
            log.warn("관리자 전용 게시판 접근 시도: 게시판ID={}, 사용자ID={}", boardId, member.getId());
            return false;
        }
        
        return true;
    }

    /**
     * 게시판 쓰기 권한 확인
     */
    @Transactional(readOnly = true)
    public boolean canWriteToBoard(Long boardId, Member member) {
        Board board = getBoardById(boardId);
        
        // 기본 접근 권한 확인
        if (!canAccessBoard(boardId, member)) {
            return false;
        }
        
        // 공지사항 게시판은 관리자만 작성 가능
        if (board.getType() == Board.BoardType.NOTICE && !isAdmin(member)) {
            log.warn("공지사항 게시판 작성 시도: 게시판ID={}, 사용자ID={}", boardId, member.getId());
            return false;
        }
        
        return true;
    }

    /**
     * 관리자 권한 확인
     */
    private boolean isAdmin(Member member) {
        return member != null && 
               (member.getRole() == com.globalcarelink.auth.MemberRole.ADMIN ||
                member.getRole() == com.globalcarelink.auth.MemberRole.FACILITY);
    }

    /**
     * 기본 게시판 초기화 (시스템 시작 시 실행)
     */
    public void initializeDefaultBoards() {
        log.info("기본 게시판 초기화 시작");

        // 공지사항 게시판
        if (!boardRepository.existsByTypeAndIsActiveTrue(Board.BoardType.NOTICE)) {
            createBoard("공지사항", "중요한 공지사항을 확인하세요", Board.BoardType.NOTICE, true, 1);
        }

        // Q&A 게시판
        if (!boardRepository.existsByTypeAndIsActiveTrue(Board.BoardType.QNA)) {
            createBoard("Q&A 게시판", "요양 및 시설 관련 질문답변", Board.BoardType.QNA, false, 2);
        }

        // 자유게시판
        if (!boardRepository.existsByTypeAndIsActiveTrue(Board.BoardType.FREE)) {
            createBoard("자유게시판", "자유롭게 소통하는 공간", Board.BoardType.FREE, false, 3);
        }

        // 취업정보 게시판
        if (!boardRepository.existsByTypeAndIsActiveTrue(Board.BoardType.JOB)) {
            createBoard("취업정보", "구인구직 정보 공유", Board.BoardType.JOB, false, 4);
        }

        log.info("기본 게시판 초기화 완료");
    }
}