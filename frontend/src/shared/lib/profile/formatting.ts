/**
 * 프로필 포맷팅 및 마스킹 유틸리티 모듈
 * 전화번호, 건강보험번호, 여권번호, 신용카드 번호 마스킹 및 날짜 형식 변환
 */

import {
  ProfileResponse,
  ProfileType,
  isDomesticProfileResponse,
  isOverseasProfileResponse
} from '../../../types/profile';
import { calculateAge } from './validation';

// ===== 마스킹 함수들 =====

/**
 * 전화번호 마스킹 함수
 * @param phoneNumber - 전화번호
 * @returns 마스킹된 전화번호
 */
export const maskPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber || phoneNumber.length < 8) {
    return phoneNumber;
  }
  
  return phoneNumber.substring(0, 3) + '-****-' + phoneNumber.substring(phoneNumber.length - 4);
};

/**
 * 건강보험번호 마스킹 함수
 * @param insuranceNumber - 건강보험번호
 * @returns 마스킹된 건강보험번호
 */
export const maskHealthInsuranceNumber = (insuranceNumber: string): string => {
  if (!insuranceNumber || insuranceNumber.length < 8) {
    return insuranceNumber;
  }
  
  return insuranceNumber.substring(0, 6) + '****' + insuranceNumber.substring(insuranceNumber.length - 3);
};

/**
 * 여권번호 마스킹 함수
 * @param passportNumber - 여권번호
 * @returns 마스킹된 여권번호
 */
export const maskPassportNumber = (passportNumber: string): string => {
  if (!passportNumber || passportNumber.length < 4) {
    return passportNumber;
  }
  
  return passportNumber.substring(0, 2) + '****' + passportNumber.substring(passportNumber.length - 2);
};

/**
 * 신용카드 번호 마스킹
 * @param cardNumber - 신용카드 번호
 * @returns 마스킹된 신용카드 번호
 */
export const maskCreditCardNumber = (cardNumber: string): string => {
  if (!cardNumber || cardNumber.length < 8) {
    return cardNumber;
  }
  
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 8) return cardNumber;
  
  return cleaned.substring(0, 4) + '-****-****-' + cleaned.substring(cleaned.length - 4);
};

/**
 * 주민등록번호 마스킹
 * @param residentNumber - 주민등록번호
 * @returns 마스킹된 주민등록번호
 */
export const maskResidentNumber = (residentNumber: string): string => {
  if (!residentNumber || residentNumber.length < 8) {
    return residentNumber;
  }
  
  const cleaned = residentNumber.replace(/-/g, '');
  if (cleaned.length !== 13) return residentNumber;
  
  return cleaned.substring(0, 6) + '-*******';
};

/**
 * 이메일 마스킹
 * @param email - 이메일 주소
 * @returns 마스킹된 이메일 주소
 */
export const maskEmail = (email: string): string => {
  if (!email || email.indexOf('@') === -1) {
    return email;
  }
  
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return email;
  }
  
  const maskedLocal = localPart.substring(0, 2) + '****' + localPart.substring(localPart.length - 1);
  return `${maskedLocal}@${domain}`;
};

// ===== 날짜 형식 변환 함수 =====

/**
 * 날짜 포맷팅 함수
 * @param dateString - 날짜 문자열
 * @param format - 포맷 타입 ('short' | 'long')
 * @returns 포맷된 날짜 문자열
 */
export const formatDate = (dateString: string, format: 'short' | 'long' = 'short'): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (format === 'short') {
    return date.toLocaleDateString('ko-KR');
  } else {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  }
};

/**
 * 날짜시간 포맷팅 함수
 * @param dateTimeString - 날짜시간 문자열
 * @returns 포맷된 날짜시간 문자열
 */
export const formatDateTime = (dateTimeString: string): string => {
  if (!dateTimeString) return '';
  
  const date = new Date(dateTimeString);
  return date.toLocaleString('ko-KR');
};

// ===== 연령대 분류 함수 =====

/**
 * 나이를 기반으로 연령대를 분류합니다.
 * @param age - 나이
 * @returns 연령대 분류 결과
 */
export const getAgeGroup = (age: number | null): string => {
  if (age === null || age < 0) return '미상';
  
  if (age < 50) return '50세 미만';
  if (age < 60) return '50-59세';
  if (age < 70) return '60-69세';
  if (age < 80) return '70-79세';
  if (age < 90) return '80-89세';
  return '90세 이상';
};

/**
 * 생년월일로부터 연령대를 분류합니다.
 * @param birthDate - 생년월일 (YYYY-MM-DD 형식)
 * @returns 연령대 분류 결과
 */
export const getAgeGroupFromBirthDate = (birthDate: string): string => {
  const age = calculateAge(birthDate);
  return getAgeGroup(age);
};

// ===== 상태 표시 함수 =====

/**
 * 완성도 퍼센티지에 따른 색상 반환
 * @param percentage - 완성도 퍼센티지
 * @returns Tailwind CSS 클래스명
 */
export const getCompletionStatusColor = (percentage: number): string => {
  if (percentage >= 90) return 'text-green-600';
  if (percentage >= 70) return 'text-blue-600';
  if (percentage >= 50) return 'text-yellow-600';
  return 'text-red-600';
};

/**
 * 완성도 퍼센티지에 따른 텍스트 반환
 * @param percentage - 완성도 퍼센티지
 * @returns 상태 텍스트
 */
export const getCompletionStatusText = (percentage: number): string => {
  if (percentage >= 90) return '우수';
  if (percentage >= 70) return '양호';
  if (percentage >= 50) return '보통';
  return '미흡';
};

// ===== 프로필 요약 정보 생성 =====

/**
 * 프로필 요약 정보를 생성합니다.
 * @param profile - 프로필 응답 데이터
 * @returns 프로필 요약 문자열
 */
export const generateProfileSummary = (profile: ProfileResponse): string => {
  const age = profile.birthDate ? calculateAge(profile.birthDate) : null;
  
  let summary = `프로필 타입: ${isDomesticProfileResponse(profile) ? '국내' : '해외'}\n`;
  
  if (age) {
    summary += `나이: ${age}세\n`;
  }
  
  if (profile.gender) {
    summary += `성별: ${profile.gender}\n`;
  }
  
  if (isDomesticProfileResponse(profile)) {
    if (profile.address) {
      summary += `주소: ${profile.address}\n`;
    }
    if (profile.ltciGrade) {
      // Note: getLtciGradeText는 ltci-utils.ts에서 가져와야 합니다
      summary += `장기요양등급: ${profile.ltciGrade}등급\n`;
    }
    if (profile.preferredRegion) {
      summary += `선호지역: ${profile.preferredRegion}\n`;
    }
  } else if (isOverseasProfileResponse(profile)) {
    summary += `거주 국가: ${profile.residenceCountry}`;
    if (profile.residenceCity) {
      summary += ` (${profile.residenceCity})`;
    }
    summary += '\n';
    
    if (profile.preferredRegionInKorea) {
      summary += `한국 내 선호지역: ${profile.preferredRegionInKorea}\n`;
    }
    
    summary += `코디네이터 필요: ${profile.coordinatorRequired ? '예' : '아니오'}\n`;
  }
  
  summary += `완성도: ${profile.profileCompletionPercentage}%`;
  
  return summary;
};

// ===== 프로필 타입 확인 함수 =====

/**
 * 프로필 응답에서 프로필 타입을 확인합니다.
 * @param profile - 프로필 응답 데이터
 * @returns 프로필 타입
 */
export const getProfileTypeFromResponse = (profile: ProfileResponse): ProfileType => {
  return isDomesticProfileResponse(profile) ? ProfileType.DOMESTIC : ProfileType.OVERSEAS;
};

// ===== 지역 데이터 및 국가 데이터 상수 =====

/**
 * 한국 행정구역 데이터
 */
export const KOREA_REGIONS = {
  서울특별시: {
    code: 'SEOUL',
    districts: ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구']
  },
  부산광역시: {
    code: 'BUSAN',
    districts: ['강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구']
  },
  대구광역시: {
    code: 'DAEGU',
    districts: ['남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구']
  },
  인천광역시: {
    code: 'INCHEON',
    districts: ['강화군', '계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '옹진군', '중구']
  },
  광주광역시: {
    code: 'GWANGJU',
    districts: ['광산구', '남구', '동구', '북구', '서구']
  },
  대전광역시: {
    code: 'DAEJEON',
    districts: ['대덕구', '동구', '서구', '유성구', '중구']
  },
  울산광역시: {
    code: 'ULSAN',
    districts: ['남구', '동구', '북구', '울주군', '중구']
  },
  세종특별자치시: {
    code: 'SEJONG',
    districts: ['세종시']
  },
  경기도: {
    code: 'GYEONGGI',
    districts: ['가평군', '고양시', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시', '남양주시', '동두천시', '부천시', '성남시', '수원시', '시흥시', '안산시', '안성시', '안양시', '양주시', '양평군', '여주시', '연천군', '오산시', '용인시', '의왕시', '의정부시', '이천시', '파주시', '평택시', '포천시', '하남시', '화성시']
  },
  강원도: {
    code: 'GANGWON',
    districts: ['강릉시', '고성군', '동해시', '삼척시', '속초시', '양구군', '양양군', '영월군', '원주시', '인제군', '정선군', '철원군', '춘천시', '태백시', '평창군', '홍천군', '화천군', '횡성군']
  }
} as const;

/**
 * 주요 국가 데이터
 */
export const COUNTRIES = {
  미국: { code: 'US', continent: '북미', timeZone: 'UTC-5~UTC-10', currency: 'USD' },
  중국: { code: 'CN', continent: '아시아', timeZone: 'UTC+8', currency: 'CNY' },
  일본: { code: 'JP', continent: '아시아', timeZone: 'UTC+9', currency: 'JPY' },
  캐나다: { code: 'CA', continent: '북미', timeZone: 'UTC-3.5~UTC-8', currency: 'CAD' },
  호주: { code: 'AU', continent: '오세아니아', timeZone: 'UTC+8~UTC+11', currency: 'AUD' },
  독일: { code: 'DE', continent: '유럽', timeZone: 'UTC+1', currency: 'EUR' },
  영국: { code: 'GB', continent: '유럽', timeZone: 'UTC+0', currency: 'GBP' },
  프랑스: { code: 'FR', continent: '유럽', timeZone: 'UTC+1', currency: 'EUR' },
  러시아: { code: 'RU', continent: '유럽/아시아', timeZone: 'UTC+2~UTC+12', currency: 'RUB' },
  브라질: { code: 'BR', continent: '남미', timeZone: 'UTC-2~UTC-5', currency: 'BRL' }
} as const;

/**
 * 국가별 시간대 정보 조회
 * @param countryName - 국가명
 * @returns 시간대 정보
 */
export const getCountryTimeZone = (countryName: string): string => {
  const country = COUNTRIES[countryName as keyof typeof COUNTRIES];
  return country ? country.timeZone : 'UTC+0';
};

/**
 * 지역별 세부 구역 조회
 * @param regionName - 지역명
 * @returns 세부 구역 배열
 */
export const getRegionDistricts = (regionName: string): string[] => {
  const region = KOREA_REGIONS[regionName as keyof typeof KOREA_REGIONS];
  return region ? [...region.districts] : [];
};