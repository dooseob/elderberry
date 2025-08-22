/**
 * 구인구직 시스템 타입 정의
 * JobController API 기반
 */

// 지원 상태 열거형
export type JobApplicationStatus = 
  | 'UNDER_REVIEW'      // 검토중
  | 'INTERVIEW_SCHEDULED' // 면접예정
  | 'INTERVIEW_COMPLETED' // 면접완료
  | 'ACCEPTED'          // 합격
  | 'REJECTED'          // 불합격
  | 'WITHDRAWN';        // 지원철회

// 구인공고 타입
export interface Job {
  id: number;
  facilityName: string;
  title: string;
  salary: string;
  location: string;
  isUrgent: boolean;
  // 추가 필드 (실제 구현 시 확장 가능)
  description?: string;
  requirements?: string;
  benefits?: string;
  workSchedule?: string;
  contactInfo?: string;
  createdAt?: string;
  updatedAt?: string;
  deadline?: string;
  employmentType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT';
  experienceLevel?: 'ENTRY' | 'JUNIOR' | 'SENIOR' | 'EXPERT';
}

// 내 지원서 타입
export interface JobApplication {
  id: number;
  facilityName: string;
  jobTitle: string;
  status: JobApplicationStatus;
  statusText: string;
  salary: string;
  location: string;
  // 추가 필드
  applicationDate?: string;
  lastUpdated?: string;
  interviewDate?: string;
  notes?: string;
  jobId?: number;
}

// 지원 요청 타입
export interface JobApplyRequest {
  coverLetter: string;
  expectedSalary?: string;
  startDate?: string;
  additionalInfo?: string;
  // 첨부파일 등 추가 필드
  resumeUrl?: string;
  certificateUrls?: string[];
}

// 지원 응답 타입
export interface JobApplyResponse {
  applicationId: number;
  jobId: number;
  message: string;
  status: 'SUCCESS' | 'ERROR';
  applicationDate: string;
}

// 구인공고 검색 파라미터
export interface JobSearchParams {
  page?: number;
  size?: number;
  region?: string;
  position?: string;
  salary?: string;
  employmentType?: string;
  experienceLevel?: string;
  isUrgent?: boolean;
  keyword?: string;
  sortBy?: 'latest' | 'salary' | 'location' | 'urgent';
  sortOrder?: 'asc' | 'desc';
}

// 내 지원서 검색 파라미터
export interface MyApplicationsParams {
  page?: number;
  size?: number;
  status?: JobApplicationStatus;
  sortBy?: 'latest' | 'status' | 'facility';
  sortOrder?: 'asc' | 'desc';
}

// 페이지네이션 응답 타입
export interface JobPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// 상태 텍스트 매핑
export const JOB_APPLICATION_STATUS_TEXT: Record<JobApplicationStatus, string> = {
  UNDER_REVIEW: '검토중',
  INTERVIEW_SCHEDULED: '면접예정',
  INTERVIEW_COMPLETED: '면접완료',
  ACCEPTED: '합격',
  REJECTED: '불합격',
  WITHDRAWN: '지원철회',
};

// 상태별 색상 매핑 (UI에서 사용)
export const JOB_APPLICATION_STATUS_COLORS: Record<JobApplicationStatus, { bg: string; text: string }> = {
  UNDER_REVIEW: { bg: 'bg-yellow-50', text: 'text-yellow-800' },
  INTERVIEW_SCHEDULED: { bg: 'bg-blue-50', text: 'text-blue-800' },
  INTERVIEW_COMPLETED: { bg: 'bg-purple-50', text: 'text-purple-800' },
  ACCEPTED: { bg: 'bg-green-50', text: 'text-green-800' },
  REJECTED: { bg: 'bg-red-50', text: 'text-red-800' },
  WITHDRAWN: { bg: 'bg-gray-50', text: 'text-gray-800' },
};

// 고용 형태 텍스트
export const EMPLOYMENT_TYPE_TEXT = {
  FULL_TIME: '정규직',
  PART_TIME: '파트타임',
  CONTRACT: '계약직',
};

// 경력 레벨 텍스트
export const EXPERIENCE_LEVEL_TEXT = {
  ENTRY: '신입',
  JUNIOR: '경력 1-3년',
  SENIOR: '경력 3-7년',
  EXPERT: '경력 7년+',
};