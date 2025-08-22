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
  refreshTokens: () => Promise<void>;
  
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

            // API 클라이언트 사용
            const { login } = await import('../../../services/auth');
            const data = await login(request);
            const { accessToken, refreshToken, member } = data;

            // 토큰 저장 (백엔드에서 refreshToken이 없을 수 있음)
            if (refreshToken) {
              TokenManager.setTokens(accessToken, refreshToken);
            } else {
              localStorage.setItem('accessToken', accessToken);
            }
            localStorage.setItem('user', JSON.stringify(member));

            set((state) => {
              state.user = member;
              state.accessToken = accessToken;
              state.refreshToken = refreshToken || null;
              state.isAuthenticated = true;
              state.isLoading = false;
              state.error = null;
            });

            // 이벤트 발행
            get().emit({ type: 'LOGIN_SUCCESS', payload: { user: member } });

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
            
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

            // API 클라이언트 사용
            const { register } = await import('../../../services/auth');
            const data = await register(request);
            const { accessToken, refreshToken, member } = data;

            // 토큰 저장
            if (refreshToken) {
              TokenManager.setTokens(accessToken, refreshToken);
            } else {
              localStorage.setItem('accessToken', accessToken);
            }
            localStorage.setItem('user', JSON.stringify(member));

            set((state) => {
              state.user = member;
              state.accessToken = accessToken;
              state.refreshToken = refreshToken || null;
              state.isAuthenticated = true;
              state.isLoading = false;
              state.error = null;
            });

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
            
            set((state) => {
              state.isLoading = false;
              state.error = errorMessage;
            });
            
            throw error;
          }
        },

        logout: async () => {
          try {
            // API 클라이언트 사용
            const { logout } = await import('../../../services/auth');
            await logout();
          } catch (error) {
            console.warn('Logout request failed:', error);
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

        refreshTokens: async () => {
          try {
            const refreshToken = get().refreshToken;
            if (!refreshToken) {
              throw new Error('No refresh token available.');
            }

            // API 클라이언트의 자동 토큰 갱신을 활용
            const { validateToken } = await import('../../../services/auth');
            const isValid = await validateToken();
            
            if (!isValid) {
              throw new Error('Token refresh failed.');
            }

            // 토큰은 API 클라이언트에서 자동으로 저장됨
            const newAccessToken = TokenManager.getAccessToken();
            const newRefreshToken = TokenManager.getRefreshToken();
            
            if (newAccessToken && newRefreshToken) {
              set((state) => {
                state.accessToken = newAccessToken;
                state.refreshToken = newRefreshToken;
                state.isAuthenticated = true;
                state.error = null;
              });

              get().emit({ type: 'TOKEN_REFRESH', payload: { accessToken: newAccessToken } });
            }

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
              throw new Error('Profile update failed.');
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
            const errorMessage = error instanceof Error ? error.message : 'Profile update failed. Please try again.';
            
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
              throw new Error('Password change failed.');
            }

            set((state) => {
              state.isLoading = false;
              state.error = null;
            });

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Password change failed. Please try again.';
            
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
              throw new Error('Failed to fetch user information.');
            }

            const user = await response.json();
            localStorage.setItem('user', JSON.stringify(user));

            set((state) => {
              state.user = user;
              state.isLoading = false;
              state.error = null;
            });

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user information. Please try again.';
            
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

            // API 클라이언트 사용
            const { validateToken } = await import('../../../services/auth');
            return await validateToken();

          } catch (error) {
            console.warn('Token validation failed:', error);
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