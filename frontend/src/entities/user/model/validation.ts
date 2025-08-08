/**
 * User 엔티티 Zod 유효성 검증 스키마
 * 백엔드 MemberUpdateRequest 검증 규칙과 일치
 */
import { z } from 'zod';

// 전화번호 정규식 (010-1234-5678, 010.1234.5678, 01012345678 형식 허용)
const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;

// 언어 코드 (ISO 639-1, 2자리 또는 지역 포함 형식)
const languageRegex = /^[a-z]{2}(-[A-Z]{2})?$/;

// 프로필 수정 스키마
export const profileEditSchema = z.object({
  name: z
    .string()
    .min(1, '이름을 입력해주세요')
    .max(50, '이름은 50자 이하여야 합니다')
    .regex(/^[가-힣a-zA-Z\s]+$/, '이름에는 한글, 영문, 공백만 사용할 수 있습니다'),
    
  phoneNumber: z
    .string()
    .optional()
    .refine(
      (value) => !value || phoneRegex.test(value),
      '올바른 전화번호 형식을 입력해주세요 (예: 010-1234-5678)'
    )
    .refine(
      (value) => !value || value.length <= 20,
      '전화번호는 20자 이하여야 합니다'
    ),
    
  language: z
    .string()
    .optional()
    .refine(
      (value) => !value || languageRegex.test(value),
      '올바른 언어 코드를 입력해주세요 (예: ko, en, ko-KR)'
    )
    .refine(
      (value) => !value || value.length <= 10,
      '언어 코드는 10자 이하여야 합니다'
    ),
    
  region: z
    .string()
    .optional()
    .refine(
      (value) => !value || value.length <= 100,
      '지역은 100자 이하여야 합니다'
    )
    .refine(
      (value) => !value || value.trim().length > 0,
      '지역을 입력해주세요'
    ),
});

// 필수 필드만 포함하는 스키마 (이름만 필수)
export const profileEditRequiredSchema = profileEditSchema.extend({
  name: z
    .string()
    .min(1, '이름을 입력해주세요')
    .max(50, '이름은 50자 이하여야 합니다'),
});

// 개별 필드 검증용 스키마들
export const nameSchema = z
  .string()
  .min(1, '이름을 입력해주세요')
  .max(50, '이름은 50자 이하여야 합니다')
  .regex(/^[가-힣a-zA-Z\s]+$/, '이름에는 한글, 영문, 공백만 사용할 수 있습니다');

export const phoneNumberSchema = z
  .string()
  .optional()
  .refine(
    (value) => !value || phoneRegex.test(value),
    '올바른 전화번호 형식을 입력해주세요 (예: 010-1234-5678)'
  );

export const languageSchema = z
  .string()
  .optional()
  .refine(
    (value) => !value || languageRegex.test(value),
    '올바른 언어 코드를 입력해주세요 (예: ko, en)'
  );

export const regionSchema = z
  .string()
  .optional()
  .refine(
    (value) => !value || value.length <= 100,
    '지역은 100자 이하여야 합니다'
  );

// 타입 추론
export type ProfileEditFormData = z.infer<typeof profileEditSchema>;
export type ProfileEditRequiredData = z.infer<typeof profileEditRequiredSchema>;

// 유효성 검증 헬퍼 함수들
export const validateName = (name: string) => {
  try {
    nameSchema.parse(name);
    return { success: true, error: null };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.errors?.[0]?.message || '이름이 유효하지 않습니다' 
    };
  }
};

export const validatePhoneNumber = (phoneNumber: string) => {
  try {
    phoneNumberSchema.parse(phoneNumber);
    return { success: true, error: null };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.errors?.[0]?.message || '전화번호가 유효하지 않습니다' 
    };
  }
};

export const validateLanguage = (language: string) => {
  try {
    languageSchema.parse(language);
    return { success: true, error: null };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.errors?.[0]?.message || '언어 코드가 유효하지 않습니다' 
    };
  }
};

export const validateRegion = (region: string) => {
  try {
    regionSchema.parse(region);
    return { success: true, error: null };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.errors?.[0]?.message || '지역이 유효하지 않습니다' 
    };
  }
};

// 전체 폼 검증
export const validateProfileEditForm = (data: any) => {
  try {
    const result = profileEditSchema.parse(data);
    return { 
      success: true, 
      data: result,
      errors: null 
    };
  } catch (error: any) {
    const errors: Record<string, string> = {};
    
    if (error.errors) {
      error.errors.forEach((err: any) => {
        if (err.path && err.path.length > 0) {
          errors[err.path[0]] = err.message;
        }
      });
    }
    
    return { 
      success: false, 
      data: null,
      errors 
    };
  }
};

// 필수 필드만 검증
export const validateRequiredFields = (data: any) => {
  try {
    const result = profileEditRequiredSchema.parse(data);
    return { 
      success: true, 
      data: result,
      errors: null 
    };
  } catch (error: any) {
    const errors: Record<string, string> = {};
    
    if (error.errors) {
      error.errors.forEach((err: any) => {
        if (err.path && err.path.length > 0) {
          errors[err.path[0]] = err.message;
        }
      });
    }
    
    return { 
      success: false, 
      data: null,
      errors 
    };
  }
};

// 폼 데이터 정리 (빈 문자열을 undefined로 변환)
export const cleanFormData = (data: any): ProfileEditFormData => {
  return {
    name: data.name?.trim() || '',
    phoneNumber: data.phoneNumber?.trim() || undefined,
    language: data.language?.trim() || undefined,
    region: data.region?.trim() || undefined,
  };
};

// 지원되는 언어 목록
export const supportedLanguages = [
  { code: 'ko', name: '한국어', nativeName: '한국어' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'my', name: 'Myanmar', nativeName: 'မြန်မာ' },
  { code: 'kh', name: 'Khmer', nativeName: 'ខ្មែរ' },
  { code: 'lo', name: 'Lao', nativeName: 'ລາວ' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
] as const;

// 지역 목록 (대한민국 기준)
export const supportedRegions = [
  '서울특별시',
  '부산광역시',
  '대구광역시',
  '인천광역시',
  '광주광역시',
  '대전광역시',
  '울산광역시',
  '세종특별자치시',
  '경기도',
  '강원도',
  '충청북도',
  '충청남도',
  '전라북도',
  '전라남도',
  '경상북도',
  '경상남도',
  '제주특별자치도',
  '기타',
] as const;