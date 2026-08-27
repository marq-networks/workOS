-- QA-3: trusted, non-destructive membership revocation with atomic audit evidence.
create or replace function public.trusted_deactivate_membership(
  p_actor_user_id uuid, p_tenant_id uuid, p_organization_id uuid, p_membership_id uuid, p_correlation_id uuid)
returns uuid language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  v_actor_role public.membership_role;
  v_target public.memberships%rowtype;
begin
  select * into v_target from public.memberships where id = p_membership_id for update;
  if not found or v_target.tenant_id <> p_tenant_id or v_target.organization_id <> p_organization_id
    or v_target.status <> 'active' or v_target.deleted_at is not null then
    raise exception 'membership target is not active in requested scope';
  end if;

  select m.role into v_actor_role from public.memberships m
  where m.user_id = p_actor_user_id and m.status = 'active' and m.deleted_at is null
    and (m.role = 'platform_admin' or (m.role = 'org_admin' and m.tenant_id = p_tenant_id
      and m.organization_id = p_organization_id and v_target.role = 'employee'))
  order by (m.role = 'platform_admin') desc limit 1;
  if v_actor_role is null then raise exception 'actor is not authorized'; end if;

  update public.memberships set status = 'inactive', updated_at = now() where id = v_target.id;
  insert into public.audit_events(actor_user_id, tenant_id, organization_id, actor_role, action,
    target_type, target_id, correlation_id, metadata)
  values (p_actor_user_id, p_tenant_id, p_organization_id, v_actor_role, 'membership.deactivated',
    'membership', v_target.id, p_correlation_id,
    jsonb_build_object('previous_status', v_target.status, 'new_status', 'inactive', 'role', v_target.role));
  return v_target.id;
end $$;
revoke all on function public.trusted_deactivate_membership(uuid,uuid,uuid,uuid,uuid) from public, anon, authenticated;
grant execute on function public.trusted_deactivate_membership(uuid,uuid,uuid,uuid,uuid) to service_role;
