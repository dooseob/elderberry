/**
 * 알림 상태 관리 스토어 (Zustand)
 * FSD 구조: entities/notification/model
 * 백엔드 API 완전 호환 + 실시간 폴링 시스템
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationReadStatus,
  NotificationSettings,
  NotificationFilter,
  NotificationSummary,
  NotificationPage,
  NOTIFICATION_POLLING_INTERVAL
} from './types';
import { 
  notificationApi,
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationSettings,
  updateNotificationSettings,
  NotificationPoller
} from '../api';

// === 스토어 상태 인터페이스 ===
interface NotificationState {
  // 데이터
  notifications: Notification[];
  summary: NotificationSummary;
  settings: NotificationSettings | null;
  
  // UI 상태
  isLoading: boolean;
  error: string | null;
  isDropdownOpen: boolean;
  
  // 페이지네이션
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  
  // 필터 상태
  filter: NotificationFilter;
  
  // 실시간 상태
  isPolling: boolean;
  lastFetchTime: string | null;
  poller: NotificationPoller | null;
}

// === 스토어 액션 인터페이스 ===
interface NotificationActions {
  // 데이터 조회
  fetchNotifications: (filter?: NotificationFilter, loadMore?: boolean) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  
  // 알림 조작
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (notificationId: number) => Promise<void>;
  
  // 설정 관리
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: NotificationSettings) => Promise<void>;
  
  // UI 상태 관리
  toggleDropdown: () => void;
  closeDropdown: () => void;
  setFilter: (filter: Partial<NotificationFilter>) => void;
  clearFilter: () => void;
  
  // 실시간 기능
  startPolling: () => void;
  stopPolling: () => void;
  addRealtimeNotification: (notification: Notification) => void;
  
  // 에러 관리
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  
  // 유틸리티
  reset: () => void;
}

// === 기본 상태값 ===
const initialState: NotificationState = {
  notifications: [],
  summary: {
    unreadCount: 0,
    totalCount: 0,
    unreadByType: {},
    lastUpdated: new Date().toISOString()
  },
  settings: null,
  isLoading: false,
  error: null,
  isDropdownOpen: false,
  currentPage: 0,
  totalPages: 0,
  hasMore: false,
  filter: {
    readStatus: NotificationReadStatus.ALL,
    page: 0,
    size: 20
  },
  isPolling: false,
  lastFetchTime: null,
  poller: null
};

// === Zustand 스토어 생성 ===
export const useNotificationStore = create<NotificationState & NotificationActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // === 데이터 조회 ===
      fetchNotifications: async (filter = {}, loadMore = false) => {
        try {
          if (!loadMore) {
            set({ isLoading: true, error: null });
          }

          const currentState = get();
          const mergedFilter = { ...currentState.filter, ...filter };
          
          // 무한 스크롤을 위한 페이지 설정
          if (loadMore) {
            mergedFilter.page = (mergedFilter.page || 0) + 1;
          } else {
            mergedFilter.page = 0;
          }

          const response: NotificationPage = await getNotifications(mergedFilter);
          
          set(state => ({
            notifications: loadMore 
              ? [...state.notifications, ...response.content] 
              : response.content,
            currentPage: response.page.number,
            totalPages: response.page.totalPages,
            hasMore: response.page.number < response.page.totalPages - 1,
            filter: mergedFilter,
            isLoading: false,
            lastFetchTime: new Date().toISOString()
          }));

          // 읽지 않은 알림 수도 함께 업데이트
          get().fetchUnreadCount();

        } catch (error) {
          console.error('알림 목록 조회 실패:', error);
          set({ 
            error: error instanceof Error ? error.message : '알림을 불러오는데 실패했습니다.',
            isLoading: false 
          });
        }
      },

      fetchUnreadCount: async () => {
        try {
          const summary = await getUnreadCount();
          set({ summary });
        } catch (error) {
          console.error('읽지 않은 알림 수 조회 실패:', error);
        }
      },

      // === 알림 조작 ===
      markAsRead: async (notificationId: number) => {
        try {
          await markNotificationAsRead(notificationId);
          
          // 로컬 상태 업데이트
          set(state => ({
            notifications: state.notifications.map(notification =>
              notification.notificationId === notificationId
                ? { ...notification, isRead: true, readAt: new Date().toISOString() }
                : notification
            )
          }));

          // 요약 정보 업데이트
          get().fetchUnreadCount();
          
        } catch (error) {
          console.error('알림 읽음 처리 실패:', error);
          set({ error: '알림 읽음 처리에 실패했습니다.' });
        }
      },

      markAllAsRead: async () => {
        try {
          await markAllNotificationsAsRead();
          
          // 모든 알림을 읽음으로 표시
          const now = new Date().toISOString();
          set(state => ({
            notifications: state.notifications.map(notification => ({
              ...notification,
              isRead: true,
              readAt: notification.readAt || now
            }))
          }));

          // 요약 정보 업데이트
          get().fetchUnreadCount();
          
        } catch (error) {
          console.error('모든 알림 읽음 처리 실패:', error);
          set({ error: '모든 알림 읽음 처리에 실패했습니다.' });
        }
      },

      removeNotification: async (notificationId: number) => {
        try {
          await deleteNotification(notificationId);
          
          // 로컬에서 제거
          set(state => ({
            notifications: state.notifications.filter(
              notification => notification.notificationId !== notificationId
            )
          }));

          // 요약 정보 업데이트
          get().fetchUnreadCount();
          
        } catch (error) {
          console.error('알림 삭제 실패:', error);
          set({ error: '알림 삭제에 실패했습니다.' });
        }
      },

      // === 설정 관리 ===
      fetchSettings: async () => {
        try {
          const settings = await getNotificationSettings();
          set({ settings });
        } catch (error) {
          console.error('알림 설정 조회 실패:', error);
          set({ error: '알림 설정을 불러오는데 실패했습니다.' });
        }
      },

      updateSettings: async (settings: NotificationSettings) => {
        try {
          const updatedSettings = await updateNotificationSettings(settings);
          set({ settings: updatedSettings });
        } catch (error) {
          console.error('알림 설정 업데이트 실패:', error);
          set({ error: '알림 설정 업데이트에 실패했습니다.' });
        }
      },

      // === UI 상태 관리 ===
      toggleDropdown: () => {
        set(state => ({ isDropdownOpen: !state.isDropdownOpen }));
      },

      closeDropdown: () => {
        set({ isDropdownOpen: false });
      },

      setFilter: (newFilter: Partial<NotificationFilter>) => {
        set(state => ({ 
          filter: { ...state.filter, ...newFilter },
          currentPage: 0,
          hasMore: false
        }));
      },

      clearFilter: () => {
        set({ 
          filter: {
            readStatus: NotificationReadStatus.ALL,
            page: 0,
            size: 20
          },
          currentPage: 0,
          hasMore: false
        });
      },

      // === 실시간 기능 ===
      startPolling: () => {
        const state = get();
        if (state.isPolling || state.poller) {
          return;
        }

        const poller = new NotificationPoller((data) => {
          // 새 알림이 있으면 목록 새로고침
          if (data.hasNew) {
            get().fetchNotifications(get().filter, false);
          }
          
          // 읽지 않은 수 업데이트 
          set(prevState => ({
            summary: {
              ...prevState.summary,
              unreadCount: data.unreadCount,
              lastUpdated: new Date().toISOString()
            }
          }));
        });

        poller.start(NOTIFICATION_POLLING_INTERVAL);
        
        set({ 
          isPolling: true,
          poller
        });
      },

      stopPolling: () => {
        const state = get();
        if (state.poller) {
          state.poller.stop();
        }
        
        set({
          isPolling: false,
          poller: null
        });
      },

      addRealtimeNotification: (notification: Notification) => {
        set(state => ({
          notifications: [notification, ...state.notifications],
          summary: {
            ...state.summary,
            unreadCount: state.summary.unreadCount + (notification.isRead ? 0 : 1),
            totalCount: state.summary.totalCount + 1,
            lastUpdated: new Date().toISOString()
          }
        }));
      },

      // === 에러 관리 ===
      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // === 유틸리티 ===
      reset: () => {
        const state = get();
        if (state.poller) {
          state.poller.stop();
        }
        set(initialState);
      }
    }),
    {
      name: 'elderberry-notification-store',
      // 중요한 상태만 persist (알림 목록은 제외)
      partialize: (state) => ({
        settings: state.settings,
        filter: state.filter
      })
    }
  )
);

// === 편의 훅들 ===

/**
 * 읽지 않은 알림 수만 가져오는 훅
 */
export const useUnreadCount = () => {
  return useNotificationStore(state => state.summary.unreadCount);
};

/**
 * 알림 드롭다운 상태 관리 훅
 */
export const useNotificationDropdown = () => {
  return useNotificationStore(state => ({
    isOpen: state.isDropdownOpen,
    toggle: state.toggleDropdown,
    close: state.closeDropdown
  }));
};

/**
 * 알림 필터 관리 훅
 */
export const useNotificationFilter = () => {
  return useNotificationStore(state => ({
    filter: state.filter,
    setFilter: state.setFilter,
    clearFilter: state.clearFilter
  }));
};

/**
 * 실시간 알림 관리 훅 (무한 루프 완전 해결)
 */
export const useRealtimeNotifications = () => {
  // Zustand store의 메서드를 직접 사용 (메모이제이션 자동 처리)
  const isPolling = useNotificationStore(state => state.isPolling);
  const lastFetchTime = useNotificationStore(state => state.lastFetchTime);
  const startPolling = useNotificationStore(state => state.startPolling);
  const stopPolling = useNotificationStore(state => state.stopPolling);
  
  return {
    isPolling,
    startPolling,
    stopPolling,
    lastFetchTime
  };
};