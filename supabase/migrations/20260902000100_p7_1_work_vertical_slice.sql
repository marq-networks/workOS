-- P7-1: secure Project/Task production vertical slice.
create type public.work_project_status as enum ('active', 'on_hold', 'completed', 'archived');
create type public.work_task_status as enum ('todo', 'in_progress', 'blocked', 'completed', 'archived');

alter table public.memberships add constraint memberships_id_scope_unique
  unique (id, organization_id, tenant_id);

create table public.projects (
  id uuid primary key default extensions.gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid not null,
  name text not null check (length(trim(name)) between 1 and 160),
  description text check (description is null or length(description) <= 4000),
  status public.work_project_status not null default 'active',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint projects_organization_tenant_fk foreign key (organization_id, tenant_id)
    references public.organizations(id, tenant_id) on delete restrict,
  constraint projects_archive_consistency check ((status = 'archived') = (archived_at is not null)),
  unique (id, organization_id, tenant_id)
);
create index projects_scope_status on public.projects(organization_id, status, updated_at desc);

create table public.tasks (
  id uuid primary key default extensions.gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid not null,
  project_id uuid not null,
  title text not null check (length(trim(title)) between 1 and 240),
  description text check (description is null or length(description) <= 8000),
  status public.work_task_status not null default 'todo',
  progress smallint not null default 0 check (progress between 0 and 100),
  assignee_membership_id uuid not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint tasks_project_scope_fk foreign key (project_id, organization_id, tenant_id)
    references public.projects(id, organization_id, tenant_id) on delete restrict,
  constraint tasks_assignee_scope_fk foreign key (assignee_membership_id, organization_id, tenant_id)
    references public.memberships(id, organization_id, tenant_id) on delete restrict,
  constraint tasks_archive_consistency check ((status = 'archived') = (archived_at is not null)),
  constraint tasks_completed_progress check (status <> 'completed' or progress = 100)
);
create index tasks_scope_status on public.tasks(organization_id, status, updated_at desc);
create index tasks_assignee_active on public.tasks(assignee_membership_id, updated_at desc) where archived_at is null;
create index tasks_project on public.tasks(project_id, updated_at desc);

create or replace function private.is_work_org_admin(requested_organization_id uuid)
returns boolean language sql stable security definer set search_path=pg_catalog,public as $$
  select exists (select 1 from public.memberships m join public.organizations o
    on o.id=m.organization_id and o.tenant_id=m.tenant_id
    where m.user_id=auth.uid() and m.organization_id=requested_organization_id
      and m.role='org_admin' and m.status='active' and m.deleted_at is null and o.status='active')
$$;
create or replace function private.is_assigned_work_member(requested_membership_id uuid, requested_organization_id uuid)
returns boolean language sql stable security definer set search_path=pg_catalog,public as $$
  select exists (select 1 from public.memberships m join public.organizations o
    on o.id=m.organization_id and o.tenant_id=m.tenant_id
    where m.id=requested_membership_id and m.user_id=auth.uid()
      and m.organization_id=requested_organization_id and m.role='employee'
      and m.status='active' and m.deleted_at is null and o.status='active')
$$;
revoke all on function private.is_work_org_admin(uuid), private.is_assigned_work_member(uuid,uuid) from public, anon;
grant execute on function private.is_work_org_admin(uuid), private.is_assigned_work_member(uuid,uuid) to authenticated;

alter table public.projects enable row level security;
alter table public.projects force row level security;
alter table public.tasks enable row level security;
alter table public.tasks force row level security;
create policy projects_bounded_read on public.projects for select to authenticated using (
  private.is_work_org_admin(organization_id) or exists (
    select 1 from public.tasks t where t.project_id=projects.id
      and private.is_assigned_work_member(t.assignee_membership_id,t.organization_id)));
create policy projects_admin_insert on public.projects for insert to authenticated
  with check (private.is_work_org_admin(organization_id) and created_by=auth.uid());
create policy projects_admin_update on public.projects for update to authenticated
  using (private.is_work_org_admin(organization_id)) with check (private.is_work_org_admin(organization_id));
create policy tasks_bounded_read on public.tasks for select to authenticated using (
  private.is_work_org_admin(organization_id) or private.is_assigned_work_member(assignee_membership_id,organization_id));
create policy tasks_admin_insert on public.tasks for insert to authenticated
  with check (private.is_work_org_admin(organization_id) and created_by=auth.uid());
create policy tasks_admin_update on public.tasks for update to authenticated
  using (private.is_work_org_admin(organization_id) or private.is_assigned_work_member(assignee_membership_id,organization_id))
  with check (private.is_work_org_admin(organization_id) or private.is_assigned_work_member(assignee_membership_id,organization_id));

create or replace function private.enforce_and_audit_work_mutation() returns trigger
language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_role public.membership_role; v_action text; v_target text := tg_table_name;
begin
  -- Migration fixtures and reviewed server operations without a JWT are not browser authority.
  if auth.uid() is null then new.updated_at := clock_timestamp(); return new; end if;
  select m.role into v_role from public.memberships m where m.user_id=auth.uid()
    and m.organization_id=new.organization_id and m.status='active' and m.deleted_at is null
    and m.role in ('employee','org_admin') order by (m.role='org_admin') desc limit 1;
  if v_role is null then raise exception 'work membership required' using errcode='42501'; end if;
  if tg_table_name='tasks' then
    if not exists (select 1 from public.memberships m where m.id=new.assignee_membership_id
      and m.organization_id=new.organization_id and m.tenant_id=new.tenant_id and m.status='active'
      and m.deleted_at is null and m.role in ('employee','org_admin')) then
      raise exception 'assignee must be an active organization member' using errcode='23514';
    end if;
    if tg_op='UPDATE' and v_role='employee' and
      (new.tenant_id,new.organization_id,new.project_id,new.title,new.description,new.assignee_membership_id,
       new.created_by,new.created_at,new.archived_at) is distinct from
      (old.tenant_id,old.organization_id,old.project_id,old.title,old.description,old.assignee_membership_id,
       old.created_by,old.created_at,old.archived_at) then
      raise exception 'employee may update only task status and progress' using errcode='42501';
    end if;
  elsif v_role <> 'org_admin' then raise exception 'organization administrator required' using errcode='42501'; end if;
  new.updated_at := clock_timestamp();
  if v_role='org_admin' then
    v_action := case when tg_op='INSERT' then trim(trailing 's' from v_target)||'.created'
      when new.status::text='archived' and old.status::text<>'archived' then trim(trailing 's' from v_target)||'.archived'
      else trim(trailing 's' from v_target)||'.updated' end;
    insert into public.audit_events(actor_user_id,tenant_id,organization_id,actor_role,action,target_type,target_id,source,metadata)
      values(auth.uid(),new.tenant_id,new.organization_id,v_role,v_action,trim(trailing 's' from v_target),new.id,
        'database_trigger',jsonb_strip_nulls(jsonb_build_object('status',new.status,
          'assignee_membership_id',to_jsonb(new)->>'assignee_membership_id')));
  end if;
  return new;
end $$;
create trigger projects_enforce_audit before insert or update on public.projects
  for each row execute function private.enforce_and_audit_work_mutation();
create trigger tasks_enforce_audit before insert or update on public.tasks
  for each row execute function private.enforce_and_audit_work_mutation();

revoke all on public.projects, public.tasks from public, anon, authenticated;
grant select, insert on public.projects, public.tasks to authenticated;
grant update(name,description,status,archived_at,updated_at) on public.projects to authenticated;
grant update(title,description,status,progress,assignee_membership_id,archived_at,updated_at) on public.tasks to authenticated;
