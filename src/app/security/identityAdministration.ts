import type { LaunchRole } from './types';

export interface InviteMemberInput {
  email: string;
  tenantId: string;
  organizationId: string;
  role: Exclude<LaunchRole, 'platform_admin'> | 'platform_admin';
}

export interface InvitationResult {
  correlationId?: string;
}

async function administerInvitation(action: 'invite' | 'resend', input: InviteMemberInput): Promise<InvitationResult> {
  const { supabase } = await import('../../lib/supabase');
  const { data, error } = await supabase.functions.invoke('identity-administration', {
    body: { action, ...input },
  });
  if (error) throw new Error('The invitation could not be created.');
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
