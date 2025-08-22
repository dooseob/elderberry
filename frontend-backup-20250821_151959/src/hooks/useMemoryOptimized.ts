/**
 * 메모리 최적화 커스텀 훅
 * 컴포넌트의 메모리 사용량을 최적화하고 누수를 방지
 */
import { useEffect, useRef, useCallback, useMemo, useState } from 'react';

interface UseMemoryOptimizedOptions {
  // cleanup 실행 여부
  autoCleanup?: boolean;
  // 메모리 사용량 모니터링 여부
  monitor?: boolean;
  // 디버그 모드
  debug?: boolean;
  // 컴포넌트 이름 (디버깅용)
  componentName?: string;
}

interface MemoryOptimizedAPI {
  // 정리해야 할 함수들을 등록
  addCleanupTask: (task: () => void) => void;
  // 메모리 사용량 체크
  checkMemoryUsage: () => void;
  // 강제 정리 실행
  forceCleanup: () => void;
}

export const useMemoryOptimized = (options: UseMemoryOptimizedOptions = {}): MemoryOptimizedAPI => {
  const {
    autoCleanup = true,
    monitor = false,
    debug = false,
    componentName = 'UnknownComponent'
  } = options;

  // 정리 작업들을 저장하는 ref
  const cleanupTasks = useRef<(() => void)[]>([]);
  
  // 타이머, 리스너 등을 추적하는 ref
  const resources = useRef<{
    timers: NodeJS.Timeout[];
    intervals: NodeJS.Timeout[];
    listeners: Array<{
      element: EventTarget;
      event: string;
      handler: EventListener;
      options?: boolean | AddEventListenerOptions;
    }>;
    observers: (MutationObserver | IntersectionObserver | ResizeObserver | PerformanceObserver)[];
  }>({
    timers: [],
    intervals: [],
    listeners: [],
    observers: []
  });

  // 메모리 사용량 모니터링
  const initialMemory = useRef<number>(0);
  
  useEffect(() => {
    if (monitor && (performance as any).memory) {
      initialMemory.current = (performance as any).memory.usedJSHeapSize;
      
      if (debug) {
        console.log(`[${componentName}] 초기 메모리 사용량:`, 
          (initialMemory.current / 1024 / 1024).toFixed(2), 'MB');
      }
    }
  }, [monitor, debug, componentName]);

  // 정리 작업 추가
  const addCleanupTask = useCallback((task: () => void) => {
    cleanupTasks.current.push(task);
  }, []);

  // setTimeout 래퍼 (자동 정리)
  const safeSetTimeout = useCallback((callback: () => void, delay: number) => {
    const timer = setTimeout(() => {
      callback();
      // 실행 후 타이머 목록에서 제거
      resources.current.timers = resources.current.timers.filter(t => t !== timer);
    }, delay);
    
    resources.current.timers.push(timer);
    return timer;
  }, []);

  // setInterval 래퍼 (자동 정리)
  const safeSetInterval = useCallback((callback: () => void, delay: number) => {
    const interval = setInterval(callback, delay);
    resources.current.intervals.push(interval);
    return interval;
  }, []);

  // addEventListener 래퍼 (자동 정리)
  const safeAddEventListener = useCallback(<K extends keyof WindowEventMap>(
    element: EventTarget,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ) => {
    element.addEventListener(event, handler, options);
    resources.current.listeners.push({ element, event, handler, options });
  }, []);

  // Observer 래퍼 (자동 정리)
  const addObserver = useCallback((observer: MutationObserver | IntersectionObserver | ResizeObserver | PerformanceObserver) => {
    resources.current.observers.push(observer);
  }, []);

  // 메모리 사용량 체크
  const checkMemoryUsage = useCallback(() => {
    if (!monitor || !(performance as any).memory) return;

    const currentMemory = (performance as any).memory.usedJSHeapSize;
    const memoryDiff = currentMemory - initialMemory.current;
    const memoryDiffMB = memoryDiff / 1024 / 1024;

    if (debug) {
      console.log(`[${componentName}] 메모리 증가량:`, memoryDiffMB.toFixed(2), 'MB');
      
      if (memoryDiffMB > 10) { // 10MB 이상 증가 시 경고
        console.warn(`[${componentName}] 메모리 사용량이 크게 증가했습니다. 메모리 누수를 확인하세요.`);
      }
    }

    return {
      initial: initialMemory.current,
      current: currentMemory,
      diff: memoryDiff,
      diffMB: memoryDiffMB
    };
  }, [monitor, debug, componentName]);

  // 강제 정리 실행
  const forceCleanup = useCallback(() => {
    // 타이머들 정리
    resources.current.timers.forEach(timer => clearTimeout(timer));
    resources.current.intervals.forEach(interval => clearInterval(interval));
    
    // 이벤트 리스너들 정리
    resources.current.listeners.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options);
    });
    
    // Observer들 정리
    resources.current.observers.forEach(observer => {
      observer.disconnect();
    });
    
    // 사용자 정의 정리 작업들 실행
    cleanupTasks.current.forEach(task => {
      try {
        task();
      } catch (error) {
        if (debug) {
          console.error(`[${componentName}] 정리 작업 중 오류:`, error);
        }
      }
    });

    // 모든 참조 초기화
    resources.current = {
      timers: [],
      intervals: [],
      listeners: [],
      observers: []
    };
    cleanupTasks.current = [];

    if (debug) {
      console.log(`[${componentName}] 메모리 정리 완료`);
    }
  }, [debug, componentName]);

  // 컴포넌트 언마운트 시 자동 정리
  useEffect(() => {
    if (!autoCleanup) return;

    return () => {
      forceCleanup();
      
      if (monitor && debug) {
        // 언마운트 시 최종 메모리 사용량 체크
        setTimeout(() => {
          checkMemoryUsage();
        }, 100);
      }
    };
  }, [autoCleanup, forceCleanup, monitor, debug, checkMemoryUsage]);

  // API 반환 (memoized)
  return useMemo(() => ({
    addCleanupTask,
    checkMemoryUsage,
    forceCleanup,
    // 래퍼 함수들도 제공
    safeSetTimeout,
    safeSetInterval,
    safeAddEventListener,
    addObserver
  }), [
    addCleanupTask,
    checkMemoryUsage,
    forceCleanup,
    safeSetTimeout,
    safeSetInterval,
    safeAddEventListener,
    addObserver
  ]);
};

/**
 * 대용량 리스트 최적화 훅
 * 가상화와 청크 렌더링을 통한 메모리 최적화
 */
export const useVirtualizedList = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  options: {
    overscan?: number; // 보이는 영역 외 추가로 렌더링할 아이템 수
    chunkSize?: number; // 한 번에 렌더링할 청크 크기
  } = {}
) => {
  const { overscan = 5, chunkSize = 50 } = options;
  
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);
  
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);
  
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);
  
  return {
    visibleItems,
    visibleRange,
    handleScroll,
    totalHeight: items.length * itemHeight,
    offsetY: visibleRange.startIndex * itemHeight
  };
};

export default useMemoryOptimized;