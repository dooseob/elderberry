package com.globalcarelink.board.dto;

import lombok.Data;

import javax.validation.constraints.*;

/**
 * 댓글 작성 요청 DTO
 * 새 댓글 작성 시 클라이언트로부터 받는 데이터 구조
 */
@Data
public class CommentCreateRequest {
    
    @NotBlank(message = "댓글 내용은 필수입니다")
    @Size(max = 1000, message = "댓글 내용은 1000자를 초과할 수 없습니다")
    private String content;
    
    /**
     * 부모 댓글 ID (대댓글인 경우)
     * null인 경우 최상위 댓글
     */
    private Long parentId;
}