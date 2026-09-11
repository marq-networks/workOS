import { describe, expect, it } from 'vitest';
import { buildImpactGraph, effortWeightedProgress, projectWorkload, wouldCreateDependencyCycle } from './v2Planning';

describe('V2 planning projections', () => {
  it('rolls progress up using estimated effort and ignores archived work', () => {
    expect(effortWeightedProgress([
      { id: 'a', title: 'Large', status: 'in_progress', progress: 50, estimatedMinutes: 180 },
      { id: 'b', title: 'Small', status: 'completed', progress: 100, estimatedMinutes: 60 },
      { id: 'c', title: 'Old', status: 'archived', progress: 0, estimatedMinutes: 900 },
    ])).toBe(63);
  });

  it('rejects direct, indirect, and self dependency cycles', () => {
    const edges = [{ predecessorId: 'a', successorId: 'b' }, { predecessorId: 'b', successorId: 'c' }];
    expect(wouldCreateDependencyCycle(edges, { predecessorId: 'c', successorId: 'a' })).toBe(true);
    expect(wouldCreateDependencyCycle(edges, { predecessorId: 'c', successorId: 'd' })).toBe(false);
    expect(wouldCreateDependencyCycle(edges, { predecessorId: 'x', successorId: 'x' })).toBe(true);
  });

  it('explains blockers, downstream impact, waiting work, and due risk', () => {
    const graph = buildImpactGraph([
      { id: 'a', title: 'Foundation', status: 'blocked', progress: 20 },
      { id: 'b', title: 'Launch', status: 'todo', progress: 0, dueDate: '2026-01-01' },
    ], [{ predecessorId: 'a', successorId: 'b' }], new Date('2026-02-01'));
    expect(graph[0].downstream).toEqual(['b']);
    expect(graph[1]).toMatchObject({ blockedBy: ['a'], waiting: true, dueDateRisk: true });
  });

  it('projects effort against availability without producing an employee score', () => {
    expect(projectWorkload([
      { id: 'a', title: 'Task', status: 'todo', progress: 0, estimatedMinutes: 500, assigneeMembershipIds: ['m1'] },
    ], [{ membershipId: 'm1', availableMinutes: 400 }])).toEqual([
      { membershipId: 'm1', assignedMinutes: 500, availableMinutes: 400, remainingMinutes: -100, overloaded: true },
    ]);
  });
});
