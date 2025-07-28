package com.globalcarelink.board;

import com.globalcarelink.auth.Member;
import com.globalcarelink.board.dto.CommentCreateRequest;
import com.globalcarelink.board.dto.CommentUpdateRequest;
import com.globalcarelink.common.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 댓글 서비스
 * 댓글 관련 비즈니스 로직 처리
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostService postService;

    /**
     * 특정 게시글의 댓글 목록 조회
     */
    public Page<Comment> getCommentsByPost(Long postId, Pageable pageable) {
        log.debug("게시글 댓글 목록 조회: postId={}", postId);
        return commentRepository.findByPostIdAndActiveTrue(postId, pageable);
    }

    /**
     * 댓글 ID로 조회
     */
    public Comment getCommentById(Long commentId) {
        log.debug("댓글 조회: commentId={}", commentId);
        return commentRepository.findByIdAndActiveTrue(commentId)
                .orElseThrow(() -> new CustomException("댓글을 찾을 수 없습니다: " + commentId));
    }

    /**
     * 새 댓글 작성
     */
    @Transactional
    public Comment createComment(Long postId, Member author, CommentCreateRequest request) {
        log.info("새 댓글 작성: postId={}, author={}", postId, author.getUsername());
        
        // 게시글 존재 확인
        Post post = postService.getPostById(postId);
        
        Comment comment = Comment.builder()
                .content(request.getContent())
                .author(author)
                .post(post)
                .active(true)
                .build();
        
        return commentRepository.save(comment);
    }

    /**
     * 댓글 수정
     */
    @Transactional
    public Comment updateComment(Long commentId, Member member, CommentUpdateRequest request) {
        log.info("댓글 수정: commentId={}, member={}", commentId, member.getUsername());
        
        Comment comment = getCommentById(commentId);
        
        // 작성자 본인이거나 관리자만 수정 가능
        if (!comment.getAuthor().getId().equals(member.getId()) && !isAdmin(member)) {
            throw new CustomException("댓글 수정 권한이 없습니다");
        }
        
        comment.updateContent(request.getContent());
        return commentRepository.save(comment);
    }

    /**
     * 댓글 삭제 (비활성화)
     */
    @Transactional
    public void deleteComment(Long commentId, Member member) {
        log.info("댓글 삭제: commentId={}, member={}", commentId, member.getUsername());
        
        Comment comment = getCommentById(commentId);
        
        // 작성자 본인이거나 관리자만 삭제 가능
        if (!comment.getAuthor().getId().equals(member.getId()) && !isAdmin(member)) {
            throw new CustomException("댓글 삭제 권한이 없습니다");
        }
        
        comment.deactivate();
        commentRepository.save(comment);
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