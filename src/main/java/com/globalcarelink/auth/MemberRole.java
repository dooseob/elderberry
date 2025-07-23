package com.globalcarelink.auth;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 회원 역할 정의 - 사용자와 구직자 완전 분리
 * 
 * 역할 분류:
 * 1. 관리/운영진: ADMIN, FACILITY, COORDINATOR
 * 2. 환자/가족: USER_DOMESTIC, USER_OVERSEAS (요양 서비스 이용자)
 * 3. 구직자: JOB_SEEKER_DOMESTIC, JOB_SEEKER_OVERSEAS (요양 분야 취업 희망자)
 */
@Getter
@RequiredArgsConstructor
public enum MemberRole {
    
    // === 관리/운영진 ===
    ADMIN("관리자", "전체 시스템 관리", MemberType.STAFF),
    FACILITY("시설회원", "국내 시설 관리자", MemberType.STAFF),
    COORDINATOR("코디네이터", "글로벌 상담사", MemberType.STAFF),
    
    // === 환자/가족 (요양 서비스 이용자) ===
    USER_DOMESTIC("국내 사용자", "국내 거주 환자 및 가족", MemberType.PATIENT_FAMILY),
    USER_OVERSEAS("해외 사용자", "재외동포 환자 및 가족", MemberType.PATIENT_FAMILY),
    
    // === 구직자 (요양 분야 취업 희망자) ===
    JOB_SEEKER_DOMESTIC("국내 구직자", "국내 요양 분야 구직자", MemberType.JOB_SEEKER),
    JOB_SEEKER_OVERSEAS("해외 구직자", "해외 요양 분야 구직자", MemberType.JOB_SEEKER);
    
    private final String displayName;
    private final String description;
    private final MemberType memberType;
    
    // === 역할 분류 메서드 ===
    
    /**
     * 환자/가족 사용자 여부
     */
    public boolean isPatientFamily() {
        return memberType == MemberType.PATIENT_FAMILY;
    }
    
    /**
     * 구직자 여부
     */
    public boolean isJobSeeker() {
        return memberType == MemberType.JOB_SEEKER;
    }
    
    /**
     * 관리/운영진 여부
     */
    public boolean isStaff() {
        return memberType == MemberType.STAFF;
    }
    
    /**
     * 해외 거주자 여부 (재외동포)
     */
    public boolean isOverseas() {
        return this == USER_OVERSEAS || this == JOB_SEEKER_OVERSEAS;
    }
    
    /**
     * 국내 거주자 여부
     */
    public boolean isDomestic() {
        return this == USER_DOMESTIC || this == JOB_SEEKER_DOMESTIC;
    }
    
    /**
     * 코디네이터 서비스 이용 가능 여부
     */
    public boolean canUseCoordinatorService() {
        return isPatientFamily(); // 환자/가족만 코디네이터 서비스 이용 가능
    }
    
    /**
     * 구인구직 서비스 이용 가능 여부
     */
    public boolean canUseJobService() {
        return isJobSeeker() || this == FACILITY; // 구직자 + 시설회원(구인)
    }
    
    /**
     * 건강 평가 서비스 이용 가능 여부
     */
    public boolean canUseHealthAssessment() {
        return isPatientFamily(); // 환자/가족만 건강 평가 가능
    }
    
    // === 내부 열거형 ===
    
    /**
     * 회원 유형 분류
     */
    public enum MemberType {
        STAFF,          // 관리/운영진
        PATIENT_FAMILY, // 환자/가족
        JOB_SEEKER      // 구직자
    }
}