/**
 * 인증 상태 관리 스토어 (Zustand)
 * 타입 안전한 에러 처리 적용
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, AuthUser, LoginRequest, RegisterRequest, MemberUpdateRequest } from '../types/auth';
import { authService, memberService } from '../services/authApi';
import { normalizeError, errorLogger, ErrorContext } from '../utils/errorHandler';
import type { AppError } from '../types/errors';

interface AuthActions {
  // 로그인
  login: (request: LoginRequest) => Promise<void>;
  // 회원가입
  register: (request: RegisterRequest) => Promise<void>;
  // 로그아웃
  logout: () => Promise<void>;
  // 토큰 갱신
  refreshToken: () => Promise<void>;
  // 사용자 정보 새로고침
  refreshUser: () => Promise<void>;
  // 프로필 업데이트
  updateProfile: (request: MemberUpdateRequest) => Promise<void>;
  // 에러 클리어
  clearError: () => void;
  // 로딩 상태 설정
  setLoading: (loading: boolean) => void;
  // 토큰 유효성 검사
  validateToken: () => Promise<boolean>;
  // 초기화
  reset: () => void;
}

type AuthStore = AuthState & AuthActions;

// 토큰 저장소 관리
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user'
} as const;

const getStoredToken = (key: keyof typeof TOKEN_KEYS): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEYS[key]);
  } catch {
    return null;
  }
};

const setStoredToken = (key: keyof typeof TOKEN_KEYS, value: string): void => {
  try {
    localStorage.setItem(TOKEN_KEYS[key], value);
  } catch {
    // LocalStorage 사용 불가 시 무시
  }
};

const removeStoredToken = (key: keyof typeof TOKEN_KEYS): void => {
  try {
    localStorage.removeItem(TOKEN_KEYS[key]);
  } catch {
    // LocalStorage 사용 불가 시 무시
  }
};

const getStoredUser = (): AuthUser | null => {
  try {
    const userStr = localStorage.getItem(TOKEN_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

const setStoredUser = (user: AuthUser): void => {
  try {
    localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));
  } catch {
    // LocalStorage 사용 불가 시 무시
  }
};

const removeStoredUser = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEYS.USER);
  } catch {
    // LocalStorage 사용 불가 시 무시
  }
};

// 초기 상태
const initialState: AuthState = {
  user: getStoredUser(),
  accessToken: getStoredToken('ACCESS_TOKEN'),
  refreshToken: getStoredToken('REFRESH_TOKEN'),
  isAuthenticated: !!getStoredToken('ACCESS_TOKEN'),
  isLoading: false,
  error: null
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // 로그인
      login: async (request: LoginRequest) => {
        try {
          set({ isLoading: true, error: null });

          const response = await authService.login(request);
          
          const user: AuthUser = {
            id: response.memberInfo.id,
            email: response.memberInfo.email,
            name: response.memberInfo.name,
            role: response.memberInfo.role,
            profileCompletionRate: response.memberInfo.profileCompletionRate,
            isActive: response.memberInfo.isActive
          };

          // 토큰 및 사용자 정보 저장
          setStoredToken('ACCESS_TOKEN', response.accessToken);
          setStoredToken('REFRESH_TOKEN', response.refreshToken);
          setStoredUser(user);

          set({
            user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });

        } catch (error: unknown) {
          const context: ErrorContext = {
            component: 'authStore',
            action: 'login'
          };
          
          const normalizedError = normalizeError(error, context);
          errorLogger.error(normalizedError, context);
          
          set({
            isLoading: false,
            error: normalizedError.message || '로그인에 실패했습니다.'
          });
          throw normalizedError;
        }
      },

      // 회원가입
      register: async (request: RegisterRequest) => {
        try {
          set({ isLoading: true, error: null });

          const response = await authService.register(request);
          
          const user: AuthUser = {
            id: response.memberInfo.id,
            email: response.memberInfo.email,
            name: response.memberInfo.name,
            role: response.memberInfo.role,
            profileCompletionRate: response.memberInfo.profileCompletionRate,
            isActive: response.memberInfo.isActive
          };

          // 토큰 및 사용자 정보 저장
          setStoredToken('ACCESS_TOKEN', response.accessToken);
          setStoredToken('REFRESH_TOKEN', response.refreshToken);
          setStoredUser(user);

          set({
            user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });

        } catch (error: unknown) {
          const context: ErrorContext = {
            component: 'authStore',
            action: 'register'
          };
          
          const normalizedError = normalizeError(error, context);
          errorLogger.error(normalizedError, context);
          
          set({
            isLoading: false,
            error: normalizedError.message || '회원가입에 실패했습니다.'
          });
          throw normalizedError;
        }
      },

      // 로그아웃
      logout: async () => {
        try {
          set({ isLoading: true });

          // 서버에 로그아웃 요청
          await authService.logout();

        } catch (error: unknown) {
          const context: ErrorContext = {
            component: 'authStore',
            action: 'logout'
          };
          
          errorLogger.warn(error, context);
        } finally {
          // 로컬 상태 및 저장소 정리
          removeStoredToken('ACCESS_TOKEN');
          removeStoredToken('REFRESH_TOKEN');
          removeStoredUser();

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      },

      // 토큰 갱신
      refreshToken: async () => {
        try {
          const { refreshToken } = get();
          if (!refreshToken) {
            throw new Error('리프레시 토큰이 없습니다.');
          }

          const response = await authService.refreshToken({ refreshToken });
          
          const user: AuthUser = {
            id: response.memberInfo.id,
            email: response.memberInfo.email,
            name: response.memberInfo.name,
            role: response.memberInfo.role,
            profileCompletionRate: response.memberInfo.profileCompletionRate,
            isActive: response.memberInfo.isActive
          };

          // 새 토큰 저장
          setStoredToken('ACCESS_TOKEN', response.accessToken);
          setStoredToken('REFRESH_TOKEN', response.refreshToken);
          setStoredUser(user);

          set({
            user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            error: null
          });

        } catch (error: unknown) {
          const context: ErrorContext = {
            component: 'authStore',
            action: 'refreshToken'
          };
          
          const normalizedError = normalizeError(error, context);
          errorLogger.error(normalizedError, context);
          
          // 리프레시 실패 시 로그아웃
          get().logout();
          throw normalizedError;
        }
      },

      // 사용자 정보 새로고침
      refreshUser: async () => {
        try {
          set({ isLoading: true });

          const memberInfo = await memberService.getProfile();
          
          const user: AuthUser = {
            id: memberInfo.id,
            email: memberInfo.email,
            name: memberInfo.name,
            role: memberInfo.role,
            profileCompletionRate: memberInfo.profileCompletionRate,
            isActive: memberInfo.isActive
          };

          setStoredUser(user);

          set({
            user,
            isLoading: false,
            error: null
          });

        } catch (error: unknown) {
          const context: ErrorContext = {
            component: 'authStore',
            action: 'refreshUser'
          };
          
          const normalizedError = normalizeError(error, context);
          errorLogger.error(normalizedError, context);
          
          set({
            isLoading: false,
            error: normalizedError.message || '사용자 정보 조회에 실패했습니다.'
          });
          throw normalizedError;
        }
      },

      // 프로필 업데이트
      updateProfile: async (request: MemberUpdateRequest) => {
        try {
          set({ isLoading: true, error: null });

          const memberInfo = await memberService.updateProfile(request);
          
          const user: AuthUser = {
            id: memberInfo.id,
            email: memberInfo.email,
            name: memberInfo.name,
            role: memberInfo.role,
            profileCompletionRate: memberInfo.profileCompletionRate,
            isActive: memberInfo.isActive
          };

          setStoredUser(user);

          set({
            user,
            isLoading: false,
            error: null
          });

        } catch (error: unknown) {
          const context: ErrorContext = {
            component: 'authStore',
            action: 'updateProfile'
          };
          
          const normalizedError = normalizeError(error, context);
          errorLogger.error(normalizedError, context);
          
          set({
            isLoading: false,
            error: normalizedError.message || '프로필 업데이트에 실패했습니다.'
          });
          throw normalizedError;
        }
      },

      // 토큰 유효성 검사
      validateToken: async (): Promise<boolean> => {
        try {
          const { accessToken } = get();
          if (!accessToken) return false;

          const response = await authService.validateToken({ token: accessToken });
          return response.valid;

        } catch (error: unknown) {
          const context: ErrorContext = {
            component: 'authStore',
            action: 'validateToken'
          };
          
          errorLogger.warn(error, context);
          return false;
        }
      },

      // 에러 클리어
      clearError: () => {
        set({ error: null });
      },

      // 로딩 상태 설정
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // 초기화
      reset: () => {
        removeStoredToken('ACCESS_TOKEN');
        removeStoredToken('REFRESH_TOKEN');
        removeStoredUser();

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      }
    }),
    {
      name: 'elderberry-auth',
      partialize: (state) => ({
        // persist에서는 토큰만 저장하고, 사용자 정보는 localStorage에서 직접 관리
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);