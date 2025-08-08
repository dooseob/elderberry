/**
 * Boards Feature - Public API
 * FSD 아키텍처: 게시판 기능 캡슐화
 */

// 메인 페이지들
export { default as BoardListPage } from './BoardListPage';
export { default as BoardDetailPage } from './BoardDetailPage';
export { default as PostDetailPage } from './PostDetailPage';
export { default as PostCreatePage } from './PostCreatePage';
export { default as PostEditPage } from './PostEditPage';

// 컴포넌트들
export { PostEditor } from './components/PostEditor';
export { CommentForm } from './components/CommentForm';
export { CommentList } from './components/CommentList';