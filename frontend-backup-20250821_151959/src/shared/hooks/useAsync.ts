/**
 * 비동기 작업을 위한 커스텀 훅
 * 로딩, 에러, 성공 상태를 통합 관리
 */
import { useState, useCallback, useRef, useEffect } from 'react';

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

interface UseAsyncOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export const useAsync = <T = any, Args extends any[] = any[]>(
  asyncFunction: (...args: Args) => Promise<T>,
  options: UseAsyncOptions = {}
) => {
  const { immediate = false, onSuccess, onError } = options;
  
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const cancelRef = useRef<boolean>(false);

  const execute = useCallback(
    async (...args: Args) => {
      cancelRef.current = false;
      
      setState({
        data: null,
        error: null,
        isLoading: true,
        isSuccess: false,
        isError: false,
      });

      try {
        const result = await asyncFunction(...args);
        
        if (!cancelRef.current) {
          setState({
            data: result,
            error: null,
            isLoading: false,
            isSuccess: true,
            isError: false,
          });
          
          onSuccess?.(result);
        }
        
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        
        if (!cancelRef.current) {
          setState({
            data: null,
            error: err,
            isLoading: false,
            isSuccess: false,
            isError: true,
          });
          
          onError?.(err);
        }
        
        throw err;
      }
    },
    [asyncFunction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  }, []);

  const cancel = useCallback(() => {
    cancelRef.current = true;
  }, []);

  // 컴포넌트 언마운트 시 취소
  useEffect(() => {
    return () => {
      cancelRef.current = true;
    };
  }, []);

  // immediate 실행
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    ...state,
    execute,
    reset,
    cancel,
  };
};