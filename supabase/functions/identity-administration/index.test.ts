import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('identity administration organization schema compatibility', () => {
  it('authorizes membership lists using real organization lifecycle columns', () => {
    const source = readFileSync(new URL('./index.ts', import.meta.url), 'utf8');
    const listOrganizationLookup = source.slice(
      source.indexOf("const { data: organization } = await admin\n      .from('organizations')"),
      source.indexOf('const { data: actorMemberships }', source.indexOf(".from('organizations')")),
    );

    expect(listOrganizationLookup).toContain(".eq('id', target.organizationId)");
    expect(listOrganizationLookup).toContain(".eq('tenant_id', target.tenantId)");
    expect(listOrganizationLookup).toContain(".eq('status', 'active')");
    expect(listOrganizationLookup).not.toContain('deleted_at');
    expect(source).toContain(".eq('organization_id', target.organizationId).is('deleted_at', null)");
  });

  it('loads the target and actor from backend rows then uses the trusted atomic deactivation RPC', () => {
    const source = readFileSync(new URL('./index.ts', import.meta.url), 'utf8');
    const branch = source.slice(source.indexOf("action === 'deactivate'"), source.indexOf("action === 'list'"));
    expect(branch).toContain(".from('memberships')");
    expect(branch).toContain(".eq('id', targetRequest.membershipId)");
    expect(branch).toContain(".eq('user_id', actor.id)");
    expect(branch).toContain("admin.rpc('trusted_deactivate_membership'");
    expect(branch).not.toContain('auth.admin.deleteUser');
  });
});
