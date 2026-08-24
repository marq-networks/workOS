import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { OrganizationList } from './S02Organizations';

vi.mock('../../../platform/organizationAdministration', () => ({
  listPlatformOrganizations: vi.fn(), listPlatformTenants: vi.fn(), savePlatformOrganization: vi.fn(),
}));

const props = { organizations: [], searchQuery: '', onSearchChange: vi.fn(), onEdit: vi.fn(), onDeactivate: vi.fn(), onInviteOrgAdmin: vi.fn(), onRetry: vi.fn() };

describe('canonical Platform Organizations screen', () => {
  it('renders loading, empty, and error states', () => {
    expect(renderToStaticMarkup(<OrganizationList {...props} loading error={null} />)).toContain('Loading organizations');
    expect(renderToStaticMarkup(<OrganizationList {...props} loading={false} error={null} />)).toContain('No organizations found');
    const errorMarkup = renderToStaticMarkup(<OrganizationList {...props} loading={false} error="Authoritative organization data could not be loaded." />);
    expect(errorMarkup).toContain('Authoritative organization data could not be loaded');
    expect(errorMarkup).toContain('Try again');
  });

  it('shows only production-supported organization fields', () => {
    const markup = renderToStaticMarkup(<OrganizationList {...props} loading={false} error={null} organizations={[{ id: 'org-1', tenantId: 'tenant-1', tenantName: 'MARQ', name: 'MARQ Networks', slug: 'marq-networks', status: 'active' }]} />);
    expect(markup).toContain('MARQ Networks');
    expect(markup).toContain('marq-networks');
    expect(markup).toContain('Deactivate');
    expect(markup).toContain('Invite Org Admin');
    expect(markup).not.toMatch(/MRR|Billing|Plan|Users|Trial/);
  });

  it('does not offer invitations or deactivation for a deactivated organization', () => {
    const markup = renderToStaticMarkup(<OrganizationList {...props} loading={false} error={null} organizations={[{ id: 'org-2', tenantId: 'tenant-1', tenantName: 'MARQ', name: 'Closed Org', slug: 'closed-org', status: 'deactivated' }]} />);
    expect(markup).not.toContain('Invite Org Admin');
    expect(markup).not.toContain('Deactivate</button>');
    expect(markup).toContain('Edit');
  });

  it('contains no fake fixtures, local persistence, or Finance fields', () => {
    const source = readFileSync(new URL('./S02Organizations.tsx', import.meta.url), 'utf8');
    expect(source).not.toMatch(/Acme Corp|TechStart|Global Enterprises|StartupHub|MegaCorp/);
    expect(source).not.toMatch(/localStorage|saved locally|MRR|billing|plan|user count/i);
  });

  it('binds the invitation dialog to a fixed organization and Org Admin role', () => {
    const source = readFileSync(new URL('./S02Organizations.tsx', import.meta.url), 'utf8');
    expect(source).toContain('value={inviteOrganization.name} readOnly');
    expect(source).toContain('value="Organization Admin" readOnly');
    expect(source).toContain('Fixed role: org_admin');
    expect(source).not.toMatch(/inviteRole[\s\S]{0,200}onChange/);
    expect(source).not.toMatch(/Employee role|Platform Admin role/);
  });
});
