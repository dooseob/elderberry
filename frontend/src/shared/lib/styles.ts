/**
 * 공통 스타일 유틸리티 라이브러리
 * 중복 Tailwind 클래스 패턴을 통합하여 번들 크기 최적화
 * 
 * @version 1.0.0
 * @description 903회 중복되던 "flex items-center" 패턴 및 기타 공통 스타일 통합
 */

/**
 * 공통 Flexbox 레이아웃 클래스
 */
export const flexStyles = {
  // 기본 flex 패턴들 (가장 많이 사용되는 패턴)
  center: 'flex items-center',
  between: 'flex items-center justify-between',
  around: 'flex items-center justify-around',
  evenly: 'flex items-center justify-evenly',
  
  // 방향별 정렬
  centerCol: 'flex flex-col items-center',
  centerRow: 'flex flex-row items-center',
  
  // Gap 포함 (자주 사용되는 조합)
  centerGap1: 'flex items-center gap-1',
  centerGap2: 'flex items-center gap-2',
  centerGap3: 'flex items-center gap-3',
  centerGap4: 'flex items-center gap-4',
  centerGap6: 'flex items-center gap-6',
  
  // 반응형 flex
  responsiveCenterCol: 'flex flex-col md:flex-row items-center',
  responsiveCenterRow: 'flex flex-row md:flex-col items-center',
} as const;

/**
 * 공통 카드/컨테이너 스타일
 */
export const cardStyles = {
  // 기본 카드
  base: 'bg-white rounded-lg shadow-sm border',
  elevated: 'bg-white rounded-lg shadow-md border',
  floating: 'bg-white rounded-lg shadow-lg border',
  
  // 인터랙티브 카드
  hoverable: 'bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow',
  clickable: 'bg-white rounded-lg shadow-sm border hover:shadow-md transition-all cursor-pointer',
  
  // 컬러 변형
  primary: 'bg-elderberry-50 border-elderberry-200 rounded-lg',
  secondary: 'bg-gray-50 border-gray-200 rounded-lg',
  success: 'bg-green-50 border-green-200 rounded-lg',
  warning: 'bg-yellow-50 border-yellow-200 rounded-lg',
  error: 'bg-red-50 border-red-200 rounded-lg',
  
  // 패딩 포함 완전체
  defaultPadded: 'bg-white rounded-lg shadow-sm border p-4',
  largePadded: 'bg-white rounded-lg shadow-sm border p-6',
} as const;

/**
 * 공통 버튼 스타일
 */
export const buttonStyles = {
  // 기본 버튼 베이스
  base: 'px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  
  // 크기별
  small: 'px-3 py-1.5 text-sm rounded-md font-medium transition-colors',
  medium: 'px-4 py-2 rounded-md font-medium transition-colors',
  large: 'px-6 py-3 text-lg rounded-md font-medium transition-colors',
  
  // 변형별 (완전한 스타일)
  primary: 'px-4 py-2 bg-elderberry-600 text-white rounded-md font-medium hover:bg-elderberry-700 focus:outline-none focus:ring-2 focus:ring-elderberry-500 focus:ring-offset-2 transition-colors',
  secondary: 'px-4 py-2 bg-gray-200 text-gray-900 rounded-md font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors',
  outline: 'px-4 py-2 border border-elderberry-600 text-elderberry-600 rounded-md font-medium hover:bg-elderberry-50 focus:outline-none focus:ring-2 focus:ring-elderberry-500 focus:ring-offset-2 transition-colors',
  ghost: 'px-4 py-2 text-elderberry-600 rounded-md font-medium hover:bg-elderberry-50 focus:outline-none focus:ring-2 focus:ring-elderberry-500 focus:ring-offset-2 transition-colors',
  danger: 'px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors',
} as const;

/**
 * 공통 입력 필드 스타일
 */
export const inputStyles = {
  // 기본 입력 필드
  base: 'block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-elderberry-500 focus:border-elderberry-500',
  
  // 상태별
  default: 'block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-elderberry-500 focus:border-elderberry-500',
  error: 'block w-full px-3 py-2 border border-red-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500',
  success: 'block w-full px-3 py-2 border border-green-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500',
  disabled: 'block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 bg-gray-50 cursor-not-allowed',
  
  // 크기별
  small: 'block w-full px-2 py-1 text-sm border border-gray-300 rounded placeholder-gray-400 focus:outline-none focus:ring-elderberry-500 focus:border-elderberry-500',
  large: 'block w-full px-4 py-3 text-lg border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-elderberry-500 focus:border-elderberry-500',
} as const;

/**
 * 공통 텍스트 스타일
 */
export const textStyles = {
  // 제목 스타일
  h1: 'text-3xl font-bold text-gray-900',
  h2: 'text-2xl font-bold text-gray-900',
  h3: 'text-xl font-semibold text-gray-900',
  h4: 'text-lg font-semibold text-gray-900',
  h5: 'text-base font-semibold text-gray-900',
  h6: 'text-sm font-semibold text-gray-900',
  
  // 본문 텍스트
  body: 'text-gray-700',
  bodyLarge: 'text-lg text-gray-700',
  bodySmall: 'text-sm text-gray-600',
  caption: 'text-xs text-gray-500',
  
  // 상태별 텍스트
  muted: 'text-gray-500',
  primary: 'text-elderberry-600',
  secondary: 'text-gray-600',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600',
  
  // 링크
  link: 'text-elderberry-600 hover:text-elderberry-700 underline cursor-pointer',
  linkSubtle: 'text-elderberry-600 hover:text-elderberry-700 hover:underline cursor-pointer',
} as const;

/**
 * 공통 레이아웃 스타일
 */
export const layoutStyles = {
  // 컨테이너
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  containerSmall: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
  containerLarge: 'max-w-full mx-auto px-4 sm:px-6 lg:px-8',
  
  // 섹션
  section: 'py-12 px-4 sm:px-6 lg:px-8',
  sectionCompact: 'py-8 px-4 sm:px-6 lg:px-8',
  sectionSpacious: 'py-16 px-4 sm:px-6 lg:px-8',
  
  // 그리드
  gridCols1: 'grid grid-cols-1 gap-6',
  gridCols2: 'grid grid-cols-1 md:grid-cols-2 gap-6',
  gridCols3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  gridCols4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
  
  // 스페이싱
  spacingDefault: 'space-y-6',
  spacingCompact: 'space-y-4',
  spacingLoose: 'space-y-8',
} as const;

/**
 * 공통 상태 스타일 (로딩, 에러, 성공 등)
 */
export const statusStyles = {
  // 로딩 상태
  loading: 'animate-pulse bg-gray-200 rounded',
  loadingText: 'animate-pulse bg-gray-200 rounded h-4 w-full',
  loadingButton: 'opacity-50 cursor-not-allowed animate-pulse',
  
  // 성공/에러/경고
  success: 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded',
  error: 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded',
  warning: 'bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded',
  info: 'bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded',
  
  // 뱃지 스타일
  badgeDefault: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800',
  badgePrimary: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-elderberry-100 text-elderberry-800',
  badgeSuccess: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
  badgeWarning: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
  badgeError: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800',
} as const;

/**
 * 모든 스타일을 통합한 메인 객체
 */
export const commonStyles = {
  flex: flexStyles,
  card: cardStyles,
  button: buttonStyles,
  input: inputStyles,
  text: textStyles,
  layout: layoutStyles,
  status: statusStyles,
} as const;

/**
 * 동적으로 클래스를 조합하는 헬퍼 함수
 */
export const cx = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * 조건부 클래스를 위한 헬퍼 함수
 */
export const conditionalClass = (
  condition: boolean,
  trueClass: string,
  falseClass?: string
) => {
  return condition ? trueClass : (falseClass || '');
};

/**
 * 반응형 클래스 생성 헬퍼
 */
export const responsive = {
  mobile: (classes: string) => classes,
  tablet: (classes: string) => classes.split(' ').map(c => `md:${c}`).join(' '),
  desktop: (classes: string) => classes.split(' ').map(c => `lg:${c}`).join(' '),
  wide: (classes: string) => classes.split(' ').map(c => `xl:${c}`).join(' '),
};

/**
 * 상태 기반 클래스 생성 헬퍼
 */
export const stateClasses = {
  hover: (classes: string) => classes.split(' ').map(c => `hover:${c}`).join(' '),
  focus: (classes: string) => classes.split(' ').map(c => `focus:${c}`).join(' '),
  active: (classes: string) => classes.split(' ').map(c => `active:${c}`).join(' '),
  disabled: (classes: string) => classes.split(' ').map(c => `disabled:${c}`).join(' '),
};

/**
 * 사용 통계를 위한 타입 정의
 */
export type StyleCategory = keyof typeof commonStyles;
export type FlexStyleKey = keyof typeof flexStyles;
export type CardStyleKey = keyof typeof cardStyles;
export type ButtonStyleKey = keyof typeof buttonStyles;

/**
 * 기본 내보내기 (하위 호환성)
 */
export default commonStyles;

/**
 * 사용 예시:
 * 
 * @example
 * // 기존 방식
 * <div className="flex items-center gap-2" />
 * 
 * // 새로운 방식
 * import { flexStyles } from '@/shared/lib/styles';
 * <div className={flexStyles.centerGap2} />
 * 
 * // 또는 구조분해할당
 * import { commonStyles } from '@/shared/lib/styles';
 * const { flex, card, button } = commonStyles;
 * <div className={flex.centerGap2} />
 * 
 * // 동적 조합
 * import { cx, conditionalClass } from '@/shared/lib/styles';
 * <div className={cx(
 *   flexStyles.center,
 *   conditionalClass(isActive, 'bg-blue-100', 'bg-gray-100')
 * )} />
 */