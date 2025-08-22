/**
 * API 클라이언트 설정
 * Axios 기반 공통 HTTP 클라이언트
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, ErrorResponse } from '../types/common';

// API 설정
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || (globalThis as any).__API_BASE_URL__ || 'http://localhost:8080/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// 토큰 관리
class TokenManager {
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}

// API 클라이언트 클래스
class ApiClient {
  private client: AxiosInstance;
  private tokenManager: TokenManager;
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create(API_CONFIG);
    this.tokenManager = new TokenManager();
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // 요청 인터셉터 - 인증 토큰 추가
    this.client.interceptors.request.use(
      (config) => {
        const token = this.tokenManager.getAccessToken();
        if (token && !this.tokenManager.isTokenExpired(token)) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 응답 인터셉터 - 토큰 갱신 및 에러 처리
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.tokenManager.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    const refreshToken = this.tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(
      `${API_CONFIG.baseURL}/auth/refresh`,
      { refreshToken },
      { headers: API_CONFIG.headers }
    );

    const { accessToken, refreshToken: newRefreshToken } = response.data;
    this.tokenManager.setTokens(accessToken, newRefreshToken);
    
    return accessToken;
  }

  private handleError(error: any): ErrorResponse {
    if (error.response?.data) {
      return error.response.data;
    }

    return {
      error: 'NETWORK_ERROR',
      message: error.message || 'Network error occurred',
      statusCode: error.response?.status || 0,
      timestamp: new Date().toISOString(),
    };
  }

  // HTTP 메서드들
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.get(url, config);
    return response.data;
  }

  async post<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.delete(url, config);
    return response.data;
  }

  // 파일 업로드
  async uploadFile<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, formData, config);
    return response.data;
  }

  // 토큰 관리 메서드
  setTokens(accessToken: string, refreshToken: string): void {
    this.tokenManager.setTokens(accessToken, refreshToken);
  }

  clearTokens(): void {
    this.tokenManager.clearTokens();
  }

  getAccessToken(): string | null {
    return this.tokenManager.getAccessToken();
  }

  isAuthenticated(): boolean {
    const token = this.tokenManager.getAccessToken();
    return token ? !this.tokenManager.isTokenExpired(token) : false;
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const apiClient = new ApiClient();

// 타입 내보내기
export type { AxiosRequestConfig } from 'axios';