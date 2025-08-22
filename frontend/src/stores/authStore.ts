/**
 * 인증 스토어 - main 프로젝트용 간소화 버전
 * frontend의 고급 기능을 기반으로 한 통합 인증 시스템
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 기본 타입 정의
export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
}

export interface AuthState {
  // 사용자 상태
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  
  // UI 상태
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  // 인증 액션
  login: (request: LoginRequest) => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  
  // 토큰 관리
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  
  // 상태 관리
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

type AuthStore = AuthState & AuthActions;

// 초기 상태
const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// 토큰 관리 유틸리티
const TokenManager = {
  getAccessToken: (): string | null => {
    try {
      return localStorage.getItem('accessToken');
    } catch {
      return null;
    }
  },
  
  getRefreshToken: (): string | null => {
    try {
      return localStorage.getItem('refreshToken');
    } catch {
      return null;
    }
  },
  
  setTokens: (accessToken: string, refreshToken: string): void => {
    try {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    } catch (error) {
      console.warn('Failed to save tokens to localStorage:', error);
    }
  },
  
  clearTokens: (): void => {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } catch (error) {
      console.warn('Failed to clear tokens from localStorage:', error);
    }
  },
  
  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
};

// API 기본 URL (환경변수에서 가져옴)
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080/api';

// API 호출 유틸리티
const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
};

// 인증된 API 호출 (토큰 자동 첨부)
const authenticatedApiCall = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = TokenManager.getAccessToken();
  
  return apiCall(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
};

// 스토어 생성
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // 로그인
      login: async (request: LoginRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify(request),
          });

          const { user, accessToken, refreshToken } = response;
          
          // 토큰 저장
          TokenManager.setTokens(accessToken, refreshToken);
          
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          console.log('로그인 성공:', user.email);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '로그인에 실패했습니다.';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // 회원가입
      register: async (request: RegisterRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify(request),
          });

          const { user, accessToken, refreshToken } = response;
          
          // 토큰 저장
          TokenManager.setTokens(accessToken, refreshToken);
          
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          console.log('회원가입 성공:', user.email);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '회원가입에 실패했습니다.';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // 로그아웃
      logout: async () => {
        set({ isLoading: true });
        
        try {
          // 서버에 로그아웃 요청 (선택적)
          const token = get().accessToken;
          if (token) {
            await apiCall('/auth/logout', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }).catch(() => {
              // 로그아웃 실패는 무시 (이미 만료된 토큰일 수 있음)
            });
          }
        } finally {
          // 로컬 상태 및 토큰 정리
          TokenManager.clearTokens();
          set({
            ...initialState,
          });
          
          console.log('로그아웃 완료');
        }
      },

      // 토큰 갱신
      refreshTokens: async () => {
        const refreshToken = get().refreshToken;
        
        if (!refreshToken) {
          throw new Error('리프레시 토큰이 없습니다.');
        }
        
        try {
          const response = await apiCall('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
          });

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response;
          
          // 새 토큰 저장
          TokenManager.setTokens(newAccessToken, newRefreshToken);
          
          set({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          });
          
          return newAccessToken;
        } catch (error) {
          // 토큰 갱신 실패 시 로그아웃
          get().logout();
          throw error;
        }
      },

      // 토큰 설정
      setTokens: (accessToken: string, refreshToken: string) => {
        TokenManager.setTokens(accessToken, refreshToken);
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      // 토큰 정리
      clearTokens: () => {
        TokenManager.clearTokens();
        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      // 로딩 상태 설정
      setLoading: (loading: boolean) => set({ isLoading: loading }),

      // 에러 설정
      setError: (error: string | null) => set({ error }),

      // 에러 정리
      clearError: () => set({ error: null }),

      // 상태 초기화
      reset: () => {
        TokenManager.clearTokens();
        set({ ...initialState });
      },
    }),
    {
      name: 'elderberry-auth', // localStorage 키
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// 토큰 유효성 검증 및 자동 갱신
export const initializeAuth = async () => {
  const store = useAuthStore.getState();
  const accessToken = TokenManager.getAccessToken();
  const refreshToken = TokenManager.getRefreshToken();

  if (!accessToken || !refreshToken) {
    store.reset();
    return false;
  }

  // 토큰이 만료되었는지 확인
  if (TokenManager.isTokenExpired(accessToken)) {
    try {
      await store.refreshTokens();
      return true;
    } catch (error) {
      console.warn('토큰 갱신 실패:', error);
      store.reset();
      return false;
    }
  }

  // 사용자 정보가 없으면 토큰으로부터 복원
  if (!store.user && accessToken) {
    try {
      const response = await authenticatedApiCall('/auth/me');
      store.setTokens(accessToken, refreshToken);
      useAuthStore.setState({
        user: response.user,
        isAuthenticated: true,
      });
      return true;
    } catch (error) {
      console.warn('사용자 정보 복원 실패:', error);
      store.reset();
      return false;
    }
  }

  return store.isAuthenticated;
};

// 유용한 셀렉터들
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated);
export const useCurrentUser = () => useAuthStore(state => state.user);
export const useAuthLoading = () => useAuthStore(state => state.isLoading);
export const useAuthError = () => useAuthStore(state => state.error);