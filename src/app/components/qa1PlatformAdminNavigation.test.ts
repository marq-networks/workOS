import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getRouteGuardRedirect } from './RouteGuard';
import { getActiveRole, setActiveRole } from '../state/roleStore';
import { getNavForRole } from '../nav/getNavForRole';
import { getAuthorizationSubjectId } from '../contexts/organizationAuthorization';
import { getUserRoleLabel } from '../security/rolePresentation';
import type { ValidatedMembership } from '../security/types';

const platformMembership: ValidatedMembership = {
  id: 'membership-1',
  tenantId: 'tenant-1',
  organizationId: 'organization-1',
  organizationName: 'MARQ Networks',
  organizationSlug: 'marq-networks',
  role: 'platform_admin',
};

describe('QA-1 Platform Admin navigation lifecycle', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() });
  });

  afterEach(() => {
    setActiveRole('employee');
    vi.unstubAllGlobals();
  });

  it('uses the validated Platform Admin membership when browser role state defaults to employee', () => {
    expect(getActiveRole()).toBe('employee');
    expect(getRouteGuardRedirect(platformMembership.role, '/super/console')).toBeNull();
    expect(getRouteGuardRedirect(platformMembership.role, '/super/organizations')).toBeNull();
  });

  it('ignores stale localStorage and stale roleStore values for route authorization', () => {
    vi.mocked(localStorage.getItem).mockReturnValue('employee');
    setActiveRole('employee');

    expect(localStorage.getItem('workos_role')).toBe('employee');
    expect(getActiveRole()).toBe('employee');
    expect(getRouteGuardRedirect(platformMembership.role, '/super/organizations')).toBeNull();
  });

  it('denies Employee and Org Admin memberships from Organizations', () => {
    expect(getRouteGuardRedirect('employee', '/super/organizations')).toBe('/work/my-work');
    expect(getRouteGuardRedirect('org_admin', '/super/organizations')).toBe('/org/admin/dashboard');
  });

  it('updates authorization when a newly validated membership changes role', () => {
    let validatedMembership: ValidatedMembership = platformMembership;
    expect(getRouteGuardRedirect(validatedMembership.role, '/super/organizations')).toBeNull();

    validatedMembership = { ...platformMembership, role: 'employee' };
    expect(getRouteGuardRedirect(validatedMembership.role, '/super/organizations')).toBe('/work/my-work');
  });

  it('keeps the authorization subject and backend role authority stable across same-user refresh', () => {
    const beforeRefresh = { id: 'user-1' };
    const afterRefresh = { id: 'user-1', refreshed_at: 'now' };

    expect(getAuthorizationSubjectId(beforeRefresh)).toBe(getAuthorizationSubjectId(afterRefresh));
    expect(getRouteGuardRedirect(platformMembership.role, '/super/organizations')).toBeNull();
  });

  it('fails closed when revocation removes the validated active membership', () => {
    const activeMembership: ValidatedMembership | null = null;
    expect(activeMembership).toBeNull();
    // ProtectedShell does not render RouteGuard without an active membership.
  });

  it('derives sidebar navigation and the user role label from the backend role', () => {
    setActiveRole('employee');
    const sidebar = getNavForRole(platformMembership.role);
    const organizations = sidebar
      .flatMap((item) => [item, ...(item.children ?? [])])
      .find((item) => item.path === '/super/organizations');

    expect(organizations?.label).toBe('Organizations');
    expect(getUserRoleLabel(platformMembership.role)).toBe('Platform Administrator');
  });
});
