import { describe, expect, it } from 'vitest';
import { authorizeMembershipList, parseMembershipListRequest } from './membershipListPolicy';

const target = parseMembershipListRequest({
  action: 'list',
  tenantId: '10000000-0000-4000-8000-000000000001',
  organizationId: '20000000-0000-4000-8000-000000000001',
});
const base = {
  tenant_id: target.tenantId,
  organization_id: target.organizationId,
  status: 'active',
  deleted_at: null,
} as const;

describe('trusted membership list policy', () => {
  it('allows an active Org Admin only for its exact tenant and organization', () => {
    expect(authorizeMembershipList([{ ...base, role: 'org_admin' }], target)).toBe('org_admin');
    expect(authorizeMembershipList([{ ...base, organization_id: '30000000-0000-4000-8000-000000000001', role: 'org_admin' }], target)).toBeNull();
  });

  it('denies employees and inactive or deleted administrators', () => {
    expect(authorizeMembershipList([{ ...base, role: 'employee' }], target)).toBeNull();
    expect(authorizeMembershipList([{ ...base, role: 'org_admin', status: 'inactive' }], target)).toBeNull();
    expect(authorizeMembershipList([{ ...base, role: 'org_admin', deleted_at: '2026-08-25T00:00:00Z' }], target)).toBeNull();
  });

  it('allows an active Platform Admin to inspect a valid target scope', () => {
    expect(authorizeMembershipList([{ ...base, organization_id: '30000000-0000-4000-8000-000000000001', role: 'platform_admin' }], target)).toBe('platform_admin');
  });
});
