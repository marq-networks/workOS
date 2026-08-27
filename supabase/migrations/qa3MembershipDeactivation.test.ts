import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const sql = readFileSync(new URL('./20260827000100_qa3_trusted_membership_deactivation.sql', import.meta.url), 'utf8');

describe('QA-3 trusted membership deactivation migration', () => {
  it('sets only membership authority inactive and retains the Auth identity', () => {
    expect(sql).toContain("set status = 'inactive'");
    expect(sql).not.toMatch(/auth\.users|delete\s+from/i);
  });

  it('re-authorizes active exact-scope actors and limits Org Admin targets to Employee', () => {
    expect(sql).toContain("m.status = 'active'");
    expect(sql).toContain('m.deleted_at is null');
    expect(sql).toContain('m.tenant_id = p_tenant_id');
    expect(sql).toContain('m.organization_id = p_organization_id');
    expect(sql).toContain("v_target.role = 'employee'");
  });

  it('writes correlated audit evidence atomically and exposes the function only to service_role', () => {
    expect(sql).toContain("'membership.deactivated'");
    expect(sql).toContain("'previous_status'");
    expect(sql).toContain("'new_status', 'inactive'");
    expect(sql).toContain('grant execute on function public.trusted_deactivate_membership');
    expect(sql).toContain('to service_role');
    expect(sql).toContain('from public, anon, authenticated');
  });
});
