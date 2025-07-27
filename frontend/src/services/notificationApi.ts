/**
 * 알림 관련 API 서비스
 * 타입 안전한 에러 처리 적용
 */
import axios, { AxiosResponse, AxiosError } from 'axios';
import {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationSettings,
  NotificationFilter,
  NotificationResponse,
  NotificationSummary,
  CreateNotificationRequest,
  UpdateNotificationRequest
} from '../types/notifications';
import { normalizeError, errorLogger, ErrorContext } from '../utils/errorHandler';
import type { AppError } from '../types/errors';

// API 인스턴스 생성
const notificationApi = axios.create({
  baseURL: '/api/notifications',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 요청 인터셉터: 토큰 자동 추가
notificationApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 에러 처리
notificationApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const errorContext: ErrorContext = {
      operation: 'notificationApi',
      context: {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status
      }
    };

    // 401 에러 시 토큰 갱신 시도
    if (error.response?.status === 401) {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // 토큰 갱신 로직 (authApi에서 가져와야 함)
          // const response = await authApi.post('/refresh', { refreshToken });
          // localStorage.setItem('accessToken', response.data.accessToken);
          // return notificationApi.request(error.config!);
        }
      } catch (refreshError) {
        // 리프레시 실패 시 로그아웃 처리
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    const appError = normalizeError(error, errorContext);
    errorLogger.logError(appError, errorContext);
    throw appError;
  }
);

/**
 * 알림 목록 조회
 */
export const getNotifications = async (
  filter?: NotificationFilter,
  cursor?: string,
  limit: number = 20
): Promise<NotificationResponse> => {
  const errorContext: ErrorContext = {
    operation: 'getNotifications',
    context: { filter, cursor, limit }
  };

  try {
    const params = new URLSearchParams();
    
    if (filter?.read !== undefined) {
      params.append('read', filter.read.toString());
    }
    
    if (filter?.types?.length) {
      filter.types.forEach(type => params.append('type', type));
    }
    
    if (filter?.priority) {
      params.append('priority', filter.priority);
    }
    
    if (filter?.dateFrom) {
      params.append('dateFrom', filter.dateFrom);
    }
    
    if (filter?.dateTo) {
      params.append('dateTo', filter.dateTo);
    }
    
    if (cursor) {
      params.append('cursor', cursor);
    }
    
    params.append('limit', limit.toString());

    const response: AxiosResponse<NotificationResponse> = await notificationApi.get(
      `?${params.toString()}`
    );
    
    return response.data;
  } catch (error) {
    const appError = normalizeError(error, errorContext);
    errorLogger.logError(appError, errorContext);
    throw appError;
  }
};

/**
 * 알림 상세 조회
 */
export const getNotification = async (id: string): Promise<Notification> => {
  const errorContext: ErrorContext = {
    operation: 'getNotification',
    context: { notificationId: id }
  };

  try {
    const response: AxiosResponse<Notification> = await notificationApi.get(`/${id}`);
    return response.data;
  } catch (error) {
    const appError = normalizeError(error, errorContext);
    errorLogger.logError(appError, errorContext);
    throw appError;
  }
};

/**
 * 알림 생성 (관리자용)
 */
export const createNotification = async (
  request: CreateNotificationRequest
): Promise<Notification> => {
  const errorContext: ErrorContext = {
    operation: 'createNotification',
    context: { request }
  };

  try {
    const response: AxiosResponse<Notification> = await notificationApi.post('/', request);
    return response.data;
  } catch (error) {
    const appError = normalizeError(error, errorContext);
    errorLogger.logError(appError, errorContext);
    throw appError;
  }
};

/**
 * 알림 업데이트 (읽음 처리 등)
 */
export const updateNotification = async (
  id: string,
  request: UpdateNotificationRequest
): Promise<Notification> => {
  const errorContext: ErrorContext = {
    operation: 'updateNotification',
    context: { notificationId: id, request }
  };

  try {
    const response: AxiosResponse<Notification> = await notificationApi.patch(`/${id}`, request);
    return response.data;
  } catch (error) {
    const appError = normalizeError(error, errorContext);
    errorLogger.logError(appError, errorContext);
    throw appError;
  }
};

/**
 * 알림 삭제
 */
export const deleteNotification = async (id: string): Promise<void> => {
  const errorContext: ErrorContext = {
    operation: 'deleteNotification',
    context: { notificationId: id }
  };

  try {
    await notificationApi.delete(`/${id}`);
  } catch (error) {
    const appError = normalizeError(error, errorContext);
    errorLogger.logError(appError, errorContext);
    throw appError;
  }
};

/**
 * 모든 알림 읽음 처리
 */
export const markAllAsRead = async (): Promise<void> => {
  const errorContext: ErrorContext = {
    operation: 'markAllAsRead',
    context: {}
  };

  try {
    await notificationApi.patch('/mark-all-read');
  } catch (error) {
    const appError = normalizeError(error, errorContext);
    errorLogger.logError(appError, errorContext);
    throw appError;
  }
};

/**
 * 모든 알림 삭제
 */
export const clearAllNotifications = async (): Promise<void> => {
  const errorContext: ErrorContext = {
    operation: 'clearAllNotifications',
    context: {}
  };

  try {
    await notificationApi.delete('/clear-all');
  } catch (error) {
    const appError = normalizeError(error, errorContext);
    errorLogger.logError(appError, errorContext);
    throw appError;
  }
};

/**
 * 알림 요약 정보 조회
 */
export const getNotificationSummary = async (): Promise<NotificationSummary> => {
  const errorContext: ErrorContext = {
    operation: 'getNotificationSummary',
    context: {}
  };

  try {
    const response: AxiosResponse<NotificationSummary> = await notificationApi.get('/summary');
    return response.data;
  } catch (error) {
    const appError = normalizeError(error, errorContext);
    errorLogger.logError(appError, errorContext);
    throw appError;
  }
};

/**
 * 알림 설정 조회
 */
export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  const errorContext: ErrorContext = {
    operation: 'getNotificationSettings',
    context: {}
  };

  try {
    const response: AxiosResponse<NotificationSettings> = await notificationApi.get('/settings');
    return response.data;
  } catch (error) {
    const appError = normalizeError(error, errorContext);
    errorLogger.logError(appError, errorContext);
    throw appError;
  }
};

/**
 * 알림 설정 업데이트
 */
export const updateNotificationSettings = async (
  settings: NotificationSettings
): Promise<NotificationSettings> => {
  const errorContext: ErrorContext = {
    operation: 'updateNotificationSettings',
    context: { settings }
  };

  try {
    const response: AxiosResponse<NotificationSettings> = await notificationApi.put('/settings', settings);
    return response.data;
  } catch (error) {
    const appError = normalizeError(error, errorContext);
    errorLogger.logError(appError, errorContext);
    throw appError;
  }
};

/**
 * 실시간 알림 확인 (폴링용)
 */
export const checkNewNotifications = async (lastCheckTime?: string): Promise<{
  hasNew: boolean;
  count: number;
  latest?: Notification[];
}> => {
  const errorContext: ErrorContext = {
    operation: 'checkNewNotifications',
    context: { lastCheckTime }
  };

  try {
    const params = new URLSearchParams();
    if (lastCheckTime) {
      params.append('since', lastCheckTime);
    }

    const response = await notificationApi.get(`/check-new?${params.toString()}`);
    return response.data;
  } catch (error) {
    const appError = normalizeError(error, errorContext);
    errorLogger.logError(appError, errorContext);
    throw appError;
  }
};

/**
 * 푸시 알림 토큰 등록
 */
export const registerPushToken = async (token: string, deviceInfo?: {
  userAgent: string;
  platform: string;
}): Promise<void> => {
  const errorContext: ErrorContext = {
    operation: 'registerPushToken',
    context: { hasToken: !!token, deviceInfo }
  };

  try {
    await notificationApi.post('/push/register', {
      token,
      deviceInfo
    });
  } catch (error) {
    const appError = normalizeError(error, errorContext);
    errorLogger.logError(appError, errorContext);
    throw appError;
  }
};

/**
 * 푸시 알림 토큰 해제
 */
export const unregisterPushToken = async (token: string): Promise<void> => {
  const errorContext: ErrorContext = {
    operation: 'unregisterPushToken',
    context: { hasToken: !!token }
  };

  try {
    await notificationApi.post('/push/unregister', { token });
  } catch (error) {
    const appError = normalizeError(error, errorContext);
    errorLogger.logError(appError, errorContext);
    throw appError;
  }
};

// 서비스 객체로 내보내기
export const notificationService = {
  getNotifications,
  getNotification,
  createNotification,
  updateNotification,
  deleteNotification,
  markAllAsRead,
  clearAllNotifications,
  getNotificationSummary,
  getNotificationSettings,
  updateNotificationSettings,
  checkNewNotifications,
  registerPushToken,
  unregisterPushToken
};

export default notificationService;