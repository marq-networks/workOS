import { supabase } from '../../lib/supabase';
import { createOperationalError } from '../../observability/operationalError';
import { reportOperationalError } from '../../observability/telemetry';
import type { ProjectInput, TaskInput, WorkProject, WorkRepository, WorkScope, WorkTask } from './types';
import { progressForStatusChange } from './taskLifecycle';

type ProjectRow = { id:string; tenant_id:string; organization_id:string; name:string; description:string|null; status:WorkProject['status']; created_at:string; updated_at:string };
type TaskRow = { id:string; tenant_id:string; organization_id:string; project_id:string; title:string; description:string|null; status:WorkTask['status']; progress:number; assignee_membership_id:string; created_at:string; updated_at:string; projects:{name:string}|{name:string}[] };
const projectColumns = 'id,tenant_id,organization_id,name,description,status,created_at,updated_at';
const taskColumns = 'id,tenant_id,organization_id,project_id,title,description,status,progress,assignee_membership_id,created_at,updated_at,projects!inner(name)';
const project = (r: ProjectRow): WorkProject => ({ id:r.id, tenantId:r.tenant_id, organizationId:r.organization_id, name:r.name, description:r.description, status:r.status, createdAt:r.created_at, updatedAt:r.updated_at });
const task = (r: TaskRow): WorkTask => ({ id:r.id, tenantId:r.tenant_id, organizationId:r.organization_id, projectId:r.project_id, projectName:(Array.isArray(r.projects)?r.projects[0]:r.projects).name, title:r.title, description:r.description, status:r.status, progress:r.progress, assigneeMembershipId:r.assignee_membership_id, createdAt:r.created_at, updatedAt:r.updated_at });
function normalizedTaskProgress(current: WorkTask, patch: Parameters<WorkRepository['updateTask']>[1]): number | undefined {
  if (patch.status) return progressForStatusChange(current, patch.status);
  return patch.progress;
}

function failure(operation: string, error: unknown, conflict = false): never {
  const event=createOperationalError(operation,'service',error,conflict ? { code:'conflict', message:'This Work record changed. Reload and try again.', retryable:true } : { code:'unknown', message:'Work could not be loaded or saved.', retryable:true });
  void reportOperationalError(event); throw event;
}
function one<T>(operation:string, data:T|null, error:unknown): T { if (error) failure(operation,error); if (!data) failure(operation,new Error('missing durable result'),true); return data; }

export const supabaseWorkRepository: WorkRepository = {
  async listProjects(scope) { const {data,error}=await supabase.from('projects').select(projectColumns).eq('organization_id',scope.organizationId).eq('tenant_id',scope.tenantId).order('updated_at',{ascending:false}); if(error) failure('work.projects.list',error); return ((data??[]) as ProjectRow[]).map(project); },
  async listTasks(scope) { const {data,error}=await supabase.from('tasks').select(taskColumns).eq('organization_id',scope.organizationId).eq('tenant_id',scope.tenantId).order('updated_at',{ascending:false}); if(error) failure('work.tasks.list',error); return ((data??[]) as unknown as TaskRow[]).map(task); },
  async listAssignableMembers(scope) { const {data,error}=await supabase.from('memberships').select('id,user_id,role').eq('organization_id',scope.organizationId).eq('status','active').is('deleted_at',null).neq('role','platform_admin'); if(error) failure('work.assignees.list',error); return ((data??[]) as {id:string;user_id:string;role:string}[]).map(row=>({membershipId:row.id,label:`${row.role === 'org_admin' ? 'Org admin' : 'Employee'} · ${row.user_id.slice(0,8)}`})); },
  async createProject(scope,actor,input) { const {data,error}=await supabase.from('projects').insert({tenant_id:scope.tenantId,organization_id:scope.organizationId,name:input.name.trim(),description:input.description?.trim()||null,created_by:actor}).select(projectColumns).single(); return project(one('work.projects.create',data as ProjectRow|null,error)); },
  async createTask(scope,actor,input) { const {data,error}=await supabase.from('tasks').insert({tenant_id:scope.tenantId,organization_id:scope.organizationId,project_id:input.projectId,title:input.title.trim(),description:input.description?.trim()||null,assignee_membership_id:input.assigneeMembershipId,created_by:actor}).select(taskColumns).single(); return task(one('work.tasks.create',data as unknown as TaskRow|null,error)); },
  async updateProject(current,patch) { const values={...patch,description:patch.description?.trim(),name:patch.name?.trim(),archived_at:patch.status==='archived'?new Date().toISOString():undefined,updated_at:new Date().toISOString()}; const {data,error}=await supabase.from('projects').update(values).eq('id',current.id).eq('organization_id',current.organizationId).eq('updated_at',current.updatedAt).select(projectColumns).maybeSingle(); return project(one('work.projects.update',data as ProjectRow|null,error)); },
  async updateTask(current,patch) { const {assigneeMembershipId,...rest}=patch; const values={...rest,assignee_membership_id:assigneeMembershipId,description:patch.description?.trim(),title:patch.title?.trim(),progress:normalizedTaskProgress(current,patch),archived_at:patch.status==='archived'?new Date().toISOString():undefined,updated_at:new Date().toISOString()}; const {data,error}=await supabase.from('tasks').update(values).eq('id',current.id).eq('organization_id',current.organizationId).eq('updated_at',current.updatedAt).select(taskColumns).maybeSingle(); const saved=task(one('work.tasks.update',data as unknown as TaskRow|null,error)); if(patch.status)console.info('[work.task.status-transition]',{taskId:current.id,previousStatus:current.status,previousProgress:current.progress,requestedStatus:patch.status,normalizedProgress:values.progress,returnedStatus:saved.status,returnedProgress:saved.progress}); return saved; },
};
