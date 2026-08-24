import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getRouteGuardRedirect } from './RouteGuard';
import { getActiveRole, setActiveRole } from '../state/roleStore';
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

  it('keeps a Platform Admin on Organizations after clicking it from Support Console', () => {
    setActiveRole(platformMembership.role);

    expect(getActiveRole()).toBe(platformMembership.role);
    expect(getRouteGuardRedirect(getActiveRole(), '/super/console')).toBeNull();
    expect(getRouteGuardRedirect(getActiveRole(), '/super/organizations')).toBeNull();
  });

  it('still fails closed when a non-platform role attempts Organizations', () => {
    expect(getRouteGuardRedirect('employee', '/super/organizations')).toBe('/work/my-work');
    expect(getRouteGuardRedirect('org_admin', '/super/organizations')).toBe('/org/admin/dashboard');
  });
});
