/**
 * Board Entity - Constants
 * FSD 아키텍처: 게시판 관련 상수 정의
 */

import type { BoardType, BoardMetadata } from './types';

// 게시판 타입별 메타데이터
export const BOARD_METADATA: BoardMetadata = {
  GENERAL: {
    label: '일반 게시판',
    description: '자유로운 의견 교환 공간입니다',
    icon: '💬',
    color: 'blue',
    allowAnonymous: false,
    requireAuth: true
  },
  NOTICE: {
    label: '공지사항',
    description: '중요한 공지사항을 확인하세요',
    icon: '📢',
    color: 'red',
    allowAnonymous: true,
    requireAuth: false
  },
  FAQ: {
    label: '자주묻는질문',
    description: '자주 묻는 질문과 답변입니다',
    icon: '❓',
    color: 'yellow',
    allowAnonymous: true,
    requireAuth: false
  },
  QNA: {
    label: 'Q&A',
    description: '궁금한 점을 질문하고 답변받으세요',
    icon: '🙋‍♀️',
    color: 'green',
    allowAnonymous: false,
    requireAuth: true
  },
  JOB: {
    label: '구인구직',
    description: '요양원 채용정보와 구직정보를 공유하세요',
    icon: '💼',
    color: 'purple',
    allowAnonymous: false,
    requireAuth: true
  },
  COMMUNITY: {
    label: '커뮤니티',
    description: '같은 관심사를 가진 사람들과 소통하세요',
    icon: '👥',
    color: 'indigo',
    allowAnonymous: false,
    requireAuth: true
  },
  ANNOUNCEMENT: {
    label: '공고',
    description: '시설 및 기관의 공식 공고입니다',
    icon: '📋',
    color: 'orange',
    allowAnonymous: true,
    requireAuth: false
  },
  REVIEW: {
    label: '후기',
    description: '시설 이용 후기와 경험담을 나누세요',
    icon: '⭐',
    color: 'pink',
    allowAnonymous: false,
    requireAuth: true
  }
};

// 게시글 정렬 옵션
export const POST_SORT_OPTIONS = [
  { value: 'createdDate', label: '최신순', direction: 'DESC' },
  { value: 'createdDate', label: '오래된순', direction: 'ASC' },
  { value: 'viewCount', label: '조회수순', direction: 'DESC' },
  { value: 'commentCount', label: '댓글순', direction: 'DESC' },
  { value: 'title', label: '제목순', direction: 'ASC' }
] as const;

// 게시글 검색 타입
export const POST_SEARCH_TYPES = [
  { value: 'all', label: '전체' },
  { value: 'title', label: '제목' },
  { value: 'content', label: '내용' },
  { value: 'author', label: '작성자' }
] as const;

// 페이지 크기 옵션
export const PAGE_SIZE_OPTIONS = [10, 20, 30, 50] as const;

// 게시판 권한 레벨
export const BOARD_PERMISSION = {
  READ: 'READ',
  WRITE: 'WRITE', 
  ADMIN: 'ADMIN'
} as const;

// 게시글 상태별 스타일
export const POST_STATUS_STYLES = {
  ACTIVE: {
    color: 'text-gray-900',
    bgColor: 'bg-white',
    borderColor: 'border-gray-200'
  },
  INACTIVE: {
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300'
  },
  DELETED: {
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  }
} as const;

// 댓글 상태별 스타일
export const COMMENT_STATUS_STYLES = {
  ACTIVE: {
    color: 'text-gray-900',
    bgColor: 'bg-white'
  },
  DELETED: {
    color: 'text-gray-400',
    bgColor: 'bg-gray-50'
  }
} as const;

// 게시판별 기본 설정
export const BOARD_DEFAULT_CONFIG = {
  postsPerPage: 20,
  commentsPerPage: 50,
  maxTitleLength: 100,
  maxContentLength: 10000,
  maxCommentLength: 1000,
  allowFileAttachment: true,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
} as const;

// 게시판 타입별 색상 매핑 (Tailwind CSS)
export const BOARD_COLORS = {
  GENERAL: 'blue',
  NOTICE: 'red', 
  FAQ: 'yellow',
  QNA: 'green',
  JOB: 'purple',
  COMMUNITY: 'indigo',
  ANNOUNCEMENT: 'orange',
  REVIEW: 'pink'
} as const;

// 에러 메시지
export const BOARD_ERROR_MESSAGES = {
  BOARD_NOT_FOUND: '게시판을 찾을 수 없습니다.',
  POST_NOT_FOUND: '게시글을 찾을 수 없습니다.',
  COMMENT_NOT_FOUND: '댓글을 찾을 수 없습니다.',
  NO_PERMISSION: '권한이 없습니다.',
  TITLE_REQUIRED: '제목을 입력해주세요.',
  CONTENT_REQUIRED: '내용을 입력해주세요.',
  TITLE_TOO_LONG: '제목이 너무 깁니다.',
  CONTENT_TOO_LONG: '내용이 너무 깁니다.',
  LOAD_ERROR: '데이터를 불러오는데 실패했습니다.',
  SAVE_ERROR: '저장하는데 실패했습니다.',
  DELETE_ERROR: '삭제하는데 실패했습니다.'
} as const;