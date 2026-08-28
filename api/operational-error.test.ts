import { afterEach, describe, expect, it, vi } from 'vitest';
import { createHandler } from './operational-error';

const payload = { eventId: 'event-1', timestamp: '2026-08-28T00:00:00.000Z', code: 'monitoring_self_test', category: 'server', severity: 'warning', fingerprint: 'oe_12345678', routePath: '/super/console' };
const request = (overrides = {}) => ({ method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer fixture-token' }, body: payload, ...overrides });
function mockResponse() {
  const state = { status: 0, body: {} as Record<string, unknown> };
  const result = { status: (code: number) => { state.status = code; return result; }, json: (body: Record<string, unknown>) => { state.body = body; } };
  return { state, result };
}

describe('operational telemetry endpoint', () => {
  afterEach(() => vi.unstubAllEnvs());
  it('rejects GET and missing authentication', async () => {
    const handler = createHandler();
    let output = mockResponse(); await handler(request({ method: 'GET' }), output.result); expect(output.state.status).toBe(405);
    output = mockResponse(); await handler(request({ headers: { 'content-type': 'application/json' } }), output.result); expect(output.state.status).toBe(401);
  });

  it('rejects invalid and client-identity-bearing payloads', async () => {
    const handler = createHandler({ authenticate: async () => ({ id: 'validated-user' }) });
    const output = mockResponse();
    await handler(request({ body: { ...payload, userId: 'attacker-user' } }), output.result);
    expect(output.state.status).toBe(400);
  });

  it('logs validated identity and authoritative release metadata', async () => {
    vi.stubEnv('VERCEL_GIT_COMMIT_SHA', 'release-sha'); vi.stubEnv('VERCEL_ENV', 'production'); vi.stubEnv('VERCEL_URL', 'work.example');
    const log = vi.fn(); const handler = createHandler({ authenticate: async () => ({ id: 'validated-user' }), log });
    const output = mockResponse(); await handler(request(), output.result);
    expect(output.state).toMatchObject({ status: 202, body: { accepted: true, eventId: 'event-1' } });
    expect(log).toHaveBeenCalledWith(expect.objectContaining({ userId: 'validated-user', release: 'release-sha', environment: 'production' }));
    expect(JSON.stringify(log.mock.calls)).not.toContain('fixture-token');
  });
});
