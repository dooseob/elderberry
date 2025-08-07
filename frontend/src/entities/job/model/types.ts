import { BaseEntity } from 'shared/types';
import type { Member } from 'entities/auth';

/**
 * 직종 카테고리
 */
export enum JobCategory {
  CAREGIVER = 'CAREGIVER',
  NURSE = 'NURSE', 
  PHYSICAL_THERAPIST = 'PHYSICAL_THERAPIST',
  OCCUPATIONAL_THERAPIST = 'OCCUPATIONAL_THERAPIST',
  SOCIAL_WORKER = 'SOCIAL_WORKER',
  FACILITY_MANAGER = 'FACILITY_MANAGER',
  ADMINISTRATOR = 'ADMINISTRATOR',
  DRIVER = 'DRIVER',
  COOK = 'COOK',
  CLEANER = 'CLEANER',
  OTHER = 'OTHER'
}

/**
 * 급여 유형
 */
export enum SalaryType {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  MONTHLY = 'MONTHLY', 
  ANNUAL = 'ANNUAL',
  NEGOTIABLE = 'NEGOTIABLE'
}

/**
 * 경력 수준
 */
export enum ExperienceLevel {
  ENTRY = 'ENTRY',
  JUNIOR = 'JUNIOR',
  SENIOR = 'SENIOR',
  EXPERT = 'EXPERT',
  ANY = 'ANY'
}

/**
 * 근무 형태
 */
export enum WorkType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  SHIFT = 'SHIFT',
  FLEXIBLE = 'FLEXIBLE'
}

/**
 * 공고 상태
 */
export enum JobStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED'
}

/**
 * 지원 상태
 */
export enum ApplicationStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  INTERVIEW_COMPLETED = 'INTERVIEW_COMPLETED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

/**
 * 구인 공고 엔티티
 */
export interface Job extends BaseEntity {
  id: number;
  title: string;
  description: string;
  employer: Member;
  companyName: string;
  workLocation: string;
  detailAddress?: string;
  latitude?: number;
  longitude?: number;
  category: JobCategory;
  salaryType: SalaryType;
  minSalary?: number;
  maxSalary?: number;
  experienceLevel: ExperienceLevel;
  minExperienceYears?: number;
  workType: WorkType;
  workHours?: string;
  recruitCount: number;
  applicationDeadline: string; // ISO date string
  preferredQualifications?: string;
  benefits?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactPerson?: string;
  viewCount: number;
  status: JobStatus;
  isUrgent: boolean;
  isFeatured: boolean;
  applications: JobApplication[];
  applicationCount: number;
  isDeadlineApproaching: boolean;
  isExpired: boolean;
}

/**
 * 지원서 엔티티
 */
export interface JobApplication extends BaseEntity {
  id: number;
  job: Job;
  applicant: Member;
  status: ApplicationStatus;
  appliedAt: string; // ISO date string
  coverLetter?: string;
  resumeUrl?: string;
  interviewDate?: string; // ISO date string
  interviewLocation?: string;
  notes?: string;
  reviewedAt?: string; // ISO date string
}

/**
 * 채용 공고 생성 요청
 */
export interface JobCreateRequest {
  title: string;
  description: string;
  companyName: string;
  workLocation: string;
  detailAddress?: string;
  latitude?: number;
  longitude?: number;
  category: JobCategory;
  salaryType: SalaryType;
  minSalary?: number;
  maxSalary?: number;
  experienceLevel: ExperienceLevel;
  minExperienceYears?: number;
  workType: WorkType;
  workHours?: string;
  recruitCount: number;
  applicationDeadline: string;
  preferredQualifications?: string;
  benefits?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactPerson?: string;
  isUrgent?: boolean;
  isFeatured?: boolean;
}

/**
 * 채용 공고 수정 요청
 */
export interface JobUpdateRequest extends Partial<JobCreateRequest> {
  status?: JobStatus;
}

/**
 * 지원서 제출 요청
 */
export interface JobApplicationCreateRequest {
  jobId: number;
  coverLetter?: string;
  resumeUrl?: string;
}

/**
 * 지원서 상태 업데이트 요청
 */
export interface ApplicationStatusUpdateRequest {
  status: ApplicationStatus;
  interviewDate?: string;
  interviewLocation?: string;
  notes?: string;
}

/**
 * 채용 공고 검색 필터
 */
export interface JobSearchFilters {
  keyword?: string;
  category?: JobCategory;
  salaryType?: SalaryType;
  experienceLevel?: ExperienceLevel;
  workType?: WorkType;
  minSalary?: number;
  maxSalary?: number;
  location?: string;
  isUrgent?: boolean;
  status?: JobStatus;
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * 채용 공고 응답
 */
export interface JobResponse {
  content: Job[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

/**
 * 카테고리별 디스플레이 명
 */
export const JOB_CATEGORY_LABELS: Record<JobCategory, string> = {
  [JobCategory.CAREGIVER]: '요양보호사',
  [JobCategory.NURSE]: '간병인',
  [JobCategory.PHYSICAL_THERAPIST]: '물리치료사',
  [JobCategory.OCCUPATIONAL_THERAPIST]: '작업치료사',
  [JobCategory.SOCIAL_WORKER]: '사회복지사',
  [JobCategory.FACILITY_MANAGER]: '시설관리자',
  [JobCategory.ADMINISTRATOR]: '사무직',
  [JobCategory.DRIVER]: '운전기사',
  [JobCategory.COOK]: '조리사',
  [JobCategory.CLEANER]: '청소원',
  [JobCategory.OTHER]: '기타'
};

/**
 * 급여 유형별 디스플레이 명
 */
export const SALARY_TYPE_LABELS: Record<SalaryType, string> = {
  [SalaryType.HOURLY]: '시급',
  [SalaryType.DAILY]: '일급',
  [SalaryType.MONTHLY]: '월급',
  [SalaryType.ANNUAL]: '연봉',
  [SalaryType.NEGOTIABLE]: '협의'
};

/**
 * 경력 수준별 디스플레이 명
 */
export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  [ExperienceLevel.ENTRY]: '신입',
  [ExperienceLevel.JUNIOR]: '경력 1-3년',
  [ExperienceLevel.SENIOR]: '경력 3-5년',
  [ExperienceLevel.EXPERT]: '경력 5년 이상',
  [ExperienceLevel.ANY]: '경력무관'
};

/**
 * 근무 형태별 디스플레이 명
 */
export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  [WorkType.FULL_TIME]: '정규직',
  [WorkType.PART_TIME]: '계약직',
  [WorkType.CONTRACT]: '파트타임',
  [WorkType.SHIFT]: '교대근무',
  [WorkType.FLEXIBLE]: '유연근무'
};

/**
 * 공고 상태별 디스플레이 명
 */
export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  [JobStatus.ACTIVE]: '모집중',
  [JobStatus.CLOSED]: '마감',
  [JobStatus.SUSPENDED]: '임시중단',
  [JobStatus.DELETED]: '삭제됨'
};

/**
 * 지원 상태별 디스플레이 명
 */
export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.SUBMITTED]: '지원완료',
  [ApplicationStatus.UNDER_REVIEW]: '검토중',
  [ApplicationStatus.INTERVIEW_SCHEDULED]: '면접예정',
  [ApplicationStatus.INTERVIEW_COMPLETED]: '면접완료',
  [ApplicationStatus.ACCEPTED]: '합격',
  [ApplicationStatus.REJECTED]: '불합격',
  [ApplicationStatus.WITHDRAWN]: '지원취소'
};
