/**
 * Layout Widget - Linear Design System
 * 레이아웃 위젯의 모든 컴포넌트와 타입을 내보내는 인덱스 파일
 * 
 * @version 2025.1.0
 * @author Layout 전문가 (Linear Design System)
 */

// 메인 레이아웃 컴포넌트
export { default as MainLayout } from './MainLayout';
export { default as PageContainer } from './PageContainer';
export { default as LayoutExample } from './LayoutExample';

// 브레드크럼 타입을 breadcrumb 위젯에서 import
export type { BreadcrumbItem } from '../../breadcrumb/ui/Breadcrumb';

export interface PageAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface NavMenuItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: NavMenuItem[];
}

export interface UserMenuItem {
  id: string;
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  separator?: boolean;
}

// 레이아웃 변형 타입
export type LayoutVariant = 'default' | 'wide' | 'narrow';

// 사이드바 상태 타입
export type SidebarState = 'expanded' | 'collapsed' | 'hidden';

// 페이지 헤더 설정 타입
export interface PageHeaderConfig {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: PageAction[];
  showBackButton?: boolean;
  onBackClick?: () => void;
}

// 페이지 컨테이너 props 타입
export interface PageContainerProps {
  children: React.ReactNode;
  headerConfig?: PageHeaderConfig;
  variant?: LayoutVariant;
  className?: string;
  loading?: boolean;
  error?: string | null;
}

// 메인 레이아웃 props 타입
export interface MainLayoutProps {
  children: React.ReactNode;
  sidebarState?: SidebarState;
  onSidebarToggle?: () => void;
  className?: string;
}