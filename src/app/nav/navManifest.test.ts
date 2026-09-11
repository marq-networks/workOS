import { describe, expect, it } from 'vitest';

import {
  findNavItemByPath,
  getAllPaths,
  getPathsForRole,
  type Role,
} from './navManifest';
import { getRouteByPath } from '../navigation/navRegistry';

const roles: Role[] = ['employee', 'org_admin', 'platform_admin'];

describe('navigation manifest invariants', () => {
  it('contains only absolute paths that resolve to manifest items', () => {
    const paths = getAllPaths();

    expect(paths.length).toBeGreaterThan(0);
    for (const path of paths) {
      expect(path).toMatch(/^\//);
      expect(findNavItemByPath(path)).not.toBeNull();
    }
  });

  it.each(roles)('returns only paths assigned to %s', (role) => {
    for (const path of getPathsForRole(role)) {
      expect(findNavItemByPath(path, role)?.roles).toContain(role);
    }
  });

  it.each(roles)('keeps every visible %s path registered for that role', (role) => {
    for (const path of getPathsForRole(role)) {
      expect(getRouteByPath(path)?.roles).toContain(role);
    }
  });

  it('does not expose deferred or diagnostic modules in launch navigation', () => {
    const paths = getAllPaths();
    const excludedPrefixes = [
      '/communication',
      '/diagnostics',
      '/finance',
      '/integrations',
      '/org/finance',
    ];

    for (const prefix of excludedPrefixes) {
      expect(paths.some((path) => path.startsWith(prefix))).toBe(false);
    }

    expect(paths).not.toContain('/platform/billing');
    expect(paths).not.toContain('/time/fines');
    expect(paths).not.toContain('/time/input-counters');
    expect(paths).not.toContain('/time/screenshot-review');
  });
});
