/**
 * 포커스 트랩 훅
 * 모달, 드롭다운 등에서 키보드 포커스를 내부에 가둬두는 기능
 */
import { useEffect, useRef } from 'react';

interface UseFocusTrapOptions {
  isActive: boolean;
  initialFocus?: string; // CSS 선택자
  returnFocus?: boolean;
}

export function useFocusTrap({
  isActive,
  initialFocus,
  returnFocus = true,
}: UseFocusTrapOptions) {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    // 현재 활성 요소 저장
    previousActiveElement.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    if (!container) return;

    // 포커스 가능한 요소들 선택자
    const focusableElementsSelector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    const getFocusableElements = (): HTMLElement[] => {
      return Array.from(container.querySelectorAll(focusableElementsSelector))
        .filter((element) => {
          // 숨겨진 요소 제외
          const style = window.getComputedStyle(element);
          return style.display !== 'none' && style.visibility !== 'hidden';
        }) as HTMLElement[];
    };

    // 초기 포커스 설정
    const setInitialFocus = () => {
      if (initialFocus) {
        const initialElement = container.querySelector(initialFocus) as HTMLElement;
        if (initialElement) {
          initialElement.focus();
          return;
        }
      }

      // 첫 번째 포커스 가능한 요소에 포커스
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    };

    // Tab 키 처리
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const currentElement = document.activeElement as HTMLElement;

      if (event.shiftKey) {
        // Shift + Tab (역방향)
        if (currentElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab (정방향)
        if (currentElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    // 초기 포커스 설정 (약간의 지연으로 DOM 업데이트 보장)
    const timeoutId = setTimeout(setInitialFocus, 0);

    // 이벤트 리스너 등록
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('keydown', handleKeyDown);

      // 이전 포커스 복원
      if (returnFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive, initialFocus, returnFocus]);

  return containerRef;
}

/**
 * 스킵 링크를 위한 훅
 * 키보드 사용자가 반복적인 네비게이션을 건너뛸 수 있도록 함
 */
export function useSkipLink() {
  const skipToContent = () => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView();
    }
  };

  return { skipToContent };
}

/**
 * 로빙 탭 인덱스 관리 훅
 * 복잡한 위젯에서 하나의 요소만 탭 인덱스를 가지도록 관리
 */
export function useRovingTabIndex(
  items: React.RefObject<HTMLElement>[],
  activeIndex: number,
  setActiveIndex: (index: number) => void
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
        return;
      }

      event.preventDefault();

      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          setActiveIndex(activeIndex > 0 ? activeIndex - 1 : items.length - 1);
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          setActiveIndex(activeIndex < items.length - 1 ? activeIndex + 1 : 0);
          break;
        case 'Home':
          setActiveIndex(0);
          break;
        case 'End':
          setActiveIndex(items.length - 1);
          break;
      }
    };

    const currentItem = items[activeIndex]?.current;
    if (currentItem) {
      currentItem.addEventListener('keydown', handleKeyDown);
      currentItem.focus();

      return () => {
        currentItem.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [activeIndex, items, setActiveIndex]);

  // 각 아이템의 tabIndex 설정
  return items.map((_, index) => ({
    tabIndex: index === activeIndex ? 0 : -1,
  }));
}