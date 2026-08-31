import { afterEach, describe, expect, it, vi } from 'vitest';
import { createOperationalError } from './operationalError';
import { installGlobalErrorCapture, reportOperationalError } from './telemetry';

afterEach(() => vi.restoreAllMocks());

describe('operational telemetry', () => {
  it('creates a safe structured error without exposing the raw message', () => {
    const event = createOperationalError('members.load', 'service', new Error('secret backend detail'));
    expect(event).toMatchObject({ operation: 'members.load', source: 'service', code: 'unknown' });
    expect(JSON.stringify(event)).not.toContain('secret backend detail');
  });

  it('authenticates telemetry without putting the token or URL detail in its payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ correlationId: 'server-id' }), { status: 202 }));
    const event = createOperationalError('test', 'self_test', new Error('test'));
    const result = await reportOperationalError(event, {
      fetch: fetchMock, getAccessToken: async () => 'fake-access-token', routePath: () => '/safe?secret=yes#hash',
    });
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.headers).toMatchObject({ authorization: 'Bearer fake-access-token' });
    expect(init.body).not.toContain('fake-access-token');
    expect(JSON.parse(String(init.body)).route).toBe('/safe');
    expect(result).toEqual({ accepted: true, correlationId: 'server-id' });
  });

  it('skips without a session and contains fetch failures', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('offline'));
    const event = createOperationalError('test', 'self_test', new Error('test'));
    await expect(reportOperationalError(event, { fetch: fetchMock, getAccessToken: async () => undefined })).resolves.toMatchObject({ accepted: false });
    expect(fetchMock).not.toHaveBeenCalled();
    await expect(reportOperationalError(event, { fetch: fetchMock, getAccessToken: async () => 'token' })).resolves.toMatchObject({ accepted: false });
  });

  it('installs both browser listeners, does not cancel events, and removes both', () => {
    const target = new EventTarget();
    const add = vi.spyOn(target, 'addEventListener');
    const remove = vi.spyOn(target, 'removeEventListener');
    const reporter = vi.fn();
    const uninstall = installGlobalErrorCapture(target, reporter);
    expect(add).toHaveBeenCalledWith('error', expect.any(Function));
    expect(add).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    const errorEvent = new Event('error', { cancelable: true });
    target.dispatchEvent(errorEvent);
    target.dispatchEvent(new Event('unhandledrejection', { cancelable: true }));
    expect(errorEvent.defaultPrevented).toBe(false);
    expect(reporter).toHaveBeenCalledTimes(2);
    uninstall();
    expect(remove).toHaveBeenCalledWith('error', expect.any(Function));
    expect(remove).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
  });
});
