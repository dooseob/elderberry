package com.globalcarelink.admin.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class MemberRegistrationStats {
    private LocalDate date;
    private Long registrationCount;
    private Long adminCount;
    private Long facilityCount;
    private Long coordinatorCount;
    private Long patientFamilyCount;
    private Long jobSeekerCount;
}