/**
 * 게시판 관련 API 서비스
 */
import axios, { AxiosResponse } from 'axios';
import {
  Board,
  Post,
  Comment,
  PostCreateRequest,
  PostUpdateRequest,
  CommentCreateRequest,
  CommentUpdateRequest,
  PostSearchParams,
  PostListResponse,
  BoardStatistics,
  UserBoardActivity,
  PopularPost,
  FileUploadResponse,
  BoardApiError
} from '../types/board';

// API 인스턴스 생성
const boardApi = axios.create({
  baseURL: '/api/boards',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const postApi = axios.create({
  baseURL: '/api/posts',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const commentApi = axios.create({
  baseURL: '/api/comments',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const fileApi = axios.create({
  baseURL: '/api/files',
  timeout: 30000, // 파일 업로드는 더 긴 타임아웃
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

// 요청 인터셉터: 토큰 자동 추가
const addAuthToken = (config: any) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

boardApi.interceptors.request.use(addAuthToken);
postApi.interceptors.request.use(addAuthToken);
commentApi.interceptors.request.use(addAuthToken);
fileApi.interceptors.request.use(addAuthToken);

// 응답 인터셉터: 에러 처리
const handleApiError = (error: any): Promise<never> => {
  const apiError: BoardApiError = {
    message: error.response?.data?.message || '네트워크 오류가 발생했습니다.',
    code: error.response?.data?.code || 'NETWORK_ERROR',
    status: error.response?.status || 500,
    timestamp: new Date().toISOString(),
    path: error.config?.url || '',
    details: error.response?.data?.details
  };
  return Promise.reject(apiError);
};

[boardApi, postApi, commentApi, fileApi].forEach(api => {
  api.interceptors.response.use(
    (response) => response,
    handleApiError
  );
});

// 게시판 서비스
export const boardService = {
  // 게시판 목록 조회
  async getBoards(): Promise<Board[]> {
    const response: AxiosResponse<Board[]> = await boardApi.get('');
    return response.data;
  },

  // 게시판 상세 조회
  async getBoard(id: number): Promise<Board> {
    const response: AxiosResponse<Board> = await boardApi.get(`/${id}`);
    return response.data;
  },

  // 게시판 생성 (관리자용)
  async createBoard(request: Omit<Board, 'id' | 'postCount' | 'lastPostDate' | 'createdAt' | 'updatedAt'>): Promise<Board> {
    const response: AxiosResponse<Board> = await boardApi.post('', request);
    return response.data;
  },

  // 게시판 수정 (관리자용)
  async updateBoard(id: number, request: Partial<Board>): Promise<Board> {
    const response: AxiosResponse<Board> = await boardApi.put(`/${id}`, request);
    return response.data;
  },

  // 게시판 삭제 (관리자용)
  async deleteBoard(id: number): Promise<void> {
    await boardApi.delete(`/${id}`);
  },

  // 게시판 통계
  async getBoardStatistics(): Promise<BoardStatistics> {
    const response: AxiosResponse<BoardStatistics> = await boardApi.get('/statistics');
    return response.data;
  }
};

// 게시글 서비스
export const postService = {
  // 게시글 목록 조회
  async getPosts(params: PostSearchParams = {}): Promise<PostListResponse> {
    const response: AxiosResponse<PostListResponse> = await postApi.get('', { params });
    return response.data;
  },

  // 게시글 상세 조회
  async getPost(id: number): Promise<Post> {
    const response: AxiosResponse<Post> = await postApi.get(`/${id}`);
    return response.data;
  },

  // 게시글 생성
  async createPost(request: PostCreateRequest): Promise<Post> {
    const response: AxiosResponse<Post> = await postApi.post('', request);
    return response.data;
  },

  // 게시글 수정
  async updatePost(id: number, request: PostUpdateRequest): Promise<Post> {
    const response: AxiosResponse<Post> = await postApi.put(`/${id}`, request);
    return response.data;
  },

  // 게시글 삭제
  async deletePost(id: number): Promise<void> {
    await postApi.delete(`/${id}`);
  },

  // 내가 작성한 게시글 조회
  async getMyPosts(params: PostSearchParams = {}): Promise<PostListResponse> {
    const response: AxiosResponse<PostListResponse> = await postApi.get('/my', { params });
    return response.data;
  },

  // 게시글 조회수 증가
  async incrementViewCount(id: number): Promise<void> {
    await postApi.post(`/${id}/view`);
  },

  // 게시글 좋아요
  async likePost(id: number): Promise<{ liked: boolean; likeCount: number }> {
    const response = await postApi.post(`/${id}/like`);
    return response.data;
  },

  // 게시글 좋아요 취소
  async unlikePost(id: number): Promise<{ liked: boolean; likeCount: number }> {
    const response = await postApi.delete(`/${id}/like`);
    return response.data;
  },

  // 게시글 좋아요 상태 확인
  async checkPostLike(id: number): Promise<{ liked: boolean }> {
    const response = await postApi.get(`/${id}/like/status`);
    return response.data;
  },

  // 인기 게시글 조회
  async getPopularPosts(limit: number = 10): Promise<PopularPost[]> {
    const response: AxiosResponse<PopularPost[]> = await postApi.get('/popular', { 
      params: { limit } 
    });
    return response.data;
  },

  // 최신 게시글 조회
  async getLatestPosts(limit: number = 10): Promise<Post[]> {
    const response: AxiosResponse<Post[]> = await postApi.get('/latest', { 
      params: { limit } 
    });
    return response.data;
  },

  // 추천 게시글 조회
  async getRecommendedPosts(limit: number = 10): Promise<Post[]> {
    const response: AxiosResponse<Post[]> = await postApi.get('/recommended', { 
      params: { limit } 
    });
    return response.data;
  }
};

// 댓글 서비스
export const commentService = {
  // 특정 게시글의 댓글 목록 조회
  async getComments(postId: number, params: { page?: number; size?: number } = {}): Promise<{
    content: Comment[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  }> {
    const response = await commentApi.get(`/post/${postId}`, { params });
    return response.data;
  },

  // 댓글 상세 조회
  async getComment(id: number): Promise<Comment> {
    const response: AxiosResponse<Comment> = await commentApi.get(`/${id}`);
    return response.data;
  },

  // 댓글 생성
  async createComment(request: CommentCreateRequest): Promise<Comment> {
    const response: AxiosResponse<Comment> = await commentApi.post('', request);
    return response.data;
  },

  // 댓글 수정
  async updateComment(id: number, request: CommentUpdateRequest): Promise<Comment> {
    const response: AxiosResponse<Comment> = await commentApi.put(`/${id}`, request);
    return response.data;
  },

  // 댓글 삭제
  async deleteComment(id: number): Promise<void> {
    await commentApi.delete(`/${id}`);
  },

  // 내가 작성한 댓글 조회
  async getMyComments(params: { page?: number; size?: number } = {}): Promise<{
    content: Comment[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  }> {
    const response = await commentApi.get('/my', { params });
    return response.data;
  },

  // 댓글 좋아요
  async likeComment(id: number): Promise<{ liked: boolean; likeCount: number }> {
    const response = await commentApi.post(`/${id}/like`);
    return response.data;
  },

  // 댓글 좋아요 취소
  async unlikeComment(id: number): Promise<{ liked: boolean; likeCount: number }> {
    const response = await commentApi.delete(`/${id}/like`);
    return response.data;
  },

  // 댓글 좋아요 상태 확인
  async checkCommentLike(id: number): Promise<{ liked: boolean }> {
    const response = await commentApi.get(`/${id}/like/status`);
    return response.data;
  }
};

// 파일 서비스
export const boardFileService = {
  // 파일 업로드
  async uploadFile(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response: AxiosResponse<FileUploadResponse> = await fileApi.post('/upload', formData);
    return response.data;
  },

  // 다중 파일 업로드
  async uploadFiles(files: File[]): Promise<FileUploadResponse[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response: AxiosResponse<FileUploadResponse[]> = await fileApi.post('/upload/multiple', formData);
    return response.data;
  },

  // 파일 다운로드 URL 생성
  getFileDownloadUrl(fileName: string): string {
    return `/api/files/download/${fileName}`;
  },

  // 파일 정보 조회
  async getFileInfo(id: number): Promise<FileUploadResponse> {
    const response: AxiosResponse<FileUploadResponse> = await fileApi.get(`/${id}`);
    return response.data;
  },

  // 파일 삭제
  async deleteFile(id: number): Promise<void> {
    await fileApi.delete(`/${id}`);
  }
};

// 사용자 활동 서비스
export const userActivityService = {
  // 사용자 게시판 활동 통계
  async getUserBoardActivity(): Promise<UserBoardActivity> {
    const response: AxiosResponse<UserBoardActivity> = await boardApi.get('/user/activity');
    return response.data;
  }
};