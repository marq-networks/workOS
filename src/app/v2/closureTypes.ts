import type { WorkProject, WorkTask } from '../work/types';
import type { AiState, Conversation, FileMetadata } from './pass3Types';
import type { Assignment, CapacityPlan, Milestone, Notification, OrganizationScope, Person, Skill, Subtask, TaskDependency, TimeEntry, WorkSession } from './types';

export interface WorkspaceActivity { id:string; action:string; occurredAt:string; targetType:string; targetId:string|null }
export interface ProjectWorkspaceData { project:WorkProject; tasks:WorkTask[]; milestones:Milestone[]; subtasks:Subtask[]; assignments:Assignment[]; dependencies:TaskDependency[]; people:Person[]; skills:Skill[]; capacity:CapacityPlan[]; conversations:Conversation[]; files:FileMetadata[]; sessions:WorkSession[]; timeEntries:TimeEntry[]; activity:WorkspaceActivity[]; notifications:Notification[]; ai:AiState }
export interface ClosureRepository {
  loadProjectWorkspace(scope:OrganizationScope, projectId:string):Promise<ProjectWorkspaceData>;
  saveAssignment(scope:OrganizationScope,input:{id?:string;revision?:number;taskId?:string;subtaskId?:string;membershipId:string;allocatedMinutes?:number;archive?:boolean}):Promise<void>;
  saveDependency(scope:OrganizationScope,input:{id?:string;revision?:number;predecessorTaskId:string;successorTaskId:string;remove?:boolean}):Promise<void>;
  markAllNotificationsRead(scope:OrganizationScope):Promise<number>;
  dispatchOfflineMutation(id:string):Promise<{status:string;failureCode?:string}>;
  approveAutopilot(input:{draftId:string;expectedRevision:number;idempotencyKey:string}):Promise<{projectId:string;auditEventId:string}>;
}
