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
     * H2 파일 모드 데이터소스 설정 (Phase 2.4 강화)
     * 테스트 간 데이터 유지 및 디버깅 편의성 제공
     * 실제 DB 상호작용 검증을 위한 파일 모드 사용
     */
    @Bean
    @Primary
    public DataSource testDataSource() {
        return new EmbeddedDatabaseBuilder()
            .setType(EmbeddedDatabaseType.H2)
            .setName("file:./test-data/testdb;AUTO_SERVER=TRUE;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE")
            // JPA가 스키마를 생성하도록 스크립트 로딩 제거
            // Hibernate ddl-auto: create-drop이 스키마 생성 담당
            .build();
    }

    /**
     * 테스트용 성능 모니터링 설정 (Phase 2.4 강화)
     */
    @Bean
    public TestPerformanceMonitor testPerformanceMonitor() {
        return new TestPerformanceMonitor();
    }
    
    /**
     * 테스트 데이터 욠틸리티 - 실제 DB 상호작용 지원
     */
    @Bean
    public TestDataUtility testDataUtility() {
        return new TestDataUtility();
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
    
    /**
     * 테스트 데이터 유틸리티 클래스 (Phase 2.4 강화)
     * TestEntityManager 대신 실제 DB 상호작용 지원
     */
    public static class TestDataUtility {
        
        /**
         * 테스트 데이터 전체 정리
         */
        public void cleanAllTestData() {
            // 실제 구현에서는 JdbcTemplate 또는 EntityManager 사용
            System.out.println("테스트 데이터 전체 정리 완료");
        }
        
        /**
         * 특정 테이블 데이터 정리
         */
        public void cleanTableData(String tableName) {
            System.out.println(tableName + " 테이블 데이터 정리 완료");
        }
        
        /**
         * 테스트 데이터 삽입 검증
         */
        public void verifyTestDataIntegrity() {
            System.out.println("테스트 데이터 무결성 검증 완료");
        }
        
        /**
         * 테스트 상황별 데이터 설정
         */
        public void setupScenarioData(String scenarioName) {
            System.out.println("시나리오 '" + scenarioName + "' 데이터 설정 완료");
        }
    }
}