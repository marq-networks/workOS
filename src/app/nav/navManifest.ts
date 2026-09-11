/**
 * Visible first-release navigation.
 *
 * The route registry intentionally retains prototype, deferred, and legacy
 * routes. This manifest is narrower: it exposes only the founder-approved
 * Phase 3 launch candidates while consolidation awaits approval.
 */
import {
  BarChart3,
  Briefcase,
  Building,
  CheckSquare,
  Clock,
  FileSpreadsheet,
  FileText,
  Home,
  Settings,
  Target,
  User,
  UserCheck,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type Role = 'employee' | 'org_admin' | 'platform_admin';

export type DomainKey =
  | 'work'
  | 'people'
  | 'time'
  | 'finance'
  | 'communication'
  | 'analytics'
  | 'security_compliance'
  | 'platform'
  | 'integrations';

export interface NavItem {
  key: string;
  label: string;
  icon?: LucideIcon;
  path?: string;
  badge?: number;
  children?: NavItem[];
  roles: Role[];
}

export const NAV_MANIFEST: NavItem[] = [
  {
    key: 'employee-work',
    label: 'WORK',
    roles: ['employee'],
    icon: Briefcase,
    children: [
      { key: 'employee-my-work', label: 'My Work', path: '/work/my-work', roles: ['employee'], icon: CheckSquare },
      { key: 'employee-projects', label: 'Projects', path: '/work/projects', roles: ['employee'], icon: Briefcase },
      { key: 'employee-tasks', label: 'Tasks', path: '/work/tasks', roles: ['employee'], icon: CheckSquare },
      { key: 'employee-milestones', label: 'Milestones', path: '/work/milestones', roles: ['employee'], icon: Target },
      { key: 'employee-assignments', label: 'Assignments', path: '/work/assignments', roles: ['employee'], icon: UserCheck },
      { key: 'employee-work-reports', label: 'Work Reports', path: '/work/reports', roles: ['employee'], icon: FileSpreadsheet },
    ],
  },
  {
    key: 'employee-time',
    label: 'TIME',
    roles: ['employee'],
    icon: Clock,
    children: [
      { key: 'employee-my-day', label: 'Work Session', path: '/employee/my-day', roles: ['employee'], icon: Clock },
      { key: 'employee-time-logs', label: 'Time Entries', path: '/employee/time-logs', roles: ['employee'], icon: Clock },
    ],
  },
  { key: 'employee-profile', label: 'My Profile', path: '/employee/profile', roles: ['employee'], icon: User },

  { key: 'platform-console', label: 'Support Console', path: '/super/console', roles: ['platform_admin'], icon: Home },
  { key: 'platform-organizations', label: 'Organizations', path: '/super/organizations', roles: ['platform_admin'], icon: Building },
  { key: 'platform-global-audit', label: 'Global Audit', path: '/super/audit-logs', roles: ['platform_admin'], icon: FileText },

  { key: 'org-dashboard', label: 'Dashboard', path: '/org/admin/dashboard', roles: ['org_admin'], icon: Home },
  {
    key: 'org-people',
    label: 'PEOPLE',
    roles: ['org_admin'],
    icon: Users,
    children: [
      { key: 'org-employees', label: 'People Directory', path: '/people/employees', roles: ['org_admin'], icon: Users },
      { key: 'org-members', label: 'Memberships & Invitations', path: '/people/members', roles: ['org_admin'], icon: UserCheck },
      { key: 'org-departments', label: 'Departments', path: '/people/departments', roles: ['org_admin'], icon: Building },
    ],
  },
  {
    key: 'org-work',
    label: 'WORK',
    roles: ['org_admin'],
    icon: Briefcase,
    children: [
      { key: 'org-projects', label: 'Projects', path: '/work/projects', roles: ['org_admin'], icon: Briefcase },
      { key: 'org-tasks', label: 'Tasks', path: '/work/tasks', roles: ['org_admin'], icon: CheckSquare },
      { key: 'org-milestones', label: 'Milestones', path: '/work/milestones', roles: ['org_admin'], icon: Target },
      { key: 'org-assignments', label: 'Assignments', path: '/work/assignments', roles: ['org_admin'], icon: UserCheck },
      { key: 'org-work-reports', label: 'Work Reports', path: '/work/reports', roles: ['org_admin'], icon: FileSpreadsheet },
    ],
  },
  {
    key: 'org-time',
    label: 'TIME',
    roles: ['org_admin'],
    icon: Clock,
    children: [
      { key: 'org-time-entries', label: 'Time Entries', path: '/time/tracking', roles: ['org_admin'], icon: Clock },
      { key: 'org-work-sessions', label: 'Work Sessions', path: '/time/sessions', roles: ['org_admin'], icon: Clock },
      { key: 'org-time-corrections', label: 'Review & Corrections', path: '/time/corrections', roles: ['org_admin'], icon: CheckSquare },
    ],
  },
  {
    key: 'org-reporting',
    label: 'REPORTING',
    roles: ['org_admin'],
    icon: BarChart3,
    children: [
      { key: 'org-essential-reports', label: 'Essential Reports', path: '/analytics/reports', roles: ['org_admin'], icon: FileSpreadsheet },
    ],
  },
  { key: 'org-audit', label: 'Audit Log', path: '/security/audit-logs', roles: ['org_admin'], icon: FileText },
  { key: 'org-settings', label: 'Organization Settings', path: '/platform/org-settings', roles: ['org_admin'], icon: Settings },
];

export function getAllPaths(): string[] {
  const paths: string[] = [];
  function extractPaths(items: NavItem[]) {
    for (const item of items) {
      if (item.path) paths.push(item.path);
      if (item.children) extractPaths(item.children);
    }
  }
  extractPaths(NAV_MANIFEST);
  return paths;
}

export function getPathsForRole(role: Role): string[] {
  const paths: string[] = [];
  function extractPaths(items: NavItem[]) {
    for (const item of items) {
      if (item.roles.includes(role)) {
        if (item.path) paths.push(item.path);
        if (item.children) extractPaths(item.children);
      }
    }
  }
  extractPaths(NAV_MANIFEST);
  return paths;
}

export function findNavItemByPath(path: string, role?: Role): NavItem | null {
  function search(items: NavItem[]): NavItem | null {
    for (const item of items) {
      if (item.path === path && (!role || item.roles.includes(role))) return item;
      if (item.children) {
        const found = search(item.children);
        if (found) return found;
      }
    }
    return null;
  }
  return search(NAV_MANIFEST);
}
