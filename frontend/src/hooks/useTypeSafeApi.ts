/**
 * 타입 안전한 API 호출을 위한 커스텀 훅
 * 제네릭 타입을 활용한 재사용 가능한 API 상태 관리
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  ApiState, 
  AsyncState, 
  ApiRequestStatus, 
  PaginatedResponse,
  createAsyncState 
} from '../types/api';
import { normalizeError, errorLogger, ErrorContext, safeExecute } from '../utils/errorHandler';
import type { AppError } from '../types/errors';

// 기본 API 훅 설정
export interface UseApiOptions {
  immediate?: boolean; // 즉시 실행 여부
  onSuccess?: (data: unknown) => void;
  onError?: (error: AppError) => void;
  retryCount?: number;
  retryDelay?: number;
  timeout?: number;
  errorContext?: Partial<ErrorContext>;
}

// API 훅 반환 타입
export interface UseApiResult<TData, TError = AppError> extends AsyncState<TData> {
  execute: () => Promise<TData | undefined>;
  reset: () => void;
  retry: () => Promise<TData | undefined>;
  cancel: () => void;
  mutate: (data: TData) => void; // 로컬 상태 업데이트
}

/**
 * 기본 API 상태 관리 훅
 */
export function useTypeSafeApi<TData>(
  apiCall: () => Promise<TData>,
  options: UseApiOptions = {}
): UseApiResult<TData> {
  const {
    immediate = false,
    onSuccess,
    onError,
    retryCount = 0,
    retryDelay = 1000,
    timeout = 30000,
    errorContext = {}
  } = options;

  const [state, setState] = useState<AsyncState<TData>>(() => 
    createAsyncState<TData>()
  );

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 실행 함수
  const execute = useCallback(async (): Promise<TData | undefined> => {
    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 새로운 AbortController 생성
    abortControllerRef.current = new AbortController();
    
    setState(prev => ({ ...prev, status: ApiRequestStatus.LOADING, isLoading: true, error: null }));

    // 타임아웃 설정
    if (timeout > 0) {
      timeoutRef.current = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      }, timeout);
    }

    try {
      const { data, error } = await safeExecute(apiCall(), {
        component: 'useTypeSafeApi',
        ...errorContext
      });

      // 요청이 취소되지 않았다면 상태 업데이트
      if (!abortControllerRef.current?.signal.aborted) {
        if (error) {
          setState(prev => ({
            ...prev,
            status: ApiRequestStatus.ERROR,
            isLoading: false,
            isError: true,
            error: error.message
          }));
          
          onError?.(error);
          throw error;
        } else if (data !== undefined) {
          setState(prev => ({
            ...prev,
            data,
            status: ApiRequestStatus.SUCCESS,
            isLoading: false,
            isSuccess: true,
            error: null,
            lastUpdated: new Date()
          }));
          
          onSuccess?.(data);
          retryCountRef.current = 0; // 성공 시 재시도 카운트 리셋
          return data;
        }
      }
    } catch (error) {
      if (!abortControllerRef.current?.signal.aborted) {
        const normalizedError = normalizeError(error, {
          component: 'useTypeSafeApi',
          ...errorContext
        });
        
        errorLogger.error(normalizedError, errorContext);
        
        setState(prev => ({
          ...prev,
          status: ApiRequestStatus.ERROR,
          isLoading: false,
          isError: true,
          error: normalizedError.message
        }));
        
        onError?.(normalizedError);
      }
    } finally {
      // 타임아웃 클리어
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    return undefined;
  }, [apiCall, onSuccess, onError, timeout, errorContext]);

  // 재시도 함수
  const retry = useCallback(async (): Promise<TData | undefined> => {
    if (retryCountRef.current < retryCount) {
      retryCountRef.current += 1;
      
      // 지연 시간 후 재시도
      if (retryDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
      
      return execute();
    }
    return undefined;
  }, [execute, retryCount, retryDelay]);

  // 취소 함수
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setState(prev => ({
      ...prev,
      status: ApiRequestStatus.IDLE,
      isLoading: false
    }));
  }, []);

  // 리셋 함수
  const reset = useCallback(() => {
    cancel();
    setState(createAsyncState<TData>());
    retryCountRef.current = 0;
  }, [cancel]);

  // 로컬 상태 변경 함수
  const mutate = useCallback((data: TData) => {
    setState(prev => ({
      ...prev,
      data,
      status: ApiRequestStatus.SUCCESS,
      isSuccess: true,
      lastUpdated: new Date()
    }));
  }, []);

  // 즉시 실행
  useEffect(() => {
    if (immediate) {
      execute();
    }
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      cancel();
    };
  }, [immediate]); // execute와 cancel은 의존성에서 제외 (무한 루프 방지)

  return {
    ...state,
    execute,
    retry,
    reset,
    cancel,
    mutate
  };
}

// 페이지네이션 API 훅
export interface UsePaginatedApiOptions extends UseApiOptions {
  initialPage?: number;
  initialSize?: number;
}

export interface UsePaginatedApiResult<TData> extends UseApiResult<PaginatedResponse<TData>> {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  goToPage: (page: number) => Promise<void>;
  nextPage: () => Promise<void>;
  previousPage: () => Promise<void>;
  changePageSize: (size: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function usePaginatedApi<TData>(
  apiCall: (page: number, size: number) => Promise<PaginatedResponse<TData>>,
  options: UsePaginatedApiOptions = {}
): UsePaginatedApiResult<TData> {
  const { initialPage = 0, initialSize = 10, ...restOptions } = options;
  
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);

  const paginatedApiCall = useCallback(() => {
    return apiCall(page, size);
  }, [apiCall, page, size]);

  const baseResult = useTypeSafeApi(paginatedApiCall, {
    ...restOptions,
    immediate: true
  });

  const totalPages = baseResult.data?.totalPages ?? 0;
  const totalElements = baseResult.data?.totalElements ?? 0;
  const hasNext = !baseResult.data?.last ?? false;
  const hasPrevious = !baseResult.data?.first ?? false;

  const goToPage = useCallback(async (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  const nextPage = useCallback(async () => {
    if (hasNext) {
      setPage(prev => prev + 1);
    }
  }, [hasNext]);

  const previousPage = useCallback(async () => {
    if (hasPrevious) {
      setPage(prev => Math.max(0, prev - 1));
    }
  }, [hasPrevious]);

  const changePageSize = useCallback(async (newSize: number) => {
    if (newSize > 0) {
      setSize(newSize);
      setPage(0); // 페이지 크기 변경 시 첫 페이지로
    }
  }, []);

  const refresh = useCallback(async () => {
    await baseResult.execute();
  }, [baseResult.execute]);

  // 페이지나 사이즈가 변경되면 자동으로 다시 호출
  useEffect(() => {
    if (!baseResult.isLoading) {
      baseResult.execute();
    }
  }, [page, size]);

  return {
    ...baseResult,
    page,
    size,
    totalPages,
    totalElements,
    hasNext,
    hasPrevious,
    goToPage,
    nextPage,
    previousPage,
    changePageSize,
    refresh
  };
}

// 뮤테이션 훅 (Create, Update, Delete)
export interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: AppError, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: AppError | undefined, variables: TVariables) => void;
  errorContext?: Partial<ErrorContext>;
}

export interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData | undefined>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  reset: () => void;
  data: TData | null;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  isIdle: boolean;
}

export function useMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TVariables> = {}
): UseMutationResult<TData, TVariables> {
  const { onSuccess, onError, onSettled, errorContext = {} } = options;
  
  const [state, setState] = useState<AsyncState<TData>>(() => 
    createAsyncState<TData>()
  );

  const mutate = useCallback(async (variables: TVariables): Promise<TData | undefined> => {
    setState(prev => ({ 
      ...prev, 
      status: ApiRequestStatus.LOADING, 
      isLoading: true, 
      error: null 
    }));

    try {
      const { data, error } = await safeExecute(mutationFn(variables), {
        component: 'useMutation',
        action: 'mutate',
        ...errorContext
      });

      if (error) {
        setState(prev => ({
          ...prev,
          status: ApiRequestStatus.ERROR,
          isLoading: false,
          isError: true,
          error: error.message
        }));
        
        onError?.(error, variables);
        onSettled?.(undefined, error, variables);
        throw error;
      } else if (data !== undefined) {
        setState(prev => ({
          ...prev,
          data,
          status: ApiRequestStatus.SUCCESS,
          isLoading: false,
          isSuccess: true,
          error: null,
          lastUpdated: new Date()
        }));
        
        onSuccess?.(data, variables);
        onSettled?.(data, undefined, variables);
        return data;
      }
    } catch (error) {
      const normalizedError = normalizeError(error, {
        component: 'useMutation',
        action: 'mutate',
        ...errorContext
      });
      
      errorLogger.error(normalizedError, errorContext);
      
      setState(prev => ({
        ...prev,
        status: ApiRequestStatus.ERROR,
        isLoading: false,
        isError: true,
        error: normalizedError.message
      }));
      
      onError?.(normalizedError, variables);
      onSettled?.(undefined, normalizedError, variables);
    }

    return undefined;
  }, [mutationFn, onSuccess, onError, onSettled, errorContext]);

  const mutateAsync = useCallback(async (variables: TVariables): Promise<TData> => {
    const result = await mutate(variables);
    if (result === undefined) {
      throw new Error('Mutation failed');
    }
    return result;
  }, [mutate]);

  const reset = useCallback(() => {
    setState(createAsyncState<TData>());
  }, []);

  return {
    mutate,
    mutateAsync,
    reset,
    data: state.data,
    error: state.error,
    isLoading: state.isLoading,
    isSuccess: state.isSuccess,
    isError: state.isError,
    isIdle: state.isIdle
  };
}

// 무한 스크롤 훅
export function useInfiniteApi<TData>(
  apiCall: (page: number, size: number) => Promise<PaginatedResponse<TData>>,
  options: UseApiOptions & { pageSize?: number } = {}
): {
  data: TData[];
  fetchNextPage: () => Promise<void>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  reset: () => void;
} {
  const { pageSize = 10, ...restOptions } = options;
  
  const [allData, setAllData] = useState<TData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  const { execute, isLoading, isError, error, reset: resetBase } = useTypeSafeApi(
    () => apiCall(currentPage, pageSize),
    {
      ...restOptions,
      onSuccess: (data: PaginatedResponse<TData>) => {
        if (currentPage === 0) {
          setAllData(data.content);
        } else {
          setAllData(prev => [...prev, ...data.content]);
        }
        setHasNextPage(!data.last);
        setIsFetchingNextPage(false);
      },
      onError: () => {
        setIsFetchingNextPage(false);
      }
    }
  );

  const fetchNextPage = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage && !isLoading) {
      setIsFetchingNextPage(true);
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage, isFetchingNextPage, isLoading]);

  const reset = useCallback(() => {
    setAllData([]);
    setCurrentPage(0);
    setHasNextPage(true);
    setIsFetchingNextPage(false);
    resetBase();
  }, [resetBase]);

  // 페이지 변경 시 자동 실행
  useEffect(() => {
    execute();
  }, [currentPage]);

  // 초기 로드
  useEffect(() => {
    if (options.immediate !== false) {
      execute();
    }
  }, []);

  return {
    data: allData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    reset
  };
}