package com.globalcarelink.auth;

import com.globalcarelink.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "members")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Member extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 100)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false, length = 50)
    private String name;
    
    @Column(length = 20)
    private String phoneNumber;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberRole role;
    
    @Builder.Default
    @Column(nullable = false)
    private Boolean isJobSeeker = false;
    
    @Builder.Default
    @Column(nullable = false)
    private Boolean isActive = true;
    
    @Column(length = 10)
    private String language;
    
    @Column(length = 100)
    private String region;
    
    public void updateProfile(String name, String phoneNumber, String language, String region) {
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.language = language;
        this.region = region;
    }
    
    public void updatePassword(String encodedPassword) {
        this.password = encodedPassword;
    }
    
    public void toggleJobSeekerStatus() {
        this.isJobSeeker = !this.isJobSeeker;
    }
    
    public void deactivate() {
        this.isActive = false;
    }
    
    public void activate() {
        this.isActive = true;
    }
    
    public boolean isOverseasUser() {
        return this.role == MemberRole.USER_OVERSEAS;
    }
    
    public boolean isStaff() {
        return this.role.isStaff();
    }
    
    // 컴파일 호환성을 위한 메서드들
    public String getUsername() {
        return this.email;  // email을 username으로 사용
    }
}