import { describe, expect, it, vi } from 'vitest';
import { commitTaskProgress, parseProgressDraft } from './taskProgress';
import type { WorkTask } from './types';

const task: WorkTask={id:'task-1',projectId:'project-1',projectName:'Launch',title:'Ship',description:null,status:'in_progress',progress:0,assigneeMembershipId:'member-1',organizationId:'org-1',tenantId:'tenant-1',createdAt:'created',updatedAt:'version-1'};

describe('task progress commit',()=>{
  it('auto-starts todo progress with one authoritative update',async()=>{
    const todo={...task,status:'todo' as const}; const saved={...todo,status:'in_progress' as const,progress:35,updatedAt:'version-2'}; const update=vi.fn().mockResolvedValue(saved);
    await expect(commitTaskProgress(todo,'35',update,vi.fn())).resolves.toBe(saved);
    expect(update).toHaveBeenCalledTimes(1); expect(update).toHaveBeenCalledWith(todo,{status:'in_progress',progress:35});
  });
  it('keeps intermediate typing local and sends only the committed 40',async()=>{
    expect(parseProgressDraft('4')).toBe(4); expect(parseProgressDraft('40')).toBe(40);
    const saved={...task,progress:40,updatedAt:'version-2'}; const update=vi.fn().mockResolvedValue(saved); const reload=vi.fn();
    expect(update).not.toHaveBeenCalled();
    await expect(commitTaskProgress(task,'40',update,reload)).resolves.toBe(saved);
    expect(update).toHaveBeenCalledTimes(1); expect(update).toHaveBeenCalledWith(task,{progress:40}); expect(reload).not.toHaveBeenCalled();
  });
  it('returns the authoritative saved row rather than fabricating local success',async()=>{
    const authoritative={...task,progress:40,updatedAt:'server-version'}; const update=vi.fn().mockResolvedValue(authoritative);
    await expect(commitTaskProgress(task,'40',update,vi.fn())).resolves.toEqual(authoritative);
  });
  it('reloads and does not return a local success when optimistic concurrency rejects the write',async()=>{
    const conflict={code:'conflict'}; const update=vi.fn().mockRejectedValue(conflict); const reload=vi.fn().mockResolvedValue(undefined);
    await expect(commitTaskProgress(task,'40',update,reload)).rejects.toBe(conflict);
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
