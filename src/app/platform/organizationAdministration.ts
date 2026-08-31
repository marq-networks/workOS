import { captureOperationalError } from '../../observability/telemetry';

export type OrganizationStatus = 'active' | 'deactivated';

function serviceFailure(operation: string, message: string): Error {
  captureOperationalError(operation, 'service', new Error('trusted service failure'));
  return new Error(message);
}

export interface PlatformTenant {
  id: string;
  name: string;
  slug: string;
}

export interface PlatformOrganization {
  id: string;
  tenantId: string;
  tenantName: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
}

interface OrganizationRow {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
  tenants: { name: string } | { name: string }[];
}

export interface SaveOrganizationCommand {
  tenantId: string;
  organizationId?: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
}

export async function listPlatformTenants(): Promise<PlatformTenant[]> {
  const { supabase } = await import('../../lib/supabase');
  const { data, error } = await supabase.from('tenants').select('id, name, slug').order('name');
  if (error) throw serviceFailure('platform.tenants.list', 'Organizations could not be loaded.');
  return (data ?? []) as PlatformTenant[];
}

export async function listPlatformOrganizations(): Promise<PlatformOrganization[]> {
  const { supabase } = await import('../../lib/supabase');
  const { data, error } = await supabase
    .from('organizations')
    .select('id, tenant_id, name, slug, status, tenants!inner(name)')
    .order('name');
  if (error) throw serviceFailure('platform.organizations.list', 'Organizations could not be loaded.');

  return ((data ?? []) as OrganizationRow[]).map((row) => ({
    id: row.id,
    tenantId: row.tenant_id,
    tenantName: (Array.isArray(row.tenants) ? row.tenants[0] : row.tenants).name,
    name: row.name,
    slug: row.slug,
    status: row.status,
  }));
}

export async function savePlatformOrganization(command: SaveOrganizationCommand): Promise<{ organizationId: string; correlationId: string }> {
  // Supabase attaches the authenticated session JWT. Authorization and the service-role RPC call
  // remain inside the Edge Function; the browser never calls trusted_manage_organization directly.
  const { supabase } = await import('../../lib/supabase');
  const { data, error } = await supabase.functions.invoke('organization-administration', { body: command });
  if (error || !data?.organizationId || !data?.correlationId) {
    throw serviceFailure('platform.organization.save', 'The trusted organization operation was not completed.');
  }
  return { organizationId: data.organizationId, correlationId: data.correlationId };
}
