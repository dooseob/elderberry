package com.globalcarelink.agents.debug.strategies;

import com.globalcarelink.agents.debug.models.LogAnalysisResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 로그 분석 전략
 */
@Slf4j
@Component
public class LogAnalysisStrategy {
    
    // 일반적인 에러 패턴들
    private static final Map<String, Pattern> ERROR_PATTERNS = Map.of(
        "NullPointerException", Pattern.compile("java\\.lang\\.NullPointerException"),
        "OutOfMemoryError", Pattern.compile("java\\.lang\\.OutOfMemoryError"),
        "SQLException", Pattern.compile("java\\.sql\\.SQLException"),
        "TimeoutException", Pattern.compile(".*TimeoutException"),
        "ConnectionException", Pattern.compile(".*Connection.*Exception"),
        "SecurityException", Pattern.compile(".*Security.*Exception"),
        "ValidationException", Pattern.compile(".*Validation.*Exception")
    );
    
    // 심각도 키워드
    private static final Map<String, Double> SEVERITY_KEYWORDS = Map.of(
        "FATAL", 1.0,
        "ERROR", 0.8,
        "CRITICAL", 0.9,
        "WARN", 0.5,
        "WARNING", 0.5,
        "INFO", 0.2,
        "DEBUG", 0.1
    );
    
    /**
     * 로그 분석 수행
     */
    public LogAnalysisResult analyzeLog(String logLevel, String message, 
                                       String stackTrace, LocalDateTime timestamp) {
        
        log.debug("로그 분석 시작: {} - {}", logLevel, message);
        
        // 1. 기본 정보 추출
        String errorType = extractErrorType(message, stackTrace);
        String problemDescription = generateProblemDescription(errorType, message);
        String rootCause = analyzeRootCause(stackTrace, message);
        
        // 2. 스택 트레이스 분석
        StackTraceAnalysis stackAnalysis = analyzeStackTrace(stackTrace);
        
        // 3. 심각도 계산
        double severity = calculateSeverity(logLevel, message, errorType);
        
        // 4. 컨텍스트 정보 추출
        Map<String, String> contextData = extractContextData(message, stackTrace);
        
        // 5. 영향도 분석
        ImpactAnalysis impactAnalysis = analyzeImpact(errorType, stackAnalysis);
        
        return LogAnalysisResult.builder()
            .analysisId(UUID.randomUUID().toString())
            .logLevel(logLevel)
            .originalMessage(message)
            .stackTrace(stackTrace)
            .timestamp(timestamp)
            .errorType(errorType)
            .problemDescription(problemDescription)
            .rootCause(rootCause)
            .stackTracePattern(stackAnalysis.pattern)
            .severity(severity)
            .threadName(stackAnalysis.threadName)
            .className(stackAnalysis.className)
            .methodName(stackAnalysis.methodName)
            .lineNumber(stackAnalysis.lineNumber)
            .contextData(contextData)
            .impactScope(impactAnalysis.scope)
            .affectedComponents(impactAnalysis.components)
            .isRecurring(false) // 초기값
            .occurrenceCount(1)
            .analyzedAt(LocalDateTime.now())
            .analyzerVersion("1.0")
            .analysisConfidence(calculateAnalysisConfidence(errorType, stackAnalysis))
            .build();
    }
    
    /**
     * 에러 타입 추출
     */
    private String extractErrorType(String message, String stackTrace) {
        // 스택 트레이스에서 예외 타입 추출
        if (stackTrace != null && !stackTrace.isEmpty()) {
            for (Map.Entry<String, Pattern> entry : ERROR_PATTERNS.entrySet()) {
                if (entry.getValue().matcher(stackTrace).find()) {
                    return entry.getKey();
                }
            }
            
            // 첫 번째 줄에서 예외 클래스명 추출
            String[] lines = stackTrace.split("\n");
            if (lines.length > 0) {
                String firstLine = lines[0].trim();
                if (firstLine.contains(":")) {
                    return firstLine.substring(0, firstLine.indexOf(":")).trim();
                }
            }
        }
        
        // 메시지에서 에러 타입 추론
        if (message != null) {
            if (message.toLowerCase().contains("timeout")) return "TimeoutException";
            if (message.toLowerCase().contains("connection")) return "ConnectionException";
            if (message.toLowerCase().contains("permission")) return "SecurityException";
            if (message.toLowerCase().contains("validation")) return "ValidationException";
        }
        
        return "UnknownError";
    }
    
    /**
     * 문제 설명 생성
     */
    private String generateProblemDescription(String errorType, String message) {
        StringBuilder description = new StringBuilder();
        
        switch (errorType) {
            case "NullPointerException":
                description.append("Null 참조로 인한 런타임 에러가 발생했습니다.");
                break;
            case "OutOfMemoryError":
                description.append("메모리 부족으로 인한 시스템 에러가 발생했습니다.");
                break;
            case "SQLException":
                description.append("데이터베이스 연결 또는 쿼리 실행 중 에러가 발생했습니다.");
                break;
            case "TimeoutException":
                description.append("요청 처리 시간이 임계값을 초과했습니다.");
                break;
            default:
                description.append("시스템 에러가 발생했습니다: ").append(errorType);
        }
        
        if (message != null && !message.isEmpty()) {
            description.append(" 상세: ").append(message);
        }
        
        return description.toString();
    }
    
    /**
     * 근본 원인 분석
     */
    private String analyzeRootCause(String stackTrace, String message) {
        if (stackTrace == null || stackTrace.isEmpty()) {
            return "스택 트레이스가 없어 근본 원인을 분석할 수 없습니다.";
        }
        
        // 스택 트레이스에서 가장 깊은 애플리케이션 코드 찾기
        String[] lines = stackTrace.split("\n");
        for (String line : lines) {
            if (line.contains("com.globalcarelink")) {
                return "애플리케이션 코드에서 발생: " + line.trim();
            }
        }
        
        // 외부 라이브러리에서 발생한 경우
        if (lines.length > 0) {
            return "외부 라이브러리에서 발생: " + lines[0].trim();
        }
        
        return "근본 원인을 특정할 수 없습니다.";
    }
    
    /**
     * 스택 트레이스 분석
     */
    private StackTraceAnalysis analyzeStackTrace(String stackTrace) {
        StackTraceAnalysis analysis = new StackTraceAnalysis();
        
        if (stackTrace == null || stackTrace.isEmpty()) {
            return analysis;
        }
        
        String[] lines = stackTrace.split("\n");
        
        // 첫 번째 애플리케이션 코드 라인 찾기
        for (String line : lines) {
            if (line.contains("com.globalcarelink")) {
                // 클래스명과 메서드명 추출
                Pattern pattern = Pattern.compile("at\\s+([\\w\\.]+)\\.([\\w]+)\\([\\w\\.]+:(\\d+)\\)");
                Matcher matcher = pattern.matcher(line);
                
                if (matcher.find()) {
                    analysis.className = matcher.group(1);
                    analysis.methodName = matcher.group(2);
                    analysis.lineNumber = Integer.parseInt(matcher.group(3));
                }
                break;
            }
        }
        
        // 스택 트레이스 패턴 생성 (간단화)
        analysis.pattern = stackTrace.length() > 200 ? 
            stackTrace.substring(0, 200) + "..." : stackTrace;
        
        // 스레드 정보 추출
        if (lines.length > 0 && lines[0].contains("Exception in thread")) {
            Pattern threadPattern = Pattern.compile("Exception in thread \"([^\"]+)\"");
            Matcher threadMatcher = threadPattern.matcher(lines[0]);
            if (threadMatcher.find()) {
                analysis.threadName = threadMatcher.group(1);
            }
        }
        
        return analysis;
    }
    
    /**
     * 심각도 계산
     */
    private double calculateSeverity(String logLevel, String message, String errorType) {
        double baseSeverity = SEVERITY_KEYWORDS.getOrDefault(logLevel.toUpperCase(), 0.5);
        
        // 에러 타입별 가중치
        double errorWeight = switch (errorType) {
            case "OutOfMemoryError", "SecurityException" -> 0.4;
            case "SQLException", "TimeoutException" -> 0.3;
            case "NullPointerException" -> 0.2;
            default -> 0.1;
        };
        
        // 메시지 키워드 분석
        double messageWeight = 0.0;
        if (message != null) {
            String lowerMessage = message.toLowerCase();
            if (lowerMessage.contains("critical") || lowerMessage.contains("fatal")) {
                messageWeight = 0.2;
            } else if (lowerMessage.contains("failed") || lowerMessage.contains("error")) {
                messageWeight = 0.1;
            }
        }
        
        return Math.min(1.0, baseSeverity + errorWeight + messageWeight);
    }
    
    /**
     * 컨텍스트 데이터 추출
     */
    private Map<String, String> extractContextData(String message, String stackTrace) {
        Map<String, String> context = new HashMap<>();
        
        // 메시지에서 키-값 쌍 추출
        if (message != null) {
            Pattern kvPattern = Pattern.compile("(\\w+)=([^\\s,]+)");
            Matcher matcher = kvPattern.matcher(message);
            while (matcher.find()) {
                context.put(matcher.group(1), matcher.group(2));
            }
        }
        
        context.put("analyzed_at", LocalDateTime.now().toString());
        
        return context;
    }
    
    /**
     * 영향도 분석
     */
    private ImpactAnalysis analyzeImpact(String errorType, StackTraceAnalysis stackAnalysis) {
        ImpactAnalysis impact = new ImpactAnalysis();
        
        // 에러 타입별 영향 범위 결정
        impact.scope = switch (errorType) {
            case "OutOfMemoryError" -> "system";
            case "SQLException" -> "module";
            case "SecurityException" -> "system";
            case "TimeoutException" -> "module";
            default -> "method";
        };
        
        // 영향받는 컴포넌트 식별
        impact.components = new ArrayList<>();
        if (stackAnalysis.className != null) {
            if (stackAnalysis.className.contains("Controller")) {
                impact.components.add("API_LAYER");
            } else if (stackAnalysis.className.contains("Service")) {
                impact.components.add("BUSINESS_LOGIC");
            } else if (stackAnalysis.className.contains("Repository")) {
                impact.components.add("DATA_ACCESS");
            }
        }
        
        return impact;
    }
    
    /**
     * 분석 신뢰도 계산
     */
    private double calculateAnalysisConfidence(String errorType, StackTraceAnalysis stackAnalysis) {
        double confidence = 0.5; // 기본 신뢰도
        
        // 에러 타입이 명확한 경우
        if (!"UnknownError".equals(errorType)) {
            confidence += 0.2;
        }
        
        // 스택 트레이스가 있는 경우
        if (stackAnalysis.className != null) {
            confidence += 0.2;
        }
        
        // 애플리케이션 코드에서 발생한 경우
        if (stackAnalysis.className != null && stackAnalysis.className.contains("com.globalcarelink")) {
            confidence += 0.1;
        }
        
        return Math.min(1.0, confidence);
    }
    
    // Inner classes
    private static class StackTraceAnalysis {
        String pattern = "";
        String className;
        String methodName;
        String threadName;
        int lineNumber = -1;
    }
    
    private static class ImpactAnalysis {
        String scope = "method";
        List<String> components = new ArrayList<>();
    }
}