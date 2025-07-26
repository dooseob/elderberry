package com.globalcarelink.board.dto;

import com.globalcarelink.board.Board;
import lombok.Data;

import javax.validation.constraints.*;

/**
 * 게시판 생성 요청 DTO
 * 새 게시판 생성 시 관리자로부터 받는 데이터 구조
 */
@Data
public class BoardCreateRequest {
    
    @NotBlank(message = "게시판 이름은 필수입니다")
    @Size(max = 100, message = "게시판 이름은 100자를 초과할 수 없습니다")
    private String name;
    
    @Size(max = 500, message = "게시판 설명은 500자를 초과할 수 없습니다")
    private String description;
    
    @NotNull(message = "게시판 타입은 필수입니다")
    private Board.BoardType type;
    
    private boolean adminOnly = false;
    
    @Min(value = 0, message = "정렬 순서는 0 이상이어야 합니다")
    @Max(value = 999, message = "정렬 순서는 999 이하여야 합니다")
    private Integer sortOrder = 0;
}