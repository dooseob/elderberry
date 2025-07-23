package com.globalcarelink.external.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.retry.annotation.EnableRetry;

/**
 * Spring Retry 설정
 * 공공데이터 API 호출 재시도 기능 활성화
 */
@Configuration
@EnableRetry
public class RetryConfig {
    // Spring Retry 기능 활성화
} 