/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ROUTE GUARD - Client-Side Access Control
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Enforces role-based access control using the navigation registry.
 * Redirects unauthorized users to their role's default home.
 */

import { useEffect } from 'react';
import { useRouter } from './router';
import { useOrganization } from '../contexts/organizationContextValue';
import { canAccessPath, getDefaultRouteForRole } from '../nav/canAccessPath';
import type { Role } from '../nav/navManifest';

export function getRouteGuardRedirect(role: Role, path: string): string | null {
  return canAccessPath(role, path) ? null : getDefaultRouteForRole(role);
}

/**
 * Route guard that checks access on every navigation
 */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { currentPath, navigate } = useRouter();
  // ProtectedShell renders this guard only after OrganizationContext has committed a
  // backend-validated active membership. Browser role state is never consulted here.
  const { activeRole: currentRole } = useOrganization();
  
  useEffect(() => {
    // Allow diagnostic and analysis routes for all roles (dev tools)
    if (currentPath.startsWith('/diagnostics/') || currentPath.startsWith('/analysis/')) {
      return;
    }
    
    // Check if current role can access current path via navigation manifest
    const redirect = currentRole
      ? getRouteGuardRedirect(currentRole, currentPath)
      : getDefaultRouteForRole('employee');
    
    if (redirect) {
      console.warn(`[RouteGuard] Access denied: ${currentRole} cannot access ${currentPath}`);
      
      // Redirect to safe default route for this role
      console.log(`[RouteGuard] Redirecting to: ${redirect}`);
      navigate(redirect);
    }
  }, [currentPath, currentRole, navigate]);
  
  // Always render children - the useEffect will handle redirection
  return <>{children}</>;
}
