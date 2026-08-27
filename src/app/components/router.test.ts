import { describe, expect, it, vi } from 'vitest';
import { getInitialRouterPath, subscribeToBrowserNavigation, updateBrowserPath } from './router';

function browserAt(pathname: string, hash = '') {
  return {
    location: { pathname, hash },
    history: { pushState: vi.fn(), replaceState: vi.fn() },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as Window;
}

describe('browser router synchronization', () => {
  it('initializes from a valid application deep-link', () => {
    const browser = browserAt('/people/members');
    expect(getInitialRouterPath(browser, '/work/my-work', (path) => path === '/people/members')).toBe('/people/members');
  });

  it('falls back from stale auth-only paths', () => {
    const browser = browserAt('/reset-password', '#recovery-material');
    expect(getInitialRouterPath(browser, '/org/admin/dashboard', () => false)).toBe('/org/admin/dashboard');
  });

  it('pushes internal navigation and replaces authorization redirects', () => {
    const browser = browserAt('/work/my-work');
    updateBrowserPath(browser, '/people/members');
    expect(browser.history.pushState).toHaveBeenCalledWith({}, '', '/people/members');

    updateBrowserPath(browser, '/org/admin/dashboard', { replace: true });
    expect(browser.history.replaceState).toHaveBeenCalledWith({}, '', '/org/admin/dashboard');
  });

  it('cleans a fragment even when the pathname is already canonical', () => {
    const browser = browserAt('/login', '#access_token=secret');
    updateBrowserPath(browser, '/login', { replace: true });
    expect(browser.history.replaceState).toHaveBeenCalledWith({}, '', '/login');
  });

  it('reads the browser pathname on popstate and removes its listener on cleanup', () => {
    const browser = browserAt('/people/members');
    const onPathChange = vi.fn();
    const cleanup = subscribeToBrowserNavigation(browser, onPathChange);
    const handler = vi.mocked(browser.addEventListener).mock.calls[0][1] as EventListener;

    handler(new Event('popstate'));
    expect(onPathChange).toHaveBeenCalledWith('/people/members');
    cleanup();
    expect(browser.removeEventListener).toHaveBeenCalledWith('popstate', handler);
  });
});
