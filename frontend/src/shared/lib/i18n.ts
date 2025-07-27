/**
 * 국제화(i18n) 시스템
 * 다국어 지원을 위한 번역 시스템
 */
import React, { createContext, useContext, useState, useEffect } from 'react';

// 지원 언어 타입
export type SupportedLanguage = 'ko' | 'en' | 'ja' | 'zh';

// 번역 키 타입 (타입 안전성 제공)
export interface TranslationKeys {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    confirm: string;
    yes: string;
    no: string;
  };
  auth: {
    login: string;
    logout: string;
    register: string;
    email: string;
    password: string;
    confirmPassword: string;
    rememberMe: string;
    forgotPassword: string;
    loginFailed: string;
    registerSuccess: string;
  };
  navigation: {
    dashboard: string;
    facilities: string;
    health: string;
    profile: string;
    settings: string;
  };
  facility: {
    search: string;
    name: string;
    type: string;
    location: string;
    rating: string;
    contact: string;
    details: string;
    recommend: string;
  };
  health: {
    assessment: string;
    grade: string;
    mobility: string;
    cognitive: string;
    selfCare: string;
    communication: string;
  };
  validation: {
    required: string;
    email: string;
    minLength: string;
    maxLength: string;
    pattern: string;
  };
  errors: {
    generic: string;
    network: string;
    unauthorized: string;
    forbidden: string;
    notFound: string;
    serverError: string;
  };
}

// 기본 번역 데이터
const translations: Record<SupportedLanguage, TranslationKeys> = {
  ko: {
    common: {
      save: '저장',
      cancel: '취소',
      delete: '삭제',
      edit: '수정',
      add: '추가',
      search: '검색',
      loading: '로딩 중...',
      error: '오류',
      success: '성공',
      warning: '경고',
      info: '정보',
      confirm: '확인',
      yes: '예',
      no: '아니오',
    },
    auth: {
      login: '로그인',
      logout: '로그아웃',
      register: '회원가입',
      email: '이메일',
      password: '비밀번호',
      confirmPassword: '비밀번호 확인',
      rememberMe: '로그인 상태 유지',
      forgotPassword: '비밀번호를 잊으셨나요?',
      loginFailed: '로그인에 실패했습니다.',
      registerSuccess: '회원가입이 완료되었습니다.',
    },
    navigation: {
      dashboard: '대시보드',
      facilities: '시설 찾기',
      health: '건강 평가',
      profile: '프로필',
      settings: '설정',
    },
    facility: {
      search: '시설 검색',
      name: '시설명',
      type: '시설 유형',
      location: '위치',
      rating: '평점',
      contact: '연락처',
      details: '상세 정보',
      recommend: '추천',
    },
    health: {
      assessment: '건강 평가',
      grade: '등급',
      mobility: '이동 능력',
      cognitive: '인지 능력',
      selfCare: '자기 관리',
      communication: '의사소통',
    },
    validation: {
      required: '필수 항목입니다.',
      email: '올바른 이메일 형식이 아닙니다.',
      minLength: '최소 {min}자 이상 입력해주세요.',
      maxLength: '최대 {max}자까지 입력 가능합니다.',
      pattern: '올바른 형식이 아닙니다.',
    },
    errors: {
      generic: '오류가 발생했습니다.',
      network: '네트워크 연결을 확인해주세요.',
      unauthorized: '로그인이 필요합니다.',
      forbidden: '접근 권한이 없습니다.',
      notFound: '요청한 페이지를 찾을 수 없습니다.',
      serverError: '서버 오류가 발생했습니다.',
    },
  },
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Info',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
    },
    auth: {
      login: 'Login',
      logout: 'Logout',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      rememberMe: 'Remember Me',
      forgotPassword: 'Forgot Password?',
      loginFailed: 'Login failed.',
      registerSuccess: 'Registration completed successfully.',
    },
    navigation: {
      dashboard: 'Dashboard',
      facilities: 'Find Facilities',
      health: 'Health Assessment',
      profile: 'Profile',
      settings: 'Settings',
    },
    facility: {
      search: 'Search Facilities',
      name: 'Facility Name',
      type: 'Facility Type',
      location: 'Location',
      rating: 'Rating',
      contact: 'Contact',
      details: 'Details',
      recommend: 'Recommend',
    },
    health: {
      assessment: 'Health Assessment',
      grade: 'Grade',
      mobility: 'Mobility',
      cognitive: 'Cognitive',
      selfCare: 'Self Care',
      communication: 'Communication',
    },
    validation: {
      required: 'This field is required.',
      email: 'Please enter a valid email address.',
      minLength: 'Please enter at least {min} characters.',
      maxLength: 'Please enter no more than {max} characters.',
      pattern: 'Please enter a valid format.',
    },
    errors: {
      generic: 'An error occurred.',
      network: 'Please check your network connection.',
      unauthorized: 'Login required.',
      forbidden: 'Access denied.',
      notFound: 'Page not found.',
      serverError: 'Server error occurred.',
    },
  },
  ja: {
    common: {
      save: '保存',
      cancel: 'キャンセル',
      delete: '削除',
      edit: '編集',
      add: '追加',
      search: '検索',
      loading: '読み込み中...',
      error: 'エラー',
      success: '成功',
      warning: '警告',
      info: '情報',
      confirm: '確認',
      yes: 'はい',
      no: 'いいえ',
    },
    auth: {
      login: 'ログイン',
      logout: 'ログアウト',
      register: '会員登録',
      email: 'メール',
      password: 'パスワード',
      confirmPassword: 'パスワード確認',
      rememberMe: 'ログイン状態を保持',
      forgotPassword: 'パスワードをお忘れですか？',
      loginFailed: 'ログインに失敗しました。',
      registerSuccess: '会員登録が完了しました。',
    },
    navigation: {
      dashboard: 'ダッシュボード',
      facilities: '施設検索',
      health: '健康評価',
      profile: 'プロフィール',
      settings: '設定',
    },
    facility: {
      search: '施設検索',
      name: '施設名',
      type: '施設タイプ',
      location: '所在地',
      rating: '評価',
      contact: '連絡先',
      details: '詳細情報',
      recommend: '推奨',
    },
    health: {
      assessment: '健康評価',
      grade: 'グレード',
      mobility: '移動能力',
      cognitive: '認知能力',
      selfCare: 'セルフケア',
      communication: 'コミュニケーション',
    },
    validation: {
      required: '必須項目です。',
      email: '正しいメール形式ではありません。',
      minLength: '最低{min}文字以上入力してください。',
      maxLength: '最大{max}文字まで入力可能です。',
      pattern: '正しい形式ではありません。',
    },
    errors: {
      generic: 'エラーが発生しました。',
      network: 'ネットワーク接続を確認してください。',
      unauthorized: 'ログインが必要です。',
      forbidden: 'アクセス権限がありません。',
      notFound: 'ページが見つかりません。',
      serverError: 'サーバーエラーが発生しました。',
    },
  },
  zh: {
    common: {
      save: '保存',
      cancel: '取消',
      delete: '删除',
      edit: '编辑',
      add: '添加',
      search: '搜索',
      loading: '加载中...',
      error: '错误',
      success: '成功',
      warning: '警告',
      info: '信息',
      confirm: '确认',
      yes: '是',
      no: '否',
    },
    auth: {
      login: '登录',
      logout: '登出',
      register: '注册',
      email: '邮箱',
      password: '密码',
      confirmPassword: '确认密码',
      rememberMe: '记住我',
      forgotPassword: '忘记密码？',
      loginFailed: '登录失败。',
      registerSuccess: '注册成功。',
    },
    navigation: {
      dashboard: '控制台',
      facilities: '查找设施',
      health: '健康评估',
      profile: '个人资料',
      settings: '设置',
    },
    facility: {
      search: '搜索设施',
      name: '设施名称',
      type: '设施类型',
      location: '位置',
      rating: '评分',
      contact: '联系方式',
      details: '详细信息',
      recommend: '推荐',
    },
    health: {
      assessment: '健康评估',
      grade: '等级',
      mobility: '行动能力',
      cognitive: '认知能力',
      selfCare: '自理能力',
      communication: '沟通能力',
    },
    validation: {
      required: '此字段为必填项。',
      email: '请输入有效的邮箱地址。',
      minLength: '请输入至少{min}个字符。',
      maxLength: '最多输入{max}个字符。',
      pattern: '请输入有效格式。',
    },
    errors: {
      generic: '发生错误。',
      network: '请检查网络连接。',
      unauthorized: '需要登录。',
      forbidden: '访问被拒绝。',
      notFound: '页面未找到。',
      serverError: '服务器错误。',
    },
  },
};

// i18n 컨텍스트
interface I18nContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  languages: SupportedLanguage[];
}

const I18nContext = createContext<I18nContextValue | null>(null);

// i18n 훅
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};

// i18n 프로바이더
interface I18nProviderProps {
  children: React.ReactNode;
  defaultLanguage?: SupportedLanguage;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  defaultLanguage = 'ko',
}) => {
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    try {
      const stored = localStorage.getItem('language') as SupportedLanguage;
      return stored && Object.keys(translations).includes(stored) ? stored : defaultLanguage;
    } catch {
      return defaultLanguage;
    }
  });

  // 언어 변경 시 localStorage에 저장
  useEffect(() => {
    try {
      localStorage.setItem('language', language);
      document.documentElement.lang = language;
    } catch (error) {
      console.warn('Failed to save language to localStorage:', error);
    }
  }, [language]);

  // 번역 함수
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    // 중첩된 키 접근
    for (const k of keys) {
      value = value?.[k];
    }

    // 번역이 없으면 키 반환
    if (typeof value !== 'string') {
      console.warn(`Translation key "${key}" not found for language "${language}"`);
      return key;
    }

    // 파라미터 치환
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }

    return value;
  };

  const value: I18nContextValue = {
    language,
    setLanguage,
    t,
    languages: Object.keys(translations) as SupportedLanguage[],
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

// 타입 안전한 번역 키 유틸리티
export const createTranslationKey = <T extends keyof TranslationKeys>(
  namespace: T
) => {
  return <K extends keyof TranslationKeys[T]>(key: K): string => {
    return `${namespace}.${String(key)}`;
  };
};

// 네임스페이스별 번역 키 헬퍼
export const translationKeys = {
  common: createTranslationKey('common'),
  auth: createTranslationKey('auth'),
  navigation: createTranslationKey('navigation'),
  facility: createTranslationKey('facility'),
  health: createTranslationKey('health'),
  validation: createTranslationKey('validation'),
  errors: createTranslationKey('errors'),
};

// 번역 로더 (동적 로딩용)
export const loadTranslations = async (
  language: SupportedLanguage
): Promise<TranslationKeys> => {
  try {
    // 실제 구현에서는 번들 분할된 번역 파일을 동적으로 로드
    const module = await import(`../locales/${language}.json`);
    return module.default;
  } catch {
    // 실패 시 기본 번역 반환
    return translations[language];
  }
};