import { useAuth, useUser, useOrganizationList } from '@clerk/clerk-react';
import { useMemo } from 'react';
import { ElderberryRole, ElderberryRoleManager } from '../providers/ClerkProvider';

interface ElderberryAuthData {
  // Authentication state
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  
  // User information
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    fullName: string | null;
    imageUrl: string;
  } | null;
  
  // Elderberry-specific role information
  elderberryRole: ElderberryRole | null;
  
  // Permission checks
  canUseCoordinatorService: boolean;
  canUseJobService: boolean;
  canUseHealthAssessment: boolean;
  isStaff: boolean;
  isAdmin: boolean;
  
  // JWT token for backend communication
  getToken: () => Promise<string | null>;
  
  // Organization information
  organizations: any[];
  activeOrganization: any;
}

/**
 * Custom hook for Elderberry authentication with Clerk
 * Provides role-based access control and backend integration
 */
export function useElderberryAuth(): ElderberryAuthData {
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const { user } = useUser();
  const { organizationList } = useOrganizationList();

  // Calculate Elderberry role from Clerk organizations
  const elderberryRole = useMemo(() => {
    if (!organizationList?.data) return null;
    return ElderberryRoleManager.getUserRole(organizationList.data);
  }, [organizationList?.data]);

  // Permission checks based on role
  const permissions = useMemo(() => {
    if (!elderberryRole) {
      return {
        canUseCoordinatorService: false,
        canUseJobService: false, 
        canUseHealthAssessment: false,
        isStaff: false,
        isAdmin: false,
      };
    }

    return {
      canUseCoordinatorService: ElderberryRoleManager.canUseCoordinatorService(elderberryRole),
      canUseJobService: ElderberryRoleManager.canUseJobService(elderberryRole),
      canUseHealthAssessment: ElderberryRoleManager.canUseHealthAssessment(elderberryRole),
      isStaff: ElderberryRoleManager.isStaff(elderberryRole),
      isAdmin: elderberryRole === ElderberryRole.ADMIN,
    };
  }, [elderberryRole]);

  // Formatted user data
  const userData = useMemo(() => {
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      imageUrl: user.imageUrl,
    };
  }, [user]);

  return {
    // Authentication state
    isLoaded,
    isSignedIn: isSignedIn || false,
    userId,
    
    // User information
    user: userData,
    
    // Elderberry-specific role information
    elderberryRole,
    
    // Permission checks
    ...permissions,
    
    // JWT token for backend communication
    getToken,
    
    // Organization information
    organizations: organizationList?.data || [],
    activeOrganization: organizationList?.data?.[0] || null,
  };
}

/**
 * Hook for protected routes that require authentication
 */
export function useRequireAuth() {
  const auth = useElderberryAuth();
  
  if (!auth.isLoaded) {
    return { isLoading: true, isAuthenticated: false };
  }
  
  return { 
    isLoading: false, 
    isAuthenticated: auth.isSignedIn,
    redirectToSignIn: !auth.isSignedIn 
  };
}

/**
 * Hook for role-based route protection
 */
export function useRequireRole(requiredRoles: ElderberryRole[]) {
  const auth = useElderberryAuth();
  
  if (!auth.isLoaded) {
    return { isLoading: true, hasAccess: false };
  }
  
  if (!auth.isSignedIn) {
    return { isLoading: false, hasAccess: false, redirectToSignIn: true };
  }
  
  const hasAccess = auth.elderberryRole ? requiredRoles.includes(auth.elderberryRole) : false;
  
  return {
    isLoading: false,
    hasAccess,
    redirectToSignIn: false,
    redirectToUnauthorized: !hasAccess
  };
}

/**
 * Hook for staff-only features
 */
export function useRequireStaff() {
  const auth = useElderberryAuth();
  
  return {
    isLoading: !auth.isLoaded,
    hasStaffAccess: auth.isStaff,
    redirectToSignIn: auth.isLoaded && !auth.isSignedIn,
    redirectToUnauthorized: auth.isLoaded && auth.isSignedIn && !auth.isStaff,
  };
}