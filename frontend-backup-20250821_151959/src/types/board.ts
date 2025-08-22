/**
 * 게시판 관련 타입 정의
 */

// 게시판 타입
export enum BoardType {
  GENERAL = 'GENERAL',           // 일반 게시판
  NOTICE = 'NOTICE',             // 공지사항
  FAQ = 'FAQ',                   // 자주 묻는 질문
  QNA = 'QNA',                   // 질문과 답변
  REVIEW = 'REVIEW',             // 후기
  FREE = 'FREE',                 // 자유 게시판
  JOB_DISCUSSION = 'JOB_DISCUSSION', // 구인구직 토론
  TIPS = 'TIPS',                 // 팁과 노하우
  NEWS = 'NEWS'                  // 업계 소식
}

// 게시글 상태
export enum PostStatus {
  ACTIVE = 'ACTIVE',             // 활성
  HIDDEN = 'HIDDEN',             // 숨김
  DELETED = 'DELETED'            // 삭제됨
}

// 댓글 상태
export enum CommentStatus {
  ACTIVE = 'ACTIVE',             // 활성
  HIDDEN = 'HIDDEN',             // 숨김
  DELETED = 'DELETED'            // 삭제됨
}

// 게시판 정보
export interface Board {
  id: number;
  name: string;
  description: string;
  type: BoardType;
  isPublic: boolean;
  allowAnonymous: boolean;
  requireApproval: boolean;
  postCount: number;
  lastPostDate?: string;
  createdAt: string;
  updatedAt: string;
}

// 게시글 정보
export interface Post {
  id: number;
  boardId: number;
  boardName: string;
  title: string;
  content: string;
  summary?: string;
  authorId: number;
  authorName: string;
  authorRole: string;
  isAnonymous: boolean;
  isNotice: boolean;
  isPinned: boolean;
  status: PostStatus;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  tags: string[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

// 댓글 정보
export interface Comment {
  id: number;
  postId: number;
  parentId?: number;
  authorId: number;
  authorName: string;
  authorRole: string;
  isAnonymous: boolean;
  content: string;
  status: CommentStatus;
  likeCount: number;
  replies: Comment[];
  createdAt: string;
  updatedAt: string;
}

// 첨부파일 정보
export interface Attachment {
  id: number;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  fileType: string;
  downloadUrl: string;
  uploadedAt: string;
}

// 게시글 생성 요청
export interface PostCreateRequest {
  boardId: number;
  title: string;
  content: string;
  isAnonymous?: boolean;
  isNotice?: boolean;
  isPinned?: boolean;
  tags?: string[];
  attachmentIds?: number[];
}

// 게시글 수정 요청
export interface PostUpdateRequest {
  title?: string;
  content?: string;
  isAnonymous?: boolean;
  isNotice?: boolean;
  isPinned?: boolean;
  tags?: string[];
  status?: PostStatus;
  attachmentIds?: number[];
}

// 댓글 생성 요청
export interface CommentCreateRequest {
  postId: number;
  parentId?: number;
  content: string;
  isAnonymous?: boolean;
}

// 댓글 수정 요청
export interface CommentUpdateRequest {
  content?: string;
  isAnonymous?: boolean;
  status?: CommentStatus;
}

// 게시글 검색 파라미터
export interface PostSearchParams {
  boardId?: number;
  boardType?: BoardType;
  keyword?: string;
  authorName?: string;
  tags?: string[];
  isNotice?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sortBy?: 'createdAt' | 'viewCount' | 'likeCount' | 'commentCount';
  sortDirection?: 'asc' | 'desc';
}

// 게시글 목록 응답
export interface PostListResponse {
  content: Post[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// 게시글 좋아요 정보
export interface PostLike {
  id: number;
  postId: number;
  userId: number;
  createdAt: string;
}

// 댓글 좋아요 정보
export interface CommentLike {
  id: number;
  commentId: number;
  userId: number;
  createdAt: string;
}

// 게시판 통계
export interface BoardStatistics {
  totalBoards: number;
  totalPosts: number;
  totalComments: number;
  totalViews: number;
  totalLikes: number;
  activeUsers: number;
  topBoards: Array<{
    boardId: number;
    boardName: string;
    postCount: number;
    viewCount: number;
  }>;
  topAuthors: Array<{
    authorId: number;
    authorName: string;
    postCount: number;
    likeCount: number;
  }>;
  popularTags: Array<{
    tag: string;
    count: number;
  }>;
}

// 사용자 활동 통계
export interface UserBoardActivity {
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  totalViews: number;
  recentPosts: Post[];
  recentComments: Comment[];
  favoriteBoards: Array<{
    boardId: number;
    boardName: string;
    activityCount: number;
  }>;
}

// 인기 게시글
export interface PopularPost {
  id: number;
  title: string;
  boardName: string;
  authorName: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  trend: 'up' | 'down' | 'stable';
}

// 파일 업로드 응답
export interface FileUploadResponse {
  id: number;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  fileType: string;
  uploadUrl: string;
  downloadUrl: string;
}

// API 에러 응답
export interface BoardApiError {
  message: string;
  code: string;
  status: number;
  timestamp: string;
  path: string;
  details?: Record<string, any>;
}