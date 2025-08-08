package com.globalcarelink.admin.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminPostResponse {
    private Long id;
    private String title;
    private String content;
    private String boardType;
    private String authorName;
    private String authorEmail;
    private Boolean isHidden;
    private Integer reportsCount;
    private Integer viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}