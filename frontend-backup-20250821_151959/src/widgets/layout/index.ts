/**
 * Layout Widget - FSD Public API
 * 메인 레이아웃 위젯 컴포넌트들
 */

export { default as MainLayout } from './ui/MainLayout';
export { default as PageContainer } from './ui/PageContainer';
export { default as LayoutExample } from './ui/LayoutExample';

export type { 
  MainLayoutProps, 
  LayoutVariant, 
  SidebarState 
} from './ui/MainLayout';

export type { 
  PageContainerProps, 
  PageAction, 
  PageMeta 
} from './ui/PageContainer';