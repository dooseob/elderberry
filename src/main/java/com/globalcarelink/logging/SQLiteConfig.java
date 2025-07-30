package com.globalcarelink.logging;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.init.DataSourceInitializer;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.sqlite.SQLiteDataSource;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * SQLite 설정 클래스
 * 에이전트 로그 및 통계 데이터 저장용 SQLite 데이터베이스 설정
 */
@Configuration
@ConfigurationProperties(prefix = "sqlite")
public class SQLiteConfig {

    @Value("${sqlite.agent-logs.url:jdbc:sqlite:./data/agent-logs.db}")
    private String agentLogsUrl;

    @Value("${sqlite.agent-logs.init-script:classpath:sqlite/init-agent-logs.sql}")
    private String initScript;

    @Value("${sqlite.initialize-schema:true}")
    private boolean initializeSchema;

    /**
     * SQLite 데이터소스 설정
     */
    @Bean(name = "sqliteDataSource")
    public DataSource sqliteDataSource() {
        // 데이터 디렉토리 생성
        createDataDirectoryIfNotExists();
        
        SQLiteDataSource dataSource = new SQLiteDataSource();
        dataSource.setUrl(agentLogsUrl);
        
        // SQLite 성능 최적화 설정
        dataSource.getConfig().enforceForeignKeys(true);
        dataSource.getConfig().enableSharedCache(true);
        dataSource.getConfig().setBusyTimeout(30000);
        
        return dataSource;
    }

    /**
     * SQLite용 JdbcTemplate
     */
    @Bean(name = "sqliteJdbcTemplate")
    public JdbcTemplate sqliteJdbcTemplate() {
        return new JdbcTemplate(sqliteDataSource());
    }

    /**
     * SQLite용 Transaction Manager
     */
    @Bean(name = "sqliteTransactionManager")
    public PlatformTransactionManager sqliteTransactionManager() {
        return new DataSourceTransactionManager(sqliteDataSource());
    }

    /**
     * SQLite 데이터베이스 초기화
     */  
    @Bean(name = "sqliteDataSourceInitializer")
    public DataSourceInitializer sqliteDataSourceInitializer() {
        if (!initializeSchema) {
            return null;
        }

        DataSourceInitializer initializer = new DataSourceInitializer();
        initializer.setDataSource(sqliteDataSource());
        
        ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
        populator.addScript(new ClassPathResource("sqlite/init-agent-logs.sql"));
        populator.setContinueOnError(false);
        populator.setIgnoreFailedDrops(true);
        
        initializer.setDatabasePopulator(populator);
        initializer.setEnabled(true);
        
        return initializer;
    }

    /**
     * 데이터 디렉토리 생성
     */
    private void createDataDirectoryIfNotExists() {
        try {
            // URL에서 파일 경로 추출
            String filePath = agentLogsUrl.replace("jdbc:sqlite:", "");
            Path path = Paths.get(filePath).getParent();
            
            if (path != null && !Files.exists(path)) {
                Files.createDirectories(path);
                System.out.println("✅ SQLite 데이터 디렉토리 생성: " + path);
            }
        } catch (Exception e) {
            System.err.println("❌ SQLite 데이터 디렉토리 생성 실패: " + e.getMessage());
            throw new RuntimeException("SQLite 설정 오류", e);
        }
    }

    // Getters and Setters
    public String getAgentLogsUrl() {
        return agentLogsUrl;
    }

    public void setAgentLogsUrl(String agentLogsUrl) {
        this.agentLogsUrl = agentLogsUrl;
    }

    public String getInitScript() {
        return initScript;
    }

    public void setInitScript(String initScript) {
        this.initScript = initScript;
    }

    public boolean isInitializeSchema() {
        return initializeSchema;
    }

    public void setInitializeSchema(boolean initializeSchema) {
        this.initializeSchema = initializeSchema;
    }
}