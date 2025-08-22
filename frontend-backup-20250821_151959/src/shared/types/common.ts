/**
 * 공통 타입 정의
 * 모든 도메인에서 공유되는 기본 타입들
 */

// 기본 엔티티 타입
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

// 상태 타입
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface AsyncState<T> extends LoadingState {
  data: T | null;
}

export interface ListState<T> extends LoadingState {
  items: T[];
  selectedItem: T | null;
  pagination?: PaginationState;
}

export interface PaginationState {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// 폼 상태 타입
export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
}

// 검색 및 필터 타입
export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  sort?: SortOption;
  pagination?: Pick<PaginationState, 'page' | 'size'>;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

// 선택 옵션 타입
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

// 이벤트 타입
export interface CustomEvent<T = any> {
  type: string;
  payload: T;
  timestamp: number;
}

// 유틸리티 타입
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 컴포넌트 Props 타입
export interface ComponentProps {
  className?: string;
  testId?: string;
}

export interface InteractiveProps {
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

// 라우터 타입
export interface RouteParams {
  [key: string]: string | undefined;
}

// 환경 설정 타입
export interface AppConfig {
  apiBaseUrl: string;
  environment: 'development' | 'staging' | 'production';
  version: string;
  features: Record<string, boolean>;
}

// 사용자 권한 타입
export type UserRole = 'USER' | 'COORDINATOR' | 'ADMIN';

export interface Permission {
  resource: string;
  actions: string[];
}

// 파일 업로드 타입
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

// 알림 타입
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
}

// 메타데이터 타입
export interface Metadata {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
}

// 위치 정보 타입
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: Coordinates;
}

// 연락처 정보 타입
export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
}

// 날짜 범위 타입
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// 스케줄 타입
export interface Schedule {
  dayOfWeek: number; // 0-6 (일요일-토요일)
  startTime: string; // HH:mm 형식
  endTime: string;   // HH:mm 형식
}

// 평점 타입
export interface Rating {
  score: number;      // 1-5
  maxScore: number;   // 최대 점수
  reviewCount: number;
}

// 통계 타입
export interface Statistics {
  total: number;
  active: number;
  inactive: number;
  growth: number; // 성장률 (%)
}

// 설정 타입
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface PrivacySettings {
  profileVisible: boolean;
  searchable: boolean;
  dataSharing: boolean;
}