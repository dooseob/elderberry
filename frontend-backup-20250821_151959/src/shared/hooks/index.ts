/**
 * 공통 훅 통합 내보내기
 */

// 비동기 관련
export { useAsync } from './useAsync';
export { useDebounce, useDebouncedCallback } from './useDebounce';

// 스토리지 관련
export { useLocalStorage } from './useLocalStorage';

// 기존 훅들 재내보내기 (호환성 유지)
export { useTheme } from '../../hooks/useTheme';
export { useToast } from '../../hooks/useToast';
export { useFocusTrap } from '../../hooks/useFocusTrap';
export { useTypeSafeApi } from '../../hooks/useTypeSafeApi';

// UI 관련 훅 추가 예정
// export { useToggle } from './useToggle';
// export { useClickOutside } from './useClickOutside';
// export { useKeyboard } from './useKeyboard';
// export { useMediaQuery } from './useMediaQuery';
// export { useIntersectionObserver } from './useIntersectionObserver';