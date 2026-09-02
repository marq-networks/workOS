import type { WorkTask, WorkRepository } from './types';
import { progressChangePatch } from './taskLifecycle';

export function parseProgressDraft(draft: string): number | null {
  if (draft.trim() === '') return null;
  const progress = Number(draft);
  return Number.isInteger(progress) && progress >= 0 && progress <= 100 ? progress : null;
}

export async function commitTaskProgress(
  task: WorkTask,
  draft: string,
  updateTask: WorkRepository['updateTask'],
  reload: () => Promise<unknown>,
): Promise<WorkTask> {
  const progress = parseProgressDraft(draft);
  if (progress === null) throw new Error('Progress must be a whole number from 0 to 100.');
  if (progress === task.progress) return task;

  try {
    return await updateTask(task, progressChangePatch(task, progress));
  } catch (error) {
    await reload();
    throw error;
  }
}
