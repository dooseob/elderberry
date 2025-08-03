/**
 * 인증 서비스 API
 * API 전문가가 설계한 인증 관련 API 클라이언트
 * 
 * @version 2025.1.0
 * @author API 전문가 (Linear Theme System)
 * 
 * Features:
 * - 완전한 인증 API 클라이언트
 * - JWT 토큰 자동 관리
 * - Axios 인터셉터를 통한 토큰 자동 갱신
 * - 에러 처리 및 재시도 로직
 * - TypeScript 완전 타입 정의
 * - Linear 테마 시스템과 통합
 * - 소셜 로그인 지원
 * - 이메일/전화번호 인증
 * - Vite 환경변수 지원 (import.meta.env)
 */
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthState, User, LoginRequest, RegisterRequest, AuthResponse } from '../entities/auth/model/types';

// API 기본 설정
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const API_TIMEOUT = 10000; // 10초

/**
 * 인증 관련 API 요청/응답 타입
 */
export interface EmailCheckRequest {
  email: string;
}

export interface EmailCheckResponse {
  available: boolean;
  message?: string;
}

export interface SendVerificationRequest {
  phoneNumber: string;
}

export interface SendVerificationResponse {
  success: boolean;
  message: string;
}

export interface VerifyCodeRequest {
  phoneNumber: string;
  code: string;
}

export interface VerifyCodeResponse {
  valid: boolean;
  message?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  email: string;
  token?: string;
  verificationCode?: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface ValidateResetTokenRequest {
  token: string;
  email: string;
}

export interface ValidateResetTokenResponse {
  valid: boolean;
  message?: string;
}

export interface SocialLoginResponse {
  redirectUrl: string;
}

/**
 * API 에러 타입
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 인증 API 클라이언트 클래스
 */
class AuthApiClient {
  private client: AxiosInstance;
  private tokenRefreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * 요청/응답 인터셉터 설정
   */
  private setupInterceptors() {
    // 요청 인터셉터: 토큰 자동 추가
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getStoredToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 응답 인터셉터: 토큰 만료 시 자동 갱신
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // 401 에러이고 재시도하지 않은 경우
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            // 토큰 갱신 실패 시 로그아웃
            this.clearStoredTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  /**
   * API 에러 처리
   */
  private handleApiError(error: AxiosError): ApiError {
    if (error.response) {
      const { status, data } = error.response;
      const errorData = data as any;
      
      return new ApiError(
        status,
        errorData?.code || 'UNKNOWN_ERROR',
        errorData?.message || error.message,
        errorData
      );
    } else if (error.request) {
      return new ApiError(0, 'NETWORK_ERROR', 'Please check your network connection.');
    } else {
      return new ApiError(0, 'REQUEST_ERROR', error.message);
    }
  }

  /**
   * 저장된 토큰 가져오기
   */
  private getStoredToken(): string | null {
    try {
      return localStorage.getItem('accessToken');
    } catch {
      return null;
    }
  }

  /**
   * 저장된 리프레시 토큰 가져오기
   */
  private getStoredRefreshToken(): string | null {
    try {
      return localStorage.getItem('refreshToken');
    } catch {
      return null;
    }
  }

  /**
   * 토큰 저장
   */
  private storeTokens(accessToken: string, refreshToken: string): void {
    try {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    } catch (error) {
      console.warn('Token storage failed:', error);
    }
  }

  /**
   * 토큰 정리
   */
  private clearStoredTokens(): void {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    } catch (error) {
      console.warn('Token cleanup failed:', error);
    }
  }

  /**
   * 액세스 토큰 갱신
   */
  private async refreshAccessToken(): Promise<string> {
    // 중복 요청 방지
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    this.tokenRefreshPromise = (async () => {
      try {
        const refreshToken = this.getStoredRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available.');
        }

        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        this.storeTokens(accessToken, newRefreshToken);

        return accessToken;
      } finally {
        this.tokenRefreshPromise = null;
      }
    })();

    return this.tokenRefreshPromise;
  }

  // === 공개 API 메서드 ===

  /**
   * 로그인
   */
  async login(request: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/api/auth/login', request);
    const { accessToken, refreshToken } = response.data;
    this.storeTokens(accessToken, refreshToken);
    return response.data;
  }

  /**
   * 회원가입
   */
  async register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/api/auth/register', request);
    const { accessToken, refreshToken } = response.data;
    this.storeTokens(accessToken, refreshToken);
    return response.data;
  }

  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    try {
      await this.client.post('/api/auth/logout');
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      this.clearStoredTokens();
    }
  }

  /**
   * 이메일 중복 확인
   */
  async checkEmailAvailability(email: string): Promise<boolean> {
    const response = await this.client.get<EmailCheckResponse>(
      `/api/auth/check-email?email=${encodeURIComponent(email)}`
    );
    return response.data.available;
  }

  /**
   * 전화번호 인증번호 발송
   */
  async sendPhoneVerification(phoneNumber: string): Promise<void> {
    await this.client.post<SendVerificationResponse>('/api/auth/send-verification', {
      phoneNumber,
    });
  }

  /**
   * 전화번호 인증번호 확인
   */
  async verifyPhoneCode(phoneNumber: string, code: string): Promise<boolean> {
    const response = await this.client.post<VerifyCodeResponse>('/api/auth/verify-code', {
      phoneNumber,
      code,
    });
    return response.data.valid;
  }

  /**
   * 비밀번호 찾기 (이메일 발송)
   */
  async forgotPassword(email: string): Promise<void> {
    await this.client.post<ForgotPasswordResponse>('/api/auth/forgot-password', {
      email,
    });
  }

  /**
   * 비밀번호 재설정 토큰 검증
   */
  async validateResetToken(token: string, email: string): Promise<boolean> {
    const response = await this.client.post<ValidateResetTokenResponse>(
      '/api/auth/validate-reset-token',
      { token, email }
    );
    return response.data.valid;
  }

  /**
   * 비밀번호 재설정
   */
  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    await this.client.post<ResetPasswordResponse>('/api/auth/reset-password', request);
  }

  /**
   * 사용자 프로필 조회
   */
  async getProfile(): Promise<User> {
    const response = await this.client.get<User>('/api/auth/profile');
    return response.data;
  }

  /**
   * 토큰 유효성 검사
   */
  async validateToken(): Promise<boolean> {
    try {
      const token = this.getStoredToken();
      if (!token) return false;

      const response = await this.client.post('/api/auth/validate', { token });
      return response.data.valid;
    } catch (error) {
      return false;
    }
  }

  /**
   * 소셜 로그인 URL 생성
   */
  getSocialLoginUrl(provider: string, redirectUrl?: string): string {
    const params = new URLSearchParams();
    if (redirectUrl) {
      params.append('redirect', redirectUrl);
    }
    return `${API_BASE_URL}/api/auth/oauth/${provider}?${params.toString()}`;
  }

  /**
   * 소셜 로그인 콜백 처리
   */
  async handleSocialCallback(code: string, provider: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/api/auth/oauth/callback', {
      code,
      provider,
    });
    
    const { accessToken, refreshToken } = response.data;
    this.storeTokens(accessToken, refreshToken);
    return response.data;
  }
}

// 싱글톤 인스턴스 생성
const authApiClient = new AuthApiClient();

// === 편의 함수들 ===

/**
 * 로그인
 */
export const login = (request: LoginRequest) => authApiClient.login(request);

/**
 * 회원가입
 */
export const register = (request: RegisterRequest) => authApiClient.register(request);

/**
 * 로그아웃
 */
export const logout = () => authApiClient.logout();

/**
 * 이메일 중복 확인
 */
export const checkEmailAvailability = (email: string) => 
  authApiClient.checkEmailAvailability(email);

/**
 * 전화번호 인증번호 발송
 */
export const sendPhoneVerification = (phoneNumber: string) => 
  authApiClient.sendPhoneVerification(phoneNumber);

/**
 * 전화번호 인증번호 확인
 */
export const verifyPhoneCode = (phoneNumber: string, code: string) => 
  authApiClient.verifyPhoneCode(phoneNumber, code);

/**
 * 비밀번호 찾기
 */
export const forgotPassword = (email: string) => 
  authApiClient.forgotPassword(email);

/**
 * 비밀번호 재설정 토큰 검증
 */
export const validateResetToken = (token: string, email: string) => 
  authApiClient.validateResetToken(token, email);

/**
 * 비밀번호 재설정
 */
export const resetPassword = (request: ResetPasswordRequest) => 
  authApiClient.resetPassword(request);

/**
 * 사용자 프로필 조회
 */
export const getProfile = () => authApiClient.getProfile();

/**
 * 토큰 유효성 검사
 */
export const validateToken = () => authApiClient.validateToken();

/**
 * 소셜 로그인 URL 생성
 */
export const getSocialLoginUrl = (provider: string, redirectUrl?: string) => 
  authApiClient.getSocialLoginUrl(provider, redirectUrl);

/**
 * 소셜 로그인 콜백 처리
 */
export const handleSocialCallback = (code: string, provider: string) => 
  authApiClient.handleSocialCallback(code, provider);

// 기본 내보내기
export default authApiClient;