import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

export const INVITATION_CALLBACK_PATH = '/accept-invitation';

export interface InvitationCallback {
  requested: boolean;
  hasInviteProof: boolean;
  error: string | null;
}

/** Capture the provider callback before supabase-js consumes and clears its hash. */
export function inspectInvitationCallback(location: Pick<Location, 'pathname' | 'search' | 'hash'>): InvitationCallback {
  const requested = location.pathname === INVITATION_CALLBACK_PATH;
  const query = new URLSearchParams(location.search);
  const hash = new URLSearchParams(location.hash.replace(/^#/, ''));
  const providerError = query.get('error_description') ?? hash.get('error_description');
  const type = query.get('type') ?? hash.get('type');
  return {
    requested,
    hasInviteProof: requested && type === 'invite' && Boolean(hash.get('access_token') || query.get('token_hash')),
    error: providerError ? 'This invitation link is invalid or has expired. Ask an administrator to resend it.' : null,
  };
}

type InvitationAuthClient = Pick<typeof supabase.auth, 'updateUser'>;
type InvitationFunctionsClient = Pick<typeof supabase.functions, 'invoke'>;

export interface InvitationAcceptanceResult {
  membershipIds: string[];
}

export async function acceptAuthenticatedInvitation(
  auth: InvitationAuthClient,
  functions: InvitationFunctionsClient,
  session: Session | null,
  newPassword: string | null,
): Promise<InvitationAcceptanceResult> {
  if (!session) throw new Error('This invitation session is invalid or has expired. Ask an administrator to resend it.');
  if (newPassword !== null) {
    const { error } = await auth.updateUser({ password: newPassword });
    if (error) {
      if (error.code === 'weak_password') throw new Error('Choose a stronger password and try again.');
      throw new Error('Unable to set your password. Request a new invitation if this link has expired.');
    }
  }
  const { data, error } = await functions.invoke('identity-administration', { body: { action: 'accept' } });
  if (error) throw new Error('Your password is set, but organization access could not be activated. Retry acceptance without creating another account.');
  return { membershipIds: Array.isArray(data?.membershipIds) ? data.membershipIds : [] };
}
