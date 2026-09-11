import { supabase } from '../../lib/supabase';
import { supabaseWorkRepository } from '../work/supabaseWorkRepository';
import { supabasePass3Repository } from './supabasePass3Repository';
import { supabaseV2Repository } from './supabaseV2Repository';
import type { ClosureRepository, ProjectWorkspaceData } from './closureTypes';
type Row=Record<string,unknown>;
function value<T>(data:T|null,error:unknown):T { if(error) throw error; if(data===null) throw new Error('conflict_or_missing'); return data; }
export const supabaseClosureRepository:ClosureRepository={
  async loadProjectWorkspace(scope,projectId){
    const [projects,tasks,milestones,subtasks,assignments,dependencies,people,skills,capacity,conversations,files,sessions,timeEntries,notifications,ai,audit]=await Promise.all([
      supabaseWorkRepository.listProjects(scope),supabaseWorkRepository.listTasks(scope),supabaseV2Repository.listMilestones(scope),supabaseV2Repository.listSubtasks(scope),supabaseV2Repository.listAssignments(scope),supabaseV2Repository.listDependencies(scope),supabaseV2Repository.listPeople(scope),supabaseV2Repository.listSkills(scope),supabaseV2Repository.listCapacity(scope),supabasePass3Repository.listConversations(scope),supabasePass3Repository.listFiles(scope,{projectId}),supabaseV2Repository.listWorkSessions(scope),supabaseV2Repository.listTimeEntries(scope),supabaseV2Repository.listNotifications(scope),supabasePass3Repository.getAiState(scope),supabase.from('audit_events').select('id,action,occurred_at,target_type,target_id').eq('organization_id',scope.organizationId).order('occurred_at',{ascending:false}).limit(50)
    ]); if(audit.error) throw audit.error;
    const project=projects.find(item=>item.id===projectId); if(!project) throw new Error('project_not_authorized');
    const projectTasks=tasks.filter(item=>item.projectId===projectId); const taskIds=new Set(projectTasks.map(item=>item.id)); const projectSubtasks=subtasks.filter(item=>taskIds.has(item.taskId)); const subtaskIds=new Set(projectSubtasks.map(item=>item.id));
    return {project,tasks:projectTasks,milestones:milestones.filter(item=>item.projectId===projectId),subtasks:projectSubtasks,assignments:assignments.filter(item=>(item.taskId&&taskIds.has(item.taskId))||(item.subtaskId&&subtaskIds.has(item.subtaskId))),dependencies:dependencies.filter(item=>taskIds.has(item.predecessorTaskId)&&taskIds.has(item.successorTaskId)),people,skills,capacity,conversations:conversations.filter(item=>item.projectId===projectId),files,sessions:sessions.filter(item=>item.projectId===projectId),timeEntries:timeEntries.filter(item=>item.projectId===projectId),activity:((audit.data??[]) as Row[]).map(item=>({id:String(item.id),action:String(item.action),occurredAt:String(item.occurred_at),targetType:String(item.target_type),targetId:item.target_id as string|null})),notifications,ai} satisfies ProjectWorkspaceData;
  },
  async saveAssignment(scope,input){const{error}=await supabase.rpc('mutate_assignment',{p_id:input.id??null,p_organization_id:scope.organizationId,p_expected_revision:input.revision??0,p_task_id:input.taskId??null,p_subtask_id:input.subtaskId??null,p_membership_id:input.membershipId,p_allocated_minutes:input.allocatedMinutes??null,p_archive:input.archive??false});if(error)throw error;},
  async saveDependency(scope,input){const{error}=await supabase.rpc('mutate_dependency',{p_id:input.id??null,p_organization_id:scope.organizationId,p_expected_revision:input.revision??0,p_predecessor:input.predecessorTaskId,p_successor:input.successorTaskId,p_remove:input.remove??false});if(error)throw error;},
  async markAllNotificationsRead(scope){const{data,error}=await supabase.rpc('mark_all_notifications_read',{p_organization_id:scope.organizationId});return Number(value(data,error));},
  async dispatchOfflineMutation(id){const{data,error}=await supabase.rpc('dispatch_offline_mutation',{p_mutation_id:id});const row=value(data as Row|null,error);return{status:String(row.status),failureCode:row.failure_code as string|undefined};},
  async approveAutopilot(input){const{data,error}=await supabase.rpc('approve_autopilot_draft',{p_draft_id:input.draftId,p_expected_revision:input.expectedRevision,p_idempotency_key:input.idempotencyKey});const row=value(data as Row|null,error);return{projectId:String(row.project_id),auditEventId:String(row.audit_event_id)};}
};
