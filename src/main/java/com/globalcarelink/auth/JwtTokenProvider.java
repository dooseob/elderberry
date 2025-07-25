package com.globalcarelink.auth;

import com.globalcarelink.common.exception.CustomException;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

/**
 * JWT 토큰 제공자 (Redis 블랙리스트 적용 버전)
 * - 리프레시 토큰 지원
 * - Redis 기반 토큰 블랙리스트 관리
 * - 서버 재시작 시에도 블랙리스트 유지
 * - 향상된 보안 검증
 * - 토큰 메타데이터 추적
 */
@Slf4j
@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long accessTokenValidityInMilliseconds;
    private final long refreshTokenValidityInMilliseconds;
    private final RedisJwtBlacklistService blacklistService;
    
    // Redis 기반으로 교체되어 제거된 기존 인메모리 저장소
    // private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();
    // private final Map<String, TokenMetadata> tokenMetadataStore = new ConcurrentHashMap<>();

    public JwtTokenProvider(
            @Value("${jwt.secret:mySecretKey}") String secretKey,
            @Value("${jwt.access-token-validity-in-seconds:1800}") long accessTokenValidityInSeconds,
            @Value("${jwt.refresh-token-validity-in-seconds:604800}") long refreshTokenValidityInSeconds,
            RedisJwtBlacklistService blacklistService) {
        
        // 보안 강화: 최소 256비트 키 보장
        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            // 키가 너무 짧으면 패딩하여 256비트로 만듦
            keyBytes = Arrays.copyOf(keyBytes, 32);
        }
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
        
        this.accessTokenValidityInMilliseconds = accessTokenValidityInSeconds * 1000;
        this.refreshTokenValidityInMilliseconds = refreshTokenValidityInSeconds * 1000;
        this.blacklistService = blacklistService;
        
        log.info("JWT 토큰 제공자 초기화 완료 (Redis 블랙리스트 적용) - Access Token 유효기간: {}초, Refresh Token 유효기간: {}초", 
                accessTokenValidityInSeconds, refreshTokenValidityInSeconds);
    }

    /**
     * 액세스 토큰 생성
     */
    public String createAccessToken(String email, Collection<? extends GrantedAuthority> authorities) {
        return createToken(email, authorities, accessTokenValidityInMilliseconds, TokenType.ACCESS);
    }

    /**
     * 리프레시 토큰 생성
     */
    public String createRefreshToken(String email) {
        return createToken(email, Collections.emptyList(), refreshTokenValidityInMilliseconds, TokenType.REFRESH);
    }

    /**
     * 토큰 쌍 생성 (액세스 + 리프레시)
     */
    public TokenPair createTokenPair(String email, Collection<? extends GrantedAuthority> authorities) {
        String accessToken = createAccessToken(email, authorities);
        String refreshToken = createRefreshToken(email);
        
        // 토큰 메타데이터 저장 (Redis 기반)
        TokenMetadata accessMetadata = TokenMetadata.builder()
                .tokenId(extractTokenId(accessToken))
                .email(email)
                .type(TokenType.ACCESS)
                .issuedAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusSeconds(accessTokenValidityInMilliseconds / 1000))
                .ipAddress(getCurrentIpAddress())
                .userAgent(getCurrentUserAgent())
                .build();
        
        TokenMetadata refreshMetadata = TokenMetadata.builder()
                .tokenId(extractTokenId(refreshToken))
                .email(email)
                .type(TokenType.REFRESH)
                .issuedAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusSeconds(refreshTokenValidityInMilliseconds / 1000))
                .ipAddress(getCurrentIpAddress())
                .userAgent(getCurrentUserAgent())
                .build();
        
        // Redis에 토큰 메타데이터 저장
        blacklistService.saveTokenMetadata(accessMetadata.getTokenId(), 
                accessMetadata.toString(), accessTokenValidityInMilliseconds / 1000);
        blacklistService.saveTokenMetadata(refreshMetadata.getTokenId(), 
                refreshMetadata.toString(), refreshTokenValidityInMilliseconds / 1000);
        
        return TokenPair.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .accessTokenExpiresAt(accessMetadata.getExpiresAt())
                .refreshTokenExpiresAt(refreshMetadata.getExpiresAt())
                .build();
    }

    /**
     * 토큰으로부터 인증 정보 추출
     */
    public Authentication getAuthentication(String token) {
        validateToken(token);
        
        Claims claims = getClaims(token);
        String email = claims.getSubject();
        
        @SuppressWarnings("unchecked")
        List<String> roles = (List<String>) claims.get("roles");
        
        Collection<? extends GrantedAuthority> authorities = roles != null ? 
                roles.stream()
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList()) :
                Collections.emptyList();

        UserDetails principal = new User(email, "", authorities);
        return new UsernamePasswordAuthenticationToken(principal, "", authorities);
    }

    /**
     * 토큰에서 이메일 추출
     */
    public String getEmailFromToken(String token) {
        try {
            Claims claims = getClaims(token);
            return claims.getSubject();
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("토큰에서 이메일 추출 실패: {}", e.getMessage());
            throw new CustomException.Unauthorized("유효하지 않은 토큰입니다");
        }
    }

    /**
     * 토큰 유효성 검증
     */
    public boolean validateToken(String token) {
        try {
            // Redis 블랙리스트 확인
            String tokenId = extractTokenId(token);
            if (blacklistService.isBlacklisted(tokenId)) {
                log.warn("블랙리스트에 등록된 토큰 사용 시도: {}", tokenId);
                throw new CustomException.Unauthorized("차단된 토큰입니다");
            }

            // JWT 파싱 및 검증
            Jws<Claims> claimsJws = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token);

            // 추가 보안 검증
            Claims claims = claimsJws.getPayload();
            validateTokenClaims(claims, tokenId);
            
            return true;
            
        } catch (SecurityException | MalformedJwtException e) {
            log.warn("잘못된 JWT 서명: {}", e.getMessage());
            throw new CustomException.Unauthorized("잘못된 토큰 서명입니다");
        } catch (ExpiredJwtException e) {
            log.warn("만료된 JWT 토큰: {}", e.getMessage());
            throw new CustomException.Unauthorized("만료된 토큰입니다");
        } catch (UnsupportedJwtException e) {
            log.warn("지원되지 않는 JWT 토큰: {}", e.getMessage());
            throw new CustomException.Unauthorized("지원되지 않는 토큰입니다");
        } catch (IllegalArgumentException e) {
            log.warn("JWT 토큰이 잘못되었습니다: {}", e.getMessage());
            throw new CustomException.Unauthorized("잘못된 토큰입니다");
        }
    }

    /**
     * 리프레시 토큰으로 새 액세스 토큰 생성
     */
    public TokenPair refreshAccessToken(String refreshToken) {
        validateToken(refreshToken);
        
        Claims claims = getClaims(refreshToken);
        String tokenType = claims.get("type", String.class);
        if (!TokenType.REFRESH.name().equals(tokenType)) {
            throw new CustomException.BadRequest("리프레시 토큰이 아닙니다");
        }

        String email = claims.getSubject();
        
        // 기존 리프레시 토큰을 Redis 블랙리스트에 추가
        String oldRefreshTokenId = extractTokenId(refreshToken);
        long refreshTokenTtl = (claims.getExpiration().getTime() - System.currentTimeMillis()) / 1000;
        blacklistService.addToBlacklist(oldRefreshTokenId, Math.max(refreshTokenTtl, 0));
        
        // 해당 사용자의 모든 액세스 토큰도 무효화
        invalidateUserAccessTokens(email);
        
        // 새 토큰 쌍 생성 (권한 정보는 DB에서 다시 조회해야 함)
        Collection<? extends GrantedAuthority> authorities = getUserAuthorities(email);
        return createTokenPair(email, authorities);
    }

    /**
     * 토큰 무효화 (로그아웃)
     */
    public void invalidateToken(String token) {
        try {
            String tokenId = extractTokenId(token);
            Claims claims = getClaims(token);
            long tokenTtl = (claims.getExpiration().getTime() - System.currentTimeMillis()) / 1000;
            
            // Redis 블랙리스트에 추가
            blacklistService.addToBlacklist(tokenId, Math.max(tokenTtl, 0));
            
            log.info("토큰 무효화 완료 (Redis): {}", tokenId);
        } catch (Exception e) {
            log.warn("토큰 무효화 실패: {}", e.getMessage());
        }
    }

    /**
     * 사용자의 모든 토큰 무효화 (Redis 기반)
     */
    public void invalidateAllUserTokens(String email) {
        // Redis 서비스의 blacklistAllUserTokens 메서드 사용
        // 기본 TTL로 24시간 (가장 긴 리프레시 토큰 만료 시간) 설정
        long maxTtl = Math.max(accessTokenValidityInMilliseconds, refreshTokenValidityInMilliseconds) / 1000;
        blacklistService.blacklistAllUserTokens(email, maxTtl);
        
        log.info("사용자 {} 의 모든 토큰 무효화 완료 (Redis)", email);
    }

    /**
     * 토큰 메타데이터 조회 (Redis 기반)
     */
    public Optional<TokenMetadata> getTokenMetadata(String token) {
        try {
            String tokenId = extractTokenId(token);
            String metadataStr = blacklistService.getTokenMetadata(tokenId);
            
            if (metadataStr != null) {
                // 간단한 문자열 파싱 (실제로는 JSON 직렬화/역직렬화 사용 권장)
                // 현재는 메타데이터 문자열만 반환하고 상세 파싱은 필요시 구현
                log.debug("토큰 메타데이터 조회됨: {}", tokenId);
            }
            
            return Optional.empty(); // TODO: 메타데이터 역직렬화 구현
        } catch (Exception e) {
            log.warn("토큰 메타데이터 조회 실패: {}", e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * 사용자의 활성 토큰 목록 조회 (Redis 기반)
     * TODO: Redis에서 사용자별 토큰 조회 기능 구현 필요
     */
    public List<TokenMetadata> getUserActiveTokens(String email) {
        // Redis 기반에서는 사용자별 토큰 조회가 복잡하므로
        // 현재는 빈 목록 반환, 필요시 별도 구현
        log.debug("사용자 {} 의 활성 토큰 조회 요청 (Redis 기반에서는 미구현)", email);
        return Collections.emptyList();
    }

    // ===== 내부 헬퍼 메서드들 =====

    /**
     * JWT 토큰 생성 (내부 메서드)
     */
    private String createToken(String email, Collection<? extends GrantedAuthority> authorities, 
                              long validityInMilliseconds, TokenType tokenType) {
        
        Map<String, Object> claims = new HashMap<>();
        claims.put("sub", email);
        claims.put("roles", authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));
        claims.put("type", tokenType.name());
        claims.put("tokenId", UUID.randomUUID().toString());

        Date now = new Date();
        Date validity = new Date(now.getTime() + validityInMilliseconds);

        return Jwts.builder()
                .claims(claims)
                .issuedAt(now)
                .expiration(validity)
                .signWith(secretKey)
                .compact();
    }

    /**
     * 토큰에서 클레임 추출
     */
    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * 토큰 ID 추출
     */
    private String extractTokenId(String token) {
        Claims claims = getClaims(token);
        return claims.get("tokenId", String.class);
    }

    /**
     * 토큰 클레임 추가 검증 (Redis 기반)
     */
    private void validateTokenClaims(Claims claims, String tokenId) {
        // Redis에서 토큰 메타데이터 조회
        String metadataStr = blacklistService.getTokenMetadata(tokenId);
        if (metadataStr != null) {
            // IP 주소 검증 등은 메타데이터 파싱 후 구현 가능
            // 현재는 기본 토큰 타입 검증만 수행
            log.debug("토큰 메타데이터 확인됨: {}", tokenId);
        }

        // 토큰 타입 검증
        String tokenType = claims.get("type", String.class);
        if (tokenType == null) {
            throw new CustomException.Unauthorized("토큰 타입이 누락되었습니다");
        }
    }

    /**
     * 사용자의 액세스 토큰들 무효화 (Redis 기반)
     */
    private void invalidateUserAccessTokens(String email) {
        // Redis 기반에서는 사용자별 액세스 토큰만 선별 무효화가 복잡하므로
        // 모든 사용자 토큰을 무효화하는 방식 사용
        long accessTokenTtl = accessTokenValidityInMilliseconds / 1000;
        blacklistService.blacklistAllUserTokens(email, accessTokenTtl);
        
        log.debug("사용자 {} 의 액세스 토큰들 무효화 완료", email);
    }

    /**
     * 사용자 권한 정보 조회 (실제로는 UserService에서 조회해야 함)
     */
    private Collection<? extends GrantedAuthority> getUserAuthorities(String email) {
        // TODO: 실제 구현에서는 MemberService를 통해 사용자 권한 조회
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
    }

    /**
     * 현재 IP 주소 조회
     */
    private String getCurrentIpAddress() {
        // TODO: HttpServletRequest에서 실제 IP 주소 추출
        return "unknown";
    }

    /**
     * 현재 User-Agent 조회
     */
    private String getCurrentUserAgent() {
        // TODO: HttpServletRequest에서 실제 User-Agent 추출
        return "unknown";
    }

    /**
     * 만료된 토큰 정리 (Redis TTL 기반 자동 정리)
     */
    public void cleanupExpiredTokens() {
        // Redis TTL에 의해 자동으로 만료된 토큰들이 정리되므로
        // 수동 정리는 Redis 서비스에 위임
        blacklistService.cleanupExpiredTokens();
        
        log.debug("Redis 기반 만료 토큰 정리 실행");
    }

    // ===== 내부 클래스들 =====

    /**
     * 토큰 타입 열거형
     */
    public enum TokenType {
        ACCESS, REFRESH
    }

    /**
     * 토큰 쌍 클래스
     */
    @lombok.Builder
    @lombok.Getter
    @lombok.ToString
    public static class TokenPair {
        private final String accessToken;
        private final String refreshToken;
        private final LocalDateTime accessTokenExpiresAt;
        private final LocalDateTime refreshTokenExpiresAt;
    }

    /**
     * 토큰 메타데이터 클래스
     */
    @lombok.Builder
    @lombok.Getter
    @lombok.ToString
    public static class TokenMetadata {
        private final String tokenId;
        private final String email;
        private final TokenType type;
        private final LocalDateTime issuedAt;
        private final LocalDateTime expiresAt;
        private final String ipAddress;
        private final String userAgent;
    }
}