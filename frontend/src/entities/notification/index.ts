/**
 * Notification 엔티티 Public API
 * FSD에 따른 알림 엔티티 공개 인터페이스
 */

// 기본 타입 내보내기
export type {
  Notification,
  NotificationSettings,
  NotificationTypeSettings,
  NotificationFilter,
  NotificationSearchParams,
  NotificationSummary,
  CreateNotificationRequest,
  CreateBulkNotificationRequest,
  UpdateNotificationRequest,
  NotificationListResponse,
  NotificationTemplate,
  NotificationBatch,
  BatchError,
  NotificationChannelSettings,
  NotificationHistory,
  NotificationDisplayConfig,
  NotificationAction,
  RichNotification,
} from './model/types';

// Enum 타입 내보내기
export {
  NotificationType,
  NotificationPriority,
  NotificationCategory,
  NotificationFrequency,
  BatchStatus,
  NotificationChannel,
  DeliveryStatus,
} from './model/types';

// 타입 가드 함수 내보내기
export {
  isUrgentNotification,
  isExpiredNotification,
  isExpiringSoonNotification,
  isSystemNotification,
  isActionableNotification,
  isRichNotification,
} from './model/types';

// 상수 내보내기
export {
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_PRIORITY_LABELS,
  NOTIFICATION_CATEGORY_LABELS,
  NOTIFICATION_DISPLAY_CONFIGS,
} from './model/types';