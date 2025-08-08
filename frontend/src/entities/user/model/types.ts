/**
 * User 엔티티 타입 정의
 * FSD 구조에 맞춘 사용자 도메인 타입
 */
import { BaseEntity, UserRole } from '../../../shared/types/common';
import { 
  Profile, 
  DomesticProfile, 
  OverseasProfile,
  ProfileType,
  Gender,
  ProfileCompletionStatus 
} from '../../../types/profile';

// 기본 사용자 엔티티
export interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
  profileCompletionRate: number;
  isActive: boolean;
  lastLoginAt?: string;
  profileImageUrl?: string;
  phoneNumber?: string;
}

// 확장된 사용자 정보 (프로필 포함)
export interface UserWithProfile extends User {
  profile?: Profile;
  profileType?: ProfileType;
}

// 사용자 프로필 요약 정보
export interface UserProfileSummary {
  userId: number;
  name: string;
  email: string;
  profileType?: ProfileType;
  age?: number;
  gender?: Gender;
  profileCompletionRate: number;
  hasEssentialInfo: boolean;
  isProfileComplete: boolean;
  lastUpdated: string;
}

// 사용자 생성 요청
export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phoneNumber?: string;
}

// 사용자 업데이트 요청 (백엔드 MemberUpdateRequest와 일치)
export interface UpdateUserRequest {
  name?: string;
  phoneNumber?: string;
  language?: string;
  region?: string;
}

// 회원 응답 타입 (백엔드 MemberResponse와 일치)
export interface MemberResponse {
  id: number;
  email: string;
  name: string;
  phoneNumber?: string;
  role: UserRole;
  isJobSeeker: boolean;
  isActive: boolean;
  language?: string;
  region?: string;
  createdAt: string;
  updatedAt: string;
}

// 프로필 수정 폼 데이터
export interface ProfileEditFormData {
  name: string;
  phoneNumber: string;
  language: string;
  region: string;
}

// 프로필 수정 검증 에러
export interface ProfileEditErrors {
  name?: string;
  phoneNumber?: string;
  language?: string;
  region?: string;
}

// 사용자 상태 변경 요청
export interface UpdateUserStatusRequest {
  isActive: boolean;
  reason?: string;
}

// 사용자 검색 파라미터
export interface UserSearchParams {
  keyword?: string;
  role?: UserRole[];
  isActive?: boolean;
  profileType?: ProfileType[];
  minCompletionRate?: number;
  maxCompletionRate?: number;
  hasProfile?: boolean;
  
  // 페이징
  page?: number;
  size?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'profileCompletionRate' | 'lastLoginAt';
  sortDirection?: 'asc' | 'desc';
}

// 사용자 목록 응답
export interface UserListResponse {
  content: UserWithProfile[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// 사용자 통계
export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  
  // 역할별 분포
  roleDistribution: {
    role: UserRole;
    count: number;
  }[];
  
  // 프로필 타입별 분포
  profileTypeDistribution: {
    type: ProfileType | 'none';
    count: number;
  }[];
  
  // 완성도별 분포
  completionDistribution: {
    range: string;
    count: number;
  }[];
  
  // 최근 활동
  recentActivity: {
    newUsers: number;
    profileUpdates: number;
    logins: number;
  };
}

// 사용자 활동 로그
export interface UserActivity {
  id: number;
  userId: number;
  activityType: 'login' | 'logout' | 'profile_update' | 'status_change' | 'password_change';
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

// 타입 가드 함수
export function isUserWithDomesticProfile(user: UserWithProfile): user is UserWithProfile & { profile: DomesticProfile } {
  return user.profile?.profileType === ProfileType.DOMESTIC;
}

export function isUserWithOverseasProfile(user: UserWithProfile): user is UserWithProfile & { profile: OverseasProfile } {
  return user.profile?.profileType === ProfileType.OVERSEAS;
}