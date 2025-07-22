package com.globalcarelink.auth.dto;

import com.globalcarelink.auth.MemberRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberRegisterRequest {
    
    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "올바른 이메일 형식이 아닙니다")
    private String email;
    
    @NotBlank(message = "비밀번호는 필수입니다")
    @Size(min = 8, max = 20, message = "비밀번호는 8-20자여야 합니다")
    private String password;
    
    @NotBlank(message = "이름은 필수입니다")
    @Size(max = 50, message = "이름은 50자 이하여야 합니다")
    private String name;
    
    @Size(max = 20, message = "전화번호는 20자 이하여야 합니다")
    private String phoneNumber;
    
    @NotNull(message = "사용자 역할은 필수입니다")
    private MemberRole role;
    
    @Builder.Default
    private Boolean isJobSeeker = false;
    
    @Size(max = 10, message = "언어 코드는 10자 이하여야 합니다")
    private String language;
    
    @Size(max = 100, message = "지역은 100자 이하여야 합니다")
    private String region;
}