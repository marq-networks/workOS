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

describe('ProtectedShell', () => {
  it('renders only the canonical login destination after logout or a signed-out refresh', () => {
    authState.user = null;
    organizationState.activeMembership = { id: 'stale-membership' };
    const markup = renderToStaticMarkup(
      <ProtectedShell login={<p>Canonical LoginScreen</p>}><p>Protected application</p></ProtectedShell>,
    );
    expect(markup).toContain('Canonical LoginScreen');
    expect(markup).not.toContain('Protected application');
    authState.user = { id: 'signed-in-user' };
  });

  it('ignores stale browser authorization state while signed out', () => {
    authState.user = null;
    const staleRoleStoreValue = 'platform_admin';
    const markup = renderToStaticMarkup(
      <ProtectedShell login={<p>Canonical LoginScreen</p>}><p>{staleRoleStoreValue} application</p></ProtectedShell>,
    );
    expect(markup).toContain('Canonical LoginScreen');
    expect(markup).not.toContain('platform_admin application');
    authState.user = { id: 'signed-in-user' };
  });

  it('does not render application content without a validated active membership', () => {
    authState.user = { id: 'signed-in-user' };
    organizationState.activeMembership = null;
    const markup = renderToStaticMarkup(
      <ProtectedShell login={<p>Login</p>}><p>Protected application</p></ProtectedShell>,
    );

    expect(markup).toContain('active organization membership could not be validated');
    expect(markup).not.toContain('Protected application');
  });

  it('keeps canonical dialog and unsaved state mounted during background revalidation', () => {
    authState.user = { id: 'signed-in-user' };
    organizationState.activeMembership = { id: 'membership-present' };
    organizationState.revalidating = true;
    const markup = renderToStaticMarkup(
      <ProtectedShell login={<p>Login</p>}><div role="dialog"><input value="unsaved organization name" readOnly /></div></ProtectedShell>,
    );
    expect(markup).toContain('role="dialog"');
    expect(markup).toContain('unsaved organization name');
    expect(markup).not.toContain('Loading workspace');
  });

  it('removes protected content as soon as revalidation proves revocation', () => {
    authState.user = { id: 'signed-in-user' };
    organizationState.revalidating = false;
    organizationState.memberships = [];
    organizationState.activeMembership = null;
    const markup = renderToStaticMarkup(<ProtectedShell login={<p>Login</p>}><p>Protected application</p></ProtectedShell>);
    expect(markup).toContain('No organization access');
    expect(markup).not.toContain('Protected application');
  });
});
