package com.globalcarelink.agents.debug.strategies;

import com.globalcarelink.agents.debug.models.ErrorPattern;
import com.globalcarelink.agents.debug.models.LogAnalysisResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Comparator;
import java.util.List;

/**
 * 에러 패턴 매칭 전략
 */
@Slf4j
@Component
public class ErrorPatternMatcher {
    
    private static final double MINIMUM_MATCH_THRESHOLD = 0.3;
    
    /**
     * 가장 적합한 에러 패턴 찾기
     */
    public ErrorPattern findMatchingPattern(LogAnalysisResult logResult, 
                                          Collection<ErrorPattern> patterns) {
        
        log.debug("에러 패턴 매칭 시작: {}", logResult.getErrorType());
        
        return patterns.stream()
            .filter(ErrorPattern::isActivePattern)
            .map(pattern -> new PatternMatch(pattern, pattern.calculateMatchScore(logResult)))
            .filter(match -> match.score >= MINIMUM_MATCH_THRESHOLD)
            .max(Comparator.comparing(match -> match.score))
            .map(match -> {
                log.info("매칭된 패턴: {} (점수: {:.2f})", 
                        match.pattern.getPatternName(), match.score);
                
                // 패턴 사용 기록 업데이트
                match.pattern.updateConfidence(true);
                
                return match.pattern;
            })
            .orElse(null);
    }
    
    /**
     * 모든 가능한 패턴 매칭 결과 반환
     */
    public List<PatternMatchResult> findAllMatchingPatterns(LogAnalysisResult logResult,
                                                          Collection<ErrorPattern> patterns) {
        
        return patterns.stream()
            .filter(ErrorPattern::isActivePattern)
            .map(pattern -> PatternMatchResult.builder()
                .pattern(pattern)
                .matchScore(pattern.calculateMatchScore(logResult))
                .confidence(pattern.getConfidence())
                .build())
            .filter(result -> result.matchScore >= MINIMUM_MATCH_THRESHOLD)
            .sorted(Comparator.comparing(PatternMatchResult::getMatchScore).reversed())
            .toList();
    }
    
    /**
     * 패턴 매칭 품질 평가
     */
    public MatchQuality evaluateMatchQuality(ErrorPattern pattern, LogAnalysisResult logResult) {
        double score = pattern.calculateMatchScore(logResult);
        
        if (score >= 0.9) return MatchQuality.EXCELLENT;
        if (score >= 0.7) return MatchQuality.GOOD;
        if (score >= 0.5) return MatchQuality.FAIR;
        if (score >= 0.3) return MatchQuality.POOR;
        return MatchQuality.NO_MATCH;
    }
    
    /**
     * 패턴 유사도 계산
     */
    public double calculatePatternSimilarity(ErrorPattern pattern1, ErrorPattern pattern2) {
        double similarity = 0.0;
        int factors = 0;
        
        // 에러 타입 유사도
        if (pattern1.getErrorTypePattern() != null && pattern2.getErrorTypePattern() != null) {
            similarity += pattern1.getErrorTypePattern().equals(pattern2.getErrorTypePattern()) ? 1.0 : 0.0;
            factors++;
        }
        
        // 카테고리 유사도
        if (pattern1.getCategory() != null && pattern2.getCategory() != null) {
            similarity += pattern1.getCategory().equals(pattern2.getCategory()) ? 1.0 : 0.0;
            factors++;
        }
        
        // 스택 트레이스 패턴 유사도
        if (pattern1.getStackTracePattern() != null && pattern2.getStackTracePattern() != null) {
            similarity += calculateStringPatternSimilarity(
                pattern1.getStackTracePattern(), 
                pattern2.getStackTracePattern());
            factors++;
        }
        
        return factors > 0 ? similarity / factors : 0.0;
    }
    
    private double calculateStringPatternSimilarity(String pattern1, String pattern2) {
        // 간단한 문자열 유사도 계산 (Levenshtein distance 기반)
        int distance = levenshteinDistance(pattern1, pattern2);
        int maxLength = Math.max(pattern1.length(), pattern2.length());
        
        return maxLength > 0 ? 1.0 - (double) distance / maxLength : 1.0;
    }
    
    private int levenshteinDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];
        
        for (int i = 0; i <= s1.length(); i++) {
            dp[i][0] = i;
        }
        for (int j = 0; j <= s2.length(); j++) {
            dp[0][j] = j;
        }
        
        for (int i = 1; i <= s1.length(); i++) {
            for (int j = 1; j <= s2.length(); j++) {
                if (s1.charAt(i - 1) == s2.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    dp[i][j] = 1 + Math.min(Math.min(dp[i - 1][j], dp[i][j - 1]), dp[i - 1][j - 1]);
                }
            }
        }
        
        return dp[s1.length()][s2.length()];
    }
    
    // Inner classes
    private static class PatternMatch {
        final ErrorPattern pattern;
        final double score;
        
        PatternMatch(ErrorPattern pattern, double score) {
            this.pattern = pattern;
            this.score = score;
        }
    }
    
    public enum MatchQuality {
        NO_MATCH, POOR, FAIR, GOOD, EXCELLENT
    }
    
    @lombok.Builder
    @lombok.Data
    public static class PatternMatchResult {
        private ErrorPattern pattern;
        private double matchScore;
        private double confidence;
    }
}