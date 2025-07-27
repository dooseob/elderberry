/**
 * 알림 시스템 타입 정의
 */

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>; // 알림 관련 추가 데이터
  read: boolean;
  createdAt: string;
  readAt?: string;
  priority: NotificationPriority;
  actionUrl?: string; // 알림 클릭 시 이동할 URL
  expiresAt?: string; // 만료 시간
}

export enum NotificationType {
  // 시설 매칭 관련
  FACILITY_MATCH_FOUND = 'facility_match_found',
  FACILITY_MATCH_CONFIRMED = 'facility_match_confirmed',
  FACILITY_MATCH_CANCELLED = 'facility_match_cancelled',
  
  // 리뷰 관련
  REVIEW_APPROVED = 'review_approved',
  REVIEW_REJECTED = 'review_rejected',
  REVIEW_REPORTED = 'review_reported',
  
  // 구인 관련
  JOB_APPLICATION_RECEIVED = 'job_application_received',
  JOB_APPLICATION_APPROVED = 'job_application_approved',
  JOB_APPLICATION_REJECTED = 'job_application_rejected',
  JOB_INTERVIEW_SCHEDULED = 'job_interview_scheduled',
  
  // 시스템 알림
  SYSTEM_MAINTENANCE = 'system_maintenance',
  SYSTEM_UPDATE = 'system_update',
  ACCOUNT_SECURITY = 'account_security',
  
  // 기타
  GENERAL_INFO = 'general_info',
  PROMOTION = 'promotion'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface NotificationSettings {
  enabled: boolean;
  email: boolean;
  push: boolean;
  sms: boolean;
  types: Record<NotificationType, boolean>;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm 형식
    end: string; // HH:mm 형식
  };
}

export interface NotificationFilter {
  read?: boolean;
  types?: NotificationType[];
  priority?: NotificationPriority;
  dateFrom?: string;
  dateTo?: string;
}

export interface NotificationSummary {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
}

export interface CreateNotificationRequest {
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority: NotificationPriority;
  actionUrl?: string;
  expiresAt?: string;
  targetUserId?: string; // 특정 사용자에게 보내는 경우
}

export interface UpdateNotificationRequest {
  read?: boolean;
  readAt?: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  summary: NotificationSummary;
  hasMore: boolean;
  nextCursor?: string;
}

// 알림 표시용 UI 타입들
export interface NotificationDisplayConfig {
  icon: string;
  color: string;
  bgColor: string;
  textColor: string;
}

export const NotificationDisplayConfigs: Record<NotificationType, NotificationDisplayConfig> = {
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
  }
};