import type { ValidatedMembership } from '../security/types';

/**
 * The authorization lifecycle is keyed to the authenticated identity, not to a
 * Supabase User object. Supabase may replace that object during a token refresh
 * even though the security principal has not changed.
 */
export function getAuthorizationSubjectId(user: { id: string } | null): string | null {
  return user?.id ?? null;
}

export function selectValidatedMembership(
  memberships: ValidatedMembership[],
  preferredOrganizationId: string | null,
): ValidatedMembership | null {
  return memberships.find((item) => item.organizationId === preferredOrganizationId)
    ?? memberships[0]
    ?? null;
}

export function selectOrganizationForSwitch(
  memberships: ValidatedMembership[],
  organizationId: string,
): ValidatedMembership | null {
  return memberships.find((item) => item.organizationId === organizationId) ?? null;
}

/** Coalesces focus/visibility/interval signals while one backend validation is active. */
export function createRevalidationCoordinator(validate: () => Promise<void>) {
  let active: Promise<void> | null = null;
  return () => {
    if (active) return active;
    active = validate().finally(() => { active = null; });
    return active;
  };
}

export function createVisibleRevalidationHandler(
  revalidate: () => Promise<void>,
  visibility: () => DocumentVisibilityState,
) {
  return () => { if (visibility() === 'visible') void revalidate(); };
}
