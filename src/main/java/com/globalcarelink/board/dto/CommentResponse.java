package com.globalcarelink.board.dto;

import com.globalcarelink.board.Comment;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 댓글 응답 DTO
 * 클라이언트에게 전송할 댓글 데이터 구조
 * 프레젠테이션 로직을 포함하여 엔티티와 분리
 */
@Data
public class CommentResponse {
    
    private Long id;
    private String content;
    private Boolean isDeleted;
    private Integer depth;
    private Comment.CommentStatus status;
    private String statusDisplayName;
    private LocalDateTime createdDate;
    private LocalDateTime lastModifiedDate;
    
    // 계산된 필드들 (프레젠테이션 로직)
    private String authorName;
    private Boolean isReply;
    private Boolean isRecent;
    private Integer childrenCount;
    private String contentPreview;
    
    // 관계 엔티티 ID (민감정보 제외)
    private Long authorId;
    private Long postId;
    private Long parentId;
    
    // 자식 댓글들 (대댓글들)
    private List<CommentResponse> children;
    
    /**
     * Comment 엔티티를 CommentResponse DTO로 변환하는 정적 팩토리 메서드
     */
    public static CommentResponse from(Comment comment) {
        CommentResponse response = new CommentResponse();
        
        // 기본 필드 매핑
        response.setId(comment.getId());
        response.setContent(comment.getContent());
        response.setIsDeleted(comment.getIsDeleted());
        response.setDepth(comment.getDepth());
        response.setStatus(comment.getStatus());
        response.setStatusDisplayName(comment.getStatus() != null ? comment.getStatus().getDisplayName() : null);
        response.setCreatedDate(comment.getCreatedDate());
        response.setLastModifiedDate(comment.getLastModifiedDate());
        
        // 관계 엔티티 ID
        response.setAuthorId(comment.getAuthor() != null ? comment.getAuthor().getId() : null);
        response.setPostId(comment.getPost() != null ? comment.getPost().getId() : null);
        response.setParentId(comment.getParent() != null ? comment.getParent().getId() : null);
        
        // 프레젠테이션 로직 적용
        response.setAuthorName(formatAuthorName(comment));
        response.setIsReply(isReplyComment(comment));
        response.setIsRecent(isRecentComment(comment));
        response.setChildrenCount(calculateChildrenCount(comment));
        response.setContentPreview(createContentPreview(comment.getContent()));
        
        // 자식 댓글들 변환 (재귀적으로 처리)
        if (comment.getChildren() != null && !comment.getChildren().isEmpty()) {
            response.setChildren(
                comment.getChildren().stream()
                    .filter(child -> !child.getIsDeleted())
                    .map(CommentResponse::from)
                    .collect(Collectors.toList())
            );
        }
        
        return response;
    }
    
    /**
     * 작성자 이름 포맷팅 (엔티티에서 이동된 프레젠테이션 로직)
     */
    private static String formatAuthorName(Comment comment) {
        return comment.getAuthor() != null ? comment.getAuthor().getName() : "알 수 없음";
    }
    
    /**
     * 대댓글 여부 확인 (엔티티에서 이동된 프레젠테이션 로직)
     */
    private static Boolean isReplyComment(Comment comment) {
        return comment.getParent() != null;
    }
    
    /**
     * 최근 댓글 여부 확인 (1시간 이내)
     */
    private static Boolean isRecentComment(Comment comment) {
        return comment.getCreatedDate() != null && 
               comment.getCreatedDate().isAfter(LocalDateTime.now().minusHours(1));
    }
    
    /**
     * 자식 댓글 수 계산
     */
    private static Integer calculateChildrenCount(Comment comment) {
        return comment.getChildren() != null ? 
            (int) comment.getChildren().stream()
                .filter(child -> !child.getIsDeleted())
                .count() : 0;
    }
    
    /**
     * 댓글 내용 미리보기 생성 (100자 제한)
     */
    private static String createContentPreview(String content) {
        if (content == null || content.trim().isEmpty()) {
            return "";
        }
        
        // HTML 태그 제거 (댓글에도 간단한 HTML이 있을 수 있음)
        String plainText = content.replaceAll("<[^>]*>", "").trim();
        
        // 100자로 제한
        if (plainText.length() <= 100) {
            return plainText;
        }
        
        return plainText.substring(0, 100) + "...";
    }
}