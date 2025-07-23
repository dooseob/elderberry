package com.globalcarelink.coordinator;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class CoordinatorWorkloadOptimizer {

    public List<CoordinatorMatch> optimizeWorkloadDistribution(List<CoordinatorMatch> matches) {
        return matches.stream()
                .map(match -> {
                    double workloadScore = calculateWorkloadScore(match);
                    
                    double adjustedScore = match.getMatchScore() + (workloadScore * 0.3);
                    
                    String workloadReason = generateWorkloadReason(workloadScore);
                    String combinedReason = match.getMatchReason() + "\n" + workloadReason;
                    
                    return CoordinatorMatch.builder()
                            .coordinatorId(match.getCoordinatorId())
                            .name(match.getName())
                            .matchScore(Math.min(adjustedScore, 5.0))
                            .matchReason(combinedReason)
                            .experienceYears(match.getExperienceYears())
                            .successfulCases(match.getSuccessfulCases())
                            .customerSatisfaction(match.getCustomerSatisfaction())
                            .specialtyAreas(match.getSpecialtyAreas())
                            .compatibleCareGrades(match.getCompatibleCareGrades())
                            .languageSkills(match.getLanguageSkills())
                            .availableWeekends(match.getAvailableWeekends())
                            .availableEmergency(match.getAvailableEmergency())
                            .workingRegions(match.getWorkingRegions())
                            .currentActiveCases(match.getCurrentActiveCases())
                            .maxSimultaneousCases(match.getMaxSimultaneousCases())
                            .workloadRatio(match.getWorkloadRatio())
                            .build();
                })
                .sorted(Comparator.comparing(CoordinatorMatch::getMatchScore).reversed())
                .collect(Collectors.toList());
    }

    private double calculateWorkloadScore(CoordinatorMatch match) {
        double workloadRatio = match.getWorkloadRatio();
        
        if (workloadRatio >= 1.0) return 0.0;
        if (workloadRatio >= 0.8) return 1.0;
        if (workloadRatio >= 0.6) return 2.0;
        if (workloadRatio >= 0.4) return 3.0;
        return 4.0;
    }

    private String generateWorkloadReason(double workloadScore) {
        return switch ((int) workloadScore) {
            case 0 -> "⚠️ 업무량: 포화 상태 (일정 조율 필요)";
            case 1 -> "📊 업무량: 거의 포화 (배정 가능하나 여유 없음)";
            case 2 -> "✅ 업무량: 적정 수준 (안정적 배정 가능)";
            case 3 -> "💪 업무량: 여유 있음 (즉시 배정 가능)";
            default -> "🌟 업무량: 매우 여유 (최우선 배정 가능)";
        };
    }
} 