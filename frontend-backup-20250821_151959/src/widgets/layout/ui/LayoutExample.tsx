/**
 * Layout Example Component - Linear Design System
 * 레이아웃 컴포넌트들의 사용 예시
 * 
 * @version 2025.1.0
 * @author Layout 전문가 (Linear Design System)
 */

import React, { useState } from 'react';
import {
  MainLayout,
  PageContainer,
  type BreadcrumbItem,
  type PageAction,
  type NavMenuItem,
  type UserMenuItem,
} from './index';

/**
 * 예시용 브레드크럼 아이템들
 */
const exampleBreadcrumbs: BreadcrumbItem[] = [
  {
    id: 'home',
    label: '홈',
    href: '/',
  },
  {
    id: 'facilities',
    label: '시설 찾기',
    href: '/facilities',
  },
  {
    id: 'search',
    label: '검색 결과',
    current: true,
  },
];

/**
 * 예시용 페이지 액션들
 */
const exampleActions: PageAction[] = [
  {
    id: 'export',
    label: '내보내기',
    onClick: () => alert('내보내기 클릭'),
    variant: 'secondary',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7,10 12,15 17,10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    ),
  },
  {
    id: 'create',
    label: '새로 만들기',
    onClick: () => alert('새로 만들기 클릭'),
    variant: 'primary',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    ),
  },
];

/**
 * 예시용 사용자 메뉴 아이템들
 */
const exampleUserMenuItems: UserMenuItem[] = [
  {
    id: 'profile',
    label: '마이페이지',
    onClick: () => alert('마이페이지 클릭'),
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    id: 'settings',
    label: '설정',
    onClick: () => alert('설정 클릭'),
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
      </svg>
    ),
  },
  {
    id: 'logout',
    label: '로그아웃',
    onClick: () => alert('로그아웃 클릭'),
    danger: true,
    divider: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16,17 21,12 16,7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
    ),
  },
];

/**
 * Layout Example Component
 */
const LayoutExample: React.FC = () => {
  const [sidebarState, setSidebarState] = useState<'open' | 'collapsed' | 'hidden'>('open');
  
  return (
    <MainLayout
      initialSidebarState={sidebarState}
      onSidebarStateChange={setSidebarState}
      showHeader={true}
      showSidebar={true}
      showFooter={true}
      headerFixed={true}
      sidebarFixed={true}
    >
      <PageContainer
        title="시설 검색 결과"
        description="엘더베리에서 찾은 맞춤형 시설 추천 결과입니다."
        breadcrumbItems={exampleBreadcrumbs}
        actions={exampleActions}
        showBreadcrumb={true}
        showHeaderDivider={true}
        sidebar={
          <div>
            <h3 className="linear-text-primary" style={{ marginTop: 0 }}>필터</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--linear-spacing-md)' }}>
              <div>
                <label className="linear-text-secondary" style={{ fontSize: '14px', fontWeight: 500 }}>
                  지역
                </label>
                <select className="linear-input linear-select" style={{ marginTop: 'var(--linear-spacing-xs)' }}>
                  <option>서울특별시</option>
                  <option>경기도</option>
                  <option>인천광역시</option>
                </select>
              </div>
              <div>
                <label className="linear-text-secondary" style={{ fontSize: '14px', fontWeight: 500 }}>
                  시설 유형
                </label>
                <select className="linear-input linear-select" style={{ marginTop: 'var(--linear-spacing-xs)' }}>
                  <option>요양원</option>
                  <option>요양병원</option>
                  <option>주간보호센터</option>
                </select>
              </div>
              <button className="linear-button-primary">
                필터 적용
              </button>
            </div>
          </div>
        }
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 'var(--linear-spacing-lg)' 
        }}>
          {/* 검색 결과 카드들 */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="linear-card linear-card-interactive">
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: 'var(--linear-spacing-md)' 
              }}>
                <div>
                  <h3 className="linear-text-primary" style={{ 
                    margin: '0 0 var(--linear-spacing-xs) 0',
                    fontSize: '18px',
                    fontWeight: 600 
                  }}>
                    {i === 1 ? '서울요양원' : i === 2 ? '강남실버케어' : i === 3 ? '한강요양병원' : i === 4 ? '마포주간보호센터' : '송파노인복지관'}
                  </h3>
                  <p className="linear-text-secondary" style={{ 
                    margin: '0 0 var(--linear-spacing-sm) 0',
                    fontSize: '14px' 
                  }}>
                    {i === 1 ? '서울특별시 중구 명동길 123' : i === 2 ? '서울특별시 강남구 테헤란로 456' : i === 3 ? '서울특별시 용산구 한강대로 789' : i === 4 ? '서울특별시 마포구 월드컵로 321' : '서울특별시 송파구 올림픽로 654'}
                  </p>
                  <div style={{ display: 'flex', gap: 'var(--linear-spacing-xs)' }}>
                    <span className="linear-badge linear-badge-success">
                      추천
                    </span>
                    <span className="linear-badge">
                      {i === 1 ? '요양원' : i === 2 ? '요양원' : i === 3 ? '요양병원' : i === 4 ? '주간보호' : '복지관'}
                    </span>
                    <span className="linear-badge">
                      {i <= 2 ? '5성급' : i <= 4 ? '4성급' : '3성급'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <div className="linear-text-accent" style={{ 
                    fontSize: '20px', 
                    fontWeight: 600,
                    marginBottom: 'var(--linear-spacing-xs)'
                  }}>
                    {i === 1 ? '4.8' : i === 2 ? '4.7' : i === 3 ? '4.5' : i === 4 ? '4.3' : '4.1'}
                    <span className="linear-text-tertiary" style={{ fontSize: '14px', fontWeight: 400 }}>
                      /5.0
                    </span>
                  </div>
                  <span className="linear-text-tertiary" style={{ fontSize: '12px' }}>
                    (리뷰 {i * 23}개)
                  </span>
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingTop: 'var(--linear-spacing-md)',
                borderTop: '1px solid var(--linear-color-border-subtle)'
                }}>
                <div>
                  <span className="linear-text-primary" style={{ 
                    fontSize: '16px', 
                    fontWeight: 600 
                  }}>
                    월 {(200 + i * 50).toLocaleString()}만원
                  </span>
                  <span className="linear-text-tertiary" style={{ 
                    fontSize: '14px',
                    marginLeft: 'var(--linear-spacing-xs)' 
                  }}>
                    ~부터
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--linear-spacing-sm)' }}>
                  <button className="linear-button-secondary">
                    상세보기
                  </button>
                  <button className="linear-button-primary">
                    문의하기
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {/* 더 보기 버튼 */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            marginTop: 'var(--linear-spacing-xl)' 
          }}>
            <button className="linear-button-ghost" style={{ padding: 'var(--linear-spacing-md) var(--linear-spacing-xl)' }}>
              더 많은 결과 보기
            </button>
          </div>
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default LayoutExample;