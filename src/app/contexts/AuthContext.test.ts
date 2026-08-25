import { describe, expect, it, vi } from 'vitest';
import type { Session } from '@supabase/supabase-js';

vi.mock('../../lib/supabase', () => ({
  supabase: { auth: {} },
}));

import { authModeForEvent, replaceRecoveryPassword } from './authRecovery';

describe('password recovery auth flow', () => {
  it('enters recovery mode on PASSWORD_RECOVERY and is not overwritten by SIGNED_IN', () => {
    const recovering = authModeForEvent('normal', 'PASSWORD_RECOVERY');
    expect(recovering).toBe('password_recovery');
    expect(authModeForEvent(recovering, 'SIGNED_IN')).toBe('password_recovery');
  });

  it('keeps password recovery independent from invitation acceptance', () => {
    expect(authModeForEvent('invitation_acceptance', 'PASSWORD_RECOVERY')).toBe('password_recovery');
    expect(authModeForEvent('password_recovery', 'SIGNED_IN')).toBe('password_recovery');
  });

  it('updates the password and signs out the recovery session', async () => {
    const updateUser = vi.fn().mockResolvedValue({ error: null });
    const signOut = vi.fn().mockResolvedValue({ error: null });
    await expect(replaceRecoveryPassword({ updateUser, signOut } as never, 'password_recovery', { user: {} } as Session, 'new-password')).resolves.toEqual({ passwordUpdated: true, signedOut: true });
    expect(updateUser).toHaveBeenCalledWith({ password: 'new-password' });
    expect(signOut).toHaveBeenCalledOnce();
  });

  it('reports password success separately when recovery-session cleanup fails', async () => {
    const updateUser = vi.fn().mockResolvedValue({ error: null });
    const signOut = vi.fn().mockResolvedValue({ error: { message: 'private provider detail' } });
    await expect(replaceRecoveryPassword({ updateUser, signOut } as never, 'password_recovery', { user: {} } as Session, 'new-password')).resolves.toEqual({ passwordUpdated: true, signedOut: false });
  });

  it('preserves password success when recovery-session cleanup rejects', async () => {
    const updateUser = vi.fn().mockResolvedValue({ error: null });
    const signOut = vi.fn().mockRejectedValue(new Error('private network detail'));
    await expect(replaceRecoveryPassword({ updateUser, signOut } as never, 'password_recovery', { user: {} } as Session, 'new-password')).resolves.toEqual({ passwordUpdated: true, signedOut: false });
  });

  it('gives safe, specific guidance for a repeated password', async () => {
    const updateUser = vi.fn().mockResolvedValue({ error: { code: 'same_password', message: 'private provider detail' } });
    await expect(replaceRecoveryPassword({ updateUser, signOut: vi.fn() } as never, 'password_recovery', { user: {} } as Session, 'new-password')).rejects.toThrow('different from your current password');
  });

  it('reserves recovery-link guidance for an invalid provider session', async () => {
    const updateUser = vi.fn().mockResolvedValue({ error: { code: 'session_not_found', message: 'private provider detail' } });
    await expect(replaceRecoveryPassword({ updateUser, signOut: vi.fn() } as never, 'password_recovery', { user: {} } as Session, 'new-password')).rejects.toThrow('Request a new recovery link');
  });

  it('hides unknown provider details without claiming the link is invalid', async () => {
    const updateUser = vi.fn().mockResolvedValue({ error: { code: 'unexpected', message: 'private provider detail' } });
    await expect(replaceRecoveryPassword({ updateUser, signOut: vi.fn() } as never, 'password_recovery', { user: {} } as Session, 'new-password')).rejects.toThrow('Unable to update your password right now');
  });

  it('requires a recovery session before updating', async () => {
    const updateUser = vi.fn();
    await expect(replaceRecoveryPassword({ updateUser, signOut: vi.fn() } as never, 'normal', null, 'new-password')).rejects.toThrow('recovery session');
    expect(updateUser).not.toHaveBeenCalled();
  });
});
