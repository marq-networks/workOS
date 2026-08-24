import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, Building, CheckCircle, Loader2, Mail, Pencil, Plus, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { PageLayout } from '../../shared/PageLayout';
import { DataTable } from '../../shared/DataTable';
import { StatusBadge } from '../../shared/StatusBadge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  listPlatformOrganizations,
  listPlatformTenants,
  savePlatformOrganization,
  type PlatformOrganization,
  type PlatformTenant,
  type SaveOrganizationCommand,
} from '../../../platform/organizationAdministration';
import { invitePlatformOrgAdmin, resendPlatformOrgAdminInvitation } from '../../../security/identityAdministration';

interface OrganizationListProps {
  organizations: PlatformOrganization[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onEdit: (organization: PlatformOrganization) => void;
  onDeactivate: (organization: PlatformOrganization) => void;
  onInviteOrgAdmin: (organization: PlatformOrganization) => void;
  onRetry: () => void;
}

export function OrganizationList({ organizations, loading, error, searchQuery, onSearchChange, onEdit, onDeactivate, onInviteOrgAdmin, onRetry }: OrganizationListProps) {
  const filtered = organizations.filter((organization) =>
    [organization.name, organization.slug, organization.status, organization.tenantName]
      .some((value) => value.toLowerCase().includes(searchQuery.toLowerCase())),
  );
  const columns = [
    { key: 'name', header: 'Organization' },
    { key: 'slug', header: 'Slug' },
    { key: 'tenantName', header: 'Tenant' },
    { key: 'status', header: 'Status', cell: (value: string) => <StatusBadge type={value === 'active' ? 'success' : 'neutral'}>{value}</StatusBadge> },
    { key: 'actions', header: 'Actions', cell: (_: unknown, row: PlatformOrganization) => (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => onEdit(row)}><Pencil className="mr-1 h-3 w-3" />Edit</Button>
        {row.status === 'active' && <><Button size="sm" variant="outline" onClick={() => onInviteOrgAdmin(row)}><Mail className="mr-1 h-3 w-3" />Invite Org Admin</Button><Button size="sm" variant="outline" onClick={() => onDeactivate(row)}>Deactivate</Button></>}
      </div>
    ) },
  ];

  return <div className="space-y-6">
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search by organization, slug, tenant, or status" className="pl-10" />
      </div>
    </div>
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="mb-4 font-semibold">Organizations ({filtered.length})</h3>
      {loading ? <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Loading organizations…</div>
        : error ? <div className="py-12 text-center"><AlertCircle className="mx-auto mb-3 h-8 w-8 text-destructive" /><p>{error}</p><Button className="mt-4" variant="outline" onClick={onRetry}>Try again</Button></div>
        : filtered.length ? <DataTable columns={columns} data={filtered} />
          : <div className="py-12 text-center text-muted-foreground"><Building className="mx-auto mb-4 h-12 w-12 opacity-50" /><p className="text-lg font-medium">No organizations found</p><p className="text-sm">{searchQuery ? 'Try a different search term.' : 'Create the first organization using the trusted platform boundary.'}</p></div>}
    </div>
  </div>;
}

const emptyForm: SaveOrganizationCommand = { tenantId: '', name: '', slug: '', status: 'active' };

export function S02Organizations() {
  const [organizations, setOrganizations] = useState<PlatformOrganization[]>([]);
  const [tenants, setTenants] = useState<PlatformTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState<SaveOrganizationCommand>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [inviteOrganization, setInviteOrganization] = useState<PlatformOrganization | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitedEmail, setInvitedEmail] = useState<string | null>(null);
  const [invitationResent, setInvitationResent] = useState(false);
  const [inviteFeedback, setInviteFeedback] = useState<{ type: 'success' | 'error'; message: string; correlationId?: string } | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [nextOrganizations, nextTenants] = await Promise.all([listPlatformOrganizations(), listPlatformTenants()]);
      setOrganizations(nextOrganizations); setTenants(nextTenants);
    } catch { setOrganizations([]); setTenants([]); setError('Authoritative organization data could not be loaded.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  const activeCount = useMemo(() => organizations.filter((organization) => organization.status === 'active').length, [organizations]);
  const openCreate = () => { setForm({ ...emptyForm, tenantId: tenants[0]?.id ?? '' }); setFormError(null); setShowDialog(true); };
  const openEdit = (organization: PlatformOrganization) => { setForm({ tenantId: organization.tenantId, organizationId: organization.id, name: organization.name, slug: organization.slug, status: organization.status }); setFormError(null); setShowDialog(true); };
  const closeDialog = () => { if (!saving) setShowDialog(false); };
  const submit = async () => {
    if (!form.tenantId || !form.name.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) { setFormError('Tenant, organization name, and a lowercase hyphenated slug are required.'); return; }
    setSaving(true); setFormError(null);
    try {
      const result = await savePlatformOrganization({ ...form, name: form.name.trim() });
      await refresh();
      setShowDialog(false);
      toast.success('Organization persisted successfully.', { description: `Correlation ID: ${result.correlationId}`, icon: <CheckCircle className="h-4 w-4" /> });
    } catch { setFormError('The trusted organization operation failed. No success was recorded.'); }
    finally { setSaving(false); }
  };
  const deactivate = async (organization: PlatformOrganization) => {
    setSaving(true);
    try {
      const result = await savePlatformOrganization({ tenantId: organization.tenantId, organizationId: organization.id, name: organization.name, slug: organization.slug, status: 'deactivated' });
      await refresh();
      toast.success('Organization deactivated.', { description: `Correlation ID: ${result.correlationId}` });
    } catch { toast.error('Organization deactivation was denied or failed.'); }
    finally { setSaving(false); }
  };
  const openInvitation = (organization: PlatformOrganization) => {
    if (organization.status !== 'active') return;
    setInviteOrganization(organization); setInviteEmail(''); setInvitedEmail(null); setInvitationResent(false); setInviteFeedback(null);
  };
  const closeInvitation = () => { if (!saving) setInviteOrganization(null); };
  const sendInvitation = async (action: 'invite' | 'resend') => {
    if (!inviteOrganization || inviteOrganization.status !== 'active') return;
    const email = action === 'resend' ? invitedEmail : inviteEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInviteFeedback({ type: 'error', message: 'Enter a valid email address.' }); return;
    }
    setSaving(true); setInviteFeedback(null);
    try {
      const input = { email, tenantId: inviteOrganization.tenantId, organizationId: inviteOrganization.id };
      const result = action === 'invite' ? await invitePlatformOrgAdmin(input) : await resendPlatformOrgAdminInvitation(input);
      if (action === 'invite') setInvitedEmail(email);
      else setInvitationResent(true);
      setInviteFeedback({ type: 'success', message: action === 'invite' ? 'Invitation sent. You may resend it once before acceptance.' : 'Invitation resent successfully.', correlationId: result.correlationId });
    } catch {
      setInviteFeedback({ type: 'error', message: action === 'invite' ? 'The invitation could not be sent.' : 'The invitation could not be resent.' });
    } finally { setSaving(false); }
  };

  return <PageLayout title="Platform Organizations" description="Authoritative tenant organizations" actions={<Button onClick={openCreate} disabled={loading || saving || tenants.length === 0}><Plus className="mr-2 h-4 w-4" />Add Organization</Button>}
    kpis={[{ title: 'Total Organizations', value: organizations.length.toString(), change: 'Production records', changeType: 'neutral', icon: <Building className="h-5 w-5" /> }, { title: 'Active', value: activeCount.toString(), change: 'Production status', changeType: 'neutral', icon: <Building className="h-5 w-5" /> }]}>
    <OrganizationList organizations={organizations} loading={loading} error={error} searchQuery={searchQuery} onSearchChange={setSearchQuery} onEdit={openEdit} onDeactivate={(organization) => void deactivate(organization)} onInviteOrgAdmin={openInvitation} onRetry={() => void refresh()} />
    {showDialog && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeDialog}><div className="m-4 w-full max-w-md rounded-lg bg-card p-6 shadow-lg" onClick={(event) => event.stopPropagation()}>
      <div className="mb-6 flex items-center justify-between"><h2 className="text-2xl font-semibold">{form.organizationId ? 'Edit Organization' : 'Add Organization'}</h2><Button variant="ghost" size="sm" onClick={closeDialog}><X className="h-4 w-4" /></Button></div>
      <div className="space-y-4">
        <div><Label htmlFor="tenant">Tenant *</Label><select id="tenant" className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2" value={form.tenantId} disabled={Boolean(form.organizationId)} onChange={(event) => setForm({ ...form, tenantId: event.target.value })}><option value="">Select tenant</option>{tenants.map((tenant) => <option key={tenant.id} value={tenant.id}>{tenant.name} ({tenant.slug})</option>)}</select></div>
        <div><Label htmlFor="orgName">Organization name *</Label><Input id="orgName" className="mt-2" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></div>
        <div><Label htmlFor="orgSlug">Slug *</Label><Input id="orgSlug" className="mt-2" value={form.slug} placeholder="organization-slug" onChange={(event) => setForm({ ...form, slug: event.target.value })} /></div>
        <div><Label htmlFor="orgStatus">Status *</Label><select id="orgStatus" className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as SaveOrganizationCommand['status'] })}><option value="active">Active</option><option value="deactivated">Deactivated</option></select></div>
        {formError && <p role="alert" className="flex gap-2 text-sm text-red-600"><AlertCircle className="h-4 w-4" />{formError}</p>}
      </div>
      <div className="mt-6 flex gap-2"><Button variant="outline" className="flex-1" onClick={closeDialog} disabled={saving}>Cancel</Button><Button className="flex-1" onClick={() => void submit()} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{form.organizationId ? 'Save changes' : 'Create Organization'}</Button></div>
    </div></div>}
    {inviteOrganization && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeInvitation}><div role="dialog" aria-modal="true" aria-labelledby="invite-org-admin-title" className="m-4 w-full max-w-md rounded-lg bg-card p-6 shadow-lg" onClick={(event) => event.stopPropagation()}>
      <div className="mb-6 flex items-center justify-between"><h2 id="invite-org-admin-title" className="text-2xl font-semibold">Invite Org Admin</h2><Button variant="ghost" size="sm" onClick={closeInvitation} disabled={saving}><X className="h-4 w-4" /></Button></div>
      <div className="space-y-4">
        <div><Label htmlFor="inviteOrganization">Organization</Label><Input id="inviteOrganization" className="mt-2" value={inviteOrganization.name} readOnly /></div>
        <div><Label htmlFor="inviteRole">Role</Label><Input id="inviteRole" className="mt-2" value="Organization Admin" readOnly /><p className="mt-1 text-xs text-muted-foreground">Fixed role: org_admin</p></div>
        <div><Label htmlFor="inviteEmail">Email</Label><Input id="inviteEmail" className="mt-2" type="email" autoComplete="email" value={invitedEmail ?? inviteEmail} readOnly={Boolean(invitedEmail)} onChange={(event) => setInviteEmail(event.target.value)} /></div>
        {inviteFeedback && <div role={inviteFeedback.type === 'error' ? 'alert' : 'status'} className={`rounded-md p-3 text-sm ${inviteFeedback.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-green-50 text-green-800'}`}><p>{inviteFeedback.message}</p>{inviteFeedback.correlationId && <p className="mt-1 text-xs">Correlation ID: {inviteFeedback.correlationId}</p>}</div>}
      </div>
      <div className="mt-6 flex gap-2"><Button variant="outline" className="flex-1" onClick={closeInvitation} disabled={saving}>Close</Button>{invitedEmail ? <Button className="flex-1" onClick={() => void sendInvitation('resend')} disabled={saving || invitationResent}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{invitationResent ? 'Invitation resent' : 'Resend invitation'}</Button> : <Button className="flex-1" onClick={() => void sendInvitation('invite')} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Send invitation</Button>}</div>
    </div></div>}
  </PageLayout>;
}
