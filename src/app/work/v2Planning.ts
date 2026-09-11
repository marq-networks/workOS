export type PlanningStatus = 'todo' | 'in_progress' | 'blocked' | 'completed' | 'archived';

export interface PlanningItem {
  id: string;
  title: string;
  status: PlanningStatus;
  progress: number;
  estimatedMinutes?: number | null;
  dueDate?: string | null;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  assigneeMembershipIds?: string[];
}

export interface Dependency { predecessorId: string; successorId: string }
export interface Capacity { membershipId: string; availableMinutes: number }

export interface ImpactNode {
  taskId: string;
  blockedBy: string[];
  downstream: string[];
  dueDateRisk: boolean;
  waiting: boolean;
}

/** Explicit effort drives rollups. An unestimated item has a neutral weight of one. */
export function effortWeightedProgress(items: PlanningItem[]): number {
  const active = items.filter((item) => item.status !== 'archived');
  if (!active.length) return 0;
  const totalWeight = active.reduce((sum, item) => sum + Math.max(item.estimatedMinutes ?? 1, 1), 0);
  const completed = active.reduce(
    (sum, item) => sum + Math.min(100, Math.max(0, item.progress)) * Math.max(item.estimatedMinutes ?? 1, 1),
    0,
  );
  return Math.round(completed / totalWeight);
}

export function wouldCreateDependencyCycle(existing: Dependency[], proposed: Dependency): boolean {
  if (proposed.predecessorId === proposed.successorId) return true;
  const successors = new Map<string, string[]>();
  for (const edge of [...existing, proposed]) {
    successors.set(edge.predecessorId, [...(successors.get(edge.predecessorId) ?? []), edge.successorId]);
  }
  const seen = new Set<string>();
  const visit = (id: string): boolean => {
    if (id === proposed.predecessorId && seen.size) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    return (successors.get(id) ?? []).some(visit);
  };
  return visit(proposed.successorId);
}

export function buildImpactGraph(items: PlanningItem[], dependencies: Dependency[], now = new Date()): ImpactNode[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  return items.map((item) => {
    const blockedBy = dependencies
      .filter((edge) => edge.successorId === item.id && byId.get(edge.predecessorId)?.status !== 'completed')
      .map((edge) => edge.predecessorId);
    const downstream = dependencies.filter((edge) => edge.predecessorId === item.id).map((edge) => edge.successorId);
    const dueDateRisk = item.status !== 'completed' && item.status !== 'archived' && Boolean(item.dueDate && new Date(item.dueDate) < now);
    return { taskId: item.id, blockedBy, downstream, dueDateRisk, waiting: blockedBy.length > 0 };
  });
}

export interface WorkloadProjection {
  membershipId: string;
  assignedMinutes: number;
  availableMinutes: number;
  remainingMinutes: number;
  overloaded: boolean;
}

/** Planning aid only: this describes allocated effort and never scores a person. */
export function projectWorkload(items: PlanningItem[], capacity: Capacity[]): WorkloadProjection[] {
  return capacity.map(({ membershipId, availableMinutes }) => {
    const assignedMinutes = items
      .filter((item) => item.status !== 'completed' && item.status !== 'archived' && item.assigneeMembershipIds?.includes(membershipId))
      .reduce((sum, item) => sum + Math.max(item.estimatedMinutes ?? 0, 0), 0);
    return { membershipId, assignedMinutes, availableMinutes, remainingMinutes: availableMinutes - assignedMinutes, overloaded: assignedMinutes > availableMinutes };
  });
}
