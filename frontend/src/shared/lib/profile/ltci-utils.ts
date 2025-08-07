/**
 * 장기요양보험 관련 유틸리티 모듈
 * 장기요양등급 정보, 케어 요구사항, 등급 변경 권장사항 등
 */

import {
  LtciGradeInfo,
  LTCI_GRADE_INFO
} from '../../../types/profile';

// ===== 장기요양등급 정보 조회 =====

/**
 * 장기요양등급 정보 조회
 * @param grade - 장기요양등급 (1-6)
 * @returns 장기요양등급 정보 또는 null
 */
export const getLtciGradeInfo = (grade: number): LtciGradeInfo | null => {
  return LTCI_GRADE_INFO[grade] || null;
};

/**
 * 장기요양등급 텍스트 조회
 * @param grade - 장기요양등급 (1-6)
 * @returns 등급 텍스트
 */
export const getLtciGradeText = (grade: number): string => {
  const info = getLtciGradeInfo(grade);
  return info ? info.text : '미등록';
};

/**
 * 중증 장기요양등급 여부 확인
 * @param grade - 장기요양등급 (1-6)
 * @returns 중증 등급 여부
 */
export const isSevereLtciGrade = (grade: number): boolean => {
  const info = getLtciGradeInfo(grade);
  return info ? info.isSevere : false;
};

/**
 * 인지지원 등급 여부 확인
 * @param grade - 장기요양등급 (1-6)
 * @returns 인지지원 등급 여부
 */
export const isCognitiveSupportGrade = (grade: number): boolean => {
  const info = getLtciGradeInfo(grade);
  return info ? info.isCognitiveSupport : false;
};

// ===== 장기요양등급 고급 유틸리티 =====

/**
 * 장기요양등급별 케어 요구사항 반환
 * @param grade - 장기요양등급 (1-6)
 * @returns 케어 요구사항 정보
 */
export const getLtciCareRequirements = (grade: number): {
  dailySupport: string;
  medicalSupport: string;
  specialtySupport: string[];
  recommendedFacilities: string[];
} | null => {
  const requirements = {
    1: {
      dailySupport: '24시간 전면적 도움 필요',
      medicalSupport: '상시 의료진 관리',
      specialtySupport: ['전문간병', '의료기기 관리', '응급처치'],
      recommendedFacilities: ['요양병원', '전문요양시설']
    },
    2: {
      dailySupport: '일상생활 대부분 도움 필요',
      medicalSupport: '정기적 의료 관리',
      specialtySupport: ['식사보조', '이동보조', '배설도움'],
      recommendedFacilities: ['요양원', '주간보호센터']
    },
    3: {
      dailySupport: '일상생활 부분적 도움 필요',
      medicalSupport: '주기적 건강 점검',
      specialtySupport: ['목욕보조', '가사지원', '외출동행'],
      recommendedFacilities: ['주간보호센터', '방문요양']
    },
    4: {
      dailySupport: '일정 부분 도움 필요',
      medicalSupport: '기본 건강 관리',
      specialtySupport: ['가사지원', '안전관리', '사회활동'],
      recommendedFacilities: ['주간보호센터', '재가서비스']
    },
    5: {
      dailySupport: '인지기능 지원 필요',
      medicalSupport: '치매 전문 관리',
      specialtySupport: ['인지활동', '행동관리', '안전감시'],
      recommendedFacilities: ['치매전담시설', '인지센터']
    },
    6: {
      dailySupport: '인지지원 서비스',
      medicalSupport: '예방적 건강 관리',
      specialtySupport: ['인지훈련', '예방프로그램', '사회참여'],
      recommendedFacilities: ['인지지원센터', '경로당']
    }
  };
  
  return requirements[grade as keyof typeof requirements] || null;
};

/**
 * 장기요양등급 변경 권장사항
 * @param currentGrade - 현재 등급
 * @param targetGrade - 목표 등급
 * @returns 등급 변경 권장사항
 */
export const getLtciGradeChangeRecommendation = (currentGrade: number, targetGrade: number): string => {
  if (currentGrade === targetGrade) {
    return '현재 등급을 유지하세요.';
  }
  
  if (currentGrade > targetGrade) {
    return '건강 상태가 악화되었습니다. 전문의와 상담하여 케어 계획을 재검토하세요.';
  }
  
  return '건강 상태가 개선되었습니다. 현재 케어 서비스를 조정할 수 있습니다.';
};

/**
 * 장기요양등급별 월 예상 비용 계산
 * @param grade - 장기요양등급 (1-6)
 * @param serviceType - 서비스 유형 ('home' | 'daycare' | 'facility')
 * @returns 예상 월 비용 (원)
 */
export const getLtciEstimatedMonthlyCost = (
  grade: number, 
  serviceType: 'home' | 'daycare' | 'facility'
): {
  baseCost: number;
  userPayment: number;
  insurancePayment: number;
  totalCost: number;
} | null => {
  // 2024년 기준 장기요양급여비 (단위: 원)
  const baseCosts = {
    1: { home: 1800000, daycare: 1200000, facility: 2400000 },
    2: { home: 1500000, daycare: 1000000, facility: 2000000 },
    3: { home: 1200000, daycare: 800000, facility: 1600000 },
    4: { home: 900000, daycare: 600000, facility: 1200000 },
    5: { home: 600000, daycare: 400000, facility: 800000 },
    6: { home: 300000, daycare: 200000, facility: 400000 }
  };
  
  const gradeBaseCosts = baseCosts[grade as keyof typeof baseCosts];
  if (!gradeBaseCosts) return null;
  
  const baseCost = gradeBaseCosts[serviceType];
  
  // 본인부담률 (일반적으로 20%)
  const userPaymentRate = 0.2;
  const userPayment = Math.round(baseCost * userPaymentRate);
  const insurancePayment = baseCost - userPayment;
  
  return {
    baseCost,
    userPayment,
    insurancePayment,
    totalCost: baseCost
  };
};

/**
 * 장기요양등급별 필요 서비스 시간 계산
 * @param grade - 장기요양등급 (1-6)
 * @returns 주간/월간 필요 서비스 시간
 */
export const getLtciRequiredServiceHours = (grade: number): {
  weeklyHours: number;
  monthlyHours: number;
  dailyAverageHours: number;
} | null => {
  const serviceHours = {
    1: { weeklyHours: 84, monthlyHours: 336 }, // 주 84시간 (하루 12시간)
    2: { weeklyHours: 70, monthlyHours: 280 }, // 주 70시간 (하루 10시간)
    3: { weeklyHours: 56, monthlyHours: 224 }, // 주 56시간 (하루 8시간)
    4: { weeklyHours: 42, monthlyHours: 168 }, // 주 42시간 (하루 6시간)
    5: { weeklyHours: 28, monthlyHours: 112 }, // 주 28시간 (하루 4시간)
    6: { weeklyHours: 14, monthlyHours: 56 }   // 주 14시간 (하루 2시간)
  };
  
  const gradeHours = serviceHours[grade as keyof typeof serviceHours];
  if (!gradeHours) return null;
  
  return {
    ...gradeHours,
    dailyAverageHours: Math.round((gradeHours.weeklyHours / 7) * 10) / 10
  };
};

/**
 * 장기요양등급 업그레이드 가능성 평가
 * @param currentGrade - 현재 등급
 * @param healthCondition - 건강 상태 점수 (1-10)
 * @param functionalAbility - 기능 능력 점수 (1-10)
 * @returns 업그레이드 가능성 및 권장사항
 */
export const assessLtciGradeUpgradePossibility = (
  currentGrade: number,
  healthCondition: number,
  functionalAbility: number
): {
  upgradePossible: boolean;
  recommendedGrade: number | null;
  reasoning: string;
  nextSteps: string[];
} => {
  const averageScore = (healthCondition + functionalAbility) / 2;
  
  // 점수가 높을수록 등급이 낮아져야 함 (1등급이 가장 중증)
  let recommendedGrade = currentGrade;
  let upgradePossible = false;
  let reasoning = '';
  const nextSteps: string[] = [];
  
  if (averageScore >= 8) {
    // 매우 양호한 상태
    if (currentGrade > 4) {
      recommendedGrade = Math.max(1, currentGrade - 2);
      upgradePossible = true;
      reasoning = '건강 상태와 기능 능력이 크게 개선되어 등급 상향 조정이 가능합니다.';
    } else {
      reasoning = '현재 상태가 양호하여 등급 유지가 적절합니다.';
    }
  } else if (averageScore >= 6) {
    // 개선된 상태
    if (currentGrade > 3) {
      recommendedGrade = Math.max(1, currentGrade - 1);
      upgradePossible = true;
      reasoning = '건강 상태가 개선되어 등급 상향 조정을 고려해볼 수 있습니다.';
    } else {
      reasoning = '현재 등급이 적절합니다.';
    }
  } else if (averageScore <= 3) {
    // 악화된 상태
    if (currentGrade < 6) {
      recommendedGrade = Math.min(6, currentGrade + 1);
      reasoning = '건강 상태가 악화되어 등급 하향 조정이 필요할 수 있습니다.';
    } else {
      reasoning = '현재 등급을 유지하되 추가 지원이 필요합니다.';
    }
  } else {
    reasoning = '현재 상태에서는 등급 변경이 필요하지 않습니다.';
  }
  
  // 다음 단계 권장사항
  if (upgradePossible) {
    nextSteps.push('전문의와 등급 재평가 상담 예약');
    nextSteps.push('국민건강보험공단에 등급 재신청 문의');
    nextSteps.push('현재 이용 중인 서비스 조정 계획 수립');
  } else {
    nextSteps.push('현재 케어 서비스 만족도 점검');
    nextSteps.push('정기적인 건강 상태 모니터링');
    nextSteps.push('필요시 추가 서비스 이용 방안 검토');
  }
  
  return {
    upgradePossible,
    recommendedGrade: upgradePossible ? recommendedGrade : null,
    reasoning,
    nextSteps
  };
};

/**
 * 장기요양등급별 적합한 요양시설 유형 추천
 * @param grade - 장기요양등급 (1-6)
 * @param preferences - 선호사항 (거주 형태, 위치 등)
 * @returns 추천 시설 유형 목록
 */
export const getRecommendedFacilityTypes = (
  grade: number,
  preferences?: {
    residenceType?: 'home' | 'facility' | 'mixed';
    location?: 'urban' | 'suburban' | 'rural';
    budget?: 'low' | 'medium' | 'high';
  }
): Array<{
  facilityType: string;
  suitabilityScore: number;
  description: string;
  pros: string[];
  cons: string[];
}> => {
  const recommendations = [];
  
  // 등급별 기본 추천
  if (grade <= 2) {
    // 중증 등급
    recommendations.push({
      facilityType: '요양병원',
      suitabilityScore: 9,
      description: '의료진 상주, 24시간 전문 케어',
      pros: ['전문 의료진', '응급상황 대응', '집중 케어'],
      cons: ['높은 비용', '개인공간 제한', '가족 접근성']
    });
    
    recommendations.push({
      facilityType: '전문요양시설',
      suitabilityScore: 8,
      description: '중증 환자 전문 케어 시설',
      pros: ['전문 케어', '체계적 관리', '의료 연계'],
      cons: ['비용 부담', '대기 시간', '환경 적응']
    });
  }
  
  if (grade >= 3 && grade <= 4) {
    // 중등도 등급
    recommendations.push({
      facilityType: '주간보호센터',
      suitabilityScore: 9,
      description: '낮 시간 케어, 저녁에는 가정으로',
      pros: ['가정 생활 유지', '사회적 교류', '상대적 저비용'],
      cons: ['제한된 서비스 시간', '교통편 필요', '야간 케어 부재']
    });
    
    recommendations.push({
      facilityType: '방문요양',
      suitabilityScore: 8,
      description: '요양보호사가 가정 방문 서비스',
      pros: ['익숙한 환경', '맞춤형 케어', '가족 참여'],
      cons: ['제한적 서비스', '응급상황 대응 한계', '케어 일관성']
    });
  }
  
  if (grade >= 5) {
    // 경증/인지지원 등급
    recommendations.push({
      facilityType: '인지지원센터',
      suitabilityScore: 10,
      description: '인지 기능 향상 프로그램 중심',
      pros: ['인지 훈련', '사회 활동', '예방 효과'],
      cons: ['제한적 의료 서비스', '교통편 필요', '프로그램 선택권']
    });
    
    recommendations.push({
      facilityType: '경로당/복지관',
      suitabilityScore: 7,
      description: '지역 사회 기반 활동 프로그램',
      pros: ['지역 커뮤니티', '저비용', '접근성'],
      cons: ['전문성 부족', '개별 케어 한계', '시설 편차']
    });
  }
  
  // 선호도에 따른 점수 조정
  if (preferences) {
    recommendations.forEach(rec => {
      // 거주 형태 선호도
      if (preferences.residenceType === 'home' && 
          (rec.facilityType === '방문요양' || rec.facilityType === '주간보호센터')) {
        rec.suitabilityScore += 1;
      }
      
      // 예산 고려
      if (preferences.budget === 'low' && 
          (rec.facilityType === '경로당/복지관' || rec.facilityType === '주간보호센터')) {
        rec.suitabilityScore += 1;
      }
    });
  }
  
  return recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
};