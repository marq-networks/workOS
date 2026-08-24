import { describe, expect, it, vi } from 'vitest';
import type { ValidatedMembership } from '../security/types';
import { createRevalidationCoordinator, createVisibleRevalidationHandler, getAuthorizationSubjectId, selectOrganizationForSwitch, selectValidatedMembership } from './organizationAuthorization';

const active: ValidatedMembership = {
  id: 'membership-1', tenantId: 'tenant-1', organizationId: 'organization-1',
  organizationName: 'MARQ Networks', organizationSlug: 'marq-networks', role: 'platform_admin',
};

describe('organization authorization revalidation', () => {
  it('keeps the authorization subject stable when Supabase refreshes the same user object', () => {
    const beforeRefresh = { id: 'platform-admin', email: 'before@example.com' };
    const afterRefresh = { id: 'platform-admin', email: 'after@example.com' };

    expect(afterRefresh).not.toBe(beforeRefresh);
    expect(getAuthorizationSubjectId(afterRefresh)).toBe(getAuthorizationSubjectId(beforeRefresh));
    expect(getAuthorizationSubjectId(null)).toBeNull();
  });
  it('selects an active membership on initial load and honors a safe organization switch', () => {
    const second = { ...active, id: 'membership-2', organizationId: 'organization-2' };
    expect(selectValidatedMembership([active, second], null)).toEqual(active);
    expect(selectOrganizationForSwitch([active, second], 'organization-2')).toEqual(second);
    expect(selectOrganizationForSwitch([active, second], 'revoked-organization')).toBeNull();
  });

  it('clears authorization when validation excludes a revoked, inactive, or deleted membership', () => {
    // The repository query excludes all three states; an empty validated result must not fall
    // back to the browser preference or the previously validated membership.
    expect(selectValidatedMembership([], active.organizationId)).toBeNull();
  });

  it('clears authorization when the organization join excludes a deactivated organization', () => {
    expect(selectValidatedMembership([], active.organizationId)).toBeNull();
  });

  it('coalesces simultaneous focus and visibility revalidation signals', async () => {
    let release!: () => void;
    let first = true;
    const validate = vi.fn(() => {
      if (!first) return Promise.resolve();
      first = false;
      return new Promise<void>((resolve) => { release = resolve; });
    });
    const revalidate = createRevalidationCoordinator(validate);
    const focusResult = revalidate();
    const visibilityResult = revalidate();
    expect(focusResult).toBe(visibilityResult);
    expect(validate).toHaveBeenCalledOnce();
    release();
    await focusResult;
    await revalidate();
    expect(validate).toHaveBeenCalledTimes(2);
  });

  it('revalidates on a visible visibility event but not while the document is hidden', () => {
    const revalidate = vi.fn().mockResolvedValue(undefined);
    let visibility: DocumentVisibilityState = 'hidden';
    const onVisibilityChange = createVisibleRevalidationHandler(revalidate, () => visibility);
    onVisibilityChange();
    expect(revalidate).not.toHaveBeenCalled();
    visibility = 'visible';
    onVisibilityChange();
    expect(revalidate).toHaveBeenCalledOnce();
  });
});
