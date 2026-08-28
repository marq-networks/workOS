import { supabase } from '../../lib/supabase';
import type { LaunchRole, ValidatedMembership } from './types';
import { throwReportedServiceFailure } from '../../operations/serviceFailure';

interface MembershipRow {
  id: string;
  tenant_id: string;
  organization_id: string;
  role: LaunchRole;
  organizations: { name: string; slug: string } | { name: string; slug: string }[];
}

/**
 * Selects the signed-in user's rows from those authorized by RLS. The user_id filter limits the
 * result set for current-user context; it is selection only and is never authorization proof.
 */
export async function listCurrentMemberships(userId: string): Promise<ValidatedMembership[]> {
  const { data, error } = await supabase
    .from('memberships')
    .select('id, tenant_id, organization_id, role, organizations!inner(name, slug)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('created_at');

  if (error) throwReportedServiceFailure(error, 'membership_load_failed', 'Unable to load organization access.');

  return ((data ?? []) as MembershipRow[]).map((row) => {
    const organization = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;
    return {
      id: row.id,
      tenantId: row.tenant_id,
      organizationId: row.organization_id,
      organizationName: organization.name,
      organizationSlug: organization.slug,
      role: row.role,
    };
  });
}
