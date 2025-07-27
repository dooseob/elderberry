/**
 * 게시판 목록 페이지
 */
import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Clock,
  Eye,
  Filter,
  MessageSquare,
  Pin,
  Plus,
  Search,
  Star,
  Tag,
  ThumbsUp,
  TrendingUp,
  Users
} from '../../components/icons/LucideIcons';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBoardStore } from '../../stores/boardStore';
import { useAuthStore } from '../../stores/authStore';
import { Board, Post, BoardType, PostSearchParams } from '../../types/board';
import { MemberRole } from '../../types/auth';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

// 게시판 타입 한글 매핑
const boardTypeLabels = {
  [BoardType.GENERAL]: '일반',
  [BoardType.NOTICE]: '공지사항',
  [BoardType.FAQ]: 'FAQ',
  [BoardType.QNA]: 'Q&A',
  [BoardType.REVIEW]: '후기',
  [BoardType.FREE]: '자유',
  [BoardType.JOB_DISCUSSION]: '구인구직 토론',
  [BoardType.TIPS]: '팁과 노하우',
  [BoardType.NEWS]: '업계 소식'
};

// 날짜 포맷팅 함수
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return '방금 전';
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// 게시판 카드 컴포넌트
interface BoardCardProps {
  board: Board;
}

const BoardCard: React.FC<BoardCardProps> = ({ board }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/boards/${board.id}`}>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{board.name}</h3>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-elderberry-100 text-elderberry-700">
                    {boardTypeLabels[board.type]}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {board.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  {board.postCount}개 글
                </span>
                {board.lastPostDate && (
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDate(board.lastPostDate)}
                  </span>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

// 게시글 카드 컴포넌트
interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/boards/${post.boardId}/posts/${post.id}`}>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {post.isPinned && (
                    <Pin className="w-4 h-4 text-elderberry-600" />
                  )}
                  {post.isNotice && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      공지
                    </span>
                  )}
                  <span className="text-xs text-gray-500">{post.boardName}</span>
                </div>
                
                <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-1">
                  {post.title}
                </h3>
                
                {post.summary && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {post.summary}
                  </p>
                )}
              </div>
            </div>

            {/* 태그 */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {post.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
                {post.tags.length > 3 && (
                  <span className="text-xs text-gray-500">+{post.tags.length - 3}</span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-3">
                <span>{post.isAnonymous ? '익명' : post.authorName}</span>
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(post.createdAt)}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="flex items-center">
                  <Eye className="w-3 h-3 mr-1" />
                  {post.viewCount}
                </span>
                <span className="flex items-center">
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  {post.likeCount}
                </span>
                <span className="flex items-center">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  {post.commentCount}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default function BoardListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const {
    boards,
    posts,
    popularPosts,
    boardsLoading,
    postsLoading,
    boardsError,
    postsError,
    postsTotalPages,
    postsCurrentPage,
    postsTotalElements,
    searchParams: storeSearchParams,
    loadBoards,
    loadPosts,
    loadPopularPosts,
    setSearchParams: setStoreSearchParams,
    clearBoardsError,
    clearPostsError
  } = useBoardStore();

  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('keyword') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBoardType, setSelectedBoardType] = useState<BoardType | ''>('');
  const [activeTab, setActiveTab] = useState<'boards' | 'posts' | 'popular'>('boards');

  const canCreatePost = user && [MemberRole.CAREGIVER, MemberRole.EMPLOYER, MemberRole.COORDINATOR, MemberRole.ADMIN].includes(user.role);

  // 초기 데이터 로드
  useEffect(() => {
    loadBoards();
    loadPopularPosts();
    
    const params: PostSearchParams = {};
    if (searchParams.get('keyword')) params.keyword = searchParams.get('keyword')!;
    if (searchParams.get('boardType')) params.boardType = searchParams.get('boardType') as BoardType;
    if (searchParams.get('page')) params.page = parseInt(searchParams.get('page')!) || 0;

    loadPosts(params);
  }, [searchParams]);

  // 검색 실행
  const handleSearch = () => {
    const params: PostSearchParams = {
      page: 0,
      keyword: searchKeyword || undefined,
      boardType: selectedBoardType || undefined
    };

    setStoreSearchParams(params);
    loadPosts(params);

    // URL 업데이트
    const newSearchParams = new URLSearchParams();
    if (searchKeyword) newSearchParams.set('keyword', searchKeyword);
    if (selectedBoardType) newSearchParams.set('boardType', selectedBoardType);
    setSearchParams(newSearchParams);
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    const params = { ...storeSearchParams, page };
    setStoreSearchParams(params);
    loadPosts(params);
    
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', page.toString());
    setSearchParams(newSearchParams);
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setSearchKeyword('');
    setSelectedBoardType('');
    setStoreSearchParams({ page: 0 });
    loadPosts({ page: 0 });
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">커뮤니티</h1>
          <p className="text-gray-600 mt-1">
            다양한 정보를 공유하고 소통해보세요
          </p>
        </div>
        {canCreatePost && (
          <div className="mt-4 sm:mt-0">
            <Link to="/boards/create-post">
              <Button variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                글 작성하기
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* 탭 메뉴 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'boards', label: '게시판', icon: MessageSquare },
            { key: 'posts', label: '최신 글', icon: Clock },
            { key: 'popular', label: '인기 글', icon: TrendingUp }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`
                flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === key
                  ? 'border-elderberry-500 text-elderberry-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* 검색 및 필터 (게시글 탭에서만 표시) */}
      {(activeTab === 'posts' || activeTab === 'popular') && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* 검색바 */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="제목, 내용, 작성자 검색..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-elderberry-500 focus:border-elderberry-500"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  필터
                </Button>
                <Button variant="primary" onClick={handleSearch}>
                  검색
                </Button>
              </div>

              {/* 필터 옵션 */}
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200 pt-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 게시판 타입 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        게시판 타입
                      </label>
                      <select
                        value={selectedBoardType}
                        onChange={(e) => setSelectedBoardType(e.target.value as BoardType)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-elderberry-500 focus:border-elderberry-500"
                      >
                        <option value="">전체 게시판</option>
                        {Object.entries(boardTypeLabels).map(([type, label]) => (
                          <option key={type} value={type}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-4">
                    <Button variant="outline" onClick={handleResetFilters}>
                      초기화
                    </Button>
                    <Button variant="primary" onClick={handleSearch}>
                      필터 적용
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 에러 메시지 */}
      {(boardsError || postsError) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{boardsError || postsError}</span>
          <button
            onClick={() => {
              clearBoardsError();
              clearPostsError();
            }}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* 컨텐츠 */}
      {activeTab === 'boards' && (
        <div>
          {boardsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <Card>
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : boards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boards.map((board) => (
                <BoardCard key={board.id} board={board} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">게시판이 없습니다</h3>
              <p className="text-gray-600">아직 생성된 게시판이 없습니다.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'posts' && (
        <div className="space-y-4">
          {/* 검색 결과 정보 */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              총 <span className="font-semibold text-elderberry-600">{postsTotalElements}</span>개의 게시글이 있습니다
              {searchKeyword && (
                <span> ('{searchKeyword}' 검색 결과)</span>
              )}
            </p>
          </div>

          {postsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <Card>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">게시글이 없습니다</h3>
              <p className="text-gray-600 mb-4">
                검색 조건에 맞는 게시글이 없습니다
              </p>
              <Button variant="outline" onClick={handleResetFilters}>
                검색 조건 초기화
              </Button>
            </div>
          )}

          {/* 페이지네이션 */}
          {postsTotalPages > 1 && (
            <div className="flex justify-center">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  disabled={postsCurrentPage === 0}
                  onClick={() => handlePageChange(postsCurrentPage - 1)}
                >
                  이전
                </Button>
                
                {[...Array(Math.min(5, postsTotalPages))].map((_, index) => {
                  const pageIndex = Math.max(0, Math.min(postsCurrentPage - 2, postsTotalPages - 5)) + index;
                  if (pageIndex >= postsTotalPages) return null;
                  
                  return (
                    <Button
                      key={pageIndex}
                      variant={pageIndex === postsCurrentPage ? 'primary' : 'outline'}
                      onClick={() => handlePageChange(pageIndex)}
                    >
                      {pageIndex + 1}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  disabled={postsCurrentPage >= postsTotalPages - 1}
                  onClick={() => handlePageChange(postsCurrentPage + 1)}
                >
                  다음
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'popular' && (
        <div className="space-y-4">
          {popularPosts.length > 0 ? (
            <div className="space-y-4">
              {popularPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/boards/posts/${post.id}`}>
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-elderberry-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-elderberry-600">
                                {index + 1}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {post.title}
                              </h3>
                              {post.trend === 'up' && (
                                <TrendingUp className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{post.boardName}</span>
                              <span>{post.authorName}</span>
                              <span className="flex items-center">
                                <Eye className="w-3 h-3 mr-1" />
                                {post.viewCount}
                              </span>
                              <span className="flex items-center">
                                <ThumbsUp className="w-3 h-3 mr-1" />
                                {post.likeCount}
                              </span>
                              <span className="flex items-center">
                                <MessageSquare className="w-3 h-3 mr-1" />
                                {post.commentCount}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">인기 게시글이 없습니다</h3>
              <p className="text-gray-600">아직 인기 게시글이 없습니다.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}