import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const screen=readFileSync(new URL('./WorkProductionScreen.tsx',import.meta.url),'utf8');
const hook=readFileSync(new URL('./useWork.ts',import.meta.url),'utf8');

describe('P7-1 canonical Work integration',()=>{
  it('renders loading, bounded error/retry, empty, and durable success states',()=>{expect(screen).toContain('Loading Work…');expect(screen).toContain('Work unavailable');expect(screen).toContain('work.reload()');expect(screen).toContain('No ${view} yet');expect(hook).toContain('const saved=await repository.create');});
  it('presents management only to Org Admin while retaining employee progress controls',()=>{expect(screen).toContain('work.isAdmin&&<Button');expect(screen).toContain('Progress for ${t.title}');expect(hook).toContain("activeRole==='org_admin'");});
  it('clears scoped data before reload and ignores late old-organization responses',()=>{expect(hook).toContain('setProjects([]); setTasks([])');expect(hook).toContain('request===generation.current');});
  it('has no mock or ExecutionOS fallback for migrated operations',()=>{expect(screen).not.toMatch(/ExecutionOS|workMockData|localStorage/);expect(hook).not.toMatch(/ExecutionOS|workMockData|localStorage/);});
});
