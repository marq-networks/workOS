-- Correct V2 browser mutation boundaries discovered during application-layer wiring.
-- Platform administration still grants no implicit operational access.

create or replace function private.enforce_v2_task_fields() returns trigger
language plpgsql security definer set search_path=pg_catalog,public,private as $$
begin
  if auth.uid() is not null and private.is_assigned_work_member(new.assignee_membership_id,new.organization_id) and
    (new.priority,new.start_date,new.due_date,new.estimated_minutes,new.milestone_id,new.revision) is distinct from
    (old.priority,old.start_date,old.due_date,old.estimated_minutes,old.milestone_id,old.revision)
  then raise exception 'employee may not alter task planning fields' using errcode='42501'; end if;
  new.revision:=old.revision+1; return new;
end$$;
create trigger tasks_v2_field_boundary before update on public.tasks for each row execute function private.enforce_v2_task_fields();

create or replace function private.enforce_time_entry_mutation() returns trigger
language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare own_entry boolean;
begin
  own_entry:=private.is_assigned_work_member(coalesce(new.membership_id,old.membership_id),coalesce(new.organization_id,old.organization_id));
  if own_entry then
    if tg_op='UPDATE' and old.status not in ('draft','rejected') then
      raise exception 'submitted time requires administrator review or correction' using errcode='42501';
    end if;
    if new.status not in ('draft','submitted') or new.reviewed_by is not null or new.reviewed_at is not null then
      raise exception 'worker cannot review a time entry' using errcode='42501';
    end if;
  end if;
  if tg_op='UPDATE' then new.revision:=old.revision+1; end if;
  new.updated_at:=clock_timestamp(); return new;
end$$;
create trigger time_entries_mutation_boundary before insert or update on public.time_entries for each row execute function private.enforce_time_entry_mutation();

create or replace function public.review_time_entry(p_entry_id uuid,p_expected_revision bigint,p_decision public.time_entry_status)
returns public.time_entries language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare result public.time_entries; actor_role public.membership_role;
begin
  if p_decision not in ('approved','rejected') then raise exception 'invalid review decision' using errcode='22023'; end if;
  select m.role into actor_role from public.time_entries e join public.memberships m on m.organization_id=e.organization_id
    where e.id=p_entry_id and m.user_id=auth.uid() and m.role='org_admin' and m.status='active' and m.deleted_at is null;
  if actor_role is null then raise exception 'organization administrator required' using errcode='42501'; end if;
  update public.time_entries set status=p_decision,reviewed_by=auth.uid(),reviewed_at=clock_timestamp()
    where id=p_entry_id and revision=p_expected_revision returning * into result;
  if result.id is null then raise exception 'time entry conflict' using errcode='40001'; end if;
  insert into public.audit_events(actor_user_id,tenant_id,organization_id,actor_role,action,target_type,target_id,source)
    values(auth.uid(),result.tenant_id,result.organization_id,actor_role,'time_entry.'||p_decision::text,'time_entry',result.id,'database_trigger');
  return result;
end$$;
revoke all on function public.review_time_entry(uuid,bigint,public.time_entry_status) from public,anon;
grant execute on function public.review_time_entry(uuid,bigint,public.time_entry_status) to authenticated;

-- Browser clients may update only lifecycle/progress on assigned tasks. Planning changes remain admin-only.
revoke update(priority,start_date,due_date,estimated_minutes,milestone_id,revision) on public.tasks from authenticated;

create policy notifications_recipient_mark_read on public.notifications for update to authenticated
  using(private.is_assigned_work_member(recipient_membership_id,organization_id))
  with check(private.is_assigned_work_member(recipient_membership_id,organization_id));
grant update(read_at) on public.notifications to authenticated;
