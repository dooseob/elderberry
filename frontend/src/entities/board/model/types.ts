/**
 * Board Entity - Domain Types
 * FSD 아키텍처: 게시판 도메인 모델 타입 정의
 */

// 게시판 타입 열거형
export type BoardType = 
  | 'GENERAL'      // 일반 게시판
  | 'NOTICE'       // 공지사항  
  | 'FAQ'          // 자주묻는질문
  | 'QNA'          // Q&A
  | 'JOB'          // 구인구직
  | 'COMMUNITY'    // 커뮤니티
  | 'ANNOUNCEMENT' // 공고
  | 'REVIEW';      // 후기

// 게시글 상태
export type PostStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED';

// 댓글 상태
export type CommentStatus = 'ACTIVE' | 'DELETED';

// 게시판 기본 정보
export interface Board {
  id: number;
  name: string;
  description?: string;
  type: BoardType;
  adminOnly: boolean;
  sortOrder: number;
  active: boolean;
  createdDate: string;
  lastModifiedDate?: string;
  postCount?: number; // 게시글 수 (optional)
}

// 게시글 정보
export interface Post {
  id: number;
  title: string;
  content: string;
  author: {
    id: number;
    username: string;
    name: string;
  };
  board: {
    id: number;
    name: string;
    type: BoardType;
  };
  status: PostStatus;
  viewCount: number;
  likeCount?: number;
  commentCount: number;
  createdDate: string;
  lastModifiedDate?: string;
  pinned?: boolean; // 상단 고정
  tags?: string[];  // 태그
}

// 댓글 정보  
export interface Comment {
  id: number;
  content: string;
  author: {
    id: number;
    username: string;
    name: string;
  };
  post: {
    id: number;
    title: string;
  };
  status: CommentStatus;
  createdDate: string;
  lastModifiedDate?: string;
  parentId?: number; // 대댓글용
  replies?: Comment[]; // 대댓글 목록
}

// API 요청/응답 타입들
export interface PostCreateRequest {
  title: string;
  content: string;
  tags?: string[];
}

export interface PostUpdateRequest {
  title: string;
  content: string;
  tags?: string[];
}

export interface CommentCreateRequest {
  content: string;
  parentId?: number;
}

export interface CommentUpdateRequest {
  content: string;
}

export interface BoardCreateRequest {
  name: string;
  description?: string;
  type: BoardType;
  adminOnly: boolean;
  sortOrder: number;
}

export interface BoardUpdateRequest {
  name: string;
  description?: string;
  adminOnly: boolean;
  sortOrder: number;
}

// 페이지네이션 응답
export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      property: string;
      direction: 'ASC' | 'DESC';
    };
  };
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

// 게시글 검색 파라미터
export interface PostSearchParams {
  keyword: string;
  searchType: 'title' | 'content' | 'author' | 'all';
  page?: number;
  size?: number;
}

// 게시판 메타데이터
export interface BoardMetadata {
  [key in BoardType]: {
    label: string;
    description: string;
    icon: string;
    color: string;
    allowAnonymous?: boolean;
    requireAuth?: boolean;
  };
}

// 게시판 통계
export interface BoardStats {
  boardId: number;
  totalPosts: number;
  todayPosts: number;
  totalViews: number;
  popularPosts: Post[];
  recentPosts: Post[];
}

// 사용자 게시 활동
export interface UserBoardActivity {
  userId: number;
  totalPosts: number;
  totalComments: number;
  recentPosts: Post[];
  recentComments: Comment[];
}