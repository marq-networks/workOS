import { describe, expect, it } from 'vitest';

import { getRouteGuardRedirect } from '../components/RouteGuard';
import { getInitialRouterPath } from '../components/router';
import { getApplicationRoutes, isApplicationPath, isProductionApplicationPath } from './routeContainment';

const deferredPath = '/employee/dashboard';

describe('production route containment', () => {
  it('uses launch navigation as the production application allowlist', () => {
    expect(isProductionApplicationPath('/work/my-work')).toBe(true);
    expect(isProductionApplicationPath(deferredPath)).toBe(false);
  });

  it('retains registered prototype inventory only in development', () => {
    expect(isApplicationPath(deferredPath, true)).toBe(true);
    expect(isApplicationPath(deferredPath, false)).toBe(false);
    expect(getApplicationRoutes(true).some(({ path }) => path === deferredPath)).toBe(true);
    expect(getApplicationRoutes(false).some(({ path }) => path === deferredPath)).toBe(false);
  });

  it('canonicalizes a production deferred deep-link before its screen can render', () => {
    const browser = { location: { pathname: deferredPath } } as Window;
    expect(getInitialRouterPath(browser, '/work/my-work', (path) => isApplicationPath(path, false)))
      .toBe('/work/my-work');
  });

  it.each(['/diagnostics/ui-binding', '/analysis/module-progress'])('%s is never a universal production bypass', (path) => {
    expect(getRouteGuardRedirect('employee', path, false)).toBe('/work/my-work');
    expect(getRouteGuardRedirect('employee', path, true)).toBeNull();
  });

  it('preserves launch-role authorization and canonical redirects', () => {
    expect(getRouteGuardRedirect('employee', '/work/my-work', false)).toBeNull();
    expect(getRouteGuardRedirect('employee', '/people/members', false)).toBe('/work/my-work');
    expect(getRouteGuardRedirect('org_admin', '/people/members', false)).toBeNull();
    expect(getRouteGuardRedirect('platform_admin', '/super/console', false)).toBeNull();
    expect(getRouteGuardRedirect('employee', '/', false)).toBe('/work/my-work');
    expect(getRouteGuardRedirect('org_admin', '/', false)).toBe('/org/admin/dashboard');
    expect(getRouteGuardRedirect('platform_admin', '/', false)).toBe('/super/console');
  });
});
