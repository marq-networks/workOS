import type { MembershipRole } from './trustedOperations.ts';

export interface MembershipDeactivationRequest {
  action: 'deactivate';
  tenantId: string;
  organizationId: string;
  membershipId: string;
}

export interface DeactivationMembership {
  id?: string;
  tenant_id: string;
  organization_id: string;
  role: MembershipRole;
  status: string;
  deleted_at: string | null;
}

export class MembershipDeactivationValidationError extends Error {}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseMembershipDeactivationRequest(value: unknown): MembershipDeactivationRequest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new MembershipDeactivationValidationError('A JSON request body is required.');
  }
  const input = value as Record<string, unknown>;
  if (input.action !== 'deactivate' || typeof input.tenantId !== 'string'
    || typeof input.organizationId !== 'string' || typeof input.membershipId !== 'string'
    || !UUID.test(input.tenantId) || !UUID.test(input.organizationId) || !UUID.test(input.membershipId)) {
    throw new MembershipDeactivationValidationError('A valid deactivation target is required.');
  }
  return { action: 'deactivate', tenantId: input.tenantId, organizationId: input.organizationId, membershipId: input.membershipId };
}

export function authorizeMembershipDeactivation(
  actorMemberships: DeactivationMembership[],
  target: DeactivationMembership,
  request: MembershipDeactivationRequest,
): MembershipRole | null {
  if (target.id !== request.membershipId || target.tenant_id !== request.tenantId
    || target.organization_id !== request.organizationId || target.status !== 'active' || target.deleted_at !== null) return null;
  const active = actorMemberships.filter((membership) => membership.status === 'active' && membership.deleted_at === null);
  if (active.some((membership) => membership.role === 'platform_admin')) return 'platform_admin';
  return target.role === 'employee' && active.some((membership) => membership.role === 'org_admin'
    && membership.tenant_id === request.tenantId && membership.organization_id === request.organizationId)
    ? 'org_admin' : null;
}
