/**
 * 컴포넌트 관련 타입 정의
 * Props 타입 강화 및 제네릭 타입 활용
 */
import { ReactNode, HTMLAttributes, ButtonHTMLAttributes, InputHTMLAttributes, FormHTMLAttributes } from 'react';
import { ApiState, AsyncState } from './api';

// 기본 컴포넌트 Props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  'data-testid'?: string;
}

// 크기 변형
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// 색상 변형
export type ComponentVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info'
  | 'elderberry'
  | 'care';

// 상태 변형
export type ComponentState = 'default' | 'hover' | 'active' | 'disabled' | 'loading';

// 방향성
export type Direction = 'horizontal' | 'vertical';
export type Alignment = 'start' | 'center' | 'end' | 'stretch';
export type Justify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

// 응답성 설정
export interface ResponsiveProps {
  xs?: unknown;
  sm?: unknown;
  md?: unknown;
  lg?: unknown;
  xl?: unknown;
}

// 애니메이션 설정
export interface AnimationProps {
  animate?: boolean;
  duration?: number;
  delay?: number;
  easing?: string;
}

// 버튼 컴포넌트 Props
export interface ButtonProps extends 
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'>,
  BaseComponentProps,
  AnimationProps {
  variant?: ComponentVariant;
  size?: ComponentSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  href?: string; // 링크 버튼용
  external?: boolean; // 외부 링크용
}

// 입력 컴포넌트 Props
export interface InputProps extends 
  Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
  BaseComponentProps {
  label?: string;
  error?: string;
  helpText?: string;
  size?: ComponentSize;
  variant?: 'outline' | 'filled' | 'underline';
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  clearable?: boolean;
  onClear?: () => void;
}

// 카드 컴포넌트 Props
export interface CardProps extends 
  HTMLAttributes<HTMLDivElement>,
  BaseComponentProps,
  AnimationProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: ComponentSize;
  clickable?: boolean;
  loading?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
}

// 모달 컴포넌트 Props
export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ComponentSize | 'fit';
  closable?: boolean;
  backdrop?: boolean;
  backdropClosable?: boolean;
  escapeKeyClosable?: boolean;
  centered?: boolean;
  scrollable?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
}

// 테이블 컬럼 정의
export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, record: T, index: number) => ReactNode;
  fixed?: 'left' | 'right';
  ellipsis?: boolean;
}

// 테이블 Props
export interface TableProps<T = Record<string, unknown>> extends 
  BaseComponentProps {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  rowSelection?: {
    selectedRowKeys: (string | number)[];
    onChange: (selectedRowKeys: (string | number)[], selectedRows: T[]) => void;
    type?: 'checkbox' | 'radio';
  };
  expandable?: {
    expandedRowKeys: (string | number)[];
    onExpand: (expanded: boolean, record: T) => void;
    expandIcon?: (props: { expanded: boolean; record: T }) => ReactNode;
    expandedRowRender: (record: T, index: number) => ReactNode;
  };
  onRow?: (record: T, index: number) => HTMLAttributes<HTMLTableRowElement>;
  scroll?: { x?: number | string; y?: number | string };
  size?: ComponentSize;
  bordered?: boolean;
  striped?: boolean;
  hoverable?: boolean;
}

// 폼 필드 Props
export interface FormFieldProps<T = unknown> extends BaseComponentProps {
  name: string;
  label?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  value?: T;
  onChange?: (value: T) => void;
  onBlur?: () => void;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
}

// 폼 Props
export interface FormProps extends 
  FormHTMLAttributes<HTMLFormElement>,
  BaseComponentProps {
  layout?: 'horizontal' | 'vertical' | 'inline';
  labelWidth?: number | string;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  onSubmit?: (values: Record<string, unknown>) => void | Promise<void>;
  onReset?: () => void;
  initialValues?: Record<string, unknown>;
  loading?: boolean;
}

// 드롭다운 옵션
export interface SelectOption<T = unknown> {
  label: string;
  value: T;
  disabled?: boolean;
  icon?: ReactNode;
  description?: string;
  group?: string;
}

// 셀렉트 Props
export interface SelectProps<T = unknown> extends 
  Omit<FormFieldProps<T>, 'onChange'>,
  BaseComponentProps {
  options: SelectOption<T>[];
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  remote?: boolean;
  onSearch?: (query: string) => void;
  onChange?: (value: T | T[]) => void;
  onClear?: () => void;
  placeholder?: string;
  emptyText?: string;
  maxTagCount?: number;
  size?: ComponentSize;
}

// 알림 Props
export interface NotificationProps extends BaseComponentProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  closable?: boolean;
  onClose?: () => void;
  action?: ReactNode;
  icon?: ReactNode;
}

// 로딩 Props
export interface LoadingProps extends BaseComponentProps {
  loading: boolean;
  size?: ComponentSize;
  text?: string;
  overlay?: boolean;
  tip?: string;
  delay?: number;
}

// 빈 상태 Props
export interface EmptyStateProps extends BaseComponentProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  image?: string;
}

// 에러 경계 Props
export interface ErrorBoundaryProps extends BaseComponentProps {
  fallback?: ReactNode | ((error: Error, errorInfo: unknown) => ReactNode);
  onError?: (error: Error, errorInfo: unknown) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: unknown[];
}

// 무한 스크롤 Props
export interface InfiniteScrollProps<T> extends BaseComponentProps {
  data: T[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  renderItem: (item: T, index: number) => ReactNode;
  loadingComponent?: ReactNode;
  endMessage?: ReactNode;
  threshold?: number;
}

// 가상화 리스트 Props
export interface VirtualListProps<T> extends BaseComponentProps {
  data: T[];
  itemHeight: number | ((index: number) => number);
  height: number;
  renderItem: (item: T, index: number, style: React.CSSProperties) => ReactNode;
  overscan?: number;
  scrollToIndex?: number;
  onScroll?: (scrollTop: number) => void;
}

// 데이터 페처 컴포넌트 Props
export interface DataFetcherProps<T> extends BaseComponentProps {
  url?: string;
  fetchFn?: () => Promise<T>;
  dependencies?: unknown[];
  fallback?: ReactNode;
  errorFallback?: ReactNode | ((error: Error) => ReactNode);
  children: (state: AsyncState<T>) => ReactNode;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  retry?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

// 조건부 렌더링 Props
export interface ConditionalProps extends BaseComponentProps {
  condition: boolean;
  fallback?: ReactNode;
}

// 지연 로딩 Props
export interface LazyComponentProps extends BaseComponentProps {
  fallback?: ReactNode;
  errorFallback?: ReactNode;
  delay?: number;
  preload?: boolean;
}

// 상태 관리 Props (Zustand 등과 연동)
export interface StateConnectedProps<T> {
  selector: (state: T) => unknown;
  equalityFn?: (a: unknown, b: unknown) => boolean;
}

// 테마 Props
export interface ThemeProps {
  theme?: 'light' | 'dark' | 'auto';
  colorScheme?: Record<string, string>;
}

// 접근성 Props
export interface AccessibilityProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean;
  'aria-disabled'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  role?: string;
  tabIndex?: number;
}

// 전체 컴포넌트 Props (모든 공통 속성 포함)
export interface FullComponentProps extends 
  BaseComponentProps,
  AnimationProps,
  AccessibilityProps,
  ThemeProps {
  variant?: ComponentVariant;
  size?: ComponentSize;
  state?: ComponentState;
  loading?: boolean;
  disabled?: boolean;
  visible?: boolean;
}

// 컴포넌트 팩토리 타입
export type ComponentFactory<P = {}> = (props: P & BaseComponentProps) => JSX.Element;

// HOC 타입
export type HigherOrderComponent<P = {}, Q = {}> = (
  Component: ComponentFactory<P>
) => ComponentFactory<P & Q>;

// 렌더 프롭 타입
export type RenderProp<T> = (props: T) => ReactNode;

// 복합 컴포넌트 패턴을 위한 타입
export interface CompoundComponent<T> {
  (props: T): JSX.Element;
  displayName?: string;
}

// 타입 가드 함수들
export function hasChildren(props: object): props is { children: ReactNode } {
  return 'children' in props;
}

export function hasClassName(props: object): props is { className: string } {
  return 'className' in props && typeof (props as { className: unknown }).className === 'string';
}

export function isClickable(props: object): props is { onClick: () => void } {
  return 'onClick' in props && typeof (props as { onClick: unknown }).onClick === 'function';
}

// 컴포넌트 상태 유틸리티 타입
export type ComponentWithState<T> = T & {
  state: ApiState<unknown>;
  setState: (state: Partial<ApiState<unknown>>) => void;
};

// 이벤트 핸들러 타입들
export type ClickHandler = (event: React.MouseEvent) => void;
export type ChangeHandler<T = string> = (value: T, event?: React.ChangeEvent) => void;
export type SubmitHandler = (event: React.FormEvent) => void;
export type KeyboardHandler = (event: React.KeyboardEvent) => void;
export type FocusHandler = (event: React.FocusEvent) => void;

// 제네릭 이벤트 핸들러
export type EventHandler<T = Event> = (event: T) => void;
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

// 폼 관련 타입들
export type FormValues = Record<string, unknown>;
export type FormErrors = Record<string, string>;
export type FormTouched = Record<string, boolean>;

export interface FormState {
  values: FormValues;
  errors: FormErrors;
  touched: FormTouched;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

// 유효성 검증 타입
export type ValidationRule<T = unknown> = (value: T) => string | undefined;
export type FieldValidator<T = unknown> = ValidationRule<T> | ValidationRule<T>[];
export type FormValidator = (values: FormValues) => FormErrors;

// 필드 메타데이터
export interface FieldMeta {
  name: string;
  value: unknown;
  error?: string;
  touched: boolean;
  dirty: boolean;
  visited: boolean;
}

// 필드 헬퍼
export interface FieldHelpers {
  setValue: (value: unknown, shouldValidate?: boolean) => void;
  setTouched: (touched: boolean, shouldValidate?: boolean) => void;
  setError: (error: string) => void;
}

// 필드 Props (Formik 스타일)
export interface FieldProps<T = unknown> {
  field: {
    name: string;
    value: T;
    onChange: ChangeHandler<T>;
    onBlur: FocusHandler;
  };
  form: FormState & {
    setFieldValue: (field: string, value: unknown, shouldValidate?: boolean) => void;
    setFieldTouched: (field: string, touched?: boolean, shouldValidate?: boolean) => void;
    setFieldError: (field: string, error: string) => void;
  };
  meta: FieldMeta;
}

// 커스텀 훅 반환 타입들
export interface UseToggleResult {
  value: boolean;
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
  setValue: (value: boolean) => void;
}

export interface UseCounterResult {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  set: (value: number) => void;
}

export interface UseAsyncResult<T> extends AsyncState<T> {
  execute: (...args: unknown[]) => Promise<T>;
  reset: () => void;
}

// 컴포넌트 설정 타입
export interface ComponentConfig {
  defaultProps: Record<string, unknown>;
  variants: Record<string, Record<string, unknown>>;
  sizes: Record<string, Record<string, unknown>>;
  themes: Record<string, Record<string, unknown>>;
}