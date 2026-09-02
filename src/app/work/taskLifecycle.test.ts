import { describe, expect, it } from 'vitest';
import { statusChangePatch } from './taskLifecycle';
import type { WorkTask, WorkTaskStatus } from './types';

const task = (status: WorkTaskStatus, progress: number): WorkTask => ({
  id:'task-1',projectId:'project-1',projectName:'Launch',title:'Ship',description:null,status,progress,
  assigneeMembershipId:'member-1',organizationId:'org-1',tenantId:'tenant-1',createdAt:'created',updatedAt:'version-1',
});

describe('task lifecycle status patches',()=>{
  it.each(['in_progress','blocked','todo'] as const)('sends status and zero progress together when reopening as %s',(status)=>{
    expect(statusChangePatch(task('completed',100),status)).toEqual({status,progress:0});
  });
  it.each([['todo','in_progress'],['in_progress','blocked']] as const)('preserves progress from %s to %s',(from,status)=>{
    expect(statusChangePatch(task(from,40),status)).toEqual({status,progress:40});
  });
  it('sends 100 with completed',()=>expect(statusChangePatch(task('in_progress',40),'completed')).toEqual({status:'completed',progress:100}));
});
