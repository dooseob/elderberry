package com.globalcarelink.common.event;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

/**
 * 보안 이슈 발생 시 생성되는 구조화된 이벤트
 * 인증 실패, 권한 부족, 의심스러운 접근 등을 추적
 */
@Slf4j
@Data
@EqualsAndHashCode(callSuper = true)
@JsonIgnoreProperties(ignoreUnknown = true)
public class SecurityEvent extends SystemEvent {
    
    private final String securityEventType; // AUTH_FAILURE, ACCESS_DENIED, SUSPICIOUS_ACTIVITY, INJECTION_ATTEMPT
    private final String userEmail;
    private final String clientIp;
    private final String userAgent;
    private final String requestUri;
    private final String httpMethod;
    private final String failureReason;
    private final String attemptedResource;
    private final String requiredRole;
    private final String actualRole;
    private final Integer consecutiveFailures;
    private final String geolocation;
    private final Boolean isKnownDevice;
    private final String sessionId;
    private final Map<String, Object> securityMetrics;
    
    @Builder
    public SecurityEvent(Object source, String eventId, String traceId,
                        String securityEventType, String userEmail, String clientIp,
                        String userAgent, String requestUri, String httpMethod,
                        String failureReason, String attemptedResource, String requiredRole,
                        String actualRole, Integer consecutiveFailures, String geolocation,
                        Boolean isKnownDevice, String sessionId, Map<String, Object> securityMetrics,
                        Map<String, Object> additionalMetadata) {
        
        super(source, eventId, traceId, "SECURITY_EVENT", 
              buildMetadata(additionalMetadata, securityEventType, userEmail));
        
        this.securityEventType = securityEventType;
        this.userEmail = userEmail;
        this.clientIp = clientIp;
        this.userAgent = sanitizeUserAgent(userAgent);
        this.requestUri = requestUri;
        this.httpMethod = httpMethod;
        this.failureReason = failureReason;
        this.attemptedResource = attemptedResource;
        this.requiredRole = requiredRole;
        this.actualRole = actualRole;
        this.consecutiveFailures = consecutiveFailures;
        this.geolocation = geolocation;
        this.isKnownDevice = isKnownDevice;
        this.sessionId = sessionId;
        this.securityMetrics = securityMetrics != null ? securityMetrics : new HashMap<>();
    }
    
    @Override
    public String getSeverity() {
        return switch (securityEventType) {
            case "INJECTION_ATTEMPT", "SUSPICIOUS_ACTIVITY" -> "CRITICAL";
            case "AUTH_FAILURE" -> {
                if (consecutiveFailures != null && consecutiveFailures >= 5) {
                    yield "CRITICAL";
                } else if (consecutiveFailures != null && consecutiveFailures >= 3) {
                    yield "HIGH";
                } else {
                    yield "MEDIUM";
                }
            }
            case "ACCESS_DENIED" -> "HIGH";
            default -> "MEDIUM";
        };
    }
    
    @Override
    public String toJsonString() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.writeValueAsString(this);
        } catch (JsonProcessingException e) {
            log.error("SecurityEvent JSON 직렬화 실패", e);
            return String.format("{\"eventId\":\"%s\",\"error\":\"JSON 직렬화 실패\"}", getEventId());
        }
    }
    
    /**
     * 보안 분석용 마크다운 형식 생성
     */
    public String toMarkdownFormat() {
        StringBuilder md = new StringBuilder();
        md.append("\n## 🔒 보안 이벤트 #").append(getEventId()).append("\n\n");
        md.append("**발생 시간**: ").append(getTimestamp()).append("\n");
        md.append("**추적 ID**: `").append(getTraceId()).append("`\n");
        md.append("**심각도**: ").append(getSeverity()).append(" (").append(securityEventType).append(")\n\n");
        
        md.append("### 보안 정보\n");
        md.append("- **이벤트 유형**: ").append(securityEventType).append("\n");
        md.append("- **사용자**: ").append(userEmail != null ? userEmail : "익명").append("\n");
        md.append("- **클라이언트 IP**: ").append(clientIp).append("\n");
        
        if (geolocation != null) {
            md.append("- **위치**: ").append(geolocation).append("\n");
        }
        
        if (isKnownDevice != null) {
            md.append("- **알려진 기기**: ").append(isKnownDevice ? "예" : "아니오").append("\n");
        }
        
        if (consecutiveFailures != null && consecutiveFailures > 1) {
            md.append("- **연속 실패 횟수**: ").append(consecutiveFailures).append("회\n");
        }
        
        md.append("\n");
        
        if (requestUri != null) {
            md.append("### 요청 정보\n");
            md.append("- **URL**: `").append(httpMethod).append(" ").append(requestUri).append("`\n");
            
            if (attemptedResource != null) {
                md.append("- **접근 시도 리소스**: ").append(attemptedResource).append("\n");
            }
            
            if (requiredRole != null) {
                md.append("- **필요 권한**: ").append(requiredRole).append("\n");
                md.append("- **현재 권한**: ").append(actualRole != null ? actualRole : "없음").append("\n");
            }
            
            md.append("\n");
        }
        
        if (failureReason != null) {
            md.append("### 실패 원인\n");
            md.append("- **상세 사유**: ").append(failureReason).append("\n\n");
        }
        
        if (userAgent != null) {
            md.append("### 기술 정보\n");
            md.append("- **User Agent**: ").append(userAgent).append("\n");
            if (sessionId != null) {
                md.append("- **세션 ID**: `").append(sessionId).append("`\n");
            }
            md.append("\n");
        }
        
        if (!securityMetrics.isEmpty()) {
            md.append("### 보안 메트릭\n");
            securityMetrics.forEach((key, value) -> 
                md.append("- **").append(key).append("**: ").append(value).append("\n")
            );
            md.append("\n");
        }
        
        md.append("### 보안 대응 방안\n");
        md.append("<!-- 개발자가 작성: 보안 강화 및 대응 방법을 기록하세요 -->\n");
        md.append("- **즉시 조치**: \n");
        md.append("- **보안 강화**: \n");
        md.append("- **모니터링**: \n\n");
        
        md.append(generateSecurityRecommendations());
        md.append("---\n");
        
        return md.toString();
    }
    
    /**
     * AI 학습용 보안 데이터 추출
     */
    public Map<String, Object> toAILearningData() {
        Map<String, Object> data = new HashMap<>();
        data.put("eventId", getEventId());
        data.put("securityEventType", securityEventType);
        data.put("severity", getSeverity());
        data.put("userEmail", userEmail);
        data.put("clientIp", maskIpAddress(clientIp));
        data.put("requestUri", requestUri);
        data.put("consecutiveFailures", consecutiveFailures);
        data.put("isKnownDevice", isKnownDevice);
        data.put("timestamp", getTimestamp());
        
        // 보안 패턴 분석을 위한 특성 추출
        data.put("securityFeatures", extractSecurityFeatures());
        
        return data;
    }
    
    /**
     * 위험도 점수 계산 (0-100)
     */
    public int calculateRiskScore() {
        int score = 0;
        
        // 기본 이벤트 유형별 점수
        score += switch (securityEventType) {
            case "INJECTION_ATTEMPT" -> 80;
            case "SUSPICIOUS_ACTIVITY" -> 70;
            case "AUTH_FAILURE" -> 30;
            case "ACCESS_DENIED" -> 40;
            default -> 20;
        };
        
        // 연속 실패 가중치
        if (consecutiveFailures != null) {
            score += Math.min(consecutiveFailures * 10, 30);
        }
        
        // 알려지지 않은 기기 가중치
        if (isKnownDevice != null && !isKnownDevice) {
            score += 15;
        }
        
        // 익명 사용자 가중치
        if (userEmail == null || "anonymousUser".equals(userEmail)) {
            score += 10;
        }
        
        return Math.min(score, 100);
    }
    
    private static Map<String, Object> buildMetadata(Map<String, Object> additional, 
                                                   String securityEventType, String userEmail) {
        Map<String, Object> metadata = new HashMap<>();
        if (additional != null) {
            metadata.putAll(additional);
        }
        metadata.put("securityEventType", securityEventType);
        metadata.put("hasUserInfo", userEmail != null);
        metadata.put("isSecurityCritical", true);
        return metadata;
    }
    
    private String sanitizeUserAgent(String userAgent) {
        if (userAgent == null) return null;
        
        // User Agent 길이 제한 및 민감한 정보 제거
        if (userAgent.length() > 200) {
            userAgent = userAgent.substring(0, 200) + "...";
        }
        
        return userAgent;
    }
    
    private String maskIpAddress(String ip) {
        if (ip == null) return null;
        
        // IP 주소 마스킹 (마지막 옥텟만 마스킹)
        String[] parts = ip.split("\\.");
        if (parts.length == 4) {
            return parts[0] + "." + parts[1] + "." + parts[2] + ".***";
        }
        
        return ip;
    }
    
    private Map<String, Object> extractSecurityFeatures() {
        Map<String, Object> features = new HashMap<>();
        
        features.put("isHighRisk", calculateRiskScore() >= 70);
        features.put("hasMultipleFailures", consecutiveFailures != null && consecutiveFailures > 1);
        features.put("isAnonymousUser", userEmail == null || "anonymousUser".equals(userEmail));
        features.put("isUnknownDevice", isKnownDevice != null && !isKnownDevice);
        features.put("securityEventCategory", securityEventType);
        features.put("severityLevel", getSeverity());
        features.put("riskScore", calculateRiskScore());
        
        return features;
    }
    
    private String generateSecurityRecommendations() {
        StringBuilder recommendations = new StringBuilder();
        recommendations.append("### 🛡️ 자동 보안 권장사항\n");
        
        int riskScore = calculateRiskScore();
        
        if (riskScore >= 70) {
            recommendations.append("#### 🚨 높은 위험도 (").append(riskScore).append("점)\n");
            recommendations.append("- **즉시 조치 필요**: IP 차단 또는 계정 임시 잠금 검토\n");
            recommendations.append("- **관리자 알림**: 보안팀에 즉시 보고\n");
        } else if (riskScore >= 40) {
            recommendations.append("#### ⚠️ 중간 위험도 (").append(riskScore).append("점)\n");
            recommendations.append("- **모니터링 강화**: 해당 IP/사용자 추적 강화\n");
        } else {
            recommendations.append("#### ℹ️ 낮은 위험도 (").append(riskScore).append("점)\n");
            recommendations.append("- **일반 모니터링**: 정기적인 로그 검토\n");
        }
        
        // 이벤트 유형별 권장사항
        switch (securityEventType) {
            case "AUTH_FAILURE":
                recommendations.append("- **인증 강화**: 2FA 활성화 권장\n");
                recommendations.append("- **계정 보안**: 비밀번호 변경 안내\n");
                break;
            case "ACCESS_DENIED":
                recommendations.append("- **권한 검토**: 사용자 권한 설정 재확인\n");
                recommendations.append("- **접근 로그**: 비정상 접근 패턴 분석\n");
                break;
            case "INJECTION_ATTEMPT":
                recommendations.append("- **입력 검증**: 파라미터 검증 로직 강화\n");
                recommendations.append("- **WAF 설정**: 웹 방화벽 규칙 업데이트\n");
                break;
        }
        
        recommendations.append("\n");
        return recommendations.toString();
    }
}