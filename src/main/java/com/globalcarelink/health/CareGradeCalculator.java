package com.globalcarelink.health;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 케어 등급 계산기
 * KB라이프생명 기반 돌봄지수 체크 시스템 구현
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CareGradeCalculator {

    /**
     * 종합 케어 등급 계산 (KB라이프생명 우선순위 로직 적용)
     * ADL 점수 + 장기요양보험 등급 + 돌봄대상자 상태를 종합하여 산출
     */
    public CareGradeResult calculateComprehensiveGrade(HealthAssessment assessment) {
        log.debug("케어 등급 계산 시작 - 회원: {}", assessment.getMemberId());

        // 1. 기본 ADL 점수 계산
        int adlScore = calculateADLScore(assessment);
        assessment.setAdlScore(adlScore);

        // 2. 장기요양보험 등급 반영
        int ltciGrade = assessment.getLtciGrade() != null ? assessment.getLtciGrade() : 8;

        // 3. 돌봄대상자 상태 반영
        int careTargetStatus = assessment.getCareTargetStatus() != null ? assessment.getCareTargetStatus() : 4;

        // 4. 종합 케어 등급 도출 (KB라이프생명 우선순위 방식)
        CareGradeResult result = determineOverallCareGrade(assessment, adlScore, ltciGrade, careTargetStatus);

        // 5. 평가 결과 저장
        assessment.setOverallCareGrade(result.getGradeName());

        log.info("케어 등급 계산 완료 - 회원: {}, ADL점수: {}, 종합등급: {}, 특화케어: {}", 
                assessment.getMemberId(), adlScore, result.getGradeName(), assessment.getSpecializedCareType());

        return result;
    }

    /**
     * ADL 점수 계산 (일상생활수행능력)
     * 각 영역별 가중치 적용:
     * - 걷기: 25%
     * - 식사: 20%  
     * - 배변: 30%
     * - 의사소통: 25%
     */
    private int calculateADLScore(HealthAssessment assessment) {
        int mobility = assessment.getMobilityLevel();
        int eating = assessment.getEatingLevel();
        int toilet = assessment.getToiletLevel();
        int communication = assessment.getCommunicationLevel();

        // 각 영역별 가중치 적용 (1-3점을 25-75점으로 환산)
        int mobilityScore = mobility * 25;        // 25, 50, 75
        int eatingScore = eating * 20;            // 20, 40, 60
        int toiletScore = toilet * 30;            // 30, 60, 90
        int communicationScore = communication * 25; // 25, 50, 75

        int totalScore = mobilityScore + eatingScore + toiletScore + communicationScore;

        log.debug("ADL 점수 계산 - 걷기:{}({}점), 식사:{}({}점), 배변:{}({}점), 의사소통:{}({}점) = 총 {}점",
                mobility, mobilityScore, eating, eatingScore, toilet, toiletScore, 
                communication, communicationScore, totalScore);

        return totalScore;
    }

    /**
     * 종합 케어 등급 결정 (KB라이프생명 우선순위 로직 적용)
     */
    private CareGradeResult determineOverallCareGrade(HealthAssessment assessment, int adlScore, int ltciGrade, int careTargetStatus) {
        
        // === 1단계: 특수 상황 우선 적용 (KB라이프생명 방식) ===
        if (careTargetStatus == 1) { // 6개월 이하 기대수명
            return createHospiceGrade("생명위험 고도", "6개월 이하 기대수명 상태");
        }
        
        if (careTargetStatus == 2) { // 회복 어려운 상황
            return createHospiceGrade("생명위험 중등도", "질병 회복이 어려운 상황");
        }
        
        if (careTargetStatus == 3) { // 완전 의존적 상태
            return CareGradeResult.builder()
                    .gradeLevel(1)
                    .gradeName("1등급 (최중증 - 완전의존)")
                    .description("완전히 타인에게 의존적인 상태")
                    .recommendedFacilityTypes("전문 요양병원, A등급 요양시설")
                    .urgencyLevel("매우 높음")
                    .medicalSupport("의료진 24시간 상주")
                    .build();
        }

        // === 2단계: 중증 지표 우선 체크 (KB라이프생명 방식) ===
        if (assessment != null) {
            // 경관식(튜브 주입) 또는 배변활동 완전도움 → 최중증 판정
            if ((assessment.getMealType() != null && assessment.getMealType() == 3) || 
                (assessment.getToiletLevel() != null && assessment.getToiletLevel() == 3)) {
                
                return CareGradeResult.builder()
                        .gradeLevel(1)
                        .gradeName("1등급 (최중증 - 중증지표)")
                        .description("경관식 또는 배변활동 완전도움 필요")
                        .recommendedFacilityTypes("요양병원, 전문 간병시설")
                        .urgencyLevel("매우 높음")
                        .medicalSupport("의료진 및 전문 간병인 상주")
                        .build();
            }
        }

        // === 3단계: 인지지원등급 (치매 전문 케어) ===
        if (ltciGrade == 6) {
            return createDementiaGrade(assessment);
        }

        // === 4단계: 장기요양등급 기반 판정 (1-5등급) ===
        if (ltciGrade >= 1 && ltciGrade <= 5) {
            return createLtciBasedGrade(ltciGrade, adlScore, assessment);
        }

        // === 5단계: 장기요양등급이 없는 경우 ADL 점수 기반 추정 ===
        return createAdlBasedGrade(adlScore, assessment);
    }

    /**
     * 호스피스 케어 등급 생성
     */
    private CareGradeResult createHospiceGrade(String severityLevel, String description) {
        return CareGradeResult.builder()
                .gradeLevel(0) // 특별 등급
                .gradeName("호스피스 케어 (" + severityLevel + ")")
                .description(description)
                .recommendedFacilityTypes("호스피스 전문시설, 완화의료센터")
                .urgencyLevel("최우선")
                .medicalSupport("완화의료 전문의, 24시간 케어팀")
                .build();
    }

    /**
     * 치매 전문 케어 등급 생성 (질환 정보 반영)
     */
    private CareGradeResult createDementiaGrade(HealthAssessment assessment) {
        String description = "치매 전문 케어가 필요한 상태";
        String facilityTypes = "치매 전문시설, 인지케어센터";
        
        // 질환 정보가 있으면 더 세밀한 추천
        if (assessment != null && assessment.getDiseaseTypes() != null) {
            if (assessment.getDiseaseTypes().contains("PARKINSON")) {
                description += " (파킨슨 복합)";
                facilityTypes = "파킨슨-치매 복합 전문시설, 신경과 연계 시설";
            } else if (assessment.getDiseaseTypes().contains("STROKE")) {
                description += " (뇌혈관성 치매)";
                facilityTypes = "재활-치매 복합 전문시설, 뇌혈관 전문 센터";
            }
        }
        
        return CareGradeResult.builder()
                .gradeLevel(6)
                .gradeName("인지지원등급 (치매 전문)")
                .description(description)
                .recommendedFacilityTypes(facilityTypes)
                .urgencyLevel("높음")
                .medicalSupport("치매 전문의, 인지재활 프로그램")
                .build();
    }


    /**
     * 장기요양보험 등급 기반 케어 등급 생성 (질환 정보 반영)
     */
    private CareGradeResult createLtciBasedGrade(int ltciGrade, int adlScore, HealthAssessment assessment) {
        switch (ltciGrade) {
            case 1:
                return CareGradeResult.builder()
                        .gradeLevel(1)
                        .gradeName("1등급 (최중증)")
                        .description("24시간 전문 케어가 필요한 최중증 상태")
                        .recommendedFacilityTypes("요양병원, A등급 요양시설")
                        .urgencyLevel("매우 높음")
                        .medicalSupport("의사 및 간호사 24시간 상주")
                        .build();

            case 2:
                return CareGradeResult.builder()
                        .gradeLevel(2)
                        .gradeName("2등급 (중증)")
                        .description("집중적인 의료 지원이 필요한 중증 상태")
                        .recommendedFacilityTypes("요양병원, A-B등급 요양시설")
                        .urgencyLevel("높음")
                        .medicalSupport("간호사 상주, 의사 정기 방문")
                        .build();

            case 3:
                return CareGradeResult.builder()
                        .gradeLevel(3)
                        .gradeName("3등급 (중등증)")
                        .description("일상 활동에 상당한 도움이 필요한 상태")
                        .recommendedFacilityTypes("요양시설, 노인요양공동생활가정")
                        .urgencyLevel("보통")
                        .medicalSupport("요양보호사 및 간호조무사")
                        .build();

            case 4:
                return CareGradeResult.builder()
                        .gradeLevel(4)
                        .gradeName("4등급 (경증)")
                        .description("부분적인 도움이 필요한 경증 상태")
                        .recommendedFacilityTypes("주야간보호시설, 재가복지시설")
                        .urgencyLevel("낮음")
                        .medicalSupport("요양보호사, 정기 건강 체크")
                        .build();

            case 5:
                return CareGradeResult.builder()
                        .gradeLevel(5)
                        .gradeName("5등급 (경증)")
                        .description("기본적인 지원이 필요한 경증 상태")
                        .recommendedFacilityTypes("주야간보호시설, 방문요양서비스")
                        .urgencyLevel("낮음")
                        .medicalSupport("요양보호사, 월간 건강 관리")
                        .build();

            default:
                return createAdlBasedGrade(adlScore, assessment);
        }
    }

    /**
     * ADL 점수 기반 케어 등급 추정 (장기요양등급이 없는 경우, 질환 정보 반영)
     */
    private CareGradeResult createAdlBasedGrade(int adlScore, HealthAssessment assessment) {
        if (adlScore >= 250) {
            return CareGradeResult.builder()
                    .gradeLevel(1)
                    .gradeName("추정 1등급 (최중증)")
                    .description("ADL 점수 기반 최중증으로 추정됨 (장기요양등급 신청 권장)")
                    .recommendedFacilityTypes("요양병원, 전문 요양시설")
                    .urgencyLevel("매우 높음")
                    .medicalSupport("전문 의료진 상담 필요")
                    .build();
        } else if (adlScore >= 220) {
            return CareGradeResult.builder()
                    .gradeLevel(2)
                    .gradeName("추정 2등급 (중증)")
                    .description("ADL 점수 기반 중증으로 추정됨 (장기요양등급 신청 권장)")
                    .recommendedFacilityTypes("요양시설, 의료 연계 시설")
                    .urgencyLevel("높음")
                    .medicalSupport("의료진 정기 상담 권장")
                    .build();
        } else if (adlScore >= 180) {
            return CareGradeResult.builder()
                    .gradeLevel(3)
                    .gradeName("추정 3등급 (중등증)")
                    .description("ADL 점수 기반 중등증으로 추정됨")
                    .recommendedFacilityTypes("일반 요양시설, 공동생활가정")
                    .urgencyLevel("보통")
                    .medicalSupport("요양보호사 상주")
                    .build();
        } else if (adlScore >= 140) {
            return CareGradeResult.builder()
                    .gradeLevel(4)
                    .gradeName("추정 4등급 (경증)")
                    .description("ADL 점수 기반 경증으로 추정됨")
                    .recommendedFacilityTypes("주야간보호시설, 재가서비스")
                    .urgencyLevel("낮음")
                    .medicalSupport("정기 건강 관리")
                    .build();
        } else {
            return CareGradeResult.builder()
                    .gradeLevel(5)
                    .gradeName("추정 5등급 (경증)")
                    .description("ADL 점수 기반 경증으로 추정됨")
                    .recommendedFacilityTypes("방문요양서비스, 생활 지원")
                    .urgencyLevel("낮음")
                    .medicalSupport("월간 건강 체크")
                    .build();
        }
    }

    /**
     * 케어 등급 결과 DTO
     */
    @lombok.Builder
    @lombok.Getter
    public static class CareGradeResult {
        private final int gradeLevel;           // 등급 레벨 (1-6)
        private final String gradeName;         // 등급명
        private final String description;       // 상태 설명
        private final String recommendedFacilityTypes; // 추천 시설 유형
        private final String urgencyLevel;      // 긴급도 (매우 높음, 높음, 보통, 낮음)
        private final String medicalSupport;    // 필요한 의료 지원

        /**
         * 코디네이터 매칭 우선순위 반환
         */
        public String getCoordinatorMatchingPriority() {
            return switch (gradeLevel) {
                case 1, 2 -> "의료 전문 코디네이터";
                case 6 -> "치매 전문 코디네이터";
                case 3, 4, 5 -> "일반 케어 코디네이터";
                default -> "기본 상담";
            };
        }

        /**
         * 예상 월 비용 범위 (단위: 만원)
         */
        public String getEstimatedMonthlyCost() {
            return switch (gradeLevel) {
                case 1 -> "300-500만원 (요양병원)";
                case 2 -> "200-400만원 (전문 요양시설)";
                case 3 -> "150-300만원 (일반 요양시설)";
                case 4, 5 -> "50-150만원 (재가/주야간 서비스)";
                case 6 -> "200-350만원 (치매 전문시설)";
                default -> "상담 후 결정";
            };
        }
    }
}