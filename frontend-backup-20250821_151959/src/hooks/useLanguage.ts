/**
 * 다국어 언어 상태 관리 Hook
 * 간단한 언어 전환 기능 제공
 * 
 * @version 1.0.0
 * @author MaxModeAgent
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SupportedLanguage = 'ko' | 'en' | 'zh';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'ko',
    name: '한국어',
    nativeName: '한국어',
    flag: '🇰🇷'
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  {
    code: 'zh',
    name: '中文',
    nativeName: '中文',
    flag: '🇨🇳'
  }
];

interface LanguageStore {
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  getCurrentLanguageOption: () => LanguageOption;
}

/**
 * 언어 상태 관리 스토어
 * localStorage에 언어 설정 저장
 */
export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      currentLanguage: 'ko',
      
      setLanguage: (language: SupportedLanguage) => {
        set({ currentLanguage: language });
        
        // HTML lang 속성 업데이트
        document.documentElement.lang = language;
        
        // 언어 변경 로그
        console.log(`🌐 언어가 ${language}로 변경되었습니다.`);
        
        // 언어 변경 이벤트 발생 (다른 컴포넌트에서 감지 가능)
        window.dispatchEvent(new CustomEvent('languageChanged', { 
          detail: { language } 
        }));
      },
      
      getCurrentLanguageOption: () => {
        const currentLang = get().currentLanguage;
        return SUPPORTED_LANGUAGES.find(lang => lang.code === currentLang) || SUPPORTED_LANGUAGES[0];
      }
    }),
    {
      name: 'elderberry-language',
      partialize: (state) => ({ currentLanguage: state.currentLanguage })
    }
  )
);

/**
 * 언어 Hook (편의 함수들 포함)
 */
export const useLanguage = () => {
  const { currentLanguage, setLanguage, getCurrentLanguageOption } = useLanguageStore();
  
  return {
    currentLanguage,
    setLanguage,
    getCurrentLanguageOption,
    
    // 편의 함수들
    isKorean: currentLanguage === 'ko',
    isEnglish: currentLanguage === 'en',
    isChinese: currentLanguage === 'zh',
    
    // 언어별 텍스트 반환 (간단한 번역 기능)
    t: (ko: string, en?: string, zh?: string) => {
      switch (currentLanguage) {
        case 'en': return en || ko;
        case 'zh': return zh || ko;
        default: return ko;
      }
    }
  };
};