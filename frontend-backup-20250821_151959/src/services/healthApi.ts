/**
 * 건강 상태 평가 API 서비스
 */
import axios from 'axios';
import type { 
  HealthAssessment, 
  CreateHealthAssessmentRequest, 
  CareGradeResult 
} from '../entities/health';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: JWT 토큰 자동 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 로그인 페이지로 리다이렉트
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export class HealthAssessmentApi {
  /**
   * 새로운 건강 평가 생성
   */
  static async createAssessment(request: CreateHealthAssessmentRequest): Promise<HealthAssessment> {
    const response = await api.post<HealthAssessment>('/health-assessments', request);
    return response.data;
  }

  /**
   * 회원별 최신 건강 평가 조회
   */
  static async getLatestAssessment(memberId: string): Promise<HealthAssessment | null> {
    try {
      const response = await api.get<HealthAssessment>(`/health-assessments/member/${memberId}/latest`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // 평가 기록이 없는 경우
      }
      throw error;
    }
  }

  /**
   * 회원별 건강 평가 이력 조회
   */
  static async getAssessmentHistory(memberId: string): Promise<HealthAssessment[]> {
    const response = await api.get<HealthAssessment[]>(`/health-assessments/member/${memberId}/history`);
    return response.data;
  }

  /**
   * 건강 평가 수정
   */
  static async updateAssessment(
    assessmentId: number, 
    request: Partial<CreateHealthAssessmentRequest>
  ): Promise<HealthAssessment> {
    const response = await api.put<HealthAssessment>(`/health-assessments/${assessmentId}`, request);
    return response.data;
  }

  /**
   * 케어 등급 재계산
   */
  static async calculateCareGrade(assessmentId: number): Promise<CareGradeResult> {
    const response = await api.post<CareGradeResult>(`/health-assessments/${assessmentId}/calculate`);
    return response.data;
  }

  /**
   * 건강 평가 요약 조회
   */
  static async getAssessmentSummary(assessmentId: number): Promise<string> {
    const response = await api.get<string>(`/health-assessments/${assessmentId}/summary`);
    return response.data;
  }

  /**
   * 평가 완성도 체크
   */
  static async checkCompleteness(assessmentId: number): Promise<{
    isComplete: boolean;
    completionPercentage: number;
    missingFields: string[];
    careType: string;
    estimatedCost: string;
  }> {
    const response = await api.get(`/health-assessments/${assessmentId}/completeness`);
    return response.data;
  }

  /**
   * 건강 평가 삭제 (관리자만)
   */
  static async deleteAssessment(assessmentId: number): Promise<void> {
    await api.delete(`/health-assessments/${assessmentId}`);
  }
}

export default HealthAssessmentApi;