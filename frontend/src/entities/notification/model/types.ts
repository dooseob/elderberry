/**
 * Notification 엔티티 타입 정의
 * FSD 구조에 맞춘 알림 도메인 타입
 */
import { BaseEntity } from '../../../shared/types/common';

// === 기본 알림 엔티티 ===
export interface Notification extends BaseEntity {
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>; // 알림 관련 추가 데이터
  read: boolean;
  readAt?: string;
  priority: NotificationPriority;
  actionUrl?: string; // 알림 클릭 시 이동할 URL
  expiresAt?: string; // 만료 시간
  userId: string; // 알림 대상 사용자
  category: NotificationCategory;
}

// === 알림 타입 enum ===
export enum NotificationType {
  // 시설 매칭 관련
  FACILITY_MATCH_FOUND = 'facility_match_found',
  FACILITY_MATCH_CONFIRMED = 'facility_match_confirmed',
  FACILITY_MATCH_CANCELLED = 'facility_match_cancelled',
  FACILITY_VISIT_SCHEDULED = 'facility_visit_scheduled',
  
  // 건강 평가 관련
  HEALTH_ASSESSMENT_DUE = 'health_assessment_due',
  HEALTH_ASSESSMENT_COMPLETED = 'health_assessment_completed',
  HEALTH_SCORE_CHANGED = 'health_score_changed',
  CARE_PLAN_UPDATE = 'care_plan_update',
  
  // 리뷰 관련
  REVIEW_APPROVED = 'review_approved',
  REVIEW_REJECTED = 'review_rejected',
  REVIEW_REPORTED = 'review_reported',
  REVIEW_RESPONSE_RECEIVED = 'review_response_received',
  
  // 구인 관련
  JOB_APPLICATION_RECEIVED = 'job_application_received',
  JOB_APPLICATION_APPROVED = 'job_application_approved',
  JOB_APPLICATION_REJECTED = 'job_application_rejected',
  JOB_INTERVIEW_SCHEDULED = 'job_interview_scheduled',
  JOB_OFFER_RECEIVED = 'job_offer_received',
  
  // 프로필 관련
  PROFILE_COMPLETION_REMINDER = 'profile_completion_reminder',
  PROFILE_VERIFICATION_COMPLETED = 'profile_verification_completed',
  DOCUMENT_EXPIRY_WARNING = 'document_expiry_warning',
  
  // 시스템 알림
  SYSTEM_MAINTENANCE = 'system_maintenance',
  SYSTEM_UPDATE = 'system_update',
  ACCOUNT_SECURITY = 'account_security',
  PASSWORD_EXPIRY_WARNING = 'password_expiry_warning',
  
  // 커뮤니티 관련
  MESSAGE_RECEIVED = 'message_received',
  COMMENT_RECEIVED = 'comment_received',
  MENTION_RECEIVED = 'mention_received',
  
  // 기타
  GENERAL_INFO = 'general_info',
  PROMOTION = 'promotion',
  EVENT_REMINDER = 'event_reminder',
  PAYMENT_DUE = 'payment_due',
  PAYMENT_COMPLETED = 'payment_completed',
}

// === 알림 우선순위 enum ===
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// === 알림 카테고리 enum ===
export enum NotificationCategory {
  FACILITY = 'facility',
  HEALTH = 'health',
  PROFILE = 'profile',
  JOB = 'job',
  REVIEW = 'review',
  SYSTEM = 'system',
  COMMUNITY = 'community',
  PAYMENT = 'payment',
  GENERAL = 'general',
}

// === 알림 설정 ===
export interface NotificationSettings {
  userId: string;
  enabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  typeSettings: Record<NotificationType, NotificationTypeSettings>;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm 형식
    end: string; // HH:mm 형식
    timezone: string;
  };
  frequency: NotificationFrequency;
  languages: string[];
}

export interface NotificationTypeSettings {
  enabled: boolean;
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
}

export enum NotificationFrequency {
  IMMEDIATE = 'immediate',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
}

// === 알림 필터 ===
export interface NotificationFilter {
  read?: boolean;
  types?: NotificationType[];
  categories?: NotificationCategory[];
  priority?: NotificationPriority[];
  dateFrom?: string;
  dateTo?: string;
  hasAction?: boolean;
  isExpired?: boolean;
}

// === 알림 검색 파라미터 ===
export interface NotificationSearchParams extends NotificationFilter {
  userId: string;
  page?: number;
  size?: number;
  sortBy?: 'createdAt' | 'priority' | 'read' | 'expiresAt';
  sortDirection?: 'asc' | 'desc';
}

// === 알림 통계 ===
export interface NotificationSummary {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byCategory: Record<NotificationCategory, number>;
  byPriority: Record<NotificationPriority, number>;
  urgent: number;
  expiringSoon: number;
  expired: number;
}

// === 알림 생성 요청 ===
export interface CreateNotificationRequest {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority: NotificationPriority;
  actionUrl?: string;
  expiresAt?: string;
  sendEmail?: boolean;
  sendPush?: boolean;
  sendSms?: boolean;
  scheduledFor?: string; // 예약 발송
}

// === 알림 일괄 생성 요청 ===
export interface CreateBulkNotificationRequest {
  userIds: string[];
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority: NotificationPriority;
  actionUrl?: string;
  expiresAt?: string;
  sendEmail?: boolean;
  sendPush?: boolean;
  sendSms?: boolean;
  scheduledFor?: string;
}

// === 알림 업데이트 요청 ===
export interface UpdateNotificationRequest {
  read?: boolean;
  readAt?: string;
  archived?: boolean;
  archivedAt?: string;
}

// === 알림 응답 ===
export interface NotificationListResponse {
  notifications: Notification[];
  summary: NotificationSummary;
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  hasMore: boolean;
  nextCursor?: string;
}

// === 알림 템플릿 ===
export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  name: string;
  titleTemplate: string;
  messageTemplate: string;
  variables: string[];
  defaultPriority: NotificationPriority;
  category: NotificationCategory;
  isActive: boolean;
  languages: Record<string, {
    title: string;
    message: string;
  }>;
}

// === 알림 배치 작업 ===
export interface NotificationBatch {
  id: string;
  name: string;
  description?: string;
  type: NotificationType;
  targetUserIds: string[];
  templateId: string;
  variables: Record<string, any>;
  status: BatchStatus;
  scheduledAt?: string;
  processedAt?: string;
  completedAt?: string;
  totalUsers: number;
  successCount: number;
  failureCount: number;
  errors: BatchError[];
}

export enum BatchStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface BatchError {
  userId: string;
  error: string;
  timestamp: string;
}

// === 알림 채널 ===
export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
  WEBHOOK = 'webhook',
}

export interface NotificationChannelSettings {
  channel: NotificationChannel;
  enabled: boolean;
  config: Record<string, any>;
  retryPolicy: {
    maxRetries: number;
    retryDelay: number; // milliseconds
    backoffStrategy: 'linear' | 'exponential';
  };
}

// === 알림 히스토리 ===
export interface NotificationHistory {
  id: string;
  notificationId: string;
  userId: string;
  channel: NotificationChannel;
  status: DeliveryStatus;
  attempts: number;
  lastAttemptAt: string;
  deliveredAt?: string;
  error?: string;
  response?: Record<string, any>;
}

export enum DeliveryStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  BOUNCED = 'bounced',
  OPENED = 'opened',
  CLICKED = 'clicked',
}

// === 알림 표시 설정 ===
export interface NotificationDisplayConfig {
  icon: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor?: string;
  avatar?: string;
  showBadge?: boolean;
}

// === 알림 액션 ===
export interface NotificationAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  url?: string;
  action?: string;
  data?: Record<string, any>;
}

// === 리치 알림 ===
export interface RichNotification extends Notification {
  imageUrl?: string;
  videoUrl?: string;
  actions: NotificationAction[];
  customData: Record<string, any>;
}

// === 타입 가드 함수들 ===
export function isUrgentNotification(notification: Notification): boolean {
  return notification.priority === NotificationPriority.URGENT;
}

export function isExpiredNotification(notification: Notification): boolean {
  if (!notification.expiresAt) return false;
  return new Date(notification.expiresAt) < new Date();
}

export function isExpiringSoonNotification(notification: Notification, hoursThreshold: number = 24): boolean {
  if (!notification.expiresAt) return false;
  const expiryTime = new Date(notification.expiresAt);
  const threshold = new Date();
  threshold.setHours(threshold.getHours() + hoursThreshold);
  return expiryTime <= threshold && expiryTime > new Date();
}

export function isSystemNotification(notification: Notification): boolean {
  return notification.category === NotificationCategory.SYSTEM;
}

export function isActionableNotification(notification: Notification): boolean {
  return !!notification.actionUrl;
}

export function isRichNotification(notification: Notification): notification is RichNotification {
  return 'actions' in notification && Array.isArray((notification as any).actions);
}

// === 상수 정의 ===
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  [NotificationType.FACILITY_MATCH_FOUND]: '시설 매칭 발견',
  [NotificationType.FACILITY_MATCH_CONFIRMED]: '시설 매칭 확정',
  [NotificationType.FACILITY_MATCH_CANCELLED]: '시설 매칭 취소',
  [NotificationType.FACILITY_VISIT_SCHEDULED]: '시설 방문 예약',
  [NotificationType.HEALTH_ASSESSMENT_DUE]: '건강 평가 예정',
  [NotificationType.HEALTH_ASSESSMENT_COMPLETED]: '건강 평가 완료',
  [NotificationType.HEALTH_SCORE_CHANGED]: '건강 점수 변경',
  [NotificationType.CARE_PLAN_UPDATE]: '케어 플랜 업데이트',
  [NotificationType.REVIEW_APPROVED]: '리뷰 승인',
  [NotificationType.REVIEW_REJECTED]: '리뷰 거절',
  [NotificationType.REVIEW_REPORTED]: '리뷰 신고',
  [NotificationType.REVIEW_RESPONSE_RECEIVED]: '리뷰 응답 수신',
  [NotificationType.JOB_APPLICATION_RECEIVED]: '구인 지원 접수',
  [NotificationType.JOB_APPLICATION_APPROVED]: '구인 지원 승인',
  [NotificationType.JOB_APPLICATION_REJECTED]: '구인 지원 거절',
  [NotificationType.JOB_INTERVIEW_SCHEDULED]: '면접 일정 확정',
  [NotificationType.JOB_OFFER_RECEIVED]: '채용 제안 수신',
  [NotificationType.PROFILE_COMPLETION_REMINDER]: '프로필 완성 알림',
  [NotificationType.PROFILE_VERIFICATION_COMPLETED]: '프로필 인증 완료',
  [NotificationType.DOCUMENT_EXPIRY_WARNING]: '문서 만료 경고',
  [NotificationType.SYSTEM_MAINTENANCE]: '시스템 점검',
  [NotificationType.SYSTEM_UPDATE]: '시스템 업데이트',
  [NotificationType.ACCOUNT_SECURITY]: '계정 보안',
  [NotificationType.PASSWORD_EXPIRY_WARNING]: '비밀번호 만료 경고',
  [NotificationType.MESSAGE_RECEIVED]: '메시지 수신',
  [NotificationType.COMMENT_RECEIVED]: '댓글 수신',
  [NotificationType.MENTION_RECEIVED]: '멘션 수신',
  [NotificationType.GENERAL_INFO]: '일반 정보',
  [NotificationType.PROMOTION]: '프로모션',
  [NotificationType.EVENT_REMINDER]: '이벤트 알림',
  [NotificationType.PAYMENT_DUE]: '결제 예정',
  [NotificationType.PAYMENT_COMPLETED]: '결제 완료',
};

export const NOTIFICATION_PRIORITY_LABELS: Record<NotificationPriority, string> = {
  [NotificationPriority.LOW]: '낮음',
  [NotificationPriority.MEDIUM]: '보통',
  [NotificationPriority.HIGH]: '높음',
  [NotificationPriority.URGENT]: '긴급',
};

export const NOTIFICATION_CATEGORY_LABELS: Record<NotificationCategory, string> = {
  [NotificationCategory.FACILITY]: '시설',
  [NotificationCategory.HEALTH]: '건강',
  [NotificationCategory.PROFILE]: '프로필',
  [NotificationCategory.JOB]: '구인',
  [NotificationCategory.REVIEW]: '리뷰',
  [NotificationCategory.SYSTEM]: '시스템',
  [NotificationCategory.COMMUNITY]: '커뮤니티',
  [NotificationCategory.PAYMENT]: '결제',
  [NotificationCategory.GENERAL]: '일반',
};

export const NOTIFICATION_DISPLAY_CONFIGS: Record<NotificationType, NotificationDisplayConfig> = {
  [NotificationType.FACILITY_MATCH_FOUND]: {
    icon: '🏥',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  [NotificationType.FACILITY_MATCH_CONFIRMED]: {
    icon: '✅',
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600'
  },
  [NotificationType.FACILITY_MATCH_CANCELLED]: {
    icon: '❌',
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600'
  },
  [NotificationType.FACILITY_VISIT_SCHEDULED]: {
    icon: '📅',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  [NotificationType.HEALTH_ASSESSMENT_DUE]: {
    icon: '🩺',
    color: 'orange',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600'
  },
  [NotificationType.HEALTH_ASSESSMENT_COMPLETED]: {
    icon: '✅',
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600'
  },
  [NotificationType.HEALTH_SCORE_CHANGED]: {
    icon: '📊',
    color: 'purple',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600'
  },
  [NotificationType.CARE_PLAN_UPDATE]: {
    icon: '📋',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  [NotificationType.REVIEW_APPROVED]: {
    icon: '⭐',
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-600'
  },
  [NotificationType.REVIEW_REJECTED]: {
    icon: '⚠️',
    color: 'orange',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600'
  },
  [NotificationType.REVIEW_REPORTED]: {
    icon: '🚨',
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600'
  },
  [NotificationType.REVIEW_RESPONSE_RECEIVED]: {
    icon: '💬',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  [NotificationType.JOB_APPLICATION_RECEIVED]: {
    icon: '📝',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  [NotificationType.JOB_APPLICATION_APPROVED]: {
    icon: '🎉',
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600'
  },
  [NotificationType.JOB_APPLICATION_REJECTED]: {
    icon: '📋',
    color: 'gray',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-600'
  },
  [NotificationType.JOB_INTERVIEW_SCHEDULED]: {
    icon: '📅',
    color: 'purple',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600'
  },
  [NotificationType.JOB_OFFER_RECEIVED]: {
    icon: '💼',
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600'
  },
  [NotificationType.PROFILE_COMPLETION_REMINDER]: {
    icon: '👤',
    color: 'orange',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600'
  },
  [NotificationType.PROFILE_VERIFICATION_COMPLETED]: {
    icon: '✅',
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600'
  },
  [NotificationType.DOCUMENT_EXPIRY_WARNING]: {
    icon: '⚠️',
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-600'
  },
  [NotificationType.SYSTEM_MAINTENANCE]: {
    icon: '🔧',
    color: 'gray',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-600'
  },
  [NotificationType.SYSTEM_UPDATE]: {
    icon: '🔄',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  [NotificationType.ACCOUNT_SECURITY]: {
    icon: '🔒',
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600'
  },
  [NotificationType.PASSWORD_EXPIRY_WARNING]: {
    icon: '🔑',
    color: 'orange',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600'
  },
  [NotificationType.MESSAGE_RECEIVED]: {
    icon: '💬',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  [NotificationType.COMMENT_RECEIVED]: {
    icon: '💭',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  [NotificationType.MENTION_RECEIVED]: {
    icon: '📢',
    color: 'purple',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600'
  },
  [NotificationType.GENERAL_INFO]: {
    icon: 'ℹ️',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  [NotificationType.PROMOTION]: {
    icon: '🎁',
    color: 'purple',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600'
  },
  [NotificationType.EVENT_REMINDER]: {
    icon: '📅',
    color: 'orange',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600'
  },
  [NotificationType.PAYMENT_DUE]: {
    icon: '💳',
    color: 'orange',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600'
  },
  [NotificationType.PAYMENT_COMPLETED]: {
    icon: '✅',
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600'
  },
};