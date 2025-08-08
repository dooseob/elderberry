package com.globalcarelink.admin.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminFacilityResponse {
    private Long id;
    private String name;
    private String address;
    private String phoneNumber;
    private String facilityType;
    private String ownerName;
    private String ownerEmail;
    private String approvalStatus; // PENDING, APPROVED, REJECTED
    private String rejectionReason;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
    private String reviewerName;
}