package com.globalcarelink.auth;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.DelegatingPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.password.Pbkdf2PasswordEncoder;
import org.springframework.security.crypto.scrypt.SCryptPasswordEncoder;

import java.util.HashMap;
import java.util.Map;

/**
 * 비밀번호 암호화 설정 (보안 강화 버전)
 * - 고강도 BCrypt 사용
 * - 다중 암호화 알고리즘 지원
 * - 암호화 강도 설정 가능
 */
@Slf4j
@Configuration
public class PasswordEncoderConfig {

    @Value("${security.password.bcrypt.strength:12}")
    private int bcryptStrength;

    @Value("${security.password.default.encoder:bcrypt}")
    private String defaultEncoder;

    /**
     * 향상된 비밀번호 인코더 설정
     * - BCrypt 강도 12 (기본값 10보다 높음)
     * - 다중 알고리즘 지원으로 마이그레이션 용이성 제공
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        // 다양한 암호화 알고리즘 인코더 설정
        Map<String, PasswordEncoder> encoders = new HashMap<>();
        
        // BCrypt - 기본 및 권장 인코더 (강도 12)
        BCryptPasswordEncoder bcryptEncoder = new BCryptPasswordEncoder(bcryptStrength);
        encoders.put("bcrypt", bcryptEncoder);
        
        // PBKDF2 - 대안 인코더 (NIST 승인)
        Pbkdf2PasswordEncoder pbkdf2Encoder = Pbkdf2PasswordEncoder.defaultsForSpringSecurity_v5_8();
        pbkdf2Encoder.setAlgorithm(Pbkdf2PasswordEncoder.SecretKeyFactoryAlgorithm.PBKDF2WithHmacSHA256);
        pbkdf2Encoder.setEncodeHashAsBase64(true);
        encoders.put("pbkdf2", pbkdf2Encoder);
        
        // SCrypt - 메모리 하드 함수 (높은 보안)
        SCryptPasswordEncoder scryptEncoder = SCryptPasswordEncoder.defaultsForSpringSecurity_v5_8();
        encoders.put("scrypt", scryptEncoder);
        
        // 레거시 지원을 위한 약한 인코더들 (새로운 비밀번호에는 사용하지 않음)
        encoders.put("noop", org.springframework.security.crypto.password.NoOpPasswordEncoder.getInstance());
        encoders.put("sha256", new org.springframework.security.crypto.password.StandardPasswordEncoder());
        
        // 위임 인코더 생성 - 기본값은 BCrypt 사용
        DelegatingPasswordEncoder delegatingEncoder = new DelegatingPasswordEncoder(defaultEncoder, encoders);
        
        // 레거시 비밀번호 형식 지원 (암호화 방식이 명시되지 않은 경우)
        delegatingEncoder.setDefaultPasswordEncoderForMatches(bcryptEncoder);
        
        log.info("비밀번호 인코더 설정 완료 - 기본: {}, BCrypt 강도: {}", defaultEncoder, bcryptStrength);
        
        return delegatingEncoder;
    }

    /**
     * BCrypt 전용 인코더 (특정 용도)
     */
    @Bean("bcryptPasswordEncoder")
    public BCryptPasswordEncoder bcryptPasswordEncoder() {
        return new BCryptPasswordEncoder(bcryptStrength);
    }

    /**
     * 비밀번호 강도 검증을 위한 추가 BCrypt 인코더
     * 더 높은 강도로 중요한 작업용
     */
    @Bean("highStrengthPasswordEncoder")
    public BCryptPasswordEncoder highStrengthPasswordEncoder() {
        int highStrength = Math.max(bcryptStrength + 2, 14); // 최소 14
        log.info("고강도 비밀번호 인코더 생성 - 강도: {}", highStrength);
        return new BCryptPasswordEncoder(highStrength);
    }
} 