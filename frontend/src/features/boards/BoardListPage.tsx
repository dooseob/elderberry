/**
 * BoardListPage - 게시판 목록 페이지
 * 모든 활성 게시판을 카테고리별로 표시
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Clock,
  ArrowRight,
  Settings,
  Plus
} from 'lucide-react';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner';
import { ErrorMessage } from '../../shared/ui/ErrorMessage';
import { boardApi } from '../../entities/board';
import type { Board } from '../../entities/board';
import { BOARD_METADATA, BOARD_COLORS } from '../../entities/board';
import { useAuthStore } from '../../shared/stores/authStore';

export const BoardListPage: React.FC = () => {
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
        
        const boardList = await boardApi.getAllBoards();
        setBoards(boardList.sort((a, b) => a.sortOrder - b.sortOrder));
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
    const color = BOARD_COLORS[board.type];
    
    // 관리자 전용 게시판 접근 권한 체크
    if (board.adminOnly && (!user || (user.role !== 'ADMIN' && user.role !== 'FACILITY'))) {
      return null;
    }

    return (
      <div
        key={board.id}
        className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer group"
        onClick={() => navigate(`/boards/${board.id}`)}
      >
        <div className="p-6">
          {/* 게시판 헤더 */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center text-2xl`}>
                {metadata.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {board.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {board.description || metadata.description}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {board.adminOnly && (
                <Badge variant="secondary" className="text-xs">
                  관리자
                </Badge>
              )}
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>

          {/* 게시판 통계 */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                <MessageSquare className="w-4 h-4" />
                <span className="text-xs">게시글</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {board.postCount || 0}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">인기</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">-</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs">최근</span>
              </div>
              <p className="text-sm text-gray-600">
                {new Date(board.lastModifiedDate || board.createdDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 카테고리별 게시판 그룹화
  const groupedBoards = {
    official: boards.filter(board => 
      ['NOTICE', 'ANNOUNCEMENT', 'FAQ'].includes(board.type)
    ),
    community: boards.filter(board => 
      ['GENERAL', 'COMMUNITY', 'QNA', 'REVIEW'].includes(board.type)
    ),
    business: boards.filter(board => 
      board.type === 'JOB'
    )
  };

  const renderBoardGroup = (title: string, icon: React.ReactNode, boards: Board[], description?: string) => {
    if (boards.length === 0) return null;

    return (
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map(renderBoardCard)}
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

  // Set document title
  React.useEffect(() => {
    document.title = '커뮤니티 - 엘더베리';
    return () => {
      document.title = '엘더베리';
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* 페이지 헤더 */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  커뮤니티
                </h1>
                <p className="text-gray-600">
                  다양한 정보를 공유하고 같은 관심사를 가진 사람들과 소통해보세요
                </p>
              </div>
              
              {/* 관리자 메뉴 */}
              {isAuthenticated && user && (user.role === 'ADMIN' || user.role === 'FACILITY') && (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/admin/boards')}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    게시판 관리
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/admin/boards/create')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    게시판 추가
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* 통계 요약 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">전체 게시판</p>
                  <p className="text-xl font-semibold text-gray-900">{boards.length}개</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">총 게시글</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {boards.reduce((sum, board) => sum + (board.postCount || 0), 0)}개
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">활성 사용자</p>
                  <p className="text-xl font-semibold text-gray-900">-</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">오늘 게시글</p>
                  <p className="text-xl font-semibold text-gray-900">-</p>
                </div>
              </div>
            </div>
          </div>

          {/* 게시판 그룹별 표시 */}
          {renderBoardGroup(
            "공식 안내", 
            <MessageSquare className="w-4 h-4 text-blue-600" />,
            groupedBoards.official,
            "공지사항과 중요한 안내사항을 확인하세요"
          )}
          
          {renderBoardGroup(
            "커뮤니티", 
            <Users className="w-4 h-4 text-green-600" />,
            groupedBoards.community,
            "자유로운 소통과 정보 공유 공간입니다"
          )}
          
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