import { DynamicSidebar } from './components/DynamicSidebar';
import { Router, Route, useRouter } from './components/router';
import { RouteGuard } from './components/RouteGuard';
import { useEffect } from 'react';
import { ToastProvider } from './components/ui/toast';
import { getDefaultRouteForRole } from './nav/getNavForRole';
import { getUserRoleLabel } from './security/rolePresentation';
import { ChatDockProvider, ChatDock } from './components/chat-dock';
import { ExecutionOSProvider } from './contexts/ExecutionOSContext';
import { LoginScreen } from './components/screens/auth/LoginScreen';
import { ResetPasswordScreen } from './components/screens/auth/ResetPasswordScreen';
import { ServiceProvider } from './services';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OrganizationProvider, useOrganization } from './contexts/OrganizationContext';
import { ProtectedShell } from './security/ProtectedShell';
import { PasswordRecoveryGate } from './security/PasswordRecoveryGate';
import { AppShell } from './components/shared/AppShell';

// Navigation System
import { generateRoutes, validateRouteRegistry } from './navigation';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROLE-BASED REDIRECT HELPER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function RoleBasedRedirect() {
  const { navigate } = useRouter();
  const { activeRole } = useOrganization();
  
  useEffect(() => {
    const defaultRoute = getDefaultRouteForRole(activeRole ?? 'employee');
    navigate(defaultRoute);
  }, [activeRole, navigate]);
  
  return <div>Redirecting...</div>;
}

function AppContent() {
  const { currentPath, navigate } = useRouter();
  const { user, signOut } = useAuth();
  const { memberships, activeMembership, activeRole, switchOrganization } = useOrganization();

  // Validate route registry in development
  useEffect(() => {
    if (import.meta.env.DEV) {
      validateRouteRegistry();
    }
  }, []);

  // Listen for navigation events from NotificationCenter and other components
  useEffect(() => {
    const handler = (e: Event) => {
      const path = (e as CustomEvent).detail?.path;
      if (path) navigate(path);
    };
    window.addEventListener('workos-navigate', handler);
    return () => window.removeEventListener('workos-navigate', handler);
  }, [navigate]);

  const currentUser = {
    name: user?.user_metadata?.full_name ?? user?.email ?? 'Signed-in user',
    email: user?.email ?? '',
    role: getUserRoleLabel(activeRole),
  };

  return (
    <AppShell
      sidebarContent={<DynamicSidebar />}
      currentUser={currentUser}
      currentOrg={activeMembership ? { name: activeMembership.organizationName } : undefined}
      organizations={memberships.map((membership) => ({ id: membership.organizationId, name: membership.organizationName }))}
      notificationCount={5}
      activeRole={activeRole ?? 'employee'}
      onOrgSwitch={(organizationId) => void switchOrganization(organizationId)}
      onLogout={() => void signOut()}
    >
      {/* Root redirect */}
      <Route path="/">
        <RoleBasedRedirect />
      </Route>
      
      {/* Login redirect (if somehow navigated to /login while authenticated) */}
      <Route path="/login">
        <RoleBasedRedirect />
      </Route>
      
      {/* All routes auto-generated from navigation registry */}
      {generateRoutes()}
    </AppShell>
  );
}

function SecuredApplication() {
  const { signIn, requestPasswordReset } = useAuth();
  const { activeRole } = useOrganization();
  const initialPath = getDefaultRouteForRole(activeRole ?? 'employee');
  
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ProtectedShell login={<LoginScreen onLogin={signIn} onRequestPasswordReset={requestPasswordReset} />}>
          <Router initialPath={initialPath}>
          <ServiceProvider>
            <ExecutionOSProvider>
              <ChatDockProvider>
                <RouteGuard>
                  <AppContent />
                </RouteGuard>
                <ChatDock />
              </ChatDockProvider>
            </ExecutionOSProvider>
          </ServiceProvider>
          </Router>
        </ProtectedShell>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default function App() {
  return <AuthProvider><AuthEntry /></AuthProvider>;
}

export function AuthEntry() {
  const { authMode, updatePassword } = useAuth();
  return <PasswordRecoveryGate authMode={authMode} recovery={<ResetPasswordScreen onUpdatePassword={updatePassword} />}><OrganizationProvider><SecuredApplication /></OrganizationProvider></PasswordRecoveryGate>;
}
