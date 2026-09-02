import type { WorkTask, WorkTaskStatus } from './types';

const reopenedStatuses: ReadonlySet<WorkTaskStatus> = new Set(['todo', 'in_progress', 'blocked']);

export function progressForStatusChange(task: WorkTask, status: WorkTaskStatus): number {
  if (status === 'completed') return 100;
  if (task.status === 'completed' && reopenedStatuses.has(status)) return 0;
  return task.progress;
}

export function statusChangePatch(task: WorkTask, status: WorkTaskStatus): Pick<WorkTask, 'status' | 'progress'> {
  return { status, progress: progressForStatusChange(task, status) };
}
