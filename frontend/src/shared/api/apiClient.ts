/**
 * Centralized API Client
 * Phase 2: 토큰 관리 통합 및 일관된 API 호출
 * 
 * @version 1.0.0
 * @description 모든 API 호출을 위한 중앙집중식 클라이언트
 */

/**
 * API 클라이언트 타입 정의
 */
interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  withCredentials: boolean;
}

interface RequestConfig extends RequestInit {
  timeout?: number;
  baseURL?: string;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

/**
 * 토큰 제공자 인터페이스
 * authStore에서 구현됨
 */
interface TokenProvider {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  refreshToken: () => Promise<void>;
  logout: () => void;
}

/**
 * 중앙집중식 API 클라이언트 클래스
 */
class ApiClient {
  private config: ApiClientConfig;
  private tokenProvider: TokenProvider | null = null;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = {
      baseURL: '/api',
      timeout: 10000,
      withCredentials: true,
      ...config,
    };
  }

  /**
   * 토큰 제공자 설정
   */
  setTokenProvider(provider: TokenProvider) {
    this.tokenProvider = provider;
  }

  /**
   * 요청 인터셉터 - 헤더에 토큰 추가
   */
  private injectAuthHeaders(headers: HeadersInit = {}): HeadersInit {
    const authHeaders = new Headers(headers);
    
    const accessToken = this.tokenProvider?.getAccessToken();
    if (accessToken) {
      authHeaders.set('Authorization', `Bearer ${accessToken}`);
    }
    
    // 기본 헤더 설정
    if (!authHeaders.has('Content-Type')) {
      authHeaders.set('Content-Type', 'application/json');
    }
    
    return authHeaders;
  }

  /**
   * 응답 인터셉터 - 토큰 만료 시 자동 갱신
   */
  private async handleResponse<T>(response: Response, originalRequest: RequestConfig): Promise<ApiResponse<T>> {
    // 성공 응답
    if (response.ok) {
      const data = await response.json();
      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    }

    // 401 Unauthorized - 토큰 만료
    if (response.status === 401 && this.tokenProvider) {
      return this.handleTokenRefresh<T>(response, originalRequest);
    }

    // 기타 에러
    const errorData = await response.json().catch(() => ({}));
    const error: ApiError = {
      message: errorData.message || response.statusText,
      status: response.status,
      code: errorData.code,
      details: errorData,
    };
    
    throw error;
  }

  /**
   * 토큰 갱신 처리
   */
  private async handleTokenRefresh<T>(response: Response, originalRequest: RequestConfig): Promise<ApiResponse<T>> {
    if (this.isRefreshing) {
      // 이미 갱신 중인 경우 큐에 추가
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    try {
      this.isRefreshing = true;
      
      await this.tokenProvider!.refreshToken();
      
      // 대기 중인 요청들 재실행
      this.failedQueue.forEach(({ resolve }) => {
        resolve(this.request(originalRequest.method as string, originalRequest.url!, originalRequest));
      });
      this.failedQueue = [];
      
      // 원본 요청 재실행
      return await this.request<T>(originalRequest.method as string, originalRequest.url!, originalRequest);
      
    } catch (error) {
      // 토큰 갱신 실패 시 로그아웃
      this.tokenProvider!.logout();
      
      this.failedQueue.forEach(({ reject }) => {
        reject(error);
      });
      this.failedQueue = [];
      
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * 기본 요청 메서드
   */
  private async request<T = any>(
    method: string, 
    url: string, 
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const { baseURL = this.config.baseURL, timeout = this.config.timeout, ...requestConfig } = config;
    
    const fullURL = url.startsWith('http') ? url : `${baseURL}${url}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(fullURL, {
        method,
        headers: this.injectAuthHeaders(requestConfig.headers),
        signal: controller.signal,
        credentials: this.config.withCredentials ? 'include' : 'same-origin',
        ...requestConfig,
      });
      
      return await this.handleResponse<T>(response, { method, url, ...config });
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`요청 시간 초과 (${timeout}ms)`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * HTTP 메서드별 편의 함수들
   */
  async get<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, config);
  }

  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, {
      ...config,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, {
      ...config,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, config);
  }

  async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', url, {
      ...config,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * 파일 업로드 특화 메서드
   */
  async upload<T = any>(url: string, formData: FormData, config?: RequestConfig): Promise<ApiResponse<T>> {
    const uploadConfig = { ...config };
    
    // FormData 사용 시 Content-Type 헤더 제거 (브라우저가 자동 설정)
    if (uploadConfig.headers) {
      const headers = new Headers(uploadConfig.headers);
      headers.delete('Content-Type');
      uploadConfig.headers = headers;
    }
    
    return this.request<T>('POST', url, {
      ...uploadConfig,
      body: formData,
    });
  }

  /**
   * 쿼리 파라미터를 포함한 GET 요청
   */
  async getWithParams<T = any>(
    url: string, 
    params: Record<string, any> = {}, 
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, String(v)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });
    
    const queryString = searchParams.toString();
    const fullURL = queryString ? `${url}?${queryString}` : url;
    
    return this.get<T>(fullURL, config);
  }
}

/**
 * 싱글톤 API 클라이언트 인스턴스
 */
export const apiClient = new ApiClient({
  baseURL: '/api',
  timeout: 15000,
  withCredentials: true,
});

/**
 * API 클라이언트 설정 함수
 * 앱 초기화 시 호출됨
 */
export const configureApiClient = (tokenProvider: TokenProvider) => {
  apiClient.setTokenProvider(tokenProvider);
};

/**
 * 편의 함수들 - 기존 코드 호환성
 */
export const api = {
  get: apiClient.get.bind(apiClient),
  post: apiClient.post.bind(apiClient),
  put: apiClient.put.bind(apiClient),
  delete: apiClient.delete.bind(apiClient),
  patch: apiClient.patch.bind(apiClient),
  upload: apiClient.upload.bind(apiClient),
  getWithParams: apiClient.getWithParams.bind(apiClient),
};

export default apiClient;