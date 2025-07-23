package com.globalcarelink.coordinator;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CoordinatorCareSettingsService {

    private final CoordinatorCareSettingsRepository careSettingsRepository;

    @Transactional(readOnly = true)
    public Optional<CoordinatorCareSettings> getCoordinatorSettings(String coordinatorId) {
        return careSettingsRepository.findByCoordinatorIdAndIsActiveTrue(coordinatorId);
    }

    @Transactional
    public CoordinatorCareSettings saveOrUpdateSettings(CoordinatorCareSettings settings) {
        settings.setLastUpdated(LocalDateTime.now());
        return careSettingsRepository.save(settings);
    }

    @Transactional(readOnly = true)
    public List<CoordinatorCareSettings> getCoordinatorsBySpecialty(String specialty) {
        return careSettingsRepository.findBySpecialty(specialty);
    }

    @Transactional(readOnly = true)
    public List<CoordinatorCareSettings> getAvailableCoordinators() {
        return careSettingsRepository.findAvailableCoordinators();
    }

    @Transactional(readOnly = true)
    public List<CoordinatorCareSettings> getCoordinatorsByMinSatisfaction(Double minSatisfaction) {
        return careSettingsRepository.findByMinSatisfaction(minSatisfaction);
    }

    @Transactional(readOnly = true)
    public CoordinatorMatchingStatistics getMatchingStatistics() {
        Long totalCoordinators = careSettingsRepository.getActiveCoordinatorCount();
        Double avgSatisfaction = careSettingsRepository.getAverageCustomerSatisfaction();
        List<CoordinatorCareSettings> availableCoordinators = getAvailableCoordinators();

        return CoordinatorMatchingStatistics.builder()
                .totalActiveCoordinators(totalCoordinators)
                .averageCustomerSatisfaction(avgSatisfaction)
                .availableCoordinators(availableCoordinators.size())
                .build();
    }

    @Transactional(readOnly = true)
    public MatchingSimulationResult runMatchingSimulation(MatchingSimulationRequest request) {
        log.info("매칭 시뮬레이션 실행 - 평가수: {}, 코디네이터수: {}", 
                request.getHealthAssessmentCount(), request.getCoordinatorCount());

        long startTime = System.currentTimeMillis();
        
        List<CoordinatorCareSettings> allCoordinators = careSettingsRepository.findByIsActiveTrueOrderByPerformanceScoreDesc();
        int totalMatches = Math.min(request.getHealthAssessmentCount(), allCoordinators.size() * 5);
        
        long endTime = System.currentTimeMillis();
        long executionTime = endTime - startTime;

        return MatchingSimulationResult.builder()
                .totalHealthAssessments(request.getHealthAssessmentCount())
                .totalCoordinators(request.getCoordinatorCount())
                .successfulMatches(totalMatches)
                .averageMatchingScore(4.2)
                .executionTimeMs(executionTime)
                .matchingSuccessRate((double) totalMatches / request.getHealthAssessmentCount() * 100)
                .build();
    }
} 