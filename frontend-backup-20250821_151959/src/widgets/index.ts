/**
 * Widgets Layer - FSD Public API
 * 애플리케이션 위젯 컴포넌트들의 통합 내보내기
 */

// Header Widget
export { Header } from './header';
export type { HeaderProps, NavMenuItem, UserMenuItem } from './header';

// Sidebar Widget  
export { Sidebar } from './sidebar';
export type { SidebarProps, SidebarMenuItem, SidebarSection } from './sidebar';

// Footer Widget
export { Footer } from './footer';
export type { FooterProps, FooterLink, FooterSection, SocialLink } from './footer';

// Breadcrumb Widget
export { Breadcrumb } from './breadcrumb';
export type { BreadcrumbProps, BreadcrumbItem } from './breadcrumb';

// Layout Widget
export { MainLayout, PageContainer, LayoutExample } from './layout';
export type { 
  MainLayoutProps, 
  LayoutVariant, 
  SidebarState,
  PageContainerProps, 
  PageAction, 
  PageMeta 
} from './layout';

// Notification Widget
export { NotificationBell, NotificationPanel } from './notification';