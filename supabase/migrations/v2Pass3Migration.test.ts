import{readFileSync}from'node:fs';import{describe,expect,it}from'vitest';
const sql=readFileSync(new URL('./20260905000100_v2_trusted_application_operations.sql',import.meta.url),'utf8');
describe('V2 Pass 3 trusted operations',()=>{
 it('scopes contextual conversation references and validates participants',()=>{expect(sql).toContain('conversations_project_scope_fk');expect(sql).toContain('participant is not an active organization member');expect(sql).toContain('mention must be a conversation participant');});
 it('wires material domain notifications and governed pins',()=>{expect(sql).toContain('create trigger assignments_notify');expect(sql).toContain('create trigger task_status_notify');expect(sql).toContain('create trigger evidence_notify');expect(sql).toContain('create or replace function public.set_message_pin');});
 it('enforces evidence at the authoritative task and subtask boundary',()=>{expect(sql).toContain('create trigger tasks_required_evidence');expect(sql).toContain('create trigger subtasks_required_evidence');expect(sql).toContain('required approved evidence is missing');});
 it('uses RLS-filtered bounded search',()=>{expect(sql).toContain('security invoker');expect(sql).toContain('least(greatest(p_limit,1),50)');expect(sql).toContain('private.current_work_membership');});
 it('bounds automation to a trusted supported action and audits execution',()=>{expect(sql).toContain("rule.action_spec->>'type'<>'notification'");expect(sql).toContain('action requires a dedicated trusted domain operation');expect(sql).toContain("'automation.executed'");});
 it('forces RLS for evidence requirements and agent configuration',()=>{expect(sql).toContain('alter table public.evidence_requirements force row level security');expect(sql).toContain('alter table public.agent_configs force row level security');});
});
