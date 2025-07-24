package com.globalcarelink.board.dto;

import lombok.Data;

import javax.validation.constraints.*;

/**
 * 게시글 수정 요청 DTO
 * 게시글 수정 시 클라이언트로부터 받는 데이터 구조
 * 모든 필드는 선택적(Optional)이며 null이 아닌 값만 업데이트됨
 */
@Data
public class PostUpdateRequest {
    
    @Size(max = 200, message = "게시글 제목은 200자를 초과할 수 없습니다")
    private String title;
    
    @Size(max = 10000, message = "게시글 내용은 10000자를 초과할 수 없습니다")
    private String content;
    
    private Boolean isPinned;
}