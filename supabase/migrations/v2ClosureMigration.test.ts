import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
const sql=readFileSync(new URL('./20260906000100_v2_functional_closure.sql',import.meta.url),'utf8');
describe('V2 closure migration',()=>{
 it('keeps Autopilot approval atomic, authorized and idempotent',()=>{expect(sql).toContain('idempotency_key uuid not null unique');expect(sql).toContain('private.require_work_admin(request.organization_id)');expect(sql).toContain("d.status<>'approved'");expect(sql).toContain("'ai.autopilot.materialized'");});
 it('requires scoped admin assignment and dependency mutations',()=>{expect(sql).toContain('active organization assignee required');expect(sql).toContain('scoped task references required');expect(sql).toContain('revision=p_expected_revision');});
 it('revalidates offline membership and preserves conflicts',()=>{expect(sql).toContain("failure_code='authorization_revoked'");expect(sql).toContain("status='conflict'");expect(sql).toContain("failure_code='unsupported_operation'");});
 it('makes deadline processing service-only',()=>{expect(sql).toContain("auth.role()<>'service_role'");expect(sql).toContain('grant execute on function public.process_deadline_notifications(date) to service_role');});
});
