import { useMemo, useState } from 'react';
import { CheckCircle, Clock, Download, Mail, Plus, Search, Users, XCircle } from 'lucide-react';
import { PageLayout } from '../../shared/PageLayout';
import { DataTable } from '../../shared/DataTable';
import { StatusBadge } from '../../shared/StatusBadge';
import { Button } from '../../ui/button';
import { FormDrawer } from '../../shared/FormDrawer';
import { FormField, Input } from '../../ui/form';
import { useToast } from '../../ui/toast';
import { useOrganization } from '../../../contexts/organizationContextValue';
import { inviteMember } from '../../../security/identityAdministration';
import {
  useOrganizationMemberships,
  type OrganizationMembership,
} from '../../../security/organizationMemberships';

const ROLE_LABELS = {
  employee: 'Employee',
  org_admin: 'Organization Admin',
  platform_admin: 'Platform Admin',
} as const;
const STATUS_LABELS = { invited: 'Invited', active: 'Active', inactive: 'Inactive' } as const;

interface MemberRow extends OrganizationMembership {
  name: string;
  roleLabel: string;
  statusLabel: string;
  departmentLabel: string;
}

export function toMembershipRow(member: OrganizationMembership): MemberRow {
  return {
    ...member,
    name: member.displayName?.trim() || member.email,
    roleLabel: ROLE_LABELS[member.role],
    statusLabel: STATUS_LABELS[member.status],
    departmentLabel: member.department?.trim() || '—',
  };
}

export function A04Members() {
  const { activeMembership } = useOrganization();
  const scope = useMemo(() => activeMembership ? {
    tenantId: activeMembership.tenantId,
    organizationId: activeMembership.organizationId,
  } : null, [activeMembership?.tenantId, activeMembership?.organizationId]);
  const { memberships, loading, error, refresh } = useOrganizationMemberships(scope);
  const { showToast } = useToast();
  const members = memberships.map(toMembershipRow);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [memberForm, setMemberForm] = useState({ email: '', role: '' });

  const resetForm = () => setMemberForm({ email: '', role: '' });

  const handleInviteMember = async () => {
    const email = memberForm.email.trim().toLowerCase();
    if (!email || !memberForm.role || !activeMembership) {
      showToast('error', 'Please fill in all required fields');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('error', 'Please enter a valid email address');
      return;
    }
    if (members.some((member) => member.email.toLowerCase() === email)) {
      showToast('error', 'A membership already exists for this email');
      return;
    }

    setIsSubmitting(true);
    try {
      await inviteMember({
        email,
        role: memberForm.role as 'employee' | 'org_admin',
        tenantId: activeMembership.tenantId,
        organizationId: activeMembership.organizationId,
      });
      await refresh();
      setIsInviteOpen(false);
      resetForm();
      showToast('success', `Invitation sent to ${email}`);
    } catch {
      showToast('error', 'Invitation could not be sent. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    const query = searchQuery.toLowerCase();
    return (!query || member.name.toLowerCase().includes(query) || member.email.toLowerCase().includes(query))
      && (filterRole === 'all' || member.role === filterRole)
      && (filterDepartment === 'all' || member.departmentLabel === filterDepartment)
      && (filterStatus === 'all' || member.status === filterStatus);
  });
  const uniqueDepartments = Array.from(new Set(members.map((member) => member.departmentLabel))).sort();
  const activeCount = members.filter((member) => member.status === 'active').length;
  const invitedCount = members.filter((member) => member.status === 'invited').length;
  const adminCount = members.filter((member) => member.role === 'org_admin').length;

  const statusBadge = (member: MemberRow) => {
    const config = member.status === 'active'
      ? { type: 'success' as const, icon: CheckCircle }
      : member.status === 'invited'
        ? { type: 'warning' as const, icon: Clock }
        : { type: 'neutral' as const, icon: XCircle };
    return <StatusBadge type={config.type}><config.icon className="mr-1 h-3 w-3" />{member.statusLabel}</StatusBadge>;
  };

  const columns = [
    {
      key: 'name', header: 'Member', width: '35%', cell: (value: string, row: MemberRow) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {(row.displayName?.[0] || row.email[0] || '?').toUpperCase()}
          </div>
          <div><div className="font-medium">{value}</div>{row.displayName && <div className="text-xs text-muted-foreground">{row.email}</div>}</div>
        </div>
      ),
    },
    { key: 'roleLabel', header: 'Membership Role', width: '25%' },
    { key: 'departmentLabel', header: 'Department', width: '20%' },
    { key: 'statusLabel', header: 'Status', width: '20%', cell: (_: string, row: MemberRow) => statusBadge(row) },
  ];

  const handleExportToCSV = () => {
    const rows = filteredMembers.map((member) => [member.name, member.email, member.roleLabel, member.departmentLabel, member.statusLabel]);
    const csv = [['Member', 'Email', 'Membership Role', 'Department', 'Status'], ...rows]
      .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    link.download = `members_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('success', `Exported ${filteredMembers.length} memberships`);
  };

  return (
    <PageLayout
      title="Memberships & Invitations"
      description="Organization memberships, roles, and invitation status"
      actions={<div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleExportToCSV}><Download className="mr-2 h-4 w-4" />Export</Button>
        <Button size="sm" onClick={() => setIsInviteOpen(true)}><Plus className="mr-2 h-4 w-4" />Invite Member</Button>
      </div>}
      kpis={[
        { title: 'Total Members', value: loading ? '…' : members.length.toString(), icon: <Users className="h-5 w-5" /> },
        { title: 'Active', value: loading ? '…' : activeCount.toString(), icon: <CheckCircle className="h-5 w-5" /> },
        { title: 'Invited', value: loading ? '…' : invitedCount.toString(), icon: <Mail className="h-5 w-5" /> },
        { title: 'Organization Admins', value: loading ? '…' : adminCount.toString(), icon: <Users className="h-5 w-5" /> },
      ]}
    >
      <div className="mb-6 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative min-w-[200px] max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search by name or email..." className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-4 text-sm" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
          </div>
          <select className="rounded-md border border-border bg-background px-3 py-2 text-sm" value={filterRole} onChange={(event) => setFilterRole(event.target.value)}>
            <option value="all">All Roles</option><option value="employee">Employee</option><option value="org_admin">Organization Admin</option>
            {members.some((member) => member.role === 'platform_admin') && <option value="platform_admin">Platform Admin</option>}
          </select>
          <select className="rounded-md border border-border bg-background px-3 py-2 text-sm" value={filterDepartment} onChange={(event) => setFilterDepartment(event.target.value)}>
            <option value="all">All Departments</option>{uniqueDepartments.map((department) => <option key={department} value={department}>{department}</option>)}
          </select>
          <select className="rounded-md border border-border bg-background px-3 py-2 text-sm" value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
            <option value="all">All Statuses</option><option value="invited">Invited</option><option value="active">Active</option><option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">Organization Members <span className="text-sm font-normal text-muted-foreground">({filteredMembers.length})</span></h3>
        {loading ? <div className="py-12 text-center text-muted-foreground">Loading memberships…</div>
          : error ? <div className="py-12 text-center text-muted-foreground">Memberships could not be loaded. <Button variant="outline" size="sm" className="ml-2" onClick={() => void refresh()}>Retry</Button></div>
          : <DataTable columns={columns} data={filteredMembers} />}
      </div>

      <FormDrawer title="Invite New Member" isOpen={isInviteOpen} onClose={() => { setIsInviteOpen(false); resetForm(); }} onSubmit={handleInviteMember} isSubmitting={isSubmitting}>
        <div className="mb-4 space-y-1 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
          <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-blue-600" /><span className="text-sm font-medium">Invitation will be sent via email</span></div>
          <p className="ml-6 text-xs">The new member will receive instructions to join.</p>
        </div>
        <FormField label="Email Address"><Input type="email" placeholder="e.g. person@company.com" value={memberForm.email} onChange={(event) => setMemberForm((current) => ({ ...current, email: event.target.value }))} required /></FormField>
        <FormField label="Membership Role"><select className="w-full rounded-md border border-border bg-background px-3 py-2" value={memberForm.role} onChange={(event) => setMemberForm((current) => ({ ...current, role: event.target.value }))} required>
          <option value="">Select role</option><option value="employee">Employee</option><option value="org_admin">Organization Admin</option>
        </select></FormField>
      </FormDrawer>
    </PageLayout>
  );
}
