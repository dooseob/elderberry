package com.globalcarelink.admin.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminReviewSearchRequest {
    private Boolean hasReports;
    private Boolean isHidden;
    private Double maxRating; // 이하 평점 필터
}