/**
 * Profile Features Components - Public API
 * FSD 아키텍처에 따른 프로필 기능 컴포넌트 공개 인터페이스
 */

// 프로필 수정 폼
export { ProfileEditForm, default as ProfileEditFormDefault } from './ProfileEditForm';

// 구직자 상태 토글
export { JobSeekerToggle, default as JobSeekerToggleDefault } from './JobSeekerToggle';

// 타입 정의 (필요한 경우)
export type { 
  // ProfileEditForm 관련 타입들은 entities/user에서 가져옴
} from '../../../entities/user';