package com.globalcarelink.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.util.Properties;

/**
 * H2 데이터소스 설정 클래스
 * 메인 데이터베이스로 사용되는 H2 설정
 */
@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
    basePackages = "com.globalcarelink",
    excludeFilters = @org.springframework.context.annotation.ComponentScan.Filter(
        type = org.springframework.context.annotation.FilterType.ASSIGNABLE_TYPE,
        classes = {com.globalcarelink.logging.SQLiteConfig.class}
    ),
    entityManagerFactoryRef = "h2EntityManagerFactory",
    transactionManagerRef = "h2TransactionManager"
)
public class H2DataSourceConfig {

    @Value("${spring.datasource.url}")
    private String url;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @Value("${spring.datasource.driver-class-name}")
    private String driverClassName;

    @Value("${spring.datasource.hikari.minimum-idle:5}")
    private int minimumIdle;

    @Value("${spring.datasource.hikari.maximum-pool-size:20}")
    private int maximumPoolSize;

    @Value("${spring.datasource.hikari.connection-timeout:30000}")
    private long connectionTimeout;

    @Value("${spring.datasource.hikari.idle-timeout:600000}")
    private long idleTimeout;

    @Value("${spring.datasource.hikari.max-lifetime:1800000}")
    private long maxLifetime;

    @Value("${spring.datasource.hikari.leak-detection-threshold:60000}")
    private long leakDetectionThreshold;

    /**
     * H2 메인 데이터소스 설정 - @Primary로 지정
     */
    @Primary
    @Bean(name = "h2DataSource")
    public DataSource h2DataSource() {
        HikariConfig config = new HikariConfig();
        
        // 기본 연결 정보
        config.setJdbcUrl(url);
        config.setUsername(username);
        config.setPassword(password);
        config.setDriverClassName(driverClassName);
        
        // 커넥션 풀 설정
        config.setMinimumIdle(minimumIdle);
        config.setMaximumPoolSize(maximumPoolSize);
        config.setConnectionTimeout(connectionTimeout);
        config.setIdleTimeout(idleTimeout);
        config.setMaxLifetime(maxLifetime);
        config.setLeakDetectionThreshold(leakDetectionThreshold);
        
        // H2 최적화 설정
        config.addDataSourceProperty("cachePrepStmts", "true");
        config.addDataSourceProperty("prepStmtCacheSize", "250");
        config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");
        config.addDataSourceProperty("useServerPrepStmts", "true");
        
        // 풀 이름 설정
        config.setPoolName("H2-Primary-Pool");
        
        return new HikariDataSource(config);
    }

    /**
     * H2 EntityManagerFactory 설정 - @Primary로 지정
     */
    @Primary
    @Bean(name = "h2EntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean h2EntityManagerFactory(
            EntityManagerFactoryBuilder builder) {
        
        java.util.Map<String, Object> jpaProperties = new java.util.HashMap<>();
        jpaProperties.put("hibernate.dialect", "org.hibernate.dialect.H2Dialect");
        jpaProperties.put("hibernate.hbm2ddl.auto", "update");
        jpaProperties.put("hibernate.show_sql", "false");
        jpaProperties.put("hibernate.format_sql", "false");
        
        // 성능 최적화 설정
        jpaProperties.put("hibernate.jdbc.batch_size", "50");
        jpaProperties.put("hibernate.order_inserts", "true");
        jpaProperties.put("hibernate.order_updates", "true");
        jpaProperties.put("hibernate.default_batch_fetch_size", "100");
        
        // 캐시 비활성화 (JCache 의존성 미포함으로 인한 오류 방지)
        jpaProperties.put("hibernate.cache.use_second_level_cache", "false");
        jpaProperties.put("hibernate.cache.use_query_cache", "false");
        jpaProperties.put("hibernate.cache.region.factory_class", 
                         "org.hibernate.cache.internal.NoCachingRegionFactory");
        
        return builder
                .dataSource(h2DataSource())
                .packages("com.globalcarelink")
                .persistenceUnit("h2PU")
                .properties(jpaProperties)
                .build();
    }

    /**
     * H2 TransactionManager 설정 - @Primary로 지정
     */
    @Primary
    @Bean(name = "h2TransactionManager")
    public PlatformTransactionManager h2TransactionManager(
            LocalContainerEntityManagerFactoryBean h2EntityManagerFactory) {
        return new JpaTransactionManager(h2EntityManagerFactory.getObject());
    }
}