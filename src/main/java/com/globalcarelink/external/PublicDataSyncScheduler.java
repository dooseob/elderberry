package com.globalcarelink.external;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.task.AsyncTaskExecutor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

/**
 * 공공데이터 정기 업데이트 스케줄러
 * 시설 정보 자동 동기화, API 상태 모니터링, 통계 업데이트 등을 담당
 * Context7 모범사례 적용 - 병렬 처리 최적화로 성능 향상
 */
@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "app.scheduler.enabled", havingValue = "true", matchIfMissing = true)
public class PublicDataSyncScheduler {

    private final FacilitySyncService facilitySyncService;
    private final PublicDataApiClient publicDataApiClient;
    
    // 전용 Executor들 주입
    @Qualifier("schedulerTaskExecutor")
    private final AsyncTaskExecutor schedulerExecutor;
    
    @Qualifier("apiTaskExecutor")
    private final AsyncTaskExecutor apiExecutor;
    
    @Qualifier("dbTaskExecutor") 
    private final AsyncTaskExecutor dbExecutor;

    /**
     * 전국 시설 정보 동기화 (병렬 처리 최적화)
     * 매일 새벽 2시에 실행
     */
    @Scheduled(cron = "${app.scheduler.facility-sync-cron:0 0 2 * * ?}")
    public void syncAllFacilities() {
        log.info("=== 전국 시설 정보 동기화 시작 (병렬 처리) ===");
        LocalDateTime startTime = LocalDateTime.now();
        
        try {
            // 전체 지역 시설 동기화 실행 (기존 방식 사용)
            CompletableFuture<List<FacilitySyncService.SyncResult>> future = 
                    facilitySyncService.syncAllRegions();
            
            // 병렬 작업: API 상태 체크
            CompletableFuture<Boolean> healthCheckFuture = CompletableFuture.supplyAsync(() -> {
                try {
                    Boolean isHealthy = publicDataApiClient.checkApiHealth().block();
                    log.info("동기화 중 API 상태 체크 완료: {}", Boolean.TRUE.equals(isHealthy) ? "정상" : "비정상");
                    return Boolean.TRUE.equals(isHealthy);
                } catch (Exception e) {
                    log.warn("동기화 중 API 상태 체크 실패", e);
                    return false;
                }
            });
            
            // 결과 수집
            List<FacilitySyncService.SyncResult> results = future.get();
            Boolean apiHealthy = healthCheckFuture.get();
            
            // 동기화 결과 통계 계산
            SyncStatistics stats = calculateSyncStatistics(results);
            stats.apiHealthy = apiHealthy;
            
            // 결과 로깅
            logSyncResults(startTime, stats);
            
            // 성공률이 낮은 경우 경고
            if (stats.getSuccessRate() < 80.0) {
                log.warn("동기화 성공률이 낮습니다: {}% - 시스템 점검이 필요할 수 있습니다", 
                        String.format("%.1f", stats.getSuccessRate()));
            }
            
            // API가 비정상인 경우 경고
            if (!apiHealthy) {
                log.warn("동기화 완료 시점에 API 상태가 비정상입니다. 다음 동기화에 영향을 줄 수 있습니다.");
            }
            
        } catch (Exception e) {
            log.error("전국 시설 정보 동기화 실패", e);
        }
        
        log.info("=== 전국 시설 정보 동기화 완료 ===");
    }

    /**
     * 특정 지역 시설 정보 동기화 (테스트용)
     * 매일 오전 9시에 서울 지역만 동기화 (개발/테스트 환경)
     */
    @Scheduled(cron = "${app.scheduler.test-sync-cron:0 0 9 * * ?}")
    @ConditionalOnProperty(name = "spring.profiles.active", havingValue = "dev")
    public void syncSeoulFacilities() {
        log.info("=== 서울 지역 시설 정보 동기화 시작 (테스트) ===");
        
        try {
            CompletableFuture<FacilitySyncService.SyncResult> future = 
                    facilitySyncService.syncFacilitiesByRegion("서울특별시");
            
            FacilitySyncService.SyncResult result = future.get();
            
            log.info("서울 지역 동기화 완료 - 검색: {}건, 처리: {}건, 오류: {}건, 소요시간: {}분",
                    result.getTotalFound(), result.getProcessedCount(), 
                    result.getErrorCount(), result.getDurationMinutes());
            
        } catch (Exception e) {
            log.error("서울 지역 시설 정보 동기화 실패", e);
        }
    }

    /**
     * 공공데이터 API 상태 체크 및 통계 업데이트 (병렬 처리)
     * 매 10분마다 실행
     */
    @Scheduled(cron = "${app.scheduler.health-check-cron:0 */10 * * * ?}")
    public void checkApiHealthAndUpdateStats() {
        log.debug("공공데이터 API 상태 체크 및 통계 업데이트 시작 (병렬)");
        
        // API 상태 체크 (비동기)
        CompletableFuture<Boolean> healthCheckFuture = CompletableFuture.supplyAsync(() -> {
            try {
                Boolean isHealthy = publicDataApiClient.checkApiHealth().block();
                
                if (Boolean.TRUE.equals(isHealthy)) {
                    log.debug("공공데이터 API 상태: 정상");
                } else {
                    log.warn("공공데이터 API 상태: 비정상 - API 서버 점검 필요");
                }
                return Boolean.TRUE.equals(isHealthy);
                
            } catch (Exception e) {
                log.error("공공데이터 API 상태 체크 실패", e);
                return false;
            }
        });
        
        // API 통계 업데이트 (비동기) - 10분마다 실행하는 것으로 변경
        CompletableFuture<Void> statisticsUpdateFuture = CompletableFuture.runAsync(() -> {
            try {
                var statistics = publicDataApiClient.getApiStatistics().block();
                
                if (statistics != null) {
                    log.info("API 호출 통계 - 총 호출: {}, 성공률: {}%, 평균 응답시간: {}",
                            statistics.get("totalCalls"),
                            statistics.get("successRate"),
                            statistics.get("averageResponseTime"));
                }
                
            } catch (Exception e) {
                log.error("API 호출 통계 업데이트 실패", e);
            }
        });
        
        try {
            // 두 작업 모두 완료 대기 (최대 5분)
            CompletableFuture.allOf(healthCheckFuture, statisticsUpdateFuture)
                    .get(5, TimeUnit.MINUTES);
            
            Boolean isHealthy = healthCheckFuture.get();
            log.debug("병렬 API 체크 완료. 상태: {}", isHealthy ? "정상" : "비정상");
            
        } catch (Exception e) {
            log.error("병렬 API 상태 체크 실패", e);
        }
    }

    /**
     * 캐시 정리
     * 매일 새벽 3시에 실행 (시설 동기화 이후)
     */
    @Scheduled(cron = "0 0 3 * * ?")
    public void clearCaches() {
        log.info("캐시 정리 시작");
        
        try {
            facilitySyncService.evictFacilityCaches();
            log.info("캐시 정리 완료");
            
        } catch (Exception e) {
            log.error("캐시 정리 실패", e);
        }
    }

    /**
     * 시스템 상태 점검
     * 매일 오전 8시에 실행
     */
    @Scheduled(cron = "0 0 8 * * ?")
    public void systemHealthCheck() {
        log.info("=== 시스템 상태 점검 시작 ===");
        
        try {
            // 메모리 사용량 체크
            Runtime runtime = Runtime.getRuntime();
            long totalMemory = runtime.totalMemory();
            long freeMemory = runtime.freeMemory();
            long usedMemory = totalMemory - freeMemory;
            double memoryUsagePercent = ((double) usedMemory / totalMemory) * 100;
            
            log.info("메모리 사용량: {}% ({}/{}MB)", 
                    String.format("%.1f", memoryUsagePercent),
                    usedMemory / (1024 * 1024),
                    totalMemory / (1024 * 1024));
            
            // 메모리 사용량이 90% 이상인 경우 경고
            if (memoryUsagePercent > 90) {
                log.warn("메모리 사용량이 높습니다: {}% - 시스템 최적화가 필요할 수 있습니다", 
                        String.format("%.1f", memoryUsagePercent));
            }
            
            // 공공데이터 API 상태 재확인
            Boolean apiHealthy = publicDataApiClient.checkApiHealth().block();
            log.info("공공데이터 API 상태: {}", Boolean.TRUE.equals(apiHealthy) ? "정상" : "비정상");
            
        } catch (Exception e) {
            log.error("시스템 상태 점검 실패", e);
        }
        
        log.info("=== 시스템 상태 점검 완료 ===");
    }

    /**
     * 동기화 결과 통계 계산
     */
    private SyncStatistics calculateSyncStatistics(List<FacilitySyncService.SyncResult> results) {
        SyncStatistics stats = new SyncStatistics();
        
        for (FacilitySyncService.SyncResult result : results) {
            stats.totalRegions++;
            stats.totalFound += result.getTotalFound();
            stats.totalProcessed += result.getProcessedCount();
            stats.totalErrors += result.getErrorCount();
            
            if (result.getErrorMessage() != null) {
                stats.failedRegions++;
            }
        }
        
        // 성공률 계산
        if (stats.totalFound > 0) {
            stats.successRate = ((double) stats.totalProcessed / stats.totalFound) * 100;
        }
        
        return stats;
    }

    /**
     * 동기화 결과 로깅
     */
    private void logSyncResults(LocalDateTime startTime, SyncStatistics stats) {
        LocalDateTime endTime = LocalDateTime.now();
        long durationMinutes = java.time.Duration.between(startTime, endTime).toMinutes();
        
        log.info("=== 전국 시설 동기화 결과 ===");
        log.info("처리 지역: {}/{} (실패: {})", 
                stats.totalRegions - stats.failedRegions, stats.totalRegions, stats.failedRegions);
        log.info("검색된 시설: {}건", stats.totalFound);
        log.info("처리 완료: {}건", stats.totalProcessed);
        log.info("처리 실패: {}건", stats.totalErrors);
        log.info("성공률: {}%", String.format("%.1f", stats.successRate));
        log.info("총 소요시간: {}분", durationMinutes);
        log.info("============================");
    }

    /**
     * 오류 결과 생성 헬퍼 메서드
     */
    private FacilitySyncService.SyncResult createErrorResult(String region, Exception e) {
        // 간단한 오류 결과 객체 생성 (실제 구현은 FacilitySyncService에 따라 조정)
        log.error("지역 {} 동기화 중 오류 발생: {}", region, e.getMessage());
        return new FacilitySyncService.SyncResult(); // 기본 생성자 사용
    }

    /**
     * 동기화 통계 클래스
     */
    private static class SyncStatistics {
        int totalRegions = 0;
        int failedRegions = 0;
        int totalFound = 0;
        int totalProcessed = 0;
        int totalErrors = 0;
        double successRate = 0.0;
        boolean apiHealthy = true; // API 상태 추가

        public double getSuccessRate() {
            return successRate;
        }
        
        public boolean isApiHealthy() {
            return apiHealthy;
        }
    }
} 