/**
 * 알림 상태 관리 스토어 (Zustand)
 * 실시간 알림 관리, 필터링, 설정 관리 포함
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationSettings,
  NotificationFilter,
  NotificationSummary,
  CreateNotificationRequest,
  UpdateNotificationRequest
} from '../types/notifications';
import { normalizeError, errorLogger, ErrorContext } from '../utils/errorHandler';
import type { AppError } from '../types/errors';

interface NotificationState {
  // 데이터
  notifications: Notification[];
  summary: NotificationSummary;
  settings: NotificationSettings;
  
  // UI 상태
  isLoading: boolean;
  error: AppError | null;
  isDropdownOpen: boolean;
  hasMore: boolean;
  nextCursor?: string;
  
  // 필터 상태
  filter: NotificationFilter;
  
  // 실시간 상태
  isPolling: boolean;
  lastFetchTime?: Date;
}

interface NotificationActions {
  // 알림 조회
  fetchNotifications: (filter?: NotificationFilter, loadMore?: boolean) => Promise<void>;
  
  // 알림 읽음 처리
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  
  // 알림 삭제
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  
  // 설정 관리
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  
  // UI 상태 관리
  toggleDropdown: () => void;
  closeDropdown: () => void;
  setFilter: (filter: Partial<NotificationFilter>) => void;
  clearFilter: () => void;
  
  // 실시간 알림
  startPolling: () => void;
  stopPolling: () => void;
  addNotification: (notification: Notification) => void;
  
  // 에러 관리
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  
  // 요약 정보 업데이트
  updateSummary: () => void;
}

// 기본 설정값
const defaultSettings: NotificationSettings = {
  enabled: true,
  email: true,
  push: true,
  sms: false,
  types: {
    [NotificationType.FACILITY_MATCH_FOUND]: true,
    [NotificationType.FACILITY_MATCH_CONFIRMED]: true,
    [NotificationType.FACILITY_MATCH_CANCELLED]: true,
    [NotificationType.REVIEW_APPROVED]: true,
    [NotificationType.REVIEW_REJECTED]: true,
    [NotificationType.REVIEW_REPORTED]: false,
    [NotificationType.JOB_APPLICATION_RECEIVED]: true,
    [NotificationType.JOB_APPLICATION_APPROVED]: true,
    [NotificationType.JOB_APPLICATION_REJECTED]: true,
    [NotificationType.JOB_INTERVIEW_SCHEDULED]: true,
    [NotificationType.SYSTEM_MAINTENANCE]: true,
    [NotificationType.SYSTEM_UPDATE]: false,
    [NotificationType.ACCOUNT_SECURITY]: true,
    [NotificationType.GENERAL_INFO]: false,
    [NotificationType.PROMOTION]: false
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  }
};

// 기본 요약 정보
const defaultSummary: NotificationSummary = {
  total: 0,
  unread: 0,
  byType: Object.fromEntries(
    Object.values(NotificationType).map(type => [type, 0])
  ) as Record<NotificationType, number>,
  byPriority: {
    [NotificationPriority.LOW]: 0,
    [NotificationPriority.MEDIUM]: 0,
    [NotificationPriority.HIGH]: 0,
    [NotificationPriority.URGENT]: 0
  }
};

// 폴링 간격 (30초)
const POLLING_INTERVAL = 30000;

type NotificationStore = NotificationState & NotificationActions;

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      // 초기 상태
      notifications: [],
      summary: defaultSummary,
      settings: defaultSettings,
      isLoading: false,
      error: null,
      isDropdownOpen: false,
      hasMore: false,
      filter: {},
      isPolling: false,

      // 알림 조회
      fetchNotifications: async (filter = {}, loadMore = false) => {
        const errorContext: ErrorContext = {
          operation: 'fetchNotifications',
          context: { filter, loadMore }
        };

        try {
          if (!loadMore) {
            set({ isLoading: true, error: null });
          }

          // API 서비스 연동 시도, 실패시 목 데이터 사용
          let notifications: Notification[] = [];
          let hasMore = false;
          let nextCursor: string | undefined;

          try {
            // TODO: 백엔드 API가 준비되면 주석 해제
            // const response = await notificationService.getNotifications(filter, get().nextCursor);
            // notifications = response.notifications;
            // hasMore = response.hasMore;
            // nextCursor = response.nextCursor;
            
            // 현재는 목 데이터 사용
            throw new Error('API not implemented yet');
          } catch (apiError) {
            // 임시 목 데이터 (API 구현 후 제거)
            const mockNotifications: Notification[] = [
              {
                id: '1',
                type: NotificationType.FACILITY_MATCH_FOUND,
                title: '새로운 시설 매칭',
                message: '조건에 맞는 요양시설이 발견되었습니다.',
                read: false,
                createdAt: new Date().toISOString(),
                priority: NotificationPriority.HIGH,
                actionUrl: '/facilities/1'
              },
              {
                id: '2',
                type: NotificationType.JOB_APPLICATION_APPROVED,
                title: '구인 지원 승인',
                message: '지원하신 구인이 승인되었습니다.',
                read: true,
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                readAt: new Date().toISOString(),
                priority: NotificationPriority.MEDIUM,
                actionUrl: '/jobs/applications'
              },
              {
                id: '3',
                type: NotificationType.REVIEW_APPROVED,
                title: '리뷰 승인됨',
                message: '작성하신 리뷰가 승인되어 게시되었습니다.',
                read: false,
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                priority: NotificationPriority.MEDIUM,
                actionUrl: '/reviews'
              }
            ];
            
            // 필터 적용
            notifications = mockNotifications.filter(notification => {
              if (filter.read !== undefined && notification.read !== filter.read) return false;
              if (filter.types && !filter.types.includes(notification.type)) return false;
              if (filter.priority && notification.priority !== filter.priority) return false;
              if (filter.dateFrom) {
                const notificationDate = new Date(notification.createdAt);
                const fromDate = new Date(filter.dateFrom);
                if (notificationDate < fromDate) return false;
              }
              if (filter.dateTo) {
                const notificationDate = new Date(notification.createdAt);
                const toDate = new Date(filter.dateTo);
                if (notificationDate > toDate) return false;
              }
              return true;
            });

            hasMore = false;
          }

          const current = get();
          const newNotifications = loadMore ? 
            [...current.notifications, ...notifications] : 
            notifications;

          set({
            notifications: newNotifications,
            hasMore,
            nextCursor,
            isLoading: false,
            lastFetchTime: new Date()
          });

          // 요약 정보 업데이트
          get().updateSummary();

        } catch (error) {
          const appError = normalizeError(error, errorContext);
          errorLogger.logError(appError, errorContext);
          set({ error: appError, isLoading: false });
        }
      },

      // 알림 읽음 처리
      markAsRead: async (id: string) => {
        const errorContext: ErrorContext = {
          operation: 'markAsRead',
          context: { notificationId: id }
        };

        try {
          // TODO: API 서비스 연동
          // await notificationService.updateNotification(id, { read: true, readAt: new Date().toISOString() });

          const current = get();
          const updatedNotifications = current.notifications.map(notification =>
            notification.id === id
              ? { ...notification, read: true, readAt: new Date().toISOString() }
              : notification
          );

          set({ notifications: updatedNotifications });
          get().updateSummary();

        } catch (error) {
          const appError = normalizeError(error, errorContext);
          errorLogger.logError(appError, errorContext);
          set({ error: appError });
        }
      },

      // 모든 알림 읽음 처리
      markAllAsRead: async () => {
        const errorContext: ErrorContext = {
          operation: 'markAllAsRead',
          context: {}
        };

        try {
          // TODO: API 서비스 연동
          // await notificationService.markAllAsRead();

          const current = get();
          const now = new Date().toISOString();
          const updatedNotifications = current.notifications.map(notification => ({
            ...notification,
            read: true,
            readAt: notification.readAt || now
          }));

          set({ notifications: updatedNotifications });
          get().updateSummary();

        } catch (error) {
          const appError = normalizeError(error, errorContext);
          errorLogger.logError(appError, errorContext);
          set({ error: appError });
        }
      },

      // 알림 삭제
      deleteNotification: async (id: string) => {
        const errorContext: ErrorContext = {
          operation: 'deleteNotification',
          context: { notificationId: id }
        };

        try {
          // TODO: API 서비스 연동
          // await notificationService.deleteNotification(id);

          const current = get();
          const updatedNotifications = current.notifications.filter(
            notification => notification.id !== id
          );

          set({ notifications: updatedNotifications });
          get().updateSummary();

        } catch (error) {
          const appError = normalizeError(error, errorContext);
          errorLogger.logError(appError, errorContext);
          set({ error: appError });
        }
      },

      // 모든 알림 삭제
      clearAllNotifications: async () => {
        const errorContext: ErrorContext = {
          operation: 'clearAllNotifications',
          context: {}
        };

        try {
          // TODO: API 서비스 연동
          // await notificationService.clearAllNotifications();

          set({ notifications: [], summary: defaultSummary });

        } catch (error) {
          const appError = normalizeError(error, errorContext);
          errorLogger.logError(appError, errorContext);
          set({ error: appError });
        }
      },

      // 설정 업데이트
      updateSettings: async (newSettings: Partial<NotificationSettings>) => {
        const errorContext: ErrorContext = {
          operation: 'updateSettings',
          context: { settings: newSettings }
        };

        try {
          const current = get();
          const updatedSettings = { ...current.settings, ...newSettings };

          // TODO: API 서비스 연동
          // await notificationService.updateSettings(updatedSettings);

          set({ settings: updatedSettings });

        } catch (error) {
          const appError = normalizeError(error, errorContext);
          errorLogger.logError(appError, errorContext);
          set({ error: appError });
        }
      },

      // UI 상태 관리
      toggleDropdown: () => {
        set(state => ({ isDropdownOpen: !state.isDropdownOpen }));
      },

      closeDropdown: () => {
        set({ isDropdownOpen: false });
      },

      setFilter: (newFilter: Partial<NotificationFilter>) => {
        const current = get();
        set({ filter: { ...current.filter, ...newFilter } });
      },

      clearFilter: () => {
        set({ filter: {} });
      },

      // 실시간 알림
      startPolling: () => {
        const current = get();
        if (current.isPolling) return;

        set({ isPolling: true });

        const intervalId = setInterval(() => {
          const state = get();
          if (!state.isPolling) {
            clearInterval(intervalId);
            return;
          }
          
          // 백그라운드에서 새 알림 확인
          state.fetchNotifications(state.filter, false);
        }, POLLING_INTERVAL);

        // 스토어에 intervalId 저장 (정리를 위해)
        (window as any).notificationPollingInterval = intervalId;
      },

      stopPolling: () => {
        set({ isPolling: false });
        
        if ((window as any).notificationPollingInterval) {
          clearInterval((window as any).notificationPollingInterval);
          delete (window as any).notificationPollingInterval;
        }
      },

      addNotification: (notification: Notification) => {
        const current = get();
        set({ 
          notifications: [notification, ...current.notifications] 
        });
        get().updateSummary();
      },

      // 에러 관리
      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // 요약 정보 업데이트
      updateSummary: () => {
        const current = get();
        const notifications = current.notifications;

        const summary: NotificationSummary = {
          total: notifications.length,
          unread: notifications.filter(n => !n.read).length,
          byType: Object.fromEntries(
            Object.values(NotificationType).map(type => [
              type,
              notifications.filter(n => n.type === type).length
            ])
          ) as Record<NotificationType, number>,
          byPriority: {
            [NotificationPriority.LOW]: notifications.filter(n => n.priority === NotificationPriority.LOW).length,
            [NotificationPriority.MEDIUM]: notifications.filter(n => n.priority === NotificationPriority.MEDIUM).length,
            [NotificationPriority.HIGH]: notifications.filter(n => n.priority === NotificationPriority.HIGH).length,
            [NotificationPriority.URGENT]: notifications.filter(n => n.priority === NotificationPriority.URGENT).length
          }
        };

        set({ summary });
      }
    }),
    {
      name: 'notification-store',
      partialize: (state) => ({
        settings: state.settings,
        filter: state.filter
      })
    }
  )
);