import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

const organizationState = vi.hoisted(() => ({
  loading: false,
  revalidating: false,
  switching: false,
  memberships: [{ id: 'membership-present' }],
  activeMembership: null as { id: string } | null,
  error: null as string | null,
}));
const authState = vi.hoisted(() => ({
  initializing: false,
  user: { id: 'signed-in-user' } as { id: string } | null,
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => authState,
}));

vi.mock('../contexts/OrganizationContext', () => ({
  useOrganization: () => organizationState,
}));

import { ProtectedShell } from './ProtectedShell';
import { LoginScreen } from '../components/screens/auth/LoginScreen';

const canonicalLogin = <LoginScreen onLogin={vi.fn()} onRequestPasswordReset={vi.fn()} />;

describe('ProtectedShell', () => {
  it('sends no-session, successful-logout, and logout-plus-refresh states to the canonical login', () => {
    authState.user = null;

    const afterLogout = renderToStaticMarkup(<ProtectedShell login={canonicalLogin}><p>Protected application</p></ProtectedShell>);
    const afterRefresh = renderToStaticMarkup(<ProtectedShell login={canonicalLogin}><p>Protected application</p></ProtectedShell>);

    for (const markup of [afterLogout, afterRefresh]) {
      expect(markup).toContain('Sign in to Work OS');
      expect(markup).not.toContain('Select your role');
      expect(markup).not.toContain('Protected application');
    }
    authState.user = { id: 'signed-in-user' };
  });

  it('ignores stale browser role state when choosing the signed-out destination', () => {
    authState.user = null;
    vi.stubGlobal('localStorage', { getItem: vi.fn().mockReturnValue('platform_admin') });

    const markup = renderToStaticMarkup(<ProtectedShell login={canonicalLogin}><p>Protected application</p></ProtectedShell>);

    expect(markup).toContain('Sign in to Work OS');
    expect(markup).not.toContain('Platform Admin');
    expect(localStorage.getItem).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
    authState.user = { id: 'signed-in-user' };
  });

  it('does not render application content without a validated active membership', () => {
    organizationState.activeMembership = null;
    const markup = renderToStaticMarkup(
      <ProtectedShell login={<p>Login</p>}><p>Protected application</p></ProtectedShell>,
    );

    expect(markup).toContain('active organization membership could not be validated');
    expect(markup).not.toContain('Protected application');
  });

  it('keeps canonical dialog and unsaved state mounted during background revalidation', () => {
    organizationState.activeMembership = { id: 'membership-present' };
    organizationState.revalidating = true;
    const markup = renderToStaticMarkup(
      <ProtectedShell login={<p>Login</p>}><div role="dialog"><input value="unsaved organization name" readOnly /></div></ProtectedShell>,
    );
    expect(markup).toContain('role="dialog"');
    expect(markup).toContain('unsaved organization name');
    expect(markup).not.toContain('Loading workspace');
  });

  it('admits an authenticated user with a backend-validated active membership normally', () => {
    authState.user = { id: 'signed-in-user' };
    organizationState.memberships = [{ id: 'membership-present' }];
    organizationState.activeMembership = { id: 'membership-present' };
    organizationState.revalidating = false;

    const markup = renderToStaticMarkup(<ProtectedShell login={canonicalLogin}><p>Protected application</p></ProtectedShell>);

    expect(markup).toContain('Protected application');
    expect(markup).not.toContain('Sign in to Work OS');
  });

  it('removes protected content as soon as revalidation proves revocation', () => {
    organizationState.revalidating = false;
    organizationState.memberships = [];
    organizationState.activeMembership = null;
    const markup = renderToStaticMarkup(<ProtectedShell login={<p>Login</p>}><p>Protected application</p></ProtectedShell>);
    expect(markup).toContain('No organization access');
    expect(markup).not.toContain('Protected application');
  });
});
