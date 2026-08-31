import type { LaunchRole } from './types';
import { captureOperationalError } from '../../observability/telemetry';

function serviceFailure(operation: string, message: string): Error {
  captureOperationalError(operation, 'service', new Error('trusted service failure'));
  return new Error(message);
}

export interface InviteMemberInput {
  email: string;
  tenantId: string;
  organizationId: string;
  role: Exclude<LaunchRole, 'platform_admin'> | 'platform_admin';
}

export interface InvitationResult {
  correlationId?: string;
}

export interface DeactivateOrganizationMembershipInput {
  tenantId: string;
  organizationId: string;
  membershipId: string;
}

/** Privileged membership writes are performed only by the authenticated Edge boundary. */
export async function deactivateOrganizationMembership(input: DeactivateOrganizationMembershipInput): Promise<void> {
  const { supabase } = await import('../../lib/supabase');
  const { error } = await supabase.functions.invoke('identity-administration', {
    body: { action: 'deactivate', ...input },
  });
  if (error) throw serviceFailure('identity.membership.deactivate', 'The membership could not be deactivated.');
}

async function administerInvitation(action: 'invite' | 'resend', input: InviteMemberInput): Promise<InvitationResult> {
  const { supabase } = await import('../../lib/supabase');
  const { data, error } = await supabase.functions.invoke('identity-administration', {
    body: { action, ...input },
  });
  if (error) throw serviceFailure(`identity.invitation.${action}`, 'The invitation could not be created.');
  return typeof data?.correlationId === 'string' ? { correlationId: data.correlationId } : {};
}

export async function inviteMember(input: InviteMemberInput): Promise<InvitationResult> {
  return administerInvitation('invite', input);
}

export interface PlatformOrgAdminInvitationInput {
  email: string;
  tenantId: string;
  organizationId: string;
}

/** The Platform Organizations surface can create only the fixed Org Admin role. */
export async function invitePlatformOrgAdmin(input: PlatformOrgAdminInvitationInput): Promise<InvitationResult> {
  return administerInvitation('invite', { ...input, role: 'org_admin' });
}

/** Resends the same fixed-role invitation; the trusted backend remains authoritative. */
export async function resendPlatformOrgAdminInvitation(input: PlatformOrgAdminInvitationInput): Promise<InvitationResult> {
  return administerInvitation('resend', { ...input, role: 'org_admin' });
}
