/**
 * 알림 API 서비스 - 백엔드 API와 완전 호환
 * FSD 구조: entities/notification/api
 */
import { AxiosResponse } from 'axios';
import { 
  Notification,
  NotificationSummary,
  NotificationSettings,
  NotificationFilter,
  NotificationQueryParams,
  NotificationPage,
  NotificationResponse,
  MarkAllReadResponse,
  DeleteNotificationResponse,
  NotificationStatistics,
  SendNotificationRequest,
  BroadcastNotificationRequest
} from '../model/types';

// API 클라이언트 (shared/api에서 가져옴)
import { apiClient } from '../../../shared/api/apiClient';

/**
 * 알림 목록 조회
 * GET /api/notifications
 */
export const getNotifications = async (filter: NotificationFilter = {}): Promise<NotificationPage> => {
  const params: NotificationQueryParams = {};
  
  if (filter.readStatus) {
    params.readStatus = filter.readStatus;
  }
  if (filter.notificationType) {
    params.notificationType = filter.notificationType;
  }
  if (filter.page !== undefined) {
    params.page = filter.page;
  }
  if (filter.size !== undefined) {
    params.size = filter.size;
  }

  const response: AxiosResponse<NotificationPage> = await apiClient.get('/notifications', {
    params
  });

  return response.data;
};

/**
 * 읽지 않은 알림 수 조회
 * GET /api/notifications/unread-count
 */
export const getUnreadCount = async (): Promise<NotificationSummary> => {
  const response: AxiosResponse<NotificationSummary> = await apiClient.get('/notifications/unread-count');
  return response.data;
};

/**
 * 특정 알림 읽음 처리
 * PUT /api/notifications/{id}/read
 */
export const markNotificationAsRead = async (notificationId: number): Promise<NotificationResponse> => {
  const response: AxiosResponse<NotificationResponse> = await apiClient.put(`/notifications/${notificationId}/read`);
  return response.data;
};

/**
 * 모든 알림 읽음 처리
 * PUT /api/notifications/read-all
 */
export const markAllNotificationsAsRead = async (): Promise<MarkAllReadResponse> => {
  const response: AxiosResponse<MarkAllReadResponse> = await apiClient.put('/notifications/read-all');
  return response.data;
};

/**
 * 알림 삭제
 * DELETE /api/notifications/{id}
 */
export const deleteNotification = async (notificationId: number): Promise<DeleteNotificationResponse> => {
  const response: AxiosResponse<DeleteNotificationResponse> = await apiClient.delete(`/notifications/${notificationId}`);
  return response.data;
};

/**
 * 알림 설정 조회
 * GET /api/notifications/settings
 */
export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  const response: AxiosResponse<NotificationSettings> = await apiClient.get('/notifications/settings');
  return response.data;
};

/**
 * 알림 설정 업데이트
 * PUT /api/notifications/settings
 */
export const updateNotificationSettings = async (settings: NotificationSettings): Promise<NotificationSettings> => {
  const response: AxiosResponse<NotificationSettings> = await apiClient.put('/notifications/settings', settings);
  return response.data;
};

/**
 * 알림 통계 조회
 * GET /api/notifications/statistics
 */
export const getNotificationStatistics = async (days: number = 30): Promise<NotificationStatistics> => {
  const response: AxiosResponse<NotificationStatistics> = await apiClient.get('/notifications/statistics', {
    params: { days }
  });
  return response.data;
};

/**
 * 즉시 알림 발송 (관리자용)
 * POST /api/notifications/send
 */
export const sendNotification = async (request: SendNotificationRequest): Promise<NotificationResponse> => {
  const response: AxiosResponse<NotificationResponse> = await apiClient.post('/notifications/send', request);
  return response.data;
};

/**
 * 대량 알림 발송 (관리자용) 
 * POST /api/notifications/broadcast
 */
export const broadcastNotification = async (request: BroadcastNotificationRequest): Promise<{
  broadcastId: number;
  targetCount: number;
  sentCount: number;
  failedCount: number;
  sentAt: string;
  message: string;
}> => {
  const response = await apiClient.post('/notifications/broadcast', request);
  return response.data;
};

/**
 * 실시간 알림 확인 (폴링용 - 새 알림이 있는지 확인)
 * 백엔드에 별도 API가 없으므로 unread-count를 활용
 */
export const checkForNewNotifications = async (lastCheckTime?: string): Promise<{
  hasNewNotifications: boolean;
  unreadCount: number;
  lastUpdated: string;
}> => {
  const summary = await getUnreadCount();
  
  // 마지막 확인 시간이 있다면 비교
  let hasNewNotifications = false;
  if (lastCheckTime) {
    const lastCheck = new Date(lastCheckTime);
    const lastUpdate = new Date(summary.lastUpdated);
    hasNewNotifications = lastUpdate > lastCheck;
  } else {
    // 첫 체크이거나 읽지 않은 알림이 있으면 새로운 알림으로 간주
    hasNewNotifications = summary.unreadCount > 0;
  }

  return {
    hasNewNotifications,
    unreadCount: summary.unreadCount,
    lastUpdated: summary.lastUpdated
  };
};

/**
 * 실시간 알림 폴링 클래스
 */
export class NotificationPoller {
  private intervalId: NodeJS.Timeout | null = null;
  private lastCheckTime: string | null = null;
  private onNewNotifications?: (data: { unreadCount: number; hasNew: boolean }) => void;

  constructor(onNewNotifications?: (data: { unreadCount: number; hasNew: boolean }) => void) {
    this.onNewNotifications = onNewNotifications;
  }

  /**
   * 폴링 시작
   */
  start(intervalMs: number = 30000): void {
    if (this.intervalId) {
      this.stop();
    }

    // 즉시 한번 체크
    this.checkNotifications();

    this.intervalId = setInterval(() => {
      this.checkNotifications();
    }, intervalMs);
  }

  /**
   * 폴링 중지
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * 알림 체크 실행
   */
  private async checkNotifications(): Promise<void> {
    try {
      const result = await checkForNewNotifications(this.lastCheckTime || undefined);
      
      if (this.onNewNotifications) {
        this.onNewNotifications({
          unreadCount: result.unreadCount,
          hasNew: result.hasNewNotifications
        });
      }

      // 마지막 체크 시간 업데이트
      this.lastCheckTime = new Date().toISOString();
    } catch (error) {
      console.error('알림 폴링 중 오류:', error);
    }
  }

  /**
   * 마지막 체크 시간 재설정
   */
  resetLastCheckTime(): void {
    this.lastCheckTime = null;
  }
}

// 기본 내보내기 객체
export const notificationApi = {
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
};

export default notificationApi;