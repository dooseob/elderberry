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
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * JWT 토큰 제공자 (보안 강화 버전)
 * - 리프레시 토큰 지원
 * - 토큰 블랙리스트 관리
 * - 향상된 보안 검증
 * - 토큰 메타데이터 추적
 */
@Slf4j
@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long accessTokenValidityInMilliseconds;
    private final long refreshTokenValidityInMilliseconds;
    
    // 토큰 블랙리스트 (실제 운영환경에서는 Redis 등 외부 저장소 사용 권장)
    private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();
    
    // 토큰 메타데이터 저장소
    private final Map<String, TokenMetadata> tokenMetadataStore = new ConcurrentHashMap<>();

    public JwtTokenProvider(
            @Value("${jwt.secret:mySecretKey}") String secretKey,
            @Value("${jwt.access-token-validity-in-seconds:1800}") long accessTokenValidityInSeconds,
            @Value("${jwt.refresh-token-validity-in-seconds:604800}") long refreshTokenValidityInSeconds) {
        
        // 보안 강화: 최소 256비트 키 보장
        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            // 키가 너무 짧으면 패딩하여 256비트로 만듦
            keyBytes = Arrays.copyOf(keyBytes, 32);
        }
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
        
        this.accessTokenValidityInMilliseconds = accessTokenValidityInSeconds * 1000;
        this.refreshTokenValidityInMilliseconds = refreshTokenValidityInSeconds * 1000;
        
        log.info("JWT 토큰 제공자 초기화 완료 - Access Token 유효기간: {}초, Refresh Token 유효기간: {}초", 
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
        
        // 토큰 메타데이터 저장
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
        
        tokenMetadataStore.put(accessMetadata.getTokenId(), accessMetadata);
        tokenMetadataStore.put(refreshMetadata.getTokenId(), refreshMetadata);
        
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
            // 블랙리스트 확인
            String tokenId = extractTokenId(token);
            if (blacklistedTokens.contains(tokenId)) {
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
        
        // 기존 토큰들을 블랙리스트에 추가
        String oldRefreshTokenId = extractTokenId(refreshToken);
        blacklistedTokens.add(oldRefreshTokenId);
        
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
            blacklistedTokens.add(tokenId);
            tokenMetadataStore.remove(tokenId);
            
            log.info("토큰 무효화 완료: {}", tokenId);
        } catch (Exception e) {
            log.warn("토큰 무효화 실패: {}", e.getMessage());
        }
    }

    /**
     * 사용자의 모든 토큰 무효화
     */
    public void invalidateAllUserTokens(String email) {
        tokenMetadataStore.values().stream()
                .filter(metadata -> email.equals(metadata.getEmail()))
                .forEach(metadata -> {
                    blacklistedTokens.add(metadata.getTokenId());
                    tokenMetadataStore.remove(metadata.getTokenId());
                });
        
        log.info("사용자 {} 의 모든 토큰 무효화 완료", email);
    }

    /**
     * 토큰 메타데이터 조회
     */
    public Optional<TokenMetadata> getTokenMetadata(String token) {
        try {
            String tokenId = extractTokenId(token);
            return Optional.ofNullable(tokenMetadataStore.get(tokenId));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    /**
     * 사용자의 활성 토큰 목록 조회
     */
    public List<TokenMetadata> getUserActiveTokens(String email) {
        return tokenMetadataStore.values().stream()
                .filter(metadata -> email.equals(metadata.getEmail()))
                .filter(metadata -> !blacklistedTokens.contains(metadata.getTokenId()))
                .filter(metadata -> metadata.getExpiresAt().isAfter(LocalDateTime.now()))
                .collect(Collectors.toList());
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
     * 토큰 클레임 추가 검증
     */
    private void validateTokenClaims(Claims claims, String tokenId) {
        // 토큰 메타데이터와 비교 검증
        TokenMetadata metadata = tokenMetadataStore.get(tokenId);
        if (metadata != null) {
            // IP 주소 검증 (선택적)
            String currentIp = getCurrentIpAddress();
            if (metadata.getIpAddress() != null && !metadata.getIpAddress().equals(currentIp)) {
                log.warn("토큰 IP 주소 불일치 - 토큰: {}, 현재: {}", metadata.getIpAddress(), currentIp);
                // 실제 운영환경에서는 이 검증을 활성화할 수 있음
                // throw new CustomException.Unauthorized("토큰 사용 위치가 일치하지 않습니다");
            }
        }

        // 토큰 타입 검증
        String tokenType = claims.get("type", String.class);
        if (tokenType == null) {
            throw new CustomException.Unauthorized("토큰 타입이 누락되었습니다");
        }
    }

    /**
     * 사용자의 액세스 토큰들 무효화
     */
    private void invalidateUserAccessTokens(String email) {
        tokenMetadataStore.values().stream()
                .filter(metadata -> email.equals(metadata.getEmail()))
                .filter(metadata -> TokenType.ACCESS.equals(metadata.getType()))
                .forEach(metadata -> blacklistedTokens.add(metadata.getTokenId()));
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
     * 만료된 토큰 메타데이터 정리 (스케줄링 메서드)
     */
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        
        List<String> expiredTokenIds = tokenMetadataStore.values().stream()
                .filter(metadata -> metadata.getExpiresAt().isBefore(now))
                .map(TokenMetadata::getTokenId)
                .collect(Collectors.toList());
        
        expiredTokenIds.forEach(tokenId -> {
            tokenMetadataStore.remove(tokenId);
            blacklistedTokens.remove(tokenId);
        });
        
        if (!expiredTokenIds.isEmpty()) {
            log.info("만료된 토큰 {} 개 정리 완료", expiredTokenIds.size());
        }
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