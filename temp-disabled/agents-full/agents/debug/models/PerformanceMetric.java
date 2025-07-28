package com.globalcarelink.agents.debug.models;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 성능 메트릭 모델
 */
@Data
public class PerformanceMetric {
    private String metricName;
    private List<Measurement> measurements;
    private double baselineValue;
    private double currentValue;
    private double threshold;
    private String unit;
    
    // 통계
    private double averageValue;
    private double minValue;
    private double maxValue;
    private double standardDeviation;
    
    // 트렌드 분석
    private TrendDirection trendDirection;
    private double trendSlope;
    private LocalDateTime lastAnalyzed;
    
    public PerformanceMetric(String metricName) {
        this.metricName = metricName;
        this.measurements = new ArrayList<>();
        this.minValue = Double.MAX_VALUE;
        this.maxValue = Double.MIN_VALUE;
    }
    
    /**
     * 새로운 측정값 추가
     */
    public void addMeasurement(double value, LocalDateTime timestamp) {
        measurements.add(new Measurement(value, timestamp));
        currentValue = value;
        
        // 통계 업데이트
        updateStatistics();
        
        // 트렌드 분석
        analyzeTrend();
    }
    
    /**
     * 성능 저하 감지
     */
    public boolean isPerformanceDegrading() {
        return trendDirection == TrendDirection.DEGRADING &&
               currentValue > threshold * 1.2; // 임계값의 120% 초과
    }
    
    /**
     * 성능 이슈 설명 생성
     */
    public String getPerformanceIssue() {
        if (!isPerformanceDegrading()) {
            return "정상 범위";
        }
        
        double degradationPercentage = ((currentValue - baselineValue) / baselineValue) * 100;
        return String.format("%s가 기준값 대비 %.1f%% 증가하여 성능 저하 발생", 
                           metricName, degradationPercentage);
    }
    
    /**
     * 개선율 계산
     */
    public double calculateImprovement() {
        if (measurements.size() < 2) return 0.0;
        
        double oldValue = measurements.get(Math.max(0, measurements.size() - 10)).getValue();
        return ((oldValue - currentValue) / oldValue) * 100;
    }
    
    private void updateStatistics() {
        if (measurements.isEmpty()) return;
        
        double sum = measurements.stream().mapToDouble(Measurement::getValue).sum();
        averageValue = sum / measurements.size();
        
        minValue = measurements.stream().mapToDouble(Measurement::getValue).min().orElse(0.0);
        maxValue = measurements.stream().mapToDouble(Measurement::getValue).max().orElse(0.0);
        
        // 표준편차 계산
        double variance = measurements.stream()
            .mapToDouble(m -> Math.pow(m.getValue() - averageValue, 2))
            .average()
            .orElse(0.0);
        standardDeviation = Math.sqrt(variance);
    }
    
    private void analyzeTrend() {
        if (measurements.size() < 5) return; // 최소 5개 측정값 필요
        
        // 최근 5개 측정값으로 트렌드 분석
        List<Measurement> recent = measurements.subList(
            Math.max(0, measurements.size() - 5), measurements.size());
        
        double firstValue = recent.get(0).getValue();
        double lastValue = recent.get(recent.size() - 1).getValue();
        double change = ((lastValue - firstValue) / firstValue) * 100;
        
        if (change > 10) {
            trendDirection = TrendDirection.DEGRADING;
        } else if (change < -10) {
            trendDirection = TrendDirection.IMPROVING;
        } else {
            trendDirection = TrendDirection.STABLE;
        }
        
        trendSlope = change;
        lastAnalyzed = LocalDateTime.now();
    }
    
    public enum TrendDirection {
        IMPROVING, STABLE, DEGRADING
    }
    
    @Data
    public static class Measurement {
        private double value;
        private LocalDateTime timestamp;
        
        public Measurement(double value, LocalDateTime timestamp) {
            this.value = value;
            this.timestamp = timestamp;
        }
    }
}