/**
 * 구인구직 관련 API 서비스
 */
import axios, { AxiosResponse } from 'axios';
import {
  Job,
  JobCreateRequest,
  JobUpdateRequest,
  JobSearchParams,
  JobListResponse,
  JobApplication,
  JobApplicationCreateRequest,
  JobApplicationUpdateRequest,
  InterviewScheduleRequest,
  ApplicationStatusUpdateRequest,
  JobStatistics,
  ApplicantStatistics,
  JobApiError
} from '../types/job';

// API 인스턴스 생성
const jobApi = axios.create({
  baseURL: 'http://localhost:8080/api/jobs',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const applicationApi = axios.create({
  baseURL: 'http://localhost:8080/api/job-applications',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 요청 인터셉터: 토큰 자동 추가
const addAuthToken = (config: any) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

jobApi.interceptors.request.use(addAuthToken);
applicationApi.interceptors.request.use(addAuthToken);

// 응답 인터셉터: 에러 처리
const handleApiError = (error: any): Promise<never> => {
  const apiError: JobApiError = {
    message: error.response?.data?.message || '네트워크 오류가 발생했습니다.',
    code: error.response?.data?.code || 'NETWORK_ERROR',
    status: error.response?.status || 500,
    timestamp: new Date().toISOString(),
    path: error.config?.url || '',
    details: error.response?.data?.details
  };
  return Promise.reject(apiError);
};

jobApi.interceptors.response.use(
  (response) => response,
  handleApiError
);

applicationApi.interceptors.response.use(
  (response) => response,
  handleApiError
);

// 구인 공고 서비스
export const jobService = {
  // 구인 공고 목록 조회
  async getJobs(params: JobSearchParams = {}): Promise<JobListResponse> {
    const response: AxiosResponse<JobListResponse> = await jobApi.get('', { params });
    return response.data;
  },

  // 구인 공고 상세 조회
  async getJob(id: number): Promise<Job> {
    const response: AxiosResponse<Job> = await jobApi.get(`/${id}`);
    return response.data;
  },

  // 구인 공고 생성
  async createJob(request: JobCreateRequest): Promise<Job> {
    const response: AxiosResponse<Job> = await jobApi.post('', request);
    return response.data;
  },

  // 구인 공고 수정
  async updateJob(id: number, request: JobUpdateRequest): Promise<Job> {
    const response: AxiosResponse<Job> = await jobApi.put(`/${id}`, request);
    return response.data;
  },

  // 구인 공고 삭제
  async deleteJob(id: number): Promise<void> {
    await jobApi.delete(`/${id}`);
  },

  // 내가 등록한 구인 공고 조회
  async getMyJobs(params: JobSearchParams = {}): Promise<JobListResponse> {
    const response: AxiosResponse<JobListResponse> = await jobApi.get('/my', { params });
    return response.data;
  },

  // 구인 공고 통계
  async getJobStatistics(): Promise<JobStatistics> {
    const response: AxiosResponse<JobStatistics> = await jobApi.get('/statistics');
    return response.data;
  },

  // 인기 구인 공고
  async getPopularJobs(limit: number = 10): Promise<Job[]> {
    const response: AxiosResponse<Job[]> = await jobApi.get('/popular', { 
      params: { limit } 
    });
    return response.data;
  },

  // 최신 구인 공고
  async getLatestJobs(limit: number = 10): Promise<Job[]> {
    const response: AxiosResponse<Job[]> = await jobApi.get('/latest', { 
      params: { limit } 
    });
    return response.data;
  },

  // 추천 구인 공고
  async getRecommendedJobs(limit: number = 10): Promise<Job[]> {
    const response: AxiosResponse<Job[]> = await jobApi.get('/recommended', { 
      params: { limit } 
    });
    return response.data;
  },

  // 구인 공고 조회수 증가
  async incrementViewCount(id: number): Promise<void> {
    await jobApi.post(`/${id}/view`);
  }
};

// 지원서 서비스
export const applicationService = {
  // 지원서 제출
  async submitApplication(request: JobApplicationCreateRequest): Promise<JobApplication> {
    const response: AxiosResponse<JobApplication> = await applicationApi.post('', request);
    return response.data;
  },

  // 지원서 목록 조회 (지원자용)
  async getMyApplications(params: { page?: number; size?: number } = {}): Promise<{
    content: JobApplication[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  }> {
    const response = await applicationApi.get('/my', { params });
    return response.data;
  },

  // 특정 구인 공고의 지원서 목록 조회 (고용주용)
  async getJobApplications(jobId: number, params: { page?: number; size?: number } = {}): Promise<{
    content: JobApplication[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  }> {
    const response = await applicationApi.get(`/job/${jobId}`, { params });
    return response.data;
  },

  // 지원서 상세 조회
  async getApplication(id: number): Promise<JobApplication> {
    const response: AxiosResponse<JobApplication> = await applicationApi.get(`/${id}`);
    return response.data;
  },

  // 지원서 수정 (관리자/고용주용)
  async updateApplication(id: number, request: JobApplicationUpdateRequest): Promise<JobApplication> {
    const response: AxiosResponse<JobApplication> = await applicationApi.put(`/${id}`, request);
    return response.data;
  },

  // 지원서 취소 (지원자용)
  async withdrawApplication(id: number): Promise<void> {
    await applicationApi.delete(`/${id}`);
  },

  // 면접 일정 등록
  async scheduleInterview(request: InterviewScheduleRequest): Promise<JobApplication> {
    const response: AxiosResponse<JobApplication> = await applicationApi.post('/schedule-interview', request);
    return response.data;
  },

  // 지원 상태 업데이트
  async updateApplicationStatus(request: ApplicationStatusUpdateRequest): Promise<JobApplication> {
    const response: AxiosResponse<JobApplication> = await applicationApi.post('/update-status', request);
    return response.data;
  },

  // 지원자 통계
  async getApplicantStatistics(): Promise<ApplicantStatistics> {
    const response: AxiosResponse<ApplicantStatistics> = await applicationApi.get('/statistics');
    return response.data;
  },

  // 특정 구인 공고에 지원했는지 확인
  async checkApplicationExists(jobId: number): Promise<{ exists: boolean; applicationId?: number }> {
    const response = await applicationApi.get(`/check/${jobId}`);
    return response.data;
  }
};

// 파일 업로드 서비스
export const fileService = {
  // 이력서 업로드
  async uploadResume(file: File): Promise<{ url: string; fileName: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post('/api/files/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      timeout: 30000 // 30초 타임아웃
    });

    return response.data;
  },

  // 파일 다운로드 URL 생성
  getFileDownloadUrl(fileName: string): string {
    return `/api/files/download/${fileName}`;
  }
};