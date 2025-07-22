package com.globalcarelink.auth;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum MemberRole {
    
    ADMIN("관리자", "전체 시스템 관리"),
    FACILITY("시설회원", "국내 시설 관리자"),
    COORDINATOR("코디네이터", "글로벌 상담사"),
    DOMESTIC_USER("국내사용자", "일반 사용자 및 구직자"),
    OVERSEAS_USER("해외사용자", "재외동포 사용자 및 구직자");
    
    private final String displayName;
    private final String description;
    
    public boolean isUser() {
        return this == DOMESTIC_USER || this == OVERSEAS_USER;
    }
    
    public boolean isStaff() {
        return this == ADMIN || this == FACILITY || this == COORDINATOR;
    }
    
    public boolean isOverseas() {
        return this == OVERSEAS_USER;
    }
}