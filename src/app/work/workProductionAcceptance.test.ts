import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const screen=readFileSync(new URL('./WorkProductionScreen.tsx',import.meta.url),'utf8');
const hook=readFileSync(new URL('./useWork.ts',import.meta.url),'utf8');

describe('P7-1 canonical Work integration',()=>{
  it('renders loading, bounded error/retry, empty, and durable success states',()=>{expect(screen).toContain('Loading Work…');expect(screen).toContain('Work unavailable');expect(screen).toContain('work.reload()');expect(screen).toContain('No ${view} yet');expect(hook).toContain('const saved=await repository.create');});
  it('presents management only to Org Admin while retaining employee progress controls',()=>{expect(screen).toContain('work.isAdmin&&<Button');expect(screen).toContain('Progress for ${task.title}');expect(hook).toContain("activeRole==='org_admin'");});
  it('contains an accessible range slider whose movement stays local until commit',()=>{expect(screen).toContain('type="range"');expect(screen).toContain('aria-label={`Progress for ${task.title}`}');expect(screen).toContain('onChange={e=>setDraft(Number(e.target.value))}');expect(screen).toContain('onPointerUp={()=>void commit()}');expect(screen).not.toContain('onChange={e=>void work.updateTask(t,{progress:');});
  it('disables progress while blocked or completed',()=>{expect(screen).toContain("task.status==='blocked'||task.status==='completed'");expect(screen).toContain('disabled={progressDisabled}');});
  it('retains the per-task mutex and disables controls during mutations',()=>{expect(screen).toContain('if(mutationInFlight.current');expect(screen).toContain('mutationInFlight.current=true');expect(screen).toContain('const disabled=saving');});
  it('clears scoped data before reload and ignores late old-organization responses',()=>{expect(hook).toContain('setProjects([]); setTasks([])');expect(hook).toContain('request===generation.current');});
  it('has no mock or ExecutionOS fallback for migrated operations',()=>{expect(screen).not.toMatch(/ExecutionOS|workMockData|localStorage/);expect(hook).not.toMatch(/ExecutionOS|workMockData|localStorage/);});
});
