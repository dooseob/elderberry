/**
 * useBreadcrumb Hook
 * 현재 라우트를 기반으로 브레드크럼 아이템을 자동 생성하는 커스텀 훅
 * 
 * @version 1.0.0
 * @description 라우트 경로를 분석하여 브레드크럼 네비게이션 데이터를 제공
 */

import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import type { BreadcrumbItem } from '../widgets/breadcrumb/ui/Breadcrumb';

/**
 * 라우트별 메타데이터 설정
 */
interface RouteMetadata {
  label: string;
  icon?: React.ReactNode;
  parent?: string;
  hidden?: boolean; // 브레드크럼에서 숨김 여부
}

/**
 * 라우트 메타데이터 매핑
 */
const ROUTE_METADATA: Record<string, RouteMetadata> = {
  '/': {
    label: '홈',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
    )
  },
  '/about': {
    label: '소개',
    parent: '/',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    )
  },
  '/contact': {
    label: '문의',
    parent: '/',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
      </svg>
    )
  },
  '/dashboard': {
    label: '대시보드',
    parent: '/',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      </svg>
    )
  },
  '/mypage': {
    label: '마이페이지',
    parent: '/',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    )
  },
  '/settings': {
    label: '설정',
    parent: '/mypage',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    )
  },
  '/notifications': {
    label: '알림',
    parent: '/',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    )
  },
  '/facility-search': {
    label: '시설 찾기',
    parent: '/',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    )
  },
  '/health-assessment': {
    label: '건강 평가',
    parent: '/',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    )
  },
  '/boards': {
    label: '커뮤니티',
    parent: '/',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
      </svg>
    )
  },
  '/jobs': {
    label: '구인구직',
    parent: '/',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    )
  },
  
  // Auth routes (일반적으로 브레드크럼에서 제외)
  '/auth': {
    label: '인증',
    hidden: true
  },
  '/auth/signin': {
    label: '로그인',
    parent: '/',
    hidden: true
  },
  '/auth/signup': {
    label: '회원가입',
    parent: '/',
    hidden: true
  },
  
  // Admin routes
  '/admin': {
    label: '관리자',
    parent: '/',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    )
  }
};

/**
 * 동적 라우트 패턴 처리
 */
const DYNAMIC_ROUTES: Record<string, (pathSegments: string[]) => RouteMetadata> = {
  '/boards/:boardId': (segments) => ({
    label: `게시판 #${segments[1]}`,
    parent: '/boards'
  }),
  '/boards/:boardId/posts/:postId': (segments) => ({
    label: `게시글 #${segments[3]}`,
    parent: `/boards/${segments[1]}`
  }),
  '/jobs/:jobId': (segments) => ({
    label: `채용공고 #${segments[1]}`,
    parent: '/jobs'
  }),
  '/profiles/:profileType/:profileId': (segments) => ({
    label: `${segments[1] === 'member' ? '회원' : '코디네이터'} 프로필`,
    parent: '/profiles'
  })
};

/**
 * useBreadcrumb 훅
 */
export const useBreadcrumb = () => {
  const location = useLocation();

  const breadcrumbItems = useMemo((): BreadcrumbItem[] => {
    const pathname = location.pathname;
    
    // Auth 페이지나 특별한 페이지들은 브레드크럼 표시하지 않음
    if (pathname.startsWith('/auth/') || pathname === '/unauthorized' || pathname.startsWith('/linear-demo')) {
      return [];
    }

    const segments = pathname.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [];

    // 경로를 단계적으로 구성
    let currentPath = '';
    
    for (let i = 0; i < segments.length; i++) {
      currentPath += `/${segments[i]}`;
      
      // 정적 라우트 확인
      let metadata = ROUTE_METADATA[currentPath];
      
      // 동적 라우트 확인
      if (!metadata) {
        for (const [pattern, resolver] of Object.entries(DYNAMIC_ROUTES)) {
          const patternSegments = pattern.split('/').filter(Boolean);
          
          if (patternSegments.length === segments.length) {
            let matches = true;
            for (let j = 0; j < patternSegments.length; j++) {
              if (!patternSegments[j].startsWith(':') && patternSegments[j] !== segments[j]) {
                matches = false;
                break;
              }
            }
            
            if (matches) {
              metadata = resolver(segments);
              break;
            }
          }
        }
      }

      // 기본값 설정
      if (!metadata) {
        metadata = {
          label: segments[i].charAt(0).toUpperCase() + segments[i].slice(1)
        };
      }

      // 숨김 처리된 라우트는 제외
      if (metadata.hidden) {
        continue;
      }

      const isLast = i === segments.length - 1;
      
      items.push({
        id: currentPath,
        label: metadata.label,
        href: isLast ? undefined : currentPath, // 현재 페이지는 링크 제거
        icon: metadata.icon,
        current: isLast
      });
    }

    // 홈 페이지가 첫 번째가 아니고 다른 아이템이 있는 경우 홈을 첫 번째에 추가
    if (items.length > 0 && items[0]?.id !== '/') {
      items.unshift({
        id: '/',
        label: '홈',
        href: '/',
        icon: ROUTE_METADATA['/']?.icon,
        current: false
      });
    }

    return items;
  }, [location.pathname]);

  return {
    items: breadcrumbItems,
    currentPage: breadcrumbItems.find(item => item.current)?.label || '',
    showBreadcrumb: breadcrumbItems.length > 1 // 홈만 있는 경우 숨김
  };
};

export default useBreadcrumb;