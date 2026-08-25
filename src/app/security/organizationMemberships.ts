import { useCallback, useEffect, useState } from 'react';
import type { LaunchRole } from './types';

export type OrganizationMembershipStatus = 'invited' | 'active' | 'inactive';

export interface OrganizationMembership {
  id: string;
  userId: string;
  email: string;
  displayName: string | null;
  role: LaunchRole;
  status: OrganizationMembershipStatus;
  organizationId: string;
  tenantId: string;
  createdAt: string | null;
  updatedAt: string | null;
  department: string | null;
}

export interface OrganizationMembershipScope {
  tenantId: string;
  organizationId: string;
}

export async function listOrganizationMemberships(scope: OrganizationMembershipScope): Promise<OrganizationMembership[]> {
  const { supabase } = await import('../../lib/supabase');
  const { data, error } = await supabase.functions.invoke('identity-administration', {
    body: { action: 'list', ...scope },
  });
  if (error || !Array.isArray(data?.memberships)) throw new Error('Memberships could not be loaded.');
  return data.memberships as OrganizationMembership[];
}

export function useOrganizationMemberships(scope: OrganizationMembershipScope | null) {
  const [memberships, setMemberships] = useState<OrganizationMembership[]>([]);
  const [loading, setLoading] = useState(Boolean(scope));
  const [error, setError] = useState(false);
  const refresh = useCallback(async () => {
    if (!scope) { setMemberships([]); setLoading(false); return; }
    setLoading(true);
    setError(false);
    try { setMemberships(await listOrganizationMemberships(scope)); }
    catch { setError(true); }
    finally { setLoading(false); }
  }, [scope?.tenantId, scope?.organizationId]);

  useEffect(() => { void refresh(); }, [refresh]);
  return { memberships, loading, error, refresh };
}
