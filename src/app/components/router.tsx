// Simple client-side router
import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

interface RouterContextType {
  currentPath: string;
  navigate: (path: string, options?: NavigateOptions) => void;
}

export interface NavigateOptions {
  replace?: boolean;
}

type BrowserNavigation = Pick<Window, 'location' | 'history' | 'addEventListener' | 'removeEventListener'>;

const RouterContext = createContext<RouterContextType | undefined>(undefined);

function browserPath(browser: BrowserNavigation) {
  return browser.location.pathname || '/';
}

export function updateBrowserPath(browser: BrowserNavigation, path: string, options: NavigateOptions = {}) {
  if (browserPath(browser) === path && !browser.location.hash) return;
  const method = options.replace ? 'replaceState' : 'pushState';
  browser.history[method]({}, '', path);
}

export function subscribeToBrowserNavigation(browser: BrowserNavigation, onPathChange: (path: string) => void) {
  const handlePopState = () => onPathChange(browserPath(browser));
  browser.addEventListener('popstate', handlePopState);
  return () => browser.removeEventListener('popstate', handlePopState);
}

export function getInitialRouterPath(browser: BrowserNavigation | undefined, fallbackPath: string, isValidPath: (path: string) => boolean) {
  if (!browser) return fallbackPath;
  const path = browserPath(browser);
  return isValidPath(path) ? path : fallbackPath;
}

export function Router({
  children,
  initialPath = '/employee/dashboard',
  isValidPath = () => true,
}: {
  children: ReactNode;
  initialPath?: string;
  isValidPath?: (path: string) => boolean;
}) {
  const browser = typeof window === 'undefined' ? undefined : window;
  const [currentPath, setCurrentPath] = useState(() => getInitialRouterPath(browser, initialPath, isValidPath));

  const navigate = useCallback((path: string, options: NavigateOptions = {}) => {
    if (browser) {
      updateBrowserPath(browser, path, options);
    }
    setCurrentPath(path);
  }, [browser]);

  useEffect(() => {
    if (!browser) return;

    // Auth-only, unknown, and stale callback paths are not application routes.
    // Replace rather than push so recovery/invitation material cannot be restored.
    if (!isValidPath(browserPath(browser)) || browser.location.hash) {
      browser.history.replaceState({}, '', currentPath);
    }

    return subscribeToBrowserNavigation(browser, setCurrentPath);
  }, [browser, currentPath, isValidPath]);

  const value = useMemo(() => ({ currentPath, navigate }), [currentPath, navigate]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) throw new Error('useRouter must be used within a Router');
  return context;
}

export function Route({ path, children }: { path: string; children: ReactNode }) {
  const { currentPath } = useRouter();
  return currentPath === path ? <>{children}</> : null;
}

export function NavLink({ to, children, className }: { to: string; children: ReactNode; className?: string }) {
  const { navigate } = useRouter();
  return <button onClick={() => navigate(to)} className={className}>{children}</button>;
}
