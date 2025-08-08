package com.globalcarelink.admin.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminPostSearchRequest {
    private String boardType;
    private Boolean hasReports;
    private Boolean isHidden;
}