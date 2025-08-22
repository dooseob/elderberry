/**
 * Board API Client
 * FSD 아키텍처: 게시판 API 통신 계층
 */

import { apiClient } from '../../../shared/api';
import type {
  Board,
  Post, 
  Comment,
  Page,
  PostCreateRequest,
  PostUpdateRequest,
  CommentCreateRequest,
  CommentUpdateRequest,
  BoardCreateRequest,
  BoardUpdateRequest,
  PostSearchParams
} from '../model/types';

export class BoardApi {
  private readonly baseUrl = '/api/boards';

  /**
   * 모든 활성 게시판 조회
   */
  async getAllBoards(): Promise<Board[]> {
    try {
      const response = await apiClient.get<Board[]>(this.baseUrl);
      return response.data;
    } catch (error) {
      console.error('게시판 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 특정 게시판 조회
   */
  async getBoardById(id: number): Promise<Board> {
    try {
      const response = await apiClient.get<Board>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`게시판 조회 실패 (ID: ${id}):`, error);
      throw error;
    }
  }

  /**
   * 특정 게시판의 게시글 목록 조회
   */
  async getPostsByBoard(
    boardId: number,
    page: number = 0,
    size: number = 20,
    sort: string = 'createdDate',
    direction: 'ASC' | 'DESC' = 'DESC'
  ): Promise<Page<Post>> {
    try {
      const response = await apiClient.get<Page<Post>>(`${this.baseUrl}/${boardId}/posts`, {
        params: { page, size, sort, direction }
      });
      return response.data;
    } catch (error) {
      console.error(`게시글 목록 조회 실패 (게시판 ID: ${boardId}):`, error);
      throw error;
    }
  }

  /**
   * 게시글 검색
   */
  async searchPosts(
    boardId: number,
    params: PostSearchParams
  ): Promise<Page<Post>> {
    try {
      const response = await apiClient.get<Page<Post>>(`${this.baseUrl}/${boardId}/posts/search`, {
        params: {
          keyword: params.keyword,
          searchType: params.searchType,
          page: params.page || 0,
          size: params.size || 20
        }
      });
      return response.data;
    } catch (error) {
      console.error(`게시글 검색 실패:`, error);
      throw error;
    }
  }

  /**
   * 새 게시글 작성
   */
  async createPost(boardId: number, request: PostCreateRequest): Promise<Post> {
    try {
      const response = await apiClient.post<Post>(`${this.baseUrl}/${boardId}/posts`, request);
      return response.data;
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      throw error;
    }
  }

  /**
   * 게시글 상세 조회
   */
  async getPostDetail(boardId: number, postId: number): Promise<Post> {
    try {
      const response = await apiClient.get<Post>(`${this.baseUrl}/${boardId}/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error(`게시글 상세 조회 실패 (ID: ${postId}):`, error);
      throw error;
    }
  }

  /**
   * 게시글 수정
   */
  async updatePost(
    boardId: number,
    postId: number,
    request: PostUpdateRequest
  ): Promise<Post> {
    try {
      const response = await apiClient.put<Post>(`${this.baseUrl}/${boardId}/posts/${postId}`, request);
      return response.data;
    } catch (error) {
      console.error(`게시글 수정 실패 (ID: ${postId}):`, error);
      throw error;
    }
  }

  /**
   * 게시글 삭제
   */
  async deletePost(boardId: number, postId: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${boardId}/posts/${postId}`);
    } catch (error) {
      console.error(`게시글 삭제 실패 (ID: ${postId}):`, error);
      throw error;
    }
  }

  /**
   * 댓글 목록 조회
   */
  async getComments(
    boardId: number,
    postId: number,
    page: number = 0,
    size: number = 50
  ): Promise<Page<Comment>> {
    try {
      const response = await apiClient.get<Page<Comment>>(
        `${this.baseUrl}/${boardId}/posts/${postId}/comments`,
        { params: { page, size } }
      );
      return response.data;
    } catch (error) {
      console.error(`댓글 목록 조회 실패 (게시글 ID: ${postId}):`, error);
      throw error;
    }
  }

  /**
   * 새 댓글 작성
   */
  async createComment(
    boardId: number,
    postId: number,
    request: CommentCreateRequest
  ): Promise<Comment> {
    try {
      const response = await apiClient.post<Comment>(
        `${this.baseUrl}/${boardId}/posts/${postId}/comments`,
        request
      );
      return response.data;
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      throw error;
    }
  }

  /**
   * 댓글 수정
   */
  async updateComment(
    boardId: number,
    postId: number,
    commentId: number,
    request: CommentUpdateRequest
  ): Promise<Comment> {
    try {
      const response = await apiClient.put<Comment>(
        `${this.baseUrl}/${boardId}/posts/${postId}/comments/${commentId}`,
        request
      );
      return response.data;
    } catch (error) {
      console.error(`댓글 수정 실패 (ID: ${commentId}):`, error);
      throw error;
    }
  }

  /**
   * 댓글 삭제
   */
  async deleteComment(
    boardId: number,
    postId: number,
    commentId: number
  ): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${boardId}/posts/${postId}/comments/${commentId}`);
    } catch (error) {
      console.error(`댓글 삭제 실패 (ID: ${commentId}):`, error);
      throw error;
    }
  }

  /**
   * 관리자용 - 새 게시판 생성
   */
  async createBoard(request: BoardCreateRequest): Promise<Board> {
    try {
      const response = await apiClient.post<Board>(this.baseUrl, request);
      return response.data;
    } catch (error) {
      console.error('게시판 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 관리자용 - 게시판 수정
   */
  async updateBoard(id: number, request: BoardUpdateRequest): Promise<Board> {
    try {
      const response = await apiClient.put<Board>(`${this.baseUrl}/${id}`, request);
      return response.data;
    } catch (error) {
      console.error(`게시판 수정 실패 (ID: ${id}):`, error);
      throw error;
    }
  }

  /**
   * 관리자용 - 게시판 비활성화
   */
  async deactivateBoard(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`게시판 비활성화 실패 (ID: ${id}):`, error);
      throw error;
    }
  }
}

export const boardApi = new BoardApi();