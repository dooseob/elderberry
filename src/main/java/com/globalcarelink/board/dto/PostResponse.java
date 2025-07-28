package com.globalcarelink.board.dto;

import com.globalcarelink.board.Post;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 게시글 응답 DTO
 * 클라이언트에게 전송할 게시글 데이터 구조
 * 프레젠테이션 로직을 포함하여 엔티티와 분리
 */
@Data
public class PostResponse {
    
    private Long id;
    private String title;
    private String content;
    private Long viewCount;
    private Boolean isPinned;
    private Boolean isDeleted;
    private Post.PostStatus status;
    private String statusDisplayName;
    private LocalDateTime createdDate;
    private LocalDateTime lastModifiedDate;
    
    // 계산된 필드들 (프레젠테이션 로직)
    private Integer commentCount;
    private Long activeCommentCount;
    private String authorName;
    private String boardName;
    private Boolean isRecent;
    private Boolean isPopular;
    private String contentPreview;
    
    // 작성자/게시판 정보 (민감정보 제외)
    private Long authorId;
    private Long boardId;
    
    /**
     * Post 엔티티를 PostResponse DTO로 변환하는 정적 팩토리 메서드
     */
    public static PostResponse from(Post post) {
        PostResponse response = new PostResponse();
        
        // 기본 필드 매핑
        response.setId(post.getId());
        response.setTitle(post.getTitle());
        response.setContent(post.getContent());
        response.setViewCount(post.getViewCount());
        response.setIsPinned(post.getIsPinned());
        response.setIsDeleted(post.getIsDeleted());
        response.setStatus(post.getStatus());
        response.setStatusDisplayName(post.getStatus() != null ? post.getStatus().getDisplayName() : null);
        response.setCreatedDate(post.getCreatedDate());
        response.setLastModifiedDate(post.getLastModifiedDate());
        
        // 관계 엔티티 ID
        response.setAuthorId(post.getAuthor() != null ? post.getAuthor().getId() : null);
        response.setBoardId(post.getBoard() != null ? post.getBoard().getId() : null);
        
        // 프레젠테이션 로직 적용
        response.setCommentCount(calculateCommentCount(post));
        response.setActiveCommentCount(calculateActiveCommentCount(post));
        response.setAuthorName(formatAuthorName(post));
        response.setBoardName(formatBoardName(post));
        response.setIsRecent(isRecentPost(post));
        response.setIsPopular(isPopularPost(post));
        response.setContentPreview(createContentPreview(post.getContent()));
        
        return response;
    }
    
    /**
     * 전체 댓글 수 계산 (엔티티에서 이동된 프레젠테이션 로직)
     */
    private static Integer calculateCommentCount(Post post) {
        return post.getComments() != null ? post.getComments().size() : 0;
    }
    
    /**
     * 활성 댓글 수 계산 (엔티티에서 이동된 프레젠테이션 로직)
     */
    private static Long calculateActiveCommentCount(Post post) {
        return post.getComments() != null ? 
            post.getComments().stream()
                .filter(comment -> !comment.getIsDeleted())
                .count() : 0L;
    }
    
    /**
     * 작성자 이름 포맷팅 (엔티티에서 이동된 프레젠테이션 로직)
     */
    private static String formatAuthorName(Post post) {
        return post.getAuthor() != null ? post.getAuthor().getName() : "알 수 없음";
    }
    
    /**
     * 게시판 이름 포맷팅 (엔티티에서 이동된 프레젠테이션 로직)
     */
    private static String formatBoardName(Post post) {
        return post.getBoard() != null ? post.getBoard().getName() : "알 수 없음";
    }
    
    /**
     * 최근 게시글 여부 확인 (24시간 이내)
     */
    private static Boolean isRecentPost(Post post) {
        return post.getCreatedDate() != null && 
               post.getCreatedDate().isAfter(LocalDateTime.now().minusHours(24));
    }
    
    /**
     * 인기 게시글 여부 확인 (조회수 100 이상 또는 댓글 10개 이상)
     */
    private static Boolean isPopularPost(Post post) {
        Long viewCount = post.getViewCount() != null ? post.getViewCount() : 0L;
        int commentCount = post.getComments() != null ? post.getComments().size() : 0;
        
        return viewCount >= 100 || commentCount >= 10;
    }
    
    /**
     * 내용 미리보기 생성 (HTML 태그 제거 후 150자 제한)
     */
    private static String createContentPreview(String content) {
        if (content == null || content.trim().isEmpty()) {
            return "";
        }
        
        // HTML 태그 제거
        String plainText = content.replaceAll("<[^>]*>", "").trim();
        
        // 150자로 제한
        if (plainText.length() <= 150) {
            return plainText;
        }
        
        return plainText.substring(0, 150) + "...";
    }
}