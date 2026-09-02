import { beforeEach, describe, expect, it, vi } from 'vitest';

const query=vi.hoisted(()=>({select:vi.fn(),eq:vi.fn(),order:vi.fn(),insert:vi.fn(),single:vi.fn(),update:vi.fn(),maybeSingle:vi.fn()}));
vi.mock('../../lib/supabase',()=>({supabase:{from:vi.fn(()=>query)}}));
vi.mock('../../observability/telemetry',()=>({reportOperationalError:vi.fn()}));
import { supabaseWorkRepository } from './supabaseWorkRepository';

describe('Supabase Work repository',()=>{
  beforeEach(()=>{vi.clearAllMocks();for(const method of ['select','eq','order','insert','single','update','maybeSingle'] as const)query[method].mockReturnValue(query);});
  it('maps rows and always applies the validated tenant and organization scope',async()=>{
    query.order.mockResolvedValue({data:[{id:'p1',tenant_id:'t1',organization_id:'o1',name:'Launch',description:null,status:'active',created_at:'a',updated_at:'b'}],error:null});
    const result=await supabaseWorkRepository.listProjects({tenantId:'t1',organizationId:'o1',membershipId:'m1'});
    expect(query.eq).toHaveBeenCalledWith('organization_id','o1'); expect(query.eq).toHaveBeenCalledWith('tenant_id','t1');
    expect(result[0]).toEqual(expect.objectContaining({id:'p1',organizationId:'o1',name:'Launch'}));
  });
  it('requires the current updatedAt value and returns a structured conflict for a stale update',async()=>{
    query.maybeSingle.mockResolvedValue({data:null,error:null});
    await expect(supabaseWorkRepository.updateProject({id:'p1',tenantId:'t1',organizationId:'o1',name:'x',description:null,status:'active',createdAt:'a',updatedAt:'old'},{name:'new'})).rejects.toEqual(expect.objectContaining({code:'conflict',retryable:true}));
    expect(query.eq).toHaveBeenCalledWith('updated_at','old');
  });
  it('returns the durable row from create rather than a client-side optimistic record',async()=>{
    query.single.mockResolvedValue({data:{id:'server-id',tenant_id:'t1',organization_id:'o1',name:'Saved',description:null,status:'active',created_at:'a',updated_at:'b'},error:null});
    const result=await supabaseWorkRepository.createProject({tenantId:'t1',organizationId:'o1',membershipId:'m1'},'u1',{name:'Saved'});
    expect(result.id).toBe('server-id'); expect(query.insert).toHaveBeenCalledWith(expect.objectContaining({created_by:'u1'}));
  });
});
