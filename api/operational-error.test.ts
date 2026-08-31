import { describe, expect, it, vi } from 'vitest';
import { createOperationalErrorHandler } from './operational-error';

const payload = { code: 'internal', retryable: false, correlationId: 'event-1', operation: 'test', release: 'client', timestamp: '2026-01-01T00:00:00Z', source: 'self_test' };
const env = { VITE_SUPABASE_URL: 'https://project.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'publishable', VERCEL_GIT_COMMIT_SHA: 'server-release', VERCEL_URL: 'deploy.example', VERCEL_ENV: 'production' };

function response() {
  const result = { status: 0, body: undefined as unknown };
  return { result, response: { status(code: number) { result.status = code; return { json(body: unknown) { result.body = body; } }; } } };
}

describe('operational error endpoint', () => {
  it('rejects a missing or invalid bearer token', async () => {
    const handler = createOperationalErrorHandler({ env, fetch: vi.fn().mockResolvedValue(new Response(null, { status: 401 })) });
    const missing = response();
    await handler({ method: 'POST', headers: { 'content-type': 'application/json' }, body: payload }, missing.response);
    expect(missing.result.status).toBe(401);
    const invalid = response();
    await handler({ method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer invalid' }, body: payload }, invalid.response);
    expect(invalid.result.status).toBe(401);
  });

  it('accepts a validated user and logs only the validated identity and server metadata', async () => {
    const log = vi.fn();
    const handler = createOperationalErrorHandler({ env, log, fetch: vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'validated-user' }), { status: 200 })) });
    const target = response();
    await handler({ method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer fake-token' }, body: payload }, target.response);
    expect(target.result.status).toBe(202);
    const record = JSON.parse(log.mock.calls[0][0]);
    expect(record).toMatchObject({ userId: 'validated-user', release: 'server-release', eventType: 'client_operational_error' });
    expect(log.mock.calls[0][0]).not.toContain('fake-token');
  });

  it('rejects unknown client fields and unsafe routes', async () => {
    const handler = createOperationalErrorHandler({ env, log: vi.fn(), fetch: vi.fn().mockImplementation(async () => new Response(JSON.stringify({ id: 'user' }), { status: 200 })) });
    for (const body of [{ ...payload, userId: 'forged' }, { ...payload, route: '/safe?secret=yes' }]) {
      const target = response();
      await handler({ method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer token' }, body }, target.response);
      expect(target.result.status).toBe(400);
    }
  });
});
