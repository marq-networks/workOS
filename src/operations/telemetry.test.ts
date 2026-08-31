import { describe, expect, it, vi } from 'vitest';
import { normalizeOperationalError } from './operationalError';
import { createTelemetryReporter } from './telemetry';

describe('operational telemetry client', () => {
  it('sends a bounded payload without URL secrets or access token', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    const reporter = createTelemetryReporter({ getAccessToken: async () => 'test-token', fetch: fetchMock, pathname: () => '/safe/path?secret=yes#hash', release: 'release-1' });
    const result = await reporter(normalizeOperationalError(new Error('internal SQL detail'), { code: 'service_failed', category: 'server' }), 'event-1');
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const payload = JSON.parse(String(init.body));
    expect(result).toEqual({ accepted: true, eventId: 'event-1' });
    expect(payload).toMatchObject({ eventId: 'event-1', code: 'service_failed', category: 'server', routePath: '/safe/path' });
    expect(JSON.stringify(payload)).not.toContain('test-token');
    expect(JSON.stringify(payload)).not.toContain('internal SQL detail');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer test-token');
  });

  it('contains network failures and skips unauthenticated reports', async () => {
    const failing = createTelemetryReporter({ getAccessToken: async () => 'token', fetch: vi.fn().mockRejectedValue(new Error('offline')), pathname: () => '/' });
    await expect(failing(normalizeOperationalError('failure'))).resolves.toMatchObject({ accepted: false });
    const fetchMock = vi.fn();
    const anonymous = createTelemetryReporter({ getAccessToken: async () => null, fetch: fetchMock, pathname: () => '/' });
    await expect(anonymous(normalizeOperationalError('failure'))).resolves.toMatchObject({ accepted: false });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

