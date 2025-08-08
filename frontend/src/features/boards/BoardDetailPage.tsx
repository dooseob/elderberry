/**
 * BoardDetailPage - 게시판 상세 페이지
 * 특정 게시판의 게시글 목록과 검색 기능 제공
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft,
  Search,
  Plus,
  Filter,
  SortDesc,
  MessageSquare,
  Eye,
  Clock,
  User,
  Pin
} from 'lucide-react';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { Input } from '../../shared/ui/Input';
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner';
import { ErrorMessage } from '../../shared/ui/ErrorMessage';
import { Pagination } from '../../shared/ui/Pagination';
import { boardApi } from '../../entities/board';
import type { Board, Post, Page } from '../../entities/board';
import { BOARD_METADATA, POST_SORT_OPTIONS, POST_SEARCH_TYPES } from '../../entities/board';
import { useAuthStore } from '../../stores/authStore';

export const BoardDetailPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  
  const [board, setBoard] = useState<Board | null>(null);
  const [posts, setPosts] = useState<Page<Post> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // URL 파라미터에서 검색/페이징 상태 읽기
  const currentPage = parseInt(searchParams.get('page') || '0');
  const pageSize = parseInt(searchParams.get('size') || '20');
  const sortBy = searchParams.get('sort') || 'createdDate';
  const sortDirection = (searchParams.get('direction') || 'DESC') as 'ASC' | 'DESC';
  const keyword = searchParams.get('keyword') || '';
  const searchType = searchParams.get('searchType') || 'all';

  // URL 파라미터 검증
  const boardIdNumber = boardId ? parseInt(boardId, 10) : null;
  
  if (!boardIdNumber || isNaN(boardIdNumber)) {
    navigate('/boards');
    return null;
  }

  // 게시판 정보 로드
  const loadBoard = useCallback(async () => {
    try {
      const boardData = await boardApi.getBoardById(boardIdNumber);
      setBoard(boardData);
    } catch (err) {
      console.error('게시판 조회 실패:', err);
      setError('게시판 정보를 불러오는데 실패했습니다.');
    }
  }, [boardIdNumber]);

  // 게시글 목록 로드
  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let postsData: Page<Post>;
      
      if (keyword.trim()) {
        // 검색 모드
        postsData = await boardApi.searchPosts(boardIdNumber, {
          keyword: keyword.trim(),
          searchType: searchType as any,
          page: currentPage,
          size: pageSize
        });
      } else {
        // 일반 목록 모드
        postsData = await boardApi.getPostsByBoard(
          boardIdNumber,
          currentPage,
          pageSize,
          sortBy,
          sortDirection
        );
      }
      
      setPosts(postsData);
    } catch (err) {
      console.error('게시글 목록 조회 실패:', err);
      setError('게시글 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [boardIdNumber, currentPage, pageSize, sortBy, sortDirection, keyword, searchType]);

  // 초기 로드
  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  useEffect(() => {
    if (board) {
      loadPosts();
    }
  }, [board, loadPosts]);

  // URL 파라미터 업데이트 함수들
  const updateSearchParams = (updates: Record<string, string | number>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) {
        newParams.delete(key);
      } else {
        newParams.set(key, value.toString());
      }
    });
    
    // 페이지 변경이 아닌 경우 페이지를 0으로 리셋
    if (!('page' in updates)) {
      newParams.set('page', '0');
    }
    
    setSearchParams(newParams);
  };

  // 검색 핸들러
  const handleSearch = (searchKeyword: string, type: string) => {
    updateSearchParams({
      keyword: searchKeyword,
      searchType: type,
      page: 0
    });
  };

  // 정렬 변경 핸들러
  const handleSortChange = (sort: string, direction: 'ASC' | 'DESC') => {
    updateSearchParams({
      sort,
      direction,
      page: 0
    });
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    updateSearchParams({ page });
  };

  // 게시글 카드 렌더링
  const renderPostItem = (post: Post) => (
    <div
      key={post.id}
      className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
      onClick={() => navigate(`/boards/${boardIdNumber}/posts/${post.id}`)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {post.pinned && (
                <Pin className="w-4 h-4 text-orange-500" />
              )}
              <h3 className="text-lg font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {post.title}
              </h3>
              {post.status !== 'ACTIVE' && (
                <Badge variant="secondary" className="text-xs">
                  {post.status === 'INACTIVE' ? '비활성' : '삭제됨'}
                </Badge>
              )}
            </div>
            
            {/* 게시글 내용 미리보기 */}
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
            </p>
            
            {/* 태그 */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {post.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
                {post.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{post.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* 게시글 메타 정보 */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{post.author.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{new Date(post.createdDate).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{post.viewCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>{post.commentCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 권한 체크
  const canWrite = isAuthenticated && board && (
    !board.adminOnly || 
    (user && (user.role === 'ADMIN' || user.role === 'FACILITY'))
  );

  // 로딩 상태
  if (loading && !posts) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 에러 상태
  if (error && !board) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage 
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!board) {
    return null;
  }

  const metadata = BOARD_METADATA[board.type];

  return (
    <>
      
        
        
      

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* 게시판 헤더 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/boards')}
                  className="p-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                    {metadata.icon}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {board.name}
                    </h1>
                    <p className="text-gray-600">
                      {board.description || metadata.description}
                    </p>
                  </div>
                </div>
              </div>
              
              {canWrite && (
                <Button
                  variant="primary"
                  onClick={() => navigate(`/boards/${board.id}/posts/create`)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  글쓰기
                </Button>
              )}
            </div>
          </div>

          {/* 검색 및 필터 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* 검색 */}
              <div className="flex-1">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="검색어를 입력하세요..."
                      defaultValue={keyword}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement;
                          handleSearch(target.value, searchType);
                        }
                      }}
                    />
                  </div>
                  <select
                    value={searchType}
                    onChange={(e) => handleSearch(keyword, e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {POST_SEARCH_TYPES.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                      handleSearch(input.value, searchType);
                    }}
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* 정렬 */}
              <div className="flex items-center gap-2">
                <SortDesc className="w-4 h-4 text-gray-400" />
                <select
                  value={`${sortBy}:${sortDirection}`}
                  onChange={(e) => {
                    const [sort, direction] = e.target.value.split(':');
                    handleSortChange(sort, direction as 'ASC' | 'DESC');
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {POST_SORT_OPTIONS.map(option => (
                    <option key={`${option.value}:${option.direction}`} value={`${option.value}:${option.direction}`}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 게시글 목록 */}
          <div className="space-y-3 mb-6">
            {loading && (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            )}
            
            {error && (
              <ErrorMessage message={error} onRetry={loadPosts} />
            )}
            
            {posts && posts.content.length > 0 ? (
              posts.content.map(renderPostItem)
            ) : (
              !loading && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {keyword ? '검색 결과가 없습니다' : '첫 번째 게시글을 작성해보세요'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {keyword 
                      ? '다른 키워드로 검색해보시거나 검색 조건을 변경해보세요.'
                      : '아직 작성된 게시글이 없습니다.'
                    }
                  </p>
                  {canWrite && !keyword && (
                    <Button
                      variant="primary"
                      onClick={() => navigate(`/boards/${board.id}/posts/create`)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      첫 글쓰기
                    </Button>
                  )}
                </div>
              )
            )}
          </div>

          {/* 페이지네이션 */}
          {posts && posts.totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={posts.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default BoardDetailPage;