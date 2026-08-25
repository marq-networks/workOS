import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { toMembershipRow } from './A04Members';

const source = readFileSync(new URL('./A04Members.tsx', import.meta.url), 'utf8');

describe('A04 membership screen', () => {
  it('renders real invited and active membership states without requiring a worker profile', () => {
    expect(toMembershipRow({
      id: 'membership-1', userId: 'user-1', email: 'person@example.com', displayName: null,
      role: 'employee', status: 'invited', organizationId: 'org-1', tenantId: 'tenant-1',
      createdAt: null, updatedAt: null, department: null,
    })).toMatchObject({ name: 'person@example.com', email: 'person@example.com', statusLabel: 'Invited', departmentLabel: '—' });
  });

  it('does not bind membership rows or mutations to the mock People service', () => {
    expect(source).not.toContain('usePeopleData');
    expect(source).not.toContain('deleteEmployee');
    expect(source).not.toMatch(/last.?seen|online now|individual contributors|managers/i);
  });

  it('refreshes after invite and uses the mounted ToastProvider API with bounded feedback', () => {
    expect(source).toContain('await refresh()');
    expect(source).toContain("showToast('success', `Invitation sent to ${email}`)");
    expect(source).toContain("showToast('error', 'Invitation could not be sent. Please try again.')");
    expect(source).not.toContain("from 'sonner'");
  });

  it('keeps Platform Admin absent from the Org Admin invite role selector', () => {
    const drawer = source.slice(source.indexOf('<FormDrawer'));
    expect(drawer).not.toContain('<option value="platform_admin">');
  });
});
