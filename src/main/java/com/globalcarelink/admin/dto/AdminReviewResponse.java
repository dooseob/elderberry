package com.globalcarelink.admin.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminReviewResponse {
    private Long id;
    private String facilityName;
    private String reviewerName;
    private String reviewerEmail;
    private Double overallRating;
    private Double cleanlinessRating;
    private Double staffKindnessRating;
    private Double facilitiesRating;
    private Double mealQualityRating;
    private String content;
    private Boolean isHidden;
    private Integer reportsCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}