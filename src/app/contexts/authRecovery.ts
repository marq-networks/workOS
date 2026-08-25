import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

export type AuthMode = 'normal' | 'password_recovery' | 'invitation_acceptance';

export function authModeForEvent(currentMode: AuthMode, event: AuthChangeEvent): AuthMode {
  if (event === 'PASSWORD_RECOVERY') return 'password_recovery';
  if (event === 'SIGNED_OUT') return 'normal';
  return currentMode;
}

type PasswordAuthClient = Pick<typeof supabase.auth, 'updateUser' | 'signOut'>;

export interface PasswordRecoveryResult {
  passwordUpdated: true;
  signedOut: boolean;
}

interface ProviderAuthError {
  code?: string;
  status?: number;
}

function safePasswordUpdateError(error: ProviderAuthError): Error {
  if (error.code === 'same_password') {
    return new Error('Choose a password that is different from your current password.');
  }
  if (error.code === 'weak_password') {
    return new Error('Choose a stronger password and try again.');
  }
  if (error.code === 'session_not_found' || error.code === 'refresh_token_not_found' || error.code === 'refresh_token_already_used' || error.status === 401) {
    return new Error('Your password recovery session is no longer valid. Request a new recovery link.');
  }
  return new Error('Unable to update your password right now. Please try again.');
}

export async function replaceRecoveryPassword(auth: PasswordAuthClient, mode: AuthMode, session: Session | null, newPassword: string): Promise<PasswordRecoveryResult> {
  if (mode !== 'password_recovery' || !session) throw new Error('Your password recovery session is no longer valid. Request a new recovery link.');
  const { error } = await auth.updateUser({ password: newPassword });
  if (error) throw safePasswordUpdateError(error);

  // Password persistence and local recovery-session cleanup are separate outcomes.
  // A cleanup failure must never turn an accepted password update into a false failure.
  const signedOut = await auth.signOut().then(({ error }) => !error, () => false);
  return { passwordUpdated: true, signedOut };
}
