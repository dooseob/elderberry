import { apiClient } from 'shared/api/client';
import type { 
  Job,
  JobApplication,
  JobCreateRequest,
  JobUpdateRequest,
  JobApplicationCreateRequest,
  ApplicationStatusUpdateRequest,
  JobSearchFilters,
  JobResponse
} from '../model/types';

/**
 * Job API Functions
 */
export const jobApi = {
  /**
   * 채용 공고 목록 조회
   */
  getJobs: async (filters?: JobSearchFilters): Promise<JobResponse> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    
    const response = await apiClient.get(`/api/jobs?${params.toString()}`);
    return response.data;
  },
  
  /**
   * 채용 공고 상세 조회
   */
  getJobById: async (id: number): Promise<Job> => {
    const response = await apiClient.get(`/api/jobs/${id}`);
    return response.data;
  },
  
  /**
   * 채용 공고 생성
   */
  createJob: async (jobData: JobCreateRequest): Promise<Job> => {
    const response = await apiClient.post('/api/jobs', jobData);
    return response.data;
  },
  
  /**
   * 채용 공고 수정
   */
  updateJob: async (id: number, jobData: JobUpdateRequest): Promise<Job> => {
    const response = await apiClient.put(`/api/jobs/${id}`, jobData);
    return response.data;
  },
  
  /**
   * 채용 공고 삭제
   */
  deleteJob: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/jobs/${id}`);
  },
  
  /**
   * 채용 공고 상태 변경
   */
  updateJobStatus: async (id: number, status: string): Promise<Job> => {
    const response = await apiClient.patch(`/api/jobs/${id}/status`, { status });
    return response.data;
  },
  
  /**
   * 채용 공고 조회수 증가
   */
  incrementJobViewCount: async (id: number): Promise<void> => {
    await apiClient.post(`/api/jobs/${id}/view`);
  },
  
  /**
   * 내 채용 공고 목록
   */
  getMyJobs: async (page = 0, size = 20): Promise<JobResponse> => {
    const response = await apiClient.get(`/api/jobs/my?page=${page}&size=${size}`);
    return response.data;
  },
  
  /**
   * 채용 공고 검색
   */
  searchJobs: async (keyword: string, filters?: Partial<JobSearchFilters>): Promise<JobResponse> => {
    const params = new URLSearchParams({ keyword });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    
    const response = await apiClient.get(`/api/jobs/search?${params.toString()}`);
    return response.data;
  },
  
  /**
   * 카테고리별 채용 공고
   */
  getJobsByCategory: async (category: string, page = 0, size = 20): Promise<JobResponse> => {
    const response = await apiClient.get(`/api/jobs/category/${category}?page=${page}&size=${size}`);
    return response.data;
  },
  
  /**
   * 추천 채용 공고
   */
  getRecommendedJobs: async (userId?: number): Promise<Job[]> => {
    const url = userId ? `/api/jobs/recommendations?userId=${userId}` : '/api/jobs/recommendations';
    const response = await apiClient.get(url);
    return response.data;
  },
  
  /**
   * 지원서 제출
   */
  submitApplication: async (applicationData: JobApplicationCreateRequest): Promise<JobApplication> => {
    const response = await apiClient.post('/api/job-applications', applicationData);
    return response.data;
  },
  
  /**
   * 내 지원 내역
   */
  getMyApplications: async (page = 0, size = 20): Promise<{ content: JobApplication[]; totalElements: number; totalPages: number }> => {
    const response = await apiClient.get(`/api/job-applications/my?page=${page}&size=${size}`);
    return response.data;
  },
  
  /**
   * 지원서 상세 조회
   */
  getApplicationById: async (id: number): Promise<JobApplication> => {
    const response = await apiClient.get(`/api/job-applications/${id}`);
    return response.data;
  },
  
  /**
   * 지원서 상태 업데이트
   */
  updateApplicationStatus: async (id: number, statusData: ApplicationStatusUpdateRequest): Promise<JobApplication> => {
    const response = await apiClient.patch(`/api/job-applications/${id}/status`, statusData);
    return response.data;
  },
  
  /**
   * 지원 취소
   */
  withdrawApplication: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/job-applications/${id}`);
  },
  
  /**
   * 채용 공고에 대한 지원자 목록 (고용주용)
   */
  getJobApplications: async (jobId: number, page = 0, size = 20): Promise<{ content: JobApplication[]; totalElements: number; totalPages: number }> => {
    const response = await apiClient.get(`/api/jobs/${jobId}/applications?page=${page}&size=${size}`);
    return response.data;
  },
  
  /**
   * 면접 일정 예약
   */
  scheduleInterview: async (applicationId: number, interviewData: { interviewDate: string; interviewLocation?: string; notes?: string }): Promise<JobApplication> => {
    const response = await apiClient.post(`/api/job-applications/${applicationId}/interview`, interviewData);
    return response.data;
  }
};

// React Query keys
export const jobQueryKeys = {
  all: ['jobs'] as const,
  list: (filters?: JobSearchFilters) => [...jobQueryKeys.all, 'list', filters] as const,
  detail: (id: number) => [...jobQueryKeys.all, 'detail', id] as const,
  search: (keyword: string, filters?: Partial<JobSearchFilters>) => [...jobQueryKeys.all, 'search', keyword, filters] as const,
  category: (category: string, page?: number) => [...jobQueryKeys.all, 'category', category, page] as const,
  recommendations: (userId?: number) => [...jobQueryKeys.all, 'recommendations', userId] as const,
  myJobs: (page?: number) => [...jobQueryKeys.all, 'myJobs', page] as const,
  applications: {
    all: ['job-applications'] as const,
    my: (page?: number) => [...jobQueryKeys.applications.all, 'my', page] as const,
    detail: (id: number) => [...jobQueryKeys.applications.all, 'detail', id] as const,
    byJob: (jobId: number, page?: number) => [...jobQueryKeys.applications.all, 'byJob', jobId, page] as const
  }
};
