import { afterEach, describe, expect, it, vi } from 'vitest';
import { createOperationalError } from './operationalError';
import { installGlobalErrorCapture, reportOperationalError } from './telemetry';

afterEach(() => vi.restoreAllMocks());

describe('operational telemetry', () => {
  it('creates a safe structured error without exposing the raw message', () => {
    const event = createOperationalError('members.load', 'service', new Error('secret backend detail'));
    expect(event).toMatchObject({ operation: 'members.load', source: 'service', code: 'unknown' });
    expect(JSON.stringify(event)).not.toContain('secret backend detail');
    expect(event.correlationId).toBeTruthy();
  });

  it('posts the safe event to the same-origin collector', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 202 }));
    const event = createOperationalError('test', 'self_test', new Error('test'));
    await reportOperationalError(event);
    expect(fetchMock).toHaveBeenCalledWith('/api/operational-error', expect.objectContaining({ method: 'POST' }));
  });

  it('captures global browser failures and can be removed', () => {
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const uninstall = installGlobalErrorCapture();
    expect(add).toHaveBeenCalledWith('error', expect.any(Function));
    uninstall();
    expect(remove).toHaveBeenCalledWith('error', expect.any(Function));
  });
});
