/**
 * 인증 엔티티 스토어
 * 표준화된 Zustand 스토어 구조 적용
 */
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { 
  AuthState, 
  User, 
  LoginRequest, 
  RegisterRequest, 
  UpdateProfileRequest,
  ChangePasswordRequest,
  AuthEvent
} from './types';

// 스토어 액션 인터페이스
interface AuthActions {
  // 인증 액션
  login: (request: LoginRequest) => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  
  // 사용자 관리
  updateProfile: (request: UpdateProfileRequest) => Promise<void>;
  changePassword: (request: ChangePasswordRequest) => Promise<void>;
  refreshUser: () => Promise<void>;
  
  // 토큰 관리
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  validateToken: () => Promise<boolean>;
  
  // 상태 관리
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
  
  // 이벤트 처리
  emit: (event: AuthEvent) => void;
  subscribe: (listener: (event: AuthEvent) => void) => () => void;
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
  },
};

// 이벤트 관리
const eventListeners = new Set<(event: AuthEvent) => void>();

// Zustand 스토어 생성
export const useAuthStore = create<AuthStore>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        ...initialState,
        
        // 초기화 시 토큰 복원
        user: (() => {
          try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
          } catch {
            return null;
          }
        })(),
        accessToken: TokenManager.getAccessToken(),
        refreshToken: TokenManager.getRefreshToken(),
        isAuthenticated: !!TokenManager.getAccessToken(),

        // 인증 액션
        login: async (request: LoginRequest) => {
          try {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            // API 호출 (실제 구현에서는 authApi 사용)
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(request),
            });

            if (!response.ok) {
              throw new Error('로그인에 실패했습니다.');
            }

            const data = await response.json();
            const { accessToken, refreshToken, memberInfo } = data;

            // 토큰 저장
            TokenManager.setTokens(accessToken, refreshToken);
            localStorage.setItem('user', JSON.stringify(memberInfo));

            set((state) => {
              state.user = memberInfo;
              state.accessToken = accessToken;
              state.refreshToken = refreshToken;
              state.isAuthenticated = true;
              state.isLoading = false;
              state.error = null;
            });

            // 이벤트 발행
            get().emit({ type: 'LOGIN_SUCCESS', payload: { user: memberInfo } });

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '로그인에 실패했습니다.';
            
            set((state) => {
              state.isLoading = false;
              state.error = errorMessage;
            });

            get().emit({ type: 'LOGIN_FAILURE', payload: { error: errorMessage } });
            throw error;
          }
        },

        register: async (request: RegisterRequest) => {
          try {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            // API 호출
            const response = await fetch('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(request),
            });

            if (!response.ok) {
              throw new Error('회원가입에 실패했습니다.');
            }

            const data = await response.json();
            const { accessToken, refreshToken, memberInfo } = data;

            // 토큰 저장
            TokenManager.setTokens(accessToken, refreshToken);
            localStorage.setItem('user', JSON.stringify(memberInfo));

            set((state) => {
              state.user = memberInfo;
              state.accessToken = accessToken;
              state.refreshToken = refreshToken;
              state.isAuthenticated = true;
              state.isLoading = false;
              state.error = null;
            });

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '회원가입에 실패했습니다.';
            
            set((state) => {
              state.isLoading = false;
              state.error = errorMessage;
            });
            
            throw error;
          }
        },

        logout: async () => {
          try {
            // 서버에 로그아웃 요청
            await fetch('/api/auth/logout', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${get().accessToken}`,
              },
            });
          } catch (error) {
            console.warn('로그아웃 요청 실패:', error);
          } finally {
            // 로컬 상태 정리
            TokenManager.clearTokens();
            localStorage.removeItem('user');

            set((state) => {
              state.user = null;
              state.accessToken = null;
              state.refreshToken = null;
              state.isAuthenticated = false;
              state.isLoading = false;
              state.error = null;
            });

            get().emit({ type: 'LOGOUT', payload: {} });
          }
        },

        refreshToken: async () => {
          try {
            const refreshToken = get().refreshToken;
            if (!refreshToken) {
              throw new Error('리프레시 토큰이 없습니다.');
            }

            const response = await fetch('/api/auth/refresh', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) {
              throw new Error('토큰 갱신에 실패했습니다.');
            }

            const data = await response.json();
            const { accessToken, refreshToken: newRefreshToken, memberInfo } = data;

            TokenManager.setTokens(accessToken, newRefreshToken);
            localStorage.setItem('user', JSON.stringify(memberInfo));

            set((state) => {
              state.user = memberInfo;
              state.accessToken = accessToken;
              state.refreshToken = newRefreshToken;
              state.isAuthenticated = true;
              state.error = null;
            });

            get().emit({ type: 'TOKEN_REFRESH', payload: { accessToken } });

          } catch (error) {
            // 리프레시 실패 시 로그아웃
            get().logout();
            throw error;
          }
        },

        // 사용자 관리
        updateProfile: async (request: UpdateProfileRequest) => {
          try {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            const response = await fetch('/api/auth/profile', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${get().accessToken}`,
              },
              body: JSON.stringify(request),
            });

            if (!response.ok) {
              throw new Error('프로필 업데이트에 실패했습니다.');
            }

            const updatedUser = await response.json();
            localStorage.setItem('user', JSON.stringify(updatedUser));

            set((state) => {
              state.user = updatedUser;
              state.isLoading = false;
              state.error = null;
            });

            get().emit({ type: 'PROFILE_UPDATE', payload: { user: updatedUser } });

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '프로필 업데이트에 실패했습니다.';
            
            set((state) => {
              state.isLoading = false;
              state.error = errorMessage;
            });
            
            throw error;
          }
        },

        changePassword: async (request: ChangePasswordRequest) => {
          try {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            const response = await fetch('/api/auth/change-password', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${get().accessToken}`,
              },
              body: JSON.stringify(request),
            });

            if (!response.ok) {
              throw new Error('비밀번호 변경에 실패했습니다.');
            }

            set((state) => {
              state.isLoading = false;
              state.error = null;
            });

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '비밀번호 변경에 실패했습니다.';
            
            set((state) => {
              state.isLoading = false;
              state.error = errorMessage;
            });
            
            throw error;
          }
        },

        refreshUser: async () => {
          try {
            set((state) => {
              state.isLoading = true;
            });

            const response = await fetch('/api/auth/profile', {
              headers: {
                'Authorization': `Bearer ${get().accessToken}`,
              },
            });

            if (!response.ok) {
              throw new Error('사용자 정보 조회에 실패했습니다.');
            }

            const user = await response.json();
            localStorage.setItem('user', JSON.stringify(user));

            set((state) => {
              state.user = user;
              state.isLoading = false;
              state.error = null;
            });

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '사용자 정보 조회에 실패했습니다.';
            
            set((state) => {
              state.isLoading = false;
              state.error = errorMessage;
            });
            
            throw error;
          }
        },

        // 토큰 관리
        setTokens: (accessToken: string, refreshToken: string) => {
          TokenManager.setTokens(accessToken, refreshToken);
          set((state) => {
            state.accessToken = accessToken;
            state.refreshToken = refreshToken;
            state.isAuthenticated = true;
          });
        },

        clearTokens: () => {
          TokenManager.clearTokens();
          localStorage.removeItem('user');
          set((state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
          });
        },

        validateToken: async (): Promise<boolean> => {
          try {
            const token = get().accessToken;
            if (!token) return false;

            const response = await fetch('/api/auth/validate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({ token }),
            });

            const result = await response.json();
            return result.valid;

          } catch (error) {
            console.warn('토큰 검증 실패:', error);
            return false;
          }
        },

        // 상태 관리
        setLoading: (loading: boolean) => {
          set((state) => {
            state.isLoading = loading;
          });
        },

        setError: (error: string | null) => {
          set((state) => {
            state.error = error;
          });
        },

        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },

        reset: () => {
          TokenManager.clearTokens();
          localStorage.removeItem('user');
          set(() => ({ ...initialState }));
        },

        // 이벤트 처리
        emit: (event: AuthEvent) => {
          eventListeners.forEach(listener => {
            try {
              listener(event);
            } catch (error) {
              console.error('Auth event listener error:', error);
            }
          });
        },

        subscribe: (listener: (event: AuthEvent) => void) => {
          eventListeners.add(listener);
          return () => {
            eventListeners.delete(listener);
          };
        },
      })),
      {
        name: 'elderberry-auth',
        partialize: (state) => ({
          // 민감한 정보는 persist하지 않음
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);

// 선택자 (Selectors)
export const authSelectors = {
  user: (state: AuthStore) => state.user,
  isAuthenticated: (state: AuthStore) => state.isAuthenticated,
  isLoading: (state: AuthStore) => state.isLoading,
  error: (state: AuthStore) => state.error,
  hasRole: (role: string) => (state: AuthStore) => state.user?.role === role,
  hasPermission: (permission: string) => (state: AuthStore) => {
    // 권한 체크 로직 구현
    return state.user?.role === 'ADMIN'; // 임시
  },
};