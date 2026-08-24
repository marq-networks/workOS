import type { LaunchRole } from './types';

export function getUserRoleLabel(role: LaunchRole | null): string {
  if (role === 'platform_admin') return 'Platform Administrator';
  if (role === 'org_admin') return 'Organization Admin';
  return 'Employee';
}
