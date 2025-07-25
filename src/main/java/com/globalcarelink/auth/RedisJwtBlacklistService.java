package com.globalcarelink.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * Redis 기반 JWT 토큰 블랙리스트 서비스
 * 서버 재시작 시에도 블랙리스트가 유지되어 보안성 향상
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RedisJwtBlacklistService {

    private final RedisTemplate<String, String> redisTemplate;
    
    private static final String BLACKLIST_KEY_PREFIX = "jwt:blacklist:";
    private static final String TOKEN_METADATA_PREFIX = "jwt:metadata:";

    /**
     * 토큰을 블랙리스트에 추가
     * @param token JWT 토큰
     * @param expiration 토큰 만료 시간 (초)
     */
    public void addToBlacklist(String token, long expiration) {
        try {
            String key = BLACKLIST_KEY_PREFIX + token;
            // Redis에 토큰 저장, 토큰 만료 시간과 동일하게 TTL 설정
            redisTemplate.opsForValue().set(key, "blacklisted", Duration.ofSeconds(expiration));
            
            log.debug("토큰이 블랙리스트에 추가됨: {}", maskToken(token));
        } catch (Exception e) {
            log.error("토큰 블랙리스트 추가 실패: {}", e.getMessage());
            // Redis 실패 시에도 애플리케이션은 계속 동작하도록 예외를 던지지 않음
        }
    }

    /**
     * 토큰이 블랙리스트에 있는지 확인
     * @param token JWT 토큰
     * @return 블랙리스트에 있으면 true
     */
    public boolean isBlacklisted(String token) {
        try {
            String key = BLACKLIST_KEY_PREFIX + token;
            Boolean exists = redisTemplate.hasKey(key);
            
            if (Boolean.TRUE.equals(exists)) {
                log.debug("블랙리스트 토큰 감지: {}", maskToken(token));
                return true;
            }
            return false;
        } catch (Exception e) {
            log.error("토큰 블랙리스트 확인 실패: {}", e.getMessage());
            // Redis 실패 시 보안상 false 반환 (토큰 허용)
            // 실제 운영환경에서는 대체 방안 필요
            return false;
        }
    }

    /**
     * 토큰 메타데이터 저장
     * @param token JWT 토큰
     * @param metadata 메타데이터
     * @param expiration 만료 시간 (초)
     */
    public void saveTokenMetadata(String token, String metadata, long expiration) {
        try {
            String key = TOKEN_METADATA_PREFIX + token;
            redisTemplate.opsForValue().set(key, metadata, Duration.ofSeconds(expiration));
            
            log.debug("토큰 메타데이터 저장됨: {}", maskToken(token));
        } catch (Exception e) {
            log.error("토큰 메타데이터 저장 실패: {}", e.getMessage());
        }
    }

    /**
     * 토큰 메타데이터 조회
     * @param token JWT 토큰
     * @return 메타데이터 (없으면 null)
     */
    public String getTokenMetadata(String token) {
        try {
            String key = TOKEN_METADATA_PREFIX + token;
            return redisTemplate.opsForValue().get(key);
        } catch (Exception e) {
            log.error("토큰 메타데이터 조회 실패: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 특정 사용자의 모든 토큰을 블랙리스트에 추가 (전체 로그아웃)
     * @param userId 사용자 ID
     * @param expiration 만료 시간 (초)
     */
    public void blacklistAllUserTokens(String userId, long expiration) {
        try {
            String pattern = TOKEN_METADATA_PREFIX + "*";
            var keys = redisTemplate.keys(pattern);
            
            if (keys != null) {
                for (String metadataKey : keys) {
                    String metadata = redisTemplate.opsForValue().get(metadataKey);
                    if (metadata != null && metadata.contains("userId:" + userId)) {
                        // 메타데이터에서 토큰 추출하여 블랙리스트 추가
                        String token = metadataKey.replace(TOKEN_METADATA_PREFIX, "");
                        addToBlacklist(token, expiration);
                    }
                }
            }
            
            log.info("사용자 {}의 모든 토큰이 블랙리스트에 추가됨", userId);
        } catch (Exception e) {
            log.error("사용자 토큰 일괄 블랙리스트 실패: {}", e.getMessage());
        }
    }

    /**
     * 블랙리스트 통계 조회
     * @return 블랙리스트된 토큰 수
     */
    public long getBlacklistCount() {
        try {
            var keys = redisTemplate.keys(BLACKLIST_KEY_PREFIX + "*");
            return keys != null ? keys.size() : 0;
        } catch (Exception e) {
            log.error("블랙리스트 통계 조회 실패: {}", e.getMessage());
            return 0;
        }
    }

    /**
     * 만료된 블랙리스트 항목 정리 (Redis TTL에 의해 자동으로 정리되지만 수동 정리도 가능)
     */
    public void cleanupExpiredTokens() {
        try {
            var keys = redisTemplate.keys(BLACKLIST_KEY_PREFIX + "*");
            if (keys != null) {
                for (String key : keys) {
                    Long ttl = redisTemplate.getExpire(key, TimeUnit.SECONDS);
                    if (ttl != null && ttl <= 0) {
                        redisTemplate.delete(key);
                    }
                }
            }
            
            log.debug("만료된 블랙리스트 토큰 정리 완료");
        } catch (Exception e) {
            log.error("블랙리스트 정리 실패: {}", e.getMessage());
        }
    }

    /**
     * 보안을 위한 토큰 마스킹
     * @param token 원본 토큰
     * @return 마스킹된 토큰
     */
    private String maskToken(String token) {
        if (token == null || token.length() < 20) {
            return "***";
        }
        return token.substring(0, 10) + "..." + token.substring(token.length() - 10);
    }
}