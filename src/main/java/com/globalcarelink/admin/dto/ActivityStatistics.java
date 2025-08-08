package com.globalcarelink.admin.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ActivityStatistics {
    // 게시글 활동
    private Long totalPosts;
    private Long newPosts;
    private Long reportedPosts;
    private Long hiddenPosts;
    
    // 리뷰 활동
    private Long totalReviews;
    private Long newReviews;
    private Long reportedReviews;
    private Long hiddenReviews;
    
    // 채팅 활동
    private Long totalChats;
    private Long newChats;
    private Long activeUsers;
    
    // 구인구직 활동
    private Long totalJobPosts;
    private Long newJobPosts;
    private Long jobApplications;
}