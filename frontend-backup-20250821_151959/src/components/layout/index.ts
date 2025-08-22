/**
 * Layout Components Index
 * Linear Design System - Layout 컴포넌트들의 중앙 내보내기
 * 
 * @version 2025.1.0
 * @author Layout 전문가 (Linear Design System)
 */

// 메인 레이아웃 컴포넌트
export { default as MainLayout } from './MainLayout';
export type { MainLayoutProps, LayoutVariant, SidebarState } from './MainLayout';

// 헤더 컴포넌트
export { default as Header } from './Header';
export type { 
  HeaderProps, 
  NavMenuItem, 
  UserMenuItem 
} from './Header';

// 사이드바 컴포넌트
export { default as Sidebar } from './Sidebar';
export type { 
  SidebarProps, 
  SidebarMenuItem, 
  SidebarSection 
} from './Sidebar';

// 푸터 컴포넌트
export { default as Footer } from './Footer';
export type { 
  FooterProps, 
  FooterLink, 
  FooterSection, 
  SocialLink 
} from './Footer';

// 브레드크럼 컴포넌트
export { default as Breadcrumb } from './Breadcrumb';
export type { 
  BreadcrumbProps, 
  BreadcrumbItem 
} from './Breadcrumb';

// 페이지 컨테이너 컴포넌트
export { default as PageContainer } from './PageContainer';
export type { 
  PageContainerProps, 
  PageAction, 
  PageMeta 
} from './PageContainer';

// CSS 스타일 (자동으로 로드되지 않으므로 필요시 직접 import)
// import './layout.css';