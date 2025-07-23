package com.globalcarelink.health;

import com.globalcarelink.health.dto.HealthAssessmentStatistics;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * 건강 평가 통계 전담 서비스
 * 복잡한 통계 생성 로직 담당 (SRP 원칙 적용)
 * 비동기 처리로 성능 최적화
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class HealthAssessmentStatsService {

    private final HealthAssessmentRepository healthAssessmentRepository;

    /**
     * 종합 건강 평가 통계 조회
     * 캐시 적용으로 성능 최적화
     */
    @Cacheable(value = "matching-statistics", key = "'health_statistics'")
    public HealthAssessmentStatistics getComprehensiveStatistics() {
        log.info("건강 평가 통계 생성 시작");
        
        // 기본 카운트 정보
        long totalCount = healthAssessmentRepository.count();
        long completeCount = healthAssessmentRepository.findCompleteAssessments().size();
        Long recentCount = healthAssessmentRepository.countRecentAssessments(
            LocalDateTime.now().minusDays(30)
        );
        
        // 케어 등급별 통계
        List<Map<String, Object>> gradeStats = healthAssessmentRepository.findCareGradeStatistics();
        
        // ADL 점수 구간별 통계
        List<Map<String, Object>> adlStats = healthAssessmentRepository.findAdlScoreDistribution();
        
        // 연령대별 케어 등급 분포
        List<Map<String, Object>> ageStats = healthAssessmentRepository.findAgeGroupCareGradeDistribution();
        
        // 성별 케어 패턴
        List<Map<String, Object>> genderStats = healthAssessmentRepository.findGenderCarePatternAnalysis();
        
        // 특수 케어 대상자 통계
        long hospiceCareTargets = healthAssessmentRepository.findHospiceCareTargets().size();
        long dementiaCareTargets = healthAssessmentRepository.findDementiaCareTargets().size();
        long severeCareTargets = healthAssessmentRepository.findSevereCareTargets().size();
        long overseasKoreanAssessments = healthAssessmentRepository.findOverseasKoreanAssessments().size();

        HealthAssessmentStatistics statistics = HealthAssessmentStatistics.builder()
                .totalAssessments(totalCount)
                .completeAssessments(completeCount)
                .recentAssessments(recentCount)
                .careGradeDistribution(gradeStats)
                .adlScoreDistribution(adlStats)
                .ageGroupDistribution(ageStats)
                .genderPatternAnalysis(genderStats)
                .hospiceCareTargets(hospiceCareTargets)
                .dementiaCareTargets(dementiaCareTargets)
                .severeCareTargets(severeCareTargets)
                .overseasKoreanAssessments(overseasKoreanAssessments)
                .build();

        log.info("건강 평가 통계 생성 완료 - 전체: {}, 완료: {}, 최근: {}", 
                totalCount, completeCount, recentCount);
        
        return statistics;
    }

    /**
     * 비동기 케어 등급별 통계 생성
     */
    @Async("statisticsTaskExecutor")
    public CompletableFuture<List<Map<String, Object>>> getCareGradeStatisticsAsync() {
        log.debug("비동기 케어 등급별 통계 생성");
        try {
            List<Map<String, Object>> stats = healthAssessmentRepository.findCareGradeStatistics();
            return CompletableFuture.completedFuture(stats);
        } catch (Exception e) {
            log.error("케어 등급별 통계 생성 실패", e);
            return CompletableFuture.failedFuture(e);
        }
    }

    /**
     * 비동기 ADL 점수 분포 통계 생성
     */
    @Async("statisticsTaskExecutor")
    public CompletableFuture<List<Map<String, Object>>> getAdlScoreDistributionAsync() {
        log.debug("비동기 ADL 점수 분포 통계 생성");
        try {
            List<Map<String, Object>> stats = healthAssessmentRepository.findAdlScoreDistribution();
            return CompletableFuture.completedFuture(stats);
        } catch (Exception e) {
            log.error("ADL 점수 분포 통계 생성 실패", e);
            return CompletableFuture.failedFuture(e);
        }
    }

    /**
     * 비동기 연령대별 통계 생성
     */
    @Async("statisticsTaskExecutor")
    public CompletableFuture<List<Map<String, Object>>> getAgeGroupDistributionAsync() {
        log.debug("비동기 연령대별 통계 생성");
        try {
            List<Map<String, Object>> stats = healthAssessmentRepository.findAgeGroupCareGradeDistribution();
            return CompletableFuture.completedFuture(stats);
        } catch (Exception e) {
            log.error("연령대별 통계 생성 실패", e);
            return CompletableFuture.failedFuture(e);
        }
    }

    /**
     * 비동기 성별 패턴 분석
     */
    @Async("statisticsTaskExecutor")
    public CompletableFuture<List<Map<String, Object>>> getGenderPatternAnalysisAsync() {
        log.debug("비동기 성별 패턴 분석");
        try {
            List<Map<String, Object>> stats = healthAssessmentRepository.findGenderCarePatternAnalysis();
            return CompletableFuture.completedFuture(stats);
        } catch (Exception e) {
            log.error("성별 패턴 분석 실패", e);
            return CompletableFuture.failedFuture(e);
        }
    }

    /**
     * 특수 케어 대상자 통계 (호스피스, 치매, 중증)
     */
    @Cacheable(value = "matching-statistics", key = "'special_care_stats'")
    public Map<String, Long> getSpecialCareTargetStatistics() {
        log.debug("특수 케어 대상자 통계 생성");
        
        long hospiceTargets = healthAssessmentRepository.findHospiceCareTargets().size();
        long dementiaTargets = healthAssessmentRepository.findDementiaCareTargets().size();
        long severeTargets = healthAssessmentRepository.findSevereCareTargets().size();
        long overseasTargets = healthAssessmentRepository.findOverseasKoreanAssessments().size();
        
        return Map.of(
            "hospiceCareTargets", hospiceTargets,
            "dementiaCareTargets", dementiaTargets,
            "severeCareTargets", severeTargets,
            "overseasKoreanAssessments", overseasTargets
        );
    }

    /**
     * 최근 기간별 통계 (일별, 주별, 월별)
     */
    public Map<String, Long> getRecentAssessmentStatistics() {
        log.debug("최근 기간별 통계 생성");
        
        LocalDateTime now = LocalDateTime.now();
        
        Long dailyCount = healthAssessmentRepository.countRecentAssessments(now.minusDays(1));
        Long weeklyCount = healthAssessmentRepository.countRecentAssessments(now.minusDays(7));
        Long monthlyCount = healthAssessmentRepository.countRecentAssessments(now.minusDays(30));
        
        return Map.of(
            "dailyAssessments", dailyCount,
            "weeklyAssessments", weeklyCount,
            "monthlyAssessments", monthlyCount
        );
    }

    /**
     * 평가 완성도 통계
     */
    public Map<String, Object> getCompletionStatistics() {
        log.debug("평가 완성도 통계 생성");
        
        long totalCount = healthAssessmentRepository.count();
        long completeCount = healthAssessmentRepository.findCompleteAssessments().size();
        
        double completionRate = totalCount > 0 ? (double) completeCount / totalCount * 100 : 0.0;
        
        return Map.of(
            "totalAssessments", totalCount,
            "completeAssessments", completeCount,
            "incompleteAssessments", totalCount - completeCount,
            "completionRate", Math.round(completionRate * 100.0) / 100.0
        );
    }

    /**
     * 질환별 통계 분석
     */
    public Map<String, Long> getDiseaseTypeStatistics() {
        log.debug("질환별 통계 분석");
        
        // 주요 질환 키워드별 카운트
        String[] diseaseKeywords = {"고혈압", "당뇨", "치매", "뇌졸중", "암", "심장병", "관절염"};
        
        Map<String, Long> diseaseStats = new java.util.HashMap<>();
        
        for (String disease : diseaseKeywords) {
            long count = healthAssessmentRepository.findByDiseaseTypesContaining(disease).size();
            diseaseStats.put(disease, count);
        }
        
        return diseaseStats;
    }

    /**
     * 비동기 종합 통계 리포트 생성
     * 모든 통계를 병렬로 생성하여 성능 최적화
     */
    @Async("statisticsTaskExecutor")
    public CompletableFuture<Map<String, Object>> generateComprehensiveReportAsync() {
        log.info("비동기 종합 통계 리포트 생성 시작");
        
        try {
            // 병렬로 여러 통계 생성
            CompletableFuture<List<Map<String, Object>>> careGradeFuture = getCareGradeStatisticsAsync();
            CompletableFuture<List<Map<String, Object>>> adlScoreFuture = getAdlScoreDistributionAsync();
            CompletableFuture<List<Map<String, Object>>> ageGroupFuture = getAgeGroupDistributionAsync();
            CompletableFuture<List<Map<String, Object>>> genderPatternFuture = getGenderPatternAnalysisAsync();
            
            // 모든 비동기 작업 완료 대기
            CompletableFuture<Void> allFutures = CompletableFuture.allOf(
                careGradeFuture, adlScoreFuture, ageGroupFuture, genderPatternFuture
            );
            
            return allFutures.thenApply(v -> {
                Map<String, Object> report = new java.util.HashMap<>();
                
                try {
                    report.put("careGradeDistribution", careGradeFuture.get());
                    report.put("adlScoreDistribution", adlScoreFuture.get());
                    report.put("ageGroupDistribution", ageGroupFuture.get());
                    report.put("genderPatternAnalysis", genderPatternFuture.get());
                    report.put("specialCareTargets", getSpecialCareTargetStatistics());
                    report.put("recentStatistics", getRecentAssessmentStatistics());
                    report.put("completionStatistics", getCompletionStatistics());
                    report.put("diseaseStatistics", getDiseaseTypeStatistics());
                    report.put("generatedAt", LocalDateTime.now());
                    
                    log.info("비동기 종합 통계 리포트 생성 완료");
                    return report;
                    
                } catch (Exception e) {
                    log.error("비동기 통계 리포트 조합 실패", e);
                    throw new RuntimeException("통계 리포트 생성 실패", e);
                }
            });
            
        } catch (Exception e) {
            log.error("비동기 종합 통계 리포트 생성 실패", e);
            return CompletableFuture.failedFuture(e);
        }
    }
} 