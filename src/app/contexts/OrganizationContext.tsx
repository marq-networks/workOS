/* eslint-disable react-refresh/only-export-components */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { listCurrentMemberships } from '../security/membershipRepository';
import type { ValidatedMembership } from '../security/types';
import { OrganizationContext } from './organizationContextValue';
import { createRevalidationCoordinator, createVisibleRevalidationHandler, getAuthorizationSubjectId, selectOrganizationForSwitch, selectValidatedMembership } from './organizationAuthorization';

export { useOrganization } from './organizationContextValue';

const PREFERENCE_KEY = 'workos_active_organization_preference';

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = getAuthorizationSubjectId(user);
  const [loading, setLoading] = useState(false);
  const [revalidating, setRevalidating] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [memberships, setMemberships] = useState<ValidatedMembership[]>([]);
  const [activeMembership, setActiveMembership] = useState<ValidatedMembership | null>(null);
  const [validatedUserId, setValidatedUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(async (initial: boolean) => {
    if (!userId) {
      setMemberships([]);
      setActiveMembership(null);
      setValidatedUserId(null);
      setError(null);
      return;
    }
    if (initial) setLoading(true);
    else setRevalidating(true);
    try {
      const valid = await listCurrentMemberships(userId);
      const preference = localStorage.getItem(PREFERENCE_KEY);
      const selected = selectValidatedMembership(valid, preference);
      // Commit the newly validated authorization atomically. Until this point a previously
      // validated membership keeps the shell mounted; an empty result clears access immediately.
      setMemberships(valid);
      setActiveMembership(selected);
      setValidatedUserId(userId);
      if (selected) localStorage.setItem(PREFERENCE_KEY, selected.organizationId);
      else localStorage.removeItem(PREFERENCE_KEY);
      setError(null);
    } catch {
      if (initial) {
        setMemberships([]);
        setActiveMembership(null);
        setValidatedUserId(userId);
      }
      setError('Organization access could not be loaded.');
    } finally {
      if (initial) setLoading(false);
      else setRevalidating(false);
    }
  }, [userId]);

  const backgroundCoordinator = useRef<ReturnType<typeof createRevalidationCoordinator> | null>(null);
  const coordinatorValidationRef = useRef(validate);
  if (!backgroundCoordinator.current || coordinatorValidationRef.current !== validate) {
    coordinatorValidationRef.current = validate;
    backgroundCoordinator.current = createRevalidationCoordinator(() => validate(false));
  }
  const refresh = useCallback(() => backgroundCoordinator.current!(), []);

  useEffect(() => { void validate(true); }, [validate]);

  // Membership and organization state is authorization-sensitive. Revalidate after a tab
  // returns and on a bounded cadence so revocation/deactivation clears the protected shell
  // without relying on a browser-held role or requiring a new login.
  useEffect(() => {
    if (!userId) return;
    // Windows tab switches commonly emit visibilitychange and focus together. The coordinator
    // makes those signals share one request instead of starting a revalidation storm.
    const revalidate = createVisibleRevalidationHandler(refresh, () => document.visibilityState);
    window.addEventListener('focus', revalidate);
    document.addEventListener('visibilitychange', revalidate);
    const interval = window.setInterval(() => void refresh(), 60_000);
    return () => {
      window.removeEventListener('focus', revalidate);
      document.removeEventListener('visibilitychange', revalidate);
      window.clearInterval(interval);
    };
  }, [refresh, userId]);

  const switchOrganization = useCallback(async (organizationId: string) => {
    if (!userId) throw new Error('Organization access requires an authenticated user.');
    setSwitching(true);
    setActiveMembership(null);
    try {
      const valid = await listCurrentMemberships(userId);
      const selected = selectOrganizationForSwitch(valid, organizationId);
      if (!selected) throw new Error('Organization is not available to this account.');
      setMemberships(valid);
      setActiveMembership(selected);
      localStorage.setItem(PREFERENCE_KEY, selected.organizationId);
      window.dispatchEvent(new CustomEvent('workos-organization-changed', { detail: { organizationId } }));
    } finally {
      setSwitching(false);
    }
  }, [userId]);

  const initialAuthorizationLoading = Boolean(userId) && (loading || validatedUserId !== userId);
  const value = useMemo(() => ({ loading: initialAuthorizationLoading, revalidating, switching, memberships, activeMembership,
    activeRole: activeMembership?.role ?? null, error, switchOrganization, refresh }),
    [initialAuthorizationLoading, revalidating, switching, memberships, activeMembership, error, switchOrganization, refresh]);
  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}
