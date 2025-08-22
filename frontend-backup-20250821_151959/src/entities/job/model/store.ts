import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { 
  Job, 
  JobApplication, 
  JobSearchFilters, 
  JobCategory, 
  SalaryType, 
  ExperienceLevel, 
  WorkType 
} from './types';

interface JobStore {
  // State
  jobs: Job[];
  currentJob: Job | null;
  myApplications: JobApplication[];
  searchFilters: JobSearchFilters;
  loading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalElements: number;
  
  // Actions
  setJobs: (jobs: Job[]) => void;
  setCurrentJob: (job: Job | null) => void;
  addJob: (job: Job) => void;
  updateJob: (id: number, updates: Partial<Job>) => void;
  removeJob: (id: number) => void;
  
  setMyApplications: (applications: JobApplication[]) => void;
  addApplication: (application: JobApplication) => void;
  updateApplication: (id: number, updates: Partial<JobApplication>) => void;
  
  setSearchFilters: (filters: Partial<JobSearchFilters>) => void;
  clearSearchFilters: () => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  setPagination: (page: number, totalPages: number, totalElements: number) => void;
  
  // Computed getters
  getJobsByCategory: (category: JobCategory) => Job[];
  getUrgentJobs: () => Job[];
  getFeaturedJobs: () => Job[];
  getActiveApplications: () => JobApplication[];
  
  // Utils
  reset: () => void;
}

const initialState = {
  jobs: [],
  currentJob: null,
  myApplications: [],
  searchFilters: {
    page: 0,
    size: 20,
    sort: 'createdAt,desc'
  },
  loading: false,
  error: null,
  currentPage: 0,
  totalPages: 0,
  totalElements: 0
};

export const useJobStore = create<JobStore>()(devtools(
  (set, get) => ({
    ...initialState,
    
    // Actions
    setJobs: (jobs) => set({ jobs }),
    
    setCurrentJob: (job) => set({ currentJob: job }),
    
    addJob: (job) => set((state) => ({ 
      jobs: [job, ...state.jobs],
      totalElements: state.totalElements + 1
    })),
    
    updateJob: (id, updates) => set((state) => ({
      jobs: state.jobs.map(job => 
        job.id === id ? { ...job, ...updates } : job
      ),
      currentJob: state.currentJob?.id === id 
        ? { ...state.currentJob, ...updates }
        : state.currentJob
    })),
    
    removeJob: (id) => set((state) => ({
      jobs: state.jobs.filter(job => job.id !== id),
      currentJob: state.currentJob?.id === id ? null : state.currentJob,
      totalElements: Math.max(0, state.totalElements - 1)
    })),
    
    setMyApplications: (applications) => set({ myApplications: applications }),
    
    addApplication: (application) => set((state) => ({
      myApplications: [application, ...state.myApplications]
    })),
    
    updateApplication: (id, updates) => set((state) => ({
      myApplications: state.myApplications.map(application => 
        application.id === id ? { ...application, ...updates } : application
      )
    })),
    
    setSearchFilters: (filters) => set((state) => ({
      searchFilters: { ...state.searchFilters, ...filters }
    })),
    
    clearSearchFilters: () => set((state) => ({
      searchFilters: {
        page: 0,
        size: 20,
        sort: 'createdAt,desc'
      }
    })),
    
    setLoading: (loading) => set({ loading }),
    
    setError: (error) => set({ error }),
    
    setPagination: (page, totalPages, totalElements) => set({
      currentPage: page,
      totalPages,
      totalElements
    }),
    
    // Computed getters
    getJobsByCategory: (category) => {
      const { jobs } = get();
      return jobs.filter(job => job.category === category);
    },
    
    getUrgentJobs: () => {
      const { jobs } = get();
      return jobs.filter(job => job.isUrgent && job.status === 'ACTIVE');
    },
    
    getFeaturedJobs: () => {
      const { jobs } = get();
      return jobs.filter(job => job.isFeatured && job.status === 'ACTIVE');
    },
    
    getActiveApplications: () => {
      const { myApplications } = get();
      return myApplications.filter(app => 
        ['SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED'].includes(app.status)
      );
    },
    
    reset: () => set(initialState)
  }),
  {
    name: 'job-store',
    partialize: (state) => ({
      searchFilters: state.searchFilters
    })
  }
));

// Selectors
export const selectJobs = (state: JobStore) => state.jobs;
export const selectCurrentJob = (state: JobStore) => state.currentJob;
export const selectMyApplications = (state: JobStore) => state.myApplications;
export const selectSearchFilters = (state: JobStore) => state.searchFilters;
export const selectLoading = (state: JobStore) => state.loading;
export const selectError = (state: JobStore) => state.error;
export const selectPagination = (state: JobStore) => ({
  currentPage: state.currentPage,
  totalPages: state.totalPages,
  totalElements: state.totalElements
});
