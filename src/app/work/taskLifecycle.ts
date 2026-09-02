import type { WorkTask, WorkTaskStatus } from './types';

const reopenedStatuses: ReadonlySet<WorkTaskStatus> = new Set(['todo', 'in_progress', 'blocked']);
type TaskPatch = Partial<Pick<WorkTask, 'title'|'description'|'status'|'progress'|'assigneeMembershipId'>>;

export function normalizedTaskPatch(task: WorkTask, patch: TaskPatch): TaskPatch {
  if (patch.status === 'completed') return { ...patch, progress: 100 };
  if (task.status === 'completed' && patch.status && reopenedStatuses.has(patch.status)) return { ...patch, progress: 0 };
  if (task.status === 'todo' && (patch.progress ?? 0) > 0 && (!patch.status || patch.status === 'todo')) return { ...patch, status: 'in_progress' };
  if (patch.status && patch.progress === undefined) return { ...patch, progress: task.progress };
  return patch;
}

export function statusChangePatch(task: WorkTask, status: WorkTaskStatus): Pick<WorkTask, 'status' | 'progress'> {
  return normalizedTaskPatch(task, { status }) as Pick<WorkTask, 'status' | 'progress'>;
}

export function progressChangePatch(task: WorkTask, progress: number): TaskPatch {
  return normalizedTaskPatch(task, { progress });
}
