package com.globalcarelink.board.dto;

import com.globalcarelink.board.Board;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 게시판 응답 DTO
 * 클라이언트에게 전송할 게시판 데이터 구조
 * 프레젠테이션 로직을 포함하여 엔티티와 분리
 */
@Data
public class BoardResponse {
    
    private Long id;
    private String name;
    private String description;
    private Board.BoardType type;
    private String typeDisplayName;
    private Boolean isActive;
    private Integer sortOrder;
    private Boolean adminOnly;
    private LocalDateTime createdDate;
    private LocalDateTime lastModifiedDate;
    
    // 계산된 필드들 (프레젠테이션 로직)
    private Integer postCount;
    private Long activePostCount;
    private Boolean hasRecentPosts;
    private String statusDisplay;
    
    /**
     * Board 엔티티를 BoardResponse DTO로 변환하는 정적 팩토리 메서드
     */
    public static BoardResponse from(Board board) {
        BoardResponse response = new BoardResponse();
        
        // 기본 필드 매핑
        response.setId(board.getId());
        response.setName(board.getName());
        response.setDescription(board.getDescription());
        response.setType(board.getType());
        response.setTypeDisplayName(board.getType() != null ? board.getType().getDisplayName() : null);
        response.setIsActive(board.getIsActive());
        response.setSortOrder(board.getSortOrder());
        response.setAdminOnly(board.getAdminOnly());
        response.setCreatedDate(board.getCreatedDate());
        response.setLastModifiedDate(board.getLastModifiedDate());
        
        // 프레젠테이션 로직 적용
        response.setPostCount(calculatePostCount(board));
        response.setActivePostCount(calculateActivePostCount(board));
        response.setHasRecentPosts(hasRecentPosts(board));
        response.setStatusDisplay(formatStatusDisplay(board.getIsActive(), board.getAdminOnly()));
        
        return response;
    }
    
    /**
     * 전체 게시글 수 계산 (엔티티에서 이동된 프레젠테이션 로직)
     */
    private static Integer calculatePostCount(Board board) {
        return board.getPosts() != null ? board.getPosts().size() : 0;
    }
    
    /**
     * 활성 게시글 수 계산 (엔티티에서 이동된 프레젠테이션 로직)
     */
    private static Long calculateActivePostCount(Board board) {
        return board.getPosts() != null ? 
            board.getPosts().stream()
                .filter(post -> !post.getIsDeleted())
                .count() : 0L;
    }
    
    /**
     * 최근 게시글 존재 여부 확인 (7일 이내)
     */
    private static Boolean hasRecentPosts(Board board) {
        if (board.getPosts() == null || board.getPosts().isEmpty()) {
            return false;
        }
        
        return board.getPosts().stream()
            .filter(post -> !post.getIsDeleted())
            .anyMatch(post -> post.getCreatedDate() != null && 
                             post.getCreatedDate().isAfter(LocalDateTime.now().minusDays(7)));
    }
    
    /**
     * 게시판 상태 표시 포맷팅
     */
    private static String formatStatusDisplay(Boolean isActive, Boolean adminOnly) {
        if (isActive == null || !isActive) {
            return "비활성";
        }
        
        if (adminOnly != null && adminOnly) {
            return "활성 (관리자 전용)";
        }
        
        return "활성";
    }
}