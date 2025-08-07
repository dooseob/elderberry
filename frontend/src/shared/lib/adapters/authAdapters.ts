/**
 * Auth API 응답 데이터 변환 어댑터
 * 백엔드 DTO와 프론트엔드 타입 간의 변환 처리
 */
import type {
  TokenResponse,
  MemberResponse,
  MemberRole,
  AuthUser
} from '../../../types/auth';

// 백엔드 DTO 타입 정의
interface BackendMemberDto {
  id: number;
  email: string;
  name: string;
  phoneNumber?: string;
  role: string;
  profileCompletionRate?: number;
  isActive: boolean;
  isJobSeeker?: boolean;
  language?: string;
  region?: string;
  createdAt: string;
  updatedAt: string;
}

interface BackendTokenResponseDto {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  member: BackendMemberDto;
}

// Role 매핑 함수
const mapMemberRole = (backendRole: string): MemberRole => {
  const roleMap: Record<string, MemberRole> = {
    'ADMIN': MemberRole.ADMIN,
    'FACILITY': MemberRole.FACILITY,
    'COORDINATOR': MemberRole.COORDINATOR,
    'USER_DOMESTIC': MemberRole.USER_DOMESTIC,
    'USER_OVERSEAS': MemberRole.USER_OVERSEAS,
    'JOB_SEEKER_DOMESTIC': MemberRole.JOB_SEEKER_DOMESTIC,
    'JOB_SEEKER_OVERSEAS': MemberRole.JOB_SEEKER_OVERSEAS
  };
  
  return roleMap[backendRole] || MemberRole.USER_DOMESTIC;
};

/**
 * 백엔드 Member DTO를 프론트엔드 MemberResponse 타입으로 변환
 */
export const adaptBackendMember = (backendMember: BackendMemberDto): MemberResponse => {
  return {
    id: backendMember.id,
    email: backendMember.email,
    name: backendMember.name,
    phoneNumber: backendMember.phoneNumber,
    role: mapMemberRole(backendMember.role),
    profileCompletionRate: backendMember.profileCompletionRate || 0,
    isActive: backendMember.isActive,
    isJobSeeker: backendMember.isJobSeeker,
    language: backendMember.language,
    region: backendMember.region,
    createdAt: backendMember.createdAt,
    updatedAt: backendMember.updatedAt
  };
};

/**
 * 백엔드 TokenResponse DTO를 프론트엔드 TokenResponse 타입으로 변환
 */
export const adaptBackendTokenResponse = (backendResponse: BackendTokenResponseDto): TokenResponse => {
  return {
    accessToken: backendResponse.accessToken,
    refreshToken: backendResponse.refreshToken,
    tokenType: backendResponse.tokenType,
    expiresIn: backendResponse.expiresIn,
    member: adaptBackendMember(backendResponse.member)
  };
};

/**
 * MemberResponse를 AuthUser 타입으로 변환
 */
export const memberResponseToAuthUser = (member: MemberResponse): AuthUser => {
  return {
    id: member.id,
    email: member.email,
    name: member.name,
    role: member.role,
    profileCompletionRate: member.profileCompletionRate || 0,
    isActive: member.isActive
  };
};

/**
 * 백엔드 Member DTO를 AuthUser 타입으로 직접 변환
 */
export const adaptBackendMemberToAuthUser = (backendMember: BackendMemberDto): AuthUser => {
  return {
    id: backendMember.id,
    email: backendMember.email,
    name: backendMember.name,
    role: mapMemberRole(backendMember.role),
    profileCompletionRate: backendMember.profileCompletionRate || 0,
    isActive: backendMember.isActive
  };
};

/**
 * 타입 안전 검증 함수들
 */
export const isBackendMemberDto = (data: any): data is BackendMemberDto => {
  return data && 
         typeof data.id === 'number' &&
         typeof data.email === 'string' &&
         typeof data.name === 'string' &&
         typeof data.role === 'string' &&
         typeof data.isActive === 'boolean';
};

export const isBackendTokenResponseDto = (data: any): data is BackendTokenResponseDto => {
  return data && 
         typeof data.accessToken === 'string' &&
         typeof data.tokenType === 'string' &&
         typeof data.expiresIn === 'number' &&
         data.member &&
         isBackendMemberDto(data.member);
};

/**
 * 에러 상황 처리를 위한 기본값 생성
 */
export const createEmptyAuthUser = (): AuthUser => ({
  id: 0,
  email: '',
  name: '',
  role: MemberRole.USER_DOMESTIC,
  profileCompletionRate: 0,
  isActive: false
});

export const createEmptyMemberResponse = (): MemberResponse => ({
  id: 0,
  email: '',
  name: '',
  role: MemberRole.USER_DOMESTIC,
  profileCompletionRate: 0,
  isActive: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

/**
 * 프론트엔드 요청 데이터를 백엔드 형식으로 변환
 */
export const adaptFrontendLoginRequest = (frontendRequest: any) => {
  return {
    email: frontendRequest.email,
    password: frontendRequest.password,
    rememberMe: frontendRequest.rememberMe || false
  };
};

export const adaptFrontendRegisterRequest = (frontendRequest: any) => {
  return {
    email: frontendRequest.email,
    password: frontendRequest.password,
    name: frontendRequest.name,
    phone: frontendRequest.phone,
    role: frontendRequest.role || 'USER_DOMESTIC'
  };
};

export const adaptFrontendMemberUpdateRequest = (frontendRequest: any) => {
  const adapted: any = {};
  
  if (frontendRequest.name !== undefined) adapted.name = frontendRequest.name;
  if (frontendRequest.phone !== undefined) adapted.phone = frontendRequest.phone;
  if (frontendRequest.currentPassword !== undefined) adapted.currentPassword = frontendRequest.currentPassword;
  if (frontendRequest.newPassword !== undefined) adapted.newPassword = frontendRequest.newPassword;
  
  return adapted;
};