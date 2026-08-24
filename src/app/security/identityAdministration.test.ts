import { beforeEach, describe, expect, it, vi } from 'vitest';

const invoke = vi.hoisted(() => vi.fn());
vi.mock('../../lib/supabase', () => ({ supabase: { functions: { invoke } } }));

import { inviteMember, invitePlatformOrgAdmin, resendPlatformOrgAdminInvitation } from './identityAdministration';

const target = { email: 'qa-admin@example.com', tenantId: 'tenant-1', organizationId: 'org-1' };

describe('trusted identity administration client', () => {
  beforeEach(() => { vi.clearAllMocks(); invoke.mockResolvedValue({ data: {}, error: null }); });

  it('fixes Platform Organization invitations to org_admin through the trusted path', async () => {
    invoke.mockResolvedValue({ data: { correlationId: 'correlation-1' }, error: null });
    await expect(invitePlatformOrgAdmin(target)).resolves.toEqual({ correlationId: 'correlation-1' });
    expect(invoke).toHaveBeenCalledWith('identity-administration', { body: { action: 'invite', ...target, role: 'org_admin' } });
  });

  it('resends the same org_admin target with action=resend', async () => {
    await resendPlatformOrgAdminInvitation(target);
    expect(invoke).toHaveBeenCalledWith('identity-administration', { body: { action: 'resend', ...target, role: 'org_admin' } });
  });

  it('keeps the existing Org Admin member invitation contract unchanged', async () => {
    await inviteMember({ ...target, role: 'employee' });
    expect(invoke).toHaveBeenCalledWith('identity-administration', { body: { action: 'invite', ...target, role: 'employee' } });
  });

  it('maps provider failures to a bounded client error', async () => {
    invoke.mockResolvedValue({ data: { service_role: 'must not leak' }, error: { message: 'provider detail' } });
    await expect(invitePlatformOrgAdmin(target)).rejects.toThrow('The invitation could not be created.');
  });
});
