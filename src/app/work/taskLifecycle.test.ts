import { describe, expect, it } from 'vitest';
import { progressChangePatch, statusChangePatch } from './taskLifecycle';
import type { WorkTask, WorkTaskStatus } from './types';

const task = (status: WorkTaskStatus, progress: number): WorkTask => ({
  id:'task-1',projectId:'project-1',projectName:'Launch',title:'Ship',description:null,status,progress,
  assigneeMembershipId:'member-1',organizationId:'org-1',tenantId:'tenant-1',createdAt:'created',updatedAt:'version-1',
});

describe('task lifecycle status patches',()=>{
  it.each([['in_progress',40],['blocked',40],['completed',100]] as const)('resets %s progress to zero when manually changed to todo',(from,progress)=>{
    expect(statusChangePatch(task(from,progress),'todo')).toEqual({status:'todo',progress:0});
  });
  it.each(['in_progress','blocked','todo'] as const)('sends status and zero progress together when reopening as %s',(status)=>{
    expect(statusChangePatch(task('completed',100),status)).toEqual({status,progress:0});
  });
  it.each([['todo','in_progress'],['in_progress','blocked'],['blocked','in_progress']] as const)('preserves progress from %s to %s',(from,status)=>{
    expect(statusChangePatch(task(from,40),status)).toEqual({status,progress:40});
  });
  it('sends 100 with completed',()=>expect(statusChangePatch(task('in_progress',40),'completed')).toEqual({status:'completed',progress:100}));
  it('starts a todo task atomically when positive progress is committed',()=>expect(progressChangePatch(task('todo',0),35)).toEqual({status:'in_progress',progress:35}));
  it('keeps a zero-progress todo as todo',()=>expect(progressChangePatch(task('todo',0),0)).toEqual({progress:0}));
  it('preserves in-progress status when progress changes',()=>expect(progressChangePatch(task('in_progress',40),60)).toEqual({progress:60}));
});
