-- V2 prerequisite for organization/tenant-scoped foreign keys.
-- P7-1 created a composite scoped key on projects but not tasks. V2 tables
-- reference tasks by (id, organization_id, tenant_id), so make that identity
-- unique before the V2 functional foundation migration runs.
alter table public.tasks
  add constraint tasks_id_organization_id_tenant_id_key
  unique (id, organization_id, tenant_id);
