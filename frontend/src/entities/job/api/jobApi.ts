/**
 * Job API 클라이언트
 * JobController 백엔드 API와 연동
 */

import { apiClient } from '@/shared/api/apiClient';
import type {
  Job,
  JobApplication,
  JobApplyRequest,
  JobApplyResponse,
  JobSearchParams,
  MyApplicationsParams,
  JobPage,
} from '../model/types';

class JobApiClient {
  /**
   * 내 지원 목록 조회
   * GET /api/job-applications/my
   */
  async getMyApplications(params: MyApplicationsParams = {}): Promise<JobPage<JobApplication>> {
    const searchParams = new URLSearchParams();
    
    if (params.page !== undefined) searchParams.set('page', params.page.toString());
    if (params.size !== undefined) searchParams.set('size', params.size.toString());
    if (params.status) searchParams.set('status', params.status);
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const response = await apiClient.get(`/job-applications/my?${searchParams.toString()}`);
    return response.data;
  }

  /**
   * 구인공고 목록 조회
   * GET /api/job-applications/jobs
   */
  async getJobs(params: JobSearchParams = {}): Promise<JobPage<Job>> {
    const searchParams = new URLSearchParams();
    
    if (params.page !== undefined) searchParams.set('page', params.page.toString());
    if (params.size !== undefined) searchParams.set('size', params.size.toString());
    if (params.region) searchParams.set('region', params.region);
    if (params.position) searchParams.set('position', params.position);
    if (params.salary) searchParams.set('salary', params.salary);
    if (params.employmentType) searchParams.set('employmentType', params.employmentType);
    if (params.experienceLevel) searchParams.set('experienceLevel', params.experienceLevel);
    if (params.isUrgent !== undefined) searchParams.set('isUrgent', params.isUrgent.toString());
    if (params.keyword) searchParams.set('keyword', params.keyword);
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const response = await apiClient.get(`/job-applications/jobs?${searchParams.toString()}`);
    return response.data;
  }

  /**
   * 구인공고 상세 조회
   * 백엔드에 해당 API가 없어서 jobs 목록에서 필터링
   */
  async getJobById(jobId: number): Promise<Job> {
    // 임시로 전체 목록에서 찾기 (실제로는 별도 API가 필요)
    const response = await this.getJobs({ size: 1000 });
    const job = response.content.find(j => j.id === jobId);
    
    if (!job) {
      throw new Error(`Job with id ${jobId} not found`);
    }
    
    return job;
  }

  /**
   * 구인공고 지원
   * POST /api/job-applications/{jobId}/apply
   */
  async applyForJob(jobId: number, applicationData: JobApplyRequest): Promise<JobApplyResponse> {
    const response = await apiClient.post(`/job-applications/${jobId}/apply`, applicationData);
    return response.data;
  }

  /**
   * 지원 취소/철회
   * 백엔드에 해당 API가 없어서 임시 구현
   */
  async withdrawApplication(applicationId: number): Promise<{ success: boolean; message: string }> {
    // TODO: 실제 백엔드 API 구현 필요
    // DELETE /api/job-applications/{applicationId}
    console.warn('withdrawApplication API not implemented in backend');
    
    // 임시 응답
    return {
      success: true,
      message: '지원이 철회되었습니다.',
    };
  }

  /**
   * 북마크 추가/제거
   * 백엔드에 해당 API가 없어서 임시 구현
   */
  async toggleBookmark(jobId: number): Promise<{ bookmarked: boolean }> {
    // TODO: 실제 백엔드 API 구현 필요
    // POST/DELETE /api/job-applications/{jobId}/bookmark
    console.warn('toggleBookmark API not implemented in backend');
    
    // 임시 응답 (랜덤하게 토글)
    return {
      bookmarked: Math.random() > 0.5,
    };
  }

  /**
   * 지원서 상태 업데이트 (관리자용)
   * 백엔드에 해당 API가 없어서 임시 구현
   */
  async updateApplicationStatus(
    applicationId: number, 
    status: string, 
    notes?: string
  ): Promise<{ success: boolean; message: string }> {
    // TODO: 실제 백엔드 API 구현 필요
    // PUT /api/job-applications/{applicationId}/status
    console.warn('updateApplicationStatus API not implemented in backend');
    
    return {
      success: true,
      message: '지원서 상태가 업데이트되었습니다.',
    };
  }

  /**
   * 추천 구인공고 조회
   * 백엔드에 해당 API가 없어서 임시 구현
   */
  async getRecommendedJobs(limit: number = 5): Promise<Job[]> {
    // TODO: 실제 백엔드 API 구현 필요
    // GET /api/job-applications/recommended
    console.warn('getRecommendedJobs API not implemented in backend');
    
    // 임시로 일반 목록에서 일부만 반환
    const response = await this.getJobs({ size: limit });
    return response.content.slice(0, limit);
  }
}

export const jobApi = new JobApiClient();