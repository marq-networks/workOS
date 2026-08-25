import type { MembershipRole } from './trustedOperations.ts';

export interface MembershipListRequest {
  action: 'list';
  tenantId: string;
  organizationId: string;
}

export interface ActorMembership {
  tenant_id: string;
  organization_id: string;
  role: MembershipRole;
  status: string;
  deleted_at: string | null;
}

export class MembershipListValidationError extends Error {}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseMembershipListRequest(value: unknown): MembershipListRequest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new MembershipListValidationError('A JSON request body is required.');
  }
  const input = value as Record<string, unknown>;
  if (input.action !== 'list' || typeof input.tenantId !== 'string' || typeof input.organizationId !== 'string') {
    throw new MembershipListValidationError('A list action and target scope are required.');
  }
  if (!UUID.test(input.tenantId) || !UUID.test(input.organizationId)) {
    throw new MembershipListValidationError('Valid tenant and organization identifiers are required.');
  }
  return { action: 'list', tenantId: input.tenantId, organizationId: input.organizationId };
}

export function authorizeMembershipList(
  memberships: ActorMembership[],
  target: MembershipListRequest,
): 'platform_admin' | 'org_admin' | null {
  const active = memberships.filter((membership) => membership.status === 'active' && membership.deleted_at === null);
  if (active.some((membership) => membership.role === 'platform_admin')) return 'platform_admin';
  return active.some((membership) =>
    membership.role === 'org_admin' &&
    membership.tenant_id === target.tenantId &&
    membership.organization_id === target.organizationId
  ) ? 'org_admin' : null;
}
