package com.globalcarelink.common.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCaffeine(caffeineCacheBuilder());
        cacheManager.setCacheNames(
                java.util.List.of(
                        "coordinator-matches",
                        "coordinator-settings", 
                        "health-assessments",
                        "matching-statistics",
                        "language-skills"
                )
        );
        return cacheManager;
    }

    private Caffeine<Object, Object> caffeineCacheBuilder() {
        return Caffeine.newBuilder()
                .initialCapacity(100)
                .maximumSize(1000)
                .expireAfterAccess(Duration.ofMinutes(30))
                .expireAfterWrite(Duration.ofMinutes(60))
                .recordStats();
    }

    @Bean("coordinatorMatchCache")
    public CacheManager coordinatorMatchCacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager("coordinator-matches");
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .initialCapacity(50)
                .maximumSize(500)
                .expireAfterAccess(Duration.ofMinutes(15))
                .expireAfterWrite(Duration.ofMinutes(30))
                .recordStats());
        return cacheManager;
    }

    @Bean("healthAssessmentCache")
    public CacheManager healthAssessmentCacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager("health-assessments");
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .initialCapacity(100)
                .maximumSize(2000)
                .expireAfterAccess(Duration.ofMinutes(60))
                .expireAfterWrite(Duration.ofHours(2))
                .recordStats());
        return cacheManager;
    }

    @Bean("statisticsCache")
    public CacheManager statisticsCacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager("matching-statistics");
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .initialCapacity(10)
                .maximumSize(100)
                .expireAfterAccess(Duration.ofMinutes(10))
                .expireAfterWrite(Duration.ofMinutes(15))
                .recordStats());
        return cacheManager;
    }
} 