import { beforeEach, describe, expect, it, vi } from 'vitest';

const invoke = vi.fn();
vi.mock('../../lib/supabase', () => ({ supabase: { functions: { invoke } } }));
import { listOrganizationMemberships } from './organizationMemberships';

describe('organization membership repository', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses the trusted scoped list action and preserves invited and profile-less members', async () => {
    invoke.mockResolvedValue({ data: { memberships: [
      { id: 'invited', userId: 'user-1', email: 'invite@example.com', role: 'employee', status: 'invited', department: null },
      { id: 'active', userId: 'user-2', email: 'admin@example.com', role: 'org_admin', status: 'active', department: 'Operations' },
    ] }, error: null });
    const scope = { tenantId: 'tenant-1', organizationId: 'org-1' };
    const result = await listOrganizationMemberships(scope);
    expect(invoke).toHaveBeenCalledWith('identity-administration', { body: { action: 'list', ...scope } });
    expect(result).toEqual(expect.arrayContaining([
      expect.objectContaining({ email: 'invite@example.com', status: 'invited', department: null }),
      expect.objectContaining({ email: 'admin@example.com', status: 'active' }),
    ]));
  });
});
