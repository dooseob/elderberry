/**
 * 게시판 상태 관리 스토어 (Zustand)
 */
import { create } from 'zustand';
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
  PopularPost
} from '../types/board';
import { boardService, postService, commentService } from '../services/boardApi';

interface BoardState {
  // 게시판 관련 상태
  boards: Board[];
  currentBoard: Board | null;
  boardsLoading: boolean;
  boardsError: string | null;

  // 게시글 관련 상태
  posts: Post[];
  currentPost: Post | null;
  postsLoading: boolean;
  postsError: string | null;
  postsTotalPages: number;
  postsCurrentPage: number;
  postsTotalElements: number;

  // 댓글 관련 상태
  comments: Comment[];
  commentsLoading: boolean;
  commentsError: string | null;
  commentsTotalPages: number;
  commentsCurrentPage: number;

  // 통계 관련 상태
  statistics: BoardStatistics | null;
  popularPosts: PopularPost[];
  statisticsLoading: boolean;
  statisticsError: string | null;

  // 검색 필터 상태
  searchParams: PostSearchParams;

  // 좋아요 상태
  likedPosts: Set<number>;
  likedComments: Set<number>;
}

interface BoardActions {
  // 게시판 액션
  loadBoards: () => Promise<void>;
  loadBoard: (id: number) => Promise<void>;
  
  // 게시글 액션
  loadPosts: (params?: PostSearchParams) => Promise<void>;
  loadPost: (id: number) => Promise<void>;
  createPost: (request: PostCreateRequest) => Promise<Post>;
  updatePost: (id: number, request: PostUpdateRequest) => Promise<Post>;
  deletePost: (id: number) => Promise<void>;
  loadMyPosts: (params?: PostSearchParams) => Promise<void>;
  incrementPostView: (id: number) => Promise<void>;
  
  // 댓글 액션
  loadComments: (postId: number, page?: number, size?: number) => Promise<void>;
  createComment: (request: CommentCreateRequest) => Promise<Comment>;
  updateComment: (id: number, request: CommentUpdateRequest) => Promise<Comment>;
  deleteComment: (id: number) => Promise<void>;
  
  // 좋아요 액션
  togglePostLike: (id: number) => Promise<void>;
  toggleCommentLike: (id: number) => Promise<void>;
  
  // 통계 액션
  loadStatistics: () => Promise<void>;
  loadPopularPosts: (limit?: number) => Promise<void>;
  
  // 검색 및 필터 액션
  setSearchParams: (params: Partial<PostSearchParams>) => void;
  resetSearchParams: () => void;
  
  // 에러 처리 액션
  clearBoardsError: () => void;
  clearPostsError: () => void;
  clearCommentsError: () => void;
  clearStatisticsError: () => void;
  
  // 상태 초기화 액션
  reset: () => void;
}

type BoardStore = BoardState & BoardActions;

const initialSearchParams: PostSearchParams = {
  page: 0,
  size: 20,
  sortBy: 'createdAt',
  sortDirection: 'desc'
};

const initialState: BoardState = {
  boards: [],
  currentBoard: null,
  boardsLoading: false,
  boardsError: null,

  posts: [],
  currentPost: null,
  postsLoading: false,
  postsError: null,
  postsTotalPages: 0,
  postsCurrentPage: 0,
  postsTotalElements: 0,

  comments: [],
  commentsLoading: false,
  commentsError: null,
  commentsTotalPages: 0,
  commentsCurrentPage: 0,

  statistics: null,
  popularPosts: [],
  statisticsLoading: false,
  statisticsError: null,

  searchParams: initialSearchParams,
  likedPosts: new Set(),
  likedComments: new Set()
};

export const useBoardStore = create<BoardStore>()((set, get) => ({
  ...initialState,

  // 게시판 목록 로드
  loadBoards: async () => {
    try {
      set({ boardsLoading: true, boardsError: null });

      const boards = await boardService.getBoards();

      set({
        boards,
        boardsLoading: false
      });

    } catch (error: any) {
      set({
        boardsLoading: false,
        boardsError: error.message || '게시판 목록을 불러오는데 실패했습니다.'
      });
      throw error;
    }
  },

  // 게시판 상세 로드
  loadBoard: async (id: number) => {
    try {
      set({ boardsLoading: true, boardsError: null });

      const board = await boardService.getBoard(id);

      set({
        currentBoard: board,
        boardsLoading: false
      });

    } catch (error: any) {
      set({
        boardsLoading: false,
        boardsError: error.message || '게시판 정보를 불러오는데 실패했습니다.'
      });
      throw error;
    }
  },

  // 게시글 목록 로드
  loadPosts: async (params?: PostSearchParams) => {
    try {
      set({ postsLoading: true, postsError: null });

      const searchParams = { ...get().searchParams, ...params };
      const response: PostListResponse = await postService.getPosts(searchParams);

      set({
        posts: response.content,
        postsTotalPages: response.totalPages,
        postsCurrentPage: response.page,
        postsTotalElements: response.totalElements,
        searchParams,
        postsLoading: false
      });

    } catch (error: any) {
      set({
        postsLoading: false,
        postsError: error.message || '게시글 목록을 불러오는데 실패했습니다.'
      });
      throw error;
    }
  },

  // 게시글 상세 로드
  loadPost: async (id: number) => {
    try {
      set({ postsLoading: true, postsError: null });

      const post = await postService.getPost(id);
      
      // 조회수 증가
      await postService.incrementViewCount(id);

      // 좋아요 상태 확인
      try {
        const likeStatus = await postService.checkPostLike(id);
        if (likeStatus.liked) {
          set(state => ({
            likedPosts: new Set([...state.likedPosts, id])
          }));
        }
      } catch (error) {
        console.warn('좋아요 상태 확인 실패:', error);
      }

      set({
        currentPost: { ...post, viewCount: post.viewCount + 1 },
        postsLoading: false
      });

    } catch (error: any) {
      set({
        postsLoading: false,
        postsError: error.message || '게시글을 불러오는데 실패했습니다.'
      });
      throw error;
    }
  },

  // 게시글 생성
  createPost: async (request: PostCreateRequest) => {
    try {
      set({ postsLoading: true, postsError: null });

      const post = await postService.createPost(request);

      // 기존 목록에 새 게시글 추가
      set(state => ({
        posts: [post, ...state.posts],
        postsTotalElements: state.postsTotalElements + 1,
        postsLoading: false
      }));

      return post;

    } catch (error: any) {
      set({
        postsLoading: false,
        postsError: error.message || '게시글 작성에 실패했습니다.'
      });
      throw error;
    }
  },

  // 게시글 수정
  updatePost: async (id: number, request: PostUpdateRequest) => {
    try {
      set({ postsLoading: true, postsError: null });

      const updatedPost = await postService.updatePost(id, request);

      // 목록에서 해당 게시글 업데이트
      set(state => ({
        posts: state.posts.map(post => post.id === id ? updatedPost : post),
        currentPost: state.currentPost?.id === id ? updatedPost : state.currentPost,
        postsLoading: false
      }));

      return updatedPost;

    } catch (error: any) {
      set({
        postsLoading: false,
        postsError: error.message || '게시글 수정에 실패했습니다.'
      });
      throw error;
    }
  },

  // 게시글 삭제
  deletePost: async (id: number) => {
    try {
      set({ postsLoading: true, postsError: null });

      await postService.deletePost(id);

      // 목록에서 해당 게시글 제거
      set(state => ({
        posts: state.posts.filter(post => post.id !== id),
        currentPost: state.currentPost?.id === id ? null : state.currentPost,
        postsTotalElements: state.postsTotalElements - 1,
        postsLoading: false
      }));

    } catch (error: any) {
      set({
        postsLoading: false,
        postsError: error.message || '게시글 삭제에 실패했습니다.'
      });
      throw error;
    }
  },

  // 내 게시글 로드
  loadMyPosts: async (params?: PostSearchParams) => {
    try {
      set({ postsLoading: true, postsError: null });

      const searchParams = { ...get().searchParams, ...params };
      const response: PostListResponse = await postService.getMyPosts(searchParams);

      set({
        posts: response.content,
        postsTotalPages: response.totalPages,
        postsCurrentPage: response.page,
        postsTotalElements: response.totalElements,
        searchParams,
        postsLoading: false
      });

    } catch (error: any) {
      set({
        postsLoading: false,
        postsError: error.message || '내 게시글을 불러오는데 실패했습니다.'
      });
      throw error;
    }
  },

  // 조회수 증가
  incrementPostView: async (id: number) => {
    try {
      await postService.incrementViewCount(id);
      
      // 목록에서 해당 게시글의 조회수 증가
      set(state => ({
        posts: state.posts.map(post => 
          post.id === id ? { ...post, viewCount: post.viewCount + 1 } : post
        ),
        currentPost: state.currentPost?.id === id 
          ? { ...state.currentPost, viewCount: state.currentPost.viewCount + 1 }
          : state.currentPost
      }));

    } catch (error) {
      // 조회수 증가 실패는 무시 (중요하지 않은 액션)
      console.warn('조회수 증가 실패:', error);
    }
  },

  // 댓글 목록 로드
  loadComments: async (postId: number, page = 0, size = 20) => {
    try {
      set({ commentsLoading: true, commentsError: null });

      const response = await commentService.getComments(postId, { page, size });

      set({
        comments: response.content,
        commentsTotalPages: response.totalPages,
        commentsCurrentPage: response.page,
        commentsLoading: false
      });

    } catch (error: any) {
      set({
        commentsLoading: false,
        commentsError: error.message || '댓글을 불러오는데 실패했습니다.'
      });
      throw error;
    }
  },

  // 댓글 생성
  createComment: async (request: CommentCreateRequest) => {
    try {
      set({ commentsLoading: true, commentsError: null });

      const comment = await commentService.createComment(request);

      // 댓글 목록에 추가
      set(state => ({
        comments: [...state.comments, comment],
        commentsLoading: false,
        // 게시글의 댓글 수 증가
        currentPost: state.currentPost?.id === request.postId 
          ? { ...state.currentPost, commentCount: state.currentPost.commentCount + 1 }
          : state.currentPost,
        posts: state.posts.map(post => 
          post.id === request.postId 
            ? { ...post, commentCount: post.commentCount + 1 }
            : post
        )
      }));

      return comment;

    } catch (error: any) {
      set({
        commentsLoading: false,
        commentsError: error.message || '댓글 작성에 실패했습니다.'
      });
      throw error;
    }
  },

  // 댓글 수정
  updateComment: async (id: number, request: CommentUpdateRequest) => {
    try {
      set({ commentsLoading: true, commentsError: null });

      const updatedComment = await commentService.updateComment(id, request);

      // 댓글 목록에서 업데이트
      set(state => ({
        comments: state.comments.map(comment => 
          comment.id === id ? updatedComment : comment
        ),
        commentsLoading: false
      }));

      return updatedComment;

    } catch (error: any) {
      set({
        commentsLoading: false,
        commentsError: error.message || '댓글 수정에 실패했습니다.'
      });
      throw error;
    }
  },

  // 댓글 삭제
  deleteComment: async (id: number) => {
    try {
      set({ commentsLoading: true, commentsError: null });

      await commentService.deleteComment(id);

      // 댓글 목록에서 제거
      set(state => {
        const deletedComment = state.comments.find(c => c.id === id);
        return {
          comments: state.comments.filter(comment => comment.id !== id),
          commentsLoading: false,
          // 게시글의 댓글 수 감소
          currentPost: state.currentPost && deletedComment?.postId === state.currentPost.id
            ? { ...state.currentPost, commentCount: state.currentPost.commentCount - 1 }
            : state.currentPost,
          posts: state.posts.map(post => 
            deletedComment?.postId === post.id
              ? { ...post, commentCount: post.commentCount - 1 }
              : post
          )
        };
      });

    } catch (error: any) {
      set({
        commentsLoading: false,
        commentsError: error.message || '댓글 삭제에 실패했습니다.'
      });
      throw error;
    }
  },

  // 게시글 좋아요 토글
  togglePostLike: async (id: number) => {
    try {
      const { likedPosts } = get();
      const isLiked = likedPosts.has(id);

      const result = isLiked 
        ? await postService.unlikePost(id)
        : await postService.likePost(id);

      // 좋아요 상태 업데이트
      const newLikedPosts = new Set(likedPosts);
      if (result.liked) {
        newLikedPosts.add(id);
      } else {
        newLikedPosts.delete(id);
      }

      set(state => ({
        likedPosts: newLikedPosts,
        posts: state.posts.map(post => 
          post.id === id ? { ...post, likeCount: result.likeCount } : post
        ),
        currentPost: state.currentPost?.id === id 
          ? { ...state.currentPost, likeCount: result.likeCount }
          : state.currentPost
      }));

    } catch (error: any) {
      console.error('게시글 좋아요 토글 실패:', error);
      throw error;
    }
  },

  // 댓글 좋아요 토글
  toggleCommentLike: async (id: number) => {
    try {
      const { likedComments } = get();
      const isLiked = likedComments.has(id);

      const result = isLiked 
        ? await commentService.unlikeComment(id)
        : await commentService.likeComment(id);

      // 좋아요 상태 업데이트
      const newLikedComments = new Set(likedComments);
      if (result.liked) {
        newLikedComments.add(id);
      } else {
        newLikedComments.delete(id);
      }

      set(state => ({
        likedComments: newLikedComments,
        comments: state.comments.map(comment => 
          comment.id === id ? { ...comment, likeCount: result.likeCount } : comment
        )
      }));

    } catch (error: any) {
      console.error('댓글 좋아요 토글 실패:', error);
      throw error;
    }
  },

  // 통계 로드
  loadStatistics: async () => {
    try {
      set({ statisticsLoading: true, statisticsError: null });

      const statistics = await boardService.getBoardStatistics();

      set({
        statistics,
        statisticsLoading: false
      });

    } catch (error: any) {
      set({
        statisticsLoading: false,
        statisticsError: error.message || '통계를 불러오는데 실패했습니다.'
      });
      throw error;
    }
  },

  // 인기 게시글 로드
  loadPopularPosts: async (limit = 10) => {
    try {
      set({ statisticsLoading: true, statisticsError: null });

      const popularPosts = await postService.getPopularPosts(limit);

      set({
        popularPosts,
        statisticsLoading: false
      });

    } catch (error: any) {
      set({
        statisticsLoading: false,
        statisticsError: error.message || '인기 게시글을 불러오는데 실패했습니다.'
      });
      throw error;
    }
  },

  // 검색 파라미터 설정
  setSearchParams: (params: Partial<PostSearchParams>) => {
    set(state => ({
      searchParams: { ...state.searchParams, ...params }
    }));
  },

  // 검색 파라미터 초기화
  resetSearchParams: () => {
    set({ searchParams: initialSearchParams });
  },

  // 에러 클리어
  clearBoardsError: () => {
    set({ boardsError: null });
  },

  clearPostsError: () => {
    set({ postsError: null });
  },

  clearCommentsError: () => {
    set({ commentsError: null });
  },

  clearStatisticsError: () => {
    set({ statisticsError: null });
  },

  // 상태 초기화
  reset: () => {
    set(initialState);
  }
}));