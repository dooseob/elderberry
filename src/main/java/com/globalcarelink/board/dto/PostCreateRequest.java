package com.globalcarelink.board.dto;

import lombok.Data;

import javax.validation.constraints.*;

/**
 * 게시글 작성 요청 DTO
 * 새 게시글 작성 시 클라이언트로부터 받는 데이터 구조
 */
@Data
public class PostCreateRequest {
    
    @NotBlank(message = "게시글 제목은 필수입니다")
    @Size(max = 200, message = "게시글 제목은 200자를 초과할 수 없습니다")
    private String title;
    
    @NotBlank(message = "게시글 내용은 필수입니다")
    @Size(max = 10000, message = "게시글 내용은 10000자를 초과할 수 없습니다")
    private String content;
    
    private Boolean isPinned = false;
}