import { readFileSync } from 'node:fs';
import { describe,expect,it } from 'vitest';

const registry=readFileSync(new URL('../navigation/navRegistry.ts',import.meta.url),'utf8');
const repository=readFileSync(new URL('./supabaseV2Repository.ts',import.meta.url),'utf8');

describe('V2 production application wiring',()=>{
  it('routes canonical Work, People, and Time paths to production screens',()=>{
    const expected=[
      ["'/work/my-work'",'V2MyWorkScreen'],["'/work/milestones'",'V2MilestonesScreen'],
      ["'/work/assignments'",'V2AssignmentsScreen'],["'/work/reports'",'V2WorkReportsScreen'],
      ["'/people/employees'",'V2PeopleScreen'],["'/people/departments'",'V2DepartmentsScreen'],
      ["'/time/tracking'",'V2TimeEntriesScreen'],["'/time/sessions'",'V2SessionsScreen'],
    ];
    for(const [path,component] of expected)expect(registry).toContain(`path: ${path}, component: ${component}`);
  });

  it('keeps Supabase access in the adapter rather than UI screens',()=>{
    expect(repository).toContain("supabase.from('milestones')");
    expect(repository).toContain("supabase.rpc('review_time_entry'");
    const screen=readFileSync(new URL('./V2FunctionalScreens.tsx',import.meta.url),'utf8');
    expect(screen).not.toContain("from '../../lib/supabase'");
    expect(screen).not.toMatch(/MockService|mockData|localStorage/);
  });
  it('replaces canonical Pass 3 routes with repository-backed lazy screens',()=>{
    for(const [path,component] of [["'/communication/conversations'",'V2CommunicationScreen'],["'/search'",'V2SearchScreen'],["'/knowledge/files'",'V2FilesEvidenceScreen'],["'/automation/rules'",'V2AutomationScreen'],["'/ai/agents'",'V2AgentCenterScreen'],["'/ai/copilots'",'V2AiCopilotScreen']]){expect(registry).toContain(`path: ${path}`);expect(registry.slice(registry.indexOf(`path: ${path}`),registry.indexOf(`path: ${path}`)+150)).toContain(`component: ${component}`);}
    const screen=readFileSync(new URL('./Pass3Screens.tsx',import.meta.url),'utf8');expect(screen).not.toMatch(/ExecutionOSMockService|mockData|localStorage/);
  });
});
