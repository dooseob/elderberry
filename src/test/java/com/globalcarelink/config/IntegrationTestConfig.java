package com.globalcarelink.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseBuilder;
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseType;
import org.springframework.test.context.TestPropertySource;

import javax.sql.DataSource;

/**
 * 통합 테스트용 설정 클래스
 * H2 파일 모드 데이터베이스 및 테스트 전용 설정 제공
 * CLAUDE_GUIDELINES.md의 강화된 테스트 전략 지원
 */
@TestConfiguration
@TestPropertySource(locations = "classpath:application-test.yml")
public class IntegrationTestConfig {

    /**
     * H2 파일 모드 데이터소스 설정
     * 테스트 간 데이터 유지 및 디버깅 편의성 제공
     */
    @Bean
    @Primary
    public DataSource testDataSource() {
        return new EmbeddedDatabaseBuilder()
            .setType(EmbeddedDatabaseType.H2)
            .setName("testdb")
            // 초기 스키마 및 데이터 로딩 (필요시)
            // .addScript("classpath:schema.sql")
            // .addScript("classpath:test-data/initial-data.sql")
            .build();
    }

    /**
     * 테스트용 성능 모니터링 설정
     */
    @Bean
    public TestPerformanceMonitor testPerformanceMonitor() {
        return new TestPerformanceMonitor();
    }

    /**
     * 테스트 성능 모니터링 클래스
     */
    public static class TestPerformanceMonitor {
        
        private static final long MAX_QUERY_TIME_MS = 100L;
        private static final int MAX_BATCH_SIZE = 1000;
        
        public void validateQueryPerformance(long executionTimeMs, String queryDescription) {
            if (executionTimeMs > MAX_QUERY_TIME_MS) {
                System.err.println("성능 경고: " + queryDescription + " 실행 시간이 " + 
                    executionTimeMs + "ms로 임계값(" + MAX_QUERY_TIME_MS + "ms)을 초과했습니다.");
            }
        }
        
        public void validateBatchSize(int batchSize, String operationDescription) {
            if (batchSize > MAX_BATCH_SIZE) {
                throw new IllegalArgumentException(operationDescription + " 배치 크기(" + batchSize + 
                    ")가 최대 허용 크기(" + MAX_BATCH_SIZE + ")를 초과했습니다.");
            }
        }
    }
}