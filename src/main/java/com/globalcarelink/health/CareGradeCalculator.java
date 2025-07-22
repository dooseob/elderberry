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
     * 종합 케어 등급 계산
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

        // 4. 종합 케어 등급 도출
        CareGradeResult result = determineOverallCareGrade(adlScore, ltciGrade, careTargetStatus);

        // 5. 평가 결과 저장
        assessment.setOverallCareGrade(result.getGradeName());

        log.info("케어 등급 계산 완료 - 회원: {}, ADL점수: {}, 종합등급: {}", 
                assessment.getMemberId(), adlScore, result.getGradeName());

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
     * 종합 케어 등급 결정
     */
    private CareGradeResult determineOverallCareGrade(int adlScore, int ltciGrade, int careTargetStatus) {
        
        // 호스피스 케어 우선 판정 (생명예후 상태 1-2)
        if (careTargetStatus <= 2) {
            return CareGradeResult.builder()
                    .gradeLevel(1)
                    .gradeName("호스피스 케어")
                    .description("생애말기 전문 케어가 필요한 상태")
                    .recommendedFacilityTypes("호스피스 전문시설, 요양병원")
                    .urgencyLevel("매우 높음")
                    .medicalSupport("의료진 24시간 상주 필수")
                    .build();
        }

        // 인지지원등급 (치매 전문 케어)
        if (ltciGrade == 6) {
            return CareGradeResult.builder()
                    .gradeLevel(6)
                    .gradeName("인지지원등급 (치매 전문)")
                    .description("치매 전문 케어가 필요한 상태")
                    .recommendedFacilityTypes("치매 전문시설, 인지케어센터")
                    .urgencyLevel("높음")
                    .medicalSupport("치매 전문의 및 인지 프로그램")
                    .build();
        }

        // 장기요양등급 기반 판정 (1-5등급)
        if (ltciGrade >= 1 && ltciGrade <= 5) {
            return createLtciBasedGrade(ltciGrade, adlScore);
        }

        // 장기요양등급이 없는 경우 ADL 점수 기반 추정
        return createAdlBasedGrade(adlScore);
    }

    /**
     * 장기요양보험 등급 기반 케어 등급 생성
     */
    private CareGradeResult createLtciBasedGrade(int ltciGrade, int adlScore) {
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
                return createAdlBasedGrade(adlScore);
        }
    }

    /**
     * ADL 점수 기반 케어 등급 추정 (장기요양등급이 없는 경우)
     */
    private CareGradeResult createAdlBasedGrade(int adlScore) {
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