begin;
create extension if not exists pgtap with schema extensions;
select plan(17);

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at) values
('01000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','p7employee@test.local','',now(),now(),now()),
('01000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','p7coworker@test.local','',now(),now(),now()),
('01000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','p7admin@test.local','',now(),now(),now()),
('01000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','p7platform@test.local','',now(),now(),now()),
('01000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000000','authenticated','authenticated','p7inactive@test.local','',now(),now(),now());
insert into public.tenants(id,name,slug) values ('11000000-0000-0000-0000-000000000001','P7 A','p7-a'),('11000000-0000-0000-0000-000000000002','P7 B','p7-b');
insert into public.organizations(id,tenant_id,name,slug) values ('21000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000001','P7 Org A','p7-a'),('21000000-0000-0000-0000-000000000002','11000000-0000-0000-0000-000000000002','P7 Org B','p7-b');
insert into public.memberships(id,user_id,tenant_id,organization_id,role,status) values
('31000000-0000-0000-0000-000000000001','01000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000001','21000000-0000-0000-0000-000000000001','employee','active'),
('31000000-0000-0000-0000-000000000002','01000000-0000-0000-0000-000000000002','11000000-0000-0000-0000-000000000001','21000000-0000-0000-0000-000000000001','employee','active'),
('31000000-0000-0000-0000-000000000003','01000000-0000-0000-0000-000000000003','11000000-0000-0000-0000-000000000001','21000000-0000-0000-0000-000000000001','org_admin','active'),
('31000000-0000-0000-0000-000000000004','01000000-0000-0000-0000-000000000004','11000000-0000-0000-0000-000000000001','21000000-0000-0000-0000-000000000001','platform_admin','active'),
('31000000-0000-0000-0000-000000000005','01000000-0000-0000-0000-000000000005','11000000-0000-0000-0000-000000000001','21000000-0000-0000-0000-000000000001','employee','inactive');
insert into public.projects(id,tenant_id,organization_id,name,created_by) values
('41000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000001','21000000-0000-0000-0000-000000000001','A project','01000000-0000-0000-0000-000000000003'),
('41000000-0000-0000-0000-000000000002','11000000-0000-0000-0000-000000000002','21000000-0000-0000-0000-000000000002','B project','01000000-0000-0000-0000-000000000003');
insert into public.tasks(id,tenant_id,organization_id,project_id,title,assignee_membership_id,created_by) values
('51000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000001','21000000-0000-0000-0000-000000000001','41000000-0000-0000-0000-000000000001','Mine','31000000-0000-0000-0000-000000000001','01000000-0000-0000-0000-000000000003'),
('51000000-0000-0000-0000-000000000002','11000000-0000-0000-0000-000000000001','21000000-0000-0000-0000-000000000001','41000000-0000-0000-0000-000000000001','Coworker','31000000-0000-0000-0000-000000000002','01000000-0000-0000-0000-000000000003');

set local role authenticated; select set_config('request.jwt.claim.sub','01000000-0000-0000-0000-000000000001',true);
select is((select count(*)::int from public.tasks),1,'employee reads assigned task');
select is((select count(*)::int from public.tasks where title='Coworker'),0,'employee cannot read coworker task');
select is((select count(*)::int from public.projects),1,'employee reads minimum parent project');
select is((select count(*)::int from public.projects where organization_id='21000000-0000-0000-0000-000000000002'),0,'employee cannot read unrelated organization');
select throws_ok($$insert into public.projects(tenant_id,organization_id,name,created_by) values('11000000-0000-0000-0000-000000000001','21000000-0000-0000-0000-000000000001','Denied',auth.uid())$$,'42501',null,'employee cannot create project');
select throws_ok($$insert into public.tasks(tenant_id,organization_id,project_id,title,assignee_membership_id,created_by) values('11000000-0000-0000-0000-000000000001','21000000-0000-0000-0000-000000000001','41000000-0000-0000-0000-000000000001','Denied','31000000-0000-0000-0000-000000000002',auth.uid())$$,'42501',null,'employee cannot create or assign task');
select lives_ok($$update public.tasks set status='in_progress',progress=25 where id='51000000-0000-0000-0000-000000000001'$$,'employee updates bounded progress');
select throws_ok($$update public.tasks set title='Escalated' where id='51000000-0000-0000-0000-000000000001'$$,'42501','employee may update only task status and progress','employee cannot alter privileged task fields');
select set_config('request.jwt.claim.sub','01000000-0000-0000-0000-000000000003',true);
select lives_ok($$insert into public.tasks(tenant_id,organization_id,project_id,title,assignee_membership_id,created_by) values('11000000-0000-0000-0000-000000000001','21000000-0000-0000-0000-000000000001','41000000-0000-0000-0000-000000000001','Admin task','31000000-0000-0000-0000-000000000001',auth.uid())$$,'org admin manages own organization');
select is((select count(*)::int from public.projects where organization_id='21000000-0000-0000-0000-000000000002'),0,'org admin cannot read another organization');
select throws_ok($$insert into public.tasks(tenant_id,organization_id,project_id,title,assignee_membership_id,created_by) values('11000000-0000-0000-0000-000000000001','21000000-0000-0000-0000-000000000001','41000000-0000-0000-0000-000000000002','Cross scope','31000000-0000-0000-0000-000000000001',auth.uid())$$,'23503',null,'FK prevents cross-organization project/task');
select throws_ok($$insert into public.projects(tenant_id,organization_id,name,status,created_by) values('11000000-0000-0000-0000-000000000001','21000000-0000-0000-0000-000000000001','Invalid','invented',auth.uid())$$,'22P02',null,'invalid lifecycle rejected');
select cmp_ok((select count(*) from public.audit_events where action='task.created'),'=',1::bigint,'admin mutation creates trusted audit');
select set_config('request.jwt.claim.sub','01000000-0000-0000-0000-000000000005',true);
select is((select count(*)::int from public.tasks),0,'inactive membership loses access');
select set_config('request.jwt.claim.sub','01000000-0000-0000-0000-000000000004',true);
select is((select count(*)::int from public.tasks),0,'platform admin has no implicit Work access');
select set_config('request.jwt.claim.sub','01000000-0000-0000-0000-000000000001',true);
select is((select count(*)::int from public.tasks where organization_id='21000000-0000-0000-0000-000000000002'),0,'fabricated organization filter grants nothing');
select is((with stale as (update public.tasks set progress=30 where id='51000000-0000-0000-0000-000000000001' and updated_at='2000-01-01' returning 1) select count(*)::int from stale),0,'stale timestamp update deterministically changes no row');
select * from finish(); rollback;
