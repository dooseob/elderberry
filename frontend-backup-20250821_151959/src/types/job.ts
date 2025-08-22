/**
 * 구인구직 관련 타입 정의
 */

// 구인 공고 상태
export enum JobStatus {
  OPEN = 'OPEN',           // 모집중
  CLOSED = 'CLOSED',       // 모집완료
  CANCELLED = 'CANCELLED'  // 취소됨
}

// 고용 형태
export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',     // 정규직
  PART_TIME = 'PART_TIME',     // 시간제
  CONTRACT = 'CONTRACT',       // 계약직
  TEMPORARY = 'TEMPORARY'      // 임시직
}

// 경력 수준
export enum ExperienceLevel {
  ENTRY = 'ENTRY',           // 신입
  JUNIOR = 'JUNIOR',         // 1-3년
  MID = 'MID',              // 3-7년
  SENIOR = 'SENIOR',         // 7년 이상
  EXPERT = 'EXPERT'          // 전문가
}

// 지원서 상태
export enum ApplicationStatus {
  SUBMITTED = 'SUBMITTED',           // 제출됨
  UNDER_REVIEW = 'UNDER_REVIEW',     // 검토중
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED', // 면접예정
  INTERVIEW_COMPLETED = 'INTERVIEW_COMPLETED', // 면접완료
  ACCEPTED = 'ACCEPTED',             // 합격
  REJECTED = 'REJECTED',             // 불합격
  WITHDRAWN = 'WITHDRAWN'            // 지원취소
}

// 구인 공고 정보
export interface Job {
  id: number;
  title: string;
  description: string;
  employmentType: EmploymentType;
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel: ExperienceLevel;
  location: string;
  requirements: string[];
  benefits: string[];
  workSchedule: string;
  status: JobStatus;
  postedDate: string;
  applicationDeadline?: string;
  employerId: number;
  employerName: string;
  facilityName?: string;
  contactEmail: string;
  contactPhone?: string;
  applicationCount: number;
  viewCount: number;
  isUrgent: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// 구인 공고 생성 요청
export interface JobCreateRequest {
  title: string;
  description: string;
  employmentType: EmploymentType;
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel: ExperienceLevel;
  location: string;
  requirements: string[];
  benefits: string[];
  workSchedule: string;
  applicationDeadline?: string;
  contactEmail: string;
  contactPhone?: string;
  isUrgent?: boolean;
  tags?: string[];
}

// 구인 공고 수정 요청
export interface JobUpdateRequest extends Partial<JobCreateRequest> {
  status?: JobStatus;
}

// 구인 공고 검색 파라미터
export interface JobSearchParams {
  keyword?: string;
  location?: string;
  employmentType?: EmploymentType[];
  experienceLevel?: ExperienceLevel[];
  salaryMin?: number;
  salaryMax?: number;
  isUrgent?: boolean;
  tags?: string[];
  page?: number;
  size?: number;
  sortBy?: 'postedDate' | 'salary' | 'deadline' | 'applicationCount';
  sortDirection?: 'asc' | 'desc';
}

// 구인 공고 목록 응답
export interface JobListResponse {
  content: Job[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// 지원서 정보
export interface JobApplication {
  id: number;
  jobId: number;
  jobTitle: string;
  applicantId: number;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  coverLetter: string;
  resumeUrl?: string;
  status: ApplicationStatus;
  appliedDate: string;
  reviewedDate?: string;
  interviewDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 지원서 생성 요청
export interface JobApplicationCreateRequest {
  jobId: number;
  coverLetter: string;
  resumeUrl?: string;
}

// 지원서 수정 요청 (관리자/고용주용)
export interface JobApplicationUpdateRequest {
  status?: ApplicationStatus;
  interviewDate?: string;
  notes?: string;
}

// 면접 일정 요청
export interface InterviewScheduleRequest {
  applicationId: number;
  interviewDate: string;
  location?: string;
  notes?: string;
}

// 지원 상태 업데이트 요청
export interface ApplicationStatusUpdateRequest {
  applicationId: number;
  status: ApplicationStatus;
  notes?: string;
}

// 구인 공고 통계
export interface JobStatistics {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  totalApplications: number;
  averageApplicationsPerJob: number;
  topLocations: Array<{ location: string; count: number }>;
  topEmploymentTypes: Array<{ type: EmploymentType; count: number }>;
  salaryRanges: Array<{ range: string; count: number }>;
}

// 지원자 통계
export interface ApplicantStatistics {
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  averageResponseTime: number; // 시간 단위
  interviewSuccessRate: number; // 백분율
}

// API 에러 응답
export interface JobApiError {
  message: string;
  code: string;
  status: number;
  timestamp: string;
  path: string;
  details?: Record<string, any>;
}