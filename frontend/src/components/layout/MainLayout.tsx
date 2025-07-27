/**
 * 메인 레이아웃 컴포넌트
 * 인증된 사용자를 위한 기본 레이아웃
 */
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ConditionalAnimatePresence, MotionDropdown } from '../ui/ConditionalMotion';
import {
  Menu,
  X,
  Home,
  Users,
  MessageSquare,
  Briefcase,
  User,
  Settings,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  Building2,
  Heart,
  FileText,
  BarChart3,
  HelpCircle
} from '../icons/LucideIcons';

import { useAuthStore } from '../../stores/authStore';
import { MemberRole } from '../../types/auth';
import Button from '../ui/Button';
import SkipLink from '../ui/SkipLink';
import ThemeToggle from '../ui/ThemeToggle';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useRoleBasedPreload, usePreloadOnHover } from '../../utils/preloadRoutes';

interface MainLayoutProps {
  children: React.ReactNode;
}

// 네비게이션 메뉴 구조
const navigationMenus = {
  [MemberRole.CAREGIVER]: [
    { icon: Home, label: '대시보드', path: '/dashboard', badge: null },
    { icon: Briefcase, label: '구인정보', path: '/jobs', badge: null },
    { icon: MessageSquare, label: '게시판', path: '/boards', badge: null },
    { icon: Users, label: '프로필 관리', path: '/profiles', badge: null },
    { icon: Heart, label: '건강평가', path: '/health-assessment', badge: null },
    { icon: Building2, label: '시설검색', path: '/facility-search', badge: null }
  ],
  [MemberRole.EMPLOYER]: [
    { icon: Home, label: '대시보드', path: '/dashboard', badge: null },
    { icon: Briefcase, label: '구인관리', path: '/jobs/manage', badge: null },
    { icon: Users, label: '간병인 찾기', path: '/caregivers', badge: null },
    { icon: MessageSquare, label: '게시판', path: '/boards', badge: null },
    { icon: FileText, label: '프로필 관리', path: '/profiles', badge: null },
    { icon: Building2, label: '시설정보', path: '/facilities', badge: null }
  ],
  [MemberRole.COORDINATOR]: [
    { icon: Home, label: '대시보드', path: '/dashboard', badge: null },
    { icon: Users, label: '프로필 관리', path: '/profiles', badge: null },
    { icon: Briefcase, label: '매칭관리', path: '/matching', badge: null },
    { icon: BarChart3, label: '통계', path: '/statistics', badge: null },
    { icon: MessageSquare, label: '게시판', path: '/boards', badge: null },
    { icon: Building2, label: '시설관리', path: '/facilities/manage', badge: null }
  ],
  [MemberRole.ADMIN]: [
    { icon: Home, label: '대시보드', path: '/dashboard', badge: null },
    { icon: Users, label: '프로필 관리', path: '/profiles', badge: null },
    { icon: Briefcase, label: '구인관리', path: '/admin/jobs', badge: null },
    { icon: Building2, label: '시설관리', path: '/admin/facilities', badge: null },
    { icon: BarChart3, label: '시스템 통계', path: '/admin/statistics', badge: null },
    { icon: Settings, label: '시스템 설정', path: '/admin/settings', badge: null }
  ]
};

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [notifications] = useState(3); // Mock notification count
  
  // 포커스 트랩 훅 (프로필 메뉴용)
  const profileMenuRef = useFocusTrap({
    isActive: isProfileMenuOpen,
    initialFocus: 'a, button',
    returnFocus: true,
  });
  
  // 프리로딩 훅
  const preloadOnHover = usePreloadOnHover();
  useRoleBasedPreload(user?.role as keyof typeof import('../../utils/preloadRoutes')['ROLE_BASED_PRELOAD']);

  // 현재 사용자 역할에 따른 메뉴
  const currentMenus = user ? navigationMenus[user.role] || [] : [];

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  // 모바일 메뉴 토글
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // 프로필 메뉴 토글
  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  // 사이드바 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSidebarOpen && !(event.target as Element).closest('.sidebar')) {
        setIsSidebarOpen(false);
      }
      if (isProfileMenuOpen && !(event.target as Element).closest('.profile-menu')) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen, isProfileMenuOpen]);

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" role="application" aria-label="엘더베리 메인 애플리케이션">
      <SkipLink />
      {/* 사이드바 */}
      <aside 
        className={`
          sidebar fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        role="navigation"
        aria-label="주 네비게이션"
        aria-hidden={!isSidebarOpen ? 'true' : 'false'}
      >
        {/* 로고 */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link 
            to="/dashboard" 
            className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-elderberry-500 focus:ring-offset-2 rounded-lg"
            aria-label="엘더베리 홈으로 이동"
          >
            <div className="w-8 h-8 bg-elderberry-600 rounded-lg flex items-center justify-center" aria-hidden="true">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold text-elderberry-900">Elderberry</span>
          </Link>
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-elderberry-500 focus:ring-offset-2"
            aria-label="사이드바 닫기"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="flex-1 px-4 py-6 space-y-2" role="menubar" aria-label="주 메뉴">
          {currentMenus.map((menu) => {
            const Icon = menu.icon;
            const isActive = location.pathname === menu.path || 
                           location.pathname.startsWith(menu.path + '/');
            
            return (
              <Link
                key={menu.path}
                to={menu.path}
                onClick={() => setIsSidebarOpen(false)}
                onMouseEnter={() => {
                  // 호버 시 프리로딩
                  const routeName = menu.path.substring(1); // '/dashboard' -> 'dashboard'
                  preloadOnHover(routeName);
                }}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-elderberry-500 focus:ring-offset-2
                  ${isActive 
                    ? 'bg-elderberry-50 text-elderberry-700 border-r-2 border-elderberry-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                role="menuitem"
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-elderberry-600' : ''}`} aria-hidden="true" />
                <span className="font-medium">{menu.label}</span>
                {menu.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {menu.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* 하단 메뉴 */}
        <div className="p-4 border-t border-gray-200 space-y-2" role="menubar" aria-label="보조 메뉴">
          <Link
            to="/chat-home"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-elderberry-500 focus:ring-offset-2"
            role="menuitem"
          >
            <MessageSquare className="w-5 h-5" aria-hidden="true" />
            <span className="font-medium">AI 챗봇</span>
          </Link>
          <Link
            to="/help"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-elderberry-500 focus:ring-offset-2"
            role="menuitem"
          >
            <HelpCircle className="w-5 h-5" aria-hidden="true" />
            <span className="font-medium">도움말</span>
          </Link>
        </div>
      </aside>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 헤더 */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6" role="banner">
          {/* 모바일 메뉴 버튼 */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-elderberry-500 focus:ring-offset-2"
            aria-label="메뉴 열기"
            aria-expanded={isSidebarOpen}
            aria-controls="main-navigation"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>

          {/* 검색바 (데스크톱) */}
          <div className="hidden md:flex items-center flex-1 max-w-lg mx-4" role="search">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" aria-hidden="true" />
              <input
                type="text"
                placeholder="검색어를 입력하세요..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-elderberry-500 focus:border-elderberry-500 transition-colors"
                aria-label="사이트 내 검색"
              />
            </div>
          </div>

          {/* 헤더 우측 메뉴 */}
          <div className="flex items-center space-x-4">
            {/* 테마 토글 */}
            <ThemeToggle />
            
            {/* 알림 */}
            <button 
              className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-elderberry-500 focus:ring-offset-2"
              aria-label={notifications > 0 ? `알림 ${notifications}개` : '알림'}
              aria-describedby={notifications > 0 ? 'notification-count' : undefined}
            >
              <Bell className="w-5 h-5" aria-hidden="true" />
              {notifications > 0 && (
                <span 
                  id="notification-count"
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                  aria-label={`${notifications}개의 읽지 않은 알림`}
                >
                  {notifications}
                </span>
              )}
            </button>

            {/* 프로필 드롭다운 */}
            <div className="relative profile-menu" ref={profileMenuRef}>
              <button
                onClick={toggleProfileMenu}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-elderberry-500 focus:ring-offset-2"
                aria-label={`프로필 메뉴, ${user.name}`}
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="menu"
              >
                <div className="w-8 h-8 bg-elderberry-600 rounded-full flex items-center justify-center" aria-hidden="true">
                  <span className="text-white text-sm font-semibold">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.role}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" aria-hidden="true" />
              </button>

              {/* 프로필 드롭다운 메뉴 */}
              <ConditionalAnimatePresence>
                {isProfileMenuOpen && (
                  <MotionDropdown
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    role="menu"
                    aria-labelledby="profile-menu-button"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-elderberry-600 mt-1">
                        프로필 완성도: {user.profileCompletionRate}%
                      </div>
                    </div>
                    
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                      role="menuitem"
                    >
                      <User className="w-4 h-4" aria-hidden="true" />
                      <span>프로필 관리</span>
                    </Link>
                    
                    <Link
                      to="/settings"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                      role="menuitem"
                    >
                      <Settings className="w-4 h-4" aria-hidden="true" />
                      <span>설정</span>
                    </Link>
                    
                    <div className="px-4 py-2">
                      <div className="text-xs text-gray-500 mb-2">테마</div>
                      <ThemeToggle variant="dropdown" className="w-full" />
                    </div>
                    
                    <hr className="my-2" />
                    
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 focus:outline-none focus:bg-red-50 w-full text-left"
                      role="menuitem"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" />
                      <span>로그아웃</span>
                    </button>
                  </MotionDropdown>
                )}
              </ConditionalAnimatePresence>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 p-6" role="main" aria-label="주요 콘텐츠" tabIndex={-1}>
          {children}
        </main>
      </div>

      {/* 모바일 오버레이 */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}