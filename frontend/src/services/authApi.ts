/**
 * 인증 관련 API 서비스
 * 타입 안전한 에러 처리 적용
 */
import axios, { AxiosResponse, AxiosError } from 'axios';
import {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  EnhancedTokenResponse,
  RefreshTokenRequest,
  TokenValidationRequest,
  TokenValidationResponse,
  MemberResponse,
  MemberUpdateRequest,
  ApiError
} from '../types/auth';
import { normalizeError, errorLogger, ErrorContext } from '../utils/errorHandler';
import type { AppError } from '../types/errors';

// API 인스턴스 생성
const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/auth` : 'http://localhost:8080/api/auth',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const memberApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/members` : 'http://localhost:8080/api/members',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 요청 인터셉터: 토큰 자동 추가 (로그인/회원가입 제외)
authApi.interceptors.request.use((config) => {
  // 로그인과 회원가입 요청에는 토큰을 포함하지 않음
  const publicEndpoints = ['/login', '/register', '/signup', '/login-test', '/login-dto-test', '/login-simple-test', '/login-map-test', '/password-hash-test'];
  const isPublicEndpoint = publicEndpoints.some(endpoint => {
    // 정확한 엔드포인트 매칭을 위해 URL 끝부분 확인
    const url = config.url || '';
    return url === endpoint || url.endsWith(endpoint);
  });
  
  if (!isPublicEndpoint) {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  // 디버깅을 위한 로그 (개발 환경에서만)
  if (import.meta.env.MODE === 'development') {
    console.log(`[Auth API] 요청: ${config.url}, 공개: ${isPublicEndpoint}, 토큰: ${!!config.headers.Authorization}`);
  }
  
  return config;
});

memberApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 타입 안전한 에러 처리 및 토큰 만료 처리
const handleApiError = (error: unknown): Promise<never> => {
  const axiosError = error as AxiosError;
  const context: ErrorContext = {
    component: 'authApi',
    route: axiosError?.config?.url || ''
  };
  
  // 401 에러 시 토큰 정리 (로그인 요청 제외)
  if (axiosError?.response?.status === 401) {
    const url = axiosError.config?.url || '';
    const isLoginRequest = url.includes('/login') || url.includes('/register');
    
    if (!isLoginRequest) {
      // 만료된 토큰 정리
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      console.warn('토큰이 만료되어 자동 로그아웃되었습니다.');
    }
  }
  
  const normalizedError = normalizeError(error, context);
  errorLogger.error(normalizedError, context);
  
  return Promise.reject(normalizedError);
};

authApi.interceptors.response.use(
  (response) => response,
  handleApiError
);

memberApi.interceptors.response.use(
  (response) => response,
  handleApiError
);

export const authService = {
  // 로그인
  async login(request: LoginRequest): Promise<TokenResponse> {
    const response: AxiosResponse<TokenResponse> = await authApi.post('/login', request);
    return response.data;
  },

  // 회원가입
  async register(request: RegisterRequest): Promise<TokenResponse> {
    const response: AxiosResponse<TokenResponse> = await authApi.post('/register', request);
    return response.data;
  },

  // 로그아웃
  async logout(): Promise<void> {
    await authApi.post('/logout');
  },

  // 토큰 갱신
  async refreshToken(request: RefreshTokenRequest): Promise<TokenResponse> {
    const response: AxiosResponse<TokenResponse> = await authApi.post('/refresh', request);
    return response.data;
  },

  // 토큰 검증
  async validateToken(request: TokenValidationRequest): Promise<TokenValidationResponse> {
    const response: AxiosResponse<TokenValidationResponse> = await authApi.post('/validate', request);
    return response.data;
  },

  // 모든 토큰 무효화
  async invalidateAllTokens(): Promise<void> {
    await authApi.post('/invalidate-all');
  },

  // 활성 토큰 목록 조회
  async getActiveTokens(): Promise<EnhancedTokenResponse[]> {
    const response: AxiosResponse<EnhancedTokenResponse[]> = await authApi.get('/active-tokens');
    return response.data;
  },

  // 특정 토큰 무효화
  async invalidateToken(tokenId: string): Promise<void> {
    await authApi.post(`/invalidate/${tokenId}`);
  },

  // 토큰 메타데이터 조회
  async getTokenMetadata(): Promise<Record<string, unknown>> {
    const response: AxiosResponse<Record<string, unknown>> = await authApi.get('/token-metadata');
    return response.data;
  }
};

export const memberService = {
  // 회원 정보 조회
  async getProfile(): Promise<MemberResponse> {
    const response: AxiosResponse<MemberResponse> = await memberApi.get('/profile');
    return response.data;
  },

  // 회원 정보 수정
  async updateProfile(request: MemberUpdateRequest): Promise<MemberResponse> {
    const response: AxiosResponse<MemberResponse> = await memberApi.put('/profile', request);
    return response.data;
  },

  // 회원 탈퇴
  async deleteAccount(): Promise<void> {
    await memberApi.delete('/profile');
  },

  // 특정 회원 조회 (관리자용)
  async getMember(id: number): Promise<MemberResponse> {
    const response: AxiosResponse<MemberResponse> = await memberApi.get(`/${id}`);
    return response.data;
  },

  // 모든 회원 조회 (관리자용)
  async getAllMembers(): Promise<MemberResponse[]> {
    const response: AxiosResponse<MemberResponse[]> = await memberApi.get('');
    return response.data;
  },

  // 역할별 회원 조회 (관리자용)
  async getMembersByRole(role: string): Promise<MemberResponse[]> {
    const response: AxiosResponse<MemberResponse[]> = await memberApi.get(`/role/${role}`);
    return response.data;
  },

  // 회원 생성 (관리자용)
  async createMember(request: RegisterRequest): Promise<MemberResponse> {
    const response: AxiosResponse<MemberResponse> = await memberApi.post('', request);
    return response.data;
  },

  // 회원 정보 수정 (관리자용)
  async updateMember(id: number, request: MemberUpdateRequest): Promise<MemberResponse> {
    const response: AxiosResponse<MemberResponse> = await memberApi.put(`/${id}`, request);
    return response.data;
  },

  // 회원 삭제 (관리자용)
  async deleteMember(id: number): Promise<void> {
    await memberApi.delete(`/${id}`);
  }
};