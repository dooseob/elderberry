package com.globalcarelink.board;

import com.globalcarelink.auth.Member;
import com.globalcarelink.auth.MemberService;
import com.globalcarelink.board.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * 게시판 컨트롤러
 * 게시판 관련 REST API 엔드포인트 제공
 */
@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
@Slf4j
public class BoardController {

    private final BoardService boardService;
    private final PostService postService;
    private final CommentService commentService;
    private final MemberService memberService;

    /**
     * 모든 활성 게시판 조회
     */
    @GetMapping
    public ResponseEntity<List<Board>> getAllBoards(Authentication auth) {
        log.info("모든 게시판 조회 요청");
        
        Member member = getCurrentMember(auth);
        List<Board> boards;
        
        // 관리자는 모든 게시판 조회 가능
        if (member != null && isAdmin(member)) {
            boards = boardService.getAllActiveBoards();
        } else {
            boards = boardService.getPublicBoards();
        }
        
        return ResponseEntity.ok(boards);
    }

    /**
     * 특정 게시판 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<Board> getBoardById(@PathVariable Long id, Authentication auth) {
        log.info("게시판 조회 요청: ID={}", id);
        
        Board board = boardService.getBoardById(id);
        Member member = getCurrentMember(auth);
        
        // 접근 권한 확인
        if (!boardService.canAccessBoard(id, member)) {
            log.warn("게시판 접근 권한 없음: 게시판ID={}, 사용자ID={}", id, member != null ? member.getId() : "anonymous");
            return ResponseEntity.forbidden().build();
        }
        
        return ResponseEntity.ok(board);
    }

    /**
     * 특정 게시판의 게시글 목록 조회
     */
    @GetMapping("/{id}/posts")
    public ResponseEntity<Page<Post>> getPostsByBoard(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdDate") String sort,
            @RequestParam(defaultValue = "desc") String direction,
            Authentication auth) {
        
        log.info("게시판 게시글 목록 조회: 게시판ID={}, 페이지={}, 크기={}", id, page, size);
        
        Member member = getCurrentMember(auth);
        
        // 게시판 접근 권한 확인
        if (!boardService.canAccessBoard(id, member)) {
            return ResponseEntity.forbidden().build();
        }
        
        // 정렬 설정
        Sort.Direction sortDirection = "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));
        
        Page<Post> posts = postService.getPostsByBoard(id, pageable);
        return ResponseEntity.ok(posts);
    }

    /**
     * 게시글 검색
     */
    @GetMapping("/{id}/posts/search")
    public ResponseEntity<Page<Post>> searchPosts(
            @PathVariable Long id,
            @RequestParam String keyword,
            @RequestParam(defaultValue = "title") String searchType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth) {
        
        log.info("게시글 검색: 게시판ID={}, 키워드={}, 검색타입={}", id, keyword, searchType);
        
        Member member = getCurrentMember(auth);
        
        // 게시판 접근 권한 확인
        if (!boardService.canAccessBoard(id, member)) {
            return ResponseEntity.forbidden().build();
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdDate"));
        Page<Post> posts = postService.searchPosts(id, keyword, searchType, pageable);
        
        return ResponseEntity.ok(posts);
    }

    /**
     * 새 게시글 작성
     */
    @PostMapping("/{id}/posts")
    public ResponseEntity<Post> createPost(
            @PathVariable Long id,
            @Valid @RequestBody PostCreateRequest request,
            Authentication auth) {
        
        log.info("새 게시글 작성: 게시판ID={}, 제목={}", id, request.getTitle());
        
        Member member = getCurrentMember(auth);
        if (member == null) {
            return ResponseEntity.status(401).build();
        }
        
        // 게시판 쓰기 권한 확인
        if (!boardService.canWriteToBoard(id, member)) {
            return ResponseEntity.forbidden().build();
        }
        
        Post post = postService.createPost(id, member, request);
        return ResponseEntity.ok(post);
    }

    /**
     * 게시글 상세 조회
     */
    @GetMapping("/{boardId}/posts/{postId}")
    public ResponseEntity<Post> getPostDetail(
            @PathVariable Long boardId,
            @PathVariable Long postId,
            Authentication auth) {
        
        log.info("게시글 상세 조회: 게시판ID={}, 게시글ID={}", boardId, postId);
        
        Member member = getCurrentMember(auth);
        
        // 게시판 접근 권한 확인
        if (!boardService.canAccessBoard(boardId, member)) {
            return ResponseEntity.forbidden().build();
        }
        
        Post post = postService.getPostById(postId);
        return ResponseEntity.ok(post);
    }

    /**
     * 게시글 수정
     */
    @PutMapping("/{boardId}/posts/{postId}")
    public ResponseEntity<Post> updatePost(
            @PathVariable Long boardId,
            @PathVariable Long postId,
            @Valid @RequestBody PostUpdateRequest request,
            Authentication auth) {
        
        log.info("게시글 수정: 게시판ID={}, 게시글ID={}", boardId, postId);
        
        Member member = getCurrentMember(auth);
        if (member == null) {
            return ResponseEntity.status(401).build();
        }
        
        Post post = postService.updatePost(postId, member, request);
        return ResponseEntity.ok(post);
    }

    /**
     * 게시글 삭제
     */
    @DeleteMapping("/{boardId}/posts/{postId}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long boardId,
            @PathVariable Long postId,
            Authentication auth) {
        
        log.info("게시글 삭제: 게시판ID={}, 게시글ID={}", boardId, postId);
        
        Member member = getCurrentMember(auth);
        if (member == null) {
            return ResponseEntity.status(401).build();
        }
        
        postService.deletePost(postId, member);
        return ResponseEntity.noContent().build();
    }

    /**
     * 댓글 목록 조회
     */
    @GetMapping("/{boardId}/posts/{postId}/comments")
    public ResponseEntity<Page<Comment>> getComments(
            @PathVariable Long boardId,
            @PathVariable Long postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication auth) {
        
        log.info("댓글 목록 조회: 게시글ID={}", postId);
        
        Member member = getCurrentMember(auth);
        
        // 게시판 접근 권한 확인
        if (!boardService.canAccessBoard(boardId, member)) {
            return ResponseEntity.forbidden().build();
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdDate"));
        Page<Comment> comments = commentService.getCommentsByPost(postId, pageable);
        
        return ResponseEntity.ok(comments);
    }

    /**
     * 새 댓글 작성
     */
    @PostMapping("/{boardId}/posts/{postId}/comments")
    public ResponseEntity<Comment> createComment(
            @PathVariable Long boardId,
            @PathVariable Long postId,
            @Valid @RequestBody CommentCreateRequest request,
            Authentication auth) {
        
        log.info("새 댓글 작성: 게시글ID={}", postId);
        
        Member member = getCurrentMember(auth);
        if (member == null) {
            return ResponseEntity.status(401).build();
        }
        
        // 게시판 접근 권한 확인
        if (!boardService.canAccessBoard(boardId, member)) {
            return ResponseEntity.forbidden().build();
        }
        
        Comment comment = commentService.createComment(postId, member, request);
        return ResponseEntity.ok(comment);
    }

    /**
     * 댓글 수정
     */
    @PutMapping("/{boardId}/posts/{postId}/comments/{commentId}")
    public ResponseEntity<Comment> updateComment(
            @PathVariable Long boardId,
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentUpdateRequest request,
            Authentication auth) {
        
        log.info("댓글 수정: 댓글ID={}", commentId);
        
        Member member = getCurrentMember(auth);
        if (member == null) {
            return ResponseEntity.status(401).build();
        }
        
        Comment comment = commentService.updateComment(commentId, member, request);
        return ResponseEntity.ok(comment);
    }

    /**
     * 댓글 삭제
     */
    @DeleteMapping("/{boardId}/posts/{postId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long boardId,
            @PathVariable Long postId,
            @PathVariable Long commentId,
            Authentication auth) {
        
        log.info("댓글 삭제: 댓글ID={}", commentId);
        
        Member member = getCurrentMember(auth);
        if (member == null) {
            return ResponseEntity.status(401).build();
        }
        
        commentService.deleteComment(commentId, member);
        return ResponseEntity.noContent().build();
    }

    /**
     * 관리자용 - 새 게시판 생성
     */
    @PostMapping
    public ResponseEntity<Board> createBoard(
            @Valid @RequestBody BoardCreateRequest request,
            Authentication auth) {
        
        log.info("새 게시판 생성: 이름={}", request.getName());
        
        Member member = getCurrentMember(auth);
        if (member == null || !isAdmin(member)) {
            return ResponseEntity.status(403).build();
        }
        
        Board board = boardService.createBoard(
                request.getName(),
                request.getDescription(),
                request.getType(),
                request.isAdminOnly(),
                request.getSortOrder()
        );
        
        return ResponseEntity.ok(board);
    }

    /**
     * 관리자용 - 게시판 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<Board> updateBoard(
            @PathVariable Long id,
            @Valid @RequestBody BoardUpdateRequest request,
            Authentication auth) {
        
        log.info("게시판 수정: ID={}", id);
        
        Member member = getCurrentMember(auth);
        if (member == null || !isAdmin(member)) {
            return ResponseEntity.status(403).build();
        }
        
        Board board = boardService.updateBoard(
                id,
                request.getName(),
                request.getDescription(),
                request.isAdminOnly(),
                request.getSortOrder()
        );
        
        return ResponseEntity.ok(board);
    }

    /**
     * 관리자용 - 게시판 비활성화
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateBoard(
            @PathVariable Long id,
            Authentication auth) {
        
        log.info("게시판 비활성화: ID={}", id);
        
        Member member = getCurrentMember(auth);
        if (member == null || !isAdmin(member)) {
            return ResponseEntity.status(403).build();
        }
        
        boardService.deactivateBoard(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * 현재 인증된 사용자 조회
     */
    private Member getCurrentMember(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            return null;
        }
        
        try {
            return memberService.findByUsername(auth.getName());
        } catch (Exception e) {
            log.warn("사용자 조회 실패: username={}", auth.getName(), e);
            return null;
        }
    }

    /**
     * 관리자 권한 확인
     */
    private boolean isAdmin(Member member) {
        return member != null && 
               (member.getRole() == com.globalcarelink.auth.MemberRole.ADMIN ||
                member.getRole() == com.globalcarelink.auth.MemberRole.FACILITY);
    }

}