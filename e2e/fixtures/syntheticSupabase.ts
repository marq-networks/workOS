import { expect, type BrowserContext, type Page } from '@playwright/test';

export const SYNTHETIC_SUPABASE_ORIGIN = 'https://aaaaaaaaaaaaaaaaaaaa.supabase.co';
const STORAGE_KEY = 'sb-aaaaaaaaaaaaaaaaaaaa-auth-token';
const FORBIDDEN_HOSTS = new Set([
  'zabpmtkzqetroiwbbofh.supabase.co',
  'work-os-ashen-xi.vercel.app',
]);

export type SyntheticIdentity = 'signed_out' | 'employee' | 'org_admin' | 'platform_admin' | 'no_organization';

const identities = {
  employee: { id: '10000000-0000-4000-8000-000000000001', email: 'employee@example.invalid', role: 'employee' },
  org_admin: { id: '20000000-0000-4000-8000-000000000002', email: 'org-admin@example.invalid', role: 'org_admin' },
  platform_admin: { id: '30000000-0000-4000-8000-000000000003', email: 'platform-admin@example.invalid', role: 'platform_admin' },
  no_organization: { id: '40000000-0000-4000-8000-000000000004', email: 'no-organization@example.invalid', role: 'employee' },
} as const;

function encode(value: object) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function sessionFor(identity: Exclude<SyntheticIdentity, 'signed_out'>) {
  const fixture = identities[identity];
  const user = {
    id: fixture.id,
    aud: 'authenticated',
    role: 'authenticated',
    email: fixture.email,
    email_confirmed_at: '2026-01-01T00:00:00.000Z',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { full_name: `Synthetic ${fixture.role}` },
    identities: [],
    created_at: '2026-01-01T00:00:00.000Z',
  };
  const accessToken = `${encode({ alg: 'none', typ: 'JWT' })}.${encode({ aud: 'authenticated', exp: 4_102_444_800, sub: fixture.id })}.synthetic`;
  return { access_token: accessToken, refresh_token: 'synthetic-refresh-token', token_type: 'bearer', expires_in: 3600, expires_at: 4_102_444_800, user };
}

function membershipsFor(identity: Exclude<SyntheticIdentity, 'signed_out'>) {
  if (identity === 'no_organization') return [];
  const fixture = identities[identity];
  return [{
    id: '50000000-0000-4000-8000-000000000005',
    tenant_id: '60000000-0000-4000-8000-000000000006',
    organization_id: '70000000-0000-4000-8000-000000000007',
    role: fixture.role,
    status: 'active',
    deleted_at: null,
    organizations: { name: 'Synthetic Organization', slug: 'synthetic-organization' },
  }];
}

export async function installSyntheticSupabase(page: Page, identity: SyntheticIdentity) {
  const unexpectedRequests: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (FORBIDDEN_HOSTS.has(url.hostname)) {
      unexpectedRequests.push(request.url());
      throw new Error(`E2E safety violation: request to forbidden Production host ${url.hostname}`);
    }
  });

  await page.route(`${SYNTHETIC_SUPABASE_ORIGIN}/**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname === '/auth/v1/token') {
      await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ message: 'Synthetic provider detail must stay hidden.', code: 'invalid_credentials' }) });
      return;
    }
    if (url.pathname === '/auth/v1/logout') {
      await route.fulfill({ status: 204, body: '' });
      return;
    }
    if (url.pathname === '/rest/v1/memberships') {
      const isAuthorizationQuery = url.searchParams.get('select')?.includes('organizations!inner');
      const body = identity !== 'signed_out' && isAuthorizationQuery ? membershipsFor(identity) : [];
      await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'content-range': `0-${Math.max(body.length - 1, 0)}/${body.length}` }, body: JSON.stringify(body) });
      return;
    }
    await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ message: 'Unhandled synthetic Supabase request' }) });
  });

  if (identity !== 'signed_out') {
    const session = sessionFor(identity);
    await page.addInitScript(([key, value]) => localStorage.setItem(key, value), [STORAGE_KEY, JSON.stringify(session)] as const);
  }

  return async () => expect(unexpectedRequests, 'The local E2E browser contacted a forbidden Production host').toEqual([]);
}

export async function assertStorageSignedOut(context: BrowserContext) {
  for (const page of context.pages()) {
    await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBeNull();
  }
}
