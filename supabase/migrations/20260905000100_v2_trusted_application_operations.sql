-- V2 Pass 3: trusted application operations layered on the existing foundation.
alter table public.conversations
  add constraint conversations_department_scope_fk foreign key(department_id,organization_id,tenant_id) references public.departments(id,organization_id,tenant_id),
  add constraint conversations_project_scope_fk foreign key(project_id,organization_id,tenant_id) references public.projects(id,organization_id,tenant_id),
  add constraint conversations_milestone_scope_fk foreign key(milestone_id,organization_id,tenant_id) references public.milestones(id,organization_id,tenant_id),
  add constraint conversations_task_scope_fk foreign key(task_id,organization_id,tenant_id) references public.tasks(id,organization_id,tenant_id),
  add constraint conversations_context_shape check(
    (kind='department')=(department_id is not null) and (kind='project')=(project_id is not null)
    and (kind='milestone')=(milestone_id is not null) and (kind='task')=(task_id is not null));
alter table public.messages add column pinned_at timestamptz, add column pinned_by uuid,
  add constraint messages_pinned_by_scope_fk foreign key(pinned_by,organization_id,tenant_id) references public.memberships(id,organization_id,tenant_id),
  add constraint messages_pin_consistency check((pinned_at is null)=(pinned_by is null));
alter table public.files
  add constraint files_project_scope_fk foreign key(project_id,organization_id,tenant_id) references public.projects(id,organization_id,tenant_id),
  add constraint files_task_scope_fk foreign key(task_id,organization_id,tenant_id) references public.tasks(id,organization_id,tenant_id),
  add constraint files_message_scope_fk foreign key(message_id,organization_id,tenant_id) references public.messages(id,organization_id,tenant_id),
  add constraint files_context_required check(project_id is not null or task_id is not null or message_id is not null);
alter table public.evidence_records
  add constraint evidence_subtask_scope_fk foreign key(subtask_id,organization_id,tenant_id) references public.subtasks(id,organization_id,tenant_id),
  add constraint evidence_file_scope_fk foreign key(file_id,organization_id,tenant_id) references public.files(id,organization_id,tenant_id),
  add constraint evidence_value_required check(file_id is not null or uri is not null or kind in('checklist','approval'));

create table public.evidence_requirements(
  id uuid primary key default extensions.gen_random_uuid(),tenant_id uuid not null,organization_id uuid not null,
  task_id uuid,subtask_id uuid,kind text not null check(kind in('file','photo','link','document','checklist','approval','external_work')),
  minimum_count smallint not null default 1 check(minimum_count between 1 and 20),created_by uuid not null references auth.users(id),created_at timestamptz not null default now(),
  foreign key(task_id,organization_id,tenant_id) references public.tasks(id,organization_id,tenant_id),
  foreign key(subtask_id,organization_id,tenant_id) references public.subtasks(id,organization_id,tenant_id),
  check((task_id is not null)::int+(subtask_id is not null)::int=1),unique(task_id,subtask_id,kind)
);
create table public.agent_configs(
  id uuid primary key default extensions.gen_random_uuid(),tenant_id uuid not null,organization_id uuid not null,
  agent_type text not null check(agent_type in('project_manager','risk','workload','reporting','knowledge','meeting','onboarding')),
  enabled boolean not null default false,authority public.ai_authority not null default 'read',project_id uuid,
  configured_by uuid not null references auth.users(id),revision bigint not null default 1,last_run_at timestamptz,last_status text,last_summary text,
  created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
  unique(id,organization_id,tenant_id),unique(organization_id,agent_type,project_id),
  foreign key(organization_id,tenant_id) references public.organizations(id,tenant_id),
  foreign key(project_id,organization_id,tenant_id) references public.projects(id,organization_id,tenant_id)
);
alter table public.evidence_requirements enable row level security; alter table public.evidence_requirements force row level security;
alter table public.agent_configs enable row level security; alter table public.agent_configs force row level security;
create policy evidence_requirements_member_read on public.evidence_requirements for select to authenticated using(
  private.is_work_org_admin(organization_id) or exists(select 1 from public.tasks t where t.id=task_id and private.is_assigned_work_member(t.assignee_membership_id,t.organization_id))
  or exists(select 1 from public.subtasks s join public.tasks t on t.id=s.task_id where s.id=subtask_id and private.is_assigned_work_member(t.assignee_membership_id,t.organization_id)));
create policy evidence_requirements_admin_write on public.evidence_requirements for all to authenticated using(private.is_work_org_admin(organization_id)) with check(private.is_work_org_admin(organization_id));
create policy agent_configs_admin on public.agent_configs for all to authenticated using(private.is_work_org_admin(organization_id)) with check(private.is_work_org_admin(organization_id));
revoke all on public.evidence_requirements,public.agent_configs from public,anon,authenticated;
grant select on public.evidence_requirements,public.agent_configs to authenticated;
grant insert,update,delete on public.evidence_requirements,public.agent_configs to authenticated;
create policy message_reactions_participant_read on public.message_reactions for select to authenticated using(exists(
 select 1 from public.messages msg join public.conversation_members cm on cm.conversation_id=msg.conversation_id
 join public.memberships m on m.id=cm.membership_id where msg.id=message_id and m.user_id=auth.uid() and m.status='active' and m.deleted_at is null and m.role<>'platform_admin'));
create policy message_mentions_participant_read on public.message_mentions for select to authenticated using(exists(
 select 1 from public.messages msg join public.conversation_members cm on cm.conversation_id=msg.conversation_id
 join public.memberships m on m.id=cm.membership_id where msg.id=message_id and m.user_id=auth.uid() and m.status='active' and m.deleted_at is null and m.role<>'platform_admin'));

create or replace function private.current_work_membership(p_organization_id uuid) returns uuid
language sql stable security definer set search_path=pg_catalog,public as $$
 select m.id from public.memberships m join public.organizations o on o.id=m.organization_id and o.tenant_id=m.tenant_id
 where m.user_id=auth.uid() and m.organization_id=p_organization_id and m.status='active' and m.deleted_at is null
   and m.role in('employee','org_admin') and o.status='active' limit 1
$$;
revoke all on function private.current_work_membership(uuid) from public,anon; grant execute on function private.current_work_membership(uuid) to authenticated;

create or replace function public.create_conversation(
 p_organization_id uuid,p_kind public.conversation_kind,p_title text,p_participants uuid[],
 p_department_id uuid default null,p_project_id uuid default null,p_milestone_id uuid default null,p_task_id uuid default null)
returns public.conversations language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare actor uuid; scope_tenant uuid; result public.conversations; participant uuid;
begin
 actor:=private.current_work_membership(p_organization_id); if actor is null then raise exception 'active Work membership required' using errcode='42501'; end if;
 select tenant_id into scope_tenant from public.memberships where id=actor;
 if p_kind='direct' and cardinality(array(select distinct unnest(p_participants||actor)))<>2 then raise exception 'direct conversation requires two participants' using errcode='22023'; end if;
 if exists(select 1 from unnest(p_participants||actor) x left join public.memberships m on m.id=x and m.organization_id=p_organization_id and m.tenant_id=scope_tenant and m.status='active' and m.deleted_at is null and m.role<>'platform_admin' where m.id is null)
 then raise exception 'participant is not an active organization member' using errcode='42501'; end if;
 insert into public.conversations(tenant_id,organization_id,kind,title,department_id,project_id,milestone_id,task_id,created_by)
 values(scope_tenant,p_organization_id,p_kind,nullif(trim(p_title),''),p_department_id,p_project_id,p_milestone_id,p_task_id,auth.uid()) returning * into result;
 foreach participant in array p_participants||actor loop insert into public.conversation_members(tenant_id,organization_id,conversation_id,membership_id)
   values(scope_tenant,p_organization_id,result.id,participant) on conflict do nothing; end loop;
 insert into public.audit_events(actor_user_id,tenant_id,organization_id,actor_role,action,target_type,target_id,source)
 select auth.uid(),scope_tenant,p_organization_id,m.role,'conversation.created','conversation',result.id,'database_trigger' from public.memberships m where m.id=actor;
 return result;
end$$;

create or replace function public.post_message(p_conversation_id uuid,p_body text,p_mentions uuid[] default '{}') returns public.messages
language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare actor uuid; convo public.conversations; result public.messages; mentioned uuid;
begin
 select * into convo from public.conversations where id=p_conversation_id; actor:=private.current_work_membership(convo.organization_id);
 if actor is null or not exists(select 1 from public.conversation_members where conversation_id=p_conversation_id and membership_id=actor) then raise exception 'conversation membership required' using errcode='42501'; end if;
 if length(trim(p_body)) not between 1 and 20000 then raise exception 'invalid message length' using errcode='22023'; end if;
 insert into public.messages(tenant_id,organization_id,conversation_id,author_membership_id,body) values(convo.tenant_id,convo.organization_id,convo.id,actor,trim(p_body)) returning * into result;
 foreach mentioned in array p_mentions loop
   if not exists(select 1 from public.conversation_members where conversation_id=convo.id and membership_id=mentioned) then raise exception 'mention must be a conversation participant' using errcode='42501'; end if;
   insert into public.message_mentions(message_id,membership_id) values(result.id,mentioned) on conflict do nothing;
   if mentioned<>actor then insert into public.notifications(tenant_id,organization_id,recipient_membership_id,kind,title,body,entity_type,entity_id)
     values(convo.tenant_id,convo.organization_id,mentioned,'mention','You were mentioned',left(trim(p_body),240),'message',result.id); end if;
 end loop; return result;
end$$;

create or replace function public.set_message_reaction(p_message_id uuid,p_emoji text,p_active boolean) returns boolean
language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare actor uuid; msg public.messages;
begin select * into msg from public.messages where id=p_message_id; actor:=private.current_work_membership(msg.organization_id);
 if actor is null or not exists(select 1 from public.conversation_members where conversation_id=msg.conversation_id and membership_id=actor) then raise exception 'conversation membership required' using errcode='42501'; end if;
 if length(p_emoji) not between 1 and 16 then raise exception 'invalid reaction' using errcode='22023'; end if;
 if p_active then insert into public.message_reactions(message_id,membership_id,emoji) values(p_message_id,actor,p_emoji) on conflict do nothing;
 else delete from public.message_reactions where message_id=p_message_id and membership_id=actor and emoji=p_emoji; end if; return p_active;
end$$;

create or replace function public.set_message_pin(p_message_id uuid,p_pinned boolean) returns public.messages
language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare actor uuid; msg public.messages; result public.messages;
begin select * into msg from public.messages where id=p_message_id; actor:=private.current_work_membership(msg.organization_id);
 if actor is null or not exists(select 1 from public.conversation_members where conversation_id=msg.conversation_id and membership_id=actor) then raise exception 'conversation membership required' using errcode='42501'; end if;
 if actor<>msg.author_membership_id and not private.is_work_org_admin(msg.organization_id) then raise exception 'message author or organization administrator required' using errcode='42501'; end if;
 update public.messages set pinned_at=case when p_pinned then clock_timestamp() else null end,pinned_by=case when p_pinned then actor else null end where id=p_message_id returning * into result;return result;
end$$;

create or replace function private.enforce_required_evidence() returns trigger language plpgsql security definer set search_path=pg_catalog,public as $$
begin
 if new.status='completed' and old.status<>'completed' and exists(
   select 1 from public.evidence_requirements r where (r.task_id=new.id or (tg_table_name='subtasks' and r.subtask_id=new.id))
   and (select count(*) from public.evidence_records e where e.status='approved' and e.kind=r.kind
     and ((r.task_id is not null and e.task_id=r.task_id) or (r.subtask_id is not null and e.subtask_id=r.subtask_id)))<r.minimum_count)
 then raise exception 'required approved evidence is missing' using errcode='23514'; end if; return new;
end$$;
create trigger tasks_required_evidence before update of status on public.tasks for each row execute function private.enforce_required_evidence();
create trigger subtasks_required_evidence before update of status on public.subtasks for each row execute function private.enforce_required_evidence();
create policy evidence_assignee_insert on public.evidence_records for insert to authenticated with check(
 exists(select 1 from public.tasks t where t.id=task_id and private.is_assigned_work_member(t.assignee_membership_id,t.organization_id))
 and submitted_by=private.current_work_membership(organization_id));

create or replace function private.notify_v2_domain_event() returns trigger language plpgsql security definer set search_path=pg_catalog,public as $$
declare recipient uuid; event_kind text; event_title text; target_type text; target_id uuid;
begin
 if tg_table_name='work_assignments' then recipient:=new.membership_id;event_kind:='assignment';event_title:='New work assignment';target_type:=case when new.task_id is null then 'subtask' else 'task' end;target_id:=coalesce(new.task_id,new.subtask_id);
 elsif tg_table_name='tasks' and new.status is distinct from old.status then recipient:=new.assignee_membership_id;event_kind:='status_change';event_title:='Task status changed';target_type:='task';target_id:=new.id;
 elsif tg_table_name='evidence_records' then select t.assignee_membership_id into recipient from public.tasks t where t.id=new.task_id;event_kind:='evidence';event_title:='Task evidence updated';target_type:='evidence';target_id:=new.id;
 elsif tg_table_name='time_entries' and new.status is distinct from old.status then recipient:=new.membership_id;event_kind:='time_correction';event_title:='Time entry review updated';target_type:='time_entry';target_id:=new.id;
 end if;
 if recipient is not null then insert into public.notifications(tenant_id,organization_id,recipient_membership_id,kind,title,entity_type,entity_id)
 values(new.tenant_id,new.organization_id,recipient,event_kind,event_title,target_type,target_id);end if;return new;
end$$;
create trigger assignments_notify after insert on public.work_assignments for each row execute function private.notify_v2_domain_event();
create trigger task_status_notify after update of status on public.tasks for each row execute function private.notify_v2_domain_event();
create trigger evidence_notify after insert or update of status on public.evidence_records for each row execute function private.notify_v2_domain_event();
create trigger time_review_notify after update of status on public.time_entries for each row execute function private.notify_v2_domain_event();

create or replace function public.search_work_os(p_organization_id uuid,p_query text,p_limit integer default 20)
returns table(entity_type text,entity_id uuid,title text,subtitle text,href text) language plpgsql security invoker set search_path=pg_catalog,public as $$
begin
 if private.current_work_membership(p_organization_id) is null then raise exception 'active Work membership required' using errcode='42501'; end if;
 return query select * from (
  select 'project',p.id,p.name,coalesce(p.description,''),'/work/projects/'||p.id from public.projects p where p.organization_id=p_organization_id and p.name ilike '%'||p_query||'%'
  union all select 'milestone',m.id,m.name,coalesce(m.description,''),'/work/milestones/'||m.id from public.milestones m where m.organization_id=p_organization_id and m.name ilike '%'||p_query||'%'
  union all select 'task',t.id,t.title,coalesce(t.description,''),'/work/tasks/'||t.id from public.tasks t where t.organization_id=p_organization_id and t.title ilike '%'||p_query||'%'
  union all select 'subtask',s.id,s.title,coalesce(s.description,''),'/work/tasks/'||s.task_id from public.subtasks s where s.organization_id=p_organization_id and s.title ilike '%'||p_query||'%'
  union all select 'message',m.id,left(m.body,120),'Conversation message','/communication/conversations/'||m.conversation_id from public.messages m where m.organization_id=p_organization_id and m.body ilike '%'||p_query||'%'
  union all select 'file',f.id,f.file_name,f.mime_type,'/knowledge/files/'||f.id from public.files f where f.organization_id=p_organization_id and f.deleted_at is null and f.file_name ilike '%'||p_query||'%'
  union all select 'person',w.id,coalesce(u.display_name,'Member'),coalesce(w.job_title,''),'/people/employees' from public.worker_profiles w join public.user_profiles u on u.user_id=w.user_id where w.organization_id=p_organization_id and (u.display_name ilike '%'||p_query||'%' or w.job_title ilike '%'||p_query||'%')
 ) result limit least(greatest(p_limit,1),50);
end$$;

create or replace function public.run_notification_automation(p_rule_id uuid,p_expected_revision bigint) returns public.automation_runs
language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare rule public.automation_rules; result public.automation_runs; recipient uuid;
begin select * into rule from public.automation_rules where id=p_rule_id and revision=p_expected_revision and private.is_work_org_admin(organization_id);
 if rule.id is null or rule.status<>'active' then raise exception 'active authorized rule required' using errcode='42501'; end if;
 if rule.action_spec->>'type'<>'notification' then raise exception 'action requires a dedicated trusted domain operation' using errcode='0A000'; end if;
 recipient:=(rule.action_spec->>'membership_id')::uuid;
 if not exists(select 1 from public.memberships where id=recipient and organization_id=rule.organization_id and status='active' and deleted_at is null and role<>'platform_admin') then raise exception 'invalid notification recipient' using errcode='42501'; end if;
 insert into public.automation_runs(tenant_id,organization_id,rule_id,status,input,output,approved_by,completed_at) values(rule.tenant_id,rule.organization_id,rule.id,'succeeded','{}',jsonb_build_object('notification',true),auth.uid(),now()) returning * into result;
 insert into public.notifications(tenant_id,organization_id,recipient_membership_id,kind,title,body,entity_type,entity_id) values(rule.tenant_id,rule.organization_id,recipient,'automation_result',coalesce(rule.action_spec->>'title',rule.name),rule.action_spec->>'body','automation_run',result.id);
 insert into public.audit_events(actor_user_id,tenant_id,organization_id,actor_role,action,target_type,target_id,source) values(auth.uid(),rule.tenant_id,rule.organization_id,'org_admin','automation.executed','automation_run',result.id,'database_trigger'); return result;
end$$;

revoke all on function public.create_conversation(uuid,public.conversation_kind,text,uuid[],uuid,uuid,uuid,uuid),public.post_message(uuid,text,uuid[]),public.set_message_reaction(uuid,text,boolean),public.set_message_pin(uuid,boolean),public.search_work_os(uuid,text,integer),public.run_notification_automation(uuid,bigint) from public,anon;
grant execute on function public.create_conversation(uuid,public.conversation_kind,text,uuid[],uuid,uuid,uuid,uuid),public.post_message(uuid,text,uuid[]),public.set_message_reaction(uuid,text,boolean),public.set_message_pin(uuid,boolean),public.search_work_os(uuid,text,integer),public.run_notification_automation(uuid,bigint) to authenticated;
grant insert on public.evidence_records to authenticated;
