import type { AuthError } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

const SIGN_IN_FAILURE = 'Unable to sign in with those credentials. Check your details and try again.';
const SIGN_IN_THROTTLED = 'Too many sign-in attempts. Wait a few minutes before trying again.';

type PasswordResetClient = Pick<typeof supabase.auth, 'resetPasswordForEmail'>;
type SignOutClient = Pick<typeof supabase.auth, 'signOut'>;
type LoginLocation = Pick<Location, 'pathname' | 'hash'>;
type LoginHistory = Pick<History, 'replaceState'>;

export function canonicalizeSignedOutUrl(location: LoginLocation, history: LoginHistory): void {
  if (location.pathname !== '/login' || location.hash) {
    history.replaceState({}, '', '/login');
  }
}

export async function signOutAndReturnToLogin(
  auth: SignOutClient,
  location: LoginLocation,
  history: LoginHistory,
): Promise<void> {
  const { error } = await auth.signOut();
  if (error) throw new Error('Unable to sign out. Please try again.');
  canonicalizeSignedOutUrl(location, history);
}

export function safeSignInError(error: Pick<AuthError, 'status' | 'code'>): Error {
  if (error.status === 429 || error.code === 'over_request_rate_limit' || error.code === 'over_email_send_rate_limit') {
    return new Error(SIGN_IN_THROTTLED);
  }
  return new Error(SIGN_IN_FAILURE);
}

export async function requestPasswordRecovery(
  auth: PasswordResetClient,
  email: string,
  redirectTo: string,
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    throw new Error('Enter a valid email address.');
  }

  const { error } = await auth.resetPasswordForEmail(normalizedEmail, { redirectTo });
  if (error) {
    if (error.status === 429 || error.code === 'over_email_send_rate_limit') {
      throw new Error('Too many recovery requests. Wait a few minutes before trying again.');
    }
    throw new Error('Unable to request a recovery link right now. Please try again.');
  }
}
