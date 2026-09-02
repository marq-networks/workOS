import { beforeEach, describe, expect, it, vi } from 'vitest';

const query=vi.hoisted(()=>({select:vi.fn(),eq:vi.fn(),order:vi.fn(),insert:vi.fn(),single:vi.fn(),update:vi.fn(),maybeSingle:vi.fn()}));
vi.mock('../../lib/supabase',()=>({supabase:{from:vi.fn(()=>query)}}));
vi.mock('../../observability/telemetry',()=>({reportOperationalError:vi.fn()}));
import { supabaseWorkRepository } from './supabaseWorkRepository';
import type { WorkTask, WorkTaskStatus } from './types';

const currentTask = (status: WorkTaskStatus, progress: number, updatedAt = 'old'): WorkTask => ({
  id:'task-1',tenantId:'t1',organizationId:'o1',projectId:'p1',projectName:'Launch',title:'Ship',description:null,status,progress,assigneeMembershipId:'m1',createdAt:'a',updatedAt,
});
const taskRow = (status: WorkTaskStatus, progress: number, updatedAt = 'new') => ({
  id:'task-1',tenant_id:'t1',organization_id:'o1',project_id:'p1',projects:{name:'Launch'},title:'Ship',description:null,status,progress,assignee_membership_id:'m1',created_at:'a',updated_at:updatedAt,
});

describe('Supabase Work repository',()=>{
  beforeEach(()=>{vi.clearAllMocks();for(const method of ['select','eq','order','insert','single','update','maybeSingle'] as const)query[method].mockReturnValue(query);});
  it('maps rows and always applies the validated tenant and organization scope',async()=>{
    query.order.mockResolvedValue({data:[{id:'p1',tenant_id:'t1',organization_id:'o1',name:'Launch',description:null,status:'active',created_at:'a',updated_at:'b'}],error:null});
    const result=await supabaseWorkRepository.listProjects({tenantId:'t1',organizationId:'o1',membershipId:'m1'});
    expect(query.eq).toHaveBeenCalledWith('organization_id','o1'); expect(query.eq).toHaveBeenCalledWith('tenant_id','t1');
    expect(result[0]).toEqual(expect.objectContaining({id:'p1',organizationId:'o1',name:'Launch'}));
  });
  it('loads the authoritative persisted task progress after a refresh',async()=>{
    query.order.mockResolvedValue({data:[{id:'task-1',tenant_id:'t1',organization_id:'o1',project_id:'p1',projects:{name:'Launch'},title:'Ship',description:null,status:'in_progress',progress:40,assignee_membership_id:'m1',created_at:'a',updated_at:'server-version'}],error:null});
    const result=await supabaseWorkRepository.listTasks({tenantId:'t1',organizationId:'o1',membershipId:'m1'});
    expect(result[0]).toEqual(expect.objectContaining({progress:40,updatedAt:'server-version'}));
  });
  it('requires the current updatedAt value and returns a structured conflict for a stale update',async()=>{
    query.maybeSingle.mockResolvedValue({data:null,error:null});
    await expect(supabaseWorkRepository.updateProject({id:'p1',tenantId:'t1',organizationId:'o1',name:'x',description:null,status:'active',createdAt:'a',updatedAt:'old'},{name:'new'})).rejects.toEqual(expect.objectContaining({code:'conflict',retryable:true}));
    expect(query.eq).toHaveBeenCalledWith('updated_at','old');
  });
  it('enforces the current updatedAt value for task progress updates',async()=>{
    query.maybeSingle.mockResolvedValue({data:null,error:null});
    const current=currentTask('in_progress',0,'stale-version');
    await expect(supabaseWorkRepository.updateTask(current,{progress:40})).rejects.toEqual(expect.objectContaining({code:'conflict',retryable:true}));
    expect(query.eq).toHaveBeenCalledWith('updated_at','stale-version');
  });
  it('returns the durable row from create rather than a client-side optimistic record',async()=>{
    query.single.mockResolvedValue({data:{id:'server-id',tenant_id:'t1',organization_id:'o1',name:'Saved',description:null,status:'active',created_at:'a',updated_at:'b'},error:null});
    const result=await supabaseWorkRepository.createProject({tenantId:'t1',organizationId:'o1',membershipId:'m1'},'u1',{name:'Saved'});
    expect(result.id).toBe('server-id'); expect(query.insert).toHaveBeenCalledWith(expect.objectContaining({created_by:'u1'}));
  });
  it('normalizes completed tasks to 100 while retaining optimistic concurrency',async()=>{
    query.maybeSingle.mockResolvedValue({data:taskRow('completed',100),error:null});
    const current=currentTask('in_progress',40);
    const result=await supabaseWorkRepository.updateTask(current,{status:'completed',progress:40});
    expect(query.update).toHaveBeenCalledWith(expect.objectContaining({status:'completed',progress:100})); expect(query.eq).toHaveBeenCalledWith('updated_at','old'); expect(result.progress).toBe(100);
  });
  it.each(['in_progress','blocked','todo'] as const)('resets completed tasks to 0 when reopened as %s in one repository update',async(status)=>{
    query.maybeSingle.mockResolvedValue({data:taskRow(status,0),error:null});
    const result=await supabaseWorkRepository.updateTask(currentTask('completed',100),{status});
    expect(query.update).toHaveBeenCalledTimes(1);
    expect(query.update).toHaveBeenCalledWith(expect.objectContaining({status,progress:0}));
    expect(query.eq).toHaveBeenCalledWith('updated_at','old');
    expect(result).toEqual(expect.objectContaining({status,progress:0,updatedAt:'new'}));
  });
  it.each([['todo','in_progress'],['in_progress','blocked']] as const)('preserves progress for a normal %s to %s transition',async(from,status)=>{
    query.maybeSingle.mockResolvedValue({data:taskRow(status,40),error:null});
    const result=await supabaseWorkRepository.updateTask(currentTask(from,40),{status});
    expect(query.update).toHaveBeenCalledTimes(1);
    expect(query.update).toHaveBeenCalledWith(expect.objectContaining({status,progress:40}));
    expect(result.progress).toBe(40);
  });
  it('returns the normalized persisted value on refresh after reopening',async()=>{
    query.maybeSingle.mockResolvedValue({data:taskRow('in_progress',0,'normalized-version'),error:null});
    await supabaseWorkRepository.updateTask(currentTask('completed',100),{status:'in_progress'});
    query.order.mockResolvedValue({data:[taskRow('in_progress',0,'normalized-version')],error:null});
    const refreshed=await supabaseWorkRepository.listTasks({tenantId:'t1',organizationId:'o1',membershipId:'m1'});
    expect(query.update).toHaveBeenCalledTimes(1);
    expect(refreshed[0]).toEqual(expect.objectContaining({status:'in_progress',progress:0,updatedAt:'normalized-version'}));
  });
});
