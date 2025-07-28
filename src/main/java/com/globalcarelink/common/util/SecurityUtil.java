package com.globalcarelink.common.util;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.servlet.http.HttpServletRequest;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.regex.Pattern;

@Slf4j
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class SecurityUtil {

    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/ECB/PKCS5Padding";
    private static final String DEFAULT_KEY = "GlobalCareLink!"; // 16자 고정 키 (개발용)
    
    private static final Pattern SQL_INJECTION_PATTERN = Pattern.compile(
            "('.+(\\s)*(or|OR|and|AND)\\s*'.+)|('.+\\s*(or|OR|and|AND)\\s*\\w+.*)|" +
            "(\\w+\\s*(=|LIKE|like)\\s*'.*(or|OR|and|AND).*')|" +
            "(union|UNION|select|SELECT|insert|INSERT|delete|DELETE|update|UPDATE|drop|DROP)"
    );

    /**
     * 클라이언트 IP 주소 추출
     */
    public static String getClientIpAddress(HttpServletRequest request) {
        String clientIp = null;
        
        // X-Forwarded-For 헤더 확인 (프록시 환경)
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            clientIp = xForwardedFor.split(",")[0].trim();
        }
        
        // X-Real-IP 헤더 확인 (Nginx 등)
        if (clientIp == null || clientIp.isEmpty() || "unknown".equalsIgnoreCase(clientIp)) {
            clientIp = request.getHeader("X-Real-IP");
        }
        
        // Proxy-Client-IP 헤더 확인
        if (clientIp == null || clientIp.isEmpty() || "unknown".equalsIgnoreCase(clientIp)) {
            clientIp = request.getHeader("Proxy-Client-IP");
        }
        
        // WL-Proxy-Client-IP 헤더 확인 (WebLogic)
        if (clientIp == null || clientIp.isEmpty() || "unknown".equalsIgnoreCase(clientIp)) {
            clientIp = request.getHeader("WL-Proxy-Client-IP");
        }
        
        // HTTP_CLIENT_IP 헤더 확인
        if (clientIp == null || clientIp.isEmpty() || "unknown".equalsIgnoreCase(clientIp)) {
            clientIp = request.getHeader("HTTP_CLIENT_IP");
        }
        
        // HTTP_X_FORWARDED_FOR 헤더 확인
        if (clientIp == null || clientIp.isEmpty() || "unknown".equalsIgnoreCase(clientIp)) {
            clientIp = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        
        // 기본 RemoteAddr 사용
        if (clientIp == null || clientIp.isEmpty() || "unknown".equalsIgnoreCase(clientIp)) {
            clientIp = request.getRemoteAddr();
        }
        
        // IPv6 로컬호스트를 IPv4로 변환
        if ("0:0:0:0:0:0:0:1".equals(clientIp)) {
            clientIp = "127.0.0.1";
        }
        
        return clientIp != null ? clientIp : "unknown";
    }

    public static String encryptSensitiveData(String plainText) {
        try {
            SecretKeySpec secretKey = new SecretKeySpec(DEFAULT_KEY.getBytes(StandardCharsets.UTF_8), ALGORITHM);
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            
            byte[] encryptedBytes = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encryptedBytes);
            
        } catch (Exception e) {
            log.error("데이터 암호화 실패: {}", e.getMessage());
            return plainText; // 실패 시 원본 반환 (개발용)
        }
    }

    public static String decryptSensitiveData(String encryptedText) {
        try {
            SecretKeySpec secretKey = new SecretKeySpec(DEFAULT_KEY.getBytes(StandardCharsets.UTF_8), ALGORITHM);
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            
            byte[] decryptedBytes = cipher.doFinal(Base64.getDecoder().decode(encryptedText));
            return new String(decryptedBytes, StandardCharsets.UTF_8);
            
        } catch (Exception e) {
            log.error("데이터 복호화 실패: {}", e.getMessage());
            return encryptedText; // 실패 시 원본 반환
        }
    }

    public static String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        
        String[] parts = email.split("@");
        String username = parts[0];
        String domain = parts[1];
        
        if (username.length() <= 2) return email;
        
        String maskedUsername = username.charAt(0) + "*".repeat(username.length() - 2) + username.charAt(username.length() - 1);
        return maskedUsername + "@" + domain;
    }

    public static String maskPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.length() < 8) return phoneNumber;
        
        return phoneNumber.substring(0, 3) + "-****-" + phoneNumber.substring(phoneNumber.length() - 4);
    }

    public static String generateSecureToken() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public static String generateSecurePassword(int length) {
        if (length < 8) length = 8;
        if (length > 128) length = 128;
        
        String upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String lowerCase = "abcdefghijklmnopqrstuvwxyz";
        String digits = "0123456789";
        String specialChars = "@$!%*?&";
        String allChars = upperCase + lowerCase + digits + specialChars;
        
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder();
        
        // 각 카테고리에서 최소 1개씩 포함
        password.append(upperCase.charAt(random.nextInt(upperCase.length())));
        password.append(lowerCase.charAt(random.nextInt(lowerCase.length())));
        password.append(digits.charAt(random.nextInt(digits.length())));
        password.append(specialChars.charAt(random.nextInt(specialChars.length())));
        
        // 나머지 길이만큼 랜덤 생성
        for (int i = 4; i < length; i++) {
            password.append(allChars.charAt(random.nextInt(allChars.length())));
        }
        
        // 문자열 섞기
        return shuffleString(password.toString());
    }

    public static boolean containsSqlInjection(String input) {
        if (input == null) return false;
        return SQL_INJECTION_PATTERN.matcher(input).find();
    }

    public static String sanitizeForSql(String input) {
        if (input == null) return null;
        
        return input.replaceAll("'", "''")
                   .replaceAll("\"", "\\\"")
                   .replaceAll(";", "")
                   .replaceAll("--", "")
                   .replaceAll("/\\*", "")
                   .replaceAll("\\*/", "");
    }

    public static boolean isSecurePassword(String password) {
        if (password == null || password.length() < 8 || password.length() > 128) {
            return false;
        }
        
        boolean hasUpper = password.chars().anyMatch(Character::isUpperCase);
        boolean hasLower = password.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        boolean hasSpecial = password.chars().anyMatch(ch -> "@$!%*?&".indexOf(ch) >= 0);
        
        return hasUpper && hasLower && hasDigit && hasSpecial;
    }

    public static SecretKey generateAESKey() throws NoSuchAlgorithmException {
        KeyGenerator keyGenerator = KeyGenerator.getInstance(ALGORITHM);
        keyGenerator.init(256);
        return keyGenerator.generateKey();
    }

    private static String shuffleString(String input) {
        char[] characters = input.toCharArray();
        SecureRandom random = new SecureRandom();
        
        for (int i = characters.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char temp = characters[i];
            characters[i] = characters[j];
            characters[j] = temp;
        }
        
        return new String(characters);
    }
}