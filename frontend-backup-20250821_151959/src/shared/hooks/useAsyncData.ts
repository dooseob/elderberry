/**
 * useAsyncData Hook
 * 비동기 데이터 페칭과 상태 관리를 위한 고성능 Hook
 * 
 * @version 3.0.0
 * @features
 * - 로딩, 에러, 성공 상태 통합 관리
 * - 자동 재시도 및 지수 백오프
 * - 요청 취소 및 중복 요청 방지
 * - 캐싱 및 stale-while-revalidate
 * - 옵티미스틱 업데이트 지원
 * - TypeScript 완전 지원
 * - React 18 호환
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

// === 타입 정의 ===

interface AsyncState<T> {
  /** 데이터 */
  data: T | null;
  /** 에러 정보 */
  error: Error | null;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 초기 로딩 상태 (첫 번째 요청) */
  isInitialLoading: boolean;
  /** 백그라운드 갱신 상태 */
  isRefreshing: boolean;
  /** 성공 상태 */
  isSuccess: boolean;
  /** 에러 상태 */
  isError: boolean;
  /** 데이터 존재 여부 */
  hasData: boolean;
  /** 마지막 업데이트 시간 */
  lastUpdated: number | null;
  /** 현재 재시도 횟수 */
  retryCount: number;
}

interface UseAsyncDataOptions<T> {
  /** 컴포넌트 마운트 시 즉시 실행 */
  immediate?: boolean;
  /** 자동 재시도 활성화 */
  retry?: boolean;
  /** 최대 재시도 횟수 */
  retryLimit?: number;
  /** 재시도 지연 시간 (ms) */
  retryDelay?: number;
  /** 지수 백오프 사용 */
  exponentialBackoff?: boolean;
  /** 캐시 유효 시간 (ms) */
  staleTime?: number;
  /** 캐시 키 */
  cacheKey?: string;
  /** 성공 콜백 */
  onSuccess?: (data: T) => void;
  /** 에러 콜백 */
  onError?: (error: Error) => void;
  /** 시작 콜백 */
  onStart?: () => void;
  /** 완료 콜백 (성공/실패 무관) */
  onSettled?: (data: T | null, error: Error | null) => void;
  /** 데이터 변환 함수 */
  transform?: (data: any) => T;
  /** 초기 데이터 */
  initialData?: T;
  /** 의존성 배열 (변경 시 자동 실행) */
  dependencies?: any[];
  /** 데이터 비교 함수 (리렌더링 최적화) */
  isEqual?: (prev: T | null, next: T | null) => boolean;
}

interface AsyncDataResult<T, Args extends any[]> extends AsyncState<T> {
  /** 비동기 함수 실행 */
  execute: (...args: Args) => Promise<T | null>;
  /** 데이터 새로고침 */
  refresh: () => Promise<T | null>;
  /** 상태 초기화 */
  reset: () => void;
  /** 요청 취소 */
  cancel: () => void;
  /** 수동 재시도 */
  retry: () => Promise<T | null>;
  /** 옵티미스틱 업데이트 */
  mutate: (updater: (prev: T | null) => T | null, options?: { revalidate?: boolean }) => void;
  /** 캐시 무효화 */
  invalidate: () => void;
}

// === 캐시 관리 ===
const cache = new Map<string, { data: any; timestamp: number }>();
const subscribers = new Map<string, Set<() => void>>();

const getCacheKey = (fn: Function, args: any[], customKey?: string): string => {
  if (customKey) return customKey;
  return `${fn.toString()}_${JSON.stringify(args)}`;
};

const getCachedData = <T>(key: string, staleTime: number): T | null => {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const isStale = Date.now() - cached.timestamp > staleTime;
  return isStale ? null : cached.data;
};

const setCachedData = <T>(key: string, data: T): void => {
  cache.set(key, { data, timestamp: Date.now() });
  
  // 구독자들에게 알림
  const subs = subscribers.get(key);
  if (subs) {
    subs.forEach(callback => callback());
  }
};

const subscribe = (key: string, callback: () => void): (() => void) => {
  if (!subscribers.has(key)) {
    subscribers.set(key, new Set());
  }
  subscribers.get(key)!.add(callback);
  
  return () => {
    subscribers.get(key)?.delete(callback);
    if (subscribers.get(key)?.size === 0) {
      subscribers.delete(key);
    }
  };
};

// === 유틸리티 함수 ===
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

const calculateBackoffDelay = (retryCount: number, baseDelay: number): number => 
  Math.min(1000 * Math.pow(2, retryCount), 30000) + Math.random() * 1000;

const shallowEqual = <T>(a: T | null, b: T | null): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  return keysA.every(key => (a as any)[key] === (b as any)[key]);
};

// === 메인 Hook ===
export const useAsyncData = <T = any, Args extends any[] = any[]>(
  asyncFunction: (...args: Args) => Promise<T>,
  options: UseAsyncDataOptions<T> = {}
): AsyncDataResult<T, Args> => {
  const {
    immediate = false,
    retry = true,
    retryLimit = 3,
    retryDelay = 1000,
    exponentialBackoff = true,
    staleTime = 5 * 60 * 1000, // 5분
    cacheKey,
    onSuccess,
    onError,
    onStart,
    onSettled,
    transform,
    initialData = null,
    dependencies = [],
    isEqual = shallowEqual,
  } = options;

  // === 상태 관리 ===
  const [state, setState] = useState<AsyncState<T>>(() => ({
    data: initialData,
    error: null,
    isLoading: false,
    isInitialLoading: false,
    isRefreshing: false,
    isSuccess: initialData !== null,
    isError: false,
    hasData: initialData !== null,
    lastUpdated: initialData ? Date.now() : null,
    retryCount: 0,
  }));

  // === Refs ===
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastArgsRef = useRef<Args | null>(null);
  const isUnmountedRef = useRef(false);

  // === 캐시 키 계산 ===
  const computedCacheKey = useMemo(() => {
    if (!lastArgsRef.current) return null;
    return getCacheKey(asyncFunction, lastArgsRef.current, cacheKey);
  }, [asyncFunction, cacheKey, lastArgsRef.current]);

  // === 상태 업데이트 헬퍼 ===
  const updateState = useCallback((updater: (prev: AsyncState<T>) => AsyncState<T>) => {
    if (isUnmountedRef.current) return;
    setState(updater);
  }, []);

  // === 요청 취소 ===
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  // === 재시도 로직 ===
  const executeWithRetry = useCallback(
    async (args: Args, currentRetryCount = 0): Promise<T | null> => {
      try {
        // 요청 취소 컨트롤러 생성
        abortControllerRef.current = new AbortController();
        
        // 비동기 함수 실행
        const rawResult = await asyncFunction(...args);
        const result = transform ? transform(rawResult) : rawResult;
        
        if (isUnmountedRef.current) return null;
        
        // 캐시 업데이트
        if (computedCacheKey) {
          setCachedData(computedCacheKey, result);
        }
        
        // 상태 업데이트
        updateState(prev => ({
          ...prev,
          data: isEqual(prev.data, result) ? prev.data : result,
          error: null,
          isLoading: false,
          isInitialLoading: false,
          isRefreshing: false,
          isSuccess: true,
          isError: false,
          hasData: true,
          lastUpdated: Date.now(),
          retryCount: 0,
        }));
        
        // 성공 콜백
        onSuccess?.(result);
        onSettled?.(result, null);
        
        return result;
        
      } catch (error) {
        if (isUnmountedRef.current) return null;
        
        const err = error instanceof Error ? error : new Error(String(error));
        
        // 취소된 요청은 무시
        if (err.name === 'AbortError') return null;
        
        // 재시도 로직
        if (retry && currentRetryCount < retryLimit) {
          const delay = exponentialBackoff 
            ? calculateBackoffDelay(currentRetryCount, retryDelay)
            : retryDelay;
          
          updateState(prev => ({ ...prev, retryCount: currentRetryCount + 1 }));
          
          await new Promise(resolve => {
            retryTimeoutRef.current = setTimeout(resolve, delay);
          });
          
          if (isUnmountedRef.current) return null;
          
          return executeWithRetry(args, currentRetryCount + 1);
        }
        
        // 최종 에러 처리
        updateState(prev => ({
          ...prev,
          error: err,
          isLoading: false,
          isInitialLoading: false,
          isRefreshing: false,
          isSuccess: false,
          isError: true,
          retryCount: currentRetryCount,
        }));
        
        // 에러 콜백
        onError?.(err);
        onSettled?.(null, err);
        
        throw err;
      } finally {
        abortControllerRef.current = null;
      }
    },
    [asyncFunction, retry, retryLimit, retryDelay, exponentialBackoff, transform, 
     onSuccess, onError, onSettled, computedCacheKey, isEqual, updateState]
  );

  // === 실행 함수 ===
  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      lastArgsRef.current = args;
      const key = getCacheKey(asyncFunction, args, cacheKey);
      
      // 진행 중인 요청 취소
      cancel();
      
      // 캐시된 데이터 확인
      const cachedData = getCachedData<T>(key, staleTime);
      if (cachedData && !state.isRefreshing) {
        updateState(prev => ({
          ...prev,
          data: isEqual(prev.data, cachedData) ? prev.data : cachedData,
          isSuccess: true,
          hasData: true,
          lastUpdated: cache.get(key)?.timestamp || Date.now(),
        }));
      }
      
      // 로딩 상태 설정
      const isFirstLoad = !state.hasData && !cachedData;
      updateState(prev => ({
        ...prev,
        isLoading: true,
        isInitialLoading: isFirstLoad,
        isRefreshing: !isFirstLoad,
        isError: false,
        retryCount: 0,
      }));
      
      // 시작 콜백
      onStart?.();
      
      try {
        return await executeWithRetry(args);
      } catch (error) {
        return null;
      }
    },
    [asyncFunction, cacheKey, staleTime, state.isRefreshing, state.hasData, 
     cancel, executeWithRetry, isEqual, updateState, onStart]
  );

  // === 새로고침 ===
  const refresh = useCallback(
    async (): Promise<T | null> => {
      if (!lastArgsRef.current) return null;
      
      // 캐시 무효화
      if (computedCacheKey) {
        cache.delete(computedCacheKey);
      }
      
      return execute(...lastArgsRef.current);
    },
    [execute, computedCacheKey]
  );

  // === 상태 초기화 ===
  const reset = useCallback(() => {
    cancel();
    
    updateState(() => ({
      data: initialData,
      error: null,
      isLoading: false,
      isInitialLoading: false,
      isRefreshing: false,
      isSuccess: initialData !== null,
      isError: false,
      hasData: initialData !== null,
      lastUpdated: initialData ? Date.now() : null,
      retryCount: 0,
    }));
    
    lastArgsRef.current = null;
  }, [cancel, initialData, updateState]);

  // === 수동 재시도 ===
  const retryManual = useCallback(
    async (): Promise<T | null> => {
      if (!lastArgsRef.current || !state.isError) return null;
      return execute(...lastArgsRef.current);
    },
    [execute, state.isError]
  );

  // === 옵티미스틱 업데이트 ===
  const mutate = useCallback(
    (updater: (prev: T | null) => T | null, { revalidate = true } = {}) => {
      const newData = updater(state.data);
      
      updateState(prev => ({
        ...prev,
        data: newData,
        hasData: newData !== null,
        lastUpdated: Date.now(),
      }));
      
      // 캐시 업데이트
      if (computedCacheKey && newData) {
        setCachedData(computedCacheKey, newData);
      }
      
      // 재검증
      if (revalidate && lastArgsRef.current) {
        execute(...lastArgsRef.current).catch(() => {
          // 재검증 실패 시 원본 데이터로 롤백
          updateState(prev => ({
            ...prev,
            data: state.data,
            hasData: state.hasData,
            lastUpdated: state.lastUpdated,
          }));
        });
      }
    },
    [state.data, state.hasData, state.lastUpdated, computedCacheKey, execute, updateState]
  );

  // === 캐시 무효화 ===
  const invalidate = useCallback(() => {
    if (computedCacheKey) {
      cache.delete(computedCacheKey);
    }
  }, [computedCacheKey]);

  // === 캐시 구독 ===
  useEffect(() => {
    if (!computedCacheKey) return;
    
    return subscribe(computedCacheKey, () => {
      const cachedData = getCachedData<T>(computedCacheKey, staleTime);
      if (cachedData && !isEqual(state.data, cachedData)) {
        updateState(prev => ({
          ...prev,
          data: cachedData,
          hasData: true,
          lastUpdated: cache.get(computedCacheKey)?.timestamp || Date.now(),
        }));
      }
    });
  }, [computedCacheKey, staleTime, state.data, isEqual, updateState]);

  // === 의존성 변경 시 자동 실행 ===
  useEffect(() => {
    if (!immediate && dependencies.length === 0) return;
    if (!lastArgsRef.current && !immediate) return;
    
    const args = lastArgsRef.current || ([] as unknown as Args);
    execute(...args);
  }, [...dependencies, immediate]); // eslint-disable-line react-hooks/exhaustive-deps

  // === 컴포넌트 언마운트 처리 ===
  useEffect(() => {
    isUnmountedRef.current = false;
    
    return () => {
      isUnmountedRef.current = true;
      cancel();
    };
  }, [cancel]);

  // === 반환값 ===
  return {
    ...state,
    execute,
    refresh,
    reset,
    cancel,
    retry: retryManual,
    mutate,
    invalidate,
  };
};

// === 특수 Hook들 ===

/**
 * API 엔드포인트를 위한 특화된 Hook
 */
export const useApiData = <T = any>(
  url: string,
  options?: UseAsyncDataOptions<T> & {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: any;
  }
) => {
  const { method = 'GET', headers = {}, body, ...restOptions } = options || {};
  
  const apiFunction = useCallback(async () => {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }, [url, method, headers, body]);
  
  return useAsyncData(apiFunction, {
    ...restOptions,
    cacheKey: `api_${method}_${url}_${JSON.stringify(body)}`,
  });
};

/**
 * 페이지네이션을 위한 Hook
 */
interface PaginationParams {
  page: number;
  limit: number;
  [key: string]: any;
}

interface PaginatedData<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const usePaginatedData = <T = any>(
  fetcher: (params: PaginationParams) => Promise<PaginatedData<T>>,
  initialParams: Omit<PaginationParams, 'page' | 'limit'> = {},
  options?: UseAsyncDataOptions<PaginatedData<T>>
) => {
  const [params, setParams] = useState<PaginationParams>({
    page: 1,
    limit: 10,
    ...initialParams,
  });
  
  const result = useAsyncData(
    (searchParams: PaginationParams) => fetcher(searchParams),
    {
      ...options,
      dependencies: [params],
      immediate: true,
      cacheKey: `paginated_${JSON.stringify(params)}`,
    }
  );
  
  const goToPage = useCallback((page: number) => {
    setParams(prev => ({ ...prev, page }));
  }, []);
  
  const nextPage = useCallback(() => {
    if (result.data?.hasNextPage) {
      setParams(prev => ({ ...prev, page: prev.page + 1 }));
    }
  }, [result.data?.hasNextPage]);
  
  const previousPage = useCallback(() => {
    if (result.data?.hasPreviousPage) {
      setParams(prev => ({ ...prev, page: prev.page - 1 }));
    }
  }, [result.data?.hasPreviousPage]);
  
  const changeLimit = useCallback((limit: number) => {
    setParams(prev => ({ ...prev, limit, page: 1 }));
  }, []);
  
  const updateFilters = useCallback((filters: Partial<PaginationParams>) => {
    setParams(prev => ({ ...prev, ...filters, page: 1 }));
  }, []);
  
  return {
    ...result,
    params,
    goToPage,
    nextPage,
    previousPage,
    changeLimit,
    updateFilters,
  };
};

// === 유틸리티 함수들 ===

/**
 * 전역 캐시 관리
 */
export const asyncDataCache = {
  /** 모든 캐시 클리어 */
  clear: () => {
    cache.clear();
    subscribers.clear();
  },
  
  /** 특정 키의 캐시 클리어 */
  delete: (key: string) => {
    cache.delete(key);
  },
  
  /** 캐시 통계 */
  stats: () => ({
    size: cache.size,
    keys: Array.from(cache.keys()),
    subscribers: subscribers.size,
  }),
  
  /** 만료된 캐시 정리 */
  cleanup: (maxAge = 60 * 60 * 1000) => { // 1시간
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > maxAge) {
        cache.delete(key);
      }
    }
  },
};

export default useAsyncData;