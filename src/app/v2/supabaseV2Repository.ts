import { supabase } from '../../lib/supabase';
import { createOperationalError } from '../../observability/operationalError';
import { reportOperationalError } from '../../observability/telemetry';
import type { Assignment, CapacityPlan, Department, Milestone, Notification, OrganizationScope, Person, Skill, Subtask, TaskDependency, TimeEntry, V2Repository, WorkSession } from './types';

type Row=Record<string,unknown>;
function fail(operation:string,error:unknown):never{const event=createOperationalError(operation,'service',error,{code:'unknown',message:'The authoritative record could not be loaded or saved.',retryable:true});void reportOperationalError(event);throw event;}
function result<T>(operation:string,data:T|null,error:unknown):T{if(error)fail(operation,error);if(!data)fail(operation,new Error('No durable result returned'));return data;}
const base=(r:Row)=>({id:String(r.id),organizationId:String(r.organization_id),createdAt:r.created_at as string|undefined,updatedAt:r.updated_at as string|undefined});
const milestone=(r:Row):Milestone=>({...base(r),projectId:String(r.project_id),name:String(r.name),status:String(r.status),priority:String(r.priority),dueDate:r.due_date as string|null,estimatedMinutes:r.estimated_minutes as number|null});
const subtask=(r:Row):Subtask=>({...base(r),taskId:String(r.task_id),title:String(r.title),status:String(r.status),progress:Number(r.progress),estimatedMinutes:r.estimated_minutes as number|null,revision:Number(r.revision)});
const assignment=(r:Row):Assignment=>({...base(r),taskId:r.task_id as string|null,subtaskId:r.subtask_id as string|null,membershipId:String(r.membership_id),status:String(r.status),allocatedMinutes:r.allocated_minutes as number|null});
const session=(r:Row):WorkSession=>({...base(r),membershipId:String(r.membership_id),projectId:r.project_id as string|null,taskId:r.task_id as string|null,startedAt:String(r.started_at),endedAt:r.ended_at as string|null,notes:r.notes as string|null,revision:Number(r.revision)});
const timeEntry=(r:Row):TimeEntry=>({...base(r),membershipId:String(r.membership_id),projectId:r.project_id as string|null,taskId:r.task_id as string|null,startedAt:String(r.started_at),endedAt:String(r.ended_at),status:String(r.status),notes:r.notes as string|null,revision:Number(r.revision)});
async function list(table:string,columns:string,scope:OrganizationScope,operation:string):Promise<Row[]>{
  const query=supabase.from(table).select(columns).eq('organization_id',scope.organizationId).eq('tenant_id',scope.tenantId);
  const {data,error}=await query;if(error)fail(operation,error);return (data??[]) as unknown as Row[];
}

export const supabaseV2Repository:V2Repository={
  async listMilestones(s){return (await list('milestones','*',s,'v2.milestones.list')).map(milestone);},
  async listSubtasks(s){return (await list('subtasks','*',s,'v2.subtasks.list')).map(subtask);},
  async listAssignments(s,mine=false){let q=supabase.from('work_assignments').select('*').eq('organization_id',s.organizationId).eq('tenant_id',s.tenantId);if(mine)q=q.eq('membership_id',s.membershipId);const {data,error}=await q;if(error)fail('v2.assignments.list',error);return ((data??[]) as unknown as Row[]).map(assignment);},
  async listDependencies(s){return (await list('task_dependencies','*',s,'v2.dependencies.list')).map(r=>({...base(r),predecessorTaskId:String(r.predecessor_task_id),successorTaskId:String(r.successor_task_id)}));},
  async listPeople(s){
    const memberships=await list('memberships','id,user_id,role',s,'v2.people.memberships');
    const workers=await list('worker_profiles','id,user_id,job_title,department_id,created_at,updated_at',s,'v2.people.workers');
    const userIds=memberships.map(r=>String(r.user_id));
    const {data,error}=await supabase.from('user_profiles').select('user_id,display_name').in('user_id',userIds);
    if(error)fail('v2.people.profiles',error);const profiles=(data??[]) as unknown as Row[];
    return memberships.map((r):Person=>{const worker=workers.find(w=>w.user_id===r.user_id);const profile=profiles.find(p=>p.user_id===r.user_id);return {...base({id:worker?.id??r.id,organization_id:s.organizationId,created_at:worker?.created_at,updated_at:worker?.updated_at}),membershipId:String(r.id),userId:String(r.user_id),displayName:String(profile?.display_name??'Member'),jobTitle:(worker?.job_title as string|null)??null,departmentId:(worker?.department_id as string|null)??null,role:String(r.role)};});
  },
  async listDepartments(s){return (await list('departments','id,organization_id,name,created_at,updated_at',s,'v2.departments.list')).map(r=>({...base(r),name:String(r.name)}));},
  async listSkills(s){return (await list('skills','*',s,'v2.skills.list')).map(r=>({...base(r),name:String(r.name),description:r.description as string|null}));},
  async listCapacity(s){return (await list('capacity_plans','*',s,'v2.capacity.list')).map(r=>({...base(r),membershipId:String(r.membership_id),startsOn:String(r.starts_on),endsOn:String(r.ends_on),availableMinutes:Number(r.available_minutes)}));},
  async listWorkSessions(s,mine=false){let q=supabase.from('work_sessions').select('*').eq('organization_id',s.organizationId).eq('tenant_id',s.tenantId).order('started_at',{ascending:false});if(mine)q=q.eq('membership_id',s.membershipId);const {data,error}=await q;if(error)fail('v2.sessions.list',error);return ((data??[]) as unknown as Row[]).map(session);},
  async listTimeEntries(s,mine=false){let q=supabase.from('time_entries').select('*').eq('organization_id',s.organizationId).eq('tenant_id',s.tenantId).order('started_at',{ascending:false});if(mine)q=q.eq('membership_id',s.membershipId);const {data,error}=await q;if(error)fail('v2.time.list',error);return ((data??[]) as unknown as Row[]).map(timeEntry);},
  async listNotifications(s){return (await list('notifications','*',s,'v2.notifications.list')).map((r):Notification=>({...base(r),kind:String(r.kind),title:String(r.title),body:r.body as string|null,entityType:r.entity_type as string|null,entityId:r.entity_id as string|null,readAt:r.read_at as string|null}));},
  async createMilestone(s,a,i){const {data,error}=await supabase.from('milestones').insert({tenant_id:s.tenantId,organization_id:s.organizationId,project_id:i.projectId,name:i.name.trim(),due_date:i.dueDate||null,estimated_minutes:i.estimatedMinutes??null,created_by:a}).select().single();return milestone(result('v2.milestones.create',data as Row|null,error));},
  async createSubtask(s,a,i){const {data,error}=await supabase.from('subtasks').insert({tenant_id:s.tenantId,organization_id:s.organizationId,task_id:i.taskId,title:i.title.trim(),estimated_minutes:i.estimatedMinutes??null,created_by:a}).select().single();return subtask(result('v2.subtasks.create',data as Row|null,error));},
  async createDepartment(s,name){const {data,error}=await supabase.from('departments').insert({tenant_id:s.tenantId,organization_id:s.organizationId,name:name.trim()}).select().single();const r=result('v2.departments.create',data as Row|null,error);return {...base(r),name:String(r.name)};},
  async createSkill(s,i){const {data,error}=await supabase.from('skills').insert({tenant_id:s.tenantId,organization_id:s.organizationId,name:i.name.trim(),description:i.description?.trim()||null}).select().single();const r=result('v2.skills.create',data as Row|null,error);return {...base(r),name:String(r.name),description:r.description as string|null};},
  async createCapacity(s,i){const {data,error}=await supabase.from('capacity_plans').insert({tenant_id:s.tenantId,organization_id:s.organizationId,membership_id:i.membershipId,starts_on:i.startsOn,ends_on:i.endsOn,available_minutes:i.availableMinutes}).select().single();const r=result('v2.capacity.create',data as Row|null,error);return {...base(r),membershipId:String(r.membership_id),startsOn:String(r.starts_on),endsOn:String(r.ends_on),availableMinutes:Number(r.available_minutes)};},
  async startWorkSession(s,i){const {data,error}=await supabase.from('work_sessions').insert({tenant_id:s.tenantId,organization_id:s.organizationId,membership_id:s.membershipId,project_id:i.projectId||null,task_id:i.taskId||null,started_at:new Date().toISOString(),notes:i.notes?.trim()||null}).select().single();return session(result('v2.sessions.start',data as Row|null,error));},
  async stopWorkSession(current){const {data,error}=await supabase.from('work_sessions').update({ended_at:new Date().toISOString(),revision:current.revision+1}).eq('id',current.id).eq('organization_id',current.organizationId).eq('revision',current.revision).select().maybeSingle();return session(result('v2.sessions.stop',data as Row|null,error));},
  async createTimeEntry(s,i){const {data,error}=await supabase.from('time_entries').insert({tenant_id:s.tenantId,organization_id:s.organizationId,membership_id:s.membershipId,project_id:i.projectId||null,task_id:i.taskId||null,started_at:i.startedAt,ended_at:i.endedAt,notes:i.notes?.trim()||null}).select().single();return timeEntry(result('v2.time.create',data as Row|null,error));},
  async reviewTimeEntry(e,d){const {data,error}=await supabase.rpc('review_time_entry',{p_entry_id:e.id,p_expected_revision:e.revision,p_decision:d});return timeEntry(result('v2.time.review',data as Row|null,error));},
  async markNotificationRead(n){const {data,error}=await supabase.from('notifications').update({read_at:new Date().toISOString()}).eq('id',n.id).eq('organization_id',n.organizationId).is('read_at',null).select().maybeSingle();return {...n,...base(result('v2.notifications.read',data as Row|null,error)),readAt:String((data as Row).read_at)};},
};
