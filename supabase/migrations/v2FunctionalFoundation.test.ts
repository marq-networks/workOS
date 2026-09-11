import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(new URL('./20260903000100_v2_functional_foundation.sql', import.meta.url), 'utf8');
const p7 = readFileSync(new URL('../tests/p7_1_work_rls.sql', import.meta.url), 'utf8');
const corrections = readFileSync(new URL('./20260904000100_v2_security_corrections.sql', import.meta.url), 'utf8');

describe('V2 functional database foundation', () => {
  it('models the execution hierarchy and effort-weighted progress', () => {
    for (const table of ['milestones', 'subtasks', 'work_assignments', 'task_dependencies']) {
      expect(migration).toContain(`create table public.${table}`);
    }
    expect(migration).toContain('dependency cycle is not allowed');
    expect(migration).toContain('coalesce(t.estimated_minutes,1)');
  });

  it('models people capacity, time, communication, evidence, and automation', () => {
    for (const table of ['skills', 'membership_skills', 'capacity_plans', 'work_sessions', 'time_entries',
      'conversations', 'messages', 'files', 'evidence_records', 'automation_rules', 'notifications']) {
      expect(migration).toContain(`create table public.${table}`);
    }
    expect(migration).not.toMatch(/screenshot|keystroke|mouse[_ ]monitor|productivity_score|payroll|billing/i);
  });

  it('forces RLS and does not use platform-wide membership helpers for operational policies', () => {
    expect(migration).toContain("execute format('alter table public.%I force row level security',t)");
    const policies = migration.slice(migration.indexOf('-- Organization-wide readable planning records'));
    expect(policies).not.toContain('public.is_active_member');
    expect(policies).not.toContain('public.is_org_admin');
    expect(policies).toContain('private.is_work_org_admin');
  });

  it('makes offline replay explicit and AI drafts reviewable', () => {
    expect(migration).toContain('idempotency_key uuid not null unique');
    expect(migration).toContain("'conflict','rejected'");
    expect(migration).toContain("status in('review','approved','rejected','applied')");
    expect(migration).toContain("create type public.ai_authority as enum ('read','draft','execute')");
  });

  it('keeps the P7 stale-write assertion as discrete SQL statements', () => {
    expect(p7).toContain("update public.tasks set progress=30\n  where id=");
    expect(p7).toContain('stale timestamp update deterministically preserves the stored row');
    expect(p7).not.toContain('with stale as (update');
  });

  it('prevents employee planning-field escalation and uses a trusted time review operation', () => {
    expect(corrections).toContain('employee may not alter task planning fields');
    expect(corrections).toContain("old.status not in ('draft','rejected')");
    expect(corrections).toContain('create or replace function public.review_time_entry');
    expect(corrections).toContain("grant execute on function public.review_time_entry");
    expect(corrections).toContain("'database_trigger'");
  });
});
