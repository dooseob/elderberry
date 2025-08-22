/**
 * Notification 엔티티 타입 정의
 * FSD 구조 + 백엔드 API 호환 알림 도메인 타입
 */

// === 기본 알림 엔티티 (백엔드 API 호환) ===
export interface Notification {
  notificationId: number;
  type: NotificationType;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
  priority: NotificationPriority;
  actionUrl?: string;
  icon: string;
  data?: Record<string, any>; // 추가 데이터
}

// === 알림 타입 (백엔드 API와 일치) ===
export enum NotificationType {
  MATCHING = 'MATCHING',
  FACILITY_UPDATE = 'FACILITY_UPDATE', 
  CHAT = 'CHAT',
  SYSTEM = 'SYSTEM',
}

// === 세부 알림 서브타입 (확장 가능) ===
export enum NotificationSubType {
  // MATCHING 관련
  MATCHING_FOUND = 'matching_found',
  MATCHING_CONFIRMED = 'matching_confirmed',
  MATCHING_CANCELLED = 'matching_cancelled',
  COORDINATOR_ASSIGNED = 'coordinator_assigned',
  
  // FACILITY_UPDATE 관련
  FACILITY_INFO_UPDATED = 'facility_info_updated',
  FACILITY_PRICE_CHANGED = 'facility_price_changed',
  FACILITY_AVAILABILITY_CHANGED = 'facility_availability_changed',
  NEW_FACILITY_RECOMMENDED = 'new_facility_recommended',
  
  // CHAT 관련
  MESSAGE_RECEIVED = 'message_received',
  MESSAGE_READ = 'message_read',
  CONVERSATION_STARTED = 'conversation_started',
  
  // SYSTEM 관련
  MAINTENANCE = 'maintenance',
  UPDATE = 'update',
  SECURITY = 'security',
  HEALTH_ASSESSMENT_DUE = 'health_assessment_due',
  PROFILE_COMPLETION_REMINDER = 'profile_completion_reminder',
}

// === 알림 우선순위 (백엔드 API와 일치) ===
export enum NotificationPriority {
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
}

// === 알림 읽음 상태 (API 필터용) ===
export enum NotificationReadStatus {
  ALL = 'ALL',
  READ = 'read', 
  UNREAD = 'UNREAD',
}

// === 알림 설정 (백엔드 API 호환) ===
export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  typeSettings: Record<string, {
    push: boolean;
    email: boolean;
    sms: boolean;
  }>;
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm 형식
    endTime: string; // HH:mm 형식
  };
  language: string;
  timezone: string;
}

// === 알림 필터 (백엔드 API 파라미터) ===
export interface NotificationFilter {
  readStatus?: NotificationReadStatus;
  notificationType?: NotificationType;
  page?: number;
  size?: number;
}

// === 알림 API 요청 파라미터 ===
export interface NotificationQueryParams {
  readStatus?: string;
  notificationType?: string;
  page?: number;
  size?: number;
}

// === 알림 통계 (백엔드 API 응답) ===
export interface NotificationSummary {
  unreadCount: number;
  totalCount: number;
  unreadByType: Record<string, number>;
  lastUpdated: string;
}

// === 페이지네이션 응답 ===
export interface NotificationPage {
  content: Notification[];
  page: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

// === 알림 발송 요청 (관리자용) ===
export interface SendNotificationRequest {
  targetUserId: string;
  type: NotificationType;
  title: string;
  content: string;
  priority?: NotificationPriority;
  actionUrl?: string;
  data?: Record<string, any>;
}

// === 대량 알림 발송 요청 ===
export interface BroadcastNotificationRequest {
  targetType: 'ALL' | 'USER_DOMESTIC' | 'USER_OVERSEAS' | 'COORDINATOR' | 'FACILITY';
  type: NotificationType;
  title: string;
  content: string;
  priority?: NotificationPriority;
  actionUrl?: string;
  data?: Record<string, any>;
}

// === API 응답 타입 ===
export interface NotificationResponse {
  notificationId: number;
  isRead: boolean;
  readAt: string;
  message: string;
}

export interface MarkAllReadResponse {
  markedCount: number;
  readAt: string;
  message: string;
}

export interface DeleteNotificationResponse {
  notificationId: number;
  deleted: boolean;
  deletedAt: string;
  message: string;
}

export interface NotificationStatistics {
  period: string;
  totalReceived: number;
  totalRead: number;
  readRate: number;
  byType: Record<string, {
    received: number;
    read: number;
    readRate: number;
  }>;
  averageResponseTime: string;
  mostActiveHour: number;
  preferredChannel: string;
}

// === UI 표시 설정 ===
export interface NotificationDisplayConfig {
  icon: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor?: string;
}

// === Toast 알림 설정 ===
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number; // milliseconds
  action?: {
    label: string;
    onClick: () => void;
  };
}

// === 타입 가드 및 유틸리티 함수 ===
export function isHighPriorityNotification(notification: Notification): boolean {
  return notification.priority === NotificationPriority.HIGH;
}

export function isUnreadNotification(notification: Notification): boolean {
  return !notification.isRead;
}

export function isSystemNotification(notification: Notification): boolean {
  return notification.type === NotificationType.SYSTEM;
}

export function isChatNotification(notification: Notification): boolean {
  return notification.type === NotificationType.CHAT;
}

export function isActionableNotification(notification: Notification): boolean {
  return !!notification.actionUrl;
}

// === 시간 유틸리티 ===
export function formatNotificationTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return '방금 전';
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}일 전`;
  
  return date.toLocaleDateString('ko-KR');
}

// === 상수 정의 ===
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  [NotificationType.MATCHING]: '매칭',
  [NotificationType.FACILITY_UPDATE]: '시설 업데이트',
  [NotificationType.CHAT]: '채팅',
  [NotificationType.SYSTEM]: '시스템',
};

export const NOTIFICATION_PRIORITY_LABELS: Record<NotificationPriority, string> = {
  [NotificationPriority.NORMAL]: '일반',
  [NotificationPriority.HIGH]: '높음',
};

export const NOTIFICATION_DISPLAY_CONFIGS: Record<NotificationType, NotificationDisplayConfig> = {
  [NotificationType.MATCHING]: {
    icon: '👥',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200'
  },
  [NotificationType.FACILITY_UPDATE]: {
    icon: '🏥', 
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    borderColor: 'border-green-200'
  },
  [NotificationType.CHAT]: {
    icon: '💬',
    color: 'purple',
    bgColor: 'bg-purple-50', 
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200'
  },
  [NotificationType.SYSTEM]: {
    icon: '⚙️',
    color: 'gray',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200'
  },
};

// === 실시간 알림 설정 ===
export const NOTIFICATION_POLLING_INTERVAL = 30000; // 30초
export const NOTIFICATION_TOAST_DURATION = 5000; // 5초
export const NOTIFICATION_MAX_DISPLAY_COUNT = 99; // 99+ 표시