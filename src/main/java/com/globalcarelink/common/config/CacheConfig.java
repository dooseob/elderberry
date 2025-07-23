package com.globalcarelink.common.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/**
 * 캐시 설정 (Caffeine 기반 고성능 캐싱)
 * - 메모리 효율적인 캐싱
 * - TTL 기반 만료 정책
 * - 크기 기반 제거 정책
 * - 통계 및 모니터링 지원
 */
@Slf4j
@Configuration
@EnableCaching
public class CacheConfig {

    @Value("${cache.health-assessment.max-size:1000}")
    private long healthAssessmentMaxSize;

    @Value("${cache.health-assessment.ttl-minutes:30}")
    private long healthAssessmentTtlMinutes;

    @Value("${cache.coordinator-matching.max-size:500}")
    private long coordinatorMatchingMaxSize;

    @Value("${cache.coordinator-matching.ttl-minutes:60}")
    private long coordinatorMatchingTtlMinutes;

    @Value("${cache.member.max-size:2000}")
    private long memberMaxSize;

    @Value("${cache.member.ttl-minutes:15}")
    private long memberTtlMinutes;

    @Value("${cache.statistics.max-size:100}")
    private long statisticsMaxSize;

    @Value("${cache.statistics.ttl-minutes:120}")
    private long statisticsTtlMinutes;

    /**
     * 기본 캐시 매니저 설정
     */
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCaffeine(defaultCaffeineBuilder());
        
        // 캐시별 개별 설정
        cacheManager.registerCustomCache("healthAssessments", 
                createHealthAssessmentCache().build());
        cacheManager.registerCustomCache("healthAssessmentStats", 
                createStatisticsCache().build());
        cacheManager.registerCustomCache("coordinatorMatching", 
                createCoordinatorMatchingCache().build());
        cacheManager.registerCustomCache("members", 
                createMemberCache().build());
        cacheManager.registerCustomCache("profiles", 
                createProfileCache().build());
        
        log.info("Caffeine 캐시 매니저 설정 완료");
        return cacheManager;
    }

    /**
     * 기본 Caffeine 빌더
     */
    private Caffeine<Object, Object> defaultCaffeineBuilder() {
        return Caffeine.newBuilder()
                .maximumSize(1000)
                .expireAfterWrite(Duration.ofMinutes(30))
                .expireAfterAccess(Duration.ofMinutes(10))
                .recordStats()
                .removalListener((key, value, cause) -> 
                    log.debug("캐시 제거: key={}, cause={}", key, cause));
    }

    /**
     * 건강 평가 캐시 설정
     * - 자주 조회되는 건강 평가 데이터
     * - 중간 크기 캐시, 적당한 TTL
     */
    private Caffeine<Object, Object> createHealthAssessmentCache() {
        return Caffeine.newBuilder()
                .maximumSize(healthAssessmentMaxSize)
                .expireAfterWrite(Duration.ofMinutes(healthAssessmentTtlMinutes))
                .expireAfterAccess(Duration.ofMinutes(healthAssessmentTtlMinutes / 2))
                .recordStats()
                .removalListener((key, value, cause) -> 
                    log.debug("건강평가 캐시 제거: key={}, cause={}", key, cause));
    }

    /**
     * 통계 캐시 설정
     * - 계산 비용이 높은 통계 데이터
     * - 작은 크기, 긴 TTL
     */
    private Caffeine<Object, Object> createStatisticsCache() {
        return Caffeine.newBuilder()
                .maximumSize(statisticsMaxSize)
                .expireAfterWrite(Duration.ofMinutes(statisticsTtlMinutes))
                .recordStats()
                .removalListener((key, value, cause) -> 
                    log.debug("통계 캐시 제거: key={}, cause={}", key, cause));
    }

    /**
     * 코디네이터 매칭 캐시 설정
     * - 복잡한 매칭 알고리즘 결과
     * - 중간 크기, 긴 TTL
     */
    private Caffeine<Object, Object> createCoordinatorMatchingCache() {
        return Caffeine.newBuilder()
                .maximumSize(coordinatorMatchingMaxSize)
                .expireAfterWrite(Duration.ofMinutes(coordinatorMatchingTtlMinutes))
                .expireAfterAccess(Duration.ofMinutes(coordinatorMatchingTtlMinutes / 3))
                .recordStats()
                .removalListener((key, value, cause) -> 
                    log.debug("매칭 캐시 제거: key={}, cause={}", key, cause));
    }

    /**
     * 회원 정보 캐시 설정
     * - 자주 조회되는 회원 데이터
     * - 큰 크기, 짧은 TTL (데이터 일관성 중요)
     */
    private Caffeine<Object, Object> createMemberCache() {
        return Caffeine.newBuilder()
                .maximumSize(memberMaxSize)
                .expireAfterWrite(Duration.ofMinutes(memberTtlMinutes))
                .expireAfterAccess(Duration.ofMinutes(memberTtlMinutes / 2))
                .recordStats()
                .removalListener((key, value, cause) -> 
                    log.debug("회원 캐시 제거: key={}, cause={}", key, cause));
    }

    /**
     * 프로필 캐시 설정
     * - 프로필 데이터 (국내/해외)
     * - 중간 크기, 적당한 TTL
     */
    private Caffeine<Object, Object> createProfileCache() {
        return Caffeine.newBuilder()
                .maximumSize(1500)
                .expireAfterWrite(Duration.ofMinutes(45))
                .expireAfterAccess(Duration.ofMinutes(20))
                .recordStats()
                .removalListener((key, value, cause) -> 
                    log.debug("프로필 캐시 제거: key={}, cause={}", key, cause));
    }

    /**
     * 캐시 통계 로깅을 위한 빈
     */
    @Bean
    public CacheStatsLogger cacheStatsLogger() {
        return new CacheStatsLogger();
    }

    /**
     * 캐시 통계 로거 클래스
     */
    public static class CacheStatsLogger {
        
        public void logCacheStats(CacheManager cacheManager) {
            if (cacheManager instanceof CaffeineCacheManager caffeineCacheManager) {
                caffeineCacheManager.getCacheNames().forEach(cacheName -> {
                    var cache = caffeineCacheManager.getCache(cacheName);
                    if (cache != null) {
                        var nativeCache = cache.getNativeCache();
                        if (nativeCache instanceof com.github.benmanes.caffeine.cache.Cache caffeineCache) {
                            var stats = caffeineCache.stats();
                            log.info("캐시 통계 [{}] - 히트율: {:.2f}%, 요청수: {}, 히트: {}, 미스: {}, 제거: {}", 
                                    cacheName,
                                    stats.hitRate() * 100,
                                    stats.requestCount(),
                                    stats.hitCount(),
                                    stats.missCount(),
                                    stats.evictionCount());
                        }
                    }
                });
            }
        }
    }
} 