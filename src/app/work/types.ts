import type { OperationalError } from '../../observability/operationalError';

export type WorkProjectStatus = 'active' | 'on_hold' | 'completed' | 'archived';
export type WorkTaskStatus = 'todo' | 'in_progress' | 'blocked' | 'completed' | 'archived';

export interface WorkProject {
  id: string; name: string; description: string | null; status: WorkProjectStatus;
  organizationId: string; tenantId: string; createdAt: string; updatedAt: string;
}
export interface WorkTask {
  id: string; projectId: string; projectName: string; title: string; description: string | null;
  status: WorkTaskStatus; progress: number; assigneeMembershipId: string;
  organizationId: string; tenantId: string; createdAt: string; updatedAt: string;
}
export interface WorkScope { organizationId: string; tenantId: string; membershipId: string; }
export interface WorkAssignee { membershipId: string; label: string; }
export interface ProjectInput { name: string; description?: string; }
export interface TaskInput { projectId: string; title: string; description?: string; assigneeMembershipId: string; }
export interface WorkRepository {
  listProjects(scope: WorkScope): Promise<WorkProject[]>;
  listTasks(scope: WorkScope): Promise<WorkTask[]>;
  listAssignableMembers(scope: WorkScope): Promise<WorkAssignee[]>;
  createProject(scope: WorkScope, actorUserId: string, input: ProjectInput): Promise<WorkProject>;
  createTask(scope: WorkScope, actorUserId: string, input: TaskInput): Promise<WorkTask>;
  updateProject(project: WorkProject, patch: Partial<Pick<WorkProject, 'name'|'description'|'status'>>): Promise<WorkProject>;
  updateTask(task: WorkTask, patch: Partial<Pick<WorkTask, 'title'|'description'|'status'|'progress'|'assigneeMembershipId'>>): Promise<WorkTask>;
}
export type WorkFailure = OperationalError;
