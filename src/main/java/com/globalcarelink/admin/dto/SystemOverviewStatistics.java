package com.globalcarelink.admin.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SystemOverviewStatistics {
    // 회원 통계
    private Long totalMembers;
    private Long activeMembers;
    private Long adminMembers;
    private Long facilityMembers;
    private Long coordinatorMembers;
    private Long patientFamilyMembers;
    private Long jobSeekerMembers;
    
    // 컨텐츠 통계
    private Long totalPosts;
    private Long totalReviews;
    private Long totalFacilities;
    private Long totalJobs;
    
    // 활동 통계
    private Long todayRegistrations;
    private Long todayPosts;
    private Long todayReviews;
    private Long pendingApprovals;
    
    // 시스템 상태
    private String systemStatus;
    private Double avgResponseTime;
    private Long totalDiskUsage;
}