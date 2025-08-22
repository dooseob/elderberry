/**
 * 구인구직 상태 관리 스토어 (Zustand)
 */
import { create } from 'zustand';
import {
  Job,
  JobCreateRequest,
  JobUpdateRequest,
  JobSearchParams,
  JobListResponse,
  JobApplication,
  JobApplicationCreateRequest,
  ApplicationStatusUpdateRequest,
  InterviewScheduleRequest,
  JobStatistics
} from '../types/job';
import { jobService, applicationService } from '../services/jobApi';

interface JobState {
  // 구인 공고 관련 상태
  jobs: Job[];
  currentJob: Job | null;
  jobsLoading: boolean;
  jobsError: string | null;
  jobsTotalPages: number;
  jobsCurrentPage: number;
  jobsTotalElements: number;

  // 지원서 관련 상태
  applications: JobApplication[];
  currentApplication: JobApplication | null;
  applicationsLoading: boolean;
  applicationsError: string | null;
  applicationsTotalPages: number;
  applicationsCurrentPage: number;

  // 통계 관련 상태
  statistics: JobStatistics | null;
  statisticsLoading: boolean;
  statisticsError: string | null;

  // 검색 필터 상태
  searchParams: JobSearchParams;
}

interface JobActions {
  // 구인 공고 액션
  loadJobs: (params?: JobSearchParams) => Promise<void>;
  loadJob: (id: number) => Promise<void>;
  createJob: (request: JobCreateRequest) => Promise<Job>;
  updateJob: (id: number, request: JobUpdateRequest) => Promise<Job>;
  deleteJob: (id: number) => Promise<void>;
  loadMyJobs: (params?: JobSearchParams) => Promise<void>;
  incrementJobView: (id: number) => Promise<void>;

  // 지원서 액션
  submitApplication: (request: JobApplicationCreateRequest) => Promise<JobApplication>;
  loadMyApplications: (page?: number, size?: number) => Promise<void>;
  loadJobApplications: (jobId: number, page?: number, size?: number) => Promise<void>;
  updateApplicationStatus: (request: ApplicationStatusUpdateRequest) => Promise<void>;
  scheduleInterview: (request: InterviewScheduleRequest) => Promise<void>;
  withdrawApplication: (id: number) => Promise<void>;

  // 통계 액션
  loadStatistics: () => Promise<void>;

  // 검색 및 필터 액션
  setSearchParams: (params: Partial<JobSearchParams>) => void;
  resetSearchParams: () => void;

  // 에러 처리 액션
  clearJobsError: () => void;
  clearApplicationsError: () => void;
  clearStatisticsError: () => void;

  // 상태 초기화 액션
  reset: () => void;
}

type JobStore = JobState & JobActions;

const initialSearchParams: JobSearchParams = {
  page: 0,
  size: 20,
  sortBy: 'postedDate',
  sortDirection: 'desc'
};

const initialState: JobState = {
  jobs: [],
  currentJob: null,
  jobsLoading: false,
  jobsError: null,
  jobsTotalPages: 0,
  jobsCurrentPage: 0,
  jobsTotalElements: 0,

  applications: [],
  currentApplication: null,
  applicationsLoading: false,
  applicationsError: null,
  applicationsTotalPages: 0,
  applicationsCurrentPage: 0,

  statistics: null,
  statisticsLoading: false,
  statisticsError: null,

  searchParams: initialSearchParams
};

export const useJobStore = create<JobStore>()((set, get) => ({
  ...initialState,

  // 구인 공고 목록 로드
  loadJobs: async (params?: JobSearchParams) => {
    try {
      set({ jobsLoading: true, jobsError: null });

      const searchParams = { ...get().searchParams, ...params };
      const response: JobListResponse = await jobService.getJobs(searchParams);

      set({
        jobs: response.content,
        jobsTotalPages: response.totalPages,
        jobsCurrentPage: response.page,
        jobsTotalElements: response.totalElements,
        searchParams,
        jobsLoading: false
      });

    } catch (error: any) {
      set({
        jobsLoading: false,
        jobsError: error.message || '구인 공고를 불러오는데 실패했습니다.'
      });
      throw error;
    }
  },

  // 구인 공고 상세 로드
  loadJob: async (id: number) => {
    try {
      set({ jobsLoading: true, jobsError: null });

      const job = await jobService.getJob(id);
      
      // 조회수 증가
      await jobService.incrementViewCount(id);

      set({
        currentJob: job,
        jobsLoading: false
      });

    } catch (error: any) {
      set({
        jobsLoading: false,
        jobsError: error.message || '구인 공고를 불러오는데 실패했습니다.'
      });
      throw error;
    }
  },

  // 구인 공고 생성
  createJob: async (request: JobCreateRequest) => {
    try {
      set({ jobsLoading: true, jobsError: null });

      const job = await jobService.createJob(request);

      // 기존 목록에 새 공고 추가
      set(state => ({
        jobs: [job, ...state.jobs],
        jobsTotalElements: state.jobsTotalElements + 1,
        jobsLoading: false
      }));

      return job;

    } catch (error: any) {
      set({
        jobsLoading: false,
        jobsError: error.message || '구인 공고 등록에 실패했습니다.'
      });
      throw error;
    }
  },

  // 구인 공고 수정
  updateJob: async (id: number, request: JobUpdateRequest) => {
    try {
      set({ jobsLoading: true, jobsError: null });

      const updatedJob = await jobService.updateJob(id, request);

      // 목록에서 해당 공고 업데이트
      set(state => ({
        jobs: state.jobs.map(job => job.id === id ? updatedJob : job),
        currentJob: state.currentJob?.id === id ? updatedJob : state.currentJob,
        jobsLoading: false
      }));

      return updatedJob;

    } catch (error: any) {
      set({
        jobsLoading: false,
        jobsError: error.message || '구인 공고 수정에 실패했습니다.'
      });
      throw error;
    }
  },

  // 구인 공고 삭제
  deleteJob: async (id: number) => {
    try {
      set({ jobsLoading: true, jobsError: null });

      await jobService.deleteJob(id);

      // 목록에서 해당 공고 제거
      set(state => ({
        jobs: state.jobs.filter(job => job.id !== id),
        currentJob: state.currentJob?.id === id ? null : state.currentJob,
        jobsTotalElements: state.jobsTotalElements - 1,
        jobsLoading: false
      }));

    } catch (error: any) {
      set({
        jobsLoading: false,
        jobsError: error.message || '구인 공고 삭제에 실패했습니다.'
      });
      throw error;
    }
  },

  // 내 구인 공고 로드
  loadMyJobs: async (params?: JobSearchParams) => {
    try {
      set({ jobsLoading: true, jobsError: null });

      const searchParams = { ...get().searchParams, ...params };
      const response: JobListResponse = await jobService.getMyJobs(searchParams);

      set({
        jobs: response.content,
        jobsTotalPages: response.totalPages,
        jobsCurrentPage: response.page,
        jobsTotalElements: response.totalElements,
        searchParams,
        jobsLoading: false
      });

    } catch (error: any) {
      set({
        jobsLoading: false,
        jobsError: error.message || '내 구인 공고를 불러오는데 실패했습니다.'
      });
      throw error;
    }
  },

  // 조회수 증가
  incrementJobView: async (id: number) => {
    try {
      await jobService.incrementViewCount(id);
      
      // 목록에서 해당 공고의 조회수 증가
      set(state => ({
        jobs: state.jobs.map(job => 
          job.id === id ? { ...job, viewCount: job.viewCount + 1 } : job
        ),
        currentJob: state.currentJob?.id === id 
          ? { ...state.currentJob, viewCount: state.currentJob.viewCount + 1 }
          : state.currentJob
      }));

    } catch (error) {
      // 조회수 증가 실패는 무시 (중요하지 않은 액션)
      console.warn('조회수 증가 실패:', error);
    }
  },

  // 지원서 제출
  submitApplication: async (request: JobApplicationCreateRequest) => {
    try {
      set({ applicationsLoading: true, applicationsError: null });

      const application = await applicationService.submitApplication(request);

      // 지원서 목록에 추가
      set(state => ({
        applications: [application, ...state.applications],
        applicationsLoading: false
      }));

      return application;

    } catch (error: any) {
      set({
        applicationsLoading: false,
        applicationsError: error.message || '지원서 제출에 실패했습니다.'
      });
      throw error;
    }
  },

  // 내 지원서 목록 로드
  loadMyApplications: async (page = 0, size = 20) => {
    try {
      set({ applicationsLoading: true, applicationsError: null });

      const response = await applicationService.getMyApplications({ page, size });

      set({
        applications: response.content,
        applicationsTotalPages: response.totalPages,
        applicationsCurrentPage: response.page,
        applicationsLoading: false
      });

    } catch (error: any) {
      set({
        applicationsLoading: false,
        applicationsError: error.message || '지원서 목록을 불러오는데 실패했습니다.'
      });
      throw error;
    }
  },

  // 특정 구인 공고의 지원서 목록 로드
  loadJobApplications: async (jobId: number, page = 0, size = 20) => {
    try {
      set({ applicationsLoading: true, applicationsError: null });

      const response = await applicationService.getJobApplications(jobId, { page, size });

      set({
        applications: response.content,
        applicationsTotalPages: response.totalPages,
        applicationsCurrentPage: response.page,
        applicationsLoading: false
      });

    } catch (error: any) {
      set({
        applicationsLoading: false,
        applicationsError: error.message || '지원서 목록을 불러오는데 실패했습니다.'
      });
      throw error;
    }
  },

  // 지원 상태 업데이트
  updateApplicationStatus: async (request: ApplicationStatusUpdateRequest) => {
    try {
      set({ applicationsLoading: true, applicationsError: null });

      const updatedApplication = await applicationService.updateApplicationStatus(request);

      // 지원서 목록에서 업데이트
      set(state => ({
        applications: state.applications.map(app => 
          app.id === request.applicationId ? updatedApplication : app
        ),
        currentApplication: state.currentApplication?.id === request.applicationId 
          ? updatedApplication 
          : state.currentApplication,
        applicationsLoading: false
      }));

    } catch (error: any) {
      set({
        applicationsLoading: false,
        applicationsError: error.message || '지원 상태 업데이트에 실패했습니다.'
      });
      throw error;
    }
  },

  // 면접 일정 등록
  scheduleInterview: async (request: InterviewScheduleRequest) => {
    try {
      set({ applicationsLoading: true, applicationsError: null });

      const updatedApplication = await applicationService.scheduleInterview(request);

      // 지원서 목록에서 업데이트
      set(state => ({
        applications: state.applications.map(app => 
          app.id === request.applicationId ? updatedApplication : app
        ),
        currentApplication: state.currentApplication?.id === request.applicationId 
          ? updatedApplication 
          : state.currentApplication,
        applicationsLoading: false
      }));

    } catch (error: any) {
      set({
        applicationsLoading: false,
        applicationsError: error.message || '면접 일정 등록에 실패했습니다.'
      });
      throw error;
    }
  },

  // 지원서 취소
  withdrawApplication: async (id: number) => {
    try {
      set({ applicationsLoading: true, applicationsError: null });

      await applicationService.withdrawApplication(id);

      // 지원서 목록에서 제거
      set(state => ({
        applications: state.applications.filter(app => app.id !== id),
        currentApplication: state.currentApplication?.id === id ? null : state.currentApplication,
        applicationsLoading: false
      }));

    } catch (error: any) {
      set({
        applicationsLoading: false,
        applicationsError: error.message || '지원서 취소에 실패했습니다.'
      });
      throw error;
    }
  },

  // 통계 로드
  loadStatistics: async () => {
    try {
      set({ statisticsLoading: true, statisticsError: null });

      const statistics = await jobService.getJobStatistics();

      set({
        statistics,
        statisticsLoading: false
      });

    } catch (error: any) {
      set({
        statisticsLoading: false,
        statisticsError: error.message || '통계를 불러오는데 실패했습니다.'
      });
      throw error;
    }
  },

  // 검색 파라미터 설정
  setSearchParams: (params: Partial<JobSearchParams>) => {
    set(state => ({
      searchParams: { ...state.searchParams, ...params }
    }));
  },

  // 검색 파라미터 초기화
  resetSearchParams: () => {
    set({ searchParams: initialSearchParams });
  },

  // 에러 클리어
  clearJobsError: () => {
    set({ jobsError: null });
  },

  clearApplicationsError: () => {
    set({ applicationsError: null });
  },

  clearStatisticsError: () => {
    set({ statisticsError: null });
  },

  // 상태 초기화
  reset: () => {
    set(initialState);
  }
}));