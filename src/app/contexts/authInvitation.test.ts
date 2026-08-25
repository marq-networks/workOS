import { describe, expect, it, vi } from 'vitest';
import type { Session } from '@supabase/supabase-js';

vi.mock('../../lib/supabase', () => ({ supabase: { auth: {}, functions: {} } }));

import { acceptAuthenticatedInvitation, inspectInvitationCallback } from './authInvitation';

describe('invitation callback and trusted acceptance', () => {
  it('recognizes the project Supabase implicit invite callback', () => {
    expect(inspectInvitationCallback({ pathname: '/accept-invitation', search: '', hash: '#access_token=secret&type=invite' })).toEqual({ requested: true, hasInviteProof: true, error: null });
  });

  it('fails closed for an expired callback and for normal navigation', () => {
    expect(inspectInvitationCallback({ pathname: '/accept-invitation', search: '?error=access_denied&error_description=expired', hash: '' })).toMatchObject({ requested: true, hasInviteProof: false, error: expect.stringContaining('expired') });
    expect(inspectInvitationCallback({ pathname: '/login', search: '', hash: '' })).toEqual({ requested: false, hasInviteProof: false, error: null });
  });

  it('updates the authenticated invite identity then calls only the trusted accept action', async () => {
    const updateUser = vi.fn().mockResolvedValue({ error: null });
    const invoke = vi.fn().mockResolvedValue({ data: { membershipIds: ['membership-1'] }, error: null });
    await expect(acceptAuthenticatedInvitation({ updateUser } as never, { invoke } as never, { user: { id: 'invitee' } } as Session, 'new-password')).resolves.toEqual({ membershipIds: ['membership-1'] });
    expect(updateUser).toHaveBeenCalledWith({ password: 'new-password' });
    expect(invoke).toHaveBeenCalledWith('identity-administration', { body: { action: 'accept' } });
  });

  it('retries membership activation without updating the already-set password', async () => {
    const updateUser = vi.fn();
    const invoke = vi.fn().mockResolvedValue({ data: {}, error: null });
    await acceptAuthenticatedInvitation({ updateUser } as never, { invoke } as never, { user: {} } as Session, null);
    expect(updateUser).not.toHaveBeenCalled();
    expect(invoke).toHaveBeenCalledOnce();
  });

  it('does not call acceptance without an authenticated invitation session', async () => {
    const invoke = vi.fn();
    await expect(acceptAuthenticatedInvitation({ updateUser: vi.fn() } as never, { invoke } as never, null, 'new-password')).rejects.toThrow('invalid or has expired');
    expect(invoke).not.toHaveBeenCalled();
  });
});
