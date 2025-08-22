/**
 * Board Entity - Public API
 * FSD 아키텍처: 게시판 엔티티 공개 인터페이스
 */

// Types
export type {
  Board,
  Post,
  Comment,
  BoardType,
  PostStatus,
  CommentStatus,
  PostCreateRequest,
  PostUpdateRequest,
  CommentCreateRequest,
  CommentUpdateRequest,
  BoardCreateRequest,
  BoardUpdateRequest,
  Page,
  PostSearchParams,
  BoardMetadata,
  BoardStats,
  UserBoardActivity
} from './model/types';

// API
export { boardApi } from './api/boardApi';

// Constants
export {
  BOARD_METADATA,
  POST_SORT_OPTIONS,
  POST_SEARCH_TYPES,
  PAGE_SIZE_OPTIONS,
  BOARD_PERMISSION,
  POST_STATUS_STYLES,
  COMMENT_STATUS_STYLES,
  BOARD_DEFAULT_CONFIG,
  BOARD_COLORS,
  BOARD_ERROR_MESSAGES
} from './model/constants';