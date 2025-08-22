/**
 * 알림 API Public Interface
 * FSD 구조: entities/notification/api
 */

export { 
  notificationApi,
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationSettings,
  updateNotificationSettings,
  getNotificationStatistics,
  sendNotification,
  broadcastNotification,
  checkForNewNotifications,
  NotificationPoller
} from './notificationApi';

// API 타입들도 함께 내보내기
export type {
  NotificationFilter,
  NotificationQueryParams,
  SendNotificationRequest,
  BroadcastNotificationRequest
} from '../model/types';