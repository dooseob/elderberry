/**
 * 건강 상태 평가 관련 타입 정의
 * KB라이프생명 기반 돌봄지수 체크 시스템
 */

// === ADL 평가 레벨 ===
export type AdlLevel = 1 | 2 | 3;

export interface AdlOptions {
  1: string;
  2: string;
  3: string;
}

// === 장기요양보험 등급 ===
export type LtciGrade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// === 돌봄대상자 상태 ===
export type CareTargetStatus = 1 | 2 | 3 | 4;

// === 식사형태 ===
export type MealType = 1 | 2 | 3;

// === 성별 ===
export type Gender = 'MALE' | 'FEMALE' | 'M' | 'F';

// === 건강 평가 생성 요청 ===
export interface HealthAssessmentCreateRequest {
  memberId: string;
  gender?: Gender;
  birthYear?: number;
  
  // ADL 평가 (필수)
  mobilityLevel: AdlLevel;
  eatingLevel: AdlLevel;
  toiletLevel: AdlLevel;
  communicationLevel: AdlLevel;
  
  // 추가 평가 항목
  ltciGrade?: LtciGrade;
  careTargetStatus?: CareTargetStatus;
  mealType?: MealType;
  diseaseTypes?: string;
  
  // 추가 정보
  notes?: string;
  assessorName?: string;
  assessorRelation?: string;
}

// === 건강 평가 응답 ===
export interface HealthAssessment {
  id: number;
  memberId: string;
  gender?: string;
  birthYear?: number;
  
  // ADL 평가
  mobilityLevel: number;
  eatingLevel: number;
  toiletLevel: number;
  communicationLevel: number;
  
  // 계산된 점수
  adlScore: number;
  overallCareGrade: string;
  careGradeLevel: number;
  
  // 추가 평가 항목
  ltciGrade?: number;
  careTargetStatus?: number;
  mealType?: number;
  diseaseTypes?: string;
  
  // 메타 정보
  assessmentDate: string;
  createdAt: string;
  updatedAt: string;
  
  // 비즈니스 로직 결과
  specializedCareType: string;
  estimatedMonthlyCostRange: string;
  
  notes?: string;
  assessorName?: string;
  assessorRelation?: string;
}

// === 케어 등급 결과 ===
export interface CareGradeResult {
  gradeLevel: number;
  gradeName: string;
  careType: string;
  description: string;
  recommendedFacilityTypes: string[];
  estimatedMonthlyCost: {
    min: number;
    max: number;
    currency: string;
  };
}

// === 체크리스트 UI 상태 ===
export interface ChecklistStep {
  id: string;
  title: string;
  description: string;
  isRequired: boolean;
  isCompleted: boolean;
  validationErrors?: string[];
}

export interface ChecklistState {
  currentStep: number;
  totalSteps: number;
  steps: ChecklistStep[];
  formData: Partial<HealthAssessmentCreateRequest>;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

// === ADL 평가 옵션 정의 ===
export const ADL_OPTIONS = {
  mobility: {
    1: "혼자서 가능해요",
    2: "부분적인 도움이 필요해요 (타인의 부축, 지팡이 이용 등)",
    3: "혼자서는 보행이 어려워요 (휠체어 사용 등)"
  },
  eating: {
    1: "혼자서 가능해요",
    2: "부분적인 도움이 필요해요 (반찬 집기, 자르기 등 일부 도움)",
    3: "완전한 도움이 필요해요 (음식을 떠 먹여줌)"
  },
  toilet: {
    1: "혼자서 화장실을 이용할 수 있어요",
    2: "화장실 이용 시 부분적인 도움이 필요해요",
    3: "완전한 도움이 필요해요 (간이변기, 기저귀 착용 등)"
  },
  communication: {
    1: "정상적으로 가능해요",
    2: "때때로 어려워요 (화장실 이용의사 표현 가능)",
    3: "소통이 어려워요 (화장실 이용의사 표현 잘 못함)"
  }
} as const;

// === 장기요양보험 등급 정의 ===
export const LTCI_GRADES = {
  1: { name: "1등급", description: "가장 중증 (95점 이상)" },
  2: { name: "2등급", description: "중증 (75점~94점)" },
  3: { name: "3등급", description: "중등증 (60점~74점)" },
  4: { name: "4등급", description: "경증 (51점~59점)" },
  5: { name: "5등급", description: "경증 (45점~50점)" },
  6: { name: "인지지원등급", description: "치매 특화 (45점 미만, 인지기능 저하)" },
  7: { name: "모름", description: "등급을 모르겠어요" },
  8: { name: "없음", description: "장기요양보험 미신청" }
} as const;

// === 돌봄대상자 상태 정의 ===
export const CARE_TARGET_STATUS = {
  1: { name: "상태 1", description: "6개월 이하의 기대수명 상태 (호스피스 케어)" },
  2: { name: "상태 2", description: "질병이 회복하기 어려운 상황으로 수명이 얼마 남지 않음" },
  3: { name: "상태 3", description: "완전히 타인 의존적인 상태이나 사망위험이 높지 않음" },
  4: { name: "상태 4", description: "해당사항 없음 (일반 요양)" }
} as const;

// === 식사형태 정의 ===
export const MEAL_TYPES = {
  1: { name: "일반식", description: "정상적인 고체 음식 섭취 가능" },
  2: { name: "잘게 썬 음식", description: "음식을 잘게 썰어서 섭취" },
  3: { name: "관급식", description: "튜브를 통한 영양 공급" }
} as const;