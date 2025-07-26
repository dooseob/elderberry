/**
 * 프로필 API 서비스 관련 타입 정의
 */

import {
  ProfileType,
  DomesticProfileRequest,
  DomesticProfileResponse,
  OverseasProfileRequest,
  OverseasProfileResponse,
  ProfileListItem,
  ProfileSearchFilters,
  ProfileSortOptions,
  PagedProfileResponse,
  ProfileStatistics,
  ApiResponse,
  ApiError
} from './profile';

// ===== API 엔드포인트 타입들 =====

export interface ProfileApiEndpoints {
  // 국내 프로필 API
  domestic: {
    create: string;
    getById: (id: number) => string;
    update: (id: number) => string;
    delete: (id: number) => string;
    getByMemberId: (memberId: number) => string;
  };
  // 해외 프로필 API
  overseas: {
    create: string;
    getById: (id: number) => string;
    update: (id: number) => string;
    delete: (id: number) => string;
    getByMemberId: (memberId: number) => string;
  };
  // 공통 프로필 API
  common: {
    list: string;
    search: string;
    statistics: string;
    validate: string;
    completion: (profileId: number, profileType: ProfileType) => string;
  };
}

// ===== API 요청 타입들 =====

export interface CreateDomesticProfileApiRequest {
  data: DomesticProfileRequest;
}

export interface CreateOverseasProfileApiRequest {
  data: OverseasProfileRequest;
}

export interface UpdateDomesticProfileApiRequest {
  profileId: number;
  data: Partial<DomesticProfileRequest>;
}

export interface UpdateOverseasProfileApiRequest {
  profileId: number;
  data: Partial<OverseasProfileRequest>;
}

export interface GetProfileByIdApiRequest {
  profileId: number;
  profileType: ProfileType;
}

export interface GetProfileByMemberIdApiRequest {
  memberId: number;
  profileType: ProfileType;
}

export interface DeleteProfileApiRequest {
  profileId: number;
  profileType: ProfileType;
}

export interface SearchProfilesApiRequest {
  filters?: ProfileSearchFilters;
  sort?: ProfileSortOptions;
  page?: number;
  size?: number;
}

export interface ValidateProfileApiRequest {
  profileType: ProfileType;
  data: DomesticProfileRequest | OverseasProfileRequest;
}

export interface GetProfileCompletionApiRequest {
  profileId: number;
  profileType: ProfileType;
}

// ===== API 응답 타입들 =====

export type CreateDomesticProfileApiResponse = ApiResponse<DomesticProfileResponse>;
export type CreateOverseasProfileApiResponse = ApiResponse<OverseasProfileResponse>;
export type UpdateDomesticProfileApiResponse = ApiResponse<DomesticProfileResponse>;
export type UpdateOverseasProfileApiResponse = ApiResponse<OverseasProfileResponse>;
export type GetDomesticProfileApiResponse = ApiResponse<DomesticProfileResponse>;
export type GetOverseasProfileApiResponse = ApiResponse<OverseasProfileResponse>;
export type DeleteProfileApiResponse = ApiResponse<{ success: boolean; message: string }>;
export type SearchProfilesApiResponse = ApiResponse<PagedProfileResponse>;
export type GetProfileStatisticsApiResponse = ApiResponse<ProfileStatistics>;
export type ValidateProfileApiResponse = ApiResponse<{
  isValid: boolean;
  errors: string[];
  warnings: string[];
}>;
export type GetProfileCompletionApiResponse = ApiResponse<{
  percentage: number;
  isComplete: boolean;
  missingFields: string[];
}>;

// ===== API 서비스 인터페이스 =====

export interface ProfileApiService {
  // 국내 프로필 API
  createDomesticProfile(request: CreateDomesticProfileApiRequest): Promise<CreateDomesticProfileApiResponse>;
  getDomesticProfile(profileId: number): Promise<GetDomesticProfileApiResponse>;
  getDomesticProfileByMemberId(memberId: number): Promise<GetDomesticProfileApiResponse>;
  updateDomesticProfile(request: UpdateDomesticProfileApiRequest): Promise<UpdateDomesticProfileApiResponse>;
  deleteDomesticProfile(profileId: number): Promise<DeleteProfileApiResponse>;
  
  // 해외 프로필 API
  createOverseasProfile(request: CreateOverseasProfileApiRequest): Promise<CreateOverseasProfileApiResponse>;
  getOverseasProfile(profileId: number): Promise<GetOverseasProfileApiResponse>;
  getOverseasProfileByMemberId(memberId: number): Promise<GetOverseasProfileApiResponse>;
  updateOverseasProfile(request: UpdateOverseasProfileApiRequest): Promise<UpdateOverseasProfileApiResponse>;
  deleteOverseasProfile(profileId: number): Promise<DeleteProfileApiResponse>;
  
  // 공통 API
  searchProfiles(request: SearchProfilesApiRequest): Promise<SearchProfilesApiResponse>;
  getProfileStatistics(): Promise<GetProfileStatisticsApiResponse>;
  validateProfile(request: ValidateProfileApiRequest): Promise<ValidateProfileApiResponse>;
  getProfileCompletion(request: GetProfileCompletionApiRequest): Promise<GetProfileCompletionApiResponse>;
}

// ===== HTTP 클라이언트 설정 타입들 =====

export interface ApiRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
  withCredentials: boolean;
}

export interface ApiInterceptors {
  request: {
    use: (
      onFulfilled: (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>,
      onRejected?: (error: any) => any
    ) => number;
    eject: (id: number) => void;
  };
  response: {
    use: (
      onFulfilled: (response: any) => any,
      onRejected?: (error: any) => any
    ) => number;
    eject: (id: number) => void;
  };
}

// ===== 오류 처리 타입들 =====

export interface ApiErrorDetail {
  field?: string;
  code: string;
  message: string;
  value?: any;
}

export interface ValidationApiError extends ApiError {
  error: {
    code: 'VALIDATION_ERROR';
    message: string;
    details: {
      fieldErrors: ApiErrorDetail[];
      globalErrors: string[];
    };
  };
}

export interface NotFoundApiError extends ApiError {
  error: {
    code: 'NOT_FOUND';
    message: string;
    details: {
      resourceType: string;
      resourceId: string | number;
    };
  };
}

export interface UnauthorizedApiError extends ApiError {
  error: {
    code: 'UNAUTHORIZED';
    message: string;
    details: {
      reason: 'TOKEN_EXPIRED' | 'TOKEN_INVALID' | 'ACCESS_DENIED';
    };
  };
}

export interface ServerApiError extends ApiError {
  error: {
    code: 'INTERNAL_SERVER_ERROR';
    message: string;
    details: {
      errorId: string;
      timestamp: string;
    };
  };
}

export type ProfileApiError = 
  | ValidationApiError 
  | NotFoundApiError 
  | UnauthorizedApiError 
  | ServerApiError 
  | ApiError;

// ===== API 응답 헬퍼 타입들 =====

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
  first: boolean;
  last: boolean;
}

export interface SortMeta {
  field: string;
  direction: 'asc' | 'desc';
  sorted: boolean;
}

export interface SearchMeta {
  query?: string;
  filters: Record<string, any>;
  appliedFilters: number;
  totalResults: number;
  searchTime: number;
}

export interface ApiResponseMeta {
  pagination?: PaginationMeta;
  sort?: SortMeta;
  search?: SearchMeta;
  requestId: string;
  timestamp: string;
  version: string;
}

export interface EnhancedApiResponse<T> extends ApiResponse<T> {
  meta: ApiResponseMeta;
}

// ===== 캐싱 관련 타입들 =====

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of cached items
  enabled: boolean;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheKey {
  endpoint: string;
  method: string;
  params?: Record<string, any>;
  body?: any;
}

export interface CacheManager {
  get<T>(key: CacheKey): CacheEntry<T> | null;
  set<T>(key: CacheKey, data: T, ttl?: number): void;
  delete(key: CacheKey): boolean;
  clear(): void;
  size(): number;
  cleanup(): number; // Returns number of expired entries removed
}

// ===== API 상태 관리 타입들 =====

export interface ApiRequestState {
  loading: boolean;
  error: ProfileApiError | null;
  lastRequestTime: number | null;
  retryCount: number;
}

export interface ProfileApiState {
  // 요청 상태들
  createDomestic: ApiRequestState;
  createOverseas: ApiRequestState;
  updateDomestic: ApiRequestState;
  updateOverseas: ApiRequestState;
  getDomestic: ApiRequestState;
  getOverseas: ApiRequestState;
  search: ApiRequestState;
  delete: ApiRequestState;
  validate: ApiRequestState;
  
  // 데이터 캐시
  domesticProfiles: Map<number, DomesticProfileResponse>;
  overseasProfiles: Map<number, OverseasProfileResponse>;
  searchResults: PagedProfileResponse | null;
  statistics: ProfileStatistics | null;
  
  // 메타데이터
  lastUpdated: number | null;
  cacheConfig: CacheConfig;
}

// ===== 실시간 업데이트 타입들 =====

export interface ProfileUpdateEvent {
  type: 'PROFILE_CREATED' | 'PROFILE_UPDATED' | 'PROFILE_DELETED';
  profileId: number;
  profileType: ProfileType;
  memberId: number;
  timestamp: string;
  data?: Partial<DomesticProfileResponse | OverseasProfileResponse>;
}

export interface ProfileWebSocketMessage {
  type: 'PROFILE_UPDATE';
  event: ProfileUpdateEvent;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

export interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  lastError: string | null;
  reconnectAttempts: number;
  lastHeartbeat: number | null;
}

// ===== API 모니터링 타입들 =====

export interface ApiMetrics {
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  slowestRequest: number;
  fastestRequest: number;
  lastRequestTime: number | null;
  errors: {
    validation: number;
    notFound: number;
    unauthorized: number;
    server: number;
    network: number;
  };
}

export interface PerformanceEntry {
  endpoint: string;
  method: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  errorType?: string;
  responseSize?: number;
}

export interface ApiMonitor {
  recordRequest(entry: PerformanceEntry): void;
  getMetrics(endpoint?: string): ApiMetrics;
  reset(): void;
  exportMetrics(): string; // JSON string
}

// ===== 배치 작업 타입들 =====

export interface BatchOperation {
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  profileType: ProfileType;
  profileId?: number;
  data?: any;
}

export interface BatchRequest {
  operations: BatchOperation[];
  transactional: boolean; // All operations succeed or all fail
}

export interface BatchResult {
  success: boolean;
  results: Array<{
    operation: BatchOperation;
    success: boolean;
    data?: any;
    error?: ProfileApiError;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    duration: number;
  };
}

export interface BatchApiService {
  executeBatch(request: BatchRequest): Promise<BatchResult>;
}

// ===== API 버전 관리 타입들 =====

export interface ApiVersion {
  version: string;
  deprecated: boolean;
  deprecationDate?: string;
  sunsetDate?: string;
  migrationGuide?: string;
}

export interface ApiVersionInfo {
  current: ApiVersion;
  supported: ApiVersion[];
  latest: ApiVersion;
}

export interface VersionedApiConfig {
  version: string;
  endpoints: ProfileApiEndpoints;
  features: string[];
  compatibility: Record<string, boolean>;
}

// ===== 개발 도구 타입들 =====

export interface ApiDebugInfo {
  requestId: string;
  endpoint: string;
  method: string;
  requestTime: string;
  responseTime: string;
  duration: number;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  requestBody?: any;
  responseBody?: any;
  cacheHit: boolean;
  retryCount: number;
}

export interface ApiLogger {
  debug(info: ApiDebugInfo): void;
  error(error: ProfileApiError, context?: any): void;
  performance(entry: PerformanceEntry): void;
  setLogLevel(level: 'debug' | 'info' | 'warn' | 'error'): void;
}

export interface MockApiConfig {
  enabled: boolean;
  delay: number; // Simulated network delay
  errorRate: number; // Percentage of requests that should fail
  scenarios: Record<string, any>; // Predefined response scenarios
}

export interface TestApiFixtures {
  domesticProfiles: DomesticProfileResponse[];
  overseasProfiles: OverseasProfileResponse[];
  searchResults: PagedProfileResponse;
  statistics: ProfileStatistics;
  errors: Record<string, ProfileApiError>;
}