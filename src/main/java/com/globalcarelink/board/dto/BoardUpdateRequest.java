package com.globalcarelink.board.dto;

import lombok.Data;

import jakarta.validation.constraints.*;

/**
 * 게시판 수정 요청 DTO
 * 게시판 수정 시 관리자로부터 받는 데이터 구조
 * 모든 필드는 선택적(Optional)이며 null이 아닌 값만 업데이트됨
 */
@Data
public class BoardUpdateRequest {
    
    @Size(max = 100, message = "게시판 이름은 100자를 초과할 수 없습니다")
    private String name;
    
    @Size(max = 500, message = "게시판 설명은 500자를 초과할 수 없습니다")
    private String description;
    
    private Boolean adminOnly;
    
    @Min(value = 0, message = "정렬 순서는 0 이상이어야 합니다")
    @Max(value = 999, message = "정렬 순서는 999 이하여야 합니다")
    private Integer sortOrder;
    
    // 컴파일 호환성을 위한 메서드들
    public boolean isAdminOnly() {
        return adminOnly != null ? adminOnly : false;
    }
}