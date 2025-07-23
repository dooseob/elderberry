package com.globalcarelink.coordinator;

import com.globalcarelink.health.HealthAssessment;
import com.globalcarelink.health.HealthAssessmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@Tag(name = "코디네이터 매칭", description = "AI 기반 코디네이터 자동 매칭 시스템")
@RestController
@RequestMapping("/api/coordinator-matching")
@RequiredArgsConstructor
@Slf4j
public class CoordinatorMatchingController {

    private final OptimizedCoordinatorMatchingService matchingService;
    private final HealthAssessmentService healthAssessmentService;
    private final CoordinatorCareSettingsService coordinatorCareSettingsService;

    @Operation(
        summary = "코디네이터 매칭",
        description = "건강 평가 결과를 기반으로 최적의 코디네이터를 매칭합니다."
    )
    @PostMapping("/match")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'ADMIN')")
    public ResponseEntity<List<CoordinatorMatch>> matchCoordinators(
        @Parameter(description = "건강 평가 ID", required = true)
        @RequestParam Long healthAssessmentId,
        @Valid @RequestBody MatchingPreference preference) {
        
        log.info("코디네이터 매칭 요청 - 평가ID: {}, 선호언어: {}", 
                healthAssessmentId, preference.getPreferredLanguage());

        Optional<HealthAssessment> assessmentOpt = healthAssessmentService.getAssessmentById(healthAssessmentId);
        if (assessmentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        HealthAssessment assessment = assessmentOpt.get();
        List<CoordinatorMatch> matches = matchingService.findOptimalMatches(assessment, preference);

        log.info("코디네이터 매칭 완료 - 평가ID: {}, 매칭결과: {}명", healthAssessmentId, matches.size());
        
        return ResponseEntity.ok(matches);
    }

    @Operation(
        summary = "언어 기반 코디네이터 조회",
        description = "특정 언어를 구사하는 코디네이터를 조회합니다."
    )
    @GetMapping("/language/{languageCode}")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<List<CoordinatorMatch>> getCoordinatorsByLanguage(
        @Parameter(description = "언어 코드 (KO, EN, ZH, JP 등)", required = true)
        @PathVariable String languageCode,
        @Parameter(description = "국가 코드")
        @RequestParam(required = false) String countryCode,
        @Parameter(description = "전문 상담 필요 여부")
        @RequestParam(defaultValue = "false") boolean needsProfessionalConsultation) {
        
        log.info("언어별 코디네이터 조회 - 언어: {}, 국가: {}", languageCode, countryCode);

        MatchingPreference preference = MatchingPreference.builder()
                .preferredLanguage(languageCode)
                .countryCode(countryCode)
                .needsProfessionalConsultation(needsProfessionalConsultation)
                .build();

        HealthAssessment dummyAssessment = HealthAssessment.builder()
                .mobilityLevel(2)
                .eatingLevel(2)
                .toiletLevel(2)
                .communicationLevel(2)
                .ltciGrade(4)
                .build();
        dummyAssessment.calculateAdlScore();

        List<CoordinatorMatch> matches = matchingService.findOptimalMatches(dummyAssessment, preference);
        
        return ResponseEntity.ok(matches);
    }

    @Operation(
        summary = "전문 분야별 코디네이터 조회",
        description = "특정 전문 분야의 코디네이터를 조회합니다."
    )
    @GetMapping("/specialty/{specialty}")
    @PreAuthorize("hasAnyRole('USER_DOMESTIC', 'USER_OVERSEAS', 'COORDINATOR', 'ADMIN')")
    public ResponseEntity<List<CoordinatorCareSettings>> getCoordinatorsBySpecialty(
        @Parameter(description = "전문 분야 (dementia, medical, rehabilitation 등)", required = true)
        @PathVariable String specialty) {
        
        log.info("전문분야별 코디네이터 조회 - 분야: {}", specialty);

        List<CoordinatorCareSettings> coordinators = coordinatorCareSettingsService.getCoordinatorsBySpecialty(specialty);
        
        return ResponseEntity.ok(coordinators);
    }

    @Operation(
        summary = "가용한 코디네이터 조회",
        description = "현재 새로운 케이스를 담당할 수 있는 코디네이터를 조회합니다."
    )
    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<List<CoordinatorCareSettings>> getAvailableCoordinators() {
        
        log.info("가용한 코디네이터 조회 요청");

        List<CoordinatorCareSettings> availableCoordinators = coordinatorCareSettingsService.getAvailableCoordinators();
        
        return ResponseEntity.ok(availableCoordinators);
    }

    @Operation(
        summary = "코디네이터 성과 통계",
        description = "전체 코디네이터의 성과 통계를 조회합니다."
    )
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CoordinatorMatchingStatistics> getMatchingStatistics() {
        
        log.info("코디네이터 매칭 통계 조회");

        CoordinatorMatchingStatistics statistics = coordinatorCareSettingsService.getMatchingStatistics();
        
        return ResponseEntity.ok(statistics);
    }

    @Operation(
        summary = "매칭 시뮬레이션",
        description = "대량 매칭 테스트를 위한 시뮬레이션을 실행합니다."
    )
    @PostMapping("/simulate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MatchingSimulationResult> simulateMatching(
        @Parameter(description = "시뮬레이션 설정", required = true)
        @Valid @RequestBody MatchingSimulationRequest request) {
        
        log.info("매칭 시뮬레이션 시작 - 평가수: {}, 코디네이터수: {}", 
                request.getHealthAssessmentCount(), request.getCoordinatorCount());

        MatchingSimulationResult result = coordinatorCareSettingsService.runMatchingSimulation(request);
        
        return ResponseEntity.ok(result);
    }
} 