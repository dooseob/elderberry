import { BaseEntity } from 'shared/types';
import type { Member } from 'entities/auth';

/**
 * 게시판 타입
 */
export enum BoardType {
  NOTICE = 'NOTICE',
  QNA = 'QNA',
  FREE = 'FREE',
  JOB = 'JOB'
}

/**
 * 게시글 상태
 */
export enum PostStatus {
  ACTIVE = 'ACTIVE',
  HIDDEN = 'HIDDEN',
  REPORTED = 'REPORTED'
}

/**
 * 댓글 상태
 */
export enum CommentStatus {
  ACTIVE = 'ACTIVE',
  HIDDEN = 'HIDDEN',
  DELETED = 'DELETED'
}

/**
 * 게시판 엔티티
 */
export interface Board extends BaseEntity {
  id: number;
  name: string;
  description?: string;
  type: BoardType;
  isActive: boolean;
  sortOrder: number;
  adminOnly: boolean;
  posts: Post[];
  postCount: number;
}

/**
 * 게시글 엔티티
 */
export interface Post extends BaseEntity {
  id: number;
  title: string;
  content: string;
  author: Member;
  board: Board;
  viewCount: number;
  isPinned: boolean;
  isDeleted: boolean;
  active: boolean;
  status: PostStatus;
  comments: Comment[];
  commentCount: number;
  likeCount: number;
  dislikeCount: number;
  
  // Computed properties
  authorName: string;
  boardName: string;
  isEditable: boolean;
  canDelete: boolean;
}

/**
 * 댓글 엔티티
 */
export interface Comment extends BaseEntity {
  id: number;
  content: string;
  author: Member;
  post: Post;
  parentComment?: Comment;
  status: CommentStatus;
  likeCount: number;
  dislikeCount: number;
  replies: Comment[];
  
  // Computed properties
  authorName: string;
  isReply: boolean;
  isEditable: boolean;
  canDelete: boolean;
}

/**
 * 게시판 생성 요청
 */
export interface BoardCreateRequest {
  name: string;
  description?: string;
  type: BoardType;
  isActive?: boolean;
  sortOrder?: number;
  adminOnly?: boolean;
}

/**
 * 게시판 수정 요청
 */
export interface BoardUpdateRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
  adminOnly?: boolean;
}

/**
 * 게시글 생성 요청
 */
export interface PostCreateRequest {
  boardId: number;
  title: string;
  content: string;
  isPinned?: boolean;
}

/**
 * 게시글 수정 요청
 */
export interface PostUpdateRequest {
  title?: string;
  content?: string;
  isPinned?: boolean;
  status?: PostStatus;
}

/**
 * 댓글 생성 요청
 */
export interface CommentCreateRequest {
  postId: number;
  content: string;
  parentCommentId?: number;
}

/**
 * 댓글 수정 요청
 */
export interface CommentUpdateRequest {
  content: string;
}

/**
 * 게시글 검색 필터
 */
export interface PostSearchFilters {
  boardId?: number;
  boardType?: BoardType;
  keyword?: string;
  authorId?: number;
  status?: PostStatus;
  isPinned?: boolean;
  sortBy?: 'createdAt' | 'viewCount' | 'commentCount' | 'likeCount';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

/**
 * 게시글 목록 응답
 */
export interface PostResponse {
  content: Post[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

/**
 * 댓글 목록 응답
 */
export interface CommentResponse {
  content: Comment[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

/**
 * 게시판 통계
 */
export interface BoardStatistics {
  totalPosts: number;
  totalComments: number;
  totalViews: number;
  activeUsers: number;
  popularPosts: Post[];
  recentActivity: Array<{
    type: 'post' | 'comment';
    id: number;
    title: string;
    author: string;
    createdAt: string;
  }>;
}

/**
 * 게시판 타입별 디스플레이 명
 */
export const BOARD_TYPE_LABELS: Record<BoardType, string> = {
  [BoardType.NOTICE]: '공지사항',
  [BoardType.QNA]: '질문답변',
  [BoardType.FREE]: '자유게시판',
  [BoardType.JOB]: '취업정보'
};

/**
 * 게시글 상태별 디스플레이 명
 */
export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  [PostStatus.ACTIVE]: '정상',
  [PostStatus.HIDDEN]: '숨김',
  [PostStatus.REPORTED]: '신고됨'
};

/**
 * 댓글 상태별 디스플레이 명
 */
export const COMMENT_STATUS_LABELS: Record<CommentStatus, string> = {
  [CommentStatus.ACTIVE]: '정상',
  [CommentStatus.HIDDEN]: '숨김',
  [CommentStatus.DELETED]: '삭제됨'
};

/**
 * 게시판 아이콘 매핑
 */
export const BOARD_TYPE_ICONS: Record<BoardType, string> = {
  [BoardType.NOTICE]: 'megaphone',
  [BoardType.QNA]: 'help-circle',
  [BoardType.FREE]: 'message-square',
  [BoardType.JOB]: 'briefcase'
};

/**
 * 게시판 색상 매핑
 */
export const BOARD_TYPE_COLORS: Record<BoardType, string> = {
  [BoardType.NOTICE]: 'blue',
  [BoardType.QNA]: 'green',
  [BoardType.FREE]: 'purple',
  [BoardType.JOB]: 'orange'
};
