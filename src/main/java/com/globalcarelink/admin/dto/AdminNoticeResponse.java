package com.globalcarelink.admin.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminNoticeResponse {
    private Long id;
    private String title;
    private String content;
    private String authorName;
    private Boolean isImportant;
    private Boolean isPublished;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long viewCount;
}