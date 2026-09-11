-- Work OS V2 functional foundation. Operational records are tenant scoped and never
-- inherit the Phase 5 platform-admin visibility helper.
create type public.work_priority as enum ('low','normal','high','urgent');
create type public.milestone_status as enum ('planned','active','blocked','completed','archived');
create type public.assignment_status as enum ('proposed','accepted','declined','completed');
create type public.time_entry_status as enum ('draft','submitted','approved','rejected','corrected');
create type public.conversation_kind as enum ('direct','channel','department','project','milestone','task');
create type public.ai_authority as enum ('read','draft','execute');
create type public.sync_status as enum ('queued','replaying','applied','conflict','rejected');

alter table public.projects add column priority public.work_priority not null default 'normal',
  add column start_date date, add column due_date date,
  add column owner_membership_id uuid, add column estimated_minutes integer check (estimated_minutes is null or estimated_minutes >= 0),
  add constraint projects_owner_scope_fk foreign key (owner_membership_id,organization_id,tenant_id)
    references public.memberships(id,organization_id,tenant_id) on delete restrict,
  add constraint projects_dates_valid check (due_date is null or start_date is null or due_date >= start_date);
alter table public.tasks add column priority public.work_priority not null default 'normal',
  add column start_date date, add column due_date date,
  add column estimated_minutes integer check (estimated_minutes is null or estimated_minutes >= 0),
  add column milestone_id uuid, add column revision bigint not null default 1,
  add constraint tasks_dates_valid check (due_date is null or start_date is null or due_date >= start_date);

create table public.milestones (
  id uuid primary key default extensions.gen_random_uuid(), tenant_id uuid not null, organization_id uuid not null,
  project_id uuid not null, name text not null check(length(trim(name)) between 1 and 200), description text,
  status public.milestone_status not null default 'planned', priority public.work_priority not null default 'normal',
  start_date date, due_date date, estimated_minutes integer check(estimated_minutes is null or estimated_minutes>=0),
  created_by uuid not null references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), archived_at timestamptz,
  unique(id,organization_id,tenant_id), foreign key(project_id,organization_id,tenant_id) references public.projects(id,organization_id,tenant_id),
  check(due_date is null or start_date is null or due_date>=start_date), check((status='archived')=(archived_at is not null))
);
alter table public.tasks add constraint tasks_milestone_scope_fk foreign key(milestone_id,organization_id,tenant_id) references public.milestones(id,organization_id,tenant_id);

create table public.subtasks (
  id uuid primary key default extensions.gen_random_uuid(), tenant_id uuid not null, organization_id uuid not null, task_id uuid not null,
  title text not null check(length(trim(title)) between 1 and 240), description text, status public.work_task_status not null default 'todo',
  priority public.work_priority not null default 'normal', progress smallint not null default 0 check(progress between 0 and 100),
  estimated_minutes integer check(estimated_minutes is null or estimated_minutes>=0), due_date date, revision bigint not null default 1,
  created_by uuid not null references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), archived_at timestamptz,
  unique(id,organization_id,tenant_id), foreign key(task_id,organization_id,tenant_id) references public.tasks(id,organization_id,tenant_id),
  check(status<>'completed' or progress=100), check((status='archived')=(archived_at is not null))
);
create table public.work_assignments (
  id uuid primary key default extensions.gen_random_uuid(), tenant_id uuid not null, organization_id uuid not null,
  task_id uuid, subtask_id uuid, membership_id uuid not null, status public.assignment_status not null default 'proposed',
  allocated_minutes integer check(allocated_minutes is null or allocated_minutes>=0), assigned_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  foreign key(task_id,organization_id,tenant_id) references public.tasks(id,organization_id,tenant_id),
  foreign key(subtask_id,organization_id,tenant_id) references public.subtasks(id,organization_id,tenant_id),
  foreign key(membership_id,organization_id,tenant_id) references public.memberships(id,organization_id,tenant_id),
  check((task_id is not null)::int+(subtask_id is not null)::int=1), unique(task_id,subtask_id,membership_id)
);
create table public.task_dependencies (
  id uuid primary key default extensions.gen_random_uuid(), tenant_id uuid not null, organization_id uuid not null,
  predecessor_task_id uuid not null, successor_task_id uuid not null, created_by uuid not null references auth.users(id), created_at timestamptz not null default now(),
  foreign key(predecessor_task_id,organization_id,tenant_id) references public.tasks(id,organization_id,tenant_id),
  foreign key(successor_task_id,organization_id,tenant_id) references public.tasks(id,organization_id,tenant_id),
  check(predecessor_task_id<>successor_task_id), unique(predecessor_task_id,successor_task_id)
);

create or replace function private.prevent_dependency_cycle() returns trigger language plpgsql set search_path=pg_catalog,public as $$
begin
  if exists(with recursive downstream(id) as (
    select new.successor_task_id union select d.successor_task_id from public.task_dependencies d join downstream x on d.predecessor_task_id=x.id
    where d.organization_id=new.organization_id) select 1 from downstream where id=new.predecessor_task_id)
  then raise exception 'dependency cycle is not allowed' using errcode='23514'; end if; return new;
end$$;
create trigger task_dependencies_no_cycle before insert or update on public.task_dependencies for each row execute function private.prevent_dependency_cycle();

-- Effort weighting: explicit estimated minutes; records without estimates have weight 1.
create view public.work_progress_rollups with (security_invoker=true) as
select p.organization_id,p.id project_id,m.id milestone_id,
  coalesce(round(sum(t.progress*greatest(coalesce(t.estimated_minutes,1),1))::numeric/nullif(sum(greatest(coalesce(t.estimated_minutes,1),1)),0)),0)::smallint progress
from public.projects p left join public.milestones m on m.project_id=p.id and m.archived_at is null
left join public.tasks t on t.project_id=p.id and (t.milestone_id=m.id or (m.id is null and t.milestone_id is null)) and t.archived_at is null
group by p.organization_id,p.id,m.id;

create table public.skills (id uuid primary key default extensions.gen_random_uuid(), tenant_id uuid not null, organization_id uuid not null,
  name text not null check(length(trim(name)) between 1 and 100), description text, created_at timestamptz not null default now(),
  unique(id,organization_id,tenant_id), unique(organization_id,name), foreign key(organization_id,tenant_id) references public.organizations(id,tenant_id));
create table public.membership_skills (tenant_id uuid not null, organization_id uuid not null, membership_id uuid not null, skill_id uuid not null,
  proficiency smallint not null default 1 check(proficiency between 1 and 5), verified_at timestamptz, primary key(membership_id,skill_id),
  foreign key(membership_id,organization_id,tenant_id) references public.memberships(id,organization_id,tenant_id),
  foreign key(skill_id,organization_id,tenant_id) references public.skills(id,organization_id,tenant_id));
create table public.capacity_plans (id uuid primary key default extensions.gen_random_uuid(),tenant_id uuid not null,organization_id uuid not null,membership_id uuid not null,
  starts_on date not null,ends_on date not null,available_minutes integer not null check(available_minutes>=0),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
  foreign key(membership_id,organization_id,tenant_id) references public.memberships(id,organization_id,tenant_id),check(ends_on>=starts_on));

create table public.work_sessions (id uuid primary key default extensions.gen_random_uuid(),tenant_id uuid not null,organization_id uuid not null,membership_id uuid not null,
  project_id uuid,task_id uuid,started_at timestamptz not null,ended_at timestamptz,notes text,revision bigint not null default 1,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
  unique(id,organization_id,tenant_id),foreign key(membership_id,organization_id,tenant_id) references public.memberships(id,organization_id,tenant_id),
  foreign key(project_id,organization_id,tenant_id) references public.projects(id,organization_id,tenant_id),foreign key(task_id,organization_id,tenant_id) references public.tasks(id,organization_id,tenant_id),check(ended_at is null or ended_at>=started_at));
create unique index one_active_work_session on public.work_sessions(membership_id) where ended_at is null;
create table public.time_entries (id uuid primary key default extensions.gen_random_uuid(),tenant_id uuid not null,organization_id uuid not null,membership_id uuid not null,
  project_id uuid,task_id uuid,work_session_id uuid,started_at timestamptz not null,ended_at timestamptz not null,status public.time_entry_status not null default 'draft',notes text,revision bigint not null default 1,
  reviewed_by uuid references auth.users(id),reviewed_at timestamptz,correction_of uuid references public.time_entries(id),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
  foreign key(membership_id,organization_id,tenant_id) references public.memberships(id,organization_id,tenant_id),foreign key(project_id,organization_id,tenant_id) references public.projects(id,organization_id,tenant_id),
  foreign key(task_id,organization_id,tenant_id) references public.tasks(id,organization_id,tenant_id),foreign key(work_session_id,organization_id,tenant_id) references public.work_sessions(id,organization_id,tenant_id),check(ended_at>started_at));

create table public.conversations (id uuid primary key default extensions.gen_random_uuid(),tenant_id uuid not null,organization_id uuid not null,kind public.conversation_kind not null,
  title text,department_id uuid,project_id uuid,milestone_id uuid,task_id uuid,created_by uuid not null references auth.users(id),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
  unique(id,organization_id,tenant_id),foreign key(organization_id,tenant_id) references public.organizations(id,tenant_id));
create table public.conversation_members (tenant_id uuid not null,organization_id uuid not null,conversation_id uuid not null,membership_id uuid not null,joined_at timestamptz not null default now(),last_read_at timestamptz,
  primary key(conversation_id,membership_id),foreign key(conversation_id,organization_id,tenant_id) references public.conversations(id,organization_id,tenant_id),foreign key(membership_id,organization_id,tenant_id) references public.memberships(id,organization_id,tenant_id));
create table public.messages (id uuid primary key default extensions.gen_random_uuid(),tenant_id uuid not null,organization_id uuid not null,conversation_id uuid not null,author_membership_id uuid,
  kind text not null default 'user' check(kind in('user','system')),body text not null check(length(body) between 1 and 20000),reply_to uuid references public.messages(id),created_at timestamptz not null default now(),edited_at timestamptz,deleted_at timestamptz,
  unique(id,organization_id,tenant_id),foreign key(conversation_id,organization_id,tenant_id) references public.conversations(id,organization_id,tenant_id),foreign key(author_membership_id,organization_id,tenant_id) references public.memberships(id,organization_id,tenant_id));
create table public.message_reactions (message_id uuid references public.messages(id) on delete cascade,membership_id uuid references public.memberships(id),emoji text not null check(length(emoji)<=16),created_at timestamptz not null default now(),primary key(message_id,membership_id,emoji));
create table public.message_mentions (message_id uuid references public.messages(id) on delete cascade,membership_id uuid references public.memberships(id),primary key(message_id,membership_id));

create table public.files (id uuid primary key default extensions.gen_random_uuid(),tenant_id uuid not null,organization_id uuid not null,storage_bucket text not null,storage_path text not null,
  file_name text not null,mime_type text,size_bytes bigint not null check(size_bytes>=0),uploaded_by uuid not null,project_id uuid,task_id uuid,message_id uuid,created_at timestamptz not null default now(),deleted_at timestamptz,
  unique(id,organization_id,tenant_id),unique(storage_bucket,storage_path),foreign key(uploaded_by,organization_id,tenant_id) references public.memberships(id,organization_id,tenant_id));
create table public.evidence_records (id uuid primary key default extensions.gen_random_uuid(),tenant_id uuid not null,organization_id uuid not null,task_id uuid not null,subtask_id uuid,
  kind text not null check(kind in('file','photo','link','document','checklist','approval','external_work')),file_id uuid references public.files(id),uri text,summary text,submitted_by uuid not null,status text not null default 'submitted' check(status in('submitted','approved','rejected')),
  created_at timestamptz not null default now(),reviewed_at timestamptz,foreign key(task_id,organization_id,tenant_id) references public.tasks(id,organization_id,tenant_id),foreign key(submitted_by,organization_id,tenant_id) references public.memberships(id,organization_id,tenant_id));

create table public.automation_rules (id uuid primary key default extensions.gen_random_uuid(),tenant_id uuid not null,organization_id uuid not null,name text not null,status text not null check(status in('draft','active','paused','archived')),
  trigger_spec jsonb not null,condition_spec jsonb not null default '{}'::jsonb,action_spec jsonb not null,requires_approval boolean not null default true,revision bigint not null default 1,created_by uuid not null references auth.users(id),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
  unique(id,organization_id,tenant_id),foreign key(organization_id,tenant_id) references public.organizations(id,tenant_id));
create table public.automation_runs (id uuid primary key default extensions.gen_random_uuid(),tenant_id uuid not null,organization_id uuid not null,rule_id uuid not null,status text not null check(status in('pending_approval','running','succeeded','failed','rejected')),input jsonb not null default '{}',output jsonb,approved_by uuid references auth.users(id),created_at timestamptz not null default now(),completed_at timestamptz,foreign key(rule_id,organization_id,tenant_id) references public.automation_rules(id,organization_id,tenant_id));
create table public.notifications (id uuid primary key default extensions.gen_random_uuid(),tenant_id uuid not null,organization_id uuid not null,recipient_membership_id uuid not null,kind text not null,title text not null,body text,entity_type text,entity_id uuid,created_at timestamptz not null default now(),read_at timestamptz,
  foreign key(recipient_membership_id,organization_id,tenant_id) references public.memberships(id,organization_id,tenant_id));

create table public.offline_mutations (id uuid primary key,idempotency_key uuid not null unique,tenant_id uuid not null,organization_id uuid not null,membership_id uuid not null,
  entity_type text not null,entity_id uuid,operation text not null,payload jsonb not null,base_revision bigint,client_created_at timestamptz not null,status public.sync_status not null default 'queued',conflict jsonb,failure_code text,server_applied_at timestamptz,created_at timestamptz not null default now(),
  foreign key(membership_id,organization_id,tenant_id) references public.memberships(id,organization_id,tenant_id));
create table public.ai_requests (id uuid primary key default extensions.gen_random_uuid(),tenant_id uuid not null,organization_id uuid not null,requested_by uuid not null,authority public.ai_authority not null,
  capability text not null,input jsonb not null,context_refs jsonb not null default '[]',status text not null default 'configuration_required' check(status in('configuration_required','queued','running','completed','failed','cancelled')),provider text,created_at timestamptz not null default now(),completed_at timestamptz,
  unique(id,organization_id,tenant_id),foreign key(requested_by,organization_id,tenant_id) references public.memberships(id,organization_id,tenant_id));
create table public.ai_drafts (id uuid primary key default extensions.gen_random_uuid(),tenant_id uuid not null,organization_id uuid not null,request_id uuid not null,draft_type text not null,payload jsonb not null,status text not null default 'review' check(status in('review','approved','rejected','applied')),approved_by uuid references auth.users(id),created_at timestamptz not null default now(),
  foreign key(request_id,organization_id,tenant_id) references public.ai_requests(id,organization_id,tenant_id));
create table public.agent_runs (id uuid primary key default extensions.gen_random_uuid(),tenant_id uuid not null,organization_id uuid not null,agent_type text not null check(agent_type in('project_manager','risk','workload','reporting','knowledge','meeting','onboarding')),request_id uuid references public.ai_requests(id),status text not null,authority public.ai_authority not null default 'read',created_at timestamptz not null default now(),completed_at timestamptz);

-- All operational RLS uses Work-specific membership predicates: platform role alone grants nothing.
do $$ declare t text; begin foreach t in array array['milestones','subtasks','work_assignments','task_dependencies','skills','membership_skills','capacity_plans','work_sessions','time_entries','conversations','conversation_members','messages','message_reactions','message_mentions','files','evidence_records','automation_rules','automation_runs','notifications','offline_mutations','ai_requests','ai_drafts','agent_runs'] loop
  execute format('alter table public.%I enable row level security',t); execute format('alter table public.%I force row level security',t);
end loop; end$$;

-- Organization-wide readable planning records; mutations remain admin-only unless narrowed below.
do $$ declare t text; begin foreach t in array array['milestones','subtasks','work_assignments','task_dependencies','skills','membership_skills','capacity_plans','files','evidence_records'] loop
 execute format('create policy %I on public.%I for select to authenticated using (private.is_work_org_admin(organization_id) or exists(select 1 from public.memberships m where m.user_id=auth.uid() and m.organization_id=%I.organization_id and m.status=''active'' and m.deleted_at is null and m.role<>''platform_admin''))',t||'_member_read',t,t);
 execute format('create policy %I on public.%I for all to authenticated using (private.is_work_org_admin(organization_id)) with check (private.is_work_org_admin(organization_id))',t||'_admin_write',t);
end loop; end$$;
create policy work_sessions_owner_read on public.work_sessions for select to authenticated using(private.is_work_org_admin(organization_id) or private.is_assigned_work_member(membership_id,organization_id));
create policy work_sessions_owner_write on public.work_sessions for all to authenticated using(private.is_work_org_admin(organization_id) or private.is_assigned_work_member(membership_id,organization_id)) with check(private.is_work_org_admin(organization_id) or private.is_assigned_work_member(membership_id,organization_id));
create policy time_entries_owner_read on public.time_entries for select to authenticated using(private.is_work_org_admin(organization_id) or private.is_assigned_work_member(membership_id,organization_id));
create policy time_entries_owner_write on public.time_entries for all to authenticated using(private.is_work_org_admin(organization_id) or private.is_assigned_work_member(membership_id,organization_id)) with check(private.is_work_org_admin(organization_id) or private.is_assigned_work_member(membership_id,organization_id));
create policy conversations_participant_read on public.conversations for select to authenticated using(private.is_work_org_admin(organization_id) or exists(select 1 from public.conversation_members cm join public.memberships m on m.id=cm.membership_id where cm.conversation_id=conversations.id and m.user_id=auth.uid() and m.status='active' and m.deleted_at is null));
create policy conversation_members_self_read on public.conversation_members for select to authenticated using(private.is_work_org_admin(organization_id) or private.is_assigned_work_member(membership_id,organization_id));
create policy messages_participant_read on public.messages for select to authenticated using(exists(select 1 from public.conversation_members cm join public.memberships m on m.id=cm.membership_id where cm.conversation_id=messages.conversation_id and m.user_id=auth.uid() and m.status='active' and m.deleted_at is null and m.role<>'platform_admin'));
create policy notifications_recipient on public.notifications for select to authenticated using(private.is_assigned_work_member(recipient_membership_id,organization_id) or private.is_work_org_admin(organization_id));
create policy offline_owner on public.offline_mutations for select to authenticated using(private.is_assigned_work_member(membership_id,organization_id));
create policy offline_owner_enqueue on public.offline_mutations for insert to authenticated with check(
  private.is_assigned_work_member(membership_id,organization_id) and status='queued' and server_applied_at is null);
create policy ai_request_owner on public.ai_requests for select to authenticated using(private.is_work_org_admin(organization_id) or private.is_assigned_work_member(requested_by,organization_id));
create policy ai_request_safe_create on public.ai_requests for insert to authenticated with check(
  (private.is_work_org_admin(organization_id) or private.is_assigned_work_member(requested_by,organization_id))
  and authority in ('read','draft') and status='configuration_required' and provider is null);
create policy ai_draft_admin on public.ai_drafts for select to authenticated using(private.is_work_org_admin(organization_id));
create policy automation_admin on public.automation_rules for select to authenticated using(private.is_work_org_admin(organization_id));
create policy automation_runs_admin on public.automation_runs for select to authenticated using(private.is_work_org_admin(organization_id));

create index milestones_project_due on public.milestones(project_id,due_date); create index subtasks_task on public.subtasks(task_id,status);
create index dependencies_successor on public.task_dependencies(successor_task_id); create index assignments_member on public.work_assignments(membership_id,status);
create index time_entries_member_time on public.time_entries(membership_id,started_at desc); create index messages_conversation_time on public.messages(conversation_id,created_at desc);
create index notifications_unread on public.notifications(recipient_membership_id,created_at desc) where read_at is null;

revoke all on public.work_progress_rollups from public,anon; grant select on public.work_progress_rollups to authenticated;
do $$ declare t text; begin foreach t in array array['milestones','subtasks','work_assignments','task_dependencies','skills','membership_skills','capacity_plans','work_sessions','time_entries','conversations','conversation_members','messages','message_reactions','message_mentions','files','evidence_records','automation_rules','automation_runs','notifications','offline_mutations','ai_requests','ai_drafts','agent_runs'] loop
 execute format('revoke all on public.%I from public,anon,authenticated',t); execute format('grant select on public.%I to authenticated',t);
end loop; end$$;
grant insert,update,delete on public.milestones,public.subtasks,public.work_assignments,public.task_dependencies,
  public.skills,public.membership_skills,public.capacity_plans,public.files,public.evidence_records to authenticated;
grant insert,update on public.work_sessions,public.time_entries to authenticated;
grant insert on public.offline_mutations,public.ai_requests to authenticated;
grant update(priority,start_date,due_date,owner_membership_id,estimated_minutes,updated_at) on public.projects to authenticated;
grant update(priority,start_date,due_date,estimated_minutes,milestone_id,revision,updated_at) on public.tasks to authenticated;
