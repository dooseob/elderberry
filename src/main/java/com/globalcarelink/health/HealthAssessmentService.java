package com.globalcarelink.health;

import com.globalcarelink.common.exception.CustomException;
import com.globalcarelink.common.util.ValidationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 건강 상태 평가 서비스
 * KB라이프생명 기반 돌봄지수 체크 비즈니스 로직
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class HealthAssessmentService {

    private final HealthAssessmentRepository healthAssessmentRepository;
    private final CareGradeCalculator careGradeCalculator;

    /**
     * 건강 평가 생성
     */
    @Transactional
    public HealthAssessment createAssessment(HealthAssessmentCreateRequest request) {
        log.info("건강 평가 생성 시작 - 회원: {}", request.getMemberId());

        // 입력값 검증
        validateAssessmentRequest(request);

        // 엔티티 생성
        HealthAssessment assessment = HealthAssessment.builder()
                .memberId(request.getMemberId())
                .gender(request.getGender())
                .birthYear(request.getBirthYear())
                .mobilityLevel(request.getMobilityLevel())
                .eatingLevel(request.getEatingLevel())
                .toiletLevel(request.getToiletLevel())
                .communicationLevel(request.getCommunicationLevel())
                .ltciGrade(request.getLtciGrade())
                .careTargetStatus(request.getCareTargetStatus() != null ? request.getCareTargetStatus() : 4)
                .mealType(request.getMealType() != null ? request.getMealType() : 1)
                .diseaseTypes(request.getDiseaseTypes())
                .assessmentDate(LocalDateTime.now())
                .build();

        // ADL 점수 자동 계산
        assessment.calculateAdlScore();

        // 케어 등급 계산
        CareGradeCalculator.CareGradeResult gradeResult = careGradeCalculator.calculateComprehensiveGrade(assessment);

        // 저장
        HealthAssessment saved = healthAssessmentRepository.save(assessment);

        log.info("건강 평가 생성 완료 - ID: {}, 회원: {}, 등급: {}", 
                saved.getId(), request.getMemberId(), gradeResult.getGradeName());

        return saved;
    }

    /**
     * 회원별 최신 건강 평가 조회
     */
    public Optional<HealthAssessment> getLatestAssessmentByMemberId(String memberId) {
        ValidationUtil.validateStringField(memberId, "회원 ID");
        
        return healthAssessmentRepository.findTopByMemberIdOrderByAssessmentDateDesc(memberId);
    }

    /**
     * 회원별 건강 평가 이력 조회
     */
    public List<HealthAssessment> getAssessmentHistoryByMemberId(String memberId) {
        ValidationUtil.validateStringField(memberId, "회원 ID");
        
        return healthAssessmentRepository.findByMemberIdOrderByAssessmentDateDesc(memberId);
    }

    /**
     * 건강 평가 페이징 조회
     */
    public Page<HealthAssessment> getAssessmentsByMemberId(String memberId, Pageable pageable) {
        ValidationUtil.validateStringField(memberId, "회원 ID");
        
        return healthAssessmentRepository.findByMemberIdOrderByAssessmentDateDesc(memberId, pageable);
    }

    /**
     * 건강 평가 수정
     */
    @Transactional
    public HealthAssessment updateAssessment(Long assessmentId, HealthAssessmentUpdateRequest request) {
        log.info("건강 평가 수정 시작 - ID: {}", assessmentId);

        // 기존 평가 조회
        HealthAssessment assessment = healthAssessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new CustomException.NotFound("건강 평가를 찾을 수 없습니다: " + assessmentId));

        // 입력값 검증
        validateUpdateRequest(request);

        // 평가 정보 업데이트
        if (request.getMobilityLevel() != null) {
            assessment.setMobilityLevel(request.getMobilityLevel());
        }
        if (request.getEatingLevel() != null) {
            assessment.setEatingLevel(request.getEatingLevel());
        }
        if (request.getToiletLevel() != null) {
            assessment.setToiletLevel(request.getToiletLevel());
        }
        if (request.getCommunicationLevel() != null) {
            assessment.setCommunicationLevel(request.getCommunicationLevel());
        }
        if (request.getLtciGrade() != null) {
            assessment.setLtciGrade(request.getLtciGrade());
        }
        if (request.getCareTargetStatus() != null) {
            assessment.setCareTargetStatus(request.getCareTargetStatus());
        }
        if (request.getMealType() != null) {
            assessment.setMealType(request.getMealType());
        }
        if (request.getDiseaseTypes() != null) {
            assessment.setDiseaseTypes(request.getDiseaseTypes());
        }

        // 평가 날짜 갱신
        assessment.setAssessmentDate(LocalDateTime.now());

        // ADL 점수 재계산
        assessment.calculateAdlScore();

        // 케어 등급 재계산
        CareGradeCalculator.CareGradeResult gradeResult = careGradeCalculator.calculateComprehensiveGrade(assessment);

        HealthAssessment updated = healthAssessmentRepository.save(assessment);

        log.info("건강 평가 수정 완료 - ID: {}, 새 등급: {}", assessmentId, gradeResult.getGradeName());

        return updated;
    }

    /**
     * 케어 등급 계산 (별도 호출)
     */
    public CareGradeCalculator.CareGradeResult calculateCareGrade(HealthAssessment assessment) {
        return careGradeCalculator.calculateComprehensiveGrade(assessment);
    }

    /**
     * 특정 케어 등급 범위의 평가 조회
     */
    public List<HealthAssessment> getAssessmentsByCareGradeRange(Integer minGrade, Integer maxGrade) {
        return healthAssessmentRepository.findByCareGradeRange(minGrade, maxGrade);
    }

    /**
     * 호스피스 케어 대상자 조회
     */
    public List<HealthAssessment> getHospiceCareTargets() {
        return healthAssessmentRepository.findHospiceCareTargets();
    }

    /**
     * 치매 전문 케어 대상자 조회
     */
    public List<HealthAssessment> getDementiaCareTargets() {
        return healthAssessmentRepository.findDementiaCareTargets();
    }

    /**
     * 중증 환자 조회
     */
    public List<HealthAssessment> getSevereCareTargets() {
        return healthAssessmentRepository.findSevereCareTargets();
    }

    /**
     * 재외동포 대상 평가 조회
     */
    public List<HealthAssessment> getOverseasKoreanAssessments() {
        return healthAssessmentRepository.findOverseasKoreanAssessments();
    }

    /**
     * 건강 평가 통계 조회
     */
    public HealthAssessmentStatistics getStatistics() {
        // 케어 등급별 통계
        List<Map<String, Object>> gradeStats = healthAssessmentRepository.findCareGradeStatistics();
        
        // ADL 점수 구간별 통계
        List<Map<String, Object>> adlStats = healthAssessmentRepository.findAdlScoreDistribution();
        
        // 연령대별 케어 등급 분포
        List<Map<String, Object>> ageStats = healthAssessmentRepository.findAgeGroupCareGradeDistribution();
        
        // 성별 케어 패턴
        List<Map<String, Object>> genderStats = healthAssessmentRepository.findGenderCarePatternAnalysis();
        
        // 최근 30일 평가 현황
        Long recentCount = healthAssessmentRepository.countRecentAssessments(LocalDateTime.now().minusDays(30));
        
        // 전체 평가 수
        long totalCount = healthAssessmentRepository.count();
        
        // 완성된 평가 수
        long completeCount = healthAssessmentRepository.findCompleteAssessments().size();

        return HealthAssessmentStatistics.builder()
                .totalAssessments(totalCount)
                .completeAssessments(completeCount)
                .recentAssessments(recentCount)
                .careGradeDistribution(gradeStats)
                .adlScoreDistribution(adlStats)
                .ageGroupDistribution(ageStats)
                .genderPatternAnalysis(genderStats)
                .build();
    }

    /**
     * 회원의 평가 개선 추이 분석
     */
    public List<Map<String, Object>> getMemberAssessmentTrend(String memberId) {
        ValidationUtil.validateStringField(memberId, "회원 ID");
        
        return healthAssessmentRepository.findMemberAssessmentTrend(memberId);
    }

    /**
     * 건강 평가 삭제
     */
    @Transactional
    public void deleteAssessment(Long assessmentId) {
        HealthAssessment assessment = healthAssessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new CustomException.NotFound("건강 평가를 찾을 수 없습니다: " + assessmentId));

        healthAssessmentRepository.delete(assessment);
        
        log.info("건강 평가 삭제 완료 - ID: {}, 회원: {}", assessmentId, assessment.getMemberId());
    }

    // ===== 내부 검증 메서드 =====

    private void validateAssessmentRequest(HealthAssessmentCreateRequest request) {
        // 필수 필드 검증
        ValidationUtil.validateStringField(request.getMemberId(), "회원 ID");
        
        if (request.getMobilityLevel() == null || request.getEatingLevel() == null ||
            request.getToiletLevel() == null || request.getCommunicationLevel() == null) {
            throw new CustomException.BadRequest("ADL 평가 4개 영역(걷기, 식사, 배변, 의사소통)은 모두 필수입니다");
        }

        // 범위 검증
        validateAdlLevels(request.getMobilityLevel(), request.getEatingLevel(), 
                         request.getToiletLevel(), request.getCommunicationLevel());

        // 출생년도 검증
        if (request.getBirthYear() != null && 
            (request.getBirthYear() < 1900 || request.getBirthYear() > LocalDateTime.now().getYear())) {
            throw new CustomException.BadRequest("출생년도가 유효하지 않습니다");
        }

        // 질환 정보 검증
        if (request.getDiseaseTypes() != null && request.getDiseaseTypes().length() > 200) {
            throw new CustomException.BadRequest("질환 정보는 200자를 초과할 수 없습니다");
        }
    }

    private void validateUpdateRequest(HealthAssessmentUpdateRequest request) {
        // ADL 수준 검증 (null이 아닌 경우만)
        if (request.getMobilityLevel() != null || request.getEatingLevel() != null ||
            request.getToiletLevel() != null || request.getCommunicationLevel() != null) {
            
            validateAdlLevels(request.getMobilityLevel(), request.getEatingLevel(), 
                             request.getToiletLevel(), request.getCommunicationLevel());
        }
    }

    private void validateAdlLevels(Integer mobility, Integer eating, Integer toilet, Integer communication) {
        if (mobility != null && (mobility < 1 || mobility > 3)) {
            throw new CustomException.BadRequest("걷기 활동 능력은 1-3 사이여야 합니다");
        }
        if (eating != null && (eating < 1 || eating > 3)) {
            throw new CustomException.BadRequest("식사 활동 능력은 1-3 사이여야 합니다");
        }
        if (toilet != null && (toilet < 1 || toilet > 3)) {
            throw new CustomException.BadRequest("배변 활동 능력은 1-3 사이여야 합니다");
        }
        if (communication != null && (communication < 1 || communication > 3)) {
            throw new CustomException.BadRequest("의사소통 능력은 1-3 사이여야 합니다");
        }
    }
}