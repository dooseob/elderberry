package com.globalcarelink.board;

import com.globalcarelink.auth.Member;
import com.globalcarelink.board.dto.PostCreateRequest;
import com.globalcarelink.board.dto.PostUpdateRequest;
import com.globalcarelink.common.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 게시글 서비스
 * 게시글 관련 비즈니스 로직 처리
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;
    private final BoardService boardService;

    /**
     * 특정 게시판의 게시글 목록 조회
     */
    public Page<Post> getPostsByBoard(Long boardId, Pageable pageable) {
        log.debug("게시판 게시글 목록 조회: boardId={}", boardId);
        return postRepository.findByBoardIdAndActiveTrue(boardId, pageable);
    }

    /**
     * 게시글 검색
     */
    public Page<Post> searchPosts(Long boardId, String keyword, String searchType, Pageable pageable) {
        log.debug("게시글 검색: boardId={}, keyword={}, searchType={}", boardId, keyword, searchType);
        
        switch (searchType.toLowerCase()) {
            case "title":
                return postRepository.findByBoardIdAndActiveTrueAndTitleContainingIgnoreCase(boardId, keyword, pageable);
            case "content":
                return postRepository.findByBoardIdAndActiveTrueAndContentContainingIgnoreCase(boardId, keyword, pageable);
            case "author":
                return postRepository.findByBoardIdAndActiveTrueAndAuthorUsernameContainingIgnoreCase(boardId, keyword, pageable);
            case "all":
                return postRepository.findByBoardIdAndActiveTrueAndTitleOrContentContainingIgnoreCase(boardId, keyword, pageable);
            default:
                return postRepository.findByBoardIdAndActiveTrueAndTitleContainingIgnoreCase(boardId, keyword, pageable);
        }
    }

    /**
     * 게시글 ID로 조회
     */
    public Post getPostById(Long postId) {
        log.debug("게시글 조회: postId={}", postId);
        return postRepository.findByIdAndActiveTrue(postId)
                .orElseThrow(() -> new CustomException.NotFound("게시글을 찾을 수 없습니다: " + postId));
    }

    /**
     * 새 게시글 작성
     */
    @Transactional
    public Post createPost(Long boardId, Member author, PostCreateRequest request) {
        log.info("새 게시글 작성: boardId={}, author={}, title={}", boardId, author.getEmail(), request.getTitle());
        
        // 게시판 존재 확인
        Board board = boardService.getBoardById(boardId);
        
        Post post = Post.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .author(author)
                .board(board)
                .viewCount(0L)
                .active(true)
                .build();
        
        return postRepository.save(post);
    }

    /**
     * 게시글 수정
     */
    @Transactional
    public Post updatePost(Long postId, Member member, PostUpdateRequest request) {
        log.info("게시글 수정: postId={}, member={}", postId, member.getEmail());
        
        Post post = getPostById(postId);
        
        // 작성자 본인이거나 관리자만 수정 가능
        if (!post.getAuthor().getId().equals(member.getId()) && !isAdmin(member)) {
            throw new CustomException.Forbidden("게시글 수정 권한이 없습니다");
        }
        
        post.updateContent(request.getTitle(), request.getContent());
        return postRepository.save(post);
    }

    /**
     * 게시글 삭제 (비활성화)
     */
    @Transactional
    public void deletePost(Long postId, Member member) {
        log.info("게시글 삭제: postId={}, member={}", postId, member.getEmail());
        
        Post post = getPostById(postId);
        
        // 작성자 본인이거나 관리자만 삭제 가능
        if (!post.getAuthor().getId().equals(member.getId()) && !isAdmin(member)) {
            throw new CustomException.Forbidden("게시글 삭제 권한이 없습니다");
        }
        
        post.deactivate();
        postRepository.save(post);
    }

    /**
     * 조회수 증가
     */
    @Transactional
    public void incrementViewCount(Long postId) {
        log.debug("조회수 증가: postId={}", postId);
        Post post = getPostById(postId);
        post.incrementViewCount();
        postRepository.save(post);
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