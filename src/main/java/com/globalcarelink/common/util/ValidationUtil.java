package com.globalcarelink.common.util;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.util.regex.Pattern;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class ValidationUtil {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );
    
    private static final Pattern PHONE_PATTERN = Pattern.compile(
            "^01[0-9]-\\d{3,4}-\\d{4}$"
    );
    
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,20}$"
    );
    
    private static final Pattern KOREAN_NAME_PATTERN = Pattern.compile(
            "^[가-힣]{2,10}$"
    );

    public static boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }

    public static boolean isValidPhoneNumber(String phoneNumber) {
        if (phoneNumber == null) return true; // Optional field
        return PHONE_PATTERN.matcher(phoneNumber).matches();
    }

    public static boolean isValidPassword(String password) {
        return password != null && PASSWORD_PATTERN.matcher(password).matches();
    }

    public static boolean isValidKoreanName(String name) {
        return name != null && KOREAN_NAME_PATTERN.matcher(name).matches();
    }

    public static boolean isValidRegion(String region) {
        if (region == null || region.trim().isEmpty()) return true; // Optional field
        return region.length() >= 2 && region.length() <= 100;
    }

    public static boolean isValidLanguageCode(String language) {
        if (language == null || language.trim().isEmpty()) return true; // Optional field
        return language.matches("^[a-z]{2}(-[A-Z]{2})?$"); // ko, en, zh-CN 등
    }

    public static String getPasswordValidationMessage() {
        return "비밀번호는 8-20자이며, 대소문자, 숫자, 특수문자(@$!%*?&)를 각각 하나 이상 포함해야 합니다.";
    }

    public static String getPhoneValidationMessage() {
        return "전화번호는 010-1234-5678 형식이어야 합니다.";
    }

    public static String getEmailValidationMessage() {
        return "올바른 이메일 형식이 아닙니다.";
    }

    public static String sanitizeInput(String input) {
        if (input == null) return null;
        
        return input.trim()
                   .replaceAll("<script[^>]*>.*?</script>", "")
                   .replaceAll("<[^>]+>", "")
                   .replaceAll("[\\r\\n]+", " ");
    }

    public static boolean containsSuspiciousPattern(String input) {
        if (input == null) return false;
        
        String lowerInput = input.toLowerCase();
        return lowerInput.contains("<script") || 
               lowerInput.contains("javascript:") ||
               lowerInput.contains("onload=") ||
               lowerInput.contains("onerror=") ||
               lowerInput.contains("eval(") ||
               lowerInput.contains("document.cookie");
    }
}