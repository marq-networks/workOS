import { createClient } from 'npm:@supabase/supabase-js@2';
import {
  parseInvitationRequest,
  RequestValidationError,
  toInvitationCommand,
} from '../_shared/invitationPolicy.ts';

const jsonHeaders = {
  'access-control-allow-headers': 'authorization, apikey, content-type, x-client-info',
  'access-control-allow-origin': '*',
  'content-type': 'application/json; charset=utf-8',
};

function response(status: number, code: string, message: string, extra: Record<string, unknown> = {}) {
  return new Response(JSON.stringify({ code, message, ...extra }), { status, headers: jsonHeaders });
}

Deno.serve(async (request) => {
  const correlationId = crypto.randomUUID();
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { ...jsonHeaders, 'access-control-allow-methods': 'POST' } });
  }
  if (request.method !== 'POST') return response(405, 'METHOD_NOT_ALLOWED', 'Only POST is supported.');

  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return response(401, 'AUTH_REQUIRED', 'A valid authenticated session is required.');
  }

  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceRoleKey) return response(503, 'SERVICE_UNAVAILABLE', 'Identity administration is unavailable.');

  const admin = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const token = authorization.slice('Bearer '.length);
  const { data: { user: actor }, error: authError } = await admin.auth.getUser(token);
  if (authError || !actor) return response(401, 'AUTH_REQUIRED', 'A valid authenticated session is required.');

  let input;
  try {
    input = parseInvitationRequest(await request.json());
  } catch (error) {
    if (error instanceof RequestValidationError || error instanceof SyntaxError) {
      return response(400, 'INVALID_REQUEST', 'The invitation request is invalid.');
    }
    return response(500, 'REQUEST_FAILED', 'The request could not be completed.');
  }

  if (input.action === 'accept') {
    const { data, error } = await admin.rpc('trusted_accept_invitation', {
      p_user_id: actor.id,
      p_correlation_id: correlationId,
    });
    if (error) return response(403, 'ACCEPTANCE_DENIED', 'No valid invitation can be accepted.');
    return response(200, 'INVITATION_ACCEPTED', 'Invitation accepted.', { membershipIds: data });
  }

  const appUrl = Deno.env.get('APP_URL');
  let invitationRedirectTo: string;
  try {
    if (!appUrl) throw new Error('missing app URL');
    const configuredUrl = new URL(appUrl);
    if (configuredUrl.protocol !== 'https:' && configuredUrl.hostname !== 'localhost') throw new Error('invalid protocol');
    invitationRedirectTo = new URL('/accept-invitation', configuredUrl).toString();
  } catch {
    return response(503, 'SERVICE_UNAVAILABLE', 'Identity administration is unavailable.');
  }

  const command = toInvitationCommand(input);
  const { data: organization } = await admin
    .from('organizations')
    .select('id')
    .eq('id', command.organizationId)
    .eq('tenant_id', command.tenantId)
    .maybeSingle();
  const { data: actorMemberships } = await admin
    .from('memberships')
    .select('role, organization_id')
    .eq('user_id', actor.id)
    .eq('status', 'active')
    .is('deleted_at', null);
  const isPlatformAdmin = actorMemberships?.some((membership) => membership.role === 'platform_admin') ?? false;
  const isTargetOrgAdmin = actorMemberships?.some(
    (membership) => membership.role === 'org_admin' && membership.organization_id === command.organizationId,
  ) ?? false;
  if (!organization || (!isPlatformAdmin && !isTargetOrgAdmin) || (command.role === 'platform_admin' && !isPlatformAdmin)) {
    return response(403, 'INVITATION_DENIED', 'The invitation is not permitted for this organization.');
  }

  if (input.action === 'resend') {
    const { error } = await admin.auth.resend({ type: 'signup', email: command.email, options: { emailRedirectTo: invitationRedirectTo } });
    if (error) return response(409, 'INVITATION_NOT_SENT', 'The invitation could not be sent.');
    return response(200, 'INVITATION_SENT', 'Invitation sent.');
  }

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(command.email, {
    data: { invitation_organization_id: command.organizationId },
    redirectTo: invitationRedirectTo,
  });
  if (inviteError || !invited.user) {
    return response(409, 'INVITATION_NOT_CREATED', 'The invitation could not be created.');
  }

  const { data: membershipId, error: membershipError } = await admin.rpc('trusted_set_membership', {
    p_actor_user_id: actor.id,
    p_user_id: invited.user.id,
    p_tenant_id: command.tenantId,
    p_organization_id: command.organizationId,
    p_role: command.role,
    p_status: 'invited',
    p_delete: false,
  });

  if (membershipError) {
    // Compensate the newly-created Auth identity. Never leave an unscoped invited identity behind.
    await admin.auth.admin.deleteUser(invited.user.id, false);
    return response(403, 'INVITATION_DENIED', 'The invitation is not permitted for this organization.');
  }

  return response(201, 'INVITATION_CREATED', 'Invitation created.', { membershipId, correlationId });
});
