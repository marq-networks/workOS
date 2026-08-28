import { getAllPaths } from '../nav/navManifest';
import { ROUTE_REGISTRY, type RouteDefinition } from './navRegistry';

const launchPaths = new Set(getAllPaths());

/** The authenticated production shell is limited to root plus launch navigation. */
export function isProductionApplicationPath(path: string): boolean {
  return path === '/' || launchPaths.has(path);
}

/** Development retains the registry as review inventory; production does not. */
export function isApplicationPath(path: string, isDevelopment = import.meta.env.DEV): boolean {
  return isProductionApplicationPath(path)
    || (isDevelopment && ROUTE_REGISTRY.some((route) => route.path === path));
}

export function getApplicationRoutes(isDevelopment = import.meta.env.DEV): RouteDefinition[] {
  return isDevelopment
    ? ROUTE_REGISTRY
    : ROUTE_REGISTRY.filter((route) => launchPaths.has(route.path));
}
