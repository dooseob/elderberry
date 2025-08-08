/**
 * BoardListPage - 게시판 목록 페이지
 * 카테고리별 게시판 목록 표시 및 접근 권한 관리
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  MessageSquare, 
  Users, 
  Briefcase, 
  Heart,
  TrendingUp,
  ChevronRight,
  Plus,
  Star,
  Eye,
  MessageCircle,
  Clock,
  Lock,
  Shield
} from 'lucide-react';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner';
import { ErrorMessage } from '../../shared/ui/ErrorMessage';
import { boardApi } from '../../entities/board';
import type { Board } from '../../entities/board';
import { BOARD_METADATA, BOARD_COLORS } from '../../entities/board';
import { useAuthStore } from '../../stores/authStore';

export const BoardListPage: React.FC = () => {
  const { boardId } = useParams<{ boardId?: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 게시판 목록 로드
  useEffect(() => {
    const loadBoards = async () => {
      try {
        setLoading(true);
        setError(null);
        const boardsData = await boardApi.getBoards();
        setBoards(boardsData);
      } catch (err) {
        console.error('게시판 목록 로드 실패:', err);
        setError('게시판 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadBoards();
  }, []);

  // 게시판 카드 렌더링
  const renderBoardCard = (board: Board) => {
    const metadata = BOARD_METADATA[board.type];
    const colors = BOARD_COLORS[board.type];
    
    // 관리자 전용 게시판 접근 권한 체크
    const canAccess = !board.adminOnly || (user && (user.role === 'ADMIN' || user.role === 'FACILITY'));
    
    if (!canAccess) return null;

    return (
      <div
        key={board.id}
        className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group ${
          !canAccess ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={() => navigate(`/boards/${board.id}`)}
      >
        <div className="p-6">
          {/* 게시판 헤더 */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${colors.bg} ${colors.text} rounded-lg flex items-center justify-center`}>
                {metadata.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-elderberry-600 transition-colors">
                  {board.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {board.description || metadata.description}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {board.adminOnly && (
                <Shield className="w-4 h-4 text-orange-500" />
              )}
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-elderberry-600 transition-colors" />
            </div>
          </div>

          {/* 게시판 통계 */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>{board.postCount || 0}개 게시글</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{board.totalViews || 0}회 조회</span>
            </div>
            {board.lastPostDate && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>최근 {new Date(board.lastPostDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* 최근 게시글 미리보기 (있는 경우) */}
          {board.recentPosts && board.recentPosts.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="space-y-2">
                {board.recentPosts.slice(0, 2).map(post => (
                  <div key={post.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 truncate flex-1">
                      {post.title}
                    </span>
                    <span className="text-gray-400 text-xs ml-2">
                      {new Date(post.createdDate).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 게시판 그룹 렌더링 헬퍼
  const renderBoardGroup = (title: string, icon: React.ReactNode, boardList: Board[], description?: string) => {
    if (!boardList || boardList.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          {icon}
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boardList.map(renderBoardCard)}
        </div>
      </div>
    );
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage 
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // 게시판을 카테고리별로 그룹화
  const groupedBoards = {
    community: boards.filter(board => 
      ['GENERAL', 'ANNOUNCEMENT', 'NOTICE'].includes(board.type)
    ),
    support: boards.filter(board => 
      ['FAQ', 'QNA'].includes(board.type)
    ),
    social: boards.filter(board => 
      ['COMMUNITY', 'REVIEW'].includes(board.type)
    ),
    business: boards.filter(board => 
      ['JOB'].includes(board.type)
    )
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            커뮤니티
          </h1>
          <p className="text-gray-600">
            다양한 주제의 게시판에서 소통하고 정보를 공유하세요.
          </p>
        </div>

        {/* 게시판 생성 버튼 (관리자용) */}
        {user && (user.role === 'ADMIN' || user.role === 'FACILITY') && (
          <div className="mb-8">
            <Button
              onClick={() => navigate('/admin/boards/create')}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              새 게시판 만들기
            </Button>
          </div>
        )}

        <div className="space-y-8">
          {/* 커뮤니티 게시판 */}
          {renderBoardGroup(
            "일반 커뮤니티", 
            <MessageSquare className="w-4 h-4 text-blue-600" />,
            groupedBoards.community,
            "공지사항과 일반적인 이야기를 나누세요"
          )}

          {/* 지원 게시판 */}
          {renderBoardGroup(
            "지원 & 문의", 
            <Users className="w-4 h-4 text-green-600" />,
            groupedBoards.support,
            "궁금한 점을 해결하고 도움을 받으세요"
          )}

          {/* 소셜 게시판 */}
          {renderBoardGroup(
            "소셜 & 리뷰", 
            <Heart className="w-4 h-4 text-red-600" />,
            groupedBoards.social,
            "경험을 공유하고 리뷰를 작성하세요"
          )}

          {/* 구인구직 게시판 */}
          {renderBoardGroup(
            "구인구직", 
            <TrendingUp className="w-4 h-4 text-purple-600" />,
            groupedBoards.business,
            "채용 정보와 구직 정보를 확인하세요"
          )}

          {/* 게시판이 없을 때 */}
          {boards.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                아직 게시판이 없습니다
              </h3>
              <p className="text-gray-500 mb-6">
                관리자가 게시판을 생성하면 여기에 표시됩니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardListPage;