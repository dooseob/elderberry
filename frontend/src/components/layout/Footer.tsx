/**
 * Footer Component - Linear Design System
 * 레이아웃 전문가가 설계한 반응형 푸터 컴포넌트
 * 
 * @version 2025.1.0
 * @author Layout 전문가 (Linear Design System)
 * 
 * Features:
 * - 회사 정보, 링크, 저작권 표시
 * - Linear 디자인 일관성
 * - 다국어 지원 고려
 * - 반응형 디자인
 * - 접근성 고려 (ARIA, 키보드 네비게이션)
 * - 소셜 미디어 링크
 */

import React from 'react';
import { useLinearTheme } from '../../hooks/useLinearTheme';
import type { LayoutVariant } from './MainLayout';

/**
 * 푸터 링크 타입
 */
export interface FooterLink {
  /** 고유 ID */
  id: string;
  /** 표시할 텍스트 */
  label: string;
  /** 링크 경로 */
  href: string;
  /** 새 창에서 열기 */
  external?: boolean;
  /** 아이콘 (선택사항) */
  icon?: React.ReactNode;
}

/**
 * 푸터 섹션 타입
 */
export interface FooterSection {
  /** 고유 ID */
  id: string;
  /** 섹션 제목 */
  title: string;
  /** 링크들 */
  links: FooterLink[];
}

/**
 * 소셜 미디어 링크 타입
 */
export interface SocialLink {
  /** 고유 ID */
  id: string;
  /** 플랫폼 이름 */
  name: string;
  /** 링크 경로 */
  href: string;
  /** 아이콘 */
  icon: React.ReactNode;
  /** 접근성 라벨 */
  ariaLabel: string;
}

/**
 * Footer Props
 */
export interface FooterProps {
  /** 레이아웃 변형 */
  variant?: LayoutVariant;
  /** 푸터 섹션들 */
  sections?: FooterSection[];
  /** 소셜 미디어 링크들 */
  socialLinks?: SocialLink[];
  /** 저작권 텍스트 */
  copyrightText?: string;
  /** 회사 이름 */
  companyName?: string;
  /** 회사 설명 */
  companyDescription?: string;
  /** 연락처 정보 */
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  /** 뉴스레터 구독 표시 여부 */
  showNewsletter?: boolean;
  /** 커스텀 클래스 */
  className?: string;
}

/**
 * 기본 푸터 섹션들
 */
const DEFAULT_SECTIONS: FooterSection[] = [
  {
    id: 'services',
    title: '서비스',
    links: [
      { id: 'facilities', label: '시설 찾기', href: '/facilities' },
      { id: 'health', label: '건강 평가', href: '/health' },
      { id: 'recommendations', label: 'AI 추천', href: '/recommendations' },
      { id: 'consultation', label: '전문 상담', href: '/consultation' },
    ],
  },
  {
    id: 'company',
    title: '회사 소개',
    links: [
      { id: 'about', label: '회사 소개', href: '/about' },
      { id: 'team', label: '팀 소개', href: '/team' },
      { id: 'careers', label: '채용 정보', href: '/careers' },
      { id: 'news', label: '보도자료', href: '/news' },
    ],
  },
  {
    id: 'support',
    title: '고객 지원',
    links: [
      { id: 'help', label: '도움말', href: '/help' },
      { id: 'faq', label: '자주 묻는 질문', href: '/faq' },
      { id: 'contact', label: '문의하기', href: '/contact' },
      { id: 'feedback', label: '피드백', href: '/feedback' },
    ],
  },
  {
    id: 'legal',
    title: '약관 및 정책',
    links: [
      { id: 'privacy', label: '개인정보 처리방침', href: '/privacy' },
      { id: 'terms', label: '이용약관', href: '/terms' },
      { id: 'cookies', label: '쿠키 정책', href: '/cookies' },
      { id: 'accessibility', label: '접근성 정책', href: '/accessibility' },
    ],
  },
];

/**
 * 기본 소셜 미디어 링크들
 */
const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    href: 'https://facebook.com/elderberry',
    ariaLabel: '엘더베리 페이스북 페이지',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    id: 'twitter',
    name: 'Twitter',
    href: 'https://twitter.com/elderberry',
    ariaLabel: '엘더베리 트위터 페이지',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
      </svg>
    ),
  },
  {
    id: 'instagram',
    name: 'Instagram',
    href: 'https://instagram.com/elderberry',
    ariaLabel: '엘더베리 인스타그램 페이지',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  {
    id: 'youtube',
    name: 'YouTube',
    href: 'https://youtube.com/elderberry',
    ariaLabel: '엘더베리 유튜브 채널',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
];

/**
 * Footer Component
 */
const Footer: React.FC<FooterProps> = ({
  variant = 'default',
  sections = DEFAULT_SECTIONS,
  socialLinks = DEFAULT_SOCIAL_LINKS,
  copyrightText,
  companyName = '엘더베리',
  companyDescription = '고령층을 위한 맞춤형 시설 추천 및 건강 관리 서비스',
  contactInfo,
  showNewsletter = true,
  className = '',
}) => {
  // Linear 테마 훅
  const { isDarkMode } = useLinearTheme();
  
  // 현재 연도
  const currentYear = new Date().getFullYear();
  
  // 기본 저작권 텍스트
  const defaultCopyrightText = `© ${currentYear} ${companyName}. 모든 권리 보유.`;
  
  // 푸터 클래스 계산
  const footerClasses = [
    'linear-footer',
    `footer-variant-${variant}`,
    isDarkMode && 'footer-dark',
    className,
  ].filter(Boolean).join(' ');
  
  // 링크 렌더링
  const renderLink = (link: FooterLink) => (
    <a
      key={link.id}
      href={link.href}
      target={link.external ? '_blank' : undefined}
      rel={link.external ? 'noopener noreferrer' : undefined}
      className="footer-link linear-text-secondary hover:linear-text-accent"
    >
      {link.icon && <span className="link-icon">{link.icon}</span>}
      {link.label}
    </a>
  );
  
  // 섹션 렌더링
  const renderSection = (section: FooterSection) => (
    <div key={section.id} className="footer-section">
      <h3 className="section-title linear-text-primary">{section.title}</h3>
      <ul className="section-links">
        {section.links.map((link) => (
          <li key={link.id}>{renderLink(link)}</li>
        ))}
      </ul>
    </div>
  );
  
  // 소셜 링크 렌더링
  const renderSocialLink = (social: SocialLink) => (
    <a
      key={social.id}
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      className="social-link linear-button-ghost"
      aria-label={social.ariaLabel}
      title={social.name}
    >
      {social.icon}
    </a>
  );
  
  return (
    <footer className={footerClasses} role="contentinfo">
      <div className="footer-container">
        {/* 메인 푸터 콘텐츠 */}
        <div className="footer-main">
          {/* 회사 정보 섹션 */}
          <div className="footer-brand">
            <div className="brand-header">
              <div className="brand-logo">
                <div className="logo-icon linear-gradient-signature">
                  <span className="logo-text">E</span>
                </div>
                <span className="brand-name">{companyName}</span>
              </div>
            </div>
            
            <p className="brand-description linear-text-secondary">
              {companyDescription}
            </p>
            
            {/* 연락처 정보 */}
            {contactInfo && (
              <div className="contact-info">
                {contactInfo.email && (
                  <div className="contact-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <a href={`mailto:${contactInfo.email}`} className="linear-text-secondary hover:linear-text-accent">
                      {contactInfo.email}
                    </a>
                  </div>
                )}
                
                {contactInfo.phone && (
                  <div className="contact-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <a href={`tel:${contactInfo.phone}`} className="linear-text-secondary hover:linear-text-accent">
                      {contactInfo.phone}
                    </a>
                  </div>
                )}
                
                {contactInfo.address && (
                  <div className="contact-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span className="linear-text-secondary">{contactInfo.address}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* 소셜 미디어 링크 */}
            <div className="social-links">
              <span className="social-title linear-text-primary">팔로우하기</span>
              <div className="social-icons">
                {socialLinks.map(renderSocialLink)}
              </div>
            </div>
          </div>
          
          {/* 푸터 섹션들 */}
          <div className="footer-sections">
            {sections.map(renderSection)}
          </div>
          
          {/* 뉴스레터 구독 */}
          {showNewsletter && (
            <div className="newsletter-section">
              <h3 className="section-title linear-text-primary">뉴스레터 구독</h3>
              <p className="newsletter-description linear-text-secondary">
                최신 소식과 유용한 정보를 받아보세요.
              </p>
              <form className="newsletter-form">
                <div className="form-group">
                  <input
                    type="email"
                    placeholder="이메일 주소를 입력하세요"
                    className="linear-input newsletter-input"
                    aria-label="뉴스레터 구독을 위한 이메일 주소"
                  />
                  <button
                    type="submit"
                    className="linear-button-primary newsletter-button"
                  >
                    구독하기
                  </button>
                </div>
                <p className="newsletter-notice linear-text-tertiary">
                  구독하시면 개인정보 처리방침에 동의하는 것으로 간주됩니다.
                </p>
              </form>
            </div>
          )}
        </div>
        
        <hr className="linear-separator" />
        
        {/* 푸터 하단 */}
        <div className="footer-bottom">
          <div className="copyright">
            <span className="linear-text-secondary">
              {copyrightText || defaultCopyrightText}
            </span>
          </div>
          
          <div className="footer-meta">
            <span className="linear-text-tertiary">
              Made with ❤️ in Korea
            </span>
            <span className="linear-text-tertiary">•</span>
            <span className="linear-text-tertiary">
              Linear Design System v2025.1.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;