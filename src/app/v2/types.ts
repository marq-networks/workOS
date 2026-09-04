import type { OperationalError } from '../../observability/operationalError';

export interface OrganizationScope { tenantId: string; organizationId: string; membershipId: string }
export interface V2Record { id: string; organizationId: string; createdAt?: string; updatedAt?: string }
export interface Milestone extends V2Record { projectId: string; name: string; status: string; priority: string; dueDate: string|null; estimatedMinutes: number|null }
export interface Subtask extends V2Record { taskId: string; title: string; status: string; progress: number; estimatedMinutes: number|null; revision: number }
export interface Assignment extends V2Record { taskId: string|null; subtaskId: string|null; membershipId: string; status: string; allocatedMinutes: number|null }
export interface TaskDependency extends V2Record { predecessorTaskId: string; successorTaskId: string }
export interface Person extends V2Record { membershipId: string; userId: string; displayName: string; jobTitle: string|null; departmentId: string|null; role: string }
export interface Department extends V2Record { name: string }
export interface Skill extends V2Record { name: string; description: string|null }
export interface CapacityPlan extends V2Record { membershipId: string; startsOn: string; endsOn: string; availableMinutes: number }
export interface WorkSession extends V2Record { membershipId: string; projectId: string|null; taskId: string|null; startedAt: string; endedAt: string|null; notes: string|null; revision: number }
export interface TimeEntry extends V2Record { membershipId: string; projectId: string|null; taskId: string|null; startedAt: string; endedAt: string; status: string; notes: string|null; revision: number }
export interface Notification extends V2Record { kind: string; title: string; body: string|null; entityType: string|null; entityId: string|null; readAt: string|null }
export type V2Failure = OperationalError;

export interface V2Repository {
  listMilestones(scope: OrganizationScope): Promise<Milestone[]>;
  listSubtasks(scope: OrganizationScope): Promise<Subtask[]>;
  listAssignments(scope: OrganizationScope, mineOnly?: boolean): Promise<Assignment[]>;
  listDependencies(scope: OrganizationScope): Promise<TaskDependency[]>;
  listPeople(scope: OrganizationScope): Promise<Person[]>;
  listDepartments(scope: OrganizationScope): Promise<Department[]>;
  listSkills(scope: OrganizationScope): Promise<Skill[]>;
  listCapacity(scope: OrganizationScope): Promise<CapacityPlan[]>;
  listWorkSessions(scope: OrganizationScope, mineOnly?: boolean): Promise<WorkSession[]>;
  listTimeEntries(scope: OrganizationScope, mineOnly?: boolean): Promise<TimeEntry[]>;
  listNotifications(scope: OrganizationScope): Promise<Notification[]>;
  createMilestone(scope: OrganizationScope, actorId: string, input: {projectId:string;name:string;dueDate?:string;estimatedMinutes?:number}): Promise<Milestone>;
  createSubtask(scope: OrganizationScope, actorId: string, input: {taskId:string;title:string;estimatedMinutes?:number}): Promise<Subtask>;
  createDepartment(scope: OrganizationScope, name: string): Promise<Department>;
  createSkill(scope: OrganizationScope, input: {name:string;description?:string}): Promise<Skill>;
  createCapacity(scope: OrganizationScope, input: {membershipId:string;startsOn:string;endsOn:string;availableMinutes:number}): Promise<CapacityPlan>;
  startWorkSession(scope: OrganizationScope, input: {projectId?:string;taskId?:string;notes?:string}): Promise<WorkSession>;
  stopWorkSession(session: WorkSession): Promise<WorkSession>;
  createTimeEntry(scope: OrganizationScope, input: {projectId?:string;taskId?:string;startedAt:string;endedAt:string;notes?:string}): Promise<TimeEntry>;
  reviewTimeEntry(entry: TimeEntry, decision: 'approved'|'rejected'): Promise<TimeEntry>;
  markNotificationRead(notification: Notification): Promise<Notification>;
}
