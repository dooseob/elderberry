package com.globalcarelink.simple;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Redis 없이 동작하는 간단한 인메모리 JWT 블랙리스트 서비스
 * SimpleApplication에서만 사용되며, 서버 재시작 시 블랙리스트가 초기화됨
 */
@Slf4j
@Service
@Profile("simple")
public class SimpleJwtBlacklistService {

    private final Map<String, LocalDateTime> blacklistedTokens = new ConcurrentHashMap<>();
    private final Map<String, String> tokenMetadataStore = new ConcurrentHashMap<>();
    
    private static final String BLACKLIST_KEY_PREFIX = "jwt:blacklist:";
    private static final String TOKEN_METADATA_PREFIX = "jwt:metadata:";

    /**
     * 토큰을 블랙리스트에 추가
     * @param token JWT 토큰
     * @param expiration 토큰 만료 시간 (초)
     */
    public void addToBlacklist(String token, long expiration) {
        try {
            LocalDateTime expiryTime = LocalDateTime.now().plusSeconds(expiration);
            blacklistedTokens.put(token, expiryTime);
            
            log.debug("토큰이 블랙리스트에 추가됨 (인메모리): {}", maskToken(token));
        } catch (Exception e) {
            log.error("토큰 블랙리스트 추가 실패: {}", e.getMessage());
        }
    }

    /**
     * 토큰이 블랙리스트에 있는지 확인
     * @param token JWT 토큰
     * @return 블랙리스트에 있으면 true
     */
    public boolean isBlacklisted(String token) {
        try {
            LocalDateTime expiryTime = blacklistedTokens.get(token);
            if (expiryTime != null) {
                if (LocalDateTime.now().isAfter(expiryTime)) {
                    // 만료된 토큰은 제거
                    blacklistedTokens.remove(token);
                    return false;
                }
                log.debug("블랙리스트 토큰 감지 (인메모리): {}", maskToken(token));
                return true;
            }
            return false;
        } catch (Exception e) {
            log.error("토큰 블랙리스트 확인 실패: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 토큰 메타데이터 저장
     * @param token JWT 토큰
     * @param metadata 메타데이터
     * @param expiration 만료 시간 (초) - 인메모리에서는 사용하지 않음
     */
    public void saveTokenMetadata(String token, String metadata, long expiration) {
        try {
            tokenMetadataStore.put(token, metadata);
            log.debug("토큰 메타데이터 저장됨 (인메모리): {}", maskToken(token));
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
            return tokenMetadataStore.get(token);
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
            int blacklistedCount = 0;
            LocalDateTime expiryTime = LocalDateTime.now().plusSeconds(expiration);
            
            for (Map.Entry<String, String> entry : tokenMetadataStore.entrySet()) {
                String metadata = entry.getValue();
                if (metadata != null && metadata.contains("userId:" + userId)) {
                    String token = entry.getKey();
                    blacklistedTokens.put(token, expiryTime);
                    blacklistedCount++;
                }
            }
            
            log.info("사용자 {}의 {} 개 토큰이 블랙리스트에 추가됨 (인메모리)", userId, blacklistedCount);
        } catch (Exception e) {
            log.error("사용자 토큰 일괄 블랙리스트 실패: {}", e.getMessage());
        }
    }

    /**
     * 블랙리스트 통계 조회
     * @return 블랙리스트된 토큰 수
     */
    public long getBlacklistCount() {
        cleanupExpiredTokens(); // 만료된 토큰 정리 후 카운트
        return blacklistedTokens.size();
    }

    /**
     * 만료된 블랙리스트 항목 정리
     */
    public void cleanupExpiredTokens() {
        try {
            LocalDateTime now = LocalDateTime.now();
            blacklistedTokens.entrySet().removeIf(entry -> now.isAfter(entry.getValue()));
            
            log.debug("만료된 블랙리스트 토큰 정리 완료 (인메모리)");
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