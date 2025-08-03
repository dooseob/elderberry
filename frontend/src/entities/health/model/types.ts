/**
 * Health 엔티티 타입 정의
 * FSD 구조에 맞춘 건강 평가 도메인 타입
 */
import { BaseEntity } from '../../../shared/types/common';

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
export type HealthGender = 'MALE' | 'FEMALE' | 'M' | 'F';

// === 기본 건강 평가 엔티티 ===
export interface HealthAssessment extends BaseEntity {
  memberId: string;
  gender?: HealthGender;
  birthYear?: number;
  
  // ADL 평가 (필수)
  mobilityLevel: AdlLevel;
  eatingLevel: AdlLevel;
  toiletLevel: AdlLevel;
  communicationLevel: AdlLevel;
  
  // 계산된 점수
  adlScore: number;
  overallCareGrade: string;
  careGradeLevel: number;
  
  // 추가 평가 항목
  ltciGrade?: LtciGrade;
  careTargetStatus?: CareTargetStatus;
  mealType?: MealType;
  diseaseTypes?: string;
  
  // 평가 메타 정보
  assessmentDate: string;
  
  // 비즈니스 로직 결과
  specializedCareType: string;
  estimatedMonthlyCostRange: string;
  
  notes?: string;
  assessorName?: string;
  assessorRelation?: string;
}

// === 건강 평가 생성 요청 ===
export interface CreateHealthAssessmentRequest {
  memberId: string;
  gender?: HealthGender;
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

// === 건강 평가 수정 요청 ===
export interface UpdateHealthAssessmentRequest {
  gender?: HealthGender;
  birthYear?: number;
  
  // ADL 평가
  mobilityLevel?: AdlLevel;
  eatingLevel?: AdlLevel;
  toiletLevel?: AdlLevel;
  communicationLevel?: AdlLevel;
  
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

// === 케어 등급 결과 ===
export interface CareGradeResult {
  gradeLevel: number;
  gradeName: string;
  careType: CareType;
  description: string;
  recommendedFacilityTypes: string[];
  estimatedMonthlyCost: {
    min: number;
    max: number;
    currency: string;
  };
  riskFactors: string[];
  recommendations: string[];
}

// === 케어 타입 enum ===
export enum CareType {
  HOME_CARE = 'HOME_CARE',
  DAY_CARE = 'DAY_CARE',
  RESIDENTIAL_CARE = 'RESIDENTIAL_CARE',
  NURSING_HOME = 'NURSING_HOME',
  HOSPICE_CARE = 'HOSPICE_CARE',
  SPECIALIZED_CARE = 'SPECIALIZED_CARE',
}

// === 건강 평가 위저드 단계 ===
export interface AssessmentStep {
  id: string;
  title: string;
  description: string;
  isRequired: boolean;
  isCompleted: boolean;
  validationErrors?: string[];
  fields: string[];
}

// === 건강 평가 위저드 상태 ===
export interface HealthAssessmentWizardState {
  currentStep: number;
  totalSteps: number;
  steps: AssessmentStep[];
  formData: Partial<CreateHealthAssessmentRequest>;
  isSubmitting: boolean;
  errors: Record<string, string>;
  completionPercentage: number;
}

// === 건강 평가 통계 ===
export interface HealthAssessmentStatistics {
  totalAssessments: number;
  averageAdlScore: number;
  careGradeDistribution: {
    grade: string;
    count: number;
    percentage: number;
  }[];
  ltciGradeDistribution: {
    grade: LtciGrade;
    count: number;
    percentage: number;
  }[];
  ageGroupDistribution: {
    ageRange: string;
    count: number;
    averageAdlScore: number;
  }[];
  genderDistribution: {
    gender: HealthGender;
    count: number;
    averageAdlScore: number;
  }[];
}

// === 건강 평가 이력 ===
export interface HealthAssessmentHistory {
  assessments: HealthAssessment[];
  trends: {
    adlScoreTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
    careGradeTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
    changes: {
      date: string;
      field: string;
      previousValue: any;
      newValue: any;
      impact: string;
    }[];
  };
  recommendations: {
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    type: 'REASSESSMENT' | 'CARE_PLAN_UPDATE' | 'FACILITY_CHANGE' | 'MEDICAL_CONSULTATION';
    message: string;
    dueDate?: string;
  }[];
}

// === 건강 평가 비교 ===
export interface HealthAssessmentComparison {
  baselineAssessment: HealthAssessment;
  currentAssessment: HealthAssessment;
  differences: {
    field: string;
    fieldLabel: string;
    previousValue: any;
    currentValue: any;
    change: 'IMPROVED' | 'DECLINED' | 'UNCHANGED';
    impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  }[];
  overallChange: 'IMPROVED' | 'DECLINED' | 'STABLE';
  recommendations: string[];
}

// === 건강 평가 검색 파라미터 ===
export interface HealthAssessmentSearchParams {
  memberId?: string;
  adlScoreRange?: { min: number; max: number };
  careGradeLevel?: number[];
  ltciGrade?: LtciGrade[];
  assessmentDateRange?: { startDate: string; endDate: string };
  assessorName?: string;
  
  // 페이징
  page?: number;
  size?: number;
  sortBy?: 'assessmentDate' | 'adlScore' | 'careGradeLevel' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
}

// === 건강 평가 목록 응답 ===
export interface HealthAssessmentListResponse {
  content: HealthAssessment[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  first: boolean;
  last: boolean;
}

// === 건강 상태 요약 ===
export interface HealthSummary {
  memberId: string;
  memberName: string;
  latestAssessment: HealthAssessment;
  assessmentCount: number;
  firstAssessmentDate: string;
  lastAssessmentDate: string;
  currentCareGrade: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  nextRecommendedAssessmentDate: string;
  careRecommendations: string[];
  alerts: {
    type: 'URGENT' | 'WARNING' | 'INFO';
    message: string;
    actionRequired: boolean;
  }[];
}

// === 건강 알림 ===
export interface HealthAlert {
  id: number;
  memberId: string;
  assessmentId: number;
  alertType: 'SCORE_DECLINE' | 'REASSESSMENT_DUE' | 'CARE_LEVEL_CHANGE' | 'MEDICAL_ATTENTION_NEEDED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  actionRequired: boolean;
  suggestedActions: string[];
  isRead: boolean;
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
}

// === 타입 가드 함수들 ===
export function isValidAdlLevel(level: any): level is AdlLevel {
  return typeof level === 'number' && [1, 2, 3].includes(level);
}

export function isValidLtciGrade(grade: any): grade is LtciGrade {
  return typeof grade === 'number' && [1, 2, 3, 4, 5, 6, 7, 8].includes(grade);
}

export function isValidCareTargetStatus(status: any): status is CareTargetStatus {
  return typeof status === 'number' && [1, 2, 3, 4].includes(status);
}

export function isValidMealType(type: any): type is MealType {
  return typeof type === 'number' && [1, 2, 3].includes(type);
}

export function isHealthAssessmentComplete(assessment: Partial<CreateHealthAssessmentRequest>): assessment is CreateHealthAssessmentRequest {
  return !!(
    assessment.memberId &&
    assessment.mobilityLevel &&
    assessment.eatingLevel &&
    assessment.toiletLevel &&
    assessment.communicationLevel
  );
}

// === 상수 정의 ===
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

export const CARE_TARGET_STATUS = {
  1: { name: "상태 1", description: "6개월 이하의 기대수명 상태 (호스피스 케어)" },
  2: { name: "상태 2", description: "질병이 회복하기 어려운 상황으로 수명이 얼마 남지 않음" },
  3: { name: "상태 3", description: "완전히 타인 의존적인 상태이나 사망위험이 높지 않음" },
  4: { name: "상태 4", description: "해당사항 없음 (일반 요양)" }
} as const;

export const MEAL_TYPES = {
  1: { name: "일반식", description: "정상적인 고체 음식 섭취 가능" },
  2: { name: "잘게 썬 음식", description: "음식을 잘게 썰어서 섭취" },
  3: { name: "관급식", description: "튜브를 통한 영양 공급" }
} as const;

export const CARE_TYPE_LABELS: Record<CareType, string> = {
  [CareType.HOME_CARE]: '재가케어',
  [CareType.DAY_CARE]: '주간보호',
  [CareType.RESIDENTIAL_CARE]: '주거케어',
  [CareType.NURSING_HOME]: '요양원',
  [CareType.HOSPICE_CARE]: '호스피스 케어',
  [CareType.SPECIALIZED_CARE]: '전문케어',
};

// === 건강 평가 단계 정의 ===
export const HEALTH_ASSESSMENT_STEPS: AssessmentStep[] = [
  {
    id: 'basic-info',
    title: '기본 정보',
    description: '성별과 출생년도를 입력해주세요',
    isRequired: false,
    isCompleted: false,
    fields: ['gender', 'birthYear']
  },
  {
    id: 'ltci-grade',
    title: '장기요양등급',
    description: '장기요양보험 등급을 선택해주세요',
    isRequired: false,
    isCompleted: false,
    fields: ['ltciGrade']
  },
  {
    id: 'mobility',
    title: '이동능력',
    description: '걷기나 이동에 대한 능력을 평가합니다',
    isRequired: true,
    isCompleted: false,
    fields: ['mobilityLevel']
  },
  {
    id: 'eating',
    title: '식사능력',
    description: '혼자서 식사하는 능력을 평가합니다',
    isRequired: true,
    isCompleted: false,
    fields: ['eatingLevel']
  },
  {
    id: 'toilet',
    title: '배변능력',
    description: '화장실 이용 능력을 평가합니다',
    isRequired: true,
    isCompleted: false,
    fields: ['toiletLevel']
  },
  {
    id: 'communication',
    title: '의사소통',
    description: '의사표현 및 소통 능력을 평가합니다',
    isRequired: true,
    isCompleted: false,
    fields: ['communicationLevel']
  },
  {
    id: 'additional-info',
    title: '추가 정보',
    description: '돌봄 상태, 식사형태, 질병 등 추가 정보를 입력합니다',
    isRequired: false,
    isCompleted: false,
    fields: ['careTargetStatus', 'mealType', 'diseaseTypes']
  },
  {
    id: 'review',
    title: '검토 및 완료',
    description: '입력한 정보를 검토하고 평가를 완료합니다',
    isRequired: true,
    isCompleted: false,
    fields: ['notes', 'assessorName', 'assessorRelation']
  }
];