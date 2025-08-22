import React from 'react';
import { ClerkProvider as BaseClerkProvider } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

// Clerk configuration
const PUBLISHABLE_KEY = import.meta.env?.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key. Add VITE_CLERK_PUBLISHABLE_KEY to your .env file');
}

interface ElderberryClerkProviderProps {
  children: React.ReactNode;
}

/**
 * Elderberry Clerk Provider with organization support
 * Supports multi-role authentication for:
 * - 일반 사용자 (국내/해외)
 * - 요양보호사 (구직자)
 * - 시설 관리자
 * - 코디네이터
 * - 관리자
 */
export function ElderberryClerkProvider({ children }: ElderberryClerkProviderProps) {
  const clerkConfig = {
    // Organization configuration for role-based access
    appearance: {
      theme: {
        primaryColor: '#2563eb', // Elderberry primary blue
        borderRadius: '8px',
      },
      elements: {
        formButtonPrimary: 'bg-primary hover:bg-primary-dark text-white',
        card: 'border border-border-light shadow-lg',
        headerTitle: 'text-text-main font-bold',
        headerSubtitle: 'text-text-muted',
        socialButtonsBlockButton: 'border border-border-light hover:bg-gray-50',
      },
      layout: {
        logoImageUrl: undefined, // Use default Clerk branding for now
        helpPageUrl: '/help',
        privacyPageUrl: '/privacy',
        termsPageUrl: '/terms',
      },
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorInputBackground: '#ffffff',
        colorInputText: '#1f2937',
        colorText: '#1f2937',
        colorTextSecondary: '#6b7280',
        borderRadius: '8px',
      },
    },
    
    // Navigate function for post-auth redirects
    navigate: (to: string) => <Navigate to={to} replace />,
    
    // Localization for Korean users
    localization: {
      signIn: {
        start: {
          title: '엘더베리에 로그인',
          subtitle: '계정에 로그인하여 서비스를 이용하세요',
        },
      },
      signUp: {
        start: {
          title: '엘더베리 회원가입',
          subtitle: '새 계정을 만들어 시작하세요',
        },
      },
    },
  };

  return (
    <BaseClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      {...clerkConfig}
    >
      {children}
    </BaseClerkProvider>
  );
}

/**
 * Elderberry Role Configuration
 * Maps Clerk organizations to Elderberry user roles
 */
export const ELDERBERRY_ORGANIZATIONS = {
  DOMESTIC_USERS: import.meta.env?.VITE_CLERK_ORG_DOMESTIC_USERS,
  OVERSEAS_USERS: import.meta.env?.VITE_CLERK_ORG_OVERSEAS_USERS,
  JOB_SEEKERS: import.meta.env?.VITE_CLERK_ORG_JOB_SEEKERS,
  FACILITIES: import.meta.env?.VITE_CLERK_ORG_FACILITIES,
  COORDINATORS: import.meta.env?.VITE_CLERK_ORG_COORDINATORS,
  ADMINS: import.meta.env?.VITE_CLERK_ORG_ADMINS,
} as const;

/**
 * Elderberry Role Types
 * Matches the backend MemberRole enum
 */
export enum ElderberryRole {
  USER_DOMESTIC = 'USER_DOMESTIC',
  USER_OVERSEAS = 'USER_OVERSEAS', 
  JOB_SEEKER_DOMESTIC = 'JOB_SEEKER_DOMESTIC',
  JOB_SEEKER_OVERSEAS = 'JOB_SEEKER_OVERSEAS',
  FACILITY = 'FACILITY',
  COORDINATOR = 'COORDINATOR',
  ADMIN = 'ADMIN',
}

/**
 * Role utility functions
 */
export class ElderberryRoleManager {
  /**
   * Get user's Elderberry role from Clerk organizations
   */
  static getUserRole(organizations: any[]): ElderberryRole | null {
    if (!organizations || organizations.length === 0) {
      return ElderberryRole.USER_DOMESTIC; // Default role
    }

    // Check organization membership to determine role
    const orgIds = organizations.map(org => org.id);

    if (orgIds.includes(ELDERBERRY_ORGANIZATIONS.ADMINS)) {
      return ElderberryRole.ADMIN;
    }
    if (orgIds.includes(ELDERBERRY_ORGANIZATIONS.COORDINATORS)) {
      return ElderberryRole.COORDINATOR;
    }
    if (orgIds.includes(ELDERBERRY_ORGANIZATIONS.FACILITIES)) {
      return ElderberryRole.FACILITY;
    }
    if (orgIds.includes(ELDERBERRY_ORGANIZATIONS.JOB_SEEKERS)) {
      return ElderberryRole.JOB_SEEKER_DOMESTIC; // Can be refined with metadata
    }
    if (orgIds.includes(ELDERBERRY_ORGANIZATIONS.OVERSEAS_USERS)) {
      return ElderberryRole.USER_OVERSEAS;
    }
    if (orgIds.includes(ELDERBERRY_ORGANIZATIONS.DOMESTIC_USERS)) {
      return ElderberryRole.USER_DOMESTIC;
    }

    return ElderberryRole.USER_DOMESTIC; // Default fallback
  }

  /**
   * Check if user can access specific features
   */
  static canUseCoordinatorService(role: ElderberryRole): boolean {
    return [
      ElderberryRole.USER_DOMESTIC, 
      ElderberryRole.USER_OVERSEAS
    ].includes(role);
  }

  static canUseJobService(role: ElderberryRole): boolean {
    return [
      ElderberryRole.JOB_SEEKER_DOMESTIC,
      ElderberryRole.JOB_SEEKER_OVERSEAS,
      ElderberryRole.FACILITY
    ].includes(role);
  }

  static canUseHealthAssessment(role: ElderberryRole): boolean {
    return [
      ElderberryRole.USER_DOMESTIC,
      ElderberryRole.USER_OVERSEAS
    ].includes(role);
  }

  static isStaff(role: ElderberryRole): boolean {
    return [
      ElderberryRole.ADMIN,
      ElderberryRole.COORDINATOR,
      ElderberryRole.FACILITY
    ].includes(role);
  }
}