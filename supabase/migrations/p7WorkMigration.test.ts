import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
const sql=readFileSync(new URL('./20260902000100_p7_1_work_vertical_slice.sql',import.meta.url),'utf8');
describe('P7-1 migration contract',()=>{
  it('forces RLS and excludes platform admin from Work predicates',()=>{expect(sql).toContain('alter table public.projects force row level security');expect(sql).toContain('alter table public.tasks force row level security');const helper=sql.slice(sql.indexOf('private.is_work_org_admin'),sql.indexOf('alter table public.projects enable'));expect(helper).not.toContain("platform_admin");});
  it('has scoped foreign keys, lifecycle constraints, stale-write timestamps, and trusted audit',()=>{expect(sql).toContain('tasks_project_scope_fk');expect(sql).toContain('tasks_assignee_scope_fk');expect(sql).toContain('tasks_archive_consistency');expect(sql).toContain('new.updated_at := clock_timestamp()');expect(sql).toContain("'database_trigger'");});
  it('bounds employee mutations and validates active assignees',()=>{expect(sql).toContain('employee may update only task status and progress');expect(sql).toContain("m.status='active'");expect(sql).toContain('assignee must be an active organization member');});
});
