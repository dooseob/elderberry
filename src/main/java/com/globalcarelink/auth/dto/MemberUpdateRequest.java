package com.globalcarelink.auth.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MemberUpdateRequest {
    
    @Size(max = 50, message = "이름은 50자 이하여야 합니다")
    private String name;
    
    @Size(max = 20, message = "전화번호는 20자 이하여야 합니다")
    private String phoneNumber;
    
    @Size(max = 10, message = "언어 코드는 10자 이하여야 합니다")
    private String language;
    
    @Size(max = 100, message = "지역은 100자 이하여야 합니다")
    private String region;
}