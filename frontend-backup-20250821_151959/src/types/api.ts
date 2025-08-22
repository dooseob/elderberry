/**
 * API 관련 공통 타입 정의
 * 타입 안전성과 일관성을 위한 제네릭 타입들
 */

// 기본 API 응답 래퍼
export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

// 페이지네이션 응답
export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
}

// 페이지네이션 요청 파라미터
export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

// 검색 요청 파라미터
export interface SearchParams extends PaginationParams {
  keyword?: string;
  filters?: Record<string, unknown>;
}

// API 요청 상태
export enum ApiRequestStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

// API 상태 인터페이스
export interface ApiState<T = unknown> {
  data: T | null;
  status: ApiRequestStatus;
  error: string | null;
  lastUpdated: Date | null;
}

// 비동기 작업 상태
export interface AsyncState<T = unknown> extends ApiState<T> {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  isIdle: boolean;
}

// API 요청 옵션
export interface ApiRequestOptions {
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTime?: number;
  headers?: Record<string, string>;
}

// API 엔드포인트 정의
export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  description?: string;
}

// API 응답 메타데이터
export interface ResponseMetadata {
  requestId?: string;
  correlationId?: string;
  version?: string;
  timestamp: string;
  processingTime?: number;
}

// 타입 안전한 API 응답 생성자
export function createApiResponse<T>(
  data: T,
  success: boolean = true,
  message?: string
): ApiResponse<T> {
  return {
    data,
    success,
    message,
    timestamp: new Date().toISOString()
  };
}

// 빈 페이지네이션 응답 생성자
export function createEmptyPaginatedResponse<T>(): PaginatedResponse<T> {
  return {
    content: [],
    page: 0,
    size: 0,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
    empty: true,
    numberOfElements: 0
  };
}

// API 상태 생성자
export function createApiState<T>(
  data: T | null = null,
  status: ApiRequestStatus = ApiRequestStatus.IDLE,
  error: string | null = null
): ApiState<T> {
  return {
    data,
    status,
    error,
    lastUpdated: data ? new Date() : null
  };
}

// 비동기 상태 생성자
export function createAsyncState<T>(
  data: T | null = null,
  status: ApiRequestStatus = ApiRequestStatus.IDLE,
  error: string | null = null
): AsyncState<T> {
  return {
    data,
    status,
    error,
    lastUpdated: data ? new Date() : null,
    isLoading: status === ApiRequestStatus.LOADING,
    isSuccess: status === ApiRequestStatus.SUCCESS,
    isError: status === ApiRequestStatus.ERROR,
    isIdle: status === ApiRequestStatus.IDLE
  };
}

// 타입 가드 함수들
export function isApiResponse<T>(obj: unknown): obj is ApiResponse<T> {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'data' in obj &&
    'success' in obj &&
    'timestamp' in obj
  );
}

export function isPaginatedResponse<T>(obj: unknown): obj is PaginatedResponse<T> {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'content' in obj &&
    Array.isArray((obj as PaginatedResponse<T>).content) &&
    'page' in obj &&
    'size' in obj &&
    'totalElements' in obj &&
    'totalPages' in obj
  );
}

export function isValidPaginationParams(obj: unknown): obj is PaginationParams {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const params = obj as Record<string, unknown>;
  
  return (
    (params.page === undefined || typeof params.page === 'number') &&
    (params.size === undefined || typeof params.size === 'number') &&
    (params.sort === undefined || typeof params.sort === 'string') &&
    (params.direction === undefined || ['asc', 'desc'].includes(params.direction as string))
  );
}

// 유틸리티 타입들
export type NonNullable<T> = T extends null | undefined ? never : T;

export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// API 응답에서 데이터만 추출하는 유틸리티 타입
export type ExtractData<T> = T extends ApiResponse<infer U> ? U : T;

// 페이지네이션 응답에서 컨텐츠만 추출하는 유틸리티 타입
export type ExtractContent<T> = T extends PaginatedResponse<infer U> ? U[] : T;

// 깊은 부분 타입
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 깊은 읽기 전용 타입
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// 함수에서 제외하는 타입
export type NonFunctionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? never : K;
}[keyof T];

export type NonFunction<T> = Pick<T, NonFunctionKeys<T>>;

// 문자열 키만 추출하는 타입
export type StringKeys<T> = Extract<keyof T, string>;

// 숫자 값만 추출하는 타입
export type NumberValues<T> = {
  [K in keyof T]: T[K] extends number ? T[K] : never;
}[keyof T];

// API 상태 업데이트 유틸리티
export interface ApiStateUpdater<T> {
  setLoading: () => void;
  setSuccess: (data: T) => void;
  setError: (error: string) => void;
  reset: () => void;
}

// 일반적인 CRUD 작업 타입
export interface CrudOperations<T, CreateRequest, UpdateRequest> {
  create: (data: CreateRequest) => Promise<T>;
  read: (id: number | string) => Promise<T>;
  update: (id: number | string, data: UpdateRequest) => Promise<T>;
  delete: (id: number | string) => Promise<void>;
  list: (params?: SearchParams) => Promise<PaginatedResponse<T>>;
}

// API 서비스 기본 인터페이스
export interface BaseApiService<T, CreateRequest = T, UpdateRequest = Partial<T>> {
  baseUrl: string;
  endpoints: Record<string, ApiEndpoint>;
  crud: CrudOperations<T, CreateRequest, UpdateRequest>;
}

// 캐시 전략
export enum CacheStrategy {
  NO_CACHE = 'no-cache',
  CACHE_FIRST = 'cache-first',
  NETWORK_FIRST = 'network-first',
  CACHE_ONLY = 'cache-only',
  NETWORK_ONLY = 'network-only'
}

// 캐시 설정
export interface CacheConfig {
  strategy: CacheStrategy;
  ttl: number; // time to live in milliseconds
  maxSize: number;
  key: string;
}

// API 호출 옵션 (캐시 포함)
export interface ApiCallOptions extends ApiRequestOptions {
  cache?: CacheConfig;
  transform?: <U>(data: unknown) => U;
  validate?: (data: unknown) => boolean;
}

// 타입 안전한 환경 변수 접근
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  version: string;
}

// API 응답 변환 유틸리티
export type ResponseTransformer<TInput, TOutput> = (input: TInput) => TOutput;

// 실제 응용 예시: 컴포넌트에서 사용할 수 있는 타입들
export interface UseApiResult<T> extends AsyncState<T> {
  refetch: () => Promise<void>;
  mutate: (data: T) => void;
  invalidate: () => void;
}

export interface UsePaginationResult<T> extends UseApiResult<PaginatedResponse<T>> {
  page: number;
  size: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  changePageSize: (size: number) => void;
}