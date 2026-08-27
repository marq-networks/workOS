import { describe, expect, it } from 'vitest';
import { authorizeMembershipDeactivation, parseMembershipDeactivationRequest } from './membershipDeactivationPolicy';

const request = { action: 'deactivate' as const, tenantId: '11111111-1111-4111-8111-111111111111', organizationId: '22222222-2222-4222-8222-222222222222', membershipId: '33333333-3333-4333-8333-333333333333' };
const target = { id: request.membershipId, tenant_id: request.tenantId, organization_id: request.organizationId, role: 'employee' as const, status: 'active', deleted_at: null };
const actor = (role: 'employee' | 'org_admin' | 'platform_admin', overrides = {}) => ({ tenant_id: request.tenantId, organization_id: request.organizationId, role, status: 'active', deleted_at: null, ...overrides });

describe('membership deactivation policy', () => {
  it('parses only bounded UUID targets', () => expect(parseMembershipDeactivationRequest(request)).toEqual(request));
  it('allows an active exact-org Org Admin to deactivate an Employee', () => expect(authorizeMembershipDeactivation([actor('org_admin')], target, request)).toBe('org_admin'));
  it('denies cross-org, Employee, and inactive actors', () => {
    expect(authorizeMembershipDeactivation([actor('org_admin', { organization_id: '44444444-4444-4444-8444-444444444444' })], target, request)).toBeNull();
    expect(authorizeMembershipDeactivation([actor('employee')], target, request)).toBeNull();
    expect(authorizeMembershipDeactivation([actor('org_admin', { status: 'inactive' })], target, request)).toBeNull();
  });
  it('denies an Org Admin targeting a Platform Admin', () => expect(authorizeMembershipDeactivation([actor('org_admin')], { ...target, role: 'platform_admin' }, request)).toBeNull());
});
